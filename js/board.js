/* board.js — Sprint 1 en dos vistas que comparten el mismo estado:
   · Lista (predeterminada): nombres completos de tareas y épicas, agrupadas por semana, con estado editable.
   · Board tipo Jira: arrastrar entre estados.
   Filtros por rol y semana, y reporte de bloqueos. Es una demo: el estado vive en memoria. */
window.Board = (function () {
  const { $, $$, esc, fmt, fmtApprox, sum, role, avatar } = U;
  const D = DATA;
  const cols = [
    { id: 'backlog', name: 'Backlog', color: 'var(--ink-2)' },
    { id: 'ready', name: 'Ready', color: 'var(--ink)' },
    { id: 'progress', name: 'En progreso', color: 'var(--sky-t)' },
    { id: 'blocked', name: 'Bloqueado', color: 'var(--bad)' },
    { id: 'review', name: 'En revisión / QA', color: 'var(--warn)' },
    { id: 'done', name: 'Done', color: 'var(--ok)' }
  ];
  const col = (id) => cols.find((c) => c.id === id);
  const epic = (id) => D.epics.find((e) => e.id === id);
  let state = {};       // key → columna
  let blocked = {};     // key → { decision, since }
  let fRole = null, fWeek = 'all', view = 'list';
  let lastDrag = 0;
  const task = (k) => D.sprint1Tasks.find((t) => t.k === k);

  function resetState() {
    state = {}; blocked = {};
    D.sprint1Tasks.forEach((t) => (state[t.k] = 'ready'));
  }

  const visible = (t) => (!fRole || t.split[fRole]) && (fWeek === 'all' || t.week === 0 || String(t.week) === fWeek);
  const hoursOf = (t) => (fRole ? t.split[fRole] || 0 : t.h);
  const weekLabel = (t) => (t.week ? `Sem ${t.week}` : 'Sem 1–2');
  const statusSelect = (k, extra = '') => `<span class="status-ctl ${extra}" style="--st:${col(state[k]).color}"><span class="st-dot" aria-hidden="true"></span>
      <select data-status="${k}" aria-label="Estado de ${k}">${cols.map((c) => `<option value="${c.id}"${state[k] === c.id ? ' selected' : ''}>${c.name}</option>`).join('')}</select>
      <svg class="ico st-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5"/></svg></span>`;

  /* ============================ BOARD ============================ */
  function cardHtml(t) {
    const owners = Object.keys(t.split);
    const b = blocked[t.k];
    return `<article class="card" data-k="${t.k}" tabindex="0" aria-label="${esc(t.k + ': ' + t.full)}">
      <div class="card-top"><span class="card-key">${t.k}</span>
        <button class="card-move" aria-label="Mover ${t.k} a…" aria-haspopup="menu"><svg class="ico" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg></button></div>
      <p class="card-title">${esc(t.title)}</p>
      <div class="card-foot"><span class="avatars">${owners.map((o) => avatar(o)).join('')}</span><span class="card-meta"><b data-h>${fmt(hoursOf(t))} h</b> · ${weekLabel(t)}</span></div>
      ${b ? `<p class="card-block">${esc(b.decision)}${b.since ? ` · desde ${esc(b.since)}` : ''}</p>` : ''}
    </article>`;
  }

  function buildBoard() {
    $('#board').innerHTML = cols.map((c) => `<section class="col${c.id === 'blocked' ? ' col--blocked' : ''}" data-col="${c.id}" aria-label="${c.name}">
      <header class="col-head"><span class="col-name">${c.name}</span><span class="col-meta" data-meta></span></header>
      <div class="col-list" data-list="${c.id}"></div></section>`).join('');
    D.sprint1Tasks.forEach((t) => { $(`[data-list="${state[t.k]}"]`).insertAdjacentHTML('beforeend', cardHtml(t)); });
    $$('.col-list').forEach((list) => {
      Sortable.create(list, {
        group: 'board', animation: U.reducedMotion() ? 0 : 180, delay: 160, delayOnTouchOnly: true,
        ghostClass: 'sortable-ghost', dragClass: 'sortable-drag', filter: '.card-move', preventOnFilter: false,
        onStart: () => U.hideTip(),
        onEnd: (evt) => {
          lastDrag = Date.now();
          const k = evt.item.dataset.k, to = evt.to.dataset.list, from = evt.from.dataset.list;
          if (to === from) return;
          if (to === 'blocked') askBlock(k, () => revert(evt.item, evt.from, evt.oldIndex));
          else commit(k, to);
        }
      });
    });
    applyFilters();
  }

  function scrollBoardToReady() {
    if (!U.isMobile()) return;
    requestAnimationFrame(() => { const sc = $('.board-scroll'); sc.scrollLeft = $('[data-col="ready"]').offsetLeft - 4; });
  }

  /* ============================ ESTADO ============================ */
  function commit(k, c) {
    state[k] = c;
    if (c !== 'blocked') delete blocked[k];
    rerenderCard(k);
    applyFilters();
  }
  function revert(item, from, idx) {
    const ref = from.children[idx];
    ref ? from.insertBefore(item, ref) : from.appendChild(item);
    applyFilters();
  }
  function rerenderCard(k) {
    const old = $(`.card[data-k="${k}"]`);
    old.insertAdjacentHTML('afterend', cardHtml(task(k)));
    old.remove();
  }
  // Cambia el estado desde cualquier vista (lista, board, menú o detalle)
  function setStatus(k, c, { focusCard = false } = {}) {
    if (state[k] === c) return;
    const el = $(`.card[data-k="${k}"]`);
    const fromList = el.parentElement, idx = Array.from(fromList.children).indexOf(el);
    $(`[data-list="${c}"]`).appendChild(el);
    if (c === 'blocked') askBlock(k, () => revert(el, fromList, idx));
    else commit(k, c);
    if (focusCard) $(`.card[data-k="${k}"]`)?.focus();
  }

  // Mini formulario al bloquear: conecta con la cadena del retraso
  function askBlock(k, onCancel) {
    const t = task(k);
    let saved = false;
    Sheet.open({
      eyebrow: `${t.k} · Reportar bloqueo`,
      title: t.full,
      body: `<p class="muted-p">Un bloqueo se reporta en máximo 4 h hábiles. El PM lo resuelve en menos de 48 h o lo escala.</p>
        <form id="blockForm">
          <label class="form-field"><span>¿Qué decisión falta?</span><textarea name="decision" required placeholder="Ej.: aprobación de accesos al hosting por parte del cliente" autofocus></textarea></label>
          <label class="form-field"><span>¿Desde cuándo?</span><input name="since" type="text" placeholder="Ej.: martes, 10:00"></label>
          <div class="form-actions"><button type="submit" class="btn-primary">Mover a Bloqueado</button><button type="button" class="btn-quiet" data-cancel>Cancelar</button></div>
        </form>
        <h4>Por qué importa</h4><p class="muted-p">Es el segundo eslabón de la cadena del retraso: un bloqueo silencioso acumula backlog y termina moviendo la fecha. El KPI de tiempo de bloqueo (&lt;48 h) lo hace visible.</p>`,
      onOpen: (body) => {
        const form = body.querySelector('#blockForm');
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const fd = new FormData(form);
          blocked[k] = { decision: String(fd.get('decision')).trim() || 'Decisión pendiente', since: String(fd.get('since')).trim() };
          saved = true; Sheet.close('saved'); commit(k, 'blocked');
        });
        body.querySelector('[data-cancel]').addEventListener('click', () => Sheet.close('cancel'));
      },
      onClose: () => { if (!saved) onCancel(); }
    });
  }

  function openTask(k) {
    const t = task(k);
    const b = blocked[k];
    const e = epic(t.epic);
    Sheet.open({
      eyebrow: `${t.k} · ${t.week ? 'Semana ' + t.week : 'Transversal en las 2 semanas'}`,
      title: t.full,
      body: `<ul class="kv">
          <li><span>Estado</span><span>${statusSelect(k, 'status-ctl--sheet')}</span></li>
          ${b ? `<li><span>Bloqueo</span><span class="status status--bad"><span class="dot"></span>${esc(b.decision)}${b.since ? ` · desde ${esc(b.since)}` : ''}</span></li>` : ''}
          <li><span>Épica</span><span class="kv-epic"><i class="swatch" style="background:${e.fill}"></i>${e.id} · ${esc(e.name)}</span></li>
          <li><span>Horas</span><span>${fmt(t.h)} h</span></li></ul>
        <h4>Reparto por responsable</h4>
        <ul class="value-list">${Object.entries(t.split).map(([r, h]) => `<li><span class="k">${avatar(r)}${esc(role(r).name)}</span><span class="v">${fmt(h)} h</span></li>`).join('')}</ul>
        <p class="muted-p" style="margin-top:14px">Cada persona crea y actualiza sus historias, estados y horas. El PM no actualiza por otros: revisa el board a diario y valida en los syncs.</p>`,
      onOpen: (body) => {
        const sel = body.querySelector('select[data-status]');
        sel.addEventListener('change', () => {
          const v = sel.value;
          sel.closest('.status-ctl').style.setProperty('--st', col(v).color);
          setStatus(k, v);
        });
      }
    });
  }

  /* ============================ LISTA ============================ */
  function renderList() {
    const el = $('#taskList');
    if (!el) return;
    // Conservar el foco al volver a pintar
    const act = document.activeElement;
    const keep = act && el.contains(act) ? { k: act.closest('[data-k]')?.dataset.k, sel: act.tagName === 'SELECT' } : null;

    const S = U.simple; // versión simple: lista estática, sin estado ni detalle
    const head = `<div class="tr tr--head${S ? ' tr--simple' : ''}" role="row"><span role="columnheader">Clave</span><span role="columnheader">Tarea</span><span role="columnheader">Épica</span><span role="columnheader">Responsables</span><span role="columnheader" class="tr-hours">Horas</span>${S ? '' : '<span role="columnheader">Estado</span>'}</div>`;
    const groups = D.sprint1Weeks.map((g) => {
      const ts = D.sprint1Tasks.filter((t) => t.week === g.week && visible(t));
      if (!ts.length) return '';
      const rows = ts.map((t) => {
        const e = epic(t.epic), b = blocked[t.k], st = state[t.k];
        return `<div class="tr task-row${S ? ' tr--simple' : ''}${st === 'done' ? ' is-done' : ''}${st === 'blocked' ? ' is-blocked' : ''}" role="row" data-k="${t.k}">
          <span class="tr-key" role="cell">${t.k}</span>
          <span class="tr-task" role="cell">${S ? `<span class="tr-title">${esc(t.full)}</span>` : `<button class="tr-title" data-open="${t.k}">${esc(t.full)}</button>`}${b ? `<span class="tr-block">${esc(b.decision)}${b.since ? ` · desde ${esc(b.since)}` : ''}</span>` : ''}</span>
          <span class="tr-epic" role="cell"><i class="swatch" style="background:${e.fill}"></i><span><span class="tr-eid">${e.id}</span> ${esc(e.name)}</span></span>
          <span class="tr-owners" role="cell"><span class="avatars">${Object.keys(t.split).map((o) => avatar(o)).join('')}</span></span>
          <span class="tr-hours" role="cell">${fmt(hoursOf(t))} h</span>
          ${S ? '' : `<span class="tr-status" role="cell">${statusSelect(t.k)}</span>`}
        </div>`;
      }).join('');
      return `<div class="tg" role="rowgroup"><div class="tg-head" role="row"><span role="cell" class="tg-title"><b>${g.name}</b><span>${esc(g.sub)}</span></span><span role="cell" class="tg-meta">${ts.length} tarea${ts.length > 1 ? 's' : ''} · ${fmtApprox(sum(ts.map(hoursOf)))} h</span></div>${rows}</div>`;
    }).join('');
    el.innerHTML = head + (groups || '<p class="tl-empty">No hay tareas con este filtro.</p>');

    // Resumen de estados
    const vis = D.sprint1Tasks.filter(visible);
    const done = vis.filter((t) => state[t.k] === 'done').length;
    const counts = cols.map((c) => ({ c, n: vis.filter((t) => state[t.k] === c.id).length })).filter((x) => x.n);
    const summary = $('#statusSummary');
    if (summary) summary.innerHTML = `<span class="ss-main"><b>${done} de ${vis.length}</b> terminadas</span>` +
      counts.map((x) => `<span class="ss-item" style="--st:${x.c.color}"><i></i>${x.c.name} ${x.n}</span>`).join('');

    if (keep && keep.k) {
      const row = el.querySelector(`.task-row[data-k="${keep.k}"]`);
      (row && (keep.sel ? row.querySelector('select') : row.querySelector('.tr-title')))?.focus({ preventScroll: true });
    }
  }

  function bindList() {
    const el = $('#taskList');
    el.addEventListener('change', (e) => {
      const sel = e.target.closest('select[data-status]');
      if (sel) setStatus(sel.dataset.status, sel.value);
    });
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-open]');
      if (b) openTask(b.dataset.open);
    });
  }

  /* ============================ FILTROS ============================ */
  function applyFilters() {
    D.sprint1Tasks.forEach((t) => {
      const el = $(`.card[data-k="${t.k}"]`);
      if (!el) return;
      el.classList.toggle('is-dim', !visible(t));
      const hb = el.querySelector('[data-h]'); if (hb) hb.textContent = fmt(hoursOf(t)) + ' h';
    });
    cols.forEach((c) => {
      const ks = $$(`[data-list="${c.id}"] .card`).map((e) => task(e.dataset.k)).filter(visible);
      const meta = $(`[data-col="${c.id}"] [data-meta]`);
      if (meta) meta.textContent = `${ks.length} · ${fmtApprox(sum(ks.map(hoursOf)))} h`;
    });
    const vis = D.sprint1Tasks.filter(visible);
    $('#boardTotal').textContent = fmtApprox(sum(vis.map(hoursOf))) + ' h';
    const parts = [fRole ? role(fRole).name : null, fWeek === 'all' ? null : 'semana ' + fWeek].filter(Boolean);
    $('#boardTotalLabel').textContent = parts.length ? parts.join(' · ') : 'total del sprint';
    renderList();
  }

  function buildFilters() {
    const el = $('#avatarFilter');
    el.innerHTML = `<button class="af-all" aria-pressed="true" data-role="">Todos</button>` +
      D.roles.map((r) => `<button aria-pressed="false" data-role="${r.id}" aria-label="Filtrar por ${esc(r.name)}">${avatar(r.id)}</button>`).join('');
    $$('button', el).forEach((b) => b.addEventListener('click', () => {
      fRole = b.dataset.role && fRole !== b.dataset.role ? b.dataset.role : null;
      $$('button', el).forEach((x) => x.setAttribute('aria-pressed', (x.dataset.role || null) === fRole));
      el.classList.toggle('has-filter', !!fRole);
      applyFilters();
    }));
    U.seg($('[data-seg="week"]'), (v) => { fWeek = v; applyFilters(); });
    U.seg($('[data-seg="s1View"]'), (v) => {
      view = v;
      $('#taskListWrap').hidden = v !== 'list';
      $('#boardWrap').hidden = v !== 'board';
      if (v === 'board') scrollBoardToReady();
    });
  }

  function bindBoard() {
    const board = $('#board');
    board.addEventListener('click', (e) => {
      const mv = e.target.closest('.card-move');
      if (mv) { e.stopPropagation(); openMenu(mv.closest('.card')); return; }
      if (e.target.closest('.move-menu')) return;
      const card = e.target.closest('.card');
      if (card && Date.now() - lastDrag > 250) openTask(card.dataset.k);
    });
    board.addEventListener('keydown', (e) => {
      const card = e.target.closest('.card');
      if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openTask(card.dataset.k); }
    });
    board.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.card');
      if (card) card.title = task(card.dataset.k).full;
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.move-menu')) closeMenu(); });
  }

  // Alternativa accesible al arrastre: menú "Mover a…"
  function openMenu(card) {
    closeMenu();
    const k = card.dataset.k;
    const m = document.createElement('div');
    m.className = 'move-menu'; m.setAttribute('role', 'menu');
    m.innerHTML = '<p>Mover a…</p>' + cols.map((c) => `<button role="menuitem" data-to="${c.id}" ${state[k] === c.id ? 'disabled' : ''}>${c.name}</button>`).join('');
    card.appendChild(m);
    const items = $$('button:not([disabled])', m);
    items[0]?.focus();
    m.addEventListener('click', (e) => { const b = e.target.closest('[data-to]'); if (b) { e.stopPropagation(); closeMenu(); setStatus(k, b.dataset.to, { focusCard: true }); } });
    m.addEventListener('keydown', (e) => {
      e.stopPropagation();
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      if (e.key === 'Escape') { closeMenu(); card.querySelector('.card-move').focus(); }
    });
  }
  function closeMenu() { $$('.move-menu').forEach((m) => m.remove()); }

  function init() {
    resetState();
    // Versión simple: solo la lista estática con el total del sprint (sin board, filtros ni estados)
    if (U.simple) { applyFilters(); return; }
    buildFilters();
    bindBoard();
    bindList();
    buildBoard();
  }
  return { init };
})();
