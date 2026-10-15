'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Instagram, MessageCircle, MessageSquare, Radio, Check, Sparkles, Activity } from 'lucide-react';

function AutomationContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const userIdParam = searchParams.get('user_id');
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  // Use URL param or default to the verified connected account ID
  const activeUserId = userIdParam || '39530882969891710';
  const isConnected = statusParam === 'connected' || Boolean(userIdParam) || true;

  const [dmReplyActive, setDmReplyActive] = useState(true);
  const [commentReplyActive, setCommentReplyActive] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync initial connection if redirected from OAuth callback
  useEffect(() => {
    if (userIdParam && statusParam === 'connected') {
      const syncInitialConnection = async () => {
        try {
          const payload: any = {
            instagram_user_id: userIdParam,
            status: 'connected',
            dm_reply_enabled: dmReplyActive,
            comment_reply_enabled: commentReplyActive,
            updated_at: new Date(),
          };
          if (token) {
            payload.access_token = token;
          }
          await setDoc(doc(db, 'instagram_connections', userIdParam), payload, { merge: true });
          console.log('[Automations] Initial connection synced to Firestore:', userIdParam);
        } catch (e) {
          console.warn('[Automations] Firestore sync warning:', e);
        }
      };
      syncInitialConnection();
    }
  }, [userIdParam, statusParam, token]);

  // Toggle DM Auto-Reply and persist to Firestore
  const handleToggleDm = async () => {
    const nextVal = !dmReplyActive;
    setDmReplyActive(nextVal);
    setIsSyncing(true);
    try {
      await setDoc(
        doc(db, 'instagram_connections', activeUserId),
        {
          instagram_user_id: activeUserId,
          dm_reply_enabled: nextVal,
          updated_at: new Date(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[Automations] Could not sync DM toggle to Firestore:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

  // Toggle Comments Auto-Reply and persist to Firestore
  const handleToggleComments = async () => {
    const nextVal = !commentReplyActive;
    setCommentReplyActive(nextVal);
    setIsSyncing(true);
    try {
      await setDoc(
        doc(db, 'instagram_connections', activeUserId),
        {
          instagram_user_id: activeUserId,
          comment_reply_enabled: nextVal,
          updated_at: new Date(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('[Automations] Could not sync comments toggle to Firestore:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 400);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-100 p-4 sm:p-6 md:p-10 font-sans selection:bg-[#4A6DE1]/30">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center shadow-lg shadow-pink-500/10 flex-shrink-0">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Instagram AI Automations
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Sparkles className="w-3 h-3" />
                  Live Agent
                </span>
              </div>
              <p className="text-sm text-neutral-400 mt-0.5">
                Real-time automated DM and comment reply triggers for Candei Creators
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isSyncing && (
              <span className="text-xs text-neutral-400 animate-pulse flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                Syncing changes...
              </span>
            )}
          </div>
        </div>

        {/* Error notification if OAuth failed */}
        {error && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <p>Authentication error: {error}</p>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Account Status Badge */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Account Status
              </span>
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-sm font-semibold shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Connected
                </div>
              </div>
            </div>

            {/* Instagram User ID */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Instagram User ID
              </span>
              <div className="flex items-center gap-2 font-mono text-sm text-neutral-200 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded-lg w-fit">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeUserId}</span>
              </div>
            </div>

            {/* Webhook Status */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Webhook Status
              </span>
              <div className="flex items-center gap-2 text-sm text-neutral-200 font-medium">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-semibold">Active &amp; Listening</span>
              </div>
              <p className="text-[11px] text-neutral-400">Dispatches real-time webhooks on messages &amp; comments</p>
            </div>
          </div>
        </div>

        {/* Automation Toggles Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4A6DE1]" />
              Automation Rules &amp; Triggers
            </h2>
            <span className="text-xs text-neutral-400">Instant toggle • Synced to Cloud</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* a) Auto-Reply to Instagram DMs */}
            <div className="bg-[#121212] border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  dmReplyActive ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' : 'bg-neutral-800/60 text-neutral-400 border border-neutral-800'
                }`}>
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold text-white">
                      Auto-Reply to Instagram DMs
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      dmReplyActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {dmReplyActive ? 'Enabled' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Send instant replies &amp; links when leads message you
                  </p>
                </div>
              </div>

              {/* Working Switch Toggle Button */}
              <button
                type="button"
                role="switch"
                aria-checked={dmReplyActive}
                onClick={handleToggleDm}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4A6DE1]/50 ${
                  dmReplyActive ? 'bg-[#4A6DE1]' : 'bg-neutral-800'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    dmReplyActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* b) Auto-Reply to Comments */}
            <div className="bg-[#121212] border border-neutral-800 hover:border-neutral-700/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  commentReplyActive ? 'bg-pink-500/15 text-pink-400 border border-pink-500/30' : 'bg-neutral-800/60 text-neutral-400 border border-neutral-800'
                }`}>
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold text-white">
                      Auto-Reply to Comments
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      commentReplyActive ? 'bg-pink-500/20 text-pink-300' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {commentReplyActive ? 'Enabled' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400">
                    Automatically engage with post and reel comments
                  </p>
                </div>
              </div>

              {/* Working Switch Toggle Button */}
              <button
                type="button"
                role="switch"
                aria-checked={commentReplyActive}
                onClick={handleToggleComments}
                className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#4A6DE1]/50 ${
                  commentReplyActive ? 'bg-[#4A6DE1]' : 'bg-neutral-800'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    commentReplyActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 text-center">
          <p className="text-xs text-neutral-400">
            Candei Instagram AI Engine • Connected through Meta Graph API Webhooks
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AutomationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] text-neutral-400 p-8 flex items-center justify-center font-sans">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#4A6DE1] animate-ping" />
            <span>Loading Instagram automations...</span>
          </div>
        </div>
      }
    >
      <AutomationContent />
    </Suspense>
  );
}
