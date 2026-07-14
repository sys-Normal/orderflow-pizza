"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import { MAX_DELIVERY_PRESETS, type DeliveryPreset } from "@/lib/delivery/types";

async function requireBuyer() {
  const session = await getSessionUser();
  if (!session || session.role !== "buyer") {
    throw new Error("로그인이 필요합니다.");
  }
  return session;
}

export async function saveDeliveryPreset(input: {
  label: string;
  name: string;
  phone: string;
  address: string;
}): Promise<DeliveryPreset> {
  const session = await requireBuyer();

  const count = await prisma.deliveryPreset.count({
    where: { userId: session.userId },
  });
  if (count >= MAX_DELIVERY_PRESETS) {
    throw new Error(`배송지 프리셋은 최대 ${MAX_DELIVERY_PRESETS}개까지 저장할 수 있습니다.`);
  }

  const preset = await prisma.deliveryPreset.create({
    data: {
      userId: session.userId,
      label: input.label,
      name: input.name,
      phone: input.phone,
      address: input.address,
    },
    select: { id: true, label: true, name: true, phone: true, address: true },
  });

  revalidatePath("/checkout");
  return preset;
}

export async function deleteDeliveryPreset(id: string): Promise<void> {
  const session = await requireBuyer();
  await prisma.deliveryPreset.deleteMany({
    where: { id, userId: session.userId },
  });
  revalidatePath("/checkout");
}
