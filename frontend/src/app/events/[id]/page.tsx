'use client';

import { useEffect, useState, useCallback } from 'react';
import { Event, Upload } from '@/lib/types';
import UploadForm from '@/components/UploadForm';
import PhotoGallery from '@/components/PhotoGallery';
import { useParams } from 'next/navigation';

export default function EventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUploads = useCallback(async () => {
    try {
      // TODO: call backend
      const response = await fetch(`/api/uploads?eventId=${eventId}`);
      if (!response.ok) throw new Error('Failed to load photos');
      const uploadsData = await response.json();
      setUploads(uploadsData);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading uploads');
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchUploads();
    }
  }, [eventId, fetchUploads]);
  
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await httpGet<Event>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/events/${eventId}`
      );
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading the event');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewUpload = (newUpload: Upload) => {
    // After a successful upload, re-fetch uploads from the server
    fetchUploads();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="text-center py-10">
        <div className="bg-red-50 text-red-700 p-4 rounded-md max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error || 'Event not found'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">
          {event.title}
        </h1>
        <p className="text-gray-600 mb-4">
          {new Date(event.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-gray-700 max-w-3xl mx-auto">{event.description}</p>
      </div>
      
      <div className="mb-12">
        <UploadForm eventId={eventId} onUploadSuccess={handleNewUpload} />
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center">Photo Gallery</h2>
        <PhotoGallery uploads={uploads.filter(upload => upload.status === 'approved')} />
      </div>
    </div>
  );
}