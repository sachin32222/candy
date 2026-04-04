import React, { useState } from "react";
import {
  Phone,
  MessageCircle,
  Users,
  Instagram,
  Clapperboard,
  Images,
  Star,
} from "lucide-react";

const PURPLE_TEXTS = [
  "PURPLE  ✦  ELECTRIC  ✦  GLOW  ✦  VIBE  ✦  ULTRA  ✦  DEEP  ✦  NEON  ✦  FADE  ✦ ",
];

function HorizontalTicker() {
  const text = PURPLE_TEXTS[0] + PURPLE_TEXTS[0];
  return (
    <div className="absolute inset-0 overflow-hidden flex items-center pointer-events-none" style={{ zIndex: 1 }}>
      <div style={{ display: "flex", whiteSpace: "nowrap", animation: "hTicker 12s linear infinite", willChange: "transform" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ color: "rgba(255,255,255,0.88)", fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {text}
          </span>
        ))}
      </div>
      <style>{`@keyframes hTicker { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }`}</style>
    </div>
  );
}

const TICKER_TEXTS = ["HELLO","SWIPE","BOLD","VIBE","MOVE","NOW","FEEL","RISE","PUSH","LIVE"];

function VerticalTicker() {
  const doubled = [...TICKER_TEXTS, ...TICKER_TEXTS];
  return (
    <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "tickerSlide 14s linear infinite", willChange: "transform" }}>
        {doubled.map((word, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {word.split("").map((char, ci) => (
              <span key={ci} style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: "14px", lineHeight: 1, padding: "3px 0", display: "block", textAlign: "center" }}>
                {char}
              </span>
            ))}
            <span style={{ display: "block", height: "18px" }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes tickerSlide { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }`}</style>
    </div>
  );
}

function BtnLabel({ icon, label, color = "white", direction = "col", fontSize = 10 }: {
  icon: React.ReactNode; label: string; color?: string; direction?: "col" | "row"; iconSize?: number; fontSize?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: direction === "col" ? "column" : "row", alignItems: "center", justifyContent: "center", gap: "6px", color, fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: `${fontSize}px`, letterSpacing: "0.06em", textTransform: "uppercase", pointerEvents: "none", width: "100%", height: "100%" }}>
      {icon}
      <span style={{ textAlign: "center", lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}

export function ColorButtonLayout() {
  const [pressed, setPressed] = useState<string | null>(null);
  const handlePress = (name: string) => { setPressed(name); setTimeout(() => setPressed(null), 300); };
  const dim = (name: string) => pressed === name ? "brightness(0.75)" : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ width: 390, height: 844, background: "#000" }}>
        <div className="absolute top-0 left-0 right-0 h-10 z-10 pointer-events-none" />
        <div className="w-full h-full flex flex-col">

          {/* Upper 2-column grid */}
          <div className="flex-1 grid" style={{ gridTemplateColumns: "72px 1fr" }}>

            {/* Left column */}
            <div className="flex flex-col">
              <button onClick={() => handlePress("purple-top")} className="transition-all duration-150 active:scale-95 focus:outline-none relative" style={{ background: "#B45FE8", height: "60px", overflow: "hidden", filter: dim("purple-top") }}>
                <HorizontalTicker />
              </button>
              <button onClick={() => handlePress("red")} className="transition-all duration-150 focus:outline-none flex-1 relative" style={{ background: "#E52222", overflow: "hidden", filter: dim("red") }}>
                <VerticalTicker />
              </button>
            </div>

            {/* Right column */}
            <div className="flex flex-col">
              <button onClick={() => handlePress("purple-right")} className="transition-all duration-150 active:scale-95 focus:outline-none relative" style={{ background: "#B45FE8", height: "60px", overflow: "hidden", filter: dim("purple-right") }}>
                <HorizontalTicker />
              </button>
              <button onClick={() => handlePress("darkblue")} className="transition-all duration-150 active:scale-95 focus:outline-none flex items-center justify-center" style={{ background: "#1A1EC8", height: "130px", filter: dim("darkblue") }}>
                <BtnLabel icon={<Star size={26} strokeWidth={2.5} />} label="Rate Us" fontSize={11} />
              </button>
              <button onClick={() => handlePress("yellow")} className="transition-all duration-150 active:scale-95 focus:outline-none flex items-center justify-center" style={{ background: "#F2D553", height: "318px", border: "4px solid #000", boxSizing: "border-box", filter: dim("yellow") }}>
                <BtnLabel icon={<Images size={36} strokeWidth={2} color="#000" />} label="Gallery" color="#000" fontSize={13} />
              </button>
              <button onClick={() => handlePress("cyan")} className="transition-all duration-150 active:scale-95 focus:outline-none flex-1 flex items-center justify-center" style={{ background: "#00C8D7", filter: dim("cyan") }}>
                <BtnLabel icon={<Clapperboard size={16} strokeWidth={2.5} color="#000" />} label="Behind the Scene" color="#000" direction="row" fontSize={10} />
              </button>
              <button onClick={() => handlePress("green")} className="transition-all duration-150 active:scale-95 focus:outline-none flex-1 flex items-center justify-center" style={{ background: "#1DB954", filter: dim("green") }}>
                <BtnLabel icon={<Instagram size={16} strokeWidth={2.5} />} label="Follow us on Instagram" direction="row" fontSize={10} />
              </button>
              <button onClick={() => handlePress("orange")} className="transition-all duration-150 active:scale-95 focus:outline-none flex-1 flex items-center justify-center" style={{ background: "#E8651A", filter: dim("orange") }}>
                <BtnLabel icon={<Users size={16} strokeWidth={2.5} />} label="Family Discount" direction="row" fontSize={10} />
              </button>
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex" style={{ height: "120px" }}>
            <button onClick={() => handlePress("pink")} className="transition-all duration-150 active:scale-95 focus:outline-none flex items-center justify-center" style={{ background: "#F76FB0", flex: "1 1 50%", filter: dim("pink") }}>
              <BtnLabel icon={<Phone size={28} strokeWidth={2.5} />} label="Call" fontSize={12} />
            </button>
            <button onClick={() => handlePress("black")} className="transition-all duration-150 active:scale-95 focus:outline-none flex items-center justify-center" style={{ background: "#000000", flex: "1 1 50%", filter: dim("black") }}>
              <BtnLabel icon={<MessageCircle size={28} strokeWidth={2.5} />} label="WhatsApp" fontSize={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
