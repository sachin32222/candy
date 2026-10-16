/**
 * Meta Webhook Handler for Instagram Comments & Direct Messages
 * Path: app/api/meta/webhook/route.ts
 */

import { handleMetaIncomingEvent } from "@/lib/instagram-webhook";

export const dynamic = "force-dynamic";

// 1. GET Method: Webhook Handshake Verification
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN || "candei_secret_meta_webhook_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Meta Webhook] Verification handshake successful. Returning challenge:", challenge);
    return new Response(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[Meta Webhook] Verification handshake failed - token or mode mismatch:", {
    mode,
    tokenProvided: token ? "[REDACTED]" : undefined,
  });
  return new Response("Forbidden", { status: 403 });
}

// 2. POST Method: Incoming Event Reception & Immediate 200 OK
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    console.log("[Meta Webhook] Incoming webhook event received:", JSON.stringify(payload, null, 2));

    // Immediately trigger asynchronous event processing without blocking HTTP response
    handleMetaIncomingEvent(payload).catch((error) => {
      console.error("[Meta Webhook] Asynchronous processing error:", error);
    });

    // Immediately return 200 OK with { status: "EVENT_RECEIVED" }
    return Response.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("[Meta Webhook] Error parsing incoming webhook JSON:", error);
    return Response.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  }
}
