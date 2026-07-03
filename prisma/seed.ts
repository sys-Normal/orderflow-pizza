import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import type { Pizza } from "../src/lib/menu/types";
import { hashPassword } from "../src/lib/auth/password";

const SEED_ACCOUNTS = [
  { email: "seller@orderflow.pizza", password: "seller1234!", role: "seller" as const },
  { email: "admin@orderflow.pizza", password: "admin1234!", role: "platform_admin" as const },
];

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

const PIZZAS: Pizza[] = [
  {
    id: "margherita",
    name: "마르게리타",
    description: "토마토 소스, 모차렐라, 바질",
    prices: { S: 12000, M: 16000, L: 20000 },
  },
  {
    id: "pepperoni",
    name: "페퍼로니",
    description: "토마토 소스, 모차렐라, 페퍼로니",
    prices: { S: 13000, M: 17000, L: 21000 },
  },
  {
    id: "bbq-chicken",
    name: "BBQ 치킨",
    description: "BBQ 소스, 그릴드 치킨, 양파, 모차렐라",
    prices: { S: 15000, M: 19000, L: 23000 },
  },
  {
    id: "veggie-supreme",
    name: "베지 수프림",
    description: "피망, 올리브, 버섯, 양파, 옥수수",
    prices: { S: 13000, M: 17000, L: 21000 },
  },
  {
    id: "hawaiian",
    name: "하와이안",
    description: "햄, 파인애플, 모차렐라",
    prices: { S: 13000, M: 17000, L: 21000 },
  },
  {
    id: "four-cheese",
    name: "포 치즈",
    description: "모차렐라, 고르곤졸라, 파마산, 체다",
    prices: { S: 15000, M: 19000, L: 23000 },
  },
];

async function main() {
  const [owner] = await Promise.all(
    SEED_ACCOUNTS.map((account) =>
      prisma.user.upsert({
        where: { email: account.email },
        update: { passwordHash: hashPassword(account.password) },
        create: {
          email: account.email,
          passwordHash: hashPassword(account.password),
          role: account.role,
        },
      })
    )
  );

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
  console.log("Seeded accounts:");
  for (const account of SEED_ACCOUNTS) {
    console.log(`  ${account.role}: ${account.email} / ${account.password}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
