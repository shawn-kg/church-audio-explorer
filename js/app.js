{
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.getElementById('stage');
  const panel = document.getElementById('panel');
  const tourSel = document.getElementById('tour');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const countEl = document.getElementById('count');
  const HUB = 'x32';

  // Label positions that differ from the default (below the dot).
  const LABEL = {
    diKeys: 'left', diAux: 'left', diElec: 'right', diBass: 'right', diMal: 'left',
    diClick: 'left', diSpd: 'right', click: 'right', spd: 'right',
    tbMain: 'left', tbBand: 'left', keys: 'left', aux: 'right', electric: 'below', bass: 'right', mal: 'right', joji: 'right',
    yellow: 'left', wireless: 'right', roomL: 'above', roomR: 'above',
    p16Keys: 'right', p16Aux: 'left', p16Elec: 'right', p16Bass: 'right', p16Mal: 'left', p16Drums: 'right',
    leftSub: 'below', rightSub: 'below', mainSnake: 'above', monMixer: 'below', p16d: 'below', router: 'below',
    receivers: 'below', drumSub: 'left', drumTB: 'below', kit: 'below',
    mac: 'below', x32: 'left', amps: 'left', stream: 'below',
    mainL: 'left', subL: 'left', monL: 'left', mainR: 'left', subR: 'left', monR: 'left'
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

  /* ---------- build the wires list ---------- */
  const wires = WIRES.map(([from, to, type, via, both], i) => ({ i, from, to, type, via: via || [], both: !!both }));

  /* ---------- draw the stage ---------- */
  function draw() {
    const defs = el('defs', {}, svg);
    const f = el('filter', { id: 'glow', x: '-20%', y: '-20%', width: '140%', height: '140%' }, defs);
    el('feGaussianBlur', { stdDeviation: '3', result: 'b' }, f);
    const m = el('feMerge', {}, f);
    el('feMergeNode', { in: 'b' }, m);
    el('feMergeNode', { in: 'SourceGraphic' }, m);

    const root = el('g', { transform: 'translate(0,30)' }, svg);

    const grid = el('g', { class: 'grid' }, root);
    for (let x = 0; x <= 1140; x += 40) el('line', { x1: x, y1: -30, x2: x, y2: 720 }, grid);
    for (let y = -30; y <= 720; y += 40) el('line', { x1: 0, y1: y, x2: 1140, y2: y }, grid);

    for (const a of AREAS) {
      const g = el('g', { class: 'area ' + a.id }, root);
      el('rect', { x: a.x, y: a.y, width: a.w, height: a.h, rx: 10 }, g);
      if (a.door) el('line', { class: 'door', x1: a.door[0], y1: a.door[1], x2: a.door[2], y2: a.door[3] }, g);
      const bottom = a.id === 'stage' || a.id === 'foh';
      const right = a.id === 'drums';
      if (a.id !== 'stage') el('text', { x: right ? a.x + a.w - 12 : a.x + 12, y: bottom ? a.y + a.h - 14 : a.y + 24, 'text-anchor': right ? 'end' : 'start' }, g).textContent = a.label;
    }
    el('line', { class: 'front', x1: 115, y1: 405, x2: 765, y2: 405 }, root);
    el('text', { class: 'note', x: 820, y: 560, 'text-anchor': 'middle' }, root).textContent = 'Congregation';

    // drum kit sketch
    const kit = el('g', { class: 'kit' }, root);
    [[930, 327, 22], [903, 305, 11], [958, 307, 13], [892, 337, 10], [968, 341, 9]].forEach(([cx, cy, r]) =>
      el('circle', { class: 'drum', cx, cy, r }, kit));

    const wireLayer = el('g', {}, root);
    const pulseLayer = el('g', {}, root);
    for (const w of wires) {
      const a = STOPS[w.from], b = STOPS[w.to];
      const pts = [[a.x, a.y], ...w.via, [b.x, b.y]];
      const d = 'M' + pts.map(p => p.join(' ')).join('L');
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
      g.addEventListener('click', () => { stopTour(); select(id); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stopTour(); select(id); } });
    }
  }

  /* ---------- highlighting ---------- */
  function chainOf(id) {
    const on = new Set();
    const walk = (n, dir) => {
      for (const w of wires) {
        const hit = dir === 'up' ? w.to === n : w.from === n;
        if (!hit || on.has(w.i)) continue;
        on.add(w.i);
        const next = dir === 'up' ? w.from : w.to;
        if (next !== HUB) walk(next, dir);
      }
    };
    if (id === HUB) wires.forEach(w => { if (w.from === HUB || w.to === HUB) on.add(w.i); });
    else { walk(id, 'up'); walk(id, 'down'); }
    return on;
  }

  function light(onSet, selected) {
    svg.classList.toggle('focus', !!onSet);
    const lit = new Set(selected ? [selected] : []);
    for (const w of wires) {
      const on = !!onSet && onSet.has(w.i);
      w.el.classList.toggle('on', on);
      w.pulse.classList.toggle('on', on);
      w.pulse.style.stroke = on ? '' : '';
      if (on) { lit.add(w.from); lit.add(w.to); }
    }
    for (const id in STOPS) {
      STOPS[id].g.classList.toggle('lit', lit.has(id));
      STOPS[id].g.classList.toggle('sel', id === selected);
    }
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
    const dot = h('i');
    t.style.color = colorOf(sig);
    t.appendChild(dot);
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

  function renderStop(id, partId) {
    const s = STOPS[id];
    const t = s.kind === 'p16' ? Object.assign({}, s, p16Text(s)) : s;
    panel.replaceChildren();
    panel.appendChild(tag(s.signal));
    panel.appendChild(h('h2', null, s.kind === 'p16' ? 'P16, ' + s.for : s.label));
    panel.appendChild(chLine(s.ch, s.gear));

    if (s.parts) {
      const chips = h('div', 'chips');
      s.parts.forEach(p => {
        const c = h('button', 'chip' + (p.id === partId ? ' on' : ''), p.label);
        c.addEventListener('click', () => renderStop(id, p.id === partId ? null : p.id));
        chips.appendChild(c);
      });
      panel.appendChild(chips);
    }
    const part = s.parts && s.parts.find(p => p.id === partId);
    if (part) {
      const box = h('div');
      box.appendChild(h('h3', null, part.label));
      box.appendChild(chLine(part.ch, part.gear));
      box.appendChild(h('p', null, part.text));
      panel.appendChild(box);
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

    // neighbours: where it comes from and goes to
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
  }

  function renderIntro() {
    panel.replaceChildren();
    panel.appendChild(h('h2', null, 'Start anywhere'));
    panel.appendChild(h('p', null, 'Every dot is a piece of gear on our stage, and every line is a cable or a wireless link. The color of a line tells you what kind of signal it carries, and it changes as the signal moves: a keyboard\'s amber line turns cyan at its DI box.'));
    panel.appendChild(h('h3', null, 'Or follow one signal all the way'));
    const list = h('div', 'intro-tours');
    TOURS.forEach(t => {
      const b = h('button', 'hop');
      b.appendChild(h('b', null, t.name));
      b.appendChild(h('span', null, t.stops.length + ' stops ›'));
      b.addEventListener('click', () => { tourSel.value = t.id; startTour(t.id); });
      list.appendChild(b);
    });
    panel.appendChild(list);
  }

  /* ---------- selection ---------- */
  let current = null;
  function select(id, opts = {}) {
    current = id;
    if (!id) { light(null); renderIntro(); setHash(''); return; }
    if (!opts.keepLight) light(chainOf(id), id);
    renderStop(id);
    setHash(id);
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
      panel.insertBefore(h('p', 'confirm', 'Back where it started: the singer now hears their own voice, mixed with the band, through their in-ear pack.'), panel.children[2]);
    }
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
  const consoleView = document.getElementById('consoleView');
  const stageView = document.getElementById('stageView');
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
    if (isConsole) { stopTour(); consoleView.querySelector('.stage-btn').click(); }
    else if (!tour) select(current);
  }
  document.getElementById('v-stage').addEventListener('click', () => setView('stage'));
  document.getElementById('v-console').addEventListener('click', () => setView('console'));

  /* ---------- legend ---------- */
  function buildLegend() {
    const ul = document.getElementById('legend');
    const dash = { inst: '9 5', digital: '14 4 3 4', wireless: '3 7' };
    for (const k in SIGNALS) {
      const li = document.createElement('li');
      const s = el('svg', { width: 34, height: 10, viewBox: '0 0 34 10', 'aria-hidden': 'true' });
      el('line', { x1: 2, y1: 5, x2: 32, y2: 5, stroke: colorOf(k), 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': dash[k] || '' }, s);
      li.appendChild(s);
      li.appendChild(h('span', null, SIGNALS[k].name));
      ul.appendChild(li);
    }
  }

  /* ---------- deep links ---------- */
  function setHash(id) {
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) {}
  }

  draw();
  buildLegend();
  buildConsole();
  const start = location.hash.slice(1);
  if (STOPS[start]) select(start); else renderIntro();
}
