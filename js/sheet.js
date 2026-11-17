/* sheet.js — side sheet (desktop) / bottom sheet (móvil) reutilizable */
window.Sheet = (function () {
  const { $ } = U;
  const registry = {};
  let lastFocus = null;
  let onCloseCb = null;

  function open({ eyebrow = '', title = '', body = '', wide = false, onOpen, onClose }) {
    const sheet = $('#sheet'), scrim = $('#scrim');
    lastFocus = document.activeElement;
    onCloseCb = onClose || null;
    $('#sheetEyebrow').textContent = eyebrow;
    $('#sheetTitle').textContent = title;
    $('#sheetBody').innerHTML = body;
    $('#sheetBody').scrollTop = 0;
    document.body.classList.toggle('sheet-wide', wide);
    sheet.hidden = false; scrim.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add('is-open'); scrim.classList.add('is-open');
      const f = sheet.querySelector('[autofocus]') || $('#sheetClose');
      f.focus({ preventScroll: true });
    });
    onOpen && onOpen($('#sheetBody'));
  }

  function close(reason) {
    const sheet = $('#sheet'), scrim = $('#scrim');
    if (sheet.hidden) return;
    sheet.classList.remove('is-open'); scrim.classList.remove('is-open');
    const done = () => { sheet.hidden = true; scrim.hidden = true; };
    U.reducedMotion() ? done() : setTimeout(done, 320);
    const cb = onCloseCb; onCloseCb = null;
    cb && cb(reason);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  const isOpen = () => !$('#sheet').hidden;
  const register = (key, fn) => (registry[key] = fn);
  const openKey = (key) => { const fn = registry[key]; if (fn) open(fn()); };

  function init() {
    $('#sheetClose').addEventListener('click', () => close('dismiss'));
    $('#scrim').addEventListener('click', () => close('dismiss'));
    document.addEventListener('keydown', (e) => {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close('dismiss'); }
      if (e.key === 'Tab') { // trampa de foco simple
        const f = Array.from($('#sheet').querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.disabled && el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-sheet]');
      if (t) { e.preventDefault(); openKey(t.dataset.sheet); }
    });
    // Arrastrar hacia abajo para cerrar en móvil
    let y0 = null;
    $('#sheet').addEventListener('touchstart', (e) => { if (e.target.closest('.sheet-head, .sheet-grab')) y0 = e.touches[0].clientY; }, { passive: true });
    $('#sheet').addEventListener('touchend', (e) => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 80) close('dismiss'); y0 = null; });
  }

  return { open, close, isOpen, register, openKey, init };
})();
