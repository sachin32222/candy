import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Instagram, Settings, ArrowLeft, CheckCircle, ExternalLink, Zap, Clock, Users, PlayCircle, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Integrations() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  
  const [waConnected, setWaConnected] = useState(false);
  const [igConnected, setIgConnected] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  const [showIgModal, setShowIgModal] = useState(false);
  
  const [savingWa, setSavingWa] = useState(false);
  const [savingIg, setSavingIg] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.waAppId || profile.waToken) {
        setWaConnected(true);
      } else {
        setWaConnected(false);
      }
      
      if (profile.igAppId || profile.igToken) {
        setIgConnected(true);
      } else {
        setIgConnected(false);
      }
    }
  }, [profile]);

  const handleSaveWa = async () => {
    setSavingWa(true);
    try {
      await updateProfile({
        waAppId: '1090179470293810',
        waAppSecret: 'b3bbe58e977ddb226d3cabd457ef8b6d',
        waPhoneNumberId: 'simulated_phone_id',
        waToken: 'simulated_wa_token'
      });
      setShowWaModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWa(false);
    }
  };

  const handleSaveIg = async () => {
    setSavingIg(true);
    try {
      await updateProfile({
        igAppId: '1090179470293810',
        igAppSecret: 'b3bbe58e977ddb226d3cabd457ef8b6d',
        igAccountId: 'simulated_account_id',
        igToken: 'simulated_ig_token'
      });
      setShowIgModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingIg(false);
    }
  };

  const handleDisconnectWa = async () => {
    await updateProfile({
      waAppId: '',
      waAppSecret: '',
      waPhoneNumberId: '',
      waToken: ''
    });
  };

  const handleDisconnectIg = async () => {
    await updateProfile({
      igAppId: '',
      igAppSecret: '',
      igAccountId: '',
      igToken: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans text-white">
      {/* Nav */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-[#333] sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 mr-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-xs tracking-widest uppercase font-medium">Back to Dashboard</span>
            </button>
            <span className="text-xl font-serif text-white tracking-tight">Candei.</span>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-serif tracking-tight mb-4">Marketing Automations</h1>
          <p className="text-neutral-400 text-lg max-w-2xl font-light">
            Connect your WhatsApp and Instagram accounts to automate follow-ups, send 1-click broadcasts to all event attendees, and manage automatic DM replies.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* WhatsApp Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`border rounded-3xl p-8 relative overflow-hidden transition-all ${waConnected ? 'bg-gradient-to-br from-[#0f1f18] to-[#121212] border-emerald-500/30' : 'bg-[#161819] border-[#333]'}`}
          >
            {waConnected && (
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle className="w-4 h-4" /> Connected
                </div>
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${waConnected ? 'bg-emerald-500' : 'bg-[#222]'}`}>
              <MessageCircle className={`w-7 h-7 ${waConnected ? 'text-white' : 'text-neutral-400'}`} />
            </div>
            
            <h2 className="text-2xl font-serif tracking-tight mb-2">WhatsApp API</h2>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
              Automate welcome messages, gallery delivery links, and broadcast promotions to everyone who scanned your event QR code.
            </p>

            {waConnected ? (
              <div className="space-y-4">
                <button className="w-full bg-[#1a1a1a] border border-[#333] hover:bg-[#222] text-white py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <PlayCircle className="w-5 h-5 text-emerald-400" />
                    <span>New Broadcast</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 group-hover:text-neutral-300">Start</span>
                </button>
                <button className="w-full bg-[#1a1a1a] border border-[#333] hover:bg-[#222] text-white py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-neutral-400" />
                    <span>Auto-Reply Rules</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 group-hover:text-neutral-300">Edit</span>
                </button>
                <div className="pt-4 mt-4 border-t border-[#333] flex justify-between items-center">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-widest">Status: Active</span>
                  <button onClick={handleDisconnectWa} className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-medium">Disconnect</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowWaModal(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                <MessageCircle className="w-5 h-5" />
                Connect WhatsApp Business
              </button>
            )}
          </motion.div>

          {/* Instagram Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`border rounded-3xl p-8 relative overflow-hidden transition-all ${igConnected ? 'bg-gradient-to-br from-[#2a1324] to-[#121212] border-fuchsia-500/30' : 'bg-[#161819] border-[#333]'}`}
          >
            {igConnected && (
              <div className="absolute top-0 right-0 p-8">
                <div className="flex items-center gap-2 text-fuchsia-400 bg-fuchsia-400/10 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <CheckCircle className="w-4 h-4" /> Connected
                </div>
              </div>
            )}
            
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${igConnected ? 'bg-gradient-to-tr from-yellow-400 via-fuchsia-500 to-indigo-500' : 'bg-[#222]'}`}>
              <Instagram className={`w-7 h-7 ${igConnected ? 'text-white' : 'text-neutral-400'}`} />
            </div>
            
            <h2 className="text-2xl font-serif tracking-tight mb-2">Instagram Direct</h2>
            <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
              Auto-DM users who mention you in their stories, reply to common questions, and convert followers to booked leads.
            </p>

            {igConnected ? (
              <div className="space-y-4">
                <button 
                  onClick={() => navigate('/dashboard/automations')}
                  className="w-full bg-[#1a1a1a] border border-[#333] hover:bg-[#222] text-white py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-fuchsia-400" />
                    <span>Automation Rules Engine</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-pink-400 group-hover:text-pink-300 font-semibold">Manage Rules →</span>
                </button>
                <button 
                  onClick={() => navigate('/dashboard/automations')}
                  className="w-full bg-[#1a1a1a] border border-[#333] hover:bg-[#222] text-white py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-neutral-400" />
                    <span>Keyword Auto-Replies</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500 group-hover:text-neutral-300">Edit</span>
                </button>
                <div className="pt-4 mt-4 border-t border-[#333] flex justify-between items-center">
                  <span className="text-[11px] text-neutral-500 uppercase tracking-widest">Status: Active</span>
                  <button onClick={handleDisconnectIg} className="text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest font-medium">Disconnect</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/dashboard/automations')}
                  className="w-full bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 hover:from-fuchsia-500 hover:to-fuchsia-400 text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,70,239,0.2)]"
                >
                  <Instagram className="w-5 h-5" />
                  Connect & Setup Automations
                </button>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Help/Instruction Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-[#333] bg-[#1a1a1a]/50 rounded-3xl p-8 max-w-4xl"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#0D94FB]/10 flex items-center justify-center flex-shrink-0 mt-1">
              <ExternalLink className="w-5 h-5 text-[#0D94FB]" />
            </div>
            <div>
              <h3 className="text-xl font-serif text-white mb-2">Meta Developer Setup Instructions</h3>
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                To fully enable WhatsApp and Instagram Messaging API integrations, you will need to complete these steps in your Meta Developer console to connect your business app to Candei OS. Once you have the credentials, our system will link them.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <h4 className="text-sm text-white font-medium mb-1">Create a Meta Free App</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">Go to <a href="https://developers.facebook.com" className="text-emerald-400 hover:text-emerald-300 underline" target="_blank" rel="noopener noreferrer">developers.facebook.com</a>, create a Business App, and add the "WhatsApp" and "Instagram Graph API" products to your app. Ensure your Instagram account is a Professional Account linked to a Facebook Page.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <h4 className="text-sm text-white font-medium mb-1">Configure Webhooks</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">For automatic replies to work, you must point your webhook URL to Candei's secure endpoint. You will need to subscribe to `messages` for WhatsApp, and `messages` and `messaging_postbacks` for Instagram.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#333] flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <h4 className="text-sm text-white font-medium mb-1">Generate Permanent Tokens</h4>
                    <p className="text-xs text-neutral-500 leading-relaxed">Use the System User tool inside Meta Business Manager to generate a long-lived access token with `whatsapp_business_messaging`, `instagram_basic`, and `instagram_manage_messages` permissions. We will need this <strong>System User Access Token</strong>, your <strong>WhatsApp Phone Number ID</strong>, and your <strong>Instagram Account ID</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </main>

      {/* WhatsApp Modal */}
      <AnimatePresence>
        {showWaModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#111] border border-[#333] rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative my-8 text-center"
            >
              <button 
                onClick={() => setShowWaModal(false)}
                className="absolute top-6 right-6 text-[#666] hover:text-white transition-colors"
                disabled={savingWa}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-serif text-white mb-2">Connect WhatsApp</h2>
              <p className="text-neutral-400 text-sm mb-8">
                You will be redirected to Meta to securely authenticate your WhatsApp Business account.
              </p>
              
              <button 
                onClick={() => {
                  setSavingWa(true);
                  // Simulate an OAuth redirect and return
                  setTimeout(() => {
                    handleSaveWa();
                  }, 2500);
                }}
                disabled={savingWa}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {savingWa ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Continue with Facebook
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instagram Modal */}
      <AnimatePresence>
        {showIgModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#111] border border-[#333] rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative my-8 text-center"
            >
              <button 
                onClick={() => setShowIgModal(false)}
                className="absolute top-6 right-6 text-[#666] hover:text-white transition-colors"
                disabled={savingIg}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-yellow-400 via-fuchsia-500 to-indigo-500 flex items-center justify-center mb-6">
                <Instagram className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-2xl font-serif text-white mb-2">Connect Instagram</h2>
              <p className="text-neutral-400 text-sm mb-8">
                You will be redirected to Meta to securely authenticate your Instagram Professional account.
              </p>
              
              <button 
                onClick={() => {
                  setSavingIg(true);
                  setTimeout(() => {
                    handleSaveIg();
                  }, 2500);
                }}
                disabled={savingIg}
                className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white py-4 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {savingIg ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Continue with Facebook
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
