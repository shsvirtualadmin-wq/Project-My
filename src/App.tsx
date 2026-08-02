import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PathType,
  BoardClass,
  DashboardCategory,
  Question,
  TestConfig,
  UserAnswer,
  TestResult,
  HistoryItem,
  QuestionDifficulty,
  TestMode
} from './types';
import { PREBUILT_QUESTIONS, getPrebuiltQuestionsForSubject } from './data/prebuiltQuestions';
import { getSubjectsForClassAndGroup } from './data/categories';
import { mapSubject } from './utils/subjectMapper';
import {
  getCategoryFromClassAndGroup,
  getCategoryFromProfile,
  getClassAndGroupFromCategory,
  isCategoryAccessAllowed,
} from './utils/categoryHelpers';

import { MainHeader } from './components/MainHeader';
import { HeaderLogo } from './components/HeaderLogo';
import { StepTrail } from './components/StepTrail';
import { IntroScreen } from './components/IntroScreen';
import { StudentHomeDashboard } from './components/StudentHomeDashboard';
import { GradesFlowScreen } from './components/GradesFlowScreen';
import { GuidedSetupWizard, SetupWizardData } from './components/GuidedSetupWizard';
import { ClassGroupScreen } from './components/ClassGroupScreen';
import { SubjectScreen } from './components/SubjectScreen';
import { DurationScreen } from './components/DurationScreen';
import { TestScreen } from './components/TestScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { PrintableTestModal } from './components/PrintableTestModal';
import { CommunityModal } from './components/CommunityModal';
import { HistoryModal } from './components/HistoryModal';
import { LmsPortalModal } from './components/LmsPortalModal';
import { StudyBuddyModal, MCQContext } from './components/StudyBuddyModal';
import { LmsAuthScreen } from './components/LmsAuthScreen';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { ClassStreamDashboard } from './components/ClassStreamDashboard';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { PaymentRequiredScreen } from './components/PaymentRequiredScreen';
import { PaymentProofModal } from './components/PaymentProofModal';
import { PlanSelectionScreen, PlanId, PLAN_OPTIONS } from './components/PlanSelectionScreen';
import { ResetPasswordScreen } from './components/ResetPasswordScreen';
import { supabase, apiFetch, safeJsonResponse, syncUserProfile, saveTestToSupabase, fetchUserTestHistoryFromSupabase, clearUserTestHistoryInSupabase, fetchStudentProfileFromSupabase, fetchStudentMcqUsage, clearProfileCache, checkUserExistsInDatabase, isStudentExistingBeforeRule, isAdminEmail, User, StudentProfile } from './lib/supabase';
import { App as CapacitorApp } from '@capacitor/app';
import { ShieldCheck, Sun, Moon, WifiOff, AlertTriangle, Lock, ShieldAlert, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import { cacheGeneratedQuestions, getCachedQuestions, saveHistoryOffline, loadHistoryOffline, clearHistoryOffline } from './lib/offlineCache';

type ScreenType =
  | 'intro'
  | 'guided_wizard'
  | 'plan_selection'
  | 'payment_required'
  | 'grades_flow'
  | 'group'
  | 'dashboard'
  | 'subject'
  | 'duration'
  | 'auth'
  | 'test'
  | 'results'
  | 'admin'
  | 'reset_password';

export function isTrackAllowedForUser(
  profile: StudentProfile | null,
  targetClass: BoardClass | undefined,
  isAdmin: boolean
): boolean {
  if (isAdmin) return true;
  if (!profile) return false;

  if (
    profile.requires_payment === false ||
    profile.payment_status === 'Verified & Paid' ||
    (profile.created_at && isStudentExistingBeforeRule(profile.created_at))
  ) {
    return true;
  }

  const plans = profile.subscribed_plans || [];

  if (plans.includes('free') || profile.package_name?.toLowerCase().includes('free')) {
    return true;
  }

  if (!targetClass || targetClass === 9 || targetClass === 10) {
    return plans.includes('matric');
  }
  if (targetClass === 11 || targetClass === 12) {
    return plans.includes('fsc');
  }
  if (targetClass === 'TCAT') {
    return plans.includes('tcat');
  }
  if (targetClass === 'MDCAT') {
    return plans.includes('mdcat');
  }

  return false;
}

const getInitialUrlState = (): {
  screen: ScreenType;
  selectedClass?: BoardClass;
  selectedGroup?: string;
  selectedSubject: string;
} => {
  if (typeof window === 'undefined') {
    return { screen: 'intro', selectedSubject: 'Urdu' };
  }

  // Check if URL points to reset password path or recovery parameters
  if (
    window.location.pathname.includes('/reset-password') ||
    window.location.search.includes('type=recovery') ||
    window.location.hash.includes('type=recovery') ||
    window.location.search.includes('error=') ||
    window.location.hash.includes('error=')
  ) {
    return { screen: 'reset_password', selectedSubject: 'Urdu' };
  }

  const params = new URLSearchParams(window.location.search);
  const urlScreen = params.get('screen') as ScreenType | null;
  const validScreens: ScreenType[] = [
    'intro', 'guided_wizard', 'plan_selection', 'grades_flow', 'group', 'dashboard', 'subject', 'duration', 'auth', 'test', 'results', 'admin', 'reset_password'
  ];

  let initialScreen: ScreenType = 'intro';
  if (urlScreen && validScreens.includes(urlScreen)) {
    initialScreen = urlScreen;
  } else {
    try {
      const saved = localStorage.getItem('boardly_active_screen');
      if (saved && validScreens.includes(saved as ScreenType)) {
        initialScreen = saved as ScreenType;
      }
    } catch {}
  }

  const urlClass = params.get('class');
  const urlGroup = params.get('group');
  const urlSubject = params.get('subject');

  return {
    screen: initialScreen,
    selectedClass: urlClass ? (Number(urlClass) as BoardClass) : undefined,
    selectedGroup: urlGroup || undefined,
    selectedSubject: urlSubject || 'Urdu',
  };
};

const buildUrl = (
  scr: ScreenType,
  modal?: string | null,
  cls?: BoardClass,
  grp?: string,
  sub?: string
) => {
  if (scr === 'reset_password') {
    return '/reset-password';
  }
  const params = new URLSearchParams();
  if (scr !== 'intro') {
    params.set('screen', scr);
  }
  if (cls) {
    params.set('class', String(cls));
  }
  if (grp) {
    params.set('group', grp);
  }
  if (sub && scr !== 'intro' && scr !== 'grades_flow') {
    params.set('subject', sub);
  }
  if (modal) {
    params.set('modal', modal);
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : window.location.pathname;
};

export function App() {
  const initialUrlState = useRef(getInitialUrlState()).current;

  const [screen, setScreen] = useState<ScreenType>(initialUrlState.screen);
  const [adminTab, setAdminTab] = useState<'students' | 'payment_requests' | 'activity_logs' | 'tests' | 'progress' | 'study_buddy' | 'audit' | 'rls' | 'bulk_import'>('students');
  const [selectedClass, setSelectedClass] = useState<BoardClass | undefined>(initialUrlState.selectedClass);
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(initialUrlState.selectedGroup);
  const [selectedSubject, setSelectedSubject] = useState<string>(initialUrlState.selectedSubject);
  const [customTopic, setCustomTopic] = useState<string | undefined>(undefined);

  const [showExitToast, setShowExitToast] = useState<boolean>(false);
  const lastExitPressTimeRef = useRef<number>(0);
  const exitToastTimerRef = useRef<any>(null);
  const isNavigatingFromPopstateRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      if (['intro', 'grades_flow', 'group', 'dashboard', 'subject', 'duration', 'admin'].includes(screen)) {
        localStorage.setItem('boardly_active_screen', screen);
      }
    } catch {}
  }, [screen]);

  const path: PathType = 'boards';

  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const mcqAbortControllerRef = useRef<AbortController | null>(null);
  const bgMcqAbortControllerRef = useRef<AbortController | null>(null);
  const mcqRequestIdRef = useRef<number>(0);
  const [showCommunityModal, setShowCommunityModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showLmsModal, setShowLmsModal] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showStudyBuddy, setShowStudyBuddy] = useState<boolean>(false);
  const [studyBuddyContext, setStudyBuddyContext] = useState<MCQContext | null>(null);
  const [freeLimitModalOpen, setFreeLimitModalOpen] = useState<boolean>(false);
  const [trackNotice, setTrackNotice] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('boardly_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState<StudentProfile | null>(() => {
    try {
      const cachedUserStr = localStorage.getItem('boardly_cached_user');
      const cachedUser = cachedUserStr ? JSON.parse(cachedUserStr) : null;
      if (cachedUser?.id) {
        const cachedP = localStorage.getItem(`boardly_profile_${cachedUser.id}`);
        if (cachedP) return JSON.parse(cachedP);
      }
      const cachedGeneral = localStorage.getItem('boardly_cached_profile');
      return cachedGeneral ? JSON.parse(cachedGeneral) : null;
    } catch {
      return null;
    }
  });

  const [profileSyncing, setProfileSyncing] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(() => {
    try {
      return !localStorage.getItem('boardly_cached_user');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('boardly_cached_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('boardly_cached_user');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      if (userProfile && currentUser?.id) {
        localStorage.setItem(`boardly_profile_${currentUser.id}`, JSON.stringify(userProfile));
        localStorage.setItem('boardly_cached_profile', JSON.stringify(userProfile));
      } else if (!currentUser) {
        localStorage.removeItem('boardly_cached_profile');
      }
    } catch {}
  }, [userProfile, currentUser?.id]);

  const isAdmin = Boolean(currentUser?.email && isAdminEmail(currentUser.email));
  const hasGradeAndStream = Boolean(
    userProfile?.grade &&
    userProfile?.grade.trim() &&
    userProfile?.grade !== 'General Student' &&
    userProfile?.stream &&
    userProfile?.stream.trim()
  );
  const isRegisteredStudent = isAdmin || Boolean(userProfile?.is_registered) || hasGradeAndStream;

  // Access Gating Rule: Existing students (created before rule deployment date) OR admins
  // OR students whose payment_status is 'Verified & Paid' are EXEMPT from payment gating and keep full access as normal!
  const isExistingStudentUnaffected = Boolean(
    userProfile?.requires_payment === false ||
    userProfile?.payment_status === 'Verified & Paid' ||
    (userProfile?.created_at && isStudentExistingBeforeRule(userProfile.created_at))
  );
  const isPaymentApprovedOrExempt = isAdmin || isExistingStudentUnaffected;

  const screenRef = useRef(screen);
  const selectedClassRef = useRef(selectedClass);
  const selectedGroupRef = useRef(selectedGroup);
  const selectedSubjectRef = useRef(selectedSubject);
  const showLmsModalRef = useRef(showLmsModal);
  const showPrintModalRef = useRef(showPrintModal);
  const showHistoryModalRef = useRef(showHistoryModal);
  const showCommunityModalRef = useRef(showCommunityModal);
  const currentUserRef = useRef(currentUser);
  const isRegisteredStudentRef = useRef(isRegisteredStudent);
  const isAdminRef = useRef(isAdmin);
  const authBackScreenRef = useRef<ScreenType>('intro');

  const [nextScreenAfterAuth, setNextScreenAfterAuth] = useState<ScreenType | null>(null);
  const [authBackScreen, setAuthBackScreen] = useState<ScreenType>('intro');

  const handleWizardComplete = async (data: SetupWizardData) => {
    let targetC: BoardClass = 11;
    let targetG: string = 'Pre-Medical';

    if (data.exam === 'MDCAT') {
      targetC = 'MDCAT';
      targetG = 'MDCAT';
    } else if (data.exam === 'TCAT') {
      targetC = 'TCAT';
      targetG = data.group || 'Pre-Engineering';
    } else {
      targetC = data.classNum || 11;
      targetG = data.group || 'Pre-Medical';
    }

    setSelectedClass(targetC);
    setSelectedGroup(targetG);

    if (currentUser) {
      const provider = currentUser.app_metadata?.provider || 'email';
      const updatedProfile: StudentProfile = {
        ...(userProfile || {
          id: currentUser.id,
          name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Student',
          email: currentUser.email || '',
          sign_up_method: provider === 'google' ? 'Google' : 'Email/Password',
          created_at: new Date().toISOString(),
        }),
        grade: typeof targetC === 'number' ? `Class ${targetC}` : targetC,
        stream: targetG,
        subjects: data.focusSubjects,
        target_exam: data.exam,
        is_registered: true,
        updated_at: new Date().toISOString(),
      };

      setUserProfile(updatedProfile);
      localStorage.setItem(`boardly_profile_${currentUser.id}`, JSON.stringify(updatedProfile));
      localStorage.setItem('boardly_cached_profile', JSON.stringify(updatedProfile));

      try {
        await supabase.from('students').upsert(updatedProfile);
      } catch (err) {
        console.warn('Error saving setup wizard profile:', err);
      }
    }

    setScreen('plan_selection');
  };

  const handleSelectPlans = async (selectedPlanIds: PlanId[]) => {
    if (!currentUser) {
      setScreen('auth');
      return;
    }

    const planNames = selectedPlanIds
      .map((id) => PLAN_OPTIONS.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(' + ');

    const hasPaidPlan = selectedPlanIds.some((id) => {
      const opt = PLAN_OPTIONS.find((p) => p.id === id);
      return opt && opt.numericPrice > 0;
    });

    const provider = currentUser.app_metadata?.provider || 'email';

    let nextPaymentStatus = userProfile?.payment_status || 'Unpaid';
    let nextRequiresPayment = true;

    if (!hasPaidPlan) {
      nextPaymentStatus = 'Free Plan';
      nextRequiresPayment = false;
    } else {
      if (userProfile?.payment_status === 'Verified & Paid') {
        nextPaymentStatus = 'Verified & Paid';
        nextRequiresPayment = false;
      } else if (userProfile?.payment_status === 'Pending Verification') {
        nextPaymentStatus = 'Pending Verification';
        nextRequiresPayment = true;
      } else {
        nextPaymentStatus = 'Unpaid';
        nextRequiresPayment = true;
      }
    }

    const updatedProfile: StudentProfile = {
      ...(userProfile || {
        id: currentUser.id,
        name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Student',
        email: currentUser.email || '',
        grade: selectedClass ? selectedClass.toString() : 'General Student',
        sign_up_method: provider === 'google' ? 'Google' : 'Email/Password',
        created_at: new Date().toISOString(),
      }),
      is_registered: true,
      subscribed_plans: selectedPlanIds,
      package_name: planNames || (hasPaidPlan ? 'Paid Subscription' : 'Free Plan'),
      payment_status: nextPaymentStatus,
      requires_payment: nextRequiresPayment,
      updated_at: new Date().toISOString(),
    };

    setUserProfile(updatedProfile);
    localStorage.setItem(`boardly_profile_${currentUser.id}`, JSON.stringify(updatedProfile));
    localStorage.setItem('boardly_cached_profile', JSON.stringify(updatedProfile));

    try {
      await supabase.from('students').upsert(updatedProfile);
    } catch (err) {
      console.warn('Error syncing profile after plan selection:', err);
    }

    if (selectedPlanIds.includes('mdcat')) {
      setSelectedClass('MDCAT');
      setSelectedGroup('MDCAT');
    } else if (selectedPlanIds.includes('tcat')) {
      setSelectedClass('TCAT');
      setSelectedGroup('TCAT');
    } else if (selectedPlanIds.includes('fsc')) {
      setSelectedClass(11);
      setSelectedGroup('Pre-Medical');
    } else if (selectedPlanIds.includes('matric')) {
      setSelectedClass(9);
      setSelectedGroup('Medical');
    }

    setTrackNotice(null);

    if (hasPaidPlan && nextRequiresPayment) {
      setScreen('payment_required');
      setShowPaymentModal(true);
    } else {
      setScreen('dashboard');
    }
  };

  useEffect(() => {
    screenRef.current = screen;
    selectedClassRef.current = selectedClass;
    selectedGroupRef.current = selectedGroup;
    selectedSubjectRef.current = selectedSubject;
    showLmsModalRef.current = showLmsModal;
    showPrintModalRef.current = showPrintModal;
    showHistoryModalRef.current = showHistoryModal;
    showCommunityModalRef.current = showCommunityModal;
    currentUserRef.current = currentUser;
    isRegisteredStudentRef.current = isRegisteredStudent;
    isAdminRef.current = isAdmin;
    authBackScreenRef.current = authBackScreen;
  }, [
    screen,
    selectedClass,
    selectedGroup,
    selectedSubject,
    showLmsModal,
    showPrintModal,
    showHistoryModal,
    showCommunityModal,
    currentUser,
    isRegisteredStudent,
    isAdmin,
    authBackScreen,
  ]);

  const refreshUserProfile = async (uid?: string) => {
    const id = uid || currentUser?.id;
    if (!id) {
      setUserProfile(null);
      return;
    }
    const profile = await fetchStudentProfileFromSupabase(id);
    setUserProfile(profile);
  };

  useEffect(() => {
    if (currentUser?.id) {
      refreshUserProfile(currentUser.id);
    } else {
      setUserProfile(null);
    }
  }, [currentUser?.id]);

  // Comprehensive Security & Route Guard Enforcement (Auth & RBAC)
  useEffect(() => {
    if (authLoading) return;

    // 1. Unauthenticated User Protection for Protected Routes
    if (!currentUser) {
      if (['dashboard', 'subject', 'duration', 'test', 'results', 'guided_wizard', 'plan_selection', 'group', 'grades_flow', 'admin'].includes(screen)) {
        console.warn(`[Security Guard]: Unauthenticated user attempted to access protected screen (${screen}). Redirecting to auth screen...`);
        setNextScreenAfterAuth(screen === 'admin' ? 'admin' : 'dashboard');
        setAuthBackScreen('intro');
        setScreen('auth');
        try {
          localStorage.removeItem('boardly_active_screen');
        } catch {}
      }
      return;
    }

    // 2. Authenticated Non-Admin Student Protection for Admin Route
    if (screen === 'admin' && !isAdmin) {
      console.warn(`[Security Guard]: Non-admin student (${currentUser.email}) attempted to access admin dashboard. Redirecting to home...`);
      setScreen('intro');
      try { localStorage.removeItem('boardly_active_screen'); } catch {}
      return;
    }

    // 3. Post-Signup Onboarding & Track Access Guard Enforcement
    if (!isAdmin) {
      if (!userProfile?.is_registered) {
        if (screen !== 'guided_wizard' && screen !== 'auth' && screen !== 'intro') {
          setScreen('guided_wizard');
        }
      } else if ((!userProfile?.subscribed_plans || userProfile.subscribed_plans.length === 0) && !isPaymentApprovedOrExempt) {
        if (screen !== 'plan_selection' && screen !== 'guided_wizard' && screen !== 'auth' && screen !== 'intro') {
          setScreen('plan_selection');
        }
      } else if (
        userProfile?.requires_payment &&
        userProfile?.payment_status !== 'Verified & Paid' &&
        !(userProfile?.created_at && isStudentExistingBeforeRule(userProfile.created_at))
      ) {
        const plans = userProfile?.subscribed_plans || [];
        const isFreeOnly = plans.length === 1 && plans[0] === 'free';
        if (!isFreeOnly) {
          if (screen !== 'payment_required' && screen !== 'plan_selection' && screen !== 'auth' && screen !== 'intro') {
            setScreen('payment_required');
          }
        }
      } else if (['dashboard', 'subject', 'duration', 'test'].includes(screen)) {
        const allowed = isTrackAllowedForUser(userProfile, selectedClass, isAdmin);
        if (!allowed) {
          const trackName = selectedClass ? String(selectedClass) : 'this';
          setTrackNotice(`Access to the ${trackName} track requires a subscription to that plan. Please select a plan to unlock.`);
          setScreen('plan_selection');
        }
      }
    }
  }, [screen, currentUser, isAdmin, authLoading, userProfile, selectedClass, isPaymentApprovedOrExempt]);

  // Admin Route Session Logger (Non-destructive verification)
  useEffect(() => {
    if (screen === 'admin' && currentUser && isAdmin) {
      console.log('[Admin Access Granted]: Verified admin session for:', currentUser.email);
    }
  }, [screen, currentUser, isAdmin]);

  // Category & Route Guard Enforcement for registered non-admin students
  useEffect(() => {
    if (currentUser && !isAdmin && isRegisteredStudent) {
      const userCat = getCategoryFromProfile(currentUser.email, userProfile);
      const currentCat = getCategoryFromClassAndGroup(selectedClass, selectedGroup);

      // Route Guard: If a non-admin student attempts to access a dashboard/route outside their category
      if (!isCategoryAccessAllowed(userCat, currentCat)) {
        const authParams = getClassAndGroupFromCategory(userCat);
        setSelectedClass(authParams.classNum);
        setSelectedGroup(authParams.group);

        if (['grades_flow', 'group', 'dashboard', 'subject'].includes(screen)) {
          setScreen('dashboard');
        }
      } else if (screen === 'grades_flow' || screen === 'group') {
        // Redirect selection screen attempts straight to their authorized dashboard
        setScreen('dashboard');
      }
    }
  }, [currentUser, isAdmin, userProfile, isRegisteredStudent, selectedClass, selectedGroup, screen]);

  // Clean OAuth URL parameters immediately from browser history on mount (except when resetting password)
  useEffect(() => {
    const hasHashToken = window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery');
    const hasSearchCode = window.location.search.includes('code=');
    if ((hasHashToken || hasSearchCode) && screen !== 'reset_password' && !window.location.pathname.includes('/reset-password')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [screen]);

  // Synchronize internal state with Browser History API and URL query parameters
  useEffect(() => {
    const hasHashToken = window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery');
    const hasSearchCode = window.location.search.includes('code=');
    if (hasHashToken || hasSearchCode) {
      return;
    }

    if (isNavigatingFromPopstateRef.current) {
      isNavigatingFromPopstateRef.current = false;
      return;
    }

    const activeModal = showLmsModal ? 'lms' : showPrintModal ? 'print' : showHistoryModal ? 'history' : showCommunityModal ? 'community' : null;
    const url = buildUrl(screen, activeModal, selectedClass, selectedGroup, selectedSubject);
    const stateObj = {
      screen,
      modal: activeModal,
      selectedClass,
      selectedGroup,
      selectedSubject,
      isRoot: screen === 'intro' && !activeModal,
    };

    if (
      window.history.state?.screen !== screen ||
      window.history.state?.modal !== activeModal ||
      window.history.state?.selectedClass !== selectedClass ||
      window.history.state?.selectedGroup !== selectedGroup ||
      window.history.state?.selectedSubject !== selectedSubject
    ) {
      window.history.pushState(stateObj, '', url);
    }
  }, [screen, showLmsModal, showPrintModal, showHistoryModal, showCommunityModal, selectedClass, selectedGroup, selectedSubject]);

  // Hardware Back Button & Popstate History Listener
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      isNavigatingFromPopstateRef.current = true;
      const state = e.state;

      // 1. If currently taking active test, confirm before leaving test
      if (screenRef.current === 'test') {
        const confirmLeave = window.confirm('Are you sure you want to exit this test? Progress will be lost.');
        if (!confirmLeave) {
          window.history.pushState(
            { screen: 'test', selectedClass: selectedClassRef.current, selectedGroup: selectedGroupRef.current, selectedSubject: selectedSubjectRef.current },
            '',
            buildUrl('test', null, selectedClassRef.current, selectedGroupRef.current, selectedSubjectRef.current)
          );
          isNavigatingFromPopstateRef.current = false;
          return;
        }
      }

      // 2. Close overlay modals first
      if (showLmsModalRef.current) {
        setShowLmsModal(false);
        return;
      }
      if (showPrintModalRef.current) {
        setShowPrintModal(false);
        return;
      }
      if (showHistoryModalRef.current) {
        setShowHistoryModal(false);
        return;
      }
      if (showCommunityModalRef.current) {
        setShowCommunityModal(false);
        return;
      }

      // 3. Homepage ('intro') exit handler (Double back to exit within 2 seconds)
      const currentScreen = screenRef.current;
      if (currentScreen === 'intro') {
        const now = Date.now();
        if (now - lastExitPressTimeRef.current < 2000) {
          // Second back press within 2s -> Allow app exit
          try {
            CapacitorApp.exitApp();
          } catch {}
          return;
        } else {
          // First back press -> Show toast and push root guard state
          lastExitPressTimeRef.current = now;
          setShowExitToast(true);
          if (exitToastTimerRef.current) clearTimeout(exitToastTimerRef.current);
          exitToastTimerRef.current = setTimeout(() => {
            setShowExitToast(false);
          }, 2000);

          window.history.pushState(
            { screen: 'intro', isRoot: true },
            '',
            buildUrl('intro')
          );
          return;
        }
      }

      // 4. Update screen and parameter states from history state object
      if (state && state.screen) {
        setScreen(state.screen);
        if (state.selectedClass !== undefined) setSelectedClass(state.selectedClass);
        if (state.selectedGroup !== undefined) setSelectedGroup(state.selectedGroup);
        if (state.selectedSubject !== undefined) setSelectedSubject(state.selectedSubject);
      } else {
        handleGlobalBackInternal();
      }
    };

    let capListener: any = null;
    try {
      CapacitorApp.addListener('backButton', () => {
        window.history.back();
      }).then((l) => {
        capListener = l;
      });
    } catch {}

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (capListener && typeof capListener.remove === 'function') {
        capListener.remove();
      }
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const [limitExceededError, setLimitExceededError] = useState<{
    message: string;
    currentUsage: number;
    resetDate: string;
  } | null>(null);

  const [pendingTestParams, setPendingTestParams] = useState<{
    durationMinutes: number;
    questionCount: number;
    difficulty: QuestionDifficulty;
    mode: TestMode;
    instantFeedback: boolean;
  } | null>(null);

  const pendingTestParamsRef = useRef(pendingTestParams);
  const nextScreenAfterAuthRef = useRef(nextScreenAfterAuth);
  const executeStartTestRef = useRef<((params: any) => Promise<void>) | null>(null);

  useEffect(() => {
    pendingTestParamsRef.current = pendingTestParams;
    nextScreenAfterAuthRef.current = nextScreenAfterAuth;
  }, [pendingTestParams, nextScreenAfterAuth]);

  useEffect(() => {
    let isSubscribed = true;

    const processAuthUser = async (user: User, sourceEvent: string) => {
      console.log(`[Supabase Auth Log] Processing user session (Source: ${sourceEvent}):`, {
        email: user.email,
        id: user.id,
        provider: user.app_metadata?.provider || 'email',
      });

      const isUserAdmin = Boolean(user.email && isAdminEmail(user.email));

      // 1. Run profile sync FIRST so that new users (Google OAuth or Email) get created in 'students' table
      if (!userProfile) {
        setProfileSyncing(true);
      }
      let profile: StudentProfile | null = null;
      try {
        profile = await syncUserProfile(user);
        if (isSubscribed && profile) {
          setUserProfile(profile);
        }
      } catch (syncErr) {
        console.error('[Supabase Auth Log] syncUserProfile error:', syncErr);
      } finally {
        if (isSubscribed) {
          setProfileSyncing(false);
        }
      }

      // 2. Check registration status
      const validGrade = Boolean(profile?.grade && profile.grade.trim() && profile.grade !== 'General Student');
      const validStream = Boolean(profile?.stream && profile.stream.trim());
      const isReg = isUserAdmin || Boolean(profile?.is_registered) || (validGrade && validStream);

      const hasHashToken = window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery');
      const hasSearchCode = window.location.search.includes('code=');
      const isPendingOAuth = localStorage.getItem('shs_oauth_redirect') === 'true' || sessionStorage.getItem('shs_oauth_redirect') === 'true';

      if ((hasHashToken || hasSearchCode || isPendingOAuth) && screen !== 'reset_password' && !window.location.pathname.includes('/reset-password')) {
        localStorage.removeItem('shs_oauth_redirect');
        sessionStorage.removeItem('shs_oauth_redirect');
        if (window.location.hash || window.location.search) {
          window.history.replaceState(null, '', window.location.pathname);
        }

        // Retrieve preserved target dashboard section/category prior to login
        const savedClass = sessionStorage.getItem('shs_intended_class') || localStorage.getItem('shs_intended_class');
        const savedGroup = sessionStorage.getItem('shs_intended_group') || localStorage.getItem('shs_intended_group');

        if (savedClass) {
          let pClass: BoardClass = savedClass === 'MDCAT' ? 'MDCAT' : savedClass === 'TCAT' ? 'TCAT' : (parseInt(savedClass, 10) as BoardClass || 9);
          setSelectedClass(pClass);
          if (savedGroup) setSelectedGroup(savedGroup);
          sessionStorage.removeItem('shs_intended_class');
          sessionStorage.removeItem('shs_intended_group');
          localStorage.removeItem('shs_intended_class');
          localStorage.removeItem('shs_intended_group');
        }

        if (!isReg) {
          console.log('[Auth Flow] First-time Google OAuth sign-in detected. Routing to setup wizard...');
          setScreen('guided_wizard');
        } else {
          console.log('[Auth Flow] Returning Google OAuth user detected. Routing to dashboard...');
          const activeScreen = screenRef.current;
          if (activeScreen === 'auth' || activeScreen === 'intro') {
            if (pendingTestParamsRef.current && executeStartTestRef.current) {
              executeStartTestRef.current(pendingTestParamsRef.current);
            } else if (nextScreenAfterAuthRef.current) {
              setScreen(nextScreenAfterAuthRef.current);
              setNextScreenAfterAuth(null);
            } else {
              setScreen('dashboard');
            }
          }
        }
      } else if (!isReg) {
        // Unregistered user on normal session restore
        const currentScreen = screenRef.current;
        if (currentScreen === 'auth' || currentScreen === 'dashboard') {
          console.log('[Auth Flow] Unregistered user detected. Triggering guided setup wizard...');
          setScreen('guided_wizard');
        }
      }
    };

    // 1. Initial Session Check on app load
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isSubscribed) return;

        const user = session?.user ?? null;
        setCurrentUser(user);

        if (user) {
          processAuthUser(user, 'getSession');
        } else {
          setUserProfile(null);
        }

        setAuthLoading(false);
      })
      .catch((err) => {
        console.error('[Supabase Auth Log] getSession() error:', err);
        if (isSubscribed) setAuthLoading(false);
      });

    // 2. Real-time Auth State Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isSubscribed) return;

      const user = session?.user ?? null;
      setCurrentUser(user);

      if (user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        processAuthUser(user, event);
      } else if (!user) {
        setUserProfile(null);
      }

      setAuthLoading(false);
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  // Verify active student session exists in database on protected page load / screen transition
  useEffect(() => {
    if (!currentUser) return;
    const isUserAdmin = Boolean(currentUser.email && isAdminEmail(currentUser.email));
    if (isUserAdmin) return;

    const protectedScreens = ['dashboard', 'subject', 'duration', 'test', 'result', 'admin', 'grades_flow', 'group'];
    if (protectedScreens.includes(screen)) {
      checkUserExistsInDatabase(currentUser.id, currentUser.email).then((exists) => {
        if (!exists) {
          console.warn('[Protected Page Verification] Student record wiped/deleted in database. Forcing sign-out...');
          supabase.auth.signOut().then(() => {
            clearProfileCache();
            localStorage.removeItem('boardly_cached_user');
            localStorage.removeItem('boardly_cached_profile');
            if (currentUser?.id) {
              localStorage.removeItem(`boardly_profile_${currentUser.id}`);
            }
            setCurrentUser(null);
            setUserProfile(null);
            setScreen('auth');
          });
        }
      });
    }
  }, [screen, currentUser]);

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return loadHistoryOffline(currentUser?.id);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    saveHistoryOffline(history, currentUser?.id);
  }, [history, currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchUserTestHistoryFromSupabase(currentUser.id).then((remoteHistory) => {
        if (remoteHistory && Array.isArray(remoteHistory)) {
          setHistory(remoteHistory);
        }
      });
    } else {
      setHistory(loadHistoryOffline());
    }
  }, [currentUser?.id]);

  const handleClearHistory = async () => {
    if (currentUser?.id) {
      const res = await clearUserTestHistoryInSupabase(currentUser.id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete test history from cloud database.');
      }
      // Re-fetch directly from Supabase to confirm data is removed from server
      const confirmedRemote = await fetchUserTestHistoryFromSupabase(currentUser.id);
      setHistory(confirmedRemote);
      clearHistoryOffline(currentUser.id);
    } else {
      setHistory([]);
      clearHistoryOffline();
    }
  };

  // Compute Trail Step
  const getStepNumber = (): number => {
    switch (screen) {
      case 'intro':
        return 0;
      case 'grades_flow':
        return 1;
      case 'group':
        return 2;
      case 'dashboard':
      case 'subject':
        return 3;
      case 'duration':
      case 'auth':
        return 4;
      default:
        return 0;
    }
  };

  const handleGlobalBackInternal = () => {
    const scr = screenRef.current;
    const isRegistered = currentUserRef.current && isRegisteredStudentRef.current && !isAdminRef.current;

    switch (scr) {
      case 'grades_flow':
        setScreen('intro');
        break;
      case 'group':
        setScreen('grades_flow');
        break;
      case 'subject':
        setScreen(isRegistered ? 'dashboard' : 'group');
        break;
      case 'duration':
        setScreen('subject');
        break;
      case 'dashboard':
        setScreen('intro');
        break;
      case 'auth':
        setScreen(authBackScreenRef.current || 'grades_flow');
        break;
      case 'test':
        if (window.confirm('Are you sure you want to exit this test? Progress will be lost.')) {
          setScreen('duration');
        }
        break;
      case 'results':
        setScreen(isRegistered ? 'dashboard' : 'intro');
        break;
      case 'admin':
        setScreen('intro');
        break;
      default:
        setScreen('intro');
    }
  };

  const handleGlobalBack = () => {
    if (showLmsModal) { setShowLmsModal(false); return; }
    if (showPrintModal) { setShowPrintModal(false); return; }
    if (showHistoryModal) { setShowHistoryModal(false); return; }
    if (showCommunityModal) { setShowCommunityModal(false); return; }

    if (window.history.state && !window.history.state.isRoot) {
      window.history.back();
    } else {
      handleGlobalBackInternal();
    }
  };

  const handleSelectClass = (cNum: BoardClass) => {
    sessionStorage.setItem('shs_intended_class', String(cNum));
    localStorage.setItem('shs_intended_class', String(cNum));

    if (cNum === 'MDCAT') {
      setSelectedClass('MDCAT');
      setSelectedGroup('MDCAT');
      sessionStorage.setItem('shs_intended_group', 'MDCAT');
      localStorage.setItem('shs_intended_group', 'MDCAT');
      setScreen('dashboard');
      return;
    }
    if (cNum === 'TCAT') {
      setSelectedClass('TCAT');
      setSelectedGroup('TCAT');
      sessionStorage.setItem('shs_intended_group', 'TCAT');
      localStorage.setItem('shs_intended_group', 'TCAT');
      setScreen('dashboard');
      return;
    }
    setSelectedClass(cNum);
    setScreen('group');
  };

  const handleSelectGroup = (group: string) => {
    sessionStorage.setItem('shs_intended_group', group);
    localStorage.setItem('shs_intended_group', group);
    setSelectedGroup(group);

    if (currentUser) {
      setScreen('dashboard');
    } else {
      setNextScreenAfterAuth('dashboard');
      setAuthBackScreen('group');
      setScreen('auth');
    }
  };

  const handleSelectSubject = (subject: string, topic?: string) => {
    setSelectedSubject(subject);
    setCustomTopic(topic);
    setScreen('duration');
  };

  const startBackgroundGeneration = async (
    fullParams: any,
    initialQuestions: Question[],
    targetTotalCount: number,
    isMdcat: boolean
  ) => {
    if (bgMcqAbortControllerRef.current) {
      bgMcqAbortControllerRef.current.abort();
    }
    const bgAbort = new AbortController();
    bgMcqAbortControllerRef.current = bgAbort;

    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user || currentUser;
    const targetSubject = mapSubject(fullParams.subject || selectedSubject || 'Physics');
    const targetTopic = fullParams.customTopic !== undefined ? fullParams.customTopic : customTopic;
    let currentQuestions = [...initialQuestions];

    while (currentQuestions.length < targetTotalCount && !bgAbort.signal.aborted) {
      const nextBatchCount = Math.min(15, targetTotalCount - currentQuestions.length);
      const existingStems = currentQuestions.map((q) => q.q);

      try {
        const response = await apiFetch('/api/generate-mcqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: bgAbort.signal,
          body: JSON.stringify({
            subject: targetSubject,
            customTopic: targetTopic,
            subtopic: fullParams.subtopic,
            chapterName: fullParams.chapterName,
            path: isMdcat ? 'mdcat' : 'boards',
            classNum: selectedClass,
            group: selectedGroup,
            questionCount: nextBatchCount,
            batchOffset: currentQuestions.length,
            excludeStems: existingStems,
            difficulty: fullParams.difficulty,
            mode: fullParams.mode,
            userId: activeUser?.id || 'guest',
            userEmail: activeUser?.email,
            bypassCache: fullParams.bypassCache || false,
            isFullMock: fullParams.isFullMock || false,
            groupSubjects: fullParams.groupSubjects,
          }),
        });

        if (bgAbort.signal.aborted) break;

        const data = await safeJsonResponse(response);
        if (data?.success && Array.isArray(data.questions) && data.questions.length > 0) {
          const isUrduOrIslamiat = ['urdu', 'islam', 'din'].some((s) => targetSubject.toLowerCase().includes(s));

          let batchValidated: Question[] = [];
          const uniqueDataQuestions = data.questions.filter(
            (q: Question, idx: number, self: Question[]) =>
              idx === self.findIndex((t) => t.q === q.q) &&
              !existingStems.some((e) => e.toLowerCase().trim() === (q.q || '').toLowerCase().trim())
          );

          if (isUrduOrIslamiat) {
            batchValidated = uniqueDataQuestions.filter((q: Question) => {
              const hasUrdu = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(q.q || '');
              const qLower = (q.q || '').toLowerCase();
              const isScience = ["vector", "torque", "mechanics", "newton", "velocity", "acceleration", "physics", "chemistry", "biology", "mitochondria", "derivative"].some((k) => qLower.includes(k));
              return hasUrdu && !isScience;
            });
          } else {
            batchValidated = uniqueDataQuestions.filter((q: Question) => {
              const qLower = (q.q || '').toLowerCase();
              return !["vector quantity", "classical mechanics", "newton's"].some((k) => qLower.includes(k) && !targetSubject.toLowerCase().includes("physic"));
            });
          }

          if (batchValidated.length < nextBatchCount) {
            const prebuiltPool = getPrebuiltQuestionsForSubject(targetSubject);
            const shuffledPrebuilt = [...prebuiltPool].sort(() => 0.5 - Math.random());
            for (const pbq of shuffledPrebuilt) {
              if (batchValidated.length >= nextBatchCount) break;
              if (
                !currentQuestions.some((cq) => (cq.q || '').toLowerCase().trim() === (pbq.q || '').toLowerCase().trim()) &&
                !batchValidated.some((bv) => (bv.q || '').toLowerCase().trim() === (pbq.q || '').toLowerCase().trim())
              ) {
                batchValidated.push({
                  ...pbq,
                  id: `bg-q-${currentQuestions.length + batchValidated.length + 1}-${Date.now()}`,
                });
              }
            }
          }

          if (batchValidated.length > 0) {
            currentQuestions = [...currentQuestions, ...batchValidated];
            setActiveQuestions([...currentQuestions]);
            console.log(`[MCQ Background Batch Appended] Total questions now: ${currentQuestions.length} / ${targetTotalCount}`);
          }
        } else {
          const prebuiltPool = getPrebuiltQuestionsForSubject(targetSubject);
          const shuffledPrebuilt = [...prebuiltPool].sort(() => 0.5 - Math.random());
          const fallbackBatch: Question[] = [];
          for (const pbq of shuffledPrebuilt) {
            if (fallbackBatch.length >= nextBatchCount) break;
            if (!currentQuestions.some((cq) => (cq.q || '').toLowerCase().trim() === (pbq.q || '').toLowerCase().trim())) {
              fallbackBatch.push({
                ...pbq,
                id: `bg-fallback-${currentQuestions.length + fallbackBatch.length + 1}-${Date.now()}`,
              });
            }
          }
          if (fallbackBatch.length > 0) {
            currentQuestions = [...currentQuestions, ...fallbackBatch];
            setActiveQuestions([...currentQuestions]);
            console.log(`[MCQ Background Fallback Batch Appended] Total questions now: ${currentQuestions.length} / ${targetTotalCount}`);
          } else {
            break;
          }
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') break;
        console.warn('[MCQ Background Generation Error, topping up]:', err);
        const prebuiltPool = getPrebuiltQuestionsForSubject(targetSubject);
        const shuffledPrebuilt = [...prebuiltPool].sort(() => 0.5 - Math.random());
        const fallbackBatch: Question[] = [];
        for (const pbq of shuffledPrebuilt) {
          if (fallbackBatch.length >= nextBatchCount) break;
          if (!currentQuestions.some((cq) => (cq.q || '').toLowerCase().trim() === (pbq.q || '').toLowerCase().trim())) {
            fallbackBatch.push({
              ...pbq,
              id: `bg-err-fallback-${currentQuestions.length + fallbackBatch.length + 1}-${Date.now()}`,
            });
          }
        }
        if (fallbackBatch.length > 0) {
          currentQuestions = [...currentQuestions, ...fallbackBatch];
          setActiveQuestions([...currentQuestions]);
        } else {
          break;
        }
      }

      await new Promise((r) => setTimeout(r, 400));
    }
  };

  const executeStartTest = async (params: {
    durationMinutes: number;
    questionCount: number;
    difficulty: QuestionDifficulty;
    mode: TestMode;
    instantFeedback: boolean;
    subject?: string;
    customTopic?: string;
  }) => {
    // Immediately set generating loading state for instant UI feedback
    setIsGenerating(true);

    // Cancel any background generation running from previous tests
    if (bgMcqAbortControllerRef.current) {
      bgMcqAbortControllerRef.current.abort();
    }

    // Fetch fresh session to avoid stale closures immediately after auth success
    const { data: { session } } = await supabase.auth.getSession();
    const activeUser = session?.user || currentUser;

    const targetSubject = mapSubject(params.subject || selectedSubject || 'Physics');
    const targetTopic = params.customTopic !== undefined ? params.customTopic : customTopic;

    // Immediately sync state for downstream consumers
    setSelectedSubject(targetSubject);
    setCustomTopic(targetTopic);

    const isMdcat = selectedClass === 'MDCAT' || selectedGroup === 'MDCAT';

    const config: TestConfig = {
      path: isMdcat ? 'mdcat' : 'boards',
      classNum: selectedClass,
      group: selectedGroup,
      subject: targetSubject,
      customTopic: targetTopic,
      durationMinutes: params.durationMinutes,
      questionCount: params.questionCount,
      difficulty: params.difficulty,
      mode: params.mode,
      instantFeedback: params.instantFeedback,
    };

    setTestConfig(config);

    // Cancel any in-flight MCQ generation request
    if (mcqAbortControllerRef.current) {
      mcqAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    mcqAbortControllerRef.current = abortController;
    const currentReqId = ++mcqRequestIdRef.current;

    const targetTotalCount = params.questionCount;
    const initialBatchCount = Math.min(15, targetTotalCount);

    console.log(`[MCQ Progressive Instant Start] Target Subject: "${targetSubject}", Initial Batch: ${initialBatchCount}, Target Total: ${targetTotalCount}`);

    // 1. Instantly assemble 15 initial questions (and full target pool fallback) from cache & prebuilt bank so the test screen opens immediately (< 0.5s)
    let initialSet: Question[] = getCachedQuestions(targetSubject, targetTopic) || [];
    
    // Top up to targetTotalCount using authentic prebuilt bank
    if (initialSet.length < targetTotalCount) {
      const prebuiltPool = getPrebuiltQuestionsForSubject(targetSubject);
      const shuffledPrebuilt = [...prebuiltPool].sort(() => 0.5 - Math.random());
      for (const pbq of shuffledPrebuilt) {
        if (initialSet.length >= targetTotalCount) break;
        if (!initialSet.some(q => (q.q || '').toLowerCase().trim() === (pbq.q || '').toLowerCase().trim())) {
          initialSet.push({
            ...pbq,
            id: `q-instant-${initialSet.length + 1}-${Date.now()}`
          });
        }
      }
    }

    // Ensure we have at least initialBatchCount questions ready
    const readyQuestions = initialSet.slice(0, Math.max(initialBatchCount, initialSet.length));
    setActiveQuestions(readyQuestions);

    // Immediately open test screen for the student! (0.1s UI latency)
    setScreen('test');
    setIsGenerating(false);
    setPendingTestParams(null);

    // 2. Launch background generation to fetch fresh AI-generated questions asynchronously
    if (targetTotalCount > 0) {
      startBackgroundGeneration(params, readyQuestions, targetTotalCount, isMdcat);
    }
  };

  const handleStartTest = (params: {
    durationMinutes: number;
    questionCount: number;
    difficulty: QuestionDifficulty;
    mode: TestMode;
    instantFeedback: boolean;
    subject?: string;
    customTopic?: string;
  }) => {
    if (isGenerating) return;

    // Immediately trigger loading feedback for 1st tap
    setIsGenerating(true);

    const targetSub = mapSubject(params.subject || selectedSubject || 'Physics');
    const targetTop = params.customTopic !== undefined ? params.customTopic : customTopic;
    const fullParams = { ...params, subject: targetSub, customTopic: targetTop };

    setSelectedSubject(targetSub);
    setCustomTopic(targetTop);
    setPendingTestParams(fullParams);

    if (currentUser) {
      if (!isAdmin) {
        const isExempt =
          userProfile?.payment_status === 'Verified & Paid' ||
          (userProfile?.requires_payment === false &&
            userProfile?.payment_status !== 'Unpaid' &&
            userProfile?.payment_status !== 'Pending Verification' &&
            userProfile?.payment_status !== 'Rejected') ||
          (userProfile?.created_at && isStudentExistingBeforeRule(userProfile.created_at));

        const plans = userProfile?.subscribed_plans || [];
        const isFreeOnly = plans.length === 1 && plans[0] === 'free';

        if (!isExempt && !isFreeOnly) {
          setIsGenerating(false);
          setScreen('payment_required');
          setShowPaymentModal(true);
          return;
        }
      }
      executeStartTest(fullParams);
    } else {
      setIsGenerating(false);
      setScreen('auth');
    }
  };

  const handleFinishTest = async (userAnswers: UserAnswer[], timeTakenSeconds: number) => {
    if (!testConfig) return;

    let correctCount = 0;
    const topicBreakdown: Record<string, { total: number; correct: number }> = {};

    activeQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      const topicName = q.topic || testConfig.subject;

      if (!topicBreakdown[topicName]) {
        topicBreakdown[topicName] = { total: 0, correct: 0 };
      }
      topicBreakdown[topicName].total += 1;

      if (ans && ans.selectedOption === q.correct) {
        correctCount += 1;
        topicBreakdown[topicName].correct += 1;
      }
    });

    const total = activeQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);

    const result: TestResult = {
      id: `res-${Date.now()}`,
      timestamp: Date.now(),
      config: testConfig,
      score: correctCount,
      total,
      percentage,
      timeTakenSeconds,
      topicBreakdown,
      userAnswers,
      questions: activeQuestions,
    };

    setTestResult(result);

    // Save to history
    const pathLabel = `Class ${testConfig.classNum || '9-12'}`;

    const historyItem: HistoryItem = {
      id: result.id,
      dateStr: new Date().toLocaleDateString(),
      subject: testConfig.subject + (testConfig.customTopic ? ` (${testConfig.customTopic})` : ''),
      pathLabel,
      percentage,
      score: correctCount,
      total,
      timeTaken: `${Math.floor(timeTakenSeconds / 60)}m ${timeTakenSeconds % 60}s`,
    };

    setHistory((prev) => [historyItem, ...prev.slice(0, 19)]);

    // Save to Supabase and log MCQ attempts for student weakness profile
    const studentIdToLog = currentUser?.id || 'guest-student-1';
    try {
      await saveTestToSupabase(studentIdToLog, historyItem, result);

      // Refresh history from Supabase / server to ensure immediate update of stats & UI counters
      const updatedHistory = await fetchUserTestHistoryFromSupabase(studentIdToLog);
      if (updatedHistory && Array.isArray(updatedHistory) && updatedHistory.length > 0) {
        setHistory(updatedHistory);
      }
    } catch (saveErr) {
      console.warn('[handleFinishTest save error]:', saveErr);
    }

    // Refresh monthly usage counter if currentUser exists
    if (currentUser?.id) {
      fetchStudentMcqUsage(currentUser.id, currentUser.email).catch(() => {});
    }

    setScreen('results');
  };

  executeStartTestRef.current = executeStartTest;

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0];

  if ((authLoading && !currentUser) || (profileSyncing && (!userProfile || !userProfile.is_registered))) {
    return (
      <div className="min-h-dvh h-dvh sm:min-h-screen bg-[#F8F9FB] dark:bg-[#090909] text-slate-900 dark:text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Glowing ambient background blur with hardware-accelerated continuous ease */}
        <motion.div
          initial={{ opacity: 0.1, scale: 0.8 }}
          animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-80 h-80 bg-emerald-500/20 dark:bg-emerald-500/25 rounded-full blur-3xl pointer-events-none transform-gpu will-change-transform"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] p-8 max-w-sm w-full flex flex-col items-center gap-5 text-center shadow-2xl border border-emerald-500/20 dark:border-white/10 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-xl relative z-10 transform-gpu will-change-transform"
        >
          <HeaderLogo isIntro={false} currentUserEmail={currentUser?.email} />
          
          <div className="flex flex-col items-center gap-3 w-full pt-1">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-3 border-emerald-500/15" />
              <div className="w-11 h-11 rounded-full border-3 border-transparent border-t-emerald-500 border-r-[#F2B90C] animate-spin" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/20 dark:border-emerald-500/30 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Launching Student Dashboard...</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8F9FB] dark:bg-[#090909] text-slate-900 dark:text-white selection:bg-[#F2B90C] selection:text-[#0A0A0A] transition-colors duration-200">
      <MainHeader 
        onMenuClick={() => setShowLmsModal(true)} 
        currentUser={currentUser}
        userProfile={userProfile}
        selectedClass={selectedClass}
        selectedGroup={selectedGroup}
        onTrackClick={() => setShowLmsModal(true)}
        onGoBack={handleGlobalBack}
        onGoHome={() => {
          setScreen('intro');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        canGoBack={screen !== 'intro'}
        isIntroScreen={screen === 'intro'}
        historyCount={history.length}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenLmsPortal={() => setShowLmsModal(true)}
        onStartFree={() => setScreen('grades_flow')}
        onSignOut={async () => {
          await supabase.auth.signOut();
          clearProfileCache();
          try {
            localStorage.removeItem('boardly_cached_user');
            localStorage.removeItem('boardly_cached_profile');
          } catch {}
          setCurrentUser(null);
          setUserProfile(null);
          setScreen('intro');
        }}
        onNavigateDashboard={() => {
          if (currentUser && isAdminEmail(currentUser.email)) {
            setScreen('admin');
          } else {
            setScreen('dashboard');
          }
        }}
        onNavigatePractice={() => setScreen('grades_flow')}
        onOpenStudyBuddy={() => setShowStudyBuddy(true)}
        onNavigateSubscription={() => setScreen('plan_selection')}
        onNavigateAdmin={(tab) => {
          if (tab) {
            setAdminTab(tab);
          } else {
            setAdminTab('students');
          }
          setScreen('admin');
        }}
      />
      
      {isOffline && (
        <div className="w-full bg-[#F2B90C] text-[#0A0A0A] text-center text-xs font-bold py-1.5 flex items-center justify-center gap-1.5 border-b border-black/10">
          <WifiOff className="w-3.5 h-3.5" />
          Offline Mode Active — Using cached MCQs
        </div>
      )}

      <main className={`flex-1 w-full mx-auto flex flex-col items-center justify-start p-2 sm:p-6 overflow-x-hidden ${
        ['intro', 'dashboard', 'admin', 'guided_wizard', 'plan_selection'].includes(screen)
          ? 'max-w-7xl'
          : ['grades_flow', 'test', 'results'].includes(screen)
          ? 'max-w-4xl'
          : 'max-w-3xl'
      }`}>
        <div className={`w-full mx-auto relative flex flex-col flex-1 min-w-0 ${
          ['intro', 'dashboard', 'admin', 'guided_wizard', 'plan_selection'].includes(screen)
            ? 'max-w-7xl'
            : ['grades_flow', 'test', 'results'].includes(screen)
            ? 'max-w-3xl'
            : 'max-w-[580px]'
        }`}>
          {screen !== 'intro' && screen !== 'admin' && (
            <div className="mb-4">
              <StepTrail currentStep={getStepNumber()} totalSteps={4} />
            </div>
          )}

          <div className="flex-1 flex flex-col justify-between min-h-0 w-full relative">
            {currentUser && !isAdmin && userProfile?.status === 'suspended' ? (
              <div className="bg-white dark:bg-[#1C1C1E] border-2 border-rose-500/50 rounded-[28px] p-6 sm:p-8 max-w-lg mx-auto text-center space-y-5 shadow-2xl animate-ios-spring relative overflow-hidden my-8">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto shadow-md">
                  <Lock className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 px-3 py-1 rounded-full inline-block border border-rose-300 dark:border-rose-500/30">
                    Account Suspended
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Access Temporarily Restricted
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-[#8E8E93] leading-relaxed">
                    Your student account (<strong className="text-slate-900 dark:text-white">{currentUser.email}</strong>) has been suspended by the SHS Academy Administrator.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#8E8E93]">
                    You cannot generate practice tests or access study materials while suspended. Please contact <strong className="text-rose-600 dark:text-rose-400">shsvirtualadmin@gmail.com</strong> for assistance or account reactivation.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    clearProfileCache();
                    try {
                      localStorage.removeItem('boardly_cached_user');
                      localStorage.removeItem('boardly_cached_profile');
                    } catch {}
                    setUserProfile(null);
                    setCurrentUser(null);
                    setScreen('intro');
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-full text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {screen === 'intro' && (
                  !currentUser ? (
                    <IntroScreen
                      onContinue={() => setScreen('auth')}
                      onSelectGradesFlow={() => setScreen('auth')}
                      onSelectMdcat={() => {
                        setSelectedClass('MDCAT');
                        setSelectedGroup('MDCAT');
                        setScreen('auth');
                      }}
                      onSelectTcat={() => {
                        setSelectedClass('TCAT');
                        setSelectedGroup('TCAT');
                        setScreen('auth');
                      }}
                      onOpenCommunity={() => setShowCommunityModal(true)}
                      onOpenHistory={() => setShowHistoryModal(true)}
                      onOpenLmsPortal={() => setScreen('auth')}
                      onOpenStudyBuddy={() => setShowStudyBuddy(true)}
                      historyCount={history.length}
                    />
                  ) : (
                    <StudentHomeDashboard
                      currentUser={currentUser}
                      userProfile={userProfile}
                      history={history}
                      isAdmin={isAdmin}
                      onSelectMdcat={() => handleSelectClass('MDCAT')}
                      onSelectTcat={() => handleSelectClass('TCAT')}
                      onStartPracticeTest={() => {
                        if (isRegisteredStudent) {
                          setScreen('dashboard');
                        } else {
                          setScreen('guided_wizard');
                        }
                      }}
                      onPracticeWeakTopic={(subject, topic) => {
                        const targetSubject = mapSubject(subject);
                        setSelectedSubject(targetSubject);
                        setCustomTopic(topic);
                        if (isRegisteredStudent) {
                          setScreen('duration');
                        } else {
                          setScreen('guided_wizard');
                        }
                      }}
                      onOpenLmsPortal={() => setShowLmsModal(true)}
                      onOpenHistory={() => setShowHistoryModal(true)}
                      onOpenCommunity={() => setShowCommunityModal(true)}
                    />
                  )
                )}
                {screen === 'guided_wizard' && (
                  <GuidedSetupWizard
                    onComplete={handleWizardComplete}
                    onBackToHome={() => setScreen('intro')}
                  />
                )}
                {screen === 'plan_selection' && (
                  <div className="w-full space-y-4 animate-fadeIn">
                    {trackNotice && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-2">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>{trackNotice}</span>
                      </div>
                    )}
                    <PlanSelectionScreen
                      userProfile={userProfile}
                      currentTestsUsed={history.length}
                      onSelectPlans={handleSelectPlans}
                    />
                  </div>
                )}
                {screen === 'payment_required' && currentUser && (
                  <PaymentRequiredScreen
                    currentUser={currentUser}
                    userProfile={userProfile}
                    onOpenPaymentModal={() => setShowPaymentModal(true)}
                    onRefreshProfile={async () => {
                      await refreshUserProfile();
                    }}
                    onSignOut={async () => {
                      await supabase.auth.signOut();
                      setCurrentUser(null);
                      setUserProfile(null);
                      setScreen('intro');
                    }}
                  />
                )}
                {screen === 'grades_flow' && (
                  <GradesFlowScreen
                    onSelectClass={handleSelectClass}
                    onBack={() => setScreen('intro')}
                    userProfile={userProfile}
                    isRegisteredStudent={isRegisteredStudent}
                    isAdmin={isAdmin}
                    onAutoRedirectLocked={(cNum, grp) => {
                      setSelectedClass(cNum);
                      setSelectedGroup(grp);
                      setScreen('dashboard');
                    }}
                  />
                )}
                {screen === 'group' && (
                  <ClassGroupScreen selectedClass={selectedClass!} onSelectGroup={handleSelectGroup} onBack={() => setScreen('grades_flow')} />
                )}
                {screen === 'auth' && (
                  <LmsAuthScreen onSuccess={() => {
                    const isUserAdmin = Boolean(currentUser?.email && isAdminEmail(currentUser.email));
                    if (isUserAdmin || nextScreenAfterAuth === 'admin') {
                      setScreen('admin');
                      setNextScreenAfterAuth(null);
                    } else if (!userProfile?.is_registered) {
                      setScreen('guided_wizard');
                    } else if (!userProfile?.subscribed_plans || userProfile.subscribed_plans.length === 0) {
                      setScreen('plan_selection');
                    } else {
                      setScreen(nextScreenAfterAuth || 'dashboard');
                      setNextScreenAfterAuth(null);
                    }
                  }} selectedGradeContext={selectedClass?.toString()} onBack={() => setScreen(authBackScreen || 'intro')} />
                )}
                {screen === 'dashboard' && (
                  <ClassStreamDashboard
                    classNum={selectedClass || 9}
                    group={selectedGroup || 'Medical'}
                    history={history}
                    isAdmin={isAdmin}
                    currentUser={currentUser}
                    isGenerating={isGenerating}
                    onOpenAuth={(intendedParams) => {
                      if (intendedParams) {
                        setPendingTestParams(intendedParams);
                      }
                      setNextScreenAfterAuth('dashboard');
                      setAuthBackScreen('dashboard');
                      setScreen('auth');
                    }}
                    onSelectStream={(c, g) => {
                      setSelectedClass(c);
                      setSelectedGroup(g);
                    }}
                    onStartTest={handleStartTest}
                    onBackToClasses={() => {
                      setScreen('plan_selection');
                    }}
                  />
                )}
                {screen === 'subject' && (
                  <SubjectScreen 
                    selectedClass={selectedClass}
                    group={selectedGroup}
                    onSelectSubject={(subject, topic) => {
                      setSelectedSubject(subject);
                      setCustomTopic(topic);
                      setScreen('duration');
                    }}
                    onBack={() => setScreen('group')}
                  />
                )}
                {screen === 'duration' && (
                  <DurationScreen 
                    subject={selectedSubject}
                    customTopic={customTopic}
                    currentUser={currentUser}
                    onStartTest={handleStartTest}
                    onBack={() => setScreen('subject')}
                    isGenerating={isGenerating}
                  />
                )}
                {screen === 'test' && (
                  <TestScreen
                    questions={activeQuestions}
                    config={testConfig || {
                      path: 'boards',
                      subject: selectedSubject,
                      classNum: selectedClass || 9,
                      group: selectedGroup,
                      durationMinutes: 10,
                      questionCount: 10,
                      difficulty: 'Exam Standard',
                      mode: 'instant',
                      instantFeedback: true,
                    }}
                    currentUser={currentUser}
                    onFinishTest={handleFinishTest}
                    onExitTest={() => setScreen('duration')}
                    onExplainMcq={(mcqCtx) => {
                      setStudyBuddyContext(mcqCtx);
                      setShowStudyBuddy(true);
                    }}
                  />
                )}
                {screen === 'results' && testResult && (
                  <ResultsScreen
                    result={testResult}
                    currentUser={currentUser}
                    onTakeAnother={() => setScreen('plan_selection')}
                    onOpenPrintModal={() => setShowPrintModal(true)}
                    onBackToHome={() => setScreen('intro')}
                    onExplainMcq={(mcqCtx) => {
                      setStudyBuddyContext(mcqCtx);
                      setShowStudyBuddy(true);
                    }}
                  />
                )}
                {screen === 'admin' && (
                  isAdmin && currentUser ? (
                    <AdminDashboardScreen currentUser={currentUser} initialTab={adminTab} onBack={() => setScreen('intro')} />
                  ) : (
                    <div className="text-center py-12 animate-ios-spring">
                      <p className="text-xs font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 py-3 px-6 rounded-full inline-block">
                        Unauthorized Route Access. Redirecting...
                      </p>
                    </div>
                  )
                )}
                {screen === 'reset_password' && (
                  <ResetPasswordScreen
                    onNavigateToLogin={() => {
                      if (window.location.hash || window.location.search || window.location.pathname.includes('/reset-password')) {
                        window.history.replaceState(null, '', '/');
                      }
                      setShowLmsModal(true);
                      setScreen('intro');
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Study Buddy Chatbot (Floating button + bottom-sheet modal across all screens) */}
      <StudyBuddyModal
        isOpen={showStudyBuddy}
        onClose={() => setShowStudyBuddy((prev) => !prev)}
        preloadedContext={studyBuddyContext}
        onClearPreloadedContext={() => setStudyBuddyContext(null)}
        studentProfile={userProfile}
        selectedClass={selectedClass}
        selectedGroup={selectedGroup}
        selectedSubject={selectedSubject}
      />

      {/* Free Plan 2-Test Limit Overlay Modal */}
      {freeLimitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#121214] border border-[#F2B90C]/40 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-[#F2B90C]/10 border border-[#F2B90C]/30 text-[#F2B90C] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#F2B90C] bg-[#F2B90C]/10 px-3 py-1 rounded-full border border-[#F2B90C]/30 inline-block">
                Free Plan Limit Reached (2/2 Used)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white font-['Space_Grotesk']">
                2 Practice Tests Limit Reached
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have used your <strong>2 free practice tests</strong> on the Free Starter Plan. Upgrade to a Paid Plan to unlock <strong>unlimited practice tests</strong> and full track access.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setFreeLimitModalOpen(false);
                  setTrackNotice('You have reached the 2 practice test limit on the Free Plan. Select a paid plan to unlock unlimited practice tests.');
                  setScreen('plan_selection');
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#F2B90C] to-amber-500 hover:from-amber-400 hover:to-[#F2B90C] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#F2B90C]/20 active:scale-95 cursor-pointer"
              >
                <span>View Paid Plans & Upgrade</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => setFreeLimitModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPrintModal && testResult && (
        <PrintableTestModal result={testResult} onClose={() => setShowPrintModal(false)} />
      )}
      {showCommunityModal && (
        <CommunityModal onClose={() => setShowCommunityModal(false)} />
      )}
      {showHistoryModal && (
        <HistoryModal 
          history={history} 
          onClearHistory={handleClearHistory}
          onClose={() => setShowHistoryModal(false)} 
        />
      )}
      {showLmsModal && (
        <LmsPortalModal
          currentUser={currentUser}
          userProfile={userProfile}
          onClose={() => setShowLmsModal(false)}
          onRefreshProfile={() => refreshUserProfile()}
          onStartPractice={() => {
            setShowLmsModal(false);
            setScreen('grades_flow');
          }}
          onOpenAdminDashboard={() => {
            setShowLmsModal(false);
            setScreen('admin');
          }}
        />
      )}

      {showPaymentModal && currentUser && (
        <PaymentProofModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          currentUser={currentUser}
          studentProfile={userProfile}
          onSubmitted={async () => {
            if (currentUser?.id) {
              const updated = await fetchStudentProfileFromSupabase(currentUser.id, true);
              if (updated) setUserProfile(updated);
            }
          }}
        />
      )}

      {/* MCQ Generation Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[300] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-ios-spring">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#F2B90C]/20 border-t-[#F2B90C] animate-spin" />
              <div className="w-8 h-8 absolute rounded-full overflow-hidden p-0.5 bg-[#0A0A0A] border border-[#F2B90C]/40 flex items-center justify-center shadow-sm">
                <img
                  src="/logo.png"
                  alt="Boardly Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/logo.png';
                  }}
                />
              </div>
            </div>
            <div>
              <h3 className="font-['Space_Grotesk'] text-lg font-extrabold text-slate-900 dark:text-white">
                Generating Your MCQs...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                Crafting curriculum-aligned questions with detailed scientific explanations. Please wait a moment.
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#F2B90C] h-full animate-pulse w-full" />
            </div>
          </div>
        </div>
      )}

      {showExitToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 font-bold text-xs sm:text-sm px-5 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/20 dark:border-black/20 flex items-center gap-2.5 animate-ios-spring pointer-events-none transition-all">
          <ShieldAlert className="w-4 h-4 text-[#F2B90C] dark:text-amber-600 shrink-0" />
          <span>Press back again to exit</span>
        </div>
      )}
    </div>
  );
};

export const AppWithSettings: React.FC = () => {
  return (
    <ThemeProvider>
      <SiteSettingsProvider>
        <App />
      </SiteSettingsProvider>
    </ThemeProvider>
  );
};

export default AppWithSettings;
