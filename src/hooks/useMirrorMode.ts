import { useEffect } from 'react';
import { useApp } from '../store/AppContext';

// Hold Space + a left-hand key to type its mirror image on the right side.
// Tap Space (without pressing another key) and you get a normal space on release.
const MIRROR: Record<string, string> = {
  KeyQ: 'p', KeyW: 'o', KeyE: 'i', KeyR: 'u', KeyT: 'y',
  KeyA: ';', KeyS: 'l', KeyD: 'k', KeyF: 'j', KeyG: 'h',
  KeyZ: '/', KeyX: '.', KeyC: ',', KeyV: 'm', KeyB: 'n',
  Digit1: '0', Digit2: '9', Digit3: '8', Digit4: '7', Digit5: '6',
  Tab: '[', CapsLock: "'",
};
const SHIFTED: Record<string, string> = {
  ';': ':', '/': '?', '.': '>', ',': '<', '0': ')', '9': '(', '8': '*',
  '7': '&', '6': '^', '[': '{', "'": '"',
};

export type Action = { type: 'text'; text: string } | { type: 'backspace' };

export function mirrorAction(code: string, shift: boolean): Action | null {
  // Keys with no letter twin: Esc = Backspace, ` = Enter, Shift+` = ], Shift+Esc = =
  if (code === 'Escape') return shift ? { type: 'text', text: '=' } : { type: 'backspace' };
  if (code === 'Backquote') return { type: 'text', text: shift ? ']' : '\n' };
  const c = MIRROR[code];
  if (!c) return null;
  return { type: 'text', text: shift ? SHIFTED[c] ?? c.toUpperCase() : c };
}

export function useMirrorMode() {
  const { settings, getEditor } = useApp();
  const enabled = settings.mirrorMode;

  useEffect(() => {
    if (!enabled) return;
    let held = false;
    let used = false;

    const inEditor = (e: KeyboardEvent) =>
      (e.target as HTMLElement)?.classList?.contains('inputarea');
    const typeText = (text: string) =>
      getEditor()?.trigger('mirror', 'type', { text });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || !inEditor(e)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        e.stopPropagation();
        if (!e.repeat) {
          held = true;
          used = false;
        }
        return;
      }
      if (!held) return;
      const action = mirrorAction(e.code, e.shiftKey);
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();
      used = true;
      if (action.type === 'backspace') getEditor()?.trigger('mirror', 'deleteLeft', null);
      else typeText(action.text);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || !held) return;
      held = false;
      if (!used) typeText(' ');
    };
    const reset = () => { held = false; };

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', reset);
    };
  }, [enabled, getEditor]);
}
