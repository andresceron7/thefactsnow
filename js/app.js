/* app.js — navegación entre slides: navbar, flechas, swipe, enlaces directos (#plan, #sprint1…) */
(function () {
  const { $, $$ } = U;
  const slides = $$('.slide');
  const ids = slides.map((s) => s.id);
  // El anexo queda fuera de la secuencia normal (flechas, swipe, contador) y se abre desde el footer con contraseña
  const PROTECTED = 'anexo';
  const ANNEX_PW = 'omnicom4321';
  const seq = ids.filter((id) => id !== PROTECTED);
  let cur = -1;
  let unlocked = false;
  try { unlocked = sessionStorage.getItem('annexOk') === '1'; } catch (e) {}

  function go(id, { push = true } = {}) {
    const i = ids.indexOf(id);
    if (i < 0 || i === cur) return;
    if (id === PROTECTED && !unlocked) { askPassword(); return; }
    U.hideTip();
    if (Sheet.isOpen()) Sheet.close('nav');
    slides.forEach((s, j) => {
      s.classList.toggle('is-active', j === i);
      s.classList.toggle('is-before', j < i);
      s.setAttribute('aria-hidden', j !== i);
      s.inert = j !== i;
    });
    cur = i;
    $$('.nav-item').forEach((a) => {
      const on = a.dataset.go === id;
      a.classList.toggle('is-active', on);
      on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
    const k = seq.indexOf(id);
    const onAnnex = k < 0;
    $('#progress').style.width = onAnnex ? '100%' : ((k + 1) / seq.length) * 100 + '%';
    $('#pagerCount').textContent = onAnnex ? 'Anexo' : `${k + 1} / ${seq.length}`;
    $('#prevBtn').disabled = k === 0;
    $('#nextBtn').disabled = onAnnex || k === seq.length - 1;
    document.title = `${slides[i].dataset.title} · The Facts Now · Plan de PM`;
    if (push && location.hash !== '#' + id) history.replaceState(null, '', '#' + id);
    onEnter(id);
  }

  function onEnter(id) {
    requestAnimationFrame(() => {
      if (id === 'inicio') Home.refresh();
      if (id === 'plan') Timeline.redraw();
      if (id === 'riesgos') Risks.onEnter();
    });
  }

  const step = (d) => {
    const k = seq.indexOf(ids[cur]);
    if (k < 0) { if (d < 0) go(seq[seq.length - 1]); return; } // desde el anexo, "atrás" vuelve a Cierre
    const n = k + d;
    if (n >= 0 && n < seq.length) go(seq[n]);
  };

  // ---- Contraseña del anexo ----
  const dlg = $('#pwDialog'), input = $('#pwInput'), err = $('#pwError');
  function setError(on) {
    err.hidden = !on;
    on ? input.setAttribute('aria-invalid', 'true') : input.removeAttribute('aria-invalid');
  }
  function askPassword() {
    if (unlocked) { go(PROTECTED); return; }
    if (!dlg) return;
    U.hideTip();
    if (Sheet.isOpen()) Sheet.close('nav');
    input.value = '';
    setError(false);
    if (!dlg.open) dlg.showModal();
    input.focus();
  }
  function bindPassword() {
    if (!dlg) return; // la versión simple no tiene anexo ni diálogo
    $('#annexLock').addEventListener('click', askPassword);
    $('#pwCancel').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // clic fuera del panel
    input.addEventListener('input', () => setError(false));
    $('#pwForm').addEventListener('submit', (e) => {
      e.preventDefault();
      if (input.value === ANNEX_PW) {
        unlocked = true;
        try { sessionStorage.setItem('annexOk', '1'); } catch (er) {}
        document.body.classList.add('annex-ok');
        dlg.close();
        go(PROTECTED);
        slides[cur].scrollTop = 0;
      } else {
        setError(true);
        input.select();
        dlg.classList.remove('pw-shake'); void dlg.offsetWidth; dlg.classList.add('pw-shake');
      }
    });
  }

  function bind() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-go]');
      if (!a) return;
      e.preventDefault();
      go(a.dataset.go);
      slides[cur].scrollTop = 0;
    });
    $('#prevBtn').addEventListener('click', () => step(-1));
    $('#nextBtn').addEventListener('click', () => step(1));
    window.addEventListener('hashchange', () => go(location.hash.slice(1) || 'inicio', { push: false }));

    document.addEventListener('keydown', (e) => {
      if (Sheet.isOpen() || (dlg && dlg.open) || e.defaultPrevented || e.altKey || e.metaKey || e.ctrlKey) return;
      const t = e.target;
      if (t.closest && t.closest('input, textarea, select, [contenteditable], .seg, .tl-bar, .move-menu')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'Home' && t === document.body) go('inicio');
    });

    // Swipe horizontal en móvil (fuera de timeline, board y calendario, que tienen su propio scroll)
    let x0 = null, y0 = 0, t0 = 0;
    $('#main').addEventListener('touchstart', (e) => {
      if (Sheet.isOpen() || (dlg && dlg.open) || e.target.closest('[data-noswipe], .sortable-chosen')) { x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; t0 = Date.now();
    }, { passive: true });
    $('#main').addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6 && Date.now() - t0 < 700) step(dx < 0 ? 1 : -1);
      x0 = null;
    });

    // Vista A / B del plan
    U.seg($('[data-seg="planView"]'), (v) => {
      $('#planTimeline').hidden = v !== 'timeline';
      $('#planHours').hidden = v !== 'hours';
      if (v === 'timeline') requestAnimationFrame(Timeline.redraw);
    });

    window.addEventListener('beforeprint', () => { Home.render && Home.render(12); });
  }

  function plusList() {
    $('#plusList').innerHTML = DATA.plus.map((p) => `<li><b>${U.esc(p.name)}</b><span>${U.esc(p.line)}</span></li>`).join('');
  }

  // Init
  Sheet.init();
  Home.init();
  Timeline.init();
  Charts.init();
  Board.init();
  Method.init();
  Metrics.init();
  Risks.init();
  if (window.Annex) Annex.init(); // la versión simple no carga el anexo
  plusList();
  if (unlocked) document.body.classList.add('annex-ok');
  bindPassword();
  bind();
  go(location.hash.slice(1) || 'inicio', { push: false });
  if (cur < 0) go('inicio');
})();
