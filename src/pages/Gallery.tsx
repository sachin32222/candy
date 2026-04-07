import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Camera, Sparkles, ArrowLeft, Loader2, Download, X } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

interface DriveFile {
  id: string;
  name: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

export default function Gallery() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [images, setImages] = useState<DriveFile[]>([]);
  const [filteredImages, setFilteredImages] = useState<DriveFile[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEventAndPhotos = async () => {
      if (!eventId) return;
      try {
        const eventDoc = await getDoc(doc(db, 'events', eventId));
        if (eventDoc.exists()) {
          const data = eventDoc.data();
          setEventName(data.name);
          
          // Fetch photos from Firestore
          const photosSnapshot = await getDocs(collection(db, 'events', eventId, 'photos'));
          const photosData = photosSnapshot.docs.map(doc => {
            const d = doc.data();
            return {
              id: d.driveFileId,
              name: d.name,
              thumbnailLink: d.thumbnailLink,
              webContentLink: d.webContentLink
            };
          });
          
          if (photosData.length > 0) {
            setImages(photosData);
          } else {
            setError("No photos have been uploaded to this gallery yet.");
          }
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
  }, [eventId]);

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
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const imageParts = [];
      const validIndices = [];
      
      // We process up to 50 images to avoid payload limits and memory issues
      const maxImagesToAnalyze = Math.min(images.length, 50);
      
      for (let i = 0; i < maxImagesToAnalyze; i++) {
        try {
          const imgUrl = getHighResUrl(images[i].thumbnailLink);
          if (!imgUrl) continue;
          
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          
          imageParts.push({
            inlineData: {
              data: base64.split(',')[1],
              mimeType: blob.type
            }
          });
          validIndices.push(i);
        } catch (e) {
          console.warn("Could not fetch image for AI analysis", e);
        }
      }

      if (imageParts.length > 0) {
        const selfiePart = {
          inlineData: {
            data: selfieBase64.split(',')[1],
            mimeType: selfieBase64.split(';')[0].split(':')[1]
          }
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-preview',
          contents: {
            parts: [
              { text: "Here is a selfie of a person:" },
              selfiePart,
              { text: "Here are some gallery images, provided in order starting from index 0:" },
              ...imageParts,
              { text: "Identify which of the gallery images contain the person shown in the selfie. Return a JSON array of the 0-based indices of the matching gallery images. If the person is not found in any gallery image, return []. Only return the JSON array." }
            ]
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER }
            }
          }
        });

        const matchedIndices = JSON.parse(response.text || "[]");
        const finalMatches = matchedIndices.map((idx: number) => validIndices[idx]).filter((idx: number) => idx !== undefined);
        
        if (finalMatches.length > 0) {
          setFilteredImages(finalMatches.map((idx: number) => images[idx]));
        } else {
          setFilteredImages([]);
        }
      } else {
        setError("Could not analyze images due to access restrictions.");
        setFilteredImages([]);
      }

    } catch (error) {
      console.error("Error analyzing images:", error);
      setError("AI analysis failed. Please try again.");
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
    return <div className="min-h-screen flex items-center justify-center bg-stone-900 font-sans text-amber-400/70 tracking-widest uppercase text-sm">Loading Gallery...</div>;
  }

  const displayImages = filteredImages || images;

  return (
    <div className="min-h-screen bg-stone-900 font-sans text-white pb-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full mix-blend-screen filter blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full mix-blend-screen filter blur-[120px]"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative z-10">
              <h1 className="font-serif text-xl md:text-2xl">{eventName || 'Event Gallery'}</h1>
              <p className="text-xs text-white/50 tracking-widest uppercase">
                {filteredImages ? `${filteredImages.length} Matches Found` : `${images.length} Photos`}
              </p>
            </div>
          </div>

          {/* Find Me AI Button */}
          <div className="relative z-10">
            <input 
              type="file" 
              accept="image/*" 
              capture="user"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleSelfieUpload}
            />
            {!filteredImages && !isAnalyzing && images.length > 0 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-200 to-yellow-500 text-stone-900 px-5 py-2.5 rounded-full font-medium shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] transition-all transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Find Me AI</span>
              </button>
            )}
            {filteredImages && (
              <button 
                onClick={clearFilter}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-full font-medium transition-all"
              >
                <X className="w-4 h-4" />
                <span className="text-sm">Clear Filter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Analysis State */}
      {isAnalyzing && (
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center relative z-10">
          <div className="relative w-24 h-24 mb-6">
            {selfiePreview && (
              <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover rounded-full border-4 border-amber-400/30" />
            )}
            <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
          </div>
          <h2 className="font-serif text-2xl mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            Analyzing Faces...
          </h2>
          <p className="text-white/50 font-light text-sm">Our AI is scanning the gallery for your photos</p>
        </div>
      )}

      {/* Gallery Grid */}
      {!isAnalyzing && (
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          {error ? (
            <div className="text-center py-20">
              <Camera className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">Gallery Unavailable</h3>
              <p className="text-white/50 font-light max-w-md mx-auto">{error}</p>
            </div>
          ) : filteredImages && filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">No matches found</h3>
              <p className="text-white/50 font-light">We couldn't find any photos matching your selfie.</p>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20">
              <Camera className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="font-serif text-2xl mb-2">No photos yet</h3>
              <p className="text-white/50 font-light">This gallery is currently empty.</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {displayImages.map((file) => (
                <div key={file.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white/5">
                  <img 
                    src={getHighResUrl(file.thumbnailLink)} 
                    alt={file.name} 
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-4">
                    {file.webContentLink && (
                      <a 
                        href={file.webContentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white p-2 rounded-full transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
