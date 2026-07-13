"use client";

import { useState } from "react";
import Image from "next/image";
import { PizzaIcon } from "@/components/icons";
import { PizzaDetailModal } from "@/components/pizza-detail-modal";
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
      <div className="flex flex-col overflow-hidden rounded-lg border border-black/[.08] bg-surface dark:border-white/[.145]">
        <div className="relative flex aspect-square items-center justify-center bg-primary/10 text-primary">
          {pizza.imageUrl ? (
            <Image
              src={pizza.imageUrl}
              alt={pizza.name}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PizzaIcon className="h-16 w-16" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
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
