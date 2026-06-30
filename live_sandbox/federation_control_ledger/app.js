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
let state = { filter:'all', selected:null, nodes:[], edges:[], manifest:null, cards:new Map(), dims:null };

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function repoUrl(id){return String(id||'').startsWith('Ventusltd/') ? `https://github.com/${id}` : '';}
function status(n){return n.status || n.rag || 'grey';}
function rootUrl(path, base=location.href){return new URL(path, base).href;}
async function json(path, base){const r=await fetch(rootUrl(path, base),{cache:'no-cache'}); if(!r.ok) throw new Error(`${path} ${r.status}`); return r.json();}

async function load(){
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
  const cardW=cssVar('--card-w',236), cardH=cssVar('--card-h',132), rowGap=cssVar('--row-gap',16), colGap=cssVar('--col-gap',70), pad=cssVar('--board-pad',14), title=cssVar('--title-offset',38);
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
  board.style.width=`${Math.max(dims.width, board.parentElement.clientWidth)}px`;
  board.style.height=`${Math.max(dims.height, board.parentElement.clientHeight)}px`;
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

function visibleEdges(){return state.edges.filter(e=>state.filter==='all'||e.type===state.filter);}
function relatedIds(id){const s=new Set([id]); state.edges.forEach(e=>{if(e.source.id===id||e.target.id===id){s.add(e.source.id);s.add(e.target.id);}}); return s;}

function connectors(){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.classList.add('connector-layer'); svg.setAttribute('width',state.dims.width); svg.setAttribute('height',state.dims.height);
  const selectedSet=state.selected?relatedIds(state.selected):null;
  visibleEdges().forEach(e=>{
    const a=state.cards.get(e.source.id), b=state.cards.get(e.target.id); if(!a||!b) return;
    const sx=a.x+a.w, sy=a.y+a.h/2, tx=b.x, ty=b.y+b.h/2, mid=sx+(tx-sx)/2;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');
    p.setAttribute('d',`M${sx} ${sy} H${mid} V${ty} H${tx}`);
    p.setAttribute('class',`connector-path ${e.type}${selectedSet&&!selectedSet.has(e.source.id)&&!selectedSet.has(e.target.id)?' dim':''}${state.selected&&(e.source.id===state.selected||e.target.id===state.selected)?' highlight':''}`);
    svg.appendChild(p);
  });
  return svg;
}

function card(n){
  const g=state.cards.get(n.id), s=status(n), href=n.source_url||repoUrl(n.id), selected=state.selected===n.id, related=state.selected?relatedIds(state.selected).has(n.id):true;
  const div=document.createElement('article'); div.className=`repo-card status-${s}${selected?' selected':''}${!related?' dim':''}`; div.style.left=`${g.x}px`; div.style.top=`${g.y}px`;
  div.innerHTML=`<div class="repo-meta"><span>${esc(n.repo_type.replace('_',' '))}</span><span>${esc(s)}</span></div><button class="repo-main" type="button"><span class="repo-badge">${esc(TYPE_BADGE[n.repo_type]||'REP')}</span><span class="repo-name">${esc(n.label)}</span><span class="repo-dot">●</span></button><div class="repo-reason">${esc(n.reason)}</div><div class="repo-tools"><a href="${esc(FED_REPO)}/blob/main/reports/FEDERATION_MAP_LATEST.md" target="_blank" rel="noopener">REPORT</a>${href?`<a href="${esc(href)}" target="_blank" rel="noopener">REPO</a>`:''}${n.child_manifest?'<a href="#" data-child>ATLAS</a>':''}</div>`;
  div.querySelector('.repo-main').addEventListener('click',()=>{state.selected=state.selected===n.id?null:n.id; render(); scrollCard(n.id);});
  const child=div.querySelector('[data-child]'); if(child) child.addEventListener('click',e=>{e.preventDefault(); alert('Child atlas hook present; repo-internals scanner not yet attached.');});
  return div;
}

function scrollCard(id){const g=state.cards.get(id); if(!g)return; document.querySelector('.board-wrap').scrollTo({left:Math.max(0,g.x-40),top:Math.max(0,g.y-60),behavior:'smooth'});}
function wire(){
  document.querySelectorAll('.relation-nav button').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter; render();});
  document.getElementById('resetButton').onclick=()=>{state.filter='all';state.selected=null;render();document.querySelector('.board-wrap').scrollTo({left:0,top:0,behavior:'smooth'});};
  document.getElementById('fullscreenButton').onclick=()=>{document.body.classList.toggle('focus-mode');document.getElementById('fullscreenButton').textContent=document.body.classList.contains('focus-mode')?'Exit':'Fullscreen';};
  window.addEventListener('resize',()=>render());
}

load().catch(err=>{document.getElementById('board').innerHTML=`<p style="padding:16px;color:#ff6666">${esc(err.message)}</p>`;});
