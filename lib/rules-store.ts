/**
 * Server-Side Rules Store with Firestore & In-Memory Map Fallback
 * Rely strictly on Firestore `instagram_rules` collection for persistent state.
 * Path: lib/rules-store.ts
 */

import { doc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const DEFAULT_IG_USER_ID = "17841413170626603";

export interface AutomationRuleItem {
  id: string;
  docId: string;
  ig_user_id: string;
  trigger_keyword: string;
  public_reply: string;
  private_dm: string;
  status: string;
  enabled: boolean;
  created_at: string;
  // UI compatibility aliases
  triggerKeyword: string;
  publicReply: string;
  privateMessage: string;
  ruleType: string;
  tenantId: string;
}

function getDefaultRules(): AutomationRuleItem[] {
  return [
    {
      id: "rule_default_book",
      docId: "rule_default_book",
      ig_user_id: DEFAULT_IG_USER_ID,
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
      tenantId: DEFAULT_IG_USER_ID,
    },
  ];
}

// In-memory map fallback initialized with default rule
const memoryRules = new Map<string, AutomationRuleItem>(
  getDefaultRules().map((r) => [r.id, r])
);

export async function saveRule(input: any): Promise<AutomationRuleItem> {
  const kw = (input.trigger_keyword || input.triggerKeyword || "")
    .replace(/^["']|["']$/g, "")
    .trim()
    .toUpperCase();
  const pub = (input.public_reply || input.publicReply || "Check your DM! 🚀").trim();
  const priv = (
    input.private_dm ||
    input.privateMessage ||
    "Hey! Here is your exclusive booking link: https://getcandei.com/book"
  ).trim();
  const userId = String(input.ig_user_id || input.tenantId || DEFAULT_IG_USER_ID);
  const ruleId = String(input.id || input.docId || `rule_${Date.now()}`);
  const status = input.status || (input.enabled === false ? "paused" : "active");
  const enabled = input.enabled !== false && status !== "paused";

  const ruleItem: AutomationRuleItem = {
    id: ruleId,
    docId: ruleId,
    ig_user_id: userId,
    trigger_keyword: kw,
    public_reply: pub,
    private_dm: priv,
    status,
    enabled,
    created_at: input.created_at || new Date().toISOString(),
    triggerKeyword: kw,
    publicReply: pub,
    privateMessage: priv,
    ruleType: input.ruleType || "Comment-to-DM",
    tenantId: userId,
  };

  // 1. Update in-memory map fallback
  memoryRules.set(ruleId, ruleItem);

  // 2. Persist to Firestore `instagram_rules` collection
  try {
    await setDoc(
      doc(db, "instagram_rules", ruleId),
      {
        ...ruleItem,
        updated_at: new Date(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[Rules Store] Firestore write fallback to memory:", err);
  }

  return ruleItem;
}

export async function getAllRules(igUserId?: string): Promise<AutomationRuleItem[]> {
  // 1. Attempt to read from Firestore `instagram_rules` collection
  try {
    const snap = await getDocs(collection(db, "instagram_rules"));
    snap.forEach((d) => {
      const data = d.data() as any;
      const kw = (data.trigger_keyword || data.triggerKeyword || "")
        .replace(/^["']|["']$/g, "")
        .trim()
        .toUpperCase();
      const pub = (data.public_reply || data.publicReply || "Check your DM! 🚀").trim();
      const priv = (data.private_dm || data.privateMessage || "").trim();
      const rawUserId = String(data.ig_user_id || data.tenantId || DEFAULT_IG_USER_ID);
      const userId =
        rawUserId === "39530882969891710" ? DEFAULT_IG_USER_ID : rawUserId;
      const status = data.status || (data.enabled === false ? "paused" : "active");

      if (kw) {
        const item: AutomationRuleItem = {
          id: d.id,
          docId: d.id,
          ig_user_id: userId,
          trigger_keyword: kw,
          public_reply: pub,
          private_dm: priv,
          status,
          enabled: data.enabled !== false && status !== "paused",
          created_at: data.created_at || new Date().toISOString(),
          triggerKeyword: kw,
          publicReply: pub,
          privateMessage: priv,
          ruleType: data.ruleType || "Comment-to-DM",
          tenantId: userId,
        };
        memoryRules.set(d.id, item);
      }
    });
  } catch (err) {
    console.warn("[Rules Store] Firestore read fallback to memory:", err);
  }

  if (memoryRules.size === 0) {
    getDefaultRules().forEach((r) => memoryRules.set(r.id, r));
  }

  const allRules = Array.from(memoryRules.values());

  if (igUserId) {
    const filtered = allRules.filter(
      (r) => r.ig_user_id === igUserId || r.ig_user_id === DEFAULT_IG_USER_ID
    );
    return filtered.length > 0 ? filtered : allRules;
  }
  return allRules;
}

export async function deleteRule(ruleId: string, _igUserId?: string): Promise<boolean> {
  memoryRules.delete(ruleId);

  try {
    await deleteDoc(doc(db, "instagram_rules", ruleId));
  } catch (e) {
    console.warn(`[Rules Store] Firestore delete notice:`, e);
  }
  return true;
}

export async function findMatchingRule(
  commentText: string,
  igUserId?: string
): Promise<AutomationRuleItem | null> {
  const sanitized = commentText.replace(/^["']|["']$/g, "").trim().toUpperCase();
  const rules = await getAllRules(igUserId);

  for (const rule of rules) {
    if (!rule.enabled) continue;
    const kw = rule.trigger_keyword.replace(/^["']|["']$/g, "").trim().toUpperCase();
    if (kw && (sanitized.includes(kw) || sanitized === kw)) {
      return rule;
    }
  }

  if (sanitized.includes("BOOK")) {
    return rules[0] || null;
  }

  return null;
}
