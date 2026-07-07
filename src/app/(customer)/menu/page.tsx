import { getMenu } from "@/lib/menu/queries";
import { getPrimaryStore } from "@/lib/stores/queries";
import { MenuCategorySection } from "@/components/menu-category-section";
import { StoreMapLazy } from "@/components/store-map-lazy";
import { MENU_CATEGORY_LABELS, MENU_CATEGORY_ORDER } from "@/lib/menu/types";

export default async function MenuPage() {
  const [items, store] = await Promise.all([getMenu(), getPrimaryStore()]);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">메뉴</h1>
      </div>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">{store.name}</h2>
          {store.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {store.description}
            </p>
          )}
        </div>
        <StoreMapLazy
          latitude={store.latitude}
          longitude={store.longitude}
          name={store.name}
        />
      </section>

      {MENU_CATEGORY_ORDER.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;
        return (
          <MenuCategorySection
            key={category}
            title={MENU_CATEGORY_LABELS[category]}
            items={categoryItems}
          />
        );
      })}
    </div>
  );
}
