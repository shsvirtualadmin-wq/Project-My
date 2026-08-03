import express from "express";
const app = express();
import path from "path";
import multer from "multer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { getGoogleAccessToken } from "./functions/_utils/googleAuth.js";
import nodemailer from "nodemailer";
import { generateMDCATFullMockBank } from "./src/data/mdcatPrebuiltQuestions.js";
import { generateTCATFullMockBank } from "./src/data/tcatPrebuiltQuestions.js";

dotenv.config();

// Helper to access environment variables flexibly across Node.js (process.env) and Cloudflare Workers/Pages (env parameter or globalThis)
export function getEnvVar(key: string, fallback: string = ""): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  if (typeof globalThis !== "undefined") {
    const gt = globalThis as any;
    if (gt.env && gt.env[key]) return gt.env[key];
    if (gt[key]) return gt[key];
  }
  return fallback;
}

// Supabase server client for tracking MCQ usage
const supabaseUrl = getEnvVar("VITE_SUPABASE_URL", getEnvVar("SUPABASE_URL", "https://wbvzbbnapowwmrjecdyt.supabase.co"));
const supabaseAnonKey = getEnvVar("VITE_SUPABASE_ANON_KEY", getEnvVar("SUPABASE_ANON_KEY", ""));

const supabaseServer = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to create an admin Supabase client using Service Role Key (bypassing RLS for admin actions)
function getSupabaseAdminClient() {
  const url = getEnvVar("VITE_SUPABASE_URL", getEnvVar("SUPABASE_URL", "https://wbvzbbnapowwmrjecdyt.supabase.co"));
  const serviceKey = getEnvVar("SUPABASE_SERVICE_ROLE_KEY", getEnvVar("SUPABASE_SERVICE_KEY", getEnvVar("VITE_SUPABASE_SERVICE_ROLE_KEY", "")));
  const anonKey = getEnvVar("VITE_SUPABASE_ANON_KEY", getEnvVar("SUPABASE_ANON_KEY", ""));

  const keyToUse = serviceKey || anonKey;
  if (!url || !keyToUse) return null;

  return createClient(url, keyToUse, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// In-memory usage store fallback: period (YYYY-MM) -> userId -> count

// Helper to create an authenticated Supabase client using the user's JWT
function getAuthClient(req: express.Request | null) {
  if (!req) return supabaseServer;
  const authHeader = req.headers.authorization;
  if (!authHeader || !supabaseUrl || !supabaseAnonKey) {
    return supabaseServer;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
}

const ADMIN_EMAILS = ["shsvirtualadmin@gmail.com", "shsteachersemail@gmail.com"];
function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized) || normalized.includes("admin");
}

const PAYMENT_RULE_DEPLOYMENT_DATE = '2026-08-01T09:00:00.000Z';
function isStudentExistingBeforeRule(createdAtStr?: string): boolean {
  if (!createdAtStr) return true;
  try {
    return new Date(createdAtStr).getTime() < new Date(PAYMENT_RULE_DEPLOYMENT_DATE).getTime();
  } catch {
    return true;
  }
}

/**
 * Server-side Bearer JWT verification against Supabase Auth.
 * Strictly verifies user identity and admin role server-side.
 */
async function verifyAuthToken(req: express.Request): Promise<{ user: any | null; isAdmin: boolean }> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, isAdmin: false };
  }
  const token = authHeader.substring(7).trim();
  if (!token || !supabaseServer) {
    return { user: null, isAdmin: false };
  }
  try {
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    if (error || !user) {
      return { user: null, isAdmin: false };
    }
    const userEmail = (user.email || "").trim().toLowerCase();
    const isAdmin = isAdminEmail(userEmail);
    return { user, isAdmin };
  } catch (err) {
    return { user: null, isAdmin: false };
  }
}

const inMemoryUsageStore: Record<string, Record<string, number>> = {};

function getCurrentMonthPeriod(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getNextMonthResetDate(): string {
  const d = new Date();
  const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const monthName = nextMonth.toLocaleString('en-US', { month: 'long' });
  return `${monthName} 1st`;
}

async function getStudentMonthlyUsage(userId: string, userEmail: string | undefined, req: express.Request | null): Promise<number> {
  const period = getCurrentMonthPeriod();

  if (getAuthClient(req || null)) {
    try {
      const { data, error } = await supabaseServer
        .from('student_mcq_usage')
        .select('count')
        .eq('student_id', userId)
        .eq('month_period', period)
        .maybeSingle();

      if (!error && data && typeof data.count === 'number') {
        if (!inMemoryUsageStore[period]) {
          inMemoryUsageStore[period] = {};
        }
        inMemoryUsageStore[period][userId] = data.count;
        return data.count;
      }
    } catch (err) {
      console.warn("Supabase query for MCQ usage failed, using in-memory store:", err);
    }
  }

  if (!inMemoryUsageStore[period]) {
    inMemoryUsageStore[period] = {};
  }
  return inMemoryUsageStore[period][userId] || 0;
}

async function incrementStudentMonthlyUsage(userId: string, userEmail: string | undefined, addCount: number, req: express.Request | null = null): Promise<number> {
  const period = getCurrentMonthPeriod();
  const currentCount = await getStudentMonthlyUsage(userId, userEmail, req);
  const newCount = currentCount + addCount;

  if (!inMemoryUsageStore[period]) {
    inMemoryUsageStore[period] = {};
  }
  inMemoryUsageStore[period][userId] = newCount;

  if (getAuthClient(req || null)) {
    try {
      const { data: existing } = await supabaseServer
        .from('student_mcq_usage')
        .select('id, count')
        .eq('student_id', userId)
        .eq('month_period', period)
        .maybeSingle();

      if (existing && existing.id) {
        const { error: updateErr } = await supabaseServer
          .from('student_mcq_usage')
          .update({
            count: newCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateErr) {
          console.warn("[incrementStudentMonthlyUsage update error]:", updateErr);
        }
      } else {
        const { error: insertErr } = await supabaseServer
          .from('student_mcq_usage')
          .insert({
            student_id: userId,
            student_email: userEmail || '',
            month_period: period,
            count: newCount,
            updated_at: new Date().toISOString(),
          });

        if (insertErr) {
          await getAuthClient(req || null)?.from('student_mcq_usage').upsert({
            student_id: userId,
            student_email: userEmail || '',
            month_period: period,
            count: newCount,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'student_id,month_period'
          });
        }
      }
      console.log(`[incrementStudentMonthlyUsage]: Incremented user ${userId} usage from ${currentCount} to ${newCount} for period ${period}`);
    } catch (err) {
      console.warn("Failed to sync MCQ usage to Supabase:", err);
    }
  }

  return newCount;
}

// ========================================================
// SHARED GLOBAL CUSTOM TOPICS & MCQ CACHING ENGINE
// ========================================================

export interface SharedCustomTopic {
  id?: string;
  subject: string;
  topicName: string;
  topicKey: string;
  createdAt?: string;
}

export interface CachedMCQSet {
  id?: string;
  subject: string;
  topic: string;
  topicKey: string;
  classNum: number;
  questions: any[];
  createdAt?: string;
}

// In-memory store fallbacks: subject -> Map<topicKey, Item>
const inMemoryCustomTopics: Record<string, Map<string, SharedCustomTopic>> = {};
const inMemoryMcqCache: Record<string, Map<string, CachedMCQSet>> = {};

export function normalizeTopicNameServer(inputTopic: string): { displayName: string; topicKey: string } {
  if (!inputTopic || typeof inputTopic !== 'string') {
    return { displayName: '', topicKey: '' };
  }

  // 1. Trim whitespace and collapse multiple inner spaces
  const trimmed = inputTopic.trim().replace(/\s+/g, ' ');

  // 2. Compute canonical lowercase key for case-insensitive deduplication
  const topicKey = trimmed.toLowerCase();

  // 3. Format clean Display Name: if all lowercase, convert to Title Case
  let displayName = trimmed;
  if (trimmed === trimmed.toLowerCase()) {
    displayName = trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return { displayName, topicKey };
}

// Fetch shared custom topics for a subject
async function getSharedCustomTopics(subject: string): Promise<string[]> {
  const normSubKey = normalizeSubjectKey(subject || "Physics").toLowerCase();
  const resultsSet = new Set<string>();

  // 1. Read from in-memory store
  if (inMemoryCustomTopics[normSubKey]) {
    for (const item of inMemoryCustomTopics[normSubKey].values()) {
      resultsSet.add(item.topicName);
    }
  }

  // 2. Fetch from Supabase shared_custom_topics table if available
  if (getAuthClient(null)) {
    try {
      const { data, error } = await supabaseServer
        .from('shared_custom_topics')
        .select('topic_name, topic_key')
        .ilike('subject', normSubKey);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          if (row.topic_name) {
            resultsSet.add(row.topic_name);
            if (!inMemoryCustomTopics[normSubKey]) {
              inMemoryCustomTopics[normSubKey] = new Map();
            }
            inMemoryCustomTopics[normSubKey].set(row.topic_key || row.topic_name.toLowerCase(), {
              subject: normSubKey,
              topicName: row.topic_name,
              topicKey: row.topic_key || row.topic_name.toLowerCase(),
            });
          }
        }
      }
    } catch (err: any) {
      console.warn('[getSharedCustomTopics Supabase warning]:', err?.message || err);
    }
  }

  return Array.from(resultsSet);
}

// Save shared custom topic for a subject (deduplicated by topic_key)
async function saveSharedCustomTopic(subject: string, rawTopicName: string): Promise<{ success: boolean; topicName: string }> {
  const { displayName, topicKey } = normalizeTopicNameServer(rawTopicName);
  if (!topicKey) return { success: false, topicName: '' };

  const normSubKey = normalizeSubjectKey(subject || "Physics").toLowerCase();

  if (!inMemoryCustomTopics[normSubKey]) {
    inMemoryCustomTopics[normSubKey] = new Map();
  }

  if (inMemoryCustomTopics[normSubKey].has(topicKey)) {
    const existing = inMemoryCustomTopics[normSubKey].get(topicKey)!;
    return { success: true, topicName: existing.topicName };
  }

  const newTopic: SharedCustomTopic = {
    subject: normSubKey,
    topicName: displayName,
    topicKey,
    createdAt: new Date().toISOString(),
  };

  inMemoryCustomTopics[normSubKey].set(topicKey, newTopic);

  if (getAuthClient(null)) {
    try {
      await getAuthClient(null)?.from('shared_custom_topics').upsert({
        subject: normSubKey,
        topic_name: displayName,
        topic_key: topicKey,
        created_at: newTopic.createdAt,
      }, {
        onConflict: 'subject,topic_key'
      });
      console.log(`[saveSharedCustomTopic success]: Saved shared topic "${displayName}" (${topicKey}) for subject "${normSubKey}"`);
    } catch (err: any) {
      console.warn('[saveSharedCustomTopic Supabase exception]:', err?.message || err);
    }
  }

  return { success: true, topicName: displayName };
}

// Check cached MCQs for subject + topic
async function getCachedMcqs(subject: string, rawTopicName: string, classNum: number = 11): Promise<any[] | null> {
  const { topicKey } = normalizeTopicNameServer(rawTopicName);
  if (!topicKey || topicKey === 'all topics') return null;

  const normSubKey = normalizeSubjectKey(subject || "Physics").toLowerCase();

  const isInvalidPlaceholderSet = (qs: any[]): boolean => {
    if (!Array.isArray(qs) || qs.length === 0) return true;
    return qs.some(q => 
      !q || 
      typeof q.q !== 'string' ||
      q.q.includes('Practice Question') ||
      q.q.includes('Select the correct core principle regarding')
    );
  };

  // 1. Check in-memory store first
  if (inMemoryMcqCache[normSubKey] && inMemoryMcqCache[normSubKey].has(topicKey)) {
    const cached = inMemoryMcqCache[normSubKey].get(topicKey)!;
    if (Array.isArray(cached.questions) && cached.questions.length > 0) {
      if (isInvalidPlaceholderSet(cached.questions)) {
        console.warn(`[MCQ Cache Purge]: In-memory cache for "${normSubKey}" - "${rawTopicName}" contained placeholder questions. Purging.`);
        inMemoryMcqCache[normSubKey].delete(topicKey);
      } else {
        console.log(`[MCQ Cache Hit (In-Memory)]: Found ${cached.questions.length} questions for "${normSubKey}" - "${rawTopicName}"`);
        return cached.questions;
      }
    }
  }

  // 2. Query Supabase shared_mcq_cache table
  if (getAuthClient(null)) {
    try {
      const { data, error } = await supabaseServer
        .from('shared_mcq_cache')
        .select('questions, topic')
        .ilike('subject', normSubKey)
        .eq('topic_key', topicKey)
        .maybeSingle();

      if (!error && data && Array.isArray(data.questions) && data.questions.length > 0) {
        if (isInvalidPlaceholderSet(data.questions)) {
          console.warn(`[MCQ Cache Purge]: Supabase cache for "${normSubKey}" - "${rawTopicName}" contained placeholder questions. Ignoring.`);
        } else {
          console.log(`[MCQ Cache Hit (Supabase)]: Found ${data.questions.length} questions for "${normSubKey}" - "${rawTopicName}"`);
          
          if (!inMemoryMcqCache[normSubKey]) {
            inMemoryMcqCache[normSubKey] = new Map();
          }
          inMemoryMcqCache[normSubKey].set(topicKey, {
            subject: normSubKey,
            topic: data.topic || rawTopicName,
            topicKey,
            classNum,
            questions: data.questions,
          });

          return data.questions;
        }
      }
    } catch (err: any) {
      console.warn('[getCachedMcqs Supabase warning]:', err?.message || err);
    }
  }

  return null;
}

// Save generated MCQs to cache in Supabase & in-memory
async function saveMcqsToCache(subject: string, rawTopicName: string, questions: any[], classNum: number = 11): Promise<boolean> {
  const { displayName, topicKey } = normalizeTopicNameServer(rawTopicName);
  if (!topicKey || !Array.isArray(questions) || questions.length === 0) return false;

  const isPlaceholderSet = questions.some(q => 
    !q || typeof q.q !== 'string' ||
    q.q.includes('Practice Question') ||
    q.q.includes('Select the correct core principle regarding')
  );

  if (isPlaceholderSet) {
    console.log(`[saveMcqsToCache Ignored]: Refusing to cache static/placeholder fallback questions for "${subject}" - "${displayName}".`);
    return false;
  }

  const normSubKey = normalizeSubjectKey(subject || "Physics").toLowerCase();

  if (!inMemoryMcqCache[normSubKey]) {
    inMemoryMcqCache[normSubKey] = new Map();
  }

  inMemoryMcqCache[normSubKey].set(topicKey, {
    subject: normSubKey,
    topic: displayName,
    topicKey,
    classNum,
    questions,
    createdAt: new Date().toISOString(),
  });

  if (getAuthClient(null)) {
    try {
      await getAuthClient(null)?.from('shared_mcq_cache').upsert({
        subject: normSubKey,
        topic: displayName,
        topic_key: topicKey,
        class_num: classNum,
        questions,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'subject,topic_key'
      });
      console.log(`[saveMcqsToCache success]: Cached ${questions.length} questions for "${normSubKey}" - "${displayName}" (${topicKey})`);
    } catch (err: any) {
      console.warn('[saveMcqsToCache Supabase exception]:', err?.message || err);
    }
  }

  return true;
}

// ========================================================
// ADAPTIVE LEARNING & MCQ ATTEMPT TRACKING ENGINE
// ========================================================

export interface MCQAttemptItem {
  id?: string;
  studentId: string;
  studentEmail?: string;
  subject: string;
  chapter: string;
  questionId?: string;
  questionText?: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeTakenSeconds: number;
  createdAt?: string;
}

const inMemoryMCQAttempts: MCQAttemptItem[] = [];

export interface SavedTestResultItem {
  id: string;
  student_id: string;
  student_email?: string;
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
}

const inMemoryTestResults: SavedTestResultItem[] = [];

async function logStudentMcqAttempts(
  studentId: string,
  studentEmail: string | undefined,
  subject: string,
  attempts: any[]
): Promise<{ success: boolean; count: number }> {
  if (!studentId || !Array.isArray(attempts) || attempts.length === 0) {
    return { success: false, count: 0 };
  }

  const nowIso = new Date().toISOString();
  const canonSubject = normalizeSubjectKey(subject || attempts[0]?.subject || "Mathematics");

  const formattedAttempts: MCQAttemptItem[] = attempts.map((a: any, idx: number) => ({
    id: `att-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    studentEmail: studentEmail || "",
    subject: canonSubject,
    chapter: a.chapter || a.topic || "General Concepts",
    questionId: String(a.questionId || a.id || `q-${idx}`),
    questionText: a.questionText || a.q || "",
    selectedAnswer: Number(a.selectedAnswer ?? -1),
    correctAnswer: Number(a.correctAnswer ?? a.correct ?? 0),
    isCorrect: Boolean(a.isCorrect),
    timeTakenSeconds: Math.max(1, Number(a.timeTakenSeconds || a.timeSpentSeconds) || 15),
    createdAt: nowIso,
  }));

  // 1. Add to in-memory store
  inMemoryMCQAttempts.push(...formattedAttempts);

  // 2. Persist to Supabase mcq_attempts table if available
  if (getAuthClient(null)) {
    try {
      const rowsToInsert = formattedAttempts.map((item) => ({
        student_id: item.studentId,
        student_email: item.studentEmail,
        subject: item.subject,
        chapter: item.chapter,
        question_id: item.questionId,
        question_text: item.questionText,
        selected_answer: item.selectedAnswer,
        correct_answer: item.correctAnswer,
        is_correct: item.isCorrect,
        time_taken_seconds: item.timeTakenSeconds,
        created_at: item.createdAt,
      }));

      const { error } = await getAuthClient(null)?.from("mcq_attempts").insert(rowsToInsert);
      if (error) {
        console.warn("[Supabase mcq_attempts log warning]:", error.message);
      } else {
        console.log(`[Supabase mcq_attempts log success]: Inserted ${rowsToInsert.length} attempts for student ${studentId}`);
      }
    } catch (err: any) {
      console.warn("[Supabase mcq_attempts insert exception]:", err?.message || err);
    }
  }

  return { success: true, count: formattedAttempts.length };
}

export interface StudentWeaknessProfile {
  studentId: string;
  studentEmail?: string;
  subject: string;
  totalAttempts: number;
  correctAttempts: number;
  overallAccuracy: number;
  avgTimePerQuestionSeconds: number;
  trend: "improving" | "declining" | "stable" | "insufficient_data";
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

async function getStudentWeaknessProfile(
  studentId: string,
  subject?: string
): Promise<StudentWeaknessProfile> {
  const normSub = subject ? normalizeSubjectKey(subject) : undefined;
  let allAttempts: MCQAttemptItem[] = [];

  // 1. Get in-memory attempts
  const memFiltered = inMemoryMCQAttempts.filter((a) => {
    const matchesUser = a.studentId === studentId;
    const matchesSub = normSub ? a.subject.toLowerCase() === normSub.toLowerCase() : true;
    return matchesUser && matchesSub;
  });
  allAttempts.push(...memFiltered);

  // 2. Query Supabase attempts
  if (supabaseServer && studentId) {
    try {
      let query = supabaseServer
        .from("mcq_attempts")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: true });

      if (normSub) {
        query = query.eq("subject", normSub);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        const dbAttempts: MCQAttemptItem[] = data.map((row: any) => ({
          id: String(row.id),
          studentId: row.student_id,
          studentEmail: row.student_email,
          subject: row.subject,
          chapter: row.chapter,
          questionId: row.question_id,
          questionText: row.question_text,
          selectedAnswer: row.selected_answer,
          correctAnswer: row.correct_answer,
          isCorrect: Boolean(row.is_correct),
          timeTakenSeconds: row.time_taken_seconds || 15,
          createdAt: row.created_at,
        }));

        // Deduplicate with in-memory by id
        const existingIds = new Set(allAttempts.map((a) => a.id));
        for (const dba of dbAttempts) {
          if (!existingIds.has(dba.id)) {
            allAttempts.push(dba);
          }
        }
      }
    } catch (err: any) {
      console.warn("[getStudentWeaknessProfile Supabase fetch warning]:", err?.message || err);
    }
  }

  const targetSub = normSub || (allAttempts[0]?.subject || "Mathematics");

  if (allAttempts.length === 0) {
    return {
      studentId,
      subject: targetSub,
      totalAttempts: 0,
      correctAttempts: 0,
      overallAccuracy: 0,
      avgTimePerQuestionSeconds: 0,
      trend: "insufficient_data",
      weakestTopics: [],
      strongestTopics: [],
      chapterBreakdown: [],
      promptContext: "",
    };
  }

  const totalAttempts = allAttempts.length;
  const correctAttempts = allAttempts.filter((a) => a.isCorrect).length;
  const overallAccuracy = Math.round((correctAttempts / totalAttempts) * 100);
  const totalTime = allAttempts.reduce((sum, a) => sum + (a.timeTakenSeconds || 15), 0);
  const avgTimePerQuestionSeconds = Math.round(totalTime / totalAttempts);

  // Aggregate by chapter
  const chapterMap: Record<string, { total: number; correct: number; totalTime: number }> = {};
  for (const item of allAttempts) {
    const ch = item.chapter || "General Concepts";
    if (!chapterMap[ch]) {
      chapterMap[ch] = { total: 0, correct: 0, totalTime: 0 };
    }
    chapterMap[ch].total += 1;
    if (item.isCorrect) chapterMap[ch].correct += 1;
    chapterMap[ch].totalTime += item.timeTakenSeconds || 15;
  }

  const chapterStats = Object.keys(chapterMap).map((ch) => {
    const c = chapterMap[ch];
    const acc = Math.round((c.correct / c.total) * 100);
    const avgT = Math.round(c.totalTime / c.total);
    return {
      chapter: ch,
      total: c.total,
      correct: c.correct,
      accuracy: acc,
      avgTime: avgT,
    };
  });

  // Sort by accuracy ascending for weakest
  chapterStats.sort((a, b) => a.accuracy - b.accuracy);
  const weakestTopics = chapterStats.filter((c) => c.accuracy < 60 || chapterStats.length <= 3).slice(0, 3);

  // Sort by accuracy descending for strongest
  const sortedDesc = [...chapterStats].sort((a, b) => b.accuracy - a.accuracy);
  const strongestTopics = sortedDesc.filter((c) => c.accuracy >= 65 || chapterStats.length <= 3).slice(0, 3);

  // Calculate trend: compare recent 5 attempts vs earlier attempts
  let trend: "improving" | "declining" | "stable" | "insufficient_data" = "stable";
  if (totalAttempts >= 6) {
    const recent5 = allAttempts.slice(-5);
    const earlier = allAttempts.slice(0, -5);
    const recentAcc = Math.round((recent5.filter((a) => a.isCorrect).length / 5) * 100);
    const earlierAcc = Math.round((earlier.filter((a) => a.isCorrect).length / earlier.length) * 100);

    if (recentAcc >= earlierAcc + 10) trend = "improving";
    else if (recentAcc <= earlierAcc - 10) trend = "declining";
    else trend = "stable";
  }

  const weakTopicNames = weakestTopics.map((w) => `${w.chapter} (${w.accuracy}% accuracy, avg ${w.avgTime}s/q)`).join(", ");
  const strongTopicNames = strongestTopics.map((s) => `${s.chapter} (${s.accuracy}% accuracy)`).join(", ");

  const promptContext = `=== ADAPTIVE LEARNING & WEAKNESS PROFILE CONTEXT ===
- Student ID: ${studentId}
- Subject: ${targetSub} (${overallAccuracy}% overall accuracy across ${totalAttempts} attempts, avg ${avgTimePerQuestionSeconds}s/question)
- Performance Trend: ${trend.toUpperCase()}
- WEAKEST TOPICS (REMEDIATION TARGETS): ${weakTopicNames || "None flagged"}
- STRONGEST TOPICS (CONFIDENCE BUILDERS): ${strongTopicNames || "General"}
- MANDATORY INSTRUCTION FOR GEMINI: This is a personalized practice test. Focus approximately 60-70% of the generated questions specifically on reinforcing the student's weakest topics (${weakestTopics.map((w) => w.chapter).join(", ")}), testing core definitions, direct calculations, key formulas, and common calculation error distractors. Include 2-3 questions (~20-30%) from their stronger topics (${strongestTopics.map((s) => s.chapter).join(", ")}) to build confidence.`;

  return {
    studentId,
    subject: targetSub,
    totalAttempts,
    correctAttempts,
    overallAccuracy,
    avgTimePerQuestionSeconds,
    trend,
    weakestTopics,
    strongestTopics,
    chapterBreakdown: chapterStats,
    promptContext,
  };
}

export function extractCleanErrorMessage(err: any): string {
  if (!err) return "Unknown error";
  let msg = typeof err === "string" ? err : err.message || String(err);
  for (let i = 0; i < 4; i++) {
    if (typeof msg === "string" && (msg.trim().startsWith("{") || msg.trim().startsWith("["))) {
      try {
        const parsed = JSON.parse(msg.trim());
        if (parsed.error) {
          if (typeof parsed.error === "string") {
            msg = parsed.error;
          } else if (parsed.error.message) {
            msg = parsed.error.message;
          } else {
            break;
          }
        } else if (parsed.message) {
          msg = parsed.message;
        } else {
          break;
        }
      } catch {
        break;
      }
    } else {
      break;
    }
  }
  return typeof msg === "string" ? msg.trim() : JSON.stringify(msg);
}

export function getGeminiApiKey(customEnv?: Record<string, any>): string {
  const candidates = [
    customEnv?.GEMINI_API_KEY,
    customEnv?.GEMINI_API_KEY_2,
    customEnv?.VITE_GEMINI_API_KEY,
    customEnv?.GOOGLE_API_KEY,
    getEnvVar("GEMINI_API_KEY"),
    getEnvVar("GEMINI_API_KEY_2"),
    getEnvVar("VITE_GEMINI_API_KEY"),
    getEnvVar("GOOGLE_API_KEY"),
    getEnvVar("API_KEY"),
    getEnvVar("GEMINI_KEY"),
  ]
    .filter((k): k is string => Boolean(k && typeof k === "string" && k.trim().length > 0 && k !== "MY_GEMINI_API_KEY"))
    .map((k) => k.replace(/^["']|["']$/g, "").trim());

  const structuredKey = candidates.find((k) => k.startsWith("AIza") || k.startsWith("AQ."));
  return (structuredKey || candidates[0] || "").trim();
}

export function getGeminiKeyDetails(): { found: boolean; keySource: string; keyLength: number } {
  const sources = [
    { name: "GEMINI_API_KEY", val: getEnvVar("GEMINI_API_KEY") },
    { name: "GEMINI_API_KEY_2", val: getEnvVar("GEMINI_API_KEY_2") },
    { name: "VITE_GEMINI_API_KEY", val: getEnvVar("VITE_GEMINI_API_KEY") },
    { name: "GOOGLE_API_KEY", val: getEnvVar("GOOGLE_API_KEY") },
    { name: "API_KEY", val: getEnvVar("API_KEY") },
  ];

  for (const s of sources) {
    if (s.val && s.val.trim().length > 0 && s.val !== "MY_GEMINI_API_KEY") {
      const cleanVal = s.val.replace(/^["']|["']$/g, "").trim();
      if (cleanVal.length > 0) {
        return { found: true, keySource: s.name, keyLength: cleanVal.length };
      }
    }
  }

  const fallback = getGeminiApiKey();
  if (fallback) {
    return { found: true, keySource: "candidates_fallback", keyLength: fallback.length };
  }
  return { found: false, keySource: "NONE (Checked GEMINI_API_KEY, GEMINI_API_KEY_2, VITE_GEMINI_API_KEY, GOOGLE_API_KEY)", keyLength: 0 };
}

export async function withGeminiNativeAuth<T>(apiKey: string, fn: () => Promise<T>): Promise<T> {
  const originalFetch = globalThis.fetch;
  const geminiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const urlStr = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
    let targetUrl = urlStr;

    if (urlStr.includes("generativelanguage.googleapis.com")) {
      if (apiKey && !targetUrl.includes("key=")) {
        const sep = targetUrl.includes("?") ? "&" : "?";
        targetUrl = `${targetUrl}${sep}key=${encodeURIComponent(apiKey)}`;
      }
    }

    const newInit: RequestInit = { ...init };
    const headers = new Headers(
      newInit.headers || (typeof input === "object" && input && "headers" in input ? (input as Request).headers : {})
    );

    // CRITICAL: Strip any Authorization header to prevent 401 ACCESS_TOKEN_TYPE_UNSUPPORTED
    headers.delete("Authorization");
    headers.delete("authorization");

    if (apiKey) {
      headers.set("x-goog-api-key", apiKey);
    }

    newInit.headers = headers;

    if (typeof input === "object" && input && !(input instanceof URL) && "url" in input) {
      return originalFetch(new Request(targetUrl, newInit));
    }
    return originalFetch(targetUrl, newInit);
  };

  try {
    globalThis.fetch = geminiFetch as typeof fetch;
    return await fn();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.warn("[Gemini Config] No valid Gemini API key found in process.env or globalThis. (Checked GEMINI_API_KEY, GEMINI_API_KEY_2, VITE_GEMINI_API_KEY, GOOGLE_API_KEY)");
    return null;
  }
  try {
    const keyPreview = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "set";
    console.log(`[Gemini Config] Initializing GoogleGenAI client with key: ${keyPreview} (length: ${apiKey.length})`);
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "x-goog-api-key": apiKey,
          "User-Agent": "aistudio-build",
        },
      },
    });
  } catch (err: any) {
    console.error("[Gemini Config Error] Failed to instantiate GoogleGenAI client:", err?.message || err);
    return null;
  }
}

export interface MCQQuestion {
  id: string;
  q: string;
  options: string[];
  correct: number;
  topic: string;
  explain: string;
  difficulty: string;
}

// Helper to map any subject variant/string to a canonical key strictly
function normalizeSubjectKey(subject: string): string {
  if (!subject) return "Physics";
  const clean = subject.trim();
  const lower = clean.toLowerCase();

  if (lower.includes("physic")) return "Physics";
  if (lower.includes("chem")) return "Chemistry";
  if (lower.includes("bio") || lower.includes("botany") || lower.includes("zoology")) return "Biology";
  if (lower.includes("math")) return "Mathematics";
  if (lower.includes("computer") || lower === "cs" || lower.includes("it")) return "Computer Science";
  if (lower.includes("english") || lower.includes("verbal")) return "English";
  if (lower.includes("urdu")) return "Urdu";
  if (lower.includes("islam") || lower.includes("din")) return "Islamiat";
  if (lower.includes("pak") || lower.includes("pakistan")) return "Pakistan Studies";

  return clean;
}

// Cross-check and validation step for generated MCQs with strict duplicate prevention
function validateAndFixQuestions(
  rawQuestions: any[],
  subject: string,
  topicLabel: string,
  difficulty: string
): MCQQuestion[] {
  if (!Array.isArray(rawQuestions)) return [];

  const validated: MCQQuestion[] = [];
  const canonSubject = normalizeSubjectKey(subject);

  // Sets to track seen stems and option signatures within this test batch
  const seenStems = new Set<string>();
  const seenOptionSigs = new Set<string>();

  const QUESTION_PLACEHOLDER_REGEX = /\b(lorem ipsum|placeholder|insert question|sample question|example question|type question|test question|n\/a|tbd|todo)\b/i;
  const OPTION_PLACEHOLDER_REGEX = /^(option\s*[a-d1-4]|choice\s*[a-d1-4]|placeholder|sample\s*option|lorem\s*ipsum|tbd|todo)$/i;

  for (let i = 0; i < rawQuestions.length; i++) {
    const item = rawQuestions[i];
    if (!item || typeof item !== "object") continue;

    // 1. Question stem validation
    let qText = typeof item.q === "string" ? item.q.trim() : "";
    if (!qText && typeof item.question === "string") qText = item.question.trim();
    if (!qText || qText.length < 8) continue;

    // Clean leading question numbers (e.g. "1. What is...", "Q2: ...")
    qText = qText.replace(/^(Q\d+[:\.]?|\d+[\.\)])\s*/i, "");

    // Check for placeholder text in question stem
    if (QUESTION_PLACEHOLDER_REGEX.test(qText)) continue;

    // Stem uniqueness check (ignore punctuation & casing)
    const normStem = qText.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, "");
    if (seenStems.has(normStem)) {
      console.warn(`[MCQ Validation] Duplicate question stem rejected: "${qText}"`);
      continue;
    }

    // 1b. Anti-mismatch check: discard physics/math formulas when subject is Urdu/English/PakStudies/Islamiat
    const lowerQ = qText.toLowerCase();
    const isUrduOrIslamiat = canonSubject === "Urdu" || canonSubject === "Islamiat";
    const hasUrduScript = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(qText);

    if (isUrduOrIslamiat) {
      if (!hasUrduScript) {
        console.warn(`[MCQ Validation] Rejected non-Urdu question stem for ${subject}: "${qText}"`);
        continue;
      }
      if (
        lowerQ.includes("vector quantity") ||
        lowerQ.includes("classical mechanics") ||
        lowerQ.includes("newton") ||
        lowerQ.includes("harmonic motion") ||
        lowerQ.includes("magnetic flux") ||
        lowerQ.includes("capacitance") ||
        lowerQ.includes("derivative") ||
        lowerQ.includes("mitochondria") ||
        lowerQ.includes("physics") ||
        lowerQ.includes("chemistry") ||
        lowerQ.includes("torque") ||
        lowerQ.includes("velocity") ||
        lowerQ.includes("acceleration")
      ) {
        console.warn(`[MCQ Validation] Rejected science/physics question for ${subject}: "${qText}"`);
        continue;
      }
    } else if (["English", "Pakistan Studies"].includes(canonSubject)) {
      if (
        lowerQ.includes("vector quantity") ||
        lowerQ.includes("classical mechanics") ||
        lowerQ.includes("newton's") ||
        lowerQ.includes("harmonic motion") ||
        lowerQ.includes("magnetic flux") ||
        lowerQ.includes("capacitance") ||
        lowerQ.includes("derivative of") ||
        lowerQ.includes("mitochondria")
      ) {
        console.warn(`[MCQ Validation] Rejected cross-subject mismatched question for ${subject}: "${qText}"`);
        continue;
      }
    }

    // 2. Options array validation
    let rawOptions = item.options;
    if (!Array.isArray(rawOptions) || rawOptions.length < 4) continue;

    const cleanedOptions = rawOptions.slice(0, 4).map((opt: any) => {
      let str = typeof opt === "string" ? opt.trim() : String(opt || "").trim();
      // Remove leading choice labels like "A) ", "a. ", "1. ", "(A) ", etc.
      return str.replace(/^(\([A-Da-d1-4]\)|[A-Da-d1-4][\.\)]|\d+[\.\)])\s*/, "");
    });

    // Check that all 4 options are non-empty
    if (cleanedOptions.length !== 4) continue;
    if (cleanedOptions.some((opt) => !opt || opt.trim().length === 0)) continue;

    const OPTION_PLACEHOLDER_REGEX = /^(option\s*[a-d1-4]|choice\s*[a-d1-4]|placeholder|sample\s*option|lorem\s*ipsum|tbd|todo)$/i;
    if (cleanedOptions.some((opt) => OPTION_PLACEHOLDER_REGEX.test(opt.trim()))) {
      console.warn(`[MCQ Validation] Rejected question with placeholder option text: "${qText}"`);
      continue;
    }

    // Ensure options are 100% distinct (exactly 4 unique options in this question)
    const uniqueOpts = new Set(cleanedOptions.map((o) => o.toLowerCase()));
    if (uniqueOpts.size < 4) {
      console.warn(`[MCQ Validation] Rejected question with non-unique option choices: "${qText}"`);
      continue;
    }

    // Check option set uniqueness across the test batch
    const optionSig = Array.from(uniqueOpts).sort().join("|");
    if (seenOptionSigs.has(optionSig)) {
      console.warn(`[MCQ Validation] Rejected question with duplicate option set: "${qText}"`);
      continue;
    }

    // 3. Correct answer index validation & robust alignment
    let correctIdx = -1;

    // Check if item.correct directly matches the text of an option
    if (item.correct !== undefined && item.correct !== null) {
      const itemCorrectStr = String(item.correct).trim().toLowerCase();
      const directMatchIdx = cleanedOptions.findIndex((opt) => opt.toLowerCase() === itemCorrectStr);
      if (directMatchIdx !== -1) {
        correctIdx = directMatchIdx;
      }
    }

    // Check letter representation
    if (correctIdx === -1 && typeof item.correct === "string") {
      const char = item.correct.trim().toUpperCase();
      if (char === "A" || char === "OPTION A" || char === "CHOICE A" || char === "0") correctIdx = 0;
      else if (char === "B" || char === "OPTION B" || char === "CHOICE B" || char === "1") correctIdx = 1;
      else if (char === "C" || char === "OPTION C" || char === "CHOICE C" || char === "2") correctIdx = 2;
      else if (char === "D" || char === "OPTION D" || char === "CHOICE D" || char === "3") correctIdx = 3;
    }

    // Check numeric representation
    if (correctIdx === -1) {
      const num = typeof item.correct === "number" ? item.correct : parseInt(String(item.correct), 10);
      if (!isNaN(num)) {
        if (num === 4) {
          correctIdx = 3; // 1-based index 4 = Option D
        } else if (num >= 0 && num <= 3) {
          correctIdx = num;
        }
      }
    }

    // 4. Explanation & Index Alignment Cross-check
    let explainText = typeof item.explain === "string" ? item.explain.trim() : "";
    if (!explainText && typeof item.explanation === "string") explainText = item.explanation.trim();

    if (explainText) {
      const expUpper = explainText.toUpperCase();
      const letterMatches: number[] = [];
      if (/\b(OPTION\s*A|CHOICE\s*A|\(A\))\b/.test(expUpper)) letterMatches.push(0);
      if (/\b(OPTION\s*B|CHOICE\s*B|\(B\))\b/.test(expUpper)) letterMatches.push(1);
      if (/\b(OPTION\s*C|CHOICE\s*C|\(C\))\b/.test(expUpper)) letterMatches.push(2);
      if (/\b(OPTION\s*D|CHOICE\s*D|\(D\))\b/.test(expUpper)) letterMatches.push(3);

      if (letterMatches.length === 1) {
        correctIdx = letterMatches[0];
      }
    }

    // 5. Strict Bounds Validation: correct index MUST be within bounds of options array [0..3]
    if (correctIdx < 0 || correctIdx >= cleanedOptions.length) {
      console.warn(`[MCQ Validation] Rejected question with unresolvable or out-of-bounds correct index (${item.correct}): "${qText}"`);
      continue;
    }

    if (!explainText) {
      explainText = `Option ${String.fromCharCode(65 + correctIdx)} (${cleanedOptions[correctIdx]}) is the correct answer according to standard textbook principles.`;
    }

    // Add to seen trackers
    seenStems.add(normStem);
    seenOptionSigs.add(optionSig);

    validated.push({
      id: `ai-q-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      q: qText,
      options: cleanedOptions,
      correct: correctIdx,
      topic: item.topic || topicLabel || subject,
      explain: explainText,
      difficulty: item.difficulty || difficulty,
    });
  }

  return validated;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Syllabus Question Generator from static question templates (NO PLACEHOLDERS)
  function generateSyllabusQuestions(
    subject: string,
    customTopic: string | undefined,
    questionCount: number,
    difficulty: string
  ): MCQQuestion[] {
    const topicLabel = customTopic || `${subject} Core Curriculum`;
    const questions: MCQQuestion[] = [];

    const bioPool = [
      {
        q: "Which structural component of the fluid mosaic plasma membrane is primarily responsible for maintaining membrane fluidity at lower temperatures?",
        options: ["Cholesterol molecules", "Glycoproteins", "Integral protein channels", "Phospholipid phosphate heads"],
        correct: 0,
        explain: "Cholesterol acts as a temperature buffer in animal cell membranes. At lower temperatures, it prevents phospholipids from packing tightly together, maintaining membrane fluidity."
      },
      {
        q: "In competitive enzyme inhibition, how are the Vmax (maximum reaction velocity) and Km (Michaelis constant) affected?",
        options: ["Vmax remains unchanged, Km increases", "Vmax decreases, Km remains unchanged", "Both Vmax and Km decrease", "Vmax increases, Km decreases"],
        correct: 0,
        explain: "In competitive inhibition, the inhibitor competes with substrate for the active site. Increasing substrate concentration overcomes inhibition, keeping Vmax constant, but requiring a higher substrate concentration to reach half-Vmax (hence Km increases)."
      },
      {
        q: "During non-cyclic photophosphorylation in light reactions of photosynthesis, what is the ultimate electron donor and terminal electron acceptor?",
        options: ["Water is the ultimate donor; NADP+ is the terminal acceptor", "ATP is the ultimate donor; NADPH is the terminal acceptor", "Photosystem I is donor; Photosystem II is acceptor", "Carbon dioxide is donor; Glucose is acceptor"],
        correct: 0,
        explain: "Water undergoes photolysis at Photosystem II to release electrons, which pass through electron transport chains to reduce NADP+ into NADPH."
      },
      {
        q: "Which phase of human cardiac cycle involves closure of the semilunar valves, producing the second heart sound ('dub')?",
        options: ["Ventricular Isovolumetric Relaxation", "Ventricular Systole", "Atrial Systole", "Isovolumetric Contraction"],
        correct: 0,
        explain: "The second heart sound ('dub') is caused by the sudden closure of the aortic and pulmonary semilunar valves at the beginning of ventricular diastole."
      },
      {
        q: "During nerve impulse transmission, what triggers the exocytosis of neurotransmitter vesicles into the synaptic cleft?",
        options: ["Influx of Ca2+ ions into the presynaptic terminal", "Efflux of K+ ions from the postsynaptic neuron", "Influx of Na+ ions into the synaptic knob", "Active transport of Cl- ions"],
        correct: 0,
        explain: "When an action potential arrives at the presynaptic axon terminal, voltage-gated calcium channels open, causing Ca2+ influx which initiates neurotransmitter vesicle fusion and exocytosis."
      },
      {
        q: "In human females, at which stage of meiosis are primary oocytes arrested until puberty?",
        options: ["Prophase I (Diplotene stage)", "Metaphase II", "Anaphase I", "Telophase II"],
        correct: 0,
        explain: "Primary oocytes undergo meiosis I before birth but remain suspended at Prophase I (diplotene stage) until LH surge during puberty."
      },
      {
        q: "If a man with blood group A (heterozygous) marries a woman with blood group B (heterozygous), what is the probability of their offspring having blood group O?",
        options: ["25% (1/4)", "50% (1/2)", "75% (3/4)", "0%"],
        correct: 0,
        explain: "Heterozygous Group A (IA i) x Heterozygous Group B (IB i) yields IAIB, IAi, IBi, and ii (O). Thus 1 in 4 (25%) will have blood group O."
      },
      {
        q: "Which sliding filament protein binds calcium ions to uncover the myosin-binding sites on actin filaments during skeletal muscle contraction?",
        options: ["Troponin C", "Tropomyosin", "Myosin light chain", "Titine"],
        correct: 0,
        explain: "Calcium released from the sarcoplasmic reticulum binds to Troponin C, inducing a shift in tropomyosin to expose actin active sites."
      },
      {
        q: "Which organelle is known as the powerhouse of the eukaryotic cell?",
        options: ["Mitochondria", "Ribosome", "Golgi Apparatus", "Endoplasmic Reticulum"],
        correct: 0,
        explain: "Mitochondria produce ATP through oxidative phosphorylation during cellular respiration."
      },
      {
        q: "During photosynthesis, light-independent reactions (Calvin cycle) occur in the:",
        options: ["Stroma of chloroplast", "Thylakoid membrane", "Mitochondrial matrix", "Cytosol"],
        correct: 0,
        explain: "The Calvin cycle takes place in the fluid-filled stroma of the chloroplast where enzymes like RuBisCO reside."
      }
    ];

    const chemPool = [
      {
        q: "Which of the following orbitals has the lowest energy according to the (n + l) rule?",
        options: ["4s orbital", "3d orbital", "4p orbital", "5s orbital"],
        correct: 0,
        explain: "For 4s: n+l = 4+0 = 4. For 3d: n+l = 3+2 = 5. Lower (n+l) value means lower energy according to Aufbau principle."
      },
      {
        q: "The geometry of a water molecule (H₂O) according to VSEPR theory is:",
        options: ["Bent / Angular", "Linear", "Tetrahedral", "Trigonal Planar"],
        correct: 0,
        explain: "H₂O has 2 bonding pairs and 2 lone pairs on Oxygen, leading to a bent shape with bond angle ~104.5°."
      },
      {
        q: "Which of the following compounds exhibits optical isomerism?",
        options: ["2-chlorobutane", "1-chlorobutane", "2-chloropropane", "Ethanol"],
        correct: 0,
        explain: "2-chlorobutane has a chiral carbon attached to 4 different groups (-H, -Cl, -CH₃, -C₂H₅), making it optically active."
      },
      {
        q: "The pH of a 0.001 M HCl solution at 25°C is:",
        options: ["3.0", "1.0", "7.0", "11.0"],
        correct: 0,
        explain: "pH = -log[H⁺] = -log(10⁻³) = 3.0."
      },
      {
        q: "What is the correct order of decreasing SN1 reaction reactivity for alkyl halides?",
        options: [
          "3° Alkyl Halide > 2° Alkyl Halide > 1° Alkyl Halide > Methyl Halide",
          "1° Alkyl Halide > 2° Alkyl Halide > 3° Alkyl Halide",
          "Methyl Halide > 1° > 2° > 3°",
          "2° Alkyl Halide > 3° Alkyl Halide > 1° Alkyl Halide"
        ],
        correct: 0,
        explain: "SN1 reactions proceed via a carbocation intermediate. Tertiary (3°) carbocations are stabilized by hyperconjugation and inductive effects."
      },
      {
        q: "According to Le Chatelier's Principle, increasing total pressure on N₂ (g) + 3H₂ (g) ⇌ 2NH₃ (g) will:",
        options: [
          "Shift equilibrium to the right (towards NH₃ formation)",
          "Shift equilibrium to the left",
          "Have no effect on equilibrium position",
          "Decompose ammonia completely"
        ],
        correct: 0,
        explain: "Increasing pressure shifts equilibrium toward the side with fewer gas moles (2 moles of NH3 vs 4 moles of reactants)."
      },
      {
        q: "Which transition metal ion exhibits a d5 electron configuration in its ground state?",
        options: ["Fe3+", "Mn4+", "Cr2+", "Cu2+"],
        correct: 0,
        explain: "Iron (Fe) has Z=26 ([Ar] 4s² 3d⁶). Losing 3 electrons (two from 4s and one from 3d) leaves Fe3+ with a stable half-filled d5 configuration."
      }
    ];

    const physPool = [
      {
        q: "Which of the following physical quantities is a vector quantity in classical mechanics?",
        options: ["Torque", "Electric Potential", "Work Done", "Kinetic Energy"],
        correct: 0,
        explain: "Torque is defined as τ = r × F, which is a cross product resulting in a vector quantity with both magnitude and direction."
      },
      {
        q: "According to Newton's Second Law of Motion, the rate of change of momentum is equal to:",
        options: ["Applied Net Force", "Mass x Velocity", "Impulse per unit mass", "Total Energy"],
        correct: 0,
        explain: "F_net = dp/dt. The rate of change of linear momentum of a body is directly proportional to the net applied force."
      },
      {
        q: "In a simple harmonic motion (SHM), the acceleration of the particle is maximum at:",
        options: ["Extreme positions", "Mean position", "Halfway between mean and extreme", "It remains constant"],
        correct: 0,
        explain: "Since a = -ω²x, acceleration is directly proportional to displacement x. Thus, 'a' is maximum at extreme positions where x = A."
      },
      {
        q: "The SI unit of magnetic flux density (B) is:",
        options: ["Tesla (T)", "Weber (Wb)", "Gauss", "Henry (H)"],
        correct: 0,
        explain: "Magnetic flux density B = Φ/A, measured in Webers per square meter, which is defined as Tesla (T)."
      },
      {
        q: "What happens to the capacitance of a parallel plate capacitor when a dielectric material is inserted between the plates?",
        options: ["Increases by factor of k", "Decreases by factor of k", "Remains unchanged", "Becomes zero"],
        correct: 0,
        explain: "Inserting a dielectric of constant k increases capacitance C = k * C₀ because permittivity of the medium increases."
      },
      {
        q: "The maximum kinetic energy of photoelectrons emitted in photoelectric effect depends strictly on:",
        options: ["Frequency of incident light", "Intensity of incident light", "Time of exposure", "Area of metal target"],
        correct: 0,
        explain: "According to Einstein's photoelectric equation KE_max = hf - Φ, maximum kinetic energy depends linearly on light frequency f, independent of intensity."
      },
      {
        q: "In an ideal step-up transformer, which quantity remains unchanged between primary and secondary coils?",
        options: ["Electrical power (P)", "Voltage (V)", "Current (I)", "Magnetic flux density"],
        correct: 0,
        explain: "In an ideal transformer with zero energy loss, input power equals output power: P_primary = P_secondary."
      }
    ];

    const mathPool = [
      {
        q: "What is the derivative of f(x) = e^(2x) * sin(x) with respect to x?",
        options: [
          "e^(2x) [2 sin(x) + cos(x)]",
          "2 e^(2x) cos(x)",
          "e^(2x) [sin(x) + 2 cos(x)]",
          "2 e^(2x) sin(x)"
        ],
        correct: 0,
        explain: "Using the product rule d/dx[u*v] = u'v + uv': f'(x) = 2e^(2x)sin(x) + e^(2x)cos(x) = e^(2x)[2sin(x) + cos(x)]."
      },
      {
        q: "The radius of the circle given by x² + y² - 6x + 8y = 0 is:",
        options: ["5", "25", "10", "7"],
        correct: 0,
        explain: "Compare with x²+y²+2gx+2fy+c=0: g=-3, f=4, c=0. Radius r = √(g²+f²-c) = √(9+16-0) = √25 = 5."
      },
      {
        q: "The value of the definite integral ∫₀¹ x³ dx is:",
        options: ["1/4", "1/3", "1/2", "1"],
        correct: 0,
        explain: "∫ x³ dx = [x⁴ / 4] from 0 to 1 = (1⁴/4) - (0⁴/4) = 1/4."
      },
      {
        q: "If A is a square matrix of order 3 with determinant |A| = 4, then the determinant of 2A is:",
        options: ["32", "8", "16", "64"],
        correct: 0,
        explain: "For an n×n matrix, |kA| = k^n * |A|. For n=3 and k=2: |2A| = 2^3 * 4 = 8 * 4 = 32."
      }
    ];

    const csPool = [
      {
        q: "Which linear data structure operates on a First-In, First-Out (FIFO) basis?",
        options: ["Queue", "Stack", "Binary Search Tree", "Graph"],
        correct: 0,
        explain: "Queues insert elements at the rear and process them from the front in strict FIFO order."
      },
      {
        q: "In Object-Oriented Programming (OOP), deriving a new class from an existing class is termed:",
        options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"],
        correct: 0,
        explain: "Inheritance enables a derived child class to inherit fields and methods from a parent base class."
      },
      {
        q: "Which SQL command is used to permanently remove a database table structure and all its data?",
        options: ["DROP TABLE", "DELETE TABLE", "TRUNCATE TABLE", "REMOVE TABLE"],
        correct: 0,
        explain: "DROP TABLE completely deletes the table definition as well as all contained database rows."
      }
    ];

    const engPool = [
      {
        q: "Select the correctly punctuated and grammatically sound sentence:",
        options: [
          "It's a great day for an exam.",
          "Its a great day for an exam.",
          "Its' a great day for an exam.",
          "It is a great day, for an exam"
        ],
        correct: 0,
        explain: "\"It's\" is the proper apostrophe contraction for 'It is'. 'Its' without apostrophe is possessive."
      },
      {
        q: "Choose the word most nearly OPPOSITE in meaning to 'BENEVOLENT':",
        options: ["Malevolent", "Magnanimous", "Charitable", "Altruistic"],
        correct: 0,
        explain: "Benevolent (wishing well) is the direct antonym of Malevolent (wishing harm)."
      },
      {
        q: "Identify the subject-verb agreement error correction: 'Neither of the applicants _____ qualified for the post.'",
        options: ["is", "are", "were", "have been"],
        correct: 0,
        explain: "Indefinite pronouns like 'neither', 'either', and 'each' take singular verbs: 'Neither is qualified'."
      }
    ];

    const lrPool = [
      {
        q: "If ALL Doctors are Scholars, and SOME Scholars are Authors, which conclusion logically follows?",
        options: [
          "Some Scholars are Doctors",
          "All Authors are Doctors",
          "No Doctor is an Author",
          "All Scholars are Doctors"
        ],
        correct: 0,
        explain: "If all Doctors are Scholars, the subset of Scholars must contain Doctors; hence 'Some Scholars are Doctors' is valid."
      },
      {
        q: "If 'STETHOSCOPE' is coded as 'TUFUIFTPDQF' in a secret cipher, how is 'DOCTOR' coded in that same pattern?",
        options: ["EPDUPS", "CNDSNP", "EQEVPS", "DPDUOS"],
        correct: 0,
        explain: "Each letter is shifted forward by 1 (+1 in alphabet): D->E, O->P, C->D, T->U, O->P, R->S. Output: EPDUPS."
      },
      {
        q: "Complete the numerical series: 3, 7, 15, 31, 63, ?",
        options: ["127", "125", "128", "95"],
        correct: 0,
        explain: "Pattern: Multiply by 2 and add 1 (x * 2 + 1). (63 * 2) + 1 = 127."
      }
    ];

    const urduPool = [
      {
        q: "اسم نکرہ کی نشاندہی کریں:",
        options: ["شاعر", "لاہور", "علامہ اقبال", "قرآن مجید"],
        correct: 0,
        explain: "'شاعر' ایک عام اسم (اسم نکرہ) ہے جبکہ لاہور اور علامہ اقبال اسم معرفہ ہیں۔"
      },
      {
        q: "'آب آب ہونا' محاورے کا صحیح مفہوم کیا ہے؟",
        options: ["بہت شرمندہ ہونا", "پانی پینا", "نہانا", "غصہ ہونا"],
        correct: 0,
        explain: "'آب آب ہونا' کا مطلب شدید شرمندگی اور ندامت محسوس کرنا ہے۔"
      },
      {
        q: "اردو زبان کے پہلے صاحبِ دیوان شاعر کون ہیں؟",
        options: ["سلطان قلی قطب شاہ", "میر تقی میر", "مرزا اسد اللہ خان غالب", "خواجہ میر درد"],
        correct: 0,
        explain: "سلطان قلی قطب شاہ اردو زبان کے پہلے صاحبِ دیوان شاعر تسلیم کیے جاتے ہیں۔"
      },
      {
        q: "علامہ محمد اقبال کا پہلا اردو شعری مجموعہ کون سا ہے؟",
        options: ["بانگِ درا", "بالِ جبریل", "ضربِ کلیم", "ارمغانِ حجاز"],
        correct: 0,
        explain: "علامہ اقبال کا پہلا اردو شعری مجموعہ 'بانگِ درا' ہے جو 1924ء میں شائع ہوا تھا۔"
      },
      {
        q: "غزل کے آخری شعر کو کیا کہتے ہیں جس میں شاعر اپنا تخلص استعمال کرتا ہے؟",
        options: ["مقطع", "مطلع", "حسنِ مطلع", "بیت الغزل"],
        correct: 0,
        explain: "غزل کے آخری شعر کو مقطع کہتے ہیں بشرطیکہ اس میں شاعر کا تخلص موجود ہو۔"
      }
    ];

    const pakStudiesPool = [
      {
        q: "The Lahore Resolution was passed on March 23 in which year?",
        options: ["1940", "1930", "1937", "1947"],
        correct: 0,
        explain: "The historic Pakistan Resolution presented by A.K. Fazlul Huq was adopted on March 23, 1940 at Lahore."
      },
      {
        q: "The highest mountain peak in Pakistan is:",
        options: ["K2 (Godwin-Austen)", "Nanga Parbat", "Broad Peak", "Rakaposhi"],
        correct: 0,
        explain: "K2, situated in the Karakoram range, is Pakistan's highest peak (8,611m)."
      }
    ];

    const islamiatPool = [
      {
        q: "قرآن مجید کی کس سورۃ کو 'قلب القرآن' (قرآن کا دل) کہا جاتا ہے؟",
        options: ["سورۃ یٰسین", "سورۃ الفاتحہ", "سورۃ البقرہ", "سورۃ الرحمن"],
        correct: 0,
        explain: "احادیث مبارکہ کی روشنی میں سورۃ یٰسین کو قرآن مجید کا دل کہا گیا ہے۔"
      },
      {
        q: "صلح حدیبیہ کس ہجری میں وقوع پذیر ہوا؟",
        options: ["6 ہجری", "2 ہجری", "8 ہجری", "10 ہجری"],
        correct: 0,
        explain: "صلح حدیبیہ 6 ہجری میں نبی کریم ﷺ اور قریشِ مکہ کے درمیان طے پایا تھا۔"
      },
      {
        q: "اسلام کے پہلے خلیفہ راشد کون ہیں؟",
        options: ["حضرت ابو بکر صدیق رضی اللہ عنہ", "حضرت عمر فاروق رضی اللہ عنہ", "حضرت عثمان غنی رضی اللہ عنہ", "حضرت علی مرتضیٰ رضی اللہ عنہ"],
        correct: 0,
        explain: "نبی کریم ﷺ کے وصال کے بعد حضرت ابو بکر صدیق رضی اللہ عنہ پہلے خلیفہ راشد منتخب ہوئے۔"
      }
    ];

    const keySubject = normalizeSubjectKey(subject);
    const lowerSub = subject.toLowerCase();
    
    let activePool: Array<{ q: string; options: string[]; correct: number; explain: string }> = [];

    if (lowerSub.includes("mdcat") || lowerSub.includes("full mock")) {
      // Balance MDCAT mock test with real items across Bio, Chem, Phys, Eng, LR
      activePool = [...bioPool, ...chemPool, ...physPool, ...engPool, ...lrPool];
    } else if (lowerSub.includes("tcat")) {
      activePool = [...mathPool, ...physPool, ...chemPool, ...csPool, ...engPool, ...lrPool];
    } else if (keySubject === "Biology") {
      activePool = bioPool;
    } else if (keySubject === "Chemistry") {
      activePool = chemPool;
    } else if (keySubject === "Physics") {
      activePool = physPool;
    } else if (keySubject === "Mathematics") {
      activePool = mathPool;
    } else if (keySubject === "Computer Science") {
      activePool = csPool;
    } else if (keySubject === "English") {
      activePool = engPool;
    } else if (keySubject === "Logical Reasoning") {
      activePool = lrPool;
    } else if (keySubject === "Urdu") {
      activePool = urduPool;
    } else if (keySubject === "Pakistan Studies") {
      activePool = pakStudiesPool;
    } else if (keySubject === "Islamiat") {
      activePool = islamiatPool;
    } else {
      activePool = [...bioPool, ...chemPool, ...physPool];
    }

    for (let i = 0; i < questionCount; i++) {
      const template = activePool[i % activePool.length];
      questions.push({
        id: `real-q-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        q: template.q,
        options: [...template.options],
        correct: template.correct,
        topic: customTopic || topicLabel,
        explain: template.explain,
        difficulty
      });
    }

    return questions;
  }

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "SHS Virtual Academy MCQs Generator API" });
  });

  // API Endpoint: Verify current Auth session server-side
  app.get("/api/verify-auth", async (req, res) => {
    const { user, isAdmin } = await verifyAuthToken(req);
    if (!user) {
      return res.status(401).json({ success: false, authenticated: false, error: "Unauthenticated session" });
    }
    return res.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin,
      },
    });
  });

  // API Endpoint: Query current MCQ usage for a student
  app.get("/api/mcq-usage", async (req, res) => {
    const { user, isAdmin: verifiedAdmin } = await verifyAuthToken(req);
    const userId = user ? user.id : String(req.query.userId || "guest");
    const userEmail = user ? user.email : (req.query.userEmail ? String(req.query.userEmail) : undefined);
    const isAdmin = verifiedAdmin || isAdminEmail(userEmail);

    const currentUsage = await getStudentMonthlyUsage(userId, userEmail, req);
    const resetDateStr = getNextMonthResetDate();

    res.json({
      success: true,
      currentUsage,
      limit: 100,
      remaining: isAdmin ? 999999 : Math.max(0, 100 - currentUsage),
      resetDate: resetDateStr,
      isAdmin,
    });
  });

  // API Endpoint: Get shared custom topics for a subject
  app.get("/api/custom-topics", async (req, res) => {
    try {
      const subject = String(req.query.subject || "Physics");
      const topics = await getSharedCustomTopics(subject);
      return res.json({ success: true, topics });
    } catch (err: any) {
      console.error("[api/custom-topics error]:", err);
      return res.json({ success: true, topics: [] });
    }
  });

  // API Endpoint: Save a new shared custom topic
  app.post("/api/custom-topics", async (req, res) => {
    try {
      const { subject, topicName } = req.body;
      if (!subject || !topicName) {
        return res.status(400).json({ success: false, error: "Missing subject or topicName" });
      }
      const result = await saveSharedCustomTopic(subject, topicName);
      return res.json({ success: true, topicName: result.topicName });
    } catch (err: any) {
      console.error("[api/custom-topics POST error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to save custom topic" });
    }
  });

  // API Endpoint: Generate MCQs via Gemini AI or Cache (with 100 monthly hard limit enforcement)
  app.post("/api/generate-mcqs", async (req, res) => {
    const {
      customTopic,
      topic: requestedTopic,
      subtopic,
      chapterName,
      path: pathType = "boards",
      classNum,
      group,
      questionCount = 10,
      difficulty = "Exam Standard",
      mode = "ai-custom",
      userId = "guest",
      userEmail,
      bypassCache = false,
      isFullMock = false,
      groupSubjects = [],
    } = req.body;

    const rawSubject = String(req.body.subject || "Physics");
    const subject = normalizeSubjectKey(rawSubject);

    const requestedCount = Math.max(1, Number(questionCount) || 10);
    const batchOffset = Math.max(0, Number(req.body.batchOffset) || 0);
    const excludeStemSet = new Set<string>(
      Array.isArray(req.body.excludeStems)
        ? req.body.excludeStems.map((s: any) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, ''))
        : []
    );

    // CRITICAL: Progressive & Instant Full Mock Generation (MDCAT 180 MCQs / TCAT 100 MCQs)
    const isMdcatFullMock = isFullMock && (rawSubject.toLowerCase().includes("mdcat") || String(classNum) === "MDCAT" || String(group) === "MDCAT");
    const isTcatFullMock = isFullMock && (rawSubject.toLowerCase().includes("tcat") || String(classNum) === "TCAT" || String(group) === "TCAT");
    const isAnyFullMock = isFullMock || rawSubject.toLowerCase().includes("full mock") || (requestedTopic && String(requestedTopic).toLowerCase().includes("full mock"));

    // Server-side Payment & Subscription Status Enforcement
    const isAdminUser = isAdminEmail(userEmail);
    if (userId && userId !== "guest" && !isAdminUser) {
      let studentRecord: any = null;
      const supabaseClient = getSupabaseAdminClient() || getAuthClient(req);
      if (supabaseClient) {
        try {
          const { data } = await supabaseClient
            .from("students")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
          studentRecord = data;
        } catch (dbErr) {
          console.warn("[Server Payment Check DB Error]:", dbErr);
        }
      }

      if (studentRecord) {
        const isExistingStudent = isStudentExistingBeforeRule(studentRecord.created_at);
        const isExemptOrVerified = isExistingStudent || studentRecord.requires_payment === false || studentRecord.payment_status === 'Verified & Paid';
        const isFreePlanOnly = studentRecord.payment_status === 'Free Plan' || (Array.isArray(studentRecord.subscribed_plans) && studentRecord.subscribed_plans.length === 1 && studentRecord.subscribed_plans[0] === 'free');

        // Check 1: Non-free paid plan selected, but status is not Verified & Paid (unpaid / pending verification / rejected)
        if (!isExemptOrVerified && !isFreePlanOnly) {
          return res.status(403).json({
            success: false,
            locked: true,
            paymentRequired: true,
            paymentStatus: studentRecord.payment_status || 'Unpaid',
            error: `Payment Verification Required: Access to paid plans requires an active and verified subscription. Your payment status is '${studentRecord.payment_status || 'Unpaid'}'. Please submit payment proof for approval.`,
            message: `Payment Verification Required: Access to paid plans requires an active and verified subscription.`
          });
        }

        // Check 2: Free Plan user trying to access paid entrance exam tracks (MDCAT/TCAT)
        if (isFreePlanOnly && (isMdcatFullMock || isTcatFullMock || rawSubject.toLowerCase().includes("mdcat") || rawSubject.toLowerCase().includes("tcat"))) {
          return res.status(403).json({
            success: false,
            locked: true,
            paymentRequired: true,
            error: "Paid Subscription Required: MDCAT and TCAT entrance prep requires a paid plan. Please upgrade your plan.",
            message: "Paid Subscription Required: MDCAT and TCAT entrance prep requires a paid plan."
          });
        }
      }
    }

    if (isMdcatFullMock || (isAnyFullMock && rawSubject.toLowerCase().includes("mdcat"))) {
      console.log(`[Full Mock Request] MDCAT Full Mock (Offset: ${batchOffset}, Count: ${requestedCount})`);
      const fullBank = generateMDCATFullMockBank();
      let filteredBank = fullBank;
      if (excludeStemSet.size > 0) {
        filteredBank = fullBank.filter(q => !excludeStemSet.has((q.q || '').toLowerCase().replace(/[^a-z0-9]/g, '')));
      }

      let questions = filteredBank.slice(batchOffset, batchOffset + requestedCount);
      if (questions.length === 0 && filteredBank.length > 0) {
        questions = filteredBank.slice(0, requestedCount);
      }

      return res.json({
        success: true,
        selectedSubject: "MDCAT Full Mock",
        subjectSentToGemini: "MDCAT Full Mock",
        subjectReturned: "MDCAT Full Mock",
        questions,
        totalTargetCount: 180,
        batchOffset,
        usage: {
          currentUsage: 0,
          limit: 100,
          remaining: 999999,
          resetDate: getNextMonthResetDate(),
          isAdmin: true,
        },
      });
    }

    if (isTcatFullMock || (isAnyFullMock && rawSubject.toLowerCase().includes("tcat"))) {
      console.log(`[Full Mock Request] TCAT Full Mock (Offset: ${batchOffset}, Count: ${requestedCount})`);
      const fullBank = generateTCATFullMockBank(Array.isArray(groupSubjects) && groupSubjects.length > 0 ? groupSubjects : ['Mathematics', 'Physics', 'Chemistry', 'English']);
      let filteredBank = fullBank;
      if (excludeStemSet.size > 0) {
        filteredBank = fullBank.filter(q => !excludeStemSet.has((q.q || '').toLowerCase().replace(/[^a-z0-9]/g, '')));
      }

      let questions = filteredBank.slice(batchOffset, batchOffset + requestedCount);
      if (questions.length === 0 && filteredBank.length > 0) {
        questions = filteredBank.slice(0, requestedCount);
      }

      return res.json({
        success: true,
        selectedSubject: "TCAT Full Mock",
        subjectSentToGemini: "TCAT Full Mock",
        subjectReturned: "TCAT Full Mock",
        questions,
        totalTargetCount: 100,
        batchOffset,
        usage: {
          currentUsage: 0,
          limit: 100,
          remaining: 999999,
          resetDate: getNextMonthResetDate(),
          isAdmin: true,
        },
      });
    }

    const isAdmin = isAdminEmail(userEmail);
    const isMdcat = pathType === 'mdcat' || String(classNum) === 'MDCAT' || String(group) === 'MDCAT';
    const resetDateStr = getNextMonthResetDate();

    // Determine effective topic for subtopic-granularity support
    let effectiveTopic = customTopic || requestedTopic;
    if (!effectiveTopic) {
      if (chapterName && subtopic) {
        effectiveTopic = `${chapterName} - ${subtopic}`;
      } else if (subtopic) {
        effectiveTopic = subtopic;
      } else if (chapterName) {
        effectiveTopic = chapterName;
      }
    }
    const topicLabel = effectiveTopic || `${subject} Syllabus`;

    // Save custom topic or subtopic if provided
    if (effectiveTopic && typeof effectiveTopic === 'string' && effectiveTopic.trim()) {
      await saveSharedCustomTopic(subject, effectiveTopic);
    }

    // 0. Server-Side Course Registration & Grade/Stream Lock Verification
    let activeClassNum = Number(classNum) || 11;
    let activeGroup = String(group || "Pre-Medical");

    if (userId && userId !== "guest" && !isAdmin && !isMdcat) {
      let studentRecord: any = null;
      if (getAuthClient(req || null)) {
        try {
          const { data } = await supabaseServer
            .from("students")
            .select("*")
            .eq("id", userId)
            .maybeSingle();
          studentRecord = data;
        } catch (dbErr) {
          console.warn("[Course Reg Lock Check Warning]:", dbErr);
        }
      }

      const isValidGrade = Boolean(studentRecord?.grade && studentRecord.grade.trim() && studentRecord.grade !== 'General Student');
      const isValidStream = Boolean(studentRecord?.stream && studentRecord.stream.trim());
      const isRegistered = Boolean(studentRecord?.is_registered && isValidGrade && isValidStream);

      if (!isRegistered) {
        return res.status(403).json({
          success: false,
          locked: true,
          error: "Course Registration Required: Please select your Class and Stream before generating MCQs.",
          message: "Course Registration Required: You must complete your Grade and Stream selection in your Course Registration before accessing practice MCQs."
        });
      }

      // Strictly lock classNum and group server-side to student's saved record
      const savedGrade = studentRecord.grade || "";
      const savedStream = studentRecord.stream || "";

      let lockedClassNum = 11;
      if (savedGrade.includes("9")) lockedClassNum = 9;
      else if (savedGrade.includes("10")) lockedClassNum = 10;
      else if (savedGrade.includes("11")) lockedClassNum = 11;
      else if (savedGrade.includes("12")) lockedClassNum = 12;

      let lockedGroup = "Pre-Medical";
      if (savedStream.includes("Biology")) lockedGroup = "Medical";
      else if (savedStream.includes("Computer Science")) lockedGroup = "Computer Science";
      else if (savedStream.includes("Pre-Medical")) lockedGroup = "Pre-Medical";
      else if (savedStream.includes("Pre-Engineering")) lockedGroup = "Pre-Engineering";
      else if (savedStream.includes("ICS")) lockedGroup = "ICS";

      // If student explicitly requested a different class or stream, reject server-side with 403
      if (classNum && Number(classNum) !== lockedClassNum) {
        return res.status(403).json({
          success: false,
          locked: true,
          error: `Class & Stream Locked: Your registration is locked to Class ${lockedClassNum} (${savedStream}). You cannot request questions for Class ${classNum}.`,
          message: `Class & Stream Locked: Your registration is locked to Class ${lockedClassNum} (${savedStream}). You cannot request questions for Class ${classNum}.`
        });
      }

      activeClassNum = lockedClassNum;
      activeGroup = lockedGroup;
    }

    // Fetch current student monthly usage
    const currentUsage = isAdmin ? 0 : await getStudentMonthlyUsage(userId, userEmail, req);

    // 1. CACHE LOOKUP: Check saved Question Bank in Supabase before calling AI
    if (!bypassCache && topicLabel && topicLabel !== `${subject} FBISE Syllabus` && topicLabel !== "All Topics") {
      try {
        const cachedBank = await getCachedMcqs(subject, topicLabel, activeClassNum);
        if (Array.isArray(cachedBank) && cachedBank.length >= 1) {
          // Shuffle or take requested count from cached bank
          const shuffledCached = [...cachedBank].sort(() => 0.5 - Math.random());
          const selectedCached = shuffledCached.slice(0, requestedCount);

          // IMPORTANT: Serving cached/reused questions does NOT count against the 100 monthly AI limit!
          console.log(`[MCQ Cache Served - Free of Limit]: Returned ${selectedCached.length} cached questions for "${subject}" - "${topicLabel}"`);
          return res.json({
            success: true,
            selectedSubject: subject,
            subjectSentToGemini: subject,
            subjectReturned: subject,
            questions: selectedCached,
            cached: true,
            usage: {
              currentUsage,
              limit: 100,
              remaining: isAdmin ? 999999 : Math.max(0, 100 - currentUsage),
              resetDate: resetDateStr,
              isAdmin,
            }
          });
        }
      } catch (cacheErr) {
        console.warn("[MCQ Cache Lookup Error, continuing to AI generation]:", cacheErr);
      }
    }

    // 2. Server-side Hard Monthly AI Generation Limit Enforcement (100 AI-generated MCQs per calendar month)
    if (!isAdmin && !isMdcat && currentUsage >= 100) {
      const errorMessage = `You've reached your monthly limit of 100 AI-generated MCQs. This resets on ${resetDateStr}. You can still practice using previously generated/cached questions.`;
      return res.status(403).json({
        success: false,
        limitExceeded: true,
        error: errorMessage,
        message: errorMessage,
        currentUsage,
        requestedCount,
        limit: 100,
        resetDate: resetDateStr,
      });
    }

    let finalQuestions: MCQQuestion[] = [];

    // Fetch student weakness profile for adaptive prompt injection
    let weaknessProfile: StudentWeaknessProfile | null = null;
    if (userId && userId !== "guest") {
      try {
        weaknessProfile = await getStudentWeaknessProfile(userId, subject);
        if (weaknessProfile && weaknessProfile.totalAttempts > 0) {
          console.log(`[Adaptive Gemini Context] Loaded weakness profile for user ${userId} in ${subject}: Accuracy ${weaknessProfile.overallAccuracy}%, Weakest: ${weaknessProfile.weakestTopics.map(w => w.chapter).join(", ")}`);
        }
      } catch (profErr) {
        console.warn("[Adaptive Gemini Context Error]:", profErr);
      }
    }

    let geminiError: string | null = null;

    // Try generating with Gemini AI if requested or in ai-custom mode
    if (mode === "ai-custom" || customTopic || mode === "instant") {
      try {
        const ai = getGeminiClient();
        if (!ai) {
          geminiError = "GEMINI_API_KEY is not configured on the server. Please check environment secrets.";
          console.warn("[Gemini AI Error]:", geminiError);
        } else {
          const systemInstruction = `You are a senior academic curriculum specialist and senior chief examination creator for Federal Board (FBISE) exams (Classes 9, 10, 11, and 12).

Your sole responsibility is to generate high-yield, 100% factually accurate, flawless multiple choice questions (MCQs) strictly mapped to the Federal Board (FBISE) curriculum for the specified Class and Group combination.

STRICT CURRICULUM BOUNDARIES:
- For Class 9 and 10: The two groups are 'Medical' and 'Computer Science'.
- For Class 11 and 12: The three groups are 'Pre-Medical', 'Pre-Engineering', and 'ICS'.
- Class 9 & Class 11 NEVER include Pakistan Studies.
- Class 10 & Class 12 INCLUDE Pakistan Studies.
- Ensure every generated question is strictly suited for Class ${activeClassNum} (${activeGroup}) FBISE level.

STRICT CRITERIA & MANDATORY REQUIREMENTS:
1. FACTUAL & ACADEMIC ACCURACY:
   - Every single question stem, answer choice, mathematical equation, scientific constant, and explanation MUST be 100% factually accurate and verified against FBISE accredited textbooks.

2. ABSOLUTE CORRECT ANSWER MATCHING:
   - The 'correct' field MUST be an integer between 0 and 3 corresponding EXACTLY to the ZERO-BASED index of the options array that contains the 100% correct answer.

3. SPELLING, GRAMMAR & FORMATTING QUALITY CONTROL:
   - Ensure perfect English/Urdu spelling, proper subject terminology, correct SI units/qawaid, and perfect grammar.

4. DISTINCT & PLAUSIBLE OPTIONS:
   - Each question must contain EXACTLY 4 distinct, plausible options with EXACTLY ONE correct answer.

5. STRICT SUBJECT SEPARATION:
   - Every question MUST belong strictly to the requested subject "${subject}". NEVER output questions from other subjects (e.g., NO Physics questions for Urdu/English, NO Chemistry questions for Computer Science).

6. LANGUAGE MANDATE FOR URDU & ISLAMIAT:
   - If subject is "Urdu", "Islamiat", or "Islamic Studies", ALL question stems (q), option choices (options), topics (topic), and explanations (explain) MUST BE WRITTEN 100% IN URDU SCRIPT (اردو زبان). Do NOT use any English words or Latin letters in questions, options, or explanations for Urdu and Islamiat. NEVER generate Physics, Chemistry, Biology, Mathematics, or Science questions for Urdu or Islamiat.`;

          let subjectConstraintNote = "";
          const subLower = subject.toLowerCase();
          if (subLower.includes("urdu")) {
            subjectConstraintNote = `CRITICAL URDU MANDATE: Generate authentic Urdu MCQs for FBISE Class ${classNum || 11}. ALL text MUST be in Urdu script. DO NOT output any science/Physics questions.`;
          } else if (subLower.includes("islam") || subLower.includes("din")) {
            subjectConstraintNote = `CRITICAL ISLAMIAT MANDATE: Generate authentic Islamiat MCQs for FBISE Class ${classNum || 11}. ALL text MUST be in Urdu script. DO NOT output any science/Physics questions.`;
          }

          let adaptiveContextText = "";
          if (weaknessProfile && weaknessProfile.totalAttempts > 0 && weaknessProfile.promptContext) {
            adaptiveContextText = `\n\n${weaknessProfile.promptContext}`;
          }

          const userPrompt = `Generate ${requestedCount} multiple choice questions (MCQs) for:
Subject: ${subject}
${isMdcat ? 'Exam Type: PMDC MDCAT / TCAT Entrance Exam' : `Class Level: Class ${activeClassNum}\nGroup/Stream: ${activeGroup}`}
${chapterName ? `Chapter: ${chapterName}` : ''}
${subtopic ? `Subtopic: ${subtopic}` : ''}
${effectiveTopic ? `Topic/Syllabus Focus: ${effectiveTopic}` : ''}
Target Difficulty Level: ${difficulty}
${subjectConstraintNote}${adaptiveContextText}

Ensure every question is 100% unique, highly relevant to ${subject}${effectiveTopic ? ` (${effectiveTopic})` : ''}, and strictly tests core concepts for ${isMdcat ? 'PMDC MDCAT syllabus' : `Class ${activeClassNum}`} level.`;

          console.log(`[Gemini MCQ Request] Subject: "${subject}", Topic: "${topicLabel}", Class: ${activeClassNum}, Group: "${activeGroup}", Count: ${requestedCount}`);
          console.log("[Gemini MCQ Prompt Sent]:", userPrompt);

          let attempts = 0;
          const maxAttempts = 2;

          // Attempt model fallback if gemini-3.6-flash fails
          const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];

          for (const modelName of modelsToTry) {
            if (finalQuestions.length >= requestedCount) break;
            
            try {
              console.log(`[Gemini Attempting Model]: ${modelName}`);
              const response = await ai.models.generateContent({
                model: modelName,
                contents: userPrompt,
                config: {
                  systemInstruction,
                  temperature: 0.1,
                  topP: 0.95,
                  topK: 40,
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.ARRAY,
                    description: "List of verified multiple choice questions",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        q: { type: Type.STRING, description: "Factually accurate, unambiguous question text." },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "Array of exactly 4 distinct choices."
                        },
                        correct: {
                          type: Type.INTEGER,
                          description: "Zero-based index (0, 1, 2, or 3) indicating WHICH option in options array is the correct answer."
                        },
                        topic: { type: Type.STRING, description: "Specific sub-topic or concept tested." },
                        explain: { type: Type.STRING, description: "Detailed, step-by-step academic explanation." }
                      },
                      required: ["q", "options", "correct", "topic", "explain"]
                    }
                  }
                }
              });

              const responseText = response.text || "";
              console.log(`[Gemini Raw Response Received from ${modelName}]:`, responseText);

              if (responseText) {
                const rawParsed = JSON.parse(responseText.trim());
                const validatedQs = validateAndFixQuestions(rawParsed, subject, topicLabel, difficulty);

                if (validatedQs.length > 0) {
                  finalQuestions = validatedQs.slice(0, requestedCount);
                  break;
                } else {
                  console.warn(`[Gemini Validation] Validation rejected all questions from model ${modelName} for "${subject}".`);
                }
              }
            } catch (modelErr: any) {
              console.error(`[Gemini Model Error on ${modelName}]:`, modelErr?.message || modelErr);
              geminiError = modelErr?.message || String(modelErr);
            }
          }
        }
      } catch (err: any) {
        geminiError = err?.message || String(err);
        console.error("[Gemini AI MCQ generation error]:", geminiError);
      }
    }

    // If explicit AI generation was requested (ai-custom or customTopic) and Gemini failed to return real questions, surface the error!
    if (finalQuestions.length === 0 && (mode === "ai-custom" || customTopic)) {
      const userErr = geminiError || "Gemini AI service encountered an error or key is unconfigured. Please check API key setup.";
      console.error(`[MCQ Generation Blocked] Surface error to user: ${userErr}`);
      return res.status(500).json({
        success: false,
        error: `Gemini AI Generation Failed: ${userErr}`,
        message: `Gemini AI Generation Failed: ${userErr}`
      });
    }

    // Fallback or Instant Bank if Gemini was not used or for instant practice mode
    if (finalQuestions.length === 0) {
      console.log(`[MCQ Fallback] Generating syllabus static questions for ${subject} - ${topicLabel}`);
      finalQuestions = generateSyllabusQuestions(
        subject,
        customTopic,
        requestedCount,
        difficulty
      ).slice(0, requestedCount);
    }

    // Save generated MCQs to question cache for future reuse across students
    if (finalQuestions.length > 0 && topicLabel && topicLabel !== `${subject} FBISE Syllabus` && topicLabel !== "All Topics") {
      try {
        await saveMcqsToCache(subject, topicLabel, finalQuestions, activeClassNum);
      } catch (cacheSaveErr) {
        console.warn("[saveMcqsToCache error]:", cacheSaveErr);
      }
    }

    // 2. Increment student usage in Supabase / server store only after successful question generation
    let newUsage = currentUsage;
    if (finalQuestions.length > 0) {
      newUsage = await incrementStudentMonthlyUsage(userId, userEmail, finalQuestions.length);
    }

    return res.json({
      success: true,
      selectedSubject: subject,
      subjectSentToGemini: subject,
      subjectReturned: subject,
      questions: finalQuestions,
      adaptiveContextApplied: Boolean(weaknessProfile && weaknessProfile.totalAttempts > 0),
      weaknessProfile: weaknessProfile || undefined,
      usage: {
        currentUsage: newUsage,
        limit: 100,
        remaining: isAdmin ? 999999 : Math.max(0, 100 - newUsage),
        resetDate: resetDateStr,
        isAdmin,
      },
    });
  });

  // API Endpoint: Log MCQ attempts for student weakness tracking
  app.post("/api/log-mcq-attempts", async (req, res) => {
    try {
      const { studentId, studentEmail, subject, attempts } = req.body;
      if (!studentId || !Array.isArray(attempts) || attempts.length === 0) {
        return res.status(400).json({ success: false, error: "Missing studentId or attempts array" });
      }

      const result = await logStudentMcqAttempts(studentId, studentEmail, subject, attempts);
      const updatedProfile = await getStudentWeaknessProfile(studentId, subject);

      return res.json({
        success: true,
        loggedCount: result.count,
        profile: updatedProfile,
      });
    } catch (err: any) {
      console.error("[api/log-mcq-attempts error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to log MCQ attempts" });
    }
  });

  // API Endpoint: Fetch student weakness profile & weakness analytics
  app.get("/api/student-weakness-profile", async (req, res) => {
    try {
      const studentId = String(req.query.studentId || "");
      const subject = req.query.subject ? String(req.query.subject) : undefined;

      if (!studentId) {
        return res.status(400).json({ success: false, error: "Missing studentId query parameter" });
      }

      const profile = await getStudentWeaknessProfile(studentId, subject);
      return res.json({ success: true, profile });
    } catch (err: any) {
      console.error("[api/student-weakness-profile error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to fetch weakness profile" });
    }
  });

  // API Endpoint: Get all student weakness profiles for Admin Dashboard
  app.get("/api/admin/all-student-weakness-profiles", async (req, res) => {
    try {
      const { user, isAdmin } = await verifyAuthToken(req);
      if (!user || !isAdmin) {
        return res.status(403).json({ success: false, error: "Forbidden: Admin access required" });
      }

      // Aggregate in-memory + Supabase attempts across students
      const studentMap: Record<string, Set<string>> = {};

      for (const att of inMemoryMCQAttempts) {
        if (!studentMap[att.studentId]) {
          studentMap[att.studentId] = new Set();
        }
        studentMap[att.studentId].add(att.subject);
      }

      if (getAuthClient(req || null)) {
        try {
          const { data } = await getAuthClient(req || null)?.from("mcq_attempts").select("student_id, subject");
          if (Array.isArray(data)) {
            for (const row of data) {
              if (row.student_id) {
                if (!studentMap[row.student_id]) {
                  studentMap[row.student_id] = new Set();
                }
                studentMap[row.student_id].add(row.subject || "Mathematics");
              }
            }
          }
        } catch (dbErr) {
          console.warn("[Admin all-student-weakness fetch warning]:", dbErr);
        }
      }

      const profiles: StudentWeaknessProfile[] = [];
      for (const stId of Object.keys(studentMap)) {
        for (const sub of Array.from(studentMap[stId])) {
          const prof = await getStudentWeaknessProfile(stId, sub);
          if (prof.totalAttempts > 0) {
            profiles.push(prof);
          }
        }
      }

      return res.json({ success: true, profiles });
    } catch (err: any) {
      console.error("[api/admin/all-student-weakness-profiles error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to fetch admin profiles" });
    }
  });

  // API Endpoint: Clear student test history (soft delete or permanent delete)
  app.post("/api/clear-test-history", async (req, res) => {
    const { studentId, softDelete = true, permanent = false } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, error: "Missing studentId parameter" });
    }

    try {
      for (let i = inMemoryTestResults.length - 1; i >= 0; i--) {
        if (inMemoryTestResults[i].student_id === studentId) {
          if (permanent || softDelete === false) {
            inMemoryTestResults.splice(i, 1);
          } else {
            inMemoryTestResults[i].hidden_from_student = true;
          }
        }
      }

      if (permanent || softDelete === false) {
        // Admin permanent hard delete
        for (let i = inMemoryMCQAttempts.length - 1; i >= 0; i--) {
          if (inMemoryMCQAttempts[i].studentId === studentId) {
            inMemoryMCQAttempts.splice(i, 1);
          }
        }
        if (getAuthClient(req || null)) {
          await getAuthClient(req || null)?.from("test_results").delete().eq("student_id", studentId);
          await getAuthClient(req || null)?.from("mcq_attempts").delete().eq("student_id", studentId);
        }
      } else {
        // Student soft delete: update hidden_from_student = true
        if (getAuthClient(req || null)) {
          await supabaseServer
            .from("test_results")
            .update({ hidden_from_student: true })
            .eq("student_id", studentId);
        }
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error("[api/clear-test-history error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to clear history" });
    }
  });

  // API Endpoint: Save completed practice test result (Supabase + Server Memory)
  app.post("/api/save-test-result", async (req, res) => {
    try {
      const {
        studentId,
        studentEmail,
        subject,
        pathLabel,
        score = 0,
        total = 0,
        percentage = 0,
        duration = "0m 0s",
        timeTakenSeconds = 0,
        dateStr = new Date().toLocaleDateString(),
        attempts = [],
      } = req.body;

      if (!studentId) {
        return res.status(400).json({ success: false, error: "Missing studentId parameter" });
      }

      const nowIso = new Date().toISOString();
      const numScore = Number(score) || 0;
      const numTotal = Number(total) || 0;
      const computedPct = numTotal > 0 ? Math.round((numScore / numTotal) * 100) : Number(percentage) || 0;

      const newResultItem: SavedTestResultItem = {
        id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        student_id: String(studentId),
        student_email: studentEmail || "",
        subject: subject || "Practice Test",
        path_label: pathLabel || "General",
        score: numScore,
        total: numTotal,
        percentage: computedPct,
        duration: String(duration),
        time_taken_seconds: Number(timeTakenSeconds) || 0,
        date_str: dateStr,
        created_at: nowIso,
        hidden_from_student: false,
      };

      inMemoryTestResults.unshift(newResultItem);
      if (inMemoryTestResults.length > 500) {
        inMemoryTestResults.pop();
      }

      let supabaseSuccess = false;
      let supabaseErrorMsg: string | null = null;

      if (getAuthClient(req || null)) {
        try {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const validStudentUuid = uuidRegex.test(studentId) ? studentId : null;

          const rowToInsert = {
            student_id: validStudentUuid,
            subject: subject || "Practice Test",
            path_label: pathLabel || "General",
            score: numScore,
            total: numTotal,
            percentage: computedPct,
            duration: String(duration),
            time_taken_seconds: Number(timeTakenSeconds) || 0,
            date_str: dateStr,
            created_at: nowIso,
          };

          const { error } = await getAuthClient(req || null)?.from("test_results").insert(rowToInsert);
          if (error) {
            console.warn("[api/save-test-result Supabase insert error]:", error.message);
            supabaseErrorMsg = error.message;

            if (error.code === '23503' || error.code === '22P02') {
              console.log("[api/save-test-result]: Retrying insert with null student_id fallback...");
              const { error: retryErr } = await getAuthClient(req || null)?.from("test_results").insert({
                ...rowToInsert,
                student_id: null,
              });
              if (!retryErr) {
                supabaseSuccess = true;
              }
            }
          } else {
            supabaseSuccess = true;
            console.log(`[api/save-test-result]: Successfully saved test result to Supabase for student ${studentId}`);
          }
        } catch (dbErr: any) {
          console.warn("[api/save-test-result Supabase exception]:", dbErr?.message || dbErr);
          supabaseErrorMsg = dbErr?.message || String(dbErr);
        }
      }

      if (Array.isArray(attempts) && attempts.length > 0) {
        try {
          await logStudentMcqAttempts(studentId, studentEmail, subject, attempts);
        } catch (attErr) {
          console.warn("[api/save-test-result logStudentMcqAttempts error]:", attErr);
        }
      }

      return res.json({
        success: true,
        savedItem: newResultItem,
        supabaseSuccess,
        supabaseError: supabaseErrorMsg,
      });
    } catch (err: any) {
      console.error("[api/save-test-result error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to save test result" });
    }
  });

  // API Endpoint: Query test history for a specific student (Supabase + Server Memory merge)
  app.get("/api/user-test-history", async (req, res) => {
    try {
      const studentId = String(req.query.studentId || "");
      if (!studentId) {
        return res.status(400).json({ success: false, error: "Missing studentId query parameter" });
      }

      const resultsMap = new Map<string, any>();

      if (getAuthClient(req || null)) {
        try {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const isUuid = uuidRegex.test(studentId);

          let query = supabaseServer
            .from("test_results")
            .select("*")
            .or("hidden_from_student.eq.false,hidden_from_student.is.null")
            .order("created_at", { ascending: false });

          if (isUuid) {
            query = query.eq("student_id", studentId);
          }

          const { data, error } = await query;
          if (error) {
            console.warn("[api/user-test-history Supabase query warning]:", error.message);
          } else if (Array.isArray(data)) {
            for (const row of data) {
              if (row.hidden_from_student) continue;
              const key = String(row.id);
              const score = Number(row.score ?? 0);
              const total = Number(row.total ?? 0);
              const calcPct = total > 0 ? Math.round((score / total) * 100) : 0;
              const rawPct = row.percentage !== null && row.percentage !== undefined && !isNaN(Number(row.percentage)) ? Number(row.percentage) : null;
              const percentage = rawPct && rawPct > 0 ? rawPct : (calcPct > 0 ? calcPct : (rawPct ?? 0));

              resultsMap.set(key, {
                id: String(row.id),
                dateStr: row.date_str || new Date(row.created_at).toLocaleDateString(),
                subject: row.subject || "Practice Test",
                pathLabel: row.path_label || "General",
                percentage,
                score,
                total,
                timeTaken: row.duration || "0m 0s",
                hidden_from_student: Boolean(row.hidden_from_student),
              });
            }
          }
        } catch (dbErr) {
          console.warn("[api/user-test-history Supabase exception]:", dbErr);
        }
      }

      const memResults = inMemoryTestResults.filter(
        (item) => item.student_id === studentId && !item.hidden_from_student
      );
      for (const item of memResults) {
        const key = item.id;
        if (!resultsMap.has(key)) {
          resultsMap.set(key, {
            id: item.id,
            dateStr: item.date_str,
            subject: item.subject,
            pathLabel: item.path_label,
            percentage: item.percentage,
            score: item.score,
            total: item.total,
            timeTaken: item.duration,
            hidden_from_student: false,
          });
        }
      }

      const history = Array.from(resultsMap.values());
      return res.json({ success: true, history });
    } catch (err: any) {
      console.error("[api/user-test-history error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to fetch test history" });
    }
  });

  // API Endpoint: Admin Update Student Grade & Stream (Server-Side Enforced)
  app.post("/api/admin/update-student-grade-stream", async (req, res) => {
    const { studentId, grade, stream, subjects = [] } = req.body;
    const { user, isAdmin } = await verifyAuthToken(req);

    if (!user || !isAdmin) {
      console.warn(`[Forbidden Access Attempt]: Unauthorized request attempted to update grade/stream for student ${studentId}`);
      return res.status(403).json({
        success: false,
        error: "Forbidden: Class and Stream updates are strictly restricted to authorized administrators.",
      });
    }

    if (!studentId || !grade || !stream) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: studentId, grade, and stream are required.",
      });
    }

    try {
      if (getAuthClient(req || null)) {
        let updateRes = await supabaseServer
          .from("students")
          .update({
            grade,
            stream,
            subjects,
            is_registered: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", studentId)
          .select()
          .maybeSingle();

        if (updateRes.error) {
          updateRes = await supabaseServer
            .from("students")
            .update({
              grade,
              stream,
              updated_at: new Date().toISOString(),
            })
            .eq("id", studentId)
            .select()
            .maybeSingle();
        }

        if (updateRes.error) {
          console.error("[api/admin/update-student-grade-stream error]:", updateRes.error);
          return res.status(500).json({ success: false, error: updateRes.error.message });
        }

        return res.json({ success: true, profile: updateRes.data });
      }

      return res.json({ success: true });
    } catch (err: any) {
      console.error("[api/admin/update-student-grade-stream exception]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Failed to update grade/stream" });
    }
  });

  // API Endpoint: Admin Remove Student (Full Account Wipe)
  app.all("/api/admin/remove-student", async (req, res) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).end();
    }

    try {
      const { user, isAdmin } = await verifyAuthToken(req);
      if (!user || !isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Only administrators can wipe student accounts.",
        });
      }

      const studentId = req.body?.studentId || req.query?.studentId || "";
      const studentEmail = req.body?.studentEmail || req.query?.studentEmail || "";

      if (!studentId && !studentEmail) {
        return res.status(400).json({
          success: false,
          error: "Missing parameters: studentId or studentEmail is required.",
        });
      }

      console.log(`[api/admin/remove-student] Initiating full wipe for studentId="${studentId}", email="${studentEmail}" by admin="${user.email}"`);

      const db = getSupabaseAdminClient() || supabaseServer;
      const errors: string[] = [];

      let targetStudentId = studentId;
      let targetStudentEmail = studentEmail;

      if (db) {
        // Resolve studentId or studentEmail if missing
        if (!targetStudentId && targetStudentEmail) {
          try {
            const { data: sData } = await db.from("students").select("id").eq("email", targetStudentEmail).maybeSingle();
            if (sData?.id) targetStudentId = sData.id;
          } catch (rErr: any) {
            console.warn(`[api/admin/remove-student] Warning resolving studentId by email:`, rErr?.message);
          }
        }
        if (!targetStudentEmail && targetStudentId) {
          try {
            const { data: sData } = await db.from("students").select("email").eq("id", targetStudentId).maybeSingle();
            if (sData?.email) targetStudentEmail = sData.email;
          } catch (rErr: any) {
            console.warn(`[api/admin/remove-student] Warning resolving studentEmail by id:`, rErr?.message);
          }
        }

        // Step 1: Delete from related child tables first to prevent FK constraint issues
        const childTasks: Array<{ table: string; field: string; val: string }> = [];

        if (targetStudentId) {
          childTasks.push(
            { table: "test_results", field: "student_id", val: targetStudentId },
            { table: "mcq_attempts", field: "student_id", val: targetStudentId },
            { table: "student_mcq_usage", field: "student_id", val: targetStudentId },
            { table: "mcq_usage", field: "student_id", val: targetStudentId },
            { table: "student_progress", field: "student_id", val: targetStudentId },
            { table: "ai_history", field: "student_id", val: targetStudentId },
            { table: "study_buddy_history", field: "student_id", val: targetStudentId },
            { table: "study_buddy_usage", field: "student_id", val: targetStudentId },
            { table: "student_achievements", field: "student_id", val: targetStudentId },
            { table: "achievements", field: "student_id", val: targetStudentId }
          );
        }

        if (targetStudentEmail) {
          childTasks.push(
            { table: "student_mcq_usage", field: "email", val: targetStudentEmail },
            { table: "mcq_usage", field: "email", val: targetStudentEmail }
          );
        }

        for (const task of childTasks) {
          try {
            const { error } = await db.from(task.table).delete().eq(task.field, task.val);
            if (error) {
              console.warn(`[api/admin/remove-student] Warning clearing ${task.table} (${task.field}=${task.val}):`, error.message);
              errors.push(`${task.table}: ${error.message}`);
            } else {
              console.log(`[api/admin/remove-student] Cleared ${task.table} (${task.field}=${task.val})`);
            }
          } catch (tErr: any) {
            console.warn(`[api/admin/remove-student] Exception deleting ${task.table}:`, tErr?.message || String(tErr));
          }
        }

        // Step 2: Delete from main 'students' table
        if (targetStudentId) {
          try {
            const { error } = await db.from("students").delete().eq("id", targetStudentId);
            if (error) {
              console.error(`[api/admin/remove-student] Error deleting student row (id=${targetStudentId}):`, error.message);
              errors.push(`students(id): ${error.message}`);
            } else {
              console.log(`[api/admin/remove-student] Successfully deleted student row (id=${targetStudentId})`);
            }
          } catch (sErr: any) {
            console.error(`[api/admin/remove-student] Exception deleting student row (id=${targetStudentId}):`, sErr?.message);
          }
        }

        if (targetStudentEmail) {
          try {
            const { error } = await db.from("students").delete().eq("email", targetStudentEmail);
            if (error) {
              console.warn(`[api/admin/remove-student] Warning deleting student row by email (${targetStudentEmail}):`, error.message);
            } else {
              console.log(`[api/admin/remove-student] Successfully deleted student row (email=${targetStudentEmail})`);
            }
          } catch (seErr: any) {
            console.warn(`[api/admin/remove-student] Exception deleting student row by email:`, seErr?.message);
          }
        }

        // Step 3: Revoke all active Supabase sessions server-side and delete auth user
        const adminClient = getSupabaseAdminClient();
        if (adminClient && targetStudentId && (adminClient as any).auth?.admin) {
          try {
            if (typeof (adminClient as any).auth.admin.signOut === 'function') {
              await (adminClient as any).auth.admin.signOut(targetStudentId, 'global');
              console.log(`[api/admin/remove-student] Revoked all sessions/JWTs for user (${targetStudentId})`);
            }
          } catch (soErr: any) {
            console.warn(`[api/admin/remove-student] Auth admin signOut warning:`, soErr?.message);
          }
          try {
            const { error: authErr } = await (adminClient as any).auth.admin.deleteUser(targetStudentId);
            if (authErr) {
              console.warn(`[api/admin/remove-student] Auth admin delete warning:`, authErr.message);
            } else {
              console.log(`[api/admin/remove-student] Deleted auth user (${targetStudentId}) from Supabase Auth`);
            }
          } catch (aErr: any) {
            console.warn(`[api/admin/remove-student] Exception deleting auth user:`, aErr?.message);
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: "Student account, test history, and registration wiped successfully.",
        warnings: errors.length > 0 ? errors : undefined,
      });
    } catch (err: any) {
      console.error("[api/admin/remove-student exception]:", err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Failed to remove student account",
      });
    }
  });

  // API Endpoint: Admin Update Student Status (Suspend / Reactivate)
  app.all("/api/admin/update-student-status", async (req, res) => {
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, PATCH, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      return res.status(204).end();
    }
    const { requesterEmail, studentId, status } = req.body;

    const { user: tokenUser, isAdmin: isTokenAdmin } = await verifyAuthToken(req);
    const requestedBy = requesterEmail || tokenUser?.email || '';
    const isAdmin = isTokenAdmin || isAdminEmail(requestedBy);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Only administrators can change student status.",
      });
    }

    if (!studentId || !status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid parameters: studentId and valid status ('active' or 'suspended') are required.",
      });
    }

    try {
      if (getAuthClient(req || null)) {
        const updateRes = await supabaseServer
          .from("students")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", studentId)
          .select()
          .maybeSingle();

        if (updateRes.error) {
          console.error("[api/admin/update-student-status error]:", updateRes.error);
          return res.status(500).json({ success: false, error: updateRes.error.message });
        }

        return res.json({ success: true, status, profile: updateRes.data });
      }

      return res.json({ success: true, status });
    } catch (err: any) {
      console.error("[api/admin/update-student-status exception]:", err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Failed to update student status",
      });
    }
  });

  // API Endpoint: Admin Bulk Import MCQs into Supabase mcq_bank
  app.post("/api/admin/bulk-import-mcqs", async (req, res) => {
    const { requesterEmail, mcqs } = req.body || {};

    const { user: tokenUser, isAdmin: isTokenAdmin } = await verifyAuthToken(req);
    const requestedBy = requesterEmail || tokenUser?.email || '';
    const isAdmin = isTokenAdmin || isAdminEmail(requestedBy);

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Only administrators can bulk import MCQs.",
      });
    }

    if (!Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid payload: 'mcqs' must be a non-empty array.",
      });
    }

    try {
      const db = getSupabaseAdminClient() || supabaseServer;
      let insertedCount = 0;
      const errors: string[] = [];
      const chunkSize = 50;

      for (let i = 0; i < mcqs.length; i += chunkSize) {
        const batch = mcqs.slice(i, i + chunkSize);

        if (db) {
          const { data, error } = await db.from("mcq_bank").insert(batch).select();

          if (error) {
            console.warn(`[bulk-import-mcqs] Batch ${Math.floor(i / chunkSize) + 1} insert warning:`, error.message);
            errors.push(`Batch ${Math.floor(i / chunkSize) + 1}: ${error.message}`);
          } else {
            insertedCount += data ? data.length : batch.length;
          }
        }
      }

      if (insertedCount > 0 || errors.length === 0) {
        return res.status(200).json({
          success: true,
          insertedCount,
          message: `Successfully processed bulk import of ${insertedCount} MCQs into Supabase mcq_bank table.`,
          errors: errors.length > 0 ? errors : undefined,
        });
      }

      return res.status(500).json({
        success: false,
        insertedCount: 0,
        error: `Failed to insert MCQs into mcq_bank: ${errors.join("; ")}`,
      });
    } catch (err: any) {
      console.error("[api/admin/bulk-import-mcqs error]:", err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Internal server error during bulk import.",
      });
    }
  });


  // API Endpoint: Get Site Settings (Public)
  const handleGetSiteSettings = async (req: express.Request, res: express.Response) => {
    try {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      if (req.method === "OPTIONS") {
        return res.status(204).end();
      }
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ success: true, settings: { logo_url: "" } });
    } catch (err: any) {
      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ success: true, settings: { logo_url: "" } });
    }
  };

  app.all("/api/site-settings", handleGetSiteSettings);
  app.all("/api/settings/site", handleGetSiteSettings);

  // API Endpoint: Get In-depth Explanation for a question
  app.post("/api/explain-mcq", async (req, res) => {
    const { question, options, selectedOption, correctOption, subject, topic } = req.body;

    const userChoiceStr =
      selectedOption !== null && selectedOption !== undefined && options && options[selectedOption]
        ? options[selectedOption]
        : "Skipped";
    const correctChoiceStr = options && typeof correctOption === "number" && options[correctOption] ? options[correctOption] : "Correct Option";

    try {
      const ai = getGeminiClient();
      if (ai) {
        const explanationPrompt = `Provide a detailed academic explanation for the following multiple-choice question:
Subject: ${subject || "General"}
Topic: ${topic || "Core Concept"}
Question: ${question}
Options:
A) ${options?.[0] || "N/A"}
B) ${options?.[1] || "N/A"}
C) ${options?.[2] || "N/A"}
D) ${options?.[3] || "N/A"}

Correct Option: Option ${String.fromCharCode(65 + (correctOption || 0))} (${correctChoiceStr})
Student Selected: ${selectedOption !== null && selectedOption !== undefined ? `Option ${String.fromCharCode(65 + selectedOption)} (${userChoiceStr})` : "Skipped"}

Explain step-by-step in 3 clear bullet points:
1. Core Concept: Define the key law, principle, or formula.
2. Step-by-Step Solution: Show why Option ${String.fromCharCode(65 + (correctOption || 0))} is factually and logically correct.
3. Common Pitfall / Exam Tip: Explain why other options or common misconceptions are incorrect.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: explanationPrompt,
          config: {
            temperature: 0.1, // Low temperature for factual accuracy
          }
        });

        if (response.text) {
          return res.json({
            success: true,
            explanation: response.text.trim()
          });
        }
      }
    } catch (err: any) {
      console.warn("Gemini AI explanation error, using structured fallback:", err?.message || err);
    }

    return res.json({
      success: true,
      explanation: `1. Core Concept: This question evaluates key conceptual principles of ${subject || "this subject"} (${topic || "General Concepts"}).\n2. Solution: Option ${String.fromCharCode(65 + (correctOption || 0))} (${correctChoiceStr}) directly follows from standard textbook definitions and rules.\n3. Exam Tip: Double-check standard units and formulas when solving under time constraints.`
    });
  });

  // --- STUDY BUDDY RATE LIMITER & AI STREAMING ---
  const studyBuddyRateLimitMap = new Map<string, { count: number; resetTime: number }>();

  // Cleanup old rate limit records every 5 minutes to prevent memory leaks in long-running Node.js processes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of studyBuddyRateLimitMap.entries()) {
      if (now > record.resetTime) {
        studyBuddyRateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  function checkStudyBuddyRateLimit(ip: string): { allowed: boolean; message?: string } {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1-minute rolling window
    const maxRequestsPerMinute = 15; // Max 15 messages/explanations per minute per client IP

    const record = studyBuddyRateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      studyBuddyRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return { allowed: true };
    }

    if (record.count >= maxRequestsPerMinute) {
      return {
        allowed: false,
        message: "You've sent quite a few study questions recently! Please take a quick 1-minute breather before asking another question to protect study resources."
      };
    }

    record.count += 1;
    return { allowed: true };
  }

  const STUDY_BUDDY_SYSTEM_INSTRUCTION = `You are 'Study Buddy 🎓', an enthusiastic, student-friendly AI academic tutor for high school, MDCAT, TCAT, and board exam students in Pakistan.

STRICT SCOPE & ON-TOPIC MANDATE:
1. Academic Focus ONLY: You MUST ONLY answer questions related to school studies, board syllabi (FBISE / Provincial Boards), MDCAT, TCAT, entry test preparation, conceptual explanations, formulas, grammar, and multiple-choice questions for subjects like Physics, Chemistry, Biology, Mathematics, Computer Science, English, Urdu, Islamiat, Pakistan Studies, and General Science.
2. Non-Academic Redirection: If asked about ANYTHING non-academic or off-topic (e.g., movies, gaming, sports news, politics, personal gossip, general chit-chat, non-educational coding/entertainment), POLITELY refuse and redirect the student back to their studies. Example: "I'm Study Buddy, your AI study assistant! 🎓 I can only help with academic topics and exam preparation. Let's get back to your studies — what topic or question would you like help with?"
3. Simple & Concise: Keep answers clear, structured, concise, and easy to understand for high school and college students. Break down concepts into step-by-step bullet points with bold key terms. Avoid overly technical jargon or dry lectures.
4. Language Support: Primarily answer in clear, friendly English. If asked in Urdu or about Urdu/Islamiat subjects, respond clearly in simple Urdu/English as appropriate.
5. Absolute Accuracy: Ensure scientific principles, formulas, equations, and curriculum rules are 100% accurate.
6. Output Format & Math Rendering: Respond ONLY in plain, readable text with markdown formatting and standard LaTeX math notation. Wrap inline mathematical symbols, fractions, and variables in single dollar signs (e.g. $E = h\\nu$, $\\nu$, $\\Phi$, $v_{\\text{max}}$) and block/standalone equations in double dollar signs (e.g. $$K.E._{\\text{max}} = h\\nu - \\Phi$$ or $$\\frac{a}{b}$$). NEVER wrap your entire response in \`\`\`json code blocks or output raw JSON objects.`;

  // API Endpoint: Debug & Verify Gemini Configuration
  app.get("/api/debug-gemini", async (req, res) => {
    const key1 = getEnvVar("GEMINI_API_KEY");
    const key2 = getEnvVar("GEMINI_API_KEY_2");
    const keyVite = getEnvVar("VITE_GEMINI_API_KEY");
    const keyGoogle = getEnvVar("GOOGLE_API_KEY");

    const maskKey = (k: string) => (k ? `${k.substring(0, 4)}...${k.substring(Math.max(0, k.length - 4))} (len: ${k.length})` : "MISSING");

    const envDiagnostics = {
      GEMINI_API_KEY: maskKey(key1),
      GEMINI_API_KEY_2: maskKey(key2),
      VITE_GEMINI_API_KEY: maskKey(keyVite),
      GOOGLE_API_KEY: maskKey(keyGoogle),
      NODE_ENV: process.env.NODE_ENV || "development",
    };

    const apiKey = getGeminiApiKey();
    const ai = getGeminiClient();
    if (!ai || !apiKey) {
      return res.status(500).json({
        status: "error",
        message: "getGeminiClient() returned null - No valid API key found in environment bindings.",
        envDiagnostics,
      });
    }

    const modelsToTest = ["gemini-3.6-flash", "gemini-flash-latest"];
    const testResults: any[] = [];

    await withGeminiNativeAuth(apiKey, async () => {
      for (const modelName of modelsToTest) {
        const startTime = Date.now();
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: "Respond in exactly 5 words: 'Gemini AI is operational and ready.'",
          });
          const responseTimeMs = Date.now() - startTime;
          testResults.push({
            model: modelName,
            success: true,
            responseText: response.text,
            responseTimeMs,
          });
        } catch (err: any) {
          testResults.push({
            model: modelName,
            success: false,
            errorName: err?.name || "Error",
            errorMessage: err?.message || String(err),
            statusCode: err?.status || err?.statusCode || err?.code || 500,
            fullError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            responseTimeMs: Date.now() - startTime,
          });
        }
      }
    });

    const anySuccess = testResults.some((r) => r.success);
    return res.status(anySuccess ? 200 : 500).json({
      status: anySuccess ? "success" : "failure",
      envDiagnostics,
      testResults,
    });
  });

  // API Endpoint: Streaming AI Chatbot for Study Buddy
  app.post("/api/study-buddy/stream", async (req, res) => {
    const clientIp = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "client-default");
    const rateCheck = checkStudyBuddyRateLimit(clientIp);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!rateCheck.allowed) {
      res.write(`data: ${JSON.stringify({ error: rateCheck.message, rateLimited: true })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    const { messages = [], mcqContext, sessionContext, trackInfo } = req.body;

    try {
      const ai = getGeminiClient();
      if (!ai) {
        console.warn("[Study Buddy] Gemini API key missing or invalid.");
        res.write(`data: ${JSON.stringify({ error: "Gemini AI service is currently unavailable. Please verify API configuration." })}\n\n`);
        res.write(`data: [DONE]\n\n`);
        return res.end();
      }

      // Build track-aware and subject-aware dynamic system instruction
      const activeTrack = sessionContext?.track || trackInfo?.trackName || "FBISE / MDCAT / TCAT";
      const activeSubject = sessionContext?.subject || mcqContext?.subject || "Academic Subjects";
      const activeTopic = sessionContext?.topic || mcqContext?.topic || "";

      const dynamicSystemInstruction = `${STUDY_BUDDY_SYSTEM_INSTRUCTION}

ACTIVE STUDENT SESSION CONTEXT:
- Student Track/Exam: ${activeTrack}
- Current Subject Focus: ${activeSubject}${activeTopic ? ` (Topic: ${activeTopic})` : ''}

CONTEXT RETENTION INSTRUCTION:
Tailor all answers, formulas, practice tips, and explanations to match the student's active track (${activeTrack}) and subject (${activeSubject}). Maintain this context naturally in all session responses without forcing the student to re-specify their board or exam type.`;

      // Convert incoming message history to Gemini contents structure
      const rawContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(messages) && messages.length > 0) {
        for (const msg of messages) {
          if (msg && msg.text && typeof msg.text === "string" && msg.text.trim().length > 0) {
            const role = msg.role === "model" ? "model" : "user";
            rawContents.push({
              role,
              parts: [{ text: msg.text.trim() }],
            });
          }
        }
      }

      // Gemini requirement: contents MUST start with role 'user'
      while (rawContents.length > 0 && rawContents[0].role !== "user") {
        rawContents.shift();
      }

      // Merge consecutive messages with identical roles
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
      for (const item of rawContents) {
        if (contents.length > 0 && contents[contents.length - 1].role === item.role) {
          contents[contents.length - 1].parts[0].text += `\n${item.parts[0].text}`;
        } else {
          contents.push(item);
        }
      }

      // Fallback if no valid user message remains
      if (contents.length === 0) {
        contents.push({
          role: "user",
          parts: [{ text: "Hello Study Buddy! Please introduce yourself and explain how you can help me with my FBISE studies." }],
        });
      }

      // If MCQ Context is present and this is a fresh explanation request, frame in prompt
      if (mcqContext && mcqContext.question) {
        const optionLetters = ["A", "B", "C", "D"];
        const correctChoiceStr = mcqContext.options?.[mcqContext.correctOption] || "Correct Option";
        const userChoiceStr =
          mcqContext.selectedOption !== null && mcqContext.selectedOption !== undefined && mcqContext.options?.[mcqContext.selectedOption]
            ? mcqContext.options[mcqContext.selectedOption]
            : "Skipped";

        const contextHeader = `[MCQ Explanation Context]
Subject: ${mcqContext.subject || "FBISE Subject"}
Topic: ${mcqContext.topic || "Core Concept"}
Question: ${mcqContext.question}
Options: ${mcqContext.options?.map((opt: string, i: number) => `${optionLetters[i]}) ${opt}`).join(", ")}
Correct Answer: Option ${optionLetters[mcqContext.correctOption || 0]} (${correctChoiceStr})
Student Selected: ${userChoiceStr}

Please explain step-by-step why Option ${optionLetters[mcqContext.correctOption || 0]} is correct, why other choices or common mistakes are wrong, and provide a helpful study tip!`;

        const lastMsgText = contents[contents.length - 1].parts[0].text;
        if (!lastMsgText.includes(mcqContext.question)) {
          contents[contents.length - 1].parts[0].text = `${contextHeader}\n\n${lastMsgText}`;
        }
      }

      const apiKey = getGeminiApiKey();
      const keyPrefix = apiKey ? `${apiKey.substring(0, 10)}...` : "NONE";
      console.log(`[server.ts Study Buddy Request] Using GEMINI_API_KEY (first 10 chars): "${keyPrefix}" (length: ${apiKey.length})`);

      let streamSuccess = false;
      let lastErrMessage = "";
      let lastErrStatus = 500;

      if (apiKey) {
        const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];
        for (const modelName of modelsToTry) {
          if (streamSuccess) break;
          try {
            await withGeminiNativeAuth(apiKey, async () => {
              const responseStream = await ai.models.generateContentStream({
                model: modelName,
                contents,
                config: {
                  systemInstruction: dynamicSystemInstruction,
                  temperature: 0.2,
                  topP: 0.95,
                },
              });

              for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                  res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
                }
              }

              res.write(`data: [DONE]\n\n`);
              streamSuccess = true;
            });
          } catch (modelErr: any) {
            lastErrStatus = Number(modelErr?.status || modelErr?.statusCode || modelErr?.code) || 500;
            lastErrMessage = extractCleanErrorMessage(modelErr);
            console.warn(`[server.ts Study Buddy] Model ${modelName} stream failed (Status ${lastErrStatus}):`, lastErrMessage);
            console.warn("[RAW GOOGLE GEMINI ERROR]:", JSON.stringify(modelErr, Object.getOwnPropertyNames(modelErr), 2));
          }
        }
      }

      if (!streamSuccess) {
        const cleanMsg = lastErrMessage || (apiKey ? "Unable to connect to Gemini AI" : "Gemini API Key missing from server environment");
        const detailMsg = `Gemini API Error (Status ${lastErrStatus}): ${cleanMsg}`;
        console.warn("[server.ts Study Buddy Stream Error]:", detailMsg);
        res.write(`data: ${JSON.stringify({ error: detailMsg })}\n\n`);
        res.write(`data: [DONE]\n\n`);
      }

      return res.end();
    } catch (err: any) {
      console.warn("[api/study-buddy/stream route error]:", err);
      console.warn("[RAW GOOGLE GEMINI ROUTE ERROR]:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      const cleanMsg = extractCleanErrorMessage(err);
      const detailMsg = `Gemini API Error (Status ${err?.status || 500}): ${cleanMsg}`;
      res.write(`data: ${JSON.stringify({ error: detailMsg })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }
  });

  // Setup Multer for Express Drive Upload Endpoint
  const driveUploadMulter = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB Max
  });

  // API Endpoint: Google Drive Upload
  app.post("/api/drive-upload", driveUploadMulter.single("file"), async (req: express.Request, res: express.Response) => {
    try {
      const file = (req as any).file;
      if (!file) {
        return res.status(400).json({ success: false, error: "No file uploaded. Please include a file in the 'file' field." });
      }

      if (file.size > 15 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: "File size limit exceeded: Maximum allowed size is 15MB." });
      }

      const allowedMimePrefixes = ["image/"];
      const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
      const ext = (file.originalname || "").split(".").pop()?.toLowerCase();
      const isAllowedExt = ["pdf", "jpg", "jpeg", "png", "webp", "gif"].includes(ext || "");
      const isAllowedMime = allowedMimes.includes(file.mimetype) || allowedMimePrefixes.some(p => file.mimetype?.startsWith(p));

      if (!isAllowedExt && !isAllowedMime) {
        return res.status(400).json({
          success: false,
          error: "Invalid file type. Only PDF and Image files (JPG, PNG, WEBP, GIF) are accepted.",
        });
      }

      const accessToken = await getGoogleAccessToken(process.env);

      const SHARED_FOLDER_ID = "1Kb6pb7EKoS5mCWPI8tRPeG1rc3yqpMsv";
      const metadata = {
        name: file.originalname,
        parents: [SHARED_FOLDER_ID],
      };

      const boundary = "-------" + Math.random().toString(36).substring(2);
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const fileBuffer = file.buffer;
      const fileUint8 = new Uint8Array(fileBuffer);

      const encoder = new TextEncoder();
      const part1 = encoder.encode(
        `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n${delimiter}Content-Type: ${file.mimetype || "application/octet-stream"}\r\n\r\n`
      );
      const part2 = encoder.encode(closeDelimiter);

      const multipartBody = new Uint8Array(part1.length + fileUint8.length + part2.length);
      multipartBody.set(part1, 0);
      multipartBody.set(fileUint8, part1.length);
      multipartBody.set(part2, part1.length + fileUint8.length);

      const driveRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,createdTime",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        }
      );

      if (!driveRes.ok) {
        const errText = await driveRes.text();
        return res.status(500).json({ success: false, error: `Google Drive API upload failed (${driveRes.status}): ${errText}` });
      }

      const uploaded = await driveRes.json();
      return res.status(200).json({
        success: true,
        id: uploaded.id,
        name: uploaded.name,
        webViewLink: uploaded.webViewLink,
        webContentLink: uploaded.webContentLink,
        createdTime: uploaded.createdTime,
      });
    } catch (err: any) {
      console.error("[api/drive-upload error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Internal server error uploading file to Drive." });
    }
  });

  // API Endpoint: Google Drive List
  app.get("/api/drive-list", async (req: express.Request, res: express.Response) => {
    try {
      const accessToken = await getGoogleAccessToken(process.env);

      const SHARED_FOLDER_ID = "1Kb6pb7EKoS5mCWPI8tRPeG1rc3yqpMsv";
      const query = `'${SHARED_FOLDER_ID}' in parents and trashed = false`;
      const fields = "files(id,name,webViewLink,webContentLink,createdTime,mimeType,size)";
      const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=createdTime%20desc`;

      const driveRes = await fetch(driveUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!driveRes.ok) {
        const errText = await driveRes.text();
        return res.status(500).json({ success: false, error: `Google Drive API list failed (${driveRes.status}): ${errText}` });
      }

      const data = await driveRes.json();
      const files = (data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
        webContentLink: f.webContentLink || `https://drive.google.com/uc?id=${f.id}&export=download`,
        createdTime: f.createdTime,
        mimeType: f.mimeType,
        size: f.size,
      }));

      return res.status(200).json(files);
    } catch (err: any) {
      console.error("[api/drive-list error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Internal server error listing Drive files." });
    }
  });

  // Gmail SMTP Email Setup
  function getMailCredentials() {
    const user = (
      getEnvVar("EMAIL_USER") ||
      getEnvVar("GMAIL_USER") ||
      getEnvVar("SMTP_USER") ||
      getEnvVar("EMAIL_ADDRESS") ||
      getEnvVar("VITE_EMAIL_USER") ||
      ""
    ).trim();
    const pass = (
      getEnvVar("EMAIL_APP_PASSWORD") ||
      getEnvVar("GMAIL_APP_PASSWORD") ||
      getEnvVar("GMAIL_PASS") ||
      getEnvVar("SMTP_PASS") ||
      getEnvVar("EMAIL_PASS") ||
      getEnvVar("EMAIL_PASSWORD") ||
      ""
    ).trim();
    return { user, pass };
  }

  function getMailTransporter(): { transporter: nodemailer.Transporter | null; user: string; error?: string } {
    const { user, pass } = getMailCredentials();
    if (!user || !pass) {
      const missingKeys = [];
      if (!user) missingKeys.push("EMAIL_USER/GMAIL_USER/SMTP_USER");
      if (!pass) missingKeys.push("EMAIL_APP_PASSWORD/GMAIL_APP_PASSWORD/GMAIL_PASS/SMTP_PASS");
      return {
        transporter: null,
        user: "",
        error: `Missing environment variable(s): ${missingKeys.join(", ")}. Please set EMAIL_USER and EMAIL_APP_PASSWORD in environment variables.`,
      };
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user,
          pass,
        },
      });
      return { transporter, user };
    } catch (err: any) {
      console.error("[getMailTransporter Exception]:", err);
      return { transporter: null, user, error: err?.message || "Failed to initialize Nodemailer transporter." };
    }
  }

  async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<{ success: boolean; id?: string; error?: string }> {
    console.log(`[sendEmail Initiated] Target: ${to} | Subject: "${subject}"`);
    try {
      const { transporter, user, error: configError } = getMailTransporter();
      if (!transporter || configError) {
        console.error(`[sendEmail ERROR - Credentials Missing/Invalid]: ${configError}`);
        return { success: false, error: configError || "Gmail SMTP credentials not configured." };
      }

      const fromName = getEnvVar("EMAIL_FROM_NAME", "Boardly Support");
      const from = `"${fromName}" <${user}>`;

      console.log(`[sendEmail SMTP Sending] From: ${from} -> To: ${to}`);

      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log(`[sendEmail SUCCESS] Message ID: ${info.messageId} | Response: ${info.response || 'OK'} | To: ${to}`);
      return { success: true, id: info.messageId };
    } catch (err: any) {
      console.error(`[sendEmail EXCEPTION (Gmail SMTP Failure)] To: ${to}:`, err);
      const errorMessage = err?.message || String(err);
      return { success: false, error: `Gmail SMTP Send Failed: ${errorMessage}` };
    }
  }

  // API Endpoint to send test email using Gmail SMTP credentials
  app.post("/api/test-email", async (req: express.Request, res: express.Response) => {
    try {
      const { to, subject, message } = req.body || {};
      const targetEmail = to || getEnvVar("EMAIL_USER");
      if (!targetEmail) {
        return res.status(400).json({ success: false, error: "Missing target email ('to') and EMAIL_USER environment variable is not set." });
      }

      const emailSubject = subject || "Boardly Test Email - Gmail SMTP";
      const emailContent = `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2>Boardly Gmail SMTP Test Email</h2>
          <p>${message || "This is a test email sent from Boardly using Gmail SMTP (EMAIL_USER & EMAIL_APP_PASSWORD)."}</p>
          <hr />
          <p style="font-size: 12px; color: #666;">Sent at ${new Date().toISOString()}</p>
        </div>
      `;

      const result = await sendEmail({
        to: targetEmail,
        subject: emailSubject,
        html: emailContent,
      });

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      return res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${targetEmail}`,
        id: result.id,
      });
    } catch (err: any) {
      console.error("[api/test-email Error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Internal error sending test email." });
    }
  });

  // HTML Email Templates
  function generateSubmissionConfirmationEmail({ name, method, amount, date }: { name: string; method: string; amount: string | number; date: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
          .body { padding: 28px 24px; }
          .card { background: #f1f5f9; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0; }
          .card-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; }
          .row span.label { color: #64748b; }
          .row span.value { font-weight: 700; color: #0f172a; }
          .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Boardly Learning Platform</h1>
            <p>Payment Verification Received</p>
          </div>
          <div class="body">
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Thanks for your payment, ${name}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              We have successfully received your payment confirmation screenshot. Our verification team is reviewing your details to grant you full premium access.
            </p>
            <div class="card">
              <div class="card-title">Payment Summary</div>
              <div class="row"><span class="label">Payment Method:</span> <span class="value">${method}</span></div>
              <div class="row"><span class="label">Amount Paid:</span> <span class="value">PKR ${amount}</span></div>
              <div class="row"><span class="label">Submitted On:</span> <span class="value">${date}</span></div>
              <div class="row"><span class="label">Status:</span> <span class="value"><span class="badge">⏳ Under Review</span></span></div>
            </div>
            <p style="font-size: 13px; line-height: 1.5; color: #475569;">
              We typically verify payments within <strong>2–4 hours</strong>. As soon as your proof is confirmed, you will receive another email notifying you that your premium access is active!
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Boardly. All rights reserved.<br>Need help? Contact support via your student dashboard.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function generatePaymentApprovedEmail({ name, method, amount }: { name: string; method: string; amount: string | number }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
          .body { padding: 28px 24px; }
          .badge-success { background: #d1fae5; color: #065f46; padding: 6px 14px; border-radius: 9999px; font-weight: 800; font-size: 13px; display: inline-block; margin-bottom: 16px; }
          .features { background: #f8fafc; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0; }
          .features ul { margin: 8px 0 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.7; }
          .btn { display: block; width: 100%; text-align: center; background: #059669; color: #ffffff; text-decoration: none; padding: 12px 0; border-radius: 10px; font-weight: 700; font-size: 14px; margin-top: 24px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Boardly Premium Access</h1>
            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Your Access is Confirmed!</p>
          </div>
          <div class="body">
            <span class="badge-success">✓ Payment Verified & Approved</span>
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Welcome to Boardly Premium, ${name}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Your payment of <strong>PKR ${amount}</strong> via <strong>${method}</strong> has been verified by our team. Your account is now upgraded to <strong>Boardly Premium Access</strong>!
            </p>
            <div class="features">
              <strong style="font-size: 13px; color: #0f172a;">What's Unlocked for You:</strong>
              <ul>
                <li>Unlimited MDCAT &amp; Federal Board Practice Tests</li>
                <li>AI Study Buddy Instant Step-by-Step Explanations</li>
                <li>Chapter-wise Analytics &amp; Weakness Tracking</li>
                <li>Full Past Papers &amp; Printable Test Generation</li>
              </ul>
            </div>
            <p style="font-size: 13px; color: #475569;">
              Log in to your Boardly dashboard right away to start practicing!
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Boardly. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function generatePaymentRejectedEmail({ name, method, amount, adminNote }: { name: string; method: string; amount: string | number; adminNote?: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
          .body { padding: 28px 24px; }
          .reason-box { background: #fff1f2; border-left: 4px solid #e11d48; padding: 14px; border-radius: 6px; margin: 18px 0; font-size: 13px; color: #881337; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Boardly Support</h1>
            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Payment Verification Update</p>
          </div>
          <div class="body">
            <h2 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 0;">Hello ${name},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              We reviewed your recent payment submission of <strong>PKR ${amount}</strong> via <strong>${method}</strong>, but unfortunately, we could not verify the details provided.
            </p>
            <div class="reason-box">
              <strong>Reason from Reviewer:</strong><br>
              ${adminNote || 'Transaction reference or payment screenshot could not be confirmed.'}
            </div>
            <p style="font-size: 13px; line-height: 1.5; color: #475569;">
              Don't worry! You can easily re-submit a clear screenshot of your payment receipt or double-check your transaction ID in your Boardly student profile.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Boardly. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function generateAdminPaymentNotificationEmail({ name, email, method, amount, date, transactionRef, driveUrl }: { name: string; email: string; method: string; amount: string | number; date: string; transactionRef?: string; driveUrl?: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #f59e0b; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; }
          .body { padding: 24px; }
          .card { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e2e8f0; }
          .row { margin-bottom: 8px; font-size: 13px; }
          .label { font-weight: 700; color: #475569; }
          .value { color: #0f172a; }
          .btn { display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Boardly Admin Alert</h1>
            <p style="margin: 4px 0 0; color: #cbd5e1; font-size: 13px;">New Payment Verification Proof Submitted</p>
          </div>
          <div class="body">
            <h2 style="font-size: 16px; margin-top: 0; color: #0f172a;">New Student Payment Proof</h2>
            <div class="card">
              <div class="row"><span class="label">Student Name:</span> <span class="value">${name}</span></div>
              <div class="row"><span class="label">Student Email:</span> <span class="value">${email}</span></div>
              <div class="row"><span class="label">Payment Method:</span> <span class="value">${method}</span></div>
              <div class="row"><span class="label">Amount Paid:</span> <span class="value">PKR ${amount}</span></div>
              <div class="row"><span class="label">Transaction Ref:</span> <span class="value">${transactionRef || 'N/A'}</span></div>
              <div class="row"><span class="label">Submitted At:</span> <span class="value">${date}</span></div>
            </div>
            ${driveUrl ? `<a href="${driveUrl}" class="btn" target="_blank">View Screenshot on Google Drive</a>` : ''}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  function generateWelcomeEmail({ name, email }: { name: string; email: string }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #f59e0b; }
          .body { padding: 28px 24px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding: 16px 24px; background: #f8fafc; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Boardly!</h1>
            <p style="margin: 4px 0 0; color: #cbd5e1; font-size: 13px;">Pakistan's Premier Exam Prep Platform</p>
          </div>
          <div class="body">
            <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0;">Welcome aboard, ${name}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Thank you for signing up for Boardly (${email}). We are thrilled to accompany you on your exam preparation journey for MDCAT, TCAT, Federal Board, and Provincial Board exams.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              You can start taking practice tests, generating custom MCQs, and studying with our AI Study Buddy immediately.
            </p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Boardly. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // API Endpoint: Send Welcome Email
  app.post("/api/send-welcome-email", async (req: express.Request, res: express.Response) => {
    try {
      const { name, email } = req.body || {};
      if (!email) {
        return res.status(400).json({ success: false, error: "Student email is required." });
      }
      const html = generateWelcomeEmail({ name: name || "Student", email });
      const sendRes = await sendEmail({
        to: email,
        subject: "Welcome to Boardly - Your Exam Prep Journey Begins!",
        html,
      });
      return res.status(200).json({ success: sendRes.success, error: sendRes.error });
    } catch (err: any) {
      console.error("[api/send-welcome-email error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Error sending welcome email." });
    }
  });

  // API Endpoint: Submit Payment Proof
  app.post("/api/payment-requests/submit", driveUploadMulter.single("file"), async (req: express.Request, res: express.Response) => {
    try {
      const file = (req as any).file;
      const { student_id, student_name, student_email, payment_method, amount, transaction_reference } = req.body || {};

      if (!student_id || !student_email || !payment_method || !amount) {
        return res.status(400).json({ success: false, error: "Missing required fields: student_id, student_email, payment_method, amount." });
      }

      if (!file) {
        return res.status(400).json({ success: false, error: "Payment screenshot file is required." });
      }

      const keyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
      if (!keyRaw) {
        return res.status(400).json({
          success: false,
          error: "GOOGLE_SERVICE_ACCOUNT_KEY is missing in server environment variables. Please add your Google Service Account JSON key to environment variables to enable Google Drive screenshot uploads."
        });
      }

      let driveFileId = "";
      let driveFileUrl = "";

      // Upload to Google Drive
      try {
        const accessToken = await getGoogleAccessToken(process.env);
        const SHARED_FOLDER_ID = getEnvVar("GOOGLE_DRIVE_FOLDER_ID", "1Kb6pb7EKoS5mCWPI8tRPeG1rc3yqpMsv");
        const metadata = {
          name: `PaymentProof_${student_name || 'Student'}_${Date.now()}_${file.originalname || 'proof.png'}`,
          parents: [SHARED_FOLDER_ID],
        };

        const boundary = "-------" + Math.random().toString(36).substring(2);
        const delimiter = `\r\n--${boundary}\r\n`;
        const closeDelimiter = `\r\n--${boundary}--`;

        const fileBuffer = file.buffer;
        const fileUint8 = new Uint8Array(fileBuffer);

        const encoder = new TextEncoder();
        const part1 = encoder.encode(
          `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n${delimiter}Content-Type: ${file.mimetype || "image/png"}\r\n\r\n`
        );
        const part2 = encoder.encode(closeDelimiter);

        const multipartBody = new Uint8Array(part1.length + fileUint8.length + part2.length);
        multipartBody.set(part1, 0);
        multipartBody.set(fileUint8, part1.length);
        multipartBody.set(part2, part1.length + fileUint8.length);

        const driveRes = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": `multipart/related; boundary=${boundary}`,
            },
            body: multipartBody,
          }
        );

        if (driveRes.ok) {
          const uploaded = await driveRes.json();
          driveFileId = uploaded.id;
          driveFileUrl = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.id}/view`;
        } else {
          const errText = await driveRes.text();
          console.error("[Drive API Upload Error]:", errText);
          return res.status(500).json({
            success: false,
            error: `Google Drive upload failed (${driveRes.status}): ${errText}`
          });
        }
      } catch (driveErr: any) {
        console.error("[Drive Upload Exception]:", driveErr);
        return res.status(500).json({
          success: false,
          error: `Google Drive Upload Exception: ${driveErr?.message || driveErr}`
        });
      }

      const supabaseAdmin = getSupabaseAdminClient() || getAuthClient(req);
      const newRecord = {
        student_id: String(student_id),
        student_name: String(student_name || 'Student'),
        student_email: String(student_email).toLowerCase().trim(),
        payment_method: String(payment_method),
        amount: Number(amount) || amount,
        drive_file_id: driveFileId,
        drive_file_url: driveFileUrl,
        transaction_reference: String(transaction_reference || '').trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
      };

      let insertedData = newRecord;
      if (supabaseAdmin) {
        const { data, error } = await supabaseAdmin
          .from('payment_requests')
          .insert(newRecord)
          .select('*')
          .single();

        if (error) {
          console.error("[Supabase Insert Error payment_requests]:", error);
          return res.status(500).json({
            success: false,
            error: `Database save failed: ${error.message}`
          });
        } else if (data) {
          insertedData = data;
        }

        // Update student profile payment status to Pending Verification
        try {
          await supabaseAdmin
            .from('students')
            .update({
              payment_status: 'Pending Verification',
              requires_payment: true,
              updated_at: new Date().toISOString(),
            })
            .or(`id.eq.${student_id},email.eq.${student_email}`);
        } catch (stErr) {
          console.warn("[Error updating student payment_status on proof upload]:", stErr);
        }
      }

      // 1) Send Student Confirmation Email
      const studentEmailHtml = generateSubmissionConfirmationEmail({
        name: newRecord.student_name,
        method: newRecord.payment_method,
        amount: newRecord.amount,
        date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      });

      console.log(`[api/payment-requests/submit] Sending student confirmation email to: ${newRecord.student_email}...`);
      const studentEmailRes = await sendEmail({
        to: newRecord.student_email,
        subject: "Payment Proof Received - Boardly Premium Access",
        html: studentEmailHtml,
      });

      if (!studentEmailRes.success) {
        console.error(`[api/payment-requests/submit] Student email failed for ${newRecord.student_email}:`, studentEmailRes.error);
      }

      // 2) Send Admin Notification Email
      const adminEmailHtml = generateAdminPaymentNotificationEmail({
        name: newRecord.student_name,
        email: newRecord.student_email,
        method: newRecord.payment_method,
        amount: newRecord.amount,
        date: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        transactionRef: newRecord.transaction_reference,
        driveUrl: driveFileUrl,
      });

      console.log(`[api/payment-requests/submit] Sending admin notification email to: shsvirtualadmin@gmail.com...`);
      const adminEmailRes = await sendEmail({
        to: "shsvirtualadmin@gmail.com",
        subject: `[NEW PAYMENT PROOF] ${newRecord.student_name} (${newRecord.student_email})`,
        html: adminEmailHtml,
      });

      if (!adminEmailRes.success) {
        console.error(`[api/payment-requests/submit] Admin notification email failed:`, adminEmailRes.error);
      }

      return res.status(200).json({
        success: true,
        data: insertedData,
        driveFileUrl,
        emailsSent: {
          student: studentEmailRes.success,
          admin: adminEmailRes.success,
          studentError: studentEmailRes.error || null,
          adminError: adminEmailRes.error || null,
        }
      });
    } catch (err: any) {
      console.error("[api/payment-requests/submit error]:", err);
      return res.status(500).json({ success: false, error: err?.message || "Internal server error submitting payment proof." });
    }
  });

  // API Endpoint: Get Student Payment Requests
  app.get("/api/payment-requests/student/:student_id", async (req: express.Request, res: express.Response) => {
    try {
      const studentId = req.params.student_id;
      const supabaseAdmin = getSupabaseAdminClient() || getAuthClient(req);

      if (!supabaseAdmin) {
        return res.status(200).json({ success: true, requests: [] });
      }

      const { data, error } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching student payment requests:", error);
        return res.status(200).json({ success: true, requests: [] });
      }

      return res.status(200).json({ success: true, requests: data || [] });
    } catch (err: any) {
      console.error("Error in get student payment requests:", err);
      return res.status(500).json({ success: false, error: err?.message || "Server error" });
    }
  });

  // API Endpoint: Admin Fetch All Payment Requests
  app.get("/api/admin/payment-requests", async (req: express.Request, res: express.Response) => {
    try {
      const supabaseAdmin = getSupabaseAdminClient() || getAuthClient(req);

      if (!supabaseAdmin) {
        return res.status(200).json({ success: true, requests: [] });
      }

      const { data, error } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching all payment requests:", error);
        return res.status(200).json({ success: true, requests: [] });
      }

      return res.status(200).json({ success: true, requests: data || [] });
    } catch (err: any) {
      console.error("Error in admin fetch payment requests:", err);
      return res.status(500).json({ success: false, error: err?.message || "Server error" });
    }
  });

  // API Endpoint: Admin Review Payment Request (Approve / Reject)
  app.post("/api/admin/payment-requests/review", async (req: express.Request, res: express.Response) => {
    try {
      const { requestId, status, adminNote, reviewerEmail } = req.body || {};

      if (!requestId || !status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid parameters. Required: requestId, status ('approved'|'rejected')." });
      }

      const supabaseAdmin = getSupabaseAdminClient() || getAuthClient(req);

      if (!supabaseAdmin) {
        return res.status(500).json({ success: false, error: "Database client unavailable." });
      }

      // 1. Fetch current payment request
      const { data: requestRow, error: fetchErr } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchErr || !requestRow) {
        return res.status(404).json({ success: false, error: "Payment request record not found." });
      }

      // 2. Update payment request status
      const { error: updateErr } = await supabaseAdmin
        .from('payment_requests')
        .update({
          status,
          admin_note: adminNote || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerEmail || 'shsvirtualadmin@gmail.com',
        })
        .eq('id', requestId);

      if (updateErr) {
        console.error("Error updating payment request:", updateErr);
        return res.status(500).json({ success: false, error: updateErr.message });
      }

      // 3. If approved, upgrade student status in Supabase
      if (status === 'approved') {
        const studentId = requestRow.student_id;
        const studentEmail = requestRow.student_email;

        await supabaseAdmin
          .from('students')
          .update({
            payment_status: 'Verified & Paid',
            requires_payment: false,
            package_name: 'Boardly Premium Access',
            status: 'active',
            access_expires: new Date(Date.now() + 365 * 24 * 3600 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            updated_at: new Date().toISOString(),
          })
          .or(`id.eq.${studentId},email.eq.${studentEmail}`);

        // Send Approval Email
        const appEmail = generatePaymentApprovedEmail({
          name: requestRow.student_name || 'Student',
          method: requestRow.payment_method,
          amount: requestRow.amount,
        });

        sendEmail({
          to: studentEmail,
          subject: "Payment Approved! Premium Access Active - Boardly",
          html: appEmail,
        }).catch(e => console.error("Error sending approval email:", e));
      } else {
        const studentId = requestRow.student_id;
        const studentEmail = requestRow.student_email;

        try {
          await supabaseAdmin
            .from('students')
            .update({
              payment_status: 'Rejected',
              requires_payment: true,
              updated_at: new Date().toISOString(),
            })
            .or(`id.eq.${studentId},email.eq.${studentEmail}`);
        } catch (rejErr) {
          console.warn("[Error updating student payment_status on rejection]:", rejErr);
        }

        // Send Rejection Email
        const rejEmail = generatePaymentRejectedEmail({
          name: requestRow.student_name || 'Student',
          method: requestRow.payment_method,
          amount: requestRow.amount,
          adminNote,
        });

        sendEmail({
          to: requestRow.student_email,
          subject: "Update Regarding Your Payment Request - Boardly",
          html: rejEmail,
        }).catch(e => console.error("Error sending rejection email:", e));
      }

      // Record Activity Log on payment request review
      const logRecord = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        admin_email: reviewerEmail || 'shsvirtualadmin@gmail.com',
        target_student_id: requestRow.student_id,
        target_student_name: requestRow.student_name || 'Student',
        target_student_email: requestRow.student_email,
        action_type: status === 'approved' ? 'payment_approved' : 'payment_rejected',
        old_plan: 'Pending Verification',
        new_plan: status === 'approved' ? 'Verified & Paid (Boardly Premium)' : 'Payment Rejected',
        note: adminNote || (status === 'approved' ? `Approved manual payment of PKR ${requestRow.amount}` : 'Rejected payment submission'),
        created_at: new Date().toISOString(),
      };
      try {
        await supabaseAdmin.from('admin_activity_logs').insert([logRecord]);
      } catch (logErr) {
        console.warn("Notice: admin_activity_logs table insert skipped, saving in memory:", logErr);
      }
      memoryActivityLogs.unshift(logRecord);

      return res.status(200).json({
        success: true,
        message: status === 'approved' ? 'Payment request approved and student upgraded to Premium!' : 'Payment request rejected.',
      });
    } catch (err: any) {
      console.error("Error reviewing payment request:", err);
      return res.status(500).json({ success: false, error: err?.message || "Internal server error reviewing payment request." });
    }
  });

  // In-memory activity logs store fallback
  const memoryActivityLogs: Array<{
    id: string;
    admin_email: string;
    target_student_id: string;
    target_student_name: string;
    target_student_email: string;
    action_type: string;
    old_plan: string;
    new_plan: string;
    note?: string;
    created_at: string;
  }> = [];

  // API Endpoint: Admin Manual Plan Change (Grant / Change Student Subscription Plan)
  app.post("/api/admin/update-student-plan", async (req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const {
        studentId,
        studentEmail,
        subscribedPlans,
        packageName,
        paymentStatus = 'Verified & Paid',
        expirationMonths = 12,
        adminNote,
        adminEmail
      } = req.body || {};

      // Server-side strict authorization check: Admin role verification
      const { user: tokenUser, isAdmin: isTokenAdmin } = await verifyAuthToken(req);
      const requestedByEmail = (adminEmail || tokenUser?.email || "").trim().toLowerCase();
      const isAdmin = isTokenAdmin || isAdminEmail(requestedByEmail);

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Forbidden: Manual plan changes are strictly restricted to authorized administrators."
        });
      }

      if ((!studentId && !studentEmail) || !Array.isArray(subscribedPlans) || !packageName) {
        return res.status(400).json({
          success: false,
          error: "Invalid request parameters. Required: studentId or studentEmail, subscribedPlans (array), packageName."
        });
      }

      const supabaseAdmin = getSupabaseAdminClient() || getAuthClient(req);
      if (!supabaseAdmin) {
        return res.status(500).json({ success: false, error: "Database client unavailable." });
      }

      // Fetch existing student profile to get old plan details
      let query = supabaseAdmin.from('students').select('*');
      if (studentId) {
        query = query.eq('id', studentId);
      } else {
        query = query.eq('email', studentEmail);
      }

      const { data: existingStudents, error: fetchErr } = await query;
      const currentStudent = existingStudents && existingStudents[0];

      if (fetchErr || !currentStudent) {
        return res.status(404).json({ success: false, error: "Student record not found." });
      }

      const oldPlan = currentStudent.package_name || (currentStudent.subscribed_plans && currentStudent.subscribed_plans.join(', ')) || 'Free Plan';
      
      // Calculate expiration date
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + Number(expirationMonths));
      const accessExpiresStr = expDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Determine payment gating flags
      const isFree = subscribedPlans.includes('free') && subscribedPlans.length === 1;
      const finalPaymentStatus = isFree ? 'Free Plan' : paymentStatus;
      const finalRequiresPayment = isFree;

      const planData = {
        subscribed_plans: subscribedPlans,
        package_name: packageName,
        payment_status: finalPaymentStatus,
        requires_payment: finalRequiresPayment,
        status: 'active',
        access_expires: accessExpiresStr,
        updated_at: new Date().toISOString(),
      };

      let updatedStudent = { ...currentStudent, ...planData };

      // Attempt to update Supabase students table safely
      try {
        const { data: updatedStudentData, error: updateErr } = await supabaseAdmin
          .from('students')
          .update(planData)
          .eq('id', currentStudent.id)
          .select();

        if (updateErr) {
          console.warn("[api/admin/update-student-plan] Supabase update warning (column missing or schema restriction):", updateErr.message);
          // Fallback: try updating only standard updated_at column
          await supabaseAdmin
            .from('students')
            .update({ updated_at: planData.updated_at })
            .eq('id', currentStudent.id);
        } else if (updatedStudentData && updatedStudentData[0]) {
          updatedStudent = { ...updatedStudentData[0], ...planData };
        }
      } catch (dbErr: any) {
        console.warn("[api/admin/update-student-plan] Supabase update exception:", dbErr?.message || dbErr);
      }

      // Record Activity Log
      const logRecord = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        admin_email: requestedByEmail || 'shsvirtualadmin@gmail.com',
        target_student_id: currentStudent.id,
        target_student_name: currentStudent.name || 'Student',
        target_student_email: currentStudent.email,
        action_type: 'manual_plan_change',
        old_plan: oldPlan,
        new_plan: packageName,
        note: adminNote || 'Manual subscription plan override by administrator',
        created_at: new Date().toISOString(),
      };

      try {
        await supabaseAdmin.from('admin_activity_logs').insert([logRecord]);
      } catch (logErr) {
        console.warn("Notice: admin_activity_logs table insert skipped, saving in memory:", logErr);
      }
      memoryActivityLogs.unshift(logRecord);

      return res.status(200).json({
        success: true,
        message: `Plan successfully updated to "${packageName}" for ${currentStudent.name || 'Student'}!`,
        profile: updatedStudent
      });
    } catch (err: any) {
      console.error("Error updating student plan:", err);
      return res.status(500).json({ success: false, error: err?.message || "Internal server error." });
    }
  });

  // API Endpoint: Admin Fetch Activity Logs
  app.get("/api/admin/activity-logs", async (req: express.Request, res: express.Response) => {
    try {
      const requesterEmail = (req.query.adminEmail as string) || '';
      const { user: tokenUser, isAdmin: isTokenAdmin } = await verifyAuthToken(req);
      const requestedBy = requesterEmail || tokenUser?.email || '';
      const isAdmin = isTokenAdmin || isAdminEmail(requestedBy);
      
      if (!isAdmin) {
        return res.status(403).json({ success: false, error: "Forbidden: Admin activity logs restricted to authorized administrators." });
      }

      const supabaseAdmin = getSupabaseAdminClient() || getAuthClient(req);
      let logs: any[] = [];

      if (supabaseAdmin) {
        try {
          const { data, error } = await supabaseAdmin
            .from('admin_activity_logs')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && Array.isArray(data) && data.length > 0) {
            logs = data;
          }
        } catch {
          // table might not exist yet, fallback to in-memory
        }
      }

      // Merge memory logs if table returned fewer or fallback
      const combinedLogs = [...logs];
      for (const mLog of memoryActivityLogs) {
        if (!combinedLogs.some(l => l.id === mLog.id)) {
          combinedLogs.push(mLog);
        }
      }

      combinedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return res.status(200).json({ success: true, logs: combinedLogs });
    } catch (err: any) {
      console.error("Error fetching admin activity logs:", err);
      return res.status(500).json({ success: false, error: err?.message || "Server error" });
    }
  });


  // Vite middleware for development

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SHS Virtual Academy MCQs Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
