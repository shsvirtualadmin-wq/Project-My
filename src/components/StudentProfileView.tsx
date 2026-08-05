import React, { useState } from 'react';
import { StudentProfile, User, updateStudentPersonalInfo, supabase } from '../lib/supabase';
import { renderTargetUniversityBadge } from './InstitutionBadge';
import { TargetUniversityModal } from './TargetUniversityModal';
import {
  User as UserIcon,
  Mail,
  Phone,
  Edit2,
  Lock,
  Award,
  BookOpen,
  GraduationCap,
  Info,
  CheckCircle2,
  X,
  Check,
  ShieldCheck,
  Calendar,
  Sparkles,
  CreditCard,
  Layers,
  LogOut,
} from 'lucide-react';

interface StudentProfileViewProps {
  user: User;
  profile: StudentProfile;
  onRefreshProfile: () => void;
  onStartPractice?: () => void;
  onSignOut?: () => void;
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({
  user,
  profile,
  onRefreshProfile,
  onStartPractice,
  onSignOut,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(profile.name || '');
  const [editPhone, setEditPhone] = useState<string>(profile.phone || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showUniModal, setShowUniModal] = useState<boolean>(false);

  const initialLetter = (profile.name || user.email || 'S').charAt(0).toUpperCase();

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) return;

    setIsSaving(true);
    const res = await updateStudentPersonalInfo(user.id, {
      name: editName,
      phone: editPhone,
    });

    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
      setToastMsg('Personal details updated successfully!');
      setTimeout(() => setToastMsg(null), 3000);
      onRefreshProfile();
    } else {
      alert(res.message || 'Failed to update personal details.');
    }
  };

  // Convert subject array or string into comma-separated list
  const getSubjectListString = (): string => {
    if (Array.isArray(profile.subjects)) {
      return profile.subjects.join(', ');
    }
    if (typeof profile.subjects === 'string' && profile.subjects.trim()) {
      return profile.subjects;
    }
    return 'Biology, Chemistry, Physics, Mathematics, English, Urdu, Islamiat';
  };

  const subjectListStr = getSubjectListString();
  const truncatedSubjects =
    subjectListStr.length > 55 ? subjectListStr.substring(0, 55) + '…' : subjectListStr;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 py-2 px-3 sm:px-4 text-left animate-ios-spring">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-[#0A0A0A] text-white border border-[#F2B90C] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#F2B90C]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-extrabold text-[#0A0A0A] dark:text-white leading-tight">
            My Profile
          </h2>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0A0A0A] dark:text-[#F2B90C] bg-[#F2B90C]/20 border border-[#F2B90C]/40 px-3 py-1 rounded-full">
            Boardly LMS
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          View and update your personal info, course enrollments, and class package details.
        </p>
      </div>

      {/* 1. Main Profile Card */}
      <div className="bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4 relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#F2B90C]/15 dark:bg-[#F2B90C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Initial Letter Avatar on Gold Square */}
            <div className="w-14 h-14 bg-[#F2B90C] text-[#0A0A0A] font-extrabold text-2xl flex items-center justify-center rounded-2xl shadow-lg shrink-0 border-2 border-white/20">
              {initialLetter}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900 dark:text-white leading-tight">
                  {profile.name || 'Student Account'}
                </h3>
                <span className="bg-[#F2B90C] text-[#0A0A0A] text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  STUDENT ACCOUNT
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-300 font-medium pt-0.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-[#F2B90C]" />
                  <span>{profile.email}</span>
                </span>
                {profile.phone && (
                  <>
                    <span className="hidden sm:inline text-slate-600">&bull;</span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-[#F2B90C]" />
                      <span>{profile.phone}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Personal Details Card (With Edit Details button for Name & Phone) */}
      <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#F2B90C]" />
            <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
              Personal Details
            </h3>
          </div>

          {!isEditing ? (
            <button
              onClick={() => {
                setEditName(profile.name || '');
                setEditPhone(profile.phone || '');
                setIsEditing(true);
              }}
              className="px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-[#F2B90C] hover:text-[#0A0A0A] text-[#0A0A0A] dark:text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer border border-black/5 dark:border-white/10"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit details</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
              title="Cancel editing"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-[#202020] p-3.5 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
                Full Name
              </span>
              <span className="font-extrabold text-sm text-[#0A0A0A] dark:text-white block">
                {profile.name || 'Not provided'}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-[#202020] p-3.5 rounded-2xl border border-black/5 dark:border-white/5 space-y-1">
              <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
                WhatsApp / Phone Number
              </span>
              <span className="font-extrabold text-sm text-[#0A0A0A] dark:text-white block">
                {profile.phone || 'Not provided'}
              </span>
            </div>

            {/* Email locked badge */}
            <div className="bg-slate-50 dark:bg-[#202020] p-3.5 rounded-2xl border border-black/5 dark:border-white/5 space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                  Google Account Email (Locked)
                </span>
                <span className="text-[10px] font-extrabold text-[#F2B90C] flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Permanent Read-Only
                </span>
              </div>
              <span className="font-semibold text-xs text-slate-600 dark:text-slate-300 block">
                {profile.email}
              </span>
            </div>
          </div>
        ) : (
          /* Inline Edit Form for Full Name & Phone */
          <form onSubmit={handleSaveDetails} className="space-y-4 text-xs animate-ios-spring">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0A0A0A] dark:text-slate-200 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#202020] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#F2B90C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A0A0A] dark:text-slate-200 mb-1">
                  WhatsApp / Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#202020] border border-black/10 dark:border-white/10 rounded-2xl px-4 py-2.5 text-xs font-extrabold text-[#0A0A0A] dark:text-white focus:outline-none focus:border-[#F2B90C]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-[#0A0A0A] text-white dark:bg-[#F2B90C] dark:text-[#0A0A0A] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
              >
                {isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Course Registration Card (Read-only for Student, No Edit Button) */}
      <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#F2B90C]" />
            <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
              Course Registration
            </h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full">
            Read-Only Record
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Exam Board */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#202020] border border-black/5 dark:border-white/5 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>Exam Board</span>
            </div>
            <span className="font-extrabold text-sm text-[#0A0A0A] dark:text-white block">
              FBISE
            </span>
          </div>

          {/* Grade / Class */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#202020] border border-black/5 dark:border-white/5 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>Grade / Class</span>
            </div>
            <span className="font-extrabold text-sm text-[#0A0A0A] dark:text-white block">
              {profile.grade || 'Class 11'}
            </span>
          </div>

          {/* Academic Stream */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#202020] border border-black/5 dark:border-white/5 rounded-2xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-[#F2B90C]" />
              <span>Academic Stream</span>
            </div>
            <span className="font-extrabold text-sm text-[#0A0A0A] dark:text-white block truncate">
              {profile.stream || 'Pre-Medical Stream'}
            </span>
          </div>

          {/* Target University */}
          <div className="p-3.5 bg-slate-50 dark:bg-[#202020] border border-black/5 dark:border-white/5 rounded-2xl space-y-1.5 sm:col-span-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5 text-[#F2B90C]" />
                <span>Target University</span>
              </div>
              <button
                type="button"
                onClick={() => setShowUniModal(true)}
                className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
            <div>
              {renderTargetUniversityBadge(
                profile.dream_university || profile.target_university,
                'md',
                () => setShowUniModal(true)
              )}
            </div>
          </div>
        </div>

        {/* Gray Info Box */}
        <div className="p-3.5 bg-slate-100/80 dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <Info className="w-4 h-4 text-[#F2B90C] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Please contact the SHS Academy Administrator if you need to update your registered course or subject combos.
          </p>
        </div>
      </div>

      {/* 4. Course Enrollment Details Card */}
      <div className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#F2B90C]" />
            <h3 className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
              Course Enrollment Details
            </h3>
          </div>

          {/* Active Subscription Green Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Active Subscription</span>
          </span>
        </div>

        {/* Read-Only Summary Table */}
        <div className="divide-y divide-black/5 dark:divide-white/10 border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-[#202020] flex justify-between items-center">
            <span className="font-bold text-slate-500">Purchased Package</span>
            <span className="font-extrabold text-[#0A0A0A] dark:text-white">
              {profile.package_name || 'Free Plan'}
            </span>
          </div>

          <div className="p-3.5 bg-white dark:bg-[#151515] flex justify-between items-start gap-4">
            <span className="font-bold text-slate-500 shrink-0">Enrolled Subjects</span>
            <span className="font-bold text-[#0A0A0A] dark:text-slate-200 text-right truncate max-w-xs" title={subjectListStr}>
              {truncatedSubjects}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#202020] flex justify-between items-center">
            <span className="font-bold text-slate-500">Enrollment Date</span>
            <span className="font-extrabold text-[#0A0A0A] dark:text-white">
              {profile.enrollment_date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="p-3.5 bg-white dark:bg-[#151515] flex justify-between items-center">
            <span className="font-bold text-slate-500">Payment Status</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified &amp; Paid</span>
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#202020] flex justify-between items-center">
            <span className="font-bold text-slate-500">Access Expires</span>
            <span className="font-extrabold text-[#0A0A0A] dark:text-white">
              {profile.access_expires || new Date(Date.now() + 365*24*3600*1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Row: Log Out of Account */}
      <div className="pt-2">
        <button
          onClick={async () => {
            try {
              await supabase.auth.signOut();
            } catch (err) {
              console.error('Logout error:', err);
            }
            if (onSignOut) {
              onSignOut();
            }
          }}
          className="w-full bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-200 dark:hover:bg-rose-500/20 text-rose-900 dark:text-[#FF453A] border border-rose-300 dark:border-rose-500/20 font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-xs shadow-sm"
        >
          <LogOut className="w-4 h-4 text-rose-700 dark:text-[#FF453A]" />
          <span>Log Out of Account</span>
        </button>
      </div>

      <TargetUniversityModal
        isOpen={showUniModal}
        onClose={() => setShowUniModal(false)}
        currentUser={user}
        userProfile={profile}
        onUniversityUpdated={() => {
          onRefreshProfile();
        }}
      />
    </div>
  );
};
