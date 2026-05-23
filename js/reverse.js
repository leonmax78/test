// V203 reverse.js
// Drop reverse search module extracted safely from app-core.js.
// app-core.js still keeps the original functions for now; this module provides the active override.

function searchReverseItems(){
 const input=byId('reverseQ'); if(!input)return;
 window.v86ReverseQ=input.value;
 const q=input.value.trim().toLowerCase();
 if(!q){byId('reverseResults').innerHTML='<div class="muted">請輸入道具名稱</div>';return}
 const seenItems=new Set();
 const arr=[];
 for(const it of items){
  if(!itemSearchText(it).includes(q))continue;
  const key=String(it.ID||nameOf(it)||'').trim();
  if(seenItems.has(key))continue;
  seenItems.add(key);
  arr.push(it);
  if(arr.length>=100)break;
 }
 byId('reverseResults').innerHTML=arr.map(it=>`<button class="resultItem" data-rev="${esc(it.ID)}"><div class="rName">${esc(nameOf(it))}</div><div class="rSub">Lv.${esc(it.Level||'')}｜${esc(itemTypeName(it.Type)||'')}｜ID ${esc(it.ID)}</div></button>`).join('')||'<div class="muted">找不到道具</div>';
}

function showReverse(id){
 window.v86LastView='reverse';
 history.pushState({app:'detail',view:'reverse'},'','#reverse-'+id);
 const it=itemIndex[String(id).trim()]; if(!it)return; const arr=dropReverse[String(id).trim()]||[];
 byId('reader').innerHTML=`<section class="card"><button class="backBtn" onclick="goBackToPrevious()">← 返回查詢</button><h1>${esc(nameOf(it))}</h1><div class="muted">掉落反查｜共 ${arr.length} 筆</div>${arr.length?`<div class="tableWrap"><table><thead><tr><th>怪物</th><th>Lv.</th><th>機率</th><th>位置</th></tr></thead><tbody>${arr.map(x=>`<tr data-monster="${esc(x.monster.ID)}"><td>${esc(nameOf(x.monster))}</td><td>${esc(x.monster.Level||'')}</td><td>${x.rate.toFixed(6)}%</td><td>${esc(locOf(nameOf(x.monster))||'')}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">沒有怪物掉落這個道具。</div>'}</section>`;
 closeDrawer(); window.scrollTo({top:0,behavior:'smooth'});
}

// V203 active reverse overrides with ITEM ID de-duplication.
(function(){
  function by(id){return document.getElementById(id)}
  function esc2(s){
    if(typeof esc==='function')return esc(s);
    return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function name2(it){
    try{return typeof nameOf==='function'?nameOf(it):(it?.Name||'')}catch(e){return it?.Name||''}
  }
  function searchText2(it){
    try{return typeof itemSearchText==='function'?itemSearchText(it):''}catch(e){
      return (name2(it)+' '+(it?.ID||'')+' '+(it?.Level||'')+' '+(it?.Type||'')).toLowerCase();
    }
  }
  function type2(it){
    try{return (typeof itemTypeName==='function'?itemTypeName(it.Type):it.Type)||it.Type||''}catch(e){return it?.Type||''}
  }
  function dedupByItemId(arr){
    const map=new Map();
    (arr||[]).forEach(it=>{
      const key=String(it?.ID||'').trim() || String(name2(it)||'').trim();
      if(key && !map.has(key))map.set(key,it);
    });
    return [...map.values()];
  }
  function dedupDrops(arr){
    const map=new Map();
    (arr||[]).forEach(x=>{
      const mid=String(x?.monster?.ID||x?.ID||x?.monster_id||'').trim();
      const rate=String(x?.rateText||x?.rate||x?.weight||'').trim();
      const key=mid+'|'+rate;
      if(key && !map.has(key))map.set(key,x);
    });
    return [...map.values()];
  }

  window.searchReverseItems=function(){
    const input=by('reverseQ');
    if(!input)return;
    window.v86ReverseQ=input.value;
    const q=input.value.trim().toLowerCase();
    const box=by('reverseResults');
    if(!box)return;

    if(!q){
      box.innerHTML='<div class="muted">請輸入道具名稱</div>';
      return;
    }

    const arr=dedupByItemId((items||[]).filter(it=>searchText2(it).includes(q))).slice(0,100);

    box.innerHTML=arr.map(it=>`
      <button class="resultItem" data-rev="${esc2(it.ID)}">
        <div class="rName">${esc2(name2(it))}</div>
        <div class="rSub">Lv.${esc2(it.Level||'')}｜${esc2(type2(it))}｜ID ${esc2(it.ID)}</div>
      </button>
    `).join('') || '<div class="muted">找不到道具</div>';
  };

  const oldShowReverse = (typeof window.showReverse==='function') ? window.showReverse : (typeof showReverse==='function' ? showReverse : null);
  window.showReverse=function(id){
    window.v86LastView='reverse';
    try{history.pushState({app:'detail',view:'reverse'},'','#reverse-'+id);}catch(e){}
    const it=itemIndex[String(id).trim()];
    if(!it)return;
    const raw=dropReverse[String(id).trim()]||[];
    const arr=dedupDrops(raw);

    const title=esc2(name2(it));
    const rows=arr.map(x=>{
      const m=x.monster||x;
      const rate=x.rateText||x.rate||x.weight||'';
      const mid=m.ID||x.monster_id||'';
      const lv=m.Level||'';
      const mn=typeof nameOf==='function'?nameOf(m):(m.Name||'');
      return `<button class="resultItem" data-monster="${esc2(mid)}"><div class="rName">${esc2(mn)}</div><div class="rSub">Lv.${esc2(lv)}｜${rate?('掉率 '+esc2(rate)+'｜'):''}ID ${esc2(mid)}</div></button>`;
    }).join('');

    const reader=by('reader');
    if(reader){
      reader.innerHTML=`<section class="card"><button class="backBtn" type="button" onclick="goBackToPrevious()">← 返回查詢</button><h1>${title}</h1><div class="muted">掉落反查結果：${arr.length} 筆</div><div class="results">${rows||'<div class="muted">沒有反查資料</div>'}</div></section>`;
      try{closeDrawer&&closeDrawer();}catch(e){}
      window.scrollTo({top:0,behavior:'smooth'});
    }else if(oldShowReverse){
      oldShowReverse(id);
    }
  };

  window.SZO_REVERSE_MODULE = {
    searchReverseItems: window.searchReverseItems,
    showReverse: window.showReverse,
    dedupByItemId,
    dedupDrops
  };
})();
