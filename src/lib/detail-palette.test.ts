import { describe, expect, it } from 'vitest';

import {
  createThemeVars,
  getContrastText,
  type ThemePalette,
} from './detail-palette';

describe('detail palette', () => {
  it('chooses readable text for light and dark backgrounds', () => {
    expect(getContrastText('#ffffff')).toBe('#171717');
    expect(getContrastText('#111111')).toBe('#ffffff');
  });

  it('creates a controlled theme from extracted palette colors', () => {
    const palette: ThemePalette = {
      dominant: '#7d4d3f',
      vibrant: '#d68a42',
      muted: '#9f8e82',
      dark: '#272329',
      light: '#e9e2dc',
    };
    const theme = createThemeVars(palette);

    expect(theme['--theme-background']).toMatch(/^#/);
    expect(theme['--theme-accent']).toMatch(/^#/);
    expect(theme['--theme-accent-rgb']).toMatch(/^\d+, \d+, \d+$/);
    expect(theme['--theme-nav-text']).toBe('#ffffff');
    expect(theme['--theme-nav-active-label']).toMatch(/^#/);
    expect(theme['--theme-nav-active-label']).not.toBe(theme['--theme-nav']);
  });
});
