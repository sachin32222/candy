import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Instagram, Youtube, Globe, MessageCircle, Phone, Star, ExternalLink, Images } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  venue: string;
  driveLink: string;
  photographerId: string;
}

interface PhotographerProfile {
  name: string;
  portfolio?: string;
  insta?: string;
  gbp?: string;
  youtube?: string;
  whatsapp?: string;
  phone?: string;
  familyDiscount?: string;
  corporateDiscount?: string;
}

export default function GuestLanding() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [photographer, setPhotographer] = useState<PhotographerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!eventId) return;
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() } as Event;
          setEvent(eventData);
          
          const photographerDoc = await getDoc(doc(db, 'users', eventData.photographerId));
          if (photographerDoc.exists()) {
            setPhotographer(photographerDoc.data() as PhotographerProfile);
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `events/${eventId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        eventId: event.id,
        photographerId: event.photographerId,
        createdAt: new Date().toISOString()
      });
      setAccessGranted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-900 font-sans text-amber-400/70 tracking-widest uppercase text-sm">Loading...</div>;
  if (!event || !photographer) return <div className="min-h-screen flex items-center justify-center bg-stone-900 font-sans text-amber-400/70 tracking-widest uppercase text-sm">Event not found</div>;

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-stone-900 font-sans relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
        </div>

        {/* Image Side */}
        <div className="md:w-1/2 h-64 md:h-auto relative z-10">
          <img 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Event Atmosphere" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/40 md:to-stone-900"></div>
          <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 text-white">
            <h1 className="font-serif text-4xl md:text-6xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">{event.name}</h1>
            <p className="text-lg font-light tracking-widest uppercase text-white/80">Captured by {photographer.name}</p>
          </div>
        </div>
        
        {/* Form Side */}
        <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 relative z-10">
          <div className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Your Gallery Awaits</h2>
            <p className="text-white/60 mb-10 font-light leading-relaxed">
              We are thrilled to share these moments with you. Please enter your details below to access your complimentary high-resolution photos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-2">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                  placeholder="jane@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-stone-900 py-4 rounded-xl font-medium hover:bg-stone-100 transition-all mt-8 disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {submitting ? 'Processing...' : 'Access Gallery'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 py-16 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">{photographer.name}</h1>
          <p className="text-amber-400/80 tracking-widest uppercase text-xs md:text-sm">Photography & Event Coverage</p>
        </div>

        {/* Main Action (Drive) */}
        <div className="bg-white/5 backdrop-blur-xl p-10 md:p-16 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] border border-white/10 rounded-[2rem] text-center mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 to-yellow-500"></div>
          <h2 className="font-serif text-3xl text-white mb-4">Your Photos Are Ready</h2>
          <p className="text-white/70 mb-10 max-w-lg mx-auto font-light leading-relaxed">
            We've curated the best moments from {event.name}. Click below to view and download your high-resolution images.
          </p>
          <button
            onClick={() => navigate(`/gallery/${event.id}`)}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 rounded-xl font-medium hover:bg-stone-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Images className="w-5 h-5 mr-3" />
            Open Gallery
          </button>
        </div>

        {/* Grid for Reviews & Discounts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Review */}
          {photographer.gbp && (
            <div className="bg-white/5 backdrop-blur-xl p-8 border border-white/10 rounded-[2rem] flex flex-col items-center text-center hover:bg-white/10 transition-colors">
              <Star className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="font-serif text-2xl text-white mb-2">Enjoyed the photos?</h3>
              <p className="text-white/60 font-light mb-8 text-sm">Your review means the world to us.</p>
              <a
                href={photographer.gbp}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 text-white px-6 py-3 rounded-xl font-medium hover:bg-white/10 transition-colors w-full sm:w-auto"
              >
                Rate us on Google
              </a>
            </div>
          )}

          {/* Discounts */}
          {(photographer.familyDiscount || photographer.corporateDiscount) && (
            <div className="bg-white/5 backdrop-blur-xl p-8 border border-white/10 rounded-[2rem] flex flex-col justify-center hover:bg-white/10 transition-colors">
              <h3 className="font-serif text-2xl text-white mb-6 text-center md:text-left">Exclusive Offers</h3>
              <div className="space-y-6">
                {photographer.familyDiscount && (
                  <div className="border-l-2 border-amber-400 pl-4">
                    <p className="text-xs tracking-widest uppercase text-white/50 mb-1">Family Package</p>
                    <p className="text-lg text-white mb-3">{photographer.familyDiscount}</p>
                    <a href={`tel:${photographer.phone}`} className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors inline-block">Claim the discount &rarr;</a>
                  </div>
                )}
                {photographer.corporateDiscount && (
                  <div className="border-l-2 border-amber-400 pl-4">
                    <p className="text-xs tracking-widest uppercase text-white/50 mb-1">Corporate Events</p>
                    <p className="text-lg text-white mb-3">{photographer.corporateDiscount}</p>
                    <a href={`tel:${photographer.phone}`} className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors inline-block">Claim the discount &rarr;</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Links & Contact */}
        <div className="border-t border-white/10 pt-12 max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            {photographer.portfolio && (
              <a href={photographer.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                <Globe className="w-5 h-5 text-amber-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors">Our Portfolio</span>
              </a>
            )}
            {photographer.insta && (
              <a href={`https://instagram.com/${photographer.insta.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                <Instagram className="w-5 h-5 text-amber-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors">Follow us on Instagram</span>
              </a>
            )}
            {photographer.youtube && (
              <a href={photographer.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                <Youtube className="w-5 h-5 text-amber-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors">Watch behind the scenes</span>
              </a>
            )}
            {photographer.whatsapp && (
              <a href={`https://wa.me/${photographer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                <MessageCircle className="w-5 h-5 text-amber-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors">Chat with us on WhatsApp</span>
              </a>
            )}
            {photographer.phone && (
              <a href={`tel:${photographer.phone}`} className="flex items-center p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl hover:bg-white/10 transition-colors group">
                <Phone className="w-5 h-5 text-amber-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-amber-200 transition-colors">Give us a call</span>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

