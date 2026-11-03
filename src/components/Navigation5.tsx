import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  CreditCard,
  BookOpen,
  FileText,
  Info,
  HelpCircle,
  Shield,
  Lock,
  LogIn,
  UserPlus,
  ExternalLink,
  Instagram,
  MessageCircle,
  Users,
  TrendingUp,
  Globe,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

interface Navigation5Props {
  user?: any;
  onOpenAuthModal: (title?: string) => void;
  onGoogleSignIn?: () => void;
  onDashboardClick?: () => void;
}

const FEATURE_ITEMS = [
  {
    icon: Sparkles,
    title: 'AI Selfie Finder',
    desc: 'Instant QR selfie facial recognition photo delivery for guests.',
  },
  {
    icon: MessageSquare,
    title: 'Instagram Comment-to-DM',
    desc: 'Automated public replies and instant private DMs on Reels & posts.',
  },
  {
    icon: Users,
    title: 'Instant Lead Capture',
    desc: 'Convert event attendees into verified WhatsApp & Instagram leads.',
  },
  {
    icon: Globe,
    title: 'Live Branded Galleries',
    desc: '70+ customizable themes with custom domains and instant sharing.',
  },
  {
    icon: TrendingUp,
    title: 'Brand Equity & Reviews',
    desc: 'Automated Google reviews, social growth, and retention broadcasts.',
  },
  {
    icon: BarChart3,
    title: 'Conversion Analytics',
    desc: 'Real-time tracking of gallery views, DM engagement, and ROI.',
  },
];

const PRICING_TIERS = [
  {
    name: 'Standard Plan',
    price: '₹999',
    period: '/mo',
    billing: 'Billed ₹5,994 every 6 months',
    storage: '500 GB Storage',
    highlights: [
      'AI Selfie Finder & Instant Gallery',
      'Instagram & WhatsApp Automation Bot',
      'Custom Domain & 70+ Themes',
      'Lead Capture & Retention Broadcasts',
    ],
  },
  {
    name: 'Pro Plan (Best Value)',
    price: '₹899',
    period: '/mo',
    billing: 'Billed ₹10,788 every 12 months (2 Months Free)',
    storage: '1 TB Storage',
    featured: true,
    highlights: [
      'Everything in Standard + 1 TB Storage',
      'Unlimited Comment-to-DM Workflows',
      'AI Creatives & Smart Scheduler',
      'Priority Growth & Engagement Analytics',
    ],
  },
];

export default function Navigation5({
  user,
  onOpenAuthModal,
  onGoogleSignIn,
  onDashboardClick,
}: Navigation5Props) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'features' | 'pricing'>('menu');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const openSection = (tab: 'menu' | 'features' | 'pricing') => {
    if (isOpen && activeTab === tab) {
      setIsOpen(false);
    } else {
      setActiveTab(tab);
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Backdrop Scrim when expanded */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>

      {/* Navigation 5 Bottom Expanding Container */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-4xl pointer-events-none flex flex-col items-center">
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 340,
            damping: 32,
            mass: 0.8,
          }}
          className="w-full pointer-events-auto bg-[#111113]/95 backdrop-blur-2xl border border-white/15 shadow-[0_24px_80px_rgba(0,0,0,0.9)] rounded-3xl overflow-hidden text-white"
        >
          {/* Expanded Menu Content */}
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="p-6 sm:p-8 border-b border-white/10 max-h-[76vh] overflow-y-auto"
              >
                {/* Top Sub-Navigation Header inside Expanded Panel */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
                  <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setActiveTab('menu')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        activeTab === 'menu'
                          ? 'bg-white text-neutral-900 font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      All Navigation
                    </button>
                    <button
                      onClick={() => setActiveTab('features')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        activeTab === 'features'
                          ? 'bg-white text-neutral-900 font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Features
                    </button>
                    <button
                      onClick={() => setActiveTab('pricing')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        activeTab === 'pricing'
                          ? 'bg-white text-neutral-900 font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Pricing
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenAuthModal('Log In');
                        navigate('/login');
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white border border-white/15 hover:border-white/30 transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onOpenAuthModal('Sign Up');
                        navigate('/login');
                      }}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#4A6DE1] hover:bg-[#3b5bdb] text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up</span>
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      aria-label="Close menu"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* TAB 1: FULL DIRECTORY MENU */}
                {activeTab === 'menu' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Column 1: Platform & Product */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                          01. Platform
                        </p>
                        <ul className="space-y-2">
                          <li>
                            <button
                              onClick={() => setActiveTab('features')}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Features
                              </span>
                              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => setActiveTab('pricing')}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Pricing & Plans
                              </span>
                              <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleNavigate('/payment')}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Pay Now / Checkout
                              </span>
                              <CreditCard className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                if (user) {
                                  navigate('/dashboard/automations');
                                } else {
                                  onOpenAuthModal('Instagram Automation');
                                  navigate('/login');
                                }
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                IG Automations
                              </span>
                              <Sparkles className="w-3.5 h-3.5 text-[#4A6DE1]" />
                            </button>
                          </li>
                        </ul>
                      </div>

                      {/* Column 2: Resources & Insights */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                          02. Resources
                        </p>
                        <ul className="space-y-2">
                          <li>
                            <button
                              onClick={() => handleNavigate('/knowledge-base')}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Knowledge Base
                              </span>
                              <BookOpen className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleNavigate('/blogs')}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Blogs
                              </span>
                              <FileText className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleNavigate('/about')}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                About Us
                              </span>
                              <Info className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleNavigate('/faq')}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                FAQ
                              </span>
                              <HelpCircle className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>
                          </li>
                        </ul>
                      </div>

                      {/* Column 3: Company & Story */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                          03. Editorial & Account
                        </p>
                        <ul className="space-y-2">
                          <li>
                            <a
                              href="/story.html"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Our Story
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/why-candei.html"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Why Candei
                              </span>
                              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </a>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                onOpenAuthModal('Log In');
                                navigate('/login');
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Log In / Sign Up
                              </span>
                              <LogIn className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                onOpenAuthModal('Reviewer Test Account');
                                navigate('/login');
                              }}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-pink-400 group-hover:text-pink-300 font-medium">
                                Reviewer Login
                              </span>
                              <Lock className="w-3.5 h-3.5 text-pink-400" />
                            </button>
                          </li>
                        </ul>
                      </div>

                      {/* Column 4: Legal & Compliance */}
                      <div className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                          04. Legal & Compliance
                        </p>
                        <ul className="space-y-2">
                          <li>
                            <a
                              href="/terms.html"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Terms of Service
                              </span>
                              <Shield className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="/privacy.html"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Privacy Policy
                              </span>
                              <Lock className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://wa.me/919318465272"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                WhatsApp Support
                              </span>
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            </a>
                          </li>
                          <li>
                            <a
                              href="https://www.instagram.com/get_candei?igsh=a3NneHRpYXQ5anln"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                              className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between group"
                            >
                              <span className="text-sm text-neutral-200 group-hover:text-white font-medium">
                                Instagram
                              </span>
                              <Instagram className="w-3.5 h-3.5 text-pink-400" />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Quick Action Bar inside Expanded Menu */}
                    <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-xs text-neutral-400">
                        <span>© {new Date().getFullYear()} Candei OS</span>
                        <span className="mx-2">·</span>
                        <span>Meta Official API Compliant</span>
                        <span className="mx-2">·</span>
                        <span>System Operational</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                        {onGoogleSignIn && (
                          <button
                            onClick={() => {
                              setIsOpen(false);
                              onGoogleSignIn();
                            }}
                            className="px-4 py-2 rounded-xl bg-white text-neutral-900 text-xs font-semibold hover:bg-neutral-200 transition-colors whitespace-nowrap"
                          >
                            Continue with Google
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            onOpenAuthModal('Get Started');
                            navigate('/login');
                          }}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                        >
                          Get Started
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: FEATURES SHOWCASE */}
                {activeTab === 'features' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-serif text-white">
                          Candei OS Core Capabilities
                        </h3>
                        <p className="text-xs text-neutral-400">
                          AI computer vision galleries, instant lead capture, and automated Meta Instagram workflows.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onOpenAuthModal('Get Started');
                          navigate('/login');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#4A6DE1] hover:bg-[#3b5bdb] text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        Start Free Setup
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {FEATURE_ITEMS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#4A6DE1]/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-[#4A6DE1]/15 text-[#A5BDFC] flex items-center justify-center mb-3">
                              <Icon className="w-4 h-4" />
                            </div>
                            <h4 className="text-sm font-semibold text-white mb-1">
                              {item.title}
                            </h4>
                            <p className="text-xs text-neutral-400 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: PRICING OVERVIEW */}
                {activeTab === 'pricing' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-serif text-white">
                          Simple, Transparent Plans
                        </h3>
                        <p className="text-xs text-neutral-400">
                          All 18+ AI gallery, WhatsApp bot, and Instagram automation tools included.
                        </p>
                      </div>
                      <button
                        onClick={() => handleNavigate('/payment')}
                        className="px-4 py-2 rounded-xl bg-white text-neutral-900 hover:bg-neutral-200 text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        Open Full Checkout →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {PRICING_TIERS.map((tier, idx) => (
                        <div
                          key={idx}
                          className={`p-5 rounded-2xl border flex flex-col justify-between ${
                            tier.featured
                              ? 'bg-[#141824]/90 border-blue-500/40'
                              : 'bg-white/[0.03] border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                                {tier.name}
                              </span>
                              <span className="text-xs text-emerald-400 font-medium">
                                {tier.storage}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-1 tabular-nums">
                              <span className="text-3xl font-serif text-white">
                                {tier.price}
                              </span>
                              <span className="text-xs text-neutral-400">
                                {tier.period}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mb-4">
                              {tier.billing}
                            </p>
                            <ul className="space-y-2 mb-5">
                              {tier.highlights.map((h, i) => (
                                <li
                                  key={i}
                                  className="flex items-center gap-2 text-xs text-neutral-300"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6DE1] shrink-0" />
                                  <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleNavigate('/payment')}
                              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors ${
                                tier.featured
                                  ? 'bg-[#4A6DE1] hover:bg-[#3b5bdb] text-white'
                                  : 'bg-white/10 hover:bg-white/20 text-white'
                              }`}
                            >
                              Select {tier.name.split(' ')[0]}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Dock Bar (Always Visible) */}
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
            {/* Brand Logo */}
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.25)] group-hover:rotate-180 transition-transform duration-500">
                <Camera className="w-4 h-4 text-neutral-900" />
              </div>
              <span className="text-xs font-bold tracking-[0.25em] uppercase text-white whitespace-nowrap">
                Candei OS
              </span>
            </button>

            {/* Quick Links in Bottom Bar (Desktop / Tablet) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-xs font-medium text-neutral-300">
              <button
                onClick={() => openSection('features')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isOpen && activeTab === 'features'
                    ? 'bg-white/15 text-white'
                    : 'hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => openSection('pricing')}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  isOpen && activeTab === 'pricing'
                    ? 'bg-white/15 text-white'
                    : 'hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => handleNavigate('/knowledge-base')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                Knowledge Base
              </button>
              <button
                onClick={() => handleNavigate('/blogs')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                Blogs
              </button>
              <button
                onClick={() => handleNavigate('/about')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                About
              </button>
              <button
                onClick={() => handleNavigate('/faq')}
                className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-white/[0.06] transition-colors whitespace-nowrap"
              >
                FAQ
              </button>
            </nav>

            {/* Right Controls: Auth + Expand Menu Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              {user && onDashboardClick && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onDashboardClick();
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors whitespace-nowrap"
                >
                  Dashboard
                </button>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuthModal('Log In');
                  navigate('/login');
                }}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:text-white hover:bg-white/10 border border-white/10 transition-colors whitespace-nowrap"
              >
                Log In
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenAuthModal('Sign Up');
                  navigate('/login');
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#4A6DE1] hover:bg-[#3b5bdb] text-white transition-colors whitespace-nowrap"
              >
                Sign Up
              </button>

              <button
                onClick={() => openSection('menu')}
                aria-expanded={isOpen}
                aria-label="Toggle full navigation menu"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 whitespace-nowrap ${
                  isOpen
                    ? 'bg-white text-neutral-900 border-white'
                    : 'bg-white/[0.08] hover:bg-white/[0.15] text-white border-white/15'
                }`}
              >
                {isOpen ? (
                  <>
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <Menu className="w-4 h-4" />
                    <span>Menu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
