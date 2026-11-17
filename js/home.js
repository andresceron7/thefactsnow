/* home.js — cronograma de 12 semanas que se arma con el scroll (GSAP + ScrollTrigger) */
window.Home = (function () {
  const { $, esc } = U;
  const D = DATA;
  const states = [
    { upTo: 2, key: 'wire', name: 'Wireframe', sub: 'S1 · mapa del sitio y wireframes' },
    { upTo: 6, key: 'ui', name: 'UI', sub: 'S2–S3 · diseño y specs de motion' },
    { upTo: 10, key: 'anim', name: 'Animado', sub: 'S4–S5 · patrones GSAP y contenido real' },
    { upTo: 12, key: 'live', name: 'Lanzado', sub: 'S6 · UAT, despliegue y capacitación' }
  ];
  let bars = [], gates = [], clients = [], weekCells = [], nowLine;

  function build() {
    const el = $('#miniGantt');
    const weeks = '<div class="mg-weeks">' + Array.from({ length: 12 }, () => '<i></i>').join('') + '</div>';
    let html = `<div class="mg-row mg-head"><span class="mg-label"></span><div class="mg-track">${D.sprints.map((s) => `<span>${s.id}</span>`).join('')}</div></div>`;
    html += `<div class="mg-row"><span class="mg-label">Gates</span><div class="mg-track">${weeks}${D.gates.map((g) => `<span class="mg-gate" style="left:${(g.at / 12) * 100}%" title="${esc(g.name)}"></span>`).join('')}<span class="mg-now"></span></div></div>`;
    D.epics.forEach((e) => {
      html += `<div class="mg-row"><span class="mg-label">${e.id} · ${esc(e.short)}</span><div class="mg-track">${weeks}<span class="mg-bar" data-s="${e.start}" data-e="${e.end}" style="left:${((e.start - 1) / 12) * 100}%;width:${((e.end - e.start + 1) / 12) * 100}%;background:${e.fill}"></span></div></div>`;
    });
    html += `<div class="mg-row"><span class="mg-label">Cliente</span><div class="mg-track">${weeks}${D.clientMilestones.map((c) => `<span class="mg-client" style="left:${(c.at / 12) * 100}%" title="${esc(c.name)}"></span>`).join('')}</div></div>`;
    el.innerHTML = html;
    bars = Array.from(el.querySelectorAll('.mg-bar'));
    gates = Array.from(el.querySelectorAll('.mg-gate'));
    clients = Array.from(el.querySelectorAll('.mg-client'));
    weekCells = Array.from(el.querySelectorAll('.mg-row:not(.mg-head)')).map((r) => Array.from(r.querySelectorAll('.mg-weeks i')));
    nowLine = el.querySelector('.mg-now');
    // La línea "ahora" ocupa toda la altura de la cuadrícula
    sizeNow();
  }
  function sizeNow() {
    if (!nowLine) return;
    const el = $('#miniGantt');
    const h = el.getBoundingClientRect().bottom - nowLine.parentElement.getBoundingClientRect().top - 12;
    nowLine.style.bottom = 'auto';
    nowLine.style.height = Math.max(0, h) + 'px';
  }

  // w: semana continua en [0, 12]
  function render(w) {
    const wk = Math.min(12, Math.max(1, Math.ceil(w || 0.0001)));
    $('#weekNum').textContent = String(wk).padStart(2, '0');
    const sp = D.sprints[Math.floor((wk - 1) / 2)];
    $('#storyCaption').textContent = `${sp.id} · ${sp.name}`;
    bars.forEach((b) => {
      const s = +b.dataset.s - 1, e = +b.dataset.e;
      const p = Math.max(0, Math.min(1, (w - s) / (e - s)));
      b.style.transform = `scaleX(${p})`;
    });
    gates.forEach((g, i) => g.classList.toggle('on', w >= D.gates[i].at));
    clients.forEach((c, i) => c.classList.toggle('on', w >= D.clientMilestones[i].at));
    weekCells.forEach((row) => row.forEach((c, i) => c.classList.toggle('past', i < w)));
    if (nowLine) nowLine.style.left = (w / 12) * 100 + '%';
    const st = states.find((s) => wk <= s.upTo);
    const frame = $('#siteFrame');
    if (frame.dataset.state !== st.key) {
      frame.dataset.state = st.key;
      $('#siteState').textContent = st.name;
      $('#siteSub').textContent = st.sub;
    }
  }

  function init() {
    build();
    const scroller = $('#inicio');
    if (U.reducedMotion() || !window.gsap || !window.ScrollTrigger) { render(12); return; }
    gsap.registerPlugin(ScrollTrigger);
    render(0.0001);
    ScrollTrigger.create({
      trigger: '#homeStory',
      scroller,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => render(self.progress * 12)
    });
    // Entrada suave del hero
    gsap.from('.home-about .about-photo, .home-about .about-text > *', { y: 18, opacity: 0, duration: 0.7, stagger: 0.07, ease: 'power2.out' });
  }

  function refresh() { sizeNow(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }
  return { init, refresh, render };
})();
