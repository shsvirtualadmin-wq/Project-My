import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudyBuddyFormattedMessage } from './StudyBuddyFormattedMessage';
import {
  History,
  Users,
  Sparkles,
  GraduationCap,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Target,
  Bot,
  Shield,
  ShieldCheck,
  Lock,
  FileText,
  Quote,
  Heart,
  Award,
  Star,
  CreditCard,
  Eye,
  Trash2,
  HelpCircle,
  X,
  Zap,
  Globe,
  Sun,
  Moon,
  ChevronUp,
  ChevronDown,
  Menu,
  Check,
  BarChart3,
  Building2,
  DollarSign,
  Brain,
  MessageCircle,
} from 'lucide-react';
import { fetchStudentCountFromSupabase } from '../lib/supabase';
import { InstitutionBadge, INSTITUTIONS } from './InstitutionBadge';
import { useTheme } from '../context/ThemeContext';

interface IntroScreenProps {
  onContinue: () => void;
  onOpenCommunity: () => void;
  onOpenHistory: () => void;
  onOpenLmsPortal: () => void;
  onOpenStudyBuddy?: () => void;
  historyCount: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: (newTheme: 'light' | 'dark') => void;
  onSelectGradesFlow?: () => void;
  onSelectMdcat?: () => void;
  onSelectTcat?: () => void;
}

// ---------------------------------------------------------------------------
// High-Performance Motion Animation Components
// ---------------------------------------------------------------------------

const ScrollFadeInCard: React.FC<{
  children: React.ReactNode;
  delayIndex?: number;
  className?: string;
}> = ({ children, delayIndex = 0, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.35,
        delay: Math.min(delayIndex * 0.04, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{ willChange: 'transform, opacity' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const AnimatedStatCard: React.FC<{
  targetValue: number;
  formatFn: (val: number) => string;
  label: string;
}> = ({ targetValue, formatFn, label }) => {
  const [currentVal, setCurrentVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const localObs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          localObs.disconnect();

          const duration = 1000;
          const startTime = performance.now();

          const animate = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrentVal(Math.floor(eased * targetValue));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCurrentVal(targetValue);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    localObs.observe(el);

    const safetyTimer = setTimeout(() => {
      if (!hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        setCurrentVal(targetValue);
        localObs.disconnect();
      }
    }, 1200);

    return () => {
      clearTimeout(safetyTimer);
      localObs.disconnect();
    };
  }, [targetValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.94, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      style={{ willChange: 'transform, opacity' }}
      className="bg-slate-50/80 dark:bg-white/[0.04] border border-dashed border-slate-300 dark:border-white/15 rounded-2xl p-3.5 text-center relative overflow-hidden group hover:border-[#F2B90C]/80 hover:shadow-lg hover:shadow-[#F2B90C]/10 transition-colors cursor-default"
    >
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-[#141414] border-r border-slate-300 dark:border-white/10" />
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white dark:bg-[#141414] border-l border-slate-300 dark:border-white/10" />
      <span className="font-['Space_Grotesk'] font-black text-xl sm:text-2xl text-[#F2B90C] block leading-tight">
        {formatFn(currentVal)}
      </span>
      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
        {label}
      </span>
    </motion.div>
  );
};

const AnimatedTableRow: React.FC<{
  children: React.ReactNode;
  delayIndex: number;
}> = ({ children, delayIndex }) => {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.35,
        delay: Math.min(delayIndex * 0.04, 0.2),
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ willChange: 'transform, opacity' }}
      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
    >
      {children}
    </motion.tr>
  );
};

const TypewriterChatPreview: React.FC<{ fullText: string }> = React.memo(({ fullText }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    const words = fullText.split(/(\s+)/);
    let wordIndex = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsTyping(true);

          const step = (timestamp: number) => {
            if (!lastTime) lastTime = timestamp;
            const elapsed = timestamp - lastTime;

            if (elapsed > 22) {
              lastTime = timestamp;
              wordIndex = Math.min(wordIndex + 2, words.length);
              setDisplayedText(words.slice(0, wordIndex).join(''));

              if (wordIndex >= words.length) {
                setDisplayedText(fullText);
                setIsTyping(false);
                return;
              }
            }
            animationFrameId = requestAnimationFrame(step);
          };

          animationFrameId = requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [fullText]);

  return (
    <div ref={ref} className="relative">
      <StudyBuddyFormattedMessage content={displayedText} />
      {isTyping && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          style={{ willChange: 'opacity' }}
          className="inline-block w-2 h-4 bg-[#F2B90C] ml-1 align-middle rounded-xs shadow-xs shadow-[#F2B90C]"
        />
      )}
    </div>
  );
});

const CarouselLogoItem: React.FC<{ inst: any }> = ({ inst }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-start shrink-0 w-28 sm:w-32 md:w-36 group/item cursor-pointer transition-transform duration-300 hover:-translate-y-1.5">
      <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white dark:bg-[#1A2332] border-2 border-slate-200/90 dark:border-amber-500/20 p-3.5 sm:p-4 md:p-5 flex items-center justify-center shadow-md dark:shadow-black/50 group-hover/item:border-[#F2B90C] group-hover/item:shadow-xl group-hover/item:shadow-[#F2B90C]/20 group-hover/item:scale-105 transition-all duration-300 overflow-hidden relative">
        {inst.logoUrl && !imgFailed ? (
          <img
            src={inst.logoUrl}
            alt={`${inst.name} Logo`}
            className="w-full h-full object-contain filter drop-shadow-xs"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${inst.bgGradient || 'from-slate-800 to-slate-900'} flex items-center justify-center border border-white/20 shadow-inner p-1`}>
            <span className={`font-black text-xs sm:text-sm md:text-base ${inst.textColor || 'text-amber-400'} text-center`}>
              {inst.badgeInitials || inst.shortName}
            </span>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs sm:text-sm font-extrabold text-center text-slate-800 dark:text-slate-200 group-hover/item:text-[#F2B90C] transition-colors leading-tight line-clamp-2 px-1">
        {inst.shortName || inst.name}
      </p>
    </div>
  );
};

const CardLogoImage: React.FC<{ src: string; alt: string; fallbackText: string; bgClass: string; textClass: string }> = ({
  src,
  alt,
  fallbackText,
  bgClass,
  textClass,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`w-full h-full ${bgClass} flex items-center justify-center rounded-lg font-black text-xs ${textClass}`}>
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain p-0.5"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
};

// 9 Testimonials Dataset
interface Testimonial {
  id: string;
  name: string;
  role: string;
  cityBoard: string;
  track: 'FBISE' | 'MDCAT' | 'TCAT';
  outcome: string;
  avatarBg: string;
  avatarText: string;
  rating: number;
  quote: string;
}

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: '1',
    name: 'Ayesha Malik',
    role: 'Pre-Medical Student',
    cityBoard: 'FBISE HSSC-II, Islamabad',
    track: 'FBISE',
    outcome: 'Scored 1070 / 1100 (97.2%)',
    avatarBg: 'bg-[#F2B90C]/20 border-[#F2B90C]/40 text-amber-900 dark:text-[#F2B90C]',
    avatarText: 'AM',
    rating: 5,
    quote:
      'The chapter-wise MCQ practice with instant Study Buddy step-by-step explanations helped me pinpoint my exact weak concepts in Organic Chemistry before the board finals.',
  },
  {
    id: '2',
    name: 'Muhammad Hamza',
    role: 'MDCAT Medical Aspirant',
    cityBoard: 'PMC MDCAT, Rawalpindi',
    track: 'MDCAT',
    outcome: 'Admitted to Rawalpindi Medical University',
    avatarBg: 'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300',
    avatarText: 'MH',
    rating: 5,
    quote:
      'Practicing high-yield Biology and Physics MCQs daily on Boardly gave me the speed and accuracy required for the 200-question MDCAT exam without paying 60,000 PKR for coaching academies.',
  },
  {
    id: '3',
    name: 'Zainab Shah',
    role: 'Engineering Candidate',
    cityBoard: 'TCAT, UET Taxila',
    track: 'TCAT',
    outcome: 'Top 50 Merit Rank (368 / 400)',
    avatarBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300',
    avatarText: 'ZS',
    rating: 5,
    quote:
      'The 100-MCQ timed mock tests with 400 marks scoring mirrored the actual UET Taxila entrance exam pattern perfectly. I went in completely confident on test day.',
  },
  {
    id: '4',
    name: 'Saad Chaudhry',
    role: 'Science Stream Student',
    cityBoard: 'FBISE SSC-II, Lahore',
    track: 'FBISE',
    outcome: '98% in Physics & Math',
    avatarBg: 'bg-[#F2B90C]/20 border-[#F2B90C]/40 text-amber-900 dark:text-[#F2B90C]',
    avatarText: 'SC',
    rating: 5,
    quote:
      'Boardly’s SLO-aligned question bank matched FBISE board paper SLO guidelines line by line. Solved 1,200+ MCQs before my physics exam.',
  },
  {
    id: '5',
    name: 'Fatima Zahra',
    role: 'Medical Aspirant',
    cityBoard: 'Khyber Medical University, Peshawar',
    track: 'MDCAT',
    outcome: 'Scored 186 / 200 in MDCAT',
    avatarBg: 'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300',
    avatarText: 'FZ',
    rating: 5,
    quote:
      'The Biology memory tricks and Physics numerical step derivations provided by Study Buddy AI saved hours of manual textbook hunting.',
  },
  {
    id: '6',
    name: 'Bilal Ahmed',
    role: 'Computer Science Group',
    cityBoard: 'UET Entry Test, Gujranwala',
    track: 'TCAT',
    outcome: 'Scored 364 / 400 Marks',
    avatarBg: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300',
    avatarText: 'BA',
    rating: 5,
    quote:
      'The CS and Math combinations in Boardly TCAT portal allowed me to practice negative marking conditions safely. Highly recommended!',
  },
  {
    id: '7',
    name: 'Maryam Nawaz',
    role: 'Pre-Engineering Student',
    cityBoard: 'FBISE HSSC-I, Multan',
    track: 'FBISE',
    outcome: 'Scored 485 / 520 in Part-1',
    avatarBg: 'bg-[#F2B90C]/20 border-[#F2B90C]/40 text-amber-900 dark:text-[#F2B90C]',
    avatarText: 'MN',
    rating: 5,
    quote:
      'The instant feedback loop on incorrect options helped me rectify conceptual mistakes in Integration and Vectors before college midterms.',
  },
  {
    id: '8',
    name: 'Usama Khan',
    role: 'MDCAT Candidate',
    cityBoard: 'Bolan Medical College, Quetta',
    track: 'MDCAT',
    outcome: 'BMC Open Merit Seat Secured',
    avatarBg: 'bg-rose-500/20 border-rose-500/40 text-rose-700 dark:text-rose-300',
    avatarText: 'UK',
    rating: 5,
    quote:
      'As a student from Balochistan with limited access to expensive academies, Boardly gave me world-class AI test prep completely free of cost.',
  },
  {
    id: '9',
    name: 'Mahnoor Raza',
    role: 'Matric Science Student',
    cityBoard: 'FBISE Class 9, Faisalabad',
    track: 'FBISE',
    outcome: 'FBISE Board Position Holder',
    avatarBg: 'bg-[#F2B90C]/20 border-[#F2B90C]/40 text-amber-900 dark:text-[#F2B90C]',
    avatarText: 'MR',
    rating: 5,
    quote:
      'I loved the clean layout and immediate answer breakdowns. Study Buddy feels like having a personal tutor available at 2 AM before exams.',
  },
];

// FAQ Dataset
interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'Is Boardly aligned with the latest FBISE SLO curriculum?',
    answer:
      'Yes, 100%! All question banks for SSC (Classes 9 & 10) and HSSC (Classes 11 & 12) are curated and mapped directly against Federal Board Student Learning Outcomes (SLO) guidelines and textbook topics.',
  },
  {
    question: 'How does the MDCAT Medical test portal work?',
    answer:
      'The MDCAT track covers Biology, Chemistry, Physics, and English mapped to the PMDC / PMC syllabus. You can choose full 200-question mock exams or topic-wise practice modules with instant explanations and score reports.',
  },
  {
    question: 'What is the TCAT / UET Taxila exam format?',
    answer:
      'The Taxila Combined Admission Test (TCAT) engineering mock series replicates the official UET Taxila structure: 100 total MCQs (Mathematics, Physics, Chemistry/CS/Stats, English) for 400 total marks with realistic timer controls.',
  },
  {
    question: 'How does Study Buddy AI explain complex numerical problems?',
    answer:
      'Study Buddy uses custom-trained AI logic to break down mathematical derivations, chemical equations, and physics formulas into simple, numbered step-by-step points — explaining why the correct option is right and why distractors are wrong.',
  },
  {
    question: 'Is Boardly mobile-friendly?',
    answer:
      'Absolutely! Boardly is built mobile-first with responsive layouts, smooth touch interactions, and offline caching support for Android and mobile web browsers.',
  },
  {
    question: 'Are past paper solutions verified by subject teachers?',
    answer:
      'Yes. Our core question keys and AI explanation guidelines are regularly audited by former board position holders and experienced college faculty to ensure zero errors in key answer options.',
  },
  {
    question: 'Is Boardly free for students?',
    answer:
      'Yes! Core chapter practice, full mock tests, past paper analytics, and Study Buddy AI access are completely free for all students. Optional premium features are priced affordably for individual students. Note: All purchases are final — strict no-refunds policy.',
  },
];

export const IntroScreen: React.FC<IntroScreenProps> = React.memo(({
  onContinue,
  onOpenCommunity,
  onOpenHistory,
  onOpenLmsPortal,
  onOpenStudyBuddy,
  historyCount,
  onSelectGradesFlow,
  onSelectMdcat,
  onSelectTcat,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [studentCount, setStudentCount] = useState<number>(1000);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | 'no-refunds' | null>(null);
  const [activeTrackFilter, setActiveTrackFilter] = useState<'ALL' | 'FBISE' | 'MDCAT' | 'TCAT'>('ALL');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetchStudentCountFromSupabase().then((count) => {
      if (isMounted && count > 1000) {
        setStudentCount(count);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle scroll detection for back-to-top button with passive listener & state guard
  useEffect(() => {
    let lastShown = false;
    const handleScroll = () => {
      const isPast = window.scrollY > 250;
      if (isPast !== lastShown) {
        lastShown = isPast;
        setShowScrollTop(isPast);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredTestimonials =
    activeTrackFilter === 'ALL'
      ? TESTIMONIALS_DATA
      : TESTIMONIALS_DATA.filter((t) => t.track === activeTrackFilter);

  return (
    <div className="min-h-screen bg-[#FAF8F4] dark:bg-[#090909] text-[#1A1A1A] dark:text-white transition-colors duration-200 flex flex-col font-sans relative">
      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-12 sm:space-y-16 flex-1 w-full">
        {/* =========================================================================
            SECTION 1: HERO & TICKET-STUB STATS STRIP
           ========================================================================= */}
        <section id="hero" className="space-y-6">
          <div className="bg-white dark:bg-[#141414] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between gap-8 transition-colors duration-200">
            {/* Background Glow Effect with Ambient Looping Float */}
            <motion.div
              animate={{ y: [0, -8, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ willChange: 'transform' }}
              className="absolute -top-10 -right-10 w-96 h-96 bg-[#F2B90C]/[0.08] dark:bg-[#F2B90C]/12 rounded-full blur-3xl pointer-events-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: 'transform, opacity' }}
                className="inline-flex items-center gap-2 bg-[#F2B90C]/15 dark:bg-[#F2B90C]/20 border border-[#F2B90C]/30 text-amber-900 dark:text-[#F2B90C] px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700 dark:text-[#F2B90C]" />
                <span>FBISE & Entrance Exam Academy Platform</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: 'transform, opacity' }}
                className="flex items-center gap-2"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>2026 Session Live</span>
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: 'transform, opacity' }}
              className="space-y-4 relative z-10 max-w-3xl"
            >
              <h1 className="font-['Space_Grotesk'] text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                Master Every Chapter with Intelligent MCQs & AI Explanations
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
                Prepare for SSC & HSSC Federal Board exams, PMDC MDCAT Medical, and UET Taxila TCAT entrance tests with chapter-wise SLO question banks, step-by-step AI reasoning, and performance analytics.
              </p>
            </motion.div>

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  onClick={onSelectGradesFlow || onContinue}
                  className="bg-[#F2B90C] hover:bg-[#E0A800] text-[#0A0A0A] font-extrabold py-4 px-8 rounded-full shadow-md hover:shadow-lg hover:shadow-[#F2B90C]/20 flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer transition-all"
                >
                  <span>Start Practice Test</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  onClick={onOpenLmsPortal}
                  className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white/10 dark:hover:bg-white/20 border border-slate-900 dark:border-white/15 font-bold py-4 px-6 rounded-full flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition-all"
                >
                  <BookOpen className="w-4 h-4 text-[#F2B90C]" />
                  <span>Student LMS Portal</span>
                </motion.button>
              </div>

              {/* Dynamic Trust-Signal Line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                  <span className="inline-flex h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#141414] bg-[#F2B90C] text-[#0A0A0A] font-black text-[10px] items-center justify-center shadow-xs">
                    S
                  </span>
                  <span className="inline-flex h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#141414] bg-slate-800 dark:bg-white/20 text-white font-bold text-[10px] items-center justify-center shadow-xs">
                    M
                  </span>
                  <span className="inline-flex h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#141414] bg-emerald-500 text-white font-bold text-[10px] items-center justify-center shadow-xs">
                    A
                  </span>
                </div>
                <span>
                  Join <strong className="text-slate-900 dark:text-white font-black">{studentCount.toLocaleString()}+</strong> students practicing across Pakistan
                </span>
              </div>

              {/* Ticket-Stub Style Stats Strip */}
              <div className="pt-5 border-t border-slate-200/80 dark:border-white/10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <AnimatedStatCard
                    targetValue={studentCount > 1000 ? studentCount : 12000}
                    formatFn={(v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K+` : `${v}`)}
                    label="Students Practicing"
                  />
                  <AnimatedStatCard
                    targetValue={40000}
                    formatFn={(v) => `${v.toLocaleString()}+`}
                    label="MCQs Explained"
                  />
                  <AnimatedStatCard
                    targetValue={3}
                    formatFn={(v) => `${v} Tracks`}
                    label="FBISE, MDCAT, TCAT"
                  />
                  <AnimatedStatCard
                    targetValue={24}
                    formatFn={(v) => `${v}/7`}
                    label="Study Buddy Uptime"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: SOCIAL PROOF & ACADEMY MENTIONS BAND
           ========================================================================= */}
        <section className="bg-white/80 dark:bg-[#141414]/90 border border-slate-200/80 dark:border-white/10 rounded-3xl p-5 sm:p-7 shadow-sm overflow-hidden space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#F2B90C] inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>Academic Network</span>
            </span>
            <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-700 dark:text-slate-300">
              TRUSTED BY STUDENTS & POSITION-HOLDERS FROM LEADING INSTITUTIONS
            </h2>
          </div>

          {/* Auto-sliding Horizontal Carousel with Gradient Fades at Edges */}
          <div className="relative w-full overflow-hidden py-2 group">
            {/* Left/Right Edge Fades */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-white dark:from-[#141414] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-white dark:from-[#141414] to-transparent z-10 pointer-events-none" />

            {/* Continuous Marquee Track */}
            <div className="animate-continuous-scroll flex gap-6 sm:gap-10 items-start">
              {[
                INSTITUTIONS.apsacs,
                INSTITUTIONS.fgc,
                INSTITUTIONS.opf,
                INSTITUTIONS.kips,
                INSTITUTIONS.pgc,
                INSTITUTIONS.nust,
                INSTITUTIONS.fast,
                INSTITUTIONS.uhs,
                INSTITUTIONS.pmdc,
                INSTITUTIONS.uet,
                INSTITUTIONS.fbise,
                INSTITUTIONS.szabmu,

                INSTITUTIONS.apsacs,
                INSTITUTIONS.fgc,
                INSTITUTIONS.opf,
                INSTITUTIONS.kips,
                INSTITUTIONS.pgc,
                INSTITUTIONS.nust,
                INSTITUTIONS.fast,
                INSTITUTIONS.uhs,
                INSTITUTIONS.pmdc,
                INSTITUTIONS.uet,
                INSTITUTIONS.fbise,
                INSTITUTIONS.szabmu,
              ].filter(Boolean).map((inst, index) => (
                <CarouselLogoItem key={`${inst.id}-${index}`} inst={inst} />
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: HOW IT WORKS
           ========================================================================= */}
        <section id="how-it-works" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#F2B90C]">
                <Target className="w-3.5 h-3.5" />
                <span>3-Step Mastery</span>
              </div>
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                How Boardly Works
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 hidden sm:inline-block">
              Zero Signup Friction &middot; Instant Practice
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ScrollFadeInCard delayIndex={0}>
              <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:border-[#F2B90C]/50 hover:shadow-md transition-all space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#F2B90C]/15 text-[#0A0A0A] dark:text-[#F2B90C] font-black text-sm flex items-center justify-center border border-[#F2B90C]/30">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Select Your Exam Track</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Choose FBISE (Classes 9-12), PMDC MDCAT Medical, or UET Taxila TCAT Engineering test series.
                </p>
              </div>
            </ScrollFadeInCard>

            <ScrollFadeInCard delayIndex={1}>
              <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:border-[#F2B90C]/50 hover:shadow-md transition-all space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#F2B90C]/15 text-[#0A0A0A] dark:text-[#F2B90C] font-black text-sm flex items-center justify-center border border-[#F2B90C]/30">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Practice Chapter MCQs</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Attempt chapter-wise tests with real-time timers, negative marking options, and step-by-step AI derivations.
                </p>
              </div>
            </ScrollFadeInCard>

            <ScrollFadeInCard delayIndex={2}>
              <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:border-[#F2B90C]/50 hover:shadow-md transition-all space-y-3 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#F2B90C]/15 text-[#0A0A0A] dark:text-[#F2B90C] font-black text-sm flex items-center justify-center border border-[#F2B90C]/30">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Analyze & Fix Weak Spots</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Review your topic-wise accuracy breakdown, review flagged errors, and chat 24/7 with Study Buddy AI.
                </p>
              </div>
            </ScrollFadeInCard>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: AVAILABLE TEST TRACKS
           ========================================================================= */}
        <section id="tracks" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 px-1">
            <div>
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Available Test Tracks
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select your board or entrance test track to begin practicing immediately
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Track 1: FBISE */}
            <ScrollFadeInCard delayIndex={0} className="h-full">
              <div
                onClick={onSelectGradesFlow || onContinue}
                className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 hover:border-[#F2B90C] rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer group flex flex-col justify-between gap-6 relative overflow-hidden h-full"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 p-1 flex items-center justify-center border border-emerald-500/30 overflow-hidden shrink-0 shadow-xs">
                      <CardLogoImage src="/logos/fbise.svg" alt="Federal Board (FBISE) Official Logo" fallbackText="FBISE" bgClass="bg-emerald-600" textClass="text-white" />
                    </div>
                    <span className="bg-[#F2B90C]/15 text-amber-900 dark:text-[#F2B90C] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Class 9 – 12
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-['Space_Grotesk'] font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-[#F2B90C] transition-colors break-words min-w-0">
                      Federal Board (FBISE)
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      Complete SSC & HSSC question banks covering Physics, Chemistry, Biology, Mathematics, Computer Science, and English mapped to SLO guidelines.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>SLO Mapped Board Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Past Paper Solutions with Keys</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Chapter-wise Tests</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white dark:bg-white/10 group-hover:bg-[#F2B90C] group-hover:text-[#0A0A0A] font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Select FBISE Class</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollFadeInCard>

            {/* Track 2: MDCAT Medical */}
            <ScrollFadeInCard delayIndex={1} className="h-full">
              <div
                onClick={onSelectMdcat || onSelectGradesFlow || onContinue}
                className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 hover:border-rose-500 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer group flex flex-col justify-between gap-6 relative overflow-hidden h-full"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 p-1 flex items-center justify-center border border-rose-500/30 overflow-hidden shrink-0 shadow-xs">
                      <CardLogoImage src="/logos/pmdc.svg" alt="PMDC MDCAT Official Logo" fallbackText="PMDC" bgClass="bg-rose-700" textClass="text-white" />
                    </div>
                    <span className="bg-rose-500/15 text-rose-700 dark:text-rose-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Post-FSc Entrance
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-['Space_Grotesk'] font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors break-words min-w-0">
                      MDCAT Medical Portal
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      Dedicated PMDC / PMC Medical entrance test prep covering Biology, Organic/Inorganic Chemistry, Physics & English reasoning.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Bio, Chem, Physics & English</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>200-Question Timed Mock Tests</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Memory Tricks & High-Yield Notes</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white dark:bg-white/10 group-hover:bg-rose-600 group-hover:text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <span>Open MDCAT Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollFadeInCard>

            {/* Track 3: TCAT Engineering */}
            <ScrollFadeInCard delayIndex={2} className="h-full">
              <div
                onClick={onSelectTcat || onSelectGradesFlow || onContinue}
                className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 hover:border-cyan-500 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer group flex flex-col justify-between gap-6 relative overflow-hidden h-full"
              >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 p-1 flex items-center justify-center border border-cyan-500/30 overflow-hidden shrink-0 shadow-xs">
                    <CardLogoImage src="/logos/uet.svg" alt="UET Taxila TCAT Official Logo" fallbackText="UET" bgClass="bg-sky-900" textClass="text-cyan-300" />
                  </div>
                  <span className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Post-FSc Engineering
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-['Space_Grotesk'] font-extrabold text-xl text-slate-900 dark:text-[#FAF8F4] group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors break-words min-w-0">
                    TCAT / UET Taxila Series
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    Taxila Combined Admission Test preparation portal featuring FSc group combinations, 100-MCQ full mock tests & 400 total marks scoring.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Math, Physics, CS/Chem & English</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>400 Marks Exam Simulation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-500 shrink-0" />
                    <span>Negative Marking Rules</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white dark:bg-white/10 group-hover:bg-cyan-600 group-hover:text-white font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                <span>Open TCAT Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </ScrollFadeInCard>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: WHY BOARDLY (COMPARISON TABLE / GRID)
           ========================================================================= */}
        <section id="why-boardly" className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#F2B90C]">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Smart Comparison</span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Why Students Choose Boardly Over Traditional Academies
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Compare how Boardly redefines test prep efficiency compared to expensive physical academies and generic question apps.
            </p>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white">
                    <th className="p-4 sm:p-5 font-black text-xs uppercase tracking-wider w-1/3">
                      Feature / Dimension
                    </th>
                    <th className="p-4 sm:p-5 font-black text-xs uppercase tracking-wider text-[#F2B90C] bg-[#F2B90C]/10 dark:bg-[#F2B90C]/15 w-1/3">
                      Boardly Academy Platform
                    </th>
                    <th className="p-4 sm:p-5 font-black text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/3">
                      Physical Coaching Academies
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                  {/* Row 1 */}
                  <AnimatedTableRow delayIndex={0}>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#F2B90C]" />
                      Session Fee
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 bg-[#F2B90C]/5 dark:bg-[#F2B90C]/5">
                      Free Core Access &middot; Low-cost Student Plans
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500 dark:text-slate-400">
                      50,000 to 120,000 PKR per session
                    </td>
                  </AnimatedTableRow>

                  {/* Row 2 */}
                  <AnimatedTableRow delayIndex={1}>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#F2B90C]" />
                      Syllabus Alignment
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-[#F2B90C]/5 dark:bg-[#F2B90C]/5">
                      100% FBISE SLO, PMDC & UET Mapped
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500 dark:text-slate-400">
                      Outdated paper notes & recycled lists
                    </td>
                  </AnimatedTableRow>

                  {/* Row 3 */}
                  <AnimatedTableRow delayIndex={2}>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Brain className="w-4 h-4 text-[#F2B90C]" />
                      Instant AI Tutor
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-[#F2B90C]/5 dark:bg-[#F2B90C]/5">
                      24/7 Study Buddy AI step-by-step reasoning
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500 dark:text-slate-400">
                      Wait for next day’s lecture or TA availability
                    </td>
                  </AnimatedTableRow>

                  {/* Row 4 */}
                  <AnimatedTableRow delayIndex={3}>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#F2B90C]" />
                      Mock Test Simulation
                    </td>
                    <td className="p-4 sm:p-5 font-bold text-slate-900 dark:text-white bg-[#F2B90C]/5 dark:bg-[#F2B90C]/5">
                      Instant scoring, negative marking & weak topic analytics
                    </td>
                    <td className="p-4 sm:p-5 text-slate-500 dark:text-slate-400">
                      Manual paper keys delivered days later
                    </td>
                  </AnimatedTableRow>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 6: STUDY BUDDY AI TUTOR SPOTLIGHT & INTERACTIVE PREVIEW
           ========================================================================= */}
        <section id="study-buddy" className="space-y-6">
          <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#F2B90C]/[0.06] rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Left Column: Copy & Highlights */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-[#F2B90C]/15 text-amber-900 dark:text-[#F2B90C] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-[#F2B90C]/30">
                <Bot className="w-3.5 h-3.5 text-[#F2B90C]" />
                <span>24/7 Personal AI Tutor</span>
              </div>

              <div className="space-y-2">
                <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Meet Study Buddy: Your Instant Concept Solver
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Never get stuck on a difficult numerical or conceptual MCQ again. Study Buddy AI breaks down complex Physics derivations, Organic reaction mechanisms, and Biology memory mnemonics step-by-step.
                </p>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#F2B90C]/20 text-[#0A0A0A] dark:text-[#F2B90C] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Instant step-by-step derivations & formula breakdowns</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#F2B90C]/20 text-[#0A0A0A] dark:text-[#F2B90C] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Tailored explanations aligned with Federal Board & PMC syllabus</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#F2B90C]/20 text-[#0A0A0A] dark:text-[#F2B90C] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Available 24 hours a day, 7 days a week on any device</span>
                </div>
              </div>
            </div>

            {/* Right Column: Simulated Chat Preview Box */}
            <motion.div
              initial={{ opacity: 0, x: 25, scale: 0.98 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              style={{ willChange: 'transform, opacity' }}
              className="bg-slate-50 dark:bg-[#1A1A1A] border border-slate-200 dark:border-white/10 hover:border-[#F2B90C]/50 rounded-2xl p-4 sm:p-5 shadow-inner hover:shadow-xl hover:shadow-[#F2B90C]/10 transition-all space-y-3 font-sans relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-7 h-7 rounded-lg bg-[#F2B90C] text-[#0A0A0A] font-extrabold text-xs flex items-center justify-center shadow-xs"
                  >
                    <Bot className="w-4 h-4" />
                  </motion.div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Study Buddy AI</h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span>Online & Ready</span>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#F2B90C] animate-pulse" />
                  <span>Live Preview</span>
                </span>
              </div>

              {/* Chat Message 1: Student */}
              <div className="flex justify-end">
                <div className="bg-[#F2B90C]/20 text-slate-900 dark:text-slate-100 border border-[#F2B90C]/30 rounded-2xl rounded-tr-xs p-3 text-xs max-w-[85%] font-medium leading-relaxed">
                  Study Buddy, why does the kinetic energy of emitted photoelectrons depend on frequency and not light intensity?
                </div>
              </div>

              {/* Chat Message 2: Study Buddy AI */}
              <div className="flex justify-start">
                <div className="bg-[#111827] border border-amber-500/20 text-slate-100 rounded-2xl rounded-tl-xs p-3.5 text-xs max-w-[92%] shadow-sm leading-relaxed relative overflow-hidden">
                  <TypewriterChatPreview
                    fullText={`**Great question! Let’s break this down via Einstein’s Photoelectric Equation:**

$$K.E._{\\text{max}} = h\\nu - \\Phi$$

* **Frequency ($\\nu$):** Determines the energy per photon ($E = h\\nu$). Higher frequency = higher photon energy = higher electron kinetic energy.
* **Intensity:** Governs the total number of photons hitting the surface per second, increasing emitted electrons, not their kinetic speed!
* **Work Function ($\\Phi$):** Threshold energy needed to eject an electron ($\\Phi = h\\nu_0$).

✓ **FBISE HSSC Physics Chapter 19 SLO Key Point**`}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 7: TESTIMONIALS WITH FILTER TABS (9 CARDS)
           ========================================================================= */}
        <section id="testimonials" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
            <div>
              <div className="inline-flex items-center gap-1 text-amber-500 text-xs font-bold mb-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="text-slate-700 dark:text-slate-300 ml-1">4.9 / 5.0 Rating</span>
              </div>
              <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Student Success Stories
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Verified outcomes from students who aced their board & entry tests using Boardly
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-white/10 p-1 rounded-full text-xs font-bold shrink-0">
              {(['ALL', 'FBISE', 'MDCAT', 'TCAT'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveTrackFilter(filter)}
                  className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    activeTrackFilter === filter
                      ? 'bg-[#F2B90C] text-[#0A0A0A] font-extrabold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* 3x3 Testimonial Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTestimonials.map((item, idx) => (
              <ScrollFadeInCard key={item.id} delayIndex={idx % 3} className="h-full">
                <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-sm hover:border-[#F2B90C]/50 hover:shadow-md transition-all flex flex-col justify-between gap-4 h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {[...Array(item.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                        {item.track}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal italic">
                      “{item.quote}”
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${item.avatarBg} border font-black text-xs flex items-center justify-center shrink-0`}
                      >
                        {item.avatarText}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                          {item.cityBoard}
                        </p>
                      </div>
                    </div>

                    <div className="inline-block bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                      ✓ {item.outcome}
                    </div>
                  </div>
                </div>
              </ScrollFadeInCard>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 8: ABOUT US & ORIGIN STORY
           ========================================================================= */}
        <section id="about" className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#F2B90C]/15 text-amber-900 dark:text-[#F2B90C] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[#F2B90C]/30">
              <Globe className="w-3 h-3 text-[#F2B90C]" />
              <span>Our Mission & Roots</span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Built by Board-Toppers for Pakistan's Students
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: Origin Story */}
            <ScrollFadeInCard delayIndex={0}>
              <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                    <Award className="w-4 h-4 text-[#F2B90C]" />
                    <span>From Late-Night Study Groups to Pakistan's Top AI Platform</span>
                  </div>
                  <p>
                    Boardly started as a humble WhatsApp study group where students across Rawalpindi and Islamabad traded past paper solutions, textbook notes, and high-yield MCQs during late-night exam prep.
                  </p>
                  <p>
                    Seeing how commercial academies charged up to 100,000 PKR for basic test series, our team of former FBISE board toppers and software engineers built Boardly — giving every student equal access to chapter-wise question banks and instant AI concept explanations.
                  </p>
                </div>
              </div>
            </ScrollFadeInCard>

            {/* Right: Core Values */}
            <div className="space-y-3">
              <ScrollFadeInCard delayIndex={1}>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F2B90C]/15 text-[#0A0A0A] dark:text-[#F2B90C] font-black text-xs flex items-center justify-center shrink-0 border border-[#F2B90C]/30 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#F2B90C]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Syllabus-Accuracy over Generic Content
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      Every MCQ is mapped directly to Student Learning Outcomes (SLOs), textbook chapters, and exact exam guidelines for FBISE, PMDC MDCAT, and UET Taxila.
                    </p>
                  </div>
                </div>
              </ScrollFadeInCard>

              <ScrollFadeInCard delayIndex={2}>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F2B90C]/15 text-[#0A0A0A] dark:text-[#F2B90C] font-black text-xs flex items-center justify-center shrink-0 border border-[#F2B90C]/30 mt-0.5">
                    <Zap className="w-4 h-4 text-[#F2B90C]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Explanation-First over Answer-Keys
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      We don't just show correct options. Every question features step-by-step reasoning, formula derivations, and 24/7 AI Study Buddy chat guidance.
                    </p>
                  </div>
                </div>
              </ScrollFadeInCard>

              <ScrollFadeInCard delayIndex={3}>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F2B90C]/15 text-[#0A0A0A] dark:text-[#F2B90C] font-black text-xs flex items-center justify-center shrink-0 border border-[#F2B90C]/30 mt-0.5">
                    <Heart className="w-4 h-4 text-[#F2B90C]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Priced for Students, Not Academies
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                      Top-grade test prep shouldn't cost 50,000 PKR. Boardly provides full features, mock tests, and past paper analytics completely free or on accessible student plans. All purchases are final — strict no-refunds policy.
                    </p>
                  </div>
                </div>
              </ScrollFadeInCard>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 9: FAQ ACCORDION
           ========================================================================= */}
        <section id="faq" className="space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#F2B90C]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Everything you need to know about Boardly question banks, Study Buddy AI, and mock series.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.35, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  style={{ willChange: 'transform, opacity' }}
                  className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 hover:border-[#F2B90C]/50 rounded-2xl overflow-hidden transition-colors shadow-xs"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-xs sm:text-sm cursor-pointer hover:text-[#F2B90C] transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#F2B90C] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="px-4 sm:px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3 font-normal overflow-hidden"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            SECTION 10: PRIVACY & TRUST
           ========================================================================= */}
        <section id="privacy" className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
              <Shield className="w-3 h-3 text-emerald-500" />
              <span>Privacy & Data Protection</span>
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Your Trust & Data Security First
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              We adhere to strict data privacy principles to protect student identities and study records.
            </p>
          </div>

          {/* 4-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScrollFadeInCard delayIndex={0}>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 hover:border-emerald-500/40 space-y-2 h-full transition-all">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Eye className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">What We Collect</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Minimal account details (Name, Class, Track, Email/Phone) required purely to sync quiz history, Study Buddy conversations, and performance logs across devices.
                </p>
              </div>
            </ScrollFadeInCard>

            <ScrollFadeInCard delayIndex={1}>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 hover:border-rose-500/40 space-y-2 h-full transition-all">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">What We Never Do</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  We never sell your personal data, track background device activity, or share your contact information with commercial third-party telemarketers or advertisers.
                </p>
              </div>
            </ScrollFadeInCard>

            <ScrollFadeInCard delayIndex={2}>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 hover:border-[#F2B90C]/40 space-y-2 h-full transition-all">
                <div className="w-8 h-8 rounded-lg bg-[#F2B90C]/15 text-[#0A0A0A] dark:text-[#F2B90C] border border-[#F2B90C]/30 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-[#F2B90C]" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">User Data Control</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  You retain full ownership of your data. Request instant account wipes or progress erasures anytime directly from your profile settings or support.
                </p>
              </div>
            </ScrollFadeInCard>

            <ScrollFadeInCard delayIndex={3}>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 hover:border-cyan-500/40 space-y-2 h-full transition-all">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Transparent Payments & No Refunds</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  Payment transfers for optional premium unlocks are logged securely with verified admin receipts. All purchases are final — strict no-refunds policy once payment is submitted.
                </p>
              </div>
            </ScrollFadeInCard>
          </div>

          {/* Links to Legal Policies */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-white/5 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveLegalModal('privacy')}
              className="hover:text-[#F2B90C] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>Privacy Policy</span>
            </button>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <button
              onClick={() => setActiveLegalModal('terms')}
              className="hover:text-[#F2B90C] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>Terms of Service</span>
            </button>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <button
              onClick={() => setActiveLegalModal('no-refunds')}
              className="hover:text-[#F2B90C] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>No Refunds Policy</span>
            </button>
          </div>
        </section>

        {/* =========================================================================
            SECTION 11: FINAL CTA BAND
           ========================================================================= */}
        <section className="bg-gradient-to-r from-slate-900 via-[#1A1A1A] to-slate-900 dark:from-[#141414] dark:via-[#1c1c1c] dark:to-[#141414] border border-amber-500/30 dark:border-[#F2B90C]/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F2B90C]/[0.1] rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/[0.04] to-transparent pointer-events-none animate-shimmer" />

          <div className="space-y-3 relative z-10 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#F2B90C]/20 border border-[#F2B90C]/40 text-[#F2B90C] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>Start Free Today</span>
            </div>

            <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Ready to Ace Your Board & Entrance Exams?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm font-normal leading-relaxed">
              Access chapter-wise MCQs, instant AI explanations, 24/7 Study Buddy tutoring, and full past paper model series completely free.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onSelectGradesFlow || onContinue}
              className="w-full sm:w-auto bg-[#F2B90C] hover:bg-[#E0A800] text-[#0A0A0A] font-black py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#F2B90C]/30 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer group"
            >
              <span>Join 12,000+ Students Free</span>
              <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
            </button>

            <a
              href="https://chat.whatsapp.com/L3EYfjDXFNOGTzZjAjRuvg?s=cl&p=a&ilr=1"
              target="_blank"
              rel="noreferrer"
              onClick={() => onOpenCommunity && onOpenCommunity()}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold py-4 px-6 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>

          <div className="relative z-10 pt-1 text-[11px] sm:text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#F2B90C] shrink-0" />
            <span>All purchases are final — no refunds.</span>
          </div>
        </section>

        {/* =========================================================================
            SECTION 12: PROFESSIONAL SITEMAP FOOTER
           ========================================================================= */}
        <footer className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
            {/* Column 1: Brand Blurb */}
            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0A0A0A] border border-[#F2B90C]/40 p-0.5 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                  <img
                    src="/logo.svg"
                    alt="Boardly Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/boardly-logo.svg';
                    }}
                  />
                </div>
                <span
                  className="text-base font-black tracking-tight text-slate-900 dark:text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  BOARDLY
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                Pakistan's premier intelligent MCQ practice platform for FBISE SSC & HSSC, PMDC MDCAT Medical, and UET Taxila TCAT entrance exams.
              </p>
            </div>

            {/* Column 2: Product Links */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Product Tracks
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                <li>
                  <button
                    onClick={onSelectGradesFlow || onContinue}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    FBISE Class 9 – 12 MCQs
                  </button>
                </li>
                <li>
                  <button
                    onClick={onSelectMdcat || onContinue}
                    className="hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    MDCAT Medical Portal
                  </button>
                </li>
                <li>
                  <button
                    onClick={onSelectTcat || onContinue}
                    className="hover:text-cyan-500 transition-colors cursor-pointer"
                  >
                    TCAT / UET Taxila Series
                  </button>
                </li>
                <li>
                  {onOpenStudyBuddy && (
                    <button
                      onClick={onOpenStudyBuddy}
                      className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                    >
                      Study Buddy AI Tutor
                    </button>
                  )}
                </li>
                <li>
                  <button
                    onClick={onOpenLmsPortal}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    Student LMS Portal
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Community & Info */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Community & Info
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                <li>
                  <a
                    href="https://chat.whatsapp.com/L3EYfjDXFNOGTzZjAjRuvg?s=cl&p=a&ilr=1"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => onOpenCommunity && onOpenCommunity()}
                    className="hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    WhatsApp Student Group
                  </a>
                </li>
                <li>
                  <button
                    onClick={onOpenHistory}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    Test Attempt History
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('about')}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    About Us & Mission
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('testimonials')}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    Student Success Stories
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Support */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                Legal & Support
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-medium">
                <li>
                  <button
                    onClick={() => setActiveLegalModal('privacy')}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('terms')}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveLegalModal('no-refunds')}
                    className="hover:text-[#F2B90C] transition-colors cursor-pointer"
                  >
                    No Refunds Policy
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:support@boardly.pk"
                    className="hover:text-[#F2B90C] transition-colors"
                  >
                    Contact Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
            <div>
              &copy; {new Date().getFullYear()} Boardly. All rights reserved.
            </div>
            <div className="flex items-center gap-1.5">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for Pakistan's students.</span>
            </div>
          </div>
        </footer>
      </main>

      {/* =========================================================================
          FLOATING BACK TO TOP BUTTON
         ========================================================================= */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-5 sm:bottom-24 sm:right-6 z-40 pointer-events-none"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="pointer-events-auto w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-md border border-slate-700 dark:border-white/20 shadow-lg flex items-center justify-center hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Scroll back to top"
              title="Back to Top"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          LEGAL POLICIES POPUP MODAL
         ========================================================================= */}
      <AnimatePresence>
        {activeLegalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveLegalModal(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative text-slate-900 dark:text-white space-y-5"
            >
            <button
              onClick={() => setActiveLegalModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Content - Privacy Policy */}
            {activeLegalModal === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#F2B90C] font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Boardly Legal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">Privacy Policy</h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  <p>
                    Boardly ("we", "our", or "us") is committed to protecting the privacy of students using our academic exam preparation platform. This Privacy Policy explains how we collect, use, and safeguard your data.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Information We Collect</h4>
                  <p>
                    We collect minimal personal information necessary to deliver personalized test preparation, including name, email address/phone number, academic grade/track, and quiz attempt logs.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Use of AI & Analytics</h4>
                  <p>
                    Quiz responses and Study Buddy AI chat interactions are processed securely to provide personalized concept explanations, identify weak topics, and improve answer key accuracy.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Data Sharing & Third Parties</h4>
                  <p>
                    We do not sell, rent, or trade student personal data to any commercial advertisers or telemarketers. All stored user data is encrypted and accessible only by authorized platform administrators.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">4. Data Erasure & Support</h4>
                  <p>
                    Students have the right to request full account deletion or test history resets at any time by contacting support@boardly.pk.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Content - Terms of Service */}
            {activeLegalModal === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#F2B90C] font-bold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Boardly Legal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">Terms of Service</h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  <p>
                    By accessing or using Boardly, you agree to comply with these Terms of Service. Please read them carefully.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Academic Use License</h4>
                  <p>
                    Boardly provides educational question banks, AI explanations, and mock test tools for individual student preparation. Question content, explanations, and platform materials may not be commercially redistributed or scraped without express written permission.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. User Conduct</h4>
                  <p>
                    Users must maintain respectful behavior when submitting inquiries or communicating with support and community groups.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Disclaimer</h4>
                  <p>
                    While Boardly strives for 100% curriculum accuracy aligned with Federal Board (FBISE), PMDC, and UET Taxila, official exam scoring remains strictly under the jurisdiction of respective testing authorities.
                  </p>
                </div>
              </div>
            )}

            {/* Modal Content - No Refunds Policy */}
            {activeLegalModal === 'no-refunds' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#F2B90C] font-bold text-xs uppercase tracking-wider">
                  <CreditCard className="w-4 h-4" />
                  <span>Boardly Legal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">No Refunds Policy</h3>
                <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#F2B90C] shrink-0" />
                    <span>Notice: All purchases, plan activations, and fee submissions are strictly final and non-refundable.</span>
                  </div>
                  <p>
                    Boardly provides core chapter practice and mock test tools free of charge. For optional paid premium unlocks or specialized LMS access:
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. All Purchases Are Final</h4>
                  <p>
                    Once payment is submitted and verified, your purchase is final. We do not issue full or partial refunds, exchanges, or returns under any circumstances.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Immediate Access to Digital Content</h4>
                  <p>
                    Upon payment verification, students receive immediate access to digital materials, AI features, and premium question banks. Because these digital products are delivered instantly, no refunds or chargebacks are provided.
                  </p>

                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Support & Access Help</h4>
                  <p>
                    If you experience any technical issues with payment verification, receipt screenshots, or accessing your activated course features, please contact our support team at <a href="mailto:support@boardly.pk" className="text-[#F2B90C] underline font-medium">support@boardly.pk</a>. We are happy to assist you in resolving any account access issues.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveLegalModal(null)}
              className="w-full bg-slate-900 text-white dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 font-bold py-3 rounded-full cursor-pointer text-xs active:scale-95 transition-all mt-4"
            >
              Close
            </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
