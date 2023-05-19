/*
  Warnings:

  - You are about to drop the column `orderId` on the `CheckPoint` table. All the data in the column will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tracking_number` to the `CheckPoint` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CheckPoint" DROP CONSTRAINT "CheckPoint_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- AlterTable
ALTER TABLE "CheckPoint" DROP COLUMN "orderId",
ADD COLUMN     "tracking_number" TEXT NOT NULL;

-- DropTable
DROP TABLE "Order";

-- CreateTable
CREATE TABLE "Tracking" (
    "tracking_number" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "courier" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "destination_country_iso3" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "articleNo" TEXT,
    "articleImageUrl" TEXT,
    "quantity" INTEGER,
    "product_name" TEXT,
    "customerId" INTEGER NOT NULL,

    CONSTRAINT "Tracking_pkey" PRIMARY KEY ("tracking_number")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tracking_tracking_number_key" ON "Tracking"("tracking_number");

-- AddForeignKey
ALTER TABLE "Tracking" ADD CONSTRAINT "Tracking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckPoint" ADD CONSTRAINT "CheckPoint_tracking_number_fkey" FOREIGN KEY ("tracking_number") REFERENCES "Tracking"("tracking_number") ON DELETE RESTRICT ON UPDATE CASCADE;
