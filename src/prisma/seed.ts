import { PrismaClient, Roles } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data in dependency order
  await prisma.bids.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // Seed users
  const seller1 = await prisma.user.create({
    data: {
      role: Roles.seller,
      active: true,
      isOwner: true,
      bids: [],
      orders: [],
    },
  });

  const seller2 = await prisma.user.create({
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

  const buyer3 = await prisma.user.create({
    data: {
      role: Roles.buyer,
      active: false,
      bids: [],
      orders: [],
    },
  });

  console.log("Seeded users:", { seller1, seller2, buyer1, buyer2, buyer3 });

  // Seed products
  const product1 = await prisma.product.create({
    data: {
      minPrice: 100,
      ownerId: seller1.id,
      soldForPrice: 0,
      images: "https://example.com/images/vintage-watch.jpg",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      minPrice: 500,
      ownerId: seller1.id,
      soldForPrice: 0,
      images: "https://example.com/images/laptop.jpg",
    },
  });

  const product3 = await prisma.product.create({
    data: {
      minPrice: 50,
      ownerId: seller2.id,
      soldForPrice: 0,
      images: "https://example.com/images/book-collection.jpg",
    },
  });

  const product4 = await prisma.product.create({
    data: {
      minPrice: 1000,
      ownerId: seller2.id,
      soldForPrice: 1250,
      images: "https://example.com/images/painting.jpg",
    },
  });

  console.log("Seeded products:", { product1, product2, product3, product4 });

  // Seed bids
  const bid1 = await prisma.bids.create({
    data: {
      productId: product1.productId,
      price: 150,
      userId: buyer1.id,
    },
  });

  const bid2 = await prisma.bids.create({
    data: {
      productId: product2.productId,
      price: 600,
      userId: buyer2.id,
    },
  });

  const bid3 = await prisma.bids.create({
    data: {
      productId: product3.productId,
      price: 75,
      userId: buyer1.id,
    },
  });

  const bid4 = await prisma.bids.create({
    data: {
      productId: product4.productId,
      price: 1250,
      userId: buyer3.id,
    },
  });

  console.log("Seeded bids:", { bid1, bid2, bid3, bid4 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });