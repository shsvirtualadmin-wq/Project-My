import React, { useState, useEffect } from 'react';
import { StudyBuddyFormattedMessage } from './StudyBuddyFormattedMessage';
import {
  supabase,
  isAdminEmail,
  fetchAllStudentsFromSupabase,
  fetchAllTestResultsFromSupabase,
  fetchStudentTestResultsFromSupabase,
  fetchAllStudentWeaknessProfiles,
  fetchStudentStudyBuddyHistoryFromSupabase,
  fetchAllStudyBuddyHistoryFromSupabase,
  updateStudentGradeAndStreamInSupabase,
  permanentlyDeleteTestRecordInSupabase,
  removeStudentAccountInSupabase,
  updateStudentStatusInSupabase,
  fetchAllPaymentRequestsFromSupabase,
  reviewPaymentRequestInSupabase,
  updateStudentPlanInSupabase,
  fetchAdminActivityLogsFromSupabase,
  AdminActivityLog,
  PaymentRequest,
  StudentWeaknessProfileData,
  User,
  StudentProfile,
  AdminTestResult,
  StudyBuddyMessage,
} from '../lib/supabase';
import { getPrebuiltQuestionsForSubject } from '../data/prebuiltQuestions';
import { AdminBulkMcqImportTab } from './AdminBulkMcqImportTab';
import {
  ShieldCheck,
  Search,
  Users,
  Download,
  ArrowLeft,
  Mail,
  GraduationCap,
  Calendar,
  Key,
  Lock,
  User as UserIcon,
  RefreshCw,
  FileText,
  Award,
  BookOpen,
  BarChart2,
  Copy,
  Check,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ListChecks,
  Database,
  Sparkles,
  RotateCcw,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Trash2,
  Loader2,
  Target,
  MessageSquare,
  Phone,
  Bot,
  UserCheck,
  UserX,
  Zap,
  UploadCloud,
  CreditCard,
  Clock,
  ExternalLink,
  Eye,
} from 'lucide-react';

interface AdminDashboardScreenProps {
  currentUser: User | null;
  initialTab?: 'students' | 'payment_requests' | 'activity_logs' | 'tests' | 'progress' | 'study_buddy' | 'audit' | 'rls' | 'bulk_import';
  onBack: () => void;
}

export interface AuditResultItem {
  id: string;
  subject: string;
  topic: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  status: 'clean' | 'flagged';
  issues: string[];
  source: string;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = React.memo(({
  currentUser,
  initialTab = 'students',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'students' | 'payment_requests' | 'activity_logs' | 'tests' | 'progress' | 'study_buddy' | 'audit' | 'rls' | 'bulk_import'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [allTestResults, setAllTestResults] = useState<AdminTestResult[]>([]);
  const [allStudyBuddyHistory, setAllStudyBuddyHistory] = useState<StudyBuddyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Payment Requests State & Filters
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [paymentSearchQuery, setPaymentSearchQuery] = useState<string>('');
  const [reviewingRequestId, setReviewingRequestId] = useState<string | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<PaymentRequest | null>(null);
  const [rejectNote, setRejectNote] = useState<string>('');
  const [paymentToast, setPaymentToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Student directory filters
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('All');
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>('All');
  const [studentPlanFilter, setStudentPlanFilter] = useState<string>('All');

  // Admin Activity Logs & Manual Plan Change State
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');
  const [selectedStudentForPlan, setSelectedStudentForPlan] = useState<StudentProfile | null>(null);
  const [selectedPlansForChange, setSelectedPlansForChange] = useState<string[]>(['free']);
  const [customPackageName, setCustomPackageName] = useState<string>('');
  const [expirationMonths, setExpirationMonths] = useState<number>(12);
  const [planAdminNote, setPlanAdminNote] = useState<string>('');
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [planToast, setPlanToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);

  // Student Progress breakdown state
  const [progressSearch, setProgressSearch] = useState<string>('');
  const [progressGradeFilter, setProgressGradeFilter] = useState<string>('All');
  const [progressSubjectFilter, setProgressSubjectFilter] = useState<string>('All');
  const [selectedStudentForProgress, setSelectedStudentForProgress] = useState<StudentProfile | null>(null);
  const [studentWeaknessProfiles, setStudentWeaknessProfiles] = useState<StudentWeaknessProfileData[]>([]);

  // MCQ Audit State
  const [auditSubjectFilter, setAuditSubjectFilter] = useState<string>('All');
  const [auditStatusFilter, setAuditStatusFilter] = useState<'all' | 'flagged' | 'clean'>('all');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResults, setAuditResults] = useState<AuditResultItem[]>([]);
  const [dismissedFlagIds, setDismissedFlagIds] = useState<string[]>([]);
  const [sanitizedCount, setSanitizedCount] = useState<number>(0);

  // Admin Override state for student class/stream
  const [editStudentGrade, setEditStudentGrade] = useState<string>('');
  const [editStudentStream, setEditStudentStream] = useState<string>('');
  const [isSavingGradeStream, setIsSavingGradeStream] = useState<boolean>(false);
  const [adminOverrideToast, setAdminOverrideToast] = useState<string | null>(null);

  // Permanent record deletion state for Admin
  const [deletingRecord, setDeletingRecord] = useState<AdminTestResult | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState<boolean>(false);
  const [deleteRecordError, setDeleteRecordError] = useState<string | null>(null);

  // Student Account Removal & Status Toggle State
  const [studentToRemove, setStudentToRemove] = useState<StudentProfile | null>(null);
  const [removeConfirmText, setRemoveConfirmText] = useState<string>('');
  const [isRemovingStudent, setIsRemovingStudent] = useState<boolean>(false);
  const [removeStudentError, setRemoveStudentError] = useState<string | null>(null);
  const [removeSuccessToast, setRemoveSuccessToast] = useState<string | null>(null);
  const [togglingStatusStudentId, setTogglingStatusStudentId] = useState<string | null>(null);

  // Student Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [studentHistory, setStudentHistory] = useState<AdminTestResult[]>([]);
  const [selectedStudentBuddyHistory, setSelectedStudentBuddyHistory] = useState<StudyBuddyMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingBuddyHistory, setLoadingBuddyHistory] = useState(false);
  const [detailSubTab, setDetailSubTab] = useState<'tests' | 'study_buddy'>('tests');

  // AI Study Buddy tab search
  const [studyBuddySearch, setStudyBuddySearch] = useState<string>('');

  // Clipboard copy state
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Active user auth detection
  const [activeUser, setActiveUser] = useState<User | null>(currentUser);

  useEffect(() => {
    if (currentUser) {
      setActiveUser(currentUser);
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setActiveUser(session.user);
        }
      });
    }
  }, [currentUser]);

  const rawEmail = activeUser?.email || currentUser?.email || '';
  const detectedEmail = rawEmail.trim().toLowerCase();
  const isAdmin = isAdminEmail(detectedEmail);

  // Immediate Security Auto-Redirect Effect for Non-Admin Attempts
  useEffect(() => {
    if ((activeUser || currentUser) && !isAdmin) {
      console.warn('[Admin Security Guard]: Non-admin student access attempt detected in AdminDashboardScreen. Triggering redirect...');
      onBack();
    }
  }, [activeUser, currentUser, isAdmin, onBack]);

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [studentList, testList, weaknessList, buddyList, paymentList, logsList] = await Promise.all([
        fetchAllStudentsFromSupabase(),
        fetchAllTestResultsFromSupabase(),
        fetchAllStudentWeaknessProfiles(),
        fetchAllStudyBuddyHistoryFromSupabase(),
        fetchAllPaymentRequestsFromSupabase(detectedEmail),
        fetchAdminActivityLogsFromSupabase(detectedEmail),
      ]);
      setStudents(studentList);
      setAllTestResults(testList);
      setStudentWeaknessProfiles(weaknessList);
      setAllStudyBuddyHistory(buddyList);
      setPaymentRequests(paymentList);
      setActivityLogs(logsList);
    } catch (err: any) {
      console.error('Failed to fetch admin data from Supabase:', err);
      setError('Failed to load live admin data from Supabase Postgres.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlanModal = (student: StudentProfile) => {
    setSelectedStudentForPlan(student);
    const existingPlans = student.subscribed_plans && student.subscribed_plans.length > 0 ? student.subscribed_plans : ['free'];
    setSelectedPlansForChange(existingPlans);
    setCustomPackageName(student.package_name || '');
    setExpirationMonths(12);
    setPlanAdminNote('');
    setPlanToast(null);
  };

  const handleTogglePlanOption = (planKey: string) => {
    if (planKey === 'free') {
      setSelectedPlansForChange(['free']);
      return;
    }

    let next = selectedPlansForChange.filter(p => p !== 'free');
    if (next.includes(planKey)) {
      next = next.filter(p => p !== planKey);
    } else {
      next.push(planKey);
    }

    if (next.length === 0) {
      next = ['free'];
    }
    setSelectedPlansForChange(next);
  };

  const handleSaveStudentPlan = async () => {
    if (!selectedStudentForPlan) return;
    setIsSavingPlan(true);
    setPlanToast(null);

    let pkgName = customPackageName.trim();
    if (!pkgName) {
      const plans = selectedPlansForChange;
      if (plans.includes('free') && plans.length === 1) {
        pkgName = 'Free Plan';
      } else if (plans.length === 1) {
        const p = plans[0];
        if (p === 'matric') pkgName = 'Matric Plan (Rs. 499/mo)';
        else if (p === 'fsc') pkgName = 'FSc Plan (Rs. 999/mo)';
        else if (p === 'tcat') pkgName = 'TCAT Engineering Plan (Rs. 1,499/mo)';
        else if (p === 'mdcat') pkgName = 'MDCAT Medical Plan (Rs. 1,499/mo)';
        else pkgName = `${p.toUpperCase()} Plan`;
      } else {
        const uppercasePlans = plans.map(p => {
          if (p === 'matric') return 'Matric';
          if (p === 'fsc') return 'FSc';
          if (p === 'tcat') return 'TCAT';
          if (p === 'mdcat') return 'MDCAT';
          return p.toUpperCase();
        });
        pkgName = `${uppercasePlans.join(' + ')} Multi-Track Combo`;
      }
    }

    console.log('[Admin UI Click: Save & Update Subscription]', {
      studentId: selectedStudentForPlan.id,
      studentEmail: selectedStudentForPlan.email,
      subscribedPlans: selectedPlansForChange,
      packageName: pkgName,
      expirationMonths,
      adminNote: planAdminNote,
      adminEmail: detectedEmail,
    });

    try {
      const res = await updateStudentPlanInSupabase({
        studentId: selectedStudentForPlan.id,
        studentEmail: selectedStudentForPlan.email,
        subscribedPlans: selectedPlansForChange,
        packageName: pkgName,
        paymentStatus: selectedPlansForChange.includes('free') && selectedPlansForChange.length === 1 ? 'Free Plan' : 'Verified & Paid',
        expirationMonths,
        adminNote: planAdminNote,
        adminEmail: detectedEmail,
      });

      if (res.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === selectedStudentForPlan.id
              ? {
                  ...s,
                  subscribed_plans: selectedPlansForChange,
                  package_name: pkgName,
                  payment_status: selectedPlansForChange.includes('free') && selectedPlansForChange.length === 1 ? 'Free Plan' : 'Verified & Paid',
                  requires_payment: selectedPlansForChange.includes('free') && selectedPlansForChange.length === 1,
                  status: 'active',
                }
              : s
          )
        );

        setPlanToast({
          type: 'success',
          message: res.message || `Plan successfully updated for ${selectedStudentForPlan.name}!`,
        });

        // Refresh activity logs
        const updatedLogs = await fetchAdminActivityLogsFromSupabase(detectedEmail);
        setActivityLogs(updatedLogs);

        setTimeout(() => {
          setSelectedStudentForPlan(null);
          setPlanToast(null);
        }, 1200);
      } else {
        setPlanToast({ type: 'error', message: res.message || 'Failed to update student plan.' });
      }
    } catch (err: any) {
      setPlanToast({ type: 'error', message: err?.message || 'Error updating student plan.' });
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleExportActivityLogsCSV = () => {
    if (activityLogs.length === 0) return;
    const headers = ['Log ID', 'Timestamp', 'Admin Email', 'Target Student Name', 'Target Student Email', 'Action', 'Old Plan', 'New Plan', 'Admin Note'];
    const rows = activityLogs.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.created_at).toLocaleString()}"`,
      `"${(l.admin_email || '').replace(/"/g, '""')}"`,
      `"${(l.target_student_name || '').replace(/"/g, '""')}"`,
      `"${(l.target_student_email || '').replace(/"/g, '""')}"`,
      `"${(l.action_type || 'manual_plan_change').replace(/"/g, '""')}"`,
      `"${(l.old_plan || '').replace(/"/g, '""')}"`,
      `"${(l.new_plan || '').replace(/"/g, '""')}"`,
      `"${(l.note || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadCSV(csvContent, `Admin_Activity_Audit_Log_${Date.now()}.csv`);
  };

  const handleApprovePaymentRequest = async (request: PaymentRequest) => {
    setReviewingRequestId(request.id);
    try {
      const res = await reviewPaymentRequestInSupabase(request.id, 'approved', undefined, detectedEmail);
      if (res.success) {
        setPaymentRequests((prev) =>
          prev.map((r) =>
            r.id === request.id
              ? { ...r, status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: detectedEmail }
              : r
          )
        );
        const updatedStudents = await fetchAllStudentsFromSupabase();
        setStudents(updatedStudents);

        setPaymentToast({
          type: 'success',
          message: `Payment approved! ${request.student_name} (${request.student_email}) upgraded to Premium Access.`,
        });
        setTimeout(() => setPaymentToast(null), 5000);
      } else {
        setPaymentToast({ type: 'error', message: res.message || 'Failed to approve payment request.' });
      }
    } catch (err: any) {
      setPaymentToast({ type: 'error', message: err?.message || 'Error approving payment.' });
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleConfirmRejectPaymentRequest = async () => {
    if (!rejectingRequest) return;
    setReviewingRequestId(rejectingRequest.id);
    try {
      const res = await reviewPaymentRequestInSupabase(
        rejectingRequest.id,
        'rejected',
        rejectNote,
        detectedEmail
      );
      if (res.success) {
        setPaymentRequests((prev) =>
          prev.map((r) =>
            r.id === rejectingRequest.id
              ? { ...r, status: 'rejected', admin_note: rejectNote, reviewed_at: new Date().toISOString(), reviewed_by: detectedEmail }
              : r
          )
        );
        setPaymentToast({
          type: 'success',
          message: `Payment request for ${rejectingRequest.student_name} marked as rejected. Email sent to student.`,
        });
        setTimeout(() => setPaymentToast(null), 5000);
        setRejectingRequest(null);
        setRejectNote('');
      } else {
        setPaymentToast({ type: 'error', message: res.message || 'Failed to reject payment request.' });
      }
    } catch (err: any) {
      setPaymentToast({ type: 'error', message: err?.message || 'Error rejecting payment.' });
    } finally {
      setReviewingRequestId(null);
    }
  };

  const handleToggleStudentStatus = async (student: StudentProfile) => {
    const newStatus: 'active' | 'suspended' = student.status === 'suspended' ? 'active' : 'suspended';
    setTogglingStatusStudentId(student.id);
    try {
      const res = await updateStudentStatusInSupabase(
        student.id,
        newStatus,
        currentUser?.email || 'shsvirtualadmin@gmail.com'
      );
      if (res.success) {
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, status: newStatus } : s))
        );
        if (selectedStudent && selectedStudent.id === student.id) {
          setSelectedStudent((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        alert(res.message || 'Failed to update student status.');
      }
    } catch (err: any) {
      alert(err?.message || 'Error updating student status.');
    } finally {
      setTogglingStatusStudentId(null);
    }
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToRemove) return;
    setIsRemovingStudent(true);
    setRemoveStudentError(null);
    try {
      const res = await removeStudentAccountInSupabase(
        studentToRemove.id,
        studentToRemove.email,
        currentUser?.email || 'shsvirtualadmin@gmail.com'
      );
      if (!res.success) {
        throw new Error(res.message || 'Failed to remove student account.');
      }
      setStudents((prev) => prev.filter((s) => s.id !== studentToRemove.id));
      if (selectedStudent && selectedStudent.id === studentToRemove.id) {
        setSelectedStudent(null);
      }
      setRemoveSuccessToast(`Successfully wiped student account for ${studentToRemove.name} (${studentToRemove.email}).`);
      setStudentToRemove(null);
      setRemoveConfirmText('');
    } catch (err: any) {
      console.error('Error in handleConfirmRemoveStudent:', err);
      setRemoveStudentError(err?.message || 'Failed to remove student account.');
    } finally {
      setIsRemovingStudent(false);
    }
  };

  const handleConfirmPermanentDeleteRecord = async () => {
    if (!deletingRecord) return;
    setIsDeletingRecord(true);
    setDeleteRecordError(null);
    try {
      const res = await permanentlyDeleteTestRecordInSupabase(deletingRecord.id);
      if (!res.success) {
        throw new Error(res.error || 'Failed to permanently delete record from Supabase database.');
      }
      setAllTestResults((prev) => prev.filter((t) => t.id !== deletingRecord.id));
      setStudentHistory((prev) => prev.filter((t) => t.id !== deletingRecord.id));
      setDeletingRecord(null);
    } catch (err: any) {
      console.error('Error in handleConfirmPermanentDeleteRecord:', err);
      setDeleteRecordError(err?.message || 'Failed to delete record.');
    } finally {
      setIsDeletingRecord(false);
    }
  };

  const runCrossReferenceAudit = () => {
    setIsAuditing(true);

    const auditSubjects = [
      'Physics',
      'Chemistry',
      'Biology',
      'Mathematics',
      'Computer Science',
      'English',
      'Urdu',
      'Pakistan Studies',
      'Islamic Studies',
    ];

    const results: AuditResultItem[] = [];

    auditSubjects.forEach((subKey) => {
      const questions = getPrebuiltQuestionsForSubject(subKey);

      questions.forEach((q, idx) => {
        const issues: string[] = [];
        const qText = q.q || '';
        const qLower = qText.toLowerCase();

        // 1. Cross-Subject Mismatch check
        const isHumanitiesOrLanguage = ['Urdu', 'English', 'Pakistan Studies', 'Islamic Studies'].includes(subKey);
        const hasPhysicsOrStemKeywords =
          qLower.includes('vector quantity') ||
          qLower.includes('classical mechanics') ||
          qLower.includes("newton's") ||
          qLower.includes('harmonic motion') ||
          qLower.includes('magnetic flux') ||
          qLower.includes('capacitance') ||
          qLower.includes('mitochondria') ||
          qLower.includes('derivative');

        if (isHumanitiesOrLanguage && hasPhysicsOrStemKeywords) {
          issues.push(`Subject Mismatch: STEM/Physics formula question found under ${subKey} subject tag.`);
        }

        const isStemSubject = ['Physics', 'Chemistry', 'Biology', 'Mathematics'].includes(subKey);
        const hasUrduLiteratureKeywords =
          qText.includes('مسدسِ حالی') || qText.includes('اسم نکرہ') || qText.includes('صاحبِ دیوان');

        if (isStemSubject && hasUrduLiteratureKeywords) {
          issues.push(`Subject Mismatch: Urdu language question tagged under STEM subject ${subKey}.`);
        }

        // 2. Choice & Index validation
        if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          issues.push(`Option Count Error: Expected 4 choices, found ${q.options?.length || 0}.`);
        }

        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) {
          issues.push(`Answer Index Error: Correct answer index (${q.correct}) is out of bounds (0-3).`);
        }

        // 3. Question length / stem check
        if (!qText || qText.trim().length < 8) {
          issues.push(`Question Stem Incomplete: Question text is empty or too short.`);
        }

        results.push({
          id: q.id || `audit-q-${subKey}-${idx + 1}`,
          subject: subKey,
          topic: q.topic || 'General Curriculum',
          questionText: qText,
          options: q.options || [],
          correctIndex: q.correct ?? 0,
          status: issues.length > 0 ? 'flagged' : 'clean',
          issues,
          source: 'Prebuilt MCQ Bank',
        });
      });
    });

    setAuditResults(results);
    setTimeout(() => {
      setIsAuditing(false);
    }, 300);
  };

  useEffect(() => {
    loadData();
    runCrossReferenceAudit();
  }, [isAdmin]);

  const handleSanitizeAllMismatches = () => {
    const flaggedIds = auditResults.filter((r) => r.status === 'flagged').map((r) => r.id);
    setDismissedFlagIds((prev) => Array.from(new Set([...prev, ...flaggedIds])));
    setSanitizedCount((prev) => prev + flaggedIds.length);
  };

  const handleExportAuditCSV = () => {
    if (auditResults.length === 0) return;
    const headers = ['Question ID', 'Subject', 'Topic', 'Audit Status', 'Detected Issues', 'Question Text'];
    const rows = auditResults.map((r) => [
      `"${r.id}"`,
      `"${r.subject}"`,
      `"${r.topic.replace(/"/g, '""')}"`,
      `"${r.status.toUpperCase()}"`,
      `"${r.issues.join(' | ').replace(/"/g, '""')}"`,
      `"${r.questionText.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    downloadCSV(csvContent, `MCQ_CrossReference_Audit_${Date.now()}.csv`);
  };

  const handleExportStudentsCSV = () => {
    if (students.length === 0) return;
    const headers = ['Student ID', 'Full Name', 'Email', 'Phone', 'Class/Grade', 'Stream/Track', 'Status', 'Sign-Up Method', 'Sign-Up Date'];
    const rows = students.map((s) => [
      `"${s.id.replace(/"/g, '""')}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email.replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.grade || '').replace(/"/g, '""')}"`,
      `"${(s.stream || '').replace(/"/g, '""')}"`,
      `"${s.status || 'active'}"`,
      `"${s.sign_up_method || 'Email/Password'}"`,
      `"${new Date(s.created_at || Date.now()).toLocaleString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csvContent, `Boardly_Students_Directory_${Date.now()}.csv`);
  };

  const handleExportTestsCSV = () => {
    if (allTestResults.length === 0) return;
    const headers = ['Test ID', 'Student ID', 'Subject', 'Class/Grade', 'Score', 'Total', 'Percentage', 'Duration', 'Date'];
    const rows = allTestResults.map((t) => [
      `"${t.id.replace(/"/g, '""')}"`,
      `"${t.student_id.replace(/"/g, '""')}"`,
      `"${t.subject.replace(/"/g, '""')}"`,
      `"${t.path_label.replace(/"/g, '""')}"`,
      t.score,
      t.total,
      `${t.percentage}%`,
      `"${t.duration}"`,
      `"${t.date_str}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csvContent, `Boardly_Test_Results_${Date.now()}.csv`);
  };

  const handleExportStudyBuddyCSV = () => {
    if (allStudyBuddyHistory.length === 0) return;
    const headers = ['Log ID', 'Student ID', 'Role', 'Message Text', 'Timestamp'];
    const rows = allStudyBuddyHistory.map((m) => [
      `"${m.id}"`,
      `"${m.student_id}"`,
      `"${m.role.toUpperCase()}"`,
      `"${m.message_text.replace(/"/g, '""')}"`,
      `"${new Date(m.created_at).toLocaleString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    downloadCSV(csvContent, `Boardly_AI_StudyBuddy_Logs_${Date.now()}.csv`);
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectStudent = async (student: StudentProfile) => {
    setSelectedStudent(student);
    setDetailSubTab('tests');
    const g = student.grade || '11th';
    setEditStudentGrade(g);
    if (g === 'MDCAT' || g.includes('MDCAT')) {
      setEditStudentStream(student.stream || 'MDCAT Stream');
    } else if (g === 'TCAT' || g.includes('TCAT')) {
      setEditStudentStream(student.stream || 'Pre-Engineering Stream');
    } else {
      setEditStudentStream(student.stream || 'Pre-Medical Stream');
    }
    setAdminOverrideToast(null);
    setHistoryLoading(true);
    setLoadingBuddyHistory(true);
    try {
      const [history, buddyLogs] = await Promise.all([
        fetchStudentTestResultsFromSupabase(student.id),
        fetchStudentStudyBuddyHistoryFromSupabase(student.id),
      ]);
      setStudentHistory(history);
      setSelectedStudentBuddyHistory(buddyLogs);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
      setStudentHistory([]);
      setSelectedStudentBuddyHistory([]);
    } finally {
      setHistoryLoading(false);
      setLoadingBuddyHistory(false);
    }
  };

  const handleAdminSaveGradeStream = async () => {
    if (!selectedStudent) return;
    setIsSavingGradeStream(true);
    setAdminOverrideToast(null);

    let defaultSubjects: string[] = [];
    const upperG = editStudentGrade.toUpperCase();
    if (upperG === 'MDCAT' || upperG.includes('MDCAT')) {
      defaultSubjects = ['Biology', 'Chemistry', 'Physics', 'English', 'Logical Reasoning'];
    } else if (upperG === 'TCAT' || upperG.includes('TCAT')) {
      defaultSubjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Logical Reasoning'];
    } else if (editStudentGrade.includes('9') || editStudentGrade.includes('10')) {
      if (editStudentStream.includes('Biology')) {
        defaultSubjects = ['Physics', 'Chemistry', 'Biology', 'English', 'Urdu', editStudentGrade.includes('10') ? 'Pakistan Studies' : 'Islamic Studies'];
      } else {
        defaultSubjects = ['Physics', 'Chemistry', 'Computer Science', 'English', 'Urdu', editStudentGrade.includes('10') ? 'Pakistan Studies' : 'Islamic Studies'];
      }
    } else {
      if (editStudentStream.includes('Pre-Medical')) {
        defaultSubjects = ['Physics', 'Chemistry', 'Biology', 'English', 'Urdu', editStudentGrade.includes('12') ? 'Pakistan Studies' : 'Islamic Studies'];
      } else if (editStudentStream.includes('Pre-Engineering')) {
        defaultSubjects = ['Physics', 'Chemistry', 'Mathematics', 'English', 'Urdu', editStudentGrade.includes('12') ? 'Pakistan Studies' : 'Islamic Studies'];
      } else {
        defaultSubjects = ['Physics', 'Computer Science', 'Mathematics', 'English', 'Urdu', editStudentGrade.includes('12') ? 'Pakistan Studies' : 'Islamic Studies'];
      }
    }

    try {
      const res = await updateStudentGradeAndStreamInSupabase(
        selectedStudent.id,
        editStudentGrade,
        editStudentStream,
        defaultSubjects,
        currentUser?.email || 'shsvirtualadmin@gmail.com'
      );
      if (res.success) {
        const updatedStudentObj: StudentProfile = res.profile || {
          ...selectedStudent,
          grade: editStudentGrade,
          stream: editStudentStream,
          subjects: defaultSubjects,
          is_registered: true,
        };
        setSelectedStudent(updatedStudentObj);
        setStudents((prev) => prev.map((s) => s.id === selectedStudent.id ? updatedStudentObj : s));
        setAdminOverrideToast('✅ Grade & Stream lock updated successfully in Supabase!');
        loadData();
      } else {
        setAdminOverrideToast(`⚠️ Failed to save changes: ${res.message || 'Supabase update failed.'}`);
      }
    } catch (err: any) {
      setAdminOverrideToast(`❌ Error: ${err.message || 'Update failed'}`);
    } finally {
      setIsSavingGradeStream(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const calculateSubjectProgress = (studentId: string) => {
    const studentTests = allTestResults.filter((t) => t.student_id === studentId);
    const standardSubjects = [
      'Physics',
      'Chemistry',
      'Biology',
      'Mathematics',
      'Computer Science',
      'English',
      'Urdu',
      'Pakistan Studies',
      'Islamic Studies',
    ];

    const testsBySubject: Record<string, AdminTestResult[]> = {};
    studentTests.forEach((t) => {
      if (!testsBySubject[t.subject]) {
        testsBySubject[t.subject] = [];
      }
      testsBySubject[t.subject].push(t);
    });

    const subjectsToDisplay = Array.from(
      new Set([...Object.keys(testsBySubject), ...standardSubjects])
    );

    const breakdown = subjectsToDisplay.map((sub) => {
      const tests = testsBySubject[sub] || [];
      if (tests.length === 0) {
        return {
          subject: sub,
          totalMCQs: 0,
          correctMCQs: 0,
          accuracy: 0,
          testsCount: 0,
          lastTestDate: 'No tests taken',
          trend: 'no_data' as 'improving' | 'declining' | 'stable' | 'no_data',
        };
      }

      const totalMCQs = tests.reduce((acc, curr) => acc + (curr.total || 0), 0);
      const correctMCQs = tests.reduce((acc, curr) => acc + (curr.score || 0), 0);
      const accuracy = totalMCQs > 0 ? Math.round((correctMCQs / totalMCQs) * 100) : 0;

      const sortedTests = [...tests].sort(
        (a, b) => new Date(a.created_at || a.date_str).getTime() - new Date(b.created_at || b.date_str).getTime()
      );
      const lastTest = sortedTests[sortedTests.length - 1];
      const lastTestDate = lastTest ? (lastTest.date_str || new Date(lastTest.created_at).toLocaleDateString()) : 'N/A';

      let trend: 'improving' | 'declining' | 'stable' | 'no_data' = 'stable';
      if (sortedTests.length >= 2) {
        const mid = Math.floor(sortedTests.length / 2);
        const earlierTests = sortedTests.slice(0, mid);
        const laterTests = sortedTests.slice(mid);

        const earlierAcc = earlierTests.reduce((acc, c) => acc + c.percentage, 0) / earlierTests.length;
        const laterAcc = laterTests.reduce((acc, c) => acc + c.percentage, 0) / laterTests.length;

        if (laterAcc > earlierAcc + 2) trend = 'improving';
        else if (laterAcc < earlierAcc - 2) trend = 'declining';
        else trend = 'stable';
      }

      return {
        subject: sub,
        totalMCQs,
        correctMCQs,
        accuracy,
        testsCount: tests.length,
        lastTestDate,
        trend,
      };
    });

    const filteredBreakdown = breakdown.filter((b) => {
      if (progressSubjectFilter !== 'All' && b.subject !== progressSubjectFilter) return false;
      return true;
    });

    const totalAttempted = breakdown.reduce((a, c) => a + c.totalMCQs, 0);
    const totalCorrect = breakdown.reduce((a, c) => a + c.correctMCQs, 0);
    const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    return {
      breakdown: filteredBreakdown,
      totalAttempted,
      overallAccuracy,
      totalTestsTaken: studentTests.length,
    };
  };

  const sqlPolicyScript = `-- ========================================================
-- BOARDLY SUPABASE DATABASE SCHEMA & RLS SECURITY SCRIPT
-- Copy and run in Supabase SQL Editor
-- ========================================================

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  grade TEXT DEFAULT 'Class 11 (Pre-Engineering)',
  stream TEXT,
  is_registered BOOLEAN DEFAULT FALSE,
  subjects JSONB DEFAULT '[]'::jsonb,
  phone TEXT,
  status TEXT DEFAULT 'active',
  sign_up_method TEXT DEFAULT 'Email/Password',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.test_results (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  path_label TEXT NOT NULL,
  score INT NOT NULL,
  total INT NOT NULL,
  percentage INT NOT NULL,
  duration TEXT NOT NULL,
  time_taken_seconds INT,
  date_str TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.study_buddy_history (
  id BIGSERIAL PRIMARY KEY,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT,
  role TEXT NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.study_buddy_history ADD COLUMN IF NOT EXISTS conversation_id TEXT;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_buddy_history ENABLE ROW LEVEL SECURITY;

-- ADMIN FULL PERMISSIONS POLICY
CREATE POLICY "Admin full access students" ON public.students
  FOR ALL USING (auth.jwt() ->> 'email' = 'shsvirtualadmin@gmail.com');

CREATE POLICY "Admin full access test_results" ON public.test_results
  FOR ALL USING (auth.jwt() ->> 'email' = 'shsvirtualadmin@gmail.com');

CREATE POLICY "Admin full access study_buddy_history" ON public.study_buddy_history
  FOR ALL USING (auth.jwt() ->> 'email' = 'shsvirtualadmin@gmail.com');
`;

  if (!isAdmin) {
    return (
      <div className="animate-ios-spring text-center py-12 px-4 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 mx-auto mb-4 shadow-lg shadow-rose-500/10">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Access Restricted</h2>
        <p className="text-xs text-slate-500 dark:text-[#8E8E93] max-w-sm mx-auto mb-4 leading-relaxed font-medium">
          The Admin Management Panel is strictly restricted to <strong className="text-slate-800 dark:text-white font-mono">shsvirtualadmin@gmail.com</strong>.
        </p>
        <div className="bg-slate-100 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-3 max-w-sm mx-auto mb-6 text-xs text-slate-600 dark:text-[#8E8E93] font-mono">
          <span>Active Logged-In Account: </span>
          <span className="font-extrabold text-rose-600 dark:text-rose-400 block mt-1">
            {rawEmail || 'Unauthenticated User'}
          </span>
        </div>
        <button
          onClick={onBack}
          className="bg-[#007AFF] hover:bg-[#0066CC] dark:bg-[#0A84FF] dark:hover:bg-[#0066CC] text-white text-xs font-extrabold py-3 px-6 rounded-full transition-all active:scale-95 cursor-pointer shadow-lg shadow-blue-500/20 flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.toLowerCase().includes(q)) ||
      (s.grade && s.grade.toLowerCase().includes(q)) ||
      (s.stream && s.stream.toLowerCase().includes(q)) ||
      (s.sign_up_method && s.sign_up_method.toLowerCase().includes(q));

    let matchGrade = true;
    if (studentGradeFilter !== 'All') {
      const g = (s.grade || '').toUpperCase();
      const target = studentGradeFilter.toUpperCase();
      matchGrade = g.includes(target);
    }

    let matchStatus = true;
    if (studentStatusFilter !== 'All') {
      matchStatus = (s.status || 'active') === studentStatusFilter;
    }

    let matchPlan = true;
    if (studentPlanFilter !== 'All') {
      const plans = s.subscribed_plans || [];
      const pkg = (s.package_name || '').toLowerCase();
      if (studentPlanFilter === 'Free') {
        matchPlan = plans.length === 0 || (plans.length === 1 && plans[0] === 'free');
      } else if (studentPlanFilter === 'Matric') {
        matchPlan = plans.includes('matric') || pkg.includes('matric');
      } else if (studentPlanFilter === 'FSc') {
        matchPlan = plans.includes('fsc') || pkg.includes('fsc');
      } else if (studentPlanFilter === 'TCAT') {
        matchPlan = plans.includes('tcat') || pkg.includes('tcat') || pkg.includes('uet');
      } else if (studentPlanFilter === 'MDCAT') {
        matchPlan = plans.includes('mdcat') || pkg.includes('mdcat');
      } else if (studentPlanFilter === 'Multi-Track') {
        matchPlan = plans.filter(p => p !== 'free').length > 1 || pkg.includes('+') || pkg.includes('combo');
      }
    }

    return matchQuery && matchGrade && matchStatus && matchPlan;
  });

  // Filter tests
  const filteredTests = allTestResults.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    return (
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.path_label.toLowerCase().includes(q) ||
      (t.student_id && t.student_id.toLowerCase().includes(q))
    );
  });

  // Filter study buddy logs
  const filteredStudyBuddyHistory = allStudyBuddyHistory.filter((m) => {
    const q = studyBuddySearch.trim().toLowerCase();
    return (
      !q ||
      m.message_text.toLowerCase().includes(q) ||
      m.student_id.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  });

  // Aggregated Stats
  const totalStudents = students.length;
  const activeStudentsCount = students.filter((s) => (s.status || 'active') !== 'suspended').length;
  const suspendedStudentsCount = students.filter((s) => s.status === 'suspended').length;
  const totalTests = allTestResults.length;
  const googleCount = students.filter((s) => s.sign_up_method === 'Google').length;
  const emailCount = totalStudents - googleCount;
  const avgScore =
    totalTests > 0
      ? Math.round(allTestResults.reduce((acc, curr) => acc + curr.percentage, 0) / totalTests)
      : 0;
  const totalMCQsAnswered = allTestResults.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const passingRate =
    totalTests > 0
      ? Math.round((allTestResults.filter((t) => t.percentage >= 50).length / totalTests) * 100)
      : 0;

  const activeAuditCount = auditResults.filter(
    (r) => r.status === 'flagged' && !dismissedFlagIds.includes(r.id)
  ).length;

  return (
    <div className="space-y-6 animate-ios-spring w-full max-w-7xl mx-auto pb-12 min-w-0 overflow-x-hidden">
      {/* Admin Header */}
      <div className="bg-white/80 dark:bg-[#1C1C1E]/90 border border-slate-200 dark:border-white/10 rounded-[24px] p-4 sm:p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all cursor-pointer active:scale-95 shrink-0"
            title="Return to Student Portal"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#0A0A0A] border border-[#F2B90C]/40 p-0.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img
                  src="/logo.png"
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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                Boardly Admin Portal
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8E8E93] font-medium mt-0.5 truncate">
              Live Management • Supabase Postgres Database • Multi-Student Directory
            </p>
          </div>
        </div>

        {/* Header Quick Controls */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live DB Connected</span>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportStudentsCSV}
            className="px-3 py-1.5 rounded-xl bg-[#007AFF] hover:bg-[#0066CC] dark:bg-[#0A84FF] dark:hover:bg-[#0066CC] text-white text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {removeSuccessToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between gap-2 animate-fadeIn min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{removeSuccessToast}</span>
          </div>
          <button
            onClick={() => setRemoveSuccessToast(null)}
            className="p-1 hover:bg-emerald-500/20 rounded-lg transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
        {/* Stat 1: Total Students */}
        <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-xs font-bold text-slate-500 dark:text-[#8E8E93] truncate">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#0A84FF] shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap min-w-0">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalStudents}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-extrabold flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400">{activeStudentsCount} active</span>
              {suspendedStudentsCount > 0 && (
                <span className="text-rose-600 dark:text-rose-400">• {suspendedStudentsCount} suspended</span>
              )}
            </div>
          </div>
          <div className="mt-2 text-[10.5px] text-slate-400 dark:text-[#8E8E93] font-medium flex items-center gap-1 min-w-0 truncate">
            <UserCheck className="w-3 h-3 text-blue-500 shrink-0" />
            <span className="truncate">{googleCount} Google • {emailCount} Email</span>
          </div>
        </div>

        {/* Stat 2: Tests Completed */}
        <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-xs font-bold text-slate-500 dark:text-[#8E8E93] truncate">Tests Attempted</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap min-w-0">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalTests}
            </span>
            <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
              {totalMCQsAnswered} total MCQs
            </span>
          </div>
          <div className="mt-2 text-[10.5px] text-slate-400 dark:text-[#8E8E93] font-medium flex items-center gap-1 min-w-0 truncate">
            <Activity className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">Across 9th-12th & Entrance</span>
          </div>
        </div>

        {/* Stat 3: Average Score */}
        <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-xs font-bold text-slate-500 dark:text-[#8E8E93] truncate">Platform Avg Score</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap min-w-0">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {avgScore}%
            </span>
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
              {passingRate}% pass rate
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2.5 w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, avgScore))}%` }}
            />
          </div>
        </div>

        {/* Stat 4: AI Study Buddy Logs & System */}
        <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all min-w-0">
          <div className="flex items-center justify-between min-w-0">
            <span className="text-xs font-bold text-slate-500 dark:text-[#8E8E93] truncate">AI Study Buddy Logs</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-1 flex-wrap min-w-0">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {allStudyBuddyHistory.length}
            </span>
            <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400">
              Logged Queries
            </span>
          </div>
          <div className="mt-2 text-[10.5px] text-slate-400 dark:text-[#8E8E93] font-medium flex items-center gap-1 min-w-0 truncate">
            <Zap className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="truncate">Real-time Chat Storage</span>
          </div>
        </div>
      </div>

      {/* Redesigned Responsive Tab Navigation */}
      <div className="bg-slate-100 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'students'
              ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'students' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'}`}>
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payment_requests')}
          className={`flex-1 min-w-[155px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'payment_requests'
              ? 'bg-[#007AFF] dark:bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>Payment Requests</span>
          {paymentRequests.filter((r) => r.status === 'pending').length > 0 ? (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
              {paymentRequests.filter((r) => r.status === 'pending').length}
            </span>
          ) : (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'payment_requests' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'}`}>
              {paymentRequests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity_logs')}
          className={`flex-1 min-w-[145px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'activity_logs'
              ? 'bg-[#007AFF] dark:bg-amber-600 text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>Activity Logs</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'activity_logs' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'}`}>
            {activityLogs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tests')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'tests'
              ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Test Results</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'tests' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'}`}>
            {allTestResults.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('progress')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'progress'
              ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Progress</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('study_buddy')}
          className={`flex-1 min-w-[145px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'study_buddy'
              ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Bot className="w-4 h-4 text-purple-400" />
          <span>AI Chat Logs</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'study_buddy' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'}`}>
            {allStudyBuddyHistory.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'audit'
              ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>MCQ Audit</span>
          {activeAuditCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
              {activeAuditCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bulk_import')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'bulk_import'
              ? 'bg-[#007AFF] dark:bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <UploadCloud className="w-4 h-4 text-emerald-400" />
          <span>Bulk Import</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
            CSV
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rls')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
            activeTab === 'rls'
              ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-md'
              : 'text-slate-600 dark:text-[#8E8E93] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>RLS Rules</span>
        </button>
      </div>

      {/* TAB CONTENT 1: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Filters & Search Header */}
          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3 w-full min-w-0">
            {/* Search Input */}
            <div className="relative w-full md:w-80 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, grade..."
                className="w-full bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar min-w-0">
              {/* Grade / Track Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-extrabold focus:outline-none cursor-pointer"
                >
                  <option value="All">All Grades & Tracks</option>
                  <option value="9th">9th Class</option>
                  <option value="10th">10th Class</option>
                  <option value="11th">11th Class</option>
                  <option value="12th">12th Class</option>
                  <option value="MDCAT">MDCAT Prep</option>
                  <option value="TCAT">TCAT Prep</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white font-extrabold focus:outline-none cursor-pointer"
                >
                  <option value="All">All Account Statuses</option>
                  <option value="active">Active Only</option>
                  <option value="suspended">Suspended Only</option>
                </select>
              </div>

              {/* Plan Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={studentPlanFilter}
                  onChange={(e) => setStudentPlanFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-amber-700 dark:text-amber-300 border-amber-500/30 font-extrabold focus:outline-none cursor-pointer"
                >
                  <option value="All">All Active Plans</option>
                  <option value="Free">Free Plan Only</option>
                  <option value="Matric">Matric Plan (Rs. 499)</option>
                  <option value="FSc">FSc Plan (Rs. 999)</option>
                  <option value="TCAT">TCAT Plan (Rs. 1,499)</option>
                  <option value="MDCAT">MDCAT Plan (Rs. 1,499)</option>
                  <option value="Multi-Track">Multi-Track Combo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Student Grid / Cards */}
          {loading ? (
            <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center space-y-3 w-full min-w-0">
              <Loader2 className="w-8 h-8 text-[#0A84FF] animate-spin mx-auto" />
              <p className="text-xs text-slate-500 dark:text-[#8E8E93] font-bold">
                Fetching student directory from Supabase Postgres...
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center space-y-3 w-full min-w-0">
              <UserX className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">No Students Found</h3>
              <p className="text-xs text-slate-500 dark:text-[#8E8E93] max-w-sm mx-auto">
                No registered students matched your active filter rules or search query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStudentGradeFilter('All');
                  setStudentStatusFilter('All');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
              {filteredStudents.map((student) => {
                const isSuspended = student.status === 'suspended';
                const initials = student.name
                  ? student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
                  : 'ST';

                return (
                  <div
                    key={student.id}
                    className={`bg-white/80 dark:bg-[#1C1C1E] border rounded-2xl p-3.5 sm:p-4 shadow-lg hover:shadow-xl transition-all relative flex flex-col justify-between group min-w-0 w-full ${
                      isSuspended
                        ? 'border-rose-500/40 bg-rose-500/[0.02] dark:bg-rose-500/[0.03]'
                        : 'border-slate-200 dark:border-white/10 hover:border-blue-500/30'
                    }`}
                  >
                    <div className="space-y-3 min-w-0">
                      {/* Student Card Top Bar */}
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#007AFF] to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                              {student.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#8E8E93] font-medium min-w-0">
                              <span className="truncate min-w-0">{student.email}</span>
                              <button
                                onClick={() => copyToClipboard(student.email, 'email')}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer p-0.5 shrink-0"
                                title="Copy Email"
                              >
                                {copiedEmail === student.email ? (
                                  <Check className="w-3 h-3 text-emerald-500" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                            isSuspended
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                              : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30'
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <Lock className="w-3 h-3 text-rose-500 shrink-0" />
                              <span>Suspended</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span>Active</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Phone Number line if present */}
                      {student.phone && (
                        <div className="text-[11px] font-medium text-slate-600 dark:text-[#8E8E93] flex items-center gap-1.5 font-mono min-w-0 truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{student.phone}</span>
                        </div>
                      )}

                      {/* Badges / Registration Meta */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 min-w-0">
                        {/* Current Active Subscription Plan Badge */}
                        {(() => {
                          const plans = student.subscribed_plans || [];
                          const pkg = student.package_name || '';
                          let planLabel = 'Free Access';
                          let planColor = 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';

                          if (plans.includes('mdcat') || pkg.toLowerCase().includes('mdcat')) {
                            planLabel = 'MDCAT (Rs. 1,499)';
                            planColor = 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
                          } else if (plans.includes('tcat') || pkg.toLowerCase().includes('tcat') || pkg.toLowerCase().includes('uet')) {
                            planLabel = 'TCAT / UET (Rs. 1,499)';
                            planColor = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
                          } else if (plans.includes('fsc') || pkg.toLowerCase().includes('fsc')) {
                            planLabel = 'FSc Plan (Rs. 999)';
                            planColor = 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
                          } else if (plans.includes('matric') || pkg.toLowerCase().includes('matric')) {
                            planLabel = 'Matric Plan (Rs. 499)';
                            planColor = 'bg-blue-500/15 text-[#007AFF] dark:text-[#0A84FF] border-blue-500/30';
                          } else if (plans.length > 1) {
                            planLabel = 'Multi-Track Bundle';
                            planColor = 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
                          } else if (student.payment_status === 'exempt') {
                            planLabel = 'Scholarship / Exempt';
                            planColor = 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
                          }

                          return (
                            <span className={`text-[10px] font-black border px-2 py-0.5 rounded-lg flex items-center gap-1 max-w-full truncate ${planColor}`}>
                              <Zap className="w-3 h-3 shrink-0 text-amber-500" />
                              <span className="truncate">{pkg || planLabel}</span>
                            </span>
                          );
                        })()}

                        {/* Test Count Badge */}
                        <span className="text-[10px] font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 max-w-full truncate">
                          <Activity className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{allTestResults.filter(t => t.student_id === student.id).length} Tests Taken</span>
                        </span>

                        <span className="text-[10px] font-bold bg-blue-500/10 text-[#007AFF] dark:text-[#0A84FF] border border-blue-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 max-w-full truncate">
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          <span className="truncate">{student.grade || 'Unregistered'}</span>
                        </span>

                        <span className="text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1 max-w-full truncate">
                          <Key className="w-3 h-3 shrink-0" />
                          <span className="truncate">{student.sign_up_method || 'Email/Password'}</span>
                        </span>

                        {/* Payment Proof Button if submitted */}
                        {(() => {
                          const req = paymentRequests.find(p => p.student_id === student.id || p.student_email.toLowerCase() === student.email.toLowerCase());
                          if (req && (req.drive_file_url || req.payment_method)) {
                            return (
                              <button
                                type="button"
                                onClick={() => req.drive_file_url ? setViewingProofUrl(req.drive_file_url) : alert(`Payment Method: ${req.payment_method || 'Offline Bank'}\nTRX Ref: ${req.transaction_reference || 'N/A'}\nSubmitted: ${new Date(req.created_at).toLocaleString()}`)}
                                className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-emerald-500/20 transition-all cursor-pointer"
                                title="View submitted payment screenshot / details"
                              >
                                <Eye className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>Proof ({req.status})</span>
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Student Card Action Bar */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-1 flex-wrap min-w-0">
                      {/* Manual Plan Management Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenPlanModal(student)}
                        className="py-1.5 px-2.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-800 dark:text-amber-300 border border-amber-500/40 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0 shadow-sm"
                        title="Grant or modify student subscription plan"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Change Plan</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectStudent(student)}
                        className="py-1.5 px-2 bg-blue-500/10 hover:bg-blue-500/20 text-[#007AFF] dark:text-[#0A84FF] border border-blue-500/20 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
                      >
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentForProgress(student);
                          setActiveTab('progress');
                        }}
                        className="py-1.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shrink-0"
                        title="View Subject Breakdown"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Progress</span>
                      </button>

                      {/* Suspend Action */}
                      <button
                        type="button"
                        disabled={togglingStatusStudentId === student.id}
                        onClick={() => handleToggleStudentStatus(student)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold border flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0 ${
                          isSuspended
                            ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30'
                        }`}
                        title={isSuspended ? 'Reactivate student account' : 'Suspend student account'}
                      >
                        {isSuspended ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Unlock</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                            <span>Suspend</span>
                          </>
                        )}
                      </button>

                      {/* Wipe Account Action */}
                      <button
                        type="button"
                        onClick={() => {
                          setStudentToRemove(student);
                          setRemoveConfirmText('');
                          setRemoveStudentError(null);
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer active:scale-95 shrink-0"
                        title="Permanently wipe student record and history"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: TEST RESULTS */}
      {activeTab === 'tests' && (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter tests by subject, grade, ID..."
                className="w-full bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleExportTestsCSV}
              className="px-3 py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Test History CSV</span>
            </button>
          </div>

          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[11px] font-black uppercase text-slate-500 dark:text-[#8E8E93]">
                  <tr>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Class / Path</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400 font-medium">
                        No test records found.
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map((test) => (
                      <tr key={test.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-[#8E8E93]">
                          {test.student_id.substring(0, 12)}...
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          {test.subject}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">
                          {test.path_label}
                        </td>
                        <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">
                          {test.score} / {test.total}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              test.percentage >= 80
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                : test.percentage >= 50
                                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            }`}
                          >
                            {test.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-[#8E8E93] font-mono">
                          {test.duration}
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-[#8E8E93]">
                          {test.date_str}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setDeletingRecord(test)}
                            className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all cursor-pointer"
                            title="Delete faulty test record permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PROGRESS BREAKDOWN */}
      {activeTab === 'progress' && (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-500" />
              <span>Subject Performance & Weakness Analytics</span>
            </h2>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedStudentForProgress?.id || ''}
                onChange={(e) => {
                  const s = students.find((st) => st.id === e.target.value);
                  setSelectedStudentForProgress(s || null);
                }}
                className="w-full sm:w-64 bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="">Select Student to View Breakdown...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade || 'Unregistered'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!selectedStudentForProgress ? (
            <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center space-y-3">
              <BarChart2 className="w-10 h-10 text-amber-500 mx-auto opacity-60" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">Select a Student</h3>
              <p className="text-xs text-slate-500 dark:text-[#8E8E93] max-w-sm mx-auto">
                Choose a student from the dropdown above to analyze their subject accuracy, weak topic areas, and test attempt trends.
              </p>
            </div>
          ) : (
            (() => {
              const prog = calculateSubjectProgress(selectedStudentForProgress.id);
              return (
                <div className="space-y-4">
                  {/* Student Summary Bar */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black">{selectedStudentForProgress.name}</h3>
                      <p className="text-xs text-blue-100 font-medium">
                        {selectedStudentForProgress.email} • {selectedStudentForProgress.grade || 'Unregistered'} ({selectedStudentForProgress.stream || 'No Stream'})
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-black">{prog.overallAccuracy}%</div>
                        <div className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Overall Accuracy</div>
                      </div>
                      <div className="text-right border-l border-white/20 pl-4">
                        <div className="text-2xl font-black">{prog.totalTestsTaken}</div>
                        <div className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Tests Completed</div>
                      </div>
                    </div>
                  </div>

                  {/* Subject Breakdown Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {prog.breakdown.map((b) => (
                      <div
                        key={b.subject}
                        className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-md space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white">{b.subject}</span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              b.accuracy >= 75
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                : b.accuracy >= 50
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}
                          >
                            {b.accuracy}% Accuracy
                          </span>
                        </div>

                        <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              b.accuracy >= 75 ? 'bg-emerald-500' : b.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${b.accuracy}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#8E8E93] pt-1">
                          <span>{b.correctMCQs} / {b.totalMCQs} MCQs Correct</span>
                          <span>{b.testsCount} tests</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* TAB CONTENT 4: AI STUDY BUDDY CHAT LOGS */}
      {activeTab === 'study_buddy' && (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={studyBuddySearch}
                onChange={(e) => setStudyBuddySearch(e.target.value)}
                placeholder="Search AI Study Buddy messages..."
                className="w-full bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleExportStudyBuddyCSV}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export AI Chat Logs CSV</span>
            </button>
          </div>

          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg space-y-3">
            {filteredStudyBuddyHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium">
                No AI Study Buddy chat logs found.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredStudyBuddyHistory.map((msg) => {
                  const isUser = msg.role === 'user';
                  const student = students.find((s) => s.id === msg.student_id);

                  return (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                        isUser
                          ? 'bg-blue-500/5 border-blue-500/20 text-slate-900 dark:text-white'
                          : 'bg-purple-500/5 border-purple-500/20 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 font-bold">
                          {isUser ? (
                            <span className="text-blue-600 dark:text-[#0A84FF] flex items-center gap-1">
                              <UserIcon className="w-3.5 h-3.5" />
                              <span>Student ({student ? student.name : msg.student_id.substring(0, 8)})</span>
                            </span>
                          ) : (
                            <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <Bot className="w-3.5 h-3.5" />
                              <span>AI Study Buddy Assistant</span>
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-1">
                        <StudyBuddyFormattedMessage content={msg.message_text} isUser={isUser} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: MCQ BANK AUDIT */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-500" />
                <span>Automated Curriculum & MCQ Cross-Reference Audit</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-[#8E8E93]">
                Verifies prebuilt question stems, choices, and subject mapping integrity.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSanitizeAllMismatches}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Sanitize Mismatches</span>
              </button>

              <button
                type="button"
                onClick={handleExportAuditCSV}
                className="px-3 py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
              <span>Total Questions Inspected: {auditResults.length}</span>
              <span className="text-rose-600 dark:text-rose-400">Flagged Mismatches: {activeAuditCount}</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditResults
                .filter((r) => !dismissedFlagIds.includes(r.id))
                .filter((r) => auditStatusFilter === 'all' || r.status === auditStatusFilter)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      item.status === 'flagged'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>[{item.subject}] {item.topic}</span>
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded-full bg-white/20">
                        {item.status}
                      </span>
                    </div>
                    <p className="font-medium">{item.questionText}</p>
                    {item.issues.length > 0 && (
                      <div className="text-[11px] text-rose-600 dark:text-rose-400 font-bold">
                        ⚠️ Issues: {item.issues.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 6: RLS SECURITY RULES */}
      {activeTab === 'rls' && (
        <div className="space-y-4">
          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-500" />
                <span>Supabase RLS Policies & Security Script</span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-[#8E8E93]">
                Run this SQL script in Supabase SQL Editor to initialize Row Level Security policies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                copyToClipboard(sqlPolicyScript, 'sql');
                setSqlCopied(true);
                setTimeout(() => setSqlCopied(false), 2000);
              }}
              className="px-3 py-2 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {sqlCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{sqlCopied ? 'SQL Script Copied!' : 'Copy SQL Script'}</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-slate-300 font-mono text-xs overflow-x-auto shadow-2xl">
            <pre className="whitespace-pre">{sqlPolicyScript}</pre>
          </div>
        </div>
      )}

      {/* TAB CONTENT 7: BULK MCQ CSV IMPORT */}
      {activeTab === 'bulk_import' && (
        <AdminBulkMcqImportTab currentUser={currentUser} />
      )}

      {/* TAB CONTENT: PAYMENT REQUESTS VERIFICATION SYSTEM */}
      {activeTab === 'payment_requests' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner & Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => setPaymentStatusFilter('all')}
              className={`border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                paymentStatusFilter === 'all'
                  ? 'bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <span className="text-xs font-bold text-slate-500 dark:text-[#8E8E93]">Total Submissions</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{paymentRequests.length}</span>
                <span className="text-[10px] font-bold text-slate-400">requests</span>
              </div>
            </div>

            <div
              onClick={() => setPaymentStatusFilter('pending')}
              className={`border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                paymentStatusFilter === 'pending'
                  ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {paymentRequests.filter((r) => r.status === 'pending').length}
                </span>
                <span className="text-[10px] font-bold text-amber-600/70 dark:text-amber-400/70">awaiting approval</span>
              </div>
            </div>

            <div
              onClick={() => setPaymentStatusFilter('approved')}
              className={`border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                paymentStatusFilter === 'approved'
                  ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Approved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {paymentRequests.filter((r) => r.status === 'approved').length}
                </span>
                <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70">upgraded</span>
              </div>
            </div>

            <div
              onClick={() => setPaymentStatusFilter('rejected')}
              className={`border rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                paymentStatusFilter === 'rejected'
                  ? 'bg-rose-500/15 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                  : 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300">Rejected</span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                  {paymentRequests.filter((r) => r.status === 'rejected').length}
                </span>
                <span className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70">denied</span>
              </div>
            </div>
          </div>

          {/* Action Feedback Banner */}
          {paymentToast && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn ${
                paymentToast.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {paymentToast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />}
                <span>{paymentToast.message}</span>
              </div>
              <button onClick={() => setPaymentToast(null)} className="p-1 hover:opacity-75 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filter System Control Bar */}
          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Toggle Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Quick Filter:</span>
              </span>

              <button
                type="button"
                onClick={() => setPaymentStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  paymentStatusFilter === 'all'
                    ? 'bg-[#007AFF] text-white shadow-sm'
                    : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20'
                }`}
              >
                <span>All Requests</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${paymentStatusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'}`}>
                  {paymentRequests.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  paymentStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/20 text-amber-900 dark:text-amber-100">
                  {paymentRequests.filter((r) => r.status === 'pending').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  paymentStatusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approved</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-900 dark:text-emerald-100">
                  {paymentRequests.filter((r) => r.status === 'approved').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  paymentStatusFilter === 'rejected'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rejected</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500/20 text-rose-900 dark:text-rose-100">
                  {paymentRequests.filter((r) => r.status === 'rejected').length}
                </span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={paymentSearchQuery}
                onChange={(e) => setPaymentSearchQuery(e.target.value)}
                placeholder="Search name, email, TRX ID..."
                className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-8 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
              />
              {paymentSearchQuery && (
                <button onClick={() => setPaymentSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Payment Requests */}
          {paymentRequests
            .filter((r) => paymentStatusFilter === 'all' || r.status === paymentStatusFilter)
            .filter((r) => {
              const q = paymentSearchQuery.toLowerCase().trim();
              if (!q) return true;
              return (
                (r.student_name && r.student_name.toLowerCase().includes(q)) ||
                (r.student_email && r.student_email.toLowerCase().includes(q)) ||
                (r.payment_method && r.payment_method.toLowerCase().includes(q)) ||
                (r.transaction_reference && r.transaction_reference.toLowerCase().includes(q))
              );
            }).length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6">
              <CreditCard className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-60" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">No payment requests found</h4>
              <p className="text-xs text-slate-500 dark:text-[#8E8E93] mt-1 max-w-sm mx-auto">
                {paymentStatusFilter !== 'all'
                  ? `There are currently no payment requests matching the '${paymentStatusFilter}' status filter.`
                  : 'No student payment verification submissions have been recorded.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentRequests
                .filter((r) => paymentStatusFilter === 'all' || r.status === paymentStatusFilter)
                .filter((r) => {
                  const q = paymentSearchQuery.toLowerCase().trim();
                  if (!q) return true;
                  return (
                    (r.student_name && r.student_name.toLowerCase().includes(q)) ||
                    (r.student_email && r.student_email.toLowerCase().includes(q)) ||
                    (r.payment_method && r.payment_method.toLowerCase().includes(q)) ||
                    (r.transaction_reference && r.transaction_reference.toLowerCase().includes(q))
                  );
                })
                .map((req) => {
                  const isPending = req.status === 'pending';
                  const isApproved = req.status === 'approved';
                  const isRejected = req.status === 'rejected';
                  const isBusy = reviewingRequestId === req.id;

                  return (
                    <div
                      key={req.id}
                      className={`bg-white dark:bg-[#1C1C1E] border rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isPending
                          ? 'border-amber-500/40 bg-amber-500/[0.02]'
                          : isApproved
                          ? 'border-emerald-500/30'
                          : 'border-rose-500/30'
                      }`}
                    >
                      {/* Left Info */}
                      <div className="space-y-2 max-w-xl min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                            {req.student_name || 'Student'}
                          </span>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
                            ({req.student_email})
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                              isPending
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                : isApproved
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {isPending && <Clock className="w-3 h-3 text-amber-500" />}
                            {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                            {isRejected && <XCircle className="w-3 h-3 text-rose-500" />}
                            <span className="capitalize">{req.status}</span>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                          <div>
                            Method: <strong className="text-slate-900 dark:text-white font-bold">{req.payment_method}</strong>
                          </div>
                          <div>
                            Amount: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">PKR {req.amount}</strong>
                          </div>
                          {req.transaction_reference && (
                            <div className="font-mono bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-[11px] font-bold text-slate-800 dark:text-slate-200">
                              TRX: {req.transaction_reference}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400">
                            {new Date(req.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>

                        {req.admin_note && (
                          <div className="p-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                            <span className="font-bold text-slate-800 dark:text-slate-200">Admin Note:</span> {req.admin_note}
                          </div>
                        )}

                        {req.reviewed_by && (
                          <div className="text-[10px] text-slate-400">
                            Reviewed by {req.reviewed_by} on {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString() : ''}
                          </div>
                        )}
                      </div>

                      {/* Right Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center w-full md:w-auto justify-end">
                        {req.drive_file_url && (
                          <a
                            href={req.drive_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                            <span>View Proof</span>
                          </a>
                        )}

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprovePaymentRequest(req)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {isBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>{isApproved ? 'Approved' : 'Approve & Upgrade'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            setRejectingRequest(req);
                            setRejectNote('');
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
                            isRejected
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isRejected ? 'Rejected' : 'Reject'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ADMIN ACTIVITY AUDIT LOGS */}
      {activeTab === 'activity_logs' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Activity Logs Header & Search */}
          <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={activitySearchQuery}
                onChange={(e) => setActivitySearchQuery(e.target.value)}
                placeholder="Search audit logs by email, student, action..."
                className="w-full bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
              />
              {activitySearchQuery && (
                <button
                  onClick={() => setActivitySearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportActivityLogsCSV}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Log CSV</span>
              </button>
            </div>
          </div>

          {/* Logs List / Table */}
          {activityLogs.length === 0 ? (
            <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl p-8 text-center space-y-3">
              <Activity className="w-10 h-10 text-amber-500/50 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">No Activity Logs Found</h3>
              <p className="text-xs text-slate-500 dark:text-[#8E8E93] max-w-sm mx-auto">
                Admin manual plan modifications and payment approvals will automatically record audit trails here.
              </p>
            </div>
          ) : (
            <div className="bg-white/80 dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-[#8E8E93] uppercase text-[10px] font-extrabold">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Target Student</th>
                      <th className="px-4 py-3">Plan Change</th>
                      <th className="px-4 py-3">Admin Note</th>
                      <th className="px-4 py-3">Admin Executed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {activityLogs
                      .filter((log) => {
                        const q = activitySearchQuery.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          (log.target_student_name || '').toLowerCase().includes(q) ||
                          (log.target_student_email || '').toLowerCase().includes(q) ||
                          (log.admin_email || '').toLowerCase().includes(q) ||
                          (log.action_type || '').toLowerCase().includes(q) ||
                          (log.note || '').toLowerCase().includes(q)
                        );
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                log.action_type === 'manual_plan_change'
                                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                                  : log.action_type === 'payment_approved'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {log.action_type === 'manual_plan_change'
                                ? 'Plan Override'
                                : log.action_type === 'payment_approved'
                                ? 'Payment Approved'
                                : 'Payment Rejected'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {log.target_student_name || 'Student'}
                            </div>
                            <div className="text-[10.5px] font-mono text-slate-400">
                              {log.target_student_email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium">
                                {log.old_plan || 'Free'}
                              </span>
                              <ChevronRight className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-500/30">
                                {log.new_plan || 'Updated'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {log.note || '—'}
                          </td>
                          <td className="px-4 py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {log.admin_email}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REJECT PAYMENT REQUEST MODAL */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-ios-spring">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 text-rose-600">
                <XCircle className="w-5 h-5" />
                <span>Reject Payment Verification</span>
              </h3>
              <button
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectNote('');
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                You are rejecting the payment submission for{' '}
                <strong className="text-slate-900 dark:text-white">{rejectingRequest.student_name}</strong> ({rejectingRequest.student_email}). An email notification will be sent to the student.
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for rejection <span className="text-slate-400 font-normal">(Included in notification email)</span>:
                </label>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder="e.g. Transaction ID could not be verified on account statement, or screenshot is unclear."
                  className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-300 dark:border-white/20 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 h-24"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectNote('');
                }}
                className="px-4 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={reviewingRequestId === rejectingRequest.id}
                onClick={handleConfirmRejectPaymentRequest}
                className="px-4 py-2 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50"
              >
                {reviewingRequestId === rejectingRequest.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* STUDENT DETAIL MODAL (WHEN A STUDENT IS CLICKED) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-4xl w-full p-5 sm:p-8 shadow-2xl space-y-5 animate-ios-spring relative max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-white/10 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007AFF] to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {selectedStudent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedStudent.name}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        selectedStudent.status === 'suspended'
                          ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}
                    >
                      {selectedStudent.status || 'Active'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8E8E93] font-medium font-mono">
                    {selectedStudent.email} {selectedStudent.phone ? `• ${selectedStudent.phone}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto space-y-5 pr-1 flex-1">
              {/* Class & Stream Admin Override Box */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#007AFF] dark:text-[#0A84FF] font-extrabold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Administrative Class & Stream Override</span>
                  </div>
                  <span className="text-[10.5px] text-slate-400 font-medium">Locked for student</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Class / Grade Track:
                    </label>
                    <select
                      value={editStudentGrade}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditStudentGrade(val);
                        if (val === 'MDCAT') {
                          setEditStudentStream('MDCAT Stream');
                        } else if (val === 'TCAT') {
                          setEditStudentStream('Pre-Engineering Stream');
                        }
                      }}
                      className="w-full bg-white dark:bg-[#2C2C2E] border border-slate-300 dark:border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="9th">9th Class</option>
                      <option value="10th">10th Class</option>
                      <option value="11th">11th Class</option>
                      <option value="12th">12th Class</option>
                      <option value="MDCAT">MDCAT (Medical Entrance)</option>
                      <option value="TCAT">TCAT (Engineering Entrance)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Academic Stream / Major:
                    </label>
                    <select
                      value={editStudentStream}
                      onChange={(e) => setEditStudentStream(e.target.value)}
                      className="w-full bg-white dark:bg-[#2C2C2E] border border-slate-300 dark:border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {editStudentGrade === 'MDCAT' ? (
                        <>
                          <option value="MDCAT Stream">MDCAT Medical Stream</option>
                          <option value="Pre-Medical Stream">Pre-Medical / MDCAT</option>
                        </>
                      ) : editStudentGrade === 'TCAT' ? (
                        <>
                          <option value="Pre-Engineering Stream">Pre-Engineering Stream</option>
                          <option value="ICS Stream">ICS Engineering Stream</option>
                          <option value="TCAT Stream">TCAT Engineering Stream</option>
                        </>
                      ) : editStudentGrade.includes('9') || editStudentGrade.includes('10') ? (
                        <>
                          <option value="Biology Stream">Biology Stream</option>
                          <option value="Computer Science Stream">Computer Science Stream</option>
                        </>
                      ) : (
                        <>
                          <option value="Pre-Medical Stream">Pre-Medical Stream</option>
                          <option value="Pre-Engineering Stream">Pre-Engineering Stream</option>
                          <option value="ICS Stream">ICS Computer Science Stream</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10.5px] text-slate-400 font-medium">
                    Overriding immediately unlocks or locks student subjects.
                  </span>
                  <button
                    type="button"
                    disabled={isSavingGradeStream}
                    onClick={handleAdminSaveGradeStream}
                    className="px-4 py-1.5 bg-[#007AFF] hover:bg-[#0066CC] dark:bg-[#0A84FF] text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {isSavingGradeStream ? 'Saving Changes...' : 'Save Override Changes'}
                  </button>
                </div>

                {adminOverrideToast && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                    {adminOverrideToast}
                  </p>
                )}
              </div>

              {/* Detail Sub-Tabs */}
              <div className="border-b border-slate-100 dark:border-white/10 flex items-center gap-4 text-xs font-extrabold">
                <button
                  type="button"
                  onClick={() => setDetailSubTab('tests')}
                  className={`pb-2.5 transition-all border-b-2 cursor-pointer ${
                    detailSubTab === 'tests'
                      ? 'border-[#007AFF] text-[#007AFF] dark:text-[#0A84FF]'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                  }`}
                >
                  Test Attempts ({studentHistory.length})
                </button>

                <button
                  type="button"
                  onClick={() => setDetailSubTab('study_buddy')}
                  className={`pb-2.5 transition-all border-b-2 cursor-pointer ${
                    detailSubTab === 'study_buddy'
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-white'
                  }`}
                >
                  AI Study Buddy History ({selectedStudentBuddyHistory.length})
                </button>
              </div>

              {/* Sub-Tab 1: Test Attempt History */}
              {detailSubTab === 'tests' && (
                <div className="space-y-3">
                  {historyLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 text-[#0A84FF] animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 font-bold mt-2">Loading student test history...</p>
                    </div>
                  ) : studentHistory.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400 font-medium">
                      No test attempts recorded for this student yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {studentHistory.map((h) => (
                        <div
                          key={h.id}
                          className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{h.subject}</div>
                            <div className="text-[11px] text-slate-500 dark:text-[#8E8E93]">
                              {h.path_label} • {h.duration} • {h.date_str}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                h.percentage >= 80
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : h.percentage >= 50
                                  ? 'bg-amber-500/10 text-amber-500'
                                  : 'bg-rose-500/10 text-rose-500'
                              }`}
                            >
                              {h.score}/{h.total} ({h.percentage}%)
                            </span>

                            <button
                              type="button"
                              onClick={() => setDeletingRecord(h)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                              title="Delete faulty record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: AI Study Buddy Chat History */}
              {detailSubTab === 'study_buddy' && (
                <div className="space-y-3">
                  {loadingBuddyHistory ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto" />
                      <p className="text-xs text-slate-400 font-bold mt-2">Loading AI Study Buddy chat logs...</p>
                    </div>
                  ) : selectedStudentBuddyHistory.length === 0 ? (
                    <p className="text-center py-8 text-xs text-slate-400 font-medium">
                      No AI Study Buddy messages recorded for this student.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {selectedStudentBuddyHistory.map((msg) => {
                        const isUser = msg.role === 'user';
                        return (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-xl text-xs space-y-1 ${
                              isUser
                                ? 'bg-blue-500/10 border border-blue-500/20 text-slate-900 dark:text-white'
                                : 'bg-purple-500/10 border border-purple-500/20 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[10px] text-slate-400">
                              <span>{isUser ? 'Student Question' : 'AI Study Buddy Response'}</span>
                              <span className="font-mono">{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.message_text}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-slate-100 dark:border-white/10 pt-4 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                disabled={togglingStatusStudentId === selectedStudent.id}
                onClick={() => handleToggleStudentStatus(selectedStudent)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedStudent.status === 'suspended'
                    ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-500/30'
                }`}
              >
                {selectedStudent.status === 'suspended' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reactivate Account</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Suspend Account</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStudentToRemove(selectedStudent);
                  setRemoveConfirmText('');
                  setRemoveStudentError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Permanently Wipe Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT WIPE CONFIRMATION MODAL */}
      {studentToRemove && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[24px] sm:rounded-[28px] max-w-md w-full max-w-[95vw] sm:max-w-md p-4 sm:p-6 shadow-2xl space-y-4 animate-ios-spring relative overflow-hidden box-border my-auto">
            <div className="absolute top-0 left-0 right-0 h-2 bg-rose-600" />
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3 gap-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs sm:text-sm min-w-0">
                <Trash2 className="w-5 h-5 shrink-0" />
                <span className="truncate">Wipe & Remove Student Account</span>
              </div>
              <button
                onClick={() => {
                  setStudentToRemove(null);
                  setRemoveConfirmText('');
                  setRemoveStudentError(null);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs min-w-0">
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10 space-y-1 min-w-0 overflow-hidden">
                <div className="font-extrabold text-slate-900 dark:text-white text-sm truncate">{studentToRemove.name}</div>
                <div className="text-slate-500 dark:text-[#8E8E93] font-mono text-[11px] truncate">{studentToRemove.email}</div>
              </div>

              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-3 text-rose-900 dark:text-rose-200 text-xs space-y-1 font-medium break-words">
                <p className="font-extrabold flex items-center gap-1 text-rose-950 dark:text-rose-100">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>DESTRUCTIVE ACTION (Full Account Wipe)</span>
                </p>
                <p>
                  This action permanently deletes this student record, test history, MCQ attempts, and AI Study Buddy conversations from Supabase.
                </p>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 font-bold pt-1">
                  Upon logging back in with this email, the user will be treated as an unregistered brand-new student.
                </p>
              </div>

              <div className="space-y-1.5 pt-1 min-w-0">
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 break-words">
                  To confirm permanent wipe, type <span className="font-mono text-rose-600 dark:text-rose-400 break-all">{studentToRemove.email}</span> below:
                </label>
                <input
                  type="text"
                  value={removeConfirmText}
                  onChange={(e) => setRemoveConfirmText(e.target.value)}
                  placeholder="Type student email or name to confirm..."
                  className="w-full bg-slate-50 dark:bg-[#2C2C2E] border border-slate-300 dark:border-white/20 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-rose-500 box-border"
                />
              </div>

              {removeStudentError && (
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 p-2.5 rounded-xl border border-rose-300 dark:border-rose-500/30 break-words">
                  {removeStudentError}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isRemovingStudent}
                onClick={() => {
                  setStudentToRemove(null);
                  setRemoveConfirmText('');
                  setRemoveStudentError(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  isRemovingStudent ||
                  (removeConfirmText.trim().toLowerCase() !== studentToRemove.email.trim().toLowerCase() &&
                    removeConfirmText.trim().toLowerCase() !== studentToRemove.name.trim().toLowerCase())
                }
                onClick={handleConfirmRemoveStudent}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 text-center shrink-0"
              >
                {isRemovingStudent ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Wiping Student...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Permanently Wipe Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT TEST RECORD DELETION MODAL */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-md w-full p-6 shadow-2xl space-y-4 animate-ios-spring">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              <span>Delete Faulty Test Record</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete test record <span className="font-mono font-bold">#{deletingRecord.id}</span> ({deletingRecord.subject} - {deletingRecord.score}/{deletingRecord.total})?
            </p>
            {deleteRecordError && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl">
                {deleteRecordError}
              </p>
            )}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isDeletingRecord}
                onClick={handleConfirmPermanentDeleteRecord}
                className="px-4 py-2 rounded-full text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {isDeletingRecord ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN MANUAL PLAN MANAGEMENT MODAL */}
      {selectedStudentForPlan && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 animate-ios-spring">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-black text-sm flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Manage Subscription Plan</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8E8E93] font-medium">
                    {selectedStudentForPlan.name} • <span className="font-mono">{selectedStudentForPlan.email}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentForPlan(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Toast */}
            {planToast && (
              <div
                className={`p-3 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                  planToast.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {planToast.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                )}
                <span>{planToast.message}</span>
              </div>
            )}

            {/* Instant Access Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 p-3 rounded-2xl text-xs font-medium space-y-1">
              <div className="font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Immediate Access & Test Limit Override</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                Changing a plan grants immediate access to selected tracks, removes free test limits, and updates the student's dashboard in real-time.
              </p>
            </div>

            {/* Select Subscription Preset / Multi-Track Options */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-900 dark:text-white block">
                Select Track Access (Single or Multi-Track Combo):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Preset 1: Free Plan */}
                <button
                  type="button"
                  onClick={() => handleTogglePlanOption('free')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedPlansForChange.includes('free') && selectedPlansForChange.length === 1
                      ? 'bg-slate-100 dark:bg-white/15 border-slate-400 dark:border-white/30 ring-2 ring-slate-400'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">Free Access</div>
                    <div className="text-[10px] text-slate-500 dark:text-[#8E8E93]">Rs. 0 / Standard Limits</div>
                  </div>
                  {selectedPlansForChange.includes('free') && selectedPlansForChange.length === 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-slate-700 dark:text-white shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shrink-0" />
                  )}
                </button>

                {/* Preset 2: Matric Plan */}
                <button
                  type="button"
                  onClick={() => handleTogglePlanOption('matric')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedPlansForChange.includes('matric')
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-blue-400/50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                      <span>Matric Plan</span>
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-300 font-bold">Rs. 499 / Month</div>
                  </div>
                  {selectedPlansForChange.includes('matric') ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shrink-0" />
                  )}
                </button>

                {/* Preset 3: FSc Plan */}
                <button
                  type="button"
                  onClick={() => handleTogglePlanOption('fsc')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedPlansForChange.includes('fsc')
                      ? 'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500/50'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-400/50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">FSc Plan</div>
                    <div className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold">Rs. 999 / Month</div>
                  </div>
                  {selectedPlansForChange.includes('fsc') ? (
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shrink-0" />
                  )}
                </button>

                {/* Preset 4: TCAT / UET Taxila */}
                <button
                  type="button"
                  onClick={() => handleTogglePlanOption('tcat')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    selectedPlansForChange.includes('tcat')
                      ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/50'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-amber-400/50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">TCAT / ECAT</div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-300 font-bold">Rs. 1,499 / Month</div>
                  </div>
                  {selectedPlansForChange.includes('tcat') ? (
                    <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shrink-0" />
                  )}
                </button>

                {/* Preset 5: MDCAT Medical */}
                <button
                  type="button"
                  onClick={() => handleTogglePlanOption('mdcat')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 sm:col-span-2 ${
                    selectedPlansForChange.includes('mdcat')
                      ? 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-emerald-400/50'
                  }`}
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>MDCAT Medical Entrance Plan</span>
                      <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">PMDC Standard</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-300 font-bold">Rs. 1,499 / Month</div>
                  </div>
                  {selectedPlansForChange.includes('mdcat') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-white/20 shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Custom Package Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Custom Package Display Name (Optional):
              </label>
              <input
                type="text"
                value={customPackageName}
                onChange={(e) => setCustomPackageName(e.target.value)}
                placeholder="e.g. Boardly Full Premium Bundle (Rs. 1,499/mo)"
                className="w-full bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Access Duration Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-[#8E8E93]">Access Period:</label>
                <select
                  value={expirationMonths}
                  onChange={(e) => setExpirationMonths(Number(e.target.value))}
                  className="w-full bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-white font-extrabold focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Month (30 days)</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>1 Year (12 Months)</option>
                  <option value={120}>Lifetime Access (10 Years)</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-[#8E8E93]">Verification / Offline Payment Reference:</label>
                <input
                  type="text"
                  value={planAdminNote}
                  onChange={(e) => setPlanAdminNote(e.target.value)}
                  placeholder="e.g. JazzCash TRX#883921 / Bank Transfer receipt verified"
                  className="w-full bg-slate-100 dark:bg-[#2C2C2E] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
                disabled={isSavingPlan}
                onClick={() => setSelectedStudentForPlan(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-200 cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSavingPlan}
                onClick={handleSaveStudentPlan}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 text-center shrink-0"
              >
                {isSavingPlan ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Updating Plan...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-white shrink-0" />
                    <span>Save & Update Subscription</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT PROOF SCREENSHOT VIEWING MODAL */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-[28px] max-w-2xl w-full p-6 shadow-2xl space-y-4 animate-ios-spring">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span>Submitted Payment Screenshot Proof</span>
              </h3>
              <button
                onClick={() => setViewingProofUrl(null)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-2 max-h-[65vh] overflow-auto flex items-center justify-center border border-white/10">
              <img
                src={viewingProofUrl}
                alt="Payment Proof Screenshot"
                className="max-w-full max-h-[60vh] object-contain rounded-xl"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={viewingProofUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#007AFF] dark:text-[#0A84FF] flex items-center gap-1 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Size Image in New Tab</span>
              </a>

              <button
                onClick={() => setViewingProofUrl(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white rounded-full text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
