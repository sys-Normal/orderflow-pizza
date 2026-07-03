import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PIZZAS } from "../src/lib/menu/data";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "seller@orderflow.pizza" },
    update: {},
    create: {
      email: "seller@orderflow.pizza",
      passwordHash: "seed-only-not-a-real-hash",
      role: "seller",
    },
  });

  const store = await prisma.store.upsert({
    where: { id: "orderflow-main" },
    update: {},
    create: {
      id: "orderflow-main",
      ownerId: owner.id,
      name: "OrderFlow Pizza",
      status: "approved",
    },
  });

  for (const pizza of PIZZAS) {
    await prisma.menuItem.upsert({
      where: { id: pizza.id },
      update: {
        name: pizza.name,
        description: pizza.description,
        priceS: pizza.prices.S,
        priceM: pizza.prices.M,
        priceL: pizza.prices.L,
      },
      create: {
        id: pizza.id,
        storeId: store.id,
        name: pizza.name,
        description: pizza.description,
        priceS: pizza.prices.S,
        priceM: pizza.prices.M,
        priceL: pizza.prices.L,
      },
    });
  }

  console.log(`Seeded store "${store.name}" with ${PIZZAS.length} menu items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
