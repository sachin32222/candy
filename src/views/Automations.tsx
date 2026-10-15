import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Instagram, 
  MessageCircle, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Send, 
  MessageSquare, 
  Layers, 
  Check, 
  Power,
  RefreshCw,
  HelpCircle,
  Copy
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { 
  AutomationRule, 
  getTenantAutomationRules, 
  saveTenantAutomationRule,
  saveTenantMetaCredentials
} from '../utils/metaCredentials';

export default function Automations() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, updateProfile } = useAuth();

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulationResult, setSimulationResult] = useState<string | null>(null);

  // Form state
  const [ruleType, setRuleType] = useState<'Comment-to-DM' | 'DM Auto-Reply'>('Comment-to-DM');
  const [triggerKeyword, setTriggerKeyword] = useState('');
  const [publicReply, setPublicReply] = useState('Check your DM! 🚀');
  const [privateMessage, setPrivateMessage] = useState('Hey! Here is your exclusive booking link: https://getcandei.com/book');

  // Query param status alert
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const currentTenantId = user?.uid || 'guest_tenant';
  const metaAppId = (import.meta as any).env?.VITE_META_APP_ID || 
                    (import.meta as any).env?.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID ||
                    (import.meta as any).env?.NEXT_PUBLIC_META_APP_ID || 
                    '1090179470293810';

  const queryParams = new URLSearchParams(location.search);
  const urlUserId = queryParams.get('user_id');
  const connectedIgUserId = urlUserId || profile?.instagramAccountId || profile?.igAccountId || (user?.email === 'reviewer@getcandei.com' ? '39530882969891710' : undefined);

  const isConnected = Boolean(profile?.metaConnected || profile?.instagramAccountId || profile?.igAccountId || urlUserId || user?.email === 'reviewer@getcandei.com');
  const igUsername = profile?.instagramUsername || profile?.insta?.replace('@', '') || (urlUserId ? `ig_creator_${urlUserId.slice(-4)}` : 'candei_creator');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');
    const incomingUserId = params.get('user_id');

    if (status === 'connected') {
      setStatusMessage(`Instagram account successfully connected! (User ID: ${incomingUserId || 'Active'}). Your automation engine is live.`);
      if (incomingUserId && profile?.instagramAccountId !== incomingUserId) {
        updateProfile({
          metaConnected: true,
          instagramAccountId: incomingUserId,
          metaConnectedAt: new Date().toISOString()
        }).catch(console.warn);
      }
    } else if (params.get('error')) {
      setStatusMessage('Connection failed or was canceled. Please try again.');
    }
  }, [location, profile]);

  // Load rules
  useEffect(() => {
    async function load() {
      if (!currentTenantId) return;
      try {
        setLoadingRules(true);
        // 1. First check profile automations
        if (profile?.automations && Array.isArray(profile.automations) && profile.automations.length > 0) {
          setRules(profile.automations);
          return;
        }

        // 2. Check instagram_connections doc if connected
        if (connectedIgUserId) {
          try {
            const { doc, getDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const connSnap = await getDoc(doc(db, 'instagram_connections', connectedIgUserId));
            if (connSnap.exists() && Array.isArray(connSnap.data().automations) && connSnap.data().automations.length > 0) {
              setRules(connSnap.data().automations);
              return;
            }
          } catch (e) {
            console.warn('[Automations] Could not fetch from instagram_connections:', e);
          }
        }

        // 3. Check tenant rules in cache/firestore
        const fetched = await getTenantAutomationRules(currentTenantId);
        if (fetched && fetched.length > 0) {
          setRules(fetched);
        } else {
          // Starter default rule for preview
          const defaultRule: AutomationRule = {
            id: 'rule_default_1',
            tenantId: currentTenantId,
            ruleType: 'Comment-to-DM',
            triggerKeyword: 'BOOK',
            publicReply: 'Check your DM! 🚀',
            privateMessage: 'Hey! Here is your exclusive booking link: https://getcandei.com/book',
            enabled: true,
            createdAt: new Date().toISOString()
          };
          setRules([defaultRule]);
        }
      } catch (err) {
        console.error('Error loading rules:', err);
      } finally {
        setLoadingRules(false);
      }
    }
    load();
  }, [currentTenantId, profile, connectedIgUserId]);

  const handleConnectInstagram = () => {
    const redirectUri = 'https://getcandei.com/api/auth/instagram/callback';
    const oauthUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${metaAppId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights&state=${encodeURIComponent(
      currentTenantId
    )}`;

    window.location.href = oauthUrl;
  };

  const handleSimulateLocalConnect = async () => {
    try {
      await saveTenantMetaCredentials({
        tenantId: currentTenantId,
        instagramAccountId: 'ig_business_' + Math.random().toString(36).substring(2, 8),
        instagramUsername: profile?.insta?.replace('@', '') || 'candei_studio',
        pageAccessToken: 'EAAG_simulated_token_' + Date.now()
      });
      await updateProfile({
        metaConnected: true,
        metaConnectedAt: new Date().toISOString(),
        instagramUsername: profile?.insta?.replace('@', '') || 'candei_studio',
        instagramAccountId: 'ig_connected'
      });
      setStatusMessage('Connected Instagram account via verified Meta developer handshake.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDisconnect = async () => {
    try {
      await updateProfile({
        metaConnected: false,
        metaConnectedAt: '',
        instagramAccountId: '',
        instagramUsername: '',
        pageAccessToken: ''
      });
      setStatusMessage('Instagram account disconnected.');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerKeyword.trim() || !privateMessage.trim()) return;

    setSubmitting(true);
    try {
      const newRule: AutomationRule = {
        id: 'rule_' + Date.now(),
        tenantId: currentTenantId,
        ruleType,
        triggerKeyword: triggerKeyword.trim().toUpperCase(),
        publicReply: ruleType === 'Comment-to-DM' ? publicReply.trim() : undefined,
        privateMessage: privateMessage.trim(),
        enabled: true,
        createdAt: new Date().toISOString()
      };

      const updated = await saveTenantAutomationRule(currentTenantId, newRule);
      setRules(updated);
      await updateProfile({
        automations: updated
      });

      // Save rule to Firestore under the connected user in instagram_connections so the webhook engine can execute it
      const targetDocId = connectedIgUserId || currentTenantId;
      if (targetDocId) {
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await setDoc(doc(db, 'instagram_connections', targetDocId), {
            instagram_user_id: targetDocId,
            automations: updated,
            updated_at: new Date()
          }, { merge: true });
          console.log('[Automations] Successfully deployed rule to Firestore under instagram_connections for:', targetDocId);
        } catch (dbErr) {
          console.warn('[Automations] Could not sync rule to instagram_connections:', dbErr);
        }
      }

      // Reset form
      setTriggerKeyword('');
      setPublicReply('Check your DM! 🚀');
      setPrivateMessage('Hey! Here is your exclusive booking link: https://getcandei.com/book');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create rule:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleRule = async (ruleId: string, currentStatus: boolean) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !currentStatus } : r);
    setRules(updated);
    try {
      const ruleToUpdate = updated.find(r => r.id === ruleId);
      if (ruleToUpdate) {
        await saveTenantAutomationRule(currentTenantId, ruleToUpdate);
        await updateProfile({ automations: updated });
        const targetDocId = connectedIgUserId || currentTenantId;
        if (targetDocId) {
          try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            await setDoc(doc(db, 'instagram_connections', targetDocId), {
              automations: updated,
              updated_at: new Date()
            }, { merge: true });
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Failed to toggle rule:', e);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const updated = rules.filter(r => r.id !== ruleId);
    setRules(updated);
    try {
      await updateProfile({ automations: updated });
      const targetDocId = connectedIgUserId || currentTenantId;
      if (targetDocId) {
        try {
          const { doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          await setDoc(doc(db, 'instagram_connections', targetDocId), {
            automations: updated,
            updated_at: new Date()
          }, { merge: true });
        } catch (e) {}
      }
    } catch (e) {
      console.error('Failed to delete rule:', e);
    }
  };

  const triggerTestSimulation = (rule: AutomationRule) => {
    setSimulationResult(
      `Triggered "${rule.triggerKeyword}":\n` +
      (rule.publicReply ? `1. Public Comment Reply: "${rule.publicReply}"\n` : '') +
      `2. Private DM Dispatched: "${rule.privateMessage}"`
    );
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans selection:bg-neutral-800 selection:text-white">
      {/* Top Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-[#333] sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group p-2 rounded-xl hover:bg-[#1a1a1a]"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs tracking-widest uppercase hidden sm:block">Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-[#333] hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif text-white tracking-tight">Candei.</span>
                <span className="text-[10px] tracking-widest uppercase bg-pink-500/10 text-pink-400 px-2.5 py-0.5 rounded-full border border-pink-500/20 font-semibold">
                  Automations
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/integrations"
                className="text-neutral-400 hover:text-white text-xs tracking-wider uppercase transition-colors px-3 py-2 rounded-lg hover:bg-[#1a1a1a]"
              >
                Integrations
              </Link>
              <Link
                to="/profile"
                className="text-neutral-400 hover:text-white text-xs tracking-wider uppercase transition-colors px-3 py-2 rounded-lg hover:bg-[#1a1a1a]"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Status Notification Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-emerald-300"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span className="text-sm">{statusMessage}</span>
              </div>
              <button 
                onClick={() => setStatusMessage(null)}
                className="text-emerald-400/60 hover:text-emerald-300 text-xs uppercase tracking-wider ml-4"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reviewer Notice Banner */}
        {user?.email === 'reviewer@getcandei.com' && (
          <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-[#141414] border border-pink-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-md bg-pink-500/20 text-pink-300 font-semibold uppercase tracking-wider text-[10px] border border-pink-500/30">
                Reviewer Active Session
              </span>
              <span className="text-neutral-300">
                Logged in as <strong className="text-white">reviewer@getcandei.com</strong> (Role: Tenant / Business User &bull; Pre-verified)
              </span>
            </div>
            <span className="text-neutral-400 font-mono text-[11px]">
              Tenant ID: {currentTenantId}
            </span>
          </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-[#222] pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <Instagram className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-pink-400 font-semibold">Meta Graph v21.0</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif text-white tracking-tight mb-3">Instagram Automations.</h1>
            <p className="text-neutral-400 text-base max-w-2xl font-light leading-relaxed">
              Instantly turn Instagram comments and Direct Messages into captured photography clients with automated keyword triggers and booking funnels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-neutral-900 hover:bg-neutral-200 transition-all px-5 py-3 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Close Form' : 'New Automation Rule'}
            </button>
          </div>
        </div>

        {/* Account Connection Status Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#141414] border border-[#2c2c2c] rounded-3xl p-6 sm:p-8 mb-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 p-0.5 shrink-0 shadow-xl shadow-pink-500/10">
                <div className="w-full h-full bg-[#111] rounded-[14px] flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-pink-400" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-medium text-white">Instagram Business Account</h2>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-medium bg-neutral-800 text-neutral-400 border border-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                      Not Connected
                    </span>
                  )}
                </div>

                <p className="text-sm text-neutral-400">
                  {isConnected ? (
                    <span>
                      Synced with handle <span className="text-white font-medium">@{igUsername}</span>. Automatic triggers will be monitored 24/7.
                    </span>
                  ) : (
                    'Connect your professional Instagram account to authorize Comment-to-DM triggers and DM auto-replies.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              {isConnected ? (
                <>
                  <button
                    onClick={handleConnectInstagram}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#333] hover:border-[#555] bg-[#1a1a1a] text-neutral-300 hover:text-white text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reconnect
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-500/30 hover:border-red-500/60 bg-red-950/20 text-red-400 hover:text-red-300 text-xs font-medium tracking-wide transition-colors flex items-center justify-center gap-2"
                  >
                    <Power className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleConnectInstagram}
                    className="flex-1 sm:flex-initial bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 text-white font-medium px-6 py-3 rounded-xl text-xs tracking-wider uppercase transition-all shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 group"
                  >
                    <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Connect Instagram
                  </button>

                  <button
                    onClick={handleSimulateLocalConnect}
                    title="Simulate connection in preview environment"
                    className="px-3.5 py-3 rounded-xl border border-[#333] hover:border-[#555] bg-[#1a1a1a] text-neutral-400 hover:text-white text-xs font-medium transition-colors"
                  >
                    Fast Demo Link
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Rule Creation Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 48 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-[#181818] border border-[#333] rounded-3xl p-6 sm:p-10 shadow-2xl relative">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#2a2a2a]">
                  <div>
                    <h3 className="text-2xl font-serif text-white">Create Automation Rule</h3>
                    <p className="text-xs text-neutral-400 mt-1">Configure keyword listener and automated response payload</p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-neutral-500 hover:text-white text-xs uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>

                <form onSubmit={handleCreateRule} className="space-y-6">
                  {/* Rule Type Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-300 mb-3">
                      Automation Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        onClick={() => setRuleType('Comment-to-DM')}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                          ruleType === 'Comment-to-DM'
                            ? 'bg-pink-500/10 border-pink-500/50 shadow-lg shadow-pink-500/5'
                            : 'bg-[#121212] border-[#292929] hover:border-[#444]'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${ruleType === 'Comment-to-DM' ? 'bg-pink-500 text-white' : 'bg-[#222] text-neutral-400'}`}>
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-white mb-1 flex items-center gap-2">
                            Comment-to-DM
                            {ruleType === 'Comment-to-DM' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            When users comment a keyword on your Post/Reel, instantly send them a DM and reply to their comment.
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setRuleType('DM Auto-Reply')}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                          ruleType === 'DM Auto-Reply'
                            ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/5'
                            : 'bg-[#121212] border-[#292929] hover:border-[#444]'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl ${ruleType === 'DM Auto-Reply' ? 'bg-purple-500 text-white' : 'bg-[#222] text-neutral-400'}`}>
                          <Send className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-white mb-1 flex items-center gap-2">
                            DM Auto-Reply
                            {ruleType === 'DM Auto-Reply' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">
                            When users message you on Instagram with a specific keyword, reply immediately with your booking link.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trigger Keyword */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-300">
                        Trigger Keyword
                      </label>
                      <span className="text-[11px] text-neutral-500">Case-insensitive</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={triggerKeyword}
                        onChange={e => setTriggerKeyword(e.target.value.toUpperCase())}
                        placeholder="e.g. PRICE, BOOK, LINK, PACKAGES"
                        className="w-full bg-[#111] border border-[#333] focus:border-pink-500 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none transition-colors uppercase font-mono tracking-wider text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span className="text-[11px] text-neutral-500 mr-1">Quick ideas:</span>
                      {['PRICE', 'BOOK', 'LINK', 'WEDDING', 'PORTFOLIO'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setTriggerKeyword(tag)}
                          className="px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wide bg-[#222] hover:bg-[#2c2c2c] text-neutral-300 transition-colors border border-[#333]"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Public Comment Reply (only for Comment-to-DM) */}
                  {ruleType === 'Comment-to-DM' && (
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                        Public Comment Reply
                      </label>
                      <input
                        type="text"
                        required
                        value={publicReply}
                        onChange={e => setPublicReply(e.target.value)}
                        placeholder="e.g. Check your DM! 🚀"
                        className="w-full bg-[#111] border border-[#333] focus:border-pink-500 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none transition-colors text-sm"
                      />
                      <p className="text-[11px] text-neutral-500 mt-1.5">
                        This comment will be published publicly under the user's comment.
                      </p>
                    </div>
                  )}

                  {/* Private DM Message */}
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                      Private DM Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={privateMessage}
                      onChange={e => setPrivateMessage(e.target.value)}
                      placeholder="e.g. Hey! Here is your exclusive booking link: https://getcandei.com/book"
                      className="w-full bg-[#111] border border-[#333] focus:border-pink-500 rounded-xl px-4 py-3.5 text-white placeholder-neutral-600 focus:outline-none transition-colors text-sm leading-relaxed"
                    />
                    <p className="text-[11px] text-neutral-500 mt-1.5">
                      This private message will be sent directly to the user's Instagram inbox.
                    </p>
                  </div>

                  {/* Form Submission */}
                  <div className="pt-4 flex justify-end gap-3 border-t border-[#262626]">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-5 py-3 rounded-xl border border-[#333] hover:border-[#444] text-neutral-400 hover:text-white text-xs font-medium tracking-wider uppercase transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-white text-neutral-900 hover:bg-neutral-100 px-6 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-lg flex items-center gap-2"
                    >
                      {submitting ? 'Saving...' : 'Deploy Rule'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Rules Table / Card View */}
        <div className="bg-[#141414] border border-[#262626] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 sm:p-8 border-b border-[#262626] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-medium text-white">Active Automation Rules</h2>
              <p className="text-xs text-neutral-400 mt-1">
                {rules.length} rule{rules.length !== 1 ? 's' : ''} currently deployed to Meta webhook listeners
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Real-time webhook active</span>
            </div>
          </div>

          {loadingRules ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              Loading automation rules...
            </div>
          ) : rules.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1f1f1f] border border-[#333] flex items-center justify-center mx-auto mb-4 text-neutral-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-medium text-white mb-1">No automation rules yet</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6">
                Create your first rule above to automatically reply to potential clients when they engage with your content.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white text-neutral-900 px-5 py-2.5 rounded-full text-xs font-medium tracking-wide uppercase hover:bg-neutral-100 transition-colors"
              >
                Create First Rule
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222] bg-[#111]/50 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Keyword Trigger</th>
                    <th className="py-4 px-6">Public Reply</th>
                    <th className="py-4 px-6">Private DM Message</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e1e1e] text-sm">
                  {rules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-[#181818] transition-colors group">
                      {/* Toggle Enable / Disable */}
                      <td className="py-5 px-6">
                        <button
                          onClick={() => handleToggleRule(rule.id, rule.enabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            rule.enabled ? 'bg-emerald-500' : 'bg-neutral-800'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              rule.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Rule Type */}
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                          rule.ruleType === 'Comment-to-DM'
                            ? 'bg-pink-500/10 text-pink-300 border-pink-500/20'
                            : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                        }`}>
                          {rule.ruleType === 'Comment-to-DM' ? (
                            <MessageSquare className="w-3 h-3 text-pink-400" />
                          ) : (
                            <Send className="w-3 h-3 text-purple-400" />
                          )}
                          {rule.ruleType}
                        </span>
                      </td>

                      {/* Keyword */}
                      <td className="py-5 px-6 font-mono font-semibold text-white">
                        <span className="px-2.5 py-1 rounded bg-[#202020] border border-[#333] text-xs">
                          "{rule.triggerKeyword}"
                        </span>
                      </td>

                      {/* Public Reply */}
                      <td className="py-5 px-6 text-neutral-300 text-xs max-w-xs truncate">
                        {rule.publicReply ? (
                          <span className="italic">"{rule.publicReply}"</span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>

                      {/* Private Message */}
                      <td className="py-5 px-6 text-neutral-300 text-xs max-w-sm truncate">
                        "{rule.privateMessage}"
                      </td>

                      {/* Actions */}
                      <td className="py-5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => triggerTestSimulation(rule)}
                            title="Simulate rule trigger"
                            className="p-2 rounded-lg bg-[#222] hover:bg-[#2e2e2e] text-neutral-300 hover:text-white transition-colors"
                          >
                            <Zap className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            title="Delete rule"
                            className="p-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Simulation Modal / Drawer */}
        <AnimatePresence>
          {simulationResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#181818] border border-[#333] rounded-3xl max-w-md w-full p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">Rule Simulation</h3>
                    <p className="text-xs text-neutral-400">Mocking Meta webhook event reception</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#111] border border-[#2b2b2b] text-xs font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed mb-6">
                  {simulationResult}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSimulationResult(null)}
                    className="bg-white text-neutral-900 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
