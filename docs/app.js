(function(){
 var _F=window.I18N_F||{};for(var c in window.I18N){var f=_F[c]||{};for(var k in f)window.I18N[c][k]=f[k];}

 var L=window.I18N,F=window.I18N_F||{}, langs=window.I18N_LANGS, KEY='unl-lang';
 var map={nb:'no',nn:'no',da:'dk',zh:'cn',et:'et'};
 function detect(){
  try{var s=localStorage.getItem(KEY); if(s&&L[s]) return s;}catch(e){}
  var list=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||'en'];
  for(var i=0;i<list.length;i++){var c=String(list[i]).toLowerCase().split('-')[0]; c=map[c]||c; if(L[c]) return c;}
  return 'en';
 }
 function apply(code){
  var d=L[code]||L.en;
  document.documentElement.lang={no:'nb',dk:'da',cn:'zh-Hans'}[code]||code;
  document.querySelectorAll('[data-i]').forEach(function(el){var k=el.getAttribute('data-i'); el.textContent=d[k]||L.en[k]||'';});
  document.querySelectorAll('[data-alt]').forEach(function(el){var k=el.getAttribute('data-alt'); el.alt=d[k]||L.en[k]||'';});
  document.querySelectorAll('[data-ia]').forEach(function(el){var k=el.getAttribute('data-ia');var t=d[k]||L.en[k]||'';el.setAttribute('aria-label',t);el.setAttribute('title',t);});
  document.querySelectorAll('[data-ph]').forEach(function(el){var k=el.getAttribute('data-ph');el.placeholder=d[k]||L.en[k]||'';el.setAttribute('aria-label',el.placeholder);});
  document.getElementById('langFlag').src='flags/'+code+'.png';
  document.getElementById('langCode').textContent=code.toUpperCase();
  document.getElementById('langBtn').setAttribute('aria-label',(d.langlabel||'Language'));
  document.querySelectorAll('#langList li').forEach(function(li){li.setAttribute('aria-selected',li.dataset.code===code?'true':'false');});
 }
 var btn=document.getElementById('langBtn'), list=document.getElementById('langList');
 langs.forEach(function(p){
  var li=document.createElement('li'); li.setAttribute('role','option'); li.tabIndex=-1; li.dataset.code=p[0];
  li.innerHTML='<img src="flags/'+p[0]+'.png" width="20" height="14" alt=""><span></span>'; li.lastChild.textContent=p[1];
  li.addEventListener('click',function(){choose(p[0]);});
  li.addEventListener('keydown',function(e){
   if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(p[0]);}
   else if(e.key==='ArrowDown'){e.preventDefault();(li.nextSibling||list.firstChild).focus();}
   else if(e.key==='ArrowUp'){e.preventDefault();(li.previousSibling||list.lastChild).focus();}
   else if(e.key==='Escape'){close();btn.focus();}
  });
  list.appendChild(li);
 });
 function open(){list.hidden=false;btn.setAttribute('aria-expanded','true');var s=list.querySelector('[aria-selected=true]')||list.firstChild;s.focus();}
 function close(){list.hidden=true;btn.setAttribute('aria-expanded','false');}
 function choose(c){try{localStorage.setItem(KEY,c);}catch(e){} apply(c); close(); btn.focus();}
 btn.addEventListener('click',function(){list.hidden?open():close();});
 document.addEventListener('click',function(e){if(!e.target.closest('.lang'))close();});

 var areas=[].slice.call(document.querySelectorAll('.area')),q=document.getElementById('q'),nr=document.getElementById('noRes');
 function filter(){var t=q.value.trim().toLowerCase(),n=0;areas.forEach(function(a){var m=!t||a.textContent.toLowerCase().indexOf(t)>-1;a.hidden=!m;if(m){n++;if(t)a.open=true;}});nr.hidden=n>0;}
 q.addEventListener('input',filter);
 document.getElementById('expAll').addEventListener('click',function(){areas.forEach(function(a){if(!a.hidden)a.open=true;});});
 document.getElementById('colAll').addEventListener('click',function(){areas.forEach(function(a){a.open=false;});});
 document.querySelectorAll('a[data-open]').forEach(function(a){a.addEventListener('click',function(){q.value='';filter();var d=document.getElementById(a.dataset.open);if(d)d.open=true;});});
 if(location.hash.indexOf('#f-')===0){var h=document.getElementById(location.hash.slice(1));if(h)h.open=true;}
 apply(detect());
})();

/* back to top */
(function(){
 var b=document.getElementById('toTop'); if(!b) return;
 var onScroll=function(){ b.hidden = window.scrollY < 700; };
 window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
 b.addEventListener('click', function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'});
 });
})();
