import { useState } from 'react';
import { ExternalLink, Play, Plus } from 'lucide-react';
import { getYouTubeId, getDomainName, isValidUrl, isAllowedDomain } from '../lib/refs';
import { getCategoryIcon } from '../lib/icons';

export default function SoundCardFace({ sound, isFront, onAddReference }) {
  const [playingUrl, setPlayingUrl] = useState(null);
  const [adding, setAdding] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const references = sound.references || [];
  const Icon = getCategoryIcon(sound.section || '');
  const playing = playingUrl ? references.find((r) => r.url === playingUrl) : null;
  const playingYtId = playing ? getYouTubeId(playing.url) : null;

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
    <div className="w-full h-full flex flex-col rounded-2xl border border-line bg-paper-raised shadow-[var(--shadow-card)] overflow-hidden select-none">
      <div className="relative h-28 shrink-0 bg-accent-soft flex items-center justify-center">
        {playingYtId ? (
          <iframe
            src={`https://www.youtube.com/embed/${playingYtId}?autoplay=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={sound.canonicalLabel}
          />
        ) : (
          <Icon className="w-9 h-9 text-accent" strokeWidth={1.5} />
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col p-5 gap-3">
        <div>
          {sound.subcategory && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint mb-1 truncate">{sound.subcategory}</p>
          )}
          <h3 className="text-lg font-semibold text-ink leading-snug">{sound.canonicalLabel}</h3>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-wrap content-start gap-1.5">
          {references.length === 0 && <p className="text-sm text-ink-faint">No references yet.</p>}
          {references.map((ref, i) => {
            const ytId = getYouTubeId(ref.url);
            const isPlaying = playingUrl === ref.url;
            return (
              <button
                key={i}
                onPointerDownCapture={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (ytId) setPlayingUrl(isPlaying ? null : ref.url);
                  else window.open(ref.url, '_blank', 'noopener,noreferrer');
                }}
                className={`inline-flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-medium transition-colors duration-150 ${
                  isPlaying ? 'border-accent text-accent bg-accent-soft' : 'border-line text-ink-soft hover:border-accent/50 hover:text-accent'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-accent-soft flex items-center justify-center text-accent">
                  {ytId ? <Play className="w-2.5 h-2.5 ml-0.5" /> : <ExternalLink className="w-2.5 h-2.5" />}
                </span>
                {getDomainName(ref.url)}
              </button>
            );
          })}
        </div>

        <div className="shrink-0 pt-1 border-t border-line">
          {adding ? (
            <form
              onSubmit={submitReference}
              onPointerDownCapture={(e) => e.stopPropagation()}
              className="flex items-center gap-2 pt-2"
            >
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
              onPointerDownCapture={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setAdding(true); }}
              className="flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-accent transition-colors duration-150 pt-2"
            >
              <Plus className="w-3 h-3" />
              Add reference
            </button>
          )}
          {error && <p className="text-xs text-red-500 pt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
