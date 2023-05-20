import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { Request } from 'express';

export interface IGetUserAuthInfoRequest extends Request {
  user: {
    sub: number;
    email: string;
    iat: number;
    exp: number;
  };
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request: IGetUserAuthInfoRequest = ctx.switchToHttp().getRequest();

    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
