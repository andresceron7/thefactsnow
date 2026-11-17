/* =========================================================================
   data.js — Fuente única de datos de la presentación (Parte A del plan).
   Todas las vistas leen de aquí. Si cambias una cifra, revisa los totales:
   540 h operativas + 48 h contingencia + 12 h capacitación = 600 h.
   ========================================================================= */
window.DATA = (function () {
  const roles = [
    { id: 'pm', name: 'Project Manager', short: 'PM', initials: 'PM', fill: '#BFEBDD', ink: '#1F7F64' },
    { id: 'ux', name: 'UX Designer',     short: 'UX', initials: 'UX', fill: '#DCD5FA', ink: '#5B4BB5' },
    { id: 'fe', name: 'Frontend',        short: 'Frontend', initials: 'FE', fill: '#FDDFCC', ink: '#A8572A' },
    { id: 'be', name: 'Backend',         short: 'Backend', initials: 'BE', fill: '#D3E8FB', ink: '#2D6CA8' },
    { id: 'qa', name: 'QA',              short: 'QA', initials: 'QA', fill: '#CCEFF2', ink: '#1E7C86' }
  ];
  const extras = {
    contingencia: { name: 'Contingencia', hours: 48, fill: '#E6E8EE', ink: '#5B6478' },
    capacitacion: { name: 'Bolsa de capacitación', hours: 12, fill: '#F3F0BF', ink: '#7C7420' }
  };

  const sprints = [
    { id: 'S1', name: 'Integración y cimientos', weeks: [1, 2], focus: 'Equipo alineado, kickoff, supuestos, wireframes, setup', milestone: 'Gate 1' },
    { id: 'S2', name: 'Diseño base', weeks: [3, 4], focus: 'UI de secciones regulares, modelo ACF aprobado, componentes base del tema', milestone: 'Modelo de contenido cerrado' },
    { id: 'S3', name: 'Diseño de alta animación', weeks: [5, 6], focus: 'UI y specs de motion de las 4 secciones de alta animación e interactivos; desarrollo de secciones regulares', milestone: 'Gate 2' },
    { id: 'S4', name: 'Desarrollo I', weeks: [7, 8], focus: 'Primeras secciones de alta animación e interactivos, carga de contenido, QA funcional, instrumentación de analítica', milestone: 'Demo con contenido real' },
    { id: 'S5', name: 'Desarrollo II', weeks: [9, 10], focus: 'Resto de secciones de alta animación, formulario, contenido completo, QA en dispositivos, revisión legal', milestone: 'Code freeze al final de la semana 10' },
    { id: 'S6', name: 'Calidad y lanzamiento', weeks: [11, 12], focus: 'Regresión, corrección de bugs, UAT, despliegue, capacitación, cierre', milestone: 'Gate 3 y lanzamiento' }
  ];

  // Horas por perfil y sprint (incluye rituales y reuniones de cada perfil)
  const hoursBySprint = {
    pm: [24, 9, 9, 9, 9, 12],
    ux: [34.5, 27.5, 30, 14, 8, 6],
    fe: [18, 25, 35, 40, 42, 20],
    be: [19.5, 21.5, 15, 10, 6, 6],
    qa: [9, 6, 8, 20, 25, 22]
  };

  const epics = [
    { id: 'E0', name: 'Gestión del proyecto', short: 'Gestión y rituales', start: 1, end: 12, fill: '#E6E8EE', ink: '#5B6478', locked: true,
      scope: 'Planeación, rituales, cliente, riesgos, cambios, stakeholders. Reúne la gestión del PM y todas las reuniones del equipo (syncs, cierres de sprint, kickoffs y demos).',
      hours: { pm: 56, ux: 21.5, fe: 22, be: 17.5, qa: 14 } },
    { id: 'E1', name: 'Kickoff y discovery', short: 'Kickoff y discovery', start: 1, end: 2, fill: '#F3F0BF', ink: '#7C7420',
      scope: 'Integración del equipo, supuestos, capacidad, alcance, inventario de contenido, engagement.',
      hours: { pm: 12, ux: 10, fe: 7, be: 4, qa: 5 } },
    { id: 'E2', name: 'UX/UI y motion', short: 'UX/UI y motion', start: 1, end: 6, fill: '#DCD5FA', ink: '#5B4BB5',
      scope: 'Arquitectura, wireframes, UI, specs de animación y prototipos.',
      hours: { ux: 72 } },
    { id: 'E3', name: 'Setup técnico y modelo ACF', short: 'Setup técnico', start: 2, end: 3, fill: '#D3E8FB', ink: '#2D6CA8',
      scope: 'WordPress, modelo ACF, tema base, ambientes.',
      hours: { ux: 3.5, fe: 8, be: 17.5 } },
    { id: 'E4', name: 'Secciones regulares (4)', short: 'Secciones regulares', start: 4, end: 8, fill: '#CCEFF2', ink: '#1E7C86',
      scope: 'Maquetación, contenido dinámico y animaciones regulares.',
      hours: { fe: 32, be: 12, qa: 12 } },
    { id: 'E5', name: 'Alta animación (4) + interactivos', short: 'Alta animación', start: 5, end: 10, fill: '#FDDFCC', ink: '#A8572A',
      scope: 'GSAP con scroll y actividades interactivas, construidas sobre la librería de patrones de motion.',
      hours: { fe: 89, be: 6, qa: 16 } },
    { id: 'E6', name: 'Integración de contenido', short: 'Contenido del cliente', start: 6, end: 10, fill: '#F9D0CB', ink: '#B04A3E',
      scope: 'Carga de facts, fotos, citas y videos en WordPress.',
      hours: { ux: 4, fe: 4, be: 4 } },
    { id: 'E7', name: 'QA, rendimiento y accesibilidad', short: 'QA y rendimiento', start: 7, end: 11, fill: '#BFEBDD', ink: '#1F7F64',
      scope: 'Funcional, crossbrowser, dispositivos, rendimiento de animaciones, regresión.',
      hours: { ux: 6, fe: 18, be: 6, qa: 35 } },
    { id: 'E8', name: 'UAT, lanzamiento y cierre', short: 'UAT y lanzamiento', start: 11, end: 12, fill: '#7FD8BE', ink: '#1F2A44',
      scope: 'Aprobación final, despliegue, capacitación, entrega, retrospectiva del proyecto.',
      hours: { pm: 4, ux: 3, be: 11, qa: 8 } }
  ];

  // Posiciones en "semanas" desde el inicio (0 = inicio de la semana 1)
  const gates = [
    { id: 'kickoff', name: 'Kickoff', week: 2, at: 1.5, label: 'Semana 2',
      approves: 'Alcance (8 plantillas), supuestos, RACI, reglas de juego y calendario de entregas del cliente.' },
    { id: 'p1', name: 'Gate 1', week: 3, at: 2, label: 'Cierre de la semana 2 → aprobado al inicio de la 3',
      approves: 'Mapa del sitio, wireframes e inventario de contenido. Mientras el cliente revisa (máx. 3 días hábiles), UX avanza sobre la arquitectura ya validada en el kickoff.' },
    { id: 'p2', name: 'Gate 2', week: 6, at: 6, label: 'Fin de la semana 6',
      approves: 'Diseño UI y specs de motion de las 8 plantillas. Desde aquí, todo cambio entra como change request.' },
    { id: 'p3', name: 'Gate 3', week: 11, at: 10.5, label: 'Semana 11',
      approves: 'UAT: el cliente prueba el sitio completo y lo aprueba.' },
    { id: 'launch', name: 'Lanzamiento', week: 12, at: 11.6, label: 'Semana 12',
      approves: 'Despliegue a producción, capacitación y entrega.' }
  ];

  const clientMilestones = [
    { short: 'Accesos', name: 'Accesos (hosting, dominio, sitio actual) y contenido existente', due: 'Semana 2 (solicitud previa en la semana 1)', at: 1.25, why: 'Setup técnico y auditoría' },
    { short: 'Alcance', name: 'Aprobación de alcance, supuestos y reglas de juego', due: 'Semana 2, en el kickoff', at: 1.75, why: 'Arrancar el plan sin ambigüedades' },
    { short: 'P1', name: 'Aprobación de mapa del sitio y wireframes (Gate 1)', due: 'Inicio de la semana 3', at: 2.25, why: 'Diseño UI del S2' },
    { short: 'Contenido regular', name: 'Contenido de las 4 secciones regulares (textos, fotos, facts)', due: 'Fin de la semana 4', at: 4, why: 'Desarrollo de secciones regulares en S3–S4' },
    { short: 'P2', name: 'Aprobación de UI y specs de motion (Gate 2)', due: 'Fin de la semana 6', at: 5.75, why: 'Desarrollo de alta animación en S4–S5' },
    { short: 'Contenido alta anim.', name: 'Contenido de alta animación y videos testimoniales', due: 'Fin de la semana 6', at: 6, why: 'Ensamblaje de Home, Campaign, Vaping Stories y detalle de fact', critical: true },
    { short: 'Legal', name: 'Revisión legal de textos y formulario', due: 'Semana 10', at: 9.5, why: 'Lanzamiento sin bloqueos de cumplimiento' },
    { short: 'UAT', name: 'UAT y aprobación final (Gate 3)', due: 'Semana 11', at: 10.5, why: 'Despliegue en la semana 12' }
  ];

  const criticalPath = 'Modelo de contenido ACF → Gate 2 (UI y motion de alta animación) → contenido de alta animación → desarrollo de patrones y secciones de alta animación → QA de rendimiento en dispositivos → UAT → lanzamiento.';

  const pmActivities = [
    { name: 'Cliente: kickoff, demos, gates, reportes semanales, change requests', h: 20 },
    { name: 'Rituales internos: syncs y cierres de sprint', h: 16 },
    { name: 'Seguimiento del board, riesgos, bloqueos y registro de decisiones', h: 14 },
    { name: 'Planeación y setup del proyecto', h: 12 },
    { name: 'Stakeholders: áreas internas, proveedores y coordinación con otros PMs', h: 6 },
    { name: 'Cierre: UAT, capacitación y retrospectiva del proyecto', h: 4 }
  ];

  const estimationUnits = [
    { d: 'Arquitectura de información + wireframes de 8 plantillas', r: 'ux', u: 'Paquete', h: 14 },
    { d: 'UI de plantilla regular', r: 'ux', u: '4 × 5 h', h: 20 },
    { d: 'UI de plantilla de alta animación', r: 'ux', u: '4 × 6 h', h: 24 },
    { d: 'Specs de motion y prototipos de patrones', r: 'ux', u: 'Paquete', h: 14 },
    { d: 'Maquetación de plantilla regular', r: 'fe', u: '4 × 8 h', h: 32 },
    { d: 'Patrón de motion reutilizable (GSAP + ScrollTrigger)', r: 'fe', u: '5 × 9 h', h: 45 },
    { d: 'Ensamblaje de plantilla de alta animación con patrones', r: 'fe', u: '4 × 7 h', h: 28 },
    { d: 'Actividad interactiva tipo swipe', r: 'fe', u: '1 componente reutilizable', h: 16 },
    { d: 'Corrección de bugs', r: 'fe', u: 'Reserva', h: 18 },
    { d: 'Tipos de contenido y campos ACF de 8 plantillas', r: 'be', u: 'Paquete', h: 8 },
    { d: 'Filtros, formulario y contenido dinámico', r: 'be', u: 'Paquete', h: 12 },
    { d: 'Ensayo de despliegue, despliegue y capacitación', r: 'be', u: 'Paquete', h: 11 },
    { d: 'Crossbrowser, dispositivos, rendimiento, accesibilidad y regresión', r: 'qa', u: 'Paquete', h: 35 }
  ];

  const training = [
    { n: 'Diagnóstico de habilidades (matriz de conocimiento por perfil)', who: 'PM + todos', when: 'Semana 1', h: 2 },
    { n: 'GSAP ScrollTrigger avanzado y optimización de rendimiento', who: 'Frontend', when: 'S1, junto a la prueba de concepto', h: 3 },
    { n: 'Lenguaje común de specs de motion (tiempos, easings, disparadores)', who: 'UX + Frontend', when: 'S2, antes de diseñar alta animación', h: 2 },
    { n: 'Accesibilidad WCAG y movimiento reducido', who: 'UX, Frontend, QA', when: 'S2', h: 3 },
    { n: 'ACF avanzado (campos flexibles y bloques a la medida)', who: 'Backend', when: 'S1–S2', h: 1 },
    { n: 'Pruebas de rendimiento de animaciones en dispositivos', who: 'QA', when: 'S3, antes de que arranque su carga', h: 1 }
  ];

  /* ---------- Sprint 1 ----------
     split: horas por perfil. Las tareas compartidas se reparten en partes iguales.
     Con este reparto: PM 24 · UX 34,5 · FE 18 · BE 19,5 · QA 8,75 (≈ 9) = 104,75 (≈ 105). */
  const s1 = (k, week, title, full, split) => ({ k, week, title, full, split, h: Object.values(split).reduce((a, b) => a + b, 0) });
  const sprint1Tasks = [
    s1('S1-01', 1, 'Plan base', 'Plan base: cronograma, épicas y reparto de horas', { pm: 2 }),
    s1('S1-02', 1, 'Análisis de capacidad', 'Análisis de capacidad: acordar con cada líder de área las horas por semana de cada perfil', { pm: 2 }),
    s1('S1-03', 1, 'Mapa de stakeholders', 'Mapa de stakeholders y plan de involucramiento (cliente, áreas internas, proveedores)', { pm: 1.5 }),
    s1('S1-04', 1, 'Setup del flujo asíncrono', 'Setup del flujo asíncrono: board, canales de Slack, registro de decisiones y de riesgos, plantilla de reporte', { pm: 1.5 }),
    s1('S1-05', 1, 'Kickoff interno (90 min)', 'Kickoff interno (90 min): contexto, alcance, roles, reglas de comunicación', { pm: 1.5, ux: 1.5, fe: 1.5, be: 1.5, qa: 1.5 }),
    s1('S1-06', 1, 'Taller DoR / DoD (60 min)', 'Taller de Definition of Ready / Done y criterios técnicos: dispositivos, rendimiento, accesibilidad (60 min)', { pm: 1, ux: 1, fe: 1, be: 1, qa: 1 }),
    s1('S1-07', 1, 'Supuestos y solicitud previa al cliente', 'Lista de supuestos y preguntas, y solicitud previa al cliente (accesos, hosting, contenido existente, cómo miden hoy el engagement)', { pm: 0.75, ux: 0.75, fe: 0.75, be: 0.75 }),
    s1('S1-08', 1, 'Auditoría y catálogo de patrones', 'Auditoría del sitio actual, análisis de los videos de referencia y catálogo inicial de patrones de motion', { ux: 6 }),
    s1('S1-09', 1, 'Revisión técnica de hosting', 'Revisión técnica: hosting, ambientes, restricciones de seguridad', { be: 3 }),
    s1('S1-10', 1, 'Prueba de concepto en móvil', 'Prueba de concepto: el patrón más exigente de las referencias (video con máscara que crece con el scroll) en móvil, para medir esfuerzo y riesgo', { fe: 6 }),
    s1('S1-11', 1, 'Estrategia de pruebas', 'Estrategia de pruebas y borrador de matriz de dispositivos', { qa: 3 }),
    s1('S1-12', 2, 'Preparación del kickoff', 'Preparación del kickoff con cliente', { pm: 1, ux: 1 }),
    s1('S1-13', 2, 'Kickoff con cliente (90 min)', 'Kickoff con cliente (90 min): presentación del equipo y roles, cronograma, reglas de aprobación, supuestos', { pm: 1.5, ux: 1.5, fe: 1.5, be: 1.5 }),
    s1('S1-14', 2, 'Sesión de engagement (60 min)', 'Sesión de entendimiento de engagement (60 min): cómo lo miden hoy y qué esperan del nuevo sitio', { pm: 1, ux: 1 }),
    s1('S1-15', 2, 'Acta, supuestos y RACI', 'Acta del kickoff, supuestos validados y matriz RACI firmada', { pm: 1 }),
    s1('S1-16', 2, 'Bajada al equipo', 'Bajar lo aprendido al equipo: resumen escrito y video corto', { pm: 1 }),
    s1('S1-17', 2, 'Consultas a analítica y legal', 'Consultas con áreas internas (analítica, legal) según lo levantado', { pm: 1 }),
    s1('S1-18', 2, 'Inventario de contenido', 'Inventario de contenido con fechas de entrega comprometidas por el cliente', { pm: 1, ux: 1 }),
    s1('S1-19', 2, 'Arquitectura y mapa del sitio', 'Arquitectura de información y mapa del sitio', { ux: 6 }),
    s1('S1-20', 2, 'Wireframes de 8 secciones', 'Wireframes de baja fidelidad de las 8 secciones', { ux: 8 }),
    s1('S1-21', 2, 'Modelo de contenido ACF v1', 'Modelo de contenido ACF v1', { ux: 3.5, be: 3.5 }),
    s1('S1-22', 2, 'Ambientes y WordPress base', 'Ambientes (local y staging), repositorio y WordPress base', { be: 6 }),
    s1('S1-23', 2, 'Tema base', 'Tema base: estructura y configuración de Tailwind, SASS y GSAP', { fe: 5 }),
    s1('S1-24', 2, 'Plan de pruebas v1', 'Plan de pruebas v1 y matriz de dispositivos aprobada', { qa: 2 }),
    s1('S1-25', 2, 'Gate 1: presentación', 'Gate 1: presentación de mapa del sitio y wireframes al cliente (aprobación en máx. 3 días hábiles)', { pm: 1, ux: 1 }),
    s1('S1-T1', 0, 'Syncs martes y jueves', 'Syncs martes y jueves (15 min)', { pm: 1, ux: 1, fe: 1, be: 1 }),
    s1('S1-T2', 0, 'Reporte semanal de estado', 'Reporte semanal de estado', { pm: 1 }),
    s1('S1-T3', 0, 'Cierre de sprint (75 min)', 'Cierre de sprint (75 min): review, retrospectiva y planning', { pm: 1.25, ux: 1.25, fe: 1.25, be: 1.25, qa: 1.25 }),
    s1('S1-T4', 0, 'Gestión asíncrona', 'Gestión asíncrona: seguimiento, bloqueos, registro de decisiones', { pm: 2 })
  ];
  // Épica de cada tarea del Sprint 1 (inferida del alcance de cada épica; el documento no la asigna por tarea).
  // E0 reúne gestión, kickoffs y rituales; E1 integración, supuestos, capacidad y discovery; E2 diseño; E3 setup y ACF.
  const s1Epic = {
    'S1-01': 'E0', 'S1-02': 'E1', 'S1-03': 'E0', 'S1-04': 'E0', 'S1-05': 'E0', 'S1-06': 'E1', 'S1-07': 'E1',
    'S1-08': 'E2', 'S1-09': 'E3', 'S1-10': 'E1', 'S1-11': 'E1', 'S1-12': 'E1', 'S1-13': 'E0', 'S1-14': 'E1',
    'S1-15': 'E0', 'S1-16': 'E0', 'S1-17': 'E0', 'S1-18': 'E1', 'S1-19': 'E2', 'S1-20': 'E2', 'S1-21': 'E3',
    'S1-22': 'E3', 'S1-23': 'E3', 'S1-24': 'E1', 'S1-25': 'E2',
    'S1-T1': 'E0', 'S1-T2': 'E0', 'S1-T3': 'E0', 'S1-T4': 'E0'
  };
  sprint1Tasks.forEach((t) => (t.epic = s1Epic[t.k]));
  const sprint1Weeks = [
    { week: 1, name: 'Semana 1', sub: 'Integración interna, sin cliente' },
    { week: 2, name: 'Semana 2', sub: 'Entrada del cliente: kickoff y Gate 1' },
    { week: 0, name: 'Transversal', sub: 'Durante las 2 semanas' }
  ];
  const sprint1Goal = 'Equipo alineado y organizado, cliente que entiende cómo vamos a trabajar y aprobadas las decisiones que no pueden cambiar después.';
  const sprint1Done = [
    'Capacidad del equipo confirmada y flujo asíncrono funcionando.',
    'Definition of Ready / Done y criterios técnicos documentados.',
    'Diagnóstico de habilidades hecho y capacitaciones agendadas.',
    'Kickoff realizado: alcance de 8 plantillas, supuestos, RACI, punto único de contacto, reglas de aprobación y calendario de entregas del cliente aprobados.',
    'Línea base y definición inicial de engagement documentadas.',
    'Inventario de contenido con fechas de entrega comprometidas.',
    'Mapa del sitio y wireframes presentados al cliente (Gate 1); modelo de contenido ACF v1 en revisión.',
    'Ambientes y tema base listos para que el Sprint 2 arranque desarrollo.',
    'Riesgo de rendimiento validado con la prueba de concepto del patrón más exigente.',
    'Catálogo inicial de patrones de motion definido.'
  ];

  /* ---------- Metodología ---------- */
  const rituals = [
    { id: 'daily', name: 'Daily asíncrona', fmt: 'Cada persona reporta en Slack o en el board: qué hice, qué haré, qué me bloquea', dur: 'Asíncrona', who: 'Todo el equipo', cost: '~0 h de reunión' },
    { id: 'sync', name: 'Sync corta', fmt: 'Martes y jueves, equipo core (UX, Front, Back; QA desde el sprint 3)', dur: '15 min', who: 'PM, UX, Frontend, Backend (QA desde S3)', cost: '1 h por sync · ~25 h en 12 semanas' },
    { id: 'close', name: 'Cierre de sprint', fmt: 'Un solo bloque: review (30) + retrospectiva (20) + planning del siguiente sprint (25)', dur: '75 min', who: 'Todo el equipo', cost: '6,25 h por sprint · ~35 h en 12 semanas' },
    { id: 'demo', name: 'Demo de avance', fmt: 'Al cierre de cada sprint, con avances reales', dur: '30–45 min', who: 'Cliente, PM y líderes de diseño y desarrollo', cost: 'Incluida en E0 (cliente)' },
    { id: 'report', name: 'Reporte semanal', fmt: 'Asíncrono, con semáforo: avance, horas consumidas vs. plan, riesgos y pendientes del cliente', dur: 'Asíncrono', who: 'Cliente y dirección de cuenta', cost: '1 h por semana del PM' }
  ];
  const dor = ['Diseño aprobado', 'Specs de motion', 'Contenido real o definido'];
  const dod = ['Funciona en la matriz de dispositivos acordada', 'Pasa QA', 'Cumple accesibilidad, incluida la alternativa de movimiento reducido', 'Cumple el presupuesto de rendimiento', 'Está cargada en WordPress'];
  const boardFlow = ['Backlog', 'Ready', 'En progreso', 'Bloqueado', 'En revisión / QA', 'Done'];

  const commPlan = [
    ['Daily asíncrona', 'Equipo', 'Diaria', 'Slack / board', 'Cada persona'],
    ['Sync de equipo', 'Equipo core', 'Martes y jueves, 15 min', 'Videollamada', 'PM'],
    ['Cierre de sprint (review, retro, planning)', 'Equipo', 'Cada 2 semanas, 75 min', 'Videollamada', 'PM'],
    ['Demo de avance', 'Cliente', 'Cada 2 semanas, 30–45 min', 'Videollamada', 'PM + líderes'],
    ['Reporte de estado con semáforo', 'Cliente y dirección de cuenta', 'Semanal', 'Correo + dashboard', 'PM'],
    ['Bajada de información nueva del cliente', 'Equipo', 'En menos de 24 h', 'Canal del proyecto + registro de decisiones', 'PM'],
    ['Bloqueos', 'PM', 'En máximo 4 h hábiles', 'Columna Bloqueado + Slack', 'Quien se bloquea'],
    ['Change requests', 'Cliente', 'Cuando surgen', 'Documento + aprobación escrita', 'PM'],
    ['Consultas a áreas internas y proveedores', 'Analítica, legal, TI, otros PMs', 'Según el radar de stakeholders', 'Reunión corta o Slack', 'PM']
  ];
  const escalation = [
    { n: 'Nivel 1 — PM', when: 'Hasta 48 h', what: 'Bloqueos del día a día, ajustes de prioridad, préstamo de capacidad entre PMs.' },
    { n: 'Nivel 2 — Líderes de área', when: 'Capacidad por debajo del 90% o bloqueo de más de 48 h', what: 'Reasignar horas o personas.' },
    { n: 'Nivel 3 — Dirección de cuenta y contacto del cliente', when: 'En riesgo un gate, la fecha o el presupuesto', what: 'Renegociar alcance, fecha o uso de contingencia.' }
  ];

  /* ---------- Métricas ---------- */
  const metricGroups = ['Tiempo y presupuesto', 'Avance y flujo', 'Calidad', 'Cliente'];
  const metrics = [
    { id: 'm1', g: 0, name: 'Horas consumidas vs. avance real', how: '% de horas gastadas comparado con % de trabajo terminado', goal: '≤5%', goalText: 'Desviación ≤5%', kpi: 1,
      lights: ['Desviación ≤5%', 'Desviación entre 5% y 10%', 'Desviación >10%'], owner: 'Cada persona registra sus horas; el PM consolida', where: 'Dashboard del board y reporte semanal' },
    { id: 'm2', g: 0, name: 'Hitos en fecha', how: 'Gates y entregables grandes cumplidos a tiempo', goal: '100%', goalText: '100% de los gates en fecha', kpi: 2,
      owner: 'PM', where: 'Timeline del proyecto y reporte semanal' },
    { id: 'm3', g: 0, name: 'Uso de la contingencia', how: '% de las 48 h usado vs. % del tiempo transcurrido', goal: '≤50%', goalText: '≤50% antes de la semana 8',
      owner: 'PM (único que libera contingencia)', where: 'Registro de contingencia y reporte semanal' },
    { id: 'm4', g: 1, name: 'Cumplimiento del sprint', how: 'Historias comprometidas vs. terminadas', goal: '≥85%', goalText: '≥85% por sprint', kpi: 3,
      owner: 'Cada persona actualiza sus historias; el PM valida en el cierre', where: 'Board y review del sprint' },
    { id: 'm5', g: 1, name: 'Burndown / burnup', how: 'Trabajo restante del sprint y avance acumulado del proyecto', goal: 'Tendencia', goalText: 'Tendencia hacia la línea ideal',
      owner: 'Generado por el board con los datos de cada persona', where: 'Dashboard del board' },
    { id: 'm6', g: 1, name: 'Edad del backlog', how: 'Tareas sin moverse por más de un sprint', goal: '0', goalText: '0 tareas con más de 2 sprints', kpi: 5,
      owner: 'PM, en cada planning', where: 'Board (filtro por antigüedad)' },
    { id: 'm7', g: 1, name: 'Tiempo de bloqueo', how: 'Duración de una tarea en la columna Bloqueado', goal: '<48 h', goalText: 'Resolución en <48 h', kpi: 4,
      owner: 'Quien se bloquea lo reporta en ≤4 h hábiles; el PM lo resuelve o escala', where: 'Columna Bloqueado del board' },
    { id: 'm8', g: 1, name: 'Capacidad real vs. comprometida', how: 'Horas dedicadas por persona vs. las acordadas con su líder', goal: '≥90%', goalText: '≥90% de lo acordado',
      owner: 'PM con cada líder de área', where: 'Reporte semanal de capacidad' },
    { id: 'm9', g: 2, name: 'Bugs por severidad', how: 'Críticos, altos, medios y bajos', goal: 'C · A · M · B', goalText: 'Se reportan por severidad cada semana desde S4', kpi: 6,
      owner: 'QA', where: 'Board de bugs y reporte semanal' },
    { id: 'm9b', g: 2, name: 'Bugs críticos al entrar a UAT', how: 'Bugs críticos abiertos el día que arranca UAT', goal: '0', goalText: '0 críticos al entrar a UAT', kpi: 7, derived: true,
      owner: 'QA, verificado por el PM antes del Gate 3', where: 'Board de bugs' },
    { id: 'm10', g: 2, name: 'Aprobación a la primera', how: '% de historias que pasan QA sin devolverse', goal: '≥80%', goalText: '≥80%',
      owner: 'QA', where: 'Board (columna En revisión / QA)' },
    { id: 'm11', g: 2, name: 'Rendimiento técnico', how: 'Fluidez de animaciones y velocidad de carga en móvil', goal: 'Presupuesto', goalText: 'Según el presupuesto acordado en el Sprint 1',
      owner: 'Frontend + QA', where: 'Pruebas en dispositivos reales' },
    { id: 'm12', g: 3, name: 'Tiempo de aprobación', how: 'Días que tarda el cliente en aprobar vs. lo acordado', goal: '≤3 días', goalText: '≤3 días hábiles',
      owner: 'PM', where: 'Registro de decisiones y reporte semanal' },
    { id: 'm13', g: 3, name: 'Contenido a tiempo', how: '% de contenido entregado en la fecha comprometida', goal: '100%', goalText: '100%',
      owner: 'PM', where: 'Inventario de contenido' },
    { id: 'm14', g: 3, name: 'Satisfacción', how: 'Pulso de 1 a 5 al final de cada demo', goal: '≥4', goalText: '≥4',
      owner: 'PM', where: 'Encuesta al cierre de cada demo' }
  ];
  const engagement = {
    lead: 'Miden si el sitio cumple el objetivo del cliente, no si el proyecto se ejecuta bien.',
    points: [
      'Se definen con el cliente en la semana 2, a partir de cómo mide hoy (línea base del sitio actual).',
      'Hipótesis iniciales: profundidad de scroll, actividades interactivas completadas, tiempo por sección, contenido compartido y clics hacia los recursos para dejar de fumar.',
      'Analítica se instrumenta en el S4 y queda un tablero de medición en la entrega.',
      'La definición se revisa en cada demo, porque la percepción del cliente cambia al ver el producto. El PM baja cada ajuste al equipo.'
    ]
  };

  /* ---------- Riesgos ---------- */
  const lvl = { Alta: 3, Media: 2, Baja: 1, Alto: 3, Medio: 2, Bajo: 1 };
  const risks = [
    { n: 1, name: 'Acumulación de backlog', desc: 'Tareas que se aplazan por otras prioridades', p: 'Alta', i: 'Alto', top: true,
      signal: 'Tareas con más de un sprint sin moverse', mit: 'Revisar la edad del backlog en cada planning; ninguna tarea pasa 2 sprints sin decidirse (se hace, se replanifica o se descarta con el cliente); priorización MoSCoW.', owner: 'PM' },
    { n: 2, name: 'Equipo compartido', desc: 'Urgencias de otros proyectos que roban horas', p: 'Alta', i: 'Alto', top: true,
      signal: 'Capacidad real por debajo del 90% de lo acordado', mit: 'Acuerdo de capacidad con cada líder en la semana 1; seguimiento semanal; ruta de escalamiento; préstamo y devolución de horas entre PMs.', owner: 'PM' },
    { n: 3, name: 'Retrasos del cliente', desc: 'Decisiones, aprobaciones o contenido fuera de plazo', p: 'Alta', i: 'Alto', top: true,
      signal: 'Aprobaciones fuera del plazo acordado', mit: 'Plazos y fechas límite firmados en el kickoff; contenido provisional para no frenar desarrollo; tareas alternas en Ready; impacto en fecha documentado y comunicado.', owner: 'PM' },
    { n: 4, name: 'Bloqueos silenciosos', desc: 'Alguien se queda detenido sin avisar', p: 'Media', i: 'Alto', top: true,
      signal: 'Tarjetas sin movimiento varios días', mit: 'Columna Bloqueado obligatoria; reportar un bloqueo en máximo 4 h hábiles; revisión diaria del board por el PM; cultura de que reportar es bueno.', owner: 'PM + equipo' },
    { n: 13, name: 'Brecha de expectativas de assets', desc: 'El cliente espera el nivel de las referencias (3D, renders) sin assets ni WebGL en el alcance', p: 'Alta', i: 'Alto', top: true,
      signal: 'El cliente cita las referencias en el kickoff o en la revisión de diseño', mit: 'Acordar en el kickoff qué incluye la alta animación; mostrar la prueba de concepto y el catálogo de patrones antes del Gate 2; producción 3D solo por change request o con otra área.', owner: 'PM + UX' },
    { n: 5, name: 'Rendimiento de animaciones', desc: 'Animaciones lentas en móviles de gama media', p: 'Media', i: 'Alto',
      signal: 'Prueba de concepto con baja fluidez', mit: 'Prueba de concepto en S1; presupuesto de rendimiento; QA en dispositivos reales desde S3–S4.', owner: 'Frontend + QA' },
    { n: 6, name: 'Cambios de alcance', desc: 'Cambios después de aprobado el diseño', p: 'Media', i: 'Alto',
      signal: 'Pedidos "pequeños" en demos o por correo', mit: 'Change request con impacto en horas y fecha, aprobado por escrito.', owner: 'PM' },
    { n: 7, name: 'Contenido incompleto', desc: 'Contenido incompleto o en formato incorrecto', p: 'Media', i: 'Medio',
      signal: 'Entregas parciales o sin especificaciones', mit: 'Plantillas de contenido alineadas al modelo ACF; especificaciones de cada recurso en S1.', owner: 'PM + UX' },
    { n: 8, name: 'Cumplimiento normativo', desc: 'Accesibilidad y datos de usuarios jóvenes', p: 'Media', i: 'Alto',
      signal: 'Requisitos sin confirmar en la semana 2', mit: 'Consulta con legal en S1; movimiento reducido en la Definition of Done.', owner: 'PM + UX' },
    { n: 9, name: 'Despliegue en infraestructura del cliente', desc: 'Hosting, permisos, seguridad', p: 'Media', i: 'Alto',
      signal: 'Accesos no entregados en la semana 3', mit: 'Accesos solicitados en el kickoff; staging igual a producción; ensayo de despliegue antes de la semana 11.', owner: 'Backend' },
    { n: 10, name: 'Ausencias y festivos', desc: 'Festivos de Colombia y EE. UU. y vacaciones', p: 'Media', i: 'Medio',
      signal: 'Calendario sin revisar', mit: 'Mapear festivos y vacaciones en S1; documentación para que alguien pueda cubrir.', owner: 'PM' },
    { n: 11, name: 'Subestimar los interactivos', desc: 'Las experiencias interactivas crecen al estimarlas', p: 'Media', i: 'Medio',
      signal: 'Historias que crecen al estimarlas', mit: 'Timeboxing por interactivo; si no alcanza, se simplifica con el cliente.', owner: 'PM + Frontend' },
    { n: 12, name: 'Brecha de conocimiento', desc: 'El equipo no domina una tecnología, herramienta o funcionalidad que el proyecto exige', p: 'Media', i: 'Alto',
      signal: 'Estimaciones que crecen o tareas que se estancan por "investigar cómo se hace"', mit: 'Diagnóstico de habilidades en la semana 1; bolsa de capacitación de 12 h agendada justo a tiempo; pairing con expertos internos; revisión en cada planning.', owner: 'PM + líderes' },
    { n: 14, name: 'Inconsistencia de alcance', desc: '8/4 en el texto vs. 7/3 en la lámina', p: 'Alta', i: 'Medio',
      signal: 'Ya identificada', mit: 'Estimar sobre 8/4; validar en el kickoff; si es 7/3, las horas liberadas pasan a contingencia.', owner: 'PM' }
  ];
  const chain = [
    { name: 'Equipo compartido', desc: 'Una urgencia de otro proyecto le quita horas a una persona.', metric: 'Capacidad real vs. comprometida', goal: '≥90%' },
    { name: 'Bloqueo silencioso', desc: 'Esa persona, o alguien que la espera, queda detenida sin avisar.', metric: 'Tiempo de bloqueo', goal: '<48 h' },
    { name: 'Backlog acumulado', desc: 'Las tareas se aplazan sprint tras sprint.', metric: 'Edad del backlog', goal: '0 tareas > 2 sprints' },
    { name: 'Fecha en riesgo', desc: 'Con 12 semanas fijas, el retraso acumulado llega a la entrega.', metric: 'Horas vs. avance y uso de la contingencia', goal: '≤5% · ≤50% antes de S8' }
  ];

  /* ---------- Anexo ---------- */
  const assumptions = [
    ['El sitio es en un solo idioma (inglés)', 'Una versión bilingüe cambiaría el alcance y las horas'],
    ['Los videos se alojan en YouTube o Vimeo', 'Alojarlos en el servidor afecta rendimiento y hosting'],
    ['El hosting y el dominio los provee el cliente', 'Puede haber restricciones de seguridad que afecten el despliegue'],
    ['La migración del contenido actual no está incluida', 'Si se incluye, es una épica nueva'],
    ['El cliente nombra un único punto de contacto con poder de decisión', 'Varios aprobadores multiplican el riesgo de retraso'],
    ['Aprobaciones en máximo 3 días hábiles y 2 rondas de revisión por entregable', 'Sin plazos, la fecha fija no se puede proteger'],
    ['Las actividades interactivas no guardan datos personales de usuarios', 'Si capturan datos de menores, aplican requisitos legales adicionales'],
    ['El sitio debe cumplir criterios de accesibilidad (WCAG)', 'Entidad pública de EE. UU.; afecta el diseño del motion'],
    ['Son 8 plantillas con 4 de alta animación, siendo el detalle de fact la 4.ª (la lámina muestra 7 y 3)', 'Define el alcance de diseño, desarrollo y QA; se estima sobre el escenario mayor'],
    ['La alta animación se construye con el material del cliente, tipografía, formas y video; no incluye producción 3D ni ilustración', 'Las referencias usan renders 3D; producirlos sería un change request o trabajo de otra área']
  ];
  const templates = [
    [1, 'Home', 'Alta', 'Banner slider + CTA, interacción con facts, preview de historias, About Us'],
    [2, 'Campaign', 'Alta', 'Banner, 8 secciones que explican la campaña, videos, más facts'],
    [3, 'Vaping Stories', 'Alta', 'Videos testimoniales'],
    [4, 'Detalle de fact (hipótesis)', 'Alta', 'Fact + foto + cita, actividad interactiva para aprender'],
    [5, 'Facts (listado)', 'Regular', 'Filtro por interés, lista de facts'],
    [6, 'About Us', 'Regular', 'Banner, misión, datos'],
    [7, 'Quitting Tips', 'Regular', 'Banner, componentes informativos, más facts'],
    [8, 'Contact', 'Regular', 'Banner, formulario, más facts']
  ];
  const team = [
    ['Project Manager', 'Plan, seguimiento, cliente y aprobaciones, riesgos, bloqueos, cambios, horas', 'Épicas, gates, registro de riesgos y de decisiones, reporte semanal'],
    ['UX Designer', 'Arquitectura de información, wireframes, UI, specs de motion, prototipos', 'Sus historias de diseño y su estado'],
    ['Frontend', 'Tema WordPress, maquetación, animaciones GSAP, microinteracciones', 'Sus historias de desarrollo, bloqueos y horas'],
    ['Backend', 'Tipos de contenido y campos ACF, filtros, formulario, rendimiento, despliegue', 'Sus historias de desarrollo, bloqueos y horas'],
    ['QA', 'Plan de pruebas, pruebas funcionales, crossbrowser, dispositivos, rendimiento, regresión', 'Bugs, severidad y estado de cada prueba']
  ];
  const stakeholders = [
    ['Cliente: punto de contacto y aprobadores', 'Semanas 2, 6, 11 y demos quincenales', 'Kickoff, gates de aprobación, contenido, UAT'],
    ['Analítica de datos', 'Semanas 2, 8–9 y 12', 'Línea base de engagement, instrumentación de eventos, tablero de medición al cierre'],
    ['Legal / cumplimiento', 'Semanas 2 y 10', 'Datos de usuarios jóvenes, privacidad, accesibilidad; revisión de textos y formularios antes del lanzamiento'],
    ['TI / proveedores del cliente', 'Semanas 1–3 y 11–12', 'Accesos y hosting; despliegue a producción'],
    ['Otros PMs de la organización', 'Todo el proyecto', 'Acuerdos de capacidad y préstamo o devolución de horas'],
    ['Otras áreas o proveedores externos', 'Según se necesite', 'Destrabar funcionalidades que dependan de decisiones o asesoría fuera del equipo']
  ];
  const faq = [
    ['¿Por qué la gestión y las reuniones (E0) pesan 24%?', 'Es el costo real de coordinar 5 perfiles compartidos durante 12 semanas. Ya está optimizado: sin daily sincrónica, 2 syncs de 15 min por semana y un solo cierre de sprint de 75 min. El PM solo es el 12%.'],
    ['¿Por qué no hay daily?', 'Una daily de 15 min con 5 personas costaría 75 h, el 12,5% del presupuesto. La reemplaza una daily asíncrona escrita y la columna Bloqueado.'],
    ['¿Qué pasa si el cliente no entrega el contenido a tiempo?', 'Las fechas límite están firmadas desde el kickoff, un sprint antes de que se necesiten. Si se retrasa: contenido provisional para no frenar desarrollo, tareas alternas en Ready, préstamo de capacidad entre PMs e impacto en fecha documentado y escalado.'],
    ['¿Cómo llegaste a 180 h de Frontend?', 'Por unidades: 5 patrones de motion de 9 h, 4 plantillas regulares de 8 h, 4 ensamblajes de alta animación de 7 h, 16 h del interactivo, 18 h de bugs, más setup y reuniones.'],
    ['¿Y si son 7 secciones y no 8?', 'Se estimó sobre el escenario mayor. Si se confirma 7 / 3, las horas liberadas pasan a contingencia.'],
    ['¿Qué pasa si el cliente pide algo parecido a los videos de referencia, con 3D?', 'La alta animación se construye con su material, tipografía, formas y video. El 3D requiere assets y WebGL fuera del alcance: entra como change request o con otra área. Se alinea desde el kickoff y con la prueba de concepto.'],
    ['¿Cómo manejas un cambio de alcance a mitad del proyecto?', 'Después del Gate 2, todo cambio sigue un change request: impacto en horas y fecha, propuesta al cliente y aprobación escrita. Si no cabe, se cambia por otro alcance o va a fase 2.'],
    ['¿Por qué el cliente entra hasta la semana 2?', 'La semana 1 alinea al equipo, valida capacidad y prepara supuestos, para llegar al cliente con propuesta. Igual se le envía una solicitud previa (accesos y contenido) en la semana 1.'],
    ['¿Cómo sabes que alguien está bloqueado si no hay daily?', 'Regla de reportar en máximo 4 h hábiles, columna Bloqueado obligatoria, revisión diaria del board por el PM y el KPI de tiempo de bloqueo (<48 h).'],
    ['¿Qué haces si un desarrollador es absorbido por otro proyecto?', 'Acuerdo de capacidad firmado con su líder, seguimiento semanal de capacidad real (meta ≥90%) y escalamiento al nivel 2 si cae.'],
    ['¿Cómo mides el engagement que pide el cliente?', 'Es una métrica del producto, no del proyecto. Se define con el cliente en la semana 2 a partir de su medición actual; analítica se instrumenta en el S4 y se entrega un tablero de medición.'],
    ['¿Qué herramienta usarías?', 'La que use la agencia o el cliente (Jira, Workfront u otra). Lo importante es la disciplina: cada persona actualiza lo suyo y el PM verifica.'],
    ['¿Qué pasa con las horas que sobren?', 'No se reparten: el PM propone a los stakeholders si quedan como margen, se invierten en el backlog acordado con el cliente o se plantea un reconocimiento al equipo atado a calidad.']
  ];
  const glossary = [
    ['Sprint', 'Ciclo de trabajo de 2 semanas del equipo. El proyecto tiene 6.'],
    ['Backlog', 'Lista priorizada de historias y tareas pendientes.'],
    ['Definition of Ready (DoR)', 'Condiciones para que una historia entre a desarrollo: diseño aprobado, specs de motion y contenido real o definido.'],
    ['Definition of Done (DoD)', 'Condiciones para dar una historia por terminada: dispositivos, QA, accesibilidad, rendimiento y carga en WordPress.'],
    ['UAT', 'User Acceptance Testing: el cliente prueba el sitio completo y lo aprueba (Gate 3).'],
    ['Gate de aprobación', 'Hito en el que el cliente aprueba un entregable antes de seguir.'],
    ['Change request', 'Solicitud formal de cambio con impacto en horas y fecha, aprobada por escrito.'],
    ['Dual-track', 'Diseño trabaja un sprint adelante de desarrollo.'],
    ['WIP', 'Work in progress. Máximo 2 tareas en progreso por persona.'],
    ['Code freeze', 'Desde el final de la semana 10 solo entran correcciones, no funcionalidades.'],
    ['RACI', 'Matriz de quién es Responsable, Aprobador, Consultado e Informado.'],
    ['MoSCoW', 'Priorización en Must, Should, Could y Won\'t.'],
    ['ACF', 'Advanced Custom Fields: campos editables de WordPress que alimentan las plantillas.'],
    ['GSAP + ScrollTrigger', 'Librería de animación y su plugin para animaciones ligadas al scroll.'],
    ['WCAG', 'Pautas de accesibilidad web; incluye respetar el movimiento reducido.'],
    ['Burndown / burnup', 'Gráficos de trabajo restante del sprint y avance acumulado.']
  ];
  const plus = [
    { name: 'Librería de patrones de motion', line: '5 patrones reutilizables construidos una vez y aplicados en las 4 plantillas de alta animación: menos horas de Frontend y QA, y contenido editable desde ACF sin romper la animación.' },
    { name: 'Préstamo de capacidad entre PMs', line: 'Si alguien queda bloqueado esperando al cliente, sus horas se prestan a otro proyecto y se devuelven cuando la dependencia se destraba.' },
    { name: 'Bolsa de capacitación', line: '12 h separadas de la contingencia, agendadas justo a tiempo tras un diagnóstico de habilidades en la semana 1.' },
    { name: 'Negociación de horas optimizadas', line: 'Si sobra contingencia, el PM no la reparte: propone margen para la agencia, mejoras del backlog o un reconocimiento al equipo atado a calidad.' }
  ];

  return {
    roles, extras, sprints, hoursBySprint, epics, gates, clientMilestones, criticalPath, pmActivities,
    estimationUnits, training, sprint1Tasks, sprint1Weeks, sprint1Goal, sprint1Done, rituals, dor, dod, boardFlow,
    commPlan, escalation, metricGroups, metrics, engagement, risks, chain, lvl, assumptions, templates,
    team, stakeholders, faq, glossary, plus,
    totals: { operativo: 540, total: 600 }
  };
})();
