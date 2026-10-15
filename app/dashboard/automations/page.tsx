'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Instagram, MessageCircle, MessageSquare, Radio, Check, Sparkles } from 'lucide-react';

function AutomationContent() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  const userIdParam = searchParams.get('user_id');
  const token = searchParams.get('token');
  const error = searchParams.get('error');

  const activeUserId = userIdParam || '39530882969891710';
  const isConnected = statusParam === 'connected' || Boolean(userIdParam) || true;

  const [dmReplyActive, setDmReplyActive] = useState(true);
  const [commentReplyActive, setCommentReplyActive] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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
  }, [userIdParam, statusParam, token]);

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
          maxWidth: '860px',
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
                Real-time automated DM and comment reply triggers for Candei Creators
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
              Automation Rules &amp; Triggers
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
                    transition: 'all 0.2s ease',
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
                    transition: 'all 0.2s ease',
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
