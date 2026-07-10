import { Search, X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function SearchBar({ query, onQueryChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative w-full group">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-ink-faint pointer-events-none group-focus-within:text-accent transition-colors duration-150" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search a sound…"
        autoFocus
        className="w-full pl-[3.25rem] pr-11 py-4 bg-paper-raised border border-line rounded-2xl shadow-[var(--shadow-card)] text-[17px] text-ink placeholder-ink-faint focus:outline-none focus:border-accent transition-colors duration-150"
      />
      {query && (
        <button
          onClick={() => onQueryChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink transition-colors"
          aria-label="Clear search"
        >
          <X className="w-[18px] h-[18px]" />
        </button>
      )}
    </div>
  );
}
