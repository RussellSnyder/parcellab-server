import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getOrdersForUser(userId: number) {
    const userWithOrders = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        orders: {
          include: {
            orderItems: {
              include: {
                article: true,
              },
            },
          },
        },
      },
    });

    return userWithOrders;
  }

  async getOrderWithCheckpoints(orderNumber: string) {
    // get the tracking info
    const order = await this.prisma.order.findUnique({
      where: { order_number: orderNumber },
      include: {
        orderItems: {
          include: {
            article: true,
          },
        },
      },
    });

    const checkpoints = await this.prisma.checkpoint.findMany({
      where: {
        tracking_number: order.tracking_number,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return { order: { ...order, checkpoints } };
  }
}
