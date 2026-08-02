import React, { useState, useEffect } from 'react';
import {
  supabase,
  isAdminEmail,
  fetchUserTestHistoryFromSupabase,
  clearUserTestHistoryInSupabase,
  StudentProfile,
  User,
} from '../lib/supabase';
import { clearHistoryOffline } from '../lib/offlineCache';
import { HistoryItem } from '../types';
import { StudentProfileView } from './StudentProfileView';
import { useTheme } from '../context/ThemeContext';
import {
  User as UserIcon,
  LogOut,
  Play,
  GraduationCap,
  History,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface LmsDashboardProps {
  user: User;
  profile: StudentProfile | null;
  onStartPractice: () => void;
  onOpenAdminDashboard?: () => void;
  onRefreshProfile: () => void;
  onLogout: () => void;
  initialTab?: 'profile' | 'dashboard';
  theme?: 'light' | 'dark';
  onToggleTheme?: (newTheme: 'light' | 'dark') => void;
}

export const LmsDashboard: React.FC<LmsDashboardProps> = ({
  user,
  profile,
  onStartPractice,
  onOpenAdminDashboard,
  onRefreshProfile,
  onLogout,
  initialTab = 'dashboard',
  theme: propsTheme,
  onToggleTheme: propsOnToggleTheme,
}) => {
  const { theme: contextTheme, setTheme: setContextTheme } = useTheme();
  const currentTheme = propsTheme || contextTheme;

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    if (propsOnToggleTheme) {
      propsOnToggleTheme(newTheme);
    } else {
      setContextTheme(newTheme);
    }
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'dashboard'>(initialTab);
  const [testHistory, setTestHistory] = useState<HistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      const items = await fetchUserTestHistoryFromSupabase(user.id);
      setTestHistory(items);
      setLoadingHistory(false);
    };

    loadHistory();
  }, [user.id]);

  const [showLmsConfirmClear, setShowLmsConfirmClear] = useState<boolean>(false);
  const [isClearingLms, setIsClearingLms] = useState<boolean>(false);

  const handleConfirmClearLms = async () => {
    setIsClearingLms(true);
    await clearUserTestHistoryInSupabase(user.id);
    clearHistoryOffline();
    setTestHistory([]);
    setIsClearingLms(false);
    setShowLmsConfirmClear(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const getItemPct = (h: HistoryItem): number => {
    if (typeof h.percentage === 'number' && !isNaN(h.percentage) && h.percentage > 0) return h.percentage;
    const score = Number(h.score ?? 0);
    const total = Number(h.total ?? 0);
    if (total > 0) return Math.round((score / total) * 100);
    return typeof h.percentage === 'number' && !isNaN(h.percentage) ? h.percentage : 0;
  };

  // Compute stats
  const totalTests = testHistory.length;
  const totalMCQs = testHistory.reduce((acc, h) => acc + (h.total || 0), 0);
  const avgPct =
    totalTests > 0
      ? Math.round(testHistory.reduce((acc, h) => acc + getItemPct(h), 0) / totalTests)
      : 0;

  const displayName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const isAdmin = isAdminEmail(user?.email);

  const defaultProfile: StudentProfile = profile || {
    id: user.id,
    name: displayName,
    email: user.email || '',
    grade: '11th / Grade 11',
    stream: 'Pre-Medical Stream',
    subjects: ['Biology', 'Chemistry', 'Physics', 'English', 'Urdu', 'Islamiat'],
    sign_up_method: 'Google',
    status: 'active',
    is_registered: true,
    created_at: new Date().toISOString(),
  };

  return (
    <div className="animate-ios-spring text-left space-y-4">
      {/* 1. Top Controls Bar: Navigation Tabs + Theme Selector */}
      <div className="bg-slate-100 dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/10 p-2 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#2C2C2E] p-1 rounded-xl border border-slate-300 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0A0A0A] text-white dark:bg-[#F2B90C] dark:text-[#0A0A0A] shadow-sm'
                : 'text-slate-700 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0A0A0A] text-white dark:bg-[#F2B90C] dark:text-[#0A0A0A] shadow-sm'
                : 'text-slate-700 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Practice &amp; History</span>
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-end gap-1 bg-[#F5F5F7] dark:bg-white/10 p-1 rounded-xl border border-slate-200 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => handleSetTheme('light')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTheme === 'light'
                ? 'bg-[#F2B90C] text-[#0A0A0A] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetTheme('dark')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTheme === 'dark'
                ? 'bg-[#F2B90C] text-[#0A0A0A] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Admin Quick Banner */}
      {isAdmin && onOpenAdminDashboard && (
        <button
          type="button"
          onClick={onOpenAdminDashboard}
          className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-[#FF9F0A] font-extrabold py-2.5 px-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer text-xs active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F2B90C]" />
            <span>Boardly Admin Management Portal</span>
          </span>
          <span className="bg-[#0A0A0A] text-[#F2B90C] px-2.5 py-0.5 rounded-full font-extrabold text-[10px] border border-[#F2B90C]/30">
            Open &rarr;
          </span>
        </button>
      )}

      {/* 2. TAB CONTENT */}
      {activeTab === 'profile' ? (
        <StudentProfileView
          user={user}
          profile={defaultProfile}
          onRefreshProfile={onRefreshProfile}
          onStartPractice={onStartPractice}
          onSignOut={handleSignOut}
        />
      ) : (
        <div className="space-y-4 animate-ios-spring">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-xs">
            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/10 p-3 rounded-2xl text-center shadow-sm">
              <span className="text-slate-700 dark:text-[#8E8E93] text-[10px] uppercase font-extrabold block mb-1">Accuracy</span>
              <span className="text-xl font-extrabold text-[#0051A8] dark:text-[#0A84FF]">{avgPct}%</span>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/10 p-3 rounded-2xl text-center shadow-sm">
              <span className="text-slate-700 dark:text-[#8E8E93] text-[10px] uppercase font-extrabold block mb-1">MCQs Solved</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalMCQs}</span>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/10 p-3 rounded-2xl text-center shadow-sm">
              <span className="text-slate-700 dark:text-[#8E8E93] text-[10px] uppercase font-extrabold block mb-1">Tests Completed</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{totalTests}</span>
            </div>
          </div>

          {/* Start Practice Test Launcher Banner */}
          <button
            onClick={onStartPractice}
            className="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white font-extrabold py-3.5 px-5 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-md border border-[#F2B90C]/30"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F2B90C] flex items-center justify-center">
                <Play className="w-4 h-4 text-[#0A0A0A] fill-current" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold leading-tight text-white">Start Practice Test</span>
                <span className="text-[10px] text-slate-300 block font-medium">
                  FBISE Board Exams Class 9–12 &amp; AI Question Generator
                </span>
              </div>
            </div>
            <span className="text-xs bg-[#F2B90C] text-[#0A0A0A] px-3 py-1 rounded-full font-extrabold shadow-sm">
              Launch &rarr;
            </span>
          </button>

          {/* Supabase MCQ Test History List */}
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/10 rounded-[22px] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <History className="w-4 h-4 text-[#0051A8] dark:text-[#0A84FF]" />
                <span>Saved Test History (Supabase)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-700 dark:text-[#8E8E93] font-bold">{testHistory.length} Recorded</span>
                {testHistory.length > 0 && !showLmsConfirmClear && (
                  <button
                    onClick={() => setShowLmsConfirmClear(true)}
                    className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {showLmsConfirmClear && (
              <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-[#F2B90C] shrink-0 mt-0.5" />
                  <p className="font-bold text-[11px] leading-tight">Are you sure? This will delete all saved test history and reset your analytics.</p>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    disabled={isClearingLms}
                    onClick={() => setShowLmsConfirmClear(false)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isClearingLms}
                    onClick={handleConfirmClearLms}
                    className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-600 text-white flex items-center gap-1 disabled:opacity-50"
                  >
                    {isClearingLms ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Clearing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" />
                        <span>Yes, Clear</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {loadingHistory ? (
              <div className="py-8 text-center text-xs text-slate-700 dark:text-[#8E8E93] flex flex-col items-center gap-2 font-semibold">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-amber-400 rounded-full animate-spin" />
                <span>Syncing cloud test history...</span>
              </div>
            ) : testHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-700 dark:text-[#8E8E93] bg-slate-100 dark:bg-[#2C2C2E] border border-slate-300 dark:border-white/10 rounded-xl p-4">
                <BookOpen className="w-6 h-6 text-slate-500 dark:text-[#8E8E93]/40 mx-auto mb-2" />
                <p className="font-extrabold text-slate-900 dark:text-white">No practice tests saved yet.</p>
                <p className="text-[11px] text-slate-700 dark:text-[#8E8E93] mt-1 font-medium">
                  Complete a test to automatically sync your score, time taken, and accuracy to your cloud profile!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-white/10 border border-slate-300 dark:border-white/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {testHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-[#2C2C2E]/80 flex items-center justify-between text-xs hover:bg-slate-100 dark:hover:bg-[#3A3A3C] transition-colors"
                  >
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">{item.subject}</span>
                      <span className="text-slate-700 dark:text-[#8E8E93] text-[11px] font-semibold">
                        {item.pathLabel} &middot; {item.dateStr}
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-2">
                      <div>
                        <span className="font-extrabold text-[#0051A8] dark:text-[#0A84FF] text-sm block">
                          {item.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-700 dark:text-[#8E8E93] font-bold">
                          {item.score}/{item.total} ({item.timeTaken})
                        </span>
                      </div>
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          item.percentage >= 70 ? 'text-[#34C759] dark:text-[#30D158]' : 'text-amber-600 dark:text-[#FF9F0A]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

