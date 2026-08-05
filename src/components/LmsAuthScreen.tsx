import React, { useState, useRef, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  formatSupabaseAuthError,
} from '../lib/supabase';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface LmsAuthScreenProps {
  onSuccess?: () => void;
  selectedGradeContext?: string;
  onBack?: () => void;
}

export const LmsAuthScreen: React.FC<LmsAuthScreenProps> = ({ onSuccess, onBack }) => {
  const { logoUrl } = useSiteSettings();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Google OAuth Flow
  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Please check environment variables.');
      return;
    }

    setGoogleLoading(true);
    setError(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setGoogleLoading(false);
      setError('Google sign-in is taking longer than expected. Please check your network connection or pop-up blocker and try again.');
    }, 15000);

    try {
      localStorage.setItem('shs_oauth_redirect', 'true');
      sessionStorage.setItem('shs_oauth_redirect', 'true');
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;

      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (authErr) throw authErr;
    } catch (err: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      console.error('Google sign in error:', err);
      setError(formatSupabaseAuthError(err));
      localStorage.removeItem('shs_oauth_redirect');
      sessionStorage.removeItem('shs_oauth_redirect');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto py-4 px-2 text-white animate-fadeIn">
      {/* Header Branding */}
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <div className="w-14 h-14 bg-[#0A0A0A] border-2 border-[#F2B90C] rounded-2xl flex items-center justify-center shadow-lg mb-1 overflow-hidden p-1">
          <img
            src={logoUrl || "/logo.svg"}
            alt="Boardly Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/boardly-logo.svg';
            }}
          />
        </div>

        <h1 className="font-['Space_Grotesk'] font-black text-2xl sm:text-3xl tracking-widest text-[#F2B90C] uppercase leading-none">
          BOARDLY
        </h1>

        <p className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] text-[#F2B90C]/90 uppercase">
          LEARN &middot; GROW &middot; ACHIEVE
        </p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 font-medium animate-ios-spring">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span className="leading-snug">{typeof error === 'string' ? error : formatSupabaseAuthError(error)}</span>
        </div>
      )}

      {/* Info Alert Box */}
      {infoMsg && (
        <div className="mb-4 p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300 font-medium animate-ios-spring">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
          <span className="leading-snug">{infoMsg}</span>
        </div>
      )}

      {/* Main Authentication Card */}
      <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 text-center space-y-5 shadow-xl">
        <div className="space-y-1.5">
          <h2 className="text-base font-black text-white">Welcome to Boardly</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Sign in or create your student account securely with your Google account.
          </p>
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full bg-white hover:bg-slate-100 text-[#0A0A0A] font-extrabold py-3.5 px-6 rounded-full border border-white/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all cursor-pointer shadow-md text-sm disabled:opacity-80 disabled:cursor-not-allowed relative overflow-hidden"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>

          {googleLoading ? (
            <div className="flex items-center gap-2.5">
              <span className="text-slate-900 font-bold text-xs sm:text-sm">Connecting to Google...</span>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 rounded-full border border-slate-200/80 shadow-inner">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#4285F4] animate-bounce"
                  style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#EA4335] animate-bounce"
                  style={{ animationDelay: '180ms', animationDuration: '0.8s' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#FBBC05] animate-bounce"
                  style={{ animationDelay: '360ms', animationDuration: '0.8s' }}
                />
              </div>
            </div>
          ) : (
            <span>Continue with Google</span>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Fast, passwordless authentication</span>
        </div>
      </div>

      {/* Optional Go Back Button */}
      {onBack && (
        <div className="mt-5 pt-3 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      )}
    </div>
  );
};
