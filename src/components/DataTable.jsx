import { useState } from 'react';

const COLUMNS = [
  { key: 'canonicalLabel', label: 'Label Name', sortable: true },
  { key: 'subcategory', label: 'Subcategory', sortable: true },
  { key: 'section', label: 'Category', sortable: true },
  { key: 'referenceCount', label: 'Reference Count', sortable: true },
  { key: 'action', label: '', sortable: false },
];

const PAGE_SIZE = 10;

export default function DataTable({ sounds, onRowClick }) {
  const [sortKey, setSortKey] = useState('canonicalLabel');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  const sorted = [...sounds].sort((a, b) => {
    let aVal, bVal;
    if (sortKey === 'referenceCount') {
      aVal = (a.references || []).length;
      bVal = (b.references || []).length;
    } else {
      aVal = (a[sortKey] || '').toLowerCase();
      bVal = (b[sortKey] || '').toLowerCase();
    }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div>
      <div className="bg-paper border border-line rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-6 py-3 text-[11px] font-semibold uppercase tracking-wider border-b border-line ${
                    col.sortable ? 'cursor-pointer select-none hover:text-accent' : ''
                  } text-ink-faint`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
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
            {paged.map((sound) => (
              <tr
                key={sound.id}
                onClick={() => onRowClick?.(sound)}
                className="group hover:bg-surface-container-low transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-[13px] font-semibold text-ink">{sound.canonicalLabel}</td>
                <td className="px-6 py-4 text-[13px] text-ink-soft">{sound.subcategory || '—'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 bg-accent-soft/40 text-accent border border-accent-soft rounded text-[11px] font-medium">
                    {sound.section}
                  </span>
                </td>
                <td className="px-6 py-4 text-[13px] font-mono text-ink">{(sound.references || []).length}</td>
                <td className="px-6 py-4 text-right">
                  <span className="material-symbols-outlined text-[18px] text-ink-faint group-hover:text-accent transition-colors">
                    open_in_new
                  </span>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[13px] text-ink-faint">
                  No sounds found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {sorted.length > 0 && (
          <div className="px-6 py-3 bg-surface-container-low flex items-center justify-between border-t border-line">
            <span className="text-[13px] text-ink-faint">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} results
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1 rounded hover:bg-surface-container-high disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 py-1 rounded text-[12px] font-medium transition-colors ${
                    i === page
                      ? 'bg-accent text-on-primary'
                      : 'hover:bg-surface-container-high text-ink-soft'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded hover:bg-surface-container-high disabled:opacity-30 transition-colors"
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
