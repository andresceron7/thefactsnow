/* method.js — línea de gates, calendario de rituales, flujo del board, DoR/DoD */
window.Method = (function () {
  const { $, $$, esc } = U;
  const D = DATA;
  const R = (id) => D.rituals.find((r) => r.id === id);

  function gates() {
    const el = $('#gatesLine');
    if (U.simple) { // versión simple: qué se aprueba en cada gate, todo visible sin clic
      el.innerHTML = D.gates.map((g) => `<div class="gate-item" role="listitem"><i></i><span class="g-name">${esc(g.name)}</span><span class="g-week">Semana ${g.week}</span><p class="g-approves">${esc(g.approves.split('. ')[0].replace(/\.$/, ''))}.</p></div>`).join('');
      return;
    }
    el.innerHTML = D.gates.map((g, i) => `<button class="gate-btn" role="listitem" data-i="${i}" aria-selected="${i === 2}"><i></i><span class="g-name">${esc(g.name)}</span><span class="g-week">Semana ${g.week}</span></button>`).join('');
    const show = (i) => {
      const g = D.gates[i];
      $$('.gate-btn', el).forEach((b) => b.setAttribute('aria-selected', +b.dataset.i === i));
      $('#gateDetail').innerHTML = `<p class="label">${esc(g.name)} · ${esc(g.label)}</p><p>${esc(g.approves)}</p>`;
    };
    $$('.gate-btn', el).forEach((b) => b.addEventListener('click', () => show(+b.dataset.i)));
    show(2);
  }

  function calendar() {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'];
    const tag = U.simple ? 'span' : 'button'; // versión simple: eventos sin clic
    const ev = (id, cls, sub) => `<${tag} class="cal-ev cal-ev--${cls}" data-r="${id}">${esc(R(id).name)}${sub ? `<small>${esc(sub)}</small>` : ''}</${tag}>`;
    let h = '<span></span>' + days.map((d) => `<span class="cal-dayhead">${d}</span>`).join('');
    [1, 2].forEach((w) => {
      h += `<span class="cal-time">Sem ${w}</span>`;
      days.forEach((d, i) => {
        let items = ev('daily', 'daily', 'Slack / board');
        if (i === 1 || i === 3) items += ev('sync', 'sync', '15 min · equipo core');
        if (i === 4) items += ev('report', 'report', 'Asíncrono · semáforo');
        if (w === 2 && i === 4) items += ev('demo', 'demo', '30–45 min · cliente') + ev('close', 'close', '75 min · review, retro, planning');
        h += `<div class="cal-day">${items}</div>`;
      });
    });
    const el = $('#calendar');
    el.innerHTML = h;
    if (U.simple) return;
    el.addEventListener('click', (e) => {
      const b = e.target.closest('.cal-ev'); if (!b) return;
      $$('.cal-ev', el).forEach((x) => x.classList.toggle('is-selected', x.dataset.r === b.dataset.r));
      const r = R(b.dataset.r);
      Sheet.open({
        eyebrow: 'Ritual', title: r.name,
        body: `<ul class="kv"><li><span>Duración</span><span>${esc(r.dur)}</span></li><li><span>Quién asiste</span><span>${esc(r.who)}</span></li><li><span>Costo en horas</span><span>${esc(r.cost)}</span></li><li><span>Formato</span><span>${esc(r.fmt)}</span></li></ul>
          <p class="muted-p" style="margin-top:14px">Syncs y cierres de sprint suman unas 65 h (~11%). Con kickoffs y demos, toda la coordinación del equipo está presupuestada en la épica E0.</p>`,
        onClose: () => $$('.cal-ev', el).forEach((x) => x.classList.remove('is-selected'))
      });
    });
  }

  function flow() {
    $('#boardFlow').innerHTML = D.boardFlow.map((s) => `<li class="${s === 'Bloqueado' ? 'is-blocked' : ''}">${esc(s)}</li>`).join('');
    const render = (v) => { $('#defList').innerHTML = (v === 'dod' ? D.dod : D.dor).map((x) => `<li>${esc(x)}</li>`).join(''); };
    U.seg($('[data-seg="def"]'), render);
    render('dor');
  }

  function sheets() {
    Sheet.register('escalation', () => ({
      eyebrow: 'Metodología', title: 'Ruta de escalamiento',
      body: `<ul class="qa">${D.escalation.map((e) => `<li><b>${esc(e.n)}</b><span>${esc(e.when)}. ${esc(e.what)}</span></li>`).join('')}</ul>`
    }));
    Sheet.register('changes', () => ({
      eyebrow: 'Metodología', title: 'Gestión de cambios y registro de decisiones',
      body: `<h4>Change request</h4><p>Todo cambio después del Gate 2 sigue un change request: se evalúa su impacto en horas y fecha, se presenta al cliente y solo entra con aprobación escrita. Si no cabe, se cambia por otro alcance o va a fase 2.</p>
        <h4>Registro de decisiones</h4><p>Toda decisión relevante tomada fuera de una reunión, sea entre diseño y un desarrollador o con todo el equipo, queda registrada: fecha, decisión, quién la tomó y a qué afecta.</p>
        <h4>Cascada interna</h4><p>Toda información nueva del cliente que afecte al equipo la condensa el PM y la comunica en menos de 24 h, por escrito en el canal del proyecto y en el registro de decisiones.</p>
        <h4>Herramientas</h4><p class="muted-p">Board (Jira, Workfront o la del cliente), Slack y videos cortos tipo Loom para explicar diseños o avances.</p>`
    }));
  }

  // Versión simple: comunicación, escalamiento y cambios resumidos en la misma pantalla
  function summary() {
    const el = $('#methodSummary');
    if (!el) return;
    const comm = [3, 4, 5, 6, 7].map((i) => D.commPlan[i]); // demo, reporte, bajada 24 h, bloqueos 4 h, change requests
    el.innerHTML = `
      <div class="ms-col"><h3 class="h3">Comunicación</h3><ul class="ms-list">${comm.map((c) => `<li><b>${esc(c[0])}</b><span>${esc(c[1])} · ${esc(c[2])} · ${esc(c[4])}</span></li>`).join('')}</ul></div>
      <div class="ms-col"><h3 class="h3">Ruta de escalamiento</h3><ul class="ms-list">${D.escalation.map((e) => `<li><b>${esc(e.n)}</b><span>${esc(e.when)}. ${esc(e.what)}</span></li>`).join('')}</ul></div>
      <div class="ms-col"><h3 class="h3">Gestión de cambios</h3><ul class="ms-list">
        <li><b>Change request</b><span>Desde el Gate 2, todo cambio se evalúa en horas y fecha, se presenta al cliente y entra solo con aprobación escrita.</span></li>
        <li><b>Si no cabe</b><span>Se cambia por otro alcance o pasa a una fase 2.</span></li>
        <li><b>Registro de decisiones</b><span>Toda decisión fuera de una reunión queda escrita: fecha, decisión, quién la tomó y a qué afecta.</span></li></ul></div>`;
  }

  function init() { gates(); calendar(); flow(); sheets(); summary(); }
  return { init };
})();
