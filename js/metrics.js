/* metrics.js — 7 KPIs + 14 métricas por grupo + detalle con semáforo (metas, no resultados) */
window.Metrics = (function () {
  const { $, $$, esc } = U;
  const D = DATA;
  // Las 14 métricas del documento (el KPI "críticos al entrar a UAT" se deriva de "Bugs por severidad")
  const list14 = D.metrics.filter((m) => !m.derived);

  function lightsFor(m) {
    const l = m.lights || [`Cumple la meta (${m.goalText})`, 'Desviación leve: el reporte trae causa y acción', 'Incumple la meta: se escala por la ruta de escalamiento'];
    return `<ul class="lights">
      <li><span class="status status--ok"><span class="dot"></span>Verde</span><span>${esc(l[0])}</span></li>
      <li><span class="status status--warn"><span class="dot"></span>Ámbar</span><span>${esc(l[1])}</span></li>
      <li><span class="status status--bad"><span class="dot"></span>Rojo</span><span>${esc(l[2])}</span></li></ul>`;
  }

  function open(id) {
    const m = D.metrics.find((x) => x.id === id);
    Sheet.open({
      eyebrow: `${D.metricGroups[m.g]}${m.kpi ? ' · KPI principal' : ''}`,
      title: m.name,
      body: `<ul class="kv"><li><span>Cómo se mide</span><span>${esc(m.how)}</span></li><li><span>Meta</span><span><b>${esc(m.goalText)}</b></span></li>
        <li><span>Quién la actualiza</span><span>${esc(m.owner)}</span></li><li><span>Dónde se ve</span><span>${esc(m.where)}</span></li></ul>
        <h4>Semáforo</h4>${lightsFor(m)}
        <p class="muted-p" style="margin-top:14px">Es una meta, no un resultado. Cada persona mantiene sus datos al día y el PM verifica que así sea.</p>`
    });
  }

  function init() {
    const kpis = D.metrics.filter((m) => m.kpi).sort((a, b) => a.kpi - b.kpi);
    $('#kpis').innerHTML = kpis.map((m) => `<button class="kpi" data-m="${m.id}">
      <span class="kpi-tag">${esc(D.metricGroups[m.g])}</span>
      <span class="kpi-name"><span class="dot dot--mag" aria-hidden="true"></span>${esc(m.name)}</span>
      <span class="kpi-goal">${esc(m.goal)}</span><span class="kpi-goal-text">${esc(m.goalText)}</span>
      <span class="kpi-how">${esc(m.how)}</span></button>`).join('');

    $('#metricGroups').innerHTML = D.metricGroups.map((g, gi) => `<div class="mg-group"><h4>${esc(g)}</h4>${
      list14.filter((m) => m.g === gi).map((m) => U.simple
        // Versión simple: las 14 métricas se ven pero no abren detalle
        ? `<div class="metric-row is-static${m.kpi ? ' is-kpi' : ''}"><span class="m-name"><span class="dot dot--mag" aria-hidden="true"></span>${esc(m.name)}</span><span class="m-goal">${esc(m.goalText)}</span></div>`
        : `<button class="metric-row${m.kpi ? ' is-kpi' : ''}" data-m="${m.id}"><span class="m-name"><span class="dot dot--mag" aria-hidden="true"></span>${esc(m.name)}</span><span class="m-goal">${esc(m.goalText)}</span></button>`).join('')
    }</div>`).join('');

    $$('[data-m]').forEach((b) => b.addEventListener('click', () => open(b.dataset.m)));

    Sheet.register('engagement', () => ({
      eyebrow: 'Capa aparte', title: 'Métricas del producto (engagement)',
      body: `<p>${esc(D.engagement.lead)}</p><ul class="bullets" style="margin-top:10px">${D.engagement.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>`
    }));
  }
  return { init };
})();
