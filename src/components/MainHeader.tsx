import React, { useState } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  ArrowLeft,
  Home,
  GraduationCap,
  History,
  ArrowRight,
  BarChart3,
  Target,
  Bot,
  Star,
  Globe,
  HelpCircle,
  BookOpen,
  LayoutDashboard,
  FileText,
  TrendingUp,
  CreditCard,
  User,
  LogOut,
  ShieldCheck,
  Users,
  Clock,
  Activity,
  Crown,
} from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useTheme } from '../context/ThemeContext';
import { StudentProfile, isAdminEmail } from '../lib/supabase';
import { BoardClass } from '../types';

interface MainHeaderProps {
  onMenuClick?: () => void;
  currentUser?: any;
  userProfile?: StudentProfile | null;
  selectedClass?: BoardClass | string;
  selectedGroup?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: (theme: 'light' | 'dark') => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  onTrackClick?: () => void;
  canGoBack?: boolean;
  isIntroScreen?: boolean;
  historyCount?: number;
  onOpenHistory?: () => void;
  onOpenLmsPortal?: () => void;
  onStartFree?: () => void;
  onSignOut?: () => void;
  onNavigateDashboard?: () => void;
  onNavigatePractice?: () => void;
  onOpenStudyBuddy?: () => void;
  onNavigateSubscription?: () => void;
  onNavigateAdmin?: (tab?: 'students' | 'payment_requests' | 'activity_logs' | 'tests' | 'progress' | 'study_buddy' | 'audit' | 'rls' | 'bulk_import') => void;
}

export function getCategoryDisplayLabel(
  userProfile?: StudentProfile | null,
  selectedClass?: BoardClass | string,
  selectedGroup?: string
): { shortLabel: string; fullLabel: string; trackType: 'mdcat' | 'tcat' | 'fbise' } | null {
  const gradeStr = String(userProfile?.grade || selectedClass || '').trim();
  const streamStr = String(userProfile?.stream || selectedGroup || '').trim();

  if (!gradeStr && !streamStr) {
    return null;
  }

  const upperGrade = gradeStr.toUpperCase();
  const upperStream = streamStr.toUpperCase();

  if (upperGrade === 'MDCAT' || upperStream === 'MDCAT' || upperGrade.includes('MDCAT')) {
    return {
      shortLabel: 'MDCAT',
      fullLabel: 'MDCAT Medical Entrance',
      trackType: 'mdcat',
    };
  }

  if (upperGrade === 'TCAT' || upperStream === 'TCAT' || upperGrade.includes('TCAT')) {
    return {
      shortLabel: 'TCAT',
      fullLabel: 'TCAT Engineering Entrance',
      trackType: 'tcat',
    };
  }

  const cleanGradeNum = gradeStr.replace(/grade/i, '').replace(/th/i, '').trim();

  if (cleanGradeNum && ['9', '10', '11', '12'].includes(cleanGradeNum)) {
    let streamLabel = '';
    if (streamStr && !streamStr.toLowerCase().includes('general')) {
      if (
        streamStr.toLowerCase().includes('comp') ||
        streamStr.toLowerCase().includes('cs') ||
        streamStr.toLowerCase().includes('ics')
      ) {
        streamLabel = 'CS';
      } else if (
        streamStr.toLowerCase().includes('pre-med') ||
        streamStr.toLowerCase().includes('med')
      ) {
        streamLabel = 'Medical';
      } else if (streamStr.toLowerCase().includes('eng')) {
        streamLabel = 'Pre-Eng';
      } else {
        streamLabel = streamStr;
      }
    }

    const shortLabel = `FBISE - Grade ${cleanGradeNum}`;
    const fullLabel = streamLabel
      ? `FBISE - Grade ${cleanGradeNum} (${streamLabel})`
      : `FBISE - Grade ${cleanGradeNum}`;

    return {
      shortLabel,
      fullLabel,
      trackType: 'fbise',
    };
  }

  if (gradeStr && gradeStr !== 'undefined' && gradeStr !== 'null') {
    return {
      shortLabel: gradeStr,
      fullLabel: `Track: ${gradeStr}`,
      trackType: 'fbise',
    };
  }

  return null;
}

export const MainHeader: React.FC<MainHeaderProps> = React.memo(({
  onMenuClick,
  currentUser,
  userProfile,
  selectedClass,
  selectedGroup,
  theme: propsTheme,
  onToggleTheme: propsOnToggleTheme,
  onGoBack,
  onGoHome,
  onTrackClick,
  canGoBack = false,
  isIntroScreen = false,
  historyCount = 0,
  onOpenHistory,
  onOpenLmsPortal,
  onStartFree,
  onSignOut,
  onNavigateDashboard,
  onNavigatePractice,
  onOpenStudyBuddy,
  onNavigateSubscription,
  onNavigateAdmin,
}) => {
  const { logoUrl } = useSiteSettings();
  const { theme: contextTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentTheme = propsTheme || contextTheme;
  const isUserAdmin = Boolean(currentUser?.email && isAdminEmail(currentUser.email));
  const isStudent = Boolean(currentUser && !isUserAdmin);
  const isLoggedOut = !currentUser;

  const handleToggle = () => {
    if (propsOnToggleTheme) {
      propsOnToggleTheme(currentTheme === 'light' ? 'dark' : 'light');
    } else {
      toggleTheme();
    }
  };

  const handleLogoClick = () => {
    if (isIntroScreen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (onGoHome) {
      onGoHome();
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (isIntroScreen) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (onGoHome) {
      onGoHome();
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const trackInfo = getCategoryDisplayLabel(userProfile, selectedClass, selectedGroup);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F9FB]/95 dark:bg-[#090909]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs transition-colors duration-200 transform-gpu will-change-transform">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Back button + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {canGoBack && onGoBack && (
            <button
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-[#F2B90C] hover:text-[#0A0A0A] text-slate-800 dark:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer border border-slate-200 dark:border-white/10"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Back</span>
            </button>
          )}

          {/* Single Brand Logo */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 relative group cursor-pointer select-none"
            title="Go to Home"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] bg-[#0A0A0A] flex items-center justify-center shrink-0 border border-[#F2B90C]/40 shadow-[0_0_12px_rgba(242,185,12,0.2)] group-hover:shadow-[0_0_20px_rgba(242,185,12,0.45)] group-hover:border-[#F2B90C] group-hover:scale-105 transition-all duration-300 overflow-hidden p-0.5">
              <img
                src={logoUrl || "/logo.svg"}
                alt="Boardly Logo"
                className="w-full h-full object-contain rounded-[8px] transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/boardly-logo.svg';
                }}
              />
            </div>

            <div className="flex flex-col">
              <h1 className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-[#0A0A0A] dark:text-white leading-tight tracking-tight group-hover:text-[#F2B90C] transition-colors flex items-center gap-1.5">
                <span>Boardly</span>
              </h1>
              <span className="text-[9px] font-bold tracking-widest uppercase text-amber-800 dark:text-[#F2B90C] hidden sm:block">
                Academy Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Section Links (Role Aware) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-600 dark:text-slate-300">
          {isLoggedOut && (
            <>
              <button
                onClick={() => scrollToSection('tracks')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer"
              >
                Test Tracks
              </button>
              <button
                onClick={() => scrollToSection('why-boardly')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer"
              >
                Why Boardly
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('study-buddy')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer"
              >
                Study Buddy AI
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer"
              >
                Testimonials
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer"
              >
                About Us
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer"
              >
                FAQ
              </button>
            </>
          )}

          {isStudent && (
            <>
              <button
                onClick={() => (onNavigateDashboard ? onNavigateDashboard() : onGoHome?.())}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => (onTrackClick ? onTrackClick() : onOpenLmsPortal?.())}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>My Track</span>
              </button>
              <button
                onClick={() => (onNavigatePractice ? onNavigatePractice() : onStartFree?.())}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Practice Tests</span>
              </button>
              <button
                onClick={() => onOpenStudyBuddy?.()}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Study Buddy AI</span>
              </button>
              <button
                onClick={() => onOpenHistory?.()}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Progress / Analytics</span>
              </button>
              <button
                onClick={() => onNavigateSubscription?.()}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Subscription / Plan</span>
              </button>
              <button
                onClick={() => onOpenLmsPortal?.()}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Account Settings</span>
              </button>
            </>
          )}

          {isUserAdmin && (
            <>
              <button
                onClick={() => onNavigateAdmin?.('students')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Admin Dashboard</span>
              </button>
              <button
                onClick={() => onNavigateAdmin?.('students')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Manage Users</span>
              </button>
              <button
                onClick={() => onNavigateAdmin?.('payment_requests')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Pending Verifications</span>
              </button>
              <button
                onClick={() => onNavigateAdmin?.('students')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Subscription Plans</span>
              </button>
              <button
                onClick={() => onNavigateAdmin?.('activity_logs')}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Activity Log</span>
              </button>
              <button
                onClick={() => {
                  if (onOpenLmsPortal) onOpenLmsPortal();
                  else if (onNavigateAdmin) onNavigateAdmin('students');
                }}
                className="hover:text-[#F2B90C] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Account Settings</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Registered Track Indicator */}
          {trackInfo && (
            <div
              onClick={onTrackClick || onOpenLmsPortal || onMenuClick}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02] active:scale-95 select-none ${
                trackInfo.trackType === 'mdcat'
                  ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border-amber-500/30'
                  : trackInfo.trackType === 'tcat'
                  ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-900 dark:text-indigo-300 border-indigo-500/30'
                  : 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-900 dark:text-blue-300 border-blue-500/30'
              }`}
              title={`Active Registered Track: ${trackInfo.fullLabel}`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{trackInfo.shortLabel}</span>
            </div>
          )}

          {/* Attempt History Button */}
          {historyCount > 0 && onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-800 dark:text-white bg-slate-200/70 dark:bg-white/10 border border-slate-300 dark:border-white/15 px-3 py-1.5 rounded-full hover:bg-slate-300 dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer font-bold"
            >
              <History className="w-3.5 h-3.5 text-amber-700 dark:text-[#F2B90C]" />
              <span>History ({historyCount})</span>
            </button>
          )}

          {/* Primary CTA / LMS Portal Trigger */}
          {onOpenLmsPortal && isLoggedOut && (
            <button
              onClick={onOpenLmsPortal}
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-900 dark:text-white bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 px-3.5 py-1.5 rounded-full font-bold transition-all active:scale-95 cursor-pointer border border-slate-300/80 dark:border-white/15"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>Sign In / Sign Up</span>
            </button>
          )}

          {onStartFree && isIntroScreen && isLoggedOut && (
            <button
              onClick={onStartFree}
              className="bg-[#F2B90C] hover:bg-[#E0A800] text-[#0A0A0A] font-extrabold px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition-all active:scale-95 shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Start Free</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          )}

          {/* Desktop Log Out Button for Logged-In Users */}
          {!isLoggedOut && onSignOut && (
            <button
              onClick={onSignOut}
              className="hidden sm:flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3.5 py-1.5 rounded-full font-bold transition-all active:scale-95 cursor-pointer"
              title="Log Out of Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}

          {onGoHome && canGoBack && (
            <button
              onClick={onGoHome}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-[#F2B90C] hover:text-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-all active:scale-95 cursor-pointer"
              title="Go to Main Home"
            >
              <Home className="w-4 h-4" />
            </button>
          )}

          {/* Single Theme Toggle Button */}
          <button
            onClick={handleToggle}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 transition-colors active:scale-95 cursor-pointer"
            aria-label="Toggle Light and Dark Theme"
            title={`Switch to ${currentTheme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {currentTheme === 'light' ? (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
            ) : (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2B90C]" />
            )}
          </button>

          {/* Single Hamburger / Menu Icon */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors active:scale-95 cursor-pointer text-[#0A0A0A] dark:text-white"
            aria-label="Toggle navigation menu"
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Mega-Menu Drawer */}
      {mobileMenuOpen && (
        <div className="max-w-7xl mx-auto w-full pt-3 pb-2 border-t border-slate-200/80 dark:border-white/10 mt-3 space-y-3 animate-ios-spring">
          {/* Mobile Menu Logo Header */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 mb-1 border-b border-slate-200/60 dark:border-white/10">
            <div className="w-7 h-7 bg-[#0A0A0A] border border-[#F2B90C]/40 rounded-xl p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              <img
                src={logoUrl || "/logo.svg"}
                alt="Boardly Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/boardly-logo.svg';
                }}
              />
            </div>
            <span className="font-['Space_Grotesk'] font-black text-sm tracking-widest text-[#F2B90C] uppercase">
              BOARDLY MENU
            </span>
          </div>
          <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            {/* 1. LOGGED-OUT VISITOR LINKS */}
            {isLoggedOut && (
              <>
                <button
                  onClick={() => scrollToSection('tracks')}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Test Tracks</span>
                  <GraduationCap className="w-4 h-4 text-[#F2B90C]" />
                </button>
                <button
                  onClick={() => scrollToSection('why-boardly')}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Why Boardly</span>
                  <BarChart3 className="w-4 h-4 text-[#F2B90C]" />
                </button>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>How It Works</span>
                  <Target className="w-4 h-4 text-[#F2B90C]" />
                </button>
                <button
                  onClick={() => scrollToSection('study-buddy')}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Study Buddy AI</span>
                  <Bot className="w-4 h-4 text-[#F2B90C]" />
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>Student Stories</span>
                  <Star className="w-4 h-4 text-[#F2B90C]" />
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>About Us</span>
                  <Globe className="w-4 h-4 text-[#F2B90C]" />
                </button>
                <button
                  onClick={() => scrollToSection('faq')}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span>FAQ</span>
                  <HelpCircle className="w-4 h-4 text-[#F2B90C]" />
                </button>
              </>
            )}

            {/* 2. LOGGED-IN STUDENT LINKS */}
            {isStudent && (
              <>
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-[#F2B90C] border-b border-slate-200/60 dark:border-white/10 mb-1 pb-1 flex items-center justify-between">
                  <span>Student Portal Navigation</span>
                  <span className="truncate max-w-[150px] font-mono normal-case text-slate-500 dark:text-slate-400 font-normal">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateDashboard) onNavigateDashboard();
                    else if (onGoHome) onGoHome();
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-[#F2B90C]" />
                    <span>Dashboard</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">Active</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onTrackClick) onTrackClick();
                    else if (onOpenLmsPortal) onOpenLmsPortal();
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-[#F2B90C]" />
                    <span>My Track</span>
                  </div>
                  {trackInfo && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-900 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full truncate max-w-[140px]">
                      {trackInfo.shortLabel}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigatePractice) onNavigatePractice();
                    else if (onStartFree) onStartFree();
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-[#F2B90C]" />
                    <span>Practice Tests</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenStudyBuddy) onOpenStudyBuddy();
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-4 h-4 text-[#F2B90C]" />
                    <span>Study Buddy AI</span>
                  </div>
                  <span className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded-full">AI Assistant</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenHistory) onOpenHistory();
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#F2B90C]" />
                    <span>Progress / Analytics</span>
                  </div>
                  {historyCount > 0 && (
                    <span className="text-[10px] bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                      {historyCount} Tests
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateSubscription) onNavigateSubscription();
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-[#F2B90C]" />
                    <span>Subscription / Plan</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenLmsPortal) onOpenLmsPortal();
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#F2B90C]" />
                    <span>Account Settings</span>
                  </div>
                </button>
              </>
            )}

            {/* 3. LOGGED-IN ADMIN LINKS */}
            {isUserAdmin && (
              <>
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 border-b border-slate-200/60 dark:border-white/10 mb-1 pb-1 flex items-center justify-between">
                  <span>Admin Control Panel</span>
                  <span className="text-[10px] bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full">Administrator</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateAdmin) onNavigateAdmin('students');
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#F2B90C]" />
                    <span>Admin Dashboard</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateAdmin) onNavigateAdmin('students');
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-[#F2B90C]" />
                    <span>Manage Users</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateAdmin) onNavigateAdmin('payment_requests');
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#F2B90C]" />
                    <span>Pending Verifications / Payment Proofs</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateAdmin) onNavigateAdmin('students');
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Crown className="w-4 h-4 text-[#F2B90C]" />
                    <span>Manage Subscription Plans</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onNavigateAdmin) onNavigateAdmin('activity_logs');
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#F2B90C]" />
                    <span>Activity Log</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenLmsPortal) onOpenLmsPortal();
                    else if (onNavigateAdmin) onNavigateAdmin('students');
                  }}
                  className="text-left py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#F2B90C]" />
                    <span>Account Settings</span>
                  </div>
                </button>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200/60 dark:border-white/10 flex flex-col gap-2">
            {isLoggedOut && (
              <>
                {onOpenLmsPortal && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLmsPortal();
                    }}
                    className="w-full bg-slate-900 text-white dark:bg-white/10 dark:hover:bg-white/20 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4 text-[#F2B90C]" />
                    <span>Student LMS Portal (Sign In / Sign Up)</span>
                  </button>
                )}

                {onStartFree && isIntroScreen && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onStartFree();
                    }}
                    className="w-full bg-[#F2B90C] hover:bg-[#E0A800] text-[#0A0A0A] font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Start Free Practice</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </>
            )}

            {!isLoggedOut && onSignOut && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-rose-500/20 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
});
