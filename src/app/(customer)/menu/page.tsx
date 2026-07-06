import { getMenu } from "@/lib/menu/queries";
import { MenuCategorySection } from "@/components/menu-category-section";
import { MENU_CATEGORY_LABELS, MENU_CATEGORY_ORDER } from "@/lib/menu/types";

export default async function MenuPage() {
  const items = await getMenu();

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-semibold tracking-tight">메뉴</h1>
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
