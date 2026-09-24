'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import {
  TrendingUp, Shield, Brain, Wallet,
  CheckCircle2, ArrowRight, Sparkles, Globe, Lock
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { session, enterDemoMode } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  const features = [
    { icon: Wallet, text: 'Smart budget optimization with 3 scenarios' },
    { icon: Shield, text: 'Real-time risk monitoring across 5 dimensions' },
    { icon: Brain, text: 'XGBoost ML forecasting with 94% accuracy' },
    { icon: Lock, text: 'Enterprise-grade Supabase RLS security' },
  ];

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
        <div className="hidden lg:flex flex-col justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-primary-900 p-10 xl:p-14 relative overflow-hidden shadow-xlarge border border-white/10">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-400 flex items-center justify-center shadow-glow-primary">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white leading-none">FinSight</h1>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-300">Suite Pro</p>
              </div>
            </div>

            <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.05] mb-6">
              Financial intelligence
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-300 via-secondary-300 to-accent-300">
                reimagined
              </span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-md">
              The all-in-one platform for budget optimization, real-time risk intelligence, and ML-powered forecasting — trusted by high-performance finance teams.
            </p>

            <div className="space-y-3.5 mb-10">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary-300 flex-shrink-0">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-slate-100 text-sm">{f.text}</span>
                  <CheckCircle2 className="w-5 h-5 text-success-400 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-warning-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold mb-0.5">Built for Hackathon 2026</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Next.js 14 App Router • FastAPI • XGBoost • Supabase Auth + RLS • Redis Celery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-6">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-glow-primary">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900">FinSight <span className="text-primary-600">Suite</span></h1>
              </div>
              <p className="text-slate-500">Financial Intelligence Platform</p>
            </div>

            <div className="bg-white/95 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-xlarge p-7 md:p-9 animate-scale-in">
              <div className="text-center mb-7">
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Sign in to continue
                </h2>
                <p className="text-slate-500 text-sm">
                  Access your financial dashboard and insights
                </p>
              </div>

              {mounted && (
                <>
                  <button
                    onClick={enterDemoMode}
                    className="w-full mb-5 py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.01] transition-all"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Explore Instant Demo Mode</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>

                  <div className="relative flex py-2 items-center mb-4">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink mx-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Or sign in with email</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <Auth
                    supabaseClient={supabase}
                    appearance={{
                      theme: ThemeSupa,
                      variables: {
                        default: {
                          colors: {
                            brand: '#2563eb',
                            brandAccent: '#1d4ed8',
                            brandButtonText: 'white',
                            defaultButtonBackground: '#f8fafc',
                            defaultButtonBackgroundHover: '#f1f5f9',
                            defaultButtonBorder: '#e2e8f0',
                            defaultButtonText: '#334155',
                            inputBackground: 'white',
                            inputBorder: '#e2e8f0',
                            inputBorderHover: '#cbd5e1',
                            inputBorderFocus: '#2563eb',
                            inputText: '#0f172a',
                            inputLabelText: '#475569',
                            inputPlaceholder: '#94a3b8',
                            messageText: '#dc2626',
                            messageBackground: '#fef2f2',
                            messageBorder: '#fecaca',
                            anchorTextColor: '#2563eb',
                            anchorTextHoverColor: '#1d4ed8',
                          },
                          space: {
                            buttonPadding: '12px 16px',
                            inputPadding: '12px 14px',
                          },
                          borderWidths: {
                            buttonBorderWidth: '1px',
                            inputBorderWidth: '1px',
                          },
                          radii: {
                            borderRadiusButton: '12px',
                            buttonBorderRadius: '12px',
                            inputBorderRadius: '12px',
                          },
                          fonts: {
                            bodyFontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                            buttonFontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                            inputFontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                            labelFontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                          },
                        },
                      },
                      className: {
                        button: 'font-semibold shadow-sm hover:shadow-medium transition-all duration-200',
                        input: 'font-medium',
                        label: 'font-semibold',
                        anchor: 'font-semibold',
                        divider: 'text-slate-400',
                      },
                    }}
                    socialLayout="horizontal"
                    socialButtonSize="xlarge"
                    providers={['google']}
                    redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`}
                    view="sign_in"
                  />
                </>
              )}

              <div className="mt-7 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-center gap-5 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>End-to-end encrypted</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Supabase secured</span>
                  </div>
                </div>
                <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                  This is a demo build for competition purposes.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors"
              >
                ← Back to landing page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
