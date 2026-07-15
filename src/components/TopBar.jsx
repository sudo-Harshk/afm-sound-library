import { useEffect, useRef } from 'react';

export default function TopBar({ query, onQueryChange, onHelpClick }) {
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
      <div className="relative w-full max-w-xl" data-tour="search">
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
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink transition-colors"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      <button
        onClick={onHelpClick}
        title="How to use"
        className="ml-3 shrink-0 w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-faint hover:text-accent hover:border-accent/50 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">help_outline</span>
      </button>
    </header>
  );
}
