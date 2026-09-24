'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if guest/demo mode is active in localStorage
    const demoActive = typeof window !== 'undefined' && localStorage.getItem('finsight_demo_mode') === 'true';
    if (demoActive) {
      setIsDemo(true);
      setUser({ id: 'demo-user', email: 'demo@finsight.local', user_metadata: { role: 'admin' } });
      setSession({ access_token: 'demo-token', user: { id: 'demo-user', email: 'demo@finsight.local' } });
    }

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSession(session);
          setUser(session?.user ?? null);
        } else if (demoActive) {
          // Keep demo active
        } else if (pathname !== '/login' && pathname !== '/') {
          // Public routes allowed without redirect
          router.push('/login');
        }
      } catch (err) {
        console.warn('Supabase getSession error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();

    let subscription = null;
    try {
      const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setSession(session);
          setUser(session?.user ?? null);
        } else if (!demoActive && pathname !== '/login' && pathname !== '/') {
          router.push('/login');
        }
      });
      subscription = authListener?.data?.subscription;
    } catch (err) {
      console.warn('Supabase auth listener error:', err);
    }

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [pathname, router]);

  const enterDemoMode = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('finsight_demo_mode', 'true');
    }
    setIsDemo(true);
    setUser({ id: 'demo-user', email: 'demo@finsight.local', user_metadata: { role: 'admin' } });
    setSession({ access_token: 'demo-token', user: { id: 'demo-user', email: 'demo@finsight.local' } });
    router.push('/dashboard');
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('finsight_demo_mode');
    }
    setIsDemo(false);
    setUser(null);
    setSession(null);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      /* ignore */
    }
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemo, enterDemoMode, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
