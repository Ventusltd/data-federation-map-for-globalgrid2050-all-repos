const ATLAS = FEDERATION_ATLAS;
const FED_REPO = 'https://github.com/Ventusltd/data-federation-map-for-globalgrid2050-all-repos';
const STATUS_COLOURS = ATLAS.statusColours;
const nodeByIndex = new Map(ATLAS.nodes.map((node, index) => [index, { ...node, index }]));
let map;
let selectedNodeId = null;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function statusColourExpression() {
  return ['match', ['get', 'status'], 'green', STATUS_COLOURS.green, 'amber', STATUS_COLOURS.amber, 'red', STATUS_COLOURS.red, 'grey', STATUS_COLOURS.grey, 'blue', STATUS_COLOURS.blue, '#888888'];
}

function staticStyle() {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {},
    layers: [
      { id: 'background', type: 'background', paint: { 'background-color': '#000000' } }
    ]
  };
}

function buildNodeGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: ATLAS.nodes.map((n, index) => ({
      type: 'Feature',
      id: n.id,
      geometry: { type: 'Point', coordinates: n.coordinates },
      properties: {
        index,
        id: n.id,
        label: n.label,
        repo_type: n.repo_type,
        status: n.status,
        status_reason: n.status_reason,
        url: n.url,
        importance_score: n.importance_score
      }
    }))
  };
}

function buildEdgeGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: ATLAS.edges.map(([from, to, type], index) => {
      const a = nodeByIndex.get(from);
      const b = nodeByIndex.get(to);
      const mid = (a.coordinates[0] + b.coordinates[0]) / 2;
      return {
        type: 'Feature',
        id: `edge-${index}`,
        geometry: {
          type: 'LineString',
          coordinates: [a.coordinates, [mid, a.coordinates[1]], [mid, b.coordinates[1]], b.coordinates]
        },
        properties: {
          index,
          source: a.id,
          target: b.id,
          source_label: a.label,
          target_label: b.label,
          edge_type: type,
          status: type === 'governance' ? 'amber' : 'green'
        }
      };
    })
  };
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

function initMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: staticStyle(),
    center: [0, 0],
    zoom: 1.55,
    minZoom: 0,
    maxZoom: 9,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
    dragRotate: false,
    touchPitch: false,
    renderWorldCopies: false
  });

  map.touchZoomRotate.disableRotation();

  map.on('load', () => {
    addSources();
    addConfiguredLayers();
    addSelectionLayers();
    buildLayerControls();
    buildSearch();
    wireButtons();
    fitAll(false);
  });

  map.on('error', event => {
    console.error(event?.error || event);
    document.getElementById('fatal-banner').style.display = 'block';
  });
}

function addSources() {
  map.addSource('nodes', { type: 'geojson', data: buildNodeGeoJSON(), promoteId: 'id' });
  map.addSource('edges', { type: 'geojson', data: buildEdgeGeoJSON(), promoteId: 'index' });
}

function addConfiguredLayers() {
  for (const group of ATLAS.groups) {
    for (const layer of group.layers) {
      if (layer.type === 'line') addLineLayer(layer);
      if (layer.type === 'point') addPointLayer(layer);
    }
  }
  addLabelsLayer();
}

function addLineLayer(layer) {
  map.addLayer({
    id: layer.id,
    type: 'line',
    source: 'edges',
    minzoom: layer.minzoom ?? 0,
    filter: layer.filter,
    layout: {
      visibility: layer.visible_default ? 'visible' : 'none',
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': layer.color,
      'line-width': ['interpolate', ['linear'], ['zoom'], 0, 1, 3, 2.2, 7, 4.8],
      'line-opacity': layer.id === 'edge_external' ? 0.28 : 0.74,
      'line-dasharray': layer.id === 'edge_governance' ? [1.5, 1.1] : [1, 0]
    }
  });
}

function addPointLayer(layer) {
  map.addLayer({
    id: layer.id,
    type: 'circle',
    source: 'nodes',
    minzoom: layer.minzoom ?? 0,
    filter: layer.filter,
    layout: { visibility: layer.visible_default ? 'visible' : 'none' },
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, ['interpolate', ['linear'], ['get', 'importance_score'], 0, 5, 1, 12], 4, ['interpolate', ['linear'], ['get', 'importance_score'], 0, 9, 1, 24], 8, ['interpolate', ['linear'], ['get', 'importance_score'], 0, 15, 1, 42]],
      'circle-color': statusColourExpression(),
      'circle-opacity': 0.86,
      'circle-stroke-color': '#000000',
      'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 0, 1.2, 6, 3],
      'circle-blur': ['case', ['==', ['get', 'repo_type'], 'external'], 0.15, 0.04]
    }
  });
  map.on('click', layer.id, event => openNodePopup(event.features[0], event.lngLat));
  map.on('mouseenter', layer.id, () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', layer.id, () => { map.getCanvas().style.cursor = ''; });
}

function addLabelsLayer() {
  map.addLayer({
    id: 'node_labels',
    type: 'symbol',
    source: 'nodes',
    minzoom: 1.4,
    layout: {
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 1.4, 9, 6, 14],
      'text-anchor': 'top',
      'text-offset': [0, 1.2],
      'text-allow-overlap': false,
      'text-ignore-placement': false,
      'symbol-sort-key': ['*', -1, ['get', 'importance_score']]
    },
    paint: {
      'text-color': '#dce7ff',
      'text-halo-color': '#000000',
      'text-halo-width': 1.2,
      'text-opacity': ['interpolate', ['linear'], ['zoom'], 1.4, 0.55, 4, 1]
    }
  });
}

function addSelectionLayers() {
  map.addSource('selected_node', { type: 'geojson', data: emptyFeatureCollection() });
  map.addLayer({
    id: 'selected_node_ring',
    type: 'circle',
    source: 'selected_node',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 18, 5, 38, 8, 62],
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-color': '#00ffff',
      'circle-stroke-width': 2.5,
      'circle-opacity': 0.9
    }
  });
}

function emptyFeatureCollection() {
  return { type: 'FeatureCollection', features: [] };
}

function setSelectedNode(feature) {
  selectedNodeId = feature?.properties?.id || null;
  map.getSource('selected_node').setData(feature ? { type: 'FeatureCollection', features: [feature] } : emptyFeatureCollection());
}

function popupHTML(p) {
  const repo = p.url ? `<a class="popup-btn popup-repo" href="${escapeHTML(p.url)}" target="_blank" rel="noopener">REPO</a>` : '';
  const contract = p.url && p.repo_type === 'data' ? `<a class="popup-btn popup-report" href="${escapeHTML(p.url)}/blob/main/DATA_CONTRACT.md" target="_blank" rel="noopener">CONTRACT</a>` : '';
  const report = `<a class="popup-btn popup-report" href="${FED_REPO}/blob/main/reports/FEDERATION_MAP_LATEST.md" target="_blank" rel="noopener">REPORT</a>`;
  return `<div class="popup-title">${escapeHTML(p.label)}</div><div class="popup-meta">${escapeHTML(p.repo_type)} | ${escapeHTML(p.id)}</div><div class="popup-status"><span style="color:${STATUS_COLOURS[p.status] || '#888'}">● ${escapeHTML(p.status)}</span> ${escapeHTML(p.status_reason)}</div><div class="popup-btns">${report}${repo}${contract}</div>`;
}

function openNodePopup(feature, lngLat) {
  setSelectedNode(feature);
  new maplibregl.Popup({ closeButton: true, closeOnClick: false, maxWidth: '360px' })
    .setLngLat(lngLat || feature.geometry.coordinates)
    .setHTML(popupHTML(feature.properties))
    .addTo(map);
}

function buildLayerControls() {
  const wrap = document.getElementById('layer-controls');
  wrap.innerHTML = '';
  for (const group of ATLAS.groups) {
    const box = document.createElement('div');
    box.className = 'key-group';
    box.innerHTML = `<div class="key-title">${escapeHTML(group.group)}</div>`;
    for (const layer of group.layers) {
      const item = document.createElement('label');
      item.className = 'key-item';
      item.style.color = layer.color;
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
  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { results.style.display = 'none'; results.innerHTML = ''; return; }
    const matches = ATLAS.nodes.filter(n => `${n.label} ${n.repo_type} ${n.status} ${n.status_reason}`.toLowerCase().includes(q)).slice(0, 12);
    results.innerHTML = matches.length ? matches.map(n => `<div class="search-result-item" data-id="${escapeHTML(n.id)}"><b>${escapeHTML(n.label)}</b><br>${escapeHTML(n.repo_type)} · ${escapeHTML(n.status)}</div>`).join('') : '<div class="search-no-results">No matching repository or source</div>';
    results.style.display = 'block';
  };
  input.addEventListener('input', run);
  input.addEventListener('keydown', event => { if (event.key === 'Enter') goToFirstSearchResult(); });
  document.getElementById('search-btn').addEventListener('click', goToFirstSearchResult);
  results.addEventListener('click', event => {
    const item = event.target.closest('[data-id]');
    if (item) flyToNode(item.dataset.id);
  });
}

function goToFirstSearchResult() {
  const first = document.querySelector('.search-result-item[data-id]');
  if (first) flyToNode(first.dataset.id);
}

function flyToNode(id) {
  const n = ATLAS.nodes.find(x => x.id === id);
  if (!n) return;
  document.getElementById('search-results').style.display = 'none';
  map.flyTo({ center: n.coordinates, zoom: Math.max(map.getZoom(), 4.2), speed: 0.9, curve: 1.2 });
  const features = map.querySourceFeatures('nodes', { sourceLayer: undefined }).filter(f => f.properties.id === id);
  if (features[0]) {
    setTimeout(() => openNodePopup(features[0], n.coordinates), 450);
  }
}

function wireButtons() {
  document.getElementById('btn-reset').addEventListener('click', () => fitAll(true));
  document.getElementById('btn-export').addEventListener('click', exportCSV);
  document.getElementById('btn-status').addEventListener('click', () => alert(ATLAS.manifest.key_note));
  document.getElementById('btn-neighbourhood').addEventListener('click', () => alert(selectedNodeId ? 'Neighbourhood view is reserved for the next sandbox wave.' : 'Select a repository first.'));
  document.getElementById('btn-sectors').addEventListener('click', () => alert('Sector manifests are reserved for the next sandbox wave.'));
  document.getElementById('btn-fullscreen').addEventListener('click', enterFullscreen);
  document.getElementById('btn-exit-fullscreen').addEventListener('click', exitFullscreen);
  document.addEventListener('fullscreenchange', () => document.body.classList.toggle('fs-active', Boolean(document.fullscreenElement)));
}

function fitAll(animated = true) {
  const bounds = new maplibregl.LngLatBounds();
  ATLAS.nodes.forEach(n => bounds.extend(n.coordinates));
  map.fitBounds(bounds, { padding: 52, duration: animated ? 700 : 0, maxZoom: 2.15 });
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
  const rows = [['id','label','repo_type','status','status_reason','importance_score','url'], ...ATLAS.nodes.map(n => [n.id, n.label, n.repo_type, n.status, n.status_reason, n.importance_score, n.url])];
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'globalgrid2050-federation-nodes.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

initClock();
initMap();
