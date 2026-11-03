/* image lightbox: all screenshots, document order, wraps around */
(function(){
 var imgs=[].slice.call(document.querySelectorAll('.shot img, figure img'));
 if(!imgs.length) return;
 var D=function(){var L=window.I18N||{};return L[document.documentElement.lang==='nb'?'no':document.documentElement.lang==='da'?'dk':document.documentElement.lang==='zh-Hans'?'cn':document.documentElement.lang]||L.en||{};};
 var t=function(k){return D()[k]||(window.I18N&&window.I18N.en[k])||'';};
 var svg=function(p){return '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="'+p+'" fill="currentColor"/></svg>';};
 var root=document.createElement('div');
 root.className='lb';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-hidden','true');
 root.innerHTML='<span class="lb-count" aria-hidden="true"></span>'+
  '<button type="button" class="lb-btn lb-close">'+svg('M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6z')+'</button>'+
  '<button type="button" class="lb-btn lb-prev">'+svg('M15.4 6 14 4.6 6.6 12 14 19.4 15.4 18 9.4 12z')+'</button>'+
  '<button type="button" class="lb-btn lb-next">'+svg('M8.6 6 10 4.6 17.4 12 10 19.4 8.6 18l6-6z')+'</button>'+
  '<figure class="lb-fig"><img class="lb-img" alt=""><figcaption class="lb-cap" aria-live="polite"></figcaption></figure>';
 var body=document.body;
 body.appendChild(root);
 var $=function(s){return root.querySelector(s);};
 var im=$('.lb-img'),cap=$('.lb-cap'),cnt=$('.lb-count'),bc=$('.lb-close'),bp=$('.lb-prev'),bn=$('.lb-next');
 var cur=0,isOpen=false,from=null;
 function label(){
  bc.setAttribute('aria-label',t('lb_close'));bp.setAttribute('aria-label',t('lb_prev'));bn.setAttribute('aria-label',t('lb_next'));
  root.setAttribute('aria-label',t('lb_img').replace('{n}',cur+1).replace('{t}',imgs.length));
 }
 function show(i){
  cur=(i+imgs.length)%imgs.length;
  var s=imgs[cur],fc=s.closest('figure'),c=fc&&fc.querySelector('figcaption'),txt=(c&&c.textContent.trim())||s.alt||'';
  im.src=s.currentSrc||s.src;im.alt=s.alt||txt;cap.textContent=txt;cap.hidden=!txt;
  cnt.textContent=(cur+1)+' / '+imgs.length;label();
 }
 function open(i,el){
  from=el;show(i);isOpen=true;root.setAttribute('aria-hidden','false');root.classList.add('open');body.classList.add('lb-lock');bc.focus();
 }
 function close(){
  if(!isOpen) return;isOpen=false;root.classList.remove('open');root.setAttribute('aria-hidden','true');body.classList.remove('lb-lock');
  if(from) from.focus({preventScroll:true});
 }
 imgs.forEach(function(el,i){
  el.setAttribute('data-lb','');el.tabIndex=0;el.setAttribute('role','button');
  el.addEventListener('click',function(){open(i,el);});
  el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open(i,el);}});
 });
 bc.addEventListener('click',close);
 bp.addEventListener('click',function(){show(cur-1);});
 bn.addEventListener('click',function(){show(cur+1);});
 root.addEventListener('click',function(e){if(e.target===root||e.target===$('.lb-fig'))close();});
 document.addEventListener('keydown',function(e){
  if(!isOpen) return;
  if(e.key==='Escape'){e.preventDefault();close();}
  else if(e.key==='ArrowRight'){e.preventDefault();show(cur+1);}
  else if(e.key==='ArrowLeft'){e.preventDefault();show(cur-1);}
  else if(e.key==='Tab'){
   var f=[bc,bp,bn],k=f.indexOf(document.activeElement);
   e.preventDefault();
   if(e.shiftKey) f[(k<=0?f.length:k)-1].focus(); else f[(k+1)%f.length].focus();
  }
 });
 var x0=null,y0=0;
 root.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY;},{passive:true});
 root.addEventListener('touchend',function(e){
  if(x0===null) return;var dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=null;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.5) show(cur+(dx<0?1:-1));
 },{passive:true});
 var mo=new MutationObserver(function(){if(isOpen) label();});
 mo.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
