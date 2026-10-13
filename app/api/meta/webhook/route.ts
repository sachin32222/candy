import { processMetaWebhookEvent } from "../../../../src/utils/metaCredentials";

/**
 * Meta Webhook Handler for Instagram Comments & Direct Messages
 * Path: app/api/meta/webhook/route.ts
 */

// 1. GET Method: Webhook Handshake Verification
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN || "candei_secret_meta_webhook_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Meta Webhook] Verification successful");
    // Return raw challenge as plain text with HTTP 200 (not wrapped in JSON)
    return new Response(challenge ?? "", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  console.warn("[Meta Webhook] Verification failed - unauthorized token or mode mismatch");
  return new Response("Forbidden", { status: 403 });
}

// 2. POST Method: Incoming Event Reception & Asynchronous Processing
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("[Meta Webhook] Received incoming event payload:", JSON.stringify(payload, null, 2));

    // Immediately trigger asynchronous event processing without blocking HTTP response
    processMetaWebhookEvent(payload).catch((error) => {
      console.error("[Meta Webhook] Error processing event asynchronously:", error);
    });

    // Immediately acknowledge receipt with HTTP 200 OK to prevent Meta from retrying
    return Response.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  } catch (error) {
    console.error("[Meta Webhook] Failed to parse incoming JSON payload:", error);
    // Still return 200 to satisfy Meta webhook acknowledgment
    return Response.json({ status: "EVENT_RECEIVED" }, { status: 200 });
  }
}
