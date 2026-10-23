import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import './CommandPalette.css';

export function CommandPalette() {
  const { isCommandPaletteOpen, setCommandPaletteOpen, getCommands } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = getCommands();
  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  const runSelected = () => {
    const cmd = filtered[selectedIndex];
    if (cmd) {
      cmd.action();
      setCommandPaletteOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runSelected();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  return (
    <div className="palette-overlay" onClick={() => setCommandPaletteOpen(false)}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-wrap">
          <span className="palette-icon">🔎</span>
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="What do you want to do?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div className="palette-list">
          {filtered.length === 0 && (
            <div className="palette-empty">No matching commands</div>
          )}
          {filtered.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`palette-item ${i === selectedIndex ? 'selected' : ''}`}
              onClick={() => {
                cmd.action();
                setCommandPaletteOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <span className="palette-label">{cmd.label}</span>
              {cmd.shortcut && (
                <span className="palette-shortcut">{cmd.shortcut}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
