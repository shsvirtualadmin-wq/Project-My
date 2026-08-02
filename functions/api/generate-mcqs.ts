import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
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

export interface SharedCustomTopic {
  id?: string;
  subject: string;
  topicName: string;
  topicKey: string;
  createdAt?: string;
}

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
  if (lower.includes("logic") || lower.includes("reasoning")) return "Logical Reasoning";
  if (lower.includes("urdu")) return "Urdu";
  if (lower.includes("islam") || lower.includes("din")) return "Islamiat";
  if (lower.includes("pakistan") || lower.includes("pak")) return "Pakistan Studies";

  return clean;
}

function normalizeTopicNameServer(inputTopic: string): { displayName: string; topicKey: string } {
  if (!inputTopic || typeof inputTopic !== 'string') {
    return { displayName: '', topicKey: '' };
  }
  const trimmed = inputTopic.trim().replace(/\s+/g, ' ');
  const topicKey = trimmed.toLowerCase();
  let displayName = trimmed;
  if (trimmed === trimmed.toLowerCase()) {
    displayName = trimmed.replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return { displayName, topicKey };
}

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

function createSupabaseServerClient(env: Record<string, string | undefined>, authHeader?: string | null) {
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL || "https://wbvzbbnapowwmrjecdyt.supabase.co";
  const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;

  if (authHeader) {
    return createClient(url, key, {
      global: {
        headers: { Authorization: authHeader },
      },
    });
  }
  return createClient(url, key);
}

// Memory fallback store for workers
const inMemoryUsageStore: Record<string, Record<string, number>> = {};

async function getStudentMonthlyUsage(
  supabaseClient: any,
  userId: string,
  userEmail?: string
): Promise<number> {
  const period = getCurrentMonthPeriod();

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('student_mcq_usage')
        .select('count')
        .eq('student_id', userId)
        .eq('month_period', period)
        .maybeSingle();

      if (!error && data && typeof data.count === 'number') {
        if (!inMemoryUsageStore[period]) inMemoryUsageStore[period] = {};
        inMemoryUsageStore[period][userId] = data.count;
        return data.count;
      }
    } catch (err) {
      console.warn("[getStudentMonthlyUsage error]:", err);
    }
  }

  if (!inMemoryUsageStore[period]) inMemoryUsageStore[period] = {};
  return inMemoryUsageStore[period][userId] || 0;
}

async function incrementStudentMonthlyUsage(
  supabaseClient: any,
  userId: string,
  userEmail: string | undefined,
  addCount: number
): Promise<number> {
  const period = getCurrentMonthPeriod();
  const currentCount = await getStudentMonthlyUsage(supabaseClient, userId, userEmail);
  const newCount = currentCount + addCount;

  if (!inMemoryUsageStore[period]) inMemoryUsageStore[period] = {};
  inMemoryUsageStore[period][userId] = newCount;

  if (supabaseClient) {
    try {
      const { data: existing } = await supabaseClient
        .from('student_mcq_usage')
        .select('id, count')
        .eq('student_id', userId)
        .eq('month_period', period)
        .maybeSingle();

      if (existing && existing.id) {
        await supabaseClient
          .from('student_mcq_usage')
          .update({
            count: newCount,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        const { error: insertErr } = await supabaseClient
          .from('student_mcq_usage')
          .insert({
            student_id: userId,
            student_email: userEmail || '',
            month_period: period,
            count: newCount,
            updated_at: new Date().toISOString(),
          });

        if (insertErr) {
          await supabaseClient.from('student_mcq_usage').upsert({
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
    } catch (err) {
      console.warn("[incrementStudentMonthlyUsage error]:", err);
    }
  }

  return newCount;
}

async function saveSharedCustomTopic(supabaseClient: any, subject: string, rawTopicName: string) {
  const { displayName, topicKey } = normalizeTopicNameServer(rawTopicName);
  if (!topicKey) return { success: false, topicName: '' };

  const normSubKey = normalizeSubjectKey(subject || "Physics").toLowerCase();

  if (supabaseClient) {
    try {
      await supabaseClient.from('shared_custom_topics').upsert({
        subject: normSubKey,
        topic_name: displayName,
        topic_key: topicKey,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'subject,topic_key'
      });
    } catch (err: any) {
      console.warn('[saveSharedCustomTopic error]:', err?.message || err);
    }
  }

  return { success: true, topicName: displayName };
}

async function getCachedMcqs(supabaseClient: any, subject: string, rawTopicName: string, classNum: number = 11): Promise<any[] | null> {
  const { topicKey } = normalizeTopicNameServer(rawTopicName);
  if (!topicKey || topicKey === 'all topics') return null;

  const normSubKey = normalizeSubjectKey(subject || "Physics").toLowerCase();

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('shared_mcq_cache')
        .select('questions, topic')
        .ilike('subject', normSubKey)
        .eq('topic_key', topicKey)
        .maybeSingle();

      if (!error && data && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions;
      }
    } catch (err: any) {
      console.warn('[getCachedMcqs error]:', err?.message || err);
    }
  }

  return null;
}

async function saveMcqsToCache(supabaseClient: any, subject: string, rawTopicName: string, questions: any[], classNum: number = 11): Promise<boolean> {
  const { displayName, topicKey } = normalizeTopicNameServer(rawTopicName);
  if (!topicKey || !Array.isArray(questions) || questions.length === 0) return false;

  const normSubKey = normalizeSubjectKey(subject || "Physics").toLowerCase();

  if (supabaseClient) {
    try {
      await supabaseClient.from('shared_mcq_cache').upsert({
        subject: normSubKey,
        topic: displayName,
        topic_key: topicKey,
        class_num: classNum,
        questions,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'subject,topic_key'
      });
    } catch (err: any) {
      console.warn('[saveMcqsToCache error]:', err?.message || err);
    }
  }

  return true;
}

async function getStudentWeaknessProfile(supabaseClient: any, studentId: string, subject?: string) {
  const normSub = subject ? normalizeSubjectKey(subject) : undefined;
  if (!supabaseClient || !studentId) return null;

  try {
    let query = supabaseClient
      .from("mcq_attempts")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });

    if (normSub) {
      query = query.eq("subject", normSub);
    }

    const { data, error } = await query;
    if (error || !Array.isArray(data) || data.length === 0) return null;

    const targetSub = normSub || data[0]?.subject || "Mathematics";
    const totalAttempts = data.length;
    const correctAttempts = data.filter((a: any) => a.is_correct).length;
    const overallAccuracy = Math.round((correctAttempts / totalAttempts) * 100);
    const totalTime = data.reduce((sum: number, a: any) => sum + (a.time_taken_seconds || 15), 0);
    const avgTimePerQuestionSeconds = Math.round(totalTime / totalAttempts);

    const chapterMap: Record<string, { total: number; correct: number; totalTime: number }> = {};
    for (const item of data) {
      const ch = item.chapter || "General Concepts";
      if (!chapterMap[ch]) chapterMap[ch] = { total: 0, correct: 0, totalTime: 0 };
      chapterMap[ch].total += 1;
      if (item.is_correct) chapterMap[ch].correct += 1;
      chapterMap[ch].totalTime += item.time_taken_seconds || 15;
    }

    const chapterStats = Object.keys(chapterMap).map((ch) => {
      const c = chapterMap[ch];
      return {
        chapter: ch,
        total: c.total,
        correct: c.correct,
        accuracy: Math.round((c.correct / c.total) * 100),
        avgTime: Math.round(c.totalTime / c.total),
      };
    });

    chapterStats.sort((a, b) => a.accuracy - b.accuracy);
    const weakestTopics = chapterStats.slice(0, 3);

    const weakTopicNames = weakestTopics.map((w) => `${w.chapter} (${w.accuracy}% accuracy)`).join(", ");

    const promptContext = `=== ADAPTIVE LEARNING & WEAKNESS PROFILE CONTEXT ===
- Student ID: ${studentId}
- Subject: ${targetSub} (${overallAccuracy}% overall accuracy across ${totalAttempts} attempts)
- WEAKEST TOPICS (REMEDIATION TARGETS): ${weakTopicNames || "None flagged"}
- MANDATORY INSTRUCTION FOR GEMINI: This is a personalized practice test. Focus approximately 60-70% of generated questions on weakest topics (${weakestTopics.map((w) => w.chapter).join(", ")}).`;

    return {
      studentId,
      subject: targetSub,
      totalAttempts,
      overallAccuracy,
      weakestTopics,
      promptContext,
    };
  } catch (err) {
    return null;
  }
}

function validateAndFixQuestions(
  rawQuestions: any[],
  subject: string,
  topicLabel: string,
  difficulty: string
): MCQQuestion[] {
  if (!Array.isArray(rawQuestions)) return [];

  const validated: MCQQuestion[] = [];
  const canonSubject = normalizeSubjectKey(subject);
  const seenStems = new Set<string>();
  const seenOptionSigs = new Set<string>();

  const QUESTION_PLACEHOLDER_REGEX = /\b(lorem ipsum|placeholder|insert question|sample question|example question|type question|test question|n\/a|tbd|todo)\b/i;
  const OPTION_PLACEHOLDER_REGEX = /^(option\s*[a-d1-4]|choice\s*[a-d1-4]|placeholder|sample\s*option|lorem\s*ipsum|tbd|todo)$/i;

  for (let i = 0; i < rawQuestions.length; i++) {
    const item = rawQuestions[i];
    if (!item || typeof item !== "object") continue;

    // 1. Question text extraction & sanitization
    let qText = typeof item.q === "string" ? item.q.trim() : "";
    if (!qText && typeof item.question === "string") qText = item.question.trim();
    if (!qText || qText.length < 8) continue;

    // Strip question numbering prefixes like "Q1: " or "1) "
    qText = qText.replace(/^(Q\d+[:\.]?|\d+[\.\)])\s*/i, "");

    // Check for placeholder text in question stem
    if (QUESTION_PLACEHOLDER_REGEX.test(qText)) continue;

    const normStem = qText.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, "");
    if (!normStem || seenStems.has(normStem)) continue;

    const lowerQ = qText.toLowerCase();
    const isUrduOrIslamiat = canonSubject === "Urdu" || canonSubject === "Islamiat";
    const hasUrduScript = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(qText);

    if (isUrduOrIslamiat) {
      if (!hasUrduScript) continue;
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
        lowerQ.includes("chemistry")
      ) {
        continue;
      }
    } else if (["English", "Pakistan Studies"].includes(canonSubject)) {
      if (
        lowerQ.includes("vector quantity") ||
        lowerQ.includes("classical mechanics") ||
        lowerQ.includes("newton's") ||
        lowerQ.includes("harmonic motion") ||
        lowerQ.includes("capacitance") ||
        lowerQ.includes("mitochondria")
      ) {
        continue;
      }
    }

    // 2. Options validation
    let rawOptions = item.options;
    if (!Array.isArray(rawOptions) || rawOptions.length < 4) continue;

    const cleanedOptions = rawOptions.slice(0, 4).map((opt: any) => {
      let str = typeof opt === "string" ? opt.trim() : String(opt || "").trim();
      return str.replace(/^(\([A-Da-d1-4]\)|[A-Da-d1-4][\.\)]|\d+[\.\)])\s*/, "");
    });

    // Ensure options array has exactly 4 non-empty choices
    if (cleanedOptions.length !== 4) continue;
    if (cleanedOptions.some((opt) => !opt || opt.trim().length === 0)) continue;

    // Reject questions with generic placeholder option text
    if (cleanedOptions.some((opt) => OPTION_PLACEHOLDER_REGEX.test(opt.trim()))) continue;

    // Ensure options are 100% distinct (exactly 4 unique options in this question)
    const uniqueOpts = new Set(cleanedOptions.map((o) => o.toLowerCase()));
    if (uniqueOpts.size < 4) continue;

    const optionSig = Array.from(uniqueOpts).sort().join("|");
    if (seenOptionSigs.has(optionSig)) continue;

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

    // 5. Strict Bounds Validation: correct index MUST be within [0, cleanedOptions.length - 1]
    if (correctIdx < 0 || correctIdx >= cleanedOptions.length) {
      // Reject malformed question instead of saving invalid or out-of-bounds state
      continue;
    }

    if (!explainText || QUESTION_PLACEHOLDER_REGEX.test(explainText)) {
      explainText = `Option ${String.fromCharCode(65 + correctIdx)} (${cleanedOptions[correctIdx]}) is the correct answer according to standard textbook principles.`;
    }

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

function generateSyllabusQuestions(
  subject: string,
  customTopic: string | undefined,
  questionCount: number,
  difficulty: string
): MCQQuestion[] {
  const topicLabel = customTopic || `${subject} Core Principles`;
  const questions: MCQQuestion[] = [];

  const templates: Record<string, Array<{ q: string; options: string[]; correct: number; explain: string }>> = {
    Physics: [
      {
        q: `Which of the following physical quantities is a vector quantity in classical mechanics?`,
        options: ["Torque", "Electric Potential", "Work Done", "Kinetic Energy"],
        correct: 0,
        explain: "Torque is defined as τ = r × F, which is a cross product resulting in a vector quantity with both magnitude and direction."
      },
      {
        q: `According to Newton's Second Law of Motion, the rate of change of momentum is equal to:`,
        options: ["Applied Net Force", "Mass x Velocity", "Impulse per unit mass", "Total Energy"],
        correct: 0,
        explain: "F_net = dp/dt. The rate of change of linear momentum of a body is directly proportional to the net applied force."
      },
      {
        q: `In a simple harmonic motion (SHM), the acceleration of the particle is maximum at:`,
        options: ["Extreme positions", "Mean position", "Halfway between mean and extreme", "It remains constant"],
        correct: 0,
        explain: "Since a = -ω²x, acceleration is directly proportional to displacement x. Thus, 'a' is maximum at extreme positions where x = A."
      }
    ],
    Chemistry: [
      {
        q: `Which of the following orbitals has the lowest energy according to the (n + l) rule?`,
        options: ["4s orbital", "3d orbital", "4p orbital", "5s orbital"],
        correct: 0,
        explain: "For 4s: n+l = 4+0 = 4. For 3d: n+l = 3+2 = 5. Lower (n+l) value means lower energy according to Aufbau principle."
      },
      {
        q: `The geometry of a water molecule (H₂O) according to VSEPR theory is:`,
        options: ["Bent / Angular", "Linear", "Tetrahedral", "Trigonal Planar"],
        correct: 0,
        explain: "H₂O has 2 bonding pairs and 2 lone pairs on Oxygen, leading to a bent shape with bond angle ~104.5°."
      }
    ],
    Mathematics: [
      {
        q: `What is the derivative of f(x) = e^(2x) * sin(x) with respect to x?`,
        options: [
          "e^(2x) [2 sin(x) + cos(x)]",
          "2 e^(2x) cos(x)",
          "e^(2x) [sin(x) + 2 cos(x)]",
          "2 e^(2x) sin(x)"
        ],
        correct: 0,
        explain: "Using product rule d/dx[u*v] = u'v + uv': f'(x) = 2e^(2x)sin(x) + e^(2x)cos(x) = e^(2x)[2sin(x) + cos(x)]."
      }
    ],
    Biology: [
      {
        q: `Which organelle is known as the powerhouse of the eukaryotic cell?`,
        options: ["Mitochondria", "Ribosome", "Golgi Apparatus", "Endoplasmic Reticulum"],
        correct: 0,
        explain: "Mitochondria produce ATP through oxidative phosphorylation during cellular respiration."
      }
    ],
    "Computer Science": [
      {
        q: "Which linear data structure operates on a First-In, First-Out (FIFO) basis?",
        options: ["Queue", "Stack", "Binary Search Tree", "Graph"],
        correct: 0,
        explain: "Queues insert elements at the rear and process them from the front in strict FIFO order."
      }
    ],
    English: [
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
      }
    ],
    Urdu: [
      {
        q: "اسم نکرہ کی نشاندہی کریں:",
        options: ["شاعر", "لاہور", "علامہ اقبال", "قرآن مجید"],
        correct: 0,
        explain: "'شاعر' ایک عام اسم (اسم نکرہ) ہے جبکہ لاہور اور علامہ اقبال اسم معرفہ ہیں۔"
      }
    ],
    Islamiat: [
      {
        q: "قرآن مجید کی کس سورۃ کو 'قلب القرآن' (قرآن کا دل) کہا جاتا ہے؟",
        options: ["سورۃ یٰسین", "سورۃ الفاتحہ", "سورۃ البقرہ", "سورۃ الرحمن"],
        correct: 0,
        explain: "احادیث مبارکہ کی روشنی میں سورۃ یٰسین کو قرآن مجید کا دل کہا گیا ہے۔"
      }
    ]
  };

  const keySubject = normalizeSubjectKey(subject);
  const isUrduOrIslamiat = keySubject === "Urdu" || keySubject === "Islamiat";
  const pool = templates[keySubject] || [];

  for (let i = 0; i < questionCount; i++) {
    const template = pool[i % pool.length];
    const isCustomFallback = i >= pool.length;

    let fallbackQ = `[${subject}] Practice Question ${i + 1}: Select the correct core principle regarding ${topicLabel}.`;
    let fallbackOpts = [
      `Primary law of ${subject}`,
      `Secondary principle of ${subject}`,
      `Standard rule of ${topicLabel}`,
      `None of the above`
    ];
    let fallbackExplain = `Option A is the verified correct answer according to the standard syllabus derivation for ${topicLabel}.`;

    if (isUrduOrIslamiat) {
      fallbackQ = `سوال نمبر ${i + 1}: ${subject} کے اہم اور بنیادی اصول کی نشاندہی کریں۔`;
      fallbackOpts = ["پہلا درست اصول", "دوسرا اصول", "تیسرا اصول", "ان میں سے کوئی نہیں"];
      fallbackExplain = "نصاب کی روشنی میں آپشن (الف) ہی درست ترین جواب ہے۔";
    }

    questions.push({
      id: `static-q-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      q: !isCustomFallback && template ? template.q : fallbackQ,
      options: !isCustomFallback && template ? template.options : fallbackOpts,
      correct: !isCustomFallback && template ? template.correct : 0,
      topic: customTopic || (!isCustomFallback && template?.q ? topicLabel : subject),
      explain: !isCustomFallback && template ? template.explain : fallbackExplain,
      difficulty
    });
  }

  return questions;
}

export const onRequestPost = async (context: PagesContext) => {
  const { request, env } = context;

  const authHeader = request.headers.get("authorization");
  const supabaseClient = createSupabaseServerClient(env, authHeader);

  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const {
    customTopic,
    topic: requestedTopic,
    classNum,
    group,
    questionCount = 10,
    difficulty = "Exam Standard",
    mode = "ai-custom",
    userId = "guest",
    userEmail,
    bypassCache = false,
  } = body;

  const subject = normalizeSubjectKey(body.subject || "Physics");
  const requestedCount = Math.max(1, Number(questionCount) || 10);
  const isAdmin = Boolean(userEmail && userEmail.trim().toLowerCase() === "shsvirtualadmin@gmail.com");
  const isMdcat = (body.pathType === 'mdcat') || (body.path === 'mdcat') || String(classNum) === 'MDCAT' || String(group) === 'MDCAT' || (body.subject && String(body.subject).toLowerCase().includes('mdcat'));
  const resetDateStr = getNextMonthResetDate();

  if (customTopic && typeof customTopic === 'string' && customTopic.trim()) {
    await saveSharedCustomTopic(supabaseClient, subject, customTopic);
  }

  let activeClassNum = Number(classNum) || 11;
  let activeGroup = String(group || "Pre-Medical");

  // Registration & Lock Check
  if (userId && userId !== "guest" && !isAdmin && !isMdcat && supabaseClient) {
    try {
      const { data: studentRecord } = await supabaseClient
        .from("students")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      const isValidGrade = Boolean(studentRecord?.grade && studentRecord.grade.trim() && studentRecord.grade !== 'General Student');
      const isValidStream = Boolean(studentRecord?.stream && studentRecord.stream.trim());
      const isRegistered = Boolean(studentRecord?.is_registered && isValidGrade && isValidStream);

      if (!isRegistered) {
        return new Response(JSON.stringify({
          success: false,
          locked: true,
          error: "Course Registration Required: Please select your Class and Stream before generating MCQs.",
          message: "Course Registration Required: You must complete your Grade and Stream selection in your Course Registration before accessing practice MCQs."
        }), {
          status: 403,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

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

      if (classNum && Number(classNum) !== lockedClassNum) {
        return new Response(JSON.stringify({
          success: false,
          locked: true,
          error: `Class & Stream Locked: Your registration is locked to Class ${lockedClassNum} (${savedStream}). You cannot request questions for Class ${classNum}.`,
          message: `Class & Stream Locked: Your registration is locked to Class ${lockedClassNum} (${savedStream}). You cannot request questions for Class ${classNum}.`
        }), {
          status: 403,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      activeClassNum = lockedClassNum;
      activeGroup = lockedGroup;
    } catch (e) {
      console.warn("[Registration Lock Check Error]:", e);
    }
  }

  const topicLabel = customTopic || requestedTopic || `${subject} FBISE Syllabus`;
  const currentUsage = isAdmin ? 0 : await getStudentMonthlyUsage(supabaseClient, userId, userEmail);

  // Cache Lookup
  if (!bypassCache && topicLabel && topicLabel !== `${subject} FBISE Syllabus` && topicLabel !== "All Topics") {
    try {
      const cachedBank = await getCachedMcqs(supabaseClient, subject, topicLabel, activeClassNum);
      if (Array.isArray(cachedBank) && cachedBank.length >= 1) {
        const shuffledCached = [...cachedBank].sort(() => 0.5 - Math.random());
        const selectedCached = shuffledCached.slice(0, requestedCount);

        return new Response(JSON.stringify({
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
        }), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }
    } catch (cacheErr) {
      console.warn("[MCQ Cache Lookup Error]:", cacheErr);
    }
  }

  // Monthly Limit Check
  if (!isAdmin && !isMdcat && currentUsage >= 100) {
    const errorMessage = `You've reached your monthly limit of 100 AI-generated MCQs. This resets on ${resetDateStr}. You can still practice using previously generated/cached questions.`;
    return new Response(JSON.stringify({
      success: false,
      limitExceeded: true,
      error: errorMessage,
      message: errorMessage,
      currentUsage,
      requestedCount,
      limit: 100,
      resetDate: resetDateStr,
    }), {
      status: 403,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }

  let finalQuestions: MCQQuestion[] = [];
  let weaknessProfile: any = null;

  if (userId && userId !== "guest") {
    try {
      weaknessProfile = await getStudentWeaknessProfile(supabaseClient, userId, subject);
    } catch (profErr) {
      console.warn("[Adaptive Context Error]:", profErr);
    }
  }

  const allCandidateKeys = [
    env.GEMINI_API_KEY,
    env.GEMINI_API_KEY_2,
    env.VITE_GEMINI_API_KEY,
    env.GOOGLE_API_KEY,
    ...(typeof process !== "undefined"
      ? [process.env?.GEMINI_API_KEY, process.env?.GEMINI_API_KEY_2, process.env?.VITE_GEMINI_API_KEY, process.env?.GOOGLE_API_KEY]
      : [])
  ].filter((k): k is string => Boolean(k && typeof k === "string" && k.trim().length > 0 && k !== "MY_GEMINI_API_KEY"));

  const aizaKey = allCandidateKeys.find((k) => k.startsWith("AIzaSy"));
  const apiKey = (aizaKey || allCandidateKeys[0] || "").trim();
  const keyPresent = Boolean(apiKey && apiKey.trim().length > 0);
  const keyLength = apiKey ? apiKey.trim().length : 0;
  const keyPrefix = apiKey ? `${apiKey.trim().substring(0, 4)}...` : "NONE";

  let geminiErrorDetails: any = null;

  if ((mode === "ai-custom" || customTopic || mode === "instant") && apiKey) {
    // Preserve original fetch
    const originalFetch = globalThis.fetch;
    // Wrap globalThis.fetch to enforce native Gemini authentication headers & params
    const nativeGeminiFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
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

      // STOPS 401 ACCESS_TOKEN_TYPE_UNSUPPORTED: Remove OAuth/Bearer headers
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
      globalThis.fetch = nativeGeminiFetch as typeof fetch;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "x-goog-api-key": apiKey,
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = isMdcat
        ? `You are a senior chief medical entrance examination creator for Pakistan National MDCAT (Medical and Dental College Admission Test).
Your sole responsibility is to generate high-yield, 100% factually accurate, exam-standard multiple choice questions (MCQs) for the MDCAT entrance test.

MDCAT SPECIFIC MANDATES:
- Subjects allowed: Biology, Chemistry, Physics, English, and Logical Reasoning.
- Questions must reflect official PMDC 2026 uniform curriculum standards and difficulty.
- Factually accurate question stems, exact options, and detailed explanatory reasoning.
- Every question MUST belong strictly to the requested subject "${subject}".`
        : `You are a senior academic curriculum specialist and senior chief examination creator for Federal Board (FBISE) exams (Classes 9, 10, 11, and 12).

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
   - The 'correct' field MUST be an integer between 0 and 3 corresponding EXACTLY to the ZERO-BASED index of the options array that contains the 100% correct answer (0 = 1st option, 1 = 2nd option, 2 = 3rd option, 3 = 4th option).
   - Double check that options[correct] IS factually true.

3. SPELLING, GRAMMAR & FORMATTING QUALITY CONTROL:
   - Ensure perfect English/Urdu spelling, proper subject terminology, correct SI units/qawaid, and perfect grammar.

4. DISTINCT & PLAUSIBLE OPTIONS:
   - Each question must contain EXACTLY 4 distinct, plausible options with EXACTLY ONE correct answer.

5. STRICT SUBJECT SEPARATION:
   - Every question MUST belong strictly to the requested subject "${subject}". NEVER output questions from other subjects.

6. LANGUAGE MANDATE FOR URDU & ISLAMIAT:
   - If subject is "Urdu", "Islamiat", or "Islamic Studies", ALL question stems (q), option choices (options), topics (topic), and explanations (explain) MUST BE WRITTEN 100% IN URDU SCRIPT (اردو زبان).`;

      let subjectConstraintNote = "";
      const subLower = subject.toLowerCase();
      if (subLower.includes("urdu")) {
        subjectConstraintNote = `CRITICAL URDU MANDATE: Generate authentic Urdu MCQs for FBISE Class ${classNum || 11}. ALL text MUST be in Urdu script. DO NOT output any science/Physics questions.`;
      } else if (subLower.includes("islam") || subLower.includes("din")) {
        subjectConstraintNote = `CRITICAL ISLAMIAT MANDATE: Generate authentic Islamiat MCQs for FBISE Class ${classNum || 11}. ALL text MUST be in Urdu script. DO NOT output any science/Physics questions.`;
      }

      let adaptiveContextText = "";
      if (weaknessProfile && weaknessProfile.promptContext) {
        adaptiveContextText = `\n\n${weaknessProfile.promptContext}`;
      }

      const userPrompt = isMdcat
        ? `Generate ${requestedCount} multiple choice questions (MCQs) for MDCAT Entrance Test:
Subject: ${subject}
Track: MDCAT Medical & Dental College Admission Test
${customTopic ? `Topic Focus: ${customTopic}` : ''}
Target Difficulty Level: ${difficulty}
${adaptiveContextText}

Ensure questions adhere strictly to MDCAT entrance exam level depth for ${subject}.`
        : `Generate ${requestedCount} multiple choice questions (MCQs) for:
Subject: ${subject}
Class Level: Class ${classNum || 11}
Group/Stream: ${group || 'Pre-Engineering'}
${customTopic ? `Topic/Syllabus Focus: ${customTopic}` : ''}
Target Difficulty Level: ${difficulty}
${subjectConstraintNote}${adaptiveContextText}

Ensure the questions test core academic concepts for Class ${classNum || 11} (${group || 'FBISE'}) level.`;

      const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];
      let mcqSuccess = false;
      let lastStatusCode = 0;
      let lastErrorMessage = "";

      for (const modelName of modelsToTry) {
        if (mcqSuccess) break;
        let attempt = 0;
        const maxRetries = 2;

        while (attempt < maxRetries && !mcqSuccess) {
          attempt++;
          try {
            console.log(`[Generate MCQs Worker] Calling Gemini model: ${modelName} (attempt ${attempt})`);
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
                      q: { type: Type.STRING, description: "Factually accurate question text." },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Array of exactly 4 distinct choices."
                      },
                      correct: {
                        type: Type.INTEGER,
                        description: "Zero-based index (0, 1, 2, or 3) indicating correct answer."
                      },
                      topic: { type: Type.STRING, description: "Specific sub-topic or concept tested." },
                      explain: { type: Type.STRING, description: "Detailed explanation." }
                    },
                    required: ["q", "options", "correct", "topic", "explain"]
                  }
                }
              }
            });

            const responseText = response.text || "";
            if (responseText) {
              const rawParsed = JSON.parse(responseText.trim());
              const validatedQs = validateAndFixQuestions(rawParsed, subject, topicLabel, difficulty);
              if (validatedQs.length > 0) {
                finalQuestions = validatedQs.slice(0, requestedCount);
                mcqSuccess = true;
                break;
              }
            }
          } catch (err: any) {
            lastStatusCode = Number(err?.status || err?.statusCode || err?.code) || 500;
            lastErrorMessage = err?.message || String(err);
            console.error(`[Generate MCQs Worker Error] Model ${modelName} attempt ${attempt} failed (Status ${lastStatusCode}):`, lastErrorMessage, err?.stack || "");

            const errStr = lastErrorMessage.toLowerCase();
            const isRetryable =
              lastStatusCode === 503 ||
              lastStatusCode === 500 ||
              lastStatusCode === 502 ||
              lastStatusCode === 504 ||
              lastStatusCode === 429 ||
              errStr.includes("503") ||
              errStr.includes("unavailable") ||
              errStr.includes("high demand") ||
              errStr.includes("overloaded") ||
              errStr.includes("resource_exhausted") ||
              errStr.includes("rate limit") ||
              errStr.includes("fetch failed");

            if (isRetryable && attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            } else {
              break;
            }
          }
        }
      }

      if (!mcqSuccess) {
        geminiErrorDetails = {
          message: `Gemini MCQ Generation Error [Status ${lastStatusCode || 500}]: ${lastErrorMessage || "Failed to generate MCQs with Gemini API"}`,
          code: "GEMINI_ERROR",
          status: lastStatusCode || 500
        };
      }
    } catch (outerErr: any) {
      console.error("[Gemini AI MCQ generation outer error]:", outerErr?.message || outerErr, outerErr?.stack || "");
      geminiErrorDetails = {
        message: outerErr?.message || String(outerErr),
        name: outerErr?.name || "Error"
      };
    } finally {
      globalThis.fetch = originalFetch;
    }
  }

  if (finalQuestions.length === 0) {
    finalQuestions = generateSyllabusQuestions(subject, customTopic, requestedCount, difficulty).slice(0, requestedCount);
  }

  if (finalQuestions.length > 0 && topicLabel && topicLabel !== `${subject} FBISE Syllabus` && topicLabel !== "All Topics") {
    await saveMcqsToCache(supabaseClient, subject, topicLabel, finalQuestions, activeClassNum);
  }

  let newUsage = currentUsage;
  if (finalQuestions.length > 0 && !isMdcat) {
    newUsage = await incrementStudentMonthlyUsage(supabaseClient, userId, userEmail, finalQuestions.length);
  }

  return new Response(JSON.stringify({
    success: true,
    selectedSubject: subject,
    subjectSentToGemini: subject,
    subjectReturned: subject,
    questions: finalQuestions,
    adaptiveContextApplied: Boolean(weaknessProfile),
    weaknessProfile: weaknessProfile || undefined,
    usage: {
      currentUsage: isMdcat ? 0 : newUsage,
      limit: isMdcat ? 999999 : 100,
      remaining: (isAdmin || isMdcat) ? 999999 : Math.max(0, 100 - newUsage),
      resetDate: resetDateStr,
      isAdmin,
      isMdcat,
    },
    debug: {
      keyPresent,
      keyLength,
      keyPrefix,
      geminiError: geminiErrorDetails
    }
  }), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
