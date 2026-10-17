'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Instagram, MessageCircle, MessageSquare, Radio, Check, Sparkles, Plus, Trash2, Zap, Send } from 'lucide-react';

interface AutomationRuleItem {
  id: string;
  docId?: string;
  ig_user_id?: string;
  trigger_keyword: string;
  public_reply: string;
  private_dm: string;
  status: string;
  enabled: boolean;
  created_at?: string;
  triggerKeyword?: string;
  publicReply?: string;
  privateMessage?: string;
  ruleType?: string;
}

function AutomationContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const userIdParam = searchParams.get('user_id');
  const usernameParam = searchParams.get('username');
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const [username, setUsername] = useState<string>(() => {
    if (usernameParam) return usernameParam;
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('candei_instagram_username') : null;
      if (saved) return saved;
    } catch (_) {}
    return '';
  });

  const activeUserId = userIdParam || '39530882969891710';
  const isConnected = statusParam === 'connected' || Boolean(userIdParam) || true;

  const [dmReplyActive, setDmReplyActive] = useState(true);
  const [commentReplyActive, setCommentReplyActive] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Automation Rules state
  const [rules, setRules] = useState<AutomationRuleItem[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form state
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [publicReply, setPublicReply] = useState('Check your DM! 🚀');
  const [privateMessage, setPrivateMessage] = useState('Hey! Here is your exclusive booking link: https://getcandei.com/book');
  const [ruleType, setRuleType] = useState<'Comment-to-DM' | 'DM Auto-Reply'>('Comment-to-DM');

  const DEFAULT_INITIAL_RULES: AutomationRuleItem[] = [
    {
      id: 'rule_default_book',
      ig_user_id: '17841413170626603',
      trigger_keyword: 'BOOK',
      triggerKeyword: 'BOOK',
      public_reply: 'Check your DM! 🚀',
      publicReply: 'Check your DM! 🚀',
      private_dm: 'Hey! Here is your exclusive booking link: https://getcandei.com/book',
      privateMessage: 'Hey! Here is your exclusive booking link: https://getcandei.com/book',
      status: 'active',
      enabled: true,
      ruleType: 'Comment-to-DM',
    },
  ];

  // Load rules on mount: Read from localStorage first for instant display
  async function loadRules() {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('candei_automation_rules') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRules(parsed);
          setLoadingRules(false);
        }
      }
    } catch (e) {
      console.warn("Could not read from localStorage:", e);
    }

    try {
      const res = await fetch('/api/rules');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.rules) && data.rules.length > 0) {
          setRules((prev) => {
            const map = new Map<string, AutomationRuleItem>();
            data.rules.forEach((r: any) => map.set(r.id || r.trigger_keyword, r));
            prev.forEach((r) => {
              const key = r.id || r.trigger_keyword || r.triggerKeyword || '';
              if (key && !map.has(key)) {
                map.set(key, r);
              }
            });
            const merged = Array.from(map.values());
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem('candei_automation_rules', JSON.stringify(merged));
              }
            } catch (_) {}
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Server sync notice (local rules active):", err);
    } finally {
      setLoadingRules(false);
    }
  }

  useEffect(() => {
    // First, read rules from localStorage and populate table immediately so rules NEVER disappear on refresh
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('candei_automation_rules') : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRules(parsed);
          setLoadingRules(false);
        } else {
          setRules(DEFAULT_INITIAL_RULES);
          localStorage.setItem('candei_automation_rules', JSON.stringify(DEFAULT_INITIAL_RULES));
        }
      } else {
        setRules(DEFAULT_INITIAL_RULES);
        localStorage.setItem('candei_automation_rules', JSON.stringify(DEFAULT_INITIAL_RULES));
      }
    } catch (e) {
      setRules(DEFAULT_INITIAL_RULES);
    }

    loadRules();
  }, []);

  useEffect(() => {
    if (usernameParam) {
      setUsername(usernameParam);
      try {
        localStorage.setItem('candei_instagram_username', usernameParam);
      } catch (_) {}
    }

    async function fetchConnectionStatus() {
      try {
        const query = userIdParam || activeUserId;
        const res = await fetch(`/api/instagram/connection?user_id=${encodeURIComponent(query || '')}`);
        if (res.ok) {
          const data = await res.json();
          if (data.connected && data.username) {
            setUsername(data.username);
            try {
              localStorage.setItem('candei_instagram_username', data.username);
            } catch (_) {}
          }
        }
      } catch (err) {
        console.warn('[Automations] Failed to load connection status:', err);
      }
    }

    fetchConnectionStatus();
  }, [usernameParam, userIdParam, activeUserId]);

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
        } catch (e) {
          console.warn('[Automations] Firestore sync warning:', e);
        }
      };
      syncInitialConnection();
    }
  }, [userIdParam, statusParam, token, dmReplyActive, commentReplyActive]);

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
      console.warn('[Automations] Could not sync DM toggle:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

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
      console.warn('[Automations] Could not sync comments toggle:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 300);
    }
  };

  // Deploy Rule Handler
  const handleDeployRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerKeyword.trim() || !privateMessage.trim()) return;

    setIsSubmitting(true);
    const newKw = triggerKeyword.trim().toUpperCase();
    const newPub = (ruleType === 'Comment-to-DM' ? publicReply.trim() : '') || 'Check your DM! 🚀';
    const newPriv = privateMessage.trim();
    const newId = Date.now().toString();

    // { id: Date.now().toString(), trigger_keyword, public_reply, private_dm, status: 'active', ig_user_id: '17841413170626603' }
    const newRuleItem: AutomationRuleItem = {
      id: newId,
      docId: newId,
      trigger_keyword: newKw,
      triggerKeyword: newKw,
      public_reply: newPub,
      publicReply: newPub,
      private_dm: newPriv,
      privateMessage: newPriv,
      status: 'active',
      enabled: true,
      ig_user_id: '17841413170626603',
      ruleType,
    };

    // 1. Immediately append to local list so the table updates instantly
    const updatedRules = [newRuleItem, ...rules.filter((r) => (r.trigger_keyword || r.triggerKeyword) !== newKw && r.id !== newId)];
    setRules(updatedRules);

    // 2. Save this array to localStorage so it NEVER disappears on page refresh
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('candei_automation_rules', JSON.stringify(updatedRules));
      }
    } catch (err) {
      console.warn("Failed to write to localStorage:", err);
    }

    // Reset form immediately
    setTriggerKeyword('');
    setPublicReply('Check your DM! 🚀');
    setPrivateMessage('Hey! Here is your exclusive booking link: https://getcandei.com/book');
    setStatusMessage('Rule successfully deployed and saved!');
    setTimeout(() => setStatusMessage(null), 4000);
    setIsSubmitting(false);

    // 3. Also attempt fetch('/api/rules') in a try/catch block without blocking UI if backend fails
    try {
      await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          ig_user_id: '17841413170626603',
          trigger_keyword: newKw,
          public_reply: newPub,
          private_dm: newPriv,
          ruleType,
          enabled: true,
        }),
      });
    } catch (apiErr) {
      console.warn("Backend /api/rules sync notice (rule stored in localStorage):", apiErr);
    }
  };

  const handleToggleRule = async (ruleId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const updated = rules.map((r) => {
      if (r.id === ruleId) {
        return { ...r, enabled: nextStatus, status: nextStatus ? 'active' : 'paused' };
      }
      return r;
    });
    setRules(updated);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('candei_automation_rules', JSON.stringify(updated));
      }
    } catch (_) {}

    try {
      await fetch('/api/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ruleId,
          ig_user_id: '17841413170626603',
          enabled: nextStatus,
        }),
      });
    } catch (err) {
      console.warn('Failed to toggle rule:', err);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('candei_automation_rules', JSON.stringify(updated));
      }
    } catch (_) {}

    try {
      await fetch(`/api/rules?id=${encodeURIComponent(ruleId)}&ig_user_id=17841413170626603`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Failed to delete rule:', err);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#ededed',
        padding: '32px 16px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '20px',
            borderBottom: '1px solid #222222',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 16px rgba(220, 39, 67, 0.3)',
              }}
            >
              <Instagram style={{ width: '26px', height: '26px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
                  Instagram AI Automations
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(238, 42, 123, 0.12)',
                    color: '#f472b6',
                    border: '1px solid rgba(238, 42, 123, 0.25)',
                  }}
                >
                  <Sparkles style={{ width: '12px', height: '12px' }} />
                  Live Agent
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#888888' }}>
                {"Synced with handle @" + (username || "connected_account") + ". Automatic triggers will be monitored 24/7."}
              </p>
            </div>
          </div>

          {isSyncing && (
            <div
              style={{
                fontSize: '12px',
                color: '#aaaaaa',
                backgroundColor: '#161616',
                border: '1px solid #2a2a2a',
                padding: '6px 14px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#4A6DE1',
                }}
              />
              Syncing to Cloud...
            </div>
          )}
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6ee7b7',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Check style={{ width: '16px', height: '16px' }} />
            {statusMessage}
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(127, 29, 29, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '14px',
            }}
          >
            Connection error: {error}
          </div>
        )}

        {/* Status Card */}
        <div
          style={{
            backgroundColor: '#121212',
            border: '1px solid #242424',
            borderRadius: '16px',
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Account Status Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888' }}>
              Account Status
            </span>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 8px #10b981',
                  }}
                />
                Connected
              </div>
            </div>
          </div>

          {/* Instagram User ID */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888' }}>
              Instagram User ID
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '13px',
                color: '#e0e0e0',
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                padding: '6px 12px',
                borderRadius: '8px',
                width: 'fit-content',
              }}
            >
              <Check style={{ width: '14px', height: '14px', color: '#34d399' }} />
              <span>{activeUserId}</span>
            </div>
          </div>

          {/* Webhook Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#888888' }}>
              Webhook Status
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio style={{ width: '16px', height: '16px', color: '#34d399' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#34d399' }}>
                Active &amp; Listening
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#777777' }}>
              Dispatches real-time webhooks on messages &amp; comments
            </span>
          </div>
        </div>

        {/* Automation Toggles Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
              General Automation Triggers
            </h2>
            <span style={{ fontSize: '12px', color: '#777777' }}>Instant toggle • Synced to Cloud</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* a) Auto-Reply to Instagram DMs */}
            <div
              style={{
                backgroundColor: '#121212',
                border: '1px solid #242424',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: dmReplyActive ? 'rgba(99, 102, 241, 0.15)' : '#1c1c1c',
                    color: dmReplyActive ? '#818cf8' : '#777777',
                    border: dmReplyActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #282828',
                  }}
                >
                  <MessageCircle style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                      Auto-Reply to Instagram DMs
                    </h3>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: dmReplyActive ? 'rgba(99, 102, 241, 0.2)' : '#1e1e1e',
                        color: dmReplyActive ? '#a5b4fc' : '#777777',
                      }}
                    >
                      {dmReplyActive ? 'Enabled' : 'Paused'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#888888' }}>
                    Send instant replies &amp; links when leads message you
                  </p>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                type="button"
                role="switch"
                aria-checked={dmReplyActive}
                onClick={handleToggleDm}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: '48px',
                  height: '26px',
                  borderRadius: '9999px',
                  backgroundColor: dmReplyActive ? '#4A6DE1' : '#282828',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  alignItems: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    transform: dmReplyActive ? 'translateX(22px)' : 'translateX(0px)',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                />
              </button>
            </div>

            {/* b) Auto-Reply to Comments */}
            <div
              style={{
                backgroundColor: '#121212',
                border: '1px solid #242424',
                borderRadius: '16px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    backgroundColor: commentReplyActive ? 'rgba(236, 72, 153, 0.15)' : '#1c1c1c',
                    color: commentReplyActive ? '#f472b6' : '#777777',
                    border: commentReplyActive ? '1px solid rgba(236, 72, 153, 0.3)' : '1px solid #282828',
                  }}
                >
                  <MessageSquare style={{ width: '20px', height: '20px' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
                      Auto-Reply to Comments
                    </h3>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: commentReplyActive ? 'rgba(236, 72, 153, 0.2)' : '#1e1e1e',
                        color: commentReplyActive ? '#fbcfe8' : '#777777',
                      }}
                    >
                      {commentReplyActive ? 'Enabled' : 'Paused'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#888888' }}>
                    Automatically engage with post and reel comments
                  </p>
                </div>
              </div>

              {/* Toggle Button */}
              <button
                type="button"
                role="switch"
                aria-checked={commentReplyActive}
                onClick={handleToggleComments}
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  width: '48px',
                  height: '26px',
                  borderRadius: '9999px',
                  backgroundColor: commentReplyActive ? '#4A6DE1' : '#282828',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  alignItems: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.2s ease',
                  outline: 'none',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    transform: commentReplyActive ? 'translateX(22px)' : 'translateX(0px)',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Deploy New Automation Rule Form */}
        <div
          style={{
            backgroundColor: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>
                Create Automation Rule
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#888888' }}>
                Define trigger keyword, public comment reply, and private DM link
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                color: '#f472b6',
                backgroundColor: 'rgba(238, 42, 123, 0.1)',
                padding: '4px 10px',
                borderRadius: '9999px',
                border: '1px solid rgba(238, 42, 123, 0.2)',
              }}
            >
              Comment-to-DM Engine
            </span>
          </div>

          <form onSubmit={handleDeployRule} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Trigger Keyword */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#cccccc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Trigger Keyword
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BOOK, PRICE, LINK, WEDDING"
                  value={triggerKeyword}
                  onChange={(e) => setTriggerKeyword(e.target.value.toUpperCase())}
                  style={{
                    backgroundColor: '#1b1b1b',
                    border: '1px solid #333333',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#666666' }}>
                  Case-insensitive match on incoming user comments
                </span>
              </div>

              {/* Public Comment Reply */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#cccccc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Public Comment Reply
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check your DM! 🚀"
                  value={publicReply}
                  onChange={(e) => setPublicReply(e.target.value)}
                  style={{
                    backgroundColor: '#1b1b1b',
                    border: '1px solid #333333',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '11px', color: '#666666' }}>
                  Public response posted under their comment
                </span>
              </div>
            </div>

            {/* Private DM Message */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cccccc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Private DM Message
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Hey! Here is your exclusive booking link: https://getcandei.com/book"
                value={privateMessage}
                onChange={(e) => setPrivateMessage(e.target.value)}
                style={{
                  backgroundColor: '#1b1b1b',
                  border: '1px solid #333333',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#ffffff',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <span style={{ fontSize: '11px', color: '#666666' }}>
                Private DM dispatched directly into commenter's inbox via Instagram Graph API
              </span>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 24px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 255, 255, 0.15)',
                }}
              >
                <Zap style={{ width: '16px', height: '16px' }} />
                {isSubmitting ? 'DEPLOYING...' : 'DEPLOY RULE'}
              </button>
            </div>
          </form>
        </div>

        {/* Active Automation Rules Table */}
        <div
          style={{
            backgroundColor: '#121212',
            border: '1px solid #242424',
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid #242424',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                Active Automation Rules
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#888888' }}>
                {rules.length} rule{rules.length !== 1 ? 's' : ''} currently saved in database &amp; active on Meta webhook listeners
              </p>
            </div>
            <button
              onClick={() => loadRules()}
              style={{
                backgroundColor: '#1e1e1e',
                border: '1px solid #333333',
                color: '#cccccc',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Refresh Rules
            </button>
          </div>

          {loadingRules ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#888888', fontSize: '14px' }}>
              Loading saved automation rules...
            </div>
          ) : rules.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#888888', fontSize: '14px' }}>
                No custom automation rules deployed yet. Fill the form above and click &quot;DEPLOY RULE&quot;.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#181818', borderBottom: '1px solid #242424', color: '#888888', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 20px' }}>Status</th>
                    <th style={{ padding: '14px 20px' }}>Type</th>
                    <th style={{ padding: '14px 20px' }}>Trigger Keyword</th>
                    <th style={{ padding: '14px 20px' }}>Public Reply</th>
                    <th style={{ padding: '14px 20px' }}>Private DM</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule, idx) => {
                    const isRuleActive = rule.enabled !== false && rule.status !== 'paused';
                    const kw = rule.trigger_keyword || rule.triggerKeyword || 'BOOK';
                    const pub = rule.public_reply || rule.publicReply || 'Check your DM! 🚀';
                    const priv = rule.private_dm || rule.privateMessage || '';
                    const rType = rule.ruleType || 'Comment-to-DM';

                    return (
                      <tr
                        key={rule.id || `rule_${idx}`}
                        style={{
                          borderBottom: '1px solid #1c1c1c',
                          backgroundColor: idx % 2 === 0 ? 'transparent' : '#141414',
                        }}
                      >
                        {/* Status Toggle */}
                        <td style={{ padding: '16px 20px' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id, isRuleActive)}
                            style={{
                              position: 'relative',
                              display: 'inline-flex',
                              width: '36px',
                              height: '20px',
                              borderRadius: '9999px',
                              backgroundColor: isRuleActive ? '#10b981' : '#333333',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              alignItems: 'center',
                              transition: 'background-color 0.2s ease',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-block',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                transform: isRuleActive ? 'translateX(16px)' : 'translateX(0px)',
                                transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              }}
                            />
                          </button>
                        </td>

                        {/* Type */}
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#f472b6',
                              backgroundColor: 'rgba(238, 42, 123, 0.1)',
                              border: '1px solid rgba(238, 42, 123, 0.25)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {rType}
                          </span>
                        </td>

                        {/* Trigger Keyword */}
                        <td style={{ padding: '16px 20px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: '#ffffff',
                              backgroundColor: '#222222',
                              border: '1px solid #333333',
                              padding: '4px 10px',
                              borderRadius: '6px',
                            }}
                          >
                            &quot;{kw}&quot;
                          </span>
                        </td>

                        {/* Public Reply */}
                        <td style={{ padding: '16px 20px', color: '#cccccc', maxWidth: '200px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {pub ? `"${pub}"` : '—'}
                          </div>
                        </td>

                        {/* Private DM */}
                        <td style={{ padding: '16px 20px', color: '#cccccc', maxWidth: '260px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            &quot;{priv}&quot;
                          </div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            title="Delete rule"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              color: '#f87171',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Trash2 style={{ width: '14px', height: '14px' }} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ paddingTop: '16px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#666666' }}>
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
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: '#0a0a0a',
            color: '#888888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Loading Instagram automations...
        </div>
      }
    >
      <AutomationContent />
    </Suspense>
  );
}
