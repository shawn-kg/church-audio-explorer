{
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('stage');
  const sheet = document.getElementById('panel');
  const panel = document.getElementById('panelBody');
  const grab = document.getElementById('grab');
  const stageView = document.getElementById('stageView');
  const consoleView = document.getElementById('consoleView');
  const tourSel = document.getElementById('tour');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const countEl = document.getElementById('count');
  const HUB = 'x32';
  const MAP = { w: 1140, h: 745, top: 30 }; // drawing size; content is shifted down by `top`

  // Label positions that differ from the default (below the dot).
  const LABEL = {
    diKeys: 'left', diAux: 'above', diElec: 'right', diBass: 'right', diMal: 'left',
    diClick: 'left', diSpd: 'right', click: 'right', spd: 'right',
    tbMain: 'left', tbBand: 'above', keys: 'left', aux: 'right', electric: 'below', bass: 'right', mal: 'below', joji: 'right',
    yellow: 'left', wireless: 'right', roomL: 'above', roomR: 'right',
    p16Keys: 'right', p16Aux: 'below', p16Elec: 'right', p16Bass: 'right', p16Mal: 'left', p16Drums: 'left',
    leftSub: 'below', rightSub: 'below', mainSnake: 'above', monMixer: 'below', p16d: 'below', router: 'below',
    receivers: 'left', drumSub: 'left', drumTB: 'left', kit: 'below',
    mac: 'below', x32: 'left', amps: 'left', stream: 'below',
    mainL: 'left', subL: 'left', monL: 'left', mainR: 'left', subR: 'right', monR: 'left'
  };

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const h = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  const colorOf = sig => `var(--${sig})`;
  // Phone mode: the map fills the screen and the explanation is a draggable sheet.
  // Wider screens keep the side-by-side layout untouched.
  const phoneQuery = window.matchMedia('(max-width: 900px)');
  const narrow = () => phoneQuery.matches;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- wires ---------- */
  const wires = WIRES.map(([from, to, type, via, both], i) => ({ i, from, to, type, via: via || [], both: !!both }));

  /* ---------- draw the stage ---------- */
  let dragged = false; // true while a pan or pinch is happening, so it doesn't count as a tap
  function draw() {
    const defs = el('defs', {}, svg);
    const f = el('filter', { id: 'glow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    el('feGaussianBlur', { stdDeviation: '3', result: 'b' }, f);
    const m = el('feMerge', {}, f);
    el('feMergeNode', { in: 'b' }, m);
    el('feMergeNode', { in: 'SourceGraphic' }, m);

    const root = el('g', { transform: `translate(0,${MAP.top})` }, svg);

    const grid = el('g', { class: 'grid' }, root);
    for (let x = 0; x <= MAP.w; x += 40) el('line', { x1: x, y1: -30, x2: x, y2: 720 }, grid);
    for (let y = -30; y <= 720; y += 40) el('line', { x1: 0, y1: y, x2: MAP.w, y2: y }, grid);

    for (const a of AREAS) {
      const g = el('g', { class: 'area ' + a.id }, root);
      el('rect', { x: a.x, y: a.y, width: a.w, height: a.h, rx: 10 }, g);
      if (a.door) el('line', { class: 'door', x1: a.door[0], y1: a.door[1], x2: a.door[2], y2: a.door[3] }, g);
      const bottom = a.id === 'stage' || a.id === 'foh' || a.id === 'drums';
      const right = a.id === 'drums';
      if (a.id !== 'stage') el('text', { x: right ? a.x + a.w - 12 : a.x + 12, y: bottom ? a.y + a.h - 14 : a.y + 24, 'text-anchor': right ? 'end' : 'start' }, g).textContent = a.label;
    }
    el('line', { class: 'front', x1: 115, y1: 405, x2: 765, y2: 405 }, root);
    el('text', { class: 'note', x: 820, y: 560, 'text-anchor': 'middle' }, root).textContent = 'Congregation';

    const kit = el('g', { class: 'kit' }, root);
    [[930, 327, 22], [903, 305, 11], [958, 307, 13], [892, 337, 10], [968, 341, 9]].forEach(([cx, cy, r]) =>
      el('circle', { class: 'drum', cx, cy, r }, kit));

    const wireLayer = el('g', {}, root);
    const pulseLayer = el('g', {}, root);
    for (const w of wires) {
      const a = STOPS[w.from], b = STOPS[w.to];
      w.pts = [[a.x, a.y], ...w.via, [b.x, b.y]];
      const d = 'M' + w.pts.map(p => p.join(' ')).join('L');
      w.el = el('path', { d, class: 'wire t-' + w.type }, wireLayer);
      w.pulse = el('path', { d, class: 'pulse' }, pulseLayer);
    }

    const nodeLayer = el('g', {}, root);
    for (const id in STOPS) {
      const s = STOPS[id];
      const g = el('g', { class: 'node k-' + s.kind, tabindex: 0, role: 'button', 'aria-label': s.label + (s.ch ? ', channel ' + s.ch.join(' and ') : '') }, nodeLayer);
      const r = s.kind === 'p16' ? 6 : s.kind === 'hub' || s.kind === 'board' || s.kind === 'snake' ? 11 : 9;
      el('circle', { class: 'halo', cx: s.x, cy: s.y, r: r + 7 }, g);
      el('circle', { class: 'dot', cx: s.x, cy: s.y, r, stroke: colorOf(s.signal) }, g);
      const pos = LABEL[id] || 'below';
      const t = el('text', {}, g);
      const off = r + 8;
      if (pos === 'right') { t.setAttribute('x', s.x + off); t.setAttribute('y', s.y + 6); }
      else if (pos === 'left') { t.setAttribute('x', s.x - off); t.setAttribute('y', s.y + 6); t.setAttribute('text-anchor', 'end'); }
      else if (pos === 'above') { t.setAttribute('x', s.x); t.setAttribute('y', s.y - off - 2); t.setAttribute('text-anchor', 'middle'); }
      else { t.setAttribute('x', s.x); t.setAttribute('y', s.y + off + 14); t.setAttribute('text-anchor', 'middle'); }
      t.textContent = s.short || s.label;
      s.g = g;
      g.addEventListener('click', () => { if (dragged) return; stopTour(); select(id); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopTour(); select(id); } });
    }
  }

  /* ---------- phone camera: zoom and pan by moving the viewBox ---------- */
  const FULL = { x: 0, y: 0, w: MAP.w, h: MAP.h };
  let cam = { ...FULL };
  let anim = 0;
  let sheetH = 0, sheetState = 'peek';
  const box = () => svg.getBoundingClientRect();
  function sheetCover() {
    // How much of the bottom of the map the sheet hides, in pixels.
    if (!narrow() || stageView.hidden) return 0;
    const r = box();
    return Math.max(0, Math.min(r.height * 0.9, r.bottom - (window.innerHeight - sheetH)));
  }
  function limits() {
    const r = box();
    const visible = Math.max(80, r.height - sheetCover());
    return { min: Math.min(r.width / MAP.w, visible / MAP.h) * 0.9, max: 2.6 };
  }
  function clampCam(c) {
    const r = box();
    if (!r.width || !r.height) return c;
    const lim = limits();
    const s = Math.min(lim.max, Math.max(lim.min, r.width / c.w));
    const w = r.width / s, hh = r.height / s;
    let x = c.x + c.w / 2 - w / 2, y = c.y + c.h / 2 - hh / 2;
    // Keep at least part of the drawing on screen.
    x = Math.min(Math.max(x, -w * 0.6), MAP.w - w * 0.4);
    y = Math.min(Math.max(y, -hh * 0.6), MAP.h - hh * 0.4);
    return { x, y, w, h: hh };
  }
  function apply(c) {
    cam = c;
    svg.setAttribute('viewBox', `${+c.x.toFixed(1)} ${+c.y.toFixed(1)} ${+c.w.toFixed(1)} ${+c.h.toFixed(1)}`);
  }
  function moveTo(target, animate = true) {
    target = clampCam(target);
    cancelAnimationFrame(anim);
    if (!animate || calm.matches) { apply(target); return; }
    const from = { ...cam }, t0 = performance.now(), dur = 380;
    const ease = t => 1 - Math.pow(1 - t, 3);
    const tick = now => {
      const k = ease(Math.min(1, (now - t0) / dur));
      apply({ x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k, w: from.w + (target.w - from.w) * k, h: from.h + (target.h - from.h) * k });
      if (k < 1) anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  }
  // Fit a box of map units into the part of the map the sheet doesn't cover.
  function fitBox(b, animate = true) {
    if (!narrow()) return;
    const r = box();
    if (!r.width) return;
    const pad = 24;
    const bw = b.x2 - b.x1 + pad * 2, bh = b.y2 - b.y1 + pad * 2;
    const visible = Math.max(80, r.height - sheetCover());
    const lim = limits();
    const s = Math.min(lim.max, Math.max(lim.min, Math.min(r.width / bw, visible / bh)));
    const w = r.width / s, hh = r.height / s;
    const cx = (b.x1 + b.x2) / 2, cy = (b.y1 + b.y2) / 2;
    moveTo({ x: cx - w / 2, y: cy - (visible / 2) / s, w, h: hh }, animate);
  }
  const ALL = { x1: 0, y1: 0, x2: MAP.w, y2: MAP.h - 20 };
  function fitAll(animate = true) { fitBox(ALL, animate); }
  function boxOf(ids, wireSet) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    const add = (x, y) => { y += MAP.top; x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); };
    ids.forEach(id => {
      if (!STOPS[id]) return;
      // Use the dot and its label, so names at the edge aren't cut off.
      let r = null;
      try { r = STOPS[id].g.getBBox(); } catch (_) {}
      if (r && r.width) { add(r.x, r.y); add(r.x + r.width, r.y + r.height); }
      else add(STOPS[id].x, STOPS[id].y);
    });
    wires.forEach(w => { if (wireSet.has(w.i)) w.pts.forEach(p => add(p[0], p[1])); });
    return isFinite(x1) ? { x1, y1, x2, y2 } : ALL;
  }
  let focusBox = null; // what the phone camera keeps in view
  function focus(b) {
    focusBox = b;
    fitBox(b);
  }
  function zoomBy(factor, px, py) {
    const r = box();
    if (px == null) { px = r.left + r.width / 2; py = r.top + (r.height - sheetCover()) / 2; }
    const s0 = r.width / cam.w;
    const ux = cam.x + (px - r.left) / s0, uy = cam.y + (py - r.top) / s0;
    const lim = limits();
    const s = Math.min(lim.max, Math.max(lim.min, s0 * factor));
    return { x: ux - (px - r.left) / s, y: uy - (py - r.top) / s, w: r.width / s, h: r.height / s };
  }
  document.getElementById('zin').addEventListener('click', () => moveTo(zoomBy(1.5)));
  document.getElementById('zout').addEventListener('click', () => moveTo(zoomBy(1 / 1.5)));
  document.getElementById('zfit').addEventListener('click', () => fitAll());

  // Drag to pan, pinch to zoom (phones only). Taps still reach the dots.
  const pts = new Map();
  let gesture = null;
  const snapshot = () => ({ cam: { ...cam }, pts: new Map([...pts].map(([k, v]) => [k, { ...v }])) });
  svg.addEventListener('pointerdown', e => {
    if (!narrow()) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    dragged = false;
    cancelAnimationFrame(anim);
    gesture = snapshot();
  });
  svg.addEventListener('pointermove', e => {
    if (!narrow() || !pts.has(e.pointerId) || !gesture) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = box();
    const start = [...gesture.pts.values()], now = [...pts.values()];
    if (now.length === 1 && start.length === 1) {
      const dx = now[0].x - start[0].x, dy = now[0].y - start[0].y;
      if (!dragged && Math.hypot(dx, dy) < 6) return;
      if (!dragged) { dragged = true; try { svg.setPointerCapture(e.pointerId); } catch (_) {} }
      const s = r.width / gesture.cam.w;
      apply(clampCam({ ...gesture.cam, x: gesture.cam.x - dx / s, y: gesture.cam.y - dy / s }));
    } else if (now.length >= 2 && start.length >= 2) {
      dragged = true;
      const mid = p => ({ x: (p[0].x + p[1].x) / 2, y: (p[0].y + p[1].y) / 2 });
      const dist = p => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) || 1;
      const m0 = mid(start), m1 = mid(now);
      const s0 = r.width / gesture.cam.w;
      const lim = limits();
      const s1 = Math.min(lim.max, Math.max(lim.min, s0 * dist(now) / dist(start)));
      const ux = gesture.cam.x + (m0.x - r.left) / s0, uy = gesture.cam.y + (m0.y - r.top) / s0;
      apply(clampCam({ x: ux - (m1.x - r.left) / s1, y: uy - (m1.y - r.top) / s1, w: r.width / s1, h: r.height / s1 }));
    }
  });
  const endPointer = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    gesture = pts.size ? snapshot() : null;
    if (!pts.size) setTimeout(() => { dragged = false; }, 0);
  };
  svg.addEventListener('pointerup', endPointer);
  svg.addEventListener('pointercancel', endPointer);
  svg.addEventListener('wheel', e => {
    if (!narrow()) return;
    e.preventDefault();
    apply(clampCam(zoomBy(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY)));
  }, { passive: false });

  /* ---------- phone sheet: drag between peek, half and nearly full ---------- */
  const SNAP = () => {
    const vh = window.innerHeight;
    return { peek: Math.round(Math.min(116, vh * 0.2)), mid: Math.round(vh * 0.42), full: Math.round(vh * 0.86) };
  };
  const ORDER = ['peek', 'mid', 'full'];
  function setSheet(state, animate = true) {
    if (!narrow()) return;
    sheetState = state;
    sheetH = SNAP()[state];
    sheet.classList.toggle('dragging', !animate);
    document.documentElement.style.setProperty('--sheet-h', sheetH + 'px');
    sheet.dataset.state = state;
    grab.setAttribute('aria-expanded', String(state !== 'peek'));
    if (!animate) requestAnimationFrame(() => sheet.classList.remove('dragging'));
    if (focusBox && !stageView.hidden) fitBox(focusBox, animate);
  }
  const nextState = () => sheetState === 'peek' ? 'mid' : sheetState === 'mid' ? 'full' : 'peek';
  {
    let start = null;
    grab.addEventListener('pointerdown', e => {
      if (!narrow()) return;
      start = { y: e.clientY, h: sheetH, t: performance.now(), lastY: e.clientY, lastT: performance.now(), moved: false };
      grab.setPointerCapture(e.pointerId);
      sheet.classList.add('dragging');
    });
    grab.addEventListener('pointermove', e => {
      if (!start) return;
      const dy = start.y - e.clientY;
      if (Math.abs(dy) > 4) start.moved = true;
      const s = SNAP();
      sheetH = Math.min(s.full, Math.max(s.peek, start.h + dy));
      start.v = (start.lastY - e.clientY) / Math.max(1, performance.now() - start.lastT);
      start.lastY = e.clientY; start.lastT = performance.now();
      document.documentElement.style.setProperty('--sheet-h', sheetH + 'px');
    });
    const done = () => {
      if (!start) return;
      sheet.classList.remove('dragging');
      const s = SNAP();
      let next;
      if (!start.moved) next = nextState();
      else {
        const projected = sheetH + (start.v || 0) * 200; // a quick flick carries further
        next = ORDER.reduce((a, b) => Math.abs(s[b] - projected) < Math.abs(s[a] - projected) ? b : a);
      }
      start = null;
      setSheet(next);
    };
    grab.addEventListener('pointerup', done);
    grab.addEventListener('pointercancel', done);
    grab.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSheet(nextState()); }
    });
  }
  // Opening something on a phone: make the explanation readable without hiding the path.
  function showSheet() {
    if (!narrow()) return;
    panel.scrollTop = 0;
    if (sheetState === 'peek') setSheet('mid');
  }
  function addClose() {
    if (!narrow()) return;
    const close = h('button', 'sheet-close', '×');
    close.setAttribute('aria-label', 'Close and show the whole map');
    close.addEventListener('click', () => { stopTour(); select(null); });
    panel.prepend(close);
  }

  /* ---------- highlighting ---------- */
  // What lights up when a stop is clicked: its path to the FOH X32, then every
  // destination its inputs feed (see DESTINATIONS and SENDS in data.js).
  const wireIndex = (f, t) => { const w = wires.find(x => x.from === f && x.to === t); return w ? w.i : -1; };
  function routeOf(id) {
    const on = new Set();
    const sources = new Set();
    let reachesHub = false;
    const addDests = keys => keys.forEach(k => DESTINATIONS[k].wires.forEach(([f, t]) => { const i = wireIndex(f, t); if (i >= 0) on.add(i); }));
    if (id === HUB) {
      wires.forEach(w => { if (w.from === HUB || w.to === HUB) on.add(w.i); });
      const all = Object.keys(DESTINATIONS);
      addDests(all);
      return { on, dests: all };
    }
    if (STOPS[id].kind === 'source') sources.add(id);
    const up = n => {
      for (const w of wires) {
        // The wireless link from the in-ear transmitters is a return to the singer, not where their mic comes from.
        if (w.to !== n || w.from === 'xvive' || on.has(w.i)) continue;
        on.add(w.i);
        if (w.from === HUB) continue;
        if (STOPS[w.from].kind === 'source') sources.add(w.from);
        up(w.from);
      }
    };
    const down = n => {
      for (const w of wires) {
        if (w.from !== n || on.has(w.i)) continue;
        on.add(w.i);
        if (w.to === HUB) { reachesHub = true; continue; }
        if (w.from === 'xvive') continue; // stop at the singer's ears
        down(w.to);
      }
    };
    up(id);
    down(id);
    if (!reachesHub) return { on, dests: [] };
    const dests = new Set();
    sources.forEach(src => (SENDS[src] || SENDS.default).forEach(k => dests.add(k)));
    const list = Object.keys(DESTINATIONS).filter(k => dests.has(k));
    addDests(list);
    return { on, dests: list };
  }

  function light(onSet, selected) {
    svg.classList.toggle('focus', !!onSet);
    const lit = new Set(selected ? [selected] : []);
    for (const w of wires) {
      const on = !!onSet && onSet.has(w.i);
      w.el.classList.toggle('on', on);
      w.pulse.classList.toggle('on', on);
      if (on) { lit.add(w.from); lit.add(w.to); }
    }
    for (const id in STOPS) {
      STOPS[id].g.classList.toggle('lit', lit.has(id));
      STOPS[id].g.classList.toggle('sel', id === selected);
    }
    return lit;
  }

  const wireBetween = (a, b) => wires.find(w => (w.from === a && w.to === b) || (w.from === b && w.to === a));

  /* ---------- panel ---------- */
  function section(parent, title, text) {
    if (!text) return;
    parent.appendChild(h('h3', null, title));
    parent.appendChild(h('p', null, text));
  }

  function tag(sig) {
    const t = h('span', 'tag');
    t.style.color = colorOf(sig);
    t.appendChild(h('i'));
    const label = h('span', null, SIGNALS[sig].name);
    label.style.color = 'var(--muted)';
    t.appendChild(label);
    return t;
  }

  function chLine(ch, gear) {
    const p = h('p', 'gear');
    if (ch) ch.forEach(c => { p.appendChild(h('span', 'ch', 'Ch ' + c)); p.appendChild(document.createTextNode(' ')); });
    if (gear) p.appendChild(document.createTextNode(gear));
    return p;
  }

  function p16Text(s) {
    return {
      what: s.what,
      flow: 'A 16-channel personal mixer. The musician picks their own balance of the 16 channels the monitor mixer sends over Ultranet, and listens on headphones or in-ears plugged into it.',
      ours: s.ours,
      wrong: 'No signal: check the ethernet cable to the P16-D. Too loud overall: turn down the P16\'s master, not every channel.'
    };
  }

  function goesTo(dests) {
    const p = h('p', 'goes');
    p.appendChild(h('span', 'goes-label', 'Goes to'));
    dests.forEach(k => {
      const d = h('span', 'dest', DESTINATIONS[k].label);
      d.title = DESTINATIONS[k].note;
      p.appendChild(d);
    });
    return p;
  }

  function renderStop(id, partId, dests) {
    if (dests === undefined) dests = routeOf(id).dests;
    const s = STOPS[id];
    const t = s.kind === 'p16' ? Object.assign({}, s, p16Text(s)) : s;
    panel.replaceChildren();
    panel.appendChild(tag(s.signal));
    panel.appendChild(h('h2', null, s.kind === 'p16' ? 'P16, ' + s.for : s.label));
    panel.appendChild(chLine(s.ch, s.gear));
    if (dests.length) panel.appendChild(goesTo(dests));

    if (s.parts) {
      const chips = h('div', 'chips');
      s.parts.forEach(p => {
        const c = h('button', 'chip' + (p.id === partId ? ' on' : ''), p.label);
        c.addEventListener('click', () => renderStop(id, p.id === partId ? null : p.id, dests));
        chips.appendChild(c);
      });
      panel.appendChild(chips);
    }
    const part = s.parts && s.parts.find(p => p.id === partId);
    if (part) {
      const b = h('div');
      b.appendChild(h('h3', null, part.label));
      b.appendChild(chLine(part.ch, part.gear));
      b.appendChild(h('p', null, part.text));
      panel.appendChild(b);
    }

    section(panel, 'What it is', t.what);
    section(panel, 'What happens to the signal here', t.flow);
    section(panel, 'Our setup', t.ours);
    section(panel, 'What goes wrong here', t.wrong);

    if (s.confirm) {
      const c = h('div', 'confirm');
      c.appendChild(h('strong', null, 'Still to confirm'));
      const ul = h('ul');
      s.confirm.forEach(x => ul.appendChild(h('li', null, x)));
      c.appendChild(ul);
      panel.appendChild(c);
    }

    if (s.console) {
      const b = h('button', 'hop');
      b.appendChild(h('b', null, 'Open the console view'));
      b.appendChild(h('span', null, 'Inside the X32 ›'));
      b.addEventListener('click', () => setView('console'));
      const wrap = h('div', 'hops');
      wrap.appendChild(b);
      panel.appendChild(wrap);
    }

    const ins = wires.filter(w => w.to === id || (w.both && w.from === id)).map(w => w.to === id ? w.from : w.to);
    const outs = wires.filter(w => w.from === id && !w.both).map(w => w.to);
    if (ins.length || outs.length) {
      const wrap = h('div', 'hops');
      const add = (nid, dir) => {
        const b = h('button', 'hop');
        b.appendChild(h('b', null, STOPS[nid].kind === 'p16' ? 'P16, ' + STOPS[nid].for : STOPS[nid].label));
        b.appendChild(h('span', null, dir));
        b.addEventListener('click', () => { stopTour(); select(nid); });
        wrap.appendChild(b);
      };
      ins.slice(0, 6).forEach(n => add(n, '‹ comes from'));
      outs.slice(0, 6).forEach(n => add(n, 'goes to ›'));
      panel.appendChild(wrap);
    }
    addClose();
  }

  function legendList() {
    const ul = h('ul', 'legend');
    const dash = { inst: '9 5', digital: '14 4 3 4', wireless: '3 7' };
    for (const k in SIGNALS) {
      const li = document.createElement('li');
      const s = el('svg', { width: 34, height: 10, viewBox: '0 0 34 10', 'aria-hidden': 'true' });
      el('line', { x1: 2, y1: 5, x2: 32, y2: 5, stroke: colorOf(k), 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': dash[k] || '' }, s);
      li.appendChild(s);
      li.appendChild(h('span', null, SIGNALS[k].name));
      ul.appendChild(li);
    }
    return ul;
  }

  function renderIntro() {
    panel.replaceChildren();
    const phone = narrow();
    panel.appendChild(h('h2', null, phone ? 'Tap a dot, or follow a signal' : 'Start anywhere'));
    panel.appendChild(h('p', null, 'Every dot is a piece of gear on our stage, and every line is a cable or a wireless link. The color of a line tells you what kind of signal it carries, and it changes as the signal moves: a keyboard\'s amber line turns cyan at its DI box.'));
    if (phone) panel.appendChild(h('p', 'hint', 'Pinch or use + and − to zoom, drag to move around, and drag this panel up or down.'));
    panel.appendChild(h('h3', null, phone ? 'Follow one signal all the way' : 'Or follow one signal all the way'));
    const list = h('div', 'intro-tours');
    TOURS.forEach(t => {
      const b = h('button', 'hop');
      b.appendChild(h('b', null, t.name));
      b.appendChild(h('span', null, t.stops.length + ' stops ›'));
      b.addEventListener('click', () => { tourSel.value = t.id; startTour(t.id); });
      list.appendChild(b);
    });
    panel.appendChild(list);
    if (phone) {
      panel.appendChild(h('h3', null, 'Line colors'));
      panel.appendChild(legendList());
      panel.appendChild(h('p', 'orient-note', 'Drawn from above, as seen from the congregation. Not to scale.'));
    }
  }

  /* ---------- selection ---------- */
  let current = null;
  function select(id) {
    current = id;
    if (!id) {
      light(null);
      renderIntro();
      setHash('');
      focusBox = null;
      if (narrow()) { setSheet('peek'); fitAll(); }
      return;
    }
    const route = routeOf(id);
    const chain = route.on;
    const lit = light(chain, id);
    renderStop(id, null, route.dests);
    setHash(id);
    showSheet();
    focus(boxOf([...lit], chain));
  }

  /* ---------- tours ---------- */
  let tour = null, step = 0;
  TOURS.forEach(t => {
    const o = document.createElement('option');
    o.value = t.id; o.textContent = t.name;
    tourSel.appendChild(o);
  });
  function startTour(id) {
    tour = TOURS.find(t => t.id === id) || null;
    step = 0;
    setView('stage');
    showStep();
  }
  function stopTour() {
    if (!tour) return;
    tour = null; tourSel.value = '';
    prevBtn.disabled = nextBtn.disabled = true;
    countEl.textContent = '';
  }
  function showStep() {
    if (!tour) { select(null); return; }
    const on = new Set();
    for (let i = 1; i <= step; i++) {
      const w = wireBetween(tour.stops[i - 1], tour.stops[i]);
      if (w) on.add(w.i);
    }
    const id = tour.stops[step];
    light(on, id);
    for (const s of tour.stops.slice(0, step + 1)) STOPS[s].g.classList.add('lit');
    renderStop(id);
    if (step === tour.stops.length - 1 && tour.id === 'ears') {
      const note = h('p', 'confirm', 'Back where it started: the singer now hears their own voice, mixed with the band, through their in-ear pack.');
      panel.insertBefore(note, panel.querySelector('h3'));
    }
    // On phones, keep the whole tour route in view so each step shows where it sits in the flow.
    const whole = new Set();
    for (let i = 1; i < tour.stops.length; i++) {
      const w = wireBetween(tour.stops[i - 1], tour.stops[i]);
      if (w) whole.add(w.i);
    }
    showSheet();
    focus(boxOf(tour.stops, whole));
    prevBtn.disabled = step === 0;
    nextBtn.disabled = step === tour.stops.length - 1;
    countEl.textContent = `${step + 1}/${tour.stops.length}`;
  }
  tourSel.addEventListener('change', () => tourSel.value ? startTour(tourSel.value) : (stopTour(), select(null)));
  prevBtn.addEventListener('click', () => { if (tour && step > 0) { step--; showStep(); } });
  nextBtn.addEventListener('click', () => { if (tour && step < tour.stops.length - 1) { step++; showStep(); } });
  document.addEventListener('keydown', e => {
    if (!tour || e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
  });

  /* ---------- console view ---------- */
  function buildConsole() {
    consoleView.appendChild(h('h2', null, 'One channel, inside the FOH X32'));
    consoleView.appendChild(h('p', null, 'Every channel passes through the same stations in this order. Two of them send the signal somewhere else: the AES50 split to the monitor mixer, and the insert out to Waves on the Mac mini.'));
    const ul = h('ul', 'strip');
    CONSOLE.forEach(c => {
      const li = h('li');
      const b = h('button', 'stage-btn' + (c.branch ? ' branch' : ''));
      b.appendChild(h('b', null, c.label));
      b.appendChild(h('span', null, c.sub));
      b.addEventListener('click', () => {
        consoleView.querySelectorAll('.stage-btn').forEach(x => x.classList.toggle('on', x === b));
        panel.replaceChildren();
        panel.appendChild(tag(c.id === 'c-pre' ? 'mic' : 'digital'));
        panel.appendChild(h('h2', null, c.label));
        panel.appendChild(h('p', 'gear', c.sub));
        section(panel, 'What it is', c.what);
        section(panel, 'What happens to the signal here', c.flow);
        section(panel, 'Our setup', c.ours);
        section(panel, 'What goes wrong here', c.wrong);
        if (!b.dataset.auto) showSheet();
        delete b.dataset.auto;
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
    consoleView.appendChild(ul);
  }
  function setView(v) {
    const isConsole = v === 'console';
    consoleView.hidden = !isConsole;
    stageView.hidden = isConsole;
    document.getElementById('legend').hidden = isConsole;
    document.querySelector('.orient').hidden = isConsole;
    document.getElementById('v-stage').classList.toggle('on', !isConsole);
    document.getElementById('v-console').classList.toggle('on', isConsole);
    document.getElementById('v-stage').setAttribute('aria-pressed', !isConsole);
    document.getElementById('v-console').setAttribute('aria-pressed', isConsole);
    if (isConsole) {
      stopTour();
      const first = consoleView.querySelector('.stage-btn');
      first.dataset.auto = '1';
      first.click();
      if (narrow()) setSheet('peek');
    } else if (!tour) {
      requestAnimationFrame(() => select(current));
    }
  }
  document.getElementById('v-stage').addEventListener('click', () => setView('stage'));
  document.getElementById('v-console').addEventListener('click', () => setView('console'));

  /* ---------- deep links ---------- */
  function setHash(id) {
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) {}
  }

  /* ---------- layout changes (rotate, resize, phone <-> laptop) ---------- */
  function onLayout() {
    if (narrow()) {
      setSheet(sheetState, false);
      if (focusBox) fitBox(focusBox, false); else fitAll(false);
    } else {
      // Laptop and desktop: the whole map, exactly as drawn.
      cancelAnimationFrame(anim);
      document.documentElement.style.removeProperty('--sheet-h');
      apply({ ...FULL });
    }
  }
  let resizeTimer = 0;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(onLayout, 120); });
  phoneQuery.addEventListener('change', () => { onLayout(); if (!current && !tour) renderIntro(); else if (current) select(current); });

  document.getElementById('legend').replaceWith(Object.assign(legendList(), { id: 'legend' }));
  draw();
  buildConsole();
  onLayout();
  const start = location.hash.slice(1);
  select(STOPS[start] ? start : null);
}
