import { Injectable } from '@nestjs/common';
import { Prisma, Order } from '@prisma/client';
import { omit, pick } from 'lodash';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingFromCsv, loadSeedData } from '../scripts/parseSeedData';

const orderKeyMap: Partial<Record<keyof TrackingFromCsv, keyof Order>> = {
  orderNo: 'order_number',
};

@Injectable()
export class SeederService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const { checkpoints, trackings: orders } = await loadSeedData();

    // In the future, we should dynamically create users based on emails in the parsed data
    // for now, we just add julian in
    const julian = await this.prisma.user.create({
      data: {
        email: 'julian@parcellab.com',
      },
    });

    await this.prisma.order.createMany({
      data: this.normalizeOrders(orders).map((entry) => ({
        ...entry,
        customerId: julian.id,
      })),
    });

    await this.prisma.checkpoint.createMany({
      data: checkpoints,
    });
  }

  private normalizeOrders(orders): Prisma.OrderCreateManyInput[] {
    return orders.map((order) => {
      const incorrectKeysValueData: object = pick(
        order,
        Object.keys(orderKeyMap),
      );
      const orderWithoutIncorrectKeys = omit(order, Object.keys(orderKeyMap));

      const correctedKeysData = Object.entries(incorrectKeysValueData).reduce(
        (prev, [key, value]) => ({
          ...prev,
          [orderKeyMap[key]]: value,
        }),
        {},
      );

      return {
        ...orderWithoutIncorrectKeys,
        ...correctedKeysData,
        quantity: Number(order.quantity),
      };
    });
  }
}
