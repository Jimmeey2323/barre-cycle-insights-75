
import React, { createContext, useState, useContext, useEffect } from 'react';

type ThemeType = 'light' | 'dark' | 'luxe' | 'physique57';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('light');

  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme && ['light', 'dark', 'luxe', 'physique57'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Set the theme class on the document
    document.documentElement.classList.remove('light', 'dark', 'luxe', 'physique57');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);

    // Apply global CSS variables based on theme
    if (theme === 'physique57') {
      document.documentElement.style.setProperty('--chart-primary', '#0d5c8f');
      document.documentElement.style.setProperty('--chart-secondary', '#1a7cb8');
      document.documentElement.style.setProperty('--chart-accent', '#2e9be0');
    } else if (theme === 'luxe') {
      document.documentElement.style.setProperty('--chart-primary', '#d4af37');
      document.documentElement.style.setProperty('--chart-secondary', '#c6a02e');
      document.documentElement.style.setProperty('--chart-accent', '#e3bc4c');
    } else if (theme === 'dark') {
      document.documentElement.style.setProperty('--chart-primary', '#64748b');
      document.documentElement.style.setProperty('--chart-secondary', '#94a3b8');
      document.documentElement.style.setProperty('--chart-accent', '#cbd5e1');
    } else {
      document.documentElement.style.setProperty('--chart-primary', '#3b82f6');
      document.documentElement.style.setProperty('--chart-secondary', '#60a5fa');
      document.documentElement.style.setProperty('--chart-accent', '#93c5fd');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
