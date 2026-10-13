"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function AutomationsContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const userId = searchParams.get("user_id");
  const error = searchParams.get("error");

  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "connected") {
      setIsConnected(true);
      setCurrentUserId(userId || "17841413170626603");
    }
  }, [status, userId]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#ffffff", padding: "40px 20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #262626", paddingBottom: "24px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "600", margin: "0 0 8px 0" }}>Instagram Automations</h1>
            <p style={{ color: "#a3a3a3", fontSize: "14px", margin: 0 }}>
              Convert Instagram comments and direct messages into photography bookings.
            </p>
          </div>
          <a
            href="https://getcandei.com/#/dashboard/automations"
            style={{
              padding: "10px 18px",
              backgroundColor: "#262626",
              color: "#ffffff",
              textDecoration: "none",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: "500",
              border: "1px solid #333333"
            }}
          >
            Launch Candei App
          </a>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "16px", padding: "16px 20px", marginBottom: "24px", color: "#fca5a5", fontSize: "14px" }}>
            <strong>Connection Notice:</strong> {error}
          </div>
        )}

        {/* Status Card */}
        <div style={{
          backgroundColor: "#171717",
          border: isConnected ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid #2e2e2e",
          borderRadius: "20px",
          padding: "28px",
          marginBottom: "32px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "20px"
              }}>
                📸
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 4px 0" }}>Instagram Business Account</h2>
                <span style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                  backgroundColor: isConnected ? "rgba(16, 185, 129, 0.2)" : "rgba(115, 115, 115, 0.2)",
                  color: isConnected ? "#34d399" : "#a3a3a3",
                  border: isConnected ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid #404040"
                }}>
                  {isConnected ? "● Connected & Live" : "○ Not Connected"}
                </span>
              </div>
            </div>

            {isConnected ? (
              <span style={{ fontSize: "12px", color: "#34d399", fontWeight: "500" }}>Active 24/7</span>
            ) : (
              <a
                href={`https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1090179470293810&redirect_uri=https://getcandei.com/api/auth/instagram/callback&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights`}
                style={{
                  padding: "10px 18px",
                  background: "linear-gradient(135deg, #e1306c, #833ab4)",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: "600"
                }}
              >
                Connect Instagram
              </a>
            )}
          </div>

          {isConnected && currentUserId && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #262626", display: "flex", gap: "24px", fontSize: "13px", color: "#a3a3a3" }}>
              <div>
                <span style={{ color: "#737373" }}>Instagram User ID: </span>
                <code style={{ color: "#ffffff", backgroundColor: "#262626", padding: "2px 6px", borderRadius: "4px" }}>{currentUserId}</code>
              </div>
              <div>
                <span style={{ color: "#737373" }}>Webhook Status: </span>
                <span style={{ color: "#34d399" }}>Subscribed</span>
              </div>
            </div>
          )}
        </div>

        {/* Automations Preview */}
        <div style={{ backgroundColor: "#171717", border: "1px solid #2e2e2e", borderRadius: "20px", padding: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 16px 0" }}>Active Automation Triggers</h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ backgroundColor: "#1f1f1f", padding: "14px 18px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ backgroundColor: "#3b82f6", color: "#ffffff", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px", marginRight: "8px" }}>Comment-to-DM</span>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Trigger: <code>PRICE</code></span>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#a3a3a3" }}>Auto-replies in comment and DMs full pricing guide link.</p>
              </div>
              <span style={{ color: "#34d399", fontSize: "12px", fontWeight: "500" }}>Enabled</span>
            </div>

            <div style={{ backgroundColor: "#1f1f1f", padding: "14px 18px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ backgroundColor: "#8b5cf6", color: "#ffffff", fontSize: "11px", fontWeight: "600", padding: "2px 8px", borderRadius: "6px", marginRight: "8px" }}>DM Auto-Reply</span>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Trigger: <code>BOOK</code></span>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#a3a3a3" }}>Instantly sends real-time booking calendar link.</p>
              </div>
              <span style={{ color: "#34d399", fontSize: "12px", fontWeight: "500" }}>Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#0f0f0f", color: "#ffffff", padding: "40px 20px" }}>Loading Automations...</div>}>
      <AutomationsContent />
    </Suspense>
  );
}
