'use client';

import Image from 'next/image';

interface AuthLayoutProps {
  children: React.ReactNode;
  reverse?: boolean;
}

export default function AuthLayout({ children, reverse = false }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Conditionally render the form and image based on the reverse prop */}
      {reverse ? (
        <>
          {/* Right side - Image only (60%) */}
          <div 
            className="hidden lg:block w-[60%] bg-cover bg-center bg-no-repeat relative"
            style={{
              backgroundImage: `url('/background.png')`
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          {/* Left side - Auth Form (40%) */}
          <div 
            className="w-full lg:w-[40%] flex items-center justify-center p-8 relative"
          >
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Auth Card */}
            <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative z-10">
              <div className="text-center">
                <Image
                  src="/Polri.png"
                  alt="Logo Polri"
                  width={80}
                  height={80}
                  className="mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold mb-2">SKCK Online</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Sistem Informasi Pengajuan SKCK Online
                </p>
              </div>
              
              {children}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Left side - Image only (60%) */}
          <div 
            className="hidden lg:block w-[60%] bg-cover bg-center bg-no-repeat relative"
            style={{
              backgroundImage: `url('/background.png')`
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          </div>

          {/* Right side - Auth Form (40%) */}
          <div 
            className="w-full lg:w-[40%] flex items-center justify-center p-8 relative"
          >
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Auth Card */}
            <div className="w-full max-w-md space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative z-10">
              <div className="text-center">
                <Image
                  src="/Polri.png"
                  alt="Logo Polri"
                  width={80}
                  height={80}
                  className="mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold mb-2">SKCK Online</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Sistem Informasi Pengajuan SKCK Online
                </p>
              </div>
              
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 