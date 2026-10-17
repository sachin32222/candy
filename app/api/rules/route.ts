/**
 * Server-Side Automation Rules API Route
 * Path: app/api/rules/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllRules, saveRule, deleteRule } from "@/lib/rules-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const igUserId = searchParams.get("ig_user_id") || undefined;

    const rules = await getAllRules(igUserId);
    console.log(`[API /api/rules GET] Returning ${rules.length} rule(s) for user: ${igUserId || "all"}`);

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (err: any) {
    console.error("[API /api/rules GET] Error fetching rules:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch rules", rules: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[API /api/rules POST] Received payload:", body);

    const {
      id,
      ig_user_id,
      trigger_keyword,
      public_reply,
      private_dm,
      triggerKeyword,
      publicReply,
      privateMessage,
      ruleType,
      tenantId,
      enabled,
    } = body;

    const saved = await saveRule({
      id,
      ig_user_id: ig_user_id || tenantId,
      trigger_keyword: trigger_keyword || triggerKeyword,
      public_reply: public_reply || publicReply,
      private_dm: private_dm || privateMessage,
      ruleType,
      tenantId,
      enabled,
    });

    const allRules = await getAllRules(saved.ig_user_id);

    console.log(`[API /api/rules POST] Successfully saved rule:`, saved.id);

    return NextResponse.json({
      success: true,
      rule: saved,
      rules: allRules,
    });
  } catch (err: any) {
    console.error("[API /api/rules POST] Error saving rule:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const igUserId = searchParams.get("ig_user_id") || undefined;

    if (!id) {
      return NextResponse.json({ success: false, error: "Rule ID is required" }, { status: 400 });
    }

    await deleteRule(id, igUserId);
    const rules = await getAllRules(igUserId);

    return NextResponse.json({
      success: true,
      rules,
    });
  } catch (err: any) {
    console.error("[API /api/rules DELETE] Error deleting rule:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete rule" },
      { status: 500 }
    );
  }
}
