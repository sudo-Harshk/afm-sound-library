export const ALLOWED_DOMAINS = [
  'youtube.com', 'youtu.be', 'pixabay.com', 'freesound.org',
  'audio.com', 'soundcloud.com', 'instagram.com',
];

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
  if (domain.includes('freesound')) return 'Freesound';
  if (domain.includes('audio.com')) return 'Audio.com';
  if (domain.includes('soundcloud')) return 'SoundCloud';
  if (domain.includes('instagram')) return 'Instagram';
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
    else if ((s.subcategory || '').toLowerCase().includes(q) || (s.section || '').toLowerCase().includes(q)) score = 1;

    if (score > 0) scored.push({ sound: s, score });
  }

  scored.sort((a, b) => b.score - a.score || a.sound.canonicalLabel.localeCompare(b.sound.canonicalLabel));
  return scored.map((s) => s.sound);
}
