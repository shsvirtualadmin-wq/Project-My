import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Zap,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Flame,
  FileText,
  Dna,
  FlaskConical,
  Brain,
  Layers,
  Award,
  ChevronRight,
  Play,
  RotateCcw,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  User as UserIcon,
  LogIn,
  Calculator,
  Cpu,
  BarChart2,
  Compass,
  Check
} from 'lucide-react';
import {
  TCAT_SUBJECTS,
  TCAT_GROUPS,
  TCATSubjectConfig,
  TCATTopic,
  TCATGroupCombination,
  getTCATSubjectByName,
  getTCATGroupCombination
} from '../data/tcatSyllabus';
import { QuestionDifficulty, TestMode, HistoryItem } from '../types';
import { User } from '../lib/supabase';
import { InstitutionBadge } from './InstitutionBadge';

interface TcatDashboardPortalProps {
  currentUser: User | null;
  history: HistoryItem[];
  onStartTcatTest: (params: {
    subject: string;
    chapterName?: string;
    questionCount: number;
    durationMinutes: number;
    difficulty: QuestionDifficulty;
    mode: TestMode;
    isFullMock?: boolean;
    groupSubjects?: string[];
  }) => void;
  onOpenAuth: (intendedParams?: any) => void;
  onOpenHistory: () => void;
  onBackToMainScreen?: () => void;
}

export const TcatDashboardPortal: React.FC<TcatDashboardPortalProps> = ({
  currentUser,
  history,
  onStartTcatTest,
  onOpenAuth,
  onOpenHistory,
  onBackToMainScreen,
}) => {
  // Active FSc Group Combination (default: pre-engineering)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('pre-engineering');
  const [selectedSubjectName, setSelectedSubjectName] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TCATTopic | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isFullMockConfig, setIsFullMockConfig] = useState<boolean>(false);

  // Test Config Options
  const [selectedCount, setSelectedCount] = useState<number>(20);
  const [selectedDuration, setSelectedDuration] = useState<number>(20);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>('Exam Standard');
  const [selectedMode, setSelectedMode] = useState<TestMode>('instant');

  const activeGroup = getTCATGroupCombination(selectedGroupId);
  const activeSubject = selectedSubjectName ? getTCATSubjectByName(selectedSubjectName) : null;

  // Filter TCAT-only history
  const tcatHistory = history.filter(
    (item) => item.pathLabel?.toLowerCase().includes('tcat') || item.subject?.toLowerCase().includes('tcat')
  );

  // Filter subjects based on student's selected FSc group combination
  const activeGroupSubjects = TCAT_SUBJECTS.filter((s) =>
    activeGroup.subjects.includes(s.name)
  );

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator':
        return <Calculator className="w-6 h-6 text-cyan-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-blue-400" />;
      case 'FlaskConical':
        return <FlaskConical className="w-6 h-6 text-emerald-400" />;
      case 'Cpu':
        return <Cpu className="w-6 h-6 text-sky-400" />;
      case 'Dna':
        return <Dna className="w-6 h-6 text-teal-400" />;
      case 'BarChart2':
        return <BarChart2 className="w-6 h-6 text-amber-400" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-purple-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-cyan-400" />;
    }
  };

  const handleOpenTopicTestModal = (topic: TCATTopic) => {
    setSelectedTopic(topic);
    setIsFullMockConfig(false);
    setSelectedCount(20);
    setSelectedDuration(20);
    setShowConfigModal(true);
  };

  const handleOpenSubjectTestModal = (subject: TCATSubjectConfig) => {
    setSelectedSubjectName(subject.name);
    setSelectedTopic(null);
    setIsFullMockConfig(false);
    setSelectedCount(subject.mcqCount);
    setSelectedDuration(subject.mcqCount);
    setShowConfigModal(true);
  };

  const handleOpenFullMockModal = () => {
    setIsFullMockConfig(true);
    setSelectedSubjectName(null);
    setSelectedTopic(null);
    setSelectedCount(100);
    setSelectedDuration(100);
    setShowConfigModal(true);
  };

  const handleConfirmStartTest = () => {
    const testParams = {
      subject: isFullMockConfig ? 'TCAT Full Mock' : activeSubject ? activeSubject.name : 'Mathematics',
      chapterName: selectedTopic ? selectedTopic.name : undefined,
      questionCount: isFullMockConfig ? 100 : selectedCount,
      durationMinutes: isFullMockConfig ? 100 : selectedDuration,
      difficulty: selectedDifficulty,
      mode: selectedMode,
      isFullMock: isFullMockConfig,
      groupSubjects: activeGroup.subjects,
    };

    if (!currentUser) {
      setShowConfigModal(false);
      onOpenAuth(testParams);
      return;
    }

    setShowConfigModal(false);
    onStartTcatTest(testParams);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 animate-fade-in text-slate-100">
      {/* Navigation Header Bar */}
      <div className="flex items-center justify-between bg-[#121214] border border-cyan-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackToMainScreen && (
            <button
              onClick={onBackToMainScreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
              title="Return to Boardly Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Space_Grotesk'] font-bold text-lg text-white">
                TCAT Dashboard
              </span>
              <span className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" />
                ENGINEERING TRACK
              </span>
            </div>
            <p className="text-xs text-slate-400">UET Taxila Combined Admission Test Preparation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold px-3 py-1.5 rounded-xl">
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="max-w-[120px] truncate">{currentUser.email}</span>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth()}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#101923] to-[#0A0E14] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              UET Taxila Admission Standard
            </span>
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
              100 MCQs • 100 Minutes • 400 Total Marks (0 Negative Marking)
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-['Space_Grotesk'] font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              TCAT / UET Taxila <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400">Entry Test Prep</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Comprehensive engineering entrance preparation tailored for UET Taxila degree programs. Practice FSc Part I & II subjects with real formula-driven MCQs, quick numerical calculations, and detailed step-by-step solutions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleOpenFullMockModal}
              className="flex-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer text-sm sm:text-base border border-cyan-300/40"
            >
              <Zap className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
              <span>Launch 100-MCQ TCAT Full Mock Test</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {tcatHistory.length > 0 && (
              <button
                onClick={onOpenHistory}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>My TCAT Results ({tcatHistory.length})</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-400">Target Tech & Eng Institutions:</span>
            <InstitutionBadge id="nust" size="sm" />
            <InstitutionBadge id="fast" size="sm" />
            <InstitutionBadge id="giki" size="sm" />
            <InstitutionBadge id="ned" size="sm" />
            <InstitutionBadge id="lums" size="sm" />
            <InstitutionBadge id="iba" size="sm" />
          </div>
        </div>
      </div>

      {/* Step 1: Select FSc Subject Combination */}
      <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
              Step 1 of 2 &middot; FSc Group Combination
            </span>
            <h2 className="font-['Space_Grotesk'] font-extrabold text-lg text-white mt-2 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Select Your Study Combination
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            Determines your 100-MCQ test breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TCAT_GROUPS.map((group) => {
            const isSelected = selectedGroupId === group.id;
            return (
              <div
                key={group.id}
                onClick={() => {
                  setSelectedGroupId(group.id);
                  setSelectedSubjectName(null);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 shadow-md shadow-cyan-500/10'
                    : 'bg-[#18181C] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {group.badge}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className={`font-['Space_Grotesk'] font-bold text-sm ${isSelected ? 'text-cyan-300' : 'text-white'}`}>
                    {group.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{group.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedSubjectName ? (
        /* Overview: Subject Cards for Active Combination */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Space_Grotesk'] font-extrabold text-xl text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                {activeGroup.title} Syllabus Topics
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a subject to practice specific topics or start a subject-wise test</p>
            </div>
            <span className="text-xs text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full hidden sm:inline-block">
              {activeGroupSubjects.length} Core Subjects • 100 MCQs Total
            </span>
          </div>

          {/* Grid of Subject Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGroupSubjects.map((subject) => (
              <div
                key={subject.id}
                className="bg-[#141417] border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                      {getSubjectIcon(subject.iconName)}
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${subject.badgeColor}`}>
                      {subject.mcqCount} MCQs ({subject.weightagePercent}%)
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {subject.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      {subject.topics.length} Syllabus Topics
                    </span>
                    <span>•</span>
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {subject.topics.filter((t) => t.isHighYield).length} High Yield
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSubjectName(subject.name)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>View Topics ({subject.topics.length})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  <button
                    onClick={() => handleOpenSubjectTestModal(subject)}
                    className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title={`Practice ${subject.name}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-cyan-300" />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
            ))}

            {/* AI Custom Practice Card */}
            <div className="bg-gradient-to-br from-[#0F1B26] to-[#0A1118] border border-cyan-500/30 rounded-3xl p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                    Formula-Heavy TCAT Engine
                  </span>
                </div>
                <h3 className="font-['Space_Grotesk'] font-bold text-base text-white">
                  Full 100-MCQ Mock Exam Simulation
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Exact UET Taxila structure: 100 minutes, 400 marks, subject weightage breakdown, and no negative marking.
                </p>
              </div>

              <button
                onClick={handleOpenFullMockModal}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Start 100-MCQ Full Mock</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Topic List View for Selected Subject */
        activeSubject && (
          <div className="space-y-5 animate-fade-in">
            {/* Subject Header */}
            <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSubjectName(null)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Space_Grotesk'] font-extrabold text-xl text-white">
                      {activeSubject.name} Topics
                    </h2>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${activeSubject.badgeColor}`}>
                      {activeSubject.mcqCount} MCQs ({activeSubject.weightagePercent}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeSubject.topics.length} official TCAT topics for targeted formula & calculation practice
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenSubjectTestModal(activeSubject)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Practice All {activeSubject.name} Topics</span>
              </button>
            </div>

            {/* Topic Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeSubject.topics.map((topic, idx) => (
                <div
                  key={topic.id}
                  className="bg-[#141417] border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <h3 className="font-['Space_Grotesk'] font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {topic.name}
                        </h3>
                      </div>

                      {topic.isHighYield && (
                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          <Flame className="w-3 h-3 text-cyan-400 fill-cyan-400" />
                          High Yield
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed pl-9">
                      {topic.subtopics}
                    </p>
                  </div>

                  <div className="pt-2 pl-9 flex items-center justify-between border-t border-slate-800/50">
                    <span className="text-[11px] text-slate-500 font-medium">
                      FSc Part I & II Concept
                    </span>
                    <button
                      onClick={() => handleOpenTopicTestModal(topic)}
                      className="bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 border border-slate-700 hover:border-cyan-500 text-slate-200 font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* Test Config Launcher Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141417] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isFullMockConfig ? 'TCAT 100-MCQ Full Mock Test' : 'TCAT Topic Practice'}
                  </span>
                  <h3 className="font-['Space_Grotesk'] font-extrabold text-lg text-white mt-1">
                    {isFullMockConfig
                      ? `TCAT Full Mock (${activeGroup.title})`
                      : selectedTopic
                      ? selectedTopic.name
                      : activeSubject
                      ? `${activeSubject.name} Practice`
                      : 'TCAT Practice Test'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
                >
                  ✕
                </button>
              </div>

              {isFullMockConfig ? (
                /* Full Mock Summary Box */
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                    <span>Total Questions: 100 MCQs</span>
                    <span>Duration: 100 Minutes</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-cyan-500/20">
                    <p>• {activeGroup.subjects[0]}: 30 MCQs (30%, 120 Marks)</p>
                    <p>• {activeGroup.subjects[1]}: 30 MCQs (30%, 120 Marks)</p>
                    <p>• {activeGroup.subjects[2]}: 30 MCQs (30%, 120 Marks)</p>
                    <p>• English: 10 MCQs (10%, 40 Marks)</p>
                  </div>
                  <p className="text-[11px] text-cyan-400/90 italic pt-1">
                    Total Marks: 400. Single-best-answer format. 0 negative marking per UET Taxila guidelines.
                  </p>
                </div>
              ) : (
                /* Topic Test Customizer */
                <div className="space-y-4 text-xs">
                  {/* Number of MCQs */}
                  <div>
                    <label className="block text-slate-300 font-extrabold mb-2">
                      Number of MCQs
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 20, 30, 50].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setSelectedCount(cnt)}
                          className={`py-2 rounded-xl font-extrabold transition-all border ${
                            selectedCount === cnt
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {cnt} MCQs
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-slate-300 font-extrabold mb-2">
                      Time Duration (Minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 20, 30, 45].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setSelectedDuration(dur)}
                          className={`py-2 rounded-xl font-extrabold transition-all border ${
                            selectedDuration === dur
                              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {dur} Mins
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode & Feedback */}
                  <div>
                    <label className="block text-slate-300 font-extrabold mb-2">
                      Practice Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMode('instant')}
                        className={`p-3 rounded-xl border text-left font-bold transition-all ${
                          selectedMode === 'instant'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-black">Instant Feedback</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Show solution after each question</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMode('ai-custom')}
                        className={`p-3 rounded-xl border text-left font-bold transition-all ${
                          selectedMode === 'ai-custom'
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-xs font-black">Exam Mode (Timer)</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Full simulation with final score</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!currentUser && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs text-rose-300">
                  <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Mandatory Sign-In required before starting TCAT test attempts.</span>
                </div>
              )}

              {/* Confirm CTA */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmStartTest}
                  className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer border border-cyan-300/30"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{currentUser ? 'Start Practice Test' : 'Sign In & Start Test'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
