import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Instagram, Youtube, Globe, MessageCircle, Phone, Star, ExternalLink, Images, Camera } from 'lucide-react';
import { motion } from 'motion/react';

interface Event {
  id: string;
  name: string;
  venue: string;
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

const FLOATING_ELEMENTS = Array.from({ length: 15 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5,
}));

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1, delayChildren: 0.2 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-neutral-900 font-sans text-neutral-600 tracking-[0.2em] uppercase text-xs">Loading...</div>;
  if (!event || !photographer) return <div className="min-h-screen flex items-center justify-center bg-neutral-900 font-sans text-neutral-600 tracking-[0.2em] uppercase text-xs">Event not found</div>;

  if (!accessGranted) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-neutral-900 font-sans relative overflow-hidden">
        {/* Image Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="md:w-1/2 h-64 md:h-auto relative z-10 border-r border-neutral-800 overflow-hidden"
        >
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=2069&auto=format&fit=crop" 
            className="absolute inset-0 w-full h-full object-cover grayscale-[30%]" 
            alt="Event Atmosphere" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-black/40 md:to-[#0A0A0A]"></div>
          
          {/* Photographer Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-8 left-8 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white"
          >
            <Camera className="w-4 h-4 text-neutral-400" />
            <span className="text-[10px] font-bold tracking-widest uppercase">{photographer.name}</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-8 left-8 md:bottom-16 md:left-16 text-white max-w-sm"
          >
            <h1 className="font-serif text-4xl md:text-5xl mb-4 text-white leading-tight">{event.name}</h1>
            <p className="text-neutral-400 font-light text-sm flex items-center gap-2">
              <span className="w-8 h-[1px] bg-neutral-600 block"></span>
              {event.venue}
            </p>
          </motion.div>
        </motion.div>
        
        {/* Form Side */}
        <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 relative z-10 min-h-screen">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md w-full"
          >
            <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-4xl text-white mb-4">Your Gallery</motion.h2>
            <motion.p variants={itemVariants} className="text-neutral-400 mb-10 font-light text-sm leading-relaxed">
              We are thrilled to share these moments with you. Please enter your details below to access your complimentary high-resolution photos.
            </motion.p>

            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-8">
              <div className="group">
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-500 mb-2 group-focus-within:text-white transition-colors">Full Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-neutral-600 py-3 bg-transparent focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-500 text-lg"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-white transition-colors">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full border-b border-neutral-600 py-3 bg-transparent focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-500 text-lg"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="group">
                <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-400 mb-2 group-focus-within:text-white transition-colors">Email Address</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full border-b border-neutral-600 py-3 bg-transparent focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-500 text-lg"
                  placeholder="jane@example.com"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="w-full bg-white text-black py-4 rounded-full font-medium hover:bg-neutral-200 transition-colors mt-8 disabled:opacity-50 relative overflow-hidden"
              >
                {submitting ? 'Processing...' : 'Access Gallery'}
              </motion.button>
            </motion.form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 py-16 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden flex items-center">
      {/* Background Particles Area */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {FLOATING_ELEMENTS.map((el) => (
          <motion.div
            key={el.id}
            className="absolute rounded-full bg-white/10"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
              filter: `blur(${el.size / 2}px)`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: el.duration,
              repeat: Infinity,
              ease: "linear",
              delay: el.delay,
            }}
          />
        ))}
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full mx-auto relative z-10"
      >
        
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">{photographer.name}</h1>
          <p className="text-neutral-500 tracking-widest uppercase text-xs md:text-sm">Photography & Event Coverage</p>
        </motion.div>

        {/* Main Action (Drive) */}
        <motion.div variants={itemVariants} className="bg-neutral-800 p-10 md:p-16 border border-neutral-700 rounded-3xl text-center mb-12 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-50 group-hover:opacity-100 transition-opacity"></div>
          {/* Subtle flare effect */}
          <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none group-hover:animate-[slideRight_1.5s_ease-in-out]"></div>
          
          <h2 className="font-serif text-3xl text-white mb-4">Your Photos Are Ready</h2>
          <p className="text-neutral-400 mb-10 max-w-lg mx-auto font-light leading-relaxed">
            We've curated the best moments from {event.name}. Click below to view and download your high-resolution images.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/gallery/${event.id}`)}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-neutral-200 transition-all shadow-xl hover:shadow-2xl"
          >
            <Images className="w-5 h-5 mr-3" />
            Open Gallery
          </motion.button>
        </motion.div>

        {/* Grid for Reviews & Discounts */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Review */}
          {photographer.gbp && (
            <motion.div variants={itemVariants} className="bg-neutral-800 p-8 border border-neutral-700 rounded-3xl flex flex-col items-center text-center hover:bg-neutral-900 transition-colors">
              <Star className="w-8 h-8 text-neutral-400 mb-4" />
              <h3 className="font-serif text-2xl text-white mb-2">Enjoyed the photos?</h3>
              <p className="text-neutral-500 font-light mb-8 text-sm">Your review means the world to us.</p>
              <a
                href={photographer.gbp}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-neutral-700 text-white px-6 py-3 rounded-full font-medium hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95 w-full sm:w-auto"
              >
                Rate us on Google
              </a>
            </motion.div>
          )}

          {/* Discounts */}
          {(photographer.familyDiscount || photographer.corporateDiscount) && (
            <motion.div variants={itemVariants} className="bg-neutral-800 p-8 border border-neutral-700 rounded-3xl flex flex-col justify-center hover:bg-neutral-900 transition-colors">
              <h3 className="font-serif text-2xl text-white mb-6 text-center md:text-left">Exclusive Offers</h3>
              <div className="space-y-6">
                {photographer.familyDiscount && (
                  <div className="border-l-2 border-neutral-700 pl-4 transition-all hover:border-white">
                    <p className="text-xs tracking-widest uppercase text-neutral-500 mb-1">Family Package</p>
                    <p className="text-lg text-white mb-3">{photographer.familyDiscount}</p>
                    <a href={`tel:${photographer.phone}`} className="text-white hover:text-neutral-300 text-sm font-medium transition-colors inline-block underline underline-offset-4">Claim the discount &rarr;</a>
                  </div>
                )}
                {photographer.corporateDiscount && (
                  <div className="border-l-2 border-neutral-700 pl-4 transition-all hover:border-white">
                    <p className="text-xs tracking-widest uppercase text-neutral-500 mb-1">Corporate Events</p>
                    <p className="text-lg text-white mb-3">{photographer.corporateDiscount}</p>
                    <a href={`tel:${photographer.phone}`} className="text-white hover:text-neutral-300 text-sm font-medium transition-colors inline-block underline underline-offset-4">Claim the discount &rarr;</a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Links & Contact */}
        <motion.div variants={itemVariants} className="border-t border-neutral-800 pt-12 max-w-md mx-auto">
          <div className="flex flex-col gap-4">
            {photographer.portfolio && (
              <motion.a whileHover={{ x: 5 }} href={photographer.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-neutral-800 border border-neutral-700 rounded-2xl hover:bg-neutral-900 transition-colors group">
                <Globe className="w-5 h-5 text-neutral-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">Our Portfolio</span>
              </motion.a>
            )}
            {photographer.insta && (
              <motion.a whileHover={{ x: 5 }} href={`https://instagram.com/${photographer.insta.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-neutral-800 border border-neutral-700 rounded-2xl hover:bg-neutral-900 transition-colors group">
                <Instagram className="w-5 h-5 text-neutral-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">Follow us on Instagram</span>
              </motion.a>
            )}
            {photographer.youtube && (
              <motion.a whileHover={{ x: 5 }} href={photographer.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-neutral-800 border border-neutral-700 rounded-2xl hover:bg-neutral-900 transition-colors group">
                <Youtube className="w-5 h-5 text-neutral-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">Watch behind the scenes</span>
              </motion.a>
            )}
            {photographer.whatsapp && (
              <motion.a whileHover={{ x: 5 }} href={`https://wa.me/${photographer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-neutral-800 border border-neutral-700 rounded-2xl hover:bg-neutral-900 transition-colors group">
                <MessageCircle className="w-5 h-5 text-neutral-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">Chat with us on WhatsApp</span>
              </motion.a>
            )}
            {photographer.phone && (
              <motion.a whileHover={{ x: 5 }} href={`tel:${photographer.phone}`} className="flex items-center p-4 bg-neutral-800 border border-neutral-700 rounded-2xl hover:bg-neutral-900 transition-colors group">
                <Phone className="w-5 h-5 text-neutral-400 mr-4" />
                <span className="text-sm font-medium text-white group-hover:text-neutral-300 transition-colors">Give us a call</span>
              </motion.a>
            )}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
