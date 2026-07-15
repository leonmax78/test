// Stage map lookup page for the test site.
(function(){
  let mapDataPromise = null;
  let mapData = null;
  const state = {
    query: '',
    stageId: null,
    monsters: new Set(),
    npcs: new Set()
  };

  function htmlEscape(s){
    return typeof esc === 'function' ? esc(s) : String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  async function ensureMapDataLoaded(){
    if(mapData) return mapData;
    if(!mapDataPromise){
      mapDataPromise = fetch('data/stage_maps.json?v=' + encodeURIComponent(document.body?.dataset?.version || 'dev'), { cache: 'no-store' })
        .then(res => {
          if(!res.ok) throw new Error('地圖資料讀取失敗');
          return res.json();
        })
        .then(data => {
          mapData = data || { stages: [] };
          return mapData;
        });
    }
    return mapDataPromise;
  }

  function markerText(marker){
    return `${marker.name || ''} ${marker.id || ''} ${marker.level || ''} ${marker.x || ''} ${marker.y || ''}`.toLowerCase();
  }

  function stageMatches(stage, q){
    if(!q) return true;
    const head = `${stage.stageId || ''} ${stage.stageName || ''}`.toLowerCase();
    if(head.includes(q)) return true;
    return (stage.monsters || []).some(m => markerText(m).includes(q)) || (stage.npcs || []).some(n => markerText(n).includes(q));
  }

  function markerMatches(marker, q){
    return !q || markerText(marker).includes(q);
  }

  function filteredStages(){
    const q = state.query.trim().toLowerCase();
    return (mapData?.stages || []).filter(stage => stageMatches(stage, q));
  }

  function currentStage(){
    const stages = filteredStages();
    if(!stages.length) return null;
    let stage = stages.find(s => Number(s.stageId) === Number(state.stageId));
    if(!stage){
      stage = stages[0];
      state.stageId = Number(stage.stageId);
      autoCheckMatches(stage);
    }
    return stage;
  }

  function markerKey(marker){
    return `${marker.id}:${marker.x}:${marker.y}`;
  }

  function autoCheckMatches(stage){
    state.monsters.clear();
    state.npcs.clear();
    const q = state.query.trim().toLowerCase();
    if(!q) return;
    (stage.monsters || []).forEach(m => { if(markerMatches(m, q)) state.monsters.add(markerKey(m)); });
    (stage.npcs || []).forEach(n => { if(markerMatches(n, q)) state.npcs.add(markerKey(n)); });
  }

  function roleLabel(role){
    return { shop: '商店', function: '功能', mission: '任務', talk: '對話' }[role] || '';
  }

  function markerLabel(marker){
    const lv = marker.level ? ` Lv.${marker.level}` : '';
    const role = marker.kind === 'npc' ? roleLabel(marker.role) : '';
    const roleText = role ? ` / ${role}` : '';
    return `${marker.name || '未命名'}${lv}${roleText} (${marker.x}, ${marker.y})`;
  }

  function markerList(stage, kind){
    const rows = kind === 'monster' ? (stage.monsters || []) : (stage.npcs || []);
    const checked = kind === 'monster' ? state.monsters : state.npcs;
    if(!rows.length) return '<div class="muted mapEmptyLine">沒有資料</div>';
    return rows.map((marker, index) => {
      const key = markerKey(marker);
      return `<label class="mapMarkerChoice">
        <input type="checkbox" data-map-${kind}="${htmlEscape(key)}" ${checked.has(key) ? 'checked' : ''}>
        <span>${htmlEscape(markerLabel(Object.assign({kind}, marker)))}</span>
      </label>`;
    }).join('');
  }

  function visibleMarkers(stage){
    const monsterRows = (stage.monsters || []).filter(m => state.monsters.has(markerKey(m))).map(m => Object.assign({ kind: 'monster' }, m));
    const npcRows = (stage.npcs || []).filter(n => state.npcs.has(markerKey(n))).map(n => Object.assign({ kind: 'npc' }, n));
    return monsterRows.concat(npcRows);
  }

  function markerDots(stage){
    const w = Number(stage.width) || 1;
    const h = Number(stage.height) || 1;
    return visibleMarkers(stage).map(marker => {
      const left = Math.max(0, Math.min(100, Number(marker.x || 0) / w * 100));
      const top = Math.max(0, Math.min(100, Number(marker.y || 0) / h * 100));
      const cls = marker.kind === 'npc' ? 'npc' : 'monster';
      return `<button type="button" class="mapDot ${cls}" style="left:${left}%;top:${top}%;" title="${htmlEscape(markerLabel(marker))}">
        <span>${marker.kind === 'npc' ? 'N' : 'M'}</span>
      </button>`;
    }).join('');
  }

  function renderLoaded(){
    const reader = byId('reader');
    if(!reader) return;
    const stages = filteredStages();
    const stage = currentStage();
    if(!stage){
      reader.innerHTML = `<section class="card mapPage"><h1>地圖查詢</h1><div class="empty">找不到符合的地圖。</div></section>`;
      return;
    }
    const stageOptions = stages.map(s => `<option value="${Number(s.stageId)}" ${Number(s.stageId) === Number(stage.stageId) ? 'selected' : ''}>${String(s.stageId).padStart(3,'0')} ${htmlEscape(s.stageName)}</option>`).join('');
    reader.innerHTML = `<section class="card mapPage">
      <h1>地圖查詢</h1>
      <div class="mapToolbar">
        <label>搜尋地圖 / 怪物 / NPC
          <input id="mapSearchInput" value="${htmlEscape(state.query)}" placeholder="例如：京城、大山犬、敖姬">
        </label>
        <label>地圖
          <select id="mapStageSelect">${stageOptions}</select>
        </label>
      </div>
      <div class="mapLayout">
        <aside class="mapSide">
          <div class="mapSideHead">
            <h2>怪物</h2>
            <div><button type="button" class="ghost mapMiniBtn" data-map-all="monster">全選</button><button type="button" class="ghost mapMiniBtn" data-map-none="monster">全不選</button></div>
          </div>
          <div class="mapChoiceList">${markerList(stage, 'monster')}</div>
          <div class="mapSideHead">
            <h2>NPC</h2>
            <div><button type="button" class="ghost mapMiniBtn" data-map-all="npc">全選</button><button type="button" class="ghost mapMiniBtn" data-map-none="npc">全不選</button></div>
          </div>
          <div class="mapChoiceList">${markerList(stage, 'npc')}</div>
        </aside>
        <div class="mapCanvasWrap">
          <div class="mapLoading" id="mapImageLoading">地圖載入中</div>
          <div class="mapImageStage">
            <img id="mapImage" src="${htmlEscape(stage.image)}" alt="${htmlEscape(stage.stageName)}">
            <div class="mapOverlay">${markerDots(stage)}</div>
          </div>
        </div>
      </div>
    </section>`;
    const img = byId('mapImage');
    const loading = byId('mapImageLoading');
    if(img && loading){
      const done = () => { loading.hidden = true; };
      if(img.complete) done();
      else img.addEventListener('load', done, { once: true });
      img.addEventListener('error', () => { loading.textContent = '地圖載入失敗'; }, { once: true });
    }
  }

  async function renderStageMapPage(){
    if(typeof showPageLoading === 'function') showPageLoading('地圖查詢', '地圖載入中，請稍候。');
    else if(byId('reader')) byId('reader').innerHTML = '<section class="card pageLoadingCard"><h1>地圖載入中</h1><div class="muted">正在載入地圖資料，請稍候。</div></section>';
    await ensureMapDataLoaded();
    if(state.stageId === null){
      const first = (mapData.stages || [])[0];
      if(first) state.stageId = Number(first.stageId);
    }
    renderLoaded();
  }

  document.addEventListener('input', ev => {
    if(ev.target?.id === 'mapSearchInput'){
      state.query = ev.target.value || '';
      const stage = currentStage();
      if(stage) autoCheckMatches(stage);
      renderLoaded();
    }
    const monster = ev.target?.dataset?.mapMonster;
    if(monster){
      ev.target.checked ? state.monsters.add(monster) : state.monsters.delete(monster);
      renderLoaded();
    }
    const npc = ev.target?.dataset?.mapNpc;
    if(npc){
      ev.target.checked ? state.npcs.add(npc) : state.npcs.delete(npc);
      renderLoaded();
    }
  });

  document.addEventListener('change', ev => {
    if(ev.target?.id === 'mapStageSelect'){
      state.stageId = Number(ev.target.value);
      const stage = currentStage();
      if(stage) autoCheckMatches(stage);
      renderLoaded();
    }
  });

  document.addEventListener('click', ev => {
    const all = ev.target?.closest?.('[data-map-all]')?.dataset.mapAll;
    const none = ev.target?.closest?.('[data-map-none]')?.dataset.mapNone;
    const stage = currentStage();
    if(!stage || (!all && !none)) return;
    const set = (all || none) === 'monster' ? state.monsters : state.npcs;
    const rows = (all || none) === 'monster' ? (stage.monsters || []) : (stage.npcs || []);
    set.clear();
    if(all) rows.forEach(row => set.add(markerKey(row)));
    renderLoaded();
  });

  window.ensureMapPageLoaded = async function(){ return true; };
  window.renderStageMapPage = renderStageMapPage;
})();
