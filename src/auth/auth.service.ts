import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signin(dto: SignInDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if suer doesn't exist throw exception
    if (!user) {
      throw new ForbiddenException('Credentials Incorrect');
    }

    // we should compare passwords here, but this is not a requirement for now
    // const doesPasswordMatch = await argon.verify(user.hash, dto.password);
    // if password incorrect throw exception
    // if (!doesPasswordMatch) {
    //   throw new ForbiddenException('Credentials Incorrect');
    // }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{
    access_token: string;
  }> {
    const data = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(data, {
      expiresIn: '15m',
      secret,
    });

    return {
      access_token: token,
    };
  }
}
