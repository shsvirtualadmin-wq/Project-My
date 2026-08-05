import React, { useState, useEffect, useRef } from 'react';
import { triggerHaptic, HAPTIC_PATTERNS } from '../lib/haptics';
import {
  apiFetch,
  supabase,
  saveStudyBuddyMessageToSupabase,
  StudentProfile,
} from '../lib/supabase';
import { sanitizeStudyBuddyText, isGarbledResponse } from '../lib/studyBuddySanitizer';
import { StudyBuddyFormattedMessage } from './StudyBuddyFormattedMessage';
import 'katex/dist/katex.min.css';
import {
  GraduationCap,
  X,
  Send,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  Calculator,
  Target,
  FileText,
  User,
} from 'lucide-react';

export interface MCQContext {
  question: string;
  options: string[];
  correctOption: number;
  selectedOption: number | null;
  subject?: string;
  topic?: string;
  explanation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface StudyBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  preloadedContext?: MCQContext | null;
  onClearPreloadedContext?: () => void;
  studentProfile?: StudentProfile | null;
  selectedClass?: string | number;
  selectedGroup?: string;
  selectedSubject?: string;
  hideFloatingButton?: boolean;
}

export interface TrackInfo {
  trackName: string;
  greetingTrack: string;
  placeholder: string;
}

export function getTrackInfo(
  profile?: StudentProfile | null,
  selectedClass?: string | number,
  selectedGroup?: string,
  selectedSubject?: string
): TrackInfo {
  const rawClass = String(selectedClass || profile?.grade || '');
  const isMdcat = rawClass.includes('MDCAT') || profile?.target_exam === 'MDCAT';
  const isTcat = rawClass.includes('TCAT') || profile?.target_exam === 'TCAT';
  const stream = selectedGroup || profile?.stream || '';
  const currentSub = selectedSubject || '';

  if (isMdcat) {
    return {
      trackName: 'MDCAT',
      greetingTrack: 'MDCAT Medical Entry Test',
      placeholder: 'Ask any MDCAT subject or question...',
    };
  }
  if (isTcat) {
    return {
      trackName: 'TCAT',
      greetingTrack: 'TCAT Engineering Entry Test',
      placeholder: 'Ask any TCAT subject or question...',
    };
  }
  if (rawClass && rawClass !== 'undefined' && rawClass !== 'General Student') {
    const classNum = rawClass.replace(/[^0-9]/g, '');
    const gradeStr = classNum ? `Class ${classNum}` : rawClass;
    const fullTrack = stream ? `${gradeStr} ${stream}` : gradeStr;
    return {
      trackName: fullTrack,
      greetingTrack: `${fullTrack} subjects`,
      placeholder: `Ask any ${fullTrack} subject or question...`,
    };
  }
  return {
    trackName: currentSub || 'Subjects',
    greetingTrack: currentSub ? `${currentSub} studies` : 'your subjects & exams',
    placeholder: currentSub ? `Ask any ${currentSub} question...` : 'Ask me anything about your subjects...',
  };
}

const QUICK_START_CHIPS = [
  {
    id: 'chip-concept',
    icon: Lightbulb,
    title: 'Explain a Concept',
    description: 'Step-by-step breakdown with real-world examples',
    prompt: 'Can you explain a key concept step-by-step with real-world examples?',
  },
  {
    id: 'chip-numerical',
    icon: Calculator,
    title: 'Solve a Numerical',
    description: 'Formulas, step calculation & unit conversions',
    prompt: 'How do I systematically solve numerical problems step-by-step for my subjects?',
  },
  {
    id: 'chip-highyield',
    icon: Target,
    title: 'Review Weak Topics',
    description: 'High-yield exam topics & common mistakes to avoid',
    prompt: 'What are the most high-yield exam topics and common mistakes to avoid?',
  },
  {
    id: 'chip-mcq',
    icon: FileText,
    title: 'Analyze an MCQ',
    description: 'Fast elimination strategy for tough questions',
    prompt: 'How can I quickly analyze tough MCQs and eliminate wrong options accurately?',
  },
];

function generateNewConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

const ChatMessageItem: React.FC<{ msg: ChatMessage }> = React.memo(({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 100px' }}
      className={`flex flex-col ${isUser ? 'items-end ml-auto max-w-[85%] sm:max-w-[78%]' : 'items-start mr-auto max-w-[92%] sm:max-w-[85%]'}`}
    >
      {isUser ? (
        /* STUDENT BUBBLE */
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-end gap-1 px-1">
            <span className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">
              You
            </span>
            <User className="w-3 h-3 text-amber-400" />
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl rounded-tr-xs bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-medium shadow-md border border-amber-300/40">
            <StudyBuddyFormattedMessage content={msg.text} isUser={true} />
          </div>
        </div>
      ) : (
        /* AI TUTOR BUBBLE */
        <div className="space-y-1 w-full">
          <div className="flex items-center gap-1.5 px-1">
            <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <GraduationCap className="w-3 h-3" />
            </div>
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              Study Buddy
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-full font-semibold">
              AI Tutor
            </span>
          </div>
          <div className="p-4 sm:p-5 rounded-2xl rounded-tl-xs bg-[#131B29] border border-amber-500/20 text-slate-100 shadow-lg space-y-2">
            {(() => {
              const sanitized = sanitizeStudyBuddyText(msg.text);
              if (!sanitized) {
                return (
                  <div className="flex items-center gap-2 text-amber-300 text-xs font-medium py-1 animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                    Analyzing your question and generating step-by-step solution...
                  </div>
                );
              }
              return <StudyBuddyFormattedMessage content={msg.text} isUser={false} />;
            })()}
          </div>
        </div>
      )}
    </div>
  );
});

export const StudyBuddyModal: React.FC<StudyBuddyModalProps> = ({
  isOpen,
  onClose,
  preloadedContext,
  onClearPreloadedContext,
  studentProfile,
  selectedClass,
  selectedGroup,
  selectedSubject,
  hideFloatingButton,
}) => {
  const trackInfo = getTrackInfo(studentProfile, selectedClass, selectedGroup, selectedSubject);
  const studentFirstName = studentProfile?.name?.split(' ')[0] || '';

  const [conversationId, setConversationId] = useState<string>(() => generateNewConversationId());
  const conversationIdRef = useRef<string>(conversationId);

  // Messages state - default empty so student gets quick-start suggestion chips!
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);

  // Session-level context (persists within session, resets on New Session)
  const [sessionContext, setSessionContext] = useState<{
    subject: string | null;
    track: string | null;
    topic: string | null;
  }>({
    subject: selectedSubject || null,
    track: trackInfo.trackName,
    topic: null,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const processedContextRef = useRef<MCQContext | null>(null);
  const hasInitializedOpenRef = useRef<boolean>(false);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Handle modal open: reset or clear context
  useEffect(() => {
    if (isOpen) {
      if (!hasInitializedOpenRef.current) {
        hasInitializedOpenRef.current = true;
      }
    } else {
      hasInitializedOpenRef.current = false;
    }
  }, [isOpen]);

  // Update track & subject context when props change
  useEffect(() => {
    const updatedTrack = getTrackInfo(studentProfile, selectedClass, selectedGroup, selectedSubject);
    setSessionContext((prev) => ({
      ...prev,
      track: updatedTrack.trackName,
      subject: prev.subject || selectedSubject || null,
    }));
  }, [studentProfile, selectedClass, selectedGroup, selectedSubject]);

  const handleStartNewChat = () => {
    const newId = generateNewConversationId();
    setConversationId(newId);
    conversationIdRef.current = newId;
    setMessages([]);
    setRateLimitError(null);
    setInput('');
    const freshTrack = getTrackInfo(studentProfile, selectedClass, selectedGroup, selectedSubject);
    setSessionContext({
      subject: selectedSubject || null,
      track: freshTrack.trackName,
      topic: null,
    });
    if (onClearPreloadedContext) {
      onClearPreloadedContext();
    }
    processedContextRef.current = null;
  };

  const saveMessageToSupabase = async (role: 'user' | 'model', text: string) => {
    if (!text || text.startsWith('⚠️')) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const targetConvId = conversationIdRef.current || conversationId;
        const res = await saveStudyBuddyMessageToSupabase(session.user.id, role, text, targetConvId);
        if (!res.success) {
          console.error('[StudyBuddyModal] Failed to save message to study_buddy_history:', res.error);
        }
      } else {
        console.warn('[StudyBuddyModal] Cannot save message to study_buddy_history: No active session/user ID.');
      }
    } catch (err) {
      console.error('[StudyBuddyModal Exception] Exception in saveMessageToSupabase:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isStreaming]);

  // Handle preloaded MCQ context when modal opens or context changes
  useEffect(() => {
    if (isOpen && preloadedContext && preloadedContext !== processedContextRef.current) {
      processedContextRef.current = preloadedContext;

      // Update session context from MCQ
      if (preloadedContext.subject) {
        setSessionContext((prev) => ({
          ...prev,
          subject: preloadedContext.subject || prev.subject,
          topic: preloadedContext.topic || prev.topic,
        }));
      }

      const optionLetters = ['A', 'B', 'C', 'D'];
      const userChoiceStr =
        preloadedContext.selectedOption !== null &&
        preloadedContext.selectedOption !== undefined &&
        preloadedContext.options[preloadedContext.selectedOption]
          ? `Option ${optionLetters[preloadedContext.selectedOption]} (${preloadedContext.options[preloadedContext.selectedOption]})`
          : 'Skipped';
      const correctChoiceStr =
        preloadedContext.options[preloadedContext.correctOption] || 'Correct Answer';

      const explanationText = preloadedContext.explanation
        ? `\n\n💡 **Official Explanation Provided:** ${preloadedContext.explanation}`
        : '';

      const contextPromptText = `I have a doubt regarding this ${preloadedContext.subject || trackInfo.trackName} question. Can you help clarify it step-by-step?\n\n❓ **Question:** ${preloadedContext.question}\n\n📌 **Options:**\n${preloadedContext.options
        .map((opt, idx) => `${optionLetters[idx]}) ${opt}`)
        .join('\n')}\n\n✅ **Correct Answer:** Option ${optionLetters[preloadedContext.correctOption]} (${correctChoiceStr})\n👤 **My Selection:** ${userChoiceStr}${explanationText}`;

      handleSendStream(contextPromptText, preloadedContext);
    }
  }, [isOpen, preloadedContext]);

  // Infer subject/topic context from user text if present
  const inferContextFromPrompt = (text: string) => {
    const lower = text.toLowerCase();
    const subjects = ['physics', 'chemistry', 'biology', 'mathematics', 'math', 'computer science', 'computer', 'english', 'urdu', 'islamiat', 'pakistan studies'];
    for (const sub of subjects) {
      if (lower.includes(sub)) {
        const normalized = sub.charAt(0).toUpperCase() + sub.slice(1);
        setSessionContext((prev) => ({ ...prev, subject: normalized }));
        break;
      }
    }
  };

  const handleSendStream = async (userPromptText: string, mcqCtx?: MCQContext | null) => {
    if (!userPromptText.trim() || isStreaming) return;

    triggerHaptic(HAPTIC_PATTERNS.light);
    setRateLimitError(null);
    inferContextFromPrompt(userPromptText);

    const userMessageId = `msg-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: userPromptText.trim(),
      timestamp: Date.now(),
    };

    const modelMessageId = `msg-model-${Date.now()}`;
    const initialModelMessage: ChatMessage = {
      id: modelMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, initialModelMessage]);
    setInput('');
    setIsStreaming(true);

    saveMessageToSupabase('user', userPromptText.trim());

    try {
      const apiHistory = messages
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      apiHistory.push({ role: 'user', text: userPromptText.trim() });

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      const response = await apiFetch('/api/study-buddy/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiHistory,
          mcqContext: mcqCtx || null,
          sessionContext,
          trackInfo,
          userId: currentUser?.id || null,
          userEmail: currentUser?.email || null,
        }),
      });

      if (!response.ok) {
        let errData: any = {};
        try {
          errData = await response.json();
        } catch {}
        if (response.status === 429 || errData?.rateLimited || errData?.dailyLimitExceeded) {
          const limitMsg =
            errData?.message ||
            errData?.error ||
            "You've reached your daily limit of 5 questions. Come back tomorrow!";
          setRateLimitError(limitMsg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === modelMessageId
                ? {
                    ...m,
                    text: `⚠️ ${limitMsg}`,
                    isError: true,
                  }
                : m
            )
          );
        } else {
          const generalErr = errData?.message || errData?.error || 'Failed to connect to Study Buddy.';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === modelMessageId
                ? {
                    ...m,
                    text: `⚠️ ${generalErr}`,
                    isError: true,
                  }
                : m
            )
          );
        }
        setIsStreaming(false);
        return;
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by browser/server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      const processSseLine = (line: string) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') {
            return;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              if (parsed.rateLimited) {
                setRateLimitError(parsed.error);
              }
              accumulatedText = `⚠️ ${parsed.error}`;
            } else if (parsed.text) {
              accumulatedText += parsed.text;
            }
          } catch (e) {
            console.warn('Error parsing SSE data chunk:', e);
          }
        }
      };

      let rafPending = false;
      const scheduleStreamUpdate = (latestText: string) => {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === modelMessageId ? { ...m, text: latestText } : m
            )
          );
          rafPending = false;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (buffer + chunk).split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          processSseLine(line);
        }

        const livePreview = accumulatedText.startsWith('⚠️')
          ? accumulatedText
          : sanitizeStudyBuddyText(accumulatedText);

        scheduleStreamUpdate(livePreview);
      }

      if (buffer.trim()) {
        processSseLine(buffer.trim());
      }

      let finalText = accumulatedText.startsWith('⚠️')
        ? accumulatedText
        : sanitizeStudyBuddyText(accumulatedText);

      if (isGarbledResponse(accumulatedText)) {
        console.error('[Study Buddy Raw Garbled Response Detected]:', accumulatedText);
        finalText = "I experienced a temporary formatting issue while generating that explanation. Let me try again! Please ask your question once more or select an MCQ to explain.";
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === modelMessageId ? { ...m, text: finalText } : m
        )
      );

      if (finalText.trim() && !finalText.startsWith('⚠️')) {
        saveMessageToSupabase('model', finalText.trim());
      }

      if (!finalText.trim()) {
        const fallbackText = `I'm Study Buddy, your AI study assistant! 🎓 Please ask any study-related question or select an MCQ to explain.`;
        saveMessageToSupabase('model', fallbackText);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === modelMessageId ? { ...m, text: fallbackText } : m
          )
        );
      }
    } catch (err: any) {
      console.error('Streaming API error:', err);
      const errText = err?.message || 'Something went wrong while streaming answer.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === modelMessageId
            ? { ...m, text: `⚠️ Connection Error: ${errText}`, isError: true }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendStream(input);
    }
  };

  // FLOATING TRIGGER BUTTON (WHEN MODAL IS CLOSED)
  if (!isOpen) {
    if (hideFloatingButton) return null;
    return (
      <button
        type="button"
        onClick={() => {
          triggerHaptic(HAPTIC_PATTERNS.medium);
          onClose();
        }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[45] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black shadow-2xl shadow-amber-500/40 border-2 border-amber-200/90 rounded-full px-4 py-3 sm:px-5 sm:py-3.5 flex items-center gap-2.5 transition-all duration-200 active:scale-95 cursor-pointer hover:shadow-amber-500/60 hover:scale-105 group"
        aria-label="Open Study Buddy AI Tutor"
        title="Ask Study Buddy AI Tutor"
      >
        <div className="relative flex items-center justify-center">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-slate-950 shrink-0 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
          </span>
        </div>
        <span className="text-xs sm:text-sm font-black tracking-tight text-slate-950 drop-shadow-xs">
          Study Buddy 🎓
        </span>
      </button>
    );
  }

  // REDESIGNED MODAL DIALOG
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-2xl h-[92vh] max-h-[760px] bg-[#0E1522] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-amber-500/15 via-[#0E1522] to-amber-500/10 border-b border-amber-500/20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 shrink-0 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-amber-300 truncate tracking-tight">
                  Study Buddy 🎓
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full shrink-0">
                  AI Tutor
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
                <span className="text-slate-600 text-[10px]">•</span>
                <span className="text-xs text-slate-400 truncate">
                  {sessionContext.subject
                    ? `${sessionContext.subject} • ${trackInfo.trackName}`
                    : trackInfo.trackName}
                </span>
              </div>
            </div>
          </div>

          {/* SIMPLIFIED ESSENTIAL HEADER ACTIONS (HISTORY BUTTON REMOVED) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.light);
                handleStartNewChat();
              }}
              disabled={isStreaming}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              title="Start a new empty study session"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(HAPTIC_PATTERNS.light);
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Close Study Buddy"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* RATE LIMIT ALERT */}
        {rateLimitError && (
          <div className="px-4 py-2 bg-red-500/10 border-b border-red-500/20 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{rateLimitError}</span>
          </div>
        )}

        {/* CHAT MESSAGES & EMPTY STATE AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0A0F18]">
          {messages.length === 0 ? (
            /* EMPTY / NEW SESSION STATE WITH QUICK START CHIPS */
            <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 my-auto max-w-lg mx-auto space-y-5 animate-in fade-in duration-300">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 mx-auto">
                  <GraduationCap className="w-9 h-9 sm:w-11 sm:h-11" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0E1522]"></span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg sm:text-xl font-extrabold text-amber-300 tracking-tight">
                  {studentFirstName ? `Welcome, ${studentFirstName}! 🎓` : 'Welcome to Study Buddy! 🎓'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  I&apos;m your dedicated AI tutor for <strong className="text-amber-400 font-semibold">{trackInfo.greetingTrack}</strong>. What concept or problem would you like to master today?
                </p>
              </div>

              {/* QUICK START SUGGESTION CHIPS */}
              <div className="w-full space-y-2 pt-2 text-left">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 block">
                  Tap to start a topic:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUICK_START_CHIPS.map((chip) => {
                    const ChipIcon = chip.icon;
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => handleSendStream(chip.prompt)}
                        className="p-3 rounded-xl sm:rounded-2xl bg-[#121A27] border border-amber-500/20 hover:border-amber-400/60 hover:bg-[#162133] text-left transition-all hover:scale-[1.01] active:scale-95 group cursor-pointer shadow-sm flex items-start gap-3"
                      >
                        <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                          <ChipIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                            {chip.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {chip.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE MESSAGES LIST */
            <>
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="p-3 sm:p-4 bg-[#0E1522] border-t border-amber-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendStream(input);
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={trackInfo.placeholder}
              disabled={isStreaming}
              className="flex-1 bg-[#090D15] text-slate-100 placeholder-slate-500 px-4 py-3 rounded-xl sm:rounded-2xl border border-amber-500/30 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs sm:text-sm transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl sm:rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0 flex items-center justify-center cursor-pointer active:scale-95"
              title="Send prompt to Study Buddy"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default StudyBuddyModal;
