/*
  Warnings:

  - You are about to drop the column `frequencey` on the `Record` table. All the data in the column will be lost.
  - Added the required column `frequency` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "frequencey",
ADD COLUMN     "frequency" INTEGER NOT NULL;
