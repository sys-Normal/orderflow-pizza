"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { PizzaCard } from "@/components/pizza-card";
import type { Pizza } from "@/lib/menu/types";

export function MenuCategorySection({
  title,
  items,
}: {
  title: string;
  items: Pizza[];
}) {
  const [expanded, setExpanded] = useState(true);

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
            <PizzaCard key={item.id} pizza={item} />
          ))}
        </div>
      )}
    </section>
  );
}
