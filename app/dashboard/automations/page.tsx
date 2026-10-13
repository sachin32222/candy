"use client";

import React, { useState, useEffect } from "react";

interface AutomationRule {
  id: string;
  ruleType: "Comment-to-DM" | "DM Auto-Reply";
  triggerKeyword: string;
  publicReply?: string;
  privateMessage: string;
  enabled: boolean;
  createdAt: string;
}

export default function AutomationsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [instagramUsername, setInstagramUsername] = useState("");
  const [currentTenantId, setCurrentTenantId] = useState("tenant_default");
  
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: "rule_1",
      ruleType: "Comment-to-DM",
      triggerKeyword: "BOOK",
      publicReply: "Check your DM! 🚀",
      privateMessage: "Hey! Here is your exclusive booking link: https://getcandei.com/book",
      enabled: true,
      createdAt: new Date().toISOString(),
    },
  ]);

  // Form State
  const [ruleType, setRuleType] = useState<"Comment-to-DM" | "DM Auto-Reply">("Comment-to-DM");
  const [triggerKeyword, setTriggerKeyword] = useState("");
  const [publicReply, setPublicReply] = useState("Check your DM! 🚀");
  const [privateMessage, setPrivateMessage] = useState("Hey! Here is your exclusive booking link: https://getcandei.com/book");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("status") === "connected") {
        setIsConnected(true);
        setInstagramUsername("candei_photographer");
      }
    }
  }, []);

  const handleConnectInstagram = () => {
    const clientId = process.env.NEXT_PUBLIC_INSTAGRAM_CLIENT_ID || process.env.NEXT_PUBLIC_META_APP_ID || "1090179470293810";
    const redirectUri = "https://getcandei.com/api/auth/instagram/callback";
    const oauthUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights&state=${encodeURIComponent(
      currentTenantId
    )}`;

    window.location.href = oauthUrl;
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerKeyword.trim() || !privateMessage.trim()) return;

    const newRule: AutomationRule = {
      id: "rule_" + Date.now(),
      ruleType,
      triggerKeyword: triggerKeyword.trim().toUpperCase(),
      publicReply: ruleType === "Comment-to-DM" ? publicReply.trim() : undefined,
      privateMessage: privateMessage.trim(),
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    setRules([newRule, ...rules]);
    setTriggerKeyword("");
    setPublicReply("Check your DM! 🚀");
    setPrivateMessage("Hey! Here is your exclusive booking link: https://getcandei.com/book");
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#262626] pb-8">
          <div>
            <h1 className="text-4xl font-serif text-white tracking-tight">Instagram Automations</h1>
            <p className="text-neutral-400 mt-2 text-sm">
              Convert comments and direct messages into photography bookings automatically.
            </p>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="bg-[#161616] border border-[#2b2b2b] rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-medium">Meta Instagram Connection</h2>
              {isConnected ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Connected
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Not Connected
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-400">
              {isConnected ? (
                <span>
                  Linked handle: <span className="text-white font-medium">@{instagramUsername}</span>
                </span>
              ) : (
                "Authorize Meta permissions to enable Comment-to-DM and DM auto-replies."
              )}
            </p>
          </div>

          <div>
            {isConnected ? (
              <button
                onClick={() => setIsConnected(false)}
                className="px-5 py-2.5 rounded-xl border border-red-500/30 bg-red-950/20 text-red-400 hover:text-red-300 text-xs font-medium uppercase tracking-wider transition-colors"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectInstagram}
                className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white font-medium px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-pink-600/20 transition-all"
              >
                Connect Instagram
              </button>
            )}
          </div>
        </div>

        {/* Create Rule Form */}
        <div className="bg-[#161616] border border-[#2b2b2b] rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-serif text-white mb-6">Create Automation Rule</h2>

          <form onSubmit={handleCreateRule} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                Rule Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRuleType("Comment-to-DM")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    ruleType === "Comment-to-DM"
                      ? "bg-pink-500/10 border-pink-500 text-white"
                      : "bg-[#111] border-[#333] text-neutral-400 hover:border-[#555]"
                  }`}
                >
                  <div className="font-semibold text-sm">Comment-to-DM</div>
                  <div className="text-xs text-neutral-400 mt-1">Replies to post comments and sends a DM</div>
                </button>

                <button
                  type="button"
                  onClick={() => setRuleType("DM Auto-Reply")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    ruleType === "DM Auto-Reply"
                      ? "bg-purple-500/10 border-purple-500 text-white"
                      : "bg-[#111] border-[#333] text-neutral-400 hover:border-[#555]"
                  }`}
                >
                  <div className="font-semibold text-sm">DM Auto-Reply</div>
                  <div className="text-xs text-neutral-400 mt-1">Replies to incoming direct messages</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                Keyword Trigger
              </label>
              <input
                type="text"
                required
                value={triggerKeyword}
                onChange={(e) => setTriggerKeyword(e.target.value.toUpperCase())}
                placeholder="e.g. PRICE, BOOK, LINK"
                className="w-full bg-[#111] border border-[#333] focus:border-pink-500 rounded-xl px-4 py-3 text-white uppercase font-mono text-sm focus:outline-none transition-colors"
              />
            </div>

            {ruleType === "Comment-to-DM" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                  Public Comment Reply
                </label>
                <input
                  type="text"
                  required
                  value={publicReply}
                  onChange={(e) => setPublicReply(e.target.value)}
                  placeholder="e.g. Check your DM! 🚀"
                  className="w-full bg-[#111] border border-[#333] focus:border-pink-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-2">
                Private DM Message
              </label>
              <textarea
                required
                rows={3}
                value={privateMessage}
                onChange={(e) => setPrivateMessage(e.target.value)}
                placeholder="e.g. Hey! Here is your exclusive booking link: https://getcandei.com/book"
                className="w-full bg-[#111] border border-[#333] focus:border-pink-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              className="bg-white text-neutral-900 hover:bg-neutral-200 px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Add Automation Rule
            </button>
          </form>
        </div>

        {/* Active Rules Table */}
        <div className="bg-[#161616] border border-[#2b2b2b] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[#2b2b2b]">
            <h2 className="text-xl font-medium">Active Rules</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#2b2b2b] text-[11px] font-semibold uppercase tracking-wider text-neutral-400 bg-[#121212]">
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Keyword</th>
                  <th className="py-4 px-6">Public Reply</th>
                  <th className="py-4 px-6">Private DM</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                          rule.enabled ? "bg-emerald-500" : "bg-neutral-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ${
                            rule.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-800 border border-neutral-700">
                        {rule.ruleType}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-pink-400">"{rule.triggerKeyword}"</td>
                    <td className="py-4 px-6 text-neutral-300 text-xs">{rule.publicReply || "—"}</td>
                    <td className="py-4 px-6 text-neutral-300 text-xs">{rule.privateMessage}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-400 hover:text-red-300 text-xs uppercase tracking-wider"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
