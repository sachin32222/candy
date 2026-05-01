import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Plus, Settings, LogOut, Camera, Calendar, Link as LinkIcon, AlertCircle } from 'lucide-react';

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
      // Force profile setup if missing key info
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
      // Save to Firestore
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

  const handleReauth = async () => {
    try {
      await signIn();
      setError(null);
    } catch (err) {
      console.error("Reauth failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 font-sans relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/20 rounded-full mix-blend-screen filter blur-[120px]"></div>
      </div>

      <nav className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Camera className="w-6 h-6 text-amber-400 mr-3" strokeWidth={1.5} />
              <span className="text-2xl font-serif text-white tracking-tight">Candy.</span>
            </div>
            <div className="flex items-center gap-6">
              {user?.email === 'dubeyjiinmirzapur@gmail.com' && (
                <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="text-xs tracking-widest uppercase hidden sm:block">Admin Panel</span>
                </Link>
              )}
              <Link to="/profile" className="text-white/60 hover:text-amber-400 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase hidden sm:block">Settings</span>
              </Link>
              <button onClick={logout} className="text-white/60 hover:text-amber-400 transition-colors flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif text-white mb-2">Your Events</h1>
            <p className="text-white/60 font-light">Manage your galleries and leads.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-stone-900 hover:bg-stone-100 px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] w-full sm:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        </div>

        {loading ? (
          <div className="text-amber-400/70 tracking-widest uppercase text-xs">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem]">
            <Calendar className="w-12 h-12 text-white/20 mx-auto mb-6" strokeWidth={1} />
            <h3 className="text-2xl font-serif text-white mb-2">No events yet</h3>
            <p className="text-white/60 font-light max-w-md mx-auto">Create your first event to generate a QR code and start collecting leads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 hover:bg-white/10 transition-all group block shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
                <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-amber-200 transition-colors">{event.name}</h3>
                <p className="text-white/60 font-light mb-8">{event.venue}</p>
                <div className="flex items-center text-xs tracking-widest uppercase text-amber-400">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  View Details
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-white/10 rounded-[2rem] max-w-md w-full p-8 md:p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl font-serif text-white mb-8">New Event</h2>
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleCreateEvent}>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-2">Event Name</label>
                  <input
                    required
                    type="text"
                    value={newEvent.name}
                    onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="e.g. Smith Wedding"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-amber-400/80 mb-2">Venue</label>
                  <input
                    required
                    type="text"
                    value={newEvent.venue}
                    onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                    className="w-full border-b border-white/20 py-2 bg-transparent focus:outline-none focus:border-amber-400 transition-colors text-white placeholder-white/30"
                    placeholder="e.g. Grand Hotel"
                  />
                </div>
              </div>
              <div className="mt-10 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-white/60 hover:text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-stone-900 hover:bg-stone-100 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
