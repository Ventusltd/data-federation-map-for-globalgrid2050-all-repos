const D = FEDERATION_DATA;
const RAG = { green: '#1faa59', amber: '#d99a18', red: '#cf3b3b', grey: '#66758f', blue: '#2f6fd0' };
const TYPE_ICON = { data: 'DATA', ui: 'UI', homepage: 'HOME', source_archive: 'ARCH', unknown: 'REPO', external: 'EXT' };
const BASE = 'https://github.com/Ventusltd/';
const FED = BASE + 'data-federation-map-for-globalgrid2050-all-repos';
const cardW = () => css('--card-w', 244);
const cardH = () => css('--card-h', 122);
const layerGap = () => css('--layer-gap', 78);
const rowGap = () => css('--row-gap', 22);
const pad = () => css('--pad', 18);
const titleOffset = () => css('--title-offset', 42);
let state = { q: '', rag: 'all', type: 'all', activeLayer: 0, selected: null };

function css(name, fallback) {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function slug(label) { return `Ventusltd/${label}`; }

const nodes = D.nodes.map((row, index) => ({
  index,
  id: slug(row[0]),
  label: row[0],
  repoType: row[1],
  rag: row[2],
  ragReason: row[3],
  htmlUrl: row[4],
  layer: 0,
  x: 0,
  y: 0
}));
const edges = D.edges.map(([from, to, type]) => ({ from, to, type, source: nodes[from], target: nodes[to] })).filter(e => e.source && e.target);
const byIndex = new Map(nodes.map(n => [n.index, n]));

function assignLayers() {
  nodes.forEach(n => {
    if (n.repoType === 'unknown' || n.repoType === 'ui') n.layer = 0;
    else if (n.repoType === 'data') n.layer = 1;
    else if (n.repoType === 'homepage') n.layer = 2;
    else if (n.repoType === 'source_archive') n.layer = 3;
    else if (n.repoType === 'external') n.layer = 4;
    else n.layer = 0;
  });
  // keep the UI next to its data sources, but still visibly a consumer
  const ui = nodes.find(n => n.label === 'gb-electricity-ui');
  if (ui) ui.layer = 2;
  // place the control ledger at the front of the data layer
  const ledger = nodes.find(n => n.label.includes('federation-map'));
  if (ledger) ledger.layer = 1;
}

function layerNames() {
  return ['Repos & tools', 'Data ledger', 'Interfaces', 'Archive', 'External services'];
}

function filtered(n) {
  const q = state.q.trim().toLowerCase();
  const text = `${n.label} ${n.repoType} ${n.rag} ${n.ragReason}`.toLowerCase();
  return (state.rag === 'all' || n.rag === state.rag) && (state.type === 'all' || n.repoType === state.type) && (!q || text.includes(q));
}

function orderWithinLayers(layers) {
  for (let pass = 0; pass < 3; pass++) {
    layers.forEach((items, layer) => {
      items.sort((a, b) => {
        const an = neighbourCentre(a, layer);
        const bn = neighbourCentre(b, layer);
        if (an !== bn) return an - bn;
        return a.label.localeCompare(b.label);
      });
    });
  }
}
function neighbourCentre(node, layer) {
  const positions = [];
  edges.forEach(e => {
    if (e.source === node && e.target.layer !== layer) positions.push(e.target._order ?? 0);
    if (e.target === node && e.source.layer !== layer) positions.push(e.source._order ?? 0);
  });
  if (!positions.length) return node._order ?? 0;
  return positions.reduce((a, b) => a + b, 0) / positions.length;
}

function layout() {
  assignLayers();
  const names = layerNames();
  const layers = names.map(() => []);
  nodes.forEach(n => layers[n.layer].push(n));
  layers.forEach(items => items.forEach((n, i) => n._order = i));
  orderWithinLayers(layers);
  const w = cardW(), h = cardH(), lg = layerGap(), rg = rowGap(), p = pad(), to = titleOffset();
  let maxRows = 1;
  layers.forEach((items, layer) => {
    maxRows = Math.max(maxRows, items.length);
    items.forEach((n, i) => {
      n._order = i;
      n.x = p + layer * (w + lg);
      n.y = p + to + i * (h + rg);
    });
  });
  return {
    layers,
    names,
    width: p * 2 + names.length * w + (names.length - 1) * lg,
    height: p * 2 + to + maxRows * h + Math.max(0, maxRows - 1) * rg
  };
}

function evidenceLinks(n) {
  const repo = n.htmlUrl || (n.repoType !== 'external' ? BASE + encodeURIComponent(n.label) : '');
  const links = [];
  links.push(`<a href="${FED}/blob/main/reports/FEDERATION_MAP_LATEST.md" target="_blank" rel="noopener">REPORT</a>`);
  if (repo) links.push(`<a href="${repo}" target="_blank" rel="noopener">REPO</a>`);
  if (repo && n.repoType === 'data') links.push(`<a href="${repo}/blob/main/DATA_CONTRACT.md" target="_blank" rel="noopener">CONTRACT</a>`);
  return links.join('');
}

function edgeClass(type) {
  if (type === 'data') return 'edge-data';
  if (type === 'governance') return 'edge-governance';
  if (type === 'archive') return 'edge-archive';
  if (type === 'repo') return 'edge-repo';
  return 'edge-external';
}

function render() {
  const g = layout();
  const map = document.getElementById('map');
  const visible = new Set(nodes.filter(filtered).map(n => n.index));
  map.style.width = `${g.width}px`;
  map.style.height = `${g.height}px`;
  map.innerHTML = '';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('connector-layer');
  svg.setAttribute('width', g.width);
  svg.setAttribute('height', g.height);
  svg.setAttribute('viewBox', `0 0 ${g.width} ${g.height}`);
  map.append(svg);

  g.names.forEach((name, i) => {
    const title = document.createElement('h2');
    title.className = 'layer-title';
    title.id = `layer-${i}`;
    title.dataset.layer = String(i);
    title.textContent = name;
    title.style.left = `${pad() + i * (cardW() + layerGap())}px`;
    title.style.top = `${pad()}px`;
    map.append(title);
  });

  edges.forEach(e => {
    if (!visible.has(e.source.index) || !visible.has(e.target.index)) return;
    const x1 = e.source.x + cardW(), y1 = e.source.y + cardH() / 2;
    const x2 = e.target.x, y2 = e.target.y + cardH() / 2;
    const mid = x1 + (x2 - x1) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`);
    path.setAttribute('class', `connector-path ${edgeClass(e.type)}`);
    svg.append(path);
  });

  nodes.forEach(n => {
    const card = document.createElement('article');
    card.className = 'node-card';
    if (!visible.has(n.index)) card.classList.add('is-dim');
    if (state.selected === n.index) card.classList.add('is-highlight');
    card.style.setProperty('--rag', RAG[n.rag] || RAG.grey);
    card.style.left = `${n.x}px`;
    card.style.top = `${n.y}px`;
    card.innerHTML = `<div class="node-title">${esc(n.label)}</div><div class="node-meta">${esc(TYPE_ICON[n.repoType] || n.repoType)} · ${esc(n.repoType)} · ${esc(n.ragReason)}</div><span class="rag-pill">${esc(n.rag.toUpperCase())}</span><div class="chips">${evidenceLinks(n)}</div>`;
    card.addEventListener('click', () => selectNode(n.index));
    map.append(card);
  });

  renderNav(g);
  document.getElementById('nodeCount').textContent = `${visible.size} / ${nodes.length}`;
  document.getElementById('edgeCount').textContent = `${edges.filter(e => visible.has(e.source.index) && visible.has(e.target.index)).length} / ${edges.length}`;
  document.getElementById('keyProof').textContent = D.key;
  document.getElementById('findingBox').innerHTML = `<strong>Open findings shown, not hidden.</strong> ${esc(D.key)}. Governance edges to the temporary homepage remain visible until severed at source. The backend remains Parquet-first; future sectors can be served as layer manifests without loading every node at once.`;
}

function renderNav(g) {
  const nav = document.getElementById('layerNav');
  nav.innerHTML = g.names.map((name, i) => `<button type="button" data-layer="${i}" class="${i === state.activeLayer ? 'active' : ''}">${esc(name)}</button>`).join('');
  nav.querySelectorAll('button').forEach(b => b.addEventListener('click', () => scrollLayer(Number(b.dataset.layer))));
}
function scrollLayer(i) {
  state.activeLayer = i;
  const wrap = document.querySelector('.map-wrap');
  const target = document.getElementById(`layer-${i}`);
  if (target) wrap.scrollTo({ left: Math.max(0, target.offsetLeft - 14), behavior: 'smooth' });
  renderNav(layout());
}
function selectNode(index) {
  state.selected = index;
  const n = byIndex.get(index);
  const related = edges.filter(e => e.from === index || e.to === index);
  const panel = document.getElementById('detailPanel');
  panel.hidden = false;
  panel.innerHTML = `<button class="detail-close" type="button">Close</button><h2>${esc(n.label)}</h2><p><strong style="color:${RAG[n.rag]}">${esc(n.rag.toUpperCase())}</strong> · ${esc(n.repoType)} · ${esc(n.ragReason)}</p><p>${related.length} visible relationship rows in the sandbox data.</p><div class="chips">${evidenceLinks(n)}</div><p class="finding">Status is read-only evidence. Nothing here can change repository state.</p>`;
  panel.querySelector('.detail-close').addEventListener('click', () => { panel.hidden = true; state.selected = null; render(); });
  render();
}
function refit() {
  const wrap = document.querySelector('.map-wrap');
  wrap.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
}
function setFocus(v) {
  document.body.classList.toggle('focus-mode', v);
  document.getElementById('fullscreenButton').textContent = v ? 'Exit' : 'Fullscreen';
  setTimeout(render, 90);
}

const search = document.getElementById('searchInput');
const rag = document.getElementById('ragFilter');
const type = document.getElementById('typeFilter');
search.addEventListener('input', e => { state.q = e.target.value; render(); });
rag.addEventListener('change', e => { state.rag = e.target.value; render(); });
type.addEventListener('change', e => { state.type = e.target.value; render(); });
document.getElementById('refitButton').addEventListener('click', refit);
document.getElementById('fullscreenButton').addEventListener('click', async () => {
  if (document.fullscreenElement) { await document.exitFullscreen().catch(() => {}); setFocus(false); return; }
  await document.documentElement.requestFullscreen?.().catch(() => {});
  setFocus(true);
});
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) setFocus(false); });
window.addEventListener('resize', render, { passive: true });
document.querySelector('.map-wrap').addEventListener('scroll', () => {
  const titles = [...document.querySelectorAll('.layer-title')];
  const left = document.querySelector('.map-wrap').scrollLeft + 40;
  let active = 0;
  titles.forEach(t => { if (t.offsetLeft <= left) active = Number(t.dataset.layer); });
  if (active !== state.activeLayer) { state.activeLayer = active; renderNav(layout()); }
}, { passive: true });

render();
