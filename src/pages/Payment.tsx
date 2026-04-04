import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { CheckCircle2, ShieldCheck, Zap, Clock } from 'lucide-react';

export default function Payment() {
  const { profile, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      await updateProfile({ paymentStatus: 'initiated' });
      
      // Redirect to WhatsApp
      const phoneNumber = '+919318465272';
      const message = `Hi, I want to pay ₹499 for the Candy early bird yearly subscription. My email is ${profile?.email} and my WhatsApp number is ${profile?.whatsapp || ''}.`;
      const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      navigate('/dashboard'); // This will show a pending approval screen since status is initiated
    } catch (error) {
      console.error('Error initiating payment:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.paymentStatus === 'approved') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  if (profile?.paymentStatus === 'approved') {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
            <Zap className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">Early Bird Access</h1>
          <p className="text-white/60 font-light">Join the first 100 photographers to unlock Candy's premium features.</p>
        </div>

        {profile?.paymentStatus === 'initiated' ? (
          <div className="bg-black/40 rounded-xl p-8 mb-8 border border-amber-500/30 text-center">
            <Clock className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Pending Approval</h3>
            <p className="text-white/70 font-light text-sm">
              We've received your request. Once your payment is verified via WhatsApp, your account will be approved.
            </p>
            <button
              onClick={handlePay}
              className="mt-6 text-amber-400 hover:text-amber-300 text-sm transition-colors underline"
            >
              Message us again on WhatsApp
            </button>
          </div>
        ) : (
          <>
            <div className="bg-black/40 rounded-xl p-6 mb-8 border border-white/5">
              <div className="flex justify-between items-end mb-4">
                <span className="text-white/80 font-medium">Yearly Subscription</span>
                <div className="text-right">
                  <span className="text-sm text-white/40 line-through block">₹4,999</span>
                  <span className="text-3xl font-serif text-amber-400">₹499</span>
                </div>
              </div>
              
              <ul className="space-y-3 mt-6 border-t border-white/10 pt-6">
                <li className="flex items-center gap-3 text-white/70 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Unlimited Events
                </li>
                <li className="flex items-center gap-3 text-white/70 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Unlimited Lead Generation
                </li>
                <li className="flex items-center gap-3 text-white/70 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Direct Google Drive Integration
                </li>
                <li className="flex items-center gap-3 text-white/70 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" /> Custom Branding
                </li>
              </ul>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-medium hover:from-amber-400 hover:to-orange-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Pay ₹499 via WhatsApp'}
            </button>
          </>
        )}

        <div className="mt-6 text-center flex items-center justify-center gap-2 text-white/40 text-xs font-light">
          <ShieldCheck className="w-4 h-4" /> Secure payment process
        </div>
        
        <div className="mt-6 text-center">
          <button onClick={logout} className="text-white/40 hover:text-white/60 text-sm transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
