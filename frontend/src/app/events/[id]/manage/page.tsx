"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { IEventsRepository } from "@/lib/repositories/IEventsRepository";
import { HttpEventsRepository } from "@/lib/repositories/HttpEventsRepository";
import { IUploadsRepository } from "@/lib/repositories/IUploadsRepository";
import { HttpUploadsRepository } from "@/lib/repositories/HttpUploadsRepository";
import { Upload, Event } from "@wedmemory/shared"

export default function ManageEventPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [tab, setTab] = useState<"photos" | "settings">("photos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [eventForm, setEventForm] = useState({ title: "", description: "", date: "" });
  const eventRepository: IEventsRepository = new HttpEventsRepository();
  const uploadsRepository: IUploadsRepository = new HttpUploadsRepository();

  useEffect(() => {
    if (!eventId) return;
    fetchEvent();
    fetchUploads();
  }, [eventId]);

  async function fetchEvent() {
    setLoading(true);
    setError(null);
    try {
      const data = await eventRepository.getEventById(eventId);
      setEvent(data);
      setEventForm({
        title: data.title,
        description: data.description,
        date: data.date ? String(data.date).slice(0, 10) : '',
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUploads() {
    try {
      const uploads = await uploadsRepository.getByEventId(eventId);
      setUploads(uploads);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handlePhotoAction(uploadId: string, action: "approve" | "reject" | "delete" | "hide") {
    try {
      setSaving(true);
      await httpPost(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/uploads/moderate`,
        { uploadId, action }
      );
      await fetchUploads();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleEventUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await httpPut<Event>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/events/${eventId}`,
        eventForm
      );
      await fetchEvent();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Event: {event.title}</h1>
      <div className="flex gap-4 mb-8">
        <button
          className={`px-4 py-2 rounded ${tab === "photos" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("photos")}
        >
          Photo Approval
        </button>
        <button
          className={`px-4 py-2 rounded ${tab === "settings" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          onClick={() => setTab("settings")}
        >
          Event Settings
        </button>
      </div>
      {tab === "photos" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploads.filter(u => u.status === "pending").length === 0 && (
              <div className="col-span-2 md:col-span-3 text-gray-500">No pending photos.</div>
            )}
            {uploads.filter(u => u.status === "pending").map(upload => (
              <div key={upload.id} className="bg-white rounded shadow p-2 flex flex-col items-center">
                {upload.thumbnailUrl ? (
                  <Image src={upload.thumbnailUrl} alt={upload.fileName} width={160} height={120} className="rounded mb-2" />
                ) : (
                  <div className="w-40 h-28 bg-gray-200 flex items-center justify-center mb-2">No Preview</div>
                )}
                <div className="text-xs text-gray-600 mb-2">{upload.fileName}</div>
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                    disabled={saving}
                    onClick={() => handlePhotoAction(upload.id, "approve")}
                  >Approve</button>
                  <button
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    disabled={saving}
                    onClick={() => handlePhotoAction(upload.id, "reject")}
                  >Reject</button>
                  <button
                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs"
                    disabled={saving}
                    onClick={() => handlePhotoAction(upload.id, "hide")}
                  >Hide</button>
                  <button
                    className="px-2 py-1 bg-black text-white rounded text-xs"
                    disabled={saving}
                    onClick={() => handlePhotoAction(upload.id, "delete")}
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
          <h2 className="text-xl font-semibold mt-8 mb-4">All Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploads.filter(u => u.status === "approved").length === 0 && (
              <div className="col-span-2 md:col-span-3 text-gray-500">No approved photos yet.</div>
            )}
            {uploads.filter(u => u.status === "approved" || u.status === "rejected").map(upload => (
              <div
                key={upload.id}
                className={`bg-white rounded shadow p-2 flex flex-col items-center opacity-90 ${upload.status === "rejected" ? "border-2 border-dashed border-gray-400 bg-gray-100 relative" : ""}`}
              >
                {upload.thumbnailUrl ? (
                  <Image src={upload.thumbnailUrl} alt={upload.fileName} width={160} height={120} className={`rounded mb-2 ${upload.status === "rejected" ? "grayscale opacity-60" : ""}`} />
                ) : (
                  <div className={`w-40 h-28 flex items-center justify-center mb-2 ${upload.status === "rejected" ? "bg-gray-300" : "bg-gray-200"}`}>No Preview</div>
                )}
                <div className={`text-xs mb-2 ${upload.status === "rejected" ? "text-gray-400 italic" : "text-gray-600"}`}>{upload.fileName}</div>
                {upload.status === "rejected" && (
                  <div className="absolute top-2 left-2 bg-gray-700 text-white text-[10px] px-2 py-0.5 rounded">Hidden</div>
                )}
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 bg-gray-400 text-white rounded text-xs"
                    disabled={saving}
                    onClick={() => handlePhotoAction(upload.id, "hide")}
                  >Hide</button>
                  <button
                    className="px-2 py-1 bg-black text-white rounded text-xs"
                    disabled={saving}
                    onClick={() => handlePhotoAction(upload.id, "delete")}
                  >Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === "settings" && (
        <form onSubmit={handleEventUpdate} className="max-w-lg mx-auto bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Event Settings</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={eventForm.title}
              onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded p-2"
              value={eventForm.description}
              onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded p-2"
              value={eventForm.date}
              onChange={e => setEventForm(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
            disabled={saving}
          >
            Save Changes
          </button>
        </form>
      )}
    </div>
  );
}
