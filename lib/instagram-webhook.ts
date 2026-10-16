/**
 * Instagram Webhook Processing Engine
 * Path: lib/instagram-webhook.ts
 */

import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface RetrievedRule {
  trigger_keyword: string;
  public_comment_reply: string;
  private_dm_message: string;
}

export interface RetrievedConnection {
  accessToken: string;
  rules: RetrievedRule[];
}

/**
 * Fetch the user's connection & active rules from Firestore:
 * - Look up instagram_connections/{user_id}
 * - Query instagram_connections where instagram_business_id == user_id or user_id == user_id
 * - Query instagram_rules collection
 * - Retrieve access_token, trigger_keyword, public_comment_reply, and private_dm_message
 */
export async function getInstagramConnectionAndRules(userId: string): Promise<RetrievedConnection | null> {
  try {
    console.log(`[Meta Webhook] Looking up credentials and rules for user_id: ${userId}`);

    let accessToken = "";
    const rules: RetrievedRule[] = [];

    // Helper to extract rules from document data
    const extractRules = (data: any) => {
      if (!data) return;
      if (data.trigger_keyword || data.triggerKeyword) {
        rules.push({
          trigger_keyword: String(data.trigger_keyword || data.triggerKeyword || "").replace(/^["']|["']$/g, '').trim().toUpperCase(),
          public_comment_reply: String(data.public_comment_reply || data.publicReply || "Check your DM! 🚀"),
          private_dm_message: String(data.private_dm_message || data.privateMessage || "Hey! Here is your exclusive booking link: https://getcandei.com/book"),
        });
      }

      if (Array.isArray(data.automations)) {
        for (const auto of data.automations) {
          if (auto && auto.enabled !== false && (auto.triggerKeyword || auto.trigger_keyword)) {
            rules.push({
              trigger_keyword: String(auto.triggerKeyword || auto.trigger_keyword || "").replace(/^["']|["']$/g, '').trim().toUpperCase(),
              public_comment_reply: String(auto.publicReply || auto.public_comment_reply || "Check your DM! 🚀"),
              private_dm_message: String(auto.privateMessage || auto.private_dm_message || "Hey! Here is your exclusive booking link: https://getcandei.com/book"),
            });
          }
        }
      }
    };

    // 1. Direct doc lookup in instagram_connections/{userId}
    const docRef = doc(db, "instagram_connections", userId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      accessToken = data.access_token || data.accessToken || "";
      extractRules(data);
      console.log(`[Meta Webhook] Found doc in instagram_connections/${userId}:`, { hasToken: Boolean(accessToken), rulesCount: rules.length });
    }

    // 2. Query instagram_connections where user_id or instagram_business_id or instagram_user_id == userId
    if (!accessToken) {
      for (const fieldName of ["instagram_business_id", "user_id", "instagram_user_id"]) {
        const qConn = query(collection(db, "instagram_connections"), where(fieldName, "==", userId), limit(1));
        const snapQ = await getDocs(qConn);
        if (!snapQ.empty) {
          const data = snapQ.docs[0].data();
          accessToken = data.access_token || data.accessToken || "";
          extractRules(data);
          console.log(`[Meta Webhook] Found connection matching ${fieldName} == ${userId}`);
          break;
        }
      }
    }

    // 3. Query instagram_rules collection for any rules saved under this account
    try {
      const rulesDoc = await getDoc(doc(db, "instagram_rules", userId));
      if (rulesDoc.exists()) {
        extractRules(rulesDoc.data());
        console.log(`[Meta Webhook] Found rules in instagram_rules/${userId}`);
      } else {
        const qRules = query(collection(db, "instagram_rules"), where("user_id", "==", userId), limit(5));
        const snapRules = await getDocs(qRules);
        snapRules.forEach(d => extractRules(d.data()));
      }
    } catch (e) {
      console.warn("[Meta Webhook] instagram_rules query error (non-fatal):", e);
    }

    // 4. Fallback: Query users collection if still no access token
    if (!accessToken) {
      const qUser = query(collection(db, "users"), where("instagramAccountId", "==", userId), limit(1));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        const data = snapUser.docs[0].data();
        accessToken = data.pageAccessToken || data.igToken || data.access_token || "";
        extractRules(data);
      }
    }

    // 5. If connection exists but no custom rules configured, provide default "BOOK" rule
    if (rules.length === 0) {
      rules.push({
        trigger_keyword: "BOOK",
        public_comment_reply: "Check your DM! 🚀",
        private_dm_message: "Hey! Here is your exclusive booking link: https://getcandei.com/book",
      });
    }

    if (accessToken) {
      return { accessToken, rules };
    }

    // Fallback: check environment tokens if testing
    const fallbackToken = process.env.META_PAGE_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN || "";
    if (fallbackToken) {
      console.log(`[Meta Webhook] Using fallback environment token for account: ${userId}`);
      return { accessToken: fallbackToken, rules };
    }

    console.warn(`[Meta Webhook] No access_token found for user_id: ${userId}`);
    return null;
  } catch (err) {
    console.error("[Meta Webhook] Error fetching connection from Firestore:", err);
    return null;
  }
}

/**
 * Core event handler for incoming Meta webhooks
 */
export async function handleMetaIncomingEvent(payload: any): Promise<void> {
  if (!payload || !Array.isArray(payload.entry)) {
    console.log("[Meta Webhook] Payload has no valid 'entry' array. Skipping.");
    return;
  }

  for (const entry of payload.entry) {
    const userId = String(entry.id || entry.uid || "");
    console.log(`[Meta Webhook] Processing entry for Instagram Account (user_id): ${userId}`);

    const changes = Array.isArray(entry.changes) ? entry.changes : [];

    for (const change of changes) {
      const field = change?.field;
      console.log(`[Meta Webhook] Examining change field: '${field}' for user_id: ${userId}`);

      // Specifically listen for field === 'comments' or field === 'feed' (comments)
      if (field === "comments" || field === "feed") {
        const val = change.value;
        if (!val) {
          console.log("[Meta Webhook] Change has no value object. Skipping.");
          continue;
        }

        const commentId = String(val.id || val.comment_id || "");
        const rawText = String(val.text || val.message || "");
        
        // Strip outer quotes from incoming comment text and trim/uppercase for matching
        const commentText = rawText.replace(/^["']|["']$/g, '').trim().toUpperCase();

        const commenterUsername = val.from?.username || val.from?.name || "unknown_user";
        const commenterId = val.from?.id || "unknown_id";

        console.log(`[Meta Webhook] Detected comment event on account ${userId}:`, {
          commentId,
          rawText,
          commentText,
          commenterUsername,
          commenterId,
        });

        if (!commentId || !commentText) {
          console.warn("[Meta Webhook] Missing commentId or commentText in payload. Skipping.");
          continue;
        }

        // Fetch connection & active rules from Firestore
        const connection = await getInstagramConnectionAndRules(userId);

        if (!connection || !connection.accessToken) {
          console.warn(`[Meta Webhook] No active Instagram connection or access_token found for account: ${userId}`);
          continue;
        }

        const { accessToken, rules } = connection;
        console.log(`[Meta Webhook] Loaded ${rules.length} rule(s) for account ${userId}:`, rules);

        // Find a matching rule for the comment text
        let matchedRule: RetrievedRule | null = null;
        for (const rule of rules) {
          const kw = rule.trigger_keyword ? rule.trigger_keyword.replace(/^["']|["']$/g, '').trim().toUpperCase() : "";
          if (!kw) continue;

          // Check if comment text includes or matches trigger keyword (e.g. "BOOK")
          if (commentText.includes(kw) || commentText === kw) {
            matchedRule = rule;
            console.log(`[Meta Webhook] Keyword matched! Rule keyword "${kw}" detected in comment "${commentText}"`);
            break;
          }
        }

        if (!matchedRule) {
          console.log(`[Meta Webhook] No rule keyword matched in comment: "${commentText}" for account: ${userId}`);
          continue;
        }

        console.log(`[Meta Webhook] Executing Comment-to-DM automated replies for comment ${commentId}:`, matchedRule);

        // a) Public Reply:
        // POST https://graph.instagram.com/v21.0/${comment_id}/replies
        const publicReplyText = matchedRule.public_comment_reply || "Check your DM! 🚀";
        try {
          console.log(`[Meta Webhook] (a) Sending Public Comment Reply to comment ${commentId}: "${publicReplyText}"`);
          let replyRes = await fetch(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: publicReplyText }),
          });

          if (!replyRes.ok) {
            const errData = await replyRes.json().catch(() => null);
            console.warn(`[Meta Webhook] graph.instagram.com failed, trying graph.facebook.com:`, errData);
            replyRes = await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ message: publicReplyText }),
            });
          }

          const replyJson = await replyRes.json().catch(() => null);
          console.log(`[Meta Webhook] Public reply response:`, {
            status: replyRes.status,
            ok: replyRes.ok,
            data: replyJson,
          });
        } catch (err) {
          console.error(`[Meta Webhook] Failed to send public reply to ${commentId}:`, err);
        }

        // b) Private DM Reply:
        // POST https://graph.instagram.com/v21.0/${user_id}/messages
        // Body: { recipient: { comment_id: comment_id }, message: { text: rule.private_dm_message } }
        const privateMessageText = matchedRule.private_dm_message || "Hey! Here is your exclusive booking link: https://getcandei.com/book";
        try {
          console.log(`[Meta Webhook] (b) Sending Private DM Reply for comment ${commentId} via account ${userId}: "${privateMessageText}"`);
          let dmRes = await fetch(`https://graph.instagram.com/v21.0/${userId}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              recipient: { comment_id: commentId },
              message: { text: privateMessageText },
            }),
          });

          if (!dmRes.ok) {
            const errData = await dmRes.json().catch(() => null);
            console.warn(`[Meta Webhook] graph.instagram.com DM failed, trying graph.facebook.com:`, errData);
            dmRes = await fetch(`https://graph.facebook.com/v21.0/${userId}/messages`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                recipient: { comment_id: commentId },
                message: { text: privateMessageText },
              }),
            });
          }

          const dmJson = await dmRes.json().catch(() => null);
          console.log(`[Meta Webhook] Private DM reply response:`, {
            status: dmRes.status,
            ok: dmRes.ok,
            data: dmJson,
          });
        } catch (err) {
          console.error(`[Meta Webhook] Failed to send private DM for comment ${commentId}:`, err);
        }
      }
    }
  }
}
