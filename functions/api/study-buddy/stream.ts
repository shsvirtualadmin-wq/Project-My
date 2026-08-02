import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

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

const studyBuddyRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkStudyBuddyRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequestsPerMinute = 15;

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

const STUDY_BUDDY_SYSTEM_INSTRUCTION = `You are 'Study Buddy 🎓', an enthusiastic, student-friendly AI academic tutor for Federal Board (FBISE) students in Pakistan (Classes 9, 10, 11, and 12).

STRICT SCOPE & ON-TOPIC MANDATE:
1. Academic Focus ONLY: You MUST ONLY answer questions related to school studies, FBISE syllabus, exam preparation, conceptual explanations, formulas, grammar, and multiple-choice questions for subjects like Physics, Chemistry, Biology, Mathematics, Computer Science, English, Urdu, Islamiat, Pakistan Studies, and General Science.
2. Non-Academic Redirection: If asked about ANYTHING non-academic or off-topic (e.g., movies, gaming, sports news, politics, personal gossip, general chit-chat, non-educational coding/entertainment), POLITELY refuse and redirect the student back to their studies. Example: "I'm Study Buddy, your FBISE study assistant! 🎓 I can only help with academic topics and exam preparation. Let's get back to your studies — what topic or question would you like help with?"
3. Simple & Concise: Keep answers clear, structured, concise, and easy to understand for high school and college students. Break down concepts into step-by-step bullet points with bold key terms. Avoid overly technical jargon or dry lectures.
4. Language Support: Primarily answer in clear, friendly English. If asked in Urdu or about Urdu/Islamiat subjects, respond clearly in simple Urdu/English as appropriate.
5. Absolute Accuracy: Ensure scientific principles, formulas, equations, and FBISE curriculum rules are 100% accurate.
6. Output Format: Respond ONLY in plain, readable conversational text and standard markdown. NEVER wrap your response in \`\`\`json code blocks or output raw JSON objects. Write math expressions cleanly (e.g. 'E = mc²', 'v = Δx / Δt') rather than raw LaTeX syntax.`;

interface PagesContext {
  request: Request;
  env: Record<string, string | undefined>;
}

export const onRequestPost = async (context: PagesContext) => {
  const { request, env } = context;

  const clientIp = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "client-default";
  const rateCheck = checkStudyBuddyRateLimit(clientIp);

  const encoder = new TextEncoder();

  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({
      error: rateCheck.message,
      message: rateCheck.message,
      rateLimited: true,
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
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
  const keyPrefix = apiKey ? `${apiKey.trim().substring(0, 10)}...` : "NONE";

  console.log(`[Study Buddy Request] Using GEMINI_API_KEY (first 10 chars): "${keyPrefix}" (length: ${keyLength})`);

  if (!apiKey) {
    console.error("[Study Buddy Worker Error]: Gemini API Key missing from env (checked GEMINI_API_KEY, GEMINI_API_KEY_2, VITE_GEMINI_API_KEY, GOOGLE_API_KEY).");
    return new Response(JSON.stringify({
      error: "Gemini API Key missing: Please add GEMINI_API_KEY or GEMINI_API_KEY_2 to your Environment Variables.",
      debug: { keyPresent: false, envKeys: Object.keys(env || {}) }
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    body = {};
  }

  const { messages = [], mcqContext } = body;

  // -------------------------------------------------------------
  // DAILY USAGE LIMIT CHECK (5 questions / day per user)
  // -------------------------------------------------------------
  const authHeader = request.headers.get("authorization");
  const supabaseClient = createSupabaseServerClient(env, authHeader);

  let userId: string | null = body.userId || null;
  let userEmail: string | undefined = body.userEmail || undefined;

  if (supabaseClient) {
    try {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (user && user.id) {
        userId = user.id;
        if (user.email) userEmail = user.email;
      }
    } catch (authErr) {
      console.warn("[Study Buddy Auth Token Check Warning]:", authErr);
    }
  }

  if (!userId) {
    userId = `guest-${clientIp}`;
  }

  const todayStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const MAX_DAILY_LIMIT = 5;
  const isAdmin = Boolean(userEmail && userEmail.trim().toLowerCase() === "shsvirtualadmin@gmail.com");

  let currentDailyCount = 0;
  let existingUsageRecord: { id: string; count: number } | null = null;

  if (supabaseClient && userId) {
    try {
      const { data: usageData, error: usageErr } = await supabaseClient
        .from('study_buddy_usage')
        .select('id, count')
        .eq('student_id', userId)
        .eq('usage_date', todayStr)
        .maybeSingle();

      if (!usageErr && usageData) {
        currentDailyCount = usageData.count || 0;
        existingUsageRecord = usageData;
      }
    } catch (err) {
      console.warn('[Study Buddy Usage Query Warning]:', err);
    }
  }

  if (!isAdmin && currentDailyCount >= MAX_DAILY_LIMIT) {
    const limitMessage = "You've reached your daily limit of 5 questions. Come back tomorrow!";
    return new Response(JSON.stringify({
      error: limitMessage,
      message: limitMessage,
      rateLimited: true,
      dailyLimitExceeded: true,
      count: currentDailyCount,
      limit: MAX_DAILY_LIMIT
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Increment usage count in Supabase for user
  if (supabaseClient && userId && !isAdmin) {
    try {
      if (existingUsageRecord && existingUsageRecord.id) {
        await supabaseClient
          .from('study_buddy_usage')
          .update({
            count: currentDailyCount + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUsageRecord.id);
      } else {
        const { error: insertErr } = await supabaseClient
          .from('study_buddy_usage')
          .insert({
            student_id: userId,
            student_email: userEmail || '',
            usage_date: todayStr,
            count: 1,
            updated_at: new Date().toISOString(),
          });

        if (insertErr) {
          await supabaseClient
            .from('study_buddy_usage')
            .upsert({
              student_id: userId,
              student_email: userEmail || '',
              usage_date: todayStr,
              count: currentDailyCount + 1,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'student_id,usage_date'
            });
        }
      }
    } catch (incErr) {
      console.warn('[Study Buddy Usage Increment Warning]:', incErr);
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: string) {
        controller.enqueue(encoder.encode(data));
      }

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

        while (rawContents.length > 0 && rawContents[0].role !== "user") {
          rawContents.shift();
        }

        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
        for (const item of rawContents) {
          if (contents.length > 0 && contents[contents.length - 1].role === item.role) {
            contents[contents.length - 1].parts[0].text += `\n${item.parts[0].text}`;
          } else {
            contents.push(item);
          }
        }

        if (contents.length === 0) {
          contents.push({
            role: "user",
            parts: [{ text: "Hello Study Buddy! Please introduce yourself and explain how you can help me with my FBISE studies." }],
          });
        }

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

        const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest"];
        let streamSuccess = false;
        let lastErrorMsg = "";
        let lastStatusCode = 0;

        for (const modelName of modelsToTry) {
          if (streamSuccess) break;
          let attempt = 0;
          const maxRetries = 2;

          while (attempt < maxRetries && !streamSuccess) {
            attempt++;
            try {
              console.log(`[Study Buddy Worker] Calling Gemini model: ${modelName} (attempt ${attempt})`);
              const responseStream = await ai.models.generateContentStream({
                model: modelName,
                contents,
                config: {
                  systemInstruction: STUDY_BUDDY_SYSTEM_INSTRUCTION,
                  temperature: 0.2,
                  topP: 0.95,
                },
              });

              for await (const chunk of responseStream) {
                const chunkText = chunk.text;
                if (chunkText) {
                  send(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
                }
              }

              send(`data: [DONE]\n\n`);
              streamSuccess = true;
                         } catch (err: any) {
              lastStatusCode = Number(err?.status || err?.statusCode || err?.code) || 500;
              lastErrorMsg = err?.message || String(err);
              console.warn(`[Study Buddy Worker Warning] Model ${modelName} attempt ${attempt} failed (Status ${lastStatusCode}):`, lastErrorMsg);
              console.warn("[RAW GOOGLE GEMINI ERROR]:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

              const errStr = lastErrorMsg.toLowerCase();
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

        if (!streamSuccess) {
          const detailMsg = `Gemini API Error [Status ${lastStatusCode || 500}]: ${lastErrorMsg || "Unable to reach Gemini AI"}`;
          console.warn("[Study Buddy All Models Failed]:", detailMsg);
          send(`data: ${JSON.stringify({ error: detailMsg })}\n\n`);
          send(`data: [DONE]\n\n`);
        }
      } catch (err: any) {
        console.warn("[api/study-buddy/stream outer error]:", err?.message || err);
        console.warn("[RAW GOOGLE GEMINI FATAL ERROR]:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        const detailMsg = `Gemini API Error [Status ${err?.status || 500}]: ${err?.message || "Failed to stream response from Gemini."}`;
        send(`data: ${JSON.stringify({ error: detailMsg })}\n\n`);
        send(`data: [DONE]\n\n`);
      } finally {
        globalThis.fetch = originalFetch;
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
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
