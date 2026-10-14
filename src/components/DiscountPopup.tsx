import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';

export default function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    eventsPerMonth: '',
    adsUsage: '',
    annualSpend: '',
    storageTool: '',
    tier: '',
    yearsInBusiness: '',
    heardAboutUs: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000); // 3 seconds delay before showing the popup
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const text = `Where is my discount?

Details:
Events/Month: ${formData.eventsPerMonth}
Ads & Spend: ${formData.adsUsage} - ${formData.annualSpend}
Storage Tool: ${formData.storageTool}
Tier & Years: ${formData.tier} - ${formData.yearsInBusiness}
Heard About Us: ${formData.heardAboutUs}`;
    
    const url = `https://wa.me/919318465272?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[#111] border border-[#333] rounded-3xl p-6 md:p-8 max-w-md w-full relative shadow-2xl"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-xl font-serif text-white">Claim ₹250 INR Off</h3>
            </div>
            
            <p className="text-sm text-neutral-400 mb-6">Answer a few simple questions to claim your discount at checkout.</p>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">How many events do you do in a month?</label>
                  <input
                    type="text"
                    value={formData.eventsPerMonth}
                    onChange={(e) => handleChange('eventsPerMonth', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                    placeholder="e.g. 5-10"
                  />
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.eventsPerMonth}
                  className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Do you use Google Ads or Meta Ads?</label>
                  <select
                    value={formData.adsUsage}
                    onChange={(e) => handleChange('adsUsage', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm appearance-none"
                  >
                    <option value="">Select Option</option>
                    <option value="Yes, Google Ads">Yes, Google Ads</option>
                    <option value="Yes, Meta Ads">Yes, Meta Ads</option>
                    <option value="No, I don't use any">No, I don't use any</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">What is your annual spend?</label>
                  <select
                    value={formData.annualSpend}
                    onChange={(e) => handleChange('annualSpend', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm appearance-none"
                  >
                    <option value="">Select Annual Spend</option>
                    <option value="Less than ₹10,000">Less than ₹10,000</option>
                    <option value="₹10,000 - ₹50,000">₹10,000 - ₹50,000</option>
                    <option value="₹50,000 - ₹1,00,000">₹50,000 - ₹1,00,000</option>
                    <option value="More than ₹1,00,000">More than ₹1,00,000</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(1)} className="w-1/3 border border-[#333] text-white font-medium py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors">Back</button>
                  <button onClick={() => setStep(3)} disabled={!formData.adsUsage || !formData.annualSpend} className="w-2/3 bg-white text-black font-medium py-3 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">Next</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Do you use any tool for storage and sharing photos?</label>
                  <input
                    type="text"
                    value={formData.storageTool}
                    onChange={(e) => handleChange('storageTool', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                    placeholder="e.g. Google Drive, Dropbox"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(2)} className="w-1/3 border border-[#333] text-white font-medium py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors">Back</button>
                  <button onClick={() => setStep(4)} disabled={!formData.storageTool} className="w-2/3 bg-white text-black font-medium py-3 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">Next</button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Are you in Tier 1, 2, or 3?</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => handleChange('tier', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm appearance-none"
                  >
                    <option value="">Select Tier</option>
                    <option value="Tier 1">Tier 1</option>
                    <option value="Tier 2">Tier 2</option>
                    <option value="Tier 3">Tier 3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Since when are you in the photography business?</label>
                  <input
                    type="text"
                    value={formData.yearsInBusiness}
                    onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                    placeholder="e.g. 5 years"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(3)} className="w-1/3 border border-[#333] text-white font-medium py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors">Back</button>
                  <button onClick={() => setStep(5)} disabled={!formData.tier || !formData.yearsInBusiness} className="w-2/3 bg-white text-black font-medium py-3 rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50">Next</button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">How did you hear about us?</label>
                  <select
                    value={formData.heardAboutUs}
                    onChange={(e) => handleChange('heardAboutUs', e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-sm appearance-none"
                  >
                    <option value="">Select Source</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Sales Team">Sales Team</option>
                    <option value="Website">Website</option>
                    <option value="News Media">News Media</option>
                    <option value="Mainstream Media">Mainstream Media</option>
                    <option value="Event Referral">Event Referral</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep(4)} className="w-1/3 border border-[#333] text-white font-medium py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors">Back</button>
                  <button onClick={handleSubmit} disabled={!formData.heardAboutUs} className="w-2/3 bg-emerald-500 text-white font-medium py-3 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    Claim Discount
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
