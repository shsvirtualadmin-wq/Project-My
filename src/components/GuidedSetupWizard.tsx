import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Stethoscope,
  Cpu,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Calendar,
  Target,
  CheckCircle2,
  Edit3,
  HelpCircle,
  BookOpen,
  ChevronRight,
  Clock,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { BoardClass } from '../types';
import { InstitutionBadge, INSTITUTIONS } from './InstitutionBadge';

export interface SetupWizardData {
  exam: 'FBISE' | 'MDCAT' | 'TCAT';
  focusSubjects: string[];
  classNum?: BoardClass;
  group?: string;
  targetInstitution?: string;
  examDate?: string;
}

interface GuidedSetupWizardProps {
  onComplete: (data: SetupWizardData) => void;
  onBackToHome: () => void;
  initialData?: Partial<SetupWizardData>;
}

const ALL_SUBJECTS_BY_EXAM: Record<'FBISE' | 'MDCAT' | 'TCAT', string[]> = {
  FBISE: [
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Computer Science',
    'English',
    'Urdu',
    'Islamiat',
    'Pakistan Studies',
  ],
  MDCAT: ['Biology', 'Chemistry', 'Physics', 'English'],
  TCAT: ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'English'],
};

const FBISE_LEVEL_OPTIONS: { grade: BoardClass; label: string; group: string; subtitle: string }[] = [
  { grade: 9, label: 'Class 9', group: 'Medical', subtitle: 'SSC Part 1 - Biology & Sciences' },
  { grade: 9, label: 'Class 9', group: 'Computer Science', subtitle: 'SSC Part 1 - Computer Science & IT' },
  { grade: 10, label: 'Class 10', group: 'Medical', subtitle: 'SSC Part 2 - Biology & Sciences' },
  { grade: 10, label: 'Class 10', group: 'Computer Science', subtitle: 'SSC Part 2 - Computer Science & IT' },
  { grade: 11, label: 'Class 11', group: 'Pre-Medical', subtitle: 'HSSC Part 1 - Biology & Chemistry' },
  { grade: 11, label: 'Class 11', group: 'Pre-Engineering', subtitle: 'HSSC Part 1 - Higher Math & Physics' },
  { grade: 11, label: 'Class 11', group: 'ICS', subtitle: 'HSSC Part 1 - Computer Science & Math' },
  { grade: 12, label: 'Class 12', group: 'Pre-Medical', subtitle: 'HSSC Part 2 - Advanced Biology & Organic' },
  { grade: 12, label: 'Class 12', group: 'Pre-Engineering', subtitle: 'HSSC Part 2 - Calculus & Electromagnetism' },
  { grade: 12, label: 'Class 12', group: 'ICS', subtitle: 'HSSC Part 2 - Advanced CS & Math' },
];

const TARGET_INSTITUTIONS_BY_EXAM: Record<'MDCAT' | 'TCAT', string[]> = {
  MDCAT: ['uhs', 'duhs', 'nums', 'kmu', 'szabmu'],
  TCAT: ['nust', 'fast', 'giki', 'ned', 'lums', 'iba'],
};

export const GuidedSetupWizard: React.FC<GuidedSetupWizardProps> = ({
  onComplete,
  onBackToHome,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [exam, setExam] = useState<'FBISE' | 'MDCAT' | 'TCAT'>(initialData?.exam || 'FBISE');
  const [focusSubjects, setFocusSubjects] = useState<string[]>(initialData?.focusSubjects || ['Physics', 'Chemistry']);
  const [selectedFbiseOption, setSelectedFbiseOption] = useState<{ grade: BoardClass; group: string } | null>(
    initialData?.classNum && initialData?.group
      ? { grade: initialData.classNum, group: initialData.group }
      : { grade: 11, group: 'Pre-Medical' }
  );
  const [targetInstitution, setTargetInstitution] = useState<string>(initialData?.targetInstitution || 'nust');
  const [examDate, setExamDate] = useState<string>(
    initialData?.examDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // When Exam changes, auto-reset focus subjects to match the exam
  const handleSelectExam = (selectedExam: 'FBISE' | 'MDCAT' | 'TCAT') => {
    setExam(selectedExam);
    setFocusSubjects(ALL_SUBJECTS_BY_EXAM[selectedExam].slice(0, 2));
    if (selectedExam === 'MDCAT') {
      setTargetInstitution('uhs');
    } else if (selectedExam === 'TCAT') {
      setTargetInstitution('nust');
    }
  };

  const handleToggleSubject = (subject: string) => {
    if (focusSubjects.includes(subject)) {
      setFocusSubjects(focusSubjects.filter((s) => s !== subject));
    } else {
      setFocusSubjects([...focusSubjects, subject]);
    }
  };

  const handleSelectAllSubjects = () => {
    const all = ALL_SUBJECTS_BY_EXAM[exam];
    if (focusSubjects.length === all.length) {
      setFocusSubjects([]);
    } else {
      setFocusSubjects([...all]);
    }
  };

  const handleSetPresetDate = (daysInFuture: number) => {
    const target = new Date(Date.now() + daysInFuture * 24 * 60 * 60 * 1000);
    setExamDate(target.toISOString().split('T')[0]);
  };

  // Days countdown calculation
  const daysRemaining = useMemo(() => {
    if (!examDate) return null;
    const target = new Date(examDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((target - now) / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [examDate]);

  // Can Continue validation
  const canContinueStep1 = Boolean(exam);
  const canContinueStep2 = focusSubjects.length > 0;
  const canContinueStep3 = true; // optional
  const canContinueStep4 = true; // optional

  const handleNextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final submission
      onComplete({
        exam,
        focusSubjects,
        classNum: exam === 'FBISE' ? selectedFbiseOption?.grade : exam,
        group: exam === 'FBISE' ? selectedFbiseOption?.group : exam,
        targetInstitution: exam !== 'FBISE' ? targetInstitution : undefined,
        examDate,
      });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToHome();
    }
  };

  const handleSkipStep = () => {
    if (currentStep === 3 || currentStep === 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step information metadata for left side panel
  const stepMeta = [
    {
      num: 1,
      title: 'Choose Exam Track',
      icon: <GraduationCap className="w-6 h-6 text-[#F2B90C]" />,
      heading: 'Which exam are you preparing for?',
      explanation:
        'Selecting your core exam aligns question difficulty, syllabus weighting, and mock formats precisely to official testing authorities.',
    },
    {
      num: 2,
      title: 'Target Focus Subjects',
      icon: <Target className="w-6 h-6 text-[#F2B90C]" />,
      heading: 'Which subjects need more focus?',
      explanation:
        'Highlighting your weak subjects allows Boardly AI to prioritize high-yield questions, diagnostic quizzes, and review notes in those specific areas.',
    },
    {
      num: 3,
      title: exam === 'FBISE' ? 'Grade & Stream' : 'Target University',
      icon: <BookOpen className="w-6 h-6 text-[#F2B90C]" />,
      heading: exam === 'FBISE' ? 'Select your Class & Stream' : 'Select your Target University',
      explanation:
        exam === 'FBISE'
          ? 'Helps us filter exact FBISE board textbooks and chapter-wise question banks for your grade level.'
          : 'Tailors mock practice papers to match the specific question distribution and entry test pattern of your target institution.',
    },
    {
      num: 4,
      title: 'Exam Timeline',
      icon: <Calendar className="w-6 h-6 text-[#F2B90C]" />,
      heading: 'When is your upcoming exam?',
      explanation:
        'Setting your target exam date creates a dynamic countdown timer, daily MCQ pacing targets, and an automated revision schedule.',
    },
    {
      num: 5,
      title: 'Review & Launch',
      icon: <Sparkles className="w-6 h-6 text-[#F2B90C]" />,
      heading: 'Review your personalized setup',
      explanation:
        'Confirm your choices to generate your customized study dashboard, weak-area diagnostic plan, and daily pacing targets.',
    },
  ];

  const currentMeta = stepMeta[currentStep - 1];

  return (
    <section className="animate-ios-spring flex-1 flex flex-col gap-6 py-4 max-w-5xl mx-auto w-full px-3 sm:px-6">
      {/* =========================================================================
          TOP STEPPER PROGRESS BAR
         ========================================================================= */}
      <div className="bg-[#151515] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {stepMeta.map((s) => {
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <button
                key={s.num}
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
                disabled={s.num > currentStep}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-[#F2B90C]/20 border border-[#F2B90C]/50 text-white font-bold shadow-xs'
                    : isCompleted
                    ? 'bg-white/5 border border-white/10 text-emerald-400 hover:bg-white/10 cursor-pointer'
                    : 'text-slate-500 border border-transparent opacity-60 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-[#F2B90C] text-black shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span className="text-xs font-bold hidden md:inline-block whitespace-nowrap">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Linear indicator line */}
        <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#F2B90C] to-amber-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN WIZARD LAYOUT
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDE PANEL */}
        <div className="lg:col-span-4 bg-[#151515] border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2B90C]/10 border border-[#F2B90C]/30 text-[#F2B90C] text-xs font-black uppercase tracking-wider">
              {currentMeta.icon}
              <span>Step {currentStep} of 5</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-black text-white leading-tight">
                {currentMeta.heading}
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {currentMeta.explanation}
              </p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Why we ask this:</span>
            </div>
            <p className="text-slate-300 leading-normal">
              Tailoring your preferences upfront allows Boardly AI to optimize question frequency, diagnostic scoring, and daily target pacing.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE INTERACTIVE CONTROLS */}
        <div className="lg:col-span-8 bg-[#151515] border border-white/10 rounded-2xl p-6 shadow-lg space-y-6 flex flex-col justify-between min-h-[420px]">
          <div>
            {/* STEP 1: EXAM SELECTION */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-ios-spring">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Select Your Preparation Track</h3>
                  <p className="text-xs text-slate-400">Choose one core exam to align your practice curriculum.</p>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {/* FBISE Card */}
                  <div
                    onClick={() => handleSelectExam('FBISE')}
                    className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      exam === 'FBISE'
                        ? 'bg-[#F2B90C]/10 border-[#F2B90C] ring-2 ring-[#F2B90C]/30'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-[#F2B90C]/40 flex items-center justify-center shrink-0 text-[#F2B90C]">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-white">FBISE Board Preparation</h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            Class 9 - 12
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Federal Board SSC & HSSC curriculum alignment with chapter-wise solved MCQs & tests.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                        exam === 'FBISE'
                          ? 'bg-[#F2B90C] border-[#F2B90C] text-black'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {exam === 'FBISE' && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  {/* MDCAT Card */}
                  <div
                    onClick={() => handleSelectExam('MDCAT')}
                    className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      exam === 'MDCAT'
                        ? 'bg-[#F2B90C]/10 border-[#F2B90C] ring-2 ring-[#F2B90C]/30'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/40 flex items-center justify-center shrink-0 text-emerald-400">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-white">MDCAT Medical Entrance</h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            MBBS & BDS
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          PMDC-aligned Biology, Chemistry, Physics & English test prep for UHS, DUHS, NUMS & KMU.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                        exam === 'MDCAT'
                          ? 'bg-[#F2B90C] border-[#F2B90C] text-black'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {exam === 'MDCAT' && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>

                  {/* TCAT Card */}
                  <div
                    onClick={() => handleSelectExam('TCAT')}
                    className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      exam === 'TCAT'
                        ? 'bg-[#F2B90C]/10 border-[#F2B90C] ring-2 ring-[#F2B90C]/30'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-white">TCAT Engineering & Tech</h4>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                            NUST / FAST / GIKI
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Engineering & Computer Science test prep for NUST NET, FAST-NUCES, GIKI, NED & LUMS.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                        exam === 'TCAT'
                          ? 'bg-[#F2B90C] border-[#F2B90C] text-black'
                          : 'border-white/30 bg-transparent'
                      }`}
                    >
                      {exam === 'TCAT' && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FOCUS SUBJECTS */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-ios-spring">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Select Focus Subjects</h3>
                    <p className="text-xs text-slate-400">
                      Check all subjects where you need extra practice & weak area diagnostics.
                    </p>
                  </div>
                  <button
                    onClick={handleSelectAllSubjects}
                    className="text-xs font-bold text-[#F2B90C] hover:underline bg-white/5 border border-[#F2B90C]/30 px-3 py-1.5 rounded-lg"
                  >
                    {focusSubjects.length === ALL_SUBJECTS_BY_EXAM[exam].length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ALL_SUBJECTS_BY_EXAM[exam].map((subj) => {
                    const isChecked = focusSubjects.includes(subj);
                    return (
                      <div
                        key={subj}
                        onClick={() => handleToggleSubject(subj)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isChecked
                            ? 'bg-[#F2B90C]/10 border-[#F2B90C] text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        <span className="font-bold text-sm">{subj}</span>
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            isChecked
                              ? 'bg-[#F2B90C] border-[#F2B90C] text-black'
                              : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: CLASS / TARGET INSTITUTION */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-ios-spring">
                {exam === 'FBISE' ? (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-white">Select Grade & Group</h3>
                      <p className="text-xs text-slate-400">Choose your exact academic level and study group.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FBISE_LEVEL_OPTIONS.map((opt, idx) => {
                        const isSelected =
                          selectedFbiseOption?.grade === opt.grade && selectedFbiseOption?.group === opt.group;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedFbiseOption({ grade: opt.grade, group: opt.group })}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#F2B90C]/10 border-[#F2B90C] text-white ring-1 ring-[#F2B90C]'
                                : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-white">{opt.label}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-amber-300">
                                  {opt.group}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">{opt.subtitle}</p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#F2B90C] border-[#F2B90C] text-black' : 'border-white/30'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-bold text-white">Select Target University / Board</h3>
                      <p className="text-xs text-slate-400">
                        Choose your primary dream institution to align mock test weighting.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TARGET_INSTITUTIONS_BY_EXAM[exam].map((instId) => {
                        const instData = INSTITUTIONS[instId];
                        const isSelected = targetInstitution === instId;
                        return (
                          <div
                            key={instId}
                            onClick={() => setTargetInstitution(instId)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-[#F2B90C]/10 border-[#F2B90C] ring-1 ring-[#F2B90C]'
                                : 'bg-white/5 border-white/10 hover:border-white/30'
                            }`}
                          >
                            <div className="space-y-1">
                              <InstitutionBadge id={instId} size="md" selected={isSelected} />
                              {instData?.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                                  {instData.description}
                                </p>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#F2B90C] border-[#F2B90C] text-black' : 'border-white/30'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP 4: TIMELINE & COUNTDOWN */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-ios-spring">
                <div>
                  <h3 className="text-lg font-bold text-white">When is your exam?</h3>
                  <p className="text-xs text-slate-400">
                    Set your estimated exam date to unlock dynamic countdowns and pacing recommendations.
                  </p>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Quick Timeframe Presets</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleSetPresetDate(30)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#F2B90C] text-xs font-bold text-white text-center transition-all"
                    >
                      In 1 Month (30d)
                    </button>
                    <button
                      onClick={() => handleSetPresetDate(60)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#F2B90C] text-xs font-bold text-white text-center transition-all"
                    >
                      In 2 Months (60d)
                    </button>
                    <button
                      onClick={() => handleSetPresetDate(90)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#F2B90C] text-xs font-bold text-white text-center transition-all"
                    >
                      In 3 Months (90d)
                    </button>
                    <button
                      onClick={() => handleSetPresetDate(180)}
                      className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#F2B90C] text-xs font-bold text-white text-center transition-all"
                    >
                      In 6 Months (180d)
                    </button>
                  </div>
                </div>

                {/* Date Picker Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Or Pick Exact Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-[#F2B90C]"
                  />
                </div>

                {/* Pacing Banner */}
                {daysRemaining !== null && (
                  <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-[#F2B90C]/30 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F2B90C] text-black font-black flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{daysRemaining} Days Until Exam</div>
                        <div className="text-xs text-amber-300">
                          Recommended Pacing: ~{Math.max(15, Math.ceil(1500 / Math.max(daysRemaining, 1)))} MCQs / day
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: REVIEW & SUMMARY */}
            {currentStep === 5 && (
              <div className="space-y-5 animate-ios-spring">
                <div>
                  <h3 className="text-lg font-bold text-white">Review Your Setup</h3>
                  <p className="text-xs text-slate-400">Everything is customized for your upcoming exam goal.</p>
                </div>

                <div className="space-y-3">
                  {/* Summary Card 1 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">1. Exam Track</span>
                      <p className="font-bold text-sm text-white">{exam} Preparation Track</p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-[#F2B90C] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  {/* Summary Card 2 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">2. Focus Subjects</span>
                      <p className="font-bold text-sm text-white">
                        {focusSubjects.length > 0 ? focusSubjects.join(', ') : 'All Subjects'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-[#F2B90C] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  {/* Summary Card 3 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        3. {exam === 'FBISE' ? 'Grade & Group' : 'Target Institution'}
                      </span>
                      <p className="font-bold text-sm text-white">
                        {exam === 'FBISE'
                          ? `Class ${selectedFbiseOption?.grade} (${selectedFbiseOption?.group})`
                          : INSTITUTIONS[targetInstitution]?.name || targetInstitution.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-[#F2B90C] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>

                  {/* Summary Card 4 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">4. Target Timeline</span>
                      <p className="font-bold text-sm text-white">
                        {examDate ? `${examDate} (${daysRemaining} Days left)` : 'No Date Set'}
                      </p>
                    </div>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="text-xs font-bold text-[#F2B90C] hover:underline flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </button>

            <div className="flex items-center gap-2">
              {(currentStep === 3 || currentStep === 4) && (
                <button
                  onClick={handleSkipStep}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-all"
                >
                  Skip step
                </button>
              )}

              <button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !canContinueStep1) ||
                  (currentStep === 2 && !canContinueStep2)
                }
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md ${
                  (currentStep === 1 && !canContinueStep1) ||
                  (currentStep === 2 && !canContinueStep2)
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                    : 'bg-[#F2B90C] hover:bg-[#d9a50a] text-black shadow-[#F2B90C]/20 hover:scale-[1.02]'
                }`}
              >
                <span>{currentStep === 5 ? 'Complete Setup' : 'Continue'}</span>
                {currentStep === 5 ? <Sparkles className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
