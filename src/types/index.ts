export type ShortcutId =
  | 'commandPalette'
  | 'save'
  | 'run'
  | 'toggleOutput'
  | 'search'
  | 'toggleExplorer'
  | 'settings'
  | 'newFile'
  | 'closeTab'
  | 'radial'
  | 'mirror';

export interface ShortcutBinding {
  id: ShortcutId;
  label: string;
  defaultKeys: string; // e.g. "Alt+Q"
  keys: string;        // current binding
  description?: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
  parentId?: string | null;
}

export interface OpenTab {
  id: string;
  name: string;
  language: string;
  content: string;
  isDirty: boolean;
}

export type LayoutMode = 'normal' | 'oneHand' | 'rightHand';

export interface AppSettings {
  explorerSide: 'left' | 'right';
  layoutMode: LayoutMode;
  theme: 'dark' | 'light';
  fontSize: number;
  shortcuts: ShortcutBinding[];
  showMinimap: boolean;
  showOutput: boolean;
  showExplorer: boolean;
  autoSave: boolean;
  mirrorMode: boolean;
  showKeyboardHud: boolean;
}

export interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  category?: string;
}
