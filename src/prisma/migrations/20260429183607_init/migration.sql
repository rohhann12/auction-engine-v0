/*
  Warnings:

  - Added the required column `status` to the `bids` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ORDER_ACCEPTED', 'ORDER_REJECTED', 'ORDER_PENDING');

-- AlterTable
ALTER TABLE "bids" ADD COLUMN     "status" "Status" NOT NULL;

-- RenameIndex
ALTER INDEX "product_productId_key" RENAME TO "product_roomId_key";
