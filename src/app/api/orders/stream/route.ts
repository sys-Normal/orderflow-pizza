import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import { subscribeToStoreOrders } from "@/lib/events";

// Powers the seller live order feed on /admin/orders. Session-scoped (not
// store-scoped like /api/orders/[orderId]/stream) because a seller can own
// more than one store — one connection, subscribed to every store they own.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25000;

export async function GET(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "seller") {
    return new Response("Unauthorized", { status: 401 });
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: session.userId },
    select: { id: true },
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const unsubscribes = stores.map((store) =>
        subscribeToStoreOrders(store.id, (event) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        })
      );

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, HEARTBEAT_MS);

      const close = () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
        clearInterval(heartbeat);
        controller.close();
      };

      request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
