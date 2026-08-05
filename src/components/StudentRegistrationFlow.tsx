import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  StudentProfile,
  saveStudentRegistration,
  supabase,
} from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  GraduationCap,
  Stethoscope,
  Cpu,
  Layers,
  Sparkles,
  UploadCloud,
  Copy,
  Check,
  Mail,
  Phone,
  User as UserIcon,
  CreditCard,
  Lock,
  ShieldCheck,
  Clock,
  ExternalLink,
  MessageSquare,
  BookOpen,
  FileText,
  Loader2,
  X,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface StudentRegistrationFlowProps {
  user?: User | null;
  onRegistrationComplete: (profile: StudentProfile) => void;
  onSignOut?: () => void;
  onSkipToPractice?: () => void;
}

// Payment Methods
const PAYMENT_ACCOUNTS = [
  {
    id: 'JazzCash',
    name: 'JazzCash',
    number: '+92 305 8969050',
    title: 'Haseena Bibi',
    badge: 'Mobile Wallet',
    color: 'from-amber-500 to-red-600',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
  },
  {
    id: 'SadaPay',
    name: 'SadaPay',
    number: '+92 349 0744686',
    title: 'Raheela Ferdous',
    badge: 'Digital Bank',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'NayaPay',
    name: 'NayaPay',
    number: '+92 349 0744686',
    title: 'Raheela Ferdous',
    badge: 'Digital Bank',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
  },
  {
    id: 'Easypaisa',
    name: 'Easypaisa',
    number: '+92 333 5292094',
    title: 'Sadia Fatima',
    badge: 'Mobile Wallet',
    color: 'from-green-500 to-emerald-700',
    border: 'border-green-500/40',
    bg: 'bg-green-500/10',
  },
];

// Universities Options based on Track
const MDCAT_COLLEGES = [
  'King Edward Medical University (KEMU), Lahore',
  'Rawalpindi Medical University (RMU), Rawalpindi',
  'Allama Iqbal Medical College (AIMC), Lahore',
  'Army Medical College (AMC), Rawalpindi',
  'Dow University of Health Sciences (DUHS), Karachi',
  'Nishtar Medical University, Multan',
  'Services Institute of Medical Sciences (SIMS), Lahore',
  'Khyber Medical University (KMU), Peshawar',
  'University of Health Sciences (UHS), Lahore',
  'Other Medical College / University',
];

const TCAT_UNIVERSITIES = [
  'UET Taxila (Main Campus)',
  'UET Taxila (Sub-Campuses)',
  'UET Lahore',
  'NUST (National University of Sciences and Technology), Islamabad',
  'FAST NUCES (Islamabad / Lahore)',
  'GIKI (Ghulam Ishaq Khan Institute), Topi',
  'COMSATS University, Islamabad / Lahore',
  'PIEAS (Pakistan Institute of Engineering & Applied Sciences)',
  'Air University / IST Islamabad',
  'Other Engineering University',
];

const FBISE_INSTITUTIONS = [
  'Army Public School & College System (APSACS)',
  'F.G. Sir Syed College, Rawalpindi',
  'F.G. Degree College, Islamabad',
  'Punjab Group of Colleges (PGC)',
  'KIPS College',
  'Superior College',
  'Future Goal: NUST / GIKI / UET Engineering',
  'Future Goal: KEMU / RMU Medical',
  'Other College / School',
];

// TCAT Groups
const TCAT_GROUPS = [
  {
    id: 'Pre-Engineering Group',
    name: 'Pre-Engineering Group',
    subjects: 'Mathematics, Physics, Chemistry, English',
    desc: 'For FSc Pre-Engineering students entering mechanical, electrical, civil, software engineering.',
    icon: Cpu,
  },
  {
    id: 'Computer Science / ICS Group',
    name: 'Computer Science / ICS Group',
    subjects: 'Mathematics, Physics, Computer Science, English',
    desc: 'For ICS students entering Software Engineering, CS, AI, Cybersecurity, and Data Science.',
    icon: Layers,
  },
  {
    id: 'Pre-Medical Engineering Conversion Group',
    name: 'Pre-Medical Engineering Group',
    subjects: 'Biology/Math, Physics, Chemistry, English',
    desc: 'For Pre-Medical students appearing in Biomedical Engineering or Biotech programs.',
    icon: Stethoscope,
  },
  {
    id: 'General Science / Statistics Group',
    name: 'General Science / Stats Group',
    subjects: 'Mathematics, Physics, Statistics, English',
    desc: 'For General Science students entering Mathematics, Physics, or Stats engineering tracks.',
    icon: BookOpen,
  },
];

export const StudentRegistrationFlow: React.FC<StudentRegistrationFlowProps> = ({
  user,
  onRegistrationComplete,
  onSignOut,
  onSkipToPractice,
}) => {
  const { logoUrl } = useSiteSettings();

  // Current Step: 1 -> 2 -> 3 -> 4 -> 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // User Contact / Auth info
  const [fullName, setFullName] = useState<string>(
    user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  );
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>('');

  // Step 1: Track Selection
  const [selectedTrack, setSelectedTrack] = useState<'FBISE' | 'MDCAT' | 'TCAT'>('FBISE');
  const [fbiseGrade, setFbiseGrade] = useState<string>('Class 11');
  const [fbiseStream, setFbiseStream] = useState<string>('Pre-Engineering');
  const [tcatGroup, setTcatGroup] = useState<string>('Pre-Engineering Group');

  // Step 2: Dream University
  const [dreamUniversity, setDreamUniversity] = useState<string>('');
  const [customUniversity, setCustomUniversity] = useState<string>('');

  // Step 3: Welcome Email Trigger State
  const [welcomeEmailSent, setWelcomeEmailSent] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // Step 4: Fee Challan & Payment Info
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Step 5: Payment Proof Submission
  const [selectedMethod, setSelectedMethod] = useState<string>('JazzCash');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Sync user info if props update or session is restored
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
      if (name) setFullName(name);
    } else {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          if (data.user.email) setEmail(data.user.email);
          const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || '';
          if (name) setFullName(name);
        }
      });
    }
  }, [user]);

  // Derive Fee and Plan based on Track Selection
  const getFeePlanDetails = () => {
    if (selectedTrack === 'FBISE') {
      if (fbiseGrade === 'Class 9' || fbiseGrade === 'Class 10') {
        return {
          planTitle: 'FBISE Matric Access (Class 9th & 10th)',
          fee: '499',
          features: [
            'Full 9th & 10th FBISE MCQ Bank',
            'Chapter-wise Practice & Past Papers',
            'AI Performance Analytics',
          ],
        };
      }
      return {
        planTitle: 'FBISE FSc Access (Class 11th & 12th)',
        fee: '999',
        features: [
          'Full 11th & 12th Pre-Med / Pre-Eng / ICS Bank',
          'Past Papers & Board Exam Simulations',
          'Detailed Step-by-Step Solutions',
        ],
      };
    }
    if (selectedTrack === 'MDCAT') {
      return {
        planTitle: 'PMDC MDCAT Entrance Prep Session',
        fee: '1,499',
        features: [
          'Complete PMDC MDCAT Subject Mock Bank',
          'Biology, Chemistry, Physics, Logical Reasoning',
          'Full-Length Timed Test Generator',
        ],
      };
    }
    // TCAT
    return {
      planTitle: `UET Taxila TCAT Prep (${tcatGroup})`,
      fee: '1,499',
      features: [
        `Group-Specific TCAT Question Bank (${tcatGroup})`,
        'Formula Sheets & Quick Numerical Practice',
        'UET Taxila Standard Full-Length Mocks',
      ],
    };
  };

  const planDetails = getFeePlanDetails();

  // Handle Copy text helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Step 1 -> Step 2 Validation & Proceed
  const handleProceedFromStep1 = async () => {
    setError(null);

    let activeUser = user;
    if (!activeUser) {
      const { data } = await supabase.auth.getUser();
      activeUser = data?.user || null;
    }

    const resolvedEmail = email || activeUser?.email || '';
    const resolvedName = fullName || activeUser?.user_metadata?.full_name || activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'Student';

    if (!resolvedEmail) {
      setError('No active session found. Please sign in with Google to continue.');
      return;
    }

    setEmail(resolvedEmail);
    setFullName(resolvedName);
    setCurrentStep(2);
  };

  // Step 2 -> Step 3 Trigger Email & Proceed
  const handleProceedFromStep2 = async () => {
    setError(null);
    const chosenUni = dreamUniversity === 'Other' ? customUniversity : dreamUniversity;
    if (!chosenUni.trim()) {
      setError('Please select or specify your dream university/college.');
      return;
    }

    // Trigger welcome email dispatch to backend
    setIsSendingEmail(true);
    setCurrentStep(3);

    const trackLabel =
      selectedTrack === 'FBISE'
        ? `FBISE (${fbiseGrade} - ${fbiseStream})`
        : selectedTrack === 'MDCAT'
        ? 'PMDC MDCAT Entrance Prep'
        : `UET Taxila TCAT (${tcatGroup})`;

    try {
      await fetch('/api/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim(),
          email: email.trim(),
          selectedTrack: trackLabel,
          dreamUniversity: chosenUni,
        }),
      });
      setWelcomeEmailSent(true);
    } catch (err) {
      console.warn('Welcome email trigger exception:', err);
      // Still allow student to proceed smoothly
      setWelcomeEmailSent(true);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Handle File upload
  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please select a valid image screenshot (PNG, JPG, WEBP) or PDF.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size must be under 15MB.');
      return;
    }
    setError(null);
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Final Payment Proof Submission (Step 5)
  const handleSubmitPaymentProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!transactionRef.trim()) {
      setError('Please enter your Transaction Reference ID / TRX Number.');
      return;
    }

    setIsSubmitting(true);

    const chosenUni = dreamUniversity === 'Other' ? customUniversity : dreamUniversity;
    const gradeVal =
      selectedTrack === 'FBISE'
        ? fbiseGrade
        : selectedTrack === 'MDCAT'
        ? 'MDCAT Prep'
        : 'TCAT Prep';
    const streamVal =
      selectedTrack === 'FBISE'
        ? fbiseStream
        : selectedTrack === 'MDCAT'
        ? 'PMDC Medical Entry Test'
        : tcatGroup;

    const trackText =
      selectedTrack === 'FBISE'
        ? `FBISE ${fbiseGrade} (${fbiseStream})`
        : selectedTrack === 'MDCAT'
        ? 'PMDC MDCAT Entrance'
        : `UET Taxila TCAT (${tcatGroup})`;

    try {
      // 1. Get current authenticated user ID
      let activeUser = user;
      if (!activeUser) {
        const { data: authData } = await supabase.auth.getUser();
        activeUser = authData?.user || null;
      }

      const userId = activeUser?.id || `anon-${Date.now()}`;
      const activeName = fullName || activeUser?.user_metadata?.full_name || activeUser?.user_metadata?.name || activeUser?.email?.split('@')[0] || 'Student';
      const activeEmail = email || activeUser?.email || '';

      // 2. Submit Payment Request details to backend
      const res = await fetch('/api/payment-requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: userId,
          student_name: fullName.trim(),
          student_email: email.trim(),
          payment_method: selectedMethod,
          amount: planDetails.fee.replace(',', ''),
          transaction_reference: transactionRef.trim(),
          course_tier: trackText,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to submit payment details.');
      }

      // 3. Save / Update student profile in Supabase
      const savedProfile = await saveStudentRegistration(userId, {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        grade: gradeVal,
        stream: streamVal,
        dream_university: chosenUni,
        payment_status: 'Pending Verification',
        payment_method: selectedMethod,
        transaction_reference: transactionRef.trim(),
        drive_file_id: 'whatsapp-submission',
        drive_file_url: 'WhatsApp Submission (+923222314436)',
      });

      // 3. Open WhatsApp with pre-filled details
      const whatsappMsg = `Hi, here's my payment proof.\nName: ${fullName.trim()}\nEmail: ${email.trim()}\nTrack: ${trackText}\nTransaction ID: ${transactionRef.trim()}\nAccount Paid To: ${selectedMethod}\nScreenshot attached.`;
      const waUrl = `https://wa.me/923222314436?text=${encodeURIComponent(whatsappMsg)}`;

      try {
        window.open(waUrl, '_blank');
      } catch (e) {
        console.warn('Could not auto-open WhatsApp link:', e);
      }

      setIsSuccess(true);
      if (savedProfile) {
        onRegistrationComplete(savedProfile);
      }
    } catch (err: any) {
      console.error('Registration/Payment Submission Error:', err);
      setError(err?.message || 'Failed to complete registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      {/* Header Banner */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Student Registration Flow</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Join Scholario Exam Portal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Complete your track selection, set your target university, and unlock full prep materials.
        </p>
      </div>

      {/* Progress Bar (Steps 1 to 5) */}
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between relative z-10 mb-2">
          {[
            { step: 1, label: 'Track' },
            { step: 2, label: 'Target University' },
            { step: 3, label: 'Welcome' },
            { step: 4, label: 'Challan' },
            { step: 5, label: 'Submit Proof' },
          ].map((s) => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.step} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs transition-all duration-300 ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-md'
                      : isCurrent
                      ? 'bg-[#F2B90C] text-[#0A0A0A] ring-4 ring-[#F2B90C]/20 shadow-lg font-black'
                      : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                </div>
                <span
                  className={`text-[10px] font-bold mt-1 hidden sm:block ${
                    isCurrent
                      ? 'text-[#F2B90C]'
                      : isDone
                      ? 'text-emerald-500'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F2B90C] to-emerald-500 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: Class / Track Selection */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6"
        >
          <div className="border-b border-slate-100 dark:border-white/10 pb-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
              Step 1 of 5
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Select Your Class or Exam Track
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Choose your curriculum target so we can customize your question bank and practice tests.
            </p>
          </div>

          {/* User Account Info Card & Optional Phone */}
          <div className="space-y-3 bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Account Verified via Google</span>
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Logged In
              </span>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-[#141414] p-3 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F2B90C] to-amber-600 text-white flex items-center justify-center shrink-0 font-black text-sm shadow-xs">
                {(fullName || email || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                  {fullName || 'Student User'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {email || 'Verified Google Account'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                WhatsApp / Mobile Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="w-full bg-white dark:bg-[#141414] border border-slate-300 dark:border-white/15 focus:border-[#F2B90C] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {/* Main Track Tabs */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
              Select Exam Category <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* FBISE */}
              <button
                type="button"
                onClick={() => setSelectedTrack('FBISE')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTrack === 'FBISE'
                    ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white ring-2 ring-amber-500/30'
                    : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="w-5 h-5 text-amber-500" />
                  {selectedTrack === 'FBISE' && (
                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-xs">FBISE Board</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Classes 9th, 10th, 11th & 12th
                  </div>
                </div>
              </button>

              {/* PMDC MDCAT */}
              <button
                type="button"
                onClick={() => setSelectedTrack('MDCAT')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTrack === 'MDCAT'
                    ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Stethoscope className="w-5 h-5 text-emerald-500" />
                  {selectedTrack === 'MDCAT' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-xs">PMDC MDCAT</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Medical College Entrance Test
                  </div>
                </div>
              </button>

              {/* UET Taxila TCAT */}
              <button
                type="button"
                onClick={() => setSelectedTrack('TCAT')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTrack === 'TCAT'
                    ? 'bg-blue-500/10 border-blue-500 text-slate-900 dark:text-white ring-2 ring-blue-500/30'
                    : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Cpu className="w-5 h-5 text-blue-500" />
                  {selectedTrack === 'TCAT' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div>
                  <div className="font-extrabold text-xs">UET Taxila TCAT</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Engineering Entry Test (By Group)
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Track Sub-Options */}
          {selectedTrack === 'FBISE' && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Class Grade
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Class 9', 'Class 10', 'Class 11', 'Class 12'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFbiseGrade(g)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        fbiseGrade === g
                          ? 'bg-amber-500 text-black border-amber-500 font-black shadow-sm'
                          : 'bg-slate-100 dark:bg-zinc-800 border-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Academic Stream
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Pre-Medical',
                    'Pre-Engineering',
                    'Computer Science (ICS)',
                    'General Science / Humanities',
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFbiseStream(st)}
                      className={`py-2 px-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                        fbiseStream === st
                          ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-extrabold'
                          : 'bg-slate-100 dark:bg-zinc-800 border-transparent text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTrack === 'TCAT' && (
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200">
                  Select TCAT Subject Group <span className="text-amber-500">*</span>
                </label>
                <span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                  Subjects differ by group
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TCAT_GROUPS.map((grp) => {
                  const Icon = grp.icon;
                  const isSel = tcatGroup === grp.id;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setTcatGroup(grp.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? 'bg-blue-500/15 border-blue-500 text-slate-900 dark:text-white ring-2 ring-blue-500/20'
                          : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs flex items-center gap-1.5">
                          <Icon className="w-4 h-4 text-blue-500" />
                          <span>{grp.name}</span>
                        </span>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />}
                      </div>
                      <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {grp.subjects}
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                        {grp.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTrack === 'MDCAT' && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-emerald-500" />
                <span>PMDC Medical Entrance Test Track</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-emerald-200/80">
                Covers Biology, Chemistry, Physics, English, and Logical Reasoning according to the latest PMDC MDCAT syllabus.
              </p>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleProceedFromStep1}
            className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3.5 px-6 rounded-full transition-all cursor-pointer text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <span>Proceed to Step 2: Dream University Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Dream University/College Selection */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6"
        >
          <div className="border-b border-slate-100 dark:border-white/10 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                Step 2 of 5
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Select Your Target University
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Which target university are you aiming to join?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* List of relevant colleges */}
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {(selectedTrack === 'MDCAT'
              ? MDCAT_COLLEGES
              : selectedTrack === 'TCAT'
              ? TCAT_UNIVERSITIES
              : FBISE_INSTITUTIONS
            ).map((uni) => {
              const isSelected = dreamUniversity === uni;
              return (
                <button
                  key={uni}
                  type="button"
                  onClick={() => {
                    setDreamUniversity(uni);
                    if (uni !== 'Other Medical College / University' && uni !== 'Other Engineering University' && uni !== 'Other College / School') {
                      setCustomUniversity('');
                    }
                  }}
                  className={`w-full p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-slate-900 dark:text-white ring-1 ring-amber-500'
                      : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span>{uni}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Custom Input if 'Other' selected */}
          {(dreamUniversity.includes('Other') || dreamUniversity === 'Other') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter Your Specific Institution Name <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={customUniversity}
                onChange={(e) => setCustomUniversity(e.target.value)}
                placeholder="e.g. Ghulam Ishaq Khan Institute (GIKI)"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-white/15 focus:border-[#F2B90C] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3 rounded-full border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 text-xs font-extrabold hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleProceedFromStep2}
              disabled={isSendingEmail}
              className="flex-1 bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3.5 px-6 rounded-full transition-all cursor-pointer text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Welcome Email...</span>
                </>
              ) : (
                <>
                  <span>Confirm Selection & Send Welcome Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Welcome Email & Immediate Access Options */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6"
        >
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-md">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">
                Step 3 of 5 — Welcome Email Dispatched
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Welcome to Scholario!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                We sent a welcome email to <strong className="text-amber-500">{email}</strong> confirming your target track and dream university.
              </p>
            </div>
          </div>

          {/* Verification Timing Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed space-y-1">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Verification Process Notice</span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-amber-200/90">
              Account verification and payment processing may take a short time as our team reviews your submitted details. <strong>However, you don't have to wait!</strong>
            </p>
          </div>

          {/* Two Clear Options */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-200">
              Choose How to Start Right Away:
            </h3>

            {/* Option 1: Start Free Tier */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Option 1: Start Free Tier Immediately</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Access free sample practice tests, daily questions, and core MCQs immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onSkipToPractice) onSkipToPractice();
                  else setCurrentStep(4);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-extrabold transition-all cursor-pointer shrink-0 text-center"
              >
                Start Free Practice
              </button>
            </div>

            {/* Option 2: Join Community */}
            <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>Option 2: Join Student Community</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Connect with peers, get past paper updates, and ask study questions on WhatsApp.
                </p>
              </div>
              <a
                href="https://chat.whatsapp.com/DKA260XqH9f85G2f6n3Y6L"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all cursor-pointer shrink-0 text-center inline-flex items-center justify-center gap-1.5"
              >
                <span>Join WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => setCurrentStep(4)}
            className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3.5 px-6 rounded-full transition-all cursor-pointer text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <span>Proceed to Step 4: Confirm Details & View Challan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: Confirm Details & Show Relevant Challan */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6"
        >
          <div className="border-b border-slate-100 dark:border-white/10 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                Step 4 of 5
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Confirm Details & View Fee Challan
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Review your selections and view the official fee challan for your chosen track.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Selection Summary Box */}
          <div className="bg-slate-50 dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Registration Summary
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Student Name:</span>{' '}
                <strong className="text-slate-900 dark:text-white font-bold">{fullName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Email:</span>{' '}
                <strong className="text-slate-900 dark:text-white font-bold">{email}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Selected Track:</span>{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {selectedTrack === 'FBISE'
                    ? `FBISE ${fbiseGrade} (${fbiseStream})`
                    : selectedTrack === 'MDCAT'
                    ? 'PMDC MDCAT Entrance'
                    : `UET Taxila TCAT (${tcatGroup})`}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Dream Institution:</span>{' '}
                <strong className="text-amber-500 font-bold">
                  {dreamUniversity === 'Other' ? customUniversity : dreamUniversity}
                </strong>
              </div>
            </div>
          </div>

          {/* Single Relevant Fee Challan Card */}
          <div className="bg-gradient-to-br from-slate-900 to-[#141414] text-white p-5 rounded-2xl border-2 border-amber-500/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Official Track Fee Challan
                </span>
                <h3 className="text-base font-black text-white">{planDetails.planTitle}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">One-Time Fee</span>
                <span className="text-xl font-black text-[#F2B90C]">PKR {planDetails.fee}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              {planDetails.features.map((ft, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{ft}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Account Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>Send Payment to Any of These Accounts:</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400">Click number to copy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PAYMENT_ACCOUNTS.map((acc) => (
                <div
                  key={acc.id}
                  className={`p-3 rounded-2xl border ${acc.border} ${acc.bg} space-y-1 relative`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {acc.name}
                    </span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                      {acc.badge}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                        {acc.number}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">
                        Title: {acc.title}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(acc.number, acc.id)}
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 hover:border-amber-500 text-slate-600 dark:text-slate-300 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                    >
                      {copiedId === acc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => setCurrentStep(5)}
            className="w-full bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3.5 px-6 rounded-full transition-all cursor-pointer text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <span>Proceed to Step 5: Submit Payment Proof</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: Payment Proof Submission */}
      {/* ========================================================================= */}
      {currentStep === 5 && !isSuccess && (
        <form
          onSubmit={handleSubmitPaymentProof}
          className="bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6"
        >
          <div className="border-b border-slate-100 dark:border-white/10 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">
                Step 5 of 5
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Send Payment Proof on WhatsApp
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your transaction ID below, then tap the button to automatically open WhatsApp (+923222314436) and attach your payment screenshot.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Payment Account Sent To Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Which Account Did You Send Payment To? <span className="text-amber-500">*</span>
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-white/15 focus:border-[#F2B90C] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
            >
              <option value="JazzCash">JazzCash (+92 305 8969050 — Haseena Bibi)</option>
              <option value="SadaPay">SadaPay (+92 349 0744686 — Raheela Ferdous)</option>
              <option value="NayaPay">NayaPay (+92 349 0744686 — Raheela Ferdous)</option>
              <option value="Easypaisa">Easypaisa (+92 333 5292094 — Sadia Fatima)</option>
              <option value="Bank Transfer">Bank Transfer / Online Banking</option>
            </select>
          </div>

          {/* Transaction ID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Transaction ID / Reference Number <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              required
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. 1234567890 or TRX-87654"
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-white/15 focus:border-[#F2B90C] rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white outline-none font-mono"
            />
          </div>

          {/* WhatsApp Instructions Box */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2 text-emerald-800 dark:text-emerald-200">
            <div className="font-extrabold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <MessageSquare className="w-4 h-4 text-emerald-500" />
              <span>How WhatsApp Verification Works:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
              <li>Tap the green button below to save your details.</li>
              <li>WhatsApp will open with a pre-filled message for <strong>+923222314436</strong> containing your name, email, and transaction ID.</li>
              <li>Attach your payment screenshot inside WhatsApp and send the message.</li>
            </ol>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#25D366] hover:bg-[#1eae50] text-white font-black py-3.5 px-6 rounded-full transition-all cursor-pointer text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving details & opening WhatsApp...</span>
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Send Payment Proof on WhatsApp</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SUCCESS CONFIRMATION STATE */}
      {/* ========================================================================= */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-[#1C1C1E] border border-slate-200/80 dark:border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              Registration Saved & WhatsApp Direct Verification
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              You are All Set, {fullName}!
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              Your payment reference <strong>{transactionRef}</strong> has been saved. If WhatsApp did not open automatically, tap below to send your payment proof screenshot to <strong>+923222314436</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 text-left text-xs space-y-2 border border-slate-200 dark:border-white/10">
            <div className="font-extrabold text-slate-800 dark:text-slate-200">
              Registration Summary:
            </div>
            <div className="text-slate-600 dark:text-slate-400 space-y-1 text-[11px]">
              <div>• Track: {selectedTrack === 'FBISE' ? `FBISE ${fbiseGrade}` : selectedTrack === 'MDCAT' ? 'MDCAT' : `TCAT (${tcatGroup})`}</div>
              <div>• Dream Institution: {dreamUniversity === 'Other' ? customUniversity : dreamUniversity}</div>
              <div>• Transaction Reference: <span className="font-mono font-bold text-amber-500">{transactionRef}</span></div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href={`https://wa.me/923222314436?text=${encodeURIComponent(
                `Hi, here's my payment proof.\nName: ${fullName.trim()}\nEmail: ${email.trim()}\nTransaction ID: ${transactionRef.trim()}\nScreenshot attached.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#1eae50] text-white font-black py-3.5 px-5 rounded-full text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open WhatsApp to Attach Payment Screenshot</span>
            </a>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onSkipToPractice) onSkipToPractice();
                }}
                className="flex-1 bg-[#F2B90C] hover:bg-[#d9a50a] text-[#0A0A0A] font-black py-3 px-5 rounded-full text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Start Free Practice Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="https://chat.whatsapp.com/DKA260XqH9f85G2f6n3Y6L"
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-5 rounded-full text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                <span>Join Student Community Group</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StudentRegistrationFlow;
