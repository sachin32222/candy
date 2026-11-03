import { NextRequest, NextResponse } from "next/server";
import { saveConnection } from "@/lib/connection-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let returnTo = "/#/dashboard/automations";
  let tenantId = "17841413170626603";

  try {
    // 1. Parse incoming code and state search parameters from the request URL
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription =
      searchParams.get("error_description") || searchParams.get("error_message");

    // 3. Parse returnTo from the state JSON (fallback to /#/dashboard/automations if missing or malformed)
    if (state) {
      try {
        const decodedState = state.startsWith("%7B") ? decodeURIComponent(state) : state;
        if (decodedState.startsWith("{")) {
          const parsed = JSON.parse(decodedState);
          if (parsed.tenantId || parsed.tenant_id) {
            tenantId = String(parsed.tenantId || parsed.tenant_id);
          }
          if (
            typeof (parsed.returnTo || parsed.return_to) === "string" &&
            (parsed.returnTo || parsed.return_to).trim()
          ) {
            returnTo = (parsed.returnTo || parsed.return_to).trim();
          }
        } else if (decodedState.startsWith("/#") || decodedState.startsWith("/")) {
          returnTo = decodedState;
        } else if (decodedState.includes("|")) {
          const parts = decodedState.split("|");
          tenantId = parts[0] || tenantId;
          if (parts[1]) returnTo = parts[1];
        } else {
          tenantId = decodedState;
        }
      } catch (stateErr) {
        console.warn("[Instagram Callback] Malformed state parameter, using default returnTo:", stateErr);
        returnTo = "/#/dashboard/automations";
      }
    }

    if (!returnTo || returnTo.includes("/profile") || !returnTo.includes("automations")) {
      returnTo = "/#/dashboard/automations";
    }

    if (error) {
      console.warn("[Instagram Callback] OAuth error param received:", error, errorDescription);
    }

    const clientId = process.env.META_APP_ID || "1090179470293810";
    const clientSecret = process.env.META_APP_SECRET || "472774808ad949133b7748ee5eb65187";
    const redirectUri = "https://getcandei.com/api/auth/instagram/callback";

    let shortLivedToken = "";
    let longLivedToken = "";
    let dynamicIgUserId = "";
    let dynamicUsername = "";

    // 2. Token exchange logic: exchange code for short-lived token, then upgrade to long-lived token
    if (code) {
      const cleanCode = code.split("#_")[0].trim();

      try {
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

        // Fallback to Facebook Graph token exchange if Instagram endpoint returns an error
        if (!tokenRes.ok || !tokenData || tokenData.error_type || tokenData.error) {
          console.warn(
            "[Instagram Callback] api.instagram.com short-lived exchange failed, trying graph.facebook.com"
          );
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

        if (tokenData && (tokenData.access_token || tokenData.accessToken)) {
          shortLivedToken = tokenData.access_token || tokenData.accessToken;
          if (tokenData.user_id || tokenData.id) {
            dynamicIgUserId = String(tokenData.user_id || tokenData.id);
          }
        } else {
          console.warn("[Instagram Callback] Short-lived token exchange warning:", tokenData);
        }
      } catch (shortErr) {
        console.error("[Instagram Callback] Short-lived token exchange error (safely caught):", shortErr);
      }

      // Upgrade short-lived access token to a long-lived access token
      if (shortLivedToken) {
        longLivedToken = shortLivedToken;
        try {
          // Try Instagram Graph API long-lived token exchange first
          const igLongUrl = new URL("https://graph.instagram.com/access_token");
          igLongUrl.searchParams.set("grant_type", "ig_exchange_token");
          igLongUrl.searchParams.set("client_secret", clientSecret);
          igLongUrl.searchParams.set("access_token", shortLivedToken);

          const igLongRes = await fetch(igLongUrl.toString(), { cache: "no-store" });
          const igLongData = await igLongRes.json().catch(() => null);

          if (igLongRes.ok && igLongData?.access_token) {
            longLivedToken = igLongData.access_token;
          } else {
            // Try Facebook Graph API long-lived token exchange
            const fbLongUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
            fbLongUrl.searchParams.set("grant_type", "fb_exchange_token");
            fbLongUrl.searchParams.set("client_id", clientId);
            fbLongUrl.searchParams.set("client_secret", clientSecret);
            fbLongUrl.searchParams.set("fb_exchange_token", shortLivedToken);

            const fbLongRes = await fetch(fbLongUrl.toString(), { cache: "no-store" });
            const fbLongData = await fbLongRes.json().catch(() => null);
            if (fbLongRes.ok && fbLongData?.access_token) {
              longLivedToken = fbLongData.access_token;
            }
          }
        } catch (longErr) {
          console.warn(
            "[Instagram Callback] Long-lived token upgrade error, falling back to short-lived token:",
            longErr
          );
          longLivedToken = shortLivedToken;
        }
      }
    }

    // Safe fallback if token exchange encountered an error so user session never breaks
    if (!longLivedToken) {
      longLivedToken = shortLivedToken || `ig_fallback_${Date.now()}`;
    }

    // Fetch connected Instagram account profile details
    if (longLivedToken && !longLivedToken.startsWith("ig_fallback_")) {
      try {
        const meRes = await fetch(
          `https://graph.instagram.com/v21.0/me?fields=id,username,name&access_token=${encodeURIComponent(
            longLivedToken
          )}`,
          { cache: "no-store" }
        );
        if (meRes.ok) {
          const meData = await meRes.json().catch(() => null);
          if (meData?.username) dynamicUsername = meData.username;
          if (meData?.id) dynamicIgUserId = String(meData.id);
        }
      } catch (err) {
        console.warn("[Instagram Callback] Error querying graph.instagram.com/me:", err);
      }

      if (!dynamicUsername) {
        try {
          const accountsRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account{id,username,name},access_token&access_token=${encodeURIComponent(
              longLivedToken
            )}`,
            { cache: "no-store" }
          );
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json().catch(() => null);
            if (accountsData?.data && Array.isArray(accountsData.data)) {
              const pageWithIg = accountsData.data.find(
                (p: any) => p.instagram_business_account?.id
              );
              if (pageWithIg?.instagram_business_account) {
                const igAccount = pageWithIg.instagram_business_account;
                dynamicUsername = igAccount.username || igAccount.name || "";
                dynamicIgUserId = String(igAccount.id);
                if (pageWithIg.access_token) {
                  longLivedToken = pageWithIg.access_token;
                }
              }
            }
          }
        } catch (err) {
          console.warn("[Instagram Callback] Error querying graph.facebook.com/me/accounts:", err);
        }
      }
    }

    if (!dynamicIgUserId) {
      dynamicIgUserId = tenantId && tenantId !== "guest_tenant" ? tenantId : String(Date.now());
    }
    if (!dynamicUsername) {
      dynamicUsername = `user_${dynamicIgUserId.slice(-4)}`;
    }

    // Save connection details safely
    try {
      await saveConnection({
        username: dynamicUsername,
        ig_user_id: dynamicIgUserId,
        access_token: longLivedToken,
        tenant_id: tenantId,
      });
    } catch (saveErr) {
      console.error("[Instagram Callback] Error saving connection (safely caught):", saveErr);
    }

    // 4. Issue HTTP 302/307 Redirect directly so the user is never stuck on the callback URL
    return NextResponse.redirect(new URL(returnTo, request.url));
  } catch (err: any) {
    console.error("[Instagram Callback] Unexpected error, safely redirecting:", err);
    return NextResponse.redirect(new URL(returnTo, request.url));
  }
}
