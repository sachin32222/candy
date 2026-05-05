import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Plus, Settings, LogOut, Camera, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Event {
  id: string;
  name: string;
  venue: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, profile, logout, driveToken, signIn } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', venue: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.name || !profile?.portfolio) {
      navigate('/profile');
    }
  }, [profile, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'events'), where('photographerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        setEvents(eventsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    setError(null);

    try {
      const docRef = await addDoc(collection(db, 'events'), {
        name: newEvent.name,
        venue: newEvent.venue,
        photographerId: user.uid,
        createdAt: new Date().toISOString()
      });
      
      setEvents([{ id: docRef.id, ...newEvent, createdAt: new Date().toISOString() }, ...events]);
      setShowCreateModal(false);
      setNewEvent({ name: '', venue: '' });
    } catch (error: any) {
      console.error(error);
      setError("Failed to create event. Please try again.");
      handleFirestoreError(error, OperationType.CREATE, 'events');
    } finally {
      setCreating(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans relative overflow-hidden">
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-[#333] sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Camera className="w-5 h-5 text-white mr-3" strokeWidth={1.5} />
              <span className="text-xl font-serif text-white tracking-tight">Candei.</span>
            </div>
            <div className="flex items-center gap-6">
              {user?.email === 'dubeyjiinmirzapur@gmail.com' && (
                <Link to="/admin" className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 group">
                  <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="text-[10px] tracking-widest uppercase hidden sm:block">Admin</span>
                </Link>
              )}
              <Link to="/profile" className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 group">
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] tracking-widest uppercase hidden sm:block">Settings</span>
              </Link>
              <button onClick={logout} className="text-neutral-500 hover:text-white transition-colors flex items-center gap-2 group">
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="text-[10px] tracking-widest uppercase hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl font-serif text-white mb-2">Your Events</h1>
            <p className="text-neutral-500 font-light text-sm tracking-wide">Manage your galleries and leads.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-neutral-100 text-neutral-900 hover:bg-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </motion.div>

        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-neutral-600 tracking-widest uppercase text-xs">Loading events...</motion.div>
        ) : events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center py-24 bg-[#1a1a1a] border border-[#333] rounded-3xl"
          >
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-6" strokeWidth={1} />
            <h3 className="text-2xl font-serif text-white mb-2">No events yet</h3>
            <p className="text-neutral-500 font-light max-w-md mx-auto text-sm">Create your first event to generate a QR code and start collecting leads.</p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {events.map(event => (
              <motion.div variants={itemVariants} key={event.id}>
                <Link to={`/events/${event.id}`} className="bg-orange-500 border border-orange-400 rounded-3xl p-8 hover:bg-orange-400 transition-all group block h-full flex flex-col hover:-translate-y-1 hover:shadow-xl">
                  <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-white transition-colors">{event.name}</h3>
                  <p className="text-orange-100 font-light mb-8 text-sm flex-grow">{event.venue}</p>
                  <div className="flex items-center text-[10px] tracking-widest uppercase text-orange-200 group-hover:text-white transition-colors">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    View Details
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {showCreateModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-[#0f0f0f]/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1a1a1a] border border-[#333] rounded-3xl max-w-md w-full p-8 md:p-12 shadow-2xl"
          >
              <h2 className="text-3xl font-serif text-white mb-8">New Event</h2>
              {error && (
                <div className="mb-6 p-4 bg-red-950/50 border border-red-500/50 rounded-2xl flex items-start gap-3 text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <form onSubmit={handleCreateEvent}>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-300 mb-2">Event Name</label>
                    <input
                      required
                      type="text"
                      value={newEvent.name}
                      onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                      className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-500 text-lg"
                      placeholder="e.g. Smith Wedding"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold tracking-widest uppercase text-neutral-300 mb-2">Venue</label>
                    <input
                      required
                      type="text"
                      value={newEvent.venue}
                      onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                      className="w-full border border-[#444] py-3 px-4 bg-[#252525] rounded-xl focus:outline-none focus:border-white transition-colors text-white placeholder-neutral-500 text-lg"
                      placeholder="e.g. Grand Hotel"
                    />
                  </div>
                </div>
                <div className="mt-10 flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-[#333] border border-[#555] text-white hover:bg-[#444] rounded-full font-medium transition-colors text-sm uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-8 py-3 bg-neutral-200 text-neutral-900 hover:bg-white rounded-full font-medium transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
    </div>
  );
}
