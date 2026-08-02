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
  FolderOpen
} from 'lucide-react';
import { User, StudentProfile, fetchStudentWeaknessProfile, StudentWeaknessProfileData } from '../lib/supabase';
import { HistoryItem } from '../types';
import { PastPapersSection } from './PastPapersSection';
import { InstitutionBadge } from './InstitutionBadge';

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
  isAdmin = false,
}) => {
  const [weaknessProfile, setWeaknessProfile] = useState<StudentWeaknessProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'past_papers'>('overview');

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
  const avgAccuracy = history.length
    ? Math.round(history.reduce((acc, curr) => acc + getItemPct(curr), 0) / history.length)
    : 0;
  const testsCompleted = history.length;

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-5 py-2">
      {/* Personalized Welcome Card */}
      <div className="bg-white dark:bg-[#151515] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-7 border border-black/10 dark:border-white/10 shadow-xl relative overflow-hidden flex flex-col gap-6 transition-colors">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#F2B90C]/15 dark:bg-[#F2B90C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Locked Class/Stream Tag */}
          <div className="inline-flex items-center gap-2 bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 border border-[#007AFF]/30 dark:border-[#0A84FF]/40 text-[#007AFF] dark:text-[#64D2FF] px-3.5 py-1.5 rounded-full text-xs font-extrabold">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>{classStreamDisplay}</span>
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
        <div className="space-y-2 relative z-10">
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

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10 pt-1">
          <button
            type="button"
            onClick={onStartPracticeTest}
            className="flex-1 bg-[#F2B90C] hover:bg-[#E0A800] text-[#0A0A0A] font-extrabold py-3.5 px-5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#0A0A0A] fill-[#0A0A0A]" />
            <span>FBISE Practice Test</span>
          </button>

          {onSelectTcat && (
            <button
              type="button"
              onClick={onSelectTcat}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-extrabold py-3.5 px-5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-cyan-400/30"
            >
              <Target className="w-4 h-4 text-cyan-200" />
              <span>TCAT Entry Portal</span>
            </button>
          )}

          {onSelectMdcat && (
            <button
              type="button"
              onClick={onSelectMdcat}
              className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold py-3.5 px-5 rounded-2xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer border border-rose-400/30"
            >
              <Sparkles className="w-4 h-4 text-white fill-white/20" />
              <span>MDCAT Entry Portal</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenLmsPortal}
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-900 dark:border-white/15 font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#F2B90C]" />
            <span>LMS Portal</span>
          </button>
        </div>

        {/* Target Institutions & Partners Band (featuring official NUST logo) */}
        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center gap-2 text-xs relative z-10">
          <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">Target Universities & Entry Tests:</span>
          <InstitutionBadge id="nust" size="sm" showFullName />
          <InstitutionBadge id="fast" size="sm" />
          <InstitutionBadge id="giki" size="sm" />
          <InstitutionBadge id="uhs" size="sm" />
          <InstitutionBadge id="lums" size="sm" />
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
        <PastPapersSection />
      ) : (
        <>
          {/* Progress Summary Cards (Overall Academic Progress) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-['Space_Grotesk'] text-sm font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Overall Academic Progress</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-medium">Real-time Analytics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Metric 1: Total MCQs Solved */}
          <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold">MCQs Solved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
              {totalMcqsSolved}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Total questions attempted</p>
          </div>

          {/* Metric 2: Average Accuracy */}
          <div className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold">Average Accuracy</span>
              <Award className="w-4 h-4 text-[#F2B90C]" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk'] flex items-baseline gap-1">
              <span>{avgAccuracy}%</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Overall score percentage</p>
          </div>

          {/* Metric 3: Tests Completed */}
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-[11px] font-bold">Tests Taken</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Space_Grotesk']">
              {testsCompleted}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Practice test sessions</p>
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
    </section>
  );
});

