import React, { useState } from 'react';
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Stethoscope,
  Cpu,
  Lock,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { InstitutionBadge } from './InstitutionBadge';
import { StudentProfile } from '../lib/supabase';

export type PlanId = 'free' | 'matric' | 'fsc' | 'tcat' | 'mdcat';

export interface PlanOption {
  id: PlanId;
  name: string;
  category: string;
  price: string;
  numericPrice: number;
  period: string;
  badge?: string;
  recommendedExam?: 'FBISE' | 'MDCAT' | 'TCAT';
  targetTrack: string;
  description: string;
  features: string[];
  limitations?: string[];
  testLimitLabel: string;
  instBadges?: string[];
  accentColor: string;
  borderAccent: string;
}

export const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'free',
    name: 'Free Starter Plan',
    category: 'Basic Access',
    price: 'Rs. 0',
    numericPrice: 0,
    period: 'lifetime',
    badge: 'Free Tier',
    targetTrack: 'General / All Tracks',
    description: 'Basic access to explore chapters, study materials, and try sample practice tests.',
    testLimitLabel: '2 Practice Tests Total (Lifetime)',
    features: [
      '2 total practice tests (lifetime limit - 2/2 tests used)',
      'Browse access to chapters & subject outlines',
      'Limited daily Study Buddy AI tutor messages (5 msgs/day)',
      'Basic test score report',
    ],
    limitations: ['Max 2 tests lifetime across all tracks', 'No full 100/180 MCQ Grand Mocks'],
    accentColor: 'from-slate-700 to-slate-800 text-slate-200',
    borderAccent: 'border-slate-700 hover:border-slate-500',
  },
  {
    id: 'matric',
    name: 'Matric SSC Plan',
    category: 'FBISE Class 9 & 10',
    price: 'Rs. 499',
    numericPrice: 499,
    period: 'per month',
    badge: 'Class 9 – 10',
    recommendedExam: 'FBISE',
    targetTrack: 'Matric (SSC Part 1 & Part 2)',
    description: 'Complete preparation for FBISE Class 9th & 10th Computer Science & Pre-Medical.',
    testLimitLabel: 'Unlimited Practice Tests',
    instBadges: ['apsacs', 'fgc', 'opf'],
    features: [
      'Full SSC 9th & 10th chapter-wise practice',
      'Unlimited practice tests & instant feedback',
      'Unlimited Study Buddy AI tutor',
      'Chapter progress tracking & weak topic detection',
      'Past papers & FBISE exam pattern questions',
    ],
    accentColor: 'from-emerald-900/40 to-emerald-950/60 text-emerald-300',
    borderAccent: 'border-emerald-500/40 hover:border-emerald-400',
  },
  {
    id: 'fsc',
    name: 'FSc HSSC Plan',
    category: 'FBISE Class 11 & 12',
    price: 'Rs. 999',
    numericPrice: 999,
    period: 'per month',
    badge: 'Class 11 – 12',
    recommendedExam: 'FBISE',
    targetTrack: 'FSc (HSSC Part 1 & Part 2)',
    description: 'Advanced mastery for FBISE Class 11th & 12th Pre-Medical, Pre-Engineering & ICS.',
    testLimitLabel: 'Unlimited Practice Tests',
    instBadges: ['kips', 'pgc', 'apsacs'],
    features: [
      'Full HSSC 11th & 12th chapter-wise practice',
      'Unlimited practice tests & custom AI test builder',
      'Unlimited Study Buddy AI tutor',
      'Detailed subject weakness breakdown & analytics',
      'Concept explanations & step-by-step solutions',
    ],
    accentColor: 'from-amber-900/40 to-amber-950/60 text-amber-300',
    borderAccent: 'border-[#F2B90C]/50 hover:border-[#F2B90C]',
  },
  {
    id: 'tcat',
    name: 'TCAT Engineering Plan',
    category: 'UET Taxila / ECAT / Entry Test',
    price: 'Rs. 1,499',
    numericPrice: 1499,
    period: 'per month',
    badge: 'Engineering Track',
    recommendedExam: 'TCAT',
    targetTrack: 'TCAT / ECAT / NUST / FAST / GIKI',
    description: 'Full engineering entrance exam prep with 100-MCQ Full Mock Tests & Speed Analytics.',
    testLimitLabel: 'Unlimited Tests + 100-MCQ Full Mocks',
    instBadges: ['nust', 'fast', 'giki', 'ned', 'lums', 'iba'],
    features: [
      'Full TCAT engineering track access',
      '100-MCQ Full Mock Test series with timer',
      'Unlimited Study Buddy AI tutor',
      'Detailed speed, accuracy & subject analytics',
      'Math, Physics & CS high-yield question bank',
    ],
    accentColor: 'from-cyan-900/40 to-cyan-950/60 text-cyan-300',
    borderAccent: 'border-cyan-500/50 hover:border-cyan-400',
  },
  {
    id: 'mdcat',
    name: 'MDCAT Medical Plan',
    category: 'PMDC Medical Admissions',
    price: 'Rs. 1,499',
    numericPrice: 1499,
    period: 'per month',
    badge: 'Medical Track',
    recommendedExam: 'MDCAT',
    targetTrack: 'MDCAT / UHS / DUHS / NUMS / KMU',
    description: 'Ultimate medical entry test track with 180-MCQ Grand Tests & PMDC Syllabus coverage.',
    testLimitLabel: 'Unlimited Tests + 180-MCQ Mocks',
    instBadges: ['uhs', 'duhs', 'nums', 'kmu', 'szabmu'],
    features: [
      'Full PMDC MDCAT medical track access',
      '180-MCQ Grand Test series with exam timer',
      'Unlimited Study Buddy AI tutor',
      'Detailed subject weakness & high-yield topics',
      'Biology, Chemistry & Physics entry test drills',
    ],
    accentColor: 'from-rose-900/40 to-rose-950/60 text-rose-300',
    borderAccent: 'border-rose-500/50 hover:border-rose-400',
  },
];

interface PlanSelectionScreenProps {
  userProfile: StudentProfile | null;
  currentTestsUsed?: number;
  onSelectPlans: (selectedPlanIds: PlanId[]) => void;
  onBackToWizard?: () => void;
}

export const PlanSelectionScreen: React.FC<PlanSelectionScreenProps> = ({
  userProfile,
  currentTestsUsed = 0,
  onSelectPlans,
  onBackToWizard,
}) => {
  // Determine user's target exam from wizard setup
  const targetExam = userProfile?.target_exam || 'FBISE';

  // State to track user's selected plan IDs (multi-selection supported!)
  const [selectedPlanIds, setSelectedPlanIds] = useState<PlanId[]>(() => {
    if (userProfile?.subscribed_plans && userProfile.subscribed_plans.length > 0) {
      return userProfile.subscribed_plans as PlanId[];
    }
    // Default recommendation based on target exam
    if (targetExam === 'MDCAT') return ['mdcat'];
    if (targetExam === 'TCAT') return ['tcat'];
    if (userProfile?.grade === '9' || userProfile?.grade === '10') return ['matric'];
    return ['fsc'];
  });

  const handleTogglePlan = (planId: PlanId) => {
    if (planId === 'free') {
      setSelectedPlanIds(['free']);
      return;
    }
    // If selecting a paid plan, remove 'free'
    let updated: PlanId[] = selectedPlanIds.filter((id) => id !== 'free');
    if (updated.includes(planId)) {
      updated = updated.filter((id) => id !== planId);
    } else {
      updated.push(planId);
    }
    if (updated.length === 0) {
      updated = ['free'];
    }
    setSelectedPlanIds(updated);
  };

  const handleConfirm = () => {
    if (selectedPlanIds.length === 0) return;
    onSelectPlans(selectedPlanIds);
  };

  const totalPrice = selectedPlanIds.reduce((sum, id) => {
    const plan = PLAN_OPTIONS.find((p) => p.id === id);
    return sum + (plan?.numericPrice || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Inter'] selection:bg-[#F2B90C] selection:text-black">
      {/* BACKGROUND DECORATION */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F2B90C]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1 flex flex-col justify-between">
        {/* HEADER SECTION */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2B90C]/10 border border-[#F2B90C]/30 text-[#F2B90C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Step 2 of 2 — Track Plan Selection
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-['Space_Grotesk'] leading-tight">
            Select Your Track Plan & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F2B90C] via-amber-300 to-yellow-400">Unlock Full Access</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Choose your target track plan to access chapter-wise practice tests, grand mock exams, and Study Buddy AI.
            <span className="block mt-1 font-medium text-slate-400">
              Each paid plan unlocks its specific track. You can select one or multiple track plans as needed.
            </span>
          </p>

          {/* STUDENT CONTEXT BADGE */}
          {userProfile && (
            <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <GraduationCap className="w-4 h-4 text-[#F2B90C]" /> {userProfile.name}
              </span>
              <span className="text-slate-500">•</span>
              <span>Target: <strong className="text-amber-400">{userProfile.target_exam || 'FBISE'}</strong></span>
              {userProfile.grade && (
                <>
                  <span className="text-slate-500">•</span>
                  <span>Grade/Level: <strong className="text-slate-200">{userProfile.grade}</strong></span>
                </>
              )}
            </div>
          )}
        </div>

        {/* PLAN CARDS GRID */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLAN_OPTIONS.map((plan) => {
            const isSelected = selectedPlanIds.includes(plan.id);
            const isRecommended = plan.recommendedExam === targetExam || (targetExam === 'FBISE' && (plan.id === 'matric' || plan.id === 'fsc'));

            return (
              <div
                key={plan.id}
                onClick={() => handleTogglePlan(plan.id)}
                className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between backdrop-blur-xl ${
                  isSelected
                    ? 'bg-slate-900/90 ring-2 ring-[#F2B90C] shadow-2xl shadow-[#F2B90C]/15 scale-[1.01]'
                    : 'bg-slate-900/40 hover:bg-slate-900/70 border border-white/10 hover:border-white/20'
                }`}
              >
                {/* RECOMMENDED BADGE */}
                {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F2B90C] to-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-black" /> Recommended for Your Track
                  </div>
                )}

                {/* SELECTION CHECKBOX */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                    {plan.badge}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#F2B90C] border-[#F2B90C] text-black'
                        : 'border-slate-600 bg-black/40 text-transparent'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{plan.description}</p>
                  </div>

                  {/* PRICE BLOCK */}
                  <div className="py-3 px-4 rounded-2xl bg-black/40 border border-white/5 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl sm:text-3xl font-black text-white font-['Space_Grotesk']">
                        {plan.price}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 ml-1.5">{plan.period}</span>
                    </div>
                    {plan.id === 'free' ? (
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                        {currentTestsUsed}/2 Used
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/30">
                        Unlimited Access
                      </span>
                    )}
                  </div>

                  {/* TEST LIMIT NOTICE */}
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <Clock className="w-4 h-4 text-[#F2B90C] shrink-0" />
                    <span>{plan.testLimitLabel}</span>
                  </div>

                  {/* INSTITUTION BADGES */}
                  {plan.instBadges && plan.instBadges.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Target Universities</span>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.instBadges.map((instId) => (
                          <InstitutionBadge key={instId} id={instId} size="sm" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FEATURE CHECKLIST */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plan Highlights</span>
                    <ul className="space-y-2">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* SELECT BUTTON */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePlan(plan.id);
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-[#F2B90C] hover:bg-[#d9a50a] text-black shadow-lg shadow-[#F2B90C]/20'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Plan Selected' : `Select ${plan.name}`}</span>
                    {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="mt-10 p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <ShieldCheck className="w-5 h-5 text-[#F2B90C]" />
              <span>Selected Plan(s):</span>
              <span className="text-[#F2B90C]">
                {selectedPlanIds
                  .map((id) => PLAN_OPTIONS.find((p) => p.id === id)?.name)
                  .join(' + ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Fee: <strong className="text-white">{totalPrice === 0 ? 'Rs. 0 (Free Plan)' : `Rs. ${totalPrice.toLocaleString()} / month`}</strong> • Access instantly assigned upon confirmation.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {onBackToWizard && (
              <button
                type="button"
                onClick={onBackToWizard}
                className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
              >
                Back to Setup
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#F2B90C] to-amber-500 hover:from-amber-400 hover:to-[#F2B90C] text-black font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#F2B90C]/20 hover:scale-[1.02]"
            >
              <span>Confirm & Launch Dashboard</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
