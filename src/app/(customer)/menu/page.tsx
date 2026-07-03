import { getMenu } from "@/lib/menu/queries";
import { PizzaCard } from "@/components/pizza-card";

export default async function MenuPage() {
  const pizzas = await getMenu();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">메뉴</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {pizzas.map((pizza) => (
          <PizzaCard key={pizza.id} pizza={pizza} />
        ))}
      </div>
    </div>
  );
}
