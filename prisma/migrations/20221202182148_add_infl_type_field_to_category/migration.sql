/*
  Warnings:

  - You are about to drop the column `color` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "color",
ADD COLUMN     "freqType" TEXT NOT NULL DEFAULT 'perCat',
ALTER COLUMN "currency" SET DEFAULT 'USD',
ALTER COLUMN "type" SET DEFAULT 'outcome',
ALTER COLUMN "inflType" SET DEFAULT 'perCat',
ALTER COLUMN "frequencey" SET DEFAULT 12;
