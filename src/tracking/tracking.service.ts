import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TrackingService {
  constructor(private prisma: PrismaService) {}

  async getTrackingsForUser(userId: number) {
    const userWithTrackings = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        trackings: true,
      },
    });

    return { trackings: userWithTrackings.trackings };
  }

  async getMostRecentCheckpointForTrackingId(trackingId: number) {
    // get the tracking info
    const tracking = await this.prisma.tracking.findUnique({
      where: { id: trackingId },
    });

    const mostRecentCheckpoint = await this.prisma.checkpoint.findMany({
      where: {
        tracking_number: tracking.tracking_number,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 1,
    });

    return { tracking, ...mostRecentCheckpoint[0] };
  }
}
