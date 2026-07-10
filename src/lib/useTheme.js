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
    const resolved = override || systemTheme;
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (override) {
      localStorage.setItem('theme', override);
    } else {
      localStorage.removeItem('theme');
    }
  }, [override, systemTheme]);

  const resolvedTheme = override || systemTheme;

  const toggle = useCallback(() => {
    setOverride(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme]);

  return { theme: resolvedTheme, toggle };
}
