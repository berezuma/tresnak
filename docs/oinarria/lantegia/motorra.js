// Lantegien motorra: nabigazioa, unitateen orriak (Ikusi · Ulertu · Kalkulatu · Egiaztatu),
// ariketak, galdetegiak, aurrerapena eta (aukeran) ikas-mailak.
//
// Lantegi bakoitzak konfigurazio bat ematen du:
//   izena, aplikazioa, eyebrow, lede, TALDEAK, ZERRENDA, PRESTAK, ARIKETAK, zuzena, progress,
//   unitatea(id) → import(), sim(izena) → import(), orriak { id: () => import() },
//   ariketaMailak [3 izen], mailak? { 1: {izena, laburra}, 2: …, 3: … }, HITZAK?, glosarioAdibidea?,
//   fitxaOharra?, bukaera? { href, testua }, irudiak? (json-aren bidea)
import { parseNum, esc, fmt } from './util.js';

const ASKI = 3; // ariketa zuzen hauekin "Kalkulatu" urratsa eginda

export function lantegia(cfg) {
  const { TALDEAK, ZERRENDA, PRESTAK, ARIKETAK, zuzena, progress } = cfg;
  const edukia = document.getElementById('edukia');
  const menu = document.getElementById('menu');
  const orriak = {
    glosarioa: () => import('./orriak/glosarioa.js'),
    irakaslea: () => import('./orriak/irakaslea.js'),
    ...cfg.orriak
  };

  let irudiak = {};
  let cleanup = [];

  // ---------- ikas-maila (aukerakoa) ----------
  const MAILA_KEY = cfg.aplikazioa + ':maila';
  const mailak = cfg.mailak || null;
  function maila() {
    if (!mailak) return 3;
    try { const m = +localStorage.getItem(MAILA_KEY); return mailak[m] ? m : 1; } catch { return 1; }
  }
  function setMaila(m) {
    try { localStorage.setItem(MAILA_KEY, String(m)); } catch { /* memorian ez da gordetzen */ }
    route();
  }
  cfg.maila = mailak ? maila : null;
  const uMaila = u => u.maila || 1;
  const nireak = () => PRESTAK.filter(u => uMaila(u) <= maila());
  const mailaTag = u => mailak && uMaila(u) > 1 ? `<span class="lvl lvl-${uMaila(u)}" title="${esc(mailak[uMaila(u)].izena)}">${mailak[uMaila(u)].laburra}</span>` : '';
  function mailaSeg(id) {
    if (!mailak) return '';
    return `<div class="level-pick"><span id="${id}-l">Zure maila</span>
      <div class="seg" role="group" aria-labelledby="${id}-l">
        ${Object.keys(mailak).map(m => `<button data-maila="${m}" class="${+m === maila() ? 'active' : ''}" aria-pressed="${+m === maila()}">${mailak[m].izena}</button>`).join('')}
      </div></div>`;
  }
  function wireMaila(root) {
    root.querySelectorAll('[data-maila]').forEach(bt => bt.addEventListener('click', () => {
      if (+bt.dataset.maila !== maila()) setMaila(+bt.dataset.maila);
    }));
  }

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
    return `<footer class="lan-foot">Egilea: <a href="https://berezuma.com">Beñat Erezuma Arisketa</a> · Lizentzia: CC BY-SA 4.0${ZERRENDA.some(u => u.id === 'glosarioa' && !u.laster) ? ' · <a href="#/glosarioa">Glosarioa</a>' : ''}${ZERRENDA.some(u => u.id === 'irakaslea' && !u.laster) ? ' · <a href="#/irakaslea">Irakasleentzat</a>' : ''}${Object.keys(irudiak).length ? ' · <a href="#/kredituak">Irudien kredituak</a>' : ''}</footer>`;
  }
  const ctx = { fig, footer, cfg };

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
    const data = { aplikazioa: cfg.aplikazioa, bertsioa: 1, data: new Date().toISOString(), aurrerapena: progress.all() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${cfg.aplikazioa}-aurrerapena-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  async function importProgress(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data?.aplikazioa !== cfg.aplikazioa || typeof data.aurrerapena !== 'object') throw new Error();
      progress.replace(data.aurrerapena);
      showMsg('Aurrerapena inportatuta.');
    } catch {
      showMsg(`Fitxategi hori ez da ${cfg.izena}ren aurrerapena.`, true);
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
    const m = maila();
    document.getElementById('menu-list').innerHTML = TALDEAK.map(t => `
      <div class="menu-group">
        <h2>${t.izena}</h2>
        ${t.unitateak.map(u => u.laster
          ? `<span class="menu-link" style="color:var(--ink3)" title="${esc(u.desk)}">${u.izena}<span class="new">laster</span></span>`
          : `<a class="menu-link ${u.id === active ? 'on' : ''} ${!u.orria && uMaila(u) > m ? 'above' : ''}" href="#/${u.id}" ${u.id === active ? 'aria-current="page"' : ''}>${u.izena}${u.orria ? '' : mailaTag(u) + marks(u)}</a>`).join('')}
      </div>`).join('');
    const lista = nireak();
    const done = lista.filter(unitDone).length;
    const foot = document.getElementById('menu-foot');
    foot.innerHTML =
      `<div>Zure aurrerapena: <b>${done} / ${lista.length}</b> atal${mailak ? ` <span class="dim">(${mailak[m].izena})</span>` : ''}</div>
       <div class="bar"><span style="width:${lista.length ? Math.round(done / lista.length * 100) : 0}%"></span></div>
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
    const m = maila();
    edukia.innerHTML = `
      <header class="home-hero">
        <div class="eyebrow">${cfg.eyebrow}</div>
        <h1>${cfg.izena}</h1>
        <p class="lede">${cfg.lede}</p>
        <div class="pills"><span class="pill strong">Ikusi</span><span class="pill strong">Ulertu</span><span class="pill strong">Kalkulatu</span><span class="pill strong">Egiaztatu</span></div>
        ${mailaSeg('home-maila')}
        ${mailak ? `<p class="level-note">${mailak[m].azalpena || ''}</p>` : ''}
      </header>
      ${TALDEAK.map(t => `
        <section class="home-group">
          <h2>${t.izena}</h2>
          <div class="home-cards">
            ${t.unitateak.map(u => {
              if (u.laster) return `<div class="home-card" style="box-shadow:none;border-style:dashed;border-color:var(--ink3)"><b>${u.izena}</b><span>${u.desk}</span><span class="state">Laster</span></div>`;
              if (u.orria) return `<a class="home-card" href="#/${u.id}"><b>${u.izena}</b><span>${u.desk}</span><span class="state">Ireki</span></a>`;
              const p = progress.get(u.id), done = unitDone(u);
              return `<a class="home-card ${uMaila(u) > m ? 'above' : ''}" href="#/${u.id}"><b>${u.izena}</b><span>${u.desk}</span><span class="state ${done ? 'done' : ''}">${done ? 'Eginda' : (p.ariketak || p.galdetegia) ? 'Hasita' : 'Hasi'}${mailaTag(u)}</span></a>`;
            }).join('')}
          </div>
        </section>`).join('')}
      ${footer()}`;
    wireMaila(edukia);
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
    const u = (await cfg.unitatea(id)).default;
    const m = maila();
    const idx = PRESTAK.findIndex(x => x.id === id);
    const prev = PRESTAK[idx - 1], next = PRESTAK[idx + 1];
    const quiz = (u.galdetegia || []).filter(q => (q.maila || 1) <= m);
    const steps = [
      { id: 'ikusi', izena: 'Ikusi' },
      { id: 'ulertu', izena: 'Ulertu' },
      ...(u.ariketak?.length ? [{ id: 'kalkulatu', izena: 'Kalkulatu' }] : []),
      ...(quiz.length ? [{ id: 'egiaztatu', izena: 'Egiaztatu' }] : [])
    ];
    const uctx = { ...ctx, maila: m };
    const bukaera = cfg.bukaera || { href: '#/', testua: 'Hasiera' };

    edukia.innerHTML = `
      <header class="u-head">
        <div class="eyebrow">${meta.taldea}${mailak ? ` · ${mailak[uMaila(meta)].izena}${uMaila(meta) < 3 ? ' eta aurrerantzean' : ''}` : ''}</div>
        <h1>${u.izena}</h1>
        ${mailak && uMaila(meta) > m ? `<div class="notice">Atal hau <b>${mailak[uMaila(meta)].izena}</b> mailakoa da. Zu <b>${mailak[m].izena}</b> mailan zaude: saiatu, baina agian aurretik beste atal batzuk landu beharko dituzu.</div>` : ''}
        ${u.galdera ? `<div class="hook"><b>?</b><p>${u.galdera}</p></div>` : ''}
      </header>
      <nav class="u-steps" aria-label="Urratsak">
        ${steps.map(s => `<a href="#/${id}/${s.id}" data-step="${s.id}"><i></i>${s.izena}</a>`).join('')}
        ${mailak ? `<span class="u-level">${mailaSeg('u-maila')}</span>` : ''}
      </nav>
      <section class="step" id="ikusi"><div class="step-label"><h2>Ikusi</h2><span>1. urratsa</span></div><div id="ikusi-in"></div></section>
      <section class="step" id="ulertu"><div class="step-label"><h2>Ulertu</h2><span>2. urratsa</span></div><div class="prose">${u.ulertu(uctx)}</div></section>
      ${u.ariketak?.length ? `<section class="step" id="kalkulatu"><div class="step-label"><h2>Kalkulatu</h2><span>3. urratsa</span></div><div id="kalk-in"></div></section>` : ''}
      ${quiz.length ? `<section class="step" id="egiaztatu"><div class="step-label"><h2>Egiaztatu</h2><span>${steps.length}. urratsa</span></div><div id="quiz-in"></div></section>` : ''}
      <nav class="pager">
        ${prev ? `<a class="btn" href="#/${prev.id}">← ${prev.izena}</a>` : '<span></span>'}
        ${next ? `<a class="btn primary" href="#/${next.id}">${next.izena} →</a>` : `<a class="btn primary" href="${bukaera.href}">${bukaera.testua}</a>`}
      </nav>
      ${footer()}`;
    wireMaila(edukia);
    applyLevelBlocks(edukia, m);

    // Ikusi: simulagailua edo irudiak
    const ikusi = document.getElementById('ikusi-in');
    if (u.ikusi?.sim) {
      const sim = await cfg.sim(u.ikusi.sim);
      const box = document.createElement('div');
      ikusi.appendChild(box);
      const stop = sim.default(box, { ...(u.ikusi.aukerak || {}), maila: m });
      if (typeof stop === 'function') cleanup.push(stop);
    }
    if (u.ikusi?.html) ikusi.insertAdjacentHTML('beforeend', u.ikusi.html(uctx));
    if (u.ikusi?.proba) ikusi.insertAdjacentHTML('beforeend', `<p class="sim-try">${u.ikusi.proba}</p>`);
    applyLevelBlocks(ikusi, m);

    if (u.ariketak?.length) renderExercises(document.getElementById('kalk-in'), u, id);
    if (quiz.length) renderQuiz(document.getElementById('quiz-in'), quiz, id);
    updateStepMarks(id);

    if (focusStep && document.getElementById(focusStep)) {
      document.getElementById(focusStep).scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }

  // <details class="sakondu" data-maila="3"> blokeak: zure mailakoak irekita, goragokoak itxita
  function applyLevelBlocks(root, m) {
    root.querySelectorAll('.sakondu[data-maila]').forEach(d => {
      const lv = +d.dataset.maila;
      if (mailak && !d.dataset.tagged) {
        d.dataset.tagged = '1';
        d.querySelector('summary')?.insertAdjacentHTML('beforeend', ` <span class="lvl lvl-${lv}">${mailak[lv].laburra}</span>`);
      }
      d.open = lv <= m;
    });
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
    let ex_maila = Math.min(maila(), 3), turn = 0, ex, gen, tries = 0;
    const izenak = cfg.ariketaMailak;
    root.innerHTML = `
      <div class="ex-bar">
        <div class="seg" role="radiogroup" aria-label="Ariketen maila">
          ${[1, 2, 3].map(n => `<button data-m="${n}" class="${n === ex_maila ? 'active' : ''}" aria-pressed="${n === ex_maila}">${izenak[n - 1]}</button>`).join('')}
        </div>
        <div class="ex-count" id="ex-count"></div>
      </div>
      <div class="exercise">
        <div class="eyebrow" id="ex-kind"></div>
        <div class="q" id="ex-q"></div>
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
      ex = gen.sortu(ex_maila);
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
        fb.textContent = `Zuzena! ${fmt(ex.erantzuna, ex.hamartarrak ?? 2)} ${ex.unitatea}`;
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
      ex_maila = +bt.dataset.m;
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
  function renderQuiz(root, galdetegia, unitId) {
    const answers = new Map();
    root.innerHTML = `<div class="quiz">
      ${galdetegia.map((q, i) => `
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
      galdetegia.forEach((q, i) => {
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
      const all = ok === galdetegia.length;
      const res = root.querySelector('#quiz-res');
      res.className = 'quiz-result ' + (all ? 'ok' : 'no');
      res.textContent = all ? `${ok} / ${ok}: atal hau eginda!` : `${ok} / ${galdetegia.length}. Irakurri azalpenak eta saiatu berriro.`;
      if (all) progress.set(unitId, { galdetegia: true });
      updateStepMarks(unitId);
      root.querySelector('#quiz-go').hidden = true;
      root.querySelector('#quiz-again').hidden = false;
    });
    root.querySelector('#quiz-again').addEventListener('click', () => renderQuiz(root, galdetegia, unitId));
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
        const page = await orriak[id]();
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
    document.title = meta ? `${meta.izena} — ${cfg.izena}` : cfg.izena;
  }

  document.addEventListener('aurrerapena', () => renderMenu((location.hash.match(/^#\/([^/]*)/) || [])[1]));
  window.addEventListener('hashchange', route);

  (async () => {
    if (cfg.irudiak) {
      try { irudiak = await (await fetch(cfg.irudiak)).json(); } catch { irudiak = {}; }
    }
    route();
  })();
}
