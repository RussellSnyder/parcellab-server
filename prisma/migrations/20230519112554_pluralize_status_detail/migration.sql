/*
  Warnings:

  - You are about to drop the column `status_detail` on the `Checkpoint` table. All the data in the column will be lost.
  - Added the required column `status_details` to the `Checkpoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Checkpoint" DROP COLUMN "status_detail",
ADD COLUMN     "status_details" TEXT NOT NULL;
