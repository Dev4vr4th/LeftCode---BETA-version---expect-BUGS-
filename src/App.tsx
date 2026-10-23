import { AppProvider, useApp } from './store/AppContext';
import { useShortcuts } from './hooks/useShortcuts';
import { useMirrorMode } from './hooks/useMirrorMode';
import { Explorer } from './components/Explorer/Explorer';
import { CodeEditor } from './components/Editor/Editor';
import { OutputPanel } from './components/OutputPanel/OutputPanel';
import { CommandPalette } from './components/CommandPalette/CommandPalette';
import { Settings } from './components/Settings/Settings';
import { OneHandBar } from './components/Toolbar/OneHandBar';
import { RadialMenu } from './components/RadialMenu/RadialMenu';
import { KeyboardHud } from './components/KeyboardHud/KeyboardHud';
import { ContextualBar } from './components/ContextualBar/ContextualBar';
import { StatusBar } from './components/StatusBar/StatusBar';
import './App.css';

function MainLayout() {
  useShortcuts();
  useMirrorMode();

  const { settings } = useApp();
  const explorerOnLeft = settings.explorerSide === 'left';

  return (
    <div className={`app ${settings.layoutMode}`}>
      <header className="app-header">
        <div className="logo">
          <span className="logo-mark">LC</span>
          <span className="logo-text">LeftCode</span>
          <span className="version">v0.4</span>
        </div>
        <div className="header-hint">
          {settings.layoutMode === 'oneHand' ? (
            <span className="mode-badge">ONE-HAND MODE</span>
          ) : null}
          <span className="hint-text">
            Alt+Space Radial · Alt+Q Palette · Alt+W Save · Alt+E Run
          </span>
        </div>
      </header>

      <div className="main-area">
        <OneHandBar />

        {explorerOnLeft && <Explorer />}

        <div className="center-column">
          <ContextualBar />
          <CodeEditor />
          <OutputPanel />
        </div>

        {!explorerOnLeft && <Explorer />}
      </div>

      <StatusBar />

      <CommandPalette />
      <Settings />
      <RadialMenu />
      <KeyboardHud />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
