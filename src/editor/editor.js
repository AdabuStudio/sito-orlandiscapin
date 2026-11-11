/* Editor "mockup" SOLO staging. Non modifica il sito reale: sposta/ridimensiona/riscrive
   gli elementi a video (anche in gruppo, con guide di allineamento) e genera un PROMPT
   testuale con le modifiche. Il sito gira in un IFRAME (stage) per viste MOBILE/DESKTOP
   reali; il banner sta nella finestra esterna. */
(function () {
  'use strict';
  // Lo script esiste SOLO nelle build di staging (PUBLIC_STAGE=staging) e solo se la build ha
  // EDITOR_PASSWORD: il flag lo imposta Base.astro. Nessun default, nessuna password hardcoded.
  if (window.AUT_STAGE !== 'staging' || !window.AUT_EDITOR_PASSWORD) return;

  var IN_FRAME = window.self !== window.top;
  if (IN_FRAME) initFrame(); else initParent();

  function initParent() {
    var PASSWORD = window.AUT_EDITOR_PASSWORD; // ← da EDITOR_PASSWORD (variabile di build, solo staging)
    var frame = null, view = 'desktop';

    var css = ''
      + ':root{--aut-primary:var(--color-primary,#0d47a1);--aut-on-primary:var(--color-bg,#fff);--aut-accent:var(--color-accent,#76c442);--aut-text:var(--color-text,#102a43);--aut-bg:var(--color-bg,#fff);--aut-font:var(--font-body,Inter,system-ui,sans-serif);--aut-line:color-mix(in srgb,var(--aut-text) 14%,var(--aut-bg));--aut-backdrop:color-mix(in srgb,var(--aut-text) 12%,var(--aut-bg));--aut-shade:color-mix(in srgb,var(--aut-text) 60%,transparent)}'
      + '.aut-bar{position:static;width:100%;min-height:48px;z-index:100000;display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px;padding:8px 16px;background:var(--aut-primary);color:var(--aut-on-primary);font-family:var(--aut-font);font-size:14px}'
      + '.aut-bar.editing{position:fixed;top:0;left:0;right:0;flex-wrap:wrap;box-shadow:0 2px 14px var(--aut-shade)}'
      + '.aut-bar b{font-weight:700}.aut-bar .aut-sp{flex:1}.aut-hint{opacity:.85;font-size:12.5px}'
      + '.aut-btn{font:inherit;font-weight:700;border:0;border-radius:999px;padding:8px 16px;cursor:pointer;background:var(--aut-on-primary);color:var(--aut-primary);transition:filter .15s,transform .15s}'
      + '.aut-btn:hover{filter:brightness(.96);transform:translateY(-1px)}'
      + '.aut-btn--ghost{background:transparent;color:var(--aut-on-primary);border:1px solid color-mix(in srgb,var(--aut-on-primary) 55%,transparent)}'
      + '.aut-views{display:flex;border:1px solid color-mix(in srgb,var(--aut-on-primary) 45%,transparent);border-radius:999px;overflow:hidden}'
      + '.aut-viewbtn{font:inherit;font-size:12.5px;font-weight:700;border:0;padding:7px 14px;cursor:pointer;background:transparent;color:var(--aut-on-primary);text-transform:uppercase;letter-spacing:.04em}'
      + '.aut-viewbtn.on{background:var(--aut-on-primary);color:var(--aut-primary)}'
      + '.aut-backdrop{position:fixed;top:var(--aut-bar-h,48px);left:0;right:0;bottom:0;z-index:99990;background:var(--aut-backdrop);display:flex;justify-content:center;overflow:auto}'
      + '.aut-stage{border:0;background:var(--aut-bg);width:100%;height:100%;display:block}'
      + '.aut-backdrop.mobile{padding:16px 0;align-items:flex-start}'
      + '.aut-backdrop.mobile .aut-stage{width:390px;height:calc(100vh - var(--aut-bar-h,48px) - 32px);border-radius:22px;box-shadow:0 20px 50px var(--aut-shade);border:6px solid var(--aut-text)}'
      + '@media (max-width:768px){'
      + '  .aut-bar.editing .aut-hint{display:none}'
      + '  .aut-bar.editing b{font-size:12px;flex:0 0 auto}'
      + '  .aut-bar.editing .aut-sp{display:none}'
      + '  .aut-bar.editing .aut-btn{padding:7px 12px;font-size:12.5px}'
      + '  .aut-bar.editing .aut-viewbtn{padding:6px 11px;font-size:11.5px}'
      + '}'
      + '.aut-modal{position:fixed;inset:0;z-index:100002;background:var(--aut-shade);display:flex;align-items:center;justify-content:center;padding:20px}'
      + '.aut-card{background:var(--aut-bg);border-radius:14px;max-width:760px;width:100%;max-height:84vh;display:flex;flex-direction:column;overflow:hidden;font-family:var(--aut-font)}'
      + '.aut-card h3{margin:0;padding:18px 22px;background:var(--aut-primary);color:var(--aut-on-primary);font-size:16px}'
      + '.aut-card textarea{flex:1;min-height:320px;border:0;padding:18px 22px;font:13px/1.5 ui-monospace,Menlo,Consolas,monospace;resize:none;color:var(--aut-text);background:var(--aut-bg)}'
      + '.aut-card .aut-foot{display:flex;gap:10px;justify-content:flex-end;padding:14px 22px;border-top:1px solid var(--aut-line)}';
    addStyle(css);

    var bar = mk('div', 'aut-bar');
    bar.innerHTML = '<b>STAGING · Editor mockup</b><span class="aut-hint" id="authint">Solo anteprima — non modifica il sito reale</span><span class="aut-sp"></span>';
    var ctrls = mk('span'); ctrls.style.display = 'flex'; ctrls.style.gap = '10px'; ctrls.style.alignItems = 'center';
    bar.appendChild(ctrls);
    var footer = document.querySelector('.site-footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(bar, footer);
    else document.body.appendChild(bar);

    var primary = mk('button', 'aut-btn'); primary.textContent = 'ATTIVA MODIFICA';
    ctrls.appendChild(primary);
    primary.onclick = function () {
      var p = window.prompt('Password per attivare la modifica:');
      if (p == null) return;
      if (p !== PASSWORD) { alert('Password errata.'); return; }
      enter();
    };

    function enter() {
      bar.classList.add('editing');
      var backdrop = mk('div', 'aut-backdrop');
      frame = mk('iframe', 'aut-stage');
      frame.src = location.pathname + (location.search ? location.search : '') + location.hash;
      backdrop.appendChild(frame);
      document.body.appendChild(backdrop);
      document.body.style.overflow = 'hidden';

      ctrls.innerHTML = '';
      var views = mk('div', 'aut-views');
      var bD = mk('button', 'aut-viewbtn on'); bD.textContent = 'Desktop';
      var bM = mk('button', 'aut-viewbtn'); bM.textContent = 'Mobile';
      views.appendChild(bD); views.appendChild(bM);
      bD.onclick = function () { setView('desktop', backdrop, bD, bM); };
      bM.onclick = function () { setView('mobile', backdrop, bD, bM); };
      var gen = mk('button', 'aut-btn'); gen.textContent = 'GENERA PROMPT';
      gen.onclick = doGenerate;
      var exit = mk('button', 'aut-btn aut-btn--ghost'); exit.textContent = 'ESCI';
      exit.onclick = function () { location.reload(); };
      ctrls.appendChild(views); ctrls.appendChild(gen); ctrls.appendChild(exit);
      document.getElementById('authint').textContent = 'Click=seleziona · Maiusc+click=selezione multipla · trascina=sposta · doppio click=testo · −/+=dimensione';
      updateBarH();
      window.addEventListener('resize', updateBarH);
    }

    function updateBarH() { try { document.documentElement.style.setProperty('--aut-bar-h', bar.offsetHeight + 'px'); } catch (e) {} }

    function setView(v, backdrop, bD, bM) {
      view = v;
      backdrop.classList.toggle('mobile', v === 'mobile');
      bD.classList.toggle('on', v === 'desktop');
      bM.classList.toggle('on', v === 'mobile');
      updateBarH();
    }

    function doGenerate() {
      var text = 'Editor non pronto, riprova.';
      try { text = frame.contentWindow.AUT.generate(view); } catch (e) {}
      showModal(text);
    }

    function showModal(text) {
      var m = mk('div', 'aut-modal');
      var card = mk('div', 'aut-card');
      card.innerHTML = '<h3>Prompt da incollare in chat</h3>';
      var ta = document.createElement('textarea'); ta.value = text; ta.readOnly = true;
      var foot = mk('div', 'aut-foot');
      var copy = mk('button', 'aut-btn'); copy.textContent = 'Copia';
      copy.onclick = function () { ta.select(); try { navigator.clipboard.writeText(text); } catch (e) { document.execCommand('copy'); } copy.textContent = 'Copiato ✓'; };
      var close = mk('button', 'aut-btn aut-btn--ghost'); close.textContent = 'Chiudi';
      close.style.color = 'var(--aut-primary)'; close.style.borderColor = 'var(--aut-primary)';
      close.onclick = function () { m.remove(); };
      foot.appendChild(copy); foot.appendChild(close);
      card.appendChild(ta); card.appendChild(foot); m.appendChild(card);
      document.body.appendChild(m); ta.focus(); ta.select();
    }
  }

  function initFrame() {
    var EDITABLE = ['.site-header .brand__logo', '.site-header .nav__link', '#main h1', '#main h2', '#main h3', '#main p', '#main .btn', '#main img', '#main .card', '#main .sponsor-logo', '#main .cover__datechip', '.site-footer__logo', '.site-footer__navlink'].join(',');
    var SNAP = 6;
    var selected = [], tool = null, drag = null, touched = [];

    addStyle(''
      + ':root{--aut-primary:var(--color-primary,#0d47a1);--aut-on-primary:var(--color-bg,#fff);--aut-accent:var(--color-accent,#76c442);--aut-text:var(--color-text,#102a43);--aut-bg:var(--color-bg,#fff);--aut-font:var(--font-body,Inter,system-ui,sans-serif);--aut-line:color-mix(in srgb,var(--aut-text) 14%,var(--aut-bg));--aut-backdrop:color-mix(in srgb,var(--aut-text) 12%,var(--aut-bg));--aut-shade:color-mix(in srgb,var(--aut-text) 60%,transparent)}'
      + '[data-aut]{transition:none!important}'
      + 'body.aut-on [data-aut]{cursor:move}'
      + 'body.aut-on [data-aut]:hover{outline:2px dashed color-mix(in srgb,var(--aut-primary) 55%,transparent);outline-offset:2px}'
      + 'body.aut-on [data-aut].aut-sel{outline:2px solid var(--aut-primary);outline-offset:2px}'
      + '[data-aut][contenteditable="true"]{outline:2px solid var(--aut-accent)!important;cursor:text;background:color-mix(in srgb,var(--aut-accent) 8%,transparent)}'
      + '.aut-tool{position:absolute;z-index:2147483646;display:flex;gap:4px;background:var(--aut-primary);border-radius:8px;padding:4px;box-shadow:0 6px 20px var(--aut-shade);font-family:var(--aut-font)}'
      + '.aut-tool button{font:inherit;font-size:13px;font-weight:700;border:0;border-radius:6px;padding:5px 9px;cursor:pointer;background:var(--aut-on-primary);color:var(--aut-primary)}'
      + '.aut-tool button:hover{background:color-mix(in srgb,var(--aut-primary) 12%,var(--aut-on-primary))}'
      + '.aut-guide{position:absolute;z-index:2147483645;background:var(--aut-accent);pointer-events:none}'
      + '.aut-guide.v{width:1px;top:0}.aut-guide.h{height:1px;left:0}');
    document.body.classList.add('aut-on');
    tag();
    window.AUT = { generate: generate, setView: function () { deselect(); } };

    function tag() { var n = 0; document.querySelectorAll(EDITABLE).forEach(function (e) { if (!e.hasAttribute('data-aut')) e.setAttribute('data-aut', String(++n)); }); }

    function st(e) {
      if (!e.__a) {
        var cs = getComputedStyle(e);
        e.__a = { dx: 0, dy: 0, scale: 1, origText: null, newText: undefined, origFont: parseFloat(cs.fontSize) || null,
          origW: Math.round(e.getBoundingClientRect().width), origH: Math.round(e.getBoundingClientRect().height) };
        touched.push(e);
      }
      return e.__a;
    }
    function apply(e) { var s = e.__a; if (!s) return; e.style.transformOrigin = 'top left'; e.style.transform = 'translate(' + Math.round(s.dx) + 'px,' + Math.round(s.dy) + 'px) scale(' + s.scale.toFixed(2) + ')'; }

    function isSel(e) { return selected.indexOf(e) >= 0; }
    function selectSingle(e) { selected.forEach(function (x) { x.classList.remove('aut-sel'); }); selected = [e]; e.classList.add('aut-sel'); showTool(); }
    function toggleSel(e) { var i = selected.indexOf(e); if (i >= 0) { selected.splice(i, 1); e.classList.remove('aut-sel'); } else { selected.push(e); e.classList.add('aut-sel'); } showTool(); }
    function deselect() { selected.forEach(function (x) { x.classList.remove('aut-sel'); }); selected = []; if (tool) { tool.remove(); tool = null; } }

    function unionRect() {
      var L = 1e9, T = 1e9, R = -1e9, B = -1e9;
      selected.forEach(function (e) { var r = e.getBoundingClientRect(); L = Math.min(L, r.left); T = Math.min(T, r.top); R = Math.max(R, r.right); B = Math.max(B, r.bottom); });
      return { left: L + scrollX, top: T + scrollY, right: R + scrollX, bottom: B + scrollY };
    }
    function showTool() {
      if (tool) tool.remove();
      if (!selected.length) return;
      tool = mk('div', 'aut-tool');
      var multi = selected.length > 1;
      tool.innerHTML = '<button data-a="minus">−</button><button data-a="plus">+</button>'
        + (multi ? '' : '<button data-a="text">Testo</button>') + '<button data-a="reset">Reset</button>'
        + (multi ? '<span style="color:var(--aut-on-primary);font:12px var(--aut-font);align-self:center;padding:0 6px">' + selected.length + ' selez.</span>' : '');
      document.body.appendChild(tool);
      placeTool();
      tool.onclick = function (ev) {
        var a = ev.target.getAttribute('data-a'); if (!a) return;
        if (a === 'plus' || a === 'minus') { selected.forEach(function (e) { var s = st(e); s.scale = a === 'plus' ? Math.min(3, s.scale + 0.1) : Math.max(0.3, s.scale - 0.1); apply(e); }); }
        else if (a === 'reset') { selected.forEach(function (e) { var s = st(e); s.dx = s.dy = 0; s.scale = 1; if (s.origText != null) { e.textContent = s.origText; s.newText = undefined; } apply(e); }); }
        else if (a === 'text' && selected.length === 1) { startText(selected[0]); }
        placeTool();
      };
    }
    function placeTool() { if (!tool || !selected.length) return; var u = unionRect(); tool.style.top = (u.top - 42) + 'px'; tool.style.left = u.left + 'px'; }

    function startText(e) {
      var s = st(e); if (s.origText == null) s.origText = e.textContent;
      e.setAttribute('contenteditable', 'true'); e.focus();
      function done() { e.removeAttribute('contenteditable'); e.removeEventListener('blur', done); s.newText = e.textContent; }
      e.addEventListener('blur', done);
    }

    document.addEventListener('pointerdown', function (ev) {
      var e = ev.target.closest('[data-aut]');
      if (!e || e.getAttribute('contenteditable') === 'true' || ev.target.closest('.aut-tool')) return;
      drag = { e: e, x: ev.clientX, y: ev.clientY, shift: ev.shiftKey, wasSel: isSel(e), moved: false, items: null, targets: null };
    });
    document.addEventListener('pointermove', function (ev) {
      if (!drag) return;
      var ddx = ev.clientX - drag.x, ddy = ev.clientY - drag.y;
      if (!drag.moved && Math.abs(ddx) + Math.abs(ddy) < 4) return;
      if (!drag.moved) {
        drag.moved = true;
        if (!drag.wasSel) { if (drag.shift) toggleSel(drag.e); else selectSingle(drag.e); }
        drag.items = selected.map(function (e) { var s = st(e); return { e: e, dx0: s.dx, dy0: s.dy }; });
        drag.startRect = pageRect(drag.e);
        drag.targets = buildTargets();
      }
      var snapped = snap(ddx, ddy);
      drag.items.forEach(function (it) { var s = st(it.e); s.dx = it.dx0 + snapped.x; s.dy = it.dy0 + snapped.y; apply(it.e); });
      placeTool();
    });
    document.addEventListener('pointerup', function (ev) {
      if (drag) {
        if (!drag.moved) { if (drag.shift) toggleSel(drag.e); else selectSingle(drag.e); }
        else { clearGuides(); showTool(); }
      } else if (!ev.target.closest('[data-aut]') && !ev.target.closest('.aut-tool')) { deselect(); }
      drag = null;
    });
    document.addEventListener('dblclick', function (ev) { var e = ev.target.closest('[data-aut]'); if (!e) return; ev.preventDefault(); selectSingle(e); startText(e); });
    document.addEventListener('click', function (ev) { var e = ev.target.closest('[data-aut]'); if (e && e.getAttribute('contenteditable') !== 'true') { ev.preventDefault(); ev.stopPropagation(); } }, true);
    addEventListener('scroll', function () { placeTool(); }, { passive: true });

    function pageRect(e) { var r = e.getBoundingClientRect(); return { left: r.left + scrollX, top: r.top + scrollY, right: r.right + scrollX, w: r.width, h: r.height, cx: r.left + scrollX + r.width / 2, cy: r.top + scrollY + r.height / 2, bottom: r.bottom + scrollY }; }
    function buildTargets() {
      var xs = [], ys = [];
      document.querySelectorAll('[data-aut]').forEach(function (e) {
        if (isSel(e)) return;
        var r = pageRect(e);
        xs.push(r.left, r.cx, r.right); ys.push(r.top, r.cy, r.bottom);
      });
      return { xs: xs, ys: ys };
    }
    var guides = [];
    function clearGuides() { guides.forEach(function (g) { g.remove(); }); guides = []; }
    function snap(ddx, ddy) {
      clearGuides();
      var r = drag.startRect, t = drag.targets;
      var candX = [r.left + ddx, r.cx + ddx, r.right + ddx];
      var candY = [r.top + ddy, r.cy + ddy, r.bottom + ddy];
      var bx = pick(candX, t.xs); if (bx) { ddx += bx.delta; vguide(bx.line); }
      var by = pick(candY, t.ys); if (by) { ddy += by.delta; hguide(by.line); }
      return { x: ddx, y: ddy };
    }
    function pick(cands, lines) {
      var best = null;
      cands.forEach(function (c) { lines.forEach(function (l) { var d = l - c; if (Math.abs(d) <= SNAP && (!best || Math.abs(d) < Math.abs(best.delta))) best = { delta: d, line: l }; }); });
      return best;
    }
    function vguide(x) { var g = mk('div', 'aut-guide v'); g.style.left = x + 'px'; g.style.height = document.documentElement.scrollHeight + 'px'; document.body.appendChild(g); guides.push(g); }
    function hguide(y) { var g = mk('div', 'aut-guide h'); g.style.top = y + 'px'; g.style.width = document.documentElement.scrollWidth + 'px'; document.body.appendChild(g); guides.push(g); }

    function describe(e) {
      var tag = e.tagName.toLowerCase();
      var role = (tag === 'h1' || tag === 'h2' || tag === 'h3') ? 'Titolo' : tag === 'p' ? 'Paragrafo' : tag === 'img' ? 'Immagine' : e.classList.contains('btn') ? 'Pulsante' : e.classList.contains('nav__link') || e.classList.contains('site-footer__navlink') ? 'Voce menu' : (e.classList.contains('sponsor-logo') || e.classList.contains('card')) ? 'Card' : 'Elemento';
      var label = tag === 'img' ? (e.getAttribute('alt') || (e.getAttribute('src') || '').split('/').pop()) : (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
      return role + ' «' + label + '»';
    }
    function cssPath(e) {
      var parts = [], cur = e, d = 0;
      while (cur && cur !== document.body && d < 6) {
        if (cur.id) { parts.unshift('#' + cur.id); break; }
        var part = cur.tagName.toLowerCase();
        var cls = (typeof cur.className === 'string' ? cur.className : '').trim().split(/\s+/).filter(function (c) { return c && c.indexOf('aut-') !== 0; }).slice(0, 2);
        if (cls.length) part += '.' + cls.join('.');
        var i = 1, s = cur; while (s.previousElementSibling) { s = s.previousElementSibling; i++; }
        parts.unshift(part + ':nth-child(' + i + ')'); cur = cur.parentElement; d++;
      }
      return parts.join(' > ');
    }
    function generate(view) {
      var lines = [], i = 0;
      touched.forEach(function (e) {
        var s = e.__a; if (!s) return; var ch = [];
        if (Math.round(s.dx) || Math.round(s.dy)) ch.push('spostato di x:' + Math.round(s.dx) + 'px, y:' + Math.round(s.dy) + 'px');
        if (Math.abs(s.scale - 1) > 0.001) {
          var sz = s.origFont ? ' (testo ≈ da ' + Math.round(s.origFont) + 'px a ' + Math.round(s.origFont * s.scale) + 'px)' : (s.origW ? ' (≈ da ' + s.origW + '×' + s.origH + 'px a ' + Math.round(s.origW * s.scale) + '×' + Math.round(s.origH * s.scale) + 'px)' : '');
          ch.push('ridimensionato a ' + s.scale.toFixed(2) + '×' + sz);
        }
        if (s.newText != null && s.newText !== s.origText) ch.push('testo cambiato in: «' + s.newText.trim() + '»' + (s.origText != null ? ' (era: «' + s.origText.trim() + '»)' : ''));
        if (!ch.length) return;
        i++; lines.push(i + '. ' + describe(e) + ' — selettore `' + cssPath(e) + '`:\n   - ' + ch.join(';\n   - ') + '.');
      });
      if (!lines.length) return 'Non ho fatto modifiche nell\'editor.';
      return 'Ho preparato a mano un mockup sul sito di staging (vista ' + (view || 'desktop').toUpperCase() + '). '
        + 'Applica al codice reale (site.config.json / style.css) queste modifiche. Spostamenti e scale sono INDICATIVI (mockup con transform): interpretali come intento di layout, scegliendo tu il modo corretto (margini/padding, font-size, dimensioni, ordine, allineamenti).\n\n'
        + lines.join('\n\n')
        + '\n\nNota: dove ho spostato/allineato elementi, valuta la soluzione pulita nel flusso (es. centratura, griglia, spaziatura) anziché offset assoluti.';
    }
  }

  function mk(tag, cls) { var x = document.createElement(tag); if (cls) x.className = cls; return x; }
  function addStyle(t) { var s = document.createElement('style'); s.textContent = t; document.head.appendChild(s); }
})();
