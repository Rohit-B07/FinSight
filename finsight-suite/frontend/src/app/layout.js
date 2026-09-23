'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider } from '../components/AuthProvider';
import Sidebar from '../components/Sidebar';
import './globals.css';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <head>
        <title>FinSight Suite</title>
        <meta name="description" content="Financial Intelligence Platform" />
      </head>
      <body>
        <AuthProvider>
          {isLoginPage ? (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
              {children}
            </main>
          ) : (
            <div className="flex min-h-screen bg-slate-50">
              <Sidebar />
              <main className="flex-1 ml-[250px] p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
