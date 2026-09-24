'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import './globals.css';
import Head from 'next/head';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  return (
    <html lang="en">
      <head>
        <title>FinSight Suite — AI-Powered Financial Intelligence Platform</title>
        <meta name="description" content="Advanced budget optimization, risk intelligence, and ML-powered forecasting for modern finance teams." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e40af" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 3v18h18'/%3E%3Cpath d='M7 14l4-4 4 4 5-5'/%3E%3C/svg%3E" />
      </head>
      <body>
        <AuthProvider>
          {isLandingPage ? (
            <main className="min-h-screen">
              {children}
            </main>
          ) : isLoginPage ? (
            <main className="min-h-screen animated-gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
              </div>
              <div className="relative w-full max-w-5xl animate-fade-in">
                {children}
              </div>
            </main>
          ) : (
            <div className="flex min-h-screen bg-slate-50">
              <Sidebar />
              <main className="flex-1 lg:ml-[280px]">
                <div className="min-h-screen">
                  <div className="p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
                    <div className="animate-fade-in">
                      {children}
                    </div>
                  </div>
                </div>
              </main>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
