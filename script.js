(function(){
  var t=document.getElementById('mobileToggle'),m=document.getElementById('navMenu');
  if(t&&m){t.addEventListener('click',function(){var o=m.classList.toggle('open');t.setAttribute('aria-expanded',o);
    t.querySelector('.hamburger-icon').style.display=o?'none':'block';t.querySelector('.close-icon').style.display=o?'block':'none';});}
  document.querySelectorAll('.phone-header-btn').forEach(function(b){b.addEventListener('click',function(){location.href='tel:'+b.dataset.phone;});});
  document.querySelectorAll('.faq-item').forEach(function(i){var q=i.querySelector('.faq-question');
    if(q)q.addEventListener('click',function(){i.classList.toggle('open');});});
  document.querySelectorAll('.share-copy').forEach(function(b){b.addEventListener('click',function(){
    if(navigator.clipboard)navigator.clipboard.writeText(location.href);});});
  document.querySelectorAll('.share-whatsapp').forEach(function(a){a.href='https://wa.me/?text='+encodeURIComponent(document.title+' '+location.href);});
  document.querySelectorAll('.share-facebook').forEach(function(a){a.href='https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(location.href);});
  document.querySelectorAll('.share-linkedin').forEach(function(a){a.href='https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(location.href);});
  document.querySelectorAll('.share-twitter').forEach(function(a){a.href='https://twitter.com/intent/tweet?url='+encodeURIComponent(location.href);});
  // Forms: sent by our own serverless endpoint (/api/contact) straight to the office mailbox. No third-party form service.
  document.querySelectorAll('form').forEach(function(f){
    var hp=document.createElement('input');hp.type='text';hp.name='website';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');
    // Visually hidden without any offset: a left:-9999px offset widens RTL pages to ~10,000px on mobile.
    hp.style.cssText='position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;opacity:0;pointer-events:none';f.appendChild(hp);
    var msg=document.createElement('div');msg.className='form-status';msg.setAttribute('role','status');msg.style.cssText='margin-top:12px;font-weight:600';f.appendChild(msg);
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=f.querySelector('button[type=submit],input[type=submit],button:not([type])'),old=btn?btn.textContent:'';
      if(btn){btn.disabled=true;btn.textContent='שולח...';}
      msg.textContent='';
      var data={};new FormData(f).forEach(function(v,k){data[k]=v;});
      data.page=location.pathname;
      fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){return r.json().catch(function(){return{};}).then(function(j){if(!r.ok||!j.ok)throw new Error(j.error||'send failed');});})
        .then(function(){
          if(typeof window.gtag==='function'){window.gtag('event','generate_lead',{form_page:location.pathname});}
          (window.dataLayer=window.dataLayer||[]).push({event:'form_submit_success',form_page:location.pathname});
          location.href='/thank-you';})
        .catch(function(){
          if(btn){btn.disabled=false;btn.textContent=old;}
          msg.style.color='#b42318';
          msg.textContent='אירעה שגיאה בשליחה. אפשר להתקשר 054-4544546 או לכתוב ל-Avibd@bendavidlaw.co.il';});
    });
  });
})();

/* ===== Cookie consent banner (same behaviour/text/storage key as the original site) ===== */
(function(){
  var KEY='bdl_cookie_consent';
  function upd(v){if(typeof window.gtag==='function')window.gtag('consent','update',{ad_storage:v,analytics_storage:v,ad_user_data:v,ad_personalization:v});}
  var s=null;try{s=localStorage.getItem(KEY);}catch(e){}
  if(s==='granted'){upd('granted');return;} if(s==='denied')return;
  function show(){
    if(document.getElementById('bdl-cc'))return;
    var a=document.createElement('div');a.id='bdl-cc';a.setAttribute('dir','rtl');a.setAttribute('role','region');a.setAttribute('aria-label','הסכמה לקובצי Cookie');
    a.innerHTML='<div class="cc-text">האתר עושה שימוש בקובצי Cookie לשיפור חוויית הגלישה, למדידה (Google Analytics) ולשיווק. אפשר לאשר או לדחות. פרטים ב<a href="/privacy">מדיניות הפרטיות</a>.</div><div class="cc-actions"><button type="button" class="cc-accept">אישור</button><button type="button" class="cc-reject">דחייה</button></div>';
    document.body.appendChild(a);
    a.querySelector('.cc-accept').onclick=function(){try{localStorage.setItem(KEY,'granted');}catch(e){} upd('granted');a.remove();};
    a.querySelector('.cc-reject').onclick=function(){try{localStorage.setItem(KEY,'denied');}catch(e){} a.remove();};
  }
  if(document.body)show();else document.addEventListener('DOMContentLoaded',show);
})();

/* ===== Accessibility toolbar (Mickidum, same as the original; Alt+A toggles) ===== */
(function(){
  var SRC='https://cdn.jsdelivr.net/gh/mickidum/acc_toolbar/acctoolbar/acctoolbar.min.js',p=null;
  function load(){
    if(window.MicAccessTool)return Promise.resolve();
    if(p)return p;
    p=new Promise(function(res,rej){var s=document.createElement('script');s.src=SRC;s.async=true;s.onload=res;s.onerror=function(){p=null;rej();};document.head.appendChild(s);})
     .then(init).catch(function(){});
    return p;
  }
  function init(){
    if(window.__accInit||typeof window.MicAccessTool!=='function')return;window.__accInit=true;
    window.micAccessTool=new MicAccessTool({buttonPosition:'left',forceLang:'he-IL',
      icon:{position:{bottom:{size:50,units:'px'},left:{size:20,units:'px'},type:'fixed'},backgroundColor:'transparent',color:'transparent',img:'accessible',circular:false},
      menu:{dimensions:{width:{size:300,units:'px'},height:{size:'auto',units:'px'}}}});
  }
  document.addEventListener('keydown',function(e){
    if(e.altKey&&(e.code==='KeyA'||(e.key&&e.key.toLowerCase()==='a'))){e.preventDefault();
      load().then(function(){var b=document.getElementById('mic-access-tool-general-button');if(b)b.click();});}
  },true);
  var start=function(){load();};
  if('requestIdleCallback' in window)requestIdleCallback(start,{timeout:4000});else setTimeout(start,4000);
})();

/* ===== Mobile submenu toggles + navbar scroll state ===== */
(function(){
  var nav=document.querySelector('.navbar');
  if(nav){var f=function(){nav.classList.toggle('navbar-scrolled',window.pageYOffset>50);};window.addEventListener('scroll',f,{passive:true});f();}
  document.querySelectorAll('.nav-menu li').forEach(function(li){
    var sub=li.querySelector(':scope > .sub-menu'),a=li.querySelector(':scope > a');if(!sub||!a)return;
    var b=document.createElement('button');b.type='button';b.className='mobile-submenu-toggle';b.setAttribute('aria-label','פתח תת-תפריט');
    a.insertAdjacentElement('afterend',b);
    b.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();var o=sub.classList.toggle('mobile-expanded');b.classList.toggle('expanded',o);b.setAttribute('aria-expanded',o);});
  });
})();
