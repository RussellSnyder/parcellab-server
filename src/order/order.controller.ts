import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { OrderService } from './order.service';

@UseGuards(AuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Get()
  getOrdersForUser(@GetUser('sub') userId) {
    return this.orderService.getOrdersForUser(userId);
  }

  @Get(':id')
  getOrderWithCheckpoints(@Param('id') orderNumber: string) {
    return this.orderService.getOrderWithCheckpoints(orderNumber);
  }
}
