import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  supabase,
  fetchStudentProfileFromSupabase,
  syncUserProfile,
  User,
  StudentProfile,
} from '../lib/supabase';
import { LmsAuthScreen } from './LmsAuthScreen';
import { LmsDashboard } from './LmsDashboard';
import { StudentRegistrationFlow } from './StudentRegistrationFlow';
import { X } from 'lucide-react';

interface LmsPortalModalProps {
  onClose: () => void;
  onStartPractice: () => void;
  onOpenAdminDashboard?: () => void;
  onRefreshProfile?: () => void;
  selectedGradeContext?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: (newTheme: 'light' | 'dark') => void;
  currentUser?: User | null;
  userProfile?: StudentProfile | null;
}

export const LmsPortalModal: React.FC<LmsPortalModalProps> = ({
  onClose,
  onStartPractice,
  onOpenAdminDashboard,
  onRefreshProfile,
  selectedGradeContext,
  theme,
  onToggleTheme,
  currentUser: initialUser,
  userProfile: initialProfile,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser ?? null);
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(initialProfile ?? null);
  // If we already have a user and profile passed in from parent, loading can start as false immediately
  const [loading, setLoading] = useState<boolean>(() => {
    if (initialUser) return !initialProfile;
    return initialUser === undefined;
  });

  // Sync state if parent props update
  useEffect(() => {
    if (initialUser !== undefined) {
      setCurrentUser(initialUser);
    }
    if (initialProfile !== undefined) {
      setUserProfile(initialProfile);
      setLoading(false);
    }
  }, [initialUser, initialProfile]);

  const fetchProfile = async (user: User) => {
    try {
      let p = await fetchStudentProfileFromSupabase(user.id);
      if (!p) {
        p = await syncUserProfile(user);
      }
      setUserProfile(p);
      return p;
    } catch (err) {
      console.error('Failed to sync profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      const user = session?.user ?? initialUser ?? null;
      setCurrentUser(user);
      if (user) {
        // Only fetch if initialProfile wasn't provided or matches current user
        if (initialProfile && initialUser?.id === user.id) {
          setUserProfile(initialProfile);
          setLoading(false);
        } else {
          await fetchProfile(user);
          if (isMounted) setLoading(false);
        }
      } else {
        setUserProfile(null);
        if (isMounted) setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        setLoading(true);
        await fetchProfile(user);
        if (isMounted) setLoading(false);
      } else {
        setUserProfile(null);
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const isAdmin = Boolean(currentUser?.email && currentUser.email.trim().toLowerCase() === 'shsvirtualadmin@gmail.com');
  const hasGradeAndStream = Boolean(
    userProfile?.grade &&
    userProfile?.grade.trim() &&
    userProfile?.grade !== 'General Student' &&
    userProfile?.stream &&
    userProfile?.stream.trim()
  );
  const isRegisteredStudent = isAdmin || Boolean(userProfile?.is_registered) || hasGradeAndStream;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`rounded-t-[32px] sm:rounded-[32px] p-6 w-full shadow-2xl relative animate-ios-spring max-h-[90vh] overflow-y-auto transition-colors duration-200 ${!currentUser ? 'bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white max-w-md' : 'bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white max-w-xl'}`}>
        <div className="w-9 h-1 bg-black/10 dark:bg-white/20 rounded-full mx-auto mb-3" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-all cursor-pointer active:scale-95 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {loading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="py-12 text-center text-xs font-semibold flex flex-col items-center justify-center gap-3 transform-gpu will-change-transform"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-3 border-emerald-500/15" />
              <div className="w-9 h-9 border-3 border-transparent border-t-emerald-500 border-r-[#F2B90C] rounded-full animate-spin" />
            </div>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-3.5 py-1.5 rounded-full border border-emerald-500/20 dark:border-emerald-500/30 shadow-xs">
              Launching SHS Student Dashboard...
            </span>
          </motion.div>
        ) : currentUser ? (
          !isRegisteredStudent ? (
            <StudentRegistrationFlow
              user={currentUser}
              onRegistrationComplete={(completedProfile) => {
                setUserProfile(completedProfile);
                onRefreshProfile?.();
                onClose();
              }}
              onSignOut={handleSignOut}
            />
          ) : (
            <LmsDashboard
              user={currentUser}
              profile={userProfile}
              theme={theme}
              onToggleTheme={onToggleTheme}
              onStartPractice={() => {
                onClose();
                onStartPractice();
              }}
              onOpenAdminDashboard={
                onOpenAdminDashboard
                  ? () => {
                      onClose();
                      onOpenAdminDashboard();
                    }
                  : undefined
              }
              onRefreshProfile={() => fetchProfile(currentUser)}
              onLogout={handleSignOut}
            />
          )
        ) : (
          <LmsAuthScreen onSuccess={() => {}} selectedGradeContext={selectedGradeContext} />
        )}
      </div>
    </div>
  );
};

