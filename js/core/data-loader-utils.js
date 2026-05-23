// V220: data loading and parsing helpers.
function candidateUrls(name){const enc=encodeURIComponent(name).replace(/%2F/g,'/'); return ['./'+enc, RAW_BASE+enc]}
async function fetchTimeout(url,ms=12000){const ctrl=new AbortController();const t=setTimeout(()=>ctrl.abort(),ms);try{return await fetch(url,{cache:'no-store',signal:ctrl.signal})}finally{clearTimeout(t)}}
async function fetchFirst(names,label){
 const tried=[];
 for(const name of names){
  for(const url of candidateUrls(name)){
   try{
    loadLine(`讀取 ${esc(name)} ...`);
    const res=await fetchTimeout(url);
    tried.push(`${url} HTTP ${res.status}`);
    if(res.ok){
      const buf=await res.arrayBuffer();
      let text='';
      try{text=new TextDecoder('big5').decode(buf)}catch(e){}
      if(!text || text.includes('�')){try{text=new TextDecoder('utf-8').decode(buf)}catch(e){}}
      if(text&&text.trim()){loadLine(`成功：${esc(name)} (${Math.round(buf.byteLength/1024)} KB)`,'ok');return {name,text,tried}}
    }
   }catch(e){tried.push(`${url} ${e.name==='AbortError'?'逾時':(e.message||e)}`)}
  }
 }
 loadLine(`${esc(label)} 讀取失敗`,'bad');
 return {missing:true,tried};
}
function parseIni(text){
 const data=[];let cur=null;function push(){if(cur&&Object.keys(cur).length)data.push(cur);cur=null}
 for(const raw of String(text||'').replace(/^\ufeff/,'').split(/\r?\n/)){
  const line=String(raw||'').trim(); if(!line||line.startsWith('//')||line.startsWith(';'))continue;
  if(line.startsWith('[')&&line.endsWith(']')){push();cur={};continue}
  const p=line.indexOf('='); if(p<0)continue;
  const k=line.slice(0,p).trim(), v=line.slice(p+1).trim();
  if(/^ID$/i.test(k)&&cur&&(cur.ID!==undefined||cur.Id!==undefined||cur.id!==undefined))push();
  if(!cur)cur={}; cur[k]=v;
 }
 push(); return data.filter(x=>x&&(x.ID!==undefined||x.Name!==undefined));
}
function parseCSVLine(line){const out=[];let val='',q=false;for(let i=0;i<line.length;i++){const c=line[i],n=line[i+1];if(q){if(c==='"'&&n==='"'){val+='"';i++}else if(c==='"')q=false;else val+=c}else{if(c==='"')q=true;else if(c===','){out.push(val);val=''}else val+=c}}out.push(val);return out.map(x=>String(x||'').trim())}
function parseLocations(text){const map={};for(const raw of String(text||'').replace(/^\ufeff/,'').split(/\r?\n/)){const line=raw.trim();if(!line||line.startsWith('//'))continue;let p=line.includes(',')?parseCSVLine(line):line.split(/\t+/).map(x=>x.trim());p=p.filter(Boolean);if(p.length<2)continue;const n=p[0],loc=p.slice(1).join('、');if(!n||n==='怪物名稱'||n.toLowerCase()==='name')continue;if(map[n]&&!map[n].includes(loc))map[n]+='、'+loc;else map[n]=loc}return map}

