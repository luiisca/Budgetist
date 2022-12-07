/*
  Warnings:

  - You are about to drop the column `frequencey` on the `Category` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" DROP COLUMN "frequencey",
ADD COLUMN     "frequency" INTEGER NOT NULL DEFAULT 12;
