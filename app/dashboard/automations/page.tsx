'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Instagram, MessageCircle, MessageSquare, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

function AutomationContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const userId = searchParams.get('user_id');
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const isConnected = status === 'connected' || Boolean(userId);

  const [dmReplyActive, setDmReplyActive] = useState(true);
  const [commentResponseActive, setCommentResponseActive] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (userId && status === 'connected') {
      const syncToFirestore = async () => {
        try {
          const payload: any = {
            instagram_user_id: userId,
            status: "connected",
            updated_at: new Date(),
          };
          if (token) {
            payload.access_token = token;
          }
          await setDoc(doc(db, "instagram_connections", userId), payload, { merge: true });
          setSynced(true);
          console.log("[Automations] Successfully synced instagram connection to Firestore for:", userId);
        } catch (err) {
          console.warn("[Automations] Failed to sync connection to Firestore:", err);
        }
      };
      syncToFirestore();
    }
  }, [userId, status, token]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 font-sans selection:bg-[#4A6DE1]/30">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Candei Automations
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Instagram AI
                </span>
              </h1>
              <p className="text-sm text-neutral-400">Manage real-time DM & comment trigger automations</p>
            </div>
          </div>
        </div>

        {/* Status Banners */}
        {status === 'connected' && (
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold">Instagram Connected Successfully!</p>
              <p className="text-xs text-emerald-400/80">
                {synced ? 'Connection saved in Firestore.' : 'Connection confirmed.'}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="font-semibold">Connection Error</p>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
          </div>
        )}

        {/* Account Status Card */}
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                Account Status
              </h2>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-600'}`} />
                <span className="text-lg font-semibold text-white">
                  {isConnected ? 'Connected' : 'Not Connected'}
                </span>
                {userId && (
                  <span className="text-xs text-neutral-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5 font-mono">
                    User ID: {userId}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-medium">
                Live Webhooks Active
              </span>
            </div>
          </div>
        </div>

        {/* Automations Active Toggles */}
        <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4A6DE1]" />
                Automations Active Toggle
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Configure live automated responses for incoming interactions</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Auto-Reply to Instagram DMs */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Auto-Reply to Instagram DMs</h3>
                  <p className="text-xs text-neutral-400">Instantly send custom gallery links and info when leads message you</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={dmReplyActive}
                onClick={() => setDmReplyActive(!dmReplyActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  dmReplyActive ? 'bg-[#4A6DE1]' : 'bg-neutral-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    dmReplyActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto-Reply to Comments */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Auto-Reply to Comments</h3>
                  <p className="text-xs text-neutral-400">Publicly reply to reel/post comments and trigger a private DM delivery</p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={commentResponseActive}
                onClick={() => setCommentResponseActive(!commentResponseActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  commentResponseActive ? 'bg-[#4A6DE1]' : 'bg-neutral-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    commentResponseActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AutomationContent />
    </Suspense>
  );
}
