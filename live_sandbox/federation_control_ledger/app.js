const ROOT = window.REPO_BOARD_ROOT || 'data/manifest.json';
const FED_REPO = 'https://github.com/Ventusltd/data-federation-map-for-globalgrid2050-all-repos';
const LAYERS = [
  { id:'core', title:'Core', color:'#00ffff', match:n=>n.id.includes('data-federation-map'), isRepo:true },
  { id:'data', title:'Data repos', color:'#00e5ff', match:n=>n.repo_type==='data' && !n.id.includes('data-federation-map'), isRepo:true },
  { id:'apps', title:'Apps / UI', color:'#22d3ee', match:n=>['ui','homepage'].includes(n.repo_type), isRepo:true },
  { id:'source', title:'Source / archive', color:'#67e8f9', match:n=>n.repo_type==='source_archive', isRepo:true },
  { id:'related', title:'Related repos', color:'#a5f3fc', match:n=>n.repo_type==='unknown', isRepo:true },
  { id:'external', title:'External systems', color:'#7dd3fc', match:n=>n.repo_type==='external', isRepo:false }
];
const TYPE_BADGE = { data:'DB', ui:'UI', homepage:'WEB', source_archive:'SRC', unknown:'REP', external:'EXT' };
const PAGE_LINKS = {
  'Ventusltd/globalgrid2050':'https://globalgrid2050.com/',
  'Ventusltd/globalgrid2050-hompage':'https://globalgrid2050.com/',
  'Ventusltd/data-federation-map-for-globalgrid2050-all-repos':'https://ventusltd.github.io/data-federation-map-for-globalgrid2050-all-repos/live_sandbox/federation_control_ledger/'
};
const EDGE_HELP = {
  data:'Data dependency: one repository consumes or publishes data used by another repository.',
  governance:'Governance relationship: documentation, policy or control dependency surfaced by the federation scan.',
  archive:'Archive lineage: relationship to the original source archive or retiring monolith.',
  external:'External reference: dependency on an external service, data source or build system.',
  repo:'Repository reference: one repository explicitly references another repository.',
  workflow:'Dependency on an external data source, build runner or processing tool.'
};
let state = { filter:'all', selected:null, selectedEdge:null, scale:defaultScale(), visibleLayers:new Set(LAYERS.map(l=>l.id)), nodes:[], edges:[], manifest:null, cards:new Map(), dims:null };
let pinch = null;

function defaultScale(){return window.innerWidth < 740 ? 0.62 : 0.82;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function repoUrl(id){return String(id||'').startsWith('Ventusltd/') ? `https://github.com/${id}` : '';}
function rootUrl(path, base=location.href){return new URL(path, base).href;}
async function json(path, base){const r=await fetch(rootUrl(path, base),{cache:'no-cache'}); if(!r.ok) throw new Error(`${path} ${r.status}`); return r.json();}
function layerFor(n){return LAYERS.find(l=>l.match(n)) || LAYERS.find(l=>l.id==='related');}
function visibleNodes(){return state.nodes.filter(n=>state.visibleLayers.has(n.layerId));}
function visibleEdgesRaw(){const ids=new Set(visibleNodes().map(n=>n.id)); return state.edges.filter(e=>ids.has(e.source.id)&&ids.has(e.target.id));}
function isWorkflowEdge(e){return e.type==='external' || e.source.layerId==='external' || e.target.layerId==='external';}
function edgeFilterMatch(e){return state.filter==='all' || (state.filter==='workflow' ? isWorkflowEdge(e) : e.type===state.filter);}

async function load(){
  document.body.classList.add('focus-mode');
  const manifestUrl = rootUrl(ROOT);
  const manifest = await json(manifestUrl);
  const base = new URL('.', manifestUrl).href;
  const nodesJson = await json(manifest.sources.nodes, base);
  const edgesJson = await json(manifest.sources.edges, base);
  state.manifest = manifest;
  state.nodes = nodesJson.features.map((f,i)=>{
    const n={
      index:i,
      id:f.properties.id || f.id,
      label:f.properties.label || f.id,
      repo_type:f.properties.repo_type || f.properties.scope_type || 'unknown',
      rag:f.properties.rag || f.properties.status || 'grey',
      status:f.properties.status || f.properties.rag || 'grey',
      reason:f.properties.status_reason || '',
      importance:Number(f.properties.importance_score || 0.4),
      child_manifest:f.properties.child_manifest || null,
      source_url:f.properties.source_url || repoUrl(f.properties.id || f.id)
    };
    const layer=layerFor(n);
    n.layerId=layer.id; n.layerTitle=layer.title; n.layerColor=layer.color; n.isRepo=layer.isRepo;
    return n;
  });
  state.edges = (edgesJson.edges || []).map(([from,to,type],i)=>({ id:`e${i}`, from, to, type, source:state.nodes[from], target:state.nodes[to] })).filter(e=>e.source&&e.target);
  buildLayerKey();
  render();
  wire();
}

function grouped(){
  return LAYERS.map(layer=>({ ...layer, items:state.nodes.filter(n=>n.layerId===layer.id && state.visibleLayers.has(layer.id)).sort((a,b)=>b.importance-a.importance) })).filter(g=>g.items.length);
}
function cssVar(name, fallback){const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)); return Number.isFinite(v)?v:fallback;}
function geometry(groups){
  const cardW=cssVar('--card-w',340), cardH=cssVar('--card-h',164), rowGap=cssVar('--row-gap',42), colGap=cssVar('--col-gap',150), pad=cssVar('--board-pad',18), title=cssVar('--title-offset',44);
  const cards = new Map();
  groups.forEach((g, col)=>g.items.forEach((n,row)=>cards.set(n.id,{x:pad+col*(cardW+colGap), y:pad+title+row*(cardH+rowGap), w:cardW, h:cardH, col, row})));
  const maxRows = Math.max(...groups.map(g=>g.items.length),1);
  return {cards, width:pad*2+groups.length*cardW+(groups.length-1)*colGap, height:pad*2+title+maxRows*cardH+(maxRows-1)*rowGap, cardW, cardH, pad, title};
}

function render(){
  const board=document.getElementById('board');
  const groups=grouped();
  const dims=geometry(groups);
  state.cards=dims.cards; state.dims=dims;
  board.style.width=`${Math.max(dims.width, board.parentElement.clientWidth / state.scale)}px`;
  board.style.height=`${Math.max(dims.height, board.parentElement.clientHeight / state.scale)}px`;
  board.style.transform=`scale(${state.scale})`;
  board.innerHTML='';
  board.appendChild(connectors());
  groups.forEach(g=>{
    const x=dims.cards.get(g.items[0].id)?.x || dims.pad;
    const h=document.createElement('h2'); h.className='stage-title'; h.style.left=`${x}px`; h.style.top=`${dims.pad}px`; h.textContent=g.title; h.style.setProperty('--layer-color',g.color); board.appendChild(h);
    g.items.forEach(n=>board.appendChild(card(n)));
  });
  if(state.selected){const n=state.nodes.find(x=>x.id===state.selected); if(n && state.cards.has(n.id)) board.appendChild(repoPreview(n));}
  document.getElementById('scopeName').textContent=state.manifest?.scope?.label || state.manifest?.public_title || 'Repository Federation';
  document.getElementById('relationCount').textContent=`${visibleNodes().length} / ${visibleEdges().length}`;
  document.querySelectorAll('.relation-nav button').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.filter));
  updateLayerKeyState();
}

function visibleEdges(){return visibleEdgesRaw().filter(edgeFilterMatch).filter(e=>edgeCoords(e));}
function relatedIds(id){const s=new Set([id]); visibleEdgesRaw().forEach(e=>{if(e.source.id===id||e.target.id===id){s.add(e.source.id);s.add(e.target.id);}}); return s;}
function edgeCoords(e){
  const a=state.cards.get(e.source.id), b=state.cards.get(e.target.id); if(!a||!b||a.col===b.col) return null;
  const left=a.col<b.col?a:b, right=a.col<b.col?b:a;
  const sx=left.x+left.w, sy=left.y+left.h/2, tx=right.x, ty=right.y+right.h/2;
  const mid=sx+Math.min(80,Math.max(42,(tx-sx)*0.38));
  return {sx,sy,tx,ty,mid,path:`M${sx} ${sy} H${mid} V${ty} H${tx}`, labelX:mid+8, labelY:(sy+ty)/2};
}

function connectors(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('connector-layer'); svg.setAttribute('width',state.dims.width); svg.setAttribute('height',state.dims.height);
  const selectedSet=state.selected?relatedIds(state.selected):null;
  visibleEdges().forEach(e=>{
    const c=edgeCoords(e); if(!c) return;
    const typeClass = state.filter==='workflow' && isWorkflowEdge(e) ? 'workflow' : e.type;
    const isDim = selectedSet&&!selectedSet.has(e.source.id)&&!selectedSet.has(e.target.id);
    const isHighlight = state.selectedEdge===e.id || (state.selected&&(e.source.id===state.selected||e.target.id===state.selected));
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',c.path);
    p.setAttribute('class',`connector-path ${typeClass}${isDim?' dim':''}${isHighlight?' highlight':''}`);
    svg.appendChild(p);
    const hit=document.createElementNS('http://www.w3.org/2000/svg','path');
    hit.setAttribute('d',c.path);
    hit.setAttribute('class','connector-hit');
    hit.addEventListener('click',ev=>{ev.stopPropagation(); state.selected=null; state.selectedEdge=e.id; showEdgePopover(e,c.labelX,c.labelY); redrawOnly();});
    svg.appendChild(hit);
  });
  return svg;
}
function redrawOnly(){const wrap=document.querySelector('.board-wrap'); const left=wrap.scrollLeft, top=wrap.scrollTop; render(); wrap.scrollLeft=left; wrap.scrollTop=top;}

function showEdgePopover(e,x,y){
  document.querySelectorAll('.edge-popover,.repo-popover').forEach(p=>p.remove());
  const displayType = state.filter==='workflow' && isWorkflowEdge(e) ? 'workflow' : e.type;
  const pop=document.createElement('div'); pop.className='edge-popover';
  pop.style.left=`${x}px`; pop.style.top=`${Math.max(10,y-54)}px`;
  pop.innerHTML=`<button type="button" aria-label="Close">×</button><h3>Relationship line</h3><p><span class="edge-type">${esc(displayType)}</span></p><p><strong>${esc(e.source.label)}</strong><br>→ ${esc(e.target.label)}</p><p>${esc(EDGE_HELP[displayType]||EDGE_HELP[e.type]||'Declared repository relationship.')}</p><p class="small">This line is drawn from the federation edge list. It is observe-only.</p>`;
  pop.querySelector('button').onclick=()=>{state.selectedEdge=null; pop.remove(); redrawOnly();};
  document.getElementById('board').appendChild(pop);
}

function card(n){
  const g=state.cards.get(n.id), href=n.source_url||repoUrl(n.id), selected=state.selected===n.id, related=state.selected?relatedIds(state.selected).has(n.id):true;
  const div=document.createElement('article'); div.className=`repo-card status-${n.status}${selected?' selected':''}${!related?' dim':''}`; div.style.left=`${g.x}px`; div.style.top=`${g.y}px`; div.style.setProperty('--layer-color',n.layerColor);
  div.innerHTML=`<div class="repo-meta"><span>${esc(n.layerTitle)}</span><span>${esc(n.status)}</span></div><button class="repo-main" type="button"><span class="repo-badge">${esc(TYPE_BADGE[n.repo_type]||'REP')}</span><span class="repo-name">${esc(n.label)}</span><span class="repo-dot">●</span></button><div class="repo-reason">${esc(n.reason)}</div><div class="repo-tools"><a href="${esc(FED_REPO)}/blob/main/reports/FEDERATION_MAP_LATEST.md" target="_blank" rel="noopener">REPORT</a>${href?`<a href="${esc(href)}" target="_blank" rel="noopener">REPO</a>`:''}${PAGE_LINKS[n.id]?`<a href="${esc(PAGE_LINKS[n.id])}" target="_blank" rel="noopener">PAGE</a>`:''}</div>`;
  div.querySelector('.repo-main').addEventListener('click',ev=>{ev.stopPropagation(); state.selected=state.selected===n.id?null:n.id; state.selectedEdge=null; redrawOnly();});
  return div;
}

function repoPreview(n){
  const g=state.cards.get(n.id); const href=n.source_url||repoUrl(n.id); const page=PAGE_LINKS[n.id];
  const pop=document.createElement('div'); pop.className='repo-popover';
  const right=g.x+g.w+18; const left=Math.max(8,g.x-300); const useRight=right+300<state.dims.width;
  pop.style.left=`${useRight?right:left}px`; pop.style.top=`${Math.max(8,g.y)}px`; pop.style.setProperty('--layer-color',n.layerColor);
  const actions=href?`${href}/actions`:'';
  pop.innerHTML=`<button class="close" type="button">×</button><h3>${esc(n.label)}</h3><p><span class="mini-key">${esc(n.layerTitle)}</span> <span class="mini-status">${esc(n.status)}</span></p><p>${esc(n.reason||'No further status note in current cartridge.')}</p><div class="preview-actions">${href?`<a href="${esc(href)}" target="_blank" rel="noopener">OPEN GITHUB</a>`:''}${page?`<a href="${esc(page)}" target="_blank" rel="noopener">OPEN PAGE</a>`:''}${actions?`<a href="${esc(actions)}" target="_blank" rel="noopener">WORKFLOWS</a>`:''}<a href="${esc(FED_REPO)}/blob/main/reports/FEDERATION_MAP_LATEST.md" target="_blank" rel="noopener">REPORT</a></div>`;
  pop.querySelector('.close').onclick=()=>{state.selected=null; redrawOnly();};
  return pop;
}

function buildLayerKey(){
  const nav=document.getElementById('layerNav'); if(!nav) return;
  nav.innerHTML=`<button type="button" data-mode="all">All layers</button><button type="button" data-mode="repos">Repos only</button><button type="button" data-mode="api">API deps</button>` + LAYERS.map(l=>`<button type="button" data-layer="${l.id}" style="--layer-color:${l.color}"><span class="layer-swatch"></span>${esc(l.title)}</button>`).join('');
  nav.querySelector('[data-mode="all"]').onclick=()=>{state.visibleLayers=new Set(LAYERS.map(l=>l.id)); state.filter='all'; state.selected=null; state.selectedEdge=null; render();};
  nav.querySelector('[data-mode="repos"]').onclick=()=>{state.visibleLayers=new Set(LAYERS.filter(l=>l.isRepo).map(l=>l.id)); state.filter='all'; state.selected=null; state.selectedEdge=null; render();};
  nav.querySelector('[data-mode="api"]').onclick=()=>{state.visibleLayers=new Set(['core','data','apps','external']); state.filter='workflow'; state.selected=null; state.selectedEdge=null; render();};
  nav.querySelectorAll('[data-layer]').forEach(btn=>btn.onclick=()=>{const id=btn.dataset.layer; state.visibleLayers.has(id)?state.visibleLayers.delete(id):state.visibleLayers.add(id); state.selected=null; state.selectedEdge=null; render();});
}
function updateLayerKeyState(){
  const nav=document.getElementById('layerNav'); if(!nav) return;
  nav.querySelectorAll('[data-layer]').forEach(btn=>btn.classList.toggle('active',state.visibleLayers.has(btn.dataset.layer)));
}

function setScale(value){state.scale=Math.max(0.42,Math.min(1.25,value)); render();}
function wire(){
  document.querySelectorAll('.relation-nav button').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter; state.selectedEdge=null; render();});
  document.getElementById('resetButton').onclick=()=>{state.filter='all';state.selected=null;state.selectedEdge=null;state.visibleLayers=new Set(LAYERS.map(l=>l.id));setScale(defaultScale());document.querySelector('.board-wrap').scrollTo({left:0,top:0,behavior:'smooth'});};
  document.getElementById('fullscreenButton').onclick=()=>{document.body.classList.toggle('focus-mode');document.getElementById('fullscreenButton').textContent=document.body.classList.contains('focus-mode')?'Exit':'Fullscreen';};
  const wrap=document.querySelector('.board-wrap');
  wrap.addEventListener('click',e=>{if(e.target.closest('.repo-card,.repo-popover,.edge-popover,.connector-hit'))return; state.selected=null; state.selectedEdge=null; redrawOnly();});
  wrap.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return; e.preventDefault(); setScale(state.scale+(e.deltaY<0?0.06:-0.06));},{passive:false});
  wrap.addEventListener('touchstart',e=>{if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY; pinch={dist:Math.hypot(dx,dy),scale:state.scale};}}, {passive:true});
  wrap.addEventListener('touchmove',e=>{if(!pinch||e.touches.length!==2)return; e.preventDefault(); const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY; setScale(pinch.scale*(Math.hypot(dx,dy)/pinch.dist));}, {passive:false});
  wrap.addEventListener('touchend',()=>{pinch=null;}, {passive:true});
  window.addEventListener('resize',()=>render());
}
load().catch(err=>{document.getElementById('board').innerHTML=`<p style="padding:16px;color:#ff6666">${esc(err.message)}</p>`;});
