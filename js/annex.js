/* annex.js — índice del anexo y sheets de detalle (contenido de la Parte A) */
window.Annex = (function () {
  const { $, esc, fmt, sum, role } = U;
  const D = DATA;
  const table = (head, rows, numCols = []) => `<div class="table-scroll"><table class="dtable"><thead><tr>${head.map((h, i) => `<th class="${numCols.includes(i) ? 'n' : ''}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${
    rows.map((r) => `<tr class="${r.total ? 'total' : ''}">${(r.cells || r).map((c, i) => `<td class="${numCols.includes(i) ? 'n' : ''}">${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  const topics = [
    { key: 'supuestos', t: 'Supuestos a validar', d: '10 supuestos que se validan en el kickoff', wide: true,
      body: () => `<p class="muted-p">Con alcance, fecha y horas fijas, lo que no está escrito se convierte en conflicto. Se preparan en la semana 1 y se validan en el kickoff de la semana 2.</p>` +
        table(['Supuesto', 'Por qué importa'], D.assumptions.map((a) => [esc(a[0]), `<span class="muted">${esc(a[1])}</span>`])) },
    { key: 'hallazgo', t: 'Hallazgo de alcance y videos de referencia', d: '8 / 4 en el texto vs. 7 / 3 en la lámina', wide: true,
      body: () => `<p>El texto del caso dice 8 secciones y 4 de alta animación, pero la lámina de alcance muestra 7: 3 de alta animación y 4 regulares. Hipótesis: la sección que falta es el detalle de un fact. No confundir con las "8 secciones que explican la campaña", que es un componente dentro de Campaign.</p>
        <h4>Las 8 plantillas</h4>${table(['#', 'Plantilla', 'Animación', 'Componentes'], D.templates.map((t) => [t[0], `<b>${esc(t[1])}</b>`, t[2] === 'Alta' ? '<span class="status" style="color:var(--mag-700)"><span class="dot"></span>Alta</span>' : 'Regular', `<span class="muted">${esc(t[3])}</span>`]))}
        <h4>Decisión de gestión</h4><p>Se estima sobre el escenario mayor (8 plantillas, 4 de alta animación) y se valida como supuesto en el kickoff. Si resulta ser 7 y 3, las horas liberadas pasan a contingencia.</p>
        <h4>Videos de referencia de alta animación</h4>
        <ul class="bullets"><li><b>Video 1:</b> hero con video dentro de una máscara que crece con el scroll, tipografía gigante con palabras que cambian, transiciones en perspectiva, secciones fijas con formas geométricas que se transforman, imágenes entre las líneas del texto.</li>
        <li><b>Video 2:</b> storytelling por capítulos numerados, objetos 3D que se mueven con el scroll, parallax, cortes angulares, mapa orbital, carrusel de personajes.</li>
        <li><b>Implicaciones:</b> dependen de assets de alta producción (renders 3D, ilustración, video) que no están en el contenido del cliente ni en los perfiles del equipo. El 3D normalmente requiere WebGL (Three.js), fuera del stack; dentro del stack se resuelve con imágenes prerenderizadas, parallax o secuencias de imágenes.</li></ul>` },
    { key: 'equipo', t: 'Equipo, roles y RACI', d: 'Quién es dueño de qué y cómo se ve el cliente', wide: true,
      body: () => `<p class="muted-p">El PM orquesta, no ejecuta por otros: cada rol es dueño de su trabajo y de mantenerlo actualizado, y el PM vigila que eso pase. Todos los perfiles tienen otros proyectos.</p>` +
        table(['Rol', 'Responsable de', 'Mantiene actualizado en el board'], D.team.map((r) => [`<b>${esc(r[0])}</b>`, esc(r[1]), `<span class="muted">${esc(r[2])}</span>`])) +
        `<h4>Cara al cliente</h4><ul class="bullets"><li>El PM es el punto único de contacto del día a día: dudas, problemas, cambios e imprevistos.</li><li>En el kickoff se presenta a los líderes de diseño y desarrollo y su rol durante las 12 semanas.</li><li>El cliente ve al equipo en demos y sesiones agendadas, pero las solicitudes entran siempre por el PM. Así se protegen las horas del equipo.</li></ul>
        <h4>Préstamo de capacidad entre PMs</h4><ol class="bullets"><li>Detecta el bloqueo en el board (columna Bloqueado) y estima cuánto durará la espera.</li><li>Negocia con el PM de otro proyecto donde esa persona también trabaja: le presta esas horas ahora.</li><li>Acuerda la devolución en un sprint posterior, cuando la dependencia se destrabe.</li><li>Lo registra en el registro de decisiones y ajusta la capacidad del sprint.</li></ol>` },
    { key: 'stakeholders', t: 'Radar de stakeholders', d: 'Quién entra, cuándo y para qué', wide: true,
      body: () => `<p class="muted-p">El PM mapea los stakeholders en la semana 1 y define en qué momento entra cada uno, para destrabar decisiones antes de que bloqueen al equipo.</p>` +
        table(['Stakeholder', 'Cuándo entra', 'Para qué'], D.stakeholders.map((s) => [`<b>${esc(s[0])}</b>`, esc(s[1]), `<span class="muted">${esc(s[2])}</span>`])) },
    { key: 'comunicacion', t: 'Plan de comunicación y escalamiento', d: '9 flujos de comunicación y 3 niveles de escalamiento', wide: true,
      body: () => table(['Qué', 'Para quién', 'Frecuencia', 'Canal', 'Responsable'], D.commPlan.map((r) => [`<b>${esc(r[0])}</b>`, esc(r[1]), esc(r[2]), esc(r[3]), esc(r[4])])) +
        `<h4>Ruta de escalamiento</h4><ul class="qa">${D.escalation.map((e) => `<li><b>${esc(e.n)}</b><span>${esc(e.when)}. ${esc(e.what)}</span></li>`).join('')}</ul>` },
    { key: 'estimacion', t: 'Unidades de estimación', d: 'De dónde salen las horas de cada perfil', wide: true,
      body: () => `<p class="muted-p">Las 540 h operativas salen de estimar cada entregable, no de porcentajes.</p>` +
        table(['Entregable', 'Perfil', 'Unidad', 'Horas'], D.estimationUnits.map((u) => [esc(u.d), role(u.r).short, esc(u.u), fmt(u.h)]), [3]) +
        `<p class="muted-p" style="margin-top:12px">La actividad interactiva se construye como un solo componente configurable desde ACF, para reutilizarla en varios facts sin sumar horas por cada uno.</p>` },
    { key: 'horaspm', t: 'Horas del Project Manager', d: '72 h · 12% del total',
      body: () => `<ul class="value-list">${D.pmActivities.map((a) => `<li><span class="k">${esc(a.name)}</span><span class="v">${fmt(a.h)} h</span></li>`).join('')}<li><span class="k"><b>Total</b></span><span class="v">${fmt(sum(D.pmActivities.map((a) => a.h)))} h</span></li></ul>
        <h4>Reglas de la contingencia (48 h)</h4><ul class="bullets"><li>Solo el PM libera la contingencia, para riesgos identificados en el registro. Cada uso queda registrado: motivo, horas y perfil.</li><li>Meta: no consumir más del 50% antes de la semana 8.</li><li>Si al cierre sobran horas, se negocia con los stakeholders su destino.</li></ul>` },
    { key: 'capacitacion', t: 'Bolsa de capacitación', d: '12 h separadas de la contingencia', wide: true,
      body: () => `<p class="muted-p">El stack y las dependencias no cambian, así que el equipo no puede aprender sobre la marcha sin generar bloqueos. En la semana 1 el PM hace un diagnóstico de habilidades y se reserva una bolsa propia.</p>` +
        table(['Necesidad estimada', 'Perfil', 'Cuándo', 'Horas'], [...D.training.map((t) => [esc(t.n), esc(t.who), esc(t.when), fmt(t.h)]), { total: true, cells: ['Total', '', '', fmt(sum(D.training.map((t) => t.h)))] }], [3]) +
        `<ul class="bullets" style="margin-top:12px"><li><b>Justo a tiempo:</b> cada capacitación se agenda un sprint antes de que se necesite la habilidad.</li><li><b>Formatos que ahorran horas:</b> documentación oficial con tiempo acotado, pairing y sesiones cortas con expertos de otras áreas.</li><li><b>Revisión continua:</b> en cada planning se pregunta si aparece una nueva necesidad. Si excede la bolsa, se cubre con contingencia y queda registrado.</li></ul>` },
    { key: 'cierre', t: 'Cierre: UAT, capacitación y entrega', d: 'Cuándo se da por cerrado el proyecto',
      body: () => `<p>El proyecto cierra cuando el cliente aprueba en UAT, el sitio está en producción y su equipo sabe editarlo solo.</p>
        <ul class="bullets" style="margin-top:10px"><li><b>UAT (semana 11):</b> el cliente prueba el sitio completo con contenido real; los bugs se priorizan por severidad.</li><li><b>Despliegue (semana 12):</b> a producción tras el ensayo previo, con verificación posterior.</li><li><b>Capacitación en WordPress y ACF:</b> sesión grabada de 1,5 h para los editores, más un manual breve (agregar un fact, una historia o un video). Unas 8–10 h entre PM, Backend y UX.</li><li><b>Recorrido de cierre:</b> cómo se construyó el sitio, qué quedó en el backlog para una fase 2 y cómo leer el tablero de engagement.</li><li><b>Retrospectiva del proyecto:</b> aprendizajes documentados para próximos proyectos.</li></ul>
        <h4>Negociación de horas optimizadas</h4><p>Si al cierre sobran horas de contingencia, el PM no las reparte: lleva una propuesta a los stakeholders. Quedan como margen para la agencia, se invierten en mejoras del backlog acordadas con el cliente, o se plantea un reconocimiento al equipo atado a calidad (cero bugs críticos en UAT, entrega a tiempo, rendimiento cumplido).</p>` },
    { key: 'riesgos', t: 'Registro de riesgos completo', d: '14 riesgos con señal temprana, mitigación y dueño', wide: true,
      body: () => table(['#', 'Riesgo', 'P', 'I', 'Señal temprana', 'Mitigación', 'Dueño'], [...D.risks].sort((a, b) => a.n - b.n).map((r) => [r.n, `<b>${esc(r.name)}</b>`, r.p, r.i, `<span class="muted">${esc(r.signal)}</span>`, esc(r.mit), esc(r.owner)])) },
    { key: 'preguntas', t: 'Preguntas probables', d: 'Respuestas cortas para la ronda de preguntas',
      body: () => `<ul class="qa">${D.faq.map((q) => `<li><b>${esc(q[0])}</b><span>${esc(q[1])}</span></li>`).join('')}</ul>` },
    { key: 'glosario', t: 'Glosario', d: 'Términos de gestión que se mantienen en inglés',
      body: () => `<ul class="kv">${D.glossary.map((g) => `<li><span><b style="color:var(--ink)">${esc(g[0])}</b></span><span>${esc(g[1])}</span></li>`).join('')}</ul>` }
  ];

  // Matriz épica × perfil (se abre desde el Plan global)
  function estimationMatrix() {
    const head = ['Épica', ...D.roles.map((r) => r.short), 'Total'];
    const rows = D.epics.map((e) => [`<b>${e.id}</b> · ${esc(e.short)}`, ...D.roles.map((r) => (e.hours[r.id] ? fmt(e.hours[r.id]) : '—')), `<b>${fmt(sum(Object.values(e.hours)))}</b>`]);
    const tot = D.roles.map((r) => sum(D.epics.map((e) => e.hours[r.id] || 0)));
    rows.push({ total: true, cells: ['Total', ...tot.map(fmt), fmt(sum(tot))] });
    return `<p class="muted-p">Las 540 h operativas salen de estimar cada entregable (bottom-up). E0 reúne la gestión del PM y todas las reuniones del equipo.</p>` +
      table(head, rows, [1, 2, 3, 4, 5, 6]) +
      `<ul class="value-list" style="margin-top:16px"><li><span class="k">Subtotal operativo</span><span class="v">540 h · 90%</span></li><li><span class="k">Bolsa de capacitación</span><span class="v">12 h · 2%</span></li><li><span class="k">Contingencia</span><span class="v">48 h · 8%</span></li><li><span class="k"><b>Total</b></span><span class="v">600 h</span></li></ul>
      <button class="link-btn" data-sheet="annex:estimacion">Ver unidades de estimación <svg class="ico" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`;
  }

  function init() {
    $('#annexList').innerHTML = topics.map((t, i) => `<li><button data-sheet="annex:${t.key}"><span class="a-n">${String(i + 1).padStart(2, '0')}</span><span class="a-t">${esc(t.t)}</span><span class="a-d">${esc(t.d)}</span><svg class="ico" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></li>`).join('');
    topics.forEach((t) => Sheet.register('annex:' + t.key, () => ({ eyebrow: 'Anexo', title: t.t, body: t.body(), wide: !!t.wide })));
    Sheet.register('estimation', () => ({ eyebrow: 'Plan global', title: 'Estimación por épica y perfil', body: estimationMatrix(), wide: true }));
  }
  return { init };
})();
