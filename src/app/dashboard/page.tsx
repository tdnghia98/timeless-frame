'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Event } from '@/lib/types';
import { useRouter } from 'next/navigation';
import EventCreationModal from '@/components/EventCreationModal';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
    
    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status, router]);
  
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEventCreated = (newEvent: Event) => {
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setIsModalOpen(false);
  };
  
  if (status === 'loading' || loading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Events</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Event
        </button>
      </div>
      
      {events.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-4">No Events Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first event to start collecting photos and videos from your guests.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Create New Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      
      {isModalOpen && (
        <EventCreationModal
          onClose={() => setIsModalOpen(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 text-indigo-600">{event.title}</h3>
        <p className="text-gray-600 mb-4">{formattedDate}</p>
        <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
        <div className="flex justify-between items-center">
          <Link
            href={`/events/${event.id}/manage`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Manage Event
          </Link>
          <Link
            href={`/events/${event.id}`}
            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
          >
            View Gallery
          </Link>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Share with guests:</span>
          <div className="flex space-x-2">
            <button
              onClick={() => navigator.clipboard.writeText(event.shareUrl || '')}
              className="text-gray-500 hover:text-indigo-600"
              title="Copy Link"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9z" />
                <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2V5h8a2 2 0 0 0-2-2H5z" />
              </svg>
            </button>
            <Link
              href={`/events/${event.id}/share`}
              className="text-gray-500 hover:text-indigo-600"
              title="QR Code"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h4a1 1 0 010 2H4a1 1 0 01-1-1zm8-12a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1zm0 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1zm0 6a1 1 0 011-1h4a1 1 0 010 2h-4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}