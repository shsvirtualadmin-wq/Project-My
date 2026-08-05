import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  GraduationCap,
  CheckCircle2,
  Building2,
  Sparkles,
  Loader2,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { User, StudentProfile, saveStudentTargetUniversity } from '../lib/supabase';
import { InstitutionBadge, INSTITUTIONS } from './InstitutionBadge';

interface TargetUniversityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  userProfile: StudentProfile | null;
  onUniversityUpdated: (updatedProfile: StudentProfile) => void;
}

const MEDICAL_UNIVERSITIES = [
  { name: 'King Edward Medical University (KEMU), Lahore', instId: 'uhs' },
  { name: 'Rawalpindi Medical University (RMU), Rawalpindi', instId: 'szabmu' },
  { name: 'Allama Iqbal Medical College (AIMC), Lahore', instId: 'uhs' },
  { name: 'Army Medical College (AMC), Rawalpindi', instId: 'nums' },
  { name: 'Dow University of Health Sciences (DUHS), Karachi', instId: 'duhs' },
  { name: 'Nishtar Medical University, Multan', instId: 'uhs' },
  { name: 'Services Institute of Medical Sciences (SIMS), Lahore', instId: 'uhs' },
  { name: 'Khyber Medical University (KMU), Peshawar', instId: 'kmu' },
  { name: 'University of Health Sciences (UHS), Lahore', instId: 'uhs' },
  { name: 'Shaheed Zulfiqar Ali Bhutto Medical University (SZABMU), Islamabad', instId: 'szabmu' },
];

const ENGINEERING_UNIVERSITIES = [
  { name: 'NUST (National University of Sciences & Technology), Islamabad', instId: 'nust' },
  { name: 'FAST NUCES (Islamabad / Lahore / Karachi)', instId: 'fast' },
  { name: 'GIKI (Ghulam Ishaq Khan Institute), Topi', instId: 'giki' },
  { name: 'UET Taxila (Main & Sub-Campuses)', instId: 'uet' },
  { name: 'UET Lahore', instId: 'uet' },
  { name: 'COMSATS University, Islamabad / Lahore', instId: 'uet' },
  { name: 'PIEAS (Pakistan Institute of Engineering & Applied Sciences)', instId: 'uet' },
  { name: 'LUMS (Lahore University of Management Sciences)', instId: 'lums' },
  { name: 'NED University of Engineering & Technology, Karachi', instId: 'ned' },
  { name: 'IBA Karachi', instId: 'iba' },
  { name: 'Air University / IST Islamabad', instId: 'uet' },
];

const GENERAL_COLLEGES = [
  { name: 'Army Public School & College System (APSACS)', instId: 'apsacs' },
  { name: 'F.G. Sir Syed College / FGC, Rawalpindi & Islamabad', instId: 'fgc' },
  { name: 'Punjab Group of Colleges (PGC)', instId: 'pgc' },
  { name: 'KIPS College', instId: 'kips' },
  { name: 'Superior College', instId: 'pgc' },
];

export const TargetUniversityModal: React.FC<TargetUniversityModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userProfile,
  onUniversityUpdated,
}) => {
  const [selectedUni, setSelectedUni] = useState<string>('');
  const [customUni, setCustomUni] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'recommended' | 'medical' | 'engineering' | 'all'>('recommended');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (userProfile) {
      const current = userProfile.dream_university || userProfile.target_university || '';
      setSelectedUni(current);
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const studentGrade = (userProfile?.grade || '').toUpperCase();
  const studentStream = (userProfile?.stream || '').toUpperCase();

  const isMedicalTrack = studentGrade.includes('MDCAT') || studentStream.includes('MEDICAL');
  const isEngineeringTrack = studentGrade.includes('TCAT') || studentStream.includes('ENGINEERING') || studentStream.includes('CS') || studentStream.includes('COMPUTER');

  let recommendedList = [...ENGINEERING_UNIVERSITIES, ...MEDICAL_UNIVERSITIES];
  if (isMedicalTrack) {
    recommendedList = [...MEDICAL_UNIVERSITIES, ...GENERAL_COLLEGES];
  } else if (isEngineeringTrack) {
    recommendedList = [...ENGINEERING_UNIVERSITIES, ...GENERAL_COLLEGES];
  }

  const getFilteredList = () => {
    let list = recommendedList;
    if (activeCategory === 'medical') list = MEDICAL_UNIVERSITIES;
    if (activeCategory === 'engineering') list = ENGINEERING_UNIVERSITIES;
    if (activeCategory === 'all') list = [...ENGINEERING_UNIVERSITIES, ...MEDICAL_UNIVERSITIES, ...GENERAL_COLLEGES];

    if (!searchQuery.trim()) return list;

    return list.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  };

  const handleSave = async (uniToSave?: string) => {
    const finalUni = (uniToSave || customUni || selectedUni).trim();
    if (!finalUni) return;

    if (!currentUser?.id) {
      alert("Please log in to save your target university.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage('');

    try {
      const updated = await saveStudentTargetUniversity(currentUser.id, finalUni);
      if (updated) {
        onUniversityUpdated(updated);
      } else if (userProfile) {
        const fallback: StudentProfile = {
          ...userProfile,
          dream_university: finalUni,
          target_university: finalUni,
        };
        onUniversityUpdated(fallback);
      }
      setSuccessMessage(`Target university updated to "${finalUni}"!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to update target university:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = getFilteredList();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#161618] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border-b border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk'] tracking-tight flex items-center gap-2">
                Select Your Target University
                <Sparkles className="w-4 h-4 text-amber-500" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your dream institute or university for tailored entry test & board preparation.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 space-y-3 bg-slate-50/50 dark:bg-black/20 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search university or college (e.g. NUST, KEMU, FAST, UET)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('recommended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'recommended'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⭐ Recommended for You
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('medical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'medical'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🩺 Medical & Dental (MDCAT)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('engineering')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'engineering'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              💻 Engineering & Tech (TCAT)
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-800 text-white dark:bg-white/20 shadow-sm'
                  : 'bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🏛️ All Institutions
            </button>
          </div>
        </div>

        {/* University Options Scroll List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 scrollbar-thin">
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl p-3 text-xs font-extrabold flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {filteredItems.map((item, idx) => {
            const isSelected = selectedUni.toLowerCase() === item.name.toLowerCase();
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedUni(item.name);
                  handleSave(item.name);
                }}
                disabled={isSaving}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 text-slate-900 dark:text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500/50 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <InstitutionBadge id={item.instId} size="sm" />
                  <span className="text-xs sm:text-sm font-bold truncate">
                    {item.name}
                  </span>
                </div>

                {isSelected ? (
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Selected
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-400 group-hover:text-amber-500 transition-colors flex items-center gap-1 shrink-0">
                    Select <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}

          {/* Custom Input Option */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-3 space-y-2">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Or type a custom University / College name</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Quaid-i-Azam University (QAU), Islamabad"
                value={customUni}
                onChange={(e) => setCustomUni(e.target.value)}
                className="flex-1 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => handleSave(customUni)}
                disabled={isSaving || !customUni.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Choice'}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-black/30 border-t border-slate-200 dark:border-white/10 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            You can change your target university anytime from your dashboard.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
