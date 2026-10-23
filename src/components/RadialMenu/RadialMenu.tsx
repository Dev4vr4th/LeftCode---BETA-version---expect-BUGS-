import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../store/AppContext';
import './RadialMenu.css';

interface RadialItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  angle: number; // degrees
}

// Left-hand ring around S: W=top, E, D=right, C, X=bottom, Z, A=left, Q
const RADIAL_KEYS: Record<string, string> = {
  KeyW: 'run', KeyE: 'save', KeyD: 'palette', KeyC: 'new',
  KeyX: 'output', KeyZ: 'files', KeyA: 'clear', KeyQ: 'settings',
};
const KEY_OF = Object.fromEntries(
  Object.entries(RADIAL_KEYS).map(([code, id]) => [id, code.slice(3)])
);

export function RadialMenu() {
  const {
    isRadialOpen,
    setRadialOpen,
    saveActiveTab,
    runActiveFile,
    setCommandPaletteOpen,
    setSettingsOpen,
    updateSettings,
    settings,
    createNewFile,
    clearOutput,
  } = useApp();

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const centerRef = useRef<HTMLDivElement>(null);

  // 8 items evenly spaced
  const items: RadialItem[] = [
    {
      id: 'run',
      label: 'Run',
      icon: '▶',
      action: () => {
        runActiveFile();
        setRadialOpen(false);
      },
      angle: 0, // top
    },
    {
      id: 'save',
      label: 'Save',
      icon: '💾',
      action: () => {
        saveActiveTab();
        setRadialOpen(false);
      },
      angle: 45,
    },
    {
      id: 'palette',
      label: 'Palette',
      icon: '🔎',
      action: () => {
        setCommandPaletteOpen(true);
        setRadialOpen(false);
      },
      angle: 90,
    },
    {
      id: 'new',
      label: 'New',
      icon: '＋',
      action: () => {
        createNewFile();
        setRadialOpen(false);
      },
      angle: 135,
    },
    {
      id: 'output',
      label: 'Output',
      icon: '📟',
      action: () => {
        updateSettings({ showOutput: !settings.showOutput });
        setRadialOpen(false);
      },
      angle: 180,
    },
    {
      id: 'files',
      label: 'Files',
      icon: '📁',
      action: () => {
        updateSettings({ showExplorer: !settings.showExplorer });
        setRadialOpen(false);
      },
      angle: 225,
    },
    {
      id: 'clear',
      label: 'Clear',
      icon: '🗑',
      action: () => {
        clearOutput();
        setRadialOpen(false);
      },
      angle: 270,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙',
      action: () => {
        setSettingsOpen(true);
        setRadialOpen(false);
      },
      angle: 315,
    },
  ];

  // Close on Escape
  useEffect(() => {
    if (!isRadialOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setRadialOpen(false);
        return;
      }
      const id = RADIAL_KEYS[e.code];
      if (id) {
        e.preventDefault();
        items.find((i) => i.id === id)?.action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRadialOpen, setRadialOpen]);

  if (!isRadialOpen) return null;

  const radius = 110; // distance from center to item center
  const itemSize = 64;

  return (
    <div className="radial-overlay" onClick={() => setRadialOpen(false)}>
      <div
        className="radial-menu"
        onClick={(e) => e.stopPropagation()}
        ref={centerRef}
      >
        {/* Center button */}
        <div className="radial-center" title="Close (Esc)">
          <span>×</span>
        </div>

        {/* Items */}
        {items.map((item) => {
          const rad = ((item.angle - 90) * Math.PI) / 180; // 0° = top
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          const isHovered = hoveredId === item.id;

          return (
            <button
              key={item.id}
              className={`radial-item ${isHovered ? 'hovered' : ''}`}
              style={{
                width: itemSize,
                height: itemSize,
                transform: `translate(${x}px, ${y}px)`,
              }}
              onClick={item.action}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              title={item.label}
            >
              <span className="radial-icon">{item.icon}</span>
              <span className="radial-label">{item.label} · {KEY_OF[item.id]}</span>
            </button>
          );
        })}

        {/* Helper text */}
        <div className="radial-hint">
          {hoveredId
            ? items.find((i) => i.id === hoveredId)?.label
            : 'Press the key shown · or click · Esc to close'}
        </div>
      </div>
    </div>
  );
}
