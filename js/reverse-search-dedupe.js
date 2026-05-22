// V116b：掉落反查搜尋清單依 ITEM ID 去重。
// 只修搜尋候選道具重複，不改實際掉落反查資料。
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
    try{return typeof itemSearchText==='function'?itemSearchText(it):''}catch(e){return ''}
  }
  function dedupByItemId(arr){
    const map=new Map();
    (arr||[]).forEach(it=>{
      const key=String(it?.ID||'').trim() || String(name2(it)||'').trim();
      if(key && !map.has(key))map.set(key,it);
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
        <div class="rSub">Lv.${esc2(it.Level||'')}｜${esc2((typeof itemTypeName==='function'?itemTypeName(it.Type):it.Type)||it.Type||'')}｜ID ${esc2(it.ID)}</div>
      </button>
    `).join('') || '<div class="muted">找不到道具</div>';
  };
})();
