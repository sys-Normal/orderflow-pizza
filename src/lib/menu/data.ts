export type PizzaSize = "S" | "M" | "L";

export type Pizza = {
  id: string;
  name: string;
  description: string;
  prices: Record<PizzaSize, number>;
};

export const PIZZAS: Pizza[] = [
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

export function getPizzaById(id: string): Pizza | undefined {
  return PIZZAS.find((pizza) => pizza.id === id);
}
