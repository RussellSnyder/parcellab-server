/*
  Warnings:

  - You are about to drop the column `trackingId` on the `Checkpoint` table. All the data in the column will be lost.
  - You are about to drop the `CheckpointsOnTrackings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tracking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Checkpoint" DROP CONSTRAINT "Checkpoint_trackingId_fkey";

-- DropForeignKey
ALTER TABLE "CheckpointsOnTrackings" DROP CONSTRAINT "CheckpointsOnTrackings_checkpointId_fkey";

-- DropForeignKey
ALTER TABLE "CheckpointsOnTrackings" DROP CONSTRAINT "CheckpointsOnTrackings_trackingId_fkey";

-- DropForeignKey
ALTER TABLE "Tracking" DROP CONSTRAINT "Tracking_customerId_fkey";

-- AlterTable
ALTER TABLE "Checkpoint" DROP COLUMN "trackingId",
ADD COLUMN     "orderId" INTEGER;

-- DropTable
DROP TABLE "CheckpointsOnTrackings";

-- DropTable
DROP TABLE "Tracking";

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
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

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckpointsOnOrders" (
    "orderId" INTEGER NOT NULL,
    "checkpointId" INTEGER NOT NULL,

    CONSTRAINT "CheckpointsOnOrders_pkey" PRIMARY KEY ("orderId","checkpointId")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointsOnOrders" ADD CONSTRAINT "CheckpointsOnOrders_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointsOnOrders" ADD CONSTRAINT "CheckpointsOnOrders_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
