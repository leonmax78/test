// V212 script loader: 依序載入，避免資料/公式/patch 順序錯亂。
(function(){
  const list = window.SZO_SCRIPT_MANIFEST || [];
  const status = () => document.getElementById('topStatus');
  function setStatus(msg){ const el=status(); if(el) el.textContent=msg; }
  function loadOne(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src;
      s.async=false;
      s.onload=()=>resolve(src);
      s.onerror=()=>reject(new Error('載入失敗：'+src));
      document.body.appendChild(s);
    });
  }
  (async function(){
    try{
      for(let i=0;i<list.length;i++){
        setStatus('載入模組 '+(i+1)+'/'+list.length);
        await loadOne(list[i]);
      }
      setStatus('初始化中');
      if (typeof window.SZOAppInit === 'function') { window.SZOAppInit(); }
      setStatus('載入完成');
    }catch(err){
      console.error(err);
      setStatus('模組載入失敗');
      const reader=document.getElementById('reader');
      if(reader) reader.innerHTML='<div class="card"><h2>模組載入失敗</h2><p>'+String(err.message||err)+'</p></div>';
    }
  })();
})();
