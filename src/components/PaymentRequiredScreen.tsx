import React, { useState } from 'react';
import {
  Lock,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { StudentProfile, User } from '../lib/supabase';

interface PaymentRequiredScreenProps {
  currentUser: User;
  userProfile: StudentProfile | null;
  onOpenPaymentModal: () => void;
  onRefreshProfile: () => Promise<void>;
  onSignOut: () => void;
}

export const PaymentRequiredScreen: React.FC<PaymentRequiredScreenProps> = ({
  currentUser,
  userProfile,
  onOpenPaymentModal,
  onRefreshProfile,
  onSignOut,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    try {
      await onRefreshProfile();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const status = userProfile?.payment_status || 'Unpaid';
  const isPending = status === 'Pending Verification';
  const isRejected = status === 'Rejected';

  // Fee tier helper based on grade
  const getRequiredFee = () => {
    const grade = (userProfile?.grade || '').toLowerCase();
    if (grade.includes('9') || grade.includes('10') || grade.includes('matric')) return '499';
    if (grade.includes('11') || grade.includes('12') || grade.includes('fsc') || grade.includes('first') || grade.includes('second')) return '999';
    if (grade.includes('mdcat')) return '1499';
    if (grade.includes('tcat') || grade.includes('ecat')) return '1499';
    return '499';
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 animate-fadeIn py-4 px-2">
      {/* Top Lock Badge Banner */}
      <div className="bg-white dark:bg-[#1C1C1E] border-2 border-amber-400/80 dark:border-amber-500/40 rounded-[28px] p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto shadow-md">
          {isPending ? (
            <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
          ) : isRejected ? (
            <XCircle className="w-8 h-8 text-rose-500" />
          ) : (
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        {/* Title & Account Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>New Student Access Policy</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {isPending
              ? 'Payment Verification Pending'
              : isRejected
              ? 'Payment Verification Declined'
              : 'Payment Verification Required'}
          </h2>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto">
            Logged in as <strong className="text-slate-900 dark:text-white font-bold">{userProfile?.name || currentUser.email}</strong> ({currentUser.email}).
            {userProfile?.grade && (
              <span> Course: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{userProfile.grade} ({userProfile.stream})</strong>.</span>
            )}
          </p>
        </div>

        {/* Dynamic Status Alert Box */}
        {isPending ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Proof Submitted & Under Review</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-amber-200/90 leading-relaxed font-medium">
              We received your payment proof! Our admin team is reviewing your transaction screenshot. Your learning dashboard will unlock automatically once approved (usually within <strong>2–4 hours</strong>).
            </p>
          </div>
        ) : isRejected ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Payment Proof Rejected</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-rose-200/90 leading-relaxed font-medium">
              Your payment submission was not approved. Please re-upload a clear screenshot showing your transaction reference ID and payment amount.
            </p>
          </div>
        ) : (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold">
              <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Activate Full Account Access</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-blue-200/90 leading-relaxed font-medium">
              All new registrations require a one-time course fee verification to access the MCQ bank, practice test generators, and LMS dashboard.
            </p>
          </div>
        )}

        {/* Pricing Tiers Quick Reference Card */}
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Official 1-Year Access Fees</span>
            </span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Your Fee: PKR {getRequiredFee()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2.5 rounded-xl border ${userProfile?.grade?.toLowerCase()?.includes('matric') || userProfile?.grade?.includes('9') || userProfile?.grade?.includes('10') ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-extrabold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'}`}>
              <div className="text-[10px] text-slate-400 font-medium">Matric (9th & 10th)</div>
              <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">PKR 499</div>
            </div>

            <div className={`p-2.5 rounded-xl border ${userProfile?.grade?.toLowerCase()?.includes('fsc') || userProfile?.grade?.includes('11') || userProfile?.grade?.includes('12') ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-extrabold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'}`}>
              <div className="text-[10px] text-slate-400 font-medium">FSc (1st & 2nd Year)</div>
              <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">PKR 999</div>
            </div>

            <div className={`p-2.5 rounded-xl border ${userProfile?.grade?.toLowerCase()?.includes('mdcat') ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-extrabold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'}`}>
              <div className="text-[10px] text-slate-400 font-medium">MDCAT Entrance Prep</div>
              <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">PKR 1499</div>
            </div>

            <div className={`p-2.5 rounded-xl border ${userProfile?.grade?.toLowerCase()?.includes('tcat') || userProfile?.grade?.toLowerCase()?.includes('ecat') ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 font-extrabold' : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'}`}>
              <div className="text-[10px] text-slate-400 font-medium">TCAT / ECAT Prep</div>
              <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">PKR 1499</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>All purchases are final — no refunds.</span>
          </div>

          <button
            type="button"
            onClick={onOpenPaymentModal}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-3.5 px-6 rounded-full transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isPending ? 'Update / Re-submit Payment Proof' : 'Upload Payment Screenshot'}</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleRefresh}
              className="flex-1 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-extrabold text-xs py-2.5 px-4 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking...' : refreshSuccess ? 'Status Up-to-date!' : 'Refresh Verification Status'}</span>
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs py-2.5 px-4 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
