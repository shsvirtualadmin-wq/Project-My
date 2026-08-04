import React, { useState } from 'react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../lib/haptics';
import { TestResult } from '../types';
import { User } from '../lib/supabase';
import { SecurityWatermark } from './SecurityWatermark';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { downloadQuizPdf } from '../lib/pdfGenerator';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Printer,
  ChevronDown,
  ChevronUp,
  Award,
  Share2,
  Check,
  Download,
  ArrowRight,
  GraduationCap,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

import { MCQContext } from './StudyBuddyModal';

interface ResultsScreenProps {
  result: TestResult;
  currentUser?: User | null;
  onTakeAnother: () => void;
  onOpenPrintModal: () => void;
  onBackToHome?: () => void;
  onExplainMcq?: (context: MCQContext) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  currentUser,
  onTakeAnother,
  onOpenPrintModal,
  onBackToHome,
  onExplainMcq,
}) => {
  const { logoUrl } = useSiteSettings();
  const [showReview, setShowReview] = useState(false);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'flagged'>('all');
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const { score, total, percentage, timeTakenSeconds, topicBreakdown, questions, userAnswers, timestamp, config } = result;

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      const studentName = currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name;
      const gradeOrPath = `Class ${config?.classNum}${config?.group ? ` (${config.group})` : ''}`;
      await downloadQuizPdf({
        subject: config?.subject || 'Practice Test',
        gradeOrPath,
        questions,
        includeAnswers: true,
        studentName,
      });
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setPdfError(
        isUrduOrIslamiat
          ? 'پی ڈی ایف فائل تیار کرنے میں دشواری پیش آئی۔ براہ کرم پرنٹ کے بٹن سے پرنٹ یا Save as PDF کا انتخاب کریں۔'
          : 'Could not generate PDF directly. You can use the Print button to Save as PDF.'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const minutesTaken = Math.floor(timeTakenSeconds / 60);
  const secondsTaken = timeTakenSeconds % 60;
  const timeFormatted = `${minutesTaken}:${secondsTaken.toString().padStart(2, '0')}`;

  const dateFormatted = new Date(timestamp || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleShare = async () => {
    const subjectTitle = config?.subject || 'MCQ Test';
    const summaryText = `🎓 Boardly Practice Test Result\n📚 Subject: ${subjectTitle}\n🎯 Score: ${score}/${total} (${percentage}%)\n⏱️ Time Taken: ${timeFormatted}\n📅 Date: ${dateFormatted}\n\nPracticed on Boardly Virtual Academy!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Boardly Result — ${subjectTitle}`,
          text: summaryText,
        });
        return;
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = summaryText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const containsUrdu = (text: string) =>
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text || '');

  const isUrduOrIslamiat =
    ['urdu', 'islam', 'din'].some((term) => (config?.subject || '').toLowerCase().includes(term)) ||
    questions.some((q) => containsUrdu(q.q) || q.options.some((o) => containsUrdu(o)));

  let gradeBadge = { text: isUrduOrIslamiat ? 'شاندار کارکردگی!' : 'Outstanding!', color: 'text-[#0A0A0A] bg-[#F2B90C]' };
  if (percentage < 50) {
    gradeBadge = { text: isUrduOrIslamiat ? 'دوبارہ دہرائی کی ضرورت ہے' : 'Needs Revision', color: 'text-rose-900 bg-rose-100 dark:text-rose-300 dark:bg-rose-500/20' };
  } else if (percentage < 75) {
    gradeBadge = { text: isUrduOrIslamiat ? 'بہتر پیش رفت!' : 'Good Progress', color: 'text-[#0A0A0A] bg-[#F2B90C]/80' };
  }

  const urduChoiceLabels = ['الف', 'ب', 'ج', 'د'];

  const filteredQuestions = questions.map((q, idx) => ({ q, idx, ans: userAnswers[idx] })).filter(({ q, ans }) => {
    if (filter === 'wrong') return ans?.selectedOption !== q.correct;
    if (filter === 'flagged') return ans?.flagged;
    return true;
  });

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-4 py-2 relative overflow-hidden" dir={isUrduOrIslamiat ? 'rtl' : 'ltr'}>
      <SecurityWatermark currentUser={currentUser} />

      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0A0A0A] border-2 border-[#F2B90C] rounded-2xl p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0">
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
            <div>
              <h2 className="font-['Space_Grotesk'] font-black text-base sm:text-lg text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                BOARDLY ACADEMY
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-[#F2B90C] tracking-wide mt-0.5">
                Official Score &amp; Evaluation Report
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C]/20 border border-[#F2B90C]/40 px-3 py-1 rounded-full">
              {isUrduOrIslamiat ? 'امتحانی پرچہ مکمل ہوا' : 'Test Completed'}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {dateFormatted}
            </span>
          </div>
        </div>

        {/* Hero Score Card */}
        <div className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-xl space-y-4 relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#F2B90C]/15 dark:bg-[#F2B90C]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-black/10 dark:stroke-white/10"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="52"
                className="stroke-[#F2B90C] transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={326}
                strokeDashoffset={326 - (326 * percentage) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-['Space_Grotesk'] text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{percentage}%</span>
              <span className="text-[10px] uppercase tracking-widest text-[#D99A00] dark:text-[#F2B90C] font-bold">
                {isUrduOrIslamiat ? 'ایکوریسی' : 'Accuracy'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${gradeBadge.color}`}>
              <Award className="w-4 h-4" />
              <span>{gradeBadge.text}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
              {score} of {total} Correct Answers &middot; Time Taken: {timeFormatted}
            </p>
          </div>
        </div>

        {/* Topic Breakdown Card */}
        <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-['Space_Grotesk'] text-xs font-bold text-slate-500 uppercase tracking-wider">
            {isUrduOrIslamiat ? 'موضوعات کا جائزہ' : 'Topic Mastery Breakdown'}
          </h3>
          <div className="space-y-3">
            {(Object.entries(topicBreakdown) as [string, { total: number; correct: number }][]).map(([topic, stats]) => {
              const topicPct = Math.round((stats.correct / Math.max(1, stats.total)) * 100);
              return (
                <div key={topic} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0A0A0A] dark:text-white truncate max-w-[200px]">{topic}</span>
                    <span className="text-slate-500 font-bold">{stats.correct}/{stats.total} ({topicPct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F2B90C] rounded-full transition-all duration-700"
                      style={{ width: `${topicPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Action Row */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onTakeAnother}
            className="flex-1 bg-slate-900 hover:bg-slate-800 dark:bg-[#0A0A0A] dark:hover:bg-[#1A1A1A] text-white border border-slate-900 dark:border-white/10 font-extrabold py-3.5 px-6 rounded-full transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#F2B90C]" />
            <span>Take Another Practice Test</span>
          </button>

          <button
            onClick={() => setShowReview(!showReview)}
            className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white font-bold py-3.5 px-5 rounded-full hover:border-[#F2B90C] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-sm"
          >
            <span>{showReview ? 'Hide Answer Review' : 'Review Answer Key'}</span>
            {showReview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Error Banner */}
        {pdfError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs p-3 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
            <span>{pdfError}</span>
            <button
              onClick={() => setPdfError(null)}
              className="text-xs font-extrabold text-rose-900 dark:text-rose-100 hover:underline shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Secondary Tools */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="p-3 bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-full text-[#0A0A0A] dark:text-white hover:border-[#F2B90C] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold disabled:opacity-60"
            title="Download PDF Study Sheet"
          >
            {isDownloadingPdf ? (
              <div className="w-4 h-4 border-2 border-[#F2B90C] border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <Download className="w-4 h-4 text-[#F2B90C] shrink-0" />
            )}
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'PDF Study Sheet'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-3 bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-full text-[#0A0A0A] dark:text-white hover:border-[#F2B90C] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Share Test Result"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4 text-[#F2B90C]" />}
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={onOpenPrintModal}
            className="p-3 bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-full text-[#0A0A0A] dark:text-white hover:border-[#F2B90C] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Print Worksheet"
          >
            <Printer className="w-4 h-4 text-[#F2B90C]" />
            <span>Print</span>
          </button>
        </div>

        {/* Answer Key Review Section */}
        {showReview && (
          <div className="space-y-4 pt-2 animate-ios-spring">
            <div className="flex justify-between items-center">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-[#0A0A0A] dark:text-white">
                Detailed Answer Review
              </h3>

              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-1 rounded-full text-xs">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    filter === 'all'
                      ? 'bg-[#0A0A0A] text-white dark:bg-[#F2B90C] dark:text-[#0A0A0A]'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All ({total})
                </button>
                <button
                  onClick={() => setFilter('wrong')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    filter === 'wrong'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Incorrect ({total - score})
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredQuestions.map(({ q, idx, ans }) => {
                const selectedIdx = ans?.selectedOption ?? null;
                const isCorrect = selectedIdx === q.correct;
                const isSkipped = selectedIdx === null;

                return (
                  <div
                    key={q.id || idx}
                    dir={isUrduOrIslamiat ? 'rtl' : 'ltr'}
                    className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#0A0A0A] dark:text-white leading-relaxed">
                        <span className="text-[#F2B90C] font-extrabold mr-1.5">Q{idx + 1}.</span> {q.q}
                      </p>
                      {isCorrect ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                          Correct
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 dark:text-rose-300 dark:bg-rose-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                          {isSkipped ? 'Skipped' : 'Incorrect'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isUserChoice = selectedIdx === oIdx;
                        const isCorrectChoice = q.correct === oIdx;

                        let style = 'bg-black/5 dark:bg-white/5 border-transparent text-slate-700 dark:text-slate-300';
                        let badge = 'bg-black/10 text-slate-800 dark:bg-white/10 dark:text-white';

                        if (isCorrectChoice) {
                          style = 'bg-emerald-500/10 border-emerald-500 border text-[#0A0A0A] dark:text-white font-bold';
                          badge = 'bg-emerald-500 text-white font-bold';
                        } else if (isUserChoice && !isCorrectChoice) {
                          style = 'bg-rose-500/10 border-rose-500 border text-[#0A0A0A] dark:text-white line-through';
                          badge = 'bg-rose-500 text-white font-bold';
                        }

                        return (
                          <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${style}`}>
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${badge}`}>
                                {isUrduOrIslamiat ? urduChoiceLabels[oIdx] : String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </div>
                            {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                            {isUserChoice && !isCorrectChoice && <XCircle className="w-4 h-4 text-rose-500 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-[#0A0A0A] text-white border border-[#F2B90C]/30 rounded-xl p-3.5 text-xs leading-relaxed space-y-2.5 shadow-sm mt-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#F2B90C] uppercase tracking-wider text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Official Explanation</span>
                      </div>
                      <p className="text-slate-200">{q.explain}</p>

                      <div className="pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-[#F2B90C] shrink-0 animate-pulse" />
                          <span>Still confused after reading the explanation?</span>
                        </div>

                        <button
                          onClick={() => {
                            triggerHaptic(HAPTIC_PATTERNS.medium);
                            if (onExplainMcq) {
                              onExplainMcq({
                                question: q.q,
                                options: q.options,
                                correctOption: q.correct,
                                selectedOption: ans?.selectedOption ?? null,
                                subject: config?.subject || 'Practice Test',
                                topic: q.topic || 'General Topic',
                                explanation: q.explain,
                              });
                            }
                          }}
                          className="px-3.5 py-2 bg-[#F2B90C] hover:bg-[#E0AB00] active:scale-98 text-[#0A0A0A] rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md shrink-0"
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
