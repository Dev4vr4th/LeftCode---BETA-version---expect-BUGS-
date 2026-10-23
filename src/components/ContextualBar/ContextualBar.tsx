import { useApp } from '../../store/AppContext';
import './ContextualBar.css';

export function ContextualBar() {
  const {
    openTabs,
    activeTabId,
    runActiveFile,
    saveActiveTab,
    setCommandPaletteOpen,
    appendOutput,
  } = useApp();

  const activeTab = openTabs.find((t) => t.id === activeTabId);
  if (!activeTab) return null;

  const lang = activeTab.language || 'plaintext';

  const actions: { id: string; label: string; icon: string; action: () => void }[] = [];

  // Common actions always present
  actions.push(
    {
      id: 'save',
      label: 'Save',
      icon: '💾',
      action: saveActiveTab,
    },
    {
      id: 'run',
      label: 'Run',
      icon: '▶',
      action: runActiveFile,
    }
  );

  // Language-specific actions
  if (lang === 'python') {
    actions.push(
      {
        id: 'format',
        label: 'Format',
        icon: '✨',
        action: () => appendOutput('[Python] Format requested (demo)\n'),
      },
      {
        id: 'debug',
        label: 'Debug',
        icon: '🐛',
        action: () => appendOutput('[Python] Debug mode (demo)\n'),
      },
      {
        id: 'repl',
        label: 'REPL',
        icon: '🖥',
        action: () => appendOutput('[Python] Open REPL (demo)\n'),
      }
    );
  } else if (lang === 'javascript' || lang === 'typescript') {
    actions.push(
      {
        id: 'format',
        label: 'Format',
        icon: '✨',
        action: () => appendOutput('[JS] Format requested (demo)\n'),
      },
      {
        id: 'lint',
        label: 'Lint',
        icon: '🔍',
        action: () => appendOutput('[JS] Lint check (demo)\n'),
      },
      {
        id: 'bundle',
        label: 'Bundle',
        icon: '📦',
        action: () => appendOutput('[JS] Bundle (demo)\n'),
      }
    );
  } else if (lang === 'markdown') {
    actions.push(
      {
        id: 'preview',
        label: 'Preview',
        icon: '👁',
        action: () => appendOutput('[Markdown] Preview (demo)\n'),
      },
      {
        id: 'export',
        label: 'Export',
        icon: '📤',
        action: () => appendOutput('[Markdown] Export (demo)\n'),
      }
    );
  } else if (lang === 'html' || lang === 'css') {
    actions.push(
      {
        id: 'preview',
        label: 'Preview',
        icon: '👁',
        action: () => appendOutput('[HTML] Live preview (demo)\n'),
      },
      {
        id: 'inspect',
        label: 'Inspect',
        icon: '🔬',
        action: () => appendOutput('[HTML] Inspect (demo)\n'),
      }
    );
  }

  actions.push({
    id: 'palette',
    label: 'More',
    icon: '⋯',
    action: () => setCommandPaletteOpen(true),
  });

  return (
    <div className="contextual-bar" onMouseDown={(e) => e.preventDefault()}>
      <div className="ctx-lang">
        <span className="ctx-lang-badge">{lang.toUpperCase()}</span>
        <span className="ctx-file">{activeTab.name}</span>
      </div>
      <div className="ctx-actions">
        {actions.map((a) => (
          <button key={a.id} className="ctx-btn" onClick={a.action} title={a.label}>
            <span className="ctx-icon">{a.icon}</span>
            <span className="ctx-label">{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
