import React, { useState, useEffect } from 'react';
import { PathType, QuestionDifficulty, TestMode } from '../types';
import { fetchStudentMcqUsage, StudentMcqUsageInfo, User } from '../lib/supabase';
import { Sparkles, Zap, Check, ShieldCheck, Gauge, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../lib/haptics';

interface DurationScreenProps {
  stepLabel?: string;
  path?: PathType;
  subject: string;
  customTopic?: string;
  currentUser?: User | null;
  mcqUsageInfo?: StudentMcqUsageInfo | null;
  onStartTest: (params: {
    durationMinutes: number;
    questionCount: number;
    difficulty: QuestionDifficulty;
    mode: TestMode;
    instantFeedback: boolean;
    subject?: string;
    customTopic?: string;
  }) => void;
  onBack: () => void;
  isGenerating?: boolean;
}

export const DurationScreen: React.FC<DurationScreenProps> = ({
  stepLabel = 'Step 4 of 4',
  subject,
  customTopic,
  currentUser,
  mcqUsageInfo,
  onStartTest,
  onBack,
  isGenerating = false,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(10);
  const [selectedQuestions, setSelectedQuestions] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('Exam Standard');
  const [mode, setMode] = useState<TestMode>('instant');
  const [instantFeedback, setInstantFeedback] = useState<boolean>(true);
  const [usageInfo, setUsageInfo] = useState<StudentMcqUsageInfo | null>(mcqUsageInfo || null);

  useEffect(() => {
    fetchStudentMcqUsage(currentUser?.id || 'guest', currentUser?.email).then((info) => {
      setUsageInfo(info);
    });
  }, [currentUser?.id, currentUser?.email]);

  const handleStart = () => {
    if (isGenerating) return;
    triggerHaptic(HAPTIC_PATTERNS.medium);
    onStartTest({
      subject,
      customTopic,
      durationMinutes: selectedDuration,
      questionCount: selectedQuestions,
      difficulty,
      mode,
      instantFeedback,
    });
  };

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-[#F2B90C] bg-[#F2B90C]/15 dark:bg-[#F2B90C]/20 border border-[#F2B90C]/30 px-3 py-1 rounded-full">
          {stepLabel} &middot; Configuration
        </span>

        {usageInfo?.isAdmin ? (
          <span className="text-[10px] font-bold tracking-wide text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C] px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin (Unlimited)
          </span>
        ) : usageInfo ? (
          <span className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Gauge className="w-3.5 h-3.5 text-[#F2B90C]" />
            {usageInfo.currentUsage} / {usageInfo.limit} MCQs
          </span>
        ) : null}
      </div>

      <div className="space-y-1">
        <h2 className="font-['Space_Grotesk'] text-2xl font-extrabold text-slate-900 dark:text-white">
          Configure Your Practice Test
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          Subject: <strong className="text-slate-900 dark:text-white">{subject}</strong>
          {customTopic && <span className="text-[#F2B90C]"> ({customTopic})</span>}
        </p>
      </div>

      {usageInfo && !usageInfo.isAdmin && usageInfo.currentUsage >= Math.max(1, usageInfo.limit - 20) && (
        <div className="rounded-2xl p-3.5 flex items-start gap-3 border bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#F2B90C]" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold block mb-0.5">
              {usageInfo.currentUsage >= usageInfo.limit ? 'Monthly Generation Limit Reached' : 'Monthly Quota Warning'}
            </span>
            <span>Usage: {usageInfo.currentUsage} / {usageInfo.limit} MCQs. Reset date: {usageInfo.resetDate}</span>
          </div>
        </div>
      )}

      {/* Preset Test Duration Cards */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl divide-y divide-slate-100 dark:divide-white/5 overflow-hidden shadow-sm transition-colors duration-200">
        {[
          { mins: 5, count: 5, label: 'Quick Warmup', tag: '5 Mins' },
          { mins: 10, count: 10, label: 'Quick Practice', tag: '10 Mins' },
          { mins: 15, count: 15, label: 'Standard Practice', tag: '15 Mins' },
          { mins: 20, count: 20, label: 'Chapter Test', tag: '20 Mins' },
        ].map((item) => {
          const isSelected = selectedQuestions === item.count;
          return (
            <div
              key={item.mins}
              onClick={() => {
                setSelectedDuration(item.mins);
                setSelectedQuestions(item.count);
              }}
              className={`p-4 flex items-center justify-between transition-all cursor-pointer ${
                isSelected ? 'bg-[#F2B90C]/[0.08] dark:bg-[#F2B90C]/[0.12]' : 'hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  isSelected
                    ? 'bg-slate-900 text-[#F2B90C] dark:bg-[#F2B90C] dark:text-[#0A0A0A]'
                    : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300'
                }`}>
                  {item.tag}
                </span>
                <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white">
                  {item.label} &middot; {item.count} Questions
                </span>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-[#F2B90C] text-[#0A0A0A] flex items-center justify-center font-bold">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generator Engine */}
      <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2 transition-colors duration-200">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Question Source
        </label>
        <div className="bg-slate-100 dark:bg-[#222222] p-1 rounded-xl flex gap-1">
          <button
            type="button"
            onClick={() => setMode('instant')}
            className={`flex-1 p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'instant'
                ? 'bg-slate-900 text-white dark:bg-[#F2B90C] dark:text-[#0A0A0A] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4 shrink-0" />
            <span>Verified Question Bank</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('ai-custom')}
            className={`flex-1 p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === 'ai-custom'
                ? 'bg-slate-900 text-white dark:bg-[#F2B90C] dark:text-[#0A0A0A] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Custom Generator</span>
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 shadow-sm space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#F2B90C]"
          >
            <option value="Exam Standard" className="bg-white dark:bg-[#141414] text-slate-900 dark:text-white">Exam Standard</option>
            <option value="Easy" className="bg-white dark:bg-[#141414] text-slate-900 dark:text-white">Easy / Revision</option>
            <option value="Medium" className="bg-white dark:bg-[#141414] text-slate-900 dark:text-white">Medium / Practice</option>
            <option value="Hard" className="bg-white dark:bg-[#141414] text-slate-900 dark:text-white">Hard / Advanced</option>
          </select>
        </div>

        <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl p-3.5 shadow-sm space-y-1">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Feedback Mode
          </label>
          <button
            type="button"
            onClick={() => setInstantFeedback(!instantFeedback)}
            className="w-full bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white flex items-center justify-between font-bold cursor-pointer"
          >
            <span>{instantFeedback ? 'Instant Explanation' : 'Exam Timer Only'}</span>
            <span className={`w-2.5 h-2.5 rounded-full ${instantFeedback ? 'bg-emerald-500' : 'bg-[#F2B90C]'}`} />
          </button>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={handleStart}
          disabled={isGenerating}
          className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-[#F2B90C] dark:hover:bg-[#E0A800] text-white dark:text-[#0A0A0A] font-extrabold py-4 px-6 rounded-full transition-all active:scale-98 shadow-md flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-[#F2B90C] dark:border-[#0A0A0A] border-t-transparent rounded-full animate-spin" />
              <span>Generating Test Questions...</span>
            </>
          ) : (
            <>
              <span>Start Practice Test</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
    </section>
  );
};
