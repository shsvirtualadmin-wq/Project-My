import React from 'react';
import { BoardClass, PathType } from '../types';
import { CLASS_GROUPS } from '../data/categories';
import { ChevronRight, ArrowLeft, Layers, BookMarked } from 'lucide-react';

interface ClassGroupScreenProps {
  path?: PathType;
  selectedClass?: BoardClass;
  selectedGroup?: string;
  onSelectClass?: (c: BoardClass) => void;
  onSelectGroup: (g: string) => void;
  onBack: () => void;
}

export const ClassGroupScreen: React.FC<ClassGroupScreenProps> = ({
  selectedClass,
  onSelectClass,
  onSelectGroup,
  onBack,
}) => {
  if (!selectedClass) {
    return (
      <section className="animate-ios-spring flex-1 flex flex-col gap-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C]/20 border border-[#F2B90C]/40 px-3 py-1 rounded-full">
            Step 1 of 4 &middot; Class Level
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="font-['Space_Grotesk'] text-2xl font-extrabold text-[#0A0A0A] dark:text-white">
            Select Class Level
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            Choose your grade level for Federal Board (FBISE).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 my-2">
          {([9, 10, 11, 12, 'MDCAT', 'TCAT'] as BoardClass[]).map((cNum) => (
            <div
              key={cNum}
              onClick={() => onSelectClass && onSelectClass(cNum)}
              className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 hover:border-[#F2B90C] dark:hover:border-[#F2B90C] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl font-['Space_Grotesk'] font-bold flex items-center justify-center shrink-0 border shadow-sm ${
                  cNum === 'TCAT'
                    ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40 text-xs'
                    : cNum === 'MDCAT'
                    ? 'bg-rose-950/40 text-rose-300 border-rose-500/40 text-xs'
                    : 'bg-[#0A0A0A] dark:bg-[#222222] text-[#F2B90C] border-[#F2B90C]/30 text-base'
                }`}>
                  {cNum === 'TCAT' ? 'TCAT' : cNum === 'MDCAT' ? 'MDCAT' : cNum}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#0A0A0A] dark:text-white group-hover:text-[#F2B90C] transition-colors">
                      {cNum === 'TCAT' ? 'TCAT Dashboard' : cNum === 'MDCAT' ? 'MDCAT Dashboard' : `Class ${cNum}`}
                    </h3>
                    <span className="bg-black/5 dark:bg-white/10 text-[10px] font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {cNum === 'TCAT'
                        ? 'ENGINEERING ENTRY TEST'
                        : cNum === 'MDCAT'
                        ? 'MEDICAL ENTRY TEST'
                        : cNum >= 11
                        ? `HSSC Part ${cNum === 11 ? 1 : 2}`
                        : `Matric Part ${cNum === 9 ? 1 : 2}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {cNum === 'TCAT'
                      ? 'Mathematics, Physics & Chemistry Preparation'
                      : cNum === 'MDCAT'
                      ? 'Biology, Chemistry, Physics & English Preparation'
                      : 'Science & Computer Science Groups'}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#0A0A0A] dark:text-white group-hover:bg-[#F2B90C] group-hover:text-[#0A0A0A] flex items-center justify-center shrink-0 transition-all">
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </section>
    );
  }

  const groups = CLASS_GROUPS[selectedClass] || [];

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C]/20 border border-[#F2B90C]/40 px-3 py-1 rounded-full">
          Step 2 of 4 &middot; Subject Group
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="font-['Space_Grotesk'] text-2xl font-extrabold text-[#0A0A0A] dark:text-white">
          Class {selectedClass} Subject Stream
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          Select your study group to load the corresponding subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 my-2">
        {groups.map((grp) => {
          return (
            <div
              key={grp}
              onClick={() => onSelectGroup(grp)}
              className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 hover:border-[#F2B90C] dark:hover:border-[#F2B90C] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] dark:bg-[#222222] text-[#F2B90C] font-['Space_Grotesk'] font-bold text-sm flex items-center justify-center shrink-0 border border-[#F2B90C]/30 shadow-sm uppercase">
                  {grp.substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-black/5 dark:bg-white/10 text-[10px] font-bold text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Class {selectedClass}
                    </span>
                  </div>
                  <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#0A0A0A] dark:text-white group-hover:text-[#F2B90C] transition-colors">
                    {grp}
                  </h3>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#0A0A0A] dark:text-white group-hover:bg-[#F2B90C] group-hover:text-[#0A0A0A] flex items-center justify-center shrink-0 transition-all">
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
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Class Selection</span>
        </button>
      </div>
    </section>
  );
};
