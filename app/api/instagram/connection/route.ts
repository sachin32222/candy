/**
 * API Route for Instagram Connection Status
 * Path: app/api/instagram/connection/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getConnection, saveConnection } from "@/lib/connection-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenant_id") || searchParams.get("tenantId") || undefined;
    const userId = searchParams.get("user_id") || searchParams.get("ig_user_id") || undefined;

    const queryId = userId || tenantId || undefined;
    const record = await getConnection(queryId);

    if (record && record.connected) {
      return NextResponse.json({
        connected: true,
        username: record.username,
        ig_user_id: record.ig_user_id,
        user_id: record.ig_user_id,
      }, { status: 200 });
    }

    // Never return static dummy strings
    return NextResponse.json({
      connected: false,
      username: "",
      ig_user_id: "",
    }, { status: 200 });
  } catch (err: any) {
    console.warn("[API /api/instagram/connection GET] Error:", err?.message);
    return NextResponse.json({
      connected: false,
      username: "",
      ig_user_id: "",
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { username, ig_user_id, user_id, access_token, tenant_id } = body;

    if (!username && !ig_user_id && !user_id) {
      return NextResponse.json({
        connected: false,
        error: "Missing required fields",
      }, { status: 400 });
    }

    const saved = await saveConnection({
      username: username || "",
      ig_user_id: ig_user_id || user_id || "",
      access_token: access_token || "",
      tenant_id: tenant_id || "",
    });

    return NextResponse.json({
      success: true,
      connected: true,
      username: saved.username,
      ig_user_id: saved.ig_user_id,
    }, { status: 200 });
  } catch (err: any) {
    console.warn("[API /api/instagram/connection POST] Error:", err?.message);
    return NextResponse.json({
      connected: false,
      error: err?.message || "Failed to update connection",
    }, { status: 200 });
  }
}
