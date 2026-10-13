import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error || !code) {
      console.error("[Instagram Callback] OAuth Error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard/automations?error=${encodeURIComponent(errorDescription || error || "access_denied")}`, request.url)
      );
    }

    const cleanCode = code.split("#_")[0].trim();
    const clientId = process.env.META_APP_ID || "1090179470293810";
    const clientSecret = process.env.META_APP_SECRET || "472774808ad949133b7748ee5eb65187";

    const host = request.headers.get("host") || "getcandei.com";
    const origin = host.includes("www") ? "https://www.getcandei.com" : "https://getcandei.com";
    const redirectUri = `${origin}/api/auth/instagram/callback`;

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

    const tokenData = await tokenRes.json().catch(() => null);

    if (!tokenRes.ok || !tokenData || tokenData.error_type || tokenData.error) {
      console.error("[Instagram Callback] Token exchange failed:", tokenData);
      const msg = tokenData?.error_message || tokenData?.error?.message || "token_exchange_failed";
      return NextResponse.redirect(
        new URL(`/dashboard/automations?error=${encodeURIComponent(msg)}`, request.url)
      );
    }

    const { user_id } = tokenData;
    console.log("[Instagram Callback] Connected user_id:", user_id);

    return NextResponse.redirect(
      new URL(`/dashboard/automations?status=connected&user_id=${user_id || ""}`, request.url)
    );
  } catch (err: any) {
    console.error("[Instagram Callback] Fatal Error:", err);
    return NextResponse.redirect(
      new URL(`/dashboard/automations?error=${encodeURIComponent(err?.message || "server_error")}`, request.url)
    );
  }
}
