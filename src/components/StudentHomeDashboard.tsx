import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  History, 
  CheckCircle2, 
  Award, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  ChevronRight,
  BarChart2,
  Target,
  AlertCircle,
  FolderOpen,
  Flame
} from 'lucide-react';
import { User, StudentProfile, fetchStudentWeaknessProfile, StudentWeaknessProfileData } from '../lib/supabase';
import { HistoryItem } from '../types';
import { PastPapersSection } from './PastPapersSection';
import { InstitutionBadge, renderTargetUniversityBadge } from './InstitutionBadge';
import { TargetUniversityModal } from './TargetUniversityModal';
import { triggerHaptic, HAPTIC_PATTERNS } from '../lib/haptics';

/**
 * Accuracy threshold percentage cutoff for identifying weak subject/chapter areas.
 * Default cutoff is 50%. Adjust this constant to alter strictness (e.g., 60% or 40%).
 */
export const WEAK_ACCURACY_THRESHOLD = 50;

export interface WeakAreaItem {
  subject: string;
  topic?: string;
  displayName: string;
  total: number;
  correct: number;
  accuracy: number;
  message: string;
}

interface StudentHomeDashboardProps {
  currentUser: User;
  userProfile: StudentProfile | null;
  history: HistoryItem[];
  onStartPracticeTest: () => void;
  onPracticeWeakTopic?: (subject: string, topic?: string) => void;
  onSelectMdcat?: () => void;
  onSelectTcat?: () => void;
  onOpenLmsPortal: () => void;
  onOpenHistory: () => void;
  onOpenCommunity?: () => void;
  onUpdateProfile?: (updatedProfile: StudentProfile) => void;
  isAdmin?: boolean;
}

// Parse raw subject/chapter string into clean subject and topic
function parseSubjectAndTopic(rawSubject: string, rawChapter?: string): { subject: string; topic?: string } {
  if (rawChapter && rawChapter !== rawSubject && rawChapter !== 'General Concepts' && rawChapter !== 'General') {
    if (rawChapter.includes(' — ')) {
      const parts = rawChapter.split(' — ');
      return { subject: parts[0].trim(), topic: parts.slice(1).join(' — ').trim() };
    }
    return { subject: rawSubject.trim(), topic: rawChapter.trim() };
  }

  const parenMatch = rawSubject.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    return { subject: parenMatch[1].trim(), topic: parenMatch[2].trim() };
  }

  if (rawSubject.includes(' — ')) {
    const parts = rawSubject.split(' — ');
    return { subject: parts[0].trim(), topic: parts.slice(1).join(' — ').trim() };
  }

  return { subject: rawSubject.trim() };
}

export const StudentHomeDashboard: React.FC<StudentHomeDashboardProps> = React.memo(({
  currentUser,
  userProfile,
  history,
  onStartPracticeTest,
  onPracticeWeakTopic,
  onSelectMdcat,
  onSelectTcat,
  onOpenLmsPortal,
  onOpenHistory,
  onOpenCommunity,
  onUpdateProfile,
  isAdmin = false,
}) => {
  const [weaknessProfile, setWeaknessProfile] = useState<StudentWeaknessProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'past_papers'>('overview');
  const [showUniModal, setShowUniModal] = useState<boolean>(false);

  // Fetch logged-in student's weakness profile securely via API
  useEffect(() => {
    let isMounted = true;
    if (currentUser?.id) {
      setIsLoadingProfile(true);
      fetchStudentWeaknessProfile(currentUser.id)
        .then((data) => {
          if (isMounted) {
            setWeaknessProfile(data);
            setIsLoadingProfile(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoadingProfile(false);
        });
    } else {
      setIsLoadingProfile(false);
    }
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Calculate subject/chapter accuracy map combining API profile and student history
  const weakAreas = React.useMemo(() => {
    const topicMap: Record<string, { subject: string; topic?: string; displayName: string; total: number; correct: number }> = {};

    // 1. Process API weakness profile
    if (weaknessProfile) {
      const breakdown = weaknessProfile.chapterBreakdown && weaknessProfile.chapterBreakdown.length > 0
        ? weaknessProfile.chapterBreakdown
        : weaknessProfile.weakestTopics || [];

      for (const item of breakdown) {
        const parsed = parseSubjectAndTopic(weaknessProfile.subject || item.chapter, item.chapter);
        const disp = parsed.topic ? `${parsed.subject} — ${parsed.topic}` : parsed.subject;
        const key = `${parsed.subject}::${parsed.topic || 'General'}`.toLowerCase();

        topicMap[key] = {
          subject: parsed.subject,
          topic: parsed.topic,
          displayName: disp,
          total: item.total,
          correct: item.correct,
        };
      }
    }

    // 2. Aggregate local student history items to ensure full coverage
    for (const item of history) {
      const parsed = parseSubjectAndTopic(item.subject);
      const disp = parsed.topic ? `${parsed.subject} — ${parsed.topic}` : parsed.subject;
      const key = `${parsed.subject}::${parsed.topic || 'General'}`.toLowerCase();

      if (!topicMap[key]) {
        topicMap[key] = {
          subject: parsed.subject,
          topic: parsed.topic,
          displayName: disp,
          total: item.total,
          correct: item.score,
        };
      } else {
        topicMap[key].total = Math.max(topicMap[key].total, item.total);
        topicMap[key].correct = Math.max(topicMap[key].correct, item.score);
      }
    }

    // 3. Compute accuracy % and filter topics below WEAK_ACCURACY_THRESHOLD (50%)
    const result: WeakAreaItem[] = [];
    for (const key of Object.keys(topicMap)) {
      const stats = topicMap[key];
      if (stats.total <= 0) continue;

      const accuracy = Math.round((stats.correct / stats.total) * 100);
      if (accuracy < WEAK_ACCURACY_THRESHOLD) {
        let message = 'Needs practice — lower accuracy detected';
        if (accuracy <= 25) {
          message = 'High priority — immediate practice recommended';
        } else if (accuracy <= 40) {
          message = 'Targeted practice needed to reach passing grade';
        } else {
          message = 'Close to target — extra review will help';
        }

        result.push({
          subject: stats.subject,
          topic: stats.topic,
          displayName: stats.displayName,
          total: stats.total,
          correct: stats.correct,
          accuracy,
          message,
        });
      }
    }

    // 4. Sort weak areas from LOWEST accuracy to HIGHEST accuracy
    result.sort((a, b) => {
      if (a.accuracy !== b.accuracy) {
        return a.accuracy - b.accuracy;
      }
      return b.total - a.total;
    });

    return result;
  }, [weaknessProfile, history]);

  // Determine student display name
  const rawName = 
    currentUser.user_metadata?.full_name || 
    currentUser.user_metadata?.name || 
    (userProfile as any)?.full_name || 
    userProfile?.name || 
    currentUser.email?.split('@')[0] || 
    'Student';

  // Capitalize name cleanly
  const studentName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  // Student locked class & stream format
  const gradeStr = userProfile?.grade;
  const streamStr = userProfile?.stream;
  const isRegistered = userProfile?.is_registered || isAdmin;

  const classStreamDisplay = gradeStr && streamStr
    ? `${gradeStr} — ${streamStr}`
    : gradeStr
      ? `${gradeStr}`
      : 'Course Registration Required';

  // Statistics calculation from history
  const getItemPct = (item: HistoryItem): number => {
    if (typeof item.percentage === 'number' && !isNaN(item.percentage) && item.percentage > 0) {
      return item.percentage;
    }
    const score = Number(item.score ?? 0);
    const total = Number(item.total ?? 0);
    if (total > 0) return Math.round((score / total) * 100);
    return typeof item.percentage === 'number' && !isNaN(item.percentage) ? item.percentage : 0;
  };

  const totalMcqsSolved = history.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const correctMcqsSolved = history.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avgAccuracy = history.length
    ? Math.round(history.reduce((acc, curr) => acc + getItemPct(curr), 0) / history.length)
    : 0;
  const testsCompleted = history.length;

  // Gamification: XP & Levels
  const currentXP = (testsCompleted * 50) + (correctMcqsSolved * 10);
  const currentLevel = Math.floor(Math.sqrt(currentXP / 100)) + 1;
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
  const progressToNextLevel = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

  // Calculate daily practice streak based on test history
  const dailyStreak = React.useMemo(() => {
    if (!history || history.length === 0) return 0;

    const uniqueDays = new Set<string>();
    history.forEach((item) => {
      let dateObj: Date | null = null;
      if (item.dateStr) dateObj = new Date(item.dateStr);
      if (!dateObj || isNaN(dateObj.getTime())) dateObj = new Date();
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      uniqueDays.add(`${year}-${month}-${day}`);
    });

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const today = new Date();
    const todayStr = formatDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    let currentCheck = new Date(today);
    if (!uniqueDays.has(todayStr)) {
      if (!uniqueDays.has(yesterdayStr)) {
        return 0;
      }
      currentCheck = yesterday;
    }

    let streak = 0;
    while (true) {
      const dayStr = formatDate(currentCheck);
      if (uniqueDays.has(dayStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [history]);

  // Last 7 days status for weekly activity pills in streak card
  const last7DaysStatus = React.useMemo(() => {
    const days: { dayName: string; isActive: boolean; isToday: boolean }[] = [];
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const uniqueDays = new Set<string>();

    history.forEach((item) => {
      let dateObj: Date | null = null;
      if (item.dateStr) dateObj = new Date(item.dateStr);
      if (!dateObj || isNaN(dateObj.getTime())) dateObj = new Date();
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      uniqueDays.add(`${year}-${month}-${day}`);
    });

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      days.push({
        dayName: dayLabels[d.getDay()],
        isActive: uniqueDays.has(dateKey),
        isToday: i === 0,
      });
    }
    return days;
  }, [history]);

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-5 py-2">
      {/* Personalized Welcome Card */}
      <div className="bg-white dark:bg-[#151515] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/10 shadow-xl relative overflow-hidden flex flex-col gap-6 transition-colors">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#F2B90C]/15 dark:bg-[#F2B90C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Pro Status & Class Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pro Status Badge */}
            {(isAdmin || userProfile?.is_pro || userProfile?.payment_status === 'Verified & Paid' || (userProfile?.subscribed_plans && userProfile.subscribed_plans.some(p => ['pro', 'fsc', 'mdcat', 'tcat', 'matric', 'premium', 'boardly_pro'].includes(p.toLowerCase()))) || (userProfile?.package_name && !userProfile.package_name.toLowerCase().includes('free'))) ? (
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>⭐ Boardly Pro Member</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-bold">
                <span>Free Tier Member</span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 border border-[#007AFF]/30 dark:border-[#0A84FF]/40 text-[#007AFF] dark:text-[#64D2FF] px-3.5 py-1.5 rounded-full text-xs font-extrabold">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>{classStreamDisplay}</span>
            </div>

            {/* Header Streak Pill */}
            <div className="inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full text-xs font-extrabold">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
              <span>{dailyStreak > 0 ? `${dailyStreak}d Streak 🔥` : '0d Streak'}</span>
            </div>

            {/* Header Level Pill */}
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-extrabold">
              <Award className="w-3.5 h-3.5 fill-amber-500/20 text-amber-500" />
              <span>Lvl {currentLevel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="text-[10px] font-extrabold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-full">
                Admin Account
              </span>
            )}
            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-white bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 px-3.5 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer font-bold"
            >
              <History className="w-3.5 h-3.5 text-[#D99A00] dark:text-[#F2B90C]" />
              <span>History ({history.length})</span>
            </button>
          </div>
        </div>

        {/* Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#D99A00] dark:text-[#F2B90C] uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Student Dashboard</span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Welcome back, {studentName}! 👋
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Track your FBISE board exam practice performance, review chapter accuracy, and practice targeted MCQs.
            </p>
          </div>
        </div>

        {/* Assigned Classes & Test Series Box */}
        {userProfile?.assigned_classes && userProfile.assigned_classes.length > 0 && (
          <div className="bg-slate-50/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Assigned Classes & Active Test Series</span>
              </span>
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                {userProfile.assigned_classes.length} Authorized {userProfile.assigned_classes.length === 1 ? 'Track' : 'Tracks'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {userProfile.assigned_classes.map((cls, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl text-xs font-extrabold"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <span>{cls}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Primary Action Buttons - Personalized to student's registered track */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10 pt-1">
          {userProfile?.grade?.toUpperCase().includes('MDCAT') ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.medium);
                if (onSelectMdcat) onSelectMdcat(); else onStartPracticeTest();
              }}
              className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold py-3.5 px-5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-rose-400/30"
            >
              <Sparkles className="w-4 h-4 text-white fill-white/20" />
              <span>MDCAT Entry Test Portal</span>
            </button>
          ) : userProfile?.grade?.toUpperCase().includes('TCAT') ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.medium);
                if (onSelectTcat) onSelectTcat(); else onStartPracticeTest();
              }}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold py-3.5 px-5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-cyan-400/30"
            >
              <Target className="w-4 h-4 text-cyan-200" />
              <span>UET Taxila TCAT Entry Portal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.medium);
                onStartPracticeTest();
              }}
              className="flex-1 bg-[#F2B90C] hover:bg-[#E0A800] text-[#0A0A0A] font-extrabold py-3.5 px-5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <Zap className="w-4 h-4 text-[#0A0A0A] fill-[#0A0A0A]" />
              <span>
                {userProfile?.grade || 'Class 11'} {userProfile?.stream || 'Pre-Engineering'} Practice Test
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic(HAPTIC_PATTERNS.light);
              onOpenLmsPortal();
            }}
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-900 dark:border-white/15 font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#F2B90C]" />
            <span>LMS Portal</span>
          </button>
        </div>

        {/* Target University Band - Displays only student's selected dream university */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2 text-xs relative z-10">
          <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
            Target University:
          </span>
          {renderTargetUniversityBadge(
            userProfile?.dream_university || userProfile?.target_university,
            'sm',
            () => setShowUniModal(true)
          )}
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-[#202020] text-slate-900 dark:text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-emerald-500" />
          <span>Academic Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('past_papers')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'past_papers'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-rose-300" />
          <span>Past Papers & Drive</span>
        </button>
      </div>

      {activeTab === 'past_papers' ? (
        <PastPapersSection
          isAdmin={isAdmin}
          userProfile={userProfile}
          currentUser={currentUser}
        />
      ) : (
        <>
          {/* Progress Summary Bento Grid (Academic Performance & Gamification) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Gamification & Performance Hub</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
            Real-time Analytics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Bento Item 1: XP Progress Ring Card */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white dark:bg-[#151515] border border-amber-200/80 dark:border-amber-500/20 rounded-3xl p-5 shadow-sm hover:border-amber-400 dark:hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#F2B90C]/10 dark:bg-[#F2B90C]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/10 border border-amber-300/50 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Award className="w-4 h-4 fill-amber-500/20" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level & XP Progress</h4>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">Level {currentLevel} Explorer</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#D99A00] dark:text-[#F2B90C] bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-1 rounded-full">
                {currentXP.toLocaleString()} XP
              </span>
            </div>

            {/* Circular Progress Ring + XP Bar */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 sm:w-20 sm:h-20 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="text-slate-100 dark:text-white/10"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    className="text-[#F2B90C] transition-all duration-1000 ease-out"
                    strokeWidth="5"
                    strokeDasharray={163.36}
                    strokeDashoffset={163.36 - (163.36 * progressToNextLevel) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-extrabold text-slate-400 leading-none">LVL</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">{currentLevel}</span>
                </div>
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Progress to Lvl {currentLevel + 1}</span>
                  <span className="font-extrabold text-[#D99A00] dark:text-[#F2B90C]">{Math.round(progressToNextLevel)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-[#F2B90C] via-[#F5D166] to-[#F2B90C] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(5, progressToNextLevel)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentXP} / {xpForNextLevel} XP • +50/test, +10/correct
                </p>
              </div>
            </div>
          </div>

          {/* Bento Item 2: Daily Streak Badge Card */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white dark:bg-[#151515] border border-orange-200/80 dark:border-orange-500/20 rounded-3xl p-5 shadow-sm hover:border-orange-400 dark:hover:border-orange-500/40 transition-all flex flex-col justify-between gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-500/10 border border-orange-300/50 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Flame className="w-4 h-4 fill-orange-500/30" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Practice Streak</h4>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
                    {dailyStreak > 0 ? `${dailyStreak} Day Streak 🔥` : 'Start Your Streak'}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                dailyStreak > 0
                  ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400'
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
              }`}>
                {dailyStreak > 0 ? 'Active 🔥' : 'Inactive'}
              </span>
            </div>

            {/* Streak 7-Day Visualizer */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between gap-1">
                {last7DaysStatus.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-full h-8 sm:h-9 rounded-xl flex items-center justify-center transition-all ${
                        d.isActive
                          ? 'bg-gradient-to-b from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-500/30 font-bold'
                          : d.isToday
                          ? 'bg-orange-100 dark:bg-orange-500/20 border border-dashed border-orange-400 text-orange-600 dark:text-orange-300'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {d.isActive ? (
                        <Flame className="w-4 h-4 fill-white" />
                      ) : (
                        <span className="text-[10px] font-extrabold">{d.dayName[0]}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold ${d.isToday ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`}>
                      {d.dayName}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                {dailyStreak > 0
                  ? `You've practiced ${dailyStreak} consecutive day${dailyStreak > 1 ? 's' : ''}! Keep up the daily habit.`
                  : 'Complete at least 1 practice session today to ignite your streak!'}
              </p>
            </div>
          </div>

          {/* Bento Item 3: MCQs Solved Card */}
          <div className="col-span-1 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-3xl p-4.5 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">MCQs Solved</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">
                {totalMcqsSolved}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {correctMcqsSolved} answered correctly
              </p>
            </div>
          </div>

          {/* Bento Item 4: Average Accuracy Card */}
          <div className="col-span-1 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-3xl p-4.5 shadow-sm hover:border-amber-300 dark:hover:border-amber-500/30 transition-all flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Avg Accuracy</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">
                {avgAccuracy}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {avgAccuracy >= 80 ? 'Mastery Tier ⭐' : avgAccuracy >= 60 ? 'Passing Range 👍' : 'Targeted Practice Needed'}
              </p>
            </div>
          </div>

          {/* Bento Item 5: Tests Taken Card (Spans 2 cols on lg) */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-3xl p-4.5 shadow-sm hover:border-sky-300 dark:hover:border-sky-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-100 dark:bg-sky-500/10 border border-sky-300/40 dark:border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Practice Sessions</h4>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">
                  {testsCompleted} Tests Completed
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-xs font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/20 hover:bg-sky-100 dark:hover:bg-sky-500/20 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <span>Review History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Areas to Improve / Focus Areas */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-500" />
            <span>Areas to Improve</span>
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 px-2.5 py-0.5 rounded-full font-bold">
            Cutoff: &lt;{WEAK_ACCURACY_THRESHOLD}% Accuracy
          </span>
        </div>

        {isLoadingProfile ? (
          <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">
            Analyzing subject and chapter accuracy...
          </div>
        ) : weakAreas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weakAreas.map((area, idx) => (
              <div
                key={`${area.subject}-${area.topic || idx}`}
                className="bg-white dark:bg-[#151515] border border-rose-200 dark:border-rose-500/20 hover:border-rose-400 dark:hover:border-rose-500/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3 transition-all group relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20">
                      {area.subject}
                    </span>
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 font-['Space_Grotesk'] bg-rose-100 dark:bg-rose-950/60 border border-rose-300/40 dark:border-rose-800/40 px-2.5 py-0.5 rounded-full">
                      {area.accuracy}% accuracy
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors leading-snug">
                      {area.displayName}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {area.correct}/{area.total} attempted correct
                    </p>
                  </div>

                  <p className="text-[11px] italic font-medium text-rose-600/90 dark:text-rose-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{area.message}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onPracticeWeakTopic && onPracticeWeakTopic(area.subject, area.topic)}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm cursor-pointer mt-1"
                >
                  <Zap className="w-3.5 h-3.5 fill-white text-white" />
                  <span>Retry This Subject</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Positive empty state when no weak areas detected below threshold */
          <div className="bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 flex items-center gap-3.5 text-emerald-900 dark:text-emerald-200 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-xs sm:text-sm">
                Great job! No weak areas detected — keep up the consistent practice.
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                All attempted subjects and chapters are currently performing above the {WEAK_ACCURACY_THRESHOLD}% accuracy threshold.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity List (if history exists) */}
      {history.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#0A0A0A] dark:text-white">
              Recent Practice History
            </h3>
            <button
              type="button"
              onClick={onOpenHistory}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={onOpenHistory}
                className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 flex items-center justify-between hover:border-[#F2B90C] transition-all cursor-pointer shadow-sm group"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#D99A00] dark:group-hover:text-[#F2B90C] transition-colors">
                    {item.subject}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.pathLabel} • {item.dateStr} • {item.timeTaken}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full">
                    {item.score}/{item.total} ({getItemPct(item)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      <TargetUniversityModal
        isOpen={showUniModal}
        onClose={() => setShowUniModal(false)}
        currentUser={currentUser}
        userProfile={userProfile}
        onUniversityUpdated={(updated) => {
          if (onUpdateProfile) {
            onUpdateProfile(updated);
          }
        }}
      />
    </section>
  );
});

