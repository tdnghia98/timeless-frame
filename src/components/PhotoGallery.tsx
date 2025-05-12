'use client';

import { useState, useEffect } from 'react';
import { Upload } from '@/lib/types';
import Image from 'next/image';

interface PhotoGalleryProps {
  uploads: Upload[];
}

export default function PhotoGallery({ uploads }: PhotoGalleryProps) {
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
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
  
  const openLightbox = (upload: Upload) => {
    setSelectedUpload(upload);
    setIsLightboxOpen(true);
  };
  
  const closeLightbox = () => {
    setIsLightboxOpen(false);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {uploads.map((upload) => (
          <div
            key={upload.id}
            className="relative aspect-square overflow-hidden rounded-lg shadow-md cursor-pointer transform transition-transform hover:scale-[1.02]"
            onClick={() => openLightbox(upload)}
          >
            {upload.thumbnailUrl ? (
              <Image
                src={upload.thumbnailUrl}
                alt={upload.fileName}
                fill
                className="object-cover"
              />
            ) : (
              // Fallback for uploads without thumbnails
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                {upload.fileType.startsWith('video/') ? (
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-12 h-12 text-gray-400"
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
                )}
              </div>
            )}
            
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
              <div className="relative w-full h-[80vh]">
                <Image
                  src={selectedUpload.downloadUrl || selectedUpload.thumbnailUrl || ''}
                  alt={selectedUpload.fileName}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            
            <div className="bg-black bg-opacity-70 p-3 text-white absolute bottom-0 left-0 right-0">
              <p className="text-lg">{selectedUpload.fileName}</p>
              {selectedUpload.uploadedBy && (
                <p className="text-sm opacity-80">Shared by: {selectedUpload.uploadedBy}</p>
              )}
              <a
                href={selectedUpload.downloadUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-sm text-indigo-300 hover:text-indigo-100 mt-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span>Download Original</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}