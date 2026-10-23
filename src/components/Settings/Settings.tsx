import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import type { ShortcutId } from '../../types';
import './Settings.css';

export function Settings() {
  const {
    isSettingsOpen,
    setSettingsOpen,
    settings,
    updateSettings,
    updateShortcut,
    resetShortcuts,
  } = useApp();

  const [editingId, setEditingId] = useState<ShortcutId | null>(null);
  const [tempKeys, setTempKeys] = useState('');

  if (!isSettingsOpen) return null;

  const startEdit = (id: ShortcutId, current: string) => {
    setEditingId(id);
    setTempKeys(current);
  };

  const saveEdit = () => {
    if (editingId && tempKeys.trim()) {
      updateShortcut(editingId, tempKeys.trim());
    }
    setEditingId(null);
  };

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const parts: string[] = [];
    if (e.altKey) parts.push('Alt');
    if (e.ctrlKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.metaKey) parts.push('Meta');

    const key = e.key;
    if (!['Alt', 'Control', 'Shift', 'Meta'].includes(key)) {
      parts.push(key.length === 1 ? key.toUpperCase() : key);
    }

    if (parts.length > 0) {
      setTempKeys(parts.join('+'));
    }
  };

  return (
    <div className="settings-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={() => setSettingsOpen(false)}>
            ×
          </button>
        </div>

        <div className="settings-body">
          {/* Layout */}
          <section>
            <h3>Layout & Accessibility</h3>
            <div className="setting-row">
              <label>Layout Mode</label>
              <select
                value={settings.layoutMode}
                onChange={(e) =>
                  updateSettings({ layoutMode: e.target.value as any })
                }
              >
                <option value="normal">Normal</option>
                <option value="oneHand">One-Hand Mode</option>
                <option value="rightHand">Right-Hand Mode</option>
              </select>
            </div>
            <div className="setting-row">
              <label>Explorer Side</label>
              <select
                value={settings.explorerSide}
                onChange={(e) =>
                  updateSettings({ explorerSide: e.target.value as any })
                }
              >
                <option value="left">Left (recommended)</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="setting-row">
              <label>Font Size</label>
              <input
                type="number"
                min={10}
                max={24}
                value={settings.fontSize}
                onChange={(e) =>
                  updateSettings({ fontSize: Number(e.target.value) })
                }
              />
            </div>
            <div className="setting-row">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showKeyboardHud}
                  onChange={(e) => updateSettings({ showKeyboardHud: e.target.checked })}
                />
                Show on-screen keyboard (lights up keys; swaps labels in Mirror Mode)
              </label>
            </div>
            <div className="setting-row">
              <label>
                <input
                  type="checkbox"
                  checked={settings.mirrorMode}
                  onChange={(e) => updateSettings({ mirrorMode: e.target.checked })}
                />
                Mirror Mode: hold Space + a left-hand key to type its right-hand twin
              </label>
            </div>
            <div className="setting-row">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                />
                Autosave (no Save shortcut needed)
              </label>
            </div>
            <div className="setting-row">
              <label>
                <input
                  type="checkbox"
                  checked={settings.showMinimap}
                  onChange={(e) =>
                    updateSettings({ showMinimap: e.target.checked })
                  }
                />
                Show Minimap
              </label>
            </div>
          </section>

          {/* Shortcuts */}
          <section>
            <div className="section-header">
              <h3>Keyboard Shortcuts</h3>
              <button className="text-btn" onClick={resetShortcuts}>
                Reset to defaults
              </button>
            </div>
            <p className="hint">
              Click a shortcut and press the new key combination. Designed for
              left-hand use (Alt + letter).
            </p>
            <div className="shortcut-list">
              {settings.shortcuts.map((s) => (
                <div key={s.id} className="shortcut-row">
                  <div className="shortcut-info">
                    <span className="shortcut-label">{s.label}</span>
                    {s.description && (
                      <span className="shortcut-desc">{s.description}</span>
                    )}
                  </div>
                  {editingId === s.id ? (
                    <input
                      className="shortcut-input"
                      value={tempKeys}
                      onChange={(e) => setTempKeys(e.target.value)}
                      onKeyDown={handleKeyCapture}
                      onBlur={saveEdit}
                      autoFocus
                      placeholder="Press keys…"
                    />
                  ) : (
                    <button
                      className="shortcut-badge"
                      onClick={() => startEdit(s.id, s.keys)}
                    >
                      {s.keys}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
