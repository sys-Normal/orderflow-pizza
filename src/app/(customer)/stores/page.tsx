import { StoreLocator } from "@/components/store-locator";

export default function StoresPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">매장 찾기</h1>
      <StoreLocator />
    </div>
  );
}
