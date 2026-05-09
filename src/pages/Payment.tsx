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
      const message = `Hi, I am interested in Candei and would like to contact sales. My email is ${profile?.email} and my WhatsApp number is ${profile?.whatsapp || ''}.`;
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
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0f0f0f] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#333]">
            <Zap className="w-8 h-8 text-neutral-400" />
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">Early Bird Access</h1>
          <p className="text-neutral-500 font-light">Join the first 100 photographers to unlock Candei's premium features.</p>
        </div>

        {profile?.paymentStatus === 'initiated' ? (
          <div className="bg-[#0f0f0f] rounded-2xl p-8 mb-8 border border-[#333] text-center">
            <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Pending Approval</h3>
            <p className="text-neutral-500 font-light text-sm leading-relaxed">
              We've received your request. Our sales team will assist you via WhatsApp to activate your account.
            </p>
            <button
              onClick={handlePay}
              className="mt-6 text-white hover:text-neutral-300 text-sm transition-colors underline underline-offset-4"
            >
              Message us again on WhatsApp
            </button>
          </div>
        ) : (
          <>
            <div className="bg-[#0f0f0f] rounded-2xl p-6 mb-8 border border-[#333]">
              <div className="flex justify-between items-end mb-4">
                <span className="text-neutral-300 font-medium tracking-wide">Yearly Subscription</span>
                <div className="text-right">
                  <span className="text-xl font-serif text-white">Contact Sales</span>
                </div>
              </div>
              
              <ul className="space-y-3 mt-6 border-t border-[#333] pt-6">
                <li className="flex items-center gap-3 text-neutral-400 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-white" /> Unlimited Events
                </li>
                <li className="flex items-center gap-3 text-neutral-400 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-white" /> Unlimited Lead Generation
                </li>
                <li className="flex items-center gap-3 text-neutral-400 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-white" /> Direct Google Drive Integration
                </li>
                <li className="flex items-center gap-3 text-neutral-400 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-white" /> Custom Branding
                </li>
              </ul>
            </div>

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full bg-neutral-100 text-neutral-900 py-4 rounded-full font-medium hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Contact Sales via WhatsApp'}
            </button>
          </>
        )}

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-neutral-600 text-xs font-medium tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" /> Secure payment process
        </div>
        
        <div className="mt-8 text-center">
          <button onClick={logout} className="text-neutral-500 hover:text-white text-xs font-semibold tracking-widest uppercase transition-colors">
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
