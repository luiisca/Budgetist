-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "taxPercent" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Salary" ADD COLUMN     "taxType" TEXT NOT NULL DEFAULT 'perCat';
