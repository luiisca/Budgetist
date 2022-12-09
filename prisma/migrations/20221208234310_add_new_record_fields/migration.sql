/*
  Warnings:

  - Added the required column `country` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "inflType" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "title" DROP NOT NULL;
