/*
  Warnings:

  - You are about to drop the `CheckPoint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CheckPoint" DROP CONSTRAINT "CheckPoint_tracking_number_fkey";

-- DropTable
DROP TABLE "CheckPoint";

-- CreateTable
CREATE TABLE "Checkpoint" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL,
    "status_text" TEXT NOT NULL,
    "status_detail" TEXT NOT NULL,
    "tracking_number" TEXT NOT NULL,

    CONSTRAINT "Checkpoint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Checkpoint" ADD CONSTRAINT "Checkpoint_tracking_number_fkey" FOREIGN KEY ("tracking_number") REFERENCES "Tracking"("tracking_number") ON DELETE RESTRICT ON UPDATE CASCADE;
