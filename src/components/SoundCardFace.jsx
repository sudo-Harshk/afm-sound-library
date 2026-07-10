import { useState, useEffect } from 'react';
import { ExternalLink, Play, Plus, Info, X } from 'lucide-react';
import { getYouTubeId, getDomainName, isValidUrl, isAllowedDomain } from '../lib/refs';
import { getCategoryIcon } from '../lib/icons';

const VISIBLE_CHIPS = 3;

export default function SoundCardFace({ sound, isFront, onAddReference, onLockDrag }) {
  const [playingUrl, setPlayingUrl] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isFront && detailOpen) {
      setDetailOpen(false);
      onLockDrag?.(false);
    }
  }, [isFront]);

  const openDetail = () => { setDetailOpen(true); onLockDrag?.(true); };
  const closeDetail = () => { setDetailOpen(false); onLockDrag?.(false); };

  const references = sound.references || [];
  const Icon = getCategoryIcon(sound.section || '');
  const playing = playingUrl ? references.find((r) => r.url === playingUrl) : null;
  const playingYtId = playing ? getYouTubeId(playing.url) : null;
  const hiddenCount = Math.max(0, references.length - VISIBLE_CHIPS);

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

  const stop = (e) => e.stopPropagation();

  const renderChip = (ref, i) => {
    const ytId = getYouTubeId(ref.url);
    const isPlaying = playingUrl === ref.url;
    return (
      <button
        key={i}
        onPointerDownCapture={stop}
        onClick={(e) => {
          e.stopPropagation();
          if (ytId) setPlayingUrl(isPlaying ? null : ref.url);
          else window.open(ref.url, '_blank', 'noopener,noreferrer');
        }}
        className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-medium backdrop-blur-sm transition-colors duration-150 ${
          isPlaying
            ? 'border-white/70 text-white bg-white/20'
            : 'border-white/25 text-white/90 bg-black/20 hover:border-white/60 hover:bg-black/35'
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white">
          {ytId ? <Play className="w-2.5 h-2.5 ml-0.5" /> : <ExternalLink className="w-2.5 h-2.5" />}
        </span>
        {getDomainName(ref.url)}
      </button>
    );
  };

  return (
    <div className="relative w-full h-full rounded-2xl border border-line shadow-[var(--shadow-card)] overflow-hidden select-none bg-gradient-to-br from-accent-soft to-paper-raised">
      {/* Poster artwork */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon className="w-32 h-32 text-accent/20" strokeWidth={1} />
      </div>

      {playingYtId && (
        <iframe
          src={`https://www.youtube.com/embed/${playingYtId}?autoplay=1&rel=0`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={sound.canonicalLabel}
        />
      )}

      {/* Info toggle */}
      <button
        onPointerDownCapture={stop}
        onClick={(e) => { e.stopPropagation(); openDetail(); }}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/40 transition-colors duration-150"
        aria-label="Show all references"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* Bottom scrim with title + chips */}
      <div className="absolute inset-x-0 bottom-0 px-4 pt-10 pb-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
        {sound.subcategory && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 mb-1 truncate">{sound.subcategory}</p>
        )}
        <h3 className="text-white font-semibold text-lg leading-snug mb-2.5 line-clamp-2">{sound.canonicalLabel}</h3>

        <div className="flex flex-wrap gap-1.5">
          {references.length === 0 && <p className="text-xs text-white/60">No references yet.</p>}
          {references.slice(0, VISIBLE_CHIPS).map(renderChip)}
          {hiddenCount > 0 && (
            <button
              onPointerDownCapture={stop}
              onClick={(e) => { e.stopPropagation(); openDetail(); }}
              className="inline-flex items-center px-2.5 py-1 rounded-full border border-white/25 text-xs font-medium text-white/90 bg-black/20 hover:bg-black/35 transition-colors duration-150"
            >
              +{hiddenCount} more
            </button>
          )}
        </div>
      </div>

      {/* Detail overlay */}
      {detailOpen && (
        <div
          onPointerDownCapture={stop}
          className="absolute inset-0 bg-paper-raised p-5 flex flex-col animate-expand"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              {sound.subcategory && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint mb-1 truncate">{sound.subcategory}</p>
              )}
              <h3 className="text-base font-semibold text-ink leading-snug">{sound.canonicalLabel}</h3>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); closeDetail(); }}
              className="shrink-0 w-7 h-7 rounded-full border border-line flex items-center justify-center text-ink-faint hover:text-ink transition-colors duration-150"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
            {references.length === 0 && <p className="text-sm text-ink-faint">No references yet.</p>}
            {references.map((ref, i) => {
              const ytId = getYouTubeId(ref.url);
              const isPlaying = playingUrl === ref.url;
              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ytId) setPlayingUrl(isPlaying ? null : ref.url);
                    else window.open(ref.url, '_blank', 'noopener,noreferrer');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors duration-150 ${
                    isPlaying ? 'border-accent text-accent bg-accent-soft' : 'border-line text-ink-soft hover:border-accent/50 hover:text-accent'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-accent-soft flex items-center justify-center text-accent shrink-0">
                    {ytId ? <Play className="w-2.5 h-2.5 ml-0.5" /> : <ExternalLink className="w-2.5 h-2.5" />}
                  </span>
                  {getDomainName(ref.url)}
                </button>
              );
            })}
          </div>

          <div className="shrink-0 pt-3 border-t border-line mt-3">
            {adding ? (
              <form onSubmit={submitReference} className="flex items-center gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => { setUrl(e.target.value); setError(''); }}
                  placeholder="https://…"
                  autoFocus={isFront}
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-paper border border-line rounded-lg text-xs text-ink placeholder-ink-faint focus:outline-none focus:border-accent transition-colors duration-150"
                />
                <button type="submit" disabled={saving} className="text-xs font-medium text-accent disabled:opacity-50 shrink-0">
                  {saving ? '…' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setAdding(false); setError(''); setUrl(''); }}
                  className="text-xs text-ink-faint shrink-0"
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
            {error && <p className="text-xs text-red-500 pt-1">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
