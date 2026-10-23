import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { useApp } from '../../store/AppContext';
import { mirrorAction } from '../../hooks/useMirrorMode';
import './KeyboardHud.css';

// Left-hand half of the keyboard: [event.code, label]
const ROWS: [string, string][][] = [
  [['Escape', 'Esc'], ['Backquote', '`'], ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5']],
  [['Tab', 'Tab'], ['KeyQ', 'Q'], ['KeyW', 'W'], ['KeyE', 'E'], ['KeyR', 'R'], ['KeyT', 'T']],
  [['CapsLock', 'Caps'], ['KeyA', 'A'], ['KeyS', 'S'], ['KeyD', 'D'], ['KeyF', 'F'], ['KeyG', 'G']],
  [['ShiftLeft', 'Shift'], ['KeyZ', 'Z'], ['KeyX', 'X'], ['KeyC', 'C'], ['KeyV', 'V'], ['KeyB', 'B']],
];

function show(text: string) {
  return text === '\n' ? '↵' : text.toUpperCase() === text ? text : text.toUpperCase();
}

const HUD_KEY = 'leftcode-hud-v1';
type View = { pos: { x: number; y: number } | null; scale: number };
const MIN_SCALE = 0.6;
const MAX_SCALE = 1.6;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
function loadView(): View {
  try {
    const raw = localStorage.getItem(HUD_KEY);
    if (raw) {
      const v = JSON.parse(raw) as View;
      const scale = clamp(Number(v.scale) || 1, MIN_SCALE, MAX_SCALE);
      const p = v.pos;
      const lost = !p || p.x < 0 || p.y < 0 || p.x > window.innerWidth - 80 || p.y > window.innerHeight - 60;
      return { scale, pos: lost ? null : p };
    }
  } catch {}
  return { pos: null, scale: 1 };
}

export function KeyboardHud() {
  const { settings } = useApp();
  const [down, setDown] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>(loadView);
  const rootRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ ox: number; oy: number } | null>(null);
  const resize = useRef<{ x: number; scale: number; right: number; bottom: number; w: number; h: number } | null>(null);
  const save = (v: View) => {
    try {
      localStorage.setItem(HUD_KEY, JSON.stringify(v));
    } catch {}
  };

  useEffect(() => {
    if (!settings.showKeyboardHud) return;
    const press = (e: KeyboardEvent) => setDown((p) => (p.has(e.code) ? p : new Set(p).add(e.code)));
    const release = (e: KeyboardEvent) =>
      setDown((p) => {
        if (!p.has(e.code)) return p;
        const n = new Set(p);
        n.delete(e.code);
        return n;
      });
    const clear = () => setDown(new Set());
    window.addEventListener('keydown', press, true);
    window.addEventListener('keyup', release, true);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', press, true);
      window.removeEventListener('keyup', release, true);
      window.removeEventListener('blur', clear);
    };
  }, [settings.showKeyboardHud]);

  useEffect(() => {
    const keepVisible = () =>
      setView((v) =>
        v.pos
          ? { ...v, pos: { x: clamp(v.pos.x, 0, Math.max(0, window.innerWidth - 80)), y: clamp(v.pos.y, 0, Math.max(0, window.innerHeight - 60)) } }
          : v
      );
    window.addEventListener('resize', keepVisible);
    return () => window.removeEventListener('resize', keepVisible);
  }, []);

  if (!settings.showKeyboardHud) return null;

  const rect = () => rootRef.current!.getBoundingClientRect();

  const dragDown = (e: PointerEvent) => {
    const r = rect();
    drag.current = { ox: e.clientX - r.left, oy: e.clientY - r.top };
    setView((v) => ({ ...v, pos: { x: r.left, y: r.top } }));
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const dragMove = (e: PointerEvent) => {
    if (!drag.current) return;
    const r = rect();
    const x = clamp(e.clientX - drag.current.ox, 0, window.innerWidth - r.width);
    const y = clamp(e.clientY - drag.current.oy, 0, window.innerHeight - r.height);
    setView((v) => ({ ...v, pos: { x, y } }));
  };
  const dragUp = () => {
    drag.current = null;
    save(view);
  };

  // Resize handle sits on the top-left corner; the bottom-right corner stays put
  const sizeDown = (e: PointerEvent) => {
    const r = rect();
    resize.current = { x: e.clientX, scale: view.scale, right: r.right, bottom: r.bottom, w: r.width / view.scale, h: r.height / view.scale };
    setView((v) => ({ ...v, pos: { x: r.left, y: r.top } }));
    e.currentTarget.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };
  const sizeMove = (e: PointerEvent) => {
    const r0 = resize.current;
    if (!r0) return;
    const room = Math.min(MAX_SCALE, r0.right / r0.w, r0.bottom / r0.h);
    const scale = clamp(r0.scale + (r0.x - e.clientX) / 200, MIN_SCALE, Math.max(MIN_SCALE, room));
    setView({ scale, pos: { x: Math.max(0, r0.right - r0.w * scale), y: Math.max(0, r0.bottom - r0.h * scale) } });
  };
  const sizeUp = () => {
    resize.current = null;
    save(view);
  };
  const reset = () => {
    const v: View = { pos: null, scale: 1 };
    setView(v);
    save(v);
  };

  const spaceHeld = down.has('Space');
  const shift = down.has('ShiftLeft') || down.has('ShiftRight');
  const mirrored = settings.mirrorMode && spaceHeld;

  return (
    <div
      ref={rootRef}
      className={`kb-hud ${mirrored ? 'mirrored' : ''}`}
      aria-hidden="true"
      onMouseDown={(e) => e.preventDefault()}
      style={{
        transform: `scale(${view.scale})`,
        ...(view.pos
          ? { left: view.pos.x, top: view.pos.y, transformOrigin: 'top left' }
          : { right: 16, bottom: 40, transformOrigin: 'bottom right' }),
      }}
    >
      <div className="kb-resize" title="Drag to resize" onPointerDown={sizeDown} onPointerMove={sizeMove} onPointerUp={sizeUp} />
      <div
        className="kb-grip"
        title="Drag to move · double-click to reset"
        onPointerDown={dragDown}
        onPointerMove={dragMove}
        onPointerUp={dragUp}
        onDoubleClick={reset}
      >
        ⠿ keyboard
      </div>
      {ROWS.map((row, i) => (
        <div className="kb-row" key={i} style={{ marginLeft: i * 10 }}>
          {row.map(([code, label]) => {
            const action = mirrored ? mirrorAction(code, shift) : null;
            const twin = action ? (action.type === 'backspace' ? '⌫' : show(action.text)) : null;
            const wide = label.length > 1;
            return (
              <div
                key={code}
                className={`kb-key ${down.has(code) ? 'pressed' : ''} ${twin ? 'twin' : ''} ${wide ? 'wide' : ''}`}
              >
                {twin ? (
                  <>
                    <span className="kb-main">{twin}</span>
                    <span className="kb-orig">{label}</span>
                  </>
                ) : (
                  <span className="kb-main">{label}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <div className="kb-row" style={{ marginLeft: 44 }}>
        <div className={`kb-key space ${spaceHeld ? 'pressed' : ''}`}>
          <span className="kb-main">{mirrored ? 'MIRROR' : 'Space'}</span>
        </div>
      </div>
    </div>
  );
}
