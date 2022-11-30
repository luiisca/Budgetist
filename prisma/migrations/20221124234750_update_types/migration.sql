/*
  Warnings:

  - Changed the type of `amount` on the `Salary` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Salary" ALTER COLUMN "title" SET DEFAULT 'Salary',
ALTER COLUMN "currency" SET DEFAULT 'USD',
DROP COLUMN "amount",
ADD COLUMN     "amount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "country" SET DEFAULT 'US';
