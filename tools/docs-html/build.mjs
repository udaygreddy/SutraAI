// Builds ADP-themed, self-contained HTML pages from docs/ghostwriter/*.md.
// Mermaid diagrams are pre-rendered to inline SVG with Playwright, so the pages
// need no network access to show them.
//
// Usage: cd tools/docs-html && npm install && npm run build

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const srcDir = join(root, 'docs/ghostwriter');
const outDir = join(srcDir, 'html');

const PAGES = [
  { md: 'feature-catalog.md', html: 'feature-catalog.html', nav: 'Feature catalog',
    blurb: 'All twelve candidate features (F1–F12): what each does, its inputs and outputs, Agentforce touchpoints, KGG reuse, phase and dependencies.' },
  { md: 'architecture-design-f1-f4-f7.md', html: 'architecture-design-f1-f4-f7.html', nav: 'Architecture and design',
    blurb: 'The first build: gap mining, diagnosis, change drafting, test generation and building agents from SOPs, on a domain-agnostic KGG core.' },
];

// ADP-style palette: ADP red as the single accent on white and neutral greys.
const BRAND = {
  red: '#D0271D', redDark: '#A41F17', redTint: '#FBEAE9',
  ink: '#1F1F1F', muted: '#5C5C5C', line: '#E2E2E2', surface: '#F6F6F6', white: '#FFFFFF',
};

const MERMAID_THEME = {
  theme: 'base',
  themeVariables: {
    fontFamily: 'Roboto, "Segoe UI", Arial, sans-serif',
    fontSize: '14px',
    primaryColor: BRAND.white,
    primaryBorderColor: '#9A9A9A',
    primaryTextColor: BRAND.ink,
    lineColor: '#8A8A8A',
    secondaryColor: BRAND.redTint,
    tertiaryColor: BRAND.surface,
    clusterBkg: BRAND.surface,
    clusterBorder: '#BDBDBD',
    edgeLabelBackground: BRAND.white,
  },
  flowchart: { htmlLabels: false, curve: 'basis', padding: 12 },
};

// ---------- markdown -> html ----------

const slug = (t) => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function convert(md) {
  const diagrams = [];
  // A mermaid block may be preceded by <!-- diagram: name -->; the build then uses the
  // hand-designed SVG in diagrams/<name>.jsx and keeps mermaid only as the GitHub view.
  const withPlaceholders = md.replace(/(?:<!-- diagram: ([\w-]+) -->\n)?```mermaid\n([\s\S]*?)```/g, (_, name, code) => {
    diagrams.push({ name, code: code.trim() });
    return `\n<div data-diagram="${diagrams.length - 1}"></div>\n`;
  });

  const toc = [];
  const renderer = new marked.Renderer();
  renderer.heading = (text, level) => {
    const id = slug(text);
    if (level === 2 || level === 3) toc.push({ level, text, id });
    return `<h${level} id="${id}">${text}</h${level}>\n`;
  };
  renderer.link = (href, title, text) => {
    const h = href.endsWith('.md') ? href.replace(/\.md$/, '.html') : href;
    const ext = /^https?:/.test(h) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${h}"${title ? ` title="${title}"` : ''}${ext}>${text}</a>`;
  };
  renderer.table = (header, body) => `<div class="table-wrap"><table><thead>${header}</thead><tbody>${body}</tbody></table></div>\n`;
  renderer.listitem = (text, task, checked) =>
    task ? `<li class="task"><span class="box${checked ? ' on' : ''}" aria-hidden="true"></span>${text.replace(/^<input[^>]*>\s*/, '')}</li>\n` : `<li>${text}</li>\n`;

  const html = marked.parse(withPlaceholders, { renderer, gfm: true });
  return { body: html, toc, diagrams };
}

// ---------- mermaid -> svg (headless browser) ----------

// Tiny JSX-to-string runtime for the designed diagrams (SVG only).
const KEEP_CASE = new Set(['viewBox', 'refX', 'refY', 'markerWidth', 'markerHeight']);
const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function h(tag, props, ...children) {
  const attrs = Object.entries(props || {})
    .filter(([k, v]) => v !== undefined && v !== null && v !== false && k !== 'key' && !k.startsWith('data-claude'))
    .map(([k, v]) => ` ${KEEP_CASE.has(k) ? k : k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}="${esc(v)}"`).join('');
  const inner = children.flat(Infinity).map((c) => (c && c.__html !== undefined ? c.__html : c === null || c === false || c === undefined ? '' : esc(c))).join('');
  return { __html: `<${tag}${attrs}>${inner}</${tag}>` };
}
async function renderDesigned(name) {
  const { transform } = await import('esbuild');
  const src = readFileSync(join(here, 'diagrams', `${name}.jsx`), 'utf8');
  const { code } = await transform(src, { loader: 'jsx', jsxFactory: '__jsx', format: 'esm' });
  const mod = await import('data:text/javascript;base64,' + Buffer.from(`const __jsx = globalThis.__h;\n${code}`).toString('base64'));
  globalThis.__h = h;
  return mod.default().__html;
}

async function renderDiagrams(all) {
  globalThis.__h = h;
  const out = new Array(all.length);
  for (const [i, d] of all.entries()) if (d.name) out[i] = await renderDesigned(d.name);
  const pending = all.map((d, i) => [d, i]).filter(([d]) => !d.name);
  if (!pending.length) return out;
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<!doctype html><html><body></body></html>');
  await page.addScriptTag({ path: require.resolve('mermaid/dist/mermaid.min.js') });
  await page.evaluate((cfg) => window.mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', ...cfg }), MERMAID_THEME);
  for (const [d, i] of pending) {
    out[i] = await page.evaluate(async ({ id, code }) => (await window.mermaid.render(id, code)).svg, { id: `gw-diagram-${i}`, code: d.code });
  }
  await browser.close();
  return out;
}

// ---------- page template ----------

const CSS = `
:root{--cds-chart-axis:#8A8A8A;--cds-chart-grid:${BRAND.line};--cds-chart-categorical-1:${BRAND.red};--cds-text-primary:${BRAND.ink};--cds-text-secondary:${BRAND.muted};--cds-chart-reference-tint:${BRAND.surface};--red:${BRAND.red};--red-dark:${BRAND.redDark};--red-tint:${BRAND.redTint};--ink:${BRAND.ink};--muted:${BRAND.muted};--line:${BRAND.line};--surface:${BRAND.surface};--bg:${BRAND.white};}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 Roboto,"Segoe UI",Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--red-dark);text-decoration:none}a:hover{text-decoration:underline}
.topbar{position:sticky;top:0;z-index:10;background:var(--bg);border-bottom:1px solid var(--line)}
.topbar .accent{height:4px;background:var(--red)}
.topbar .inner{max-width:1240px;margin:0 auto;padding:12px 24px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:18px;color:var(--ink)}
.brand .mark{width:28px;height:28px;border-radius:6px;background:var(--red);color:#fff;display:grid;place-items:center;font-size:15px;font-weight:700}
.brand small{font-weight:400;color:var(--muted);font-size:14px}
nav.main{display:flex;gap:4px;flex-wrap:wrap;margin-left:auto}
nav.main a{color:var(--ink);padding:6px 12px;border-radius:999px;font-size:14px;font-weight:500}
nav.main a:hover{background:var(--surface);text-decoration:none}
nav.main a.active{background:var(--red);color:#fff}
.layout{max-width:1240px;margin:0 auto;padding:32px 24px 64px;display:grid;grid-template-columns:240px minmax(0,1fr);gap:48px}
aside.toc{position:sticky;top:84px;align-self:start;max-height:calc(100vh - 100px);overflow:auto;font-size:13.5px;border-left:2px solid var(--line);padding-left:14px}
aside.toc .label{font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
aside.toc a{display:block;color:var(--muted);padding:3px 0;line-height:1.35}
aside.toc a.l3{padding-left:12px;font-size:13px}
aside.toc a:hover{color:var(--red-dark);text-decoration:none}
main{min-width:0}
main h1{font-size:34px;line-height:1.2;margin:0 0 8px;letter-spacing:-.01em}
.byline{color:var(--muted);font-size:14px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid var(--line)}
main h2{font-size:24px;margin:44px 0 12px;padding-top:8px;scroll-margin-top:90px;position:relative}
main h2::before{content:"";position:absolute;left:-16px;top:16px;width:4px;height:22px;background:var(--red);border-radius:2px}
main h3{font-size:18.5px;margin:28px 0 8px;scroll-margin-top:90px}
main p,main li{max-width:78ch}
code{font:13.5px/1.4 "Roboto Mono",Consolas,monospace;background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:1px 5px;word-break:break-word}
.table-wrap{overflow-x:auto;margin:16px 0 20px;border:1px solid var(--line);border-radius:8px}
table{border-collapse:collapse;width:100%;font-size:14px}
th{background:var(--ink);color:#fff;text-align:left;font-weight:600;padding:10px 12px;white-space:nowrap}
td{padding:9px 12px;border-top:1px solid var(--line);vertical-align:top}
tbody tr:nth-child(even) td{background:var(--surface)}
td code{font-size:12.5px}
blockquote{margin:16px 0;padding:10px 16px;border-left:4px solid var(--red);background:var(--red-tint);border-radius:0 6px 6px 0}
li.task{list-style:none;margin-left:-22px;display:flex;gap:10px;align-items:flex-start}
li.task .box{flex:none;width:16px;height:16px;margin-top:4px;border:2px solid var(--red);border-radius:3px}
li.task .box.on{background:var(--red)}
.diagram{margin:20px 0 24px;padding:20px;border:1px solid var(--line);border-radius:10px;background:var(--bg);overflow-x:auto;text-align:center}
.diagram{max-width:860px}.diagram svg{width:100%;height:auto;font-family:inherit}
footer{border-top:1px solid var(--line);color:var(--muted);font-size:13px}
footer .inner{max-width:1240px;margin:0 auto;padding:20px 24px}
.hero{background:linear-gradient(0deg,var(--surface),var(--surface));border-bottom:1px solid var(--line)}
.hero .inner{max-width:1240px;margin:0 auto;padding:56px 24px 48px}
.hero .eyebrow{color:var(--red);font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:13px}
.hero h1{font-size:40px;line-height:1.15;margin:8px 0 12px;max-width:22ch}
.hero p{font-size:18px;color:var(--muted);max-width:62ch;margin:0}
.cards{max-width:1240px;margin:0 auto;padding:40px 24px 64px;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}
.card{display:block;border:1px solid var(--line);border-top:4px solid var(--red);border-radius:10px;padding:24px;color:var(--ink);background:var(--bg);transition:box-shadow .15s,transform .15s}
.card:hover{text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,.08);transform:translateY(-2px)}
.card h2{margin:0 0 8px;font-size:21px}
.card p{margin:0 0 16px;color:var(--muted)}
.card .go{color:var(--red-dark);font-weight:600}
@media (max-width:900px){.layout{grid-template-columns:1fr;gap:0}aside.toc{display:none}main h2::before{display:none}.topbar .inner{padding:10px 16px}.layout,.cards,.hero .inner{padding-left:16px;padding-right:16px}main h1,.hero h1{font-size:28px}}
@media print{.topbar,aside.toc{display:none}.layout{display:block}}
`;

function shell({ title, active, body }) {
  const nav = [{ html: 'index.html', nav: 'Overview' }, ...PAGES]
    .map((p) => `<a href="${p.html}"${p.html === active ? ' class="active"' : ''}>${p.nav}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<header class="topbar"><div class="accent"></div><div class="inner">
<a class="brand" href="index.html"><span class="mark">S</span>SutraAI <small>Ghostwriter for Agentforce Voice</small></a>
<nav class="main">${nav}</nav>
</div></header>
${body}
<footer><div class="inner">Generated from <code>docs/ghostwriter/*.md</code> by <code>tools/docs-html/build.mjs</code>. Edit the Markdown, then rebuild.</div></footer>
</body>
</html>
`;
}

// ---------- build ----------

const converted = PAGES.map((p) => ({ ...p, ...convert(readFileSync(join(srcDir, p.md), 'utf8')) }));
const svgs = await renderDiagrams(converted.flatMap((c) => c.diagrams));
mkdirSync(outDir, { recursive: true });

let n = 0;
for (const c of converted) {
  const titleMatch = c.body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : c.nav;
  let html = c.body
    // the first paragraph after the title is the byline
    .replace(/(<\/h1>\n)<p>([\s\S]*?)<\/p>/, '$1<div class="byline">$2</div>')
    .replace(/<div data-diagram="(\d+)"><\/div>/g, () => `<figure class="diagram">${svgs[n++]}</figure>`);
  const toc = c.toc.map((t) => `<a class="l${t.level}" href="#${t.id}">${t.text.replace(/<[^>]+>/g, '')}</a>`).join('');
  const body = `<div class="layout"><aside class="toc"><div class="label">On this page</div>${toc}</aside><main>${html}</main></div>`;
  writeFileSync(join(outDir, c.html), shell({ title, active: c.html, body }));
}

const cards = PAGES.map((p) => `<a class="card" href="${p.html}"><h2>${p.nav}</h2><p>${p.blurb}</p><span class="go">Read →</span></a>`).join('');
writeFileSync(join(outDir, 'index.html'), shell({
  title: 'SutraAI · Ghostwriter docs',
  active: 'index.html',
  body: `<section class="hero"><div class="inner"><div class="eyebrow">SutraAI · Ghostwriter</div><h1>An agent that improves and builds Agentforce voice agents</h1><p>It extends the Knowledge Gap Generation pipeline to improve existing agents from live sessions and to build new agents from SOPs. Every change it makes is a reviewable diff, and it never deploys to production.</p></div></section><section class="cards">${cards}</section>`,
}));

console.log(`Wrote ${PAGES.length + 1} pages and ${svgs.length} diagrams to ${outDir}`);
