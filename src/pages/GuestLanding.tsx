import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Instagram, Youtube, Globe, MessageCircle, Phone, Star, ExternalLink } from 'lucide-react';

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans text-stone-500 tracking-widest uppercase text-sm">Loading...</div>;
  if (!event || !photographer) return <div className="min-h-screen flex items-center justify-center bg-stone-50 font-sans text-stone-500 tracking-widest uppercase text-sm">Event not found</div>;

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
        {/* Image Side */}
        <div className="md:w-1/2 h-64 md:h-auto relative">
          <img 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Event Atmosphere" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 text-white">
            <h1 className="font-serif text-4xl md:text-6xl mb-3">{event.name}</h1>
            <p className="text-lg font-light tracking-widest uppercase text-white/80">Captured by {photographer.name}</p>
          </div>
        </div>
        
        {/* Form Side */}
        <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-stone-50">
          <div className="max-w-md w-full">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">Your Gallery Awaits</h2>
            <p className="text-stone-500 mb-10 font-light leading-relaxed">
              We are thrilled to share these moments with you. Please enter your details below to access your complimentary high-resolution photos.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-stone-900 transition-colors text-stone-900 placeholder-stone-300"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-stone-900 transition-colors text-stone-900 placeholder-stone-300"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-stone-900 transition-colors text-stone-900 placeholder-stone-300"
                  placeholder="jane@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-stone-900 text-white py-4 tracking-widest uppercase text-sm hover:bg-stone-800 transition-colors mt-4 disabled:opacity-50"
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
    <div className="min-h-screen bg-stone-50 py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">{photographer.name}</h1>
          <p className="text-stone-500 tracking-widest uppercase text-xs md:text-sm">Photography & Event Coverage</p>
        </div>

        {/* Main Action (Drive) */}
        <div className="bg-white p-10 md:p-16 shadow-sm border border-stone-200 text-center mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-stone-900"></div>
          <h2 className="font-serif text-3xl text-stone-900 mb-4">Your Photos Are Ready</h2>
          <p className="text-stone-500 mb-10 max-w-lg mx-auto font-light leading-relaxed">
            We've curated the best moments from {event.name}. Click below to view and download your high-resolution images.
          </p>
          <a
            href={event.driveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-stone-900 text-white tracking-widest uppercase text-sm hover:bg-stone-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-3" />
            Your gallery
          </a>
        </div>

        {/* Grid for Reviews & Discounts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Review */}
          {photographer.gbp && (
            <div className="bg-white p-8 border border-stone-200 flex flex-col items-center text-center">
              <Star className="w-6 h-6 text-stone-900 mb-4" />
              <h3 className="font-serif text-2xl text-stone-900 mb-2">How good is your english?</h3>
              <p className="text-stone-500 font-light mb-8 text-sm">Your review means the world to us.</p>
              <a
                href={photographer.gbp}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-stone-900 text-stone-900 px-6 py-3 uppercase tracking-widest text-xs hover:bg-stone-900 hover:text-white transition-colors w-full sm:w-auto"
              >
                Rate us on Google
              </a>
            </div>
          )}

          {/* Discounts */}
          {(photographer.familyDiscount || photographer.corporateDiscount) && (
            <div className="bg-white p-8 border border-stone-200 flex flex-col justify-center">
              <h3 className="font-serif text-2xl text-stone-900 mb-6 text-center md:text-left">Exclusive Offers</h3>
              <div className="space-y-6">
                {photographer.familyDiscount && (
                  <div className="border-l-2 border-stone-900 pl-4">
                    <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Family Package</p>
                    <p className="text-lg text-stone-900 mb-3">{photographer.familyDiscount}</p>
                    <a href={`tel:${photographer.phone}`} className="border border-stone-900 text-stone-900 px-4 py-2 uppercase tracking-widest text-[10px] hover:bg-stone-900 hover:text-white transition-colors inline-block">Claim the discount</a>
                  </div>
                )}
                {photographer.corporateDiscount && (
                  <div className="border-l-2 border-stone-900 pl-4">
                    <p className="text-xs tracking-widest uppercase text-stone-400 mb-1">Corporate Events</p>
                    <p className="text-lg text-stone-900 mb-3">{photographer.corporateDiscount}</p>
                    <a href={`tel:${photographer.phone}`} className="border border-stone-900 text-stone-900 px-4 py-2 uppercase tracking-widest text-[10px] hover:bg-stone-900 hover:text-white transition-colors inline-block">Claim the discount</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Links & Contact */}
        <div className="border-t border-stone-200 pt-12 max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            {photographer.portfolio && (
              <a href={photographer.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 border border-stone-200 hover:border-stone-900 transition-colors group bg-white">
                <Globe className="w-5 h-5 text-stone-400 group-hover:text-stone-900 mr-4 transition-colors" />
                <span className="text-xs tracking-widest uppercase text-stone-600 group-hover:text-stone-900 transition-colors">Our story</span>
              </a>
            )}
            {photographer.insta && (
              <a href={`https://instagram.com/${photographer.insta.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 border border-stone-200 hover:border-stone-900 transition-colors group bg-white">
                <Instagram className="w-5 h-5 text-stone-400 group-hover:text-stone-900 mr-4 transition-colors" />
                <span className="text-xs tracking-widest uppercase text-stone-600 group-hover:text-stone-900 transition-colors">Follow us</span>
              </a>
            )}
            {photographer.youtube && (
              <a href={photographer.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 border border-stone-200 hover:border-stone-900 transition-colors group bg-white">
                <Youtube className="w-5 h-5 text-stone-400 group-hover:text-stone-900 mr-4 transition-colors" />
                <span className="text-xs tracking-widest uppercase text-stone-600 group-hover:text-stone-900 transition-colors">Watch behind the scenes</span>
              </a>
            )}
            {photographer.whatsapp && (
              <a href={`https://wa.me/${photographer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 border border-stone-200 hover:border-stone-900 transition-colors group bg-white">
                <MessageCircle className="w-5 h-5 text-stone-400 group-hover:text-stone-900 mr-4 transition-colors" />
                <span className="text-xs tracking-widest uppercase text-stone-600 group-hover:text-stone-900 transition-colors text-left">Just in case if you know you can whatsapp us</span>
              </a>
            )}
            {photographer.phone && (
              <a href={`tel:${photographer.phone}`} className="flex items-center p-4 border border-stone-200 hover:border-stone-900 transition-colors group bg-white">
                <Phone className="w-5 h-5 text-stone-400 group-hover:text-stone-900 mr-4 transition-colors" />
                <span className="text-xs tracking-widest uppercase text-stone-600 group-hover:text-stone-900 transition-colors">We are not busy call us</span>
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

