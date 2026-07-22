const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v314.0.2/full/";

let runtimePromise;
let queue = Promise.resolve();

async function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const { loadPyodide } = await import(`${PYODIDE_BASE}pyodide.mjs`);
      const pyodide = await loadPyodide({ indexURL: PYODIDE_BASE });
      const pythonVersion = pyodide.runPython(
        "import sys; '.'.join(str(part) for part in sys.version_info[:3])",
      );
      postMessage({ type: "ready", pythonVersion });
      return pyodide;
    })().catch((error) => {
      postMessage({ type: "load-error", message: error.message });
      throw error;
    });
  }

  return runtimePromise;
}

async function execute({ id, code }) {
  const pyodide = await getRuntime();
  const stdout = [];
  const stderr = [];

  pyodide.setStdout({ batched: (text) => stdout.push(text) });
  pyodide.setStderr({ batched: (text) => stderr.push(text) });

  const globals = pyodide.runPython("dict()");

  try {
    await pyodide.runPythonAsync(code, { globals });
    postMessage({
      type: "result",
      id,
      output: [...stdout, ...stderr].join("\n"),
      ok: true,
    });
  } catch (error) {
    postMessage({
      type: "result",
      id,
      output: [...stdout, ...stderr, error.message].filter(Boolean).join("\n"),
      ok: false,
    });
  } finally {
    globals.destroy();
  }
}

self.onmessage = ({ data }) => {
  if (data.type === "load") {
    getRuntime();
    return;
  }

  if (data.type === "run") {
    queue = queue.then(() => execute(data)).catch((error) => {
      postMessage({ type: "result", id: data.id, output: error.message, ok: false });
    });
  }
};

