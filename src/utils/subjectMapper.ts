export const CANONICAL_SUBJECTS = [
  'Physics',
  'Chemistry',
  'Biology',
  'Mathematics',
  'Computer Science',
  'English',
  'Urdu',
  'Islamiat',
  'Pakistan Studies',
] as const;

export type CanonicalSubject = (typeof CANONICAL_SUBJECTS)[number];

/**
 * Single centralized subject mapping function used across the application.
 * Maps any subject input strictly to one of the 9 canonical subjects or 'All Mix'.
 * Absolutely NO fallbacks or routing to another subject.
 */
export function mapSubject(input: string): CanonicalSubject | 'All Mix' | string {
  if (!input) return '';
  const clean = input.trim();

  if (clean === 'All Mix') return 'All Mix';

  const lower = clean.toLowerCase();

  if (lower.includes('physic')) return 'Physics';
  if (lower.includes('chem')) return 'Chemistry';
  if (lower.includes('bio') || lower.includes('botany') || lower.includes('zoology')) return 'Biology';
  if (lower.includes('math')) return 'Mathematics';
  if (lower.includes('computer') || lower === 'cs' || lower.includes('it')) return 'Computer Science';
  if (lower.includes('english') || lower.includes('verbal')) return 'English';
  if (lower.includes('urdu')) return 'Urdu';
  if (lower.includes('islam') || lower.includes('din')) return 'Islamiat';
  if (lower.includes('pak') || lower.includes('pakistan')) return 'Pakistan Studies';

  // Exact match check
  const exact = CANONICAL_SUBJECTS.find((s) => s.toLowerCase() === lower);
  if (exact) return exact;

  return clean;
}
