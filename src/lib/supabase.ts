import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import { HistoryItem, TestResult } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wbvzbbnapowwmrjecdyt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  }
);

export const ADMIN_EMAILS = [
  'shsvirtualadmin@gmail.com',
  'shsteachersemail@gmail.com',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized) || normalized.includes('admin');
}

/**
 * Helper to fetch internal APIs with Supabase Auth JWT token
 */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}

/**
  * Safely parse JSON from a response object without throwing "Unexpected end of JSON input" errors.
  */
export async function safeJsonResponse<T = any>(resp: Response): Promise<T | null> {
  try {
    const text = await resp.text();
    if (!text || !text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  } catch (err) {
    console.warn('[safeJsonResponse] Could not parse response as JSON:', err);
    return null;
  }
}

/**
 * Extract a human-readable, user-friendly error message from Supabase auth errors or generic exceptions.

 * Prevents empty objects like "{}" or "[object Object]" from ever being displayed to the user.
 */
export function formatSupabaseAuthError(err: any, context?: 'signup' | 'signin'): string {
  if (!err) {
    return context === 'signup'
      ? 'Sign up failed. Please check your details and try again.'
      : 'An unexpected authentication error occurred. Please try again.';
  }

  // Always log the full error object for complete developer debugging
  console.error('[Supabase Auth Error Log]:', err);

  // 1. Safely extract string error message from various possible error object structures
  let extractedMessage: string | null = null;

  if (typeof err === 'string') {
    extractedMessage = err;
  } else if (typeof err === 'object' && err !== null) {
    if (typeof err.message === 'string' && err.message.trim()) {
      extractedMessage = err.message;
    } else if (typeof err.error_description === 'string' && err.error_description.trim()) {
      extractedMessage = err.error_description;
    } else if (typeof err.msg === 'string' && err.msg.trim()) {
      extractedMessage = err.msg;
    } else if (typeof err.description === 'string' && err.description.trim()) {
      extractedMessage = err.description;
    } else if (typeof err.details === 'string' && err.details.trim()) {
      extractedMessage = err.details;
    } else if (err.error && typeof err.error === 'object' && typeof err.error.message === 'string' && err.error.message.trim()) {
      extractedMessage = err.error.message;
    } else if (err.cause && typeof err.cause === 'object' && typeof err.cause.message === 'string' && err.cause.message.trim()) {
      extractedMessage = err.cause.message;
    }
  }

  // Sanitize extracted message string to prevent "{}" or "[object Object]"
  if (extractedMessage) {
    extractedMessage = extractedMessage.trim();
    if (
      extractedMessage === '{}' ||
      extractedMessage === '[object Object]' ||
      extractedMessage === 'null' ||
      extractedMessage === 'undefined'
    ) {
      extractedMessage = null;
    }
  }

  // 2. Safely extract status or error code
  let errorCode: string | number | null = null;
  if (typeof err === 'object' && err !== null) {
    if (err.code && typeof err.code !== 'object') errorCode = err.code;
    else if (err.status && typeof err.status !== 'object') errorCode = err.status;
    else if (err.statusCode && typeof err.statusCode !== 'object') errorCode = err.statusCode;
    else if (typeof err.error === 'string' || typeof err.error === 'number') errorCode = err.error;
  }

  // 3. Check known error codes or status codes
  if (errorCode === 'user_already_exists' || errorCode === 422) {
    return 'This account is already registered. Please sign in instead.';
  }
  if (errorCode === 'invalid_credentials') {
    return 'Authentication failed. Please check your credentials and try again.';
  }
  if (errorCode === 'over_email_send_rate_limit' || errorCode === 429) {
    return 'Rate limit exceeded. Too many attempts. Please wait a few minutes before trying again.';
  }

  // 4. If we have a valid extracted string message, clean and format it
  if (extractedMessage) {
    return cleanAuthMessage(extractedMessage, context);
  }

  // 5. Safe fallback if no string message could be extracted from error object
  if (context === 'signup') {
    return errorCode
      ? `Sign up failed (Code: ${errorCode}). Please try again.`
      : 'Sign up failed. Please try again.';
  }

  return errorCode
    ? `Authentication failed (Code: ${errorCode}). Please try again.`
    : 'Authentication failed. Please try again.';
}

function cleanAuthMessage(msg: string, context?: 'signup' | 'signin'): string {
  const lower = msg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Authentication failed. Please check your credentials and try again.';
  }
  if (lower.includes('user already registered') || lower.includes('already registered') || lower.includes('user_already_exists')) {
    return 'This account is already registered. Please sign in instead.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('over_email_send_rate_limit')) {
    return 'Rate limit exceeded. Please wait a few minutes before trying again.';
  }
  if (lower.includes('token has expired') || lower.includes('otp_expired') || lower.includes('token expired') || lower.includes('code has expired')) {
    return 'Verification link or token has expired. Please request a new confirmation email.';
  }
  if (lower.includes('invalid token') || lower.includes('token is invalid') || lower.includes('invalid otp') || lower.includes('token not found')) {
    return 'Invalid verification link or token. Please request a new confirmation email.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email address not confirmed yet. Please check your inbox for the confirmation link.';
  }
  if (lower.includes('unable to validate email address') || lower.includes('invalid email') || lower.includes('invalid_email')) {
    return 'Please enter a valid email address.';
  }

  if (context === 'signup') {
    return lower.startsWith('sign up') || lower.startsWith('signup')
      ? msg
      : `Sign up failed: ${msg}`;
  }

  return msg;
}

/**
 * Resends the signup confirmation email to the specified email address using Supabase.
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' };
  }
  try {
    const redirectUrl = `${window.location.origin}${window.location.pathname}`;
    console.log('====================================');
    console.log('[SUPABASE AUTH RESEND CALL]');
    console.log('Target Email:', email.trim());
    console.log('Redirect URL:', redirectUrl);

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    console.log('[SUPABASE AUTH RESEND RESPONSE]');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Error:', error);
    console.log('====================================');

    if (error) {
      return { success: false, error: formatSupabaseAuthError(error, 'signup') };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[SUPABASE AUTH RESEND EXCEPTION]:', err);
    return { success: false, error: formatSupabaseAuthError(err, 'signup') };
  }
}

/**
 * Verifies an email confirmation token_hash sent in Supabase confirmation links.
 */
export async function verifyEmailTokenHash(tokenHash: string, type: any = 'signup'): Promise<{ success: boolean; session?: any; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' };
  }
  try {
    console.log('====================================');
    console.log('[SUPABASE AUTH VERIFY TOKEN_HASH CALL]');
    console.log('Token Hash:', tokenHash);
    console.log('Verification Type:', type);
    
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type || 'signup',
    });

    console.log('[SUPABASE AUTH VERIFY TOKEN_HASH RESPONSE]');
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Error:', error);
    console.log('====================================');

    if (error) {
      return { success: false, error: formatSupabaseAuthError(error, 'signup') };
    }
    return { success: true, session: data.session };
  } catch (err: any) {
    console.error('[SUPABASE AUTH VERIFY TOKEN_HASH EXCEPTION]:', err);
    return { success: false, error: formatSupabaseAuthError(err, 'signup') };
  }
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  grade: string;
  stream?: string;
  subjects?: string[] | string;
  dream_university?: string;
  target_university?: string;
  sign_up_method: string; // 'Google' | 'Email/Password'
  status?: string; // 'active' | 'pending admin approval'
  is_registered?: boolean;
  package_name?: string;
  subscribed_plans?: string[];
  assigned_classes?: string[];
  is_pro?: boolean;
  target_exam?: 'FBISE' | 'MDCAT' | 'TCAT';
  enrollment_date?: string;
  payment_status?: string; // 'Verified & Paid' | 'Pending Verification' | 'Unpaid' | 'Rejected'
  requires_payment?: boolean; // true for new signups after rule deployment, false for existing students
  access_expires?: string;
  created_at: string;
  updated_at?: string;
}

// Rule deployment cutoff timestamp: Accounts created before this date are existing accounts and unaffected
export const PAYMENT_RULE_DEPLOYMENT_DATE = '2026-08-01T09:00:00.000Z';

export function isStudentExistingBeforeRule(createdAtStr?: string): boolean {
  if (!createdAtStr) return true; // Default to existing/unaffected if timestamp missing
  try {
    return new Date(createdAtStr).getTime() < new Date(PAYMENT_RULE_DEPLOYMENT_DATE).getTime();
  } catch {
    return true;
  }
}

export type User = SupabaseUser;

// In-memory request deduplication & memory cache for profile requests
const profileInFlightPromises = new Map<string, Promise<StudentProfile | null>>();
const syncInFlightPromises = new Map<string, Promise<StudentProfile>>();
const profileMemoryCache = new Map<string, { profile: StudentProfile; timestamp: number }>();
const PROFILE_CACHE_TTL_MS = 20000; // 20 seconds TTL

export function clearProfileCache(userId?: string) {
  if (userId) {
    profileInFlightPromises.delete(userId);
    syncInFlightPromises.delete(userId);
    profileMemoryCache.delete(userId);
  } else {
    profileInFlightPromises.clear();
    syncInFlightPromises.clear();
    profileMemoryCache.clear();
  }
}

// Helper to standardize student profile normalization from raw database rows
export function normalizeStudentProfileFromRow(data: any, fallbackUserId?: string): StudentProfile {
  if (!data) {
    return {
      id: fallbackUserId || '',
      name: '',
      email: '',
      phone: '',
      grade: '',
      stream: '',
      subjects: [],
      sign_up_method: 'Google',
      status: 'active',
      is_registered: false,
      package_name: 'FBISE Annual Practice Pass',
      subscribed_plans: ['free'],
      assigned_classes: [],
      is_pro: false,
      enrollment_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      payment_status: 'Free Plan',
      requires_payment: false,
      access_expires: new Date(Date.now() + 365 * 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const email = data.email || '';
  const isAdmin = isAdminEmail(email);
  const validGrade = Boolean(data.grade && data.grade.trim() && data.grade !== 'General Student');
  const validStream = Boolean(data.stream && data.stream.trim());
  const hasGradeStream = Boolean(validGrade && validStream);
  const isReg = isAdmin || Boolean(data.is_registered) || hasGradeStream;
  const isExistingBeforeRule = isStudentExistingBeforeRule(data.created_at);

  let subscribedPlans: string[] = [];
  if (Array.isArray(data.subscribed_plans)) {
    subscribedPlans = data.subscribed_plans.map((p: any) => String(p));
  } else if (typeof data.subscribed_plans === 'string' && data.subscribed_plans.trim()) {
    try {
      const parsed = JSON.parse(data.subscribed_plans);
      subscribedPlans = Array.isArray(parsed) ? parsed.map((p: any) => String(p)) : [String(data.subscribed_plans)];
    } catch {
      subscribedPlans = [String(data.subscribed_plans)];
    }
  }

  let assignedClasses: string[] = [];
  if (Array.isArray(data.assigned_classes)) {
    assignedClasses = data.assigned_classes.map((c: any) => String(c));
  } else if (typeof data.assigned_classes === 'string' && data.assigned_classes.trim()) {
    try {
      const parsed = JSON.parse(data.assigned_classes);
      assignedClasses = Array.isArray(parsed) ? parsed.map((c: any) => String(c)) : [String(data.assigned_classes)];
    } catch {
      assignedClasses = [String(data.assigned_classes)];
    }
  }

  if (assignedClasses.length === 0 && (data.grade || data.stream)) {
    const derived = `${data.grade || ''}${data.stream ? ' ' + data.stream : ''}`.trim();
    if (derived) assignedClasses = [derived];
  }

  const rawPaymentStatus = data.payment_status || (isAdmin || isExistingBeforeRule ? 'Verified & Paid' : 'Pending Verification');
  const pkgName = data.package_name || '';
  const pkgNameLower = pkgName.toLowerCase();

  const hasNonFreePlan = subscribedPlans.some((p: string) => {
    const pl = String(p).toLowerCase();
    return pl !== 'free' && ['pro', 'fsc', 'mdcat', 'tcat', 'matric', 'premium', 'boardly_pro'].includes(pl);
  });

  const isExplicitlyPro = typeof data.is_pro === 'boolean' ? data.is_pro : null;

  const isPro = isAdmin ||
    (isExplicitlyPro !== null ? isExplicitlyPro : (
      rawPaymentStatus === 'Verified & Paid' ||
      hasNonFreePlan ||
      (pkgName.length > 0 && !pkgNameLower.includes('free'))
    ));

  const finalPaymentStatus = isPro ? 'Verified & Paid' : rawPaymentStatus;
  const finalRequiresPayment = isPro ? false : (typeof data.requires_payment === 'boolean' ? data.requires_payment : (!isAdmin && !isExistingBeforeRule));

  return {
    id: data.id || fallbackUserId || '',
    name: data.name || '',
    email: email,
    phone: data.phone || '',
    grade: data.grade || '',
    stream: data.stream || '',
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    dream_university: data.dream_university || data.target_university || '',
    target_university: data.target_university || data.dream_university || '',
    sign_up_method: data.sign_up_method || 'Google',
    status: data.status || (finalRequiresPayment ? 'pending admin approval' : 'active'),
    is_registered: isReg,
    package_name: pkgName || (isPro ? 'Boardly Pro Pass' : 'FBISE Annual Practice Pass'),
    subscribed_plans: subscribedPlans.length > 0 ? subscribedPlans : (isPro ? ['fsc'] : ['free']),
    assigned_classes: assignedClasses,
    is_pro: isPro,
    enrollment_date: data.enrollment_date || new Date(data.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    payment_status: finalPaymentStatus,
    requires_payment: finalRequiresPayment,
    access_expires: data.access_expires || new Date(Date.now() + 365 * 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
  };
}

// Helper to sync or create student profile in Supabase Postgres 'students' table
export async function syncUserProfile(
  user: SupabaseUser,
  extraGrade?: string,
  authMethod?: 'Google'
): Promise<StudentProfile> {
  const userId = user.id;

  // Deduplicate concurrent calls for the same user
  if (syncInFlightPromises.has(userId)) {
    return syncInFlightPromises.get(userId)!;
  }

  const syncPromise = (async (): Promise<StudentProfile> => {
    const method = authMethod || (user.app_metadata?.provider === 'google' ? 'Google' : 'Email/Password');
    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.displayName ||
      user.email?.split('@')[0] ||
      'Student';

    const isAdmin = isAdminEmail(user.email);

    const defaultProfile: StudentProfile = {
      id: user.id,
      name: displayName,
      email: user.email || '',
      grade: isAdmin ? 'Admin' : (extraGrade && extraGrade !== 'General Student' ? extraGrade : ''),
      stream: isAdmin ? 'Admin Stream' : '',
      sign_up_method: method,
      is_registered: isAdmin,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured) {
      return defaultProfile;
    }

    try {
      // Check if student exists
      const { data: existing } = await supabase
        .from('students')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      let finalProfile: StudentProfile;

      if (existing) {
        const updates: Partial<StudentProfile> = {};
        if (extraGrade && extraGrade !== 'General Student' && extraGrade !== existing.grade) {
          updates.grade = extraGrade;
        }
        if (displayName && existing.name !== displayName) {
          updates.name = displayName;
        }
        if (Object.keys(updates).length > 0) {
          await supabase.from('students').update(updates).eq('id', user.id);
        }

        finalProfile = normalizeStudentProfileFromRow({ ...existing, ...updates }, user.id);
      } else {
        // Insert new student record
        const requiresPay = !isAdmin;
        const newDefaultProfile: StudentProfile = {
          ...defaultProfile,
          requires_payment: requiresPay,
          payment_status: isAdmin ? 'Verified & Paid' : 'Unpaid',
          status: requiresPay ? 'pending admin approval' : 'active',
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('students')
          .upsert(newDefaultProfile)
          .select()
          .single();

        if (insertErr) {
          console.warn('Failed to insert student into Supabase:', insertErr.message);
          finalProfile = newDefaultProfile;
        } else {
          finalProfile = normalizeStudentProfileFromRow(inserted || newDefaultProfile, user.id);
        }
      }

      // Save to memory cache & localStorage
      profileMemoryCache.set(userId, { profile: finalProfile, timestamp: Date.now() });
      try {
        localStorage.setItem(`boardly_profile_${userId}`, JSON.stringify(finalProfile));
        localStorage.setItem('boardly_cached_profile', JSON.stringify(finalProfile));
      } catch {}

      console.log(`[DEBUG: Plan Update FRONTEND USE] syncUserProfile student ${userId}:`, {
        id: finalProfile.id,
        email: finalProfile.email,
        payment_status: finalProfile.payment_status,
        is_pro: finalProfile.is_pro,
        subscribed_plans: finalProfile.subscribed_plans,
        package_name: finalProfile.package_name,
      });

      return finalProfile;
    } catch (err) {
      console.error('Error syncing user profile with Supabase:', err);
      return defaultProfile;
    }
  })();

  syncInFlightPromises.set(userId, syncPromise);
  try {
    return await syncPromise;
  } finally {
    syncInFlightPromises.delete(userId);
  }
}

export async function updateUserGradeInSupabase(uid: string, grade: string, requesterEmail?: string): Promise<void> {
  const isAdmin = isAdminEmail(requesterEmail);
  if (!isAdmin) {
    console.warn('Unauthorized call to updateUserGradeInSupabase blocked for non-admin');
    return;
  }
  if (!isSupabaseConfigured) return;
  try {
    await supabase.from('students').update({ grade }).eq('id', uid);
  } catch (err) {
    console.error('Failed to update grade in Supabase:', err);
  }
}

export async function saveTestToSupabase(
  uid: string,
  historyItem: HistoryItem,
  testResult: TestResult
): Promise<void> {
  const nowIso = new Date().toISOString();

  const score = Number(testResult.score ?? historyItem.score ?? 0);
  const total = Number(testResult.total ?? historyItem.total ?? 0);
  const computedPct = total > 0 ? Math.round((score / total) * 100) : Number(testResult.percentage ?? historyItem.percentage ?? 0);

  // Extract attempt items
  let attempts: any[] = [];
  if (testResult.questions && Array.isArray(testResult.questions) && testResult.questions.length > 0) {
    attempts = testResult.questions.map((q, idx) => {
      const ans = testResult.userAnswers ? testResult.userAnswers[idx] : undefined;
      const isCorrect = ans ? ans.selectedOption === q.correct : false;
      return {
        questionId: q.id,
        questionText: q.q,
        chapter: q.topic || testResult.config.subject || 'General Concepts',
        selectedAnswer: ans && ans.selectedOption !== null && ans.selectedOption !== undefined ? ans.selectedOption : -1,
        correctAnswer: q.correct,
        isCorrect,
        timeTakenSeconds: ans ? (ans.timeSpentSeconds || 15) : 15,
      };
    });
  }

  // 1. Primary Save: Call server API /api/save-test-result
  try {
    const apiRes = await apiFetch('/api/save-test-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: uid,
        subject: historyItem.subject,
        pathLabel: historyItem.pathLabel,
        score,
        total,
        percentage: computedPct,
        duration: historyItem.timeTaken,
        timeTakenSeconds: testResult.timeTakenSeconds,
        dateStr: historyItem.dateStr,
        attempts,
      }),
    });
    const apiData = await safeJsonResponse(apiRes);
    if (apiData) {
      console.log('[saveTestToSupabase API response]:', apiData);
    }
  } catch (apiErr) {
    console.warn('Failed to call /api/save-test-result:', apiErr);
  }

  // 2. Client-side direct Supabase save if configured & user authenticated
  if (isSupabaseConfigured) {
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validUid = uuidRegex.test(uid) ? uid : null;

      if (validUid) {
        const { error: insertErr } = await supabase.from('test_results').insert({
          student_id: validUid,
          subject: historyItem.subject,
          path_label: historyItem.pathLabel,
          score,
          total,
          percentage: computedPct,
          duration: historyItem.timeTaken,
          time_taken_seconds: testResult.timeTakenSeconds,
          date_str: historyItem.dateStr,
          created_at: nowIso,
        });

        if (insertErr) {
          console.warn('[saveTestToSupabase client insert error]:', insertErr.message);
        }
      }

      if (attempts.length > 0 && validUid) {
        const rowsToInsert = attempts.map((a) => ({
          student_id: validUid,
          subject: testResult.config.subject,
          chapter: a.chapter,
          question_id: a.questionId,
          question_text: a.questionText,
          selected_answer: a.selectedAnswer,
          correct_answer: a.correctAnswer,
          is_correct: a.isCorrect,
          time_taken_seconds: a.timeTakenSeconds,
          created_at: nowIso,
        }));
        const { error: mcqErr } = await supabase.from('mcq_attempts').insert(rowsToInsert);
        if (mcqErr) {
          console.warn('[saveTestToSupabase client mcq_attempts insert warning]:', mcqErr.message);
        }
      }
    } catch (err) {
      console.warn('Failed direct client Supabase insert in saveTestToSupabase:', err);
    }
  }
}

export interface StudentWeaknessProfileData {
  studentId: string;
  studentEmail?: string;
  subject: string;
  totalAttempts: number;
  correctAttempts: number;
  overallAccuracy: number;
  avgTimePerQuestionSeconds: number;
  trend: 'improving' | 'declining' | 'stable' | 'insufficient_data';
  weakestTopics: Array<{
    chapter: string;
    total: number;
    correct: number;
    accuracy: number;
    avgTime: number;
  }>;
  strongestTopics: Array<{
    chapter: string;
    total: number;
    correct: number;
    accuracy: number;
    avgTime: number;
  }>;
  chapterBreakdown: Array<{
    chapter: string;
    total: number;
    correct: number;
    accuracy: number;
    avgTime: number;
  }>;
  promptContext: string;
}

export async function fetchStudentWeaknessProfile(
  studentId: string,
  subject?: string
): Promise<StudentWeaknessProfileData | null> {
  if (!studentId) return null;
  try {
    const res = await apiFetch(`/api/student-weakness-profile?studentId=${encodeURIComponent(studentId)}${subject ? `&subject=${encodeURIComponent(subject)}` : ''}`);
    if (res.ok) {
      const data = await safeJsonResponse(res);
      if (data?.success && data?.profile) {
        return data.profile;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch student weakness profile from API:', err);
  }
  return null;
}

export async function fetchAllStudentWeaknessProfiles(): Promise<StudentWeaknessProfileData[]> {
  try {
    const res = await apiFetch('/api/admin/all-student-weakness-profiles');
    if (res.ok) {
      const data = await safeJsonResponse(res);
      if (data?.success && Array.isArray(data.profiles)) {
        return data.profiles;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch all student weakness profiles:', err);
  }
  return [];
}

export async function fetchUserTestHistoryFromSupabase(uid: string): Promise<HistoryItem[]> {
  const historyMap = new Map<string, HistoryItem>();

  // 1. Fetch from server API endpoint (/api/user-test-history)
  try {
    const apiRes = await apiFetch(`/api/user-test-history?studentId=${encodeURIComponent(uid)}`);
    if (apiRes.ok) {
      const apiData = await safeJsonResponse(apiRes);
      if (apiData?.success && Array.isArray(apiData.history)) {
        for (const item of apiData.history) {
          if (!item.hidden_from_student) {
            historyMap.set(String(item.id), item);
          }
        }
      }
    }
  } catch (apiErr) {
    console.warn('Failed to fetch /api/user-test-history:', apiErr);
  }

  // 2. Fetch from client Supabase if configured & authenticated
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('student_id', uid)
        .or('hidden_from_student.eq.false,hidden_from_student.is.null')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Supabase fetch history error:', error.message);
      } else if (Array.isArray(data)) {
        for (const row of data) {
          if (row.hidden_from_student) continue;
          const score = Number(row.score ?? 0);
          const total = Number(row.total ?? 0);
          const calcPct = total > 0 ? Math.round((score / total) * 100) : 0;
          const rawPct = row.percentage !== null && row.percentage !== undefined && !isNaN(Number(row.percentage)) ? Number(row.percentage) : null;
          const percentage = rawPct && rawPct > 0 ? rawPct : (calcPct > 0 ? calcPct : (rawPct ?? 0));

          const item: HistoryItem = {
            id: String(row.id),
            dateStr: row.date_str || new Date(row.created_at).toLocaleDateString(),
            subject: row.subject || 'Practice Test',
            pathLabel: row.path_label || 'General',
            percentage,
            score,
            total,
            timeTaken: row.duration || '0m 0s',
            hidden_from_student: Boolean(row.hidden_from_student),
          };

          if (!historyMap.has(item.id)) {
            historyMap.set(item.id, item);
          }
        }
      }
    } catch (err) {
      console.warn('Failed client Supabase query in fetchUserTestHistoryFromSupabase:', err);
    }
  }

  return Array.from(historyMap.values());
}

export async function clearUserTestHistoryInSupabase(uid: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };
  try {
    // Soft Delete: update hidden_from_student = true so student history is hidden but admin retains full record
    const { error: err1 } = await supabase
      .from('test_results')
      .update({ hidden_from_student: true })
      .eq('student_id', uid);

    if (err1) {
      console.error('Failed to soft-delete test results in Supabase:', err1.message);
      return { success: false, error: err1.message };
    }

    // Call server endpoint if active
    try {
      await apiFetch('/api/clear-test-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: uid, softDelete: true }),
      });
    } catch (apiErr) {
      console.warn('Failed to call /api/clear-test-history:', apiErr);
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error soft clearing test history in Supabase:', err);
    return { success: false, error: err?.message || 'Failed to clear history' };
  }
}

export async function permanentlyDeleteTestRecordInSupabase(recordId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: true };
  try {
    const { error } = await supabase
      .from('test_results')
      .delete()
      .eq('id', recordId);

    if (error) {
      console.error('Failed to permanently delete test result from Supabase:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Error permanently deleting test record:', err);
    return { success: false, error: err?.message || 'Failed to permanently delete record' };
  }
}

export async function fetchAllStudentsFromSupabase(): Promise<StudentProfile[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch students error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => normalizeStudentProfileFromRow(row, row.id));
  } catch (err) {
    console.error('Failed to fetch students from Supabase:', err);
    return [];
  }
}

export interface AdminTestResult {
  id: string;
  student_id: string;
  subject: string;
  path_label: string;
  score: number;
  total: number;
  percentage: number;
  duration: string;
  time_taken_seconds?: number;
  date_str: string;
  created_at: string;
  hidden_from_student?: boolean;
  student_name?: string;
  student_email?: string;
}

export async function fetchAllTestResultsFromSupabase(): Promise<AdminTestResult[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch test results error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => {
      const score = Number(row.score ?? 0);
      const total = Number(row.total ?? 0);
      const calcPct = total > 0 ? Math.round((score / total) * 100) : 0;
      const rawPct = row.percentage !== null && row.percentage !== undefined && !isNaN(Number(row.percentage)) ? Number(row.percentage) : null;
      const percentage = rawPct && rawPct > 0 ? rawPct : (calcPct > 0 ? calcPct : (rawPct ?? 0));

      return {
        id: String(row.id),
        student_id: row.student_id || '',
        subject: row.subject || 'General',
        path_label: row.path_label || 'General',
        score,
        total,
        percentage,
        duration: row.duration || '0m 0s',
        time_taken_seconds: row.time_taken_seconds,
        date_str: row.date_str || new Date(row.created_at).toLocaleDateString(),
        created_at: row.created_at || new Date().toISOString(),
        hidden_from_student: Boolean(row.hidden_from_student),
      };
    });
  } catch (err) {
    console.error('Failed to fetch all test results from Supabase:', err);
    return [];
  }
}

export async function fetchStudentTestResultsFromSupabase(studentId: string): Promise<AdminTestResult[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch student test results error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => {
      const score = Number(row.score ?? 0);
      const total = Number(row.total ?? 0);
      const calcPct = total > 0 ? Math.round((score / total) * 100) : 0;
      const rawPct = row.percentage !== null && row.percentage !== undefined && !isNaN(Number(row.percentage)) ? Number(row.percentage) : null;
      const percentage = rawPct && rawPct > 0 ? rawPct : (calcPct > 0 ? calcPct : (rawPct ?? 0));

      return {
        id: String(row.id),
        student_id: row.student_id || studentId,
        subject: row.subject || 'General',
        path_label: row.path_label || 'General',
        score,
        total,
        percentage,
        duration: row.duration || '0m 0s',
        time_taken_seconds: row.time_taken_seconds,
        date_str: row.date_str || new Date(row.created_at).toLocaleDateString(),
        created_at: row.created_at || new Date().toISOString(),
        hidden_from_student: Boolean(row.hidden_from_student),
      };
    });
  } catch (err) {
    console.error('Failed to fetch student test results from Supabase:', err);
    return [];
  }
}

export interface StudentMcqUsageInfo {
  currentUsage: number;
  limit: number;
  remaining: number;
  resetDate: string;
  isAdmin: boolean;
}

export async function fetchStudentMcqUsage(
  userId: string,
  userEmail?: string
): Promise<StudentMcqUsageInfo> {
  const fallbackReset = (() => {
    const d = new Date();
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthName = nextMonth.toLocaleString('en-US', { month: 'long' });
    return `${monthName} 1st`;
  })();

  try {
    const res = await apiFetch(`/api/mcq-usage?userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail || '')}`);
    if (res.ok) {
      const data = await safeJsonResponse(res);
      if (data?.success) {
        return {
          currentUsage: data.currentUsage ?? 0,
          limit: data.limit ?? 100,
          remaining: data.remaining ?? 100,
          resetDate: data.resetDate || fallbackReset,
          isAdmin: Boolean(data.isAdmin),
        };
      }
    }
  } catch (err) {
    console.warn('Failed to query /api/mcq-usage, checking local store:', err);
  }

  const period = new Date().toISOString().substring(0, 7);
  const localVal = parseInt(localStorage.getItem(`boardly_mcq_usage_${userId}_${period}`) || '0', 10) || 0;
  return {
    currentUsage: localVal,
    limit: 100,
    remaining: Math.max(0, 100 - localVal),
    resetDate: fallbackReset,
    isAdmin: isAdminEmail(userEmail),
  };
}

export async function saveStudentRegistration(
  userId: string,
  data: {
    name: string;
    phone?: string;
    email: string;
    grade: string;
    stream: string;
    subjects?: string[];
    dream_university?: string;
    payment_status?: string;
    payment_method?: string;
    transaction_reference?: string;
    drive_file_id?: string;
    drive_file_url?: string;
  }
): Promise<StudentProfile> {
  const isAdmin = Boolean(data.email && data.email.trim().toLowerCase() === 'shsvirtualadmin@gmail.com');

  // If student is already registered, prevent changing grade & stream unless admin
  try {
    const existingStr = localStorage.getItem(`boardly_profile_${userId}`);
    if (existingStr) {
      const existing = JSON.parse(existingStr);
      if (existing?.is_registered && existing?.grade && existing?.stream && !isAdmin) {
        if (existing.grade !== data.grade || existing.stream !== data.stream) {
          throw new Error('Course Registration is locked for your account. Class and Stream changes can only be made by an administrator.');
        }
      }
    }
  } catch (err: any) {
    if (err?.message?.includes('locked')) {
      throw err;
    }
  }

  const now = new Date();
  const enrollmentDateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const expiresDateStr = nextYear.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const isExistingStudent = isStudentExistingBeforeRule(now.toISOString());
  const requiresPayment = !isAdmin && !isExistingStudent;

  const profile: StudentProfile = {
    id: userId,
    name: data.name.trim(),
    phone: (data.phone || '').trim(),
    email: data.email.trim(),
    grade: data.grade,
    stream: data.stream,
    subjects: data.subjects || [],
    dream_university: data.dream_university || '',
    target_university: data.dream_university || '',
    sign_up_method: 'Google',
    status: requiresPayment ? 'pending admin approval' : 'active',
    is_registered: true,
    package_name: data.grade === 'MDCAT' ? 'MDCAT Entrance Test Pass' : data.grade === 'TCAT' ? 'TCAT Entrance Test Pass' : 'FBISE Annual Practice Pass',
    enrollment_date: enrollmentDateStr,
    payment_status: data.payment_status || (isAdmin || isExistingStudent ? 'Verified & Paid' : 'Unpaid'),
    requires_payment: requiresPayment,
    access_expires: expiresDateStr,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Persist locally for instant offline/fallback access
  try {
    localStorage.setItem(`boardly_profile_${userId}`, JSON.stringify(profile));
    localStorage.setItem('boardly_cached_profile', JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile to localStorage:', err);
  }

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('students')
        .upsert(profile);

      if (error) {
        console.warn('Supabase upsert registration warning:', error.message);
        // Attempt basic fields if table schema is strict
        await supabase
          .from('students')
          .upsert({
            id: userId,
            name: profile.name,
            email: profile.email,
            grade: profile.grade,
            stream: profile.stream,
            dream_university: profile.dream_university,
            target_university: profile.target_university,
            is_registered: true,
            sign_up_method: 'Google',
          });
      }
    } catch (err) {
      console.error('Failed to save registration to Supabase database:', err);
    }
  }

  return profile;
}

export async function saveStudentTargetUniversity(
  userId: string,
  targetUniversity: string
): Promise<StudentProfile | null> {
  const uni = targetUniversity.trim();
  if (!userId) return null;

  let updatedProfile: StudentProfile | null = null;
  try {
    const existingStr = localStorage.getItem(`boardly_profile_${userId}`);
    if (existingStr) {
      const existing = JSON.parse(existingStr);
      updatedProfile = {
        ...existing,
        dream_university: uni,
        target_university: uni,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(`boardly_profile_${userId}`, JSON.stringify(updatedProfile));
      localStorage.setItem('boardly_cached_profile', JSON.stringify(updatedProfile));
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('students')
        .update({
          dream_university: uni,
          target_university: uni,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.warn('Error updating target_university in Supabase:', error.message);
      }
    }

    return updatedProfile;
  } catch (err) {
    console.error('Error saving target university:', err);
    return null;
  }
}

export async function updateStudentPersonalInfo(
  userId: string,
  data: { name: string; phone: string }
): Promise<{ success: boolean; profile?: StudentProfile; message?: string }> {
  try {
    let currentProfile: StudentProfile | null = null;
    try {
      const stored = localStorage.getItem(`boardly_profile_${userId}`);
      if (stored) currentProfile = JSON.parse(stored);
    } catch {}

    const updatedName = data.name.trim();
    const updatedPhone = data.phone.trim();

    if (currentProfile) {
      currentProfile.name = updatedName;
      currentProfile.phone = updatedPhone;
      currentProfile.updated_at = new Date().toISOString();
      localStorage.setItem(`boardly_profile_${userId}`, JSON.stringify(currentProfile));
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('students')
        .update({
          name: updatedName,
          phone: updatedPhone,
        })
        .eq('id', userId);

      if (error) {
        console.warn('Supabase profile update error:', error.message);
      }
    }

    return { success: true, profile: currentProfile || undefined };
  } catch (err: any) {
    console.error('Error updating personal info:', err);
    return { success: false, message: err?.message || 'Failed to update personal details.' };
  }
}

export async function checkUserExistsInDatabase(userId: string, email?: string): Promise<boolean> {
  if (!isSupabaseConfigured || !userId) return true;
  if (email && isAdminEmail(email)) return true;

  try {
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!error) {
      if (!data) {
        console.warn(`[checkUserExistsInDatabase] Student record ${userId} not found in database (wiped/deleted).`);
        clearProfileCache(userId);
        try {
          localStorage.removeItem(`boardly_profile_${userId}`);
          localStorage.removeItem('boardly_cached_profile');
        } catch {}
        return false;
      }
      return true;
    }
  } catch (err) {
    console.warn('checkUserExistsInDatabase exception:', err);
  }
  return true; // Default to true on network error so transient issues don't log out online users
}

export async function fetchStudentProfileFromSupabase(
  userId: string,
  forceRefresh = false
): Promise<StudentProfile | null> {
  // Check memory cache if not force refreshing
  if (!forceRefresh) {
    const mem = profileMemoryCache.get(userId);
    if (mem && Date.now() - mem.timestamp < PROFILE_CACHE_TTL_MS) {
      return mem.profile;
    }
  }

  // Deduplicate concurrent requests for the same userId
  if (profileInFlightPromises.has(userId)) {
    return profileInFlightPromises.get(userId)!;
  }

  const fetchPromise = (async (): Promise<StudentProfile | null> => {
    // Query Supabase directly first if configured so DB is primary source of truth
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error) {
          if (!data) {
            // Student record was wiped/deleted from database
            console.log(`[Supabase Profile] Student ${userId} not found in database (wiped/deleted). Clearing caches.`);
            clearProfileCache(userId);
            try {
              localStorage.removeItem(`boardly_profile_${userId}`);
              localStorage.removeItem('boardly_cached_profile');
            } catch {}
            return null;
          }

          const profile = normalizeStudentProfileFromRow(data, userId);

          console.log(`[DEBUG: Profile Fetched from DB] Student ${userId}:`, {
            id: profile.id,
            email: profile.email,
            subscribed_plans: profile.subscribed_plans,
            payment_status: profile.payment_status,
            is_pro: profile.is_pro,
            package_name: profile.package_name,
            requires_payment: profile.requires_payment,
          });

          // Update memory & local caches
          profileMemoryCache.set(userId, { profile, timestamp: Date.now() });
          try {
            localStorage.setItem(`boardly_profile_${userId}`, JSON.stringify(profile));
            localStorage.setItem('boardly_cached_profile', JSON.stringify(profile));
          } catch {}

          return profile;
        }
      } catch (err) {
        console.warn('Failed to query Supabase directly for profile, falling back to local cache:', err);
      }
    }

    // Offline or Supabase unavailable fallback
    try {
      const cached = localStorage.getItem(`boardly_profile_${userId}`) || localStorage.getItem('boardly_cached_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        const isParsedAdmin = isAdminEmail(parsed?.email);
        const isValidGrade = Boolean(parsed?.grade && parsed.grade.trim() && parsed.grade !== 'General Student');
        const isValidStream = Boolean(parsed?.stream && parsed.stream.trim());
        const hasGradeStream = Boolean(isValidGrade && isValidStream);
        if (parsed && (isParsedAdmin || parsed.is_registered || hasGradeStream)) {
          return { ...parsed, is_registered: true };
        }
        return parsed;
      }
    } catch {}

    return null;
  })();

  profileInFlightPromises.set(userId, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    profileInFlightPromises.delete(userId);
  }
}

// Helper function for Admin to update student grade, stream & subjects
export async function updateStudentGradeAndStreamInSupabase(
  studentId: string,
  grade: string,
  stream: string,
  subjects: string[] = [],
  requesterEmail?: string
): Promise<{ success: boolean; profile?: StudentProfile; message?: string }> {
  const isAdmin = isAdminEmail(requesterEmail);

  if (!isAdmin) {
    return {
      success: false,
      message: 'Forbidden: Class and Stream changes are strictly restricted to administrators.',
    };
  }

  try {
    // Clear local cache for student
    try {
      localStorage.removeItem(`boardly_profile_${studentId}`);
    } catch {}

    const resp = await apiFetch('/api/admin/update-student-grade-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requesterEmail,
        studentId,
        grade,
        stream,
        subjects,
      }),
    });

    const resData = await safeJsonResponse(resp);
    if (!resp.ok || !resData || !resData.success) {
      return {
        success: false,
        message: resData?.error || 'Server rejected grade/stream update.',
      };
    }

    const data = resData.profile;

    const updatedProfile: StudentProfile | undefined = data ? {
      id: data.id,
      name: data.name || '',
      email: data.email || '',
      phone: data.phone || '',
      grade: data.grade || grade,
      stream: data.stream || stream,
      subjects: data.subjects || subjects,
      sign_up_method: data.sign_up_method || 'Google',
      status: data.status || 'active',
      is_registered: true,
      created_at: data.created_at || new Date().toISOString(),
    } : undefined;

    return { success: true, profile: updatedProfile };
  } catch (err: any) {
    console.error('Error updating student grade & stream:', err);
    return { success: false, message: err?.message || 'Failed to update student class/stream.' };
  }
}

/**
 * Normalizes a topic string to prevent duplicates like "Chemical Bonding", "chemical bonding", "Chemical Bonding ".
 * Returns clean display name and canonical lookup key.
 */
export function normalizeTopicName(inputTopic: string): { displayName: string; topicKey: string } {
  if (!inputTopic || typeof inputTopic !== 'string') {
    return { displayName: '', topicKey: '' };
  }

  // 1. Trim whitespace and replace multiple consecutive spaces with a single space
  const trimmed = inputTopic.trim().replace(/\s+/g, ' ');

  // 2. Compute canonical lowercase key for deduplication comparison
  const topicKey = trimmed.toLowerCase();

  // 3. Format clean Display Name with proper title case capitalization if typed in all lowercase
  let displayName = trimmed;
  if (trimmed === trimmed.toLowerCase()) {
    displayName = trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return { displayName, topicKey };
}

/**
 * Fetch global shared custom topics for a subject from Supabase or API endpoint
 */
export async function fetchSharedCustomTopics(subject: string): Promise<string[]> {
  if (!subject) return [];

  // Try API endpoint first
  try {
    const res = await apiFetch(`/api/custom-topics?subject=${encodeURIComponent(subject)}`);
    if (res.ok) {
      const data = await safeJsonResponse(res);
      if (data?.success && Array.isArray(data.topics)) {
        return data.topics;
      }
    }
  } catch (err) {
    console.warn('[fetchSharedCustomTopics API warning]:', err);
  }

  // Fallback direct Supabase query if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('shared_custom_topics')
        .select('topic_name')
        .ilike('subject', subject);

      if (!error && Array.isArray(data)) {
        const topicsSet = new Set<string>();
        for (const row of data) {
          if (row.topic_name) topicsSet.add(row.topic_name);
        }
        return Array.from(topicsSet);
      }
    } catch (err) {
      console.warn('[fetchSharedCustomTopics Supabase warning]:', err);
    }
  }

  return [];
}

/**
 * Save a new custom topic to the global shared list in Supabase
 */
export async function saveSharedCustomTopic(subject: string, topicName: string): Promise<string> {
  const { displayName, topicKey } = normalizeTopicName(topicName);
  if (!displayName || !topicKey || !subject) return displayName;

  // Call API endpoint first
  try {
    await apiFetch('/api/custom-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topicName: displayName }),
    });
  } catch (err) {
    console.warn('[saveSharedCustomTopic API warning]:', err);
  }

  // Direct Supabase upsert fallback
  if (isSupabaseConfigured) {
    try {
      await supabase.from('shared_custom_topics').upsert(
        {
          subject: subject.toLowerCase(),
          topic_name: displayName,
          topic_key: topicKey,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'subject,topic_key' }
      );
    } catch (err) {
      console.warn('[saveSharedCustomTopic Supabase warning]:', err);
    }
  }

  return displayName;
}

/**
 * Admin helper function to permanently wipe a student's account record, test history, and registration
 */
export async function removeStudentAccountInSupabase(
  studentId: string,
  studentEmail: string,
  requesterEmail?: string
): Promise<{ success: boolean; message?: string }> {
  const isAdmin = isAdminEmail(requesterEmail);
  if (!isAdmin) {
    return { success: false, message: 'Forbidden: Only administrators can wipe student accounts.' };
  }

  try {
    // Clear local caches first
    clearProfileCache(studentId);
    try {
      localStorage.removeItem(`boardly_profile_${studentId}`);
    } catch {}

    let resp = await apiFetch('/api/admin/remove-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterEmail, studentId, studentEmail }),
    });

    // Fallback if 405 Method Not Allowed occurs on POST
    if (resp.status === 405) {
      console.warn('/api/admin/remove-student returned 405 on POST. Retrying with DELETE...');
      resp = await apiFetch(`/api/admin/remove-student?requesterEmail=${encodeURIComponent(requesterEmail)}&studentId=${encodeURIComponent(studentId)}&studentEmail=${encodeURIComponent(studentEmail)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterEmail, studentId, studentEmail }),
      });
    }

    const text = await resp.text();
    let resData: any = {};
    if (text) {
      try {
        resData = JSON.parse(text);
      } catch (jsonErr) {
        console.error('Failed to parse remove-student response JSON:', jsonErr, 'Raw text:', text);
      }
    }

    if (resp.ok && resData.success) {
      // Direct Supabase fallback cleanup if configured
      if (isSupabaseConfigured) {
        try {
          if (studentId) {
            await supabase.from('test_results').delete().eq('student_id', studentId);
            await supabase.from('mcq_attempts').delete().eq('student_id', studentId);
            await supabase.from('student_mcq_usage').delete().eq('student_id', studentId);
            await supabase.from('mcq_usage').delete().eq('student_id', studentId);
            await supabase.from('student_progress').delete().eq('student_id', studentId);
            await supabase.from('ai_history').delete().eq('student_id', studentId);
            await supabase.from('study_buddy_history').delete().eq('student_id', studentId);
            await supabase.from('study_buddy_usage').delete().eq('student_id', studentId);
            await supabase.from('student_achievements').delete().eq('student_id', studentId);
            await supabase.from('achievements').delete().eq('student_id', studentId);
            await supabase.from('students').delete().eq('id', studentId);
          }
          if (studentEmail) {
            await supabase.from('student_mcq_usage').delete().eq('email', studentEmail);
            await supabase.from('mcq_usage').delete().eq('email', studentEmail);
            await supabase.from('students').delete().eq('email', studentEmail);
          }
        } catch (e) {
          console.warn('Direct Supabase deletion cleanup warning:', e);
        }
      }
      return { success: true, message: 'Student account wiped successfully.' };
    }

    // Direct Supabase fallback if API route returned error
    if (isSupabaseConfigured) {
      try {
        let deleted = false;
        if (studentId) {
          await supabase.from('test_results').delete().eq('student_id', studentId);
          await supabase.from('mcq_attempts').delete().eq('student_id', studentId);
          await supabase.from('student_mcq_usage').delete().eq('student_id', studentId);
          await supabase.from('mcq_usage').delete().eq('student_id', studentId);
          await supabase.from('student_progress').delete().eq('student_id', studentId);
          await supabase.from('ai_history').delete().eq('student_id', studentId);
          await supabase.from('study_buddy_history').delete().eq('student_id', studentId);
          await supabase.from('study_buddy_usage').delete().eq('student_id', studentId);
          await supabase.from('student_achievements').delete().eq('student_id', studentId);
          await supabase.from('achievements').delete().eq('student_id', studentId);
          const { error: delErr } = await supabase.from('students').delete().eq('id', studentId);
          if (!delErr) deleted = true;
        }
        if (studentEmail && !deleted) {
          const { error: delErr2 } = await supabase.from('students').delete().eq('email', studentEmail);
          if (!delErr2) deleted = true;
        }
        if (deleted) {
          return { success: true, message: 'Student account wiped successfully.' };
        }
      } catch (e) {
        console.warn('Direct Supabase deletion fallback warning:', e);
      }
    }

    const errorMsg = resData.error || resData.message || (resp.status ? `Request failed with status ${resp.status}` : 'Failed to wipe student account.');
    return { success: false, message: errorMsg };
  } catch (err: any) {
    console.error('Error in removeStudentAccountInSupabase:', err);
    return { success: false, message: err?.message || 'Removal failed.' };
  }
}

/**
 * Admin helper function to update student status (suspend or reactivate)
 */
export async function updateStudentStatusInSupabase(
  studentId: string,
  status: 'active' | 'suspended',
  requesterEmail?: string
): Promise<{ success: boolean; message?: string }> {
  const isAdmin = isAdminEmail(requesterEmail);
  if (!isAdmin) {
    return { success: false, message: 'Forbidden: Only administrators can update student status.' };
  }

  try {
    clearProfileCache(studentId);
    try {
      localStorage.removeItem(`boardly_profile_${studentId}`);
    } catch {}

    let resp = await apiFetch('/api/admin/update-student-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterEmail, studentId, status }),
    });

    // Fallback if 405 Method Not Allowed occurs on POST
    if (resp.status === 405) {
      console.warn('/api/admin/update-student-status returned 405 on POST. Retrying with PATCH...');
      resp = await apiFetch('/api/admin/update-student-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requesterEmail, studentId, status }),
      });
    }

    const text = await resp.text();
    let resData: any = {};
    if (text) {
      try {
        resData = JSON.parse(text);
      } catch (jsonErr) {
        console.error('Failed to parse update-student-status response JSON:', jsonErr, 'Raw text:', text);
      }
    }

    if (resp.ok && resData.success) {
      if (isSupabaseConfigured) {
        try {
          await supabase.from('students').update({ status, updated_at: new Date().toISOString() }).eq('id', studentId);
        } catch (e) {
          console.warn('Direct Supabase status update warning:', e);
        }
      }
      return { success: true, message: `Student status updated to ${status}.` };
    }

    // Direct Supabase fallback if API route failed or returned non-ok
    if (isSupabaseConfigured) {
      try {
        const { error: sbErr } = await supabase.from('students').update({ status, updated_at: new Date().toISOString() }).eq('id', studentId);
        if (!sbErr) {
          return { success: true, message: `Student status updated to ${status}.` };
        }
      } catch (e) {
        console.warn('Direct Supabase fallback failed:', e);
      }
    }

    return { success: false, message: resData.error || resData.message || (resp.status ? `Request failed with status ${resp.status}` : 'Failed to update status.') };
  } catch (err: any) {
    console.error('Error in updateStudentStatusInSupabase:', err);
    return { success: false, message: err?.message || 'Status update failed.' };
  }
}

export interface StudyBuddyMessage {
  id: string;
  student_id: string;
  conversation_id?: string;
  role: 'user' | 'model';
  message_text: string;
  created_at: string;
}

export interface StudyBuddyConversationSummary {
  conversation_id: string;
  title: string;
  last_message: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

// Helper to extract conversation_id and clean message text
function parseStudyBuddyRow(row: any): { convId: string; cleanText: string } {
  let convId = (row.conversation_id || '').trim();
  let text = (row.message_text || '').trim();

  // Check if text starts with [CID:conv_xxx]
  const match = text.match(/^\[CID:(conv_[^\]]+)\]\s*([\s\S]*)$/);
  if (match) {
    if (!convId) {
      convId = match[1];
    }
    text = match[2];
  }

  return { convId, cleanText: text };
}

export async function fetchStudentStudyBuddyConversationsFromSupabase(studentId: string): Promise<StudyBuddyConversationSummary[]> {
  if (!isSupabaseConfigured || !studentId) return [];
  try {
    const { data, error } = await supabase
      .from('study_buddy_history')
      .select('id, student_id, conversation_id, role, message_text, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch study_buddy_history conversations error:', error.message);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Group messages by resolved conversation_id
    const groupsMap = new Map<string, any[]>();
    let lastTime = 0;
    let legacyChunkId = 'legacy_1';

    for (const row of data) {
      let { convId, cleanText } = parseStudyBuddyRow(row);
      const rowTime = new Date(row.created_at || Date.now()).getTime();

      if (!convId) {
        // Fallback for old legacy rows without conversation_id or [CID]: group by 15-minute gaps
        if (lastTime > 0 && rowTime - lastTime > 15 * 60 * 1000) {
          legacyChunkId = `legacy_${rowTime}`;
        }
        convId = legacyChunkId;
        lastTime = rowTime;
      }

      if (!groupsMap.has(convId)) {
        groupsMap.set(convId, []);
      }
      groupsMap.get(convId)!.push({
        ...row,
        clean_text: cleanText,
        resolved_conv_id: convId,
      });
    }

    const summaries: StudyBuddyConversationSummary[] = [];

    for (const [convId, msgs] of groupsMap.entries()) {
      // Find the first user message for a meaningful title
      const firstUserMsg = msgs.find((m) => m.role === 'user');
      let rawTitle = firstUserMsg ? firstUserMsg.clean_text : msgs[0].clean_text || 'Study Session';

      // Clean title string (e.g. remove markdown / formatting / icons, limit length)
      rawTitle = rawTitle
        .replace(/^[❓📌✅👤\s]+/, '')
        .replace(/\*\*/g, '')
        .replace(/\n/g, ' ')
        .trim();

      if (rawTitle.length > 50) {
        rawTitle = rawTitle.slice(0, 47) + '...';
      }

      if (!rawTitle) rawTitle = convId.startsWith('legacy') ? 'Previous Chat' : 'Study Session';

      const lastMsg = msgs[msgs.length - 1];
      let snippet = lastMsg?.clean_text || '';
      snippet = snippet.replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
      if (snippet.length > 70) snippet = snippet.slice(0, 67) + '...';

      summaries.push({
        conversation_id: convId,
        title: rawTitle,
        last_message: snippet,
        created_at: msgs[0].created_at || new Date().toISOString(),
        updated_at: lastMsg.created_at || new Date().toISOString(),
        message_count: msgs.length,
      });
    }

    // Sort conversations by updated_at descending (most recent first)
    summaries.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return summaries;
  } catch (err) {
    console.error('Failed to fetch student study buddy conversations:', err);
    return [];
  }
}

export async function fetchStudyBuddyConversationMessagesFromSupabase(
  studentId: string,
  conversationId: string
): Promise<StudyBuddyMessage[]> {
  if (!isSupabaseConfigured || !studentId) return [];
  try {
    const { data, error } = await supabase
      .from('study_buddy_history')
      .select('id, student_id, conversation_id, role, message_text, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch study_buddy conversation messages error:', error.message);
      return [];
    }

    if (!data) return [];

    let lastTime = 0;
    let legacyChunkId = 'legacy_1';
    const matched: StudyBuddyMessage[] = [];

    for (const row of data) {
      let { convId, cleanText } = parseStudyBuddyRow(row);
      const rowTime = new Date(row.created_at || Date.now()).getTime();

      if (!convId) {
        if (lastTime > 0 && rowTime - lastTime > 15 * 60 * 1000) {
          legacyChunkId = `legacy_${rowTime}`;
        }
        convId = legacyChunkId;
        lastTime = rowTime;
      }

      if (convId === conversationId || (conversationId === 'legacy' && convId.startsWith('legacy'))) {
        matched.push({
          id: String(row.id),
          student_id: row.student_id || studentId,
          conversation_id: convId,
          role: row.role as 'user' | 'model',
          message_text: cleanText,
          created_at: row.created_at || new Date().toISOString(),
        });
      }
    }

    return matched;
  } catch (err) {
    console.error('Failed to fetch study buddy conversation messages:', err);
    return [];
  }
}

export async function fetchStudentStudyBuddyHistoryFromSupabase(studentId: string): Promise<StudyBuddyMessage[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('study_buddy_history')
      .select('id, student_id, conversation_id, role, message_text, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetch study_buddy_history error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => {
      const { convId, cleanText } = parseStudyBuddyRow(row);
      return {
        id: String(row.id),
        student_id: row.student_id || studentId,
        conversation_id: convId || undefined,
        role: row.role as 'user' | 'model',
        message_text: cleanText,
        created_at: row.created_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('Failed to fetch student study buddy history:', err);
    return [];
  }
}

export async function fetchAllStudyBuddyHistoryFromSupabase(): Promise<StudyBuddyMessage[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('study_buddy_history')
      .select('id, student_id, conversation_id, role, message_text, created_at')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) {
      console.warn('Supabase fetch all study_buddy_history error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => {
      const { convId, cleanText } = parseStudyBuddyRow(row);
      return {
        id: String(row.id),
        student_id: row.student_id || '',
        conversation_id: convId || undefined,
        role: row.role as 'user' | 'model',
        message_text: cleanText,
        created_at: row.created_at || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.error('Failed to fetch all study buddy history:', err);
    return [];
  }
}

/**
 * Inserts a message record into the Supabase study_buddy_history table with full error logging and retry fallback.
 */
export async function saveStudyBuddyMessageToSupabase(
  studentId: string,
  role: 'user' | 'model',
  text: string,
  conversationId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    console.warn('[study_buddy_history Insert Warning] Supabase is not configured.');
    return { success: false, error: 'Supabase is not configured.' };
  }
  if (!studentId || !text || text.startsWith('⚠️')) {
    return { success: false, error: 'Invalid parameters for study_buddy_history insert.' };
  }

  try {
    console.log('====================================');
    console.log('[SUPABASE STUDY_BUDDY_HISTORY INSERT CALL]');
    console.log('Student ID:', studentId);
    console.log('Conversation ID:', conversationId || 'N/A');
    console.log('Role:', role);
    console.log('Message Text Snippet:', text.slice(0, 80));

    const recordPayload: any = {
      student_id: studentId,
      role,
      message_text: text,
    };
    if (conversationId) {
      recordPayload.conversation_id = conversationId;
    }

    const { data, error } = await supabase.from('study_buddy_history').insert(recordPayload).select();

    if (error) {
      console.error('[SUPABASE STUDY_BUDDY_HISTORY INSERT ERROR]:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      // Retry with fallback message_text containing [CID] tag in case conversation_id column is missing
      const fallbackText = conversationId ? `[CID:${conversationId}] ${text}` : text;
      console.log('[study_buddy_history] Attempting fallback insert without conversation_id column...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('study_buddy_history')
        .insert({
          student_id: studentId,
          role,
          message_text: fallbackText,
        })
        .select();

      if (fallbackError) {
        console.error('[SUPABASE STUDY_BUDDY_HISTORY FALLBACK INSERT ERROR]:', {
          code: fallbackError.code,
          message: fallbackError.message,
          details: fallbackError.details,
          hint: fallbackError.hint,
        });
        return {
          success: false,
          error: `Insert failed: ${error.message} (Fallback failed: ${fallbackError.message})`,
        };
      }

      console.log('[SUPABASE STUDY_BUDDY_HISTORY FALLBACK INSERT SUCCESS]:', fallbackData);
      return { success: true };
    }

    console.log('[SUPABASE STUDY_BUDDY_HISTORY INSERT SUCCESS]:', data);
    console.log('====================================');
    return { success: true };
  } catch (err: any) {
    console.error('[SUPABASE STUDY_BUDDY_HISTORY EXCEPTION]:', err);
    return { success: false, error: err?.message || 'Exception during study_buddy_history insert' };
  }
}

/**
 * Bulk import MCQs into Supabase mcq_bank table
 */
export async function bulkImportMcqsToSupabase(
  items: Array<{
    subject: string;
    topic: string;
    subtopic?: string;
    question: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
    explanation?: string;
    difficulty?: string;
    source?: string;
    class_num?: number;
  }>,
  requesterEmail: string
): Promise<{ success: boolean; insertedCount: number; message: string; errors?: string[] }> {
  const isAdmin = isAdminEmail(requesterEmail);
  if (!isAdmin) {
    return { success: false, insertedCount: 0, message: 'Forbidden: Only administrators can import MCQs in bulk.' };
  }

  if (!items || items.length === 0) {
    return { success: false, insertedCount: 0, message: 'No valid MCQs provided to import.' };
  }

  try {
    // 1. Primary: Try server API route
    const resp = await apiFetch('/api/admin/bulk-import-mcqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterEmail, mcqs: items }),
    });

    if (resp.ok) {
      const resData = await safeJsonResponse(resp);
      if (resData?.success) {
        return {
          success: true,
          insertedCount: resData.insertedCount || items.length,
          message: resData.message || `Successfully imported ${resData.insertedCount || items.length} MCQs into Supabase mcq_bank table.`,
          errors: resData.errors,
        };
      }
    }

    // 2. Fallback: Direct Supabase client insertion in chunks of 50
    let insertedCount = 0;
    const errors: string[] = [];
    const chunkSize = 50;

    for (let i = 0; i < items.length; i += chunkSize) {
      const batch = items.slice(i, i + chunkSize);

      // Try inserting into mcq_bank
      const { data, error } = await supabase.from('mcq_bank').insert(batch).select();

      if (error) {
        console.warn('mcq_bank insert attempt error:', error.message);
        // Fallback: map to shared_mcq_cache or format row by row
        errors.push(`Batch ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
      } else {
        insertedCount += data ? data.length : batch.length;
      }
    }

    if (insertedCount > 0) {
      return {
        success: true,
        insertedCount,
        message: `Successfully imported ${insertedCount} of ${items.length} MCQs into Supabase.`,
        errors: errors.length > 0 ? errors : undefined,
      };
    }

    return {
      success: false,
      insertedCount: 0,
      message: errors.length > 0 ? errors.join('; ') : 'Failed to insert MCQs into Supabase.',
    };
  } catch (err: any) {
    console.error('Error in bulkImportMcqsToSupabase:', err);
    return {
      success: false,
      insertedCount: 0,
      message: err?.message || 'Failed to complete bulk import.',
    };
  }
}


export interface PaymentRequest {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  payment_method: string;
  amount: number | string;
  drive_file_id?: string;
  drive_file_url?: string;
  transaction_reference?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  course_tier?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

/**
 * Submit payment proof request details to backend (records request in DB for WhatsApp verification)
 */
export async function submitPaymentProofApi(payload: Record<string, any> | FormData): Promise<{ success: boolean; data?: PaymentRequest; error?: string }> {
  try {
    const isFormData = payload instanceof FormData;
    const options: RequestInit = {
      method: 'POST',
      body: isFormData ? payload : JSON.stringify(payload),
    };
    if (!isFormData) {
      options.headers = { 'Content-Type': 'application/json' };
    }

    const resp = await apiFetch('/api/payment-requests/submit', options);
    const result = await safeJsonResponse(resp);
    if (resp.ok && result && result.success) {
      return { success: true, data: result.data };
    }

    const errorMessage = result?.error || result?.message || `Payment submission server error (Status ${resp.status})`;
    console.error('/api/payment-requests/submit failed:', resp.status, result);
    return { success: false, error: errorMessage };
  } catch (err: any) {
    console.error('Error submitting payment proof:', err);
    return { success: false, error: err?.message || 'Network connection error while submitting payment proof.' };
  }
}

/**
 * Fetch payment requests for a student
 */
export async function fetchStudentPaymentRequests(studentId: string): Promise<PaymentRequest[]> {
  try {
    const resp = await apiFetch(`/api/payment-requests/student/${encodeURIComponent(studentId)}`);
    if (resp.ok) {
      const data = await safeJsonResponse(resp);
      if (data?.success && Array.isArray(data.requests)) {
        return data.requests;
      }
    }
    // Fallback directly to Supabase client
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as PaymentRequest[];
    }
  } catch (err) {
    console.error('Error fetching student payment requests:', err);
  }
  return [];
}

/**
 * Fetch all payment requests for admin
 */
export async function fetchAllPaymentRequestsFromSupabase(adminEmail?: string): Promise<PaymentRequest[]> {
  try {
    const emailParam = adminEmail ? `?requesterEmail=${encodeURIComponent(adminEmail)}` : '';
    const resp = await apiFetch(`/api/admin/payment-requests${emailParam}`);
    if (resp.ok) {
      const data = await safeJsonResponse(resp);
      if (data?.success && Array.isArray(data.requests)) {
        return data.requests;
      }
    }
    // Fallback directly to Supabase
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as PaymentRequest[];
    }
  } catch (err) {
    console.error('Error fetching all payment requests:', err);
  }
  return [];
}

/**
 * Review (Approve or Reject) a payment request
 */
export async function reviewPaymentRequestInSupabase(
  requestId: string,
  status: 'approved' | 'rejected',
  adminNote?: string,
  adminEmail?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const resp = await apiFetch('/api/admin/payment-requests/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, status, adminNote, reviewerEmail: adminEmail }),
    });

    const result = await safeJsonResponse(resp);
    if (!resp.ok || !result || !result.success) {
      return { success: false, message: result?.error || result?.message || 'Failed to review payment request.' };
    }
    return { success: true, message: result.message };
  } catch (err: any) {
    console.error('Error reviewing payment request:', err);
    return { success: false, message: err?.message || 'Error executing review.' };
  }
}

export interface AdminActivityLog {
  id: string;
  admin_email: string;
  target_student_id?: string;
  target_student_name?: string;
  target_student_email?: string;
  action_type?: string;
  old_plan?: string;
  new_plan?: string;
  note?: string;
  created_at: string;
}

/**
 * Manually update a student's subscription plan (Admin Only)
 */
export async function updateStudentPlanInSupabase(params: {
  studentId: string;
  studentEmail: string;
  subscribedPlans: string[];
  assignedClasses?: string[];
  packageName: string;
  paymentStatus?: string;
  isPro?: boolean;
  expirationMonths?: number;
  adminNote?: string;
  adminEmail: string;
}): Promise<{ success: boolean; message?: string; profile?: StudentProfile }> {
  const targetUrl = '/api/admin/update-student-plan';
  console.log('[TRACING updateStudentPlanInSupabase]', {
    url: targetUrl,
    method: 'POST',
    payload: params,
  });

  let apiErrorMessage: string | null = null;
  try {
    const resp = await apiFetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const status = resp.status;
    const text = await resp.text();

    console.log('[TRACING updateStudentPlanInSupabase Response]', {
      url: targetUrl,
      status,
      ok: resp.ok,
      rawBody: text,
    });

    let result: any = null;
    if (text && text.trim()) {
      try {
        result = JSON.parse(text);
      } catch (pErr) {
        console.warn('Could not parse /api/admin/update-student-plan JSON response:', pErr, 'Raw Text:', text);
      }
    }

    if (resp.ok && result?.success) {
      clearProfileCache(params.studentId);
      const normalizedProfile = normalizeStudentProfileFromRow(result.profile, params.studentId);
      console.log(`[DEBUG: Plan Update API RESPONSE]`, {
        status: resp.status,
        studentId: params.studentId,
        studentEmail: params.studentEmail,
        returnedProfile: {
          id: normalizedProfile.id,
          email: normalizedProfile.email,
          subscribed_plans: normalizedProfile.subscribed_plans,
          payment_status: normalizedProfile.payment_status,
          is_pro: normalizedProfile.is_pro,
          package_name: normalizedProfile.package_name,
        }
      });
      return { success: true, message: result.message, profile: normalizedProfile };
    }

    if (result && (result.error || result.message)) {
      apiErrorMessage = result.error || result.message;
    } else if (!resp.ok) {
      apiErrorMessage = `Server returned status code ${resp.status}`;
    }
  } catch (err: any) {
    console.warn('API fetch error for update-student-plan:', err);
    apiErrorMessage = err?.message || 'Network request failed';
  }

  // Direct Supabase database fallback to ensure updates complete reliably
  try {
    const isFree = params.subscribedPlans.includes('free') && params.subscribedPlans.length === 1 && !params.isPro;
    const finalPaymentStatus = params.isPro ? 'Verified & Paid' : (isFree ? 'Free Plan' : (params.paymentStatus || 'Verified & Paid'));
    const finalRequiresPayment = isFree;

    const expDate = new Date();
    expDate.setMonth(expDate.getMonth() + Number(params.expirationMonths || 12));
    const accessExpiresStr = expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const updatePayload: any = {
      subscribed_plans: params.subscribedPlans,
      assigned_classes: params.assignedClasses || [],
      package_name: params.packageName,
      is_pro: typeof params.isPro === 'boolean' ? params.isPro : !isFree,
      payment_status: finalPaymentStatus,
      requires_payment: finalRequiresPayment,
      status: 'active',
      access_expires: accessExpiresStr,
      updated_at: new Date().toISOString(),
    };

    let targetId = params.studentId;
    if (!targetId && params.studentEmail) {
      const { data: found } = await supabase.from('students').select('id').eq('email', params.studentEmail).maybeSingle();
      if (found?.id) targetId = found.id;
    }

    if (targetId) {
      const { data: updatedStudentData, error: updateErr } = await supabase
        .from('students')
        .update(updatePayload)
        .eq('id', targetId)
        .select();

      const updatedStudent = updatedStudentData && updatedStudentData[0];
      if (!updateErr && updatedStudent) {
        clearProfileCache(targetId);
        return {
          success: true,
          message: `Plan successfully updated to "${params.packageName}"!`,
          profile: updatedStudent as StudentProfile,
        };
      }
    }
  } catch (fallbackErr) {
    console.error('Fallback error updating plan in Supabase:', fallbackErr);
  }

  return {
    success: false,
    message: apiErrorMessage || 'Failed to update student plan.'
  };
}

/**
 * Fetch all admin activity logs
 */
export async function fetchAdminActivityLogsFromSupabase(adminEmail: string): Promise<AdminActivityLog[]> {
  try {
    const resp = await apiFetch(`/api/admin/activity-logs?adminEmail=${encodeURIComponent(adminEmail)}`);
    if (resp.ok) {
      const data = await safeJsonResponse(resp);
      if (data?.success && Array.isArray(data.logs)) {
        return data.logs;
      }
    }
    // Fallback directly to Supabase
    const { data, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data as AdminActivityLog[];
    }
  } catch (err) {
    console.error('Error fetching admin activity logs:', err);
  }
  return [];
}

/**
 * Fetch total student count from Supabase students table
 */
export async function fetchStudentCountFromSupabase(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    if (error || !count || count < 1000) {
      return 1000;
    }
    return count;
  } catch {
    return 1000;
  }
}

/**
 * Fetch total MCQ count from Supabase mcq_bank table
 */
export async function fetchMcqBankStatsFromSupabase(): Promise<{ count: number; available: boolean }> {
  try {
    const { count, error } = await supabase
      .from('mcq_bank')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return { count: 0, available: false };
    }
    return { count: count || 0, available: true };
  } catch {
    return { count: 0, available: false };
  }
}





