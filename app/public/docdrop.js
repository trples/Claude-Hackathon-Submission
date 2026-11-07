// Paperwork folder for Step 2: drop files, read them in the browser, and tick checklist items they match.
// Privacy: files never leave the browser. Nothing is uploaded, saved to storage or sent to the server or Claude.
// Matching is a keyword guess from the file name and any readable text; the user can change every match.
"use strict";
(function (root) {
  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const MAX_PAGES = 30, MAX_TEXT = 200000;
  const STOP = new Set("a an and or the of for to in on by with if from per your our only city city's form forms application new exact not same also called use using adu jadu".split(" "));
  // Files live only in memory for this page view. They are cleared on reload.
  const FILES = []; // { id, file, name, text, status, match, how }
  let seq = 0, pdfjsP = null;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLowerCase().replace(/[_\-.]+/g, " ").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  const stem = (w) => w.replace(/(ations?|ments?|ions?|ies|es|s)$/, "").slice(0, 6);
  const keywords = (name) => [...new Set(norm(String(name).replace(/\(.*?\)/g, " ")).split(" ").filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w)).map(stem))];
  const hasWord = (hay, k) => new RegExp(`(^| )${k}`).test(hay);

  function loadPdfJs() {
    if (root.pdfjsLib) return Promise.resolve(root.pdfjsLib);
    if (pdfjsP) return pdfjsP;
    pdfjsP = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = PDFJS;
      s.onload = () => { root.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER; res(root.pdfjsLib); };
      s.onerror = () => { pdfjsP = null; rej(new Error("PDF reader didn't load")); };
      document.head.appendChild(s);
    });
    return pdfjsP;
  }

  async function readText(file) {
    const n = file.name.toLowerCase();
    if (file.type === "application/pdf" || n.endsWith(".pdf")) {
      const lib = await loadPdfJs();
      const doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
      let out = "";
      for (let i = 1; i <= Math.min(doc.numPages, MAX_PAGES) && out.length < MAX_TEXT; i++) {
        const tc = await (await doc.getPage(i)).getTextContent();
        out += " " + tc.items.map((it) => it.str).join(" ");
      }
      return out;
    }
    if (/^text\//.test(file.type) || /\.(txt|md|csv)$/.test(n)) return (await file.text()).slice(0, MAX_TEXT);
    return null; // images, Word files etc.: matched by file name only
  }

  // Score each checklist item against a file. Name hits count fully; text hits need most keywords.
  function bestMatch(f, items, taken) {
    const fn = norm(f.name.replace(/\.[a-z0-9]+$/i, "")), tx = f.text ? norm(f.text) : "";
    let best = null;
    for (const it of items) {
      if (taken.has(it.id)) continue;
      const ks = keywords(it.name);
      if (!ks.length) continue;
      const nameHits = ks.filter((k) => hasWord(fn, k)).length;
      const textHits = tx ? ks.filter((k) => hasWord(tx, k)).length : 0;
      const byName = nameHits / ks.length, byText = textHits / ks.length;
      let score = 0, how = "";
      if (nameHits >= Math.min(2, ks.length) && byName >= 0.5) { score = 1 + byName; how = "file name"; }
      else if (textHits >= Math.min(2, ks.length) && byText >= 0.75) { score = byText; how = "text inside the file"; }
      if (score && (!best || score > best.score)) best = { id: it.id, score, how };
    }
    return best;
  }

  let host = null;
  const items = () => [...document.querySelectorAll("#step-2 .paperwork ul.docs li")].map((li) => {
    const cb = li.querySelector("input[type=checkbox]");
    return { id: cb.id, name: li.querySelector(".name").textContent, cb, li };
  });

  function rematch() {
    const its = items();
    const taken = new Set(FILES.filter((f) => f.how === "you").map((f) => f.match).filter(Boolean));
    for (const f of FILES) {
      if (f.how === "you" || f.status !== "done") continue;
      const m = bestMatch(f, its, taken);
      f.match = m ? m.id : ""; f.how = m ? m.how : "";
      if (m) taken.add(m.id);
    }
    apply(its);
  }

  // Tick matched items and show the file next to them. Never untick a box the user ticked by hand.
  function apply(its = items()) {
    for (const it of its) {
      const fs = FILES.filter((f) => f.match === it.id);
      it.li.querySelector(".doc-files")?.remove();
      if (fs.length) {
        if (!it.cb.checked) { it.cb.checked = true; it.cb.dataset.auto = "1"; }
        it.li.querySelector("label").insertAdjacentHTML("beforeend", `<span class="doc-files">📎 ${fs.map((f) => esc(f.name)).join(", ")}</span>`);
      } else if (it.cb.dataset.auto) { it.cb.checked = false; delete it.cb.dataset.auto; }
    }
    render(its);
  }

  function render(its = items()) {
    const list = host && host.querySelector(".dd-list");
    if (!list) return;
    const opts = (f) => `<option value="">Not matched</option>` + its.map((it) => `<option value="${esc(it.id)}"${f.match === it.id ? " selected" : ""}>${esc(it.name)}</option>`).join("");
    list.innerHTML = FILES.map((f) => {
      const state = f.status === "reading" ? `<span class="dd-state">Reading…</span>`
        : f.match ? `<span class="dd-state ok">✓ Matched by ${esc(f.how === "you" ? "you" : f.how)}</span>`
        : `<span class="dd-state none">No match found${f.notext ? " (we couldn't read text in this file, so only its name was checked)" : ""}</span>`;
      return `<li data-fid="${f.id}">
        <div class="dd-file"><span class="dd-name">${esc(f.name)}</span>${state}</div>
        <div class="dd-ctl"><label class="dd-sel"><span class="sr-only">Checklist item for ${esc(f.name)}</span><select data-fid="${f.id}"${f.status === "reading" ? " disabled" : ""}>${opts(f)}</select></label>
        <button type="button" class="btn ghost dd-open" data-open="${f.id}">Open</button>
        <button type="button" class="btn ghost dd-rm" data-rm="${f.id}" aria-label="Remove ${esc(f.name)}">Remove</button></div></li>`;
    }).join("");
    const n = FILES.filter((f) => f.match).length;
    host.querySelector(".dd-sum").textContent = FILES.length ? `${FILES.length} file${FILES.length === 1 ? "" : "s"} · ${n} matched to the checklist (${its.filter((i) => i.cb.checked).length} of ${its.length} items checked)` : "";
  }

  async function add(fileList) {
    const fresh = [...fileList].map((file) => ({ id: `f${++seq}`, file, name: file.name, text: null, status: "reading", match: "", how: "" }));
    FILES.push(...fresh); render();
    await Promise.all(fresh.map(async (f) => {
      try { f.text = await readText(f.file); } catch { f.text = null; }
      f.notext = !(f.text && f.text.trim().length > 20);
      f.status = "done";
    }));
    rematch();
  }

  function attach() {
    host = document.querySelector("#step-2 .doc-drop");
    if (!host) return;
    const zone = host.querySelector(".dd-zone"), input = host.querySelector("input[type=file]");
    zone.addEventListener("click", (e) => { if (e.target !== input) input.click(); });
    zone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    input.addEventListener("change", () => { if (input.files.length) add(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add("over"); }));
    ["dragleave", "drop"].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove("over"); }));
    zone.addEventListener("drop", (e) => { if (e.dataTransfer.files.length) add(e.dataTransfer.files); });
    host.addEventListener("change", (e) => {
      const sel = e.target.closest("select[data-fid]"); if (!sel) return;
      const f = FILES.find((x) => x.id === sel.dataset.fid); if (!f) return;
      f.match = sel.value; f.how = sel.value ? "you" : "";
      apply();
    });
    host.addEventListener("click", (e) => {
      const rm = e.target.closest("[data-rm]"), op = e.target.closest("[data-open]");
      if (rm) { const i = FILES.findIndex((x) => x.id === rm.dataset.rm); if (i >= 0) FILES.splice(i, 1); rematch(); }
      if (op) { const f = FILES.find((x) => x.id === op.dataset.open); if (f) { const u = URL.createObjectURL(f.file); window.open(u, "_blank", "noopener"); setTimeout(() => URL.revokeObjectURL(u), 60000); } }
    });
    // The checklist re-renders when the project changes: re-match kept files against the new list.
    if (FILES.length) rematch(); else render();
  }

  const html = () => `<section class="step-sec doc-drop no-print" aria-label="Your paperwork folder">
    <h3 class="sec-title">Your paperwork folder</h3>
    <p class="hint">Add your files and we'll check off the checklist items they look like. Files stay in this browser: nothing is uploaded, and they're cleared when you reload. Matches are a guess from the file name and text, so check each one.</p>
    <div class="dd-zone" role="button" tabindex="0" aria-label="Add files: drop them here or press Enter to choose">
      <input type="file" multiple accept=".pdf,.txt,.md,.csv,.png,.jpg,.jpeg,.heic,.doc,.docx,application/pdf,image/*,text/plain" hidden>
      <span><strong>Drop files here</strong> or <span class="dd-link">choose files</span></span>
      <span class="hint">PDFs and text files are read. Photos and Word files are matched by file name.</span>
    </div>
    <p class="dd-sum" aria-live="polite"></p>
    <ul class="dd-list"></ul>
  </section>`;

  root.DocDrop = { html, attach, _keywords: keywords, _bestMatch: bestMatch };
})(window);
