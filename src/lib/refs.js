export const ALLOWED_DOMAINS = ['youtube.com', 'youtu.be', 'pixabay.com'];

export function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'link';
  }
}

export function getDomainName(url) {
  const domain = getDomain(url);
  if (domain.includes('youtube') || domain.includes('youtu.be')) return 'YouTube';
  if (domain.includes('pixabay')) return 'Pixabay';
  return domain;
}

export function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isAllowedDomain(value) {
  const domain = getDomain(value);
  return ALLOWED_DOMAINS.some((d) => domain.includes(d));
}

export function isAudioUrl(url) {
  if (!url) return false;
  return /\.(mp3|wav|ogg|m4a|flac)(\?|#|$)/i.test(url);
}

export function groupReferences(references) {
  const groups = { youtube: [], audio: [], other: [] };
  if (!references || !Array.isArray(references)) return groups;
  for (const ref of references) {
    if (!ref || !ref.url) continue;
    const ytId = getYouTubeId(ref.url);
    const isAudio = isAudioUrl(ref.url);
    if (ytId) {
      groups.youtube.push({ ...ref, youtubeId: ytId });
    } else if (isAudio) {
      groups.audio.push(ref);
    } else {
      groups.other.push(ref);
    }
  }
  return groups;
}

export function removeReferenceByUrl(references, url) {
  if (!references || !Array.isArray(references)) return [];
  return references.filter((r) => r.url !== url);
}

export function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  const ytId = getYouTubeId(trimmed);
  if (ytId) return `https://www.youtube.com/watch?v=${ytId}`;
  try {
    const parsed = new URL(trimmed);
    return `${parsed.hostname.replace(/^www\./, '')}${parsed.pathname.replace(/\/+$/, '')}`.toLowerCase();
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, '');
  }
}

export function hasReferenceUrl(references, url) {
  if (!references || !Array.isArray(references)) return false;
  const needle = normalizeUrl(url);
  return references.some((r) => normalizeUrl(r.url) === needle);
}

export function searchSounds(sounds, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const scored = [];
  for (const s of sounds) {
    const label = (s.canonicalLabel || '').toLowerCase();
    let score = 0;
    if (label === q) score = 4;
    else if (label.startsWith(q)) score = 3;
    else if (label.includes(q)) score = 2;
    else if ((s.subcategory || '').toLowerCase().includes(q)) score = 1;

    if (score > 0) scored.push({ sound: s, score });
  }

  scored.sort((a, b) => b.score - a.score || a.sound.canonicalLabel.localeCompare(b.sound.canonicalLabel));
  return scored.map((s) => s.sound);
}
