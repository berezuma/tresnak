// Mekanismoen Lantegia — nabigazioa, unitateen orriak, ariketak eta galdetegiak
import { TALDEAK, ZERRENDA, PRESTAK } from './unitateak/index.js';
import { ARIKETAK, zuzena } from './ariketak.js';
import { progress, parseNum, esc, fmt } from './util.js';

const edukia = document.getElementById('edukia');
const menu = document.getElementById('menu');
const ASKI = 3; // ariketa zuzen hauekin "Kalkulatu" urratsa eginda

let irudiak = {};
let cleanup = [];

// ---------- irudiak kredituekin ----------
function fig(key, caption = '', cls = '') {
  const i = irudiak[key];
  if (!i) return '';
  return `<figure class="fig ${cls}">
    <img src="irudiak/${i.fitxategia}" alt="${esc(caption)}" loading="lazy">
    <figcaption>${caption}<span class="credit">Irudia: ${esc(i.egilea || 'Wikimedia Commons')} · <a href="${i.iturria}" target="_blank" rel="noopener">${esc(i.lizentzia)}</a></span></figcaption>
  </figure>`;
}
function footer() {
  return `<footer class="lan-foot">Egilea: <a href="https://berezuma.com">Beñat Erezuma Arisketa</a> · Lizentzia: CC BY-SA 4.0 · <a href="#/glosarioa">Glosarioa</a> · <a href="#/irakaslea">Irakasleentzat</a> · <a href="#/kredituak">Irudien kredituak</a></footer>`;
}
const ctx = { fig, footer };

// ---------- aurrerapena ----------
// Atala eginda: ariketak (baldin badaude) eta galdetegia
function unitDone(u) {
  const p = progress.get(u.id);
  return (u.kalk === false || (p.ariketak || 0) >= ASKI) && !!p.galdetegia;
}
function marks(u) {
  const p = progress.get(u.id);
  const kalk = u.kalk === false ? '' : `<i class="${(p.ariketak || 0) >= ASKI ? 'done' : ''}"></i>`;
  return `<span class="mark" aria-hidden="true">${kalk}<i class="${p.galdetegia ? 'done' : ''}"></i></span>`;
}

function exportProgress() {
  const data = { aplikazioa: 'mekanismoen-lantegia', bertsioa: 1, data: new Date().toISOString(), aurrerapena: progress.all() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mekanismoen-lantegia-aurrerapena-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
async function importProgress(file, msg) {
  try {
    const data = JSON.parse(await file.text());
    if (data?.aplikazioa !== 'mekanismoen-lantegia' || typeof data.aurrerapena !== 'object') throw new Error();
    progress.replace(data.aurrerapena);
    showMsg('Aurrerapena inportatuta.');
  } catch {
    showMsg('Fitxategi hori ez da Mekanismoen Lantegiaren aurrerapena.', true);
  }
}
let msgTimer = 0;
function showMsg(text, err = false) {
  const el = document.getElementById('ap-msg');
  if (!el) return;
  el.textContent = text;
  el.style.color = err ? 'var(--danger)' : 'var(--ok)';
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => { el.textContent = ''; }, 4000);
}

// ---------- menua ----------
function renderMenu(active) {
  document.getElementById('menu-list').innerHTML = TALDEAK.map(t => `
    <div class="menu-group">
      <h2>${t.izena}</h2>
      ${t.unitateak.map(u => u.laster
        ? `<span class="menu-link" style="color:var(--ink3)" title="${esc(u.desk)}">${u.izena}<span class="new">laster</span></span>`
        : `<a class="menu-link ${u.id === active ? 'on' : ''}" href="#/${u.id}" ${u.id === active ? 'aria-current="page"' : ''}>${u.izena}${u.orria ? '' : marks(u)}</a>`).join('')}
    </div>`).join('');
  const done = PRESTAK.filter(unitDone).length;
  const foot = document.getElementById('menu-foot');
  foot.innerHTML =
    `<div>Zure aurrerapena: <b>${done} / ${PRESTAK.length}</b> atal</div>
     <div class="bar"><span style="width:${Math.round(done / PRESTAK.length * 100)}%"></span></div>
     <div>Nabigatzaile honetan gordetzen da.</div>
     <div class="foot-actions">
       <button class="btn sm" id="ap-export" title="Aurrerapena fitxategi batean gorde">Esportatu</button>
       <label class="btn sm" for="ap-file" title="Gordetako aurrerapena kargatu">Inportatu</label>
       <input type="file" id="ap-file" accept=".json,application/json" hidden>
       <button class="btn sm ghost" id="ap-reset">Hasi berriro</button>
     </div>
     <p class="foot-msg" id="ap-msg" aria-live="polite"></p>`;
  foot.querySelector('#ap-export').addEventListener('click', exportProgress);
  foot.querySelector('#ap-file').addEventListener('change', e => { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ''; });
  const reset = foot.querySelector('#ap-reset');
  let armed = false;
  reset.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      reset.textContent = 'Ziur? Sakatu berriro';
      setTimeout(() => { if (reset.isConnected) { armed = false; reset.textContent = 'Hasi berriro'; } }, 4000);
      return;
    }
    progress.replace({});
    showMsg('Aurrerapena ezabatuta.');
  });
}
document.getElementById('menu-toggle').addEventListener('click', e => {
  const open = menu.classList.toggle('open');
  e.currentTarget.setAttribute('aria-expanded', String(open));
});

// ---------- hasiera ----------
function renderHome() {
  edukia.innerHTML = `
    <header class="home-hero">
      <div class="eyebrow">DBH 2 eta 3 · Teknologia</div>
      <h1>Mekanismoen Lantegia</h1>
      <p class="lede">Makinek nola mugitzen eta biderkatzen duten indarra: ikusi simulagailuetan, ulertu formulak, kalkulatu zure ariketekin eta egiaztatu ikasitakoa.</p>
      <div class="pills"><span class="pill strong">Ikusi</span><span class="pill strong">Ulertu</span><span class="pill strong">Kalkulatu</span><span class="pill strong">Egiaztatu</span></div>
    </header>
    ${TALDEAK.map(t => `
      <section class="home-group">
        <h2>${t.izena}</h2>
        <div class="home-cards">
          ${t.unitateak.map(u => {
            if (u.laster) return `<div class="home-card" style="box-shadow:none;border-style:dashed;border-color:var(--ink3)"><b>${u.izena}</b><span>${u.desk}</span><span class="state">Laster</span></div>`;
            if (u.orria) return `<a class="home-card" href="#/${u.id}"><b>${u.izena}</b><span>${u.desk}</span><span class="state">Ireki</span></a>`;
            const p = progress.get(u.id), done = unitDone(u);
            return `<a class="home-card" href="#/${u.id}"><b>${u.izena}</b><span>${u.desk}</span><span class="state ${done ? 'done' : ''}">${done ? 'Eginda' : (p.ariketak || p.galdetegia) ? 'Hasita' : 'Hasi'}</span></a>`;
          }).join('')}
        </div>
      </section>`).join('')}
    ${footer()}`;
}

function renderCredits() {
  edukia.innerHTML = `
    <header class="u-head"><div class="eyebrow">Lantegia</div><h1>Irudien kredituak</h1></header>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Irudia</th><th>Egilea</th><th>Lizentzia</th></tr></thead>
      <tbody>${Object.entries(irudiak).map(([k, i]) => `<tr><td>${esc(k)}</td><td>${esc(i.egilea)}</td><td><a href="${i.iturria}" target="_blank" rel="noopener">${esc(i.lizentzia)}</a></td></tr>`).join('')}</tbody>
    </table></div>
    <p class="prose" style="margin-top:14px">Eskema eta simulagailu guztiak lantegi honetarako marraztuak dira (CC BY-SA 4.0). Argazkiak Wikimedia Commons-etik datoz, adierazitako lizentziekin.</p>
    ${footer()}`;
}

// ---------- unitatea ----------
async function renderUnit(id, focusStep) {
  const meta = ZERRENDA.find(u => u.id === id);
  if (!meta || meta.laster) { location.hash = '#/'; return; }
  const mod = await import(`./unitateak/${id}.js`);
  const u = mod.default;
  const idx = PRESTAK.findIndex(x => x.id === id);
  const prev = PRESTAK[idx - 1], next = PRESTAK[idx + 1];
  const steps = [
    { id: 'ikusi', izena: 'Ikusi' },
    { id: 'ulertu', izena: 'Ulertu' },
    ...(u.ariketak?.length ? [{ id: 'kalkulatu', izena: 'Kalkulatu' }] : []),
    ...(u.galdetegia?.length ? [{ id: 'egiaztatu', izena: 'Egiaztatu' }] : [])
  ];

  edukia.innerHTML = `
    <header class="u-head">
      <div class="eyebrow">${meta.taldea}</div>
      <h1>${u.izena}</h1>
      ${u.galdera ? `<div class="hook"><b>?</b><p>${u.galdera}</p></div>` : ''}
    </header>
    <nav class="u-steps" aria-label="Urratsak">
      ${steps.map(s => `<a href="#/${id}/${s.id}" data-step="${s.id}"><i></i>${s.izena}</a>`).join('')}
    </nav>
    <section class="step" id="ikusi"><div class="step-label"><h2>Ikusi</h2><span>1. urratsa</span></div><div id="ikusi-in"></div></section>
    <section class="step" id="ulertu"><div class="step-label"><h2>Ulertu</h2><span>2. urratsa</span></div><div class="prose">${u.ulertu(ctx)}</div></section>
    ${u.ariketak?.length ? `<section class="step" id="kalkulatu"><div class="step-label"><h2>Kalkulatu</h2><span>3. urratsa</span></div><div id="kalk-in"></div></section>` : ''}
    ${u.galdetegia?.length ? `<section class="step" id="egiaztatu"><div class="step-label"><h2>Egiaztatu</h2><span>${steps.length}. urratsa</span></div><div id="quiz-in"></div></section>` : ''}
    <nav class="pager">
      ${prev ? `<a class="btn" href="#/${prev.id}">← ${prev.izena}</a>` : '<span></span>'}
      ${next ? `<a class="btn primary" href="#/${next.id}">${next.izena} →</a>` : `<a class="btn primary" href="#/erronkak">Erronkak →</a>`}
    </nav>
    ${footer()}`;

  // Ikusi: simulagailua edo irudiak
  const ikusi = document.getElementById('ikusi-in');
  if (u.ikusi?.sim) {
    const sim = await import(`./sim/${u.ikusi.sim}.js`);
    const box = document.createElement('div');
    ikusi.appendChild(box);
    const stop = sim.default(box, u.ikusi.aukerak || {});
    if (typeof stop === 'function') cleanup.push(stop);
  }
  if (u.ikusi?.html) ikusi.insertAdjacentHTML('beforeend', u.ikusi.html(ctx));
  if (u.ikusi?.proba) ikusi.insertAdjacentHTML('beforeend', `<p class="sim-try">${u.ikusi.proba}</p>`);

  if (u.ariketak?.length) renderExercises(document.getElementById('kalk-in'), u, id);
  if (u.galdetegia?.length) renderQuiz(document.getElementById('quiz-in'), u, id);
  updateStepMarks(id);

  if (focusStep && document.getElementById(focusStep)) {
    document.getElementById(focusStep).scrollIntoView();
  } else {
    window.scrollTo(0, 0);
  }
}

function updateStepMarks(id) {
  const p = progress.get(id);
  document.querySelectorAll('.u-steps a').forEach(a => {
    const s = a.dataset.step;
    const done = s === 'kalkulatu' ? (p.ariketak || 0) >= ASKI : s === 'egiaztatu' ? !!p.galdetegia : false;
    a.querySelector('i').classList.toggle('done', done);
  });
}

// ---------- ariketak ----------
function renderExercises(root, u, unitId) {
  let maila = 1, turn = 0, ex, gen, tries = 0;
  root.innerHTML = `
    <div class="ex-bar">
      <div class="seg" role="radiogroup" aria-label="Maila">
        <button data-m="1" class="active" aria-pressed="true">Oinarrizkoa</button>
        <button data-m="2" aria-pressed="false">Tartekoa</button>
        <button data-m="3" aria-pressed="false">Aditua</button>
      </div>
      <div class="ex-count" id="ex-count"></div>
    </div>
    <div class="exercise">
      <div class="eyebrow" id="ex-kind"></div>
      <p class="q" id="ex-q"></p>
      <div class="answer">
        <label for="ex-a">Erantzuna</label>
        <input id="ex-a" type="text" inputmode="decimal" autocomplete="off">
        <span class="unit" id="ex-unit"></span>
        <button class="btn primary" id="ex-check">Egiaztatu</button>
      </div>
      <p class="fb" id="ex-fb" aria-live="polite"></p>
      <div id="ex-sol"></div>
      <div class="pills">
        <button class="btn sm" id="ex-show">Erakutsi ebazpena</button>
        <button class="btn sm" id="ex-next">Beste ariketa bat</button>
      </div>
    </div>`;
  const $ = s => root.querySelector(s);
  const count = () => {
    const n = progress.get(unitId).ariketak || 0;
    $('#ex-count').innerHTML = n >= ASKI ? `<b>${n}</b> zuzen · urratsa eginda ✓` : `Zuzen: <b>${n}</b> / ${ASKI}`;
  };
  const solution = () => {
    $('#ex-sol').innerHTML = `<div class="solution"><b>Ebazpena</b><ol>${ex.ebazpena.map(l => `<li>${l}</li>`).join('')}</ol></div>`;
  };
  function next() {
    gen = ARIKETAK[u.ariketak[turn % u.ariketak.length]];
    turn++;
    ex = gen.sortu(maila);
    tries = 0;
    $('#ex-kind').textContent = gen.izena;
    $('#ex-q').innerHTML = ex.q;
    $('#ex-unit').textContent = ex.unitatea;
    $('#ex-a').value = '';
    $('#ex-fb').textContent = '';
    $('#ex-fb').className = 'fb';
    $('#ex-sol').innerHTML = '';
  }
  function check() {
    const val = parseNum($('#ex-a').value);
    const fb = $('#ex-fb');
    if (isNaN(val)) { fb.className = 'fb no'; fb.textContent = 'Idatzi zenbaki bat (koma edo puntua erabil dezakezu).'; return; }
    if (zuzena(ex, val)) {
      fb.className = 'fb ok';
      fb.textContent = `Zuzena! ${fmt(ex.erantzuna)} ${ex.unitatea}`;
      if (tries >= 0) {
        progress.set(unitId, { ariketak: (progress.get(unitId).ariketak || 0) + 1 });
        tries = -1; // ariketa bakoitza behin bakarrik zenbatu
      }
      solution();
      count();
      updateStepMarks(unitId);
    } else if (tries >= 0) {
      tries++;
      fb.className = 'fb no';
      fb.textContent = tries === 1 ? `Ez da hori. Pista: ${ex.pista}` : 'Oraindik ez. Begiratu ebazpena, eta saiatu beste ariketa batekin.';
      if (tries >= 2) solution();
    }
  }
  root.querySelectorAll('[data-m]').forEach(bt => bt.addEventListener('click', () => {
    maila = +bt.dataset.m;
    root.querySelectorAll('[data-m]').forEach(x => { x.classList.toggle('active', x === bt); x.setAttribute('aria-pressed', String(x === bt)); });
    next();
  }));
  $('#ex-check').addEventListener('click', check);
  $('#ex-a').addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  $('#ex-next').addEventListener('click', next);
  $('#ex-show').addEventListener('click', () => { tries = -1; solution(); });
  count();
  next();
}

// ---------- galdetegia ----------
function renderQuiz(root, u, unitId) {
  const answers = new Map();
  root.innerHTML = `<div class="quiz">
    ${u.galdetegia.map((q, i) => `
      <div class="qq" data-q="${i}">
        <p class="qq-text">${i + 1}. ${q.g}</p>
        <div class="qq-opts">${q.a.map((a, j) => `<button data-a="${j}" aria-pressed="false">${a}</button>`).join('')}</div>
        <p class="qq-why" hidden></p>
      </div>`).join('')}
    <div class="pills"><button class="btn primary" id="quiz-go">Zuzendu</button><button class="btn" id="quiz-again" hidden>Berriro egin</button></div>
    <p class="quiz-result" id="quiz-res" aria-live="polite"></p>
  </div>`;
  root.querySelectorAll('.qq').forEach(box => {
    box.querySelectorAll('[data-a]').forEach(bt => bt.addEventListener('click', () => {
      if (box.dataset.locked) return;
      box.querySelectorAll('[data-a]').forEach(x => x.setAttribute('aria-pressed', String(x === bt)));
      answers.set(+box.dataset.q, +bt.dataset.a);
    }));
  });
  root.querySelector('#quiz-go').addEventListener('click', () => {
    let ok = 0;
    u.galdetegia.forEach((q, i) => {
      const box = root.querySelector(`[data-q="${i}"]`);
      box.dataset.locked = '1';
      const chosen = answers.get(i);
      box.querySelectorAll('[data-a]').forEach(bt => {
        const j = +bt.dataset.a;
        bt.classList.toggle('right', j === q.z);
        bt.classList.toggle('wrong', j === chosen && j !== q.z);
      });
      if (chosen === q.z) ok++;
      const why = box.querySelector('.qq-why');
      why.hidden = false;
      why.textContent = (chosen === q.z ? 'Zuzena. ' : chosen === undefined ? 'Erantzun gabe. ' : 'Ez. ') + q.zergatik;
    });
    const all = ok === u.galdetegia.length;
    const res = root.querySelector('#quiz-res');
    res.className = 'quiz-result ' + (all ? 'ok' : 'no');
    res.textContent = all ? `${ok} / ${ok}: atal hau eginda!` : `${ok} / ${u.galdetegia.length}. Irakurri azalpenak eta saiatu berriro.`;
    if (all) progress.set(unitId, { galdetegia: true });
    updateStepMarks(unitId);
    root.querySelector('#quiz-go').hidden = true;
    root.querySelector('#quiz-again').hidden = false;
  });
  root.querySelector('#quiz-again').addEventListener('click', () => renderQuiz(root, u, unitId));
}

// ---------- bideratzailea ----------
async function route() {
  cleanup.forEach(fn => fn());
  cleanup = [];
  menu.classList.remove('open');
  document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
  const [, id, step] = (location.hash.match(/^#\/([^/]*)\/?(.*)$/) || []);
  const meta = ZERRENDA.find(u => u.id === id);
  renderMenu(id);
  try {
    if (!id) renderHome();
    else if (id === 'kredituak') renderCredits();
    else if (meta?.orria) {
      const page = await import(`./orriak/${id}.js`);
      const stop = await page.default(edukia, ctx);
      if (typeof stop === 'function') cleanup.push(stop);
      window.scrollTo(0, 0);
    }
    else await renderUnit(id, step);
  } catch (err) {
    console.error(err);
    edukia.innerHTML = `<div class="notice err">Atal hau ezin izan da kargatu. Freskatu orria.</div>`;
  }
  if (id) edukia.focus({ preventScroll: true });
  document.title = meta ? `${meta.izena} — Mekanismoen Lantegia` : 'Mekanismoen Lantegia';
}

document.addEventListener('aurrerapena', () => renderMenu((location.hash.match(/^#\/([^/]*)/) || [])[1]));
window.addEventListener('hashchange', route);

try {
  irudiak = await (await fetch('irudiak.json')).json();
} catch { irudiak = {}; }
route();
