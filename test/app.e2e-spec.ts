import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SeederService } from '../src/seeder/seeder.service';
import { Prisma } from '@prisma/client';
import * as request from 'supertest';

const BASE_URL = 'http://localhost:3333/';

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
  let validJWT: string;
  let trackingId: number;

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
  });

  afterAll(() => {
    app.close();
  });

  describe('Initial Databse Seeding', () => {
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
  describe('Auth Controller', () => {
    describe('signin', () => {
      it('should not signin an unknown email address', async () => {
        const response = await request(BASE_URL)
          .post('auth/signin')
          .send({ email: 'yolo@yolo.com' })
          .set('Accept', 'application/json');

        expect(response.status).toBe(403);
      });

      it('should signin a known email address', async () => {
        const response = await request(BASE_URL)
          .post('auth/signin')
          .send({ email: 'julian@parcellab.com' })
          .set('Accept', 'application/json');

        expect(response.body).toHaveProperty('access_token');

        validJWT = response.body.access_token;

        expect(response.statusCode).toBe(200);
      });
    });
  });
  describe('Tracking Controller', () => {
    describe('Get /tracking', () => {
      it('should return 401 if no JWT is present', async () => {
        const response = await request(BASE_URL).get('tracking').set({
          Accept: 'application/json',
        });

        expect(response.statusCode).toBe(401);
      });

      it('should return the tracking information of a user with a valid JWT', async () => {
        const response = await request(BASE_URL)
          .get('tracking')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validJWT}`,
          });

        expect(response.status).toBe(200);
        expect(response.body.trackings.length).toBeGreaterThanOrEqual(1);
        trackingId = response.body.trackings[0].id;
      });
    });
    describe('Get /tracking/:id', () => {
      it('should return 401 if no JWT is present', async () => {
        const response = await request(BASE_URL).get('tracking').set({
          Accept: 'application/json',
        });

        expect(response.statusCode).toBe(401);
      });

      it('should return the tracking information with most recent checkpoint', async () => {
        const response = await request(BASE_URL)
          .get(`tracking/${trackingId}`)
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validJWT}`,
          });

        expect(response.status).toBe(200);
        console.log(response.body);
        expect(response.body.status).toBeDefined();
      });
    });
  });
});
