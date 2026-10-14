import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { CheckCircle2, ShieldCheck, Zap, Star } from 'lucide-react';

import { auth } from '../firebase';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const { user, profile, updateProfile, signIn, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = async (plan: string, amountPaise: number) => {
    setLoading(plan);
    try {
      if (!window.Razorpay) throw new Error("Razorpay SDK not loaded. Check your connection or disable adblock.");

      // For static site deployments (like custom domains on Netlify/Firebase), 
      // we use client-side only checkout without order_id and signature verification.
      // Note: This is less secure but works for static deployments.
      const options = {
        key: "rzp_live_SzqRSW7PoAIHkz",
        amount: amountPaise,
        currency: "INR",
        name: "Candei",
        description: `Candei Subscription - ${plan}`,
        prefill: {
          name: auth.currentUser?.displayName || profile?.name || "",
          email: auth.currentUser?.email || profile?.email || "",
          contact: profile?.whatsapp || "",
        },
        theme: {
          color: "#4A6DE1",
        },
        handler: async function (response: any) {
          try {
            if (!auth.currentUser) {
              await signIn();
            }
            await updateProfile({ paymentStatus: 'approved', subscriptionPlan: plan, razorpay_payment_id: response.razorpay_payment_id });
            navigate('/dashboard');
          } catch (e) {
            console.error(e);
            alert("Error updating profile after payment.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(response.error.description);
      });
      rzp.open();

    } catch (error: any) {
      console.error('Error initiating payment:', error);
      alert(`Checkout Error: ${error.message || "Unknown error occurred"}`);
    } finally {
      setLoading(null);
    }
  };

  const commonFeatures = [
    "AI Selfie Finder",
    "Instant Gallery",
    "Custom Domain",
    "Business Branding",
    "Bulk Upload",
    "Lead Capture",
    "AI Automation",
    "WhatsApp Bot",
    "Instagram Bot",
    "Social Growth",
    "AI Creatives",
    "Retention Broadcast",
    "One Click Share and Save",
    "Growth Analytics",
    "Branded Portfolio",
    "Smart Scheduler",
    "Engagement Analytics",
    "Customize Theme 70+"
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6 font-sans py-20">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#0f0f0f] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#333]">
            <Zap className="w-8 h-8 text-neutral-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Choose Your Plan</h1>
          <p className="text-neutral-500 font-light text-lg">Unlock all premium photography automation features.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 6 Months Plan */}
          <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 shadow-2xl relative flex flex-col justify-between hover:border-[#555] transition-colors">
            <div>
              <div className="mb-8">
                <span className="text-emerald-400 font-semibold tracking-wide uppercase text-sm">Standard</span>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-4xl font-serif text-white">₹999</span>
                  <span className="text-neutral-500 mb-1">/mo</span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">Billed ₹5,994 every 6 months</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-white font-medium text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> 
                  500 GB Storage
                </li>
                {commonFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-400 font-light text-sm">
                    <CheckCircle2 className="w-5 h-5 text-neutral-600 shrink-0" /> 
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handlePay('6_months', 599400)}
              disabled={loading !== null}
              className="w-full bg-neutral-800 text-white py-4 rounded-full font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading === '6_months' ? 'Processing...' : 'Choose Standard'}
            </button>
          </div>

          {/* 12 Months Plan */}
          <div className="bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-blue-500/30 rounded-3xl p-8 shadow-2xl relative flex flex-col justify-between hover:border-blue-500/50 transition-colors transform md:-translate-y-4">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3 h-3" /> Best Value - 2 Months Free
            </div>
            <div>
              <div className="mb-8">
                <span className="text-blue-400 font-semibold tracking-wide uppercase text-sm">Pro</span>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-4xl font-serif text-white">₹899</span>
                  <span className="text-neutral-500 mb-1">/mo</span>
                </div>
                <p className="text-sm text-neutral-400 mt-2">Billed ₹10,788 every 12 months</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-white font-medium text-sm">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" /> 
                  1 TB Storage
                </li>
                {commonFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-300 font-light text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" /> 
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handlePay('12_months', 1078800)}
              disabled={loading !== null}
              className="w-full bg-blue-600 text-white py-4 rounded-full font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              {loading === '12_months' ? 'Processing...' : 'Choose Pro'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center flex items-center justify-center gap-2 text-neutral-600 text-xs font-medium tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" /> Secure payment powered by Razorpay
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
