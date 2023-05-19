/*
  Warnings:

  - The primary key for the `Tracking` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Checkpoint" DROP CONSTRAINT "Checkpoint_tracking_number_fkey";

-- DropIndex
DROP INDEX "Tracking_tracking_number_key";

-- AlterTable
ALTER TABLE "Checkpoint" ADD COLUMN     "trackingId" INTEGER;

-- AlterTable
ALTER TABLE "Tracking" DROP CONSTRAINT "Tracking_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Tracking_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "CheckpointsOnTrackings" (
    "trackingId" INTEGER NOT NULL,
    "checkpointId" INTEGER NOT NULL,

    CONSTRAINT "CheckpointsOnTrackings_pkey" PRIMARY KEY ("trackingId","checkpointId")
);

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "Tracking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointsOnTrackings" ADD CONSTRAINT "CheckpointsOnTrackings_trackingId_fkey" FOREIGN KEY ("trackingId") REFERENCES "Tracking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointsOnTrackings" ADD CONSTRAINT "CheckpointsOnTrackings_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "Checkpoint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
