import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'hello@prisma.com',
      orders: {
        create: {
          trackingNumber: 123,
          courier: 'test',
          street: 'test',
          zip_code: 'test',
          city: 'test',
          destination_country_iso3: 'test', // 3 letter country code
          email: 'test',
          articleNo: 1234,
          articleImageUrl: 'test',
          quantity: 2,
          product_name: 'test',
        },
      },
    },
  });

  const allUsers = await prisma.user.findMany({
    include: {
      orders: true,
    },
  });
  console.dir(allUsers, { depth: null });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
