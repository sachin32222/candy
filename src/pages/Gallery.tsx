import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Camera, Sparkles, ArrowLeft, Loader2, Download, X, RefreshCw, Share2, Instagram, Star, Upload } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '../AuthContext';
import firebaseConfig from '../../firebase-applet-config.json';
import { motion } from 'motion/react';

interface DriveFile {
  id: string;
  name: string;
  type?: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

export default function Gallery() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState('');
  const [eventPhotographerId, setEventPhotographerId] = useState('');
  const [photographer, setPhotographer] = useState<any>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  
  const [images, setImages] = useState<DriveFile[]>([]);
  const [filteredImages, setFilteredImages] = useState<DriveFile[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const fetchPhotosFromFirestore = async () => {
    if (!eventId) return;
    const photosSnapshot = await getDocs(collection(db, 'events', eventId, 'photos'));
    const photosData = photosSnapshot.docs.map(doc => {
      const d = doc.data();
      return {
        id: d.driveFileId,
        name: d.name,
        type: d.type,
        thumbnailLink: d.thumbnailLink,
        webContentLink: d.webContentLink
      };
    });
    
    if (photosData.length > 0) {
      setImages(photosData);
      setError(null);
    } else {
      setError("No photos have been uploaded to this gallery yet.");
    }
  };

  useEffect(() => {
    const fetchEventAndPhotos = async () => {
      if (!eventId) return;
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEventName(data.name);
          setEventPhotographerId(data.photographerId);
          
          const photographerDoc = await getDoc(doc(db, 'users', data.photographerId));
          if (photographerDoc.exists()) {
            setPhotographer(photographerDoc.data());
          }
          
          await fetchPhotosFromFirestore();
        } else {
          setError("Event not found.");
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `events/${eventId}`);
        setError("Failed to load gallery.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndPhotos();
  }, [eventId, user]);

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      setSelfiePreview(base64Data);
      await analyzeImages(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const getHighResUrl = (thumbnailLink?: string) => {
    if (!thumbnailLink) return '';
    return thumbnailLink.replace(/=s\d+/, '=s1000');
  };

  const analyzeImages = async (selfieBase64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // Prepare images data
      const imageData = images
        .map((img, index) => ({
          url: getHighResUrl(img.thumbnailLink),
          index,
          type: img.type || "image/jpeg"
        }))
        .filter(img => img.url && !img.type.startsWith('video/'));
      
      const response = await fetch('/api/analyze-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfieBase64,
          images: imageData
        })
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }

      const data = await response.json();
      const matchedIndices = data.matches || [];
      
      if (matchedIndices.length > 0) {
        setFilteredImages(matchedIndices.map((idx: number) => images[idx]));
      } else {
        setFilteredImages([]);
      }
    } catch (error: any) {
      console.error("Error analyzing images:", error);
      setError(error.message || "AI analysis failed. Please try again.");
      setFilteredImages([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearFilter = () => {
    setFilteredImages(null);
    setSelfiePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] font-sans text-neutral-600 tracking-[0.2em] uppercase text-xs">Loading Gallery...</div>;
  }

  const displayImages = filteredImages || images;

  return (
    <div className="min-h-screen bg-[#0f0f0f] font-sans text-white pb-20 relative overflow-hidden">

      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#1a1a1a] border-b border-[#333] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#1a1a1a] rounded-full transition-colors relative z-10 text-neutral-500 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative z-10">
              <h1 className="font-serif text-xl md:text-2xl">{eventName || 'Event Gallery'}</h1>
              <p className="text-[10px] text-neutral-500 tracking-widest uppercase">
                {filteredImages ? `${filteredImages.length} Matches Found` : `${images.length} Photos`}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            {photographer?.insta && (
              <a
                href={photographer.insta.startsWith('http') ? photographer.insta : `https://instagram.com/${photographer.insta}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0f0f0f] border border-[#333] hover:border-[#555] text-neutral-300 px-4 py-2.5 rounded-full font-medium hover:text-white transition-all backdrop-blur-md"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Follow us</span>
              </a>
            )}
            
            {photographer?.gbp && (
              <a
                href={photographer.gbp.startsWith('http') ? photographer.gbp : `https://${photographer.gbp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#0f0f0f] border border-[#333] hover:border-[#555] text-neutral-300 px-4 py-2.5 rounded-full font-medium hover:text-white transition-all backdrop-blur-md"
              >
                <Star className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Rate us</span>
              </a>
            )}

            <button
               onClick={() => {
                 navigator.clipboard.writeText(window.location.href);
                 alert('Gallery link copied to clipboard!');
               }}
               className="flex items-center gap-2 bg-[#0f0f0f] border border-[#333] hover:border-[#555] text-neutral-300 px-4 py-2.5 rounded-full font-medium hover:text-white transition-all backdrop-blur-md"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">Share</span>
            </button>

            {filteredImages && (
              <button 
                onClick={clearFilter}
                className="flex items-center gap-2 bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-[#333] text-white px-5 py-2.5 rounded-full font-medium transition-all"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Clear Filter</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Find Me AI Button */}
      <input 
        type="file" 
        accept="image/*" 
        capture="user"
        className="hidden" 
        ref={fileInputRef}
        onChange={handleSelfieUpload}
      />
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={(el) => {
          // Keep a ref to a second input without capture
          if (el) fileUploadRef.current = el;
        }}
        onChange={handleSelfieUpload}
      />
      {!filteredImages && !isAnalyzing && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-xl p-2 rounded-full border border-[#444] shadow-2xl">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white px-6 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
          >
            <Camera className="w-5 h-5 text-white" />
            <span className="whitespace-nowrap hidden sm:inline">Take Selfie</span>
            <span className="whitespace-nowrap sm:hidden">Selfie</span>
          </button>
          
          <div className="w-px h-8 bg-[#444] mx-1"></div>
          
          <button 
            onClick={() => fileUploadRef.current?.click()}
            className="flex items-center gap-2 bg-[#222] hover:bg-[#333] border border-[#555] text-white px-6 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
          >
            <Upload className="w-5 h-5 text-white" />
            <span className="whitespace-nowrap hidden sm:inline">Upload Photo</span>
            <span className="whitespace-nowrap sm:hidden">Upload</span>
          </button>
        </div>
      )}

      {/* AI Analysis State */}
      {isAnalyzing && (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center relative z-10">
          <div className="relative w-24 h-24 mb-6">
            {selfiePreview && (
              <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover rounded-full border-2 border-[#333]" />
            )}
            <div className="absolute inset-0 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          </div>
          <h2 className="font-serif text-2xl mb-2 text-white">
            Analyzing Faces...
          </h2>
          <p className="text-neutral-500 font-light text-sm">Our AI is scanning the gallery for your photos</p>
        </div>
      )}

      {/* Gallery Grid */}
      {!isAnalyzing && (
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {error ? (
            <div className="text-center py-20 bg-[#1a1a1a] border border-[#333] rounded-3xl">
              <Camera className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2 text-white">Gallery Unavailable</h3>
              <p className="text-neutral-500 font-light max-w-md mx-auto mb-6">{error}</p>
              <button onClick={() => window.history.back()} className="px-6 py-2 bg-white text-black text-[10px] uppercase tracking-widest font-semibold rounded-full hover:bg-neutral-200 transition-colors">
                Go Back
              </button>
            </div>
          ) : filteredImages && filteredImages.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a1a] border border-[#333] rounded-3xl">
              <Camera className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2 text-white">No matches found</h3>
              <p className="text-neutral-500 font-light">We couldn't find any photos matching your selfie.</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 bg-[#1a1a1a] border border-[#333] rounded-3xl">
              <Camera className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2 text-white">No photos yet</h3>
              <p className="text-neutral-500 font-light">This gallery is currently empty.</p>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } }
              }}
              className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6"
            >
              {displayImages.map((file) => (
                <motion.div 
                  key={file.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                  }}
                  whileHover={{ scale: 1.02 }}
                  className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-[#1a1a1a] border border-[#333]"
                >
                  {file.type?.startsWith('video/') ? (
                    <video 
                      src={file.webContentLink || file.thumbnailLink} 
                      className="w-full h-auto object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img 
                      src={getHighResUrl(file.thumbnailLink)} 
                      alt={file.name} 
                      className="w-full h-auto object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4 pointer-events-none">
                    {file.webContentLink && (
                      <a 
                        href={file.webContentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-neutral-100 text-neutral-900 hover:bg-white p-3 rounded-full transition-colors pointer-events-auto"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
