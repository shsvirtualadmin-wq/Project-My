import { Question, BoardClass } from '../types';

export interface BookmarkedQuestion {
  id: string;
  question: Question;
  subject: string;
  classNum?: BoardClass;
  group?: string;
  savedAt: number;
}

const STORAGE_KEY = 'shs_bookmarked_questions';

export function getBookmarkedQuestions(): BookmarkedQuestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function isQuestionBookmarked(questionId: string): boolean {
  const list = getBookmarkedQuestions();
  return list.some(item => item.question.id === questionId || item.id === questionId);
}

export function saveBookmark(question: Question, subject: string, classNum?: BoardClass, group?: string): BookmarkedQuestion[] {
  const list = getBookmarkedQuestions();
  if (list.some(item => item.question.id === question.id)) {
    return list;
  }
  const newItem: BookmarkedQuestion = {
    id: question.id || `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    question,
    subject,
    classNum,
    group,
    savedAt: Date.now(),
  };
  const updated = [newItem, ...list];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function removeBookmark(questionId: string): BookmarkedQuestion[] {
  const list = getBookmarkedQuestions();
  const updated = list.filter(item => item.question.id !== questionId && item.id !== questionId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}
