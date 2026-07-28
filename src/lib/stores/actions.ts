"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import type { StoreStatus } from "@/generated/prisma/client";
import { getNearbyStores } from "@/lib/stores/queries";
import { generateUniqueContactEmail } from "@/lib/stores/contact-email";
import { generateTempPassword, hashPassword } from "@/lib/auth/password";
import { forwardGeocode, type GeocodeResult } from "@/lib/stores/forward-geocode";
import { PROJECT_NAME } from "@/lib/constants";

const NEARBY_RADIUS_KM = 3;

export async function fetchNearbyStores(latitude: number, longitude: number) {
  return getNearbyStores(latitude, longitude, NEARBY_RADIUS_KM);
}

export async function searchStoreAddress(query: string): Promise<GeocodeResult[]> {
  return forwardGeocode(query);
}

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
  revalidatePath(`/admin/stores/${storeId}`);
}

export type CreateStoreState =
  | { error: string }
  | { success: true; loginEmail: string; tempPassword: string; storeName: string }
  | undefined;

// Platform admin creates a branch and its login account together — this
// brand's stores are all one franchise ("OrderFlow Pizza"), not independent
// businesses self-onboarding, so the branch owner never signs themselves up
// (see docs/decision-log.md). The generated password is returned once in
// the action result so the admin can hand it off; it is never emailed or
// stored anywhere in plaintext.
export async function createStoreAction(
  _prevState: CreateStoreState,
  formData: FormData
): Promise<CreateStoreState> {
  const session = await getSessionUser();
  if (!session || session.role !== "platform_admin") {
    return { error: "플랫폼 관리자만 지점을 생성할 수 있습니다." };
  }

  // The form only collects the branch part ("강남점") — every store belongs
  // to the same "orderflow" brand, so the prefix is enforced here rather
  // than trusted to whatever the admin happens to type.
  const branchName = String(formData.get("name") ?? "").trim();
  const name = branchName ? `${PROJECT_NAME} ${branchName}` : "";
  const phone = String(formData.get("phone") ?? "").trim();
  const loginEmail = String(formData.get("loginEmail") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));

  if (!branchName) {
    return { error: "지점명을 입력해주세요." };
  }
  if (!phone) {
    return { error: "전화번호를 입력해주세요." };
  }
  if (!loginEmail) {
    return { error: "지점주 로그인 이메일을 입력해주세요." };
  }
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: "위치 정보(위도/경도)를 확인해주세요." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: loginEmail } });
  if (existingUser) {
    return { error: "이미 사용 중인 이메일입니다." };
  }

  const tempPassword = generateTempPassword();
  await prisma.user.create({
    data: {
      email: loginEmail,
      passwordHash: hashPassword(tempPassword),
      role: "seller",
      store: {
        create: {
          name,
          phone,
          status: "approved",
          contactEmail: await generateUniqueContactEmail(prisma),
          latitude,
          longitude,
        },
      },
    },
  });

  revalidatePath("/admin/stores");
  return { success: true, loginEmail, tempPassword, storeName: name };
}
