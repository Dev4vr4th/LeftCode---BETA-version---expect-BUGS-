// Runs Python with Pyodide inside a Web Worker (so a bad loop can't freeze the IDE).
// The runtime (~10 MB) is fetched from jsDelivr on first use, then cached by the browser.
const SRC = `
let py = null;
onmessage = async (e) => {
  try {
    if (!py) {
      postMessage({ t: 'loading' });
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
      py = await loadPyodide();
    }
    postMessage({ t: 'start' });
    py.setStdout({ batched: (s) => postMessage({ t: 'out', s }) });
    py.setStderr({ batched: (s) => postMessage({ t: 'out', s }) });
    await py.runPythonAsync(e.data);
  } catch (err) {
    postMessage({ t: 'out', s: String(err && err.message ? err.message : err) });
  }
  postMessage({ t: 'done' });
};
`;

let worker: Worker | null = null;

export function runPython(code: string, onOut: (line: string) => void, onDone: () => void) {
  if (!worker) {
    worker = new Worker(URL.createObjectURL(new Blob([SRC], { type: 'text/javascript' })));
  }
  const w = worker;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let started = false;
  const finish = () => {
    clearTimeout(timer);
    w.onmessage = null;
    w.onerror = null;
    onDone();
  };
  w.onmessage = (e: MessageEvent) => {
    const m = e.data;
    if (m.t === 'loading') onOut('Loading Python runtime (first run only)...');
    else if (m.t === 'start') {
      started = true;
      timer = setTimeout(() => {
        w.terminate();
        if (worker === w) worker = null;
        onOut('Stopped: program ran longer than 30 seconds.');
        finish();
      }, 30000);
    } else if (m.t === 'out') onOut(m.s);
    else if (m.t === 'done') {
      if (!started) onOut('Could not load the Python runtime. Check your internet connection (needed on first run).');
      finish();
    }
  };
  w.onerror = () => {
    onOut('Python worker crashed.');
    worker = null;
    finish();
  };
  w.postMessage(code);
}
