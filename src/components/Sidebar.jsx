import { getCategoryIcon } from '../lib/icons';

export default function Sidebar({
  categories,
  activeCategory,
  onSelectCategory,
  theme,
  onToggleTheme,
  width,
  isDragging,
  onStartDrag,
  onResetWidth,
}) {
  const totalSounds = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <aside
      data-tour="sidebar"
      className="hidden lg:flex fixed left-0 top-0 h-screen flex-col border-r border-line bg-paper z-50"
      style={{ width }}
    >
      <div className="p-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-accent text-[16px]">graphic_eq</span>
          </div>
          <h1 className="text-[18px] font-semibold text-ink tracking-tight">AFM Sound Catalog</h1>
        </div>
        <p className="text-[13px] text-ink-soft mt-1 opacity-70">Sound Taxonomy Reference</p>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded text-[12px] font-medium transition-colors mb-1 ${
            activeCategory === null
              ? 'bg-accent-soft text-accent border-l-2 border-accent'
              : 'text-ink-soft hover:bg-surface-container-high border-l-2 border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span className="flex-1 min-w-0 text-left">All Categories</span>
          <span className="text-[11px] text-ink-faint tabular-nums">{totalSounds}</span>
        </button>

        <div className="h-px bg-line mx-2 my-2" />

        {categories.map(({ name, count }) => {
          const icon = getCategoryIcon(name);
          const isActive = name === activeCategory;
          return (
            <button
              key={name}
              onClick={() => onSelectCategory(isActive ? null : name)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded text-[12px] font-medium transition-colors ${
                isActive
                  ? 'bg-accent-soft text-accent border-l-2 border-accent'
                  : 'text-ink-soft hover:bg-surface-container-high border-l-2 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] shrink-0">{icon}</span>
              <span className="flex-1 min-w-0 text-left">{name}</span>
              <span className="text-[11px] text-ink-faint tabular-nums shrink-0">{count}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-line">
        <button
          onClick={onToggleTheme}
          data-tour="theme"
          className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-medium text-ink-soft hover:bg-surface-container-high rounded transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">
            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
          Theme
        </button>
      </div>

      <div
        onMouseDown={onStartDrag}
        onDoubleClick={onResetWidth}
        title="Drag to resize · double-click to reset"
        className={`absolute top-0 right-0 h-full w-1 cursor-col-resize group ${isDragging ? 'bg-accent' : 'hover:bg-accent/50'}`}
      >
        <div className={`absolute inset-y-0 -right-1 w-3 ${isDragging ? '' : 'group-hover:bg-accent/10'}`} />
      </div>
    </aside>
  );
}
