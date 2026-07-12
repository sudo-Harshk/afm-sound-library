import { useState } from 'react';
import { getYouTubeId, getDomainName, isValidUrl, isAllowedDomain } from '../lib/refs';
import { getCategoryIcon } from '../lib/icons';

export default function DetailPanel({ sound, onClose, onAddReference }) {
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!sound) return null;

  const references = sound.references || [];
  const sectionIcon = getCategoryIcon(sound.section || '');
  const firstYoutube = references.find((r) => getYouTubeId(r.url));
  const youtubeId = firstYoutube ? getYouTubeId(firstYoutube.url) : null;

  const submitReference = async (e) => {
    e.preventDefault();
    const value = url.trim();
    if (!value) return setError('Enter a URL');
    if (!isValidUrl(value)) return setError('Enter a valid URL');
    if (!isAllowedDomain(value)) return setError('Domain not supported');

    setSaving(true);
    try {
      await onAddReference(sound.id, value);
      setUrl('');
      setAdding(false);
      setError('');
    } catch {
      setError('Failed to add — try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-50 lg:block hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-[400px] bg-paper border-l border-line z-50 flex flex-col animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-line shrink-0">
          <h3 className="text-[18px] font-semibold text-ink">Label Details</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Media preview */}
          <div className="w-full aspect-video bg-black relative">
            {youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                className="absolute inset-0 w-full h-full"
                allow="encrypted-media"
                allowFullScreen
                title={sound.canonicalLabel}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white/20" style={{ fontSize: '80px' }}>
                  {sectionIcon}
                </span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Label details */}
            <div>
              <h2 className="text-[20px] font-semibold text-ink mb-2">{sound.canonicalLabel}</h2>
              <span className="inline-flex items-center px-2 py-1 bg-accent-soft/40 text-accent border border-accent-soft rounded text-[11px] font-medium">
                {sound.section}
              </span>
            </div>

            {/* Metadata */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Metadata</h4>
              <div className="space-y-3">
                <div className="p-3 bg-surface-container-low rounded border border-line">
                  <p className="text-[11px] text-ink-faint mb-1">Typical Example</p>
                  <p className="text-[13px] text-ink">{sound.typicalExample || '—'}</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded border border-line">
                  <p className="text-[11px] text-ink-faint mb-1">Acoustic Profile</p>
                  <p className="text-[13px] text-ink">{sound.acousticProfile || '—'}</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded border border-line">
                  <p className="text-[11px] text-ink-faint mb-1">Confusable Labels</p>
                  <p className="text-[13px] text-ink">{sound.confusableLabels || '—'}</p>
                </div>
              </div>
            </div>

            {/* Taxonomy path */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">Taxonomy Path</h4>
              <div className="space-y-2 ml-1">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
                  <span className="text-[13px] text-ink">{sound.section}</span>
                </div>
                {sound.subcategory && (
                  <div className="flex items-center gap-3 ml-4 border-l-2 border-line pl-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-ink-faint" />
                    <span className="text-[13px] text-ink">{sound.subcategory}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 ml-4 border-l-2 border-accent pl-4">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-[13px] font-semibold text-accent">{sound.canonicalLabel}</span>
                </div>
              </div>
            </div>

            {/* References list */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">References</h4>
              {references.length === 0 ? (
                <p className="text-[13px] text-ink-faint">No references yet.</p>
              ) : (
                <div className="space-y-2">
                  {references.map((ref, i) => {
                    const ytId = getYouTubeId(ref.url);
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (ytId) {
                            window.open(ref.url, '_blank', 'noopener,noreferrer');
                          } else {
                            window.open(ref.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-line text-[13px] font-medium text-ink-soft hover:border-accent/50 hover:text-accent transition-colors"
                      >
                        <span className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center text-accent shrink-0">
                          <span className="material-symbols-outlined text-[14px]">
                            {ytId ? 'play_arrow' : 'open_in_new'}
                          </span>
                        </span>
                        {getDomainName(ref.url)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add reference form */}
            <div className="pt-4 border-t border-line">
              {adding ? (
                <form onSubmit={submitReference} className="space-y-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(''); }}
                    placeholder="https://..."
                    autoFocus
                    className="w-full px-3 py-2 bg-surface-container border border-line rounded-lg text-[13px] text-ink placeholder-ink-faint focus:outline-none focus:border-accent transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-accent text-on-primary rounded-lg text-[12px] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAdding(false); setError(''); setUrl(''); }}
                      className="px-4 py-2 text-[12px] text-ink-faint hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  {error && <p className="text-[12px] text-red-500">{error}</p>}
                </form>
              ) : (
                <button
                  onClick={() => setAdding(true)}
                  className="flex items-center gap-1.5 text-[13px] font-medium text-ink-faint hover:text-accent transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add reference
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
