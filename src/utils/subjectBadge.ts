export interface BadgeStyle {
  bg: string;
  text: string;
  border?: string;
  lightBg: string;
}

export function getSubjectBadgeStyle(subject: string): BadgeStyle {
  const sub = subject.toLowerCase();

  // Math
  if (sub.includes('math') || sub.includes('algebra') || sub.includes('calculus') || sub.includes('geometry')) {
    return {
      bg: 'bg-blue-600',
      text: 'text-white',
      border: 'border-blue-700',
      lightBg: 'bg-blue-50 text-blue-700',
    };
  }

  // Physics
  if (sub.includes('physic')) {
    return {
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-600',
      lightBg: 'bg-red-50 text-red-700',
    };
  }

  // Chemistry
  if (sub.includes('chem')) {
    return {
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-700',
      lightBg: 'bg-emerald-50 text-emerald-700',
    };
  }

  // Biology
  if (sub.includes('bio') || sub.includes('botany') || sub.includes('zoology') || sub.includes('genetics')) {
    return {
      bg: 'bg-purple-600',
      text: 'text-white',
      border: 'border-purple-700',
      lightBg: 'bg-purple-50 text-purple-700',
    };
  }

  // English
  if (sub.includes('english') || sub.includes('verbal') || sub.includes('grammar') || sub.includes('urdu')) {
    return {
      bg: 'bg-orange-500',
      text: 'text-white',
      border: 'border-orange-600',
      lightBg: 'bg-orange-50 text-orange-700',
    };
  }

  // Computer Science
  if (sub.includes('computer') || sub.includes('cs') || sub.includes('it') || sub.includes('programming') || sub.includes('coding')) {
    return {
      bg: 'bg-sky-500',
      text: 'text-white',
      border: 'border-sky-600',
      lightBg: 'bg-sky-50 text-sky-700',
    };
  }

  // Analytical / Intelligence / Logic
  if (
    sub.includes('analytical') ||
    sub.includes('logic') ||
    sub.includes('iq') ||
    sub.includes('intelligence') ||
    sub.includes('reasoning')
  ) {
    return {
      bg: 'bg-pink-500',
      text: 'text-white',
      border: 'border-pink-600',
      lightBg: 'bg-pink-50 text-pink-700',
    };
  }

  // Default / All Mix / General
  return {
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-700',
    lightBg: 'bg-emerald-50 text-emerald-700',
  };
}
