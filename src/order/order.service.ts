import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async getOrdersForUser(userId: number) {
    const userWithOrders = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        orders: true,
      },
    });

    return { orders: userWithOrders.orders };
  }

  async getMostRecentCheckpointForOrderId(orderId: number) {
    // get the tracking info
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    const checkpoints = await this.prisma.checkpoint.findMany({
      where: {
        tracking_number: order.tracking_number,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return { order, checkpoints };
  }
}
