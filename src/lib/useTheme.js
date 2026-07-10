import { useEffect, useState, useCallback } from 'react';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [override, setOverride] = useState(() => localStorage.getItem('theme'));
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemTheme(getSystemTheme());
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (override) {
      document.documentElement.setAttribute('data-theme', override);
      localStorage.setItem('theme', override);
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    }
  }, [override]);

  const resolvedTheme = override || systemTheme;

  const toggle = useCallback(() => {
    setOverride(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme]);

  return { theme: resolvedTheme, toggle };
}
