import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth/current-user";
import { subscribeToOrder } from "@/lib/events";

// Long-lived streaming response — must run on the Node runtime (not Edge)
// and never be statically optimized/cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEARTBEAT_MS = 25000;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const session = await getSessionUser();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { buyerId: true, store: { select: { ownerId: true } } },
  });
  if (!order) {
    return new Response("Not found", { status: 404 });
  }

  // Same access rule as getOrderForSession: buyer who placed it, the
  // owning seller, or any platform admin.
  const allowed =
    session.role === "platform_admin" ||
    (session.role === "buyer" && order.buyerId === session.userId) ||
    (session.role === "seller" && order.store.ownerId === session.userId);
  if (!allowed) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = subscribeToOrder(orderId, (event) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      });

      // Comment lines (": ...") are ignored by EventSource but keep the
      // connection alive through proxies/load balancers with idle timeouts.
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, HEARTBEAT_MS);

      const close = () => {
        unsubscribe();
        clearInterval(heartbeat);
        controller.close();
      };

      _request.signal.addEventListener("abort", close);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Disables response buffering on nginx-fronted deployments so events
      // reach the client immediately instead of waiting on a buffer flush.
      "X-Accel-Buffering": "no",
    },
  });
}
