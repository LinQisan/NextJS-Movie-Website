export type RGB = { r: number; g: number; b: number };

export type ThemePalette = {
  dominant: string;
  vibrant: string;
  muted: string;
  dark: string;
  light: string;
};

export type ThemeVars = Record<string, string>;

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 12, g: 12, b: 14 };

/**
 * The neutral theme used by the shell outside of movie and TV detail pages.
 * DetailTheme animates back to these values before removing its inline vars,
 * so the persistent navbar does not keep a title's palette after navigation.
 */
export const BASE_THEME_VARS: ThemeVars = {
  '--theme-background': '#ffffff',
  '--theme-bg-top': '#ffffff',
  '--theme-bg-bottom': '#ffffff',
  '--theme-primary': '#171717',
  '--theme-secondary': 'rgba(23, 23, 23, 0.68)',
  '--theme-muted': 'rgba(23, 23, 23, 0.48)',
  '--theme-accent': '#171717',
  // White keeps the neutral shell's radial background treatment invisible.
  '--theme-accent-rgb': '255, 255, 255',
  '--theme-hero-rgb': '5, 5, 5',
  '--theme-nav': '#050505',
  '--theme-nav-rgb': '5, 5, 5',
  '--theme-nav-text': '#ffffff',
  '--theme-nav-muted': 'rgba(255, 255, 255, 0.68)',
  '--theme-nav-active': '#ffffff',
  '--theme-nav-active-label': '#ffffff',
  '--theme-nav-active-text': '#111111',
  '--theme-border': 'rgba(23, 23, 23, 0.12)',
};

export const DEFAULT_THEME_VARS: ThemeVars = {
  '--theme-background': '#f7f6f3',
  '--theme-bg-top': '#f0ede7',
  '--theme-bg-bottom': '#fbfaf8',
  '--theme-primary': '#1b1b1b',
  '--theme-secondary': 'rgba(27, 27, 27, 0.68)',
  '--theme-muted': 'rgba(27, 27, 27, 0.48)',
  '--theme-accent': '#7c5548',
  '--theme-accent-rgb': '124, 85, 72',
  '--theme-hero-rgb': '41, 42, 45',
  '--theme-nav': '#292a2d',
  '--theme-nav-rgb': '41, 42, 45',
  '--theme-nav-text': '#ffffff',
  '--theme-nav-muted': 'rgba(255, 255, 255, 0.68)',
  '--theme-nav-active': '#b58b7a',
  '--theme-nav-active-label': '#e3b58f',
  '--theme-nav-active-text': '#151515',
  '--theme-border': 'rgba(27, 27, 27, 0.12)',
};

type HSL = { h: number; s: number; l: number };
type Candidate = RGB & HSL & { count: number };

export function extractPalette(
  image: HTMLImageElement,
  size = 64,
): ThemePalette {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas is unavailable.');

  context.clearRect(0, 0, size, size);
  context.drawImage(image, 0, 0, size, size);

  const pixels = context.getImageData(0, 0, size, size).data;
  const colors = new Map<string, Candidate>();
  let validPixelCount = 0;

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3];
    if (alpha < 220) continue;

    const raw = {
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2],
    };
    const max = Math.max(raw.r, raw.g, raw.b);
    const min = Math.min(raw.r, raw.g, raw.b);
    if (max > 246 && min > 232) continue;
    if (max < 16) continue;

    const rgb = {
      r: Math.round(raw.r / 16) * 16,
      g: Math.round(raw.g / 16) * 16,
      b: Math.round(raw.b / 16) * 16,
    };
    const hsl = rgbToHsl(rgb);
    const key = `${rgb.r},${rgb.g},${rgb.b}`;
    const existing = colors.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      colors.set(key, { ...rgb, ...hsl, count: 1 });
    }
    validPixelCount += 1;
  }

  const minimumNoiseArea = Math.max(2, validPixelCount * 0.008);
  const candidates = [...colors.values()].filter(
    (color) => !(color.s > 0.82 && color.count < minimumNoiseArea),
  );
  if (candidates.length === 0) {
    return {
      dominant: '#667085',
      vibrant: '#806050',
      muted: '#9aa0a8',
      dark: '#25272b',
      light: '#e8e7e3',
    };
  }

  const dominant = selectColor(
    candidates,
    () => true,
    (color) => color.count * (0.72 + Math.min(color.s, 0.28)),
  );
  const vibrant =
    selectColor(
      candidates,
      (color) => color.s > 0.28 && color.l > 0.28 && color.l < 0.8,
      (color) =>
        color.count * (color.s + 0.15) * (1 - Math.abs(color.l - 0.54)),
    ) ?? dominant;
  const muted =
    selectColor(
      candidates,
      (color) => color.s > 0.06 && color.s < 0.62 && color.l > 0.25,
      (color) => color.count * (1 - Math.abs(color.s - 0.3)),
    ) ?? dominant;
  const dark =
    selectColor(
      candidates,
      (color) => color.l < 0.34,
      (color) => color.count * (1.2 - color.l),
    ) ?? dominant;
  const light =
    selectColor(
      candidates,
      (color) => color.l > 0.7,
      (color) => color.count * color.l,
    ) ?? dominant;

  return {
    dominant: rgbToHex(dominant),
    vibrant: rgbToHex(vibrant),
    muted: rgbToHex(muted),
    dark: rgbToHex(dark),
    light: rgbToHex(light),
  };
}

export function createThemeVars(palette: ThemePalette): ThemeVars {
  const muted = hexToRgb(palette.muted);
  const vibrant = normalizeAccent(hexToRgb(palette.vibrant));
  const dark = normalizeNav(mix(hexToRgb(palette.dark), muted, 0.42));
  const hero = mix(dark, muted, 0.26);
  const background = mix(muted, WHITE, 0.88);
  const backgroundTop = mix(muted, WHITE, 0.78);
  const backgroundBottom = mix(background, WHITE, 0.52);
  const primary = getContrastText(rgbToHex(background));
  const navText = getContrastText(rgbToHex(dark));
  const active = mix(vibrant, dark, 0.16);
  const activeLabel = normalizeNavAccent(vibrant, dark);
  const activeText = getContrastText(rgbToHex(active));

  return {
    '--theme-background': rgbToHex(background),
    '--theme-bg-top': rgbToHex(backgroundTop),
    '--theme-bg-bottom': rgbToHex(backgroundBottom),
    '--theme-primary': primary,
    '--theme-secondary': rgba(hexToRgb(primary), 0.68),
    '--theme-muted': rgba(hexToRgb(primary), 0.48),
    '--theme-accent': rgbToHex(vibrant),
    '--theme-accent-rgb': `${vibrant.r}, ${vibrant.g}, ${vibrant.b}`,
    '--theme-hero-rgb': `${hero.r}, ${hero.g}, ${hero.b}`,
    '--theme-nav': rgbToHex(dark),
    '--theme-nav-rgb': `${dark.r}, ${dark.g}, ${dark.b}`,
    '--theme-nav-text': navText,
    '--theme-nav-muted': rgba(hexToRgb(navText), 0.68),
    '--theme-nav-active': rgbToHex(active),
    '--theme-nav-active-label': rgbToHex(activeLabel),
    '--theme-nav-active-text': activeText,
    '--theme-border': rgba(hexToRgb(primary), 0.12),
  };
}

export function getContrastText(backgroundColor: string) {
  const color = hexToRgb(backgroundColor);
  return relativeLuminance(color) > 0.42 ? '#171717' : '#ffffff';
}

function selectColor(
  candidates: Candidate[],
  predicate: (color: Candidate) => boolean,
  score: (color: Candidate) => number,
) {
  return candidates.filter(predicate).sort((a, b) => score(b) - score(a))[0];
}

function normalizeAccent(color: RGB) {
  const hsl = rgbToHsl(color);
  return hslToRgb(hsl.h, clamp(hsl.s, 0.22, 0.68), clamp(hsl.l, 0.38, 0.58));
}

function normalizeNav(color: RGB) {
  const hsl = rgbToHsl(color);
  return hslToRgb(
    hsl.h,
    Math.min(hsl.s, 0.34),
    clamp(hsl.l * 0.82, 0.14, 0.32),
  );
}

function normalizeNavAccent(color: RGB, nav: RGB) {
  const contrastText =
    getContrastText(rgbToHex(nav)) === '#ffffff' ? WHITE : BLACK;
  let candidate = color;

  for (let step = 0; step < 8; step += 1) {
    if (contrastRatio(candidate, nav) >= 3.2) return candidate;
    candidate = mix(candidate, contrastText, 0.14 + step * 0.05);
  }

  return candidate;
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) return { h: 0, s: 0, l: lightness };

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;

  return { h: hue / 6, s: saturation, l: lightness };
}

function hslToRgb(hue: number, saturation: number, lightness: number): RGB {
  if (saturation === 0) {
    const value = Math.round(lightness * 255);
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let normalized = t;
    if (normalized < 0) normalized += 1;
    if (normalized > 1) normalized -= 1;
    if (normalized < 1 / 6) return p + (q - p) * 6 * normalized;
    if (normalized < 1 / 2) return q;
    if (normalized < 2 / 3) return p + (q - p) * (2 / 3 - normalized) * 6;
    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return {
    r: Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hue) * 255),
    b: Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
  };
}

function relativeLuminance({ r, g, b }: RGB) {
  const transform = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b);
}

function contrastRatio(first: RGB, second: RGB) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

function mix(first: RGB, second: RGB, amount: number): RGB {
  return {
    r: Math.round(first.r * (1 - amount) + second.r * amount),
    g: Math.round(first.g * (1 - amount) + second.g * amount),
    b: Math.round(first.b * (1 - amount) + second.b * amount),
  };
}

function rgba(color: RGB, alpha: number) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function rgbToHex({ r, g, b }: RGB) {
  return `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`;
}

function hexToRgb(value: string): RGB {
  const normalized = value.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((channel) => `${channel}${channel}`)
          .join('')
      : normalized;
  const number = Number.parseInt(expanded, 16);
  if (Number.isNaN(number)) return BLACK;
  return {
    r: (number >> 16) & 255,
    g: (number >> 8) & 255,
    b: number & 255,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
