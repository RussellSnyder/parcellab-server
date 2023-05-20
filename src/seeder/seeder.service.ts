import { Injectable } from '@nestjs/common';
import { Prisma, Tracking } from '@prisma/client';
import { omit, pick } from 'lodash';
import { PrismaService } from '../prisma/prisma.service';
import { TrackingFromCsv, loadSeedData } from '../scripts/parseSeedData';

const trackingKeyMap: Partial<Record<keyof TrackingFromCsv, keyof Tracking>> = {
  orderNo: 'order_number',
};

@Injectable()
export class SeederService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const { checkpoints, trackings } = await loadSeedData();

    // In the future, we should dynamically create users based on emails in the parsed data
    // for now, we just add julian in
    const julian = await this.prisma.user.create({
      data: {
        email: 'julian@parcellab.com',
      },
    });

    await this.prisma.tracking.createMany({
      data: this.normalizeTrackings(trackings).map((entry) => ({
        ...entry,
        customerId: julian.id,
      })),
    });

    await this.prisma.checkpoint.createMany({
      data: checkpoints,
    });
  }

  private normalizeTrackings(orders): Prisma.TrackingCreateManyInput[] {
    return orders.map((order) => {
      const incorrectKeysValueData: object = pick(
        order,
        Object.keys(trackingKeyMap),
      );
      const orderWithoutIncorrectKeys = omit(
        order,
        Object.keys(trackingKeyMap),
      );

      const correctedKeysData = Object.entries(incorrectKeysValueData).reduce(
        (prev, [key, value]) => ({
          ...prev,
          [trackingKeyMap[key]]: value,
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
