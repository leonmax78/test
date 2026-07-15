// Full shop lookup page: SHOP.INI + NPC map placements.
(function(){
  const SHOP_DATA_URL = 'data/shop_all.json';
  const MAP_DATA_URL = 'data/stage_maps.json';
  const state = {
    data: null,
    maps: null,
    activeKey: '',
    mode: 'sell',
    query: '',
    loading: null
  };

  function by(id){ return document.getElementById(id); }
  function escHtml(value){
    if(typeof esc === 'function') return esc(value);
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function price(value){
    if(value === null || value === undefined || value === '') return '-';
    const n = Number(value);
    if(!Number.isFinite(n)) return escHtml(value);
    return n.toLocaleString('zh-TW');
  }
  function nameOfSafe(row){
    try{ return typeof nameOf === 'function' ? nameOf(row) : String(row?.Name || row?.name || '').trim(); }
    catch(e){ return String(row?.Name || row?.name || '').trim(); }
  }
  function syncData(){
    try{ if(typeof window.SZO_SYNC_DATA === 'function') window.SZO_SYNC_DATA(); }catch(e){}
    return window.SZO_DATA || {};
  }
  function getItemIndex(){
    const d = syncData();
    if(d.itemIndex && Object.keys(d.itemIndex).length) return d.itemIndex;
    try{ if(itemIndex && Object.keys(itemIndex).length) return itemIndex; }catch(e){}
    return window.itemIndex || {};
  }
  async function fetchJson(url){
    const res = await fetch(url + '?v=' + encodeURIComponent(document.body?.dataset?.version || 'dev'), { cache: 'no-store' });
    if(!res.ok) throw new Error(url + ' load failed');
    return res.json();
  }
  async function loadShopData(){
    if(state.data && state.maps) return;
    if(state.loading) return state.loading;
    state.loading = Promise.all([fetchJson(SHOP_DATA_URL), fetchJson(MAP_DATA_URL)]).then(([data, maps]) => {
      state.data = data || { shops: [] };
      state.maps = maps || { stages: [] };
      const first = shopLocations()[0];
      if(first && !state.activeKey) state.activeKey = first.key;
    });
    return state.loading;
  }
  function shopById(){
    return new Map((state.data?.shops || []).map(shop => [String(shop.shopId), shop]));
  }
  function shopLocations(){
    const shops = shopById();
    const rows = [];
    for(const stage of state.maps?.stages || []){
      for(const npc of stage.npcs || []){
        const shopId = String(npc.shop || '').trim();
        if(!shopId || !shops.has(shopId)) continue;
        rows.push({
          key: `${stage.stageId}:${npc.id}:${npc.coordX ?? npc.x}:${npc.coordY ?? npc.y}:${shopId}`,
          stageId: Number(stage.stageId),
          stageName: stage.stageName || '',
          npcId: String(npc.id || ''),
          npcName: npc.name || '',
          shopId,
          x: npc.coordX ?? npc.x ?? '',
          y: npc.coordY ?? npc.y ?? '',
          rawX: npc.x ?? '',
          rawY: npc.y ?? '',
          shop: shops.get(shopId)
        });
      }
    }
    return rows.sort((a,b) => a.stageId - b.stageId || a.npcName.localeCompare(b.npcName, 'zh-Hant') || Number(a.shopId) - Number(b.shopId));
  }
  function activeLocation(){
    const rows = shopLocations();
    return rows.find(row => row.key === state.activeKey) || rows[0] || null;
  }
  function itemSearchText(item, loc){
    return [item.itemId, item.name, item.type, item.sellPrice, item.buyPrice, loc.stageName, loc.npcName, loc.shopId].join(' ').toLowerCase();
  }
  function itemHasMode(item, mode){
    return mode === 'sell' ? item.sellPrice !== null && item.sellPrice !== undefined : item.buyPrice !== null && item.buyPrice !== undefined;
  }
  function modePrice(item){
    return state.mode === 'sell' ? item.sellPrice : item.buyPrice;
  }
  function filteredItems(loc){
    if(!loc?.shop) return [];
    const q = state.query.trim().toLowerCase();
    return (loc.shop.items || [])
      .filter(item => itemHasMode(item, state.mode))
      .filter(item => !q || itemSearchText(item, loc).includes(q))
      .sort((a,b) => {
        const pa = Number(modePrice(a));
        const pb = Number(modePrice(b));
        const ap = Number.isFinite(pa) ? pa : Number.MAX_SAFE_INTEGER;
        const bp = Number.isFinite(pb) ? pb : Number.MAX_SAFE_INTEGER;
        return ap - bp || Number(a.itemId) - Number(b.itemId);
      });
  }
  function searchedLocations(){
    const q = state.query.trim().toLowerCase();
    const rows = shopLocations();
    if(!q) return rows;
    return rows.map(loc => {
      const items = filteredItems(loc);
      const direct = [loc.stageName, loc.npcName, loc.shopId, loc.npcId].join(' ').toLowerCase().includes(q);
      return Object.assign({}, loc, { matchCount: items.length, bestPrice: items.length ? Number(modePrice(items[0])) : Number.MAX_SAFE_INTEGER, direct });
    }).filter(loc => loc.matchCount || loc.direct).sort((a,b) => {
      return (a.bestPrice || Number.MAX_SAFE_INTEGER) - (b.bestPrice || Number.MAX_SAFE_INTEGER)
        || b.matchCount - a.matchCount
        || a.stageId - b.stageId
        || a.npcName.localeCompare(b.npcName, 'zh-Hant');
    });
  }
  function itemThumb(item){
    const src = window.SZO_ASSET_MEDIA && window.SZO_ASSET_MEDIA.itemIconSrc({
      Icon: item.icon,
      Type: item.type,
      ID: item.itemId,
      Name: item.name
    });
    return src ? `<span class="shopItemThumb"><img src="${escHtml(src)}" alt="" loading="lazy" decoding="async"></span>` : '<span class="shopItemThumb emptyThumb"></span>';
  }
  function locationTitle(loc){
    return `${loc.stageName} / ${loc.npcName}`;
  }
  function locationSub(loc){
    return `Shop ${loc.shopId} / NPC ${loc.npcId} / (${loc.x}, ${loc.y})`;
  }
  function shopNav(){
    const rows = searchedLocations();
    if(!rows.some(row => row.key === state.activeKey) && rows[0]) state.activeKey = rows[0].key;
    return `<aside class="shopSideNav">
      <div class="shopSideTitle">地圖商店</div>
      ${rows.map(loc => {
        const active = loc.key === state.activeKey;
        const count = state.query.trim() ? (loc.matchCount || 0) : (loc.shop?.items || []).filter(item => itemHasMode(item, state.mode)).length;
        return `<button type="button" class="shopSideBtn ${active ? 'active' : ''}" data-shop-loc="${escHtml(loc.key)}">
          <span>${escHtml(locationTitle(loc))}</span>
          <small>${escHtml(locationSub(loc))} / ${count} 筆</small>
        </button>`;
      }).join('') || '<div class="empty shopEmptySide">找不到符合的商店。</div>'}
    </aside>`;
  }
  function shopRows(loc, items){
    if(!items.length) return '<div class="empty">這個商店沒有符合條件的商品。</div>';
    return `<div class="shopItemList">
      ${items.map(item => `<button type="button" class="shopItemCard" data-shop-item="${escHtml(item.itemId)}" data-shop-name="${escHtml(item.name)}">
        ${itemThumb(item)}
        <span class="shopItemText">
          <strong>${escHtml(item.name)}</strong>
          <small>ID ${escHtml(item.itemId)} / ${escHtml(item.type || '')}</small>
        </span>
        <span class="shopItemPrice">${price(modePrice(item))}</span>
      </button>`).join('')}
    </div>`;
  }
  function renderLoaded(){
    const loc = activeLocation();
    const reader = by('reader');
    if(!reader) return;
    const items = loc ? filteredItems(loc) : [];
    reader.innerHTML = `<section class="card shopPage">
      <div class="shopHeader">
        <div>
          <h1>商店販賣資訊</h1>
          <div class="muted">依 NPC 地圖位置整理，可從商店跳地圖，也可從地圖點商店。</div>
        </div>
        <div class="shopCount">${shopLocations().length} 個地圖商店</div>
      </div>
      <div class="shopTools">
        <input id="shopSearch" value="${escHtml(state.query)}" placeholder="搜尋商品 / 商店 / 地圖，例如：虎皮、京城、打鐵店長">
        <div class="shopModeTabs">
          <button type="button" class="${state.mode === 'sell' ? 'active' : ''}" data-shop-mode="sell">販賣</button>
          <button type="button" class="${state.mode === 'buy' ? 'active' : ''}" data-shop-mode="buy">回收</button>
        </div>
      </div>
      <div class="shopLayout">
        ${shopNav()}
        <div class="shopMainPane">
          ${loc ? `<div class="shopBlock">
            <div class="shopBlockHead">
              <div>
                <h2>${escHtml(locationTitle(loc))}</h2>
                <div class="muted">${escHtml(locationSub(loc))}</div>
              </div>
              <button type="button" class="ghost shopMapBtn" data-shop-map="${escHtml(loc.key)}">地圖位置</button>
            </div>
            ${shopRows(loc, items)}
          </div>` : '<div class="empty">沒有商店資料。</div>'}
        </div>
      </div>
    </section>`;
    const input = by('shopSearch');
    if(input) input.focus({ preventScroll: true });
  }
  async function renderShopPage(){
    window.v86LastView = 'shop';
    const reader = by('reader');
    if(reader) reader.innerHTML = '<section class="card shopPage"><h1>商店販賣資訊</h1><div class="muted">資料載入中...</div></section>';
    try{
      await loadShopData();
      renderLoaded();
    }catch(err){
      if(reader) reader.innerHTML = '<section class="card shopPage"><h1>商店販賣資訊</h1><div class="empty">商店資料載入失敗，請重新整理一次。</div></section>';
    }
    try{ if(typeof closeDrawer === 'function') closeDrawer(); }catch(e){}
    try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){}
  }
  function detailRows(it){
    if(!it) return [];
    try{
      if(typeof itemDetailRows === 'function') return itemDetailRows(it).filter(x => x[1] !== '' && x[1] !== undefined && x[1] !== null && String(x[1]).trim() !== '0');
    }catch(e){}
    return Object.entries(it).filter(([,v]) => v !== '' && v !== undefined && v !== null && String(v).trim() !== '0');
  }
  async function showShopItem(id, fallbackName){
    window.v86LastView = 'shop';
    const itemId = String(id || '').trim();
    const reader = by('reader');
    if(reader) reader.innerHTML = '<section class="card itemCompact"><button class="backBtn" type="button" data-shop-back>← 返回商店</button><h1>資料載入中...</h1></section>';
    if(typeof window.ensureLookupDataLoaded === 'function') await window.ensureLookupDataLoaded();
    const it = getItemIndex()[itemId];
    const title = it ? nameOfSafe(it) : (fallbackName || ('ID ' + itemId));
    const kv = detailRows(it).map(([k,v]) => {
      const cls = String(v).length > 34 ? ' itemFullRow' : '';
      return `<div class="kv${cls}"><div class="k">${escHtml(k)}</div><div class="v">${escHtml(v)}</div></div>`;
    }).join('');
    if(reader){
      reader.innerHTML = `<section class="card itemCompact shopItemDetail">
        <button class="backBtn" type="button" data-shop-back>← 返回商店</button>
        <h1>${escHtml(title)}</h1>
        <div class="muted">商店商品 ID ${escHtml(itemId)}</div>
        ${it ? `<div class="kvGrid">${kv}</div>` : '<div class="empty">ITEM 資料找不到。</div>'}
      </section>`;
    }
    try{ history.pushState({app:'detail',view:'shopItem'}, '', '#shop-item-' + encodeURIComponent(itemId)); }catch(e){}
    try{ window.scrollTo({top:0,behavior:'smooth'}); }catch(e){}
  }
  function locationByKey(key){
    return shopLocations().find(loc => loc.key === key) || null;
  }
  async function jumpToMap(key){
    const loc = locationByKey(key);
    if(!loc) return;
    if(typeof showPageLoading === 'function') showPageLoading('地圖查詢', '地圖載入中，請稍候。');
    if(typeof window.ensureMapPageLoaded === 'function') await window.ensureMapPageLoaded();
    if(typeof window.openShopMapLocation === 'function') await window.openShopMapLocation({
      stageId: loc.stageId,
      npcId: loc.npcId,
      npcName: loc.npcName,
      x: loc.rawX,
      y: loc.rawY,
      shopId: loc.shopId
    });
  }
  function openShopLocation(shopId, stageId, npcId, x, y){
    state.mode = 'sell';
    state.query = '';
    const loc = shopLocations().find(row =>
      String(row.shopId) === String(shopId)
      && Number(row.stageId) === Number(stageId)
      && String(row.npcId) === String(npcId)
      && String(row.rawX) === String(x)
      && String(row.rawY) === String(y)
    ) || shopLocations().find(row => String(row.shopId) === String(shopId));
    if(loc) state.activeKey = loc.key;
    renderShopPage();
  }

  document.addEventListener('click', function(ev){
    const mode = ev.target && ev.target.closest ? ev.target.closest('[data-shop-mode]') : null;
    if(mode){
      ev.preventDefault();
      state.mode = mode.dataset.shopMode || 'sell';
      renderLoaded();
      return;
    }
    const locBtn = ev.target && ev.target.closest ? ev.target.closest('[data-shop-loc]') : null;
    if(locBtn){
      ev.preventDefault();
      state.activeKey = locBtn.dataset.shopLoc || state.activeKey;
      renderLoaded();
      return;
    }
    const mapBtn = ev.target && ev.target.closest ? ev.target.closest('[data-shop-map]') : null;
    if(mapBtn){
      ev.preventDefault();
      jumpToMap(mapBtn.dataset.shopMap || '');
      return;
    }
    const shopItem = ev.target && ev.target.closest ? ev.target.closest('[data-shop-item]') : null;
    if(shopItem){
      ev.preventDefault();
      showShopItem(shopItem.dataset.shopItem, shopItem.dataset.shopName || '');
      return;
    }
    const back = ev.target && ev.target.closest ? ev.target.closest('[data-shop-back]') : null;
    if(back){
      ev.preventDefault();
      renderShopPage();
    }
  }, true);
  document.addEventListener('input', function(ev){
    if(ev.target && ev.target.id === 'shopSearch'){
      const pos = ev.target.selectionStart ?? ev.target.value.length;
      state.query = ev.target.value || '';
      renderLoaded();
      const input = by('shopSearch');
      if(input){
        input.focus({ preventScroll: true });
        try{ input.setSelectionRange(pos, pos); }catch(e){}
      }
    }
  }, true);

  window.renderShopPage = renderShopPage;
  window.showShopItem = showShopItem;
  window.openShopLocation = openShopLocation;
})();
