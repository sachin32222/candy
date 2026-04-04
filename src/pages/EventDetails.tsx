import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, Users, UploadCloud, ExternalLink, Copy, Share2, Check } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  venue: string;
  driveLink: string;
  photographerId: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, driveToken } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEventAndLeads = async () => {
      if (!eventId || !user) return;
      
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists() && eventDoc.data().photographerId === user.uid) {
          setEvent({ id: eventDoc.id, ...eventDoc.data() } as Event);
          
          // Query by photographerId to satisfy Firestore security rules, then filter by eventId
          const q = query(collection(db, 'leads'), where('photographerId', '==', user.uid));
          const leadsSnapshot = await getDocs(q);
          const leadsData = leadsSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() } as Lead))
            .filter((lead: any) => lead.eventId === eventId);
          setLeads(leadsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `events/${eventId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndLeads();
  }, [eventId, user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !driveToken || !event) return;
    
    setUploading(true);
    const files: File[] = Array.from(e.target.files);
    
    // Extract folder ID from driveLink if possible
    let folderId = 'root';
    const match = event.driveLink.match(/folders\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      folderId = match[1];
    }

    try {
      for (const file of files) {
        const metadata = {
          name: file.name,
          parents: [folderId]
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${driveToken}`
          },
          body: form
        });
      }
      alert('Photos uploaded successfully to Google Drive!');
    } catch (error) {
      console.error('Error uploading to Drive', error);
      alert('Failed to upload photos. Please ensure you have granted Google Drive permissions.');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  if (loading) return <div className="min-h-screen bg-stone-900 flex items-center justify-center font-sans tracking-widest uppercase text-xs text-amber-400/70">Loading...</div>;
  if (!event) return <div className="min-h-screen bg-stone-900 flex items-center justify-center font-sans tracking-widest uppercase text-xs text-amber-400/70">Event not found</div>;

  const guestUrl = `${window.location.origin}/#/e/${event.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: 'Access your event photos here:',
          url: guestUrl,
        });
      } catch (error) {
        console.error('Error sharing', error);
      }
    } else {
      handleCopy();
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Link to="/dashboard" className="flex items-center text-white/60 hover:text-amber-400 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-xs tracking-widest uppercase">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-white/60 font-light">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                {event.venue}
              </span>
              <a href={event.driveLink} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-amber-400 transition-colors">
                <ExternalLink className="w-4 h-4 mr-2" />
                Google Drive Folder
              </a>
            </div>
          </div>
          <div className="relative">
            <label className={`cursor-pointer ${uploading ? 'bg-white/20 text-white/50' : 'bg-white text-stone-900 hover:bg-stone-100'} px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]`}>
              <UploadCloud className="w-5 h-5" />
              {uploading ? 'Uploading...' : 'Bulk Upload Photos'}
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading || !driveToken}
              />
            </label>
            {!driveToken && (
              <p className="text-[10px] text-red-400 absolute top-full mt-2 right-0 w-full text-right">Sign in again to enable uploads</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-center sticky top-28 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <div className="mb-8">
                <h2 className="text-2xl font-serif text-white mb-2">Event QR Code</h2>
                <p className="text-white/60 font-light text-sm">Guests scan this to access photos and leave their details.</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl inline-block mb-8 shadow-inner">
                <QRCodeSVG
                  id="qr-code"
                  value={guestUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#1c1917"
                  bgColor="#ffffff"
                />
              </div>

              <div className="space-y-4">
                <a
                  href={guestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-amber-400/80 hover:text-amber-400 text-xs tracking-widest uppercase mb-2 transition-colors"
                >
                  View Guest Page
                </a>
                <div className="flex items-center gap-2">
                  <div className="bg-black/20 p-3 rounded-xl border border-white/10 text-xs text-white/60 break-all select-all text-left flex-1">
                    {guestUrl}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-3 bg-white text-stone-900 rounded-xl hover:bg-stone-100 transition-colors flex items-center justify-center"
                      title="Copy Link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 bg-white/10 border border-white/10 text-white rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center"
                      title="Share Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leads Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/20">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-amber-400 mr-3" />
                  <h2 className="text-2xl font-serif text-white">Guest Leads</h2>
                </div>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs tracking-widest uppercase px-4 py-1.5">
                  {leads.length} Total
                </span>
              </div>
              
              {leads.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="text-white/60 font-light">No leads collected yet. Share the QR code with guests to start collecting.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/10">
                        <th className="px-8 py-4 text-xs font-semibold tracking-widest uppercase text-amber-400/80">Name</th>
                        <th className="px-8 py-4 text-xs font-semibold tracking-widest uppercase text-amber-400/80">Phone</th>
                        <th className="px-8 py-4 text-xs font-semibold tracking-widest uppercase text-amber-400/80">Email</th>
                        <th className="px-8 py-4 text-xs font-semibold tracking-widest uppercase text-amber-400/80">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-5 text-white">{lead.name}</td>
                          <td className="px-8 py-5 text-white/70 font-light">{lead.phone}</td>
                          <td className="px-8 py-5 text-white/70 font-light">{lead.email}</td>
                          <td className="px-8 py-5 text-white/40 text-sm font-light">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
