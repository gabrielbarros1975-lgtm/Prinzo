'use client';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Só executar no cliente após a montagem
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      setIsDark(savedTheme === 'dark');
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', isDark ? '#0a0f1a' : '#f8fafc');
    }
  }, [isDark, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event) => {
      setIsDark(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [mounted]);

  const toggle = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
  };

  // Renderizar um placeholder enquanto não está montado para evitar hydration mismatch
  if (!mounted) {
    return (
      <button
        aria-label="Alternar tema"
        disabled
        className="relative w-14 h-7 rounded-full border transition-all duration-300 flex items-center px-1 opacity-50"
        style={{
          backgroundColor: 'var(--toggle-track)',
          borderColor: 'var(--border-color)',
        }}
      >
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow-sm"
          style={{
            backgroundColor: 'var(--toggle-thumb)',
            transform: 'translateX(0)',
          }}
        >
          ☀️
        </span>
      </button>
    );
  }

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
