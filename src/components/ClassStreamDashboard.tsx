import React, { useState, useEffect } from 'react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../lib/haptics';
import { BoardClass, QuestionDifficulty, TestMode, HistoryItem, Question, TestConfig } from '../types';
import { MdcatDashboardPortal } from './MdcatDashboardPortal';
import { TcatDashboardPortal } from './TcatDashboardPortal';
import { getDashboardConfig, DASHBOARD_CONFIGS, DashboardStreamConfig } from '../data/dashboardsConfig';
import { SUBJECT_TOPICS, getSubjectTopicsForClass } from '../data/categories';
import { PREBUILT_QUESTIONS, getPrebuiltQuestionsForSubject } from '../data/prebuiltQuestions';
import { getBookmarkedQuestions, removeBookmark, saveBookmark, BookmarkedQuestion } from '../lib/bookmarks';
import { fetchSharedCustomTopics, saveSharedCustomTopic, normalizeTopicName, fetchStudentMcqUsage, StudentMcqUsageInfo, User } from '../lib/supabase';
import { getSubjectBadgeStyle } from '../utils/subjectBadge';
import { mapSubject } from '../utils/subjectMapper';
import {
  BookOpen,
  Sparkles,
  Zap,
  Award,
  TrendingUp,
  Clock,
  BarChart3,
  Bookmark,
  ChevronRight,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  Check,
  Sliders,
  ArrowLeft,
  Flame,
  Target,
  FileText,
  Trash2,
  ChevronDown,
  Layers,
  Lock,
  GraduationCap,
  Loader2
} from 'lucide-react';

interface ClassStreamDashboardProps {
  classNum: BoardClass;
  group: string;
  history: HistoryItem[];
  isAdmin?: boolean;
  currentUser?: User | null;
  isGenerating?: boolean;
  onOpenAuth?: (intendedParams?: any) => void;
  onSelectStream: (cNum: BoardClass, grp: string) => void;
  onStartTest: (params: {
    subject: string;
    customTopic?: string;
    durationMinutes: number;
    questionCount: number;
    difficulty: QuestionDifficulty;
    mode: TestMode;
    instantFeedback: boolean;
    bypassCache?: boolean;
  }) => void;
  onBackToClasses: () => void;
}

export const ClassStreamDashboard: React.FC<ClassStreamDashboardProps> = ({
  classNum,
  group,
  history,
  isAdmin = false,
  currentUser,
  isGenerating = false,
  onOpenAuth,
  onSelectStream,
  onStartTest,
  onBackToClasses,
}) => {
  if (String(classNum) === 'TCAT') {
    return (
      <TcatDashboardPortal
        currentUser={currentUser || null}
        history={history}
        onStartTcatTest={(params) => {
          onStartTest({
            subject: params.subject,
            customTopic: params.chapterName,
            durationMinutes: params.durationMinutes,
            questionCount: params.questionCount,
            difficulty: params.difficulty,
            mode: params.mode,
            instantFeedback: true,
          });
        }}
        onOpenAuth={onOpenAuth || (() => {})}
        onOpenHistory={() => {}}
        onBackToMainScreen={onBackToClasses}
      />
    );
  }

  if (String(classNum) === 'MDCAT') {
    return (
      <MdcatDashboardPortal
        currentUser={currentUser || null}
        history={history}
        onStartMdcatTest={(params) => {
          const effectiveTopic = params.topic || (params.subtopic ? `${params.chapterName ? params.chapterName + ' - ' : ''}${params.subtopic}` : params.chapterName);
          onStartTest({
            subject: params.subject,
            customTopic: effectiveTopic,
            durationMinutes: params.durationMinutes,
            questionCount: params.questionCount,
            difficulty: params.difficulty,
            mode: params.mode,
            instantFeedback: true,
            subtopic: params.subtopic,
            chapterName: params.chapterName,
          } as any);
        }}
        onOpenAuth={onOpenAuth || (() => {})}
        onOpenHistory={() => {}}
        onBackToMainScreen={onBackToClasses}
      />
    );
  }

  const config = getDashboardConfig(classNum, group);
  const [activeTab, setActiveTab] = useState<
    'subjects' | 'generator' | 'practice' | 'mock' | 'progress' | 'activity' | 'analytics' | 'bookmarks'
  >('subjects');

  const [showStreamSelector, setShowStreamSelector] = useState(false);

  // Filter history items relevant to this class and group
  const getItemPercentage = (item: HistoryItem | any): number => {
    if (typeof item.percentage === 'number' && !isNaN(item.percentage) && item.percentage > 0) {
      return item.percentage;
    }
    const score = Number(item.score ?? item.correct ?? 0);
    const total = Number(item.total ?? 0);
    if (total > 0) {
      return Math.round((score / total) * 100);
    }
    return typeof item.percentage === 'number' && !isNaN(item.percentage) ? item.percentage : 0;
  };

  const isSubjectMatch = (itemSubject: string, targetSubject: string): boolean => {
    if (!itemSubject || !targetSubject) return false;
    const s1 = itemSubject.toLowerCase().trim();
    const s2 = targetSubject.toLowerCase().trim();
    if (s1.includes(s2) || s2.includes(s1)) return true;
    if ((s1.includes('math') && s2.includes('math')) ||
        (s1.includes('comp') && s2.includes('comp')) ||
        (s1.includes('bio') && s2.includes('bio')) ||
        (s1.includes('chem') && s2.includes('chem')) ||
        (s1.includes('phys') && s2.includes('phys')) ||
        (s1.includes('urd') && s2.includes('urd')) ||
        (s1.includes('eng') && s2.includes('eng')) ||
        (s1.includes('isl') && s2.includes('isl')) ||
        (s1.includes('pak') && s2.includes('pak'))) {
      return true;
    }
    return false;
  };

  const matchedStreamHistory = history.filter((item) => {
    const label = (item.pathLabel || '').toLowerCase();
    const sub = (item.subject || '').toLowerCase();
    return label.includes(String(classNum)) || sub.includes(String(classNum));
  });
  const streamHistory = matchedStreamHistory.length > 0 ? matchedStreamHistory : history;

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>(() => getBookmarkedQuestions());
  const [selectedBookmarkSubject, setSelectedBookmarkSubject] = useState<string>('All');
  const [expandedBookmarkId, setExpandedBookmarkId] = useState<string | null>(null);

  useEffect(() => {
    setBookmarks(getBookmarkedQuestions());
  }, [activeTab]);

  // MCQ Generator State
  const [genSubject, setGenSubject] = useState<string>(config.subjects[0] || 'Urdu');
  const [genTopic, setGenTopic] = useState<string>('All Topics');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [sharedCustomTopics, setSharedCustomTopics] = useState<string[]>([]);
  const [genBypassCache, setGenBypassCache] = useState<boolean>(false);
  const [genQuestionCount, setGenQuestionCount] = useState<number>(10);
  const [genDifficulty, setGenDifficulty] = useState<QuestionDifficulty>('Medium');
  const [genMode, setGenMode] = useState<TestMode>('instant');
  const [genDuration, setGenDuration] = useState<number>(10);
  const [genInstantFeedback, setGenInstantFeedback] = useState<boolean>(true);

  // Student MCQ Usage State
  const [mcqUsage, setMcqUsage] = useState<StudentMcqUsageInfo | null>(null);

  const loadMcqUsage = () => {
    const activeUserId = currentUser?.id || 'guest';
    const activeUserEmail = currentUser?.email;
    fetchStudentMcqUsage(activeUserId, activeUserEmail).then((info) => {
      setMcqUsage(info);
    });
  };

  useEffect(() => {
    let isMounted = true;
    const updateUsage = () => {
      const activeUserId = currentUser?.id || 'guest';
      const activeUserEmail = currentUser?.email;
      fetchStudentMcqUsage(activeUserId, activeUserEmail).then((info) => {
        if (isMounted) {
          setMcqUsage(info);
        }
      });
    };

    updateUsage();

    window.addEventListener('focus', updateUsage);
    const interval = setInterval(updateUsage, 3000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', updateUsage);
      clearInterval(interval);
    };
  }, [activeTab, currentUser?.id, currentUser?.email]);

  // Update generator subject when dashboard config changes
  useEffect(() => {
    if (config.subjects.length > 0 && !config.subjects.includes(genSubject)) {
      setGenSubject(config.subjects[0]);
    }
  }, [config, genSubject]);

  // Load shared custom topics from Supabase when genSubject or activeTab changes
  useEffect(() => {
    let isMounted = true;
    if (genSubject) {
      fetchSharedCustomTopics(genSubject).then((topics) => {
        if (isMounted) {
          setSharedCustomTopics(topics);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [genSubject, activeTab]);

  // Calculate daily practice streak based on test history
  const calculateDailyStreak = (historyItems: HistoryItem[]): number => {
    if (!historyItems || historyItems.length === 0) return 0;

    const uniqueDays = new Set<string>();
    historyItems.forEach((item) => {
      let dateObj: Date | null = null;
      if (item.dateStr) {
        dateObj = new Date(item.dateStr);
      }
      if (!dateObj || isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }
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
  };

  const dailyStreak = calculateDailyStreak(history);

  // Calculate stream-specific stats
  const totalTestsCount = streamHistory.length;
  const avgAccuracy = totalTestsCount > 0
    ? Math.round(streamHistory.reduce((acc, curr) => acc + getItemPercentage(curr), 0) / totalTestsCount)
    : 0;
  const totalQuestionsAnswered = streamHistory.reduce((acc, curr) => acc + curr.total, 0);

  // Subject topic lists helper
  const getSubjectTopics = (sub: string): string[] => {
    return getSubjectTopicsForClass(sub, classNum);
  };

  const handleLaunchPractice = (subject: string, topic?: string) => {
    triggerHaptic(HAPTIC_PATTERNS.medium);
    const targetSub = mapSubject(subject);
    onStartTest({
      subject: targetSub,
      customTopic: topic,
      durationMinutes: 10,
      questionCount: 10,
      difficulty: 'Medium',
      mode: 'instant',
      instantFeedback: true,
    });
  };

  const handleLaunchMock = (subject?: string) => {
    triggerHaptic(HAPTIC_PATTERNS.medium);
    const targetSub = mapSubject(subject || config.subjects[0] || 'Physics');
    onStartTest({
      subject: targetSub,
      durationMinutes: config.mockExamTimeMinutes,
      questionCount: config.mockQuestionCount,
      difficulty: 'Exam Standard',
      mode: 'instant',
      instantFeedback: false,
    });
  };

  const handleRemoveBookmark = (id: string) => {
    const updated = removeBookmark(id);
    setBookmarks(updated);
  };

  const filteredBookmarks = bookmarks.filter((bm) => {
    if (selectedBookmarkSubject === 'All') return true;
    return bm.subject === selectedBookmarkSubject;
  });

  return (
    <section className="dashboard-container screen animate-ios-spring text-left flex flex-col gap-3 sm:gap-4 pb-4">
      {/* Top Header & Stream Badge */}
      <div className="flex flex-col gap-2 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] sm:rounded-[28px] p-3.5 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onBackToClasses}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Portals</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowStreamSelector(!showStreamSelector)}
              className="flex items-center gap-1.5 text-xs font-extrabold bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Switch Portal</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showStreamSelector && (
              <div className="absolute right-0 top-9 z-50 w-64 bg-white dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-2xl p-2 shadow-2xl max-h-72 overflow-y-auto">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Select Class & Entry Portal
                </div>
                {DASHBOARD_CONFIGS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectStream(item.classNum, item.group);
                      setShowStreamSelector(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#3A3A3C] transition-colors ${
                      item.classNum === classNum && item.group === group
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'text-slate-800 dark:text-white'
                    }`}
                  >
                    <span>{item.shortTitle}</span>
                    <span className="text-[10px] opacity-70">{item.levelTag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold tracking-wider uppercase text-white px-2.5 py-0.5 rounded-full ${config.badgeBg}`}>
                {config.shortTitle}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-[#8E8E93]">
                {config.levelTag}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              {config.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-[#8E8E93] font-medium mt-0.5">
              {config.description}
            </p>
          </div>

          {/* Core Stats Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-100 dark:bg-[#2C2C2E] p-2.5 rounded-2xl border border-slate-200 dark:border-white/5 shrink-0">
            <div className="text-center px-1">
              <div className="text-base font-extrabold text-orange-500 dark:text-orange-400 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse shrink-0" />
                <span>{dailyStreak}</span>
              </div>
              <div className="text-[9px] font-bold text-slate-500 dark:text-[#8E8E93] uppercase">Streak</div>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-white/10" />
            <div className="text-center px-1">
              <div className="text-base font-extrabold text-slate-900 dark:text-white">{totalTestsCount}</div>
              <div className="text-[9px] font-bold text-slate-500 dark:text-[#8E8E93] uppercase">Tests</div>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-white/10" />
            <div className="text-center px-1">
              <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{avgAccuracy}%</div>
              <div className="text-[9px] font-bold text-slate-500 dark:text-[#8E8E93] uppercase">Accuracy</div>
            </div>
            <div className="w-px h-6 bg-slate-300 dark:bg-white/10" />
            <div className="text-center px-1">
              <div className="text-base font-extrabold text-amber-600 dark:text-amber-400">{bookmarks.length}</div>
              <div className="text-[9px] font-bold text-slate-500 dark:text-[#8E8E93] uppercase">Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'subjects', label: 'Subjects', icon: BookOpen },
          { id: 'generator', label: 'MCQ Generator', icon: Sparkles },
          { id: 'practice', label: 'Practice Tests', icon: Zap },
          { id: 'mock', label: 'Mock Exams', icon: Award },
          { id: 'progress', label: 'Progress', icon: TrendingUp },
          { id: 'activity', label: 'Recent Activity', icon: Clock },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'bookmarks', label: `Saved (${bookmarks.length})`, icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-[#0A0A0A] text-white dark:bg-[#F2B90C] dark:text-[#0A0A0A] shadow-md font-bold'
                  : 'bg-white dark:bg-[#151515] text-slate-700 dark:text-slate-300 border border-black/10 dark:border-white/10 hover:border-[#F2B90C]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}

      {/* TAB 1: SUBJECT CARDS */}
      {activeTab === 'subjects' && (
        <div className="flex flex-col gap-3 animate-ios-spring">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-500 dark:text-[#8E8E93] tracking-wider">
              Stream Subjects ({config.subjects.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Click subject to practice</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.subjects.map((subject) => {
              const badge = getSubjectBadgeStyle(subject);
              const topics = getSubjectTopics(subject);

              // Subject stats from history
              const subTests = streamHistory.filter((h) => isSubjectMatch(h.subject, subject));
              const subAvg = subTests.length > 0
                ? Math.round(subTests.reduce((acc, c) => acc + getItemPercentage(c), 0) / subTests.length)
                : 0;

              return (
                <div
                  key={subject}
                  className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[22px] p-4 flex flex-col justify-between hover:border-emerald-500 dark:hover:border-emerald-400 transition-all shadow-xs group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {subject.substring(0, 3).toUpperCase()}
                      </span>
                      {subAvg > 0 && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {subAvg}% Avg
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {subject}
                    </h3>

                    {/* Topic previews */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {topics.slice(0, 3).map((top, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-semibold text-slate-600 dark:text-[#8E8E93] bg-slate-100 dark:bg-[#2C2C2E] px-2 py-0.5 rounded-md truncate max-w-[130px]"
                        >
                          {top}
                        </span>
                      ))}
                      {topics.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400 px-1">
                          +{topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleLaunchPractice(subject)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all text-center cursor-pointer"
                    >
                      Practice MCQs
                    </button>
                    <button
                      onClick={() => handleLaunchMock(subject)}
                      className="py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-[#2C2C2E] text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-200 dark:hover:bg-[#3A3A3C] transition-all cursor-pointer"
                    >
                      Mock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MCQ GENERATOR */}
      {activeTab === 'generator' && (
        <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] p-4 sm:p-5 animate-ios-spring">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              AI & Prebuilt MCQ Generator
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#8E8E93] mb-4">
            Configure custom test parameters for Class {classNum} ({group}).
          </p>

          {/* Monthly MCQ Usage Progress Bar */}
          {classNum === 'MDCAT' || group === 'MDCAT' ? (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>MDCAT Unrestricted MCQ Generator &mdash; No rate limits or app-side caps</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-700/50">
                Unlimited MCQs
              </span>
            </div>
          ) : mcqUsage && (
            <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 flex flex-col gap-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold gap-2 flex-wrap">
                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  Monthly AI MCQ Generation Quota
                </span>
                <span className="text-slate-900 dark:text-white font-extrabold bg-white dark:bg-[#1C1C1E] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-1.5">
                  {mcqUsage.currentUsage} / 100 MCQs generated this month
                  {mcqUsage.isAdmin && (
                    <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                      Admin Exempt
                    </span>
                  )}
                </span>
              </div>

              <div className="w-full bg-slate-200 dark:bg-white/10 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    mcqUsage.currentUsage >= 100 && !mcqUsage.isAdmin
                      ? 'bg-rose-500'
                      : mcqUsage.currentUsage >= 80
                      ? 'bg-amber-500'
                      : 'bg-[#007AFF] dark:bg-[#0A84FF]'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((mcqUsage.currentUsage / 100) * 100))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8E8E93] font-semibold">
                <span>
                  {mcqUsage.isAdmin
                    ? 'Admin Account (Exempt from 100 limit blocking)'
                    : 100 - mcqUsage.currentUsage > 0
                    ? `${Math.max(0, 100 - mcqUsage.currentUsage)} AI questions remaining`
                    : 'Monthly generation limit reached'}
                </span>
                <span>Resets on {mcqUsage.resetDate}</span>
              </div>

              {mcqUsage.currentUsage >= 100 && !mcqUsage.isAdmin && (
                <div className="mt-1 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 rounded-xl text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-start gap-2 leading-relaxed">
                  <span className="text-base leading-none">🚫</span>
                  <div>
                    You've reached your monthly limit of 100 AI-generated MCQs. This resets on <span className="font-extrabold">{mcqUsage.resetDate}</span>. You can still practice using previously generated/cached questions.
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Subject Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Subject
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {config.subjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      setGenSubject(sub);
                      setGenTopic('All Topics');
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all cursor-pointer ${
                      genSubject === sub
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-[#2C2C2E] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Topic Filter
                </label>
                {genTopic === '__custom_topic__' && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Custom Topic Active
                  </span>
                )}
              </div>
              <select
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="All Topics">All Topics ({genSubject})</option>
                <option value="__custom_topic__">✏️ Custom Topic / Chapter (Type new...)</option>
                
                <optgroup label="Standard Syllabus Topics">
                  {getSubjectTopics(genSubject).map((top) => (
                    <option key={top} value={top}>
                      {top}
                    </option>
                  ))}
                </optgroup>

                {sharedCustomTopics.length > 0 && (
                  <optgroup label="Shared Community Custom Topics">
                    {sharedCustomTopics.map((top) => (
                      <option key={`shared-${top}`} value={top}>
                        ⭐ {top}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Revealed Custom Topic Input Field */}
              {genTopic === '__custom_topic__' && (
                <div className="mt-2.5 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl animate-ios-spring">
                  <label className="block text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Enter Custom Topic / Chapter Name
                  </label>
                  <input
                    type="text"
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    placeholder="e.g. Chapter 5: Chemical Bonding or Photosynthesis"
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-300 dark:border-white/20 rounded-lg p-2.5 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 leading-tight">
                    💡 This custom topic will be saved to the shared list for all students in <span className="font-bold">{genSubject}</span>.
                  </p>
                </div>
              )}
            </div>

            {/* Question Count & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Count
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setGenQuestionCount(num);
                        setGenDuration(num);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        genQuestionCount === num
                          ? 'bg-[#007AFF] text-white border-[#007AFF]'
                          : 'bg-slate-50 dark:bg-[#2C2C2E] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={genDifficulty}
                  onChange={(e) => setGenDifficulty(e.target.value as QuestionDifficulty)}
                  className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Exam Standard">Exam Standard</option>
                </select>
              </div>
            </div>

            {/* Instant Feedback toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#2C2C2E] rounded-xl border border-slate-200 dark:border-white/10">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Instant Feedback</div>
                <div className="text-[10px] text-slate-500">Show answer explanation right after each question</div>
              </div>
              <input
                type="checkbox"
                checked={genInstantFeedback}
                onChange={(e) => setGenInstantFeedback(e.target.checked)}
                className="w-4 h-4 accent-[#007AFF] cursor-pointer"
              />
            </div>

            {/* Question Cache Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#2C2C2E] rounded-xl border border-slate-200 dark:border-white/10">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Reuse Saved Question Bank (Fast Cache)</div>
                <div className="text-[10px] text-slate-500">Serve instant questions from shared bank if available</div>
              </div>
              <input
                type="checkbox"
                checked={!genBypassCache}
                onChange={(e) => setGenBypassCache(!e.target.checked)}
                className="w-4 h-4 accent-[#007AFF] cursor-pointer"
              />
            </div>


            <button
              type="button"
              onClick={() => {
                let resolvedTopic: string | undefined = undefined;

                if (genTopic === '__custom_topic__') {
                  const cleaned = customTopicInput.trim();
                  if (cleaned) {
                    resolvedTopic = cleaned;
                    // Asynchronously save new custom topic to Supabase shared list
                    saveSharedCustomTopic(genSubject, cleaned);
                  }
                } else if (genTopic !== 'All Topics') {
                  resolvedTopic = genTopic;
                }

                triggerHaptic(HAPTIC_PATTERNS.medium);
                onStartTest({
                  subject: genSubject,
                  customTopic: resolvedTopic,
                  durationMinutes: genDuration,
                  questionCount: genQuestionCount,
                  difficulty: genDifficulty,
                  mode: genMode,
                  instantFeedback: genInstantFeedback,
                  bypassCache: genBypassCache,
                });
              }}
              disabled={isGenerating}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm active:scale-98 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 mt-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating MCQs...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate & Start Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PRACTICE TESTS */}
      {activeTab === 'practice' && (
        <div className="flex flex-col gap-3 animate-ios-spring">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            High-Yield Practice Sets
          </div>

          {config.subjects.map((sub) => {
            const badge = getSubjectBadgeStyle(sub);
            return (
              <div
                key={sub}
                className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[22px] p-4 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl ${badge.bg} text-white font-extrabold flex items-center justify-center text-xs shrink-0`}>
                    {sub.substring(0, 3).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">{sub} Speed Drill</div>
                    <div className="text-xs text-slate-500 font-medium">10 Questions • 10 Mins • Instant Feedback</div>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchPractice(sub)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  Start
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: MOCK EXAMS */}
      {activeTab === 'mock' && (
        <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] p-4 sm:p-5 animate-ios-spring flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Full-Length Board Mock Exam
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Simulated FBISE {config.levelTag} Board Exam environment.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 dark:bg-[#2C2C2E] p-3 rounded-2xl border border-slate-200 dark:border-white/10 text-center">
            <div>
              <div className="text-xs font-bold text-slate-500">Duration</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">{config.mockExamTimeMinutes} Mins</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Questions</div>
              <div className="text-sm font-black text-slate-900 dark:text-white">{config.mockQuestionCount} MCQs</div>
            </div>
            <div className="col-span-1">
              <div className="text-xs font-bold text-slate-500">Pass Mark</div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">50% Standard</div>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-[#8E8E93] leading-relaxed">
            • Instant feedback is turned off during the exam to simulate real test conditions.<br />
            • Complete all questions within the allocated time before submitting.
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => handleLaunchMock()}
              className="w-full py-3 bg-amber-500 text-white rounded-2xl font-extrabold text-sm hover:bg-amber-600 active:scale-98 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>Start Stream Board Mock Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: PROGRESS TRACKING */}
      {activeTab === 'progress' && (
        <div className="flex flex-col gap-3 animate-ios-spring">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Stream Mastery</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{avgAccuracy}%</div>
              <div className="text-xs text-slate-500 mt-0.5">Based on {totalTestsCount} test sessions</div>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-sm">
              {avgAccuracy}%
            </div>
          </div>

          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Subject Wise Mastery
          </div>

          {config.subjects.map((sub) => {
            const subTests = streamHistory.filter((h) => isSubjectMatch(h.subject, sub));
            const subAvg = subTests.length > 0
              ? Math.round(subTests.reduce((acc, c) => acc + getItemPercentage(c), 0) / subTests.length)
              : 0;

            return (
              <div key={sub} className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-900 dark:text-white">{sub}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{subAvg}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#2C2C2E] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${subAvg}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 6: RECENT ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="flex flex-col gap-3 animate-ios-spring">
          {streamHistory.length === 0 ? (
            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] p-6 text-center text-slate-500 text-xs font-medium">
              No recent activity recorded for this stream yet. Take your first test!
            </div>
          ) : (
            streamHistory.map((item) => {
              const pct = getItemPercentage(item);
              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">{item.subject}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                      {item.dateStr} • {item.timeTaken}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-black ${pct >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.score}/{item.total} ({pct}%)
                    </div>
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      {pct >= 50 ? 'PASSED' : 'NEEDS REVIEW'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 7: PERFORMANCE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] p-4 sm:p-5 animate-ios-spring flex flex-col gap-4">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Performance & Speed Analytics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-[#2C2C2E] p-3 rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Response Time</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1">42 sec / q</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#2C2C2E] p-3 rounded-2xl border border-slate-200 dark:border-white/5">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Highest Score</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {streamHistory.length > 0 ? `${Math.max(...streamHistory.map(h => getItemPercentage(h)))}%` : 'N/A'}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-600 dark:text-[#8E8E93] leading-relaxed">
            <strong>Key Focus Area:</strong> Practice questions regularly to increase speed and maintain consistent scores above 80% for top FBISE board ranking.
          </div>
        </div>
      )}

      {/* TAB 8: SAVED & BOOKMARKED QUESTIONS */}
      {activeTab === 'bookmarks' && (
        <div className="flex flex-col gap-3 animate-ios-spring">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase text-slate-500 dark:text-[#8E8E93] tracking-wider">
              Saved Bookmarked Questions ({filteredBookmarks.length})
            </h2>

            <select
              value={selectedBookmarkSubject}
              onChange={(e) => setSelectedBookmarkSubject(e.target.value)}
              className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="All">All Subjects</option>
              {config.subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {filteredBookmarks.length === 0 ? (
            <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] p-6 text-center text-slate-500 text-xs font-medium">
              No bookmarked questions saved yet for this filter. During practice or test review, click the bookmark icon to save high-yield questions here!
            </div>
          ) : (
            filteredBookmarks.map((bm, index) => {
              const isExpanded = expandedBookmarkId === bm.id;
              return (
                <div
                  key={bm.id}
                  className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400">{bm.subject}</span>
                    <button
                      onClick={() => handleRemoveBookmark(bm.id)}
                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                    {index + 1}. {bm.question.q}
                  </p>

                  <button
                    onClick={() => setExpandedBookmarkId(isExpanded ? null : bm.id)}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline text-left self-start mt-1 flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'Show Options & Explanation'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5 text-xs">
                      {bm.question.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded-xl text-xs font-medium border ${
                            optIdx === bm.question.correct
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 font-bold'
                              : 'bg-slate-50 dark:bg-[#2C2C2E] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt} {optIdx === bm.question.correct && ' ✓'}
                        </div>
                      ))}
                      {bm.question.explain && (
                        <div className="mt-1 p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-900 dark:text-blue-200 text-[11px] rounded-xl border border-blue-200 dark:border-blue-500/20">
                          <strong>Explanation:</strong> {bm.question.explain}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
};
