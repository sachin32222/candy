export default async function handler(req: any, res: any) {
  try {
    const query = req.query || {};
    const code = query.code;
    const error = query.error;
    const errorDescription = query.error_description || query.error_message;

    if (error || !code) {
      console.error("[Instagram Callback Vercel] OAuth Error:", error, errorDescription);
      const redirectUrl = `/dashboard/automations?error=${encodeURIComponent(errorDescription || error || "access_denied")}`;
      if (typeof res.redirect === "function") {
        return res.redirect(redirectUrl);
      } else {
        res.writeHead(302, { Location: redirectUrl });
        return res.end();
      }
    }

    const cleanCode = String(code).split("#_")[0].trim();
    const clientId = process.env.META_APP_ID || "1090179470293810";
    const clientSecret = process.env.META_APP_SECRET || "472774808ad949133b7748ee5eb65187";

    const redirectUri = "https://getcandei.com/api/auth/instagram/callback";

    const formData = new URLSearchParams();
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", redirectUri);
    formData.append("code", cleanCode);

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const tokenData = await tokenRes.json().catch(() => null);

    if (!tokenRes.ok || !tokenData || tokenData.error_type || tokenData.error) {
      console.error("[Instagram Callback Vercel] Token exchange failed:", tokenData);
      const msg = tokenData?.error_message || tokenData?.error?.message || "token_exchange_failed";
      const redirectUrl = `/dashboard/automations?error=${encodeURIComponent(msg)}`;
      if (typeof res.redirect === "function") {
        return res.redirect(redirectUrl);
      } else {
        res.writeHead(302, { Location: redirectUrl });
        return res.end();
      }
    }

    const { user_id } = tokenData;
    console.log("[Instagram Callback Vercel] Connected user_id:", user_id);

    const redirectUrl = `/dashboard/automations?status=connected&user_id=${user_id || ""}`;
    if (typeof res.redirect === "function") {
      return res.redirect(redirectUrl);
    } else {
      res.writeHead(302, { Location: redirectUrl });
      return res.end();
    }
  } catch (err: any) {
    console.error("[Instagram Callback Vercel] Fatal Error:", err);
    const redirectUrl = `/dashboard/automations?error=${encodeURIComponent(err?.message || "server_error")}`;
    if (typeof res.redirect === "function") {
      return res.redirect(redirectUrl);
    } else {
      res.writeHead(302, { Location: redirectUrl });
      return res.end();
    }
  }
}
