/*
  Warnings:

  - You are about to drop the column `trackingNumber` on the `Order` table. All the data in the column will be lost.
  - Added the required column `order_number` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tracking_number` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "trackingNumber",
ADD COLUMN     "order_number" TEXT NOT NULL,
ADD COLUMN     "tracking_number" TEXT NOT NULL,
ALTER COLUMN "articleNo" SET DATA TYPE TEXT;
