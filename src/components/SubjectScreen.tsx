import React, { useState } from 'react';
import { BoardClass, PathType } from '../types';
import { getSubjectsForClassAndGroup, SUBJECT_TOPICS } from '../data/categories';
import { Sparkles, Shuffle, ChevronRight, BookOpen, ArrowLeft } from 'lucide-react';

interface SubjectScreenProps {
  path?: PathType;
  selectedClass?: BoardClass;
  group?: string;
  selectedSubject?: string;
  customTopic?: string;
  onSelectSubject: (subject: string, customTopic?: string) => void;
  onBack: () => void;
}

export const SubjectScreen: React.FC<SubjectScreenProps> = React.memo(({
  selectedClass,
  group,
  selectedSubject,
  onSelectSubject,
  onBack,
}) => {
  const [topicInput, setTopicInput] = useState('');

  const currentClass = selectedClass || 9;
  const currentGroup = group || 'Medical';

  const subjects: string[] = getSubjectsForClassAndGroup(currentClass, currentGroup);

  const handleCustomTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicInput.trim()) return;
    const baseSub = selectedSubject || subjects[0] || 'General';
    onSelectSubject(baseSub, topicInput.trim());
  };

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-[#F2B90C] bg-[#F2B90C]/15 dark:bg-[#F2B90C]/20 border border-[#F2B90C]/30 px-3 py-1 rounded-full">
          Step 3 of 4 &middot; Subject
        </span>
        <span className="text-xs font-bold text-slate-500">
          Class {currentClass} &middot; {currentGroup}
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="font-['Space_Grotesk'] text-2xl font-extrabold text-slate-900 dark:text-white">
          Choose Your Subject
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          Select a subject or enter a custom chapter topic to practice.
        </p>
      </div>

      {/* Custom Topic Generator */}
      <div className="bg-white dark:bg-[#141414] text-slate-900 dark:text-white border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-3 transition-colors duration-200">
        <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-[#F2B90C] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-700 dark:text-[#F2B90C]" />
          <span>Custom Topic Generator</span>
        </div>
        <form onSubmit={handleCustomTopicSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g. Electrostatics, Trigonometry, Organic Reactions..."
            className="flex-1 bg-slate-50 dark:bg-white/10 border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#F2B90C] transition-colors font-medium"
          />
          <button
            type="submit"
            disabled={!topicInput.trim()}
            className="bg-[#F2B90C] hover:bg-[#E0A800] text-[#0A0A0A] font-extrabold text-xs px-5 py-2.5 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
          >
            <span>Generate</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* Subject List */}
      <div className="space-y-3 my-1">
        {/* All Mix Option */}
        <div
          onClick={() => onSelectSubject("All Mix")}
          className="bg-white dark:bg-[#141414] border border-[#F2B90C]/30 dark:border-[#F2B90C]/40 hover:border-[#F2B90C] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#F2B90C] flex items-center justify-center shrink-0 border border-[#F2B90C]/30 shadow-sm">
              <Shuffle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-['Space_Grotesk'] font-bold text-base text-slate-900 dark:text-white group-hover:text-[#F2B90C] transition-colors">
                  All Mix ({currentGroup})
                </h3>
                <span className="bg-[#F2B90C]/15 dark:bg-[#F2B90C]/20 text-amber-900 dark:text-[#F2B90C] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Full Mix
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Shuffled test across all Class {currentClass} {currentGroup} subjects
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#F2B90C] text-[#0A0A0A] flex items-center justify-center shrink-0">
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        {subjects.map((sub) => {
          return (
            <div
              key={sub}
              onClick={() => onSelectSubject(sub)}
              className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 hover:border-[#F2B90C] dark:hover:border-[#F2B90C] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-[#222222] text-[#F2B90C] flex items-center justify-center font-bold text-sm shrink-0 border border-[#F2B90C]/30 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] font-bold text-base text-slate-900 dark:text-white group-hover:text-[#F2B90C] transition-colors">
                    {sub}
                  </h3>
                  {SUBJECT_TOPICS[sub] && (
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {SUBJECT_TOPICS[sub].slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white group-hover:bg-[#F2B90C] group-hover:text-[#0A0A0A] flex items-center justify-center shrink-0 transition-all">
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
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
});
