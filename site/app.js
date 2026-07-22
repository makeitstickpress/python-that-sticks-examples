import { chapters, getChapter } from "./chapters.js";

const app = document.querySelector("#app");
const worker = new Worker(new URL("./python-worker.js", import.meta.url), {
  type: "module",
});
const pendingRuns = new Map();
let runSequence = 0;
let pythonVersion = "loading";

worker.addEventListener("message", ({ data }) => {
  if (data.type === "ready") {
    pythonVersion = data.pythonVersion;
    document.querySelectorAll("[data-runtime]").forEach((node) => {
      node.textContent = `Browser Python ${pythonVersion} ready`;
      node.classList.add("ready");
    });
    return;
  }

  if (data.type === "load-error") {
    document.querySelectorAll("[data-runtime]").forEach((node) => {
      node.textContent = "Python could not load. Check your connection and refresh.";
      node.classList.add("error");
    });
    return;
  }

  if (data.type === "result") {
    const resolve = pendingRuns.get(data.id);
    if (resolve) {
      pendingRuns.delete(data.id);
      resolve(data);
    }
  }
});

worker.postMessage({ type: "load" });

function runPython(code) {
  const id = ++runSequence;
  return new Promise((resolve) => {
    pendingRuns.set(id, resolve);
    worker.postMessage({ type: "run", id, code });
  });
}

function route() {
  const match = location.hash.match(/^#\/chapter\/(\d+)(?:\/([^/?#]+))?/);
  return {
    chapterNumber: match ? Number(match[1]) : 1,
    exampleId: match?.[2] || null,
  };
}

function chapterLink(chapterNumber, exampleId = "") {
  return `#/chapter/${chapterNumber}${exampleId ? `/${exampleId}` : ""}`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderSidebar(currentChapter) {
  return `
    <aside class="sidebar">
      <div class="brand">
        <p class="brand-title">Python That Sticks</p>
        <p class="brand-sub">Live examples</p>
      </div>
      <nav aria-label="Book chapters">
        <p class="nav-part-title">Quizzical</p>
        <ul class="chapter-list">
          ${chapters
            .map(
              (chapter) => `
                <li>
                  <a class="nav-link ${chapter.num === currentChapter ? "active" : ""}" href="${chapterLink(chapter.num)}">
                    <span class="nav-num">${chapter.num}</span>
                    <span>${chapter.title}</span>
                    <span class="nav-dot" aria-label="available"></span>
                  </a>
                </li>`,
            )
            .join("")}
        </ul>
      </nav>
    </aside>`;
}

function renderExample(example, chapterNumber) {
  return `
    <section class="example" id="${example.id}" data-example="${example.id}">
      <div class="example-head">
        <div>
          <h2>${example.heading}</h2>
          <span class="chip">${example.instruction}</span>
        </div>
        <button class="copy-button" type="button" data-copy>Copy link</button>
      </div>
      <p class="example-intro">${example.intro}</p>
      <div class="runner">
        <div class="editor-pane">
          <div class="pane-head">
            <span>Python code</span>
            <button type="button" class="reset-button" data-reset>Reset</button>
          </div>
          <textarea aria-label="Editable Python code" spellcheck="false" data-code>${escapeHtml(example.code)}</textarea>
        </div>
        <div class="console-pane">
          <div class="pane-head console-head">
            <span>Console</span>
            <span class="runtime" data-runtime>${pythonVersion === "loading" ? "Loading browser Python…" : `Browser Python ${pythonVersion} ready`}</span>
          </div>
          <pre data-output aria-live="polite">Select Run code to see the output.</pre>
        </div>
      </div>
      <div class="runner-actions">
        <button class="run-button" type="button" data-run>Run code <span aria-hidden="true">▶</span></button>
        <span class="shortcut">Ctrl/⌘ + Enter</span>
      </div>
    </section>`;
}

function wireExample(section, example, chapterNumber) {
  const textarea = section.querySelector("[data-code]");
  const output = section.querySelector("[data-output]");
  const runButton = section.querySelector("[data-run]");
  const resetButton = section.querySelector("[data-reset]");
  const copyButton = section.querySelector("[data-copy]");

  async function run() {
    runButton.disabled = true;
    runButton.textContent = "Running…";
    output.textContent = pythonVersion === "loading" ? "Loading Python, then running your code…" : "Running…";
    output.classList.remove("error-output");

    const result = await runPython(textarea.value);
    output.textContent = result.output || "Program finished with no console output.";
    output.classList.toggle("error-output", !result.ok);
    runButton.disabled = false;
    runButton.innerHTML = 'Run code <span aria-hidden="true">▶</span>';
  }

  runButton.addEventListener("click", run);
  textarea.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      run();
    }
  });
  resetButton.addEventListener("click", () => {
    textarea.value = example.code;
    output.textContent = "Code reset. Select Run code to see the output.";
    output.classList.remove("error-output");
  });
  copyButton.addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}${chapterLink(chapterNumber, example.id)}`;
    await navigator.clipboard?.writeText(url);
    copyButton.textContent = "Link copied ✓";
    setTimeout(() => (copyButton.textContent = "Copy link"), 1500);
  });
}

function render() {
  const { chapterNumber, exampleId } = route();
  const chapter = getChapter(chapterNumber) || chapters[0];
  document.title = `Chapter ${chapter.num}: ${chapter.title} — Python That Sticks`;

  app.innerHTML = `
    <div class="shell">
      ${renderSidebar(chapter.num)}
      <main class="content">
        <header class="chapter-head">
          <p class="chapter-kicker">Chapter ${chapter.num} · ${chapter.topic}</p>
          <h1>${chapter.title}</h1>
        </header>
        <p class="chapter-lede">Every example below is editable. Change the Python code, select <strong>Run code</strong>, and compare the console with the book. Nothing is installed on your computer.</p>
        <div class="runtime-note">
          <span class="runtime-dot"></span>
          <span data-runtime>${pythonVersion === "loading" ? "Loading browser Python…" : `Browser Python ${pythonVersion} ready`}</span>
          <span>Book examples are also checked with Python 3.15.</span>
        </div>
        ${chapter.examples.map((example) => renderExample(example, chapter.num)).join("")}
      </main>
    </div>`;

  chapter.examples.forEach((example) => {
    const section = document.querySelector(`[data-example="${example.id}"]`);
    wireExample(section, example, chapter.num);
  });

  if (exampleId) {
    requestAnimationFrame(() => {
      document.getElementById(exampleId)?.scrollIntoView({ block: "start" });
    });
  } else {
    scrollTo({ top: 0 });
  }
}

addEventListener("hashchange", render);
render();

