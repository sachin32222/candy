import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Plus, Settings, LogOut, Camera, Calendar, Link as LinkIcon, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { createDriveFolder } from '../utils/drive';

interface Event {
  id: string;
  name: string;
  venue: string;
  createdAt: string;
  driveLink?: string;
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

    let activeDriveToken = driveToken;

    if (!activeDriveToken) {
      try {
        const newToken = await signIn();
        if (typeof newToken === 'string') {
          activeDriveToken = newToken;
        } else {
          setError("Failed to get Google Drive token. Please try again.");
          return;
        }
      } catch (error) {
        console.error("Error signing in", error);
        setError("Failed to grant Google Drive permission. Please try again.");
        return;
      }
    }

    setCreating(true);
    setError(null);

    try {
      const folderId = await createDriveFolder(`Candei - ${newEvent.name}`, activeDriveToken);

      const docRef = await addDoc(collection(db, 'events'), {
        name: newEvent.name,
        venue: newEvent.venue,
        photographerId: user.uid,
        driveLink: folderId,
        createdAt: new Date().toISOString()
      });
      
      setEvents([{ id: docRef.id, ...newEvent, createdAt: new Date().toISOString() }, ...events]);
      setShowCreateModal(false);
      setNewEvent({ name: '', venue: '' });
    } catch (error: any) {
      console.error(error);
      setError(error?.message || "Failed to create event. Please try again.");
      if (error && error.code) {
        handleFirestoreError(error, OperationType.CREATE, 'events');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(events.filter(event => event.id !== eventId));
    } catch (error: any) {
      console.error(error);
      setError("Failed to delete event.");
      handleFirestoreError(error, OperationType.DELETE, `events/${eventId}`);
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl sm:text-6xl font-serif text-white tracking-tight mb-4">Events.</h1>
            <p className="text-lg text-neutral-400 font-light">
              Manage your galleries, view your captures, and engage with your leads in one place.
            </p>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            onClick={() => setShowCreateModal(true)}
            className="group flex flex-col justify-center items-center w-full md:w-auto p-6 md:p-8 rounded-3xl border border-[#333] bg-[#1a1a1a] hover:bg-white hover:border-white transition-all duration-500 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-white group-hover:bg-black text-black group-hover:text-white flex items-center justify-center mb-4 transition-colors duration-500">
              <Plus strokeWidth={1.5} />
            </div>
            <span className="text-xs uppercase tracking-widest text-neutral-400 group-hover:text-black font-semibold transition-colors duration-500">Create New</span>
          </motion.button>
        </div>

        {loading ? (
          <div className="w-full h-40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1 }}
            className="w-full flex flex-col items-center justify-center py-32 border-t border-[#333]"
          >
             <h2 className="text-3xl font-serif text-neutral-600 mb-6">No events created yet.</h2>
             <button
               onClick={() => setShowCreateModal(true)}
               className="text-white border-b-2 border-white pb-1 font-medium tracking-wide hover:text-neutral-400 hover:border-neutral-400 transition-colors"
             >
               Start your first event
             </button>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6"
          >
            {events.map((event) => (
              <motion.div variants={itemVariants} key={event.id}>
                <Link 
                   to={`/events/${event.id}`} 
                   className="group relative w-full flex flex-col sm:flex-row justify-between sm:items-center p-8 sm:p-10 rounded-[2rem] bg-[#111] border border-[#222] hover:bg-white transition-all duration-700 ease-in-out cursor-pointer overflow-hidden"
                >
                  <div className="relative z-10 flex flex-col gap-2">
                    <h3 className="text-3xl sm:text-4xl font-serif text-white group-hover:text-black transition-colors duration-700">
                      {event.name}
                    </h3>
                    <p className="text-sm uppercase tracking-widest text-[#777] group-hover:text-black/60 font-medium transition-colors duration-700">
                      {event.venue}
                    </p>
                  </div>
                  
                  <div className="relative z-10 mt-8 sm:mt-0 flex items-center gap-4">
                    <span className="text-xs uppercase tracking-widest text-[#666] group-hover:text-black font-semibold transition-colors duration-700">Open Gallery</span>
                    <div className="w-12 h-12 rounded-full border border-[#444] group-hover:border-black flex items-center justify-center transition-colors duration-700 group-hover:bg-black">
                      <ArrowRight className="w-5 h-5 text-white transition-colors duration-700" />
                    </div>
                    <button 
                      onClick={(e) => handleDeleteEvent(e, event.id)}
                      className="w-12 h-12 rounded-full border border-red-900/50 bg-red-950/30 group-hover:bg-red-500 group-hover:border-red-600 flex items-center justify-center transition-colors duration-700 ml-2"
                      title="Delete Event"
                    >
                      <Trash2 className="w-5 h-5 text-red-500 group-hover:text-white transition-colors duration-700" />
                    </button>
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
