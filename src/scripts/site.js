/* Micro-interazioni (progressive enhancement). Zero dipendenze. */
(function () {
  'use strict';

  // Header: condensa allo scroll
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Menu hamburger (mobile)
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && header) {
    var setOpen = function (open) {
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    toggle.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!header.classList.contains('nav-open')); });
    if (nav) nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('click', function (e) { if (header.classList.contains('nav-open') && !e.target.closest('.site-header')) setOpen(false); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  // Cookie banner (solo cookie tecnici · ricorda la scelta)
  var cookie = document.getElementById('cookie');
  if (cookie) {
    var consented = false;
    try { consented = localStorage.getItem('aut-cookie-consent') === '1'; } catch (e) {}
    if (!consented) cookie.hidden = false;
    var ok = cookie.querySelector('.cookie__ok');
    if (ok) ok.addEventListener('click', function () {
      try { localStorage.setItem('aut-cookie-consent', '1'); } catch (e) {}
      cookie.hidden = true;
    });
  }

  // Modulo contatti (progressive enhancement: senza JS il modulo invia comunque e il Worker risponde con una pagina)
  var loadedAt = Date.now();
  document.querySelectorAll('form[data-contact-form]').forEach(function (form) {
    var status = form.querySelector('.form__status');
    var btn = form.querySelector('button[type="submit"]');
    var elapsed = form.querySelector('input[name="elapsed"]');
    var say = function (msg, kind) { if (status) { status.textContent = msg || ''; status.setAttribute('data-kind', kind); } };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); say(form.dataset.msgInvalid, 'error'); return; }
      if (elapsed) elapsed.value = String(Date.now() - loadedAt);
      if (btn) btn.disabled = true;
      say(form.dataset.msgSending, 'info');
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (d) {
          if (d.ok) { say(d.dryRun ? form.dataset.msgTest : form.dataset.msgOk, 'ok'); form.reset(); }
          else say(d.error === 'invalid' ? form.dataset.msgInvalid : form.dataset.msgError, 'error');
        })
        .catch(function () { say(form.dataset.msgError, 'error'); })
        .then(function () {
          if (btn) btn.disabled = false;
          if (window.turnstile) { try { window.turnstile.reset(); } catch (x) {} }
        });
    });
  });

  // Reveal allo scroll (rispetta prefers-reduced-motion)
  var reveals = document.querySelectorAll('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reveals.length) return;
  if (reduce || !('IntersectionObserver' in window)) { reveals.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(function (el) { io.observe(el); });
})();

/* Orlandi & Scapin: slider dell'hero e lightbox dei lavori (progressive enhancement). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-slider]').forEach(function (root) {
    var slides = root.querySelectorAll('.os-hero__slide');
    var dots = root.querySelectorAll('.os-hero__dot');
    if (slides.length < 2) return;
    var i = 0, timer;
    var show = function (n) {
      slides[i].classList.remove('is-active'); slides[i].setAttribute('aria-hidden', 'true');
      if (dots[i]) dots[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      var img = slides[i].querySelector('img'); if (img) img.loading = 'eager';
      slides[i].classList.add('is-active'); slides[i].removeAttribute('aria-hidden');
      if (dots[i]) dots[i].classList.add('is-active');
    };
    var start = function () { if (!reduce) { clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 5500); } };
    dots.forEach(function (d, n) { d.addEventListener('click', function () { show(n); start(); }); });
    root.addEventListener('mouseenter', function () { clearInterval(timer); });
    root.addEventListener('mouseleave', start);
    start();
  });

  // Galleria lavori: oltre data-initial foto, le altre si aprono con il pulsante (senza JS restano tutte visibili)
  document.querySelectorAll('[data-gallery][data-initial]').forEach(function (g) {
    var btn = g.parentNode.querySelector('[data-gallery-more]');
    if (!btn) return;
    var n = parseInt(g.getAttribute('data-initial'), 10) || 0;
    var extra = Array.prototype.slice.call(g.children, n);
    extra.forEach(function (li) { li.classList.add('is-extra'); });
    btn.hidden = false;
    btn.addEventListener('click', function () { extra.forEach(function (li) { li.classList.remove('is-extra'); }); btn.parentNode.removeChild(btn); });
  });

  var dlg = document.querySelector('.os-lightbox');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var allShots = function () { return Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]')).filter(function (b) { return b.offsetParent !== null; }); };
  var shots = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var big = dlg.querySelector('.os-lightbox__img'), cap = dlg.querySelector('.os-lightbox__caption'), cur = 0;
  var open = function (n) {
    shots = allShots();
    cur = (n + shots.length) % shots.length;
    var img = shots[cur].querySelector('img');
    var src = img.currentSrc || img.src;
    if (img.srcset) { var last = img.srcset.split(',').pop().trim().split(' ')[0]; if (last) src = last; }
    big.src = src; big.alt = img.alt; cap.textContent = img.alt;
    if (!dlg.open) dlg.showModal();
  };
  shots.forEach(function (b) { b.addEventListener('click', function () { open(allShots().indexOf(b)); }); });
  dlg.querySelector('.os-lightbox__close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.os-lightbox__nav--prev').addEventListener('click', function () { open(cur - 1); });
  dlg.querySelector('.os-lightbox__nav--next').addEventListener('click', function () { open(cur + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') open(cur - 1); if (e.key === 'ArrowRight') open(cur + 1); });
})();
