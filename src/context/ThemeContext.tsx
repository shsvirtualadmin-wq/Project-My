import React, { createContext, useContext, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

const applyThemeToDOM = (newTheme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', newTheme);
  if (newTheme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
};

const getInitialTheme = (): Theme => {
  try {
    const saved = localStorage.getItem('boardly_theme') || localStorage.getItem('shs_theme');
    if (saved === 'dark' || saved === 'light') {
      applyThemeToDOM(saved);
      return saved;
    }
  } catch {}
  const isDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const defaultTheme: Theme = isDark ? 'dark' : 'light';
  applyThemeToDOM(defaultTheme);
  return defaultTheme;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = useCallback((t: Theme) => {
    // Apply DOM changes instantly before state commit
    applyThemeToDOM(t);
    try {
      localStorage.setItem('boardly_theme', t);
      localStorage.setItem('shs_theme', t);
    } catch {}
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      applyThemeToDOM(nextTheme);
      try {
        localStorage.setItem('boardly_theme', nextTheme);
        localStorage.setItem('shs_theme', nextTheme);
      } catch {}
      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
