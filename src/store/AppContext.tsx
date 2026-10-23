import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import type { AppSettings, OpenTab, FileNode, ShortcutId, CommandItem } from '../types';
import { runPython } from '../runtime/python';
import { DEFAULT_SETTINGS, DEMO_PROJECT } from './defaults';

interface AppState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  updateShortcut: (id: ShortcutId, keys: string) => void;
  resetShortcuts: () => void;

  files: FileNode[];
  openTabs: OpenTab[];
  activeTabId: string | null;
  openFile: (file: FileNode) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  saveActiveTab: () => void;
  createNewFile: () => void;

  output: string;
  appendOutput: (text: string) => void;
  clearOutput: () => void;
  runActiveFile: () => void;

  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  isRadialOpen: boolean;
  setRadialOpen: (open: boolean) => void;

  getCommands: () => CommandItem[];

  focusEditor: () => void;
  registerEditor: (editor: EditorHandle | null) => void;
  getEditor: () => EditorHandle | null;

  renamingId: string | null;
  setRenamingId: (id: string | null) => void;
  renameFile: (id: string, newName: string) => void;
  deleteFile: (id: string) => void;
}

// The slice of Monaco's editor API that the app needs
export interface EditorHandle {
  focus: () => void;
  trigger: (source: string, handlerId: string, payload: unknown) => void;
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = 'leftcode-settings-v1';
const FILES_KEY = 'leftcode-files-v1';

function loadFiles(): FileNode[] {
  try {
    const raw = localStorage.getItem(FILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEMO_PROJECT;
}

const LANGS: Record<string, string> = {
  py: 'python', js: 'javascript', mjs: 'javascript', ts: 'typescript', tsx: 'typescript',
  jsx: 'javascript', java: 'java', md: 'markdown', html: 'html', css: 'css', json: 'json',
  c: 'c', h: 'c', cpp: 'cpp', cs: 'csharp', go: 'go', rs: 'rust', sh: 'shell', sql: 'sql',
};
export function langFromName(name: string): string {
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  return LANGS[ext] ?? 'plaintext';
}
function findNode(list: FileNode[], id: string): FileNode | null {
  for (const n of list) {
    if (n.id === id) return n;
    const hit = n.children ? findNode(n.children, id) : null;
    if (hit) return hit;
  }
  return null;
}
function collectIds(n: FileNode): string[] {
  return [n.id, ...(n.children || []).flatMap(collectIds)];
}
function removeNode(list: FileNode[], id: string): FileNode[] {
  return list
    .filter((n) => n.id !== id)
    .map((n) => (n.children ? { ...n, children: removeNode(n.children, id) } : n));
}

// Write a tab's content into the file tree (insert under root if it's a brand-new file)
function upsertFile(nodes: FileNode[], tab: OpenTab): FileNode[] {
  let found = false;
  const walk = (list: FileNode[]): FileNode[] =>
    list.map((n) => {
      if (n.id === tab.id) {
        found = true;
        return { ...n, name: tab.name, language: tab.language, content: tab.content };
      }
      return n.children ? { ...n, children: walk(n.children) } : n;
    });
  const next = walk(nodes);
  if (found) return next;
  const file: FileNode = {
    id: tab.id, name: tab.name, type: 'file',
    language: tab.language, content: tab.content, parentId: 'root',
  };
  return next.map((n) =>
    n.id === 'root' ? { ...n, children: [...(n.children || []), file] } : n
  );
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed, shortcuts: DEFAULT_SETTINGS.shortcuts.map(
          (d) => (parsed.shortcuts || []).find((s: { id: string }) => s.id === d.id) ?? d
        ),
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [files, setFiles] = useState<FileNode[]>(loadFiles);
  const editorRef = useRef<EditorHandle | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [output, setOutput] = useState<string>(
    'Welcome to LeftCode v0.3\n' +
    'Alt+Q → Command Palette\n' +
    'Alt+Space → Radial Menu (signature feature)\n' +
    'Alt+W Save · Alt+E Run · Alt+S Settings\n'
  );
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isRadialOpen, setRadialOpen] = useState(false);

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Persist files
  useEffect(() => {
    try {
      localStorage.setItem(FILES_KEY, JSON.stringify(files));
    } catch {}
  }, [files]);

  // Focus handling: return to the editor whenever an overlay closes
  const registerEditor = useCallback((ed: EditorHandle | null) => {
    editorRef.current = ed;
  }, []);
  const getEditor = useCallback(() => editorRef.current, []);
  const focusEditor = useCallback(() => {
    setTimeout(() => editorRef.current?.focus(), 0);
  }, []);
  const anyOverlay = isCommandPaletteOpen || isSettingsOpen || isRadialOpen;
  const wasOverlay = useRef(false);
  useEffect(() => {
    if (wasOverlay.current && !anyOverlay) focusEditor();
    wasOverlay.current = anyOverlay;
  }, [anyOverlay, focusEditor]);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateShortcut = useCallback((id: ShortcutId, keys: string) => {
    setSettings((prev) => ({
      ...prev,
      shortcuts: prev.shortcuts.map((s) => (s.id === id ? { ...s, keys } : s)),
    }));
  }, []);

  const resetShortcuts = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      shortcuts: DEFAULT_SETTINGS.shortcuts.map((s) => ({ ...s })),
    }));
  }, []);

  const openFile = useCallback((file: FileNode) => {
    if (file.type !== 'file') return;
    setActiveTabId(file.id);
    setOpenTabs((prev) =>
      prev.some((t) => t.id === file.id)
        ? prev
        : [
            ...prev,
            {
              id: file.id,
              name: file.name,
              language: file.language || 'plaintext',
              content: file.content || '',
              isDirty: false,
            },
          ]
    );
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      const idx = openTabs.findIndex((t) => t.id === id);
      if (idx < 0) return;
      const next = openTabs.filter((t) => t.id !== id);
      setOpenTabs(next);
      if (activeTabId === id) {
        setActiveTabId(next.length ? next[Math.min(idx, next.length - 1)].id : null);
      }
    },
    [openTabs, activeTabId]
  );

  const setActiveTab = useCallback((id: string) => {
    setActiveTabId(id);
  }, []);

  const updateTabContent = useCallback((id: string, content: string) => {
    setOpenTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, content, isDirty: true } : t))
    );
  }, []);

  const saveTab = useCallback((tab: OpenTab) => {
    setFiles((prev) => upsertFile(prev, tab));
    setOpenTabs((prev) =>
      prev.map((t) => (t.id === tab.id && t.content === tab.content ? { ...t, isDirty: false } : t))
    );
  }, []);

  const saveActiveTab = useCallback(() => {
    const tab = openTabs.find((t) => t.id === activeTabId);
    if (!tab) return;
    saveTab(tab);
    setOutput((prev) => prev + `[Saved] ${tab.name}
`);
  }, [activeTabId, openTabs, saveTab]);

  const renameFile = useCallback((id: string, raw: string) => {
    const name = raw.trim();
    setRenamingId(null);
    if (!name || /[\\/]/.test(name)) return;
    const walk = (list: FileNode[]): FileNode[] =>
      list.map((n) =>
        n.id === id
          ? { ...n, name, ...(n.type === 'file' ? { language: langFromName(name) } : {}) }
          : n.children
          ? { ...n, children: walk(n.children) }
          : n
      );
    setFiles((prev) => walk(prev));
    setOpenTabs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, name, language: langFromName(name) } : t))
    );
  }, []);

  const deleteFile = useCallback(
    (id: string) => {
      const node = findNode(files, id);
      if (!node) {
        closeTab(id); // unsaved new file: just close it
        return;
      }
      if (!window.confirm(`Delete "${node.name}"? This can't be undone.`)) return;
      const gone = new Set(collectIds(node));
      const next = openTabs.filter((t) => !gone.has(t.id));
      setFiles((prev) => removeNode(prev, id));
      setOpenTabs(next);
      if (activeTabId && gone.has(activeTabId)) {
        setActiveTabId(next.length ? next[next.length - 1].id : null);
      }
    },
    [files, openTabs, activeTabId, closeTab]
  );

  // Autosave: removes the need for the Save chord entirely
  useEffect(() => {
    if (!settings.autoSave) return;
    const tab = openTabs.find((t) => t.id === activeTabId);
    if (!tab?.isDirty) return;
    const h = setTimeout(() => saveTab(tab), 800);
    return () => clearTimeout(h);
  }, [openTabs, activeTabId, settings.autoSave, saveTab]);

  const createNewFile = useCallback(() => {
    const id = `new-${Date.now()}`;
    const newTab: OpenTab = {
      id,
      name: `untitled-${Date.now().toString(36).slice(-4)}.js`,
      language: 'javascript',
      content: '// New file\n',
      isDirty: true,
    };
    setOpenTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  }, [openTabs.length]);

  const appendOutput = useCallback((text: string) => {
    setOutput((prev) => prev + text);
  }, []);

  const clearOutput = useCallback(() => {
    setOutput('');
  }, []);

  const runActiveFile = useCallback(() => {
    const tab = openTabs.find((t) => t.id === activeTabId);
    if (!tab) {
      appendOutput('No active file to run.\n');
      return;
    }

    appendOutput(`\n▶ Running ${tab.name}...\n`);

    // Very simple simulated runners for demo
    if (tab.language === 'javascript' || tab.name.endsWith('.js')) {
      try {
        // Capture console.log
        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args: unknown[]) => {
          logs.push(args.map(String).join(' '));
        };
        // eslint-disable-next-line no-new-func
        try {
          new Function(tab.content)();
        } finally {
          console.log = originalLog;
        }
        if (logs.length) {
          logs.forEach((l) => appendOutput(l + '\n'));
        } else {
          appendOutput('(no output)\n');
        }
      } catch (err) {
        appendOutput(`Error: ${err}\n`);
      }
    } else if (tab.language === 'python' || tab.name.endsWith('.py')) {
      runPython(
        tab.content,
        (line) => appendOutput(line + '\n'),
        () => appendOutput('▶ Done.\n')
      );
      return;
    } else if (tab.language === 'java' || tab.name.endsWith('.java')) {
      appendOutput('Java needs a real JDK (javac + java), which a browser cannot provide.\n');
      appendOutput('The desktop (Tauri) version will run Java with the JDK on your machine.\n');
    } else {
      appendOutput(`Cannot run ${tab.language} files in the browser demo.\n`);
    }

    appendOutput('▶ Done.\n');
  }, [activeTabId, openTabs, appendOutput]);

  const getCommands = useCallback((): CommandItem[] => {
    return [
      {
        id: 'save',
        label: 'Save File',
        shortcut: settings.shortcuts.find((s) => s.id === 'save')?.keys,
        action: saveActiveTab,
        category: 'File',
      },
      {
        id: 'run',
        label: 'Run File',
        shortcut: settings.shortcuts.find((s) => s.id === 'run')?.keys,
        action: runActiveFile,
        category: 'Run',
      },
      {
        id: 'newFile',
        label: 'New File',
        shortcut: settings.shortcuts.find((s) => s.id === 'newFile')?.keys,
        action: createNewFile,
        category: 'File',
      },
      {
        id: 'toggleExplorer',
        label: settings.showExplorer ? 'Hide Explorer' : 'Show Explorer',
        shortcut: settings.shortcuts.find((s) => s.id === 'toggleExplorer')?.keys,
        action: () => updateSettings({ showExplorer: !settings.showExplorer }),
        category: 'View',
      },
      {
        id: 'toggleOutput',
        label: settings.showOutput ? 'Hide Output' : 'Show Output',
        shortcut: settings.shortcuts.find((s) => s.id === 'toggleOutput')?.keys,
        action: () => updateSettings({ showOutput: !settings.showOutput }),
        category: 'View',
      },
      {
        id: 'settings',
        label: 'Open Settings',
        shortcut: settings.shortcuts.find((s) => s.id === 'settings')?.keys,
        action: () => setSettingsOpen(true),
        category: 'Preferences',
      },
      {
        id: 'oneHand',
        label: settings.layoutMode === 'oneHand' ? 'Exit One-Hand Mode' : 'Enter One-Hand Mode',
        action: () =>
          updateSettings({
            layoutMode: settings.layoutMode === 'oneHand' ? 'normal' : 'oneHand',
          }),
        category: 'Accessibility',
      },
      {
        id: 'mirror',
        label: settings.mirrorMode ? 'Turn Mirror Mode Off' : 'Turn Mirror Mode On',
        shortcut: settings.shortcuts.find((s) => s.id === 'mirror')?.keys,
        action: () => updateSettings({ mirrorMode: !settings.mirrorMode }),
        category: 'Accessibility',
      },
      {
        id: 'keyboardHud',
        label: settings.showKeyboardHud ? 'Hide On-Screen Keyboard' : 'Show On-Screen Keyboard',
        action: () => updateSettings({ showKeyboardHud: !settings.showKeyboardHud }),
        category: 'Accessibility',
      },
      {
        id: 'renameFile',
        label: 'Rename Active File',
        action: () => {
          if (!activeTabId) return;
          if (!settings.showExplorer) updateSettings({ showExplorer: true });
          setRenamingId(activeTabId);
        },
        category: 'File',
      },
      {
        id: 'deleteFile',
        label: 'Delete Active File',
        action: () => activeTabId && deleteFile(activeTabId),
        category: 'File',
      },
      {
        id: 'clearOutput',
        label: 'Clear Output',
        action: clearOutput,
        category: 'Run',
      },
      {
        id: 'radial',
        label: 'Open Radial Menu',
        shortcut: 'Alt+Space',
        action: () => setRadialOpen(true),
        category: 'Accessibility',
      },
    ];
  }, [settings, saveActiveTab, runActiveFile, createNewFile, updateSettings, clearOutput, setRadialOpen]);

  const value: AppState = {
    settings,
    updateSettings,
    updateShortcut,
    resetShortcuts,
    files,
    openTabs,
    activeTabId,
    openFile,
    closeTab,
    setActiveTab,
    updateTabContent,
    saveActiveTab,
    createNewFile,
    output,
    appendOutput,
    clearOutput,
    runActiveFile,
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    isSettingsOpen,
    setSettingsOpen,
    isRadialOpen,
    setRadialOpen,
    getCommands,
    focusEditor,
    registerEditor,
    getEditor,
    renamingId,
    setRenamingId,
    renameFile,
    deleteFile,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
