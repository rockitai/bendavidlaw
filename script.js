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
  // Forms: TODO connect to a real backend/endpoint (Formspree, Netlify Forms, own API...). Currently redirects to /thank-you.
  document.querySelectorAll('form').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();
    if(f.dataset.endpoint){fetch(f.dataset.endpoint,{method:'POST',body:new FormData(f)}).finally(function(){location.href='/thank-you';});}
    else{location.href='/thank-you';}});});
})();
