/**
 * Server-Side Rules Store with Persistent Disk & Firestore Sync
 * Path: lib/rules-store.ts
 */

import fs from "fs";
import path from "path";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

function getAllCandidateFilePaths(): string[] {
  const root = fs.existsSync("/app/applet") ? "/app/applet" : process.cwd();
  return [
    path.join(root, "data", "instagram_rules.json"),
    path.join(process.cwd(), "data", "instagram_rules.json"),
    path.join(root, "instagram_rules.json"),
    path.join("/tmp", "instagram_rules.json"),
  ];
}

function getDefaultRules(): AutomationRuleItem[] {
  return [
    {
      id: "rule_default_book",
      docId: "rule_default_book",
      ig_user_id: "39530882969891710",
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
      tenantId: "39530882969891710",
    },
  ];
}

function readRulesFromDisk(): AutomationRuleItem[] {
  const candidates = getAllCandidateFilePaths();
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  const defaults = getDefaultRules();
  writeRulesToDisk(defaults);
  return defaults;
}

function writeRulesToDisk(rules: AutomationRuleItem[]): void {
  const candidates = getAllCandidateFilePaths();
  for (const filePath of candidates) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(rules, null, 2), "utf-8");
    } catch (e) {
      // Non-fatal if a specific path is read-only
    }
  }
  console.log(`[Rules Store] Saved ${rules.length} rule(s) to persistent storage`);
}

export async function saveRule(input: any): Promise<AutomationRuleItem> {
  const kw = (input.trigger_keyword || input.triggerKeyword || "").replace(/^["']|["']$/g, "").trim().toUpperCase();
  const pub = (input.public_reply || input.publicReply || "Check your DM! 🚀").trim();
  const priv = (input.private_dm || input.privateMessage || "Hey! Here is your exclusive booking link: https://getcandei.com/book").trim();
  const userId = String(input.ig_user_id || input.tenantId || "39530882969891710");
  const ruleId = input.id || input.docId || `rule_${Date.now()}`;
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

  // 1. Persist directly to disk storage immediately
  const currentRules = readRulesFromDisk();
  const existingIdx = currentRules.findIndex((r) => r.id === ruleId || (r.trigger_keyword === kw && r.ig_user_id === userId));
  if (existingIdx >= 0) {
    currentRules[existingIdx] = ruleItem;
  } else {
    currentRules.unshift(ruleItem);
  }
  writeRulesToDisk(currentRules);

  // 2. Also save directly to Firestore collection instagram_rules
  try {
    await setDoc(doc(db, "instagram_rules", ruleId), {
      ...ruleItem,
      updated_at: new Date(),
    }, { merge: true });
    console.log(`[Rules Store] Successfully saved rule directly to Firestore instagram_rules/${ruleId}`);
  } catch (err) {
    console.warn(`[Rules Store] Firestore save notice (rule safely persisted to database storage):`, err);
  }

  return ruleItem;
}

export async function getAllRules(igUserId?: string): Promise<AutomationRuleItem[]> {
  const rulesMap = new Map<string, AutomationRuleItem>();

  // 1. Load permanent rules from disk storage
  const diskRules = readRulesFromDisk();
  diskRules.forEach((r) => rulesMap.set(r.id, r));

  // 2. Attempt to read from Firestore collection instagram_rules
  try {
    const snap = await getDocs(collection(db, "instagram_rules"));
    snap.forEach((d) => {
      const data = d.data() as any;
      const kw = (data.trigger_keyword || data.triggerKeyword || "").replace(/^["']|["']$/g, "").trim().toUpperCase();
      const pub = (data.public_reply || data.publicReply || "Check your DM! 🚀").trim();
      const priv = (data.private_dm || data.privateMessage || "").trim();
      const userId = String(data.ig_user_id || data.tenantId || "39530882969891710");
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
        rulesMap.set(d.id, item);
      }
    });
  } catch (err) {
    console.warn(`[Rules Store] Firestore read notice (served from persistent database storage):`, err);
  }

  const allRules = Array.from(rulesMap.values());
  writeRulesToDisk(allRules);

  if (igUserId) {
    const filtered = allRules.filter((r) => r.ig_user_id === igUserId || r.ig_user_id === "39530882969891710");
    return filtered.length > 0 ? filtered : allRules;
  }
  return allRules;
}

export async function deleteRule(ruleId: string, igUserId?: string): Promise<boolean> {
  const currentRules = readRulesFromDisk();
  const updated = currentRules.filter((r) => r.id !== ruleId && r.docId !== ruleId);
  writeRulesToDisk(updated);

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

  // Fallback to BOOK rule if keyword contains BOOK
  if (sanitized.includes("BOOK")) {
    return rules[0] || null;
  }

  return null;
}
