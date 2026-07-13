import { describe, it, expect } from 'vitest';
import {
  isAudioUrl,
  groupReferences,
  removeReferenceByUrl,
  getYouTubeId,
  getDomain,
  getDomainName,
  isValidUrl,
  isAllowedDomain,
} from '../refs';

describe('isAudioUrl', () => {
  it('returns true for direct MP3 URLs', () => {
    expect(isAudioUrl('https://example.com/sound.mp3')).toBe(true);
  });

  it('returns true for WAV URLs', () => {
    expect(isAudioUrl('https://example.com/sound.wav')).toBe(true);
  });

  it('returns true for OGG URLs', () => {
    expect(isAudioUrl('https://example.com/sound.ogg')).toBe(true);
  });

  it('returns true for M4A URLs', () => {
    expect(isAudioUrl('https://example.com/sound.m4a')).toBe(true);
  });

  it('returns true for FLAC URLs', () => {
    expect(isAudioUrl('https://example.com/sound.flac')).toBe(true);
  });

  it('returns true for URLs with query params', () => {
    expect(isAudioUrl('https://example.com/sound.mp3?token=abc')).toBe(true);
  });

  it('returns true for URLs with hash', () => {
    expect(isAudioUrl('https://example.com/sound.mp3#t=10')).toBe(true);
  });

  it('returns true for case-insensitive extensions', () => {
    expect(isAudioUrl('https://example.com/sound.MP3')).toBe(true);
    expect(isAudioUrl('https://example.com/sound.Wav')).toBe(true);
  });

  it('returns false for YouTube URLs', () => {
    expect(isAudioUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
  });

  it('returns false for Pixabay page URLs', () => {
    expect(isAudioUrl('https://pixabay.com/sound-effects/rattle-sound-457080/')).toBe(false);
  });

  it('returns false for non-audio URLs', () => {
    expect(isAudioUrl('https://example.com/image.png')).toBe(false);
    expect(isAudioUrl('https://example.com/page.html')).toBe(false);
  });

  it('returns false for null/undefined/empty', () => {
    expect(isAudioUrl(null)).toBe(false);
    expect(isAudioUrl(undefined)).toBe(false);
    expect(isAudioUrl('')).toBe(false);
  });
});

describe('groupReferences', () => {
  it('groups YouTube references correctly', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
      { url: 'https://youtu.be/abc12345678', addedBy: 'user' },
      { url: 'https://youtube.com/shorts/abc12345678', addedBy: 'user' },
    ];
    const groups = groupReferences(refs);
    expect(groups.youtube).toHaveLength(3);
    expect(groups.audio).toHaveLength(0);
    expect(groups.other).toHaveLength(0);
  });

  it('groups audio file references correctly', () => {
    const refs = [
      { url: 'https://r2.dev/audio/sound.mp3', addedBy: 'user' },
      { url: 'https://example.com/recording.wav', addedBy: 'user' },
    ];
    const groups = groupReferences(refs);
    expect(groups.youtube).toHaveLength(0);
    expect(groups.audio).toHaveLength(2);
    expect(groups.other).toHaveLength(0);
  });

  it('groups non-YouTube non-audio references as other', () => {
    const refs = [
      { url: 'https://pixabay.com/sound-effects/rattle-457080/', addedBy: 'user' },
      { url: 'https://soundcloud.com/artist/track', addedBy: 'user' },
    ];
    const groups = groupReferences(refs);
    expect(groups.youtube).toHaveLength(0);
    expect(groups.audio).toHaveLength(0);
    expect(groups.other).toHaveLength(2);
  });

  it('handles mixed reference types', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
      { url: 'https://r2.dev/audio/dog-barking.mp3', addedBy: 'user' },
      { url: 'https://pixabay.com/sound-effects/rattle-457080/', addedBy: 'user' },
    ];
    const groups = groupReferences(refs);
    expect(groups.youtube).toHaveLength(1);
    expect(groups.audio).toHaveLength(1);
    expect(groups.other).toHaveLength(1);
  });

  it('adds youtubeId to YouTube references', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', addedBy: 'user' },
    ];
    const groups = groupReferences(refs);
    expect(groups.youtube[0].youtubeId).toBe('dQw4w9WgXcQ');
  });

  it('preserves original ref properties', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user', addedAt: '2025-01-01' },
    ];
    const groups = groupReferences(refs);
    expect(groups.youtube[0].addedBy).toBe('user');
    expect(groups.youtube[0].addedAt).toBe('2025-01-01');
  });

  it('returns empty groups for null/undefined input', () => {
    expect(groupReferences(null)).toEqual({ youtube: [], audio: [], other: [] });
    expect(groupReferences(undefined)).toEqual({ youtube: [], audio: [], other: [] });
  });

  it('returns empty groups for empty array', () => {
    expect(groupReferences([])).toEqual({ youtube: [], audio: [], other: [] });
  });

  it('skips refs with missing url', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
      { addedBy: 'user' }, // no url
      null,
    ];
    const groups = groupReferences(refs);
    expect(groups.youtube).toHaveLength(1);
    expect(groups.audio).toHaveLength(0);
    expect(groups.other).toHaveLength(0);
  });
});

describe('getYouTubeId', () => {
  it('extracts ID from youtube.com/watch?v= URL', () => {
    expect(getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from youtu.be short URL', () => {
    expect(getYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from youtube.com/shorts/ URL', () => {
    expect(getYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for non-YouTube URLs', () => {
    expect(getYouTubeId('https://pixabay.com/sound-effects/123/')).toBe(null);
  });

  it('returns null for null/undefined', () => {
    expect(getYouTubeId(null)).toBe(null);
    expect(getYouTubeId(undefined)).toBe(null);
  });
});

describe('getDomain', () => {
  it('extracts domain from URL', () => {
    expect(getDomain('https://www.youtube.com/watch?v=abc')).toBe('youtube.com');
  });

  it('removes www prefix', () => {
    expect(getDomain('https://www.example.com/path')).toBe('example.com');
  });

  it('returns link for invalid URL', () => {
    expect(getDomain('not-a-url')).toBe('link');
  });
});

describe('getDomainName', () => {
  it('returns YouTube for YouTube URLs', () => {
    expect(getDomainName('https://www.youtube.com/watch?v=abc')).toBe('YouTube');
    expect(getDomainName('https://youtu.be/abc')).toBe('YouTube');
  });

  it('returns Pixabay for Pixabay URLs', () => {
    expect(getDomainName('https://pixabay.com/sound-effects/123/')).toBe('Pixabay');
  });

  it('returns domain for other URLs', () => {
    expect(getDomainName('https://r2.dev/audio/sound.mp3')).toBe('r2.dev');
  });
});

describe('isValidUrl', () => {
  it('returns true for valid HTTP URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('returns true for valid HTTPS URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('returns false for invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });
});

describe('isAllowedDomain', () => {
  it('returns true for YouTube', () => {
    expect(isAllowedDomain('https://www.youtube.com/watch?v=abc')).toBe(true);
  });

  it('returns true for Pixabay', () => {
    expect(isAllowedDomain('https://pixabay.com/sound-effects/123/')).toBe(true);
  });

  it('returns false for unknown domains', () => {
    expect(isAllowedDomain('https://soundcloud.com/track')).toBe(false);
  });
});

describe('removeReferenceByUrl', () => {
  it('removes a reference matching the given URL', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
      { url: 'https://www.youtube.com/watch?v=xyz98765432', addedBy: 'user' },
    ];
    const result = removeReferenceByUrl(refs, 'https://www.youtube.com/watch?v=abc12345678');
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://www.youtube.com/watch?v=xyz98765432');
  });

  it('removes only the matching URL when duplicates exist', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'other' },
      { url: 'https://www.youtube.com/watch?v=xyz98765432', addedBy: 'user' },
    ];
    const result = removeReferenceByUrl(refs, 'https://www.youtube.com/watch?v=abc12345678');
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://www.youtube.com/watch?v=xyz98765432');
  });

  it('returns empty array when removing the only reference', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
    ];
    const result = removeReferenceByUrl(refs, 'https://www.youtube.com/watch?v=abc12345678');
    expect(result).toEqual([]);
  });

  it('returns original array when URL does not match any ref', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
    ];
    const result = removeReferenceByUrl(refs, 'https://www.youtube.com/watch?v=nonexistent');
    expect(result).toHaveLength(1);
  });

  it('handles references with extra fields (spreadsheet imports)', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user', addedAt: '2025-01-01', source: 'spreadsheet' },
      { url: 'https://www.youtube.com/watch?v=xyz98765432', addedBy: 'user', addedAt: '2025-01-02' },
    ];
    const result = removeReferenceByUrl(refs, 'https://www.youtube.com/watch?v=abc12345678');
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://www.youtube.com/watch?v=xyz98765432');
  });

  it('handles references with missing addedBy/addedAt', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678' },
      { url: 'https://www.youtube.com/watch?v=xyz98765432', addedBy: 'user' },
    ];
    const result = removeReferenceByUrl(refs, 'https://www.youtube.com/watch?v=abc12345678');
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://www.youtube.com/watch?v=xyz98765432');
  });

  it('returns empty array for null/undefined input', () => {
    expect(removeReferenceByUrl(null, 'url')).toEqual([]);
    expect(removeReferenceByUrl(undefined, 'url')).toEqual([]);
  });

  it('returns empty array for empty input array', () => {
    expect(removeReferenceByUrl([], 'url')).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const refs = [
      { url: 'https://www.youtube.com/watch?v=abc12345678', addedBy: 'user' },
      { url: 'https://www.youtube.com/watch?v=xyz98765432', addedBy: 'user' },
    ];
    removeReferenceByUrl(refs, 'https://www.youtube.com/watch?v=abc12345678');
    expect(refs).toHaveLength(2);
  });

  it('removes audio file references by URL', () => {
    const refs = [
      { url: 'https://r2.dev/audio/sound.mp3', addedBy: 'user' },
      { url: 'https://r2.dev/audio/other.mp3', addedBy: 'user' },
    ];
    const result = removeReferenceByUrl(refs, 'https://r2.dev/audio/sound.mp3');
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://r2.dev/audio/other.mp3');
  });
});
