const ROOT = window.REPO_BOARD_ROOT || 'data/manifest.json';
const FED_REPO = 'https://github.com/Ventusltd/data-federation-map-for-globalgrid2050-all-repos';
const STAGES = [
  { id:'core', title:'Core', match:n=>n.id.includes('data-federation-map') },
  { id:'data', title:'Data repos', match:n=>n.repo_type==='data' && !n.id.includes('data-federation-map') },
  { id:'apps', title:'Apps / UI', match:n=>['ui','homepage'].includes(n.repo_type) },
  { id:'source', title:'Source / archive', match:n=>n.repo_type==='source_archive' },
  { id:'external', title:'External systems', match:n=>n.repo_type==='external' },
  { id:'related', title:'Related repos', match:n=>n.repo_type==='unknown' }
];
const TYPE_BADGE = { data:'DB', ui:'UI', homepage:'WEB', source_archive:'SRC', unknown:'REP', external:'EXT' };
const EDGE_HELP = {
  data:'Data dependency: one repository consumes or publishes data used by another repository.',
  governance:'Governance relationship: documentation, policy or control dependency surfaced by the federation scan.',
  archive:'Archive lineage: relationship to the original source archive or retiring monolith.',
  external:'External reference: dependency on an external service, data source or build system.',
  repo:'Repository reference: one repository explicitly references another repository.'
};
let state = { filter:'all', selected:null, selectedEdge:null, scale:defaultScale(), nodes:[], edges:[], manifest:null, cards:new Map(), dims:null };
let pinch = null;

function defaultScale(){return window.innerWidth < 740 ? 0.62 : 0.82;}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function repoUrl(id){return String(id||'').startsWith('Ventusltd/') ? `https://github.com/${id}` : '';}
function status(n){return n.status || n.rag || 'grey';}
function rootUrl(path, base=location.href){return new URL(path, base).href;}
async function json(path, base){const r=await fetch(rootUrl(path, base),{cache:'no-cache'}); if(!r.ok) throw new Error(`${path} ${r.status}`); return r.json();}

async function load(){
  document.body.classList.add('focus-mode');
  const manifestUrl = rootUrl(ROOT);
  const manifest = await json(manifestUrl);
  const base = new URL('.', manifestUrl).href;
  const nodesJson = await json(manifest.sources.nodes, base);
  const edgesJson = await json(manifest.sources.edges, base);
  state.manifest = manifest;
  state.nodes = nodesJson.features.map((f,i)=>({
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
  }));
  state.edges = (edgesJson.edges || []).map(([from,to,type],i)=>({ id:`e${i}`, from, to, type, source:state.nodes[from], target:state.nodes[to] })).filter(e=>e.source&&e.target);
  render();
  wire();
}

function grouped(){
  const used = new Set();
  const groups = STAGES.map(stage=>{
    const items = state.nodes.filter(n=>!used.has(n.id)&&stage.match(n));
    items.forEach(n=>used.add(n.id));
    return {...stage, items:items.sort((a,b)=>b.importance-a.importance)};
  });
  const leftovers = state.nodes.filter(n=>!used.has(n.id));
  if(leftovers.length) groups.push({id:'other', title:'Other', items:leftovers});
  return groups.filter(g=>g.items.length);
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
    const h=document.createElement('h2'); h.className='stage-title'; h.style.left=`${x}px`; h.style.top=`${dims.pad}px`; h.textContent=g.title; board.appendChild(h);
    g.items.forEach(n=>board.appendChild(card(n)));
  });
  document.getElementById('scopeName').textContent=state.manifest?.scope?.label || state.manifest?.public_title || 'Repository Federation';
  document.getElementById('relationCount').textContent=`${state.nodes.length} / ${visibleEdges().length}`;
  document.querySelectorAll('.relation-nav button').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.filter));
}

function visibleEdges(){return state.edges.filter(e=>state.filter==='all'||e.type===state.filter).filter(e=>edgeCoords(e));}
function relatedIds(id){const s=new Set([id]); state.edges.forEach(e=>{if(e.source.id===id||e.target.id===id){s.add(e.source.id);s.add(e.target.id);}}); return s;}
function edgeCoords(e){
  const a=state.cards.get(e.source.id), b=state.cards.get(e.target.id); if(!a||!b||a.col===b.col) return null;
  const left=a.col<b.col?a:b, right=a.col<b.col?b:a;
  const leftNode=a.col<b.col?e.source:e.target, rightNode=a.col<b.col?e.target:e.source;
  const sx=left.x+left.w, sy=left.y+left.h/2, tx=right.x, ty=right.y+right.h/2;
  const mid=sx+Math.min(80,Math.max(42,(tx-sx)*0.38));
  return {sx,sy,tx,ty,mid,leftNode,rightNode,path:`M${sx} ${sy} H${mid} V${ty} H${tx}`, labelX:mid+8, labelY:(sy+ty)/2};
}

function connectors(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('connector-layer'); svg.setAttribute('width',state.dims.width); svg.setAttribute('height',state.dims.height);
  const selectedSet=state.selected?relatedIds(state.selected):null;
  visibleEdges().forEach(e=>{
    const c=edgeCoords(e); if(!c) return;
    const isDim = selectedSet&&!selectedSet.has(e.source.id)&&!selectedSet.has(e.target.id);
    const isHighlight = state.selectedEdge===e.id || (state.selected&&(e.source.id===state.selected||e.target.id===state.selected));
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',c.path);
    p.setAttribute('class',`connector-path ${e.type}${isDim?' dim':''}${isHighlight?' highlight':''}`);
    svg.appendChild(p);
    const hit=document.createElementNS('http://www.w3.org/2000/svg','path');
    hit.setAttribute('d',c.path);
    hit.setAttribute('class','connector-hit');
    hit.addEventListener('click',ev=>{ev.stopPropagation(); state.selectedEdge=e.id; showEdgePopover(e,c.labelX,c.labelY); redrawOnly();});
    svg.appendChild(hit);
  });
  return svg;
}

function redrawOnly(){
  const board=document.getElementById('board');
  const scrollParent=document.querySelector('.board-wrap');
  const left=scrollParent.scrollLeft, top=scrollParent.scrollTop;
  render();
  scrollParent.scrollLeft=left; scrollParent.scrollTop=top;
}

function showEdgePopover(e,x,y){
  document.querySelectorAll('.edge-popover').forEach(p=>p.remove());
  const pop=document.createElement('div');
  pop.className='edge-popover';
  pop.style.left=`${x}px`; pop.style.top=`${Math.max(10,y-54)}px`;
  pop.innerHTML=`<button type="button" aria-label="Close">×</button><h3>Relationship line</h3><p><span class="edge-type">${esc(e.type)}</span></p><p><strong>${esc(e.source.label)}</strong><br>→ ${esc(e.target.label)}</p><p>${esc(EDGE_HELP[e.type]||'Declared repository relationship.')}</p><p class="small">This line is drawn from the federation edge list. It is observe-only.</p>`;
  pop.querySelector('button').onclick=()=>{state.selectedEdge=null; pop.remove(); redrawOnly();};
  document.getElementById('board').appendChild(pop);
}

function card(n){
  const g=state.cards.get(n.id), s=status(n), href=n.source_url||repoUrl(n.id), selected=state.selected===n.id, related=state.selected?relatedIds(state.selected).has(n.id):true;
  const div=document.createElement('article'); div.className=`repo-card status-${s}${selected?' selected':''}${!related?' dim':''}`; div.style.left=`${g.x}px`; div.style.top=`${g.y}px`;
  div.innerHTML=`<div class="repo-meta"><span>${esc(n.repo_type.replace('_',' '))}</span><span>${esc(s)}</span></div><button class="repo-main" type="button"><span class="repo-badge">${esc(TYPE_BADGE[n.repo_type]||'REP')}</span><span class="repo-name">${esc(n.label)}</span><span class="repo-dot">●</span></button><div class="repo-reason">${esc(n.reason)}</div><div class="repo-tools"><a href="${esc(FED_REPO)}/blob/main/reports/FEDERATION_MAP_LATEST.md" target="_blank" rel="noopener">REPORT</a>${href?`<a href="${esc(href)}" target="_blank" rel="noopener">REPO</a>`:''}${n.child_manifest?'<a href="#" data-child>ATLAS</a>':''}</div>`;
  div.querySelector('.repo-main').addEventListener('click',()=>{state.selected=state.selected===n.id?null:n.id; state.selectedEdge=null; render(); scrollCard(n.id);});
  const child=div.querySelector('[data-child]'); if(child) child.addEventListener('click',e=>{e.preventDefault(); alert('Child atlas hook present; repo-internals scanner not yet attached.');});
  return div;
}

function scrollCard(id){const g=state.cards.get(id); if(!g)return; document.querySelector('.board-wrap').scrollTo({left:Math.max(0,(g.x-40)*state.scale),top:Math.max(0,(g.y-60)*state.scale),behavior:'smooth'});}
function setScale(value){state.scale=Math.max(0.42,Math.min(1.25,value)); render();}
function wire(){
  document.querySelectorAll('.relation-nav button').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter; state.selectedEdge=null; render();});
  document.getElementById('resetButton').onclick=()=>{state.filter='all';state.selected=null;state.selectedEdge=null;setScale(defaultScale());document.querySelector('.board-wrap').scrollTo({left:0,top:0,behavior:'smooth'});};
  document.getElementById('fullscreenButton').onclick=()=>{document.body.classList.toggle('focus-mode');document.getElementById('fullscreenButton').textContent=document.body.classList.contains('focus-mode')?'Exit':'Fullscreen';};
  const wrap=document.querySelector('.board-wrap');
  wrap.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return; e.preventDefault(); setScale(state.scale+(e.deltaY<0?0.06:-0.06));},{passive:false});
  wrap.addEventListener('touchstart',e=>{if(e.touches.length===2){const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY; pinch={dist:Math.hypot(dx,dy),scale:state.scale};}}, {passive:true});
  wrap.addEventListener('touchmove',e=>{if(!pinch||e.touches.length!==2)return; e.preventDefault(); const dx=e.touches[0].clientX-e.touches[1].clientX,dy=e.touches[0].clientY-e.touches[1].clientY; setScale(pinch.scale*(Math.hypot(dx,dy)/pinch.dist));}, {passive:false});
  wrap.addEventListener('touchend',()=>{pinch=null;}, {passive:true});
  window.addEventListener('resize',()=>render());
}

load().catch(err=>{document.getElementById('board').innerHTML=`<p style="padding:16px;color:#ff6666">${esc(err.message)}</p>`;});
