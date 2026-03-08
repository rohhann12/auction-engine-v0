-- DropIndex
DROP INDEX "bids_productId_key";

-- AlterTable
ALTER TABLE "bids" ADD CONSTRAINT "bids_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "images" TEXT,
ADD CONSTRAINT "product_pkey" PRIMARY KEY ("productId");

-- AlterTable
ALTER TABLE "user" ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
