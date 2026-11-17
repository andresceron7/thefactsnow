/* timeline.js — Gantt de 12 semanas con carril del cliente, gates, ruta crítica
   y arrastre de épicas con validación de dependencias. */
window.Timeline = (function () {
  const { $, $$, esc, fmt, sum, role } = U;
  const D = DATA;
  let pos = {};            // id → semana de inicio actual
  const orig = {};
  D.epics.forEach((e) => (orig[e.id] = e.start));
  const dur = (id) => { const e = D.epics.find((x) => x.id === id); return e.end - e.start + 1; };
  const S = (id) => pos[id];
  const E = (id) => pos[id] + dur(id) - 1;

  // Reglas de dependencia. Cada una: test → true si se rompe.
  const rules = [
    { ids: ['E1'], test: () => E('E1') > 2, msg: 'El kickoff y el discovery se correrían después de la semana 2.' },
    { ids: ['E2'], crit: true, test: () => E('E2') > 6, msg: 'El diseño termina después del Gate 2 (semana 6): se retrasa todo el desarrollo de alta animación.' },
    { ids: ['E3'], crit: true, test: () => S('E3') < 2, msg: 'El setup técnico arranca antes del kickoff, sin accesos ni alcance validado.' },
    { ids: ['E3', 'E4'], crit: true, test: () => E('E3') >= S('E4'), msg: 'Las secciones regulares arrancan sin el setup técnico y el modelo ACF listos.' },
    { ids: ['E4'], test: () => S('E4') < 4, msg: 'Se maquetan secciones regulares antes de aprobar su UI (S2) y de recibir su contenido.' },
    { ids: ['E5'], crit: true, test: () => S('E5') < E('E2') - 1, msg: 'Esto adelanta desarrollo antes de aprobar el diseño.' },
    { ids: ['E5'], crit: true, test: () => E('E5') > 10, msg: 'El desarrollo de alta animación pasa el code freeze de la semana 10.' },
    { ids: ['E6'], test: () => S('E6') < 5, msg: 'La carga de contenido arranca antes de que el cliente lo entregue (fin de la semana 4).' },
    { ids: ['E7'], crit: true, test: () => S('E7') < S('E4') + 2, msg: 'QA arranca antes de que haya producto que probar.' },
    { ids: ['E7', 'E5'], crit: true, test: () => E('E7') <= E('E5'), msg: 'QA de rendimiento termina antes de que acabe el desarrollo de alta animación.' },
    { ids: ['E8', 'E7'], crit: true, test: () => S('E8') < E('E7'), msg: 'UAT arranca antes de cerrar QA: el cliente probaría un sitio con bugs abiertos.' }
  ];

  function reset() { pos = { ...orig }; }

  function build() {
    reset();
    const el = $('#timeline');
    const grid = '<div class="tl-grid">' + Array.from({ length: 12 }, () => '<i></i>').join('') + '</div>';
    let h = '';
    h += `<div class="tl-row tl-head tl-sprints"><div class="tl-label"><small>Sprints</small></div><div class="tl-track">${D.sprints.map((s) => `<span>${s.id}<small>${esc(s.name)}</small></span>`).join('')}</div></div>`;
    h += `<div class="tl-row tl-head tl-weeks"><div class="tl-label"><small>Semanas</small></div><div class="tl-track">${Array.from({ length: 12 }, (_, i) => `<span>${i + 1}</span>`).join('')}</div></div>`;
    h += `<div class="tl-row tl-gates"><div class="tl-label">Gates</div><div class="tl-track">${grid}${D.gates.map((g, i) => `<button class="tl-gate" data-gate="${i}" data-align="${['left', 'right', 'center', 'center', 'center'][i]}" style="left:${(g.at / 12) * 100}%" aria-label="${esc(g.name)}, ${esc(g.label)}"><i></i><span>${esc(g.name)}</span></button>`).join('')}</div></div>`;
    h += '<div class="tl-sep"></div>';
    D.epics.forEach((e) => {
      h += `<div class="tl-row tl-epic"><div class="tl-label"><span><span class="eid">${e.id}</span>${esc(e.short)}</span><small>Semanas <span data-weeks="${e.id}">${e.start}–${e.end}</span> · ${fmt(sum(Object.values(e.hours)))} h</small></div><div class="tl-track">${grid}<div class="tl-bar${e.locked ? ' is-locked' : ''}" data-id="${e.id}" tabindex="0" role="button" aria-label="${esc(e.id + ' ' + e.name)}. Semanas ${e.start} a ${e.end}.${e.locked ? '' : ' Usa flechas izquierda y derecha para moverla.'}" style="background:${e.fill};color:${e.ink}">${esc(e.name)}</div></div></div>`;
    });
    h += '<div class="tl-sep"></div>';
    // Carril del cliente: hitos que caen cerca se apilan en dos niveles
    let lastAt = -9, level = 0;
    const cms = D.clientMilestones.map((c, i) => {
      level = c.at - lastAt < 0.9 ? (level + 1) % 2 : 0; lastAt = c.at;
      return `<button class="tl-cm${c.critical ? ' is-critical' : ''}" data-cm="${i}" style="left:${(c.at / 12) * 100}%;top:${level ? 34 : 6}px" aria-label="${esc(c.name)}, ${esc(c.due)}"><i></i><span>${esc(c.short)}</span></button>`;
    }).join('');
    h += `<div class="tl-row tl-client"><div class="tl-label">Carril del cliente<small>Entregas con fecha firmada</small></div><div class="tl-track">${grid}${cms}</div></div>`;
    h += '<svg class="tl-crit" id="tlCrit" aria-hidden="true"></svg>';
    el.innerHTML = h;
    // Versión simple: timeline estático, sin foco ni clic; solo tooltips al pasar el mouse
    if (U.simple) {
      $$('.tl-bar').forEach((b) => {
        const e = D.epics.find((x) => x.id === b.dataset.id);
        b.classList.add('is-static'); b.removeAttribute('role'); b.removeAttribute('tabindex');
        b.setAttribute('aria-label', `${e.id} ${e.name}. Semanas ${e.start} a ${e.end}.`);
      });
      $$('.tl-gate, .tl-cm').forEach((g) => { g.classList.add('is-static'); g.tabIndex = -1; });
    }
    layout();
    bind();
  }

  function layout() {
    D.epics.forEach((e) => {
      const bar = $(`.tl-bar[data-id="${e.id}"]`);
      const s = pos[e.id], d = dur(e.id);
      bar.style.left = ((s - 1) / 12) * 100 + '%';
      bar.style.width = (d / 12) * 100 + '%';
      bar.classList.toggle('is-moved', s !== orig[e.id]);
      $(`[data-weeks="${e.id}"]`).textContent = `${s}–${s + d - 1}`;
    });
    validate();
  }

  function validate() {
    const broken = rules.filter((r) => r.test());
    const bad = new Set(broken.flatMap((r) => r.ids));
    $$('.tl-bar').forEach((b) => b.classList.toggle('is-broken', bad.has(b.dataset.id)));
    const alert = $('#tlAlert'), resetBtn = $('#tlReset');
    if (alert) alert.textContent = broken.length ? broken[0].msg + (broken.length > 1 ? ` (+${broken.length - 1} dependencia${broken.length > 2 ? 's' : ''} más)` : '') : '';
    if (resetBtn) resetBtn.disabled = Object.keys(pos).every((k) => pos[k] === orig[k]);
    drawCritical(broken.some((r) => r.crit));
  }

  // Ruta crítica: ACF (E3) → Gate 2 → contenido de alta animación → E5 → E7 → Gate 3 → Lanzamiento
  function drawCritical(isBroken) {
    const tl = $('#timeline'), svg = $('#tlCrit');
    if (!tl || !svg) return;
    const base = tl.getBoundingClientRect();
    if (!base.width) return;
    svg.setAttribute('width', tl.scrollWidth); svg.setAttribute('height', tl.scrollHeight);
    svg.setAttribute('viewBox', `0 0 ${tl.scrollWidth} ${tl.scrollHeight}`);
    const pt = (el, where = 'end') => {
      const r = el.getBoundingClientRect();
      const x = where === 'end' ? r.right - 4 : where === 'start' ? r.left + 4 : r.left + r.width / 2;
      return [x - base.left, r.top + r.height / 2 - base.top];
    };
    const crit = D.clientMilestones.findIndex((c) => c.critical);
    const pts = [
      pt($('.tl-bar[data-id="E3"]')),
      pt($('.tl-gate[data-gate="2"] i'), 'mid'),
      pt($(`.tl-cm[data-cm="${crit}"] i`), 'mid'),
      pt($('.tl-bar[data-id="E5"]')),
      pt($('.tl-bar[data-id="E7"]')),
      pt($('.tl-gate[data-gate="3"] i'), 'mid'),
      pt($('.tl-gate[data-gate="4"] i'), 'mid')
    ];
    // Conectores en codo (horizontal y luego vertical) para no cruzar las barras en diagonal
    const path = [pts[0]];
    for (let i = 1; i < pts.length; i++) { path.push([pts[i][0], pts[i - 1][1]], pts[i]); }
    svg.classList.toggle('is-broken', isBroken);
    svg.innerHTML = `<polyline points="${path.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')}"/>` +
      pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6"/>`).join('');
  }

  function move(id, delta) {
    const d = dur(id);
    const next = Math.max(1, Math.min(13 - d, pos[id] + delta));
    if (next === pos[id]) return false;
    pos[id] = next; layout();
    return true;
  }

  function bind() {
    $$('.tl-bar').forEach((bar) => {
      const id = bar.dataset.id;
      const ep = D.epics.find((e) => e.id === id);
      bar.addEventListener('mouseenter', (ev) => U.showTip(tipHtml(ep), ev.clientX, ev.clientY));
      bar.addEventListener('mousemove', (ev) => { if (!bar.classList.contains('is-dragging')) U.showTip(tipHtml(ep), ev.clientX, ev.clientY); });
      bar.addEventListener('mouseleave', U.hideTip);
      if (U.simple) return; // versión simple: sin clic, teclado ni arrastre
      bar.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEpic(ep); }
        if (!ep.locked && (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight')) {
          ev.preventDefault(); ev.stopPropagation();
          move(id, ev.key === 'ArrowRight' ? 1 : -1);
        }
      });
      // Arrastre por semanas (pointer events: ratón, lápiz y táctil con presión larga)
      bar.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0) return;
        const x0 = ev.clientX, s0 = pos[id];
        const weekW = bar.parentElement.getBoundingClientRect().width / 12;
        let moved = false, active = ev.pointerType !== 'touch', longPress = null;
        if (!active) longPress = setTimeout(() => { active = true; bar.classList.add('is-dragging'); navigator.vibrate && navigator.vibrate(10); }, 320);
        else if (!ep.locked) bar.setPointerCapture(ev.pointerId);
        const onMove = (e) => {
          if (Math.abs(e.clientX - x0) > 4) {
            moved = true;
            if (!active) { clearTimeout(longPress); cleanup(); return; } // scroll horizontal normal en táctil
          }
          if (!active || ep.locked) return;
          bar.classList.add('is-dragging'); U.hideTip();
          const delta = Math.round((e.clientX - x0) / weekW);
          const d = dur(id);
          const next = Math.max(1, Math.min(13 - d, s0 + delta));
          if (next !== pos[id]) { pos[id] = next; layout(); }
        };
        const onUp = () => {
          clearTimeout(longPress);
          cleanup();
          bar.classList.remove('is-dragging');
          if (!moved) openEpic(ep);
        };
        const cleanup = () => {
          bar.removeEventListener('pointermove', onMove);
          bar.removeEventListener('pointerup', onUp);
          bar.removeEventListener('pointercancel', onUp);
        };
        bar.addEventListener('pointermove', onMove);
        bar.addEventListener('pointerup', onUp);
        bar.addEventListener('pointercancel', onUp);
      });
    });
    $$('.tl-gate').forEach((g) => {
      const gate = D.gates[+g.dataset.gate];
      if (!U.simple) g.addEventListener('click', () => Sheet.open({ eyebrow: 'Gate de aprobación · ' + gate.label, title: gate.name, body: `<p>${esc(gate.approves)}</p><h4>Regla de juego</h4><p class="muted-p">Aprobación en máximo 3 días hábiles y 2 rondas de revisión por entregable, firmado en el kickoff.</p>` }));
      g.addEventListener('mouseenter', (ev) => U.showTip(`<b>${esc(gate.name)}</b>${esc(gate.label)}<span class="tt-sub">${esc(gate.approves)}</span>`, ev.clientX, ev.clientY));
      g.addEventListener('mouseleave', U.hideTip);
    });
    $$('.tl-cm').forEach((c) => {
      const m = D.clientMilestones[+c.dataset.cm];
      if (!U.simple) c.addEventListener('click', () => Sheet.open({ eyebrow: 'Entrega del cliente', title: m.name, body: clientBody(m) }));
      c.addEventListener('mouseenter', (ev) => U.showTip(`<b>${esc(m.name)}</b>${esc(m.due)}<span class="tt-sub">Para: ${esc(m.why)}</span>`, ev.clientX, ev.clientY));
      c.addEventListener('mouseleave', U.hideTip);
    });
    $('#tlReset')?.addEventListener('click', () => { reset(); layout(); });
    window.addEventListener('resize', () => validate());
  }

  function owners(ep) { return Object.keys(ep.hours).map((r) => role(r).short).join(', '); }
  function tipHtml(ep) {
    return `<b>${ep.id} · ${esc(ep.name)}</b>Semanas ${S(ep.id)}–${E(ep.id)} · ${fmt(sum(Object.values(ep.hours)))} h<span class="tt-sub">${esc(ep.scope)}</span><span class="tt-sub">Responsables: ${esc(owners(ep))}</span>`;
  }
  function clientBody(m) {
    return `<ul class="kv"><li><span>Fecha límite</span><span>${esc(m.due)}</span></li><li><span>Para qué</span><span>${esc(m.why)}</span></li>${m.critical ? '<li><span>Ruta crítica</span><span>Sí. Cualquier retraso aquí mueve la fecha final.</span></li>' : ''}</ul>
      <h4>Cómo se protege</h4><p class="muted-p">Cada entrega llega un sprint antes de que el equipo la necesite, para cumplir la Definition of Ready. Si se retrasa: contenido provisional, tareas alternas en Ready e impacto en fecha documentado y comunicado.</p>`;
  }
  function openEpic(ep) {
    U.hideTip();
    const total = sum(Object.values(ep.hours));
    const max = Math.max(...Object.values(ep.hours));
    const rows = D.roles.filter((r) => ep.hours[r.id]).map((r) =>
      `<li><span class="k"><span class="swatch" style="background:${r.fill}"></span>${esc(r.name)}</span><span class="v">${fmt(ep.hours[r.id])} h</span></li>`).join('');
    const moved = pos[ep.id] !== orig[ep.id];
    Sheet.open({
      eyebrow: `${ep.id} · Semanas ${S(ep.id)}–${E(ep.id)}${moved ? ` (plan: ${ep.start}–${ep.end})` : ''}`,
      title: ep.name,
      body: `<p>${esc(ep.scope)}</p>
        <h4>Horas por perfil · ${fmt(total)} h (${fmt(Math.round((total / 540) * 1000) / 10)}% de las 540 operativas)</h4>
        <ul class="value-list">${rows}</ul>
        ${ep.id === 'E5' ? `<h4>Librería de patrones de motion</h4><p class="muted-p">${esc(D.plus[0].line)}</p>` : ''}
        ${ep.id === 'E0' ? '<h4>Por qué pesa 24%</h4><p class="muted-p">Es el costo real de coordinar 5 perfiles compartidos durante 12 semanas. Ya está optimizado: sin daily sincrónica, 2 syncs de 15 min por semana y un solo cierre de sprint de 75 min. El PM solo es el 12%.</p>' : ''}`
    });
  }

  return { init: build, redraw: validate };
})();
