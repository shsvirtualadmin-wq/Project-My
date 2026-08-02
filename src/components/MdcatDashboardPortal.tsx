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
  ListFilter,
  Target
} from 'lucide-react';
import { MDCAT_SUBJECTS, MDCATSubjectConfig, MDCATChapter, getMDCATSubjectById, parseSubtopics } from '../data/mdcatSyllabus';
import { UserAnswer, QuestionDifficulty, TestMode, HistoryItem } from '../types';
import { User } from '../lib/supabase';
import { InstitutionBadge } from './InstitutionBadge';

interface MdcatDashboardPortalProps {
  currentUser: User | null;
  history: HistoryItem[];
  onStartMdcatTest: (params: {
    subject: string;
    chapterName?: string;
    subtopic?: string;
    topic?: string;
    questionCount: number;
    durationMinutes: number;
    difficulty: QuestionDifficulty;
    mode: TestMode;
    isFullMock?: boolean;
  }) => void;
  onOpenAuth: (intendedParams?: any) => void;
  onOpenHistory: () => void;
  onBackToMainScreen?: () => void;
}

export const MdcatDashboardPortal: React.FC<MdcatDashboardPortalProps> = ({
  currentUser,
  history,
  onStartMdcatTest,
  onOpenAuth,
  onOpenHistory,
  onBackToMainScreen,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [activeChapterForSubtopics, setActiveChapterForSubtopics] = useState<MDCATChapter | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<MDCATChapter | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [isFullMockConfig, setIsFullMockConfig] = useState<boolean>(false);

  // Test Config Options
  const [selectedCount, setSelectedCount] = useState<number>(20);
  const [selectedDuration, setSelectedDuration] = useState<number>(20);
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>('Exam Standard');
  const [selectedMode, setSelectedMode] = useState<TestMode>('instant');

  const activeSubject = selectedSubjectId ? getMDCATSubjectById(selectedSubjectId) : null;

  // Filter MDCAT-only history
  const mdcatHistory = history.filter(
    (item) => item.pathLabel?.toLowerCase().includes('mdcat') || item.subject?.toLowerCase().includes('mdcat')
  );

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dna':
        return <Dna className="w-6 h-6 text-emerald-400" />;
      case 'FlaskConical':
        return <FlaskConical className="w-6 h-6 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-6 h-6 text-cyan-400" />;
      case 'BookOpen':
        return <BookOpen className="w-6 h-6 text-purple-400" />;
      case 'Brain':
        return <Brain className="w-6 h-6 text-rose-400" />;
      default:
        return <BookOpen className="w-6 h-6 text-amber-400" />;
    }
  };

  const handleOpenSubtopicTestModal = (chapter: MDCATChapter, subtopicName: string) => {
    setSelectedChapter(chapter);
    setSelectedSubtopic(subtopicName);
    setIsFullMockConfig(false);
    setSelectedCount(10);
    setSelectedDuration(10);
    setShowConfigModal(true);
  };

  const handleOpenChapterTestModal = (chapter: MDCATChapter) => {
    setSelectedChapter(chapter);
    setSelectedSubtopic(null);
    setIsFullMockConfig(false);
    setSelectedCount(20);
    setSelectedDuration(20);
    setShowConfigModal(true);
  };

  const handleOpenSubjectTestModal = (subject: MDCATSubjectConfig) => {
    setSelectedSubjectId(subject.id);
    setActiveChapterForSubtopics(null);
    setSelectedChapter(null);
    setSelectedSubtopic(null);
    setIsFullMockConfig(false);
    setSelectedCount(Math.min(subject.mcqCount, 30));
    setSelectedDuration(Math.min(subject.mcqCount, 30));
    setShowConfigModal(true);
  };

  const handleOpenFullMockModal = () => {
    setIsFullMockConfig(true);
    setSelectedSubjectId(null);
    setActiveChapterForSubtopics(null);
    setSelectedChapter(null);
    setSelectedSubtopic(null);
    setSelectedCount(180);
    setSelectedDuration(180);
    setShowConfigModal(true);
  };

  const handleConfirmStartTest = () => {
    const topicString = selectedSubtopic
      ? `${selectedChapter?.name} - ${selectedSubtopic}`
      : selectedChapter
      ? selectedChapter.name
      : undefined;

    const testParams = {
      subject: isFullMockConfig ? 'MDCAT Full Mock' : activeSubject ? activeSubject.name : 'Biology',
      chapterName: selectedChapter ? selectedChapter.name : undefined,
      subtopic: selectedSubtopic || undefined,
      topic: topicString,
      questionCount: isFullMockConfig ? 180 : selectedCount,
      durationMinutes: isFullMockConfig ? 180 : selectedDuration,
      difficulty: selectedDifficulty,
      mode: selectedMode,
      isFullMock: isFullMockConfig,
    };

    if (!currentUser) {
      setShowConfigModal(false);
      onOpenAuth(testParams);
      return;
    }

    setShowConfigModal(false);
    onStartMdcatTest(testParams);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 animate-fade-in text-slate-100">
      {/* Navigation Header bar */}
      <div className="flex items-center justify-between bg-[#121214] border border-amber-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-md">
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
                MDCAT Portal 2026
              </span>
              <span className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-400" />
                Unrestricted AI
              </span>
            </div>
            <p className="text-xs text-slate-400">PMDC Uniform Curriculum Standard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl">
              <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[120px] truncate">{currentUser.email}</span>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth()}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#18181C] to-[#0E0E10] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              PMDC MDCAT 2026 Uniform Curriculum
            </span>
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              180 MCQs • 180 Minutes • 0 Negative Marking
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-['Space_Grotesk'] font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              National MDCAT <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">Preparation Portal</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Master the Medical & Dental College Admission Test with 64 PMDC chapters and individual topic-level practice across Biology, Chemistry, Physics, English, and Logical Reasoning.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleOpenFullMockModal}
              className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer text-sm sm:text-base border border-amber-300/40"
            >
              <Zap className="w-5 h-5 fill-slate-950 stroke-[2.5]" />
              <span>Launch 180-MCQ Full Mock Test</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {mdcatHistory.length > 0 && (
              <button
                onClick={onOpenHistory}
                className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>My MDCAT Results ({mdcatHistory.length})</span>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-400">Target Medical Boards:</span>
            <InstitutionBadge id="uhs" size="sm" />
            <InstitutionBadge id="duhs" size="sm" />
            <InstitutionBadge id="nums" size="sm" />
            <InstitutionBadge id="kmu" size="sm" />
            <InstitutionBadge id="szabmu" size="sm" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedSubjectId ? (
        /* Overview: 5 Subject Cards & Breakdown */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-['Space_Grotesk'] font-extrabold text-xl text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                MDCAT Subject Weightage & Chapters
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Select a subject to explore chapters and individual subtopics</p>
            </div>
            <span className="text-xs text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full hidden sm:inline-block">
              5 Core Subjects • 64 Chapters Total
            </span>
          </div>

          {/* Grid of 5 Subject Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MDCAT_SUBJECTS.map((subject) => (
              <div
                key={subject.id}
                className="bg-[#141417] border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 group-hover:border-amber-500/40 transition-colors">
                      {getSubjectIcon(subject.iconName)}
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${subject.badgeColor}`}>
                      {subject.mcqCount} MCQs ({subject.weightagePercent}%)
                    </span>
                  </div>

                  <div>
                    <h3 className="font-['Space_Grotesk'] font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {subject.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 font-semibold text-slate-300">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      {subject.chapters.length} Chapters
                    </span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {subject.chapters.filter((c) => c.isHighYield).length} High Yield
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedSubjectId(subject.id);
                      setActiveChapterForSubtopics(null);
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>View Chapters ({subject.chapters.length})</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    onClick={() => handleOpenSubjectTestModal(subject)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
                    title={`Quick Practice ${subject.name}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-amber-300" />
                    <span>Practice</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Unrestricted AI Info Card */}
            <div className="bg-gradient-to-br from-[#1A1118] to-[#120E15] border border-rose-500/30 rounded-3xl p-5 flex flex-col justify-between space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                    Unrestricted AI Engine
                  </span>
                </div>
                <h3 className="font-['Space_Grotesk'] font-bold text-base text-white">
                  Subtopic & Micro-Topic Scoped MCQs
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate unlimited PMDC questions pinpointed to any subtopic or chapter with detailed step-by-step solutions.
                </p>
              </div>

              <button
                onClick={handleOpenFullMockModal}
                className="w-full bg-rose-500 hover:bg-rose-400 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Try Full 180-MCQ Mock</span>
              </button>
            </div>
          </div>
        </div>
      ) : activeSubject && activeChapterForSubtopics ? (
        /* LEVEL 2: Subtopics Selection View for Selected Chapter */
        <div className="space-y-5 animate-fade-in">
          {/* Level 2 Navigation Header */}
          <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveChapterForSubtopics(null);
                  setSelectedSubtopic(null);
                }}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
                title="Back to Subject Chapter List"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${activeSubject.badgeColor}`}>
                    {activeSubject.name}
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-xs font-bold text-amber-400">
                    Chapter {activeSubject.chapters.findIndex((c) => c.id === activeChapterForSubtopics.id) + 1}
                  </span>
                  {activeChapterForSubtopics.isHighYield && (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                      High Yield
                    </span>
                  )}
                </div>
                <h2 className="font-['Space_Grotesk'] font-extrabold text-xl text-white mt-1">
                  {activeChapterForSubtopics.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a specific subtopic below for targeted practice or launch practice for the entire chapter.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenChapterTestModal(activeChapterForSubtopics)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Practice Full Chapter</span>
            </button>
          </div>

          {/* Practice Full Chapter Hero Banner */}
          <div className="bg-gradient-to-r from-[#18181F] via-[#15151B] to-[#121217] border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Target className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Full Chapter Assessment
                </div>
                <h3 className="font-['Space_Grotesk'] font-bold text-base text-white mt-0.5">
                  Practice All Subtopics Combined
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generates questions covering all subtopics of "{activeChapterForSubtopics.name}" combined.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenChapterTestModal(activeChapterForSubtopics)}
              className="w-full sm:w-auto bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Play className="w-4 h-4 fill-amber-300" />
              <span>Practice Full Chapter</span>
            </button>
          </div>

          {/* Subtopics Section Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-['Space_Grotesk'] font-extrabold text-base text-white flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-amber-400" />
                Select Subtopic ({parseSubtopics(activeChapterForSubtopics.subtopics).length})
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Tap any topic to launch AI-scoped questions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {parseSubtopics(activeChapterForSubtopics.subtopics).map((subtopicItem, subIdx) => (
                <div
                  key={subIdx}
                  className="bg-[#141417] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        Topic {String(subIdx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        PMDC {activeSubject.name}
                      </span>
                    </div>

                    <h4 className="font-['Space_Grotesk'] font-bold text-sm text-white group-hover:text-amber-300 transition-colors pt-1">
                      {subtopicItem}
                    </h4>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Subtopic Granularity
                    </span>
                    <button
                      onClick={() => handleOpenSubtopicTestModal(activeChapterForSubtopics, subtopicItem)}
                      className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>Practice Topic</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* LEVEL 1: Chapter List View for Selected Subject */
        activeSubject && (
          <div className="space-y-5 animate-fade-in">
            {/* Subject Header */}
            <div className="bg-[#141417] border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedSubjectId(null);
                    setActiveChapterForSubtopics(null);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                  title="Back to Subject Grid"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Space_Grotesk'] font-extrabold text-xl text-white">
                      {activeSubject.name} Syllabus
                    </h2>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${activeSubject.badgeColor}`}>
                      {activeSubject.mcqCount} MCQs ({activeSubject.weightagePercent}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeSubject.chapters.length} PMDC syllabus chapters available. Tap any chapter to view subtopics or practice.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleOpenSubjectTestModal(activeSubject)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Practice All {activeSubject.name} Chapters</span>
              </button>
            </div>

            {/* Chapter Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeSubject.chapters.map((chapter, idx) => {
                const subtopicList = parseSubtopics(chapter.subtopics);
                return (
                  <div
                    key={chapter.id}
                    className="bg-[#141417] border border-slate-800/80 hover:border-amber-500/40 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between space-y-3 group"
                  >
                    <div
                      className="space-y-2.5 cursor-pointer"
                      onClick={() => setActiveChapterForSubtopics(chapter)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h3 className="font-['Space_Grotesk'] font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                            {chapter.name}
                          </h3>
                        </div>

                        {chapter.isHighYield && (
                          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                            <Flame className="w-3 h-3 text-rose-400 fill-rose-400" />
                            High Yield
                          </span>
                        )}
                      </div>

                      {/* Subtopic Preview Pills */}
                      <div className="pl-9 flex flex-wrap gap-1.5">
                        {subtopicList.slice(0, 3).map((st, i) => (
                          <span
                            key={i}
                            className="bg-slate-900/80 text-slate-300 border border-slate-800 text-[11px] px-2 py-0.5 rounded-md"
                          >
                            {st}
                          </span>
                        ))}
                        {subtopicList.length > 3 && (
                          <span className="text-amber-400 font-bold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            +{subtopicList.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 pl-9 flex items-center justify-between border-t border-slate-800/50 gap-2">
                      <button
                        onClick={() => setActiveChapterForSubtopics(chapter)}
                        className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <ListFilter className="w-3.5 h-3.5 text-amber-400" />
                        <span>Explore Subtopics ({subtopicList.length})</span>
                      </button>

                      <button
                        onClick={() => handleOpenChapterTestModal(chapter)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        title="Practice entire chapter"
                      >
                        <Play className="w-3 h-3 fill-amber-300" />
                        <span>Practice Chapter</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
              className="bg-[#141417] border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    {isFullMockConfig
                      ? 'PMDC Full Mock Test'
                      : selectedSubtopic
                      ? 'Subtopic Focused Practice'
                      : 'Chapter Practice Test'}
                  </span>
                  <h3 className="font-['Space_Grotesk'] font-extrabold text-lg text-white mt-1">
                    {isFullMockConfig
                      ? 'MDCAT 180-MCQ Full Length Mock'
                      : selectedSubtopic
                      ? selectedSubtopic
                      : selectedChapter
                      ? selectedChapter.name
                      : activeSubject
                      ? `${activeSubject.name} Full Practice`
                      : 'MDCAT Test'}
                  </h3>
                  {selectedSubtopic && selectedChapter && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Chapter: {selectedChapter.name} • Subject: {activeSubject?.name}
                    </p>
                  )}
                  {!selectedSubtopic && selectedChapter && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Full Chapter Practice • Subject: {activeSubject?.name}
                    </p>
                  )}
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
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span>Total Questions: 180 MCQs</span>
                    <span>Duration: 180 Minutes</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-amber-500/20">
                    <p>• Biology: 81 MCQs (45%)</p>
                    <p>• Chemistry: 45 MCQs (25%)</p>
                    <p>• Physics: 36 MCQs (20%)</p>
                    <p>• English: 9 MCQs (5%)</p>
                    <p>• Logical Reasoning: 9 MCQs (5%)</p>
                  </div>
                  <p className="text-[11px] text-amber-400/90 italic pt-1">
                    Single-best-answer format (OMR). No negative marking per PMDC regulations.
                  </p>
                </div>
              ) : (
                /* Chapter/Subtopic Test Customizer */
                <div className="space-y-4 text-xs">
                  {/* Number of MCQs */}
                  <div>
                    <label className="block text-slate-300 font-extrabold mb-2">
                      Number of MCQs
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[5, 10, 15, 20, 30].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setSelectedCount(cnt)}
                          className={`py-2 rounded-xl font-extrabold transition-all border ${
                            selectedCount === cnt
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md'
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
                      {[5, 10, 15, 20, 30].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setSelectedDuration(dur)}
                          className={`py-2 rounded-xl font-extrabold transition-all border ${
                            selectedDuration === dur
                              ? 'bg-amber-500 text-black border-amber-400 shadow-md'
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
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
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
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
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
                  <span>Mandatory Sign-In required before starting MDCAT test attempts.</span>
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
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer border border-amber-300/30"
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
