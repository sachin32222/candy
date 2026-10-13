import { processMetaWebhookEvent } from "@/src/utils/metaCredentials";

export default function handler(req: any, res: any) {
  if (req.method === "GET") {
    const query = req.query || {};
    const mode = query["hub.mode"];
    const token = query["hub.verify_token"];
    const challenge = query["hub.challenge"];

    const verifyToken = process.env.META_VERIFY_TOKEN || "candei_secret_meta_webhook_2026";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("[Meta Webhook] Verification successful");
      res.setHeader("Content-Type", "text/plain");
      if (typeof res.status === "function") {
        return res.status(200).send(String(challenge ?? ""));
      } else {
        res.writeHead(200);
        return res.end(String(challenge ?? ""));
      }
    } else {
      console.warn("[Meta Webhook] Verification failed - mode or token mismatch");
      if (typeof res.status === "function") {
        return res.status(403).send("Forbidden");
      } else {
        res.writeHead(403);
        return res.end("Forbidden");
      }
    }
  }

  if (req.method === "POST") {
    try {
      const payload = req.body;
      console.log("[Meta Webhook] Received event payload:", JSON.stringify(payload, null, 2));

      // Asynchronously process automation triggers
      processMetaWebhookEvent(payload).catch((e) => {
        console.error("[Meta Webhook] Async event error:", e);
      });

      if (typeof res.status === "function") {
        return res.status(200).json({ status: "EVENT_RECEIVED" });
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "EVENT_RECEIVED" }));
      }
    } catch (error) {
      console.error("[Meta Webhook] Error processing event:", error);
      if (typeof res.status === "function") {
        return res.status(200).json({ status: "EVENT_RECEIVED" });
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ status: "EVENT_RECEIVED" }));
      }
    }
  }

  if (typeof res.status === "function") {
    return res.status(405).send("Method Not Allowed");
  } else {
    res.writeHead(405);
    return res.end("Method Not Allowed");
  }
}
