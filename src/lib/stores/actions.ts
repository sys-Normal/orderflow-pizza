"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import type { StoreStatus } from "@/generated/prisma/client";

export async function updateStoreStatus(
  storeId: string,
  status: StoreStatus
): Promise<void> {
  const session = await getSessionUser();
  if (!session || session.role !== "platform_admin") {
    throw new Error("플랫폼 관리자만 매장 상태를 변경할 수 있습니다.");
  }

  await prisma.store.update({ where: { id: storeId }, data: { status } });
  revalidatePath("/admin/stores");
}
