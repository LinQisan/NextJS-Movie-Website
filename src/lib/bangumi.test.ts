import { describe, expect, it } from 'vitest';

import { normalizeBangumiTitle, scoreBangumiCandidate } from './bangumi-match';

describe('Bangumi matching helpers', () => {
  it('normalizes punctuation and spacing across title variants', () => {
    expect(normalizeBangumiTitle('葬送のフリーレン！')).toBe(
      normalizeBangumiTitle('葬送のフリーレン'),
    );
  });

  it('prefers an exact title and matching year', () => {
    const score = scoreBangumiCandidate(
      {
        name: '葬送のフリーレン',
        name_cn: '葬送的芙莉莲',
        date: '2023-09-29',
        platform: 'TV',
      },
      {
        title: "Frieren: Beyond Journey's End",
        originalTitle: '葬送のフリーレン',
        year: '2023',
        media: 'tv',
      },
    );

    expect(score).toBeGreaterThan(1);
  });

  it('rejects unrelated titles', () => {
    const score = scoreBangumiCandidate(
      {
        name: '葬送のフリーレン',
        name_cn: '葬送的芙莉莲',
        date: '2023-09-29',
        platform: 'TV',
      },
      {
        title: 'One Piece',
        year: '1999',
        media: 'tv',
      },
    );

    expect(score).toBe(0);
  });
});
