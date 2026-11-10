'use client';

import React, { useState, useRef, useEffect } from 'react';
import { doc, setDoc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, FolderPlus, Image as ImageIcon, X } from 'lucide-react';

export interface UploadedPhotoRecord {
  id: string;
  eventId: string;
  photographerId: string;
  name: string;
  driveFileId: string;
  thumbnailLink: string;
  createdAt: string;
}

interface FileUploadStatus {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  driveFileId?: string;
  thumbnailLink?: string;
}

interface DirectDriveUploaderProps {
  eventId: string;
  photographerId: string;
  eventName: string;
  initialFolderId?: string;
  onPhotoUploaded?: (photo: UploadedPhotoRecord) => void;
}

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

export default function DirectDriveUploader({
  eventId,
  photographerId,
  eventName,
  initialFolderId,
  onPhotoUploaded,
}: DirectDriveUploaderProps) {
  const { driveToken, setDriveToken, signIn } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [folderId, setFolderId] = useState<string | null>(initialFolderId || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<FileUploadStatus[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhotoRecord[]>([]);
  const [showUploaderPanel, setShowUploaderPanel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing event folderId & photos from Firestore on mount
  useEffect(() => {
    const loadEventAndPhotos = async () => {
      if (!eventId) return;
      try {
        const eventSnap = await getDoc(doc(db, 'events', eventId));
        if (eventSnap.exists()) {
          const data = eventSnap.data();
          const existingFolder = data.driveFolderId || data.driveLink;
          if (existingFolder) {
            setFolderId(existingFolder);
          }
        }
        const photosSnap = await getDocs(collection(db, 'events', eventId, 'photos'));
        const list: UploadedPhotoRecord[] = photosSnap.docs.map((d) => {
          const pd = d.data();
          return {
            id: d.id,
            eventId: pd.eventId || eventId,
            photographerId: pd.photographerId || photographerId,
            name: pd.name || 'Photo',
            driveFileId: pd.driveFileId || d.id,
            thumbnailLink: pd.thumbnailLink || `https://lh3.googleusercontent.com/d/${pd.driveFileId || d.id}=s1600`,
            createdAt: pd.createdAt || new Date().toISOString(),
          };
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUploadedPhotos(list);
      } catch (err) {
        console.warn('Could not load initial photos:', err);
      }
    };
    loadEventAndPhotos();
  }, [eventId, photographerId]);

  const handleConnectDrive = async () => {
    setConnecting(true);
    setError(null);
    try {
      const win = typeof window !== 'undefined' ? (window as any) : null;
      const gisClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

      if (win?.google?.accounts?.oauth2 && gisClientId) {
        await new Promise<void>((resolve, reject) => {
          const tokenClient = win.google.accounts.oauth2.initTokenClient({
            client_id: gisClientId,
            scope: DRIVE_SCOPE,
            callback: (response: any) => {
              if (response?.error) {
                reject(new Error(response.error));
                return;
              }
              if (response?.access_token) {
                setDriveToken(response.access_token);
                resolve();
              } else {
                reject(new Error('No access token returned'));
              }
            },
          });
          tokenClient.requestAccessToken({ prompt: 'consent' });
        });
      } else {
        const token = await signIn();
        if (!token || typeof token !== 'string') {
          throw new Error('Could not obtain Google Drive access token. Please allow popups and try again.');
        }
      }
    } catch (err: any) {
      console.error('Error connecting Google Drive:', err);
      setError(err.message || 'Failed to connect Google Drive');
    } finally {
      setConnecting(false);
    }
  };

  const ensureDriveFolder = async (accessToken: string): Promise<string> => {
    if (folderId) return folderId;

    const res = await fetch('/api/drive/create-folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        eventName: `Candei - ${eventName}`,
        accessToken,
        photographerId,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.folderId) {
      throw new Error(data.error || 'Failed to create Google Drive folder');
    }

    try {
      await setDoc(
        doc(db, 'events', eventId),
        { driveFolderId: data.folderId, driveLink: data.folderId },
        { merge: true }
      );
    } catch (e) {
      console.warn('Client Firestore folderId sync warning:', e);
    }

    setFolderId(data.folderId);
    return data.folderId;
  };

  const uploadSingleFileResumable = (
    file: File,
    uploadUrl: string,
    index: number
  ): Promise<{ id: string; name?: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploads((prev) =>
            prev.map((item, idx) => (idx === index ? { ...item, progress: percent, status: 'uploading' } : item))
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            resolve(responseData);
          } catch (err) {
            reject(new Error('Invalid JSON response from Google Drive upload'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during direct Google Drive upload'));
      };

      xhr.send(file);
    });
  };

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setError(null);
    setShowUploaderPanel(true);

    let activeToken = driveToken;
    if (!activeToken) {
      try {
        const newToken = await signIn();
        if (typeof newToken === 'string') {
          activeToken = newToken;
        } else {
          setError('Please connect Google Drive first.');
          return;
        }
      } catch (e: any) {
        setError(e.message || 'Failed to authenticate with Google Drive.');
        return;
      }
    }

    let targetFolderId = folderId;
    try {
      targetFolderId = await ensureDriveFolder(activeToken);
    } catch (folderErr: any) {
      setError(folderErr.message || 'Failed to prepare Google Drive folder.');
      return;
    }

    const startIndex = uploads.length;
    const newUploadItems: FileUploadStatus[] = filesArray.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads((prev) => [...prev, ...newUploadItems]);

    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      const currentIdx = startIndex + i;

      try {
        setUploads((prev) =>
          prev.map((item, idx) => (idx === currentIdx ? { ...item, status: 'uploading', progress: 1 } : item))
        );

        // Step a: Call '/api/drive/upload-session' to get unique resumable uploadUrl
        const sessionRes = await fetch('/api/drive/upload-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderId: targetFolderId,
            fileName: file.name,
            mimeType: file.type || 'image/jpeg',
            accessToken: activeToken,
          }),
        });

        const sessionData = await sessionRes.json();
        if (!sessionRes.ok || !sessionData.success || !sessionData.uploadUrl) {
          throw new Error(sessionData.error || 'Failed to initiate resumable upload session');
        }

        // Step b: Upload directly from client browser to Google's uploadUrl with progress bar
        const driveMetadata = await uploadSingleFileResumable(file, sessionData.uploadUrl, currentIdx);
        const fileId = driveMetadata.id;

        if (!fileId) {
          throw new Error('Google Drive did not return a file ID');
        }

        const thumbnailLink = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
        const createdAt = new Date().toISOString();

        const photoRecord: UploadedPhotoRecord = {
          id: fileId,
          eventId,
          photographerId,
          name: file.name,
          driveFileId: fileId,
          thumbnailLink,
          createdAt,
        };

        // Step c: Save photo record to Firestore subcollection events/{eventId}/photos/{file.id}
        await setDoc(doc(db, 'events', eventId, 'photos', fileId), {
          eventId,
          photographerId,
          name: file.name,
          driveFileId: fileId,
          thumbnailLink,
          createdAt,
        });

        setUploads((prev) =>
          prev.map((item, idx) =>
            idx === currentIdx
              ? { ...item, progress: 100, status: 'completed', driveFileId: fileId, thumbnailLink }
              : item
          )
        );

        // Display uploaded photo immediately in gallery state
        setUploadedPhotos((prev) => [photoRecord, ...prev]);
        if (onPhotoUploaded) {
          onPhotoUploaded(photoRecord);
        }
      } catch (uploadErr: any) {
        console.error(`Error uploading ${file.name}:`, uploadErr);
        setUploads((prev) =>
          prev.map((item, idx) =>
            idx === currentIdx
              ? { ...item, status: 'error', error: uploadErr.message || 'Upload failed' }
              : item
          )
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex flex-col items-end gap-3">
      {!driveToken ? (
        <button
          type="button"
          onClick={handleConnectDrive}
          disabled={connecting}
          className="bg-neutral-100 text-neutral-900 hover:bg-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderPlus className="w-4 h-4" />}
          <span>{connecting ? 'Connecting Drive...' : 'Connect Google Drive'}</span>
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFilesSelected(e.target.files);
                e.target.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={() => setShowUploaderPanel((prev) => !prev)}
            className="bg-[#1a1a1a] border border-[#333] text-neutral-300 hover:text-white hover:border-[#555] px-4 py-3 rounded-full text-xs uppercase tracking-widest font-semibold transition-all cursor-pointer"
          >
            {showUploaderPanel ? 'Hide Dropzone' : 'Drag & Drop'}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-neutral-100 text-neutral-900 hover:bg-white px-6 py-3 rounded-full font-medium flex items-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Photos</span>
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-500/30 px-4 py-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop + Progress + Immediate Gallery Preview Panel */}
      {(showUploaderPanel || uploads.length > 0 || uploadedPhotos.length > 0) && (
        <div className="w-full max-w-2xl mt-4 bg-[#141414] border border-[#333] rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              <span className="text-xs uppercase tracking-widest text-neutral-300 font-semibold">
                Direct Google Drive Resumable Uploader
              </span>
            </div>
            {showUploaderPanel && (
              <button
                type="button"
                onClick={() => setShowUploaderPanel(false)}
                className="text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {driveToken && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all mb-4 ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-[#333] hover:border-neutral-500 bg-[#0f0f0f]'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-neutral-200 font-medium">
                Drag & drop event photos here, or click to browse
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Uploads directly from your browser to your Google Drive folder ({eventName})
              </p>
            </div>
          )}

          {/* Per-file progress bars */}
          {uploads.length > 0 && (
            <div className="space-y-2.5 max-h-60 overflow-y-auto mb-4 pr-1">
              {uploads.map((item, idx) => (
                <div
                  key={`${item.file.name}-${idx}`}
                  className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-3"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-neutral-300 truncate max-w-[70%] font-medium">
                      {item.file.name}
                    </span>
                    <span className="text-neutral-400 flex items-center gap-1.5">
                      {item.status === 'completed' && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {item.status === 'error' && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      )}
                      {item.status === 'uploading' && (
                        <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      )}
                      {item.status === 'error' ? 'Failed' : `${item.progress}%`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        item.status === 'completed'
                          ? 'bg-emerald-500'
                          : item.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  {item.error && <p className="text-[11px] text-red-400 mt-1">{item.error}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Photos Immediate Gallery Preview */}
          {uploadedPhotos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-widest text-neutral-400 font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Gallery Photos ({uploadedPhotos.length})
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto">
                {uploadedPhotos.slice(0, 12).map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-xl overflow-hidden bg-[#0f0f0f] border border-[#2a2a2a] relative group"
                  >
                    <img
                      src={photo.thumbnailLink}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
