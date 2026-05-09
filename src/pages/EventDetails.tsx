import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../AuthContext';
import { uploadFileToDrive } from '../utils/drive';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Download, Users, UploadCloud, ExternalLink, Copy, Share2, Check, RefreshCw, MessageCircle } from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface Event {
  id: string;
  name: string;
  venue: string;
  photographerId: string;
  driveLink?: string;
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
  const { user, driveToken, signIn } = useAuth();
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

  const compressImage = async (file: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1920;
          const MAX_HEIGHT = 1920;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.7
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !event) return;
    
    let activeDriveToken = driveToken;

    if (!activeDriveToken && event.driveLink) {
      if (window.confirm("Google Drive access is required to upload files to the event folder. Would you like to grant permission now?")) {
        try {
          const newToken = await signIn();
          if (typeof newToken === 'string') {
            activeDriveToken = newToken;
          } else {
            alert("Failed to get Google Drive token. Please try again.");
            return;
          }
        } catch (error) {
          console.error("Error signing in", error);
          alert("Failed to sign in. Please try again.");
          return;
        }
      }
    }

    const files: File[] = Array.from(e.target.files);
    setUploading(true);

    try {
      await Promise.all(files.map(async (file) => {
        const compressedBlob = await compressImage(file);
        
        let driveFile = null;
        if (activeDriveToken && event.driveLink) {
          try {
            // Upload original to drive
            driveFile = await uploadFileToDrive(file, event.driveLink, activeDriveToken);
          } catch (e) {
            console.error("Failed to upload to drive", e);
          }
        }
        
        // Upload compressed image to Firebase Storage for the web gallery
        const storageRef = ref(storage, `events/${eventId}/${Date.now()}-${file.name}`);
        await uploadBytes(storageRef, compressedBlob);
        const downloadUrl = await getDownloadURL(storageRef);
        
        // Save photo metadata to Firestore
        await addDoc(collection(db, 'events', eventId!, 'photos'), {
          eventId: event.id,
          photographerId: event.photographerId,
          name: file.name,
          type: file.type,
          driveFileId: driveFile ? driveFile.id : storageRef.fullPath,
          thumbnailLink: downloadUrl, // Storage URL
          webContentLink: downloadUrl, // Storage URL
          createdAt: new Date().toISOString()
        });
      }));
      alert('Photos uploaded successfully!');
    } catch (error) {
      console.error('Error uploading', error);
      alert('Failed to upload photos.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center font-sans tracking-[0.2em] uppercase text-xs text-neutral-600">Loading...</div>;
  if (!event) return <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center font-sans tracking-[0.2em] uppercase text-xs text-neutral-600">Event not found</div>;

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
    <div className="min-h-screen bg-[#0f0f0f] font-sans pb-24 relative overflow-hidden">

      <nav className="bg-[#1a1a1a] backdrop-blur-md border-b border-[#333] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-20">
            <Link to="/dashboard" className="flex items-center text-neutral-500 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-[10px] tracking-widest uppercase">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-neutral-500 font-light text-sm">
              <span className="flex items-center">
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full mr-2"></span>
                {event.venue}
              </span>
              <Link to={`/gallery/${event.id}`} className="flex items-center hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Gallery
              </Link>
            </div>
          </div>
          <div className="relative flex items-center gap-4">
            <label className={`cursor-pointer ${uploading ? 'bg-[#1a1a1a] text-neutral-500' : 'bg-neutral-100 text-neutral-900 hover:bg-white'} px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all`}>
              <UploadCloud className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Upload Media'}
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl p-8 text-center sticky top-28">
              <div className="mb-8">
                <h2 className="text-2xl font-serif text-white mb-2">Event QR Code</h2>
                <p className="text-neutral-500 font-light text-sm">Guests scan this to access photos and leave their details.</p>
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
                  className="block text-neutral-400 hover:text-white text-[10px] tracking-widest uppercase mb-2 transition-colors font-semibold"
                >
                  View Guest Page
                </a>
                <div className="flex items-center gap-2">
                  <div className="bg-[#0f0f0f] p-3 rounded-2xl border border-[#333] text-xs text-neutral-500 break-all select-all text-left flex-1 font-mono">
                    {guestUrl}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-3 bg-neutral-100 text-neutral-900 rounded-full hover:bg-white transition-colors flex items-center justify-center shrink-0"
                      title="Copy Link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-3 bg-[#0f0f0f] border border-[#333] text-white rounded-full hover:bg-[#0f0f0f] transition-colors flex items-center justify-center shrink-0"
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
            <div className="bg-[#1a1a1a] border border-[#333] rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-[#333] flex justify-between items-center bg-[#1a1a1a]">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-white mr-3" />
                  <h2 className="text-2xl font-serif text-white">Guest Leads</h2>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const phones = leads.map(l => l.phone).filter(Boolean).join(', ');
                      if (phones) {
                        navigator.clipboard.writeText(phones);
                        alert('Phone numbers copied to clipboard for WhatsApp Broadcast!');
                      } else {
                        alert('No phone numbers available.');
                      }
                    }}
                    className="bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase font-semibold flex items-center gap-2 hover:bg-[#25D366]/20 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp Broadcast
                  </button>
                  <span className="bg-neutral-700 text-neutral-400 border border-[#333] rounded-full text-[10px] tracking-widest uppercase px-4 py-1.5 font-semibold">
                    {leads.length} Total
                  </span>
                </div>
              </div>
              
              {leads.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="text-neutral-500 font-light">No leads collected yet. Share the QR code with guests to start collecting.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#333] bg-[#0f0f0f]">
                        <th className="px-8 py-4 text-[10px] font-semibold tracking-widest uppercase text-neutral-500">Name</th>
                        <th className="px-8 py-4 text-[10px] font-semibold tracking-widest uppercase text-neutral-500">Phone</th>
                        <th className="px-8 py-4 text-[10px] font-semibold tracking-widest uppercase text-neutral-500">Email</th>
                        <th className="px-8 py-4 text-[10px] font-semibold tracking-widest uppercase text-neutral-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-[#0f0f0f] transition-colors">
                          <td className="px-8 py-5 text-neutral-300 text-sm">{lead.name}</td>
                          <td className="px-8 py-5 text-neutral-500 font-light text-sm">{lead.phone}</td>
                          <td className="px-8 py-5 text-neutral-500 font-light text-sm">{lead.email}</td>
                          <td className="px-8 py-5 text-neutral-600 text-xs font-light">
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
