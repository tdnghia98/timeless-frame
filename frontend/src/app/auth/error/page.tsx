'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthError() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>('An authentication error occurred.');
  const [errorDescription, setErrorDescription] = useState<string>('');
  
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      switch (error) {
        case 'Configuration':
          setErrorMessage('Server configuration error');
          setErrorDescription('The authentication server is missing critical configuration. Please ensure the OAuth credentials are correctly set up in the .env.local file.');
          break;
        case 'AccessDenied':
          setErrorMessage('Access denied');
          setErrorDescription('You denied access to your Google account. We need these permissions to store photos in your Google Drive.');
          break;
        case 'OAuthSignin':
          setErrorMessage('OAuth sign-in error');
          setErrorDescription('Could not initiate Google sign-in. Please check if cookies are enabled in your browser.');
          break;
        case 'OAuthCallback':
          setErrorMessage('OAuth callback error');
          setErrorDescription('There was a problem with the Google authentication callback.');
          break;
        case 'OAuthAccountNotLinked':
          setErrorMessage('Account not linked');
          setErrorDescription('This email is already associated with a different sign-in method.');
          break;
        case 'Callback':
          setErrorMessage('Callback error');
          setErrorDescription('There was a problem processing the authentication.');
          break;
        default:
          setErrorMessage('Authentication error');
          setErrorDescription('An unexpected error occurred during authentication.');
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Authentication Error
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  {errorMessage}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorDescription}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Common solutions:</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Ensure cookies are enabled in your browser</li>
                <li>Check that the Google OAuth setup is correct</li>
                <li>Verify the redirect URIs are properly configured</li>
                <li>Try clearing your browser cache and cookies</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">For developers:</h3>
              <ul className="mt-2 list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local</li>
                <li>Verify that the OAuth consent screen is properly configured</li>
                <li>Check that the correct scopes are enabled</li>
                <li>Confirm the redirect URIs include your callback URL</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Return to home page
                </Link>
              </div>
              <div className="text-sm">
                <Link href="/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Try again
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}