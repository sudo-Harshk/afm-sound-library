import { useEffect, useRef } from 'react';

export default function TopBar({ query, onQueryChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="hidden lg:flex items-center h-16 px-6 sticky top-0 z-40 bg-paper/80 backdrop-blur-md border-b border-line">
      <div className="relative w-full max-w-xl">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none text-[20px]">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search sounds..."
          className="w-full h-10 pl-10 pr-16 bg-surface-container border border-line rounded-lg text-[13px] text-ink placeholder-ink-faint focus:outline-none focus:border-accent transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 pointer-events-none">
          <span className="px-1.5 py-0.5 rounded border border-line text-[11px] text-ink-faint font-mono">&#8984;</span>
          <span className="px-1.5 py-0.5 rounded border border-line text-[11px] text-ink-faint font-mono">K</span>
        </div>
      </div>
    </header>
  );
}
