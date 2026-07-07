import { notFound } from "next/navigation";
import { getMenu } from "@/lib/menu/queries";
import { getPrimaryStore, getStoreById } from "@/lib/stores/queries";
import { MenuCategorySection } from "@/components/menu-category-section";
import { MENU_CATEGORY_LABELS, MENU_CATEGORY_ORDER } from "@/lib/menu/types";

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
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">메뉴</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{store.name}</p>
        {store.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {store.description}
          </p>
        )}
      </div>

      {MENU_CATEGORY_ORDER.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <MenuCategorySection
            key={category}
            title={MENU_CATEGORY_LABELS[category]}
            items={categoryItems}
            storeId={store.id}
            storeName={store.name}
          />
        );
      })}
    </div>
  );
}
