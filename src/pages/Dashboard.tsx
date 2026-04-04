import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { Plus, Settings, LogOut, Camera, Calendar, Link as LinkIcon } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  venue: string;
  driveLink: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', venue: '', driveLink: '' });

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
    try {
      const docRef = await addDoc(collection(db, 'events'), {
        ...newEvent,
        photographerId: user.uid,
        createdAt: new Date().toISOString()
      });
      setEvents([{ id: docRef.id, ...newEvent, createdAt: new Date().toISOString() }, ...events]);
      setShowCreateModal(false);
      setNewEvent({ name: '', venue: '', driveLink: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'events');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Camera className="w-6 h-6 text-stone-900 mr-3" strokeWidth={1.5} />
              <span className="text-2xl font-serif text-stone-900 tracking-tight">Candy.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/profile" className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase hidden sm:block">Settings</span>
              </Link>
              <button onClick={logout} className="text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-xs tracking-widest uppercase hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-serif text-stone-900 mb-2">Your Events</h1>
            <p className="text-stone-500 font-light">Manage your galleries and leads.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-3 tracking-widest uppercase text-xs flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </button>
        </div>

        {loading ? (
          <div className="text-stone-500 tracking-widest uppercase text-xs">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-white border border-stone-200">
            <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-6" strokeWidth={1} />
            <h3 className="text-2xl font-serif text-stone-900 mb-2">No events yet</h3>
            <p className="text-stone-500 font-light max-w-md mx-auto">Create your first event to generate a QR code and start collecting leads.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className="bg-white border border-stone-200 p-8 hover:border-stone-900 transition-colors group block">
                <h3 className="text-2xl font-serif text-stone-900 mb-3 group-hover:text-stone-600 transition-colors">{event.name}</h3>
                <p className="text-stone-500 font-light mb-8">{event.venue}</p>
                <div className="flex items-center text-xs tracking-widest uppercase text-stone-900">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  View Details
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-md w-full p-8 md:p-12 shadow-2xl">
            <h2 className="text-3xl font-serif text-stone-900 mb-8">New Event</h2>
            <form onSubmit={handleCreateEvent}>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Event Name</label>
                  <input
                    required
                    type="text"
                    value={newEvent.name}
                    onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                    className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-stone-900 transition-colors text-stone-900 placeholder-stone-300"
                    placeholder="e.g. Smith Wedding"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Venue</label>
                  <input
                    required
                    type="text"
                    value={newEvent.venue}
                    onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                    className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-stone-900 transition-colors text-stone-900 placeholder-stone-300"
                    placeholder="e.g. Grand Hotel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-stone-400 mb-2">Google Drive Link</label>
                  <input
                    required
                    type="url"
                    value={newEvent.driveLink}
                    onChange={e => setNewEvent({...newEvent, driveLink: e.target.value})}
                    className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-stone-900 transition-colors text-stone-900 placeholder-stone-300"
                    placeholder="https://drive.google.com/drive/folders/..."
                  />
                </div>
              </div>
              <div className="mt-10 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-stone-500 hover:text-stone-900 tracking-widest uppercase text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white tracking-widest uppercase text-xs transition-colors"
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
