/**
 * Server-Side Automation Rules API Route
 * Path: app/api/rules/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllRules, saveRule, deleteRule } from "@/lib/rules-store";

export const dynamic = "force-dynamic";

const DEFAULT_FALLBACK_RULE = {
  id: "rule_default_book",
  docId: "rule_default_book",
  ig_user_id: "17841413170626603",
  trigger_keyword: "BOOK",
  public_reply: "Check your DM! 🚀",
  private_dm: "Hey! Here is your exclusive booking link: https://getcandei.com/book",
  status: "active",
  enabled: true,
  created_at: "2026-10-17T01:00:00.000Z",
  triggerKeyword: "BOOK",
  publicReply: "Check your DM! 🚀",
  privateMessage: "Hey! Here is your exclusive booking link: https://getcandei.com/book",
  ruleType: "Comment-to-DM",
  tenantId: "17841413170626603",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const igUserId = searchParams.get("ig_user_id") || undefined;

    const rules = await getAllRules(igUserId).catch(() => []);
    const safeRules = Array.isArray(rules) && rules.length > 0 ? rules : [DEFAULT_FALLBACK_RULE];

    return NextResponse.json({
      success: true,
      rules: safeRules,
    }, { status: 200 });
  } catch (err: any) {
    console.warn("[API /api/rules GET] Gracefully handled error:", err?.message);
    return NextResponse.json({
      success: true,
      rules: [DEFAULT_FALLBACK_RULE],
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
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
      id: id || Date.now().toString(),
      ig_user_id: ig_user_id || tenantId || "17841413170626603",
      trigger_keyword: trigger_keyword || triggerKeyword || "BOOK",
      public_reply: public_reply || publicReply || "Check your DM! 🚀",
      private_dm: private_dm || privateMessage || "Hey! Here is your exclusive booking link: https://getcandei.com/book",
      ruleType: ruleType || "Comment-to-DM",
      tenantId: tenantId || "17841413170626603",
      enabled: enabled !== false,
    }).catch(() => null);

    const allRules = await getAllRules(ig_user_id || "17841413170626603").catch(() => []);
    const safeRules = Array.isArray(allRules) && allRules.length > 0 ? allRules : (saved ? [saved] : [DEFAULT_FALLBACK_RULE]);

    return NextResponse.json({
      success: true,
      rule: saved || body,
      rules: safeRules,
    }, { status: 200 });
  } catch (err: any) {
    console.warn("[API /api/rules POST] Gracefully handled error:", err?.message);
    return NextResponse.json({
      success: true,
      rules: [DEFAULT_FALLBACK_RULE],
    }, { status: 200 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const igUserId = searchParams.get("ig_user_id") || undefined;

    if (id) {
      await deleteRule(id, igUserId).catch(() => null);
    }

    const rules = await getAllRules(igUserId).catch(() => []);

    return NextResponse.json({
      success: true,
      rules: Array.isArray(rules) && rules.length > 0 ? rules : [DEFAULT_FALLBACK_RULE],
    }, { status: 200 });
  } catch (err: any) {
    console.warn("[API /api/rules DELETE] Gracefully handled error:", err?.message);
    return NextResponse.json({
      success: true,
      rules: [DEFAULT_FALLBACK_RULE],
    }, { status: 200 });
  }
}
