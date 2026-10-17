/**
 * Instagram Connection Store for Persistent Account Resolution
 * Path: lib/connection-store.ts
 */

import fs from "fs";
import path from "path";
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

function getConnectionCandidatePaths(): string[] {
  const root = fs.existsSync("/app/applet") ? "/app/applet" : process.cwd();
  return [
    path.join(root, "data", "instagram_connections.json"),
    path.join(process.cwd(), "data", "instagram_connections.json"),
    path.join("/tmp", "instagram_connections.json"),
  ];
}

export function readConnectionsFromDisk(): Record<string, InstagramConnectionRecord> {
  for (const p of getConnectionCandidatePaths()) {
    try {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === "object") {
          return parsed;
        }
      }
    } catch (_) {}
  }
  return {};
}

export function writeConnectionsToDisk(connections: Record<string, InstagramConnectionRecord>): void {
  for (const p of getConnectionCandidatePaths()) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, JSON.stringify(connections, null, 2), "utf-8");
    } catch (_) {}
  }
}

export async function saveConnection(conn: {
  username: string;
  ig_user_id: string;
  access_token?: string;
  tenant_id?: string;
}): Promise<InstagramConnectionRecord> {
  const record: InstagramConnectionRecord = {
    connected: true,
    username: conn.username,
    ig_user_id: conn.ig_user_id,
    user_id: conn.ig_user_id,
    access_token: conn.access_token || "",
    status: "connected",
    updated_at: new Date().toISOString(),
  };

  // 1. Persist to disk
  const all = readConnectionsFromDisk();
  all[conn.ig_user_id] = record;
  all["latest"] = record;
  if (conn.tenant_id) {
    all[conn.tenant_id] = record;
  }
  writeConnectionsToDisk(all);

  // 2. Persist to Firestore if available
  try {
    await setDoc(doc(db, "instagram_connections", conn.ig_user_id), {
      ...record,
      updated_at: new Date(),
    }, { merge: true });

    if (conn.tenant_id && conn.tenant_id !== conn.ig_user_id) {
      await setDoc(doc(db, "instagram_connections", conn.tenant_id), {
        ...record,
        updated_at: new Date(),
      }, { merge: true });
    }
  } catch (_) {
    // Silently fall back to persistent disk storage
  }

  return record;
}

export async function getConnection(queryId?: string): Promise<InstagramConnectionRecord | null> {
  // 1. Check disk records first
  const all = readConnectionsFromDisk();
  if (queryId && all[queryId] && all[queryId].connected) {
    return all[queryId];
  }
  if (all["latest"] && all["latest"].connected) {
    return all["latest"];
  }
  const keys = Object.keys(all).filter(k => k !== "latest");
  if (keys.length > 0 && all[keys[0]].connected) {
    return all[keys[0]];
  }

  // 2. Check Firestore collection instagram_connections
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
          saveConnection(rec);
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
          saveConnection(rec);
          return rec;
        }
      }
    }
  } catch (_) {
    // Silently fall back
  }

  return null;
}
