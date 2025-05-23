'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from '@/lib/types';

interface UploadFormProps {
  eventId: string;
  onUploadSuccess: (upload: Upload) => void;
}

export default function UploadForm({ eventId, onUploadSuccess }: UploadFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024, // 100MB max
    onDropRejected: (fileRejections) => {
      let errorMessage = 'File upload failed: ';
      
      if (fileRejections.some(file => file.errors.some(err => err.code === 'file-too-large'))) {
        errorMessage += 'File size exceeds the 100MB limit.';
      } else if (fileRejections.some(file => file.errors.some(err => err.code === 'file-invalid-type'))) {
        errorMessage += 'Only images and videos are allowed.';
      } else if (fileRejections.some(file => file.errors.some(err => err.code === 'too-many-files'))) {
        errorMessage += 'You can only upload up to 10 files at once.';
      } else {
        errorMessage += 'Invalid files selected.';
      }
      
      setError(errorMessage);
    },
    onDrop: () => {
      setError(null);
      setSuccessMessage(null);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (acceptedFiles.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }
    
    setUploading(true);
    setError(null);
    setSuccessMessage(null);
    
    for (let i = 0; i < acceptedFiles.length; i++) {
      try {
        const file = acceptedFiles[i];
        const formData = new FormData();
        formData.append('eventId', eventId);
        formData.append('file', file);
        
        if (name) formData.append('name', name);
        if (email) formData.append('email', email);
        
        // Update progress for each file
        setUploadProgress(Math.round((i / acceptedFiles.length) * 100));
        
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }
        
        const uploadData = await response.json();
        onUploadSuccess(uploadData);
        
      } catch (err: any) {
        setError(err.message || 'An error occurred during upload');
        setUploading(false);
        return;
      }
    }
    
    setUploadProgress(100);
    setSuccessMessage(`${acceptedFiles.length} ${acceptedFiles.length === 1 ? 'file' : 'files'} uploaded successfully!`);
    setUploading(false);
  };
  
  const fileList = acceptedFiles.map(file => (
    <li key={file.name} className="text-sm text-gray-600">
      {file.name} - {(file.size / (1024 * 1024)).toFixed(2)} MB
    </li>
  ));
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">Add Your Photos & Videos</h2>
      <p className="text-gray-600 text-center mb-6">
        Share your memories from this event with everyone.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name (Optional)
            </label>
            <input
              id="guest-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email (Optional)
            </label>
            <input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="john@example.com"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-2">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6.002a4 4 0 012.099 7.533l-.996.996m-6.004 3.004H12l3-3m-3 3l-3-3"
                />
              </svg>
              {isDragActive ? (
                <p className="text-indigo-600">Drop your files here</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-1">
                    Drag & drop photos and videos here, or click to select files
                  </p>
                  <p className="text-gray-500 text-sm">
                    Accepts images and videos up to 100MB each
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {acceptedFiles.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-1">
                Selected files ({acceptedFiles.length}):
              </p>
              <ul className="list-disc list-inside max-h-28 overflow-y-auto pl-2">
                {fileList}
              </ul>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md text-sm">
            {successMessage}
          </div>
        )}
        
        {uploading && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 text-sm text-center mt-1">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}
        
        <div className="text-center">
          <button
            type="submit"
            disabled={uploading || acceptedFiles.length === 0}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </form>
    </div>
  );
}