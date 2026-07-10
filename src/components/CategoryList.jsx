import { getCategoryIcon } from '../lib/icons';

export default function CategoryList({ categories, onSelect }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {categories.map(({ name, count }) => {
        const icon = getCategoryIcon(name);
        return (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className="flex items-center gap-3.5 p-4 rounded-xl border border-line bg-paper-raised shadow-[var(--shadow-card)] text-left hover:border-accent/40 hover:-translate-y-0.5 transition-all duration-150"
          >
            <div className="shrink-0 w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center">
              <span className="material-symbols-outlined text-accent text-[18px]">{icon}</span>
            </div>
            <span className="flex-1 min-w-0 text-[14px] font-medium text-ink leading-snug">{name}</span>
            <span className="shrink-0 text-xs font-medium text-ink-faint tabular-nums bg-paper px-2 py-0.5 rounded-full">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
