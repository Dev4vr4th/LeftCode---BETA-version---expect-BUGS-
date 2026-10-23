# LeftCode

A browser-based coding environment built for **left-hand and one-handed workflows**.

Every layout choice is measured against one principle: **minimum hand travel.**

> **Version 0.4.1-beta** — expect rough edges. Bug reports and feedback are welcome.

---

## Features

- **Mirror Mode**: hold `Space` and press a left-hand key to type its right-hand twin, so you can write full code with one hand.
- **On-screen keyboard**: shows the left-hand keys, lights up what you press, and displays what each key will actually type in Mirror Mode.
- **Radial command menu** (`Alt+Space`): keyboard-driven, left-hand ring.
- **Command palette** (`Alt+Q`) and fully remappable shortcuts.
- **Contextual toolbar** that changes with the file language.
- **Hand-travel meter** in the status bar (Minimal / Low / Medium / High).
- **Real editing**: Monaco editor (the engine behind VS Code), one undo history per tab.
- **Autosave** and persistent files (stored in your browser's localStorage).
- **Run Python in the browser** via Pyodide.
- **File explorer** with create, rename and delete. The file extension decides the language.

---

## Requirements

- **Node.js 20.19+ or 22.12+** (check with `node -v`). Download the current LTS from [nodejs.org](https://nodejs.org).
- **npm** (comes with Node.js).
- A modern browser (Chrome, Edge, Firefox, Safari).
- Internet access the **first time you run Python** (to download the Pyodide runtime).

---

## Quick start

```bash
# 1. Get the code
git clone https://github.com/<your-username>/leftcode.git
cd leftcode

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the address Vite prints, usually **http://localhost:5173/**.

### Other commands

| Command           | What it does                                   |
|-------------------|------------------------------------------------|
| `npm run dev`     | Start the development server with hot reload   |
| `npm run build`   | Type-check and build a production bundle (`dist/`) |
| `npm run preview` | Serve the production build locally             |
| `npm run lint`    | Lint the code with oxlint                      |

---

## Keyboard shortcuts

Shortcuts use the physical key position, so they work with any layout and with macOS Alt dead-keys.

| Action          | Keys        |
|-----------------|-------------|
| Radial menu     | `Alt+Space` |
| Command palette | `Alt+Q`     |
| Save            | `Alt+W`     |
| Run             | `Alt+E`     |
| Toggle output   | `Alt+R`     |
| Toggle explorer | `Alt+D`     |
| Settings        | `Alt+S`     |
| New file        | `Alt+N`     |
| Close tab       | `Alt+X`     |
| Mirror Mode     | `Alt+G` (or Settings) |

In the radial menu, press `Alt+Space`, then `W` `E` `D` `C` `X` `Z` `A` or `Q` to pick an item.

---

## Mirror Mode

Turn it on with `Alt+G` or from Settings. **Hold Space** and press a left-hand key to type its right-hand twin. **Tap Space alone** for a normal space (inserted on release).

| Hold Space + | Types       | | Hold Space + | Types       |
|--------------|-------------|-|--------------|-------------|
| `Q W E R T`  | `p o i u y` | | `A S D F G`  | `; l k j h` |
| `Z X C V B`  | `/ . , m n` | | `1 2 3 4 5`  | `0 9 8 7 6` |
| `Tab`        | `[`         | | `CapsLock`   | `'`         |
| `Esc`        | Backspace   | | `` ` ``      | Enter       |

With `Shift`: the shifted twin is typed (`Shift+2` = `(`, `Shift+1` = `)`, `Shift+A` = `:`). `Shift+`` ` ``, `Shift+Esc` and `Shift+Tab` type `]`, `=` and `{`.

**Not mapped yet:** `-`, `\`, `}`, arrow keys and Delete (a left-hand navigation layer is planned).

---

## On-screen keyboard

Toggle it in Settings or from the command palette. It sits in the bottom-right corner.

- **Move:** drag the grip (double-click to reset).
- **Resize:** drag the top-left corner (0.6x to 1.6x, always kept on screen).
- Position and size are remembered.

---

## Languages

The file extension decides the language and syntax highlighting. Renaming a file updates both.

| Extension | Language   | Runs in the browser? |
|-----------|------------|----------------------|
| `.py`     | Python     | Yes (Pyodide in a Web Worker, 30 s timeout) |
| `.js`     | JavaScript | Yes                  |
| `.md`     | Markdown   | Preview/export       |
| `.java`   | Java       | Not yet (planned for the desktop build, using your local JDK) |

**Python notes:** the first run downloads the runtime, so you need internet once. `input()` is not supported yet.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing script: "dev"` / `ENOENT package.json` | You're in the wrong folder. `cd` into the project folder (the one containing `package.json`). |
| `'vite' is not recognized` / `Cannot find module` | Run `npm install` first. |
| `SyntaxError: Unexpected token` or `crypto.hash is not a function` | Your Node.js is too old. Install Node 20.19+ or 22.12+. |
| Install errors or odd behaviour | Delete `node_modules` and `package-lock.json`, then run `npm install` again. |
| Port already in use | `npm run dev -- --port 3000` |
| Python won't run | Check your internet connection (first run only) and the output panel for errors. |
| Files disappeared | Files are stored in your browser's localStorage. Clearing site data or switching browsers resets them. |

Still stuck? [Open an issue](https://github.com/<your-username>/leftcode/issues) and include your OS, `node -v`, `npm -v` and the full error text.

---

## Tech stack

React 19, TypeScript, Vite, Monaco Editor, Pyodide.

---

## Changelog

**v0.4.1-beta**: draggable and resizable on-screen keyboard; explorer rename and delete; extension-based language detection; real Python execution via Pyodide.
**v0.4.0-beta**: Mirror Mode and the on-screen keyboard.
**v0.3.2**: real saving with persistence, autosave, better focus handling.
**v0.3.1**: shortcuts work while typing, keyboard-driven radial menu, local Monaco bundle, build fixes.
**v0.3**: contextual toolbar, hand-travel awareness, radial menu.

---

## Roadmap

- Left-hand navigation layer (arrows, Delete, missing symbols)
- Java support in a Tauri desktop build
- Voice commands and a full accessibility suite
- Real file system access

---

## Contributing

Issues and pull requests are welcome. Please run `npm run lint` and `npm run build` before submitting.

## License

Add your license here (for example MIT) and include a `LICENSE` file in the repo.
