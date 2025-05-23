'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { EventFormData, Event } from '@/lib/types';
import { StorageProviderOption } from '@/lib/types/models/storage-provider';
import { fetchStorageProviders } from '@/lib/utils/storageService';

interface EventCreationModalProps {
  onClose: () => void;
  onEventCreated: (event: Event) => void;
}

export default function EventCreationModal({ onClose, onEventCreated }: EventCreationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<StorageProviderOption[]>([]);
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EventFormData>();

  useEffect(() => {
    // Fetch available storage providers from the backend using JWT
    fetchStorageProviders()
      .then((providers) => {
        setProviders(providers);
        if (providers && providers.length > 0) {
          setValue('storageProvider', providers[0].value);
        }
      })
      .catch(() => setProviders([]));
  }, [setValue]);

  const onSubmit: SubmitHandler<EventFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }
      const createdEvent = await response.json();
      onEventCreated(createdEvent);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Event</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Wedding, Birthday Party, etc."
              {...register("title", { required: "Event title is required" })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Tell your guests about this event..."
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              id="date"
              type="date"
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              Theme (Optional)
            </label>
            <select
              id="theme"
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              {...register("theme")}
            >
              <option value="">Select a theme (Default)</option>
              <option value="wedding">Wedding</option>
              <option value="birthday">Birthday</option>
              <option value="graduation">Graduation</option>
              <option value="travel">Travel</option>
              <option value="party">Party</option>
            </select>
          </div>
          <div className="mb-6">
            <label htmlFor="storageProvider" className="block text-sm font-medium text-gray-700 mb-1">
              Storage Provider *
            </label>
            <select
              id="storageProvider"
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              defaultValue={providers[0]?.value || ''}
              {...register("storageProvider", { required: "Please select a storage provider" })}
              disabled={providers.length === 0}
            >
              {providers.length === 0 && <option value="">Loading...</option>}
              {providers.map((provider) => (
                <option key={provider.value} value={provider.value}>{provider.label}</option>
              ))}
            </select>
            {errors.storageProvider && (
              <p className="mt-1 text-sm text-red-600">{errors.storageProvider.message}</p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}