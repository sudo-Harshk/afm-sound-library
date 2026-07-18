import { useState } from 'react';
import { ChevronDown, Plus, ExternalLink, Play, X } from 'lucide-react';
import { getYouTubeId, getDomainName, isValidUrl, isAllowedDomain, groupReferences, hasReferenceUrl } from '../lib/refs';

export default function LabelRow({ sound, showBreadcrumb = true, onAddReference, onDeleteReference, canDelete }) {
  const [open, setOpen] = useState(false);
  const [playingUrl, setPlayingUrl] = useState(null);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const references = sound.references || [];

  const submitReference = async (e) => {
    e.preventDefault();
    const value = url.trim();
    if (!value) return setError('Enter a URL');
    if (!isValidUrl(value)) return setError('Enter a valid URL');
    if (!isAllowedDomain(value)) return setError('Domain not supported');
    if (hasReferenceUrl(references, value)) return setError('This URL is already added');

    setSaving(true);
    try {
      await onAddReference(sound.id, value);
      setUrl('');
      setAdding(false);
      setError('');
    } catch (e) {
      if (e?.message === 'DUPLICATE_URL') return setError('This URL is already added');
      setError('Failed to add — try again');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ref) => {
    if (!window.confirm('Delete this reference?')) return;
    try {
      await onDeleteReference(sound.id, ref);
    } catch {
      // silent
    }
  };

  return (
    <div className="rounded-lg hover:bg-paper transition-colors duration-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-3 py-3 text-left"
      >
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 text-ink-faint transition-transform duration-150 ${open ? 'rotate-180 text-accent' : ''}`} />
        <span className="text-[15px] text-ink flex-1 min-w-0 truncate">{sound.canonicalLabel}</span>
        {showBreadcrumb && sound.subcategory && (
          <span className="hidden sm:block text-xs text-ink-faint truncate max-w-[240px]">{sound.subcategory}</span>
        )}
        <span className={`shrink-0 text-xs font-medium tabular-nums px-2 py-0.5 rounded-full ${references.length ? 'text-accent bg-accent-soft' : 'text-ink-faint bg-paper'}`}>
          {references.length || '—'}
        </span>
      </button>

      {open && (
        <div className="pl-9 pr-3 pb-4 space-y-3 animate-expand">
          {references.length === 0 && (
            <p className="text-sm text-ink-faint">No references yet.</p>
          )}

          {(() => {
            const groups = groupReferences(references);
            const sections = [
              { key: 'youtube', title: 'YouTube', refs: groups.youtube },
              { key: 'audio', title: 'Audio', refs: groups.audio },
              { key: 'other', title: 'Other', refs: groups.other },
            ].filter((s) => s.refs.length > 0);
            return sections.map((section) => (
              <div key={section.key} className="space-y-2">
                <p className="text-[10px] font-medium text-ink-faint">
                  {section.title}{' '}
                  <span className="text-ink-faint/50">({section.refs.length})</span>
                </p>
                <div className="space-y-2">
                  {section.key === 'audio' ? (
                    section.refs.map((ref, i) => (
                      <div
                        key={i}
                        className="w-full px-3 py-2 rounded-lg border border-line bg-paper-raised"
                      >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-[10px] text-ink-faint truncate min-w-0">{ref.url}</p>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(ref)}
                                className="shrink-0 p-0.5 rounded hover:bg-red-500/10 text-ink-faint hover:text-red-500 transition-colors"
                                title="Delete reference"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        <audio controls preload="none" className="w-full h-7">
                          <source src={ref.url} />
                        </audio>
                      </div>
                    ))
                  ) : (
                    section.refs.map((ref, i) => {
                      const ytId = ref.youtubeId || getYouTubeId(ref.url);
                      const isPlaying = playingUrl === ref.url;
                      return (
                        <div key={i} className="space-y-2">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => ytId ? setPlayingUrl(isPlaying ? null : ref.url) : window.open(ref.url, '_blank', 'noopener,noreferrer')}
                              className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full border border-line bg-paper-raised text-xs font-medium text-ink-soft hover:border-accent/50 hover:text-accent transition-colors duration-150"
                            >
                              <span className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center text-accent">
                                {ytId ? <Play className="w-2.5 h-2.5 ml-0.5" /> : <ExternalLink className="w-2.5 h-2.5" />}
                              </span>
                              {getDomainName(ref.url)}
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(ref)}
                                className="p-1 rounded hover:bg-red-500/10 text-ink-faint hover:text-red-500 transition-colors"
                                title="Delete reference"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {isPlaying && ytId && (
                            <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-line shadow-[var(--shadow-card)]">
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                                title={sound.canonicalLabel}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ));
          })()}

          {adding ? (
            <form onSubmit={submitReference} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                placeholder="https://…"
                autoFocus
                className="flex-1 min-w-0 px-3 py-1.5 bg-paper-raised border border-line rounded-lg text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-accent transition-colors duration-150"
              />
              <button
                type="submit"
                disabled={saving}
                className="text-sm font-medium text-accent disabled:opacity-50 shrink-0"
              >
                {saving ? 'Adding…' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setError(''); setUrl(''); }}
                className="text-sm text-ink-faint shrink-0"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-accent transition-colors duration-150"
            >
              <Plus className="w-3 h-3" />
              Add reference
            </button>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}
