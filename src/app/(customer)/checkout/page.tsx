import { getSessionUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { CheckoutForm } from "@/components/checkout-form";

export default async function CheckoutPage() {
  const session = await getSessionUser();

  let savedAddress: { name: string; phone: string; address: string } | null = null;
  let presets: { id: string; label: string; name: string; phone: string; address: string }[] = [];

  if (session?.role === "buyer") {
    const buyer = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        defaultAddressName: true,
        defaultAddressPhone: true,
        defaultAddressLine: true,
        deliveryPresets: {
          orderBy: { createdAt: "asc" },
          select: { id: true, label: true, name: true, phone: true, address: true },
        },
      },
    });

    if (buyer) {
      presets = buyer.deliveryPresets;
      if (buyer.defaultAddressName && buyer.defaultAddressPhone && buyer.defaultAddressLine) {
        savedAddress = {
          name: buyer.defaultAddressName,
          phone: buyer.defaultAddressPhone,
          address: buyer.defaultAddressLine,
        };
      }
    }
  }

  return <CheckoutForm savedAddress={savedAddress} presets={presets} />;
}
