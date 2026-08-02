'use client';

import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { useState, type KeyboardEvent, type ReactNode } from 'react';

import { I18nText } from '@/components/I18nProvider';
import type { MessageKey } from '@/lib/i18n';

export type CreditsTab = {
  value: string;
  label: MessageKey;
};

export type CreditsPanel = {
  value: string;
  content: ReactNode;
};

export default function CreditsTabs({
  tabs,
  panels,
  defaultValue,
}: {
  tabs: CreditsTab[];
  panels: CreditsPanel[];
  defaultValue: string;
}) {
  const [activeValue, setActiveValue] = useState(defaultValue);
  const [direction, setDirection] = useState(1);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.value === activeValue),
  );
  const activePanel =
    panels.find((panel) => panel.value === activeValue) ?? panels[0];

  const selectTab = (value: string) => {
    if (value === activeValue) return;
    const nextIndex = tabs.findIndex((tab) => tab.value === value);
    setDirection(nextIndex >= activeIndex ? 1 : -1);
    setActiveValue(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();

    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : event.key === 'ArrowRight'
            ? (activeIndex + 1) % tabs.length
            : (activeIndex - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    selectTab(nextTab.value);
    requestAnimationFrame(() => {
      document.getElementById('credits-tab-' + nextTab.value)?.focus();
    });
  };

  return (
    <div className='w-full'>
      <div
        className='credits-tabs-list flex w-fit max-w-full items-center gap-1 overflow-x-auto border-b border-zinc-200/70'
        role='tablist'
        aria-orientation='horizontal'
      >
        {tabs.map((tab) => {
          const active = tab.value === activeValue;
          return (
            <button
              key={tab.value}
              id={'credits-tab-' + tab.value}
              type='button'
              role='tab'
              aria-selected={active}
              aria-controls={'credits-panel-' + tab.value}
              tabIndex={active ? 0 : -1}
              onClick={() => selectTab(tab.value)}
              onKeyDown={handleKeyDown}
              className={
                'credits-tab relative shrink-0 px-2.5 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--theme-accent-rgb),0.3)] focus-visible:ring-offset-2 ' +
                (active ? 'text-zinc-950' : 'text-zinc-500 hover:text-zinc-800')
              }
            >
              <I18nText messageKey={tab.label} />
              {active && (
                <m.span
                  layoutId='credits-tab-indicator'
                  className='absolute inset-x-1 -bottom-px h-[3px] rounded-full bg-[var(--theme-accent)]'
                  transition={{
                    type: 'spring',
                    stiffness: 430,
                    damping: 30,
                    mass: 0.55,
                  }}
                  aria-hidden='true'
                />
              )}
            </button>
          );
        })}
      </div>

      <div className='relative overflow-hidden'>
        <AnimatePresence initial={false} mode='wait'>
          {activePanel && (
            <m.div
              key={activePanel.value}
              id={'credits-panel-' + activePanel.value}
              role='tabpanel'
              aria-labelledby={'credits-tab-' + activePanel.value}
              initial={{ opacity: 0, x: direction * 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -18 }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {activePanel.content}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
