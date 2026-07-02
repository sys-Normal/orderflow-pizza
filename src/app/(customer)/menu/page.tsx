import { PIZZAS } from "@/lib/menu/data";
import { PizzaCard } from "@/components/pizza-card";

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">메뉴</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PIZZAS.map((pizza) => (
          <PizzaCard key={pizza.id} pizza={pizza} />
        ))}
      </div>
    </div>
  );
}
