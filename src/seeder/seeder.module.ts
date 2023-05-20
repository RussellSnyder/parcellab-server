import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [SeederService],
})
export class SeederModule {}
