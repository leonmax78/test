// V216：武魂快速數量按鈕保險修正
// 不管武魂頁是由舊 patch 或新模組渲染，1/2/3/5/10/20/滿收藏都要能更新輸入框與結果。
(function(){
  const FIELD_MAP = [
    ['Base_Str','力量'], ['Base_Int','智慧'], ['Base_Dex','靈敏'],
    ['Base_Con','體魄'], ['Extra_Def','物理防禦'], ['Magic_Def','術法防禦']
  ];
  function esc(s){
    return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function num(v, d){ v = Number(v); return Number.isFinite(v) ? v : (d || 0); }
  function fmt(n){ return Math.floor(Number(n) || 0).toLocaleString('zh-TW'); }
  function getSoulList(){
    try{
      if (window.SZO_SOUL_MODULE && typeof window.SZO_SOUL_MODULE.getSoulListV106 === 'function') {
        const a = window.SZO_SOUL_MODULE.getSoulListV106();
        if (Array.isArray(a) && a.length) return a;
      }
    }catch(e){}
    try{
      if (typeof window.getSoulListV106 === 'function') {
        const a = window.getSoulListV106();
        if (Array.isArray(a) && a.length) return a;
      }
    }catch(e){}
    return [];
  }
  function soulById(id){
    const list = getSoulList();
    return list.find(x => String(x.ID) === String(id)) || list[0] || null;
  }
  function manualUpdateSoulCalc(){
    const sel = document.getElementById('soulSelect');
    const cnt = document.getElementById('soulCount');
    const out = document.getElementById('soulResult');
    if (!cnt || !out) return;
    const soul = soulById(sel ? sel.value : window.soulSelectedId);
    if (!soul) return;
    const count = Math.max(1, num(cnt.value || window.soulCount, 1));
    window.soulSelectedId = soul.ID;
    window.soulCount = count;
    const rate = (count - 1) * 0.025;
    const rows = FIELD_MAP.map(function(pair){
      const key = pair[0], label = pair[1];
      const base = num(soul[key], 0);
      if (!base) return '';
      const bonus = Math.floor(base * rate);
      return '<div class="soulStat"><div class="k">' + esc(label) + '</div><div class="base">' + fmt(base) + (bonus > 0 ? '<span class="bonus">(+ ' + fmt(bonus) + ')</span>' : '') + '</div></div>';
    }).join('');
    const totalRows = FIELD_MAP.map(function(pair){
      const key = pair[0], label = pair[1];
      const base = num(soul[key], 0);
      if (!base) return '';
      const bonus = Math.floor(base * rate);
      return '<tr><td>' + esc(label) + '</td><td>' + fmt(base) + '</td><td style="color:#facc15;font-weight:1000">+' + fmt(bonus) + '</td><td>' + fmt(base + bonus) + '</td></tr>';
    }).join('');
    out.innerHTML = '<div class="notice"><b>' + esc(soul.Name || '') + '</b><br>收藏數：' + fmt(count) + '｜加成：' + (rate * 100).toFixed(1).replace(/\.0$/, '') + '%</div><h3>能力預覽</h3><div class="soulStats">' + rows + '</div><h3>詳細表</h3><div class="tableWrap"><table><thead><tr><th>能力</th><th>原始能力</th><th>收藏加成</th><th>合計</th></tr></thead><tbody>' + totalRows + '</tbody></table></div>';
  }
  function setSoulCount(v){
    const cnt = document.getElementById('soulCount');
    if (!cnt) return false;
    cnt.value = String(v);
    window.soulCount = cnt.value;
    try{ cnt.dispatchEvent(new Event('input', {bubbles:true})); }catch(e){}
    try{ manualUpdateSoulCalc(); }catch(e){ console.warn('V216 soul manual update failed', e); }
    return true;
  }
  function bindExistingButtons(){
    document.querySelectorAll('[data-soul-count]').forEach(function(btn){
      btn.type = 'button';
      btn.onclick = function(ev){
        if (ev) { ev.preventDefault(); ev.stopPropagation(); }
        setSoulCount(btn.getAttribute('data-soul-count'));
        return false;
      };
    });
  }
  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest ? e.target.closest('[data-soul-count]') : null;
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
    setSoulCount(btn.getAttribute('data-soul-count'));
  }, true);
  document.addEventListener('change', function(e){ if (e.target && e.target.id === 'soulSelect') manualUpdateSoulCalc(); }, true);
  document.addEventListener('input', function(e){ if (e.target && e.target.id === 'soulCount') manualUpdateSoulCalc(); }, true);
  try{
    const mo = new MutationObserver(function(){ bindExistingButtons(); });
    mo.observe(document.documentElement, {childList:true, subtree:true});
  }catch(e){}
  window.SZOSetSoulCount = setSoulCount;
  window.SZOUpdateSoulCalc = manualUpdateSoulCalc;
  bindExistingButtons();
})();
