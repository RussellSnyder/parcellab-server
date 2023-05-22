/*
  Warnings:

  - You are about to drop the column `articleImageUrl` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `articleNo` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `product_name` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `CheckpointsOnOrders` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_number]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CheckpointsOnOrders" DROP CONSTRAINT "CheckpointsOnOrders_checkpointId_fkey";

-- DropForeignKey
ALTER TABLE "CheckpointsOnOrders" DROP CONSTRAINT "CheckpointsOnOrders_orderId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "articleImageUrl",
DROP COLUMN "articleNo",
DROP COLUMN "product_name",
DROP COLUMN "quantity";

-- DropTable
DROP TABLE "CheckpointsOnOrders";

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "article_number" TEXT,
    "articleImageUrl" TEXT,
    "product_name" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER,
    "order_number" TEXT NOT NULL,
    "article_number" TEXT NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_article_number_key" ON "Article"("article_number");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_number_key" ON "Order"("order_number");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_number_fkey" FOREIGN KEY ("order_number") REFERENCES "Order"("order_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_article_number_fkey" FOREIGN KEY ("article_number") REFERENCES "Article"("article_number") ON DELETE RESTRICT ON UPDATE CASCADE;
