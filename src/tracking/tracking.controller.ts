import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { TrackingService } from './tracking.service';

@UseGuards(AuthGuard)
@Controller('tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

  @Get()
  getTrackingsForUser(@GetUser('sub') userId) {
    return this.trackingService.getTrackingsForUser(userId);
  }

  @Get('/:id')
  getMostRecentCheckpointForTrackingsId(
    @Param('id', ParseIntPipe) trackingId: number,
  ) {
    return this.trackingService.getMostRecentCheckpointForTrackingId(
      trackingId,
    );
  }
}
