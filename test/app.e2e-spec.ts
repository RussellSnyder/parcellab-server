import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { SeederService } from '../src/seeder/seeder.service';
import { Prisma } from '@prisma/client';
import * as request from 'supertest';

const BASE_URL = 'http://localhost:3333/';

const checkpointsWithOrders = Prisma.validator<Prisma.CheckpointArgs>()({
  include: { order: true },
});

type CheckpointWithTrackings = Prisma.CheckpointGetPayload<
  typeof checkpointsWithOrders
>;

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seederService: SeederService;
  let validJWT: string;
  let orderNumber: number;

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
      const userWithOrders = Prisma.validator<Prisma.UserArgs>()({
        include: { orders: true },
      });
      let user: Prisma.UserGetPayload<typeof userWithOrders>;

      let checkpoints: CheckpointWithTrackings[];

      beforeAll(async () => {
        await seederService.seed();
      });

      it('should add at least one user to the database', async () => {
        user = await prisma.user.findFirst({
          include: {
            orders: true,
          },
        });

        expect(user).toBeDefined();
      });

      it('should add orders to the database', async () => {
        const orders = await prisma.order.findMany();

        expect(orders.length).toBeGreaterThanOrEqual(3);
      });

      it('should add checkpoints to the database', async () => {
        checkpoints = await prisma.checkpoint.findMany({
          include: {
            order: true,
          },
        });

        expect(checkpoints.length).toBeGreaterThanOrEqual(3);
      });

      it('should associate a user with thier respective orders', async () => {
        expect(user.orders.length).toBeGreaterThanOrEqual(3);
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
  describe('Order Controller', () => {
    describe('Get /orders', () => {
      describe('fail', () => {
        it('should return 401 if no JWT is present', async () => {
          const response = await request(BASE_URL).get('orders').set({
            Accept: 'application/json',
          });

          expect(response.statusCode).toBe(401);
        });
      });

      describe('sucess', () => {
        let response: request.Response;
        beforeAll(async () => {
          response = await request(BASE_URL)
            .get('orders')
            .set({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${validJWT}`,
            });
        });
        it('should return 200 if using a valid JWT', () => {
          expect(response.status).toBe(200);
        });
        it('should return multiple orders', () => {
          expect(response.body.length).toBeGreaterThanOrEqual(1);
        });
        it('should return orders with an order_number property', () => {
          expect(response.body[0].order_number).toBeDefined();
          orderNumber = response.body[0].order_number;
        });
        it('should return orders with articles attached', () => {
          expect(response.body[0].articles).toBeDefined();
        });
      });
    });
    describe('Get /orders/:id', () => {
      it('should return 401 if no JWT is present', async () => {
        const response = await request(BASE_URL).get('orders').set({
          Accept: 'application/json',
        });

        expect(response.statusCode).toBe(401);
      });

      it('should return the order information with checkpoints', async () => {
        const response = await request(BASE_URL)
          .get(`orders/${orderNumber}`)
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${validJWT}`,
          });

        expect(response.status).toBe(200);
        expect(response.body.checkpoints.length).toBeGreaterThan(1);
      });
    });
  });
});
