-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('buyer', 'seller');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "bids" TEXT[],
    "orders" TEXT[],
    "active" BOOLEAN NOT NULL,
    "role" "Roles" NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "product" (
    "productId" TEXT NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "ownerId" TEXT NOT NULL,
    "soldForPrice" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bids_id_key" ON "bids"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bids_productId_key" ON "bids"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_productId_key" ON "product"("productId");

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
