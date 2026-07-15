"use client";

import { useState } from "react";
import { PizzaDetailModal } from "@/components/pizza-detail-modal";
import { PizzaPhoto } from "@/components/pizza-photo";
import type { Pizza } from "@/lib/menu/types";

export function PizzaMenuCard({
  pizza,
  storeId,
  storeName,
}: {
  pizza: Pizza;
  storeId: string;
  storeName: string;
}) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div className="flex gap-4 rounded-lg border border-black/[.08] bg-surface p-4 transition-colors hover:border-primary dark:border-white/[.145]">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg">
          <PizzaPhoto
            imageUrl={pizza.imageUrl}
            alt={pizza.name}
            aspectClassName="aspect-square"
            sizes="96px"
            lightbox={false}
          />
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h3 className="text-base font-semibold">{pizza.name}</h3>
            <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {pizza.description}
            </p>
          </div>
          <div className="mt-auto flex justify-end">
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              className="rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary dark:border-white/[.145]"
            >
              자세히 보기
            </button>
          </div>
        </div>
      </div>
      {detailOpen && (
        <PizzaDetailModal
          pizza={pizza}
          storeId={storeId}
          storeName={storeName}
          onClose={() => setDetailOpen(false)}
        />
      )}
    </>
  );
}
