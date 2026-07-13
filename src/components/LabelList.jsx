import LabelRow from './LabelRow';

export default function LabelList({ sounds, groupBySubcategory = false, onAddReference, onDeleteReference }) {
  if (sounds.length === 0) {
    return <p className="py-8 text-sm text-ink-faint">No sounds found.</p>;
  }

  if (!groupBySubcategory) {
    return (
      <div className="rounded-xl border border-line bg-paper-raised shadow-[var(--shadow-card)] p-2 divide-y divide-line">
        {sounds.map((sound) => (
          <LabelRow key={sound.id} sound={sound} onAddReference={onAddReference} onDeleteReference={onDeleteReference} />
        ))}
      </div>
    );
  }

  const groups = new Map();
  for (const sound of sounds) {
    const key = sound.subcategory || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(sound);
  }

  return (
    <div className="rounded-xl border border-line bg-paper-raised shadow-[var(--shadow-card)] p-2 space-y-1">
      {[...groups.entries()].map(([subcategory, items], i) => (
        <div key={subcategory} className={i > 0 ? 'pt-3 mt-2 border-t border-line' : ''}>
          {subcategory && (
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint px-3 mb-1">{subcategory}</h3>
          )}
          <div className="divide-y divide-line">
            {items.map((sound) => (
              <LabelRow key={sound.id} sound={sound} showBreadcrumb={false} onAddReference={onAddReference} onDeleteReference={onDeleteReference} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
