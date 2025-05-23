'use client';

import { useState, useEffect, useRef } from 'react';
import { Upload } from '@/lib/types';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

interface PhotoGalleryProps {
  uploads: Upload[];
}

export default function PhotoGallery({ uploads }: PhotoGalleryProps) {
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [fullResImg, setFullResImg] = useState<string | null>(null);
  const [isLoadingFullRes, setIsLoadingFullRes] = useState(false);

  // Caches for full-res and thumbnail images
  const fullResCache = useRef<{ [key: string]: string }>({});
  const thumbCache = useRef<{ [key: string]: string }>({});

  // Close lightbox with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When lightbox opens, fetch full-res image (with cache)
  useEffect(() => {
    if (isLightboxOpen && selectedUpload) {
      setIsLoadingFullRes(true);
      setFullResImg(null);
      let fullResUrl = '';
      if (selectedUpload.fileId) {
        fullResUrl = `/api/download/drive?eventId=${selectedUpload.eventId}&fileId=${selectedUpload.fileId}`;
      } else if ((selectedUpload as any).s3Key) {
        fullResUrl = `/api/download/s3?eventId=${selectedUpload.eventId}&s3Key=${encodeURIComponent((selectedUpload as any).s3Key)}`;
      } else if ((selectedUpload as any).gcsKey) {
        fullResUrl = `/api/download/gcs?eventId=${selectedUpload.eventId}&gcsKey=${encodeURIComponent((selectedUpload as any).gcsKey)}`;
      } else if ((selectedUpload as any).azureBlob) {
        fullResUrl = `/api/download/azure?eventId=${selectedUpload.eventId}&blobName=${encodeURIComponent((selectedUpload as any).azureBlob)}`;
      } else if ((selectedUpload as any).folderId && selectedUpload.fileName) {
        fullResUrl = `/api/download/local?eventId=${selectedUpload.eventId}&folderId=${encodeURIComponent((selectedUpload as any).folderId)}&fileName=${encodeURIComponent(selectedUpload.fileName)}`;
      }
      // Use cache if available
      if (fullResCache.current[fullResUrl]) {
        setFullResImg(fullResCache.current[fullResUrl]);
        setIsLoadingFullRes(false);
        return;
      }
      // Preload image
      if (selectedUpload.fileType.startsWith('image/')) {
        const toastId = toast.loading('Loading full resolution photo...');
        const img = new window.Image();
        img.onload = () => {
          fullResCache.current[fullResUrl] = fullResUrl;
          setFullResImg(fullResUrl);
          setIsLoadingFullRes(false);
          toast.dismiss(toastId);
        };
        img.onerror = () => {
          setIsLoadingFullRes(false);
          toast.dismiss(toastId);
          toast.error('Failed to load full resolution photo.');
        };
        img.src = fullResUrl;
      } else {
        setIsLoadingFullRes(false);
      }
    } else {
      setFullResImg(null);
      setIsLoadingFullRes(false);
    }
  }, [isLightboxOpen, selectedUpload]);

  const openLightbox = (upload: Upload) => {
    setSelectedUpload(upload);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const getImageSrc = (upload: Upload) => {
    // Use provider-specific download API routes
    if (upload.fileId) {
      // Google Drive
      return `/api/download/drive?eventId=${upload.eventId}&fileId=${upload.fileId}&thumb=1`;
    }
    if ((upload as any).s3Key) {
      return `/api/download/s3?eventId=${upload.eventId}&s3Key=${encodeURIComponent((upload as any).s3Key)}&thumb=1`;
    }
    if ((upload as any).gcsKey) {
      return `/api/download/gcs?eventId=${upload.eventId}&gcsKey=${encodeURIComponent((upload as any).gcsKey)}&thumb=1`;
    }
    if ((upload as any).azureBlob) {
      return `/api/download/azure?eventId=${upload.eventId}&blobName=${encodeURIComponent((upload as any).azureBlob)}&thumb=1`;
    }
    if ((upload as any).folderId && upload.fileName) {
      return `/api/download/local?eventId=${upload.eventId}&folderId=${encodeURIComponent((upload as any).folderId)}&fileName=${encodeURIComponent(upload.fileName)}&thumb=1`;
    }
    return '';
  };

  // Only fetch the thumbnail for gallery, with cache
  const getThumbnailSrc = (upload: Upload) => {
    let thumbUrl = '';
    if (upload.fileId) {
      thumbUrl = `/api/download/drive?eventId=${upload.eventId}&fileId=${upload.fileId}&thumb=1`;
    } else if ((upload as any).s3Key) {
      thumbUrl = `/api/download/s3?eventId=${upload.eventId}&s3Key=${encodeURIComponent((upload as any).s3Key)}&thumb=1`;
    } else if ((upload as any).gcsKey) {
      thumbUrl = `/api/download/gcs?eventId=${upload.eventId}&gcsKey=${encodeURIComponent((upload as any).gcsKey)}&thumb=1`;
    } else if ((upload as any).azureBlob) {
      thumbUrl = `/api/download/azure?eventId=${upload.eventId}&blobName=${encodeURIComponent((upload as any).azureBlob)}&thumb=1`;
    } else if ((upload as any).folderId && upload.fileName) {
      thumbUrl = `/api/download/local?eventId=${upload.eventId}&folderId=${encodeURIComponent((upload as any).folderId)}&fileName=${encodeURIComponent(upload.fileName)}&thumb=1`;
    }
    // Use cache if available
    if (thumbCache.current[thumbUrl]) {
      return thumbCache.current[thumbUrl];
    }
    // Preload and cache
    if (thumbUrl) {
      const img = new window.Image();
      img.onload = () => {
        thumbCache.current[thumbUrl] = thumbUrl;
      };
      img.src = thumbUrl;
    }
    return thumbUrl;
  };

  if (uploads.length === 0) {
    return (
      <div className="text-center py-8">
        <svg
          className="w-16 h-16 mx-auto text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-gray-500 text-lg">No photos have been uploaded yet.</p>
        <p className="text-gray-500">Be the first to share your memories!</p>
      </div>
    );
  }
  
  return (
    <>
      <Toaster position="top-center" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="relative aspect-square overflow-hidden rounded-lg shadow-md cursor-pointer transform transition-transform hover:scale-[1.02]"
            onClick={() => openLightbox(upload)}
          >
            <Image
              src={getThumbnailSrc(upload)}
              alt={upload.fileName}
              fill
              className="object-cover"
              unoptimized
            />
            
            {upload.fileType.startsWith('video/') && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <div className="bg-white bg-opacity-75 rounded-full p-2">
                  <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-white">
              <p className="text-sm truncate">{upload.fileName}</p>
              {upload.uploadedBy && (
                <p className="text-xs opacity-80">By: {upload.uploadedBy}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Lightbox */}
      {isLightboxOpen && selectedUpload && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-6xl max-h-[80vh] w-full relative">
            {selectedUpload.fileType.startsWith('video/') ? (
              <video
                controls
                className="max-h-[80vh] max-w-full mx-auto"
                src={selectedUpload.downloadUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="relative w-full h-[80vh] flex items-center justify-center">
                {/* Show full resolution image */}
                <Image
                  src={fullResImg || getImageSrc(selectedUpload)}
                  alt={selectedUpload.fileName}
                  fill
                  className="object-contain bg-gray-100"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/fallback-image.svg';
                    toast.error('Failed to load image.');
                  }}
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}