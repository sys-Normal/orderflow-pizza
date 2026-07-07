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

const MENU_ITEMS: Pizza[] = [
  // 피자
  {
    id: "margherita",
    name: "마르게리타",
    description: "토마토 소스, 모차렐라, 바질",
    category: "pizza",
    prices: { S: 12000, M: 16000, L: 20000 },
  },
  {
    id: "pepperoni",
    name: "페퍼로니",
    description: "토마토 소스, 모차렐라, 페퍼로니",
    category: "pizza",
    prices: { S: 13000, M: 17000, L: 21000 },
  },
  {
    id: "bbq-chicken-pizza",
    name: "BBQ 치킨 피자",
    description: "BBQ 소스, 그릴드 치킨, 양파, 모차렐라",
    category: "pizza",
    prices: { S: 15000, M: 19000, L: 23000 },
  },
  {
    id: "veggie-supreme",
    name: "베지 수프림",
    description: "피망, 올리브, 버섯, 양파, 옥수수",
    category: "pizza",
    prices: { S: 13000, M: 17000, L: 21000 },
  },
  {
    id: "hawaiian",
    name: "하와이안",
    description: "햄, 파인애플, 모차렐라",
    category: "pizza",
    prices: { S: 13000, M: 17000, L: 21000 },
  },
  {
    id: "four-cheese",
    name: "포 치즈",
    description: "모차렐라, 고르곤졸라, 파마산, 체다",
    category: "pizza",
    prices: { S: 15000, M: 19000, L: 23000 },
  },
  // 치킨
  {
    id: "fried-chicken",
    name: "후라이드 치킨",
    description: "바삭하게 튀긴 순수 후라이드 치킨",
    category: "chicken",
    prices: { S: 14000, M: 18000, L: 32000 },
  },
  {
    id: "yangnyeom-chicken",
    name: "양념 치킨",
    description: "매콤달콤한 양념 소스",
    category: "chicken",
    prices: { S: 15000, M: 19000, L: 34000 },
  },
  {
    id: "soy-garlic-chicken",
    name: "간장 치킨",
    description: "간장 마늘 소스, 고소한 풍미",
    category: "chicken",
    prices: { S: 15000, M: 19000, L: 34000 },
  },
  {
    id: "pa-dak",
    name: "파닭",
    description: "아삭한 파채를 듬뿍 올린 치킨",
    category: "chicken",
    prices: { S: 16000, M: 20000, L: 35000 },
  },
  // 사이드
  {
    id: "french-fries",
    name: "감자튀김",
    description: "바삭한 감자튀김",
    category: "side",
    prices: { S: 4000, M: 6000, L: 8000 },
  },
  {
    id: "cheese-stick",
    name: "치즈스틱",
    description: "쭉 늘어나는 모차렐라 치즈스틱",
    category: "side",
    prices: { S: 5000, M: 7000, L: 9000 },
  },
  {
    id: "garlic-bread",
    name: "마늘빵",
    description: "갈릭 버터 마늘빵",
    category: "side",
    prices: { S: 4000, M: 6000, L: 8000 },
  },
  {
    id: "potato-wedge",
    name: "웨지감자",
    description: "시즈닝을 뿌린 웨지 감자",
    category: "side",
    prices: { S: 4500, M: 6500, L: 8500 },
  },
  // 음료
  {
    id: "cola",
    name: "콜라",
    description: "톡 쏘는 코카콜라",
    category: "drink",
    prices: { S: 2000, M: 2500, L: 4000 },
  },
  {
    id: "cider",
    name: "사이다",
    description: "상큼한 스프라이트",
    category: "drink",
    prices: { S: 2000, M: 2500, L: 4000 },
  },
  {
    id: "zero-cola",
    name: "제로 콜라",
    description: "당 걱정 없는 코카콜라 제로",
    category: "drink",
    prices: { S: 2000, M: 2500, L: 4000 },
  },
  {
    id: "orange-juice",
    name: "오렌지 주스",
    description: "착즙 오렌지 주스",
    category: "drink",
    prices: { S: 2500, M: 3000, L: 4500 },
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
    update: { latitude: 37.4979, longitude: 127.0276, status: "approved" },
    create: {
      id: "orderflow-main",
      ownerId: owner.id,
      name: "OrderFlow Pizza",
      status: "approved",
      phone: "02-1234-5678",
      // Arbitrary real-world coordinate (Gangnam Station) for map display.
      latitude: 37.4979,
      longitude: 127.0276,
    },
  });

  for (const item of MENU_ITEMS) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
        priceS: item.prices.S,
        priceM: item.prices.M,
        priceL: item.prices.L,
      },
      create: {
        id: item.id,
        storeId: store.id,
        name: item.name,
        description: item.description,
        category: item.category,
        priceS: item.prices.S,
        priceM: item.prices.M,
        priceL: item.prices.L,
      },
    });
  }

  console.log(`Seeded store "${store.name}" with ${MENU_ITEMS.length} menu items.`);
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
