import { getSession } from '@/lib/utils/authService';
import { redirect } from 'next/navigation'
import Link from 'next/link';
export default async function Home() {
  
  // If user is already logged in, redirect to dashboard
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }
  
  return (
    <div className="relative overflow-hidden">
      {/* Hero section */}
      <div className="relative pt-10 pb-20 sm:pt-16 lg:pt-8 lg:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-900 sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                  <span className="block">Capture memories.</span>
                  <span className="block text-indigo-600">Share moments.</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Create beautiful photo & video albums for your events. Let guests upload their memories directly to your Google Drive without creating accounts.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Link
                      href="/auth/signin"
                      className="flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Get Started
                    </Link>
                    <a
                      href="#features"
                      className="flex items-center justify-center px-5 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              {/* <div className="relative mx-auto w-full lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src="/hero-image.jpg"
                      alt="Event photo sharing app"
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="py-16 bg-gray-50 overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to collect event memories
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Create albums in minutes and let your guests upload photos and videos directly to your Google Drive.
            </p>
          </div>

          <div className="relative mt-12 lg:mt-20 lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-1">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                Google Drive Integration
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                All guest uploads save directly to your Google Drive in original quality, no storage limits beyond your Drive.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 lg:col-span-1">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                Simple Sharing
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                Generate unique URLs and QR codes for each event that guests can use to upload content.
              </p>
            </div>
            <div className="mt-10 lg:mt-0 lg:col-span-1">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                Real-Time Gallery
              </h3>
              <p className="mt-3 text-lg text-gray-500">
                View all uploads in a beautiful, responsive gallery. Download high-resolution images and videos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-700">
        <div className="max-w-2xl mx-auto py-16 px-4 sm:py-20 sm:px-6 lg:px-8 lg:max-w-7xl">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Create your first event today.</span>
          </h2>
          <div className="mt-8 flex">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
              >
                Sign in with Google
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}