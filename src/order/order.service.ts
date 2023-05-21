import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order } from '@prisma/client';
import { omit } from 'lodash';
import { OrderArticle, OrderWithArticles } from './types';

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

    return this.attachArticlesOnOrders(userWithOrders.orders);
  }

  async getOrderWithCheckpoints(orderNumber: string) {
    // get the tracking info
    const orders = await this.prisma.order.findMany({
      where: { order_number: orderNumber },
    });

    const orderWithArticles = this.attachArticlesOnOrders(orders)[0];

    const checkpoints = await this.prisma.checkpoint.findMany({
      where: {
        tracking_number: orderWithArticles.tracking_number,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return { order: orderWithArticles, checkpoints };
  }

  // if two orders have the same order_number, there are multiple articles for that order
  attachArticlesOnOrders(orders: Order[]): OrderWithArticles[] {
    const ordersWithArticles = orders.reduce((prev, curr) => {
      let orderWithArticles: OrderWithArticles;
      const currentOrderArticle: OrderArticle = {
        articleNumber: curr.articleNo,
        articleImageUrl: curr.articleImageUrl,
        quantity: curr.quantity,
        product_name: curr.product_name,
      };

      if (prev[curr.order_number]) {
        orderWithArticles = {
          ...prev[curr.order_number],
          articles: [...prev[curr.order_number].articles, currentOrderArticle],
        };
      } else {
        orderWithArticles = {
          ...omit(curr, ['articleNo', 'articleImageUrl']),
          articles: [currentOrderArticle],
        };
      }

      return {
        ...prev,
        [curr.order_number]: orderWithArticles,
      };
    }, {});

    return Object.values(ordersWithArticles);
  }
}
