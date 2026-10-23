import { useApp } from '../../store/AppContext';
import './OneHandBar.css';

export function OneHandBar() {
  const {
    settings,
    saveActiveTab,
    runActiveFile,
    setCommandPaletteOpen,
    setSettingsOpen,
    setRadialOpen,
    updateSettings,
    createNewFile,
  } = useApp();

  if (settings.layoutMode !== 'oneHand') return null;

  return (
    <div className="one-hand-bar" onMouseDown={(e) => e.preventDefault()}>
      <div className="ohb-title">LEFT ZONE</div>

      <button
        className="ohb-primary"
        onClick={() => setRadialOpen(true)}
        title="Radial Menu (Alt+Space)"
      >
        <span className="ohb-icon">◎</span>
        <span>Radial</span>
      </button>

      <button onClick={() => setCommandPaletteOpen(true)} title="Alt+Q">
        <span className="ohb-icon">🔎</span>
        <span>Palette</span>
      </button>

      <button onClick={saveActiveTab} title="Alt+W">
        <span className="ohb-icon">💾</span>
        <span>Save</span>
      </button>

      <button onClick={runActiveFile} title="Alt+E">
        <span className="ohb-icon">▶</span>
        <span>Run</span>
      </button>

      <button
        onClick={() => updateSettings({ showOutput: !settings.showOutput })}
        title="Alt+R"
      >
        <span className="ohb-icon">📟</span>
        <span>Output</span>
      </button>

      <button
        onClick={() => updateSettings({ showExplorer: !settings.showExplorer })}
        title="Alt+D"
      >
        <span className="ohb-icon">📁</span>
        <span>Files</span>
      </button>

      <button onClick={createNewFile} title="Alt+N">
        <span className="ohb-icon">＋</span>
        <span>New</span>
      </button>

      <button onClick={() => setSettingsOpen(true)} title="Alt+S">
        <span className="ohb-icon">⚙</span>
        <span>Settings</span>
      </button>
    </div>
  );
}
