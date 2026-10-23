import type { AppSettings, ShortcutBinding, FileNode } from '../types';

export const DEFAULT_SHORTCUTS: ShortcutBinding[] = [
  {
    id: 'commandPalette',
    label: 'Command Palette',
    defaultKeys: 'Alt+Q',
    keys: 'Alt+Q',
    description: 'Open the command palette',
  },
  {
    id: 'save',
    label: 'Save',
    defaultKeys: 'Alt+W',
    keys: 'Alt+W',
    description: 'Save current file',
  },
  {
    id: 'run',
    label: 'Run',
    defaultKeys: 'Alt+E',
    keys: 'Alt+E',
    description: 'Run / execute current file',
  },
  {
    id: 'toggleOutput',
    label: 'Toggle Output',
    defaultKeys: 'Alt+R',
    keys: 'Alt+R',
    description: 'Show / hide output panel',
  },
  {
    id: 'search',
    label: 'Search',
    defaultKeys: 'Alt+F',
    keys: 'Alt+F',
    description: 'Focus search (coming soon)',
  },
  {
    id: 'toggleExplorer',
    label: 'Toggle Explorer',
    defaultKeys: 'Alt+D',
    keys: 'Alt+D',
    description: 'Show / hide file explorer',
  },
  {
    id: 'settings',
    label: 'Settings',
    defaultKeys: 'Alt+S',
    keys: 'Alt+S',
    description: 'Open settings',
  },
  {
    id: 'newFile',
    label: 'New File',
    defaultKeys: 'Alt+N',
    keys: 'Alt+N',
    description: 'Create a new file',
  },
  {
    id: 'closeTab',
    label: 'Close Tab',
    defaultKeys: 'Alt+X',
    keys: 'Alt+X',
    description: 'Close current tab',
  },
  {
    id: 'radial',
    label: 'Radial Menu',
    defaultKeys: 'Alt+Space',
    keys: 'Alt+Space',
    description: 'Open the radial command menu',
  },
  {
    id: 'mirror',
    label: 'Toggle Mirror Mode',
    defaultKeys: 'Alt+G',
    keys: 'Alt+G',
    description: 'Hold Space + left-hand key to type its right-hand twin',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  explorerSide: 'left',
  layoutMode: 'oneHand',
  theme: 'dark',
  fontSize: 14,
  shortcuts: DEFAULT_SHORTCUTS,
  showMinimap: false,
  showOutput: true,
  showExplorer: true,
  autoSave: true,
  mirrorMode: false,
  showKeyboardHud: true,
};

export const DEMO_PROJECT: FileNode[] = [
  {
    id: 'root',
    name: 'leftcode-demo',
    type: 'folder',
    children: [
      {
        id: 'src',
        name: 'src',
        type: 'folder',
        parentId: 'root',
        children: [
          {
            id: 'main-py',
            name: 'main.py',
            type: 'file',
            language: 'python',
            parentId: 'src',
            content: `# LeftCode Demo - Python
def greet(name: str) -> str:
    return f"Hello, {name}! Welcome to LeftCode."

if __name__ == "__main__":
    print(greet("left-hand coder"))
    print("Your right arm can rest. We got this.")
`,
          },
          {
            id: 'app-js',
            name: 'app.js',
            type: 'file',
            language: 'javascript',
            parentId: 'src',
            content: `// LeftCode Demo - JavaScript
function greet(name) {
  return \`Hello, \${name}! Welcome to LeftCode.\`;
}

console.log(greet("left-hand coder"));
console.log("Minimal hand travel. Maximum flow.");
`,
          },
          {
            id: 'readme-md',
            name: 'README.md',
            type: 'file',
            language: 'markdown',
            parentId: 'src',
            content: `# LeftCode

A coding environment designed for **left-hand and one-handed workflows**.

## Core Principles
- Minimum hand travel
- Fully customizable shortcuts
- Explorer on the left by default
- Command Palette is king
- One-Hand Mode for recovery / accessibility

Press **Alt+Q** to open the Command Palette.
`,
          },
        ],
      },
    ],
  },
];
