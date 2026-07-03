import os
from pathlib import Path
GO='function goLabel(n){return action==="github"&&n.gh?"open ↗":action==="external"&&n.ext?"open ↗":"";}'
FOCUS_OLD='cardInner(focus,{center:true})'
FOCUS_NEW='cardInner(focus,{center:true,dim:!actionable(focus),go:goLabel(focus)})'
COL_OLD='overlay.appendChild(shell);}'
COL_NEW='overlay.appendChild(shell);shell.querySelector(".focuswrap .card").addEventListener("click",()=>handleTap(current));}'
SPI_OLD='canvas.appendChild(center);const nodes=S().nodes;'
SPI_NEW='canvas.appendChild(center);center.querySelector(".card").addEventListener("click",()=>handleTap(current));const nodes=S().nodes;'
GOLD='${relHTML}${contents}</div>`;}'
GNEW='${relHTML}${!rel&&opts.go?`<span class="go">${opts.go}</span>`:""}${contents}</div>`;}'

def patch(path, need_contents=False):
    p=Path(path); t=p.read_text(encoding='utf-8')
    if GO not in t:
        i=t.find('function cardInner(node,opts={})')
        if i<0: raise SystemExit(path+': no cardInner')
        j=t.find('\n',i)
        t=t[:j+1]+GO+'\n'+t[j+1:]
    if FOCUS_OLD in t: t=t.replace(FOCUS_OLD,FOCUS_NEW)
    if COL_NEW not in t:
        if t.count(COL_OLD)!=1: raise SystemExit(path+': column anchor count')
        t=t.replace(COL_OLD,COL_NEW)
    if SPI_NEW not in t:
        if t.count(SPI_OLD)!=1: raise SystemExit(path+': spider anchor count')
        t=t.replace(SPI_OLD,SPI_NEW)
    if GOLD in t: t=t.replace(GOLD,GNEW)
    if t.count(GO)!=1: raise SystemExit(path+': goLabel count')
    if t.count(FOCUS_NEW)<2: raise SystemExit(path+': focus card count')
    if t.count('handleTap(current)')<2: raise SystemExit(path+': handleTap current count')
    if need_contents:
        for s in ['const CONTENTS_BASE="../data/federation_map/contents/provenance=declared/repo=Ventusltd__globalgrid2050/";','async function loadContents()','await loadContents();']:
            if s not in t: raise SystemExit(path+': missing '+s)
    p.write_text(t,encoding='utf-8')

patch('dashboard/federation_radial.html', True)
if os.environ.get('INCLUDE_SANDBOX','true')=='true':
    patch('dashboard/sandbox/federation_radial_uniform.html', False)
