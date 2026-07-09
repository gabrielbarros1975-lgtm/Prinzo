'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark === null) return;

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', isDark ? '#0a0f1a' : '#f8fafc');
    }
  }, [isDark]);

  useEffect(() => {
    if (isDark === null) return;
    if (localStorage.getItem('theme') !== null) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setIsDark(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [isDark]);

  const toggle = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1"
      style={{
        backgroundColor: 'var(--toggle-track)',
        borderColor: 'var(--border-color)',
      }}
    >
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow-sm"
        style={{
          backgroundColor: 'var(--toggle-thumb)',
          transform: isDark ? 'translateX(28px)' : 'translateX(0)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
