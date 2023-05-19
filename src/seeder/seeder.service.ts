import { Injectable } from '@nestjs/common';
import { parseSeedData } from 'scripts/parseSeedData';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { pick, omit } from 'lodash';

const trackingKeyMap = {
  orderNo: 'order_number',
};

const checkpointKeyMap = {
  orderNo: 'order_number',
  articleNo: 'article_number',
};

@Injectable()
export class SeederService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    const { checkpoints, trackings } = await parseSeedData();

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

  normalizeTrackings(orders): Prisma.TrackingCreateManyInput[] {
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

  normalizeCheckpoints(checkpoints): Prisma.CheckpointCreateManyInput[] {
    return checkpoints.map((checkpoint) => {
      const incorrectKeysValueData: object = pick(
        checkpoint,
        Object.keys(trackingKeyMap),
      );
      const orderWithoutIncorrectKeys = omit(
        checkpoint,
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
        quantity: Number(checkpoint.quantity),
      };
    });
  }
}