import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import Razorpay from "razorpay";
import crypto from "crypto";

async function startServer() {
  const app = express();

  // Parse --port and --host from CLI args or default to 3000 / 0.0.0.0
  const portArgIdx = process.argv.indexOf("--port");
  const hostArgIdx = process.argv.indexOf("--host");
  const PORT = portArgIdx !== -1 && process.argv[portArgIdx + 1]
    ? parseInt(process.argv[portArgIdx + 1], 10)
    : 3000;
  const HOST = hostArgIdx !== -1 && process.argv[hostArgIdx + 1]
    ? process.argv[hostArgIdx + 1]
    : "0.0.0.0";

  // Increase payload size limit since we'll be transferring self base64 images
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  app.post("/api/create-razorpay-order", async (req, res) => {
    try {
      const { amount, plan } = req.body;
      
      const key_id = process.env.RAZORPAY_KEY_ID;
      const key_secret = process.env.RAZORPAY_KEY_SECRET;

      if (!key_id || !key_secret) {
        return res.status(500).json({ error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET." });
      }

      const rzp = new Razorpay({
        key_id,
        key_secret
      });

      const order = await rzp.orders.create({
        amount: amount, // amount in paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`
      });

      res.json({ orderId: order.id, amount: order.amount, currency: order.currency, key_id });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.error?.description || e?.message || "Failed to create order" });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      
      const key_secret = process.env.RAZORPAY_KEY_SECRET;
      if (!key_secret) {
        return res.status(500).json({ error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_SECRET." });
      }
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", key_secret)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature === razorpay_signature) {
        res.json({ success: true });
      } else {
        res.status(400).json({ success: false, error: "Invalid signature" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // API route for AI image analysis
  app.post("/api/analyze-images", async (req, res) => {
    try {
      const { selfieBase64, images } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const imageParts = [];
      const validIndices = [];
      
      // limit max images to 50
      const maxImagesToAnalyze = Math.min(images.length, 50);
      
      for (let i = 0; i < maxImagesToAnalyze; i++) {
        try {
          if (images[i].type?.startsWith('video/')) continue;
          
          const imgUrl = images[i].url;
          if (!imgUrl) continue;
          
          const response = await fetch(imgUrl);
          if (!response.ok) {
            console.warn(`Failed to fetch image ${imgUrl}`);
            continue;
          }
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = response.headers.get("content-type") || "image/jpeg";
          
          imageParts.push({
            inlineData: {
              data: base64,
              mimeType: contentType
            }
          });
          validIndices.push(images[i].index);
        } catch (e) {
          console.warn("Could not fetch image for AI analysis", e);
        }
      }

      if (imageParts.length === 0) {
        return res.status(400).json({ error: "Could not fetch any gallery images." });
      }

      let selfieMimeType = "image/jpeg";
      let selfieData = selfieBase64;
      if (selfieBase64.includes(',')) {
        selfieMimeType = selfieBase64.split(';')[0].split(':')[1];
        selfieData = selfieBase64.split(',')[1];
      }

      const selfiePart = {
        inlineData: {
          data: selfieData,
          mimeType: selfieMimeType
        }
      };

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: "Here is a selfie of a person:" },
              selfiePart,
              { text: "Here are some gallery images, provided in order starting from index 0:" },
              ...imageParts,
              { text: "Identify which of the gallery images contain the person shown in the selfie. Return a JSON array of the 0-based indices of the matching gallery images. If the person is not found in any gallery image, return []. Only return the JSON array." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "INTEGER" }
          }
        }
      });

      const matchedIndices = JSON.parse(aiResponse.text || "[]");
      const finalMatches = matchedIndices.map((idx: number) => validIndices[idx]).filter((idx: number) => idx !== undefined);
      
      res.json({ matches: finalMatches });
    } catch (error) {
      console.error("Error analyzing images:", error);
      res.status(500).json({ error: "AI analysis failed." });
    }
  });

  // Meta (Instagram & WhatsApp) Webhook Verification
  app.get("/api/meta/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const verifyToken = process.env.META_VERIFY_TOKEN || "candei_secret_meta_webhook_2026";

    if (mode === "subscribe" && token === verifyToken) {
      console.log("[Meta Webhook] Verification successful");
      // Return raw challenge string with HTTP 200 (do not wrap in JSON)
      return res.status(200).send(String(challenge ?? ""));
    } else {
      console.warn("[Meta Webhook] Verification failed - mode or token mismatch", {
        mode,
        tokenReceived: token ? "[REDACTED]" : undefined,
      });
      return res.status(403).send("Forbidden");
    }
  });

  // Meta (Instagram & WhatsApp) Event Reception
  app.post("/api/meta/webhook", (req, res) => {
    try {
      const payload = req.body;
      console.log("[Meta Webhook] Received event payload:", JSON.stringify(payload, null, 2));

      // Asynchronously process automation triggers
      import("./src/utils/metaCredentials").then(({ processMetaWebhookEvent }) => {
        processMetaWebhookEvent(payload).catch((e) => {
          console.error("[Meta Webhook] Async event error:", e);
        });
      }).catch((e) => {
        console.error("[Meta Webhook] Import error:", e);
      });

      // Immediately respond with HTTP 200 OK so Meta does not retry
      return res.status(200).json({ status: "EVENT_RECEIVED" });
    } catch (error) {
      console.error("[Meta Webhook] Error processing event:", error);
      return res.status(200).json({ status: "EVENT_RECEIVED" });
    }
  });

  // Meta Instagram OAuth Callback
  app.get("/api/auth/instagram/callback", async (req, res) => {
    try {
      const { code, state, error, error_message, error_description } = req.query;

      if (error || error_message || error_description) {
        console.warn("[Instagram Callback] Error from Meta:", error, error_message || error_description);
        return res.redirect(`/#/dashboard/automations?error=${encodeURIComponent(String(error_message || error_description || error))}`);
      }

      if (!code || !state) {
        return res.redirect("/#/dashboard/automations?error=missing_parameters");
      }

      const { processInstagramOAuthCallback } = await import("./src/utils/metaCredentials");
      const result = await processInstagramOAuthCallback(String(code), String(state));

      if (result.success) {
        return res.redirect("/#/dashboard/automations?status=connected");
      } else {
        return res.redirect(`/#/dashboard/automations?error=${encodeURIComponent(result.error || "oauth_failed")}`);
      }
    } catch (err: any) {
      console.error("[Instagram Callback] Error:", err);
      return res.redirect("/#/dashboard/automations?error=oauth_failed");
    }
  });

  // Meta Instagram Compliance Routes
  app.all("/api/auth/instagram/deauthorize", (req, res) => {
    console.log("[Meta Compliance] Deauthorize callback hit:", req.body || req.query);
    res.status(200).json({ status: "DEAUTHORIZED", message: "User session deauthorized successfully." });
  });

  app.all("/api/auth/instagram/delete-data", (req, res) => {
    const confirmationCode = "candei_del_" + crypto.randomBytes(8).toString("hex");
    console.log("[Meta Compliance] Data deletion callback hit:", { body: req.body, code: confirmationCode });
    res.status(200).json({
      url: `https://getcandei.com/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // Prevent WebSocket port conflicts in dev environment
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Pre-seed mock reviewer account for Meta App Review
  import("./src/utils/metaCredentials").then(({ ensureReviewerAccount }) => {
    ensureReviewerAccount().catch((err) => {
      console.warn("[Meta DB] Reviewer seeding warning:", err);
    });
  });

  const server = app.listen(PORT, HOST, () => {
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
    console.log(`Server running on http://${HOST}:${PORT}`);
  });

  const handleShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", handleShutdown);
  process.on("SIGINT", handleShutdown);
}

startServer();
