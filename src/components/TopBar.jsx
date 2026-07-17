import { useState, useEffect, useRef } from 'react';

const RESOURCES = [
  { label: 'Sound Taxonomy', href: '/docs/Complete_Sound_Event_Taxonomy_v2_Revised.pdf' },
  { label: 'Q&A Reference', href: '/docs/Consolidated_QA_from_Team_Discussion.pdf' },
];

export default function TopBar({ query, onQueryChange, onHelpClick }) {
  const inputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [menuOpen]);

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

      <div className="ml-3 flex items-center gap-2 shrink-0" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            title="Reference documents"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-[13px] text-ink-faint hover:text-accent hover:border-accent/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">description</span>
            Docs
            <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-paper-raised rounded-xl shadow-2xl border border-line py-1.5 z-50">
              {RESOURCES.map((r) => (
                <a
                  key={r.href}
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-ink-soft hover:text-accent hover:bg-surface-container transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  {r.label}
                </a>
              ))}
            </div>
          )}
        </div>

        <a
          href="https://ai-products.meeamitech.com/annotation_tracker2/"
          target="_blank"
          rel="noopener noreferrer"
          title="Annotation Tracker"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-[13px] text-ink-faint hover:text-accent hover:border-accent/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
          Tracker
        </a>

        <button
          onClick={onHelpClick}
          title="How to use"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line text-[13px] text-ink-faint hover:text-accent hover:border-accent/50 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">help_outline</span>
          Help
        </button>
      </div>
    </header>
  );
}
