(function(){
 var _F=window.I18N_F||{},_N=window.I18N_N||{};for(var c in window.I18N){var f=_F[c]||{};for(var k in f)window.I18N[c][k]=f[k];f=_N[c]||{};for(var k in f)window.I18N[c][k]=f[k];}

 var L=window.I18N,F=window.I18N_F||{}, langs=window.I18N_LANGS, KEY='unl-lang';
 var map={nb:'no',nn:'no',da:'dk',zh:'cn',et:'et'};
 function detect(){
  try{var s=localStorage.getItem(KEY); if(s&&L[s]) return s;}catch(e){}
  var list=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||'en'];
  for(var i=0;i<list.length;i++){var c=String(list[i]).toLowerCase().split('-')[0]; c=map[c]||c; if(L[c]) return c;}
  return 'en';
 }
 var curCode='en';
 function syncTheme(){
  var light=document.documentElement.getAttribute('data-theme')==='light',d=L[curCode]||L.en,k=light?'theme_dark':'theme_light',t=d[k]||L.en[k]||'';
  var tb=document.getElementById('themeBtn');tb.setAttribute('aria-label',t);tb.title=t;
  var m=document.querySelector('meta[name=theme-color]');if(m)m.setAttribute('content',light?'#f4f6fc':'#0a0e27');
 }
 document.getElementById('themeBtn').addEventListener('click',function(){
  var light=document.documentElement.getAttribute('data-theme')!=='light';
  if(light)document.documentElement.setAttribute('data-theme','light');else document.documentElement.removeAttribute('data-theme');
  try{localStorage.setItem('unl-theme',light?'light':'dark');}catch(e){}
  syncTheme();
 });
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
  curCode=code;syncTheme();
  document.querySelectorAll('#langList li').forEach(function(li){li.setAttribute('aria-selected',li.dataset.code===code?'true':'false');});
  if(window.unlFitNav)window.unlFitNav();
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

// Header nav: links that do not fit go into the "More" menu instead of being cut off
// under the theme / language buttons (also gives the nav back on small screens).
(function(){
 var nav=document.querySelector('.bar nav'), wrap=document.getElementById('navMore'), btn=document.getElementById('moreBtn'), list=document.getElementById('moreList');
 if(!nav||!wrap)return;
 var links=Array.prototype.slice.call(nav.querySelectorAll('a'));
 function close(){list.hidden=true;btn.setAttribute('aria-expanded','false');}
 function fit(){
  links.forEach(function(a){nav.appendChild(a);});
  wrap.hidden=true; nav.style.display='';
  if(window.matchMedia('(max-width:960px)').matches){links.forEach(function(a){list.appendChild(a);});wrap.hidden=false;return;}
  wrap.hidden=false;
  var moved=[];
  while(nav.scrollWidth>nav.clientWidth+1&&nav.lastElementChild){var a=nav.lastElementChild;moved.unshift(a);nav.removeChild(a);}
  moved.forEach(function(a){list.appendChild(a);});
  wrap.hidden=moved.length===0;
  if(wrap.hidden)close();
 }
 window.unlFitNav=fit;
 btn.addEventListener('click',function(e){e.stopPropagation();var o=list.hidden;list.hidden=!o;btn.setAttribute('aria-expanded',o?'true':'false');if(o){var f=list.querySelector('a');if(f)f.focus();}});
 list.addEventListener('click',function(e){if(e.target.closest('a'))close();});
 document.addEventListener('click',function(e){if(!e.target.closest('#navMore'))close();});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!list.hidden){close();btn.focus();}});
 var t;window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(fit,80);});
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
 fit();
})();
