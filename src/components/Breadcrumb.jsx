export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-[12px] font-medium text-ink-faint mb-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && (
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          )}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-accent transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={i === items.length - 1 ? 'text-accent' : ''}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
