/**
 * Instagram Connection Store for Persistent Account Resolution
 * Rely strictly on Firestore `instagram_connections` collection with in-memory Map fallback.
 * Path: lib/connection-store.ts
 */

import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface InstagramConnectionRecord {
  connected: boolean;
  username: string;
  ig_user_id: string;
  user_id?: string;
  access_token?: string;
  status?: string;
  updated_at?: string;
}

const DEFAULT_IG_USER_ID = "17841413170626603";

// In-memory store fallback for serverless environments
const memoryConnections = new Map<string, InstagramConnectionRecord>();

export function readConnectionsFromDisk(): Record<string, InstagramConnectionRecord> {
  const result: Record<string, InstagramConnectionRecord> = {};
  memoryConnections.forEach((val, key) => {
    result[key] = val;
  });
  return result;
}

export function writeConnectionsToDisk(connections: Record<string, InstagramConnectionRecord>): void {
  Object.entries(connections).forEach(([key, val]) => {
    memoryConnections.set(key, val);
  });
}

export async function saveConnection(conn: {
  username: string;
  ig_user_id: string;
  access_token?: string;
  tenant_id?: string;
}): Promise<InstagramConnectionRecord> {
  const igUserId = conn.ig_user_id || DEFAULT_IG_USER_ID;
  const record: InstagramConnectionRecord = {
    connected: true,
    username: conn.username,
    ig_user_id: igUserId,
    user_id: igUserId,
    access_token: conn.access_token || "",
    status: "connected",
    updated_at: new Date().toISOString(),
  };

  // 1. Save to in-memory map fallback
  memoryConnections.set(igUserId, record);
  memoryConnections.set("latest", record);
  if (conn.tenant_id) {
    memoryConnections.set(conn.tenant_id, record);
  }

  // 2. Persist to Firestore `instagram_connections` collection
  try {
    await setDoc(
      doc(db, "instagram_connections", igUserId),
      {
        ...record,
        updated_at: new Date(),
      },
      { merge: true }
    );

    if (conn.tenant_id && conn.tenant_id !== igUserId) {
      await setDoc(
        doc(db, "instagram_connections", conn.tenant_id),
        {
          ...record,
          updated_at: new Date(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn("[Connection Store] Firestore write fallback to memory:", err);
  }

  return record;
}

export async function getConnection(queryId?: string): Promise<InstagramConnectionRecord | null> {
  // 1. Check Firestore collection `instagram_connections` first
  try {
    if (queryId) {
      const snap = await getDoc(doc(db, "instagram_connections", queryId));
      if (snap.exists()) {
        const d = snap.data();
        const username = d.username || d.instagram_username || d.instagramUsername || "";
        const ig_user_id = d.ig_user_id || d.user_id || d.instagramAccountId || queryId;
        if (username || ig_user_id) {
          const rec: InstagramConnectionRecord = {
            connected: true,
            username,
            ig_user_id,
            user_id: ig_user_id,
            access_token: d.access_token || "",
            status: d.status || "connected",
            updated_at: d.updated_at ? String(d.updated_at) : new Date().toISOString(),
          };
          memoryConnections.set(ig_user_id, rec);
          memoryConnections.set("latest", rec);
          return rec;
        }
      }
    }

    const snapAll = await getDocs(collection(db, "instagram_connections"));
    if (!snapAll.empty) {
      for (const d of snapAll.docs) {
        const data = d.data();
        const username = data.username || data.instagram_username || data.instagramUsername || "";
        const ig_user_id = data.ig_user_id || data.user_id || data.instagramAccountId || d.id;
        if (username || ig_user_id) {
          const rec: InstagramConnectionRecord = {
            connected: true,
            username,
            ig_user_id,
            user_id: ig_user_id,
            access_token: data.access_token || "",
            status: data.status || "connected",
            updated_at: data.updated_at ? String(data.updated_at) : new Date().toISOString(),
          };
          memoryConnections.set(ig_user_id, rec);
          memoryConnections.set("latest", rec);
          return rec;
        }
      }
    }
  } catch (err) {
    console.warn("[Connection Store] Firestore read fallback to memory:", err);
  }

  // 2. Fallback to in-memory map
  if (queryId && memoryConnections.has(queryId)) {
    const found = memoryConnections.get(queryId);
    if (found?.connected) return found;
  }
  const latest = memoryConnections.get("latest");
  if (latest?.connected) return latest;

  return null;
}
