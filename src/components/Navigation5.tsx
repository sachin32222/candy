import React, { useState, useEffect } from 'react';
import {
  Camera,
  Menu,
  X,
  Video,
  VideoOff,
  RefreshCw,
  CreditCard,
  BookOpen,
  FileText,
  Info,
  Sparkles,
  HelpCircle,
  Instagram,
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Navigation5Props {
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  onSwitchCamera: () => void;
  onNavigate: (path: string) => void;
  onSignIn?: () => void;
  user?: any;
  onDashboard?: () => void;
}

export default function Navigation5({
  isLiveMode,
  onToggleLiveMode,
  onSwitchCamera,
  onNavigate,
  onSignIn,
  user,
  onDashboard,
}: Navigation5Props) {
  const [isOpen, setIsOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const primaryLinks = [
    {
      label: 'Pay Now',
      subtitle: 'Unlock Candei OS plans & instant gallery automation',
      icon: CreditCard,
      badge: 'Pro',
      onClick: () => {
        setIsOpen(false);
        onNavigate('/payment');
      },
    },
    {
      label: 'About Us',
      subtitle: 'Meet the team building the core system for photographers',
      icon: Info,
      onClick: () => {
        setIsOpen(false);
        onNavigate('/about');
      },
    },
    {
      label: 'Our Story',
      subtitle: 'How Candei OS started and our mission',
      icon: Sparkles,
      href: '/story.html',
    },
    {
      label: 'Why Candei',
      subtitle: 'See why 24,000+ elite photographers choose Candei OS',
      icon: ShieldCheck,
      href: '/why-candei.html',
    },
  ];

  const resourceLinks = [
    {
      label: 'Knowledge Base',
      subtitle: 'Guides, tutorials & documentation',
      icon: BookOpen,
      onClick: () => {
        setIsOpen(false);
        onNavigate('/knowledge-base');
      },
    },
    {
      label: 'Blogs',
      subtitle: 'AI photography, lead gen & growth insights',
      icon: FileText,
      onClick: () => {
        setIsOpen(false);
        onNavigate('/blogs');
      },
    },
    {
      label: 'FAQ',
      subtitle: 'Answers to common platform questions',
      icon: HelpCircle,
      onClick: () => {
        setIsOpen(false);
        onNavigate('/faq');
      },
    },
  ];

  return (
    <>
      {/* Backdrop overlay when Bottom Nav is expanded into Full Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Navigation 5: Bottom nav that expands into a full menu */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-3xl pointer-events-auto">
        <motion.nav
          layout
          transition={{
            type: 'spring',
            stiffness: 340,
            damping: 32,
          }}
          className="bg-[#121212]/95 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden text-white"
        >
          {/* Expanded Full Menu Content ( unfolds upward from bottom nav ) */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="expanded-menu"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden border-b border-white/10"
              >
                <div className="p-5 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
                  {/* Top Header Row inside Expanded Menu: Brand + Live Me Interactive Feature */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        <Camera className="w-5 h-5 text-neutral-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tracking-[0.25em] uppercase text-white">
                            Candei OS
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            v2.0 Live
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          AI Operating System for Event Photographers
                        </p>
                      </div>
                    </div>

                    {/* Interactive Live Me Card inside Full Menu */}
                    <div className="flex items-center gap-2 bg-[#1b1b1b] p-2 rounded-2xl border border-white/10">
                      <div className="px-2.5 py-1">
                        <p className="text-[11px] font-semibold text-white leading-tight">
                          Live Camera Mode
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {isLiveMode ? 'Camera active on background' : 'Try live camera background'}
                        </p>
                      </div>

                      {isLiveMode && (
                        <button
                          onClick={onSwitchCamera}
                          title="Switch Camera"
                          className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={onToggleLiveMode}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all border ${
                          isLiveMode
                            ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                        }`}
                      >
                        {isLiveMode ? (
                          <VideoOff className="w-4 h-4" />
                        ) : (
                          <Video className="w-4 h-4" />
                        )}
                        <span>{isLiveMode ? 'Turn Off Live' : 'Live Me'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Two-Column Navigation Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Platform & Story */}
                    <div className="space-y-2.5">
                      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 px-1">
                        Platform & Story
                      </p>
                      <div className="space-y-2">
                        {primaryLinks.map((item, idx) => {
                          const Icon = item.icon;
                          if (item.href) {
                            return (
                              <a
                                key={idx}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1a1a] hover:bg-[#222222] border border-white/5 hover:border-white/20 transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-white/5 text-neutral-300 group-hover:text-white group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-white flex items-center gap-2">
                                      {item.label}
                                    </span>
                                    <span className="text-xs text-neutral-400 line-clamp-1">
                                      {item.subtitle}
                                    </span>
                                  </div>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                              </a>
                            );
                          }
                          return (
                            <button
                              key={idx}
                              onClick={item.onClick}
                              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1a1a] hover:bg-[#222222] border border-white/5 hover:border-white/20 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/5 text-neutral-300 group-hover:text-white group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-white flex items-center gap-2">
                                    {item.label}
                                    {item.badge && (
                                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-[#4A6DE1]/25 text-[#A5BDFC] border border-[#4A6DE1]/40 rounded-full">
                                        {item.badge}
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-xs text-neutral-400 line-clamp-1">
                                    {item.subtitle}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Column 2: Resources & Quick Access */}
                    <div className="space-y-2.5 flex flex-col justify-between">
                      <div className="space-y-2">
                        <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-neutral-500 px-1">
                          Resources & Hub
                        </p>
                        {resourceLinks.map((item, idx) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={idx}
                              onClick={item.onClick}
                              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[#1a1a1a] hover:bg-[#222222] border border-white/5 hover:border-white/20 transition-all text-left group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/5 text-neutral-300 group-hover:text-white group-hover:bg-white/10 flex items-center justify-center transition-colors">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-white block">
                                    {item.label}
                                  </span>
                                  <span className="text-xs text-neutral-400 line-clamp-1">
                                    {item.subtitle}
                                  </span>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Account CTA inside expanded menu */}
                      <div className="pt-2">
                        {user && onDashboard ? (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onDashboard();
                            }}
                            className="w-full py-3.5 px-5 rounded-2xl bg-white text-neutral-900 font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Open Dashboard</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          onSignIn && (
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                onSignIn();
                              }}
                              className="w-full py-3.5 px-5 rounded-2xl bg-white text-neutral-900 font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                              <span>Continue with Google</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Menu Footer: Socials + Legal */}
                  <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-4">
                      <a
                        href="https://www.instagram.com/get_candei?igsh=a3NneHRpYXQ5anln"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-fuchsia-400 transition-colors"
                      >
                        <Instagram className="w-4 h-4" />
                        <span>Instagram</span>
                      </a>
                      <a
                        href="https://wa.me/919318465272"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                      >
                        <span>WhatsApp Support</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider">
                      <a
                        href="/terms.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        Terms
                      </a>
                      <span>/</span>
                      <a
                        href="/privacy.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors"
                      >
                        Privacy
                      </a>
                      <span>/</span>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onNavigate('/faq');
                        }}
                        className="hover:text-white transition-colors uppercase"
                      >
                        FAQ
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Always-Visible Bottom Navigation Bar */}
          <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2">
            {/* Left: Brand Pill */}
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-2xl hover:bg-white/5 transition-colors group"
            >
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)] flex-shrink-0"
              >
                <Camera className="w-4 h-4 text-neutral-900" />
              </motion.div>
              <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-white hidden sm:inline">
                Candei OS
              </span>
            </button>

            {/* Center: Quick Nav Links on Desktop */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('/payment');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Pay Now
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('/about');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
              >
                About Us
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('/knowledge-base');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Knowledge Base
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate('/blogs');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Blogs
              </button>
            </div>

            {/* Right: Live Me Button + Expand Full Menu Button */}
            <div className="flex items-center gap-2">
              {isLiveMode && (
                <button
                  onClick={onSwitchCamera}
                  title="Switch Camera"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={onToggleLiveMode}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-medium text-xs tracking-wide transition-all border ${
                  isLiveMode
                    ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {isLiveMode ? <VideoOff className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                <span>{isLiveMode ? 'Turn Off Live' : 'Live Me'}</span>
              </button>

              <button
                onClick={() => setIsOpen((prev) => !prev)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close full menu' : 'Expand full menu'}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                  isOpen
                    ? 'bg-white text-neutral-900 border-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
              >
                {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                <span>{isOpen ? 'Close' : 'Menu'}</span>
              </button>
            </div>
          </div>
        </motion.nav>
      </div>
    </>
  );
}
