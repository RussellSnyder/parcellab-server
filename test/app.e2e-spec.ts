import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SeederService } from '../src/seeder/seeder.service';
import { Prisma } from '@prisma/client';

const checkpointsWithTrackings = Prisma.validator<Prisma.CheckpointArgs>()({
  include: { tracking: true },
});

type CheckpointWithTrackings = Prisma.CheckpointGetPayload<
  typeof checkpointsWithTrackings
>;

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seederService: SeederService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );

    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    seederService = app.get(SeederService);

    await prisma.cleanDb();
    // pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Seeding', () => {
    describe('seederService', () => {
      const userWithTrackings = Prisma.validator<Prisma.UserArgs>()({
        include: { trackings: true },
      });
      let user: Prisma.UserGetPayload<typeof userWithTrackings>;

      let checkpoints: CheckpointWithTrackings[];

      beforeAll(async () => {
        await seederService.seed();
      });

      it('should add at least one user to the database', async () => {
        user = await prisma.user.findFirst({
          include: {
            trackings: true,
          },
        });

        expect(user).toBeDefined();
      });

      it('should add trackings to the database', async () => {
        const trackings = await prisma.tracking.findMany();

        expect(trackings.length).toBeGreaterThanOrEqual(3);
      });

      it('should add checkpoints to the database', async () => {
        checkpoints = await prisma.checkpoint.findMany({
          include: {
            tracking: true,
          },
        });

        expect(checkpoints.length).toBeGreaterThanOrEqual(3);
      });

      it('should associate a user with thier respective trackings', async () => {
        expect(user.trackings.length).toBeGreaterThanOrEqual(3);
      });
    });
  });
});
