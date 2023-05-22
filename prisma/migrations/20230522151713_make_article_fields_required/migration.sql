/*
  Warnings:

  - Made the column `article_number` on table `Article` required. This step will fail if there are existing NULL values in that column.
  - Made the column `articleImageUrl` on table `Article` required. This step will fail if there are existing NULL values in that column.
  - Made the column `product_name` on table `Article` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Article" ALTER COLUMN "article_number" SET NOT NULL,
ALTER COLUMN "articleImageUrl" SET NOT NULL,
ALTER COLUMN "product_name" SET NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "quantity" SET NOT NULL;
