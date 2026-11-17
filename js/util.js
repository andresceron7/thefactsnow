/* util.js — utilidades compartidas */
window.U = (function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // Número en formato español: 34.5 → "34,5"
  const fmt = (n) => {
    const r = Math.round(n * 100) / 100;
    return String(r).replace('.', ',');
  };
  // Redondeo de presentación al 0,5 más cercano, con "~" si cambia el valor (decisión: redondear solo en pantalla)
  const fmtApprox = (n) => {
    const r = Math.round(n * 2) / 2;
    return (Math.abs(r - n) > 0.001 ? '~' : '') + fmt(r);
  };
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const role = (id) => DATA.roles.find((r) => r.id === id);
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

  const avatar = (id, extra = '') => {
    const r = role(id);
    return `<span class="avatar ${extra}" style="background:${r.fill};color:${r.ink}" title="${esc(r.name)}">${r.initials}</span>`;
  };

  // Segmented control: <div class="seg" data-seg="name"><button data-val>…
  function seg(el, onChange) {
    const btns = $$('button', el);
    btns.forEach((b) => {
      b.addEventListener('click', () => select(b.dataset.val));
      b.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault(); e.stopPropagation();
        const i = btns.indexOf(b) + (e.key === 'ArrowRight' ? 1 : -1);
        const nb = btns[(i + btns.length) % btns.length];
        nb.focus(); select(nb.dataset.val);
      });
    });
    function select(val) {
      btns.forEach((b) => {
        const on = b.dataset.val === val;
        b.setAttribute('aria-selected', on);
        b.tabIndex = on ? 0 : -1;
      });
      onChange && onChange(val);
    }
    const cur = btns.find((b) => b.getAttribute('aria-selected') === 'true') || btns[0];
    btns.forEach((b) => (b.tabIndex = b === cur ? 0 : -1));
    return { select };
  }

  // Tooltip flotante
  const tt = () => $('#tooltip');
  function showTip(html, x, y) {
    const t = tt();
    t.innerHTML = html; t.hidden = false;
    const w = t.offsetWidth, h = t.offsetHeight;
    let left = x + 14, top = y + 14;
    if (left + w > window.innerWidth - 8) left = x - w - 14;
    if (top + h > window.innerHeight - 8) top = y - h - 14;
    t.style.left = Math.max(8, left) + 'px';
    t.style.top = Math.max(8, top) + 'px';
  }
  function hideTip() { tt().hidden = true; }

  // Versión simple (index-simple.html): <body data-mode="simple">. En index.html es false y nada cambia.
  const simple = document.body.dataset.mode === 'simple';

  return { $, $$, esc, fmt, fmtApprox, sum, role, avatar, seg, showTip, hideTip, reducedMotion, isMobile, simple };
})();
