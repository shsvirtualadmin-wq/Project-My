import React, { useState } from 'react';
import { User, StudentProfile, saveStudentRegistration, supabase } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Phone,
  Mail,
  GraduationCap,
  BookOpen,
  ArrowRight,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Stethoscope,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StudentRegistrationFlowProps {
  user: User;
  onRegistrationComplete: (profile: StudentProfile) => void;
  onSignOut: () => void;
}

export const StudentRegistrationFlow: React.FC<StudentRegistrationFlowProps> = ({
  user,
  onRegistrationComplete,
  onSignOut,
}) => {
  const { logoUrl } = useSiteSettings();
  const [fullName, setFullName] = useState<string>(
    user.user_metadata?.full_name || user.user_metadata?.name || ''
  );
  const [phone, setPhone] = useState<string>('');

  // Initial category & grade pre-selection based on stored intent
  const [selectedCategory, setSelectedCategory] = useState<'FBISE' | 'MDCAT' | 'TCAT'>(() => {
    try {
      const storedClass = (
        sessionStorage.getItem('shs_intended_class') ||
        localStorage.getItem('shs_intended_class') ||
        ''
      ).toUpperCase();
      const storedGroup = (
        sessionStorage.getItem('shs_intended_group') ||
        localStorage.getItem('shs_intended_group') ||
        ''
      ).toUpperCase();
      if (storedClass === 'MDCAT' || storedGroup === 'MDCAT') return 'MDCAT';
      if (storedClass === 'TCAT' || storedGroup === 'TCAT') return 'TCAT';
      return 'FBISE';
    } catch {
      return 'FBISE';
    }
  });

  const [selectedGrade, setSelectedGrade] = useState<string>(() => {
    try {
      const storedClass = (
        sessionStorage.getItem('shs_intended_class') ||
        localStorage.getItem('shs_intended_class') ||
        ''
      ).toUpperCase();
      const storedGroup = (
        sessionStorage.getItem('shs_intended_group') ||
        localStorage.getItem('shs_intended_group') ||
        ''
      ).toUpperCase();
      if (storedClass === 'MDCAT' || storedGroup === 'MDCAT') return 'MDCAT';
      if (storedClass === 'TCAT' || storedGroup === 'TCAT') return 'TCAT';
      if (storedClass === '9' || storedClass === '9TH') return '9th';
      if (storedClass === '10' || storedClass === '10TH') return '10th';
      if (storedClass === '11' || storedClass === '11TH') return '11th';
      if (storedClass === '12' || storedClass === '12TH') return '12th';
      return '';
    } catch {
      return '';
    }
  });

  const [selectedStream, setSelectedStream] = useState<string>(() => {
    try {
      const storedClass = (
        sessionStorage.getItem('shs_intended_class') ||
        localStorage.getItem('shs_intended_class') ||
        ''
      ).toUpperCase();
      const storedGroup = (
        sessionStorage.getItem('shs_intended_group') ||
        localStorage.getItem('shs_intended_group') ||
        ''
      ).toLowerCase();
      if (storedClass === 'MDCAT' || storedGroup === 'mdcat') return 'MDCAT';
      if (storedClass === 'TCAT' || storedGroup === 'tcat') return 'TCAT';
      if (storedGroup.includes('med') || storedGroup.includes('bio')) {
        if (storedClass === '9' || storedClass === '10' || storedClass === '9TH' || storedClass === '10TH')
          return 'Biology Stream';
        return 'Pre-Medical Stream';
      }
      if (storedGroup.includes('cs') || storedGroup.includes('comp') || storedGroup.includes('ics')) {
        if (storedClass === '9' || storedClass === '10' || storedClass === '9TH' || storedClass === '10TH')
          return 'Computer Science Stream';
        return 'ICS Stream';
      }
      if (storedGroup.includes('eng')) return 'Pre-Engineering Stream';
      return '';
    } catch {
      return '';
    }
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Grade options for FBISE
  const gradeOptions = [
    { key: '9th', label: '9th / Grade 9' },
    { key: '10th', label: '10th / Grade 10' },
    { key: '11th', label: '11th / Grade 11' },
    { key: '12th', label: '12th / Grade 12' },
  ];

  // Subject mapping based on grade and stream
  const getStreamSubjects = (gradeKey: string, streamName: string): string[] => {
    const isPakStudyGrade = gradeKey === '10th' || gradeKey === '12th';
    const compSubject = isPakStudyGrade ? 'Pakistan Studies' : 'Islamiat';

    if (streamName === 'Biology Stream' || streamName === 'Pre-Medical Stream') {
      return ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'English', 'Urdu', compSubject].filter(
        (s, i, arr) => arr.indexOf(s) === i
      );
    }
    if (streamName === 'Computer Science Stream' || streamName === 'ICS Stream') {
      return ['Computer Science', 'Chemistry', 'Mathematics', 'Physics', 'English', 'Urdu', compSubject].filter(
        (s, i, arr) => arr.indexOf(s) === i
      );
    }
    if (streamName === 'Pre-Engineering Stream') {
      return ['Mathematics', 'Chemistry', 'Physics', 'English', 'Urdu', compSubject];
    }
    return ['English', 'Urdu', compSubject];
  };

  // Get available streams for selected grade
  const getAvailableStreams = (gradeKey: string) => {
    const isPakStudy = gradeKey === '10th' || gradeKey === '12th';
    const comp = isPakStudy ? 'Pakistan Studies' : 'Islamiat';

    if (gradeKey === '9th' || gradeKey === '10th') {
      return [
        {
          name: 'Biology Stream',
          subjects: ['Biology', 'Chemistry', 'Mathematics', 'Physics', 'English', 'Urdu', comp],
        },
        {
          name: 'Computer Science Stream',
          subjects: ['Computer Science', 'Chemistry', 'Mathematics', 'Physics', 'English', 'Urdu', comp],
        },
      ];
    }

    if (gradeKey === '11th' || gradeKey === '12th') {
      return [
        {
          name: 'Pre-Medical Stream',
          subjects: ['Biology', 'Chemistry', 'Physics', 'English', 'Urdu', comp],
        },
        {
          name: 'Pre-Engineering Stream',
          subjects: ['Mathematics', 'Chemistry', 'Physics', 'English', 'Urdu', comp],
        },
        {
          name: 'ICS Stream',
          subjects: ['Computer Science', 'Mathematics', 'Physics', 'English', 'Urdu', comp],
        },
      ];
    }

    return [];
  };

  // Available streams for TCAT
  const tcatStreams = [
    {
      name: 'Pre-Engineering Stream',
      description: 'Focus on Higher Mathematics, Physics, Chemistry & Logical Reasoning',
      subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Logical Reasoning'],
    },
    {
      name: 'ICS Stream',
      description: 'Focus on Computer Science, Mathematics, Physics & Logical Reasoning',
      subjects: ['Mathematics', 'Physics', 'Computer Science', 'English', 'Logical Reasoning'],
    },
    {
      name: 'Pre-Medical Stream',
      description: 'Focus on Biology, Chemistry, Physics & Quantitative Reasoning',
      subjects: ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'],
    },
  ];

  const currentStreams = getAvailableStreams(selectedGrade);

  // Validate form completeness based on program category
  const isPersonalValid = fullName.trim().length >= 2 && phone.trim().length >= 7;

  let isValid = isPersonalValid;
  if (selectedCategory === 'FBISE') {
    isValid = isPersonalValid && selectedGrade !== '' && selectedStream !== '';
  } else if (selectedCategory === 'MDCAT') {
    isValid = isPersonalValid;
  } else if (selectedCategory === 'TCAT') {
    isValid = isPersonalValid && selectedStream !== '';
  }

  const handleCategorySelect = (category: 'FBISE' | 'MDCAT' | 'TCAT') => {
    setSelectedCategory(category);
    setErrorMsg(null);
    if (category === 'MDCAT') {
      setSelectedGrade('MDCAT');
      setSelectedStream('MDCAT');
    } else if (category === 'TCAT') {
      setSelectedGrade('TCAT');
      setSelectedStream('Pre-Engineering Stream');
    } else {
      setSelectedGrade('');
      setSelectedStream('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let finalGrade = selectedGrade;
      let finalStream = selectedStream;
      let subjects: string[] = [];

      if (selectedCategory === 'MDCAT') {
        finalGrade = 'MDCAT';
        finalStream = 'MDCAT';
        subjects = ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'];
      } else if (selectedCategory === 'TCAT') {
        finalGrade = 'TCAT';
        finalStream = selectedStream || 'TCAT';
        const matched = tcatStreams.find((s) => s.name === selectedStream);
        subjects = matched ? matched.subjects : ['Mathematics', 'Physics', 'Chemistry', 'English', 'Logical Reasoning'];
      } else {
        subjects = getStreamSubjects(selectedGrade, selectedStream);
        finalGrade = gradeOptions.find((g) => g.key === selectedGrade)?.label || selectedGrade;
      }

      const profile = await saveStudentRegistration(user.id, {
        name: fullName,
        phone: phone,
        email: user.email || '',
        grade: finalGrade,
        stream: finalStream,
        subjects: subjects,
      });

      // Clear intended params after successful registration
      try {
        sessionStorage.removeItem('shs_intended_class');
        sessionStorage.removeItem('shs_intended_group');
        localStorage.removeItem('shs_intended_class');
        localStorage.removeItem('shs_intended_group');
      } catch {}

      onRegistrationComplete(profile);
    } catch (err: any) {
      console.error('Registration submission failed:', err);
      setErrorMsg(err?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-3 sm:px-6 animate-ios-spring">
      {/* Header Branding */}
      <div className="flex flex-col items-center text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-[#0A0A0A] border-2 border-[#F2B90C] rounded-2xl flex items-center justify-center shadow-lg mb-0.5 overflow-hidden p-1">
          <img
            src={logoUrl || "/logo.png"}
            alt="Boardly Logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.endsWith('/logo.png')) {
                target.src = '/logo.png';
              } else if (!target.src.endsWith('/logo.svg')) {
                target.src = '/logo.svg';
              }
            }}
          />
        </div>
        <h1 className="font-['Space_Grotesk'] font-black text-2xl sm:text-3xl tracking-widest text-[#F2B90C] uppercase leading-none">
          BOARDLY
        </h1>
        <p className="text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] text-[#F2B90C]/90 uppercase">
          LEARN &middot; GROW &middot; ACHIEVE
        </p>
      </div>

      {/* Main Registration Card */}
      <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
        {/* Title & All Categories Badge Header */}
        <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/10">
          <div>
            <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white leading-tight">
              Student Registration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set up your profile to access FBISE, MDCAT & TCAT practice exams.
            </p>
          </div>

          <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C]/20 border border-[#F2B90C]/40 px-3 py-1 rounded-full shadow-xs">
            FBISE & ENTRANCE TESTS
          </span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/20 rounded-2xl flex items-center gap-2 text-xs text-rose-700 dark:text-rose-400 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Personal Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <UserIcon className="w-4 h-4 text-[#F2B90C]" />
              <span>Step 1: Personal Information</span>
            </div>

            <div className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#0A0A0A] dark:text-slate-200 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 dark:bg-[#202020] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-semibold text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#F2B90C] transition-all"
                  />
                </div>
              </div>

              {/* WhatsApp / Phone */}
              <div>
                <label className="block text-xs font-bold text-[#0A0A0A] dark:text-slate-200 mb-1">
                  WhatsApp / Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300 1234567"
                    className="w-full bg-slate-50 dark:bg-[#202020] border border-black/10 dark:border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#F2B90C] transition-all"
                  />
                </div>
              </div>

              {/* Account Email (Permanently Locked) */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#0A0A0A] dark:text-slate-200 flex items-center gap-1">
                    <span>Account Email</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#F2B90C]" /> Permanently Locked
                  </span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full bg-slate-200/60 dark:bg-[#2A2A2A] border border-black/10 dark:border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-80"
                  />
                  <Lock className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Your email is linked to your authenticated session and cannot be modified.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: Select Exam Program Category */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#F2B90C]" />
                <span>Step 2: Select Exam Program</span>
              </span>
              <span className="text-rose-500 text-[10px] lowercase">*required</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* FBISE Card */}
              <button
                type="button"
                onClick={() => handleCategorySelect('FBISE')}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCategory === 'FBISE'
                    ? 'border-2 border-[#F2B90C] bg-[#F2B90C]/10 text-[#0A0A0A] dark:text-white shadow-sm font-extrabold'
                    : 'border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 hover:border-[#F2B90C]/60 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <GraduationCap className="w-5 h-5 text-[#F2B90C]" />
                  {selectedCategory === 'FBISE' && <CheckCircle2 className="w-5 h-5 text-[#F2B90C]" />}
                </div>
                <div>
                  <span className="block text-sm font-extrabold text-[#0A0A0A] dark:text-white">FBISE Board</span>
                  <span className="text-[10px] text-slate-500 block">Grades 9th – 12th</span>
                </div>
              </button>

              {/* MDCAT Card */}
              <button
                type="button"
                onClick={() => handleCategorySelect('MDCAT')}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCategory === 'MDCAT'
                    ? 'border-2 border-amber-500 bg-amber-500/10 text-[#0A0A0A] dark:text-white shadow-sm font-extrabold'
                    : 'border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 hover:border-amber-500/60 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Stethoscope className="w-5 h-5 text-amber-500" />
                  {selectedCategory === 'MDCAT' && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <span className="block text-sm font-extrabold text-[#0A0A0A] dark:text-white">MDCAT</span>
                  <span className="text-[10px] text-slate-500 block">Medical Entrance</span>
                </div>
              </button>

              {/* TCAT Card */}
              <button
                type="button"
                onClick={() => handleCategorySelect('TCAT')}
                className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between space-y-2 ${
                  selectedCategory === 'TCAT'
                    ? 'border-2 border-cyan-500 bg-cyan-500/10 text-[#0A0A0A] dark:text-white shadow-sm font-extrabold'
                    : 'border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 hover:border-cyan-500/60 font-semibold'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Cpu className="w-5 h-5 text-cyan-500" />
                  {selectedCategory === 'TCAT' && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                </div>
                <div>
                  <span className="block text-sm font-extrabold text-[#0A0A0A] dark:text-white">TCAT</span>
                  <span className="text-[10px] text-slate-500 block">Tech / Eng Entrance</span>
                </div>
              </button>
            </div>
          </div>

          {/* STEP 3 (FBISE): Select Academic Grade */}
          {selectedCategory === 'FBISE' && (
            <div className="space-y-3 pt-2 animate-ios-spring">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#F2B90C]" />
                  <span>Step 3: Select Academic Grade</span>
                </span>
                <span className="text-rose-500 text-[10px] lowercase">*required</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {gradeOptions.map((g) => {
                  const isSelected = selectedGrade === g.key;
                  return (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => {
                        setSelectedGrade(g.key);
                        setSelectedStream(''); // Reset stream when grade changes
                      }}
                      className={`p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-[#F2B90C] bg-[#F2B90C]/10 text-[#0A0A0A] dark:text-white shadow-sm font-extrabold'
                          : 'border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 hover:border-[#F2B90C]/60 font-semibold'
                      }`}
                    >
                      <div>
                        <span className="block text-sm sm:text-base font-extrabold">{g.label}</span>
                        <span className="text-[10px] text-slate-500 block">FBISE Board</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#F2B90C] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4 (FBISE): Choose Academic Stream */}
          {selectedCategory === 'FBISE' && selectedGrade && (
            <div className="space-y-3 pt-2 animate-ios-spring">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#F2B90C]" />
                  <span>Step 4: Choose Stream</span>
                </span>
                <span className="text-rose-500 text-[10px] lowercase">*required</span>
              </div>

              <div className="space-y-3">
                {currentStreams.map((stream) => {
                  const isSelected = selectedStream === stream.name;
                  return (
                    <div
                      key={stream.name}
                      onClick={() => setSelectedStream(stream.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-2 border-[#F2B90C] bg-[#F2B90C]/10 text-[#0A0A0A] dark:text-white shadow-sm'
                          : 'border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 hover:border-[#F2B90C]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm sm:text-base text-[#0A0A0A] dark:text-white">
                          {stream.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-[#F2B90C] bg-[#F2B90C]' : 'border-slate-300 dark:border-white/20'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#0A0A0A]" />}
                        </div>
                      </div>

                      {/* Subject Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {stream.subjects.map((sub) => (
                          <span
                            key={sub}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-[#0A0A0A] text-[#F2B90C]'
                                : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MDCAT Summary Step */}
          {selectedCategory === 'MDCAT' && (
            <div className="space-y-3 pt-2 animate-ios-spring">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>MDCAT Medical Entrance Test Selected</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  You will be registered for the complete MDCAT Prep Module covering Biology, Chemistry, Physics, English, and Logical Reasoning.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'].map((sub) => (
                    <span
                      key={sub}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500 text-black shadow-xs"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TCAT Stream Selection Step */}
          {selectedCategory === 'TCAT' && (
            <div className="space-y-3 pt-2 animate-ios-spring">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  <span>Step 3: Choose TCAT Background Stream</span>
                </span>
                <span className="text-rose-500 text-[10px] lowercase">*required</span>
              </div>

              <div className="space-y-3">
                {tcatStreams.map((stream) => {
                  const isSelected = selectedStream === stream.name;
                  return (
                    <div
                      key={stream.name}
                      onClick={() => setSelectedStream(stream.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-2 border-cyan-500 bg-cyan-500/10 text-[#0A0A0A] dark:text-white shadow-sm'
                          : 'border border-black/10 dark:border-white/10 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 hover:border-cyan-500/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-sm sm:text-base text-[#0A0A0A] dark:text-white block">
                            {stream.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{stream.description}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-slate-300 dark:border-white/20'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                        </div>
                      </div>

                      {/* Subject Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {stream.subjects.map((sub) => (
                          <span
                            key={sub}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-black text-cyan-400 dark:bg-white dark:text-black'
                                : 'bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Action & Sign Out */}
          <div className="pt-4 space-y-3">
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full bg-[#0A0A0A] hover:bg-[#1A1A1A] text-white font-extrabold py-4 px-6 rounded-2xl transition-all active:scale-98 shadow-lg flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed border border-[#F2B90C]/30 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F2B90C] border-t-transparent rounded-full animate-spin" />
                  <span>Completing Registration...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration ({selectedCategory})</span>
                  <ArrowRight className="w-4 h-4 text-[#F2B90C]" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2.5 text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </form>

        {/* Footer Security Microcopy */}
        <div className="pt-4 border-t border-black/5 dark:border-white/10 text-center">
          <p className="text-[11px] text-slate-500 font-bold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#F2B90C]" />
            <span>Boardly LMS Security System &middot; Encrypted & Verified</span>
          </p>
        </div>
      </div>
    </div>
  );
};
