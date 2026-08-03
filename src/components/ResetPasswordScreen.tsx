import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, formatSupabaseAuthError } from '../lib/supabase';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface ResetPasswordScreenProps {
  onNavigateToLogin: () => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onNavigateToLogin }) => {
  const { logoUrl } = useSiteSettings();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkResetToken() {
      setError(null);

      // Check if URL contains error params from Supabase (e.g. expired or invalid token)
      const hash = window.location.hash;
      const search = window.location.search;

      if (hash.includes('error=') || search.includes('error=')) {
        const params = new URLSearchParams(hash.replace('#', '?') || search);
        const errorDesc = params.get('error_description');
        const errorCode = params.get('error_code');

        if (isMounted) {
          setCheckingSession(false);
          setHasValidSession(false);
          setError(
            errorDesc
              ? decodeURIComponent(errorDesc).replace(/\+/g, ' ')
              : errorCode === 'otp_expired'
              ? 'This password reset link has expired. Please request a new one.'
              : 'Invalid or expired password reset link.'
          );
        }
        return;
      }

      if (!isSupabaseConfigured) {
        if (isMounted) {
          setCheckingSession(false);
          setHasValidSession(true);
        }
        return;
      }

      // Check for active Supabase recovery session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          if (isMounted) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
          return;
        }

        // Give Supabase client a brief moment to process hash tokens if arriving directly
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession || attempts >= 4) {
            clearInterval(interval);
            if (isMounted) {
              setHasValidSession(Boolean(currentSession));
              setCheckingSession(false);
              if (!currentSession) {
                setError('Password reset link is invalid or has expired. Please request a new reset link.');
              }
            }
          }
        }, 400);

        return () => clearInterval(interval);
      } catch (err: any) {
        console.error('[ResetPasswordScreen] Error verifying session:', err);
        if (isMounted) {
          setCheckingSession(false);
          setHasValidSession(false);
          setError('Failed to verify password reset token. Please request a new link.');
        }
      }
    }

    checkResetToken();

    // Listen to Supabase Auth state changes (PASSWORD_RECOVERY event)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ResetPasswordScreen] Auth state event:', event);
      if (event === 'PASSWORD_RECOVERY' || session) {
        if (isMounted) {
          setHasValidSession(true);
          setCheckingSession(false);
          setError(null);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setSubmitting(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateErr) {
        throw updateErr;
      }

      setSuccess(true);
      setTimeout(() => {
        onNavigateToLogin();
      }, 2500);
    } catch (err: any) {
      console.error('[ResetPasswordScreen] Password update error:', err);
      setError(formatSupabaseAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F2B90C]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#121824]/90 border border-[#F2B90C]/25 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900/80 border border-[#F2B90C]/30 mb-4 shadow-lg p-2.5">
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

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2B90C]/10 border border-[#F2B90C]/20 text-[#F2B90C] text-xs font-semibold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            SHS Virtual Academy LMS
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display mb-2">
            Reset Password
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your new account password below to complete security verification.
          </p>
        </div>

        {/* Loading State */}
        {checkingSession && (
          <div className="py-10 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-[#F2B90C] animate-spin mx-auto" />
            <p className="text-slate-300 text-sm font-medium">
              Verifying security reset token...
            </p>
          </div>
        )}

        {/* Success State */}
        {!checkingSession && success && (
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-emerald-300">Password Updated!</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Your account password has been updated successfully. Redirecting you to the Sign In page...
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        )}

        {/* Invalid Token / Error State (No valid session) */}
        {!checkingSession && !hasValidSession && !success && (
          <div className="space-y-6">
            <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-5 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-rose-300">Invalid or Expired Link</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {error || 'This password reset link is invalid, broken, or has expired. Password reset links can only be used once.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-3 px-4 rounded-xl bg-[#F2B90C] hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-[#F2B90C]/25 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Request New Password Reset Link
              </button>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border border-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In Page
              </button>
            </div>
          </div>
        )}

        {/* Reset Password Form */}
        {!checkingSession && hasValidSession && !success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Password Requirement Hint */}
            <p className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F2B90C]" />
              Password must be at least 6 characters long.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-[#F2B90C] hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg hover:shadow-[#F2B90C]/20 flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                'Update Password & Sign In'
              )}
            </button>

            {/* Back to Sign In Link */}
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-2 text-center text-xs sm:text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
