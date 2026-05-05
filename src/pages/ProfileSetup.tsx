import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Camera, Save, ArrowLeft } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../firebase';

export default function ProfileSetup() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    portfolio: '',
    insta: '',
    gbp: '',
    youtube: '',
    whatsapp: '',
    phone: '',
    familyDiscount: '',
    corporateDiscount: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        portfolio: profile.portfolio || '',
        insta: profile.insta || '',
        gbp: profile.gbp || '',
        youtube: profile.youtube || '',
        whatsapp: profile.whatsapp || '',
        phone: profile.phone || '',
        familyDiscount: profile.familyDiscount || '',
        corporateDiscount: profile.corporateDiscount || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert("Failed to save profile. Make sure all required fields are filled and valid.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans pb-24 relative overflow-hidden">
      <nav className="bg-[#1a1a1a] backdrop-blur-md border-b border-[#333] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-[10px] tracking-widest uppercase">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Studio Profile</h1>
          <p className="text-neutral-500 font-light text-sm tracking-wide">Configure your brand details and guest offerings.</p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <h2 className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold border-b border-[#333] pb-4">Essential Details</h2>
              
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">Full Name / Studio Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="Your Studio Name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">Portfolio Website URL *</label>
                  <input
                    required
                    type="url"
                    value={formData.portfolio}
                    onChange={e => setFormData({...formData, portfolio: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="https://yourstudio.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <h2 className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold border-b border-[#333] pb-4">Social & Contact</h2>
              
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">Instagram Handle</label>
                  <div className="flex items-end">
                    <span className="text-neutral-600 pb-3 mr-1 text-lg">@</span>
                    <input
                      type="text"
                      value={formData.insta}
                      onChange={e => setFormData({...formData, insta: e.target.value})}
                      className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">YouTube Channel Link</label>
                  <input
                    type="url"
                    value={formData.youtube}
                    onChange={e => setFormData({...formData, youtube: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">Google Business Profile Link</label>
                  <input
                    type="url"
                    value={formData.gbp}
                    onChange={e => setFormData({...formData, gbp: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="Link for guests to review you"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <h2 className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold border-b border-[#333] pb-4">Guest Offers</h2>
              
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">Family Discount Offer</label>
                  <input
                    type="text"
                    value={formData.familyDiscount}
                    onChange={e => setFormData({...formData, familyDiscount: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="e.g. 10% Off Family Portraits"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2">Corporate Discount Offer</label>
                  <input
                    type="text"
                    value={formData.corporateDiscount}
                    onChange={e => setFormData({...formData, corporateDiscount: e.target.value})}
                    className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-400 text-lg"
                    placeholder="e.g. 20% Off Corporate Events"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-neutral-100 text-neutral-900 px-8 py-4 rounded-full font-medium hover:bg-white transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? 'Saving...' : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
