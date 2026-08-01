'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { localeConfig, LOCALES, type Locale } from '@/lib/i18n';
import { I18nText, useI18n } from '../I18nProvider';

const MENU_WIDTH = 176;
const MENU_GAP = 8;
const VIEWPORT_MARGIN = 8;

type MenuPosition = {
  left: number;
  top: number;
};

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    left: VIEWPORT_MARGIN,
    top: VIEWPORT_MARGIN,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const maxLeft = Math.max(
      VIEWPORT_MARGIN,
      window.innerWidth - MENU_WIDTH - VIEWPORT_MARGIN,
    );
    const left = Math.min(
      maxLeft,
      Math.max(VIEWPORT_MARGIN, rect.right - MENU_WIDTH),
    );
    const top = Math.min(
      window.innerHeight - 188 - VIEWPORT_MARGIN,
      rect.bottom + MENU_GAP,
    );

    setMenuPosition({ left, top: Math.max(VIEWPORT_MARGIN, top) });
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    updateMenuPosition();
    setOpen(true);
  };

  const handleLocaleChange = (nextLocale: Locale) => {
    setLocale(nextLocale);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type='button'
        aria-label={t('nav.language')}
        aria-expanded={open}
        aria-haspopup='menu'
        title={t('nav.language')}
        onClick={handleToggle}
        className='nav-theme-text flex size-7 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:size-8'
      >
        <GlobeLogo />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <m.div
                ref={menuRef}
                role='menu'
                aria-label={t('nav.language')}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className='themed-language-menu fixed z-[100] w-44 rounded-lg border p-1.5 shadow-[0_18px_45px_rgb(0_0_0_/_0.28)]'
                style={menuPosition}
              >
                <div className='nav-theme-muted px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]'>
                  <I18nText messageKey='nav.language' />
                </div>
                {LOCALES.map((item) => {
                  const selected = item === locale;
                  return (
                    <button
                      key={item}
                      type='button'
                      role='menuitemradio'
                      aria-checked={selected}
                      onClick={() => handleLocaleChange(item)}
                      data-selected={selected}
                      className='themed-language-option flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60'
                    >
                      <span>{localeConfig[item].label}</span>
                      {selected ? (
                        <CheckLogo />
                      ) : (
                        <span className='text-[10px] opacity-60'>
                          {localeConfig[item].shortLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </m.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

function GlobeLogo() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      className='size-4 md:size-5'
      aria-hidden='true'
    >
      <circle cx='12' cy='12' r='9' />
      <path
        strokeLinecap='round'
        d='M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z'
      />
    </svg>
  );
}

function CheckLogo() {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.2'
      className='size-3.5'
      aria-hidden='true'
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='m5 12 4 4L19 6' />
    </svg>
  );
}
