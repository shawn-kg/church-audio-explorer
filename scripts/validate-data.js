#!/usr/bin/env node
/*
  Checks js/data.js for mistakes that would break the stage map:
  missing stops, cables pointing at stops that don't exist, tours that
  jump between stops with no cable between them, and positions that fall
  off the drawing. Run with: npm test
*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const file = path.join(__dirname, '..', 'js', 'data.js');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: 'js/data.js' });
const { SIGNALS, AREAS, STOPS, WIRES, TOURS, CONSOLE, DESTINATIONS, SENDS } = sandbox.window;

const errors = [];
const fail = msg => errors.push(msg);

// The drawing's coordinate space (see the viewBox in index.html).
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(html);
if (!vb) fail('index.html: could not find the stage viewBox');
const W = vb ? Number(vb[1]) : Infinity;
const H = vb ? Number(vb[2]) : Infinity;

for (const name of ['SIGNALS', 'AREAS', 'STOPS', 'WIRES', 'TOURS', 'CONSOLE', 'DESTINATIONS', 'SENDS']) {
  if (!sandbox.window[name]) fail(`data.js: window.${name} is missing`);
}

const KINDS = new Set(['source', 'di', 'snake', 'hub', 'board', 'p16', 'out']);
for (const [id, s] of Object.entries(STOPS || {})) {
  if (!/^[A-Za-z][A-Za-z0-9]*$/.test(id)) fail(`stop "${id}": ids must be letters and digits only`);
  if (!s.label) fail(`stop "${id}": missing label`);
  if (typeof s.x !== 'number' || typeof s.y !== 'number') fail(`stop "${id}": missing x or y`);
  else if (s.x < 0 || s.x > W || s.y < -30 || s.y > H) fail(`stop "${id}": position (${s.x}, ${s.y}) is off the drawing`);
  if (!SIGNALS[s.signal]) fail(`stop "${id}": unknown signal "${s.signal}"`);
  if (!KINDS.has(s.kind)) fail(`stop "${id}": unknown kind "${s.kind}"`);
  if (s.kind === 'p16' ? !s.for : !s.what) fail(`stop "${id}": missing its description`);
  if (s.ch && !s.ch.every(c => Number.isInteger(c) && c >= 1 && c <= 32)) fail(`stop "${id}": channel numbers must be 1 to 32`);
  if (s.parts) for (const p of s.parts) if (!p.id || !p.label) fail(`stop "${id}": a part is missing its id or label`);
}

const seenWire = new Set();
(WIRES || []).forEach(([from, to, type, via], i) => {
  const where = `cable ${i + 1} (${from} -> ${to})`;
  if (!STOPS[from]) fail(`${where}: no stop called "${from}"`);
  if (!STOPS[to]) fail(`${where}: no stop called "${to}"`);
  if (!SIGNALS[type]) fail(`${where}: unknown signal "${type}"`);
  if (via && !via.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))) fail(`${where}: bend points must be [x, y] pairs`);
  const key = `${from}>${to}`;
  if (seenWire.has(key)) fail(`${where}: listed twice`);
  seenWire.add(key);
});

const connected = (a, b) => (WIRES || []).some(([f, t]) => (f === a && t === b) || (f === b && t === a));
const tourIds = new Set();
for (const t of TOURS || []) {
  if (tourIds.has(t.id)) fail(`tour "${t.id}": duplicate id`);
  tourIds.add(t.id);
  if (!t.name) fail(`tour "${t.id}": missing name`);
  t.stops.forEach((s, i) => {
    if (!STOPS[s]) fail(`tour "${t.id}": no stop called "${s}"`);
    else if (i > 0 && !connected(t.stops[i - 1], s)) fail(`tour "${t.id}": no cable between "${t.stops[i - 1]}" and "${s}"`);
  });
}

for (const [key, d] of Object.entries(DESTINATIONS || {})) {
  if (!d.label) fail(`destination "${key}": missing label`);
  for (const [f, t] of [...(d.wires || []), ...(d.stub || [])]) {
    if (!(WIRES || []).some(([wf, wt]) => wf === f && wt === t)) fail(`destination "${key}": no cable from "${f}" to "${t}"`);
  }
  for (const [f, t] of d.stub || []) {
    if (!(d.wires || []).some(([wf, wt]) => wf === f && wt === t)) fail(`destination "${key}": stub cable ${f} -> ${t} is not in its full list`);
  }
}
for (const [id, list] of Object.entries(SENDS || {})) {
  if (id !== 'default' && !STOPS[id]) fail(`sends: no stop called "${id}"`);
  if (id !== 'default' && STOPS[id] && STOPS[id].kind !== 'source') fail(`sends: "${id}" is not an input`);
  for (const k of list) if (!(DESTINATIONS || {})[k]) fail(`sends for "${id}": unknown destination "${k}"`);
}

for (const a of AREAS || []) {
  if (!a.id || !a.label) fail('an area is missing its id or label');
}
for (const c of CONSOLE || []) {
  if (!c.id || !c.label || !c.what) fail(`console station "${c.id || '?'}": missing id, label or description`);
}

// Every stop should be reachable by at least one cable.
const used = new Set((WIRES || []).flatMap(([f, t]) => [f, t]));
for (const id of Object.keys(STOPS || {})) if (!used.has(id)) fail(`stop "${id}": no cable connects to it`);

if (errors.length) {
  console.error(`data.js has ${errors.length} problem${errors.length === 1 ? '' : 's'}:\n`);
  errors.forEach(e => console.error('  - ' + e));
  process.exit(1);
}
console.log(`data.js OK: ${Object.keys(STOPS).length} stops, ${WIRES.length} cables, ${TOURS.length} tours, ${CONSOLE.length} console stations.`);
