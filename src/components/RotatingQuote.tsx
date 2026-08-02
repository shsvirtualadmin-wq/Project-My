import React, { useState, useEffect, useRef } from 'react';

export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "Study hard what interests you the most.", author: "Richard Feynman" },
  { text: "If I have seen further, it is by standing on shoulders.", author: "Isaac Newton" },
  { text: "Mathematicians have tried in vain to discover order.", author: "Leonhard Euler" },
  { text: "Mathematics is the queen of the sciences.", author: "Carl Friedrich Gauss" },
  { text: "I think, therefore I am.", author: "René Descartes" },
  { text: "Nothing in life is to be feared, only understood.", author: "Marie Curie" },
  { text: "Nothing is lost, nothing is created, everything is transformed.", author: "Antoine Lavoisier" },
  { text: "Chance favors the prepared mind.", author: "Louis Pasteur" },
  { text: "It is not in the stars to hold our destiny.", author: "William Shakespeare" },
  { text: "In a time of deceit telling the truth is revolutionary.", author: "George Orwell" },
  { text: "Elevate yourself so high that God asks your wish.", author: "Allama Iqbal" },
  { text: "Knowledge gives sight to minds that dare to search.", author: "Mirza Ghalib" },
  { text: "Truth is the ultimate purpose of all scientific inquiry.", author: "Al-Biruni" },
  { text: "Width of life matters more than length of life.", author: "Ibn Sina (Avicenna)" },
  { text: "Education is the most powerful weapon to change the world.", author: "Nelson Mandela" },
  { text: "An unexamined life is not worth living.", author: "Socrates" },
  { text: "We are what we repeatedly do. Excellence is a habit.", author: "Aristotle" },
];

export const RotatingQuote: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [animState, setAnimState] = useState<'idle' | 'fading-out' | 'fading-in'>('idle');
  const [isPaused, setIsPaused] = useState(false);

  const isPausedRef = useRef(isPaused);
  const quoteIndexRef = useRef(quoteIndex);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    quoteIndexRef.current = quoteIndex;
  }, [quoteIndex]);

  useEffect(() => {
    let fadeOutTimeout: NodeJS.Timeout;
    let fadeInTimeout: NodeJS.Timeout;

    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      // Start fade-out + slight upward slide (~350ms)
      setAnimState('fading-out');

      fadeOutTimeout = setTimeout(() => {
        // Pick new random quote without repeating current index
        let nextIndex: number;
        do {
          nextIndex = Math.floor(Math.random() * QUOTES.length);
        } while (nextIndex === quoteIndexRef.current && QUOTES.length > 1);

        setQuoteIndex(nextIndex);
        setAnimState('fading-in');

        // Trigger slide-up + fade-in transition
        fadeInTimeout = setTimeout(() => {
          setAnimState('idle');
        }, 35);
      }, 350);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimeout);
      clearTimeout(fadeInTimeout);
    };
  }, []);

  const currentQuote = QUOTES[quoteIndex];

  let animClasses = "transform transition-all";
  if (animState === 'fading-out') {
    animClasses += " opacity-0 -translate-y-2.5 duration-350 ease-in";
  } else if (animState === 'fading-in') {
    animClasses += " opacity-0 translate-y-2.5 transition-none";
  } else {
    animClasses += " opacity-100 translate-y-0 duration-450 ease-out";
  }

  return (
    <div
      className="quote-container relative w-full flex flex-col items-center justify-center my-1 sm:my-2 px-3 py-1 select-none cursor-pointer group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
      title="Hover or tap & hold to pause quote"
    >
      <div className="min-h-[64px] sm:min-h-[76px] flex flex-col items-center justify-center text-center">
        <div className={animClasses}>
          <p
            className="font-semibold text-lg sm:text-2xl text-amber-950 dark:text-[#F5E4B5] tracking-wide leading-snug max-w-lg drop-shadow-xs"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            “{currentQuote.text}”
          </p>
          <span className="block text-xs sm:text-sm font-medium tracking-wider text-amber-800/80 dark:text-[#D4A94A]/80 mt-1.5 uppercase">
            — {currentQuote.author}
          </span>
        </div>
      </div>

      {isPaused && (
        <span className="absolute -bottom-2 text-[9px] font-bold tracking-widest uppercase text-amber-700/80 dark:text-[#D4A94A]/70 bg-amber-500/10 dark:bg-white/5 border border-amber-600/20 dark:border-[#D4A94A]/20 px-2 py-0.5 rounded-full transition-opacity duration-200">
          Paused
        </span>
      )}
    </div>
  );
};
