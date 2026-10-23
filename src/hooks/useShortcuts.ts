import { useEffect, useCallback } from 'react';
import { useApp } from '../store/AppContext';
import type { ShortcutId } from '../types';

function parseKeys(keys: string): {
  alt: boolean;
  ctrl: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
} {
  const parts = keys.toLowerCase().split('+').map((p) => p.trim());
  const key = parts[parts.length - 1];
  return {
    alt: parts.includes('alt'),
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    shift: parts.includes('shift'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    key: key === 'space' ? ' ' : key.length === 1 ? key.toUpperCase() : key,
  };
}

export function useShortcuts() {
  const {
    settings,
    saveActiveTab,
    runActiveFile,
    setCommandPaletteOpen,
    setSettingsOpen,
    setRadialOpen,
    updateSettings,
    createNewFile,
    closeTab,
    activeTabId,
    isRadialOpen,
  } = useApp();

  const handlers: Record<ShortcutId, () => void> = {
    commandPalette: () => setCommandPaletteOpen(true),
    save: () => saveActiveTab(),
    run: () => runActiveFile(),
    toggleOutput: () => updateSettings({ showOutput: !settings.showOutput }),
    search: () => setCommandPaletteOpen(true),
    toggleExplorer: () => updateSettings({ showExplorer: !settings.showExplorer }),
    settings: () => setSettingsOpen(true),
    newFile: () => createNewFile(),
    closeTab: () => {
      if (activeTabId) closeTab(activeTabId);
    },
    radial: () => setRadialOpen(true),
    mirror: () => updateSettings({ mirrorMode: !settings.mirrorMode }),
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Let the shortcut-capture field and the open radial menu handle their own keys
      if (target.classList?.contains('shortcut-input')) return;
      if (isRadialOpen && e.code !== 'Space') return;

      // Any modifier combo works while typing (Monaco's input is a TEXTAREA)
      const hasModifier = e.altKey || e.ctrlKey || e.metaKey;
      if (isTyping && !hasModifier) return;

      for (const binding of settings.shortcuts) {
        const parsed = parseKeys(binding.keys);

        let keyMatch = false;
        if (parsed.key === ' ') {
          keyMatch = e.code === 'Space' || e.key === ' ';
        } else {
          const k = parsed.key.toLowerCase();
          // e.code ignores macOS Alt dead-keys (Alt+W -> ∑) and keyboard layouts
          keyMatch =
            e.code.toLowerCase() === `key${k}` ||
            e.code.toLowerCase() === `digit${k}` ||
            e.key.toLowerCase() === k;
        }

        if (
          keyMatch &&
          e.altKey === parsed.alt &&
          e.ctrlKey === parsed.ctrl &&
          e.shiftKey === parsed.shift &&
          e.metaKey === parsed.meta
        ) {
          e.preventDefault();
          e.stopPropagation();
          const handler = handlers[binding.id];
          if (handler) handler();
          return;
        }
      }
    },
    [settings.shortcuts, handlers, isRadialOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [handleKeyDown]);
}
