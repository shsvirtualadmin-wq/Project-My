import React, { useState, useRef, useEffect } from 'react';
import { supabase, isSupabaseConfigured, formatSupabaseAuthError } from '../lib/supabase';
import {
  AlertCircle,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  Send,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

interface LmsAuthScreenProps {
  onSuccess: () => void;
  selectedGradeContext?: string;
  onBack?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot' | 'signup_success' | 'forgot_success' | 'update_password';

export const LmsAuthScreen: React.FC<LmsAuthScreenProps> = ({ onSuccess, onBack }) => {
  const { logoUrl } = useSiteSettings();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if user arrived via a password reset/recovery link
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      setMode('update_password');
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isValidEmail = (val: string) => /\S+@\S+\.\S+/.test(val.trim());

  // 1. Google OAuth Flow
  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment.');
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

  // 2. Email Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet.');
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authErr) throw authErr;

      if (data.session) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Email sign in error:', err);
      setError(formatSupabaseAuthError(err, 'signin'));
    } finally {
      setLoading(false);
    }
  };

  // 3. Email Sign Up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured yet.');
      return;
    }

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter a password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      const { data, error: authErr } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
            name: trimmedName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (authErr) throw authErr;

      if (data.user) {
        if (data.session) {
          // Direct login without verification requirement
          onSuccess();
        } else {
          // Email confirmation required & email sent
          setMode('signup_success');
        }
      }
    } catch (err: any) {
      console.error('Email sign up error:', err);
      setError(formatSupabaseAuthError(err, 'signup'));
    } finally {
      setLoading(false);
    }
  };

  // 4. Reset Password Email Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const redirectUrl = typeof window !== 'undefined' && window.location.origin.includes('scholario.pages.dev')
        ? 'https://scholario.pages.dev/reset-password'
        : `${window.location.origin}/reset-password`;
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectUrl,
      });

      if (resetErr) throw resetErr;

      setMode('forgot_success');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(formatSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // 5. Update Password (from Recovery Link)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
      });

      if (updateErr) throw updateErr;

      setInfoMsg('Password updated successfully! Redirecting...');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(formatSupabaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto py-2 px-1 text-white animate-fadeIn">
      {/* Header Branding */}
      <div className="flex flex-col items-center text-center space-y-2 mb-5">
        <div className="w-12 h-12 bg-[#0A0A0A] border-2 border-[#F2B90C] rounded-2xl flex items-center justify-center shadow-lg mb-0.5 overflow-hidden p-1">
          <img
            src={logoUrl || "/logo.png"}
            alt="Boardly Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/logo.png';
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

      {/* SUCCESS VIEWS */}
      {mode === 'signup_success' ? (
        <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">Verification Email Sent</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              We have sent a confirmation link to <strong className="text-amber-400">{email}</strong>.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Please check your inbox (and spam folder) and click the link to verify your email address, then sign in.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3 rounded-full text-xs transition-all active:scale-95 cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      ) : mode === 'forgot_success' ? (
        <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Send className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white">Reset Link Sent</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              If an account exists for <strong className="text-amber-400">{email}</strong>, you will receive a password reset link shortly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3 rounded-full text-xs transition-all active:scale-95 cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      ) : mode === 'forgot' ? (
        /* FORGOT PASSWORD FORM */
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="text-center space-y-1 mb-2">
            <h3 className="text-base font-black text-white flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#F2B90C]" />
              <span>Reset Password</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#1C1C1E] border border-white/15 focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3 px-6 rounded-full transition-all active:scale-[0.98] cursor-pointer text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      ) : mode === 'update_password' ? (
        /* UPDATE PASSWORD FORM */
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="text-center space-y-1 mb-2">
            <h3 className="text-base font-black text-white flex items-center justify-center gap-1.5">
              <KeyRound className="w-4 h-4 text-[#F2B90C]" />
              <span>Set New Password</span>
            </h3>
            <p className="text-xs text-slate-400">
              Enter your new password below to update your account credentials.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#1C1C1E] border border-white/15 focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#1C1C1E] border border-white/15 focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] rounded-2xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3 px-6 rounded-full transition-all active:scale-[0.98] cursor-pointer text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Update Password & Sign In'}
          </button>
        </form>
      ) : (
        /* MAIN SIGN IN / SIGN UP VIEW */
        <div className="space-y-4">
          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
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
                <span className="text-slate-900 font-bold text-xs sm:text-sm">Connecting to Google</span>
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

          {/* Divider */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15" />
            </div>
            <div className="relative bg-[#0A0A0A] px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              OR EMAIL SIGN-IN
            </div>
          </div>

          {/* Sign In / Sign Up Mode Selector Tabs */}
          <div className="flex bg-[#1C1C1E] p-1 rounded-full border border-white/10 mb-3">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#F2B90C] text-[#0A0A0A] shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#F2B90C] text-[#0A0A0A] shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* FORM: Sign In or Sign Up */}
          <form
            onSubmit={mode === 'signin' ? handleEmailSignIn : handleEmailSignUp}
            className="space-y-3"
          >
            {/* Full Name field for Sign Up */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full bg-[#1C1C1E] border border-white/15 focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Email Address <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#1C1C1E] border border-white/15 focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Password <span className="text-amber-400">*</span>
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                    }}
                    className="text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter password'}
                  className="w-full bg-[#1C1C1E] border border-white/15 focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] rounded-2xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field for Sign Up */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Confirm Password <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-[#1C1C1E] border border-white/15 focus:border-[#F2B90C] focus:ring-1 focus:ring-[#F2B90C] rounded-2xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3 px-6 rounded-full transition-all active:scale-[0.98] cursor-pointer text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="animate-pulse">Processing...</span>
                </div>
              ) : mode === 'signin' ? (
                <span>Sign In with Email</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Bottom Switcher Footer */}
          <div className="text-center pt-2">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-400 font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-bold text-[#F2B90C] hover:underline cursor-pointer"
                >
                  Sign up with email
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="font-bold text-[#F2B90C] hover:underline cursor-pointer"
                >
                  Sign in with email
                </button>
              </p>
            )}
          </div>
        </div>
      )}

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
