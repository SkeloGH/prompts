#!/usr/bin/env node
/**
 * render-pdf.js — render an HTML slide deck to PDF via headless Chrome/Edge
 * and verify the page count. Part of the /pdf-presentation skill.
 *
 * Usage:
 *   node render-pdf.js <input.html> <output.pdf> [expectedSlides]
 *
 * Resolves a Chromium-family browser cross-platform, renders with
 * --print-to-pdf --no-pdf-header-footer, then counts pages in the output.
 * If expectedSlides is given and the count differs, exits non-zero — that
 * gap means a slide's content overflowed onto a second page, the one
 * failure mode of --print-to-pdf for fixed-size slides.
 *
 * Zero npm dependencies: works in any session with Node + a browser.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const [, , inPath, outPath, expectedArg] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: node render-pdf.js <input.html> <output.pdf> [expectedSlides]');
  process.exit(2);
}
const expected = expectedArg !== undefined ? Number(expectedArg) : null;

// --- browser resolution: env override -> standard paths -> PATH lookup ----
const STANDARD_BROWSER_PATHS = {
  win32: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
  linux: [
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge', '/snap/bin/chromium',
  ],
};

function resolveFromPath(bin) {
  const which = process.platform === 'win32' ? 'where' : 'which';
  const r = spawnSync(which, [bin], { encoding: 'utf8' });
  if (r.status !== 0 || !r.stdout) { return null; }
  const first = r.stdout.split(/\r?\n/)[0].trim();
  return first && fs.existsSync(first) ? first : null;
}

function findBrowser() {
  const env = process.env.CHROME_BIN || process.env.CHROMIUM_BIN;
  if (env) {
    if (fs.existsSync(env)) { return env; }
    throw new Error('CHROME_BIN/CHROMIUM_BIN points to a missing path: ' + env);
  }
  for (const c of (STANDARD_BROWSER_PATHS[process.platform] || [])) {
    if (fs.existsSync(c)) { return c; }
  }
  for (const n of ['google-chrome', 'chromium', 'chrome', 'msedge']) {
    const f = resolveFromPath(n);
    if (f) { return f; }
  }
  throw new Error(
    'No Chrome/Chromium/Edge browser found. Set CHROME_BIN to override, ' +
    'or install one in a standard location.',
  );
}

/**
 * Zero-dependency page count. Chrome/Edge --print-to-pdf (Skia backend)
 * emits a classic xref table with uncompressed object dictionaries, so
 * `/Type /Page` is greppable in the raw bytes and the page-tree `/Count`
 * is authoritative. Reliable for this skill's own output; not a general
 * PDF parser.
 */
function countPages(pdfPath) {
  const s = fs.readFileSync(pdfPath).toString('latin1');
  const treeCounts = [...s.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  const pageObjs = (s.match(/\/Type\s*\/Page(?![s])/g) || []).length;
  const treeMax = treeCounts.length ? Math.max(...treeCounts) : null;
  return { pageObjs, treeMax };
}

// --- render --------------------------------------------------------------
const inAbs = path.resolve(inPath);
const outAbs = path.resolve(outPath);
if (!fs.existsSync(inAbs)) { console.error('input not found: ' + inAbs); process.exit(2); }
fs.mkdirSync(path.dirname(outAbs), { recursive: true });
if (fs.existsSync(outAbs)) { fs.unlinkSync(outAbs); }

let browser;
try { browser = findBrowser(); } catch (e) { console.error(e.message); process.exit(1); }

const fileUrl = 'file:///' + inAbs.replace(/\\/g, '/');
const args = [
  '--headless', '--disable-gpu', '--no-pdf-header-footer',
  '--print-to-pdf=' + outAbs, fileUrl,
];
console.log('browser : ' + browser);
const r = spawnSync(browser, args, { encoding: 'utf8', timeout: 120000 });
if (!fs.existsSync(outAbs)) {
  if (r.stderr) { console.error(r.stderr); }
  console.error('render failed — no PDF produced');
  process.exit(1);
}

// --- verify --------------------------------------------------------------
const { pageObjs, treeMax } = countPages(outAbs);
const pages = treeMax != null ? treeMax : pageObjs;
const kb = (fs.statSync(outAbs).size / 1024).toFixed(1);
console.log('output  : ' + outAbs);
console.log('size    : ' + kb + ' KB');
console.log('pages   : ' + pages + (expected != null ? ' (expected ' + expected + ')' : ''));

if (treeMax != null && pageObjs !== treeMax) {
  console.log('WARNING : page-tree /Count (' + treeMax + ') != /Page objects (' + pageObjs + ')');
}
if (expected != null) {
  if (pages === expected) {
    console.log('RESULT  : OK — ' + pages + ' pages, no content bleed');
  } else {
    console.log(
      'RESULT  : FAIL — expected ' + expected + ' slides but got ' + pages +
      ' pages. A slide overflowed onto a second page; tighten its content and re-render.',
    );
    process.exit(1);
  }
} else {
  console.log('RESULT  : rendered ' + pages + ' pages (pass <expectedSlides> to assert)');
}
