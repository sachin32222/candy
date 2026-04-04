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
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 font-sans pb-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
      </div>

      <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-white/60 hover:text-amber-400 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-xs tracking-widest uppercase">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">Studio Profile</h1>
          <p className="text-white/60 font-light">Configure your brand details and guest offerings.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
              <h2 className="text-xs tracking-widest uppercase text-amber-400/80 font-semibold border-b border-white/10 pb-4">Essential Details</h2>
              
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">Full Name / Studio Name *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="Your Studio Name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">Portfolio Website URL *</label>
                  <input
                    required
                    type="url"
                    value={formData.portfolio}
                    onChange={e => setFormData({...formData, portfolio: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <h2 className="text-xs tracking-widest uppercase text-amber-400/80 font-semibold border-b border-white/10 pb-4">Social & Contact</h2>
              
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">Instagram Handle</label>
                  <div className="flex items-end">
                    <span className="text-white/40 pb-2 mr-1">@</span>
                    <input
                      type="text"
                      value={formData.insta}
                      onChange={e => setFormData({...formData, insta: e.target.value})}
                      className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">YouTube Channel Link</label>
                  <input
                    type="url"
                    value={formData.youtube}
                    onChange={e => setFormData({...formData, youtube: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">Google Business Profile Link</label>
                  <input
                    type="url"
                    value={formData.gbp}
                    onChange={e => setFormData({...formData, gbp: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="Link for guests to review you"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">WhatsApp Number</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8 pt-4">
              <h2 className="text-xs tracking-widest uppercase text-amber-400/80 font-semibold border-b border-white/10 pb-4">Guest Offers</h2>
              
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">Family Discount Offer</label>
                  <input
                    type="text"
                    value={formData.familyDiscount}
                    onChange={e => setFormData({...formData, familyDiscount: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="e.g. 10% Off Family Portraits"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-white/80 mb-2">Corporate Discount Offer</label>
                  <input
                    type="text"
                    value={formData.corporateDiscount}
                    onChange={e => setFormData({...formData, corporateDiscount: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="e.g. 20% Off Corporate Events"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-white text-stone-900 px-8 py-4 rounded-xl font-medium hover:bg-stone-100 transition-all flex items-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
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
