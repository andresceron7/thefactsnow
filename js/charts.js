/* charts.js — Vista B del Plan global: horas por rol, por sprint y por épica */
window.Charts = (function () {
  const { $, esc, fmt, sum, role } = U;
  const D = DATA;
  let current = 'pm', show600 = false;
  const captions = {
    pm: 'Horas explícitas y justificadas: cliente, rituales y seguimiento. El PM orquesta, no ejecuta por otros.',
    ux: 'Carga al inicio: arquitectura, wireframes, UI y specs de motion. Cae después del Gate 2.',
    fe: 'El perfil más grande: animaciones GSAP, librería de patrones de motion y el interactivo tipo swipe.',
    be: 'Setup técnico, modelo ACF, filtros, formulario y despliegue. Pesa en S1 y S2.',
    qa: 'Crece desde el S4, cuando hay producto que probar.',
    all: '540 h operativas estimadas de abajo hacia arriba, por entregable. La carga se concentra al inicio a propósito.'
  };
  const roleTotal = (id) => sum(D.hoursBySprint[id]);
  const maxSingle = Math.max(...Object.values(D.hoursBySprint).flat());

  function buildSeg() {
    const el = $('#roleSeg');
    el.innerHTML = D.roles.map((r) => `<button role="tab" data-val="${r.id}" aria-selected="${r.id === 'pm'}">${r.short}</button>`).join('') +
      '<button role="tab" data-val="all" aria-selected="false">Todos</button>';
    U.seg(el, (v) => { current = v; render(); });
  }

  function render() {
    const isAll = current === 'all';
    const total = isAll ? (show600 ? 600 : 540) : roleTotal(current);
    const pct = Math.round((total / 600) * 100);
    $('#hoursBig').innerHTML = `${fmt(total)}<span class="unit">h</span><span class="pct">${pct}%</span>`;
    $('#hoursCaption').textContent = captions[current] + (isAll ? '' : ` ${pct}% de las 600 h.`);
    $('#toggle600Row').hidden = !isAll;

    // Barra apilada (solo Todos)
    if (isAll) {
      const parts = D.roles.map((r) => ({ name: r.short, h: roleTotal(r.id), fill: r.fill, ink: r.ink }));
      if (show600) parts.push({ name: 'Capacitación', h: 12, fill: D.extras.capacitacion.fill, ink: D.extras.capacitacion.ink }, { name: 'Contingencia', h: 48, fill: D.extras.contingencia.fill, ink: D.extras.contingencia.ink });
      $('#stackBar').innerHTML = parts.map((p) => `<div style="flex-grow:${p.h};background:${p.fill};color:${p.ink}" title="${esc(p.name)}: ${fmt(p.h)} h">${p.h >= 40 ? fmt(p.h) : ''}</div>`).join('');
      $('#stackLegend').innerHTML = parts.map((p) => `<span><i class="swatch" style="background:${p.fill}"></i>${esc(p.name)} ${fmt(p.h)} h</span>`).join('');
    } else {
      $('#stackBar').innerHTML = ''; $('#stackLegend').innerHTML = '';
    }

    // Barras por sprint
    const sprintTotals = D.sprints.map((_, i) => sum(D.roles.map((r) => D.hoursBySprint[r.id][i])));
    const maxH = isAll ? Math.max(...sprintTotals) : maxSingle;
    $('#sprintBars').innerHTML = D.sprints.map((s, i) => {
      const segs = isAll ? D.roles.map((r) => ({ h: D.hoursBySprint[r.id][i], fill: r.fill, name: r.short })) : [{ h: D.hoursBySprint[current][i], fill: role(current).fill, name: role(current).short }];
      const tot = sum(segs.map((x) => x.h));
      const H = 170; // px de alto máximo
      return `<div class="sb-col" title="${s.id}: ${fmt(tot)} h"><span class="sb-val">${fmt(tot)}</span><div class="sb-stack" style="height:${(tot / maxH) * H}px">${segs.map((x) => `<div style="height:${(x.h / tot) * 100}%;background:${x.fill}" title="${esc(x.name)} ${fmt(x.h)} h"></div>`).join('')}</div><span class="sb-name">${s.id} · sem ${s.weeks[0]}–${s.weeks[1]}</span></div>`;
    }).join('');

    // Lista por épica
    const list = D.epics.map((e) => ({ e, h: isAll ? sum(Object.values(e.hours)) : (e.hours[current] || 0) })).filter((x) => x.h > 0);
    $('#hoursListTitle').textContent = isAll ? 'Por épica · 540 h' : `Por épica · ${role(current).short}`;
    let items = list.map((x) => `<li><span class="k"><span class="swatch" style="background:${x.e.fill}"></span>${x.e.id} · ${esc(x.e.short)}</span><span class="v">${fmt(x.h)} h</span></li>`).join('');
    if (isAll && show600) {
      items += `<li><span class="k"><span class="swatch" style="background:${D.extras.capacitacion.fill}"></span>Bolsa de capacitación</span><span class="v">12 h</span></li>`;
      items += `<li><span class="k"><span class="swatch" style="background:${D.extras.contingencia.fill}"></span>Contingencia (solo la libera el PM)</span><span class="v">48 h</span></li>`;
    }
    $('#hoursEpicList').innerHTML = items;

    // Actividades del PM (solo PM)
    $('#pmActivitiesWrap').hidden = current !== 'pm';
    if (current === 'pm') {
      $('#pmActivities').innerHTML = D.pmActivities.map((a) => `<li><span class="k">${esc(a.name)}</span><span class="v">${fmt(a.h)} h</span></li>`).join('');
    }
  }

  function init() {
    buildSeg();
    $('#toggle600').addEventListener('change', (e) => { show600 = e.target.checked; render(); });
    render();
  }
  return { init, render };
})();
