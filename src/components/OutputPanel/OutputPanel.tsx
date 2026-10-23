import { useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import './OutputPanel.css';

export function OutputPanel() {
  const { output, clearOutput, settings, runActiveFile } = useApp();
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      preRef.current.scrollTop = preRef.current.scrollHeight;
    }
  }, [output]);

  if (!settings.showOutput) return null;

  return (
    <div className="output-panel">
      <div className="output-header">
        <span>OUTPUT</span>
        <div className="output-actions">
          <button onClick={runActiveFile} title="Run (Alt+E)">
            ▶ Run
          </button>
          <button onClick={clearOutput} title="Clear">
            Clear
          </button>
        </div>
      </div>
      <pre ref={preRef} className="output-content">
        {output}
      </pre>
    </div>
  );
}
