import { NextRequest, NextResponse } from "next/server";
import { saveConnection } from "@/lib/connection-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const targetBaseUrl =
    process.env.APP_URL ||
    "https://ais-dev-ca353np4q7qykag2banko6-576418229533.asia-east1.run.app";

  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || undefined;
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description") || searchParams.get("error_message");

    // Parse state for tenantId and return destination (defaults strictly to /#/dashboard/automations)
    let tenantId = "17841413170626603";
    let returnDestination = "/#/dashboard/automations";

    if (state) {
      try {
        if (state.startsWith("{")) {
          const parsed = JSON.parse(state);
          tenantId = parsed.tenantId || parsed.tenant_id || tenantId;
          if (parsed.returnTo || parsed.return_to) {
            returnDestination = parsed.returnTo || parsed.return_to;
          }
        } else if (state.startsWith("/#") || state.startsWith("/")) {
          returnDestination = state;
        } else if (state.includes("|")) {
          const parts = state.split("|");
          tenantId = parts[0] || tenantId;
          if (parts[1]) returnDestination = parts[1];
        } else {
          tenantId = state;
        }
      } catch (_) {
        tenantId = state;
      }
    }

    // Never redirect to /profile - always direct back to Automations Dashboard
    if (returnDestination.includes("/profile") || !returnDestination.includes("automations")) {
      returnDestination = "/#/dashboard/automations";
    }

    const buildRedirectUrl = (params: Record<string, string>) => {
      let base = returnDestination;
      if (!base.startsWith("http://") && !base.startsWith("https://")) {
        const cleanBase = base.startsWith("/") ? base : `/${base}`;
        base = `${targetBaseUrl}${cleanBase}`;
      }
      const sep = base.includes("?") ? "&" : "?";
      const q = new URLSearchParams(params).toString();
      return `${base}${sep}${q}`;
    };

    if (error || !code) {
      console.error("[Instagram Callback] OAuth Error:", error, errorDescription);
      return NextResponse.redirect(
        buildRedirectUrl({ error: errorDescription || error || "access_denied" })
      );
    }

    const cleanCode = code.split("#_")[0].trim();
    const clientId = process.env.META_APP_ID || "1090179470293810";
    const clientSecret = process.env.META_APP_SECRET || "472774808ad949133b7748ee5eb65187";
    const redirectUri = "https://getcandei.com/api/auth/instagram/callback";

    // 1. Exchange authorization code for access token
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
      cache: "no-store",
    });

    let tokenData = await tokenRes.json().catch(() => null);

    // Fallback to Facebook Graph token exchange if Instagram endpoint fails
    if (!tokenRes.ok || !tokenData || tokenData.error_type || tokenData.error) {
      console.warn("[Instagram Callback] api.instagram.com failed, trying graph.facebook.com oauth exchange");
      const fbTokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
      fbTokenUrl.searchParams.set("client_id", clientId);
      fbTokenUrl.searchParams.set("client_secret", clientSecret);
      fbTokenUrl.searchParams.set("redirect_uri", redirectUri);
      fbTokenUrl.searchParams.set("code", cleanCode);

      const fbTokenRes = await fetch(fbTokenUrl.toString(), { cache: "no-store" });
      const fbTokenData = await fbTokenRes.json().catch(() => null);
      if (fbTokenRes.ok && fbTokenData && fbTokenData.access_token) {
        tokenData = fbTokenData;
      }
    }

    if (!tokenData || (!tokenData.access_token && !tokenData.accessToken)) {
      console.error("[Instagram Callback] Token exchange failed:", tokenData);
      const msg = tokenData?.error_message || tokenData?.error?.message || "token_exchange_failed";
      return NextResponse.redirect(
        buildRedirectUrl({ error: msg })
      );
    }

    const accessToken = tokenData.access_token || tokenData.accessToken;
    let dynamicIgUserId = String(tokenData.user_id || tokenData.id || "");
    let dynamicUsername = "";

    // 2. Fetch connected Instagram account details directly from Meta Graph API
    // Option A: If using Instagram Login
    try {
      const meRes = await fetch(
        `https://graph.instagram.com/v21.0/me?fields=id,username,name&access_token=${encodeURIComponent(accessToken)}`,
        { cache: "no-store" }
      );
      if (meRes.ok) {
        const meData = await meRes.json().catch(() => null);
        if (meData?.username) {
          dynamicUsername = meData.username;
        }
        if (meData?.id) {
          dynamicIgUserId = String(meData.id);
        }
        console.log("[Instagram Callback] Resolved via graph.instagram.com/me:", { dynamicUsername, dynamicIgUserId });
      }
    } catch (err) {
      console.warn("[Instagram Callback] Error querying graph.instagram.com/me:", err);
    }

    // Option B: If using Facebook Page Login
    if (!dynamicUsername) {
      try {
        const accountsRes = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account{id,username,name},access_token&access_token=${encodeURIComponent(accessToken)}`,
          { cache: "no-store" }
        );
        if (accountsRes.ok) {
          const accountsData = await accountsRes.json().catch(() => null);
          if (accountsData?.data && Array.isArray(accountsData.data)) {
            const pageWithIg = accountsData.data.find((p: any) => p.instagram_business_account?.id);
            if (pageWithIg?.instagram_business_account) {
              const igAccount = pageWithIg.instagram_business_account;
              dynamicUsername = igAccount.username || igAccount.name || "";
              dynamicIgUserId = String(igAccount.id);
              console.log("[Instagram Callback] Resolved via Facebook Page accounts:", { dynamicUsername, dynamicIgUserId });
            }
          }
        }
      } catch (err) {
        console.warn("[Instagram Callback] Error querying graph.facebook.com/me/accounts:", err);
      }
    }

    // Fallback if still empty: Query graph.facebook.com/me
    if (!dynamicUsername) {
      try {
        const fbMeRes = await fetch(
          `https://graph.facebook.com/v21.0/me?fields=id,username,name&access_token=${encodeURIComponent(accessToken)}`,
          { cache: "no-store" }
        );
        if (fbMeRes.ok) {
          const fbMe = await fbMeRes.json().catch(() => null);
          if (fbMe?.username) {
            dynamicUsername = fbMe.username;
          } else if (fbMe?.name) {
            dynamicUsername = fbMe.name.toLowerCase().replace(/\s+/g, "_");
          }
          if (fbMe?.id && !dynamicIgUserId) {
            dynamicIgUserId = String(fbMe.id);
          }
        }
      } catch (_) {}
    }

    // Dynamic fallback - never use hardcoded mockups like candei_creator or candei_os
    if (!dynamicUsername) {
      dynamicUsername = dynamicIgUserId ? `user_${dynamicIgUserId.slice(-4)}` : "connected_account";
    }
    if (!dynamicIgUserId) {
      dynamicIgUserId = Date.now().toString();
    }

    console.log("[Instagram Callback] Final resolved account:", { dynamicUsername, dynamicIgUserId });

    // 3. Save username: dynamicUsername and ig_user_id: dynamicIgUserId into connection document
    await saveConnection({
      username: dynamicUsername,
      ig_user_id: dynamicIgUserId,
      access_token: accessToken,
      tenant_id: tenantId,
    });

    // 4. Return { success: true, username: dynamicUsername, ig_user_id: dynamicIgUserId }
    if (request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({
        success: true,
        username: dynamicUsername,
        ig_user_id: dynamicIgUserId,
      });
    }

    // Clean redirect directly to the automations dashboard with dynamic query params
    return NextResponse.redirect(
      buildRedirectUrl({
        status: "connected",
        user_id: dynamicIgUserId,
        username: dynamicUsername,
      })
    );
  } catch (err: any) {
    console.error("[Instagram Callback] Fatal Error:", err);
    return NextResponse.redirect(
      `${targetBaseUrl}/#/dashboard/automations?error=${encodeURIComponent(err?.message || "server_error")}`
    );
  }
}
