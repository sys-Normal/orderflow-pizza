import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import { notFound } from "next/navigation";
import { getMenu } from "@/lib/menu/queries";
import { getPrimaryStore, getStoreById } from "@/lib/stores/queries";
import { MenuCategorySection } from "@/components/menu-category-section";
import {
  DISABLED_MENU_CATEGORIES,
  MENU_CATEGORY_LABELS,
  MENU_CATEGORY_ORDER,
} from "@/lib/menu/types";

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>;
}) {
  const { storeId } = await searchParams;
  // No storeId means the customer landed on /menu directly (e.g. the nav
  // "메뉴" tab) rather than through the /stores selection flow, so fall back
  // to the default seeded store.
  const store = storeId ? await getStoreById(storeId) : await getPrimaryStore();
  if (!store) {
    notFound();
  }
  const items = await getMenu(store.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Link
          href="/stores"
          className="inline-flex items-center gap-1 text-sm text-zinc-600 hover:text-primary dark:text-zinc-400"
        >
          <ArrowLeft className="h-4 w-4" />
          매장 목록
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              {store.name}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">메뉴</p>
          </div>
        </div>
        {store.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {store.description}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-10">
        {MENU_CATEGORY_ORDER.filter(
          (category) => !DISABLED_MENU_CATEGORIES.includes(category)
        ).map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (categoryItems.length === 0) return null;
          return (
            <MenuCategorySection
              key={category}
              title={MENU_CATEGORY_LABELS[category]}
              category={category}
              items={categoryItems}
              storeId={store.id}
              storeName={store.name}
            />
          );
        })}
      </div>
    </div>
  );
}
