import { useState, useMemo } from 'react';

const COLUMNS = [
  { key: 'canonicalLabel', label: 'Canonical Label', sortable: true },
  { key: 'subcategory', label: 'Subcategory', sortable: true },
  { key: 'description', label: 'Description', sortable: false },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;
const ELLIPSIS = '…';

function getPageItems(page, totalPages) {
  const SIBLINGS = 1;
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const items = [0];
  const start = Math.max(1, page - SIBLINGS);
  const end = Math.min(totalPages - 2, page + SIBLINGS);

  if (start > 1) items.push(ELLIPSIS);
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 2) items.push(ELLIPSIS);

  items.push(totalPages - 1);
  return items;
}

export default function DataTable({ sounds, onRowClick, preserveOrder = false, compareMode = false, compareList = [], onToggleCompare }) {
  const [sortKey, setSortKey] = useState('canonicalLabel');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [userSorted, setUserSorted] = useState(false);

  const handleSort = (key) => {
    setUserSorted(true);
    if (!key) return;
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sorted = useMemo(() => {
    if (preserveOrder && !userSorted) return sounds;
    return [...sounds].sort((a, b) => {
      const aVal = (a[sortKey] || '').toLowerCase();
      const bVal = (b[sortKey] || '').toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sounds, sortKey, sortDir, preserveOrder, userSorted]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(0);
  };

  const pageItems = getPageItems(page, totalPages);
  const fillerCount = totalPages > 1 ? pageSize - paged.length : 0;

  return (
    <div data-tour="table">
      <div className="bg-paper border border-line rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              {compareMode && (
                <th className="w-12 px-4 py-3 border-b border-line">
                  <span className="sr-only">Select to compare</span>
                </th>
              )}
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && !(preserveOrder && col.key === 'canonicalLabel') && handleSort(col.key)}
                  className={`px-6 py-3 text-[11px] font-semibold uppercase tracking-wider border-b border-line ${
                    col.sortable && !(preserveOrder && col.key === 'canonicalLabel') ? 'cursor-pointer select-none hover:text-accent' : ''
                  } text-ink-faint`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && !(preserveOrder && col.key === 'canonicalLabel') && sortKey === col.key && (
                      <span className="material-symbols-outlined text-[14px]">
                        {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paged.map((sound) => {
              const isChecked = compareList.includes(sound.id);
              const isDisabled = compareMode && compareList.length >= 2 && !isChecked;
              return (
                <tr
                  key={sound.id}
                  onClick={() => !compareMode && onRowClick?.(sound)}
                  className={`transition-colors ${compareMode ? 'cursor-default' : 'hover:bg-surface-container-low cursor-pointer'}`}
                >
                  {compareMode && (
                    <td className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => onToggleCompare?.(sound.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-4 h-4 rounded border-line accent-accent ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      />
                    </td>
                  )}
                  <td className="px-6 py-4 text-[13px] font-semibold text-ink">{sound.canonicalLabel}</td>
                  <td className="px-6 py-4 text-[13px] text-ink-soft">{sound.subcategory || '—'}</td>
                  <td className="px-6 py-4 text-[13px] text-ink-soft max-w-[420px] truncate">{sound.description || '—'}</td>
                </tr>
              );
            })}
            {fillerCount > 0 &&
              Array.from({ length: fillerCount }, (_, i) => (
                <tr key={`filler-${i}`} aria-hidden="true" style={{ borderColor: 'transparent' }}>
                  <td className="px-6 py-4" colSpan={compareMode ? 4 : 3}>&nbsp;</td>
                </tr>
              ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={compareMode ? 4 : 3} className="px-6 py-12 text-center text-[13px] text-ink-faint">
                  No sounds found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {sorted.length > 0 && (
          <div className="px-6 py-4 bg-surface-container-low border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 order-2 sm:order-1">
              <span className="text-[12px] text-ink-faint whitespace-nowrap">
                <span className="text-ink font-semibold tabular-nums">{page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)}</span>
                {' '}of{' '}
                <span className="tabular-nums">{sorted.length}</span>
              </span>

              <div className="h-4 w-px bg-line" />

              <div className="inline-flex items-center gap-0.5 p-0.5 rounded-full bg-surface-container-high">
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    onClick={() => handlePageSizeChange(size)}
                    aria-current={size === pageSize ? 'true' : undefined}
                    className={`px-2.5 h-6 rounded-full text-[11px] font-semibold tabular-nums transition-colors ${
                      size === pageSize
                        ? 'bg-accent text-on-primary shadow-sm'
                        : 'text-ink-faint hover:text-ink'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 order-1 sm:order-2 self-end sm:self-auto">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                aria-label="Previous page"
                className="w-8 h-8 flex items-center justify-center rounded-full text-ink-soft hover:bg-surface-container-high hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-0.5">
                {pageItems.map((item, idx) =>
                  item === ELLIPSIS ? (
                    <span key={`ellipsis-${idx}`} className="w-8 text-center text-[12px] text-ink-faint select-none">
                      ⋯
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      aria-current={item === page ? 'page' : undefined}
                      className={`w-8 h-8 rounded-full text-[12px] font-semibold tabular-nums transition-colors ${
                        item === page
                          ? 'bg-accent text-on-primary shadow-sm'
                          : 'text-ink-soft hover:bg-surface-container-high hover:text-ink'
                      }`}
                    >
                      {item + 1}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                aria-label="Next page"
                className="w-8 h-8 flex items-center justify-center rounded-full text-ink-soft hover:bg-surface-container-high hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
