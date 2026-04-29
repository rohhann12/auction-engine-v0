import { PrismaClient, Roles } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data in dependency order
  await prisma.bids.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // Seed users
  const seller = await prisma.user.create({
    data: {
      role: Roles.seller,
      active: true,
      isOwner: true,
      bids: [],
      orders: [],
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      role: Roles.buyer,
      active: true,
      bids: [],
      orders: [],
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      role: Roles.buyer,
      active: true,
      bids: [],
      orders: [],
    },
  });

  console.log("Seeded users:", { seller, buyer1, buyer2 });

  // Seed 3 products
  const product1 = await prisma.product.create({
    data: {
      minPrice: 100,
      ownerId: seller.id,
      soldForPrice: 0,
      images: "https://example.com/images/vintage-watch.jpg",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      minPrice: 500,
      ownerId: seller.id,
      soldForPrice: 0,
      images: "https://example.com/images/laptop.jpg",
    },
  });

  const product3 = await prisma.product.create({
    data: {
      minPrice: 50,
      ownerId: seller.id,
      soldForPrice: 0,
      images: "https://example.com/images/book-collection.jpg",
    },
  });

  console.log("Seeded products:", { product1, product2, product3 });

  // Seed bids
  const bid1 = await prisma.bids.create({
    data: {
      roomId: product1.roomId,
      price: 150,
      userId: buyer1.id,
      status: "ORDER_PENDING",
    },
  });

  const bid2 = await prisma.bids.create({
    data: {
      roomId: product2.roomId,
      price: 600,
      userId: buyer2.id,
      status: "ORDER_PENDING",
    },
  });

  const bid3 = await prisma.bids.create({
    data: {
      roomId: product3.roomId,
      price: 75,
      userId: buyer1.id,
      status: "ORDER_PENDING",
    },
  });

  console.log("Seeded bids:", { bid1, bid2, bid3 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
