import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state") || "reviewer_meta_tenant_2026";
    const error = url.searchParams.get("error");
    const errorReason = url.searchParams.get("error_reason");
    const errorDescription = url.searchParams.get("error_description");

    if (error || !code) {
      console.error("[Instagram Callback] OAuth Error:", { error, errorReason, errorDescription });
      return NextResponse.redirect(
        new URL(`/dashboard/automations?error=${encodeURIComponent(errorDescription || error || "access_denied")}`, request.url)
      );
    }

    // Clean up code (Meta appends #_ at the end)
    const cleanCode = code.split("#_")[0].trim();

    const clientId = process.env.META_APP_ID || process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || "1090179470293810";
    const clientSecret = process.env.META_APP_SECRET;

    if (!clientSecret) {
      console.error("[Instagram Callback] Missing META_APP_SECRET");
      return NextResponse.redirect(
        new URL("/dashboard/automations?error=missing_meta_app_secret_in_vercel", request.url)
      );
    }

    // Important: Determine the exact origin user came from (www vs non-www)
    const host = request.headers.get("host") || "getcandei.com";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const dynamicRedirectUri = `${protocol}://${host}/api/auth/instagram/callback`;
    const staticRedirectUri = process.env.META_REDIRECT_URI || "https://getcandei.com/api/auth/instagram/callback";

    // Prepare Instagram token exchange (Form data as required by api.instagram.com)
    const formData = new URLSearchParams();
    formData.append("client_id", clientId);
    formData.append("client_secret", clientSecret);
    formData.append("grant_type", "authorization_code");
    // Use dynamic redirect uri if host has www, else static
    formData.append("redirect_uri", host.includes("www") ? dynamicRedirectUri : staticRedirectUri);
    formData.append("code", cleanCode);

    const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const tokenData = await tokenRes.json().catch(() => ({}));

    if (!tokenRes.ok || tokenData.error_type || tokenData.error) {
      console.error("[Instagram Callback] Token exchange failed:", tokenData);
      const msg = tokenData.error_message || tokenData.error?.message || "token_exchange_failed";
      return NextResponse.redirect(
        new URL(`/dashboard/automations?error=${encodeURIComponent(msg)}`, request.url)
      );
    }

    const { access_token, user_id } = tokenData;
    console.log("[Instagram Callback] Success! User ID:", user_id);

    // Redirect to dashboard with connected flag
    return NextResponse.redirect(
      new URL(`/dashboard/automations?status=connected&user_id=${user_id || ""}`, request.url)
    );
  } catch (err: any) {
    console.error("[Instagram Callback] Fatal Exception:", err);
    return NextResponse.redirect(
      new URL(`/dashboard/automations?error=${encodeURIComponent(err.message || "server_error")}`, request.url)
    );
  }
}
