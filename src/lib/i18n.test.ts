import { describe, expect, it } from 'vitest';

import { localeFromValue, translate } from './i18n';

describe('i18n', () => {
  it('uses English when no valid locale is provided', () => {
    expect(localeFromValue(undefined)).toBe('en');
    expect(localeFromValue('fr')).toBe('en');
  });

  it('translates navigation labels for Japanese and Chinese', () => {
    expect(translate('ja', 'nav.movies')).toBe('映画');
    expect(translate('zh', 'nav.movies')).toBe('电影');
  });

  it('localizes the brand name with the selected language', () => {
    expect(translate('en', 'brand.full')).toBe('Reelmark');
    expect(translate('ja', 'brand.full')).toBe('エイセキ');
    expect(translate('zh', 'brand.full')).toBe('映迹');
  });

  it('replaces message values', () => {
    expect(translate('en', 'media.posterAlt', { name: 'Dune' })).toBe(
      'Poster of Dune',
    );
  });
});
