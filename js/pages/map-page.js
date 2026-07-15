// Stage map lookup page for the test site.
(function(){
  let mapDataPromise = null;
  let mapData = null;
  const state = {
    query: '',
    stageId: null,
    monsters: new Set(),
    npcs: new Set(),
    composing: false,
    zoom: 1
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
    return `${marker.name || ''} ${marker.id || ''} ${marker.level || ''} ${marker.x || marker.coordX || ''} ${marker.y || marker.coordY || ''}`.toLowerCase();
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

  function monsterGroupKey(marker){
    return String(marker.id || '');
  }

  function npcKey(marker){
    return `${marker.id}:${marker.x}:${marker.y}`;
  }

  function markerKey(marker){
    return marker.kind === 'npc' ? npcKey(marker) : monsterGroupKey(marker);
  }

  function autoCheckMatches(stage){
    state.monsters.clear();
    state.npcs.clear();
    const q = state.query.trim().toLowerCase();
    if(!q) return;
    monsterGroups(stage).forEach(group => { if(markerMatches(group, q)) state.monsters.add(markerKey(group)); });
    (stage.npcs || []).forEach(n => { if(markerMatches(Object.assign({ kind: 'npc' }, n), q)) state.npcs.add(npcKey(n)); });
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

  function coordLabel(marker){
    const x = marker.coordX ?? marker.x ?? '';
    const y = marker.coordY ?? marker.y ?? '';
    return `(${x}, ${y})`;
  }

  function monsterGroups(stage){
    const groups = new Map();
    (stage.monsters || []).forEach(marker => {
      const key = monsterGroupKey(marker);
      if(!groups.has(key)){
        groups.set(key, Object.assign({ kind: 'monster', points: [] }, marker));
      }
      groups.get(key).points.push(marker);
    });
    return [...groups.values()].sort((a, b) => {
      const la = Number(a.level) || 0, lb = Number(b.level) || 0;
      return la - lb || String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hant') || Number(a.id) - Number(b.id);
    });
  }

  function monsterGroupLabel(group){
    const lv = group.level ? ` Lv.${group.level}` : '';
    const count = Array.isArray(group.points) ? group.points.length : 0;
    return `${group.name || '未命名'}${lv} / 共 ${count} 點`;
  }

  function markerList(stage, kind){
    const rows = kind === 'monster' ? monsterGroups(stage) : (stage.npcs || []).map(n => Object.assign({ kind: 'npc' }, n));
    const checked = kind === 'monster' ? state.monsters : state.npcs;
    if(!rows.length) return '<div class="muted mapEmptyLine">沒有資料</div>';
    return rows.map(marker => {
      const key = markerKey(marker);
      const label = kind === 'monster' ? monsterGroupLabel(marker) : `${marker.name || '未命名'}${roleLabel(marker.role) ? ' / ' + roleLabel(marker.role) : ''} ${coordLabel(marker)}`;
      return `<label class="mapMarkerChoice">
        <input type="checkbox" data-map-${kind}="${htmlEscape(key)}" ${checked.has(key) ? 'checked' : ''}>
        <span>${htmlEscape(label)}</span>
      </label>`;
    }).join('');
  }

  function visibleMarkers(stage){
    const monsterRows = (stage.monsters || []).filter(m => state.monsters.has(monsterGroupKey(m))).map(m => Object.assign({ kind: 'monster' }, m));
    const npcRows = (stage.npcs || []).filter(n => state.npcs.has(npcKey(n))).map(n => Object.assign({ kind: 'npc' }, n));
    return monsterRows.concat(npcRows);
  }

  function markerDots(stage){
    const w = Number(stage.width) || 1;
    const h = Number(stage.height) || 1;
    return visibleMarkers(stage).map(marker => {
      const left = Math.max(0, Math.min(100, Number(marker.x || 0) / w * 100));
      const top = Math.max(0, Math.min(100, Number(marker.y || 0) / h * 100));
      const cls = marker.kind === 'npc' ? 'npc' : 'monster';
      const src = markerImage(marker);
      const fallback = marker.kind === 'npc' ? 'N' : 'M';
      const inner = src ? `<img src="${htmlEscape(src)}" alt="" onerror="this.hidden=true;this.nextElementSibling.hidden=false;this.parentElement.classList.remove('withImage')"><span hidden>${fallback}</span>` : `<span>${fallback}</span>`;
      return `<button type="button" class="mapDot ${cls}${src ? ' withImage' : ''}" style="left:${left}%;top:${top}%;" title="${htmlEscape(markerLabel(marker))}">
        ${inner}
      </button>`;
    }).join('');
  }

  function zoomValue(){
    const n = Number(state.zoom);
    if(!Number.isFinite(n)) return 1;
    return Math.max(0.5, Math.min(2.25, n));
  }

  function assetBase(){
    return (window.SZO_ASSET_MANIFEST && window.SZO_ASSET_MANIFEST.base) || 'assets/test-media';
  }

  function pad4(v){
    return String(v || '').padStart(4, '0');
  }

  function markerImage(marker){
    const pic = marker.pic;
    if(pic === undefined || pic === null || pic === '') return '';
    const base = assetBase();
    if(marker.kind === 'monster') return `${base}/monster-portraits/m${pic}.png`;
    return `${base}/npc-portraits/n${pic}.png`;
  }

  function renderLoaded(){
    const reader = byId('reader');
    if(!reader) return;
    const stages = filteredStages();
    const stage = currentStage();
    if(!stage){
      reader.innerHTML = `<section class="card mapPage"><h1>地圖查詢</h1>
        <div class="mapToolbar">
          <label>搜尋地圖 / 怪物 / NPC
            <input id="mapSearchInput" value="${htmlEscape(state.query)}" placeholder="例如：京城、大山犬、敖姬">
          </label>
          <button type="button" class="ghost mapClearSearchBtn" data-map-clear-search>清空搜尋</button>
        </div>
        <div class="empty">找不到符合的地圖。</div></section>`;
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
        <button type="button" class="ghost mapClearSearchBtn" data-map-clear-search>清空搜尋</button>
      </div>
      <div class="mapLayout">
        <aside class="mapLeftPane">
        <section class="mapSide mapMonsterSide">
          <div class="mapSideHead">
            <h2>怪物</h2>
            <div><button type="button" class="ghost mapMiniBtn" data-map-all="monster">全選</button><button type="button" class="ghost mapMiniBtn" data-map-none="monster">全不選</button></div>
          </div>
          <div class="mapChoiceList">${markerList(stage, 'monster')}</div>
        </section>
        <section class="mapSide mapNpcSide">
          <div class="mapSideHead">
            <h2>NPC</h2>
            <div><button type="button" class="ghost mapMiniBtn" data-map-all="npc">全選</button><button type="button" class="ghost mapMiniBtn" data-map-none="npc">全不選</button></div>
          </div>
          <div class="mapChoiceList">${markerList(stage, 'npc')}</div>
        </section>
        </aside>
        <div class="mapCanvasWrap">
          <div class="mapZoomBar">
            <label>縮放
              <input id="mapZoomInput" type="range" min="0.5" max="2.25" step="0.05" value="${zoomValue()}">
            </label>
            <span>${Math.round(zoomValue() * 100)}%</span>
          </div>
          <div class="mapLoading" id="mapImageLoading">地圖載入中</div>
          <div class="mapZoomSurface" style="width:${Math.round((Number(stage.width)||1)*zoomValue())}px;height:${Math.round((Number(stage.height)||1)*zoomValue())}px;">
            <div class="mapImageStage" style="transform:scale(${zoomValue()});width:${Number(stage.width)||1}px;height:${Number(stage.height)||1}px;">
              <img id="mapImage" src="${htmlEscape(stage.image)}" alt="${htmlEscape(stage.stageName)}">
              <div class="mapOverlay">${markerDots(stage)}</div>
            </div>
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

  document.addEventListener('compositionstart', ev => {
    if(ev.target?.id === 'mapSearchInput') state.composing = true;
  });

  document.addEventListener('compositionend', ev => {
    if(ev.target?.id === 'mapSearchInput'){
      state.composing = false;
      state.query = ev.target.value || '';
      const stage = currentStage();
      if(stage) autoCheckMatches(stage);
      renderLoaded();
    }
  });

  document.addEventListener('input', ev => {
    if(ev.target?.id === 'mapSearchInput'){
      if(state.composing || ev.isComposing) return;
      state.query = ev.target.value || '';
      const stage = currentStage();
      if(stage) autoCheckMatches(stage);
      renderLoaded();
    }
    if(ev.target?.id === 'mapZoomInput'){
      state.zoom = Number(ev.target.value) || 1;
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
    const rows = (all || none) === 'monster' ? monsterGroups(stage) : (stage.npcs || []).map(n => Object.assign({ kind: 'npc' }, n));
    set.clear();
    if(all) rows.forEach(row => set.add(markerKey(row)));
    renderLoaded();
  });

  document.addEventListener('click', ev => {
    if(!ev.target?.closest?.('[data-map-clear-search]')) return;
    state.query = '';
    state.monsters.clear();
    state.npcs.clear();
    renderLoaded();
  });

  window.openMonsterMapLocations = async function(monsterId, monsterName){
    state.monsters.clear();
    state.npcs.clear();
    await ensureMapDataLoaded();
    const target = String(monsterId || '');
    let foundName = monsterName || '';
    const stage = (mapData.stages || []).find(s => (s.monsters || []).some(m => {
      const ok = String(m.id) === target;
      if(ok && !foundName) foundName = m.name || '';
      return ok;
    }));
    state.query = foundName || target;
    if(stage){
      state.stageId = Number(stage.stageId);
      state.monsters.add(target);
    }
    await renderStageMapPage();
  };

  window.ensureMapPageLoaded = async function(){ return true; };
  window.renderStageMapPage = renderStageMapPage;
})();
