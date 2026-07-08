'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved === 'dark' || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return;
      const nextDark = event.matches;
      setIsDark(nextDark);
      document.documentElement.classList.toggle('dark', nextDark);
    };

    mediaQuery.addEventListener?.('change', handleChange);
    mediaQuery.addListener?.(handleChange);

    return () => {
      mediaQuery.removeEventListener?.('change', handleChange);
      mediaQuery.removeListener?.(handleChange);
    };
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1"
      style={{
        backgroundColor: isDark ? '#6d28d9' : '#e5e7eb',
        borderColor: isDark ? '#7c3aed' : '#d1d5db',
      }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow-sm"
        style={{
          backgroundColor: isDark ? '#a78bfa' : '#ffffff',
          transform: isDark ? 'translateX(28px)' : 'translateX(0)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
