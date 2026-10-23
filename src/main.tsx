import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as monaco from 'monaco-editor'
import { loader } from '@monaco-editor/react'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import './index.css'
import App from './App.tsx'

// Bundle Monaco locally instead of fetching it from a CDN (works offline / in Tauri)
self.MonacoEnvironment = {
  getWorker: (_id: string, label: string) =>
    label === 'typescript' || label === 'javascript' ? new tsWorker() : new editorWorker(),
}
loader.config({ monaco })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
