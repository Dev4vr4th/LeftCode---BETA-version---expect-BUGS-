import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { useApp } from '../../store/AppContext';
import './Editor.css';

export function CodeEditor() {
  const {
    openTabs,
    activeTabId,
    setActiveTab,
    closeTab,
    updateTabContent,
    settings,
    registerEditor,
    focusEditor,
  } = useApp();

  const editorRef = useRef<any>(null);

  const activeTab = openTabs.find((t) => t.id === activeTabId);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    registerEditor(editor);
    editor.focus();
  };

  // Switching or opening a tab puts the cursor straight into the code
  useEffect(() => {
    if (activeTabId) focusEditor();
  }, [activeTabId, focusEditor]);

  const handleChange = (value: string | undefined) => {
    if (activeTabId && value !== undefined) {
      updateTabContent(activeTabId, value);
    }
  };

  return (
    <div className="editor-container">
      {/* Tabs */}
      <div className="tabs">
        {openTabs.length === 0 && (
          <div className="empty-tabs">No files open — click a file in the explorer</div>
        )}
        {openTabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-name">
              {tab.isDirty ? '● ' : ''}
              {tab.name}
            </span>
            <button
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              title="Close (Alt+X)"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Monaco */}
      <div className="monaco-wrapper">
        {activeTab ? (
          <Editor
            height="100%"
            path={activeTab.id}
            language={activeTab.language}
            value={activeTab.content}
            theme={settings.theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={handleChange}
            onMount={handleEditorMount}
            options={{
              fontSize: settings.fontSize,
              minimap: { enabled: settings.showMinimap },
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              padding: { top: 12 },
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              bracketPairColorization: { enabled: true },
            }}
          />
        ) : (
          <div className="editor-empty">
            <h2>LeftCode</h2>
            <p>Open a file from the explorer on the left</p>
            <p className="hint">
              Press <kbd>Alt</kbd> + <kbd>Q</kbd> for the Command Palette
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
