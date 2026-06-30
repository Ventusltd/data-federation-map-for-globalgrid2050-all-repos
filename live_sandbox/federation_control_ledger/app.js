const ROOT_MANIFEST = window.ATLAS_ROOT_MANIFEST || 'data/manifest.json';
const FED_REPO = 'https://github.com/Ventusltd/data-federation-map-for-globalgrid2050-all-repos';
const STATUS_COLOURS = { green:'#00ff88', amber:'#ffcc00', red:'#ff3333', grey:'#888888', blue:'#3388ff' };
const EDGE_COLOURS = { data:'#66ccff', governance:'#b47cff', archive:'#527ca8', external:'#45536f', repo:'#7f91b3' };
let map;
let current = null;
let scopeStack = [];
let currentLayerIds = [];
let currentMarkerObjects = [];
let selectedNodeId = null;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function resolveUrl(path, base) {
  return new URL(path, base || window.location.href).href;
}

async function fetchJSON(path, base) {
  const url = resolveUrl(path, base);
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

function initClock() {
  function tick() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('clock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    document.getElementById('date').textContent = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const target = new Date('2050-01-01T00:00:00Z');
    const days = Math.max(0, Math.ceil((target - now) / 86400000));
    document.getElementById('days').textContent = `${days} DAYS`;
  }
  tick();
  setInterval(tick, 1000);
}

function staticStyle() {
  return { version:8, sources:{}, layers:[{ id:'background', type:'background', paint:{ 'background-color':'#000000' } }] };
}

function initMap() {
  map = new maplibregl.Map({
    container:'map',
    style:staticStyle(),
    center:[0,0],
    zoom:1.55,
    minZoom:0,
    maxZoom:9,
    pitch:0,
    bearing:0,
    attributionControl:false,
    dragRotate:false,
    touchPitch:false,
    renderWorldCopies:false
  });
  map.touchZoomRotate.disableRotation();
  map.on('load', () => loadScope(ROOT_MANIFEST, false));
  map.on('error', event => {
    console.error(event?.error || event);
    document.getElementById('fatal-banner').style.display = 'block';
  });
}

function ensureNodeProperties(nodes) {
  for (const feature of nodes.features) {
    feature.properties = feature.properties || {};
    feature.properties.id = feature.properties.id || feature.id;
    feature.properties.label = feature.properties.label || feature.properties.id || feature.id;
    feature.properties.status = feature.properties.status || feature.properties.rag || 'grey';
    feature.properties.rag = feature.properties.rag || feature.properties.status;
    feature.properties.importance_score = Number(feature.properties.importance_score ?? 0.4);
    feature.properties.repo_type = feature.properties.repo_type || feature.properties.scope_type || 'unknown';
    feature.properties.scope_type = feature.properties.scope_type || feature.properties.repo_type;
    feature.properties.child_manifest = feature.properties.child_manifest || null;
    feature.properties.source_url = feature.properties.source_url || repoUrlFromId(feature.properties.id);
  }
  return nodes;
}

function repoUrlFromId(id) {
  return String(id || '').startsWith('Ventusltd/') ? `https://github.com/${id}` : '';
}

function edgeGeoJSON(rawEdges, nodes) {
  if (rawEdges.type === 'FeatureCollection') return rawEdges;
  const features = (rawEdges.edges || []).map(([from, to, edgeType], index) => {
    const a = nodes.features[from];
    const b = nodes.features[to];
    const ac = a.geometry.coordinates;
    const bc = b.geometry.coordinates;
    const mid = (ac[0] + bc[0]) / 2;
    return {
      type:'Feature',
      id:`edge-${index}`,
      geometry:{ type:'LineString', coordinates:[ac, [mid, ac[1]], [mid, bc[1]], bc] },
      properties:{
        id:`edge-${index}`,
        source:a.properties.id,
        target:b.properties.id,
        source_label:a.properties.label,
        target_label:b.properties.label,
        edge_type:edgeType,
        status:edgeType === 'governance' ? 'amber' : 'green',
        status_reason:edgeType === 'governance' ? 'governance finding surfaced' : 'resolved relationship',
        weight:1,
        min_zoom:0
      }
    };
  });
  return { type:'FeatureCollection', features };
}

async function loadScope(manifestPath, pushParent) {
  try {
    const parentManifestUrl = current?.manifestUrl || window.location.href;
    const manifestUrl = resolveUrl(manifestPath, parentManifestUrl);
    const manifest = await fetchJSON(manifestUrl);
    if (pushParent && current) scopeStack.push(current.manifestUrl);
    if (manifestUrl !== resolveUrl(ROOT_MANIFEST) && !Array.isArray(manifest.unresolved_findings)) {
      throw new Error('Child scope refused: manifest does not expose unresolved_findings.');
    }
    const base = new URL('.', manifestUrl).href;
    const sources = manifest.sources || {};
    const layers = await fetchJSON(sources.layers || 'layers.json', base);
    const nodes = ensureNodeProperties(await fetchJSON(sources.nodes || 'nodes.json', base));
    const rawEdges = await fetchJSON(sources.edges || 'edges.json', base);
    const edges = edgeGeoJSON(rawEdges, nodes);
    const sectors = sources.sectors ? await fetchJSON(sources.sectors, base) : { type:'FeatureCollection', features:[] };
    current = { manifestUrl, base, manifest, layers, nodes, edges, sectors };
    selectedNodeId = null;
    clearMapData();
    addSources(nodes, edges, sectors);
    addConfiguredLayers(layers);
    addSelectionLayer();
    addNodeMarkers(nodes);
    buildLayerControls(layers);
    buildSearch();
    updateScopeUI();
    fitAll(false);
  } catch (error) {
    console.error(error);
    document.getElementById('fatal-banner').textContent = error.message;
    document.getElementById('fatal-banner').style.display = 'block';
  }
}

function clearMapData() {
  for (const marker of currentMarkerObjects) marker.remove();
  currentMarkerObjects = [];
  for (const id of [...currentLayerIds].reverse()) if (map.getLayer(id)) map.removeLayer(id);
  currentLayerIds = [];
  for (const id of ['selected_node','nodes','edges','sectors']) if (map.getSource(id)) map.removeSource(id);
}

function addSources(nodes, edges, sectors) {
  map.addSource('nodes', { type:'geojson', data:nodes, promoteId:'id' });
  map.addSource('edges', { type:'geojson', data:edges, promoteId:'id' });
  map.addSource('sectors', { type:'geojson', data:sectors, promoteId:'id' });
}

function addConfiguredLayers(groups) {
  const flat = groups.flatMap(group => group.layers.map(layer => ({ ...layer, group: group.group })));
  flat.filter(l => l.type === 'line').forEach(addLineLayer);
  flat.filter(l => l.type === 'point').forEach(addPointLayer);
}

function addLineLayer(layer) {
  const id = layer.id;
  map.addLayer({
    id,
    type:'line',
    source:'edges',
    minzoom:layer.min_zoom ?? layer.minzoom ?? 0,
    filter:layer.edge_filter || layer.filter || true,
    layout:{ visibility: layer.visible_default ? 'visible' : 'none', 'line-cap':'round', 'line-join':'round' },
    paint:{
      'line-color': EDGE_COLOURS[id.replace('edge_','')] || layer.color || '#7f91b3',
      'line-width':['interpolate', ['linear'], ['zoom'], 0, 1, 3, 2.2, 7, 4.8],
      'line-opacity': id === 'edge_external' ? 0.28 : 0.74,
      'line-dasharray': id === 'edge_governance' ? [1.5, 1.1] : [1, 0]
    }
  });
  currentLayerIds.push(id);
}

function addPointLayer(layer) {
  const id = layer.id;
  map.addLayer({
    id,
    type:'circle',
    source:'nodes',
    minzoom:layer.min_zoom ?? layer.minzoom ?? 0,
    filter:layer.node_filter || layer.filter || true,
    layout:{ visibility: layer.visible_default ? 'visible' : 'none' },
    paint:{
      'circle-radius':['interpolate', ['linear'], ['zoom'], 0, ['interpolate', ['linear'], ['get','importance_score'], 0, 5, 1, 12], 4, ['interpolate', ['linear'], ['get','importance_score'], 0, 9, 1, 24], 8, ['interpolate', ['linear'], ['get','importance_score'], 0, 15, 1, 42]],
      'circle-color':['match', ['get','status'], 'green', STATUS_COLOURS.green, 'amber', STATUS_COLOURS.amber, 'red', STATUS_COLOURS.red, 'grey', STATUS_COLOURS.grey, 'blue', STATUS_COLOURS.blue, '#888888'],
      'circle-opacity':0.86,
      'circle-stroke-color':'#000000',
      'circle-stroke-width':['interpolate', ['linear'], ['zoom'], 0, 1.2, 6, 3]
    }
  });
  currentLayerIds.push(id);
  map.on('click', id, event => openNodePopup(event.features[0], event.lngLat));
  map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', id, () => { map.getCanvas().style.cursor = ''; });
}

function addSelectionLayer() {
  map.addSource('selected_node', { type:'geojson', data:{ type:'FeatureCollection', features:[] } });
  map.addLayer({
    id:'selected_node_ring',
    type:'circle',
    source:'selected_node',
    paint:{ 'circle-radius':['interpolate', ['linear'], ['zoom'], 0, 18, 5, 38, 8, 62], 'circle-color':'rgba(0,0,0,0)', 'circle-stroke-color':'#00ffff', 'circle-stroke-width':2.5, 'circle-opacity':0.9 }
  });
  currentLayerIds.push('selected_node_ring');
}

function addNodeMarkers(nodes) {
  for (const feature of nodes.features) {
    const div = document.createElement('div');
    div.textContent = feature.properties.label;
    div.style.cssText = 'font:10px Courier New,monospace;color:#dce7ff;text-shadow:0 0 4px #000,0 0 8px #000;white-space:nowrap;pointer-events:none;letter-spacing:.2px;';
    const marker = new maplibregl.Marker({ element: div, anchor:'top', offset:[0,14] }).setLngLat(feature.geometry.coordinates).addTo(map);
    currentMarkerObjects.push(marker);
  }
}

function setSelected(feature) {
  selectedNodeId = feature?.properties?.id || null;
  const data = feature ? { type:'FeatureCollection', features:[feature] } : { type:'FeatureCollection', features:[] };
  map.getSource('selected_node')?.setData(data);
}

function popupHTML(properties) {
  const repoUrl = properties.source_url || repoUrlFromId(properties.id);
  const report = `${FED_REPO}/blob/main/reports/FEDERATION_MAP_LATEST.md`;
  const child = properties.child_manifest ? `<a class="popup-btn popup-report" href="#" onclick="window.openAtlasChild('${escapeHTML(properties.child_manifest)}');return false;">OPEN ATLAS</a>` : '';
  const repo = repoUrl ? `<a class="popup-btn popup-repo" href="${escapeHTML(repoUrl)}" target="_blank" rel="noopener">REPO</a>` : '';
  const contract = repoUrl && properties.repo_type === 'data' ? `<a class="popup-btn popup-report" href="${escapeHTML(repoUrl)}/blob/main/DATA_CONTRACT.md" target="_blank" rel="noopener">CONTRACT</a>` : '';
  return `<div class="popup-title">${escapeHTML(properties.label)}</div><div class="popup-meta">${escapeHTML(properties.repo_type)} | ${escapeHTML(properties.id)}</div><div class="popup-status"><span style="color:${STATUS_COLOURS[properties.status] || '#888'}">● ${escapeHTML(properties.status)}</span> ${escapeHTML(properties.status_reason)}</div><div class="popup-btns"><a class="popup-btn popup-report" href="${report}" target="_blank" rel="noopener">REPORT</a>${repo}${contract}${child}</div>`;
}

function openNodePopup(feature, lngLat) {
  setSelected(feature);
  new maplibregl.Popup({ closeButton:true, closeOnClick:false, maxWidth:'380px' })
    .setLngLat(lngLat || feature.geometry.coordinates)
    .setHTML(popupHTML(feature.properties))
    .addTo(map);
}

window.openAtlasChild = function(childManifest) {
  loadScope(childManifest, true);
};

function buildLayerControls(groups) {
  const wrap = document.getElementById('layer-controls');
  wrap.innerHTML = '';
  for (const group of groups) {
    const box = document.createElement('div');
    box.className = 'key-group';
    box.innerHTML = `<div class="key-title">${escapeHTML(group.group)}</div>`;
    for (const layer of group.layers) {
      const item = document.createElement('label');
      item.className = 'key-item';
      item.style.color = layer.type === 'line' ? (EDGE_COLOURS[layer.id.replace('edge_','')] || '#888') : '#00ffff';
      item.innerHTML = `<input type="checkbox" ${layer.visible_default ? 'checked' : ''} data-layer="${escapeHTML(layer.id)}"><span class="layer-name">${escapeHTML(layer.label)}</span> <span class="layer-state" id="state-${escapeHTML(layer.id)}">[OK]</span>`;
      box.appendChild(item);
    }
    wrap.appendChild(box);
  }
  wrap.querySelectorAll('input[data-layer]').forEach(input => {
    input.addEventListener('change', () => {
      const id = input.dataset.layer;
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', input.checked ? 'visible' : 'none');
      const s = document.getElementById(`state-${id}`);
      if (s) s.textContent = input.checked ? '[OK]' : '[OFF]';
    });
  });
}

function buildSearch() {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  input.value = '';
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.style.display = 'none'; results.innerHTML = ''; return; }
    const matches = current.nodes.features.filter(f => `${f.properties.label} ${f.properties.repo_type} ${f.properties.status} ${f.properties.status_reason}`.toLowerCase().includes(q)).slice(0, 12);
    results.innerHTML = matches.length ? matches.map(f => `<div class="search-result-item" data-id="${escapeHTML(f.properties.id)}"><b>${escapeHTML(f.properties.label)}</b><br>${escapeHTML(f.properties.repo_type)} · ${escapeHTML(f.properties.status)}</div>`).join('') : '<div class="search-no-results">No match in current scope</div>';
    results.style.display = 'block';
  };
  input.oninput = run;
  input.onkeydown = event => { if (event.key === 'Enter') goToFirstSearchResult(); };
  document.getElementById('search-btn').onclick = goToFirstSearchResult;
  results.onclick = event => {
    const item = event.target.closest('[data-id]');
    if (item) flyToNode(item.dataset.id);
  };
}

function goToFirstSearchResult() {
  const first = document.querySelector('.search-result-item[data-id]');
  if (first) flyToNode(first.dataset.id);
}

function flyToNode(id) {
  const feature = current.nodes.features.find(f => f.properties.id === id);
  if (!feature) return;
  document.getElementById('search-results').style.display = 'none';
  map.flyTo({ center:feature.geometry.coordinates, zoom:Math.max(map.getZoom(), 4.2), speed:0.9, curve:1.2 });
  setTimeout(() => openNodePopup(feature, feature.geometry.coordinates), 450);
}

function updateScopeUI() {
  const label = current.manifest.scope?.label || current.manifest.public_title || 'Current scope';
  document.getElementById('scope-label').textContent = label;
  document.getElementById('scope-attrib').textContent = `${current.manifest.schema_version || 'atlas cartridge'} · ${current.manifest.key_law_status || 'key law unknown'} · no command triggers`;
  document.getElementById('topology-note').textContent = `${current.manifest.public_title || 'Ventus Global Grid 2050'} · ${current.manifest.public_strapline || 'repository federation for an electrified future'}`;
  document.getElementById('scope-back').disabled = scopeStack.length === 0;
}

function wireButtons() {
  document.getElementById('btn-reset').addEventListener('click', () => fitAll(true));
  document.getElementById('btn-export').addEventListener('click', exportCSV);
  document.getElementById('btn-status').addEventListener('click', () => alert(`${current.manifest.key_law_status}\n${current.manifest.key_note || ''}\nFindings: ${(current.manifest.unresolved_findings || []).join(', ')}`));
  document.getElementById('btn-neighbourhood').addEventListener('click', () => alert(selectedNodeId ? 'Neighbourhood view is reserved for the repo-internals recursion proof.' : 'Select a node first.'));
  document.getElementById('btn-sectors').addEventListener('click', () => alert('Sectors loaded: ' + (current.sectors.features?.length || 0)));
  document.getElementById('btn-fullscreen').addEventListener('click', enterFullscreen);
  document.getElementById('btn-exit-fullscreen').addEventListener('click', exitFullscreen);
  document.getElementById('scope-back').addEventListener('click', () => {
    const parent = scopeStack.pop();
    if (parent) loadScope(parent, false);
  });
  document.addEventListener('fullscreenchange', () => document.body.classList.toggle('fs-active', Boolean(document.fullscreenElement)));
}

function fitAll(animated = true) {
  if (!current?.nodes?.features?.length) return;
  const bounds = new maplibregl.LngLatBounds();
  current.nodes.features.forEach(f => bounds.extend(f.geometry.coordinates));
  map.fitBounds(bounds, { padding:52, duration:animated ? 700 : 0, maxZoom:2.15 });
}

function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => document.body.classList.add('fs-active'));
  else document.body.classList.add('fs-active');
}

function exitFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => document.body.classList.remove('fs-active'));
  else document.body.classList.remove('fs-active');
}

function exportCSV() {
  const rows = [['id','label','repo_type','status','status_reason','importance_score','child_manifest'], ...current.nodes.features.map(f => [f.properties.id, f.properties.label, f.properties.repo_type, f.properties.status, f.properties.status_reason, f.properties.importance_score, f.properties.child_manifest || ''])];
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${current.manifest.scope?.id || 'atlas-scope'}-nodes.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

initClock();
initMap();
wireButtons();
