'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { animate, mixColor, type AnimationPlaybackControls } from 'motion';

import {
  createThemeVars,
  DEFAULT_THEME_VARS,
  extractPalette,
  type ThemeVars,
} from '@/lib/detail-palette';

const themeCache = new Map<string, ThemeVars>();
const pendingThemes = new Map<string, Promise<ThemeVars>>();
const RGB_THEME_VARS = new Set(['--theme-accent-rgb', '--theme-nav-rgb']);
const THEME_ANIMATION_DURATION = 0.46;

let activeThemeAnimation: AnimationPlaybackControls | null = null;
let themeAnimationVersion = 0;

export default function DetailTheme({
  imageUrl,
  children,
}: {
  imageUrl: string | null;
  children: ReactNode;
}) {
  useEffect(() => {
    let disposed = false;

    if (!imageUrl) {
      applyTheme(DEFAULT_THEME_VARS);
      return () => {
        disposed = true;
      };
    }

    const cached = themeCache.get(imageUrl);
    if (cached) {
      applyTheme(cached);
    } else {
      loadTheme(imageUrl)
        .then((theme) => {
          if (disposed) return;
          themeCache.set(imageUrl, theme);
          applyTheme(theme);
        })
        .catch(() => {
          if (!disposed) applyTheme(DEFAULT_THEME_VARS);
        });
    }

    return () => {
      disposed = true;
    };
  }, [imageUrl]);

  useEffect(() => () => resetTheme(), []);

  return <div className='detail-theme min-w-0'>{children}</div>;
}

function loadTheme(imageUrl: string) {
  const existing = pendingThemes.get(imageUrl);
  if (existing) return existing;

  const promise = new Promise<ThemeVars>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';

    const handleLoad = () => {
      try {
        resolve(createThemeVars(extractPalette(image, 64)));
      } catch (error) {
        reject(error);
      }
    };

    image.onload = handleLoad;
    image.onerror = () => reject(new Error('Theme image failed to load.'));
    image.src = getThemeImageUrl(imageUrl);
    if (image.complete && image.naturalWidth > 0) handleLoad();
  });

  pendingThemes.set(imageUrl, promise);
  void promise.then(
    () => pendingThemes.delete(imageUrl),
    () => pendingThemes.delete(imageUrl),
  );
  return promise;
}

function getThemeImageUrl(imageUrl: string) {
  if (imageUrl.startsWith('/_next/image')) return imageUrl;
  const params = new URLSearchParams({
    url: imageUrl,
    w: '640',
    q: '75',
  });
  return `/_next/image?${params.toString()}`;
}

function applyTheme(theme: ThemeVars) {
  const root = document.documentElement;
  const version = ++themeAnimationVersion;

  activeThemeAnimation?.stop();
  activeThemeAnimation = null;
  root.dataset.detailTheme = 'true';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setThemeValues(root, theme);
    return;
  }

  const interpolators = Object.entries(theme).map(([name, target]) => {
    const from = readThemeValue(root, name) || target;

    if (RGB_THEME_VARS.has(name)) {
      const fromRgb = parseRgbTriplet(from) ?? parseRgbTriplet(target)!;
      const targetRgb = parseRgbTriplet(target) ?? fromRgb;
      return {
        name,
        update: (progress: number) =>
          formatRgbTriplet(fromRgb, targetRgb, progress),
      };
    }

    const colorMixer = createColorMixer(from, target);
    return {
      name,
      update: (progress: number) => colorMixer(progress),
    };
  });

  activeThemeAnimation = animate(0, 1, {
    duration: THEME_ANIMATION_DURATION,
    ease: [0.22, 1, 0.36, 1],
    onUpdate: (progress) => {
      if (themeAnimationVersion !== version) return;
      interpolators.forEach(({ name, update }) => {
        root.style.setProperty(name, update(progress));
      });
    },
  });
}

function resetTheme() {
  const root = document.documentElement;
  applyTheme(DEFAULT_THEME_VARS);
  const version = themeAnimationVersion;

  if (!activeThemeAnimation) {
    clearThemeValues(root);
    return;
  }

  window.setTimeout(
    () => {
      if (themeAnimationVersion !== version) return;
      clearThemeValues(root);
      activeThemeAnimation = null;
    },
    THEME_ANIMATION_DURATION * 1000 + 60,
  );
}

function setThemeValues(root: HTMLElement, theme: ThemeVars) {
  Object.entries(theme).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

function clearThemeValues(root: HTMLElement) {
  Object.keys(DEFAULT_THEME_VARS).forEach((name) =>
    root.style.removeProperty(name),
  );
  delete root.dataset.detailTheme;
}

function readThemeValue(root: HTMLElement, name: string) {
  return (
    root.style.getPropertyValue(name).trim() ||
    getComputedStyle(root).getPropertyValue(name).trim()
  );
}

function createColorMixer(from: string, target: string) {
  try {
    const mixer = mixColor(from || target, target);
    return (progress: number) => {
      const value = mixer(progress);
      return typeof value === 'string' ? value : target;
    };
  } catch {
    return () => target;
  }
}

function parseRgbTriplet(value: string) {
  const numbers = value.match(/-?\d*\.?\d+/g);
  if (!numbers || numbers.length < 3) return null;

  return numbers
    .slice(0, 3)
    .map((component) => Math.min(255, Math.max(0, Number(component)))) as [
    number,
    number,
    number,
  ];
}

function formatRgbTriplet(
  from: [number, number, number],
  target: [number, number, number],
  progress: number,
) {
  return from
    .map((component, index) =>
      Math.round(component + (target[index] - component) * progress),
    )
    .join(', ');
}
