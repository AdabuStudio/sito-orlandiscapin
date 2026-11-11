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
