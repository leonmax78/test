(function(){
  const DATA_URLS = {
    items: 'data/items.json',
    monsters: 'data/monsters.json',
    reverse: 'data/drop_reverse.json',
    locations: 'data/locations.json',
    shops: 'data/shop_all.json',
    maps: 'data/stage_maps.json'
  };
  const cache = {};
  const state = { query: '', mode: 'auto', exactItem: '' };

  function by(id){ return document.getElementById(id); }
  function html(value){
    if(typeof esc === 'function') return esc(value);
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function version(){
    return encodeURIComponent(document.body?.dataset?.version || window.SZO_BUILD_VERSION || 'dev');
  }
  async function json(name){
    if(cache[name]) return cache[name];
    const url = DATA_URLS[name];
    cache[name] = fetch(`${url}?v=${version()}`, { cache: 'force-cache' }).then(res => {
      if(!res.ok) throw new Error(`load ${url}`);
      return res.json();
    });
    return cache[name];
  }
  function norm(value){
    return String(value ?? '').toLowerCase().replace(/[\s\u3000"'「」『』【】\[\]（）()、，,。:：;；\-_/\\|]+/g, '');
  }
  function itemId(item){ return String(item?.ID ?? item?.id ?? item?.itemId ?? '').trim(); }
  function itemName(item){ return String(item?.Name ?? item?.name ?? '').trim(); }
  function monsterId(monster){ return String(monster?.ID ?? monster?.id ?? monster?.monsterId ?? '').trim(); }
  function monsterName(monster){ return String(monster?.Name ?? monster?.name ?? monster?.monsterName ?? '').trim(); }
  function monsterLevel(monster){ return String(monster?.Level ?? monster?.level ?? '').trim(); }
  function money(value){
    const n = Math.floor(Number(value));
    if(!Number.isFinite(n)) return '-';
    const yi = Math.floor(n / 100000000);
    const wan = Math.floor((n % 100000000) / 10000);
    const rest = n % 10000;
    if(yi) return `${yi}億${wan ? wan + '萬' : ''}${rest ? rest : ''}兩`;
    if(wan) return `${wan}萬${rest ? rest : ''}兩`;
    return `${n}兩`;
  }
  function rateText(rate){
    const n = Number(rate);
    return Number.isFinite(n) ? `${n.toFixed(6)}%` : '';
  }
  function assetBase(){
    return (window.SZO_ASSET_MANIFEST && window.SZO_ASSET_MANIFEST.base) || 'assets/test-media';
  }
  function itemIcon(item){
    const media = window.SZO_ASSET_MEDIA;
    if(media && typeof media.itemIconSrc === 'function'){
      const src = media.itemIconSrc({ ID:item.itemId || itemId(item), Icon:item.icon || item.Icon, Type:item.type || item.Type, Name:item.name || itemName(item) });
      if(src) return src;
    }
    const icon = String(item.icon || item.Icon || '').trim();
    return icon ? `${assetBase()}/item-icons/i${icon}.png?v=${version()}` : '';
  }
  function monsterIcon(monster){
    const media = window.SZO_ASSET_MEDIA;
    if(media && typeof media.monsterPortraitSrc === 'function'){
      const src = media.monsterPortraitSrc({ ID:monsterId(monster), Pic:monster.Pic || monster.pic, Name:monsterName(monster) });
      if(src) return src;
    }
    const pic = String(monster.Pic || monster.pic || '').trim();
    return pic ? `${assetBase()}/monster-portraits/m${pic}.png?v=${version()}` : '';
  }
  async function mapsByName(){
    const maps = await json('maps');
    const out = new Map();
    for(const stage of maps.stages || []){
      const name = String(stage.stageName || '').trim();
      if(name) out.set(norm(name), stage.stageName);
    }
    return out;
  }
  async function locationForMonster(name){
    const locations = await json('locations');
    return locations?.[name] || '';
  }
  function findByName(rows, getName, query, limit = 8){
    const q = norm(query);
    if(!q) return [];
    return rows.map((row, index) => {
      const name = getName(row);
      const n = norm(name);
      let score = 0;
      if(n === q) score = 1000;
      else if(n.startsWith(q)) score = 800;
      else if(n.includes(q)) score = 620;
      else if(q.includes(n) && n.length >= 2) score = 520;
      if(!score) return null;
      return { row, name, score: score - index / 100000 };
    }).filter(Boolean).sort((a,b) => b.score - a.score).slice(0, limit).map(x => x.row);
  }
  function intentOf(raw){
    const q = String(raw || '');
    if(/[買購售價價格商店販賣販售回收賣]/.test(q)) return 'shop';
    if(/[掉落掉誰掉哪裡掉出處反查]/.test(q)) return 'drop';
    if(/[在哪哪裡位置地圖出現座標]/.test(q)) return 'location';
    return 'auto';
  }
  function resultLoading(){
    const target = by('qaResults');
    if(target) target.innerHTML = '<div class="qaLoading">資料讀取中...</div>';
  }
  function quickExamples(){
    const examples = ['大山犬在哪', '短劍哪裡掉', '天鐵哪裡買', '老虎皮哪裡賣', '神效靈藥配方錦囊掉落'];
    return `<div class="qaExamples">${examples.map(x => `<button type="button" data-qa-example="${html(x)}">${html(x)}</button>`).join('')}</div>`;
  }
  function renderQaPage(){
    const reader = by('reader');
    if(!reader) return;
    window.v86LastView = 'qa';
    reader.innerHTML = `<section class="card qaPage">
      <h1>文字問答</h1>
      <p class="muted">測試版先用網站資料回答，適合問怪物位置、道具掉落、商店買賣、地圖跳轉。</p>
      <form id="qaForm" class="qaForm">
        <input id="qaInput" value="${html(state.query)}" placeholder="例如：大山犬在哪、短劍哪裡掉、天鐵哪裡買">
        <button type="submit" class="primary">詢問</button>
        <button type="button" class="ghost" id="qaClear">清空</button>
      </form>
      ${quickExamples()}
      <div id="qaResults" class="qaResults">${state.query ? '' : '<div class="empty">輸入問題後按「詢問」，我會從目前網站資料裡找答案。</div>'}</div>
    </section>`;
    const input = by('qaInput');
    if(input) input.focus();
  }
  function chip(label, attrs = ''){
    return `<button type="button" class="qaChip" ${attrs}>${html(label)}</button>`;
  }
  function mapChip(mapName, query){
    return chip(`${mapName} 地圖`, `data-qa-map="${html(mapName)}" data-qa-map-query="${html(query || '')}"`);
  }
  function monsterChip(monster){
    const id = monsterId(monster);
    return chip(`查看 ${monsterName(monster)}`, `data-qa-monster="${html(id)}"`);
  }
  function itemChip(item){
    const id = itemId(item);
    return chip(`${itemName(item)}`, `data-qa-reverse="${html(id)}"`);
  }
  function suggestionBlock(title, rows, getLabel, attrName){
    if(!rows.length) return '';
    return `<div class="qaSuggestions"><span>${html(title)}</span>${rows.map(row => chip(getLabel(row), `data-${attrName}="${html(getLabel(row))}"`)).join('')}</div>`;
  }
  async function answerLocation(query){
    const monsters = await json('monsters');
    const matches = findByName(monsters, monsterName, query, 6);
    if(!matches.length) return null;
    const primary = matches[0];
    const loc = await locationForMonster(monsterName(primary));
    const locs = String(loc || '').split(/[、,]/).map(x => x.trim()).filter(Boolean);
    return `<div class="qaAnswer">
      <h2>${html(monsterName(primary))} 的位置</h2>
      <div class="qaAnswerMeta">Lv.${html(monsterLevel(primary) || '-')} / ID ${html(monsterId(primary))}</div>
      ${locs.length ? `<div class="qaMapChips">${locs.map(name => mapChip(name, monsterName(primary))).join('')}</div>` : '<div class="empty">目前沒有位置資料。</div>'}
      <div class="qaActions">${monsterChip(primary)}</div>
      ${matches.length > 1 ? suggestionBlock('也可能是：', matches.slice(1), monsterName, 'qa-monster-suggest') : ''}
    </div>`;
  }
  async function answerDrop(query){
    const items = await json('items');
    const reverse = await json('reverse');
    const monsters = await json('monsters');
    const byId = new Map(monsters.map(m => [monsterId(m), m]));
    const matches = findByName(items, itemName, query, 8);
    if(!matches.length) return null;
    const item = matches[0];
    const id = itemId(item);
    const rows = Array.isArray(reverse[id]) ? reverse[id].slice(0, 12) : [];
    const img = itemIcon(item);
    return `<div class="qaAnswer">
      <div class="qaTitleWithIcon">${img ? `<img src="${html(img)}" alt="">` : ''}<div><h2>${html(itemName(item))} 掉落</h2><div class="qaAnswerMeta">ID ${html(id)} / 共 ${rows.length} 筆${rows.length >= 12 ? '（先顯示前 12 筆）' : ''}</div></div></div>
      ${matches.length > 1 ? suggestionBlock('你是不是想找：', matches, itemName, 'qa-item-suggest') : ''}
      ${rows.length ? `<div class="qaList">${await Promise.all(rows.map(async drop => {
        const monster = byId.get(String(drop.monsterId)) || { ID:drop.monsterId, Name:drop.monsterName };
        const loc = await locationForMonster(monsterName(monster));
        const locs = String(loc || '').split(/[、,]/).map(x => x.trim()).filter(Boolean);
        return `<div class="qaRow">
          <strong>${html(monsterName(monster))}</strong>
          <span>${locs.length ? locs.slice(0,3).map(x => html(x)).join('、') : '沒有位置資料'}</span>
          <b>${html(rateText(drop.rate))}</b>
          <div class="qaRowActions">${locs.slice(0,2).map(x => mapChip(x, monsterName(monster))).join('')}${monsterChip(monster)}</div>
        </div>`;
      })).then(x => x.join(''))}</div>` : '<div class="empty">目前沒有掉落資料。</div>'}
    </div>`;
  }
  async function shopLocations(){
    const [shopData, maps] = await Promise.all([json('shops'), json('maps')]);
    const shops = new Map((shopData.shops || []).map(shop => [String(shop.shopId), shop]));
    const rows = [];
    for(const stage of maps.stages || []){
      for(const npc of stage.npcs || []){
        const shopId = String(npc.shop || '').trim();
        if(!shopId || !shops.has(shopId)) continue;
        rows.push({
          stageId: Number(stage.stageId),
          stageName: stage.stageName || '',
          npcName: npc.name || '',
          npcId: String(npc.id || ''),
          shopId,
          shop: shops.get(shopId)
        });
      }
    }
    return rows.sort((a,b) => a.stageId - b.stageId || a.npcName.localeCompare(b.npcName, 'zh-Hant') || Number(a.shopId) - Number(b.shopId));
  }
  async function answerShop(query, forcedMode){
    const raw = String(query || '');
    const mode = forcedMode || (/[回收賣]/.test(raw) ? 'buy' : 'sell');
    const locs = await shopLocations();
    const itemRows = [];
    for(const loc of locs){
      for(const item of loc.shop?.items || []){
        const priceValue = mode === 'buy' ? item.buyPrice : item.sellPrice;
        if(priceValue === undefined || priceValue === null || priceValue === '') continue;
        const q = norm(state.exactItem || raw);
        if(!q) continue;
        if(state.exactItem){
          if(String(item.name || '').trim() !== state.exactItem) continue;
        }else{
          const hay = norm([item.name, loc.stageName, loc.npcName].join(' '));
          if(!hay.includes(q)) continue;
        }
        itemRows.push({ loc, item, priceValue:Number(priceValue) });
      }
    }
    const suggestions = [];
    if(!state.exactItem && raw.trim()){
      const seen = new Set();
      for(const loc of locs){
        for(const item of loc.shop?.items || []){
          const name = String(item.name || '').trim();
          if(!name || seen.has(name) || !norm(name).includes(norm(raw))) continue;
          seen.add(name);
          suggestions.push(name);
          if(suggestions.length >= 10) break;
        }
        if(suggestions.length >= 10) break;
      }
    }
    itemRows.sort((a,b) => mode === 'buy' ? b.priceValue - a.priceValue : a.priceValue - b.priceValue);
    return `<div class="qaAnswer">
      <h2>${mode === 'buy' ? '回收' : '販售'}查詢</h2>
      ${suggestions.length ? `<div class="qaSuggestions"><span>你是不是想找：</span>${suggestions.map(name => chip(name, `data-qa-shop-item="${html(name)}"`)).join('')}</div>` : ''}
      <div class="qaModeHint">${mode === 'buy' ? '回收依高價優先。' : '販售依低價優先。'}</div>
      ${itemRows.length ? `<div class="qaList">${itemRows.slice(0, 16).map(row => {
        const img = itemIcon(row.item);
        return `<div class="qaRow qaShopRow">
          <strong>${html(row.loc.stageName)} / ${html(row.loc.npcName)}</strong>
          <span>${img ? `<img src="${html(img)}" alt="">` : ''}${html(row.item.name)}</span>
          <b>${html(money(row.priceValue))}</b>
          <div class="qaRowActions">${mapChip(row.loc.stageName, row.loc.npcName)}</div>
        </div>`;
      }).join('')}</div>` : '<div class="empty">找不到符合的商店資料。</div>'}
    </div>`;
  }
  async function answerAuto(query){
    const intent = intentOf(query);
    if(intent === 'shop') return answerShop(query);
    if(intent === 'drop') return answerDrop(query);
    if(intent === 'location') return answerLocation(query);
    const [items, monsters] = await Promise.all([json('items'), json('monsters')]);
    const itemMatches = findByName(items, itemName, query, 6);
    const monsterMatches = findByName(monsters, monsterName, query, 6);
    if(itemMatches.length || monsterMatches.length){
      return `<div class="qaAnswer">
        <h2>我找到幾個可能的項目</h2>
        ${itemMatches.length ? `<div class="qaSuggestions"><span>道具：</span>${itemMatches.map(item => chip(itemName(item), `data-qa-item-suggest="${html(itemName(item))}"`)).join('')}</div>` : ''}
        ${monsterMatches.length ? `<div class="qaSuggestions"><span>怪物：</span>${monsterMatches.map(monster => chip(monsterName(monster), `data-qa-monster-suggest="${html(monsterName(monster))}"`)).join('')}</div>` : ''}
        <div class="qaModeHint">可以接著問「哪裡掉」、「在哪」、「哪裡買」。</div>
      </div>`;
    }
    return '<div class="empty">目前找不到符合的資料，可以換完整名稱或加上「哪裡掉 / 哪裡買 / 在哪」。</div>';
  }
  async function runQuestion(query){
    state.query = String(query || '').trim();
    state.exactItem = '';
    if(!state.query){
      const target = by('qaResults');
      if(target) target.innerHTML = '<div class="empty">請先輸入問題。</div>';
      return;
    }
    resultLoading();
    try{
      const htmlText = await answerAuto(state.query);
      const target = by('qaResults');
      if(target) target.innerHTML = htmlText || '<div class="empty">目前找不到符合的資料。</div>';
    }catch(err){
      console.error(err);
      const target = by('qaResults');
      if(target) target.innerHTML = '<div class="empty">資料讀取失敗，請重新整理後再試一次。</div>';
    }
  }

  document.addEventListener('submit', ev => {
    if(ev.target?.id !== 'qaForm') return;
    ev.preventDefault();
    runQuestion(by('qaInput')?.value || '');
  });
  document.addEventListener('click', async ev => {
    const ex = ev.target.closest?.('[data-qa-example]');
    if(ex){ const q = ex.dataset.qaExample || ''; const input = by('qaInput'); if(input) input.value = q; runQuestion(q); return; }
    if(ev.target?.id === 'qaClear'){ state.query = ''; state.exactItem = ''; renderQaPage(); return; }
    const itemSuggest = ev.target.closest?.('[data-qa-item-suggest]');
    if(itemSuggest){ const q = itemSuggest.dataset.qaItemSuggest || ''; const input = by('qaInput'); if(input) input.value = `${q} 哪裡掉`; runQuestion(`${q} 哪裡掉`); return; }
    const shopItem = ev.target.closest?.('[data-qa-shop-item]');
    if(shopItem){ state.exactItem = shopItem.dataset.qaShopItem || ''; const target = by('qaResults'); if(target){ resultLoading(); target.innerHTML = await answerShop(state.exactItem); } return; }
    const monsterSuggest = ev.target.closest?.('[data-qa-monster-suggest]');
    if(monsterSuggest){ const q = monsterSuggest.dataset.qaMonsterSuggest || ''; const input = by('qaInput'); if(input) input.value = `${q} 在哪`; runQuestion(`${q} 在哪`); return; }
    const map = ev.target.closest?.('[data-qa-map]');
    if(map){
      const mapName = map.dataset.qaMap || '';
      const queryName = map.dataset.qaMapQuery || '';
      if(typeof window.openMapSearchLocation !== 'function' && typeof window.ensureMapPageLoaded === 'function') await window.ensureMapPageLoaded();
      if(typeof window.openMapSearchLocation === 'function') await window.openMapSearchLocation(mapName, queryName);
      return;
    }
    const monster = ev.target.closest?.('[data-qa-monster]');
    if(monster){
      if(typeof window.ensureMonsterPageLoaded === 'function') await window.ensureMonsterPageLoaded();
      if(typeof window.showMonster === 'function') window.showMonster(monster.dataset.qaMonster);
      return;
    }
    const rev = ev.target.closest?.('[data-qa-reverse]');
    if(rev){
      if(typeof window.ensureItemPageLoaded === 'function') await window.ensureItemPageLoaded();
      if(typeof window.showReverse === 'function') window.showReverse(rev.dataset.qaReverse, 'qa');
    }
  });

  window.renderQaPage = renderQaPage;
})();
