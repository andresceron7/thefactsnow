/* risks.js — cadena del retraso animada, registro de 14 riesgos y matriz probabilidad × impacto */
window.Risks = (function () {
  const { $, $$, esc } = U;
  const D = DATA;
  let played = false, tl = null;

  function chain() {
    $('#chain').innerHTML = D.chain.map((c, i) => `<div class="chain-step">
      <div class="chain-link"><span class="chain-node">${i + 1}</span><span class="chain-line"></span></div>
      <p class="chain-name">${esc(c.name)}</p><p class="chain-desc">${esc(c.desc)}</p>
      <div class="chain-break"><span class="label">Lo rompe</span><b>${esc(c.metric)}</b><span class="goal">Meta: ${esc(c.goal)}</span></div></div>`).join('');
    if (U.simple) return; // versión simple: la cadena se anima sola al entrar, sin botón
    const ctr = document.createElement('div');
    ctr.className = 'chain-controls';
    ctr.innerHTML = '<button class="btn-quiet" id="chainPlay">Ver cómo se rompe la cadena</button>';
    $('#chain').before(ctr);
    $('#chainPlay').addEventListener('click', () => play(true));
  }

  // Revela los eslabones uno a uno y luego muestra cómo cada métrica los rompe
  function play(force) {
    if (played && !force) return;
    played = true;
    const el = $('#chain');
    el.classList.remove('is-broken');
    if (!window.gsap || U.reducedMotion()) { el.classList.add('is-broken'); return; }
    tl && tl.kill();
    tl = gsap.timeline();
    tl.set('.chain-step', { opacity: 0, y: 14 })
      .set('.chain-break', { opacity: 0, y: 8 })
      .to('.chain-step', { opacity: 1, y: 0, duration: 0.45, stagger: 0.45, ease: 'power2.out' })
      .to('.chain-break', { opacity: 1, y: 0, duration: 0.4, stagger: 0.25, ease: 'power2.out' }, '+=0.3')
      .add(() => el.classList.add('is-broken'), '-=0.1');
  }

  function list() {
    const top = D.risks.filter((r) => r.top), rest = D.risks.filter((r) => !r.top).sort((a, b) => a.n - b.n);
    if (U.simple) { // versión simple: top 5 con mitigación y dueño a la vista; el resto, compacto y sin clic
      $('#riskList').innerHTML =
        `<li class="top-sep" style="padding-top:4px"><span class="dot dot--mag" aria-hidden="true"></span> Top 5 · los cuatro primeros forman la cadena del retraso</li>` +
        top.map((r) => `<li class="risk-top">
          <span class="risk-n">${r.n}</span>
          <span class="rt-main"><span class="risk-name">${esc(r.name)}</span><span class="risk-desc">${esc(r.desc)}</span><span class="risk-pi">${pi(r)}</span></span>
          <span class="rt-mit"><span class="label">Mitigación</span>${esc(r.mit)}</span>
          <span class="rt-owner"><span class="label">Dueño</span>${esc(r.owner)}</span></li>`).join('') +
        `<li class="top-sep">Resto del registro</li><li class="risk-rest"><ul>${rest.map((r) => `<li><span class="risk-n">${r.n}</span><span class="risk-name">${esc(r.name)}</span><span class="risk-pi">${pi(r)}</span></li>`).join('')}</ul></li>`;
      return;
    }
    const row = (r) => `<li><button class="risk-row${r.top ? ' is-top' : ''}" data-n="${r.n}">
      <span class="risk-n">${r.n}</span><span><span class="risk-name">${esc(r.name)}</span><span class="risk-desc">${esc(r.desc)}</span></span>
      <span class="risk-pi">${pi(r)}</span></button></li>`;
    $('#riskList').innerHTML = `<li class="top-sep" style="padding-top:4px"><span class="dot dot--mag" aria-hidden="true"></span> Top 5 · los cuatro primeros forman la cadena del retraso</li>` +
      top.map(row).join('') + '<li class="top-sep">Resto del registro</li>' + rest.map(row).join('');
  }
  const pi = (r) => `P ${r.p.toLowerCase()} · I ${r.i.toLowerCase()}`;

  function matrix() {
    if (!$('#matrix')) return; // la versión simple no tiene matriz
    const P = ['Alta', 'Media', 'Baja'], I = ['Bajo', 'Medio', 'Alto'];
    let h = '';
    P.forEach((p) => {
      h += `<span class="mx-ylab">${p}</span>`;
      I.forEach((i) => {
        const score = D.lvl[p] * D.lvl[i];
        const rs = D.risks.filter((r) => r.p === p && r.i === i);
        h += `<div class="mx-cell" data-score="${score}" aria-label="Probabilidad ${p}, impacto ${i}: ${rs.length} riesgos">${rs.map((r) => `<button class="mx-dot${r.top ? ' is-top' : ''}" data-n="${r.n}" aria-label="Riesgo ${r.n}: ${esc(r.name)}">${r.n}</button>`).join('')}</div>`;
      });
    });
    h += '<span></span>' + I.map((i) => `<span class="mx-xlab">${i}</span>`).join('');
    $('#matrix').innerHTML = h;
    $('#matrix').insertAdjacentHTML('afterend', '<p class="mx-axis">Probabilidad (vertical) × impacto (horizontal). En magenta, el top 5.</p>');
  }

  function hl(n) {
    $$('.risk-row').forEach((b) => b.classList.toggle('is-hl', n !== null && +b.dataset.n === n));
    $$('.mx-dot').forEach((d) => { d.classList.toggle('is-hl', n !== null && +d.dataset.n === n); d.classList.toggle('is-dim', n !== null && +d.dataset.n !== n); });
  }

  function open(n) {
    const r = D.risks.find((x) => x.n === n);
    Sheet.open({
      eyebrow: `Riesgo ${r.n}${r.top ? ' · Top 5' : ''}`,
      title: r.name,
      body: `<p class="muted-p">${esc(r.desc)}</p>
        <ul class="kv" style="margin-top:12px"><li><span>Probabilidad</span><span>${r.p}</span></li><li><span>Impacto</span><span>${r.i}</span></li>
        <li><span>Señal temprana</span><span>${esc(r.signal)}</span></li><li><span>Dueño</span><span><b>${esc(r.owner)}</b></span></li></ul>
        <h4>Mitigación</h4><p>${esc(r.mit)}</p>
        <p class="muted-p" style="margin-top:14px">El registro vive en el board y se revisa cada semana. Los riesgos en ámbar o rojo van en el reporte semanal con su acción.</p>`
    });
  }

  function bind() {
    const wire = (sel) => $$(sel).forEach((b) => {
      const n = +b.dataset.n;
      b.addEventListener('mouseenter', () => hl(n));
      b.addEventListener('focus', () => hl(n));
      b.addEventListener('mouseleave', () => hl(null));
      b.addEventListener('blur', () => hl(null));
      b.addEventListener('click', () => open(n));
    });
    wire('.risk-row'); wire('.mx-dot');
  }

  function init() { chain(); list(); matrix(); if (!U.simple) bind(); }
  function onEnter() { play(false); }
  return { init, onEnter };
})();
