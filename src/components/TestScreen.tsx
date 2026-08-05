import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../lib/haptics';
import { Question, UserAnswer, TestConfig } from '../types';
import { User } from '../lib/supabase';
import { SecurityWatermark } from './SecurityWatermark';
import { downloadQuizPdf } from '../lib/pdfGenerator';
import {
  Bookmark,
  ChevronLeft,
  Grid,
  Pause,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  X,
  Download,
  ArrowRight,
  Sparkles
} from 'lucide-react';

import { saveBookmark, removeBookmark } from '../lib/bookmarks';
import { MCQContext } from './StudyBuddyModal';

interface TestScreenProps {
  questions: Question[];
  config: TestConfig;
  currentUser?: User | null;
  onFinishTest: (answers: UserAnswer[], timeTakenSeconds: number) => void;
  onExitTest?: () => void;
  onExplainMcq?: (mcqCtx: MCQContext) => void;
}

export const TestScreen: React.FC<TestScreenProps> = React.memo(({
  questions,
  config,
  currentUser,
  onFinishTest,
  onExitTest,
  onExplainMcq,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, UserAnswer>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(config.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showNavGrid, setShowNavGrid] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Atomic state reset whenever a new test or question set is loaded
  useEffect(() => {
    setCurrentIndex(0);
    setUserAnswers({});
    setTimeLeftSeconds(config.durationMinutes * 60);
    setIsPaused(false);
    questionStartTimeRef.current = Date.now();
  }, [config.subject, config.classNum, config.durationMinutes]);

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const studentName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name;
      const gradeOrPath = `Class ${config.classNum}${config.group ? ` (${config.group})` : ''}`;
      await downloadQuizPdf({
        subject: config.subject,
        gradeOrPath,
        questions: effectiveQuestions,
        includeAnswers: false,
        studentName,
      });
    } catch (err) {
      console.error('Failed to download PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const questionStartTimeRef = useRef<number>(Date.now());

  const effectiveQuestions = (config.questionCount && config.questionCount > 0 && questions.length > config.questionCount)
    ? questions.slice(0, config.questionCount)
    : questions;

  const currentQ = effectiveQuestions[currentIndex];
  const targetTotalQ = config.questionCount || effectiveQuestions.length;
  const totalQ = Math.min(effectiveQuestions.length, targetTotalQ);
  const currentAnswer = userAnswers[currentIndex];
  const isAnswered = Boolean(currentAnswer && currentAnswer.selectedOption !== null);

  // Timer Countdown
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Format Timer mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    if (isAnswered) return;

    triggerHaptic(HAPTIC_PATTERNS.light);
    const timeSpent = Math.round((Date.now() - questionStartTimeRef.current) / 1000);

    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        questionIndex: currentIndex,
        selectedOption: optIndex,
        timeSpentSeconds: (prev[currentIndex]?.timeSpentSeconds || 0) + timeSpent,
        flagged: prev[currentIndex]?.flagged || false,
      },
    }));

    questionStartTimeRef.current = Date.now();
  };

  const handleToggleFlag = () => {
    const isNowFlagged = !currentAnswer?.flagged;
    if (currentQ) {
      if (isNowFlagged) {
        saveBookmark(currentQ, config.subject, config.classNum, config.group);
      } else {
        removeBookmark(currentQ.id);
      }
    }

    setUserAnswers((prev) => {
      const existing = prev[currentIndex] || {
        questionIndex: currentIndex,
        selectedOption: null,
        timeSpentSeconds: 0,
      };
      return {
        ...prev,
        [currentIndex]: {
          ...existing,
          flagged: isNowFlagged,
        },
      };
    });
  };

  const handleSkip = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQ - 1) {
      setCurrentIndex((prev) => prev + 1);
      questionStartTimeRef.current = Date.now();
    } else {
      handleFinishTest();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      questionStartTimeRef.current = Date.now();
    }
  };

  const handleFinishTest = () => {
    const totalTimeTaken = Math.max(1, config.durationMinutes * 60 - timeLeftSeconds);
    const answerList: UserAnswer[] = effectiveQuestions.map((_, idx) => {
      return (
        userAnswers[idx] || {
          questionIndex: idx,
          selectedOption: null,
          timeSpentSeconds: 0,
          flagged: false,
        }
      );
    });
    onFinishTest(answerList, totalTimeTaken);
  };

  const progressPct = Math.round(((currentIndex + 1) / totalQ) * 100);

  const containsUrdu = (text: string) =>
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text || '');

  const isUrduOrIslamiat =
    ['urdu', 'islam', 'din'].some((term) => (config.subject || '').toLowerCase().includes(term)) ||
    effectiveQuestions.some((q) => containsUrdu(q.q) || q.options.some((o) => containsUrdu(o)));

  const urduOptionBadges = ['الف', 'ب', 'ج', 'د'];

  return (
    <section className="animate-ios-spring flex-1 flex flex-col h-full py-2 relative overflow-hidden" dir={isUrduOrIslamiat ? 'rtl' : 'ltr'}>
      <SecurityWatermark currentUser={currentUser} />

      <div className="relative z-10 flex flex-col h-full gap-3 overflow-hidden">
        {/* Fixed Header Section */}
        <div className="shrink-0 space-y-3">
          {/* FBISE Exam Header Banner for Urdu & Islamiat */}
          {isUrduOrIslamiat && (
            <div className="bg-[#0A0A0A] text-white border border-[#F2B90C]/40 rounded-2xl p-3 text-center shadow-sm">
              <div className="text-xs font-bold text-[#F2B90C] tracking-wide font-['Noto_Nastaliq_Urdu','Noto_Sans_Arabic',serif]">
                فیڈرل بورڈ برائے مابعد ثانوی و ثانوی تعلیم - امتحانی پرچہ معروضی (FBISE)
              </div>
              <div className="text-xs font-medium text-slate-300 mt-0.5 font-['Noto_Nastaliq_Urdu','Noto_Sans_Arabic',serif]">
                مضمون: {config.subject} &middot; جماعت {config.classNum} ({config.group || 'عام'})
              </div>
            </div>
          )}

          {/* Test Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {onExitTest && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to exit this test? Your current progress will be lost.')) {
                      onExitTest();
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all cursor-pointer mr-1"
                  title="Exit Test"
                >
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Exit</span>
                </button>
              )}
              <span className="text-xs font-bold font-['Space_Grotesk'] text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C]/20 border border-[#F2B90C]/40 px-3.5 py-1 rounded-full">
                {isUrduOrIslamiat ? `سوال ${currentIndex + 1} از ${totalQ}` : `Q${currentIndex + 1} of ${totalQ}`}
              </span>
              <button
                onClick={() => setShowNavGrid(true)}
                className="p-1.5 rounded-full text-[#0A0A0A] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-[#F2B90C] hover:text-[#0A0A0A] active:scale-95 transition-all cursor-pointer"
                title={isUrduOrIslamiat ? 'سوالات کا نیویگیٹر' : 'Question Navigator'}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 rounded-full text-[#0A0A0A] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-[#F2B90C] hover:text-[#0A0A0A] active:scale-95 transition-all cursor-pointer"
                title={isPaused ? (isUrduOrIslamiat ? 'وقت دوبارہ شروع کریں' : 'Resume Test') : (isUrduOrIslamiat ? 'وقت روکیں' : 'Pause Timer')}
              >
                {isPaused ? <Play className="w-4 h-4 text-[#F2B90C]" /> : <Pause className="w-4 h-4" />}
              </button>

              <span
                className={`font-mono text-sm font-extrabold px-3.5 py-1 rounded-full border ${
                  timeLeftSeconds < 120
                    ? 'text-rose-600 bg-rose-100 border-rose-300 dark:text-rose-400 dark:bg-rose-500/20 animate-pulse'
                    : 'text-[#0A0A0A] dark:text-white bg-[#F2B90C]/20 border border-[#F2B90C]/50'
                }`}
              >
                {formatTime(timeLeftSeconds)}
              </span>
            </div>
          </div>

          {/* Progress Bar (Gold Bar) */}
          <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden border border-black/5 dark:border-white/5">
            <div
              className="h-full bg-[#F2B90C] transition-all duration-300 shadow-[0_0_10px_rgba(242,185,12,0.5)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Topic & Controls */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#0A0A0A] dark:text-[#F2B90C] uppercase tracking-wider font-['Space_Grotesk']">
              {currentQ?.topic || config.subject}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-[#151515] text-[#0A0A0A] dark:text-white hover:border-[#F2B90C] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#F2B90C]" />
                <span>{isDownloadingPdf ? 'Generating...' : 'PDF WorkSheet'}</span>
              </button>

              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer active:scale-95 ${
                  currentAnswer?.flagged
                    ? 'border-[#F2B90C] bg-[#F2B90C] text-[#0A0A0A]'
                    : 'border-black/10 dark:border-white/10 bg-white dark:bg-[#151515] text-[#0A0A0A] dark:text-white hover:border-[#F2B90C]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${currentAnswer?.flagged ? 'fill-[#0A0A0A]' : ''}`} />
                <span>{currentAnswer?.flagged ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Main Content (Question + Options + Explanation Card with attached Doubt Solver) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
          {!currentQ ? (
            <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center space-y-4 my-auto shadow-sm animate-fadeIn">
              <div className="relative w-12 h-12 mx-auto">
                <div className="w-12 h-12 rounded-full border-4 border-t-[#F2B90C] border-black/10 dark:border-white/10 animate-spin flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#F2B90C] animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-[#0A0A0A] dark:text-white">
                  {isUrduOrIslamiat ? `سوال ${currentIndex + 1} لوڈ ہو رہا ہے...` : `Preparing Question ${currentIndex + 1} of ${totalQ}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {isUrduOrIslamiat
                    ? 'امتحانی نصاب کے مطابق سوالات بیک گراؤنڈ میں تیار ہو رہے ہیں۔ چند لمحوں میں سوال ظاہر ہو جائے گا۔'
                    : 'Syllabus-aligned questions are quietly generating in the background. This question will appear in a moment.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
                <p
                  dir={isUrduOrIslamiat ? 'rtl' : 'ltr'}
                  className={`font-['Space_Grotesk'] text-base sm:text-lg font-bold text-[#0A0A0A] dark:text-white leading-relaxed ${
                    isUrduOrIslamiat ? 'text-right font-["Noto_Nastaliq_Urdu","Noto_Sans_Arabic",serif]' : ''
                  }`}
                >
                  {currentQ.q}
                </p>

                {/* MCQ Options Tiles */}
                <div className="space-y-3">
                  {currentQ.options.map((optText, optIdx) => {
                    const isSelected = currentAnswer?.selectedOption === optIdx;
                    const isCorrect = currentQ.correct === optIdx;
                    const showInstant = isAnswered;

                    let tileStyle = 'bg-white dark:bg-[#1D1D1D] border-black/10 dark:border-white/10 hover:border-[#F2B90C] hover:shadow-md';
                    let badgeStyle = 'bg-black/5 dark:bg-white/10 text-[#0A0A0A] dark:text-white';

                    if (showInstant) {
                      if (isCorrect) {
                        tileStyle = 'bg-emerald-500/10 border-2 border-emerald-500 text-[#0A0A0A] dark:text-white font-bold';
                        badgeStyle = 'bg-emerald-500 text-white font-bold';
                      } else if (isSelected && !isCorrect) {
                        tileStyle = 'bg-rose-500/10 border-2 border-rose-500 text-[#0A0A0A] dark:text-white font-bold';
                        badgeStyle = 'bg-rose-500 text-white font-bold';
                      } else {
                        tileStyle = 'bg-white dark:bg-[#151515] border-black/5 dark:border-white/5 opacity-50';
                        badgeStyle = 'bg-black/5 dark:bg-white/10 text-slate-400';
                      }
                    } else if (isSelected) {
                      tileStyle = 'bg-[#F2B90C]/10 border-2 border-[#F2B90C] text-[#0A0A0A] dark:text-white font-bold shadow-md';
                      badgeStyle = 'bg-[#F2B90C] text-[#0A0A0A] font-extrabold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        disabled={isAnswered}
                        dir={isUrduOrIslamiat ? 'rtl' : 'ltr'}
                        className={`w-full text-left p-4 rounded-xl sm:rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isAnswered ? 'cursor-default' : ''
                        } ${tileStyle}`}
                      >
                        <div className="flex items-center gap-3.5 pr-2">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 font-['Space_Grotesk'] ${badgeStyle}`}>
                            {isUrduOrIslamiat ? urduOptionBadges[optIdx] : String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className={`text-sm sm:text-base font-medium ${isUrduOrIslamiat ? 'font-["Noto_Nastaliq_Urdu","Noto_Sans_Arabic",serif]' : ''}`}>
                            {optText}
                          </span>
                        </div>

                        <div className="shrink-0 flex items-center justify-center ml-2">
                          {showInstant && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          )}
                          {showInstant && isSelected && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-500" />
                          )}
                          {!showInstant && isSelected && (
                            <div className="w-5 h-5 rounded-full bg-[#F2B90C] text-[#0A0A0A] flex items-center justify-center font-bold">
                              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Official Answer Explanation Card when answered */}
              {isAnswered && (
                <div
                  dir={isUrduOrIslamiat ? 'rtl' : 'ltr'}
                  className="bg-[#0A0A0A] text-white border border-[#F2B90C]/40 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3 shadow-md animate-ios-spring"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#F2B90C] uppercase tracking-wider text-xs sm:text-sm">
                      <HelpCircle className="w-4 h-4 text-[#F2B90C]" />
                      <span>Official Answer Explanation</span>
                    </div>
                  </div>

                  <p className={`text-slate-200 ${isUrduOrIslamiat ? 'font-["Noto_Nastaliq_Urdu","Noto_Sans_Arabic",serif]' : ''}`}>
                    {currentQ.explain}
                  </p>

                  {/* Contextual Doubt Solver Attached Directly to Explanation Card */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                      <Sparkles className="w-4 h-4 text-[#F2B90C] shrink-0 animate-pulse" />
                      <span>Still confused after reading the explanation?</span>
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic(HAPTIC_PATTERNS.medium);
                        if (onExplainMcq) {
                          onExplainMcq({
                            question: currentQ.q,
                            options: currentQ.options,
                            correctOption: currentQ.correct,
                            selectedOption: currentAnswer?.selectedOption ?? null,
                            subject: config.subject || 'Practice Test',
                            topic: currentQ.topic || 'General Topic',
                            explanation: currentQ.explain,
                          });
                        }
                      }}
                      className="px-4 py-2.5 bg-[#F2B90C] hover:bg-[#E0AB00] active:scale-98 text-[#0A0A0A] font-extrabold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md shrink-0"
                      title="Solve My Doubt with Study Buddy AI"
                    >
                      <img
                        src="/study-buddy-logo.svg"
                        alt="Study Buddy AI"
                        className="w-4 h-4 rounded-full object-contain filter drop-shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <span>Ask Doubt</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pinned Bottom Navigation Buttons */}
        <div className="shrink-0 flex items-center gap-3 pt-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3.5 bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white rounded-full hover:border-[#F2B90C] disabled:opacity-30 cursor-pointer transition-all shadow-sm"
            title="Previous Question"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleSkip}
            className="flex-1 bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white font-bold py-3.5 px-4 rounded-full hover:border-[#F2B90C] cursor-pointer transition-all text-xs sm:text-sm shadow-sm"
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className="flex-1 bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white font-extrabold py-3.5 px-6 rounded-full transition-all active:scale-98 cursor-pointer shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <span>{currentIndex === totalQ - 1 ? 'Submit Test' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Modal Navigator */}
      {showNavGrid && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#0A0A0A] dark:text-white">
                Question Navigator
              </h3>
              <button
                onClick={() => setShowNavGrid(false)}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#0A0A0A] dark:text-white hover:bg-[#F2B90C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {Array.from({ length: totalQ }, (_, idx) => {
                const isAvailable = idx < effectiveQuestions.length;
                const ans = userAnswers[idx];
                const isCurrent = idx === currentIndex;
                const isDone = ans && ans.selectedOption !== null;
                const isFlagged = ans?.flagged;

                let badgeColor = 'bg-black/5 text-slate-600 dark:bg-white/10 dark:text-slate-300';
                if (!isAvailable) {
                  badgeColor = 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-600 border-dashed border-slate-300 dark:border-white/10 opacity-70';
                } else if (isCurrent) {
                  badgeColor = 'bg-[#F2B90C] text-[#0A0A0A] font-extrabold shadow-sm';
                } else if (isFlagged) {
                  badgeColor = 'bg-[#0A0A0A] text-[#F2B90C] border border-[#F2B90C]/50';
                } else if (isDone) {
                  badgeColor = 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setShowNavGrid(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-bold border flex items-center justify-center relative cursor-pointer transition-all ${badgeColor}`}
                  >
                    <span>{idx + 1}</span>
                    {!isAvailable && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#F2B90C] animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowNavGrid(false)}
              className="w-full bg-[#0A0A0A] text-white font-bold text-xs py-3 rounded-full cursor-pointer hover:bg-[#1A1A1A]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
});
