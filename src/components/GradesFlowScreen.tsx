import React, { useEffect } from 'react';
import { BoardClass } from '../types';
import { StudentProfile } from '../lib/supabase';
import { ChevronRight, ArrowLeft, GraduationCap, Lock } from 'lucide-react';

interface GradesFlowScreenProps {
  onSelectGrade?: (grade: BoardClass) => void;
  onSelectClass?: (grade: BoardClass) => void;
  onBack?: () => void;
  userProfile?: StudentProfile | null;
  isRegisteredStudent?: boolean;
  isAdmin?: boolean;
  onAutoRedirectLocked?: (c: BoardClass, s: string) => void;
}

export const GradesFlowScreen: React.FC<GradesFlowScreenProps> = ({
  onSelectGrade,
  onSelectClass,
  onBack,
  userProfile,
  isRegisteredStudent,
  isAdmin,
}) => {
  const handleSelect = (grade: BoardClass) => {
    if (onSelectGrade) onSelectGrade(grade);
    if (onSelectClass) onSelectClass(grade);
  };

  const fbiseGrades = [
    {
      grade: 9 as BoardClass,
      tag: 'SSC Part 1',
      title: 'Class 9',
      subtitle: 'Science & Computer Science Groups',
    },
    {
      grade: 10 as BoardClass,
      tag: 'SSC Part 2',
      title: 'Class 10',
      subtitle: 'Science & Computer Science Groups',
    },
    {
      grade: 11 as BoardClass,
      tag: 'HSSC Part 1',
      title: 'Class 11',
      subtitle: 'Pre-Medical, Pre-Engineering, ICS & General',
    },
    {
      grade: 12 as BoardClass,
      tag: 'HSSC Part 2',
      title: 'Class 12',
      subtitle: 'Pre-Medical, Pre-Engineering, ICS & General',
    },
    {
      grade: 'MDCAT' as BoardClass,
      tag: 'MEDICAL ENTRY TEST',
      title: 'MDCAT Dashboard',
      subtitle: 'Biology, Chemistry, Physics & English Preparation',
      isMdcat: true,
    },
    {
      grade: 'TCAT' as BoardClass,
      tag: 'ENGINEERING ENTRY TEST',
      title: 'TCAT Dashboard',
      subtitle: 'Mathematics, Physics & Chemistry Preparation',
      isTcat: true,
    },
  ];

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-4 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C]/20 border border-[#F2B90C]/40 px-3 py-1 rounded-full">
          Step 1 of 4 &middot; Class Level
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="font-['Space_Grotesk'] text-2xl font-extrabold text-[#0A0A0A] dark:text-white">
          Select Your Class
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
          Choose your FBISE level to view subject groups and chapter tests.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 my-2">
        {fbiseGrades.map((item) => (
          <div
            key={item.grade}
            onClick={() => handleSelect(item.grade)}
            className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 hover:border-[#F2B90C] dark:hover:border-[#F2B90C] rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-[#0A0A0A] dark:bg-[#222222] text-[#F2B90C] font-['Space_Grotesk'] font-bold flex items-center justify-center shrink-0 border border-[#F2B90C]/30 shadow-sm ${
                typeof item.grade === 'string' ? 'text-xs sm:text-sm tracking-tight' : 'text-lg'
              }`}>
                {item.grade}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-['Space_Grotesk'] font-bold text-base text-[#0A0A0A] dark:text-white group-hover:text-[#F2B90C] transition-colors">
                    {item.title}
                  </h3>
                  <span className="bg-black/5 dark:bg-white/10 text-[10px] font-bold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {item.subtitle}
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 text-[#0A0A0A] dark:text-white group-hover:bg-[#F2B90C] group-hover:text-[#0A0A0A] flex items-center justify-center shrink-0 transition-all">
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        ))}
      </div>

      {onBack && (
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
      )}
    </section>
  );
};
