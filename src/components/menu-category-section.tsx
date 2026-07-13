"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PizzaCard } from "@/components/pizza-card";
import { PizzaMenuCard } from "@/components/pizza-menu-card";
import type { MenuCategory, Pizza } from "@/lib/menu/types";

export function MenuCategorySection({
  title,
  category,
  items,
  storeId,
  storeName,
}: {
  title: string;
  category: MenuCategory;
  items: Pizza[];
  storeId: string;
  storeName: string;
}) {
  const [expanded, setExpanded] = useState(true);
  // Pizza gets the photo card + ingredient/size detail modal; other
  // categories have no size-worthy customization, so they keep the
  // existing inline size-select + instant-add card.
  const CardComponent = category === "pizza" ? PizzaMenuCard : PizzaCard;

  return (
    <section className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <ChevronDown
          className={`h-5 w-5 text-zinc-600 transition-transform dark:text-zinc-400 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <CardComponent
              key={item.id}
              pizza={item}
              storeId={storeId}
              storeName={storeName}
            />
          ))}
        </div>
      )}
    </section>
  );
}
