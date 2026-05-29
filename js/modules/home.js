export async function initHome({reader,state}){
 document.body.classList.add('isHomeView');
 reader.innerHTML='<section class="homeBlank" aria-label="首頁"><div class="homeSignatureText" aria-label="文昌 慕容淵"><span class="sigCol sigWenchang">文昌</span><span class="sigCol sigMurong">慕容淵</span><span class="sigSeal" aria-hidden="true">文</span></div></section>';
}
