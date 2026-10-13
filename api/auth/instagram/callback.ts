import { processInstagramOAuthCallback } from "@/src/utils/metaCredentials";

export default async function handler(req: any, res: any) {
  const query = req.query || {};
  const code = query.code;
  const state = query.state; // tenantId
  const error = query.error;
  const errorMessage = query.error_message || query.error_description;

  if (error || errorMessage) {
    console.warn(`[Instagram OAuth Callback] Error parameter from Meta: ${error} - ${errorMessage}`);
    const redirectUrl = `/dashboard/automations?error=${encodeURIComponent(errorMessage || error || "oauth_denied")}`;
    if (typeof res.redirect === "function") {
      return res.redirect(redirectUrl);
    } else {
      res.writeHead(302, { Location: redirectUrl });
      return res.end();
    }
  }

  if (!code || !state) {
    const redirectUrl = "/dashboard/automations?error=missing_parameters";
    if (typeof res.redirect === "function") {
      return res.redirect(redirectUrl);
    } else {
      res.writeHead(302, { Location: redirectUrl });
      return res.end();
    }
  }

  try {
    await processInstagramOAuthCallback(String(code), String(state));
    
    // Redirect to /dashboard/automations?status=connected
    if (typeof res.redirect === "function") {
      return res.redirect("/dashboard/automations?status=connected");
    } else {
      res.writeHead(302, { Location: "/dashboard/automations?status=connected" });
      return res.end();
    }
  } catch (err: any) {
    console.error("Vercel Instagram callback error:", err);
    const redirectUrl = `/dashboard/automations?error=${encodeURIComponent(err?.message || "oauth_failed")}`;
    if (typeof res.redirect === "function") {
      return res.redirect(redirectUrl);
    } else {
      res.writeHead(302, { Location: redirectUrl });
      return res.end();
    }
  }
}
