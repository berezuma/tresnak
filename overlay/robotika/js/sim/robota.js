// Robot mugikorra: bi motorreko robot bat (trakzio diferentziala) pista batean, bi lerro-sentsorerekin eta ultrasoinu-sentsore batekin.
// Blokeekin programatzen da. Fisika sinplea: gurpil bakoitzaren abiaduratik robotaren abiadura eta biraketa ateratzen dira.
// Aukerak: adibideak [id], adibidea, pista, gorde (gakoa), libre, maila
import { esc, irakurri, gorde, fmt } from '../util.js';
import { Exekutatzailea, zenbakia, fmtBalioa } from '../blokeak/exekutatzailea.js';
import * as E from '../blokeak/eraiki.js';

const AW = 300, AH = 200;        // arena, cm
const VMAX = 30;                 // cm/s motorrak % 100ean
const B = 12;                    // gurpilen arteko tartea, cm
const R_ROBOT = 7;
const LERRO_ERDIA = 1.1;         // lerroaren zabaleraren erdia, cm
const SENTS_AURRE = 7, SENTS_ALBO = 2;

function obala() {
  const pts = [], cx = 150, cy = 100, L = 70, R = 55;
  for (let i = 0; i < 40; i++) pts.push([cx - L + 2 * L * i / 40, cy + R]);
  for (let i = 0; i < 40; i++) { const a = Math.PI / 2 - Math.PI * i / 40; pts.push([cx + L + R * Math.cos(a), cy + R * Math.sin(a)]); }
  for (let i = 0; i < 40; i++) pts.push([cx + L - 2 * L * i / 40, cy - R]);
  for (let i = 0; i < 40; i++) { const a = -Math.PI / 2 - Math.PI * i / 40; pts.push([cx - L + R * Math.cos(a), cy + R * Math.sin(a)]); }
  return pts;
}
function bihurgunea() {
  const pts = [];
  for (let i = 0; i < 260; i++) {
    const t = i / 260 * 2 * Math.PI;
    pts.push([150 + (100 + 16 * Math.sin(3 * t)) * Math.cos(t), 100 + (66 + 12 * Math.sin(2 * t)) * Math.sin(t)]);
  }
  return pts;
}
const hasieraLerroan = pts => [pts[0][0], pts[0][1], Math.atan2(pts[1][1] - pts[0][1], pts[1][0] - pts[0][0])];

export const PISTAK = {
  obala: { izena: 'Pista obala', lerroa: obala(), oztopoak: [] },
  bihurgunea: { izena: 'Bihurguneak', lerroa: bihurgunea(), oztopoak: [] },
  gela: { izena: 'Gela oztopoekin', lerroa: null, oztopoak: [{ x: 130, y: 30, w: 30, h: 50 }, { x: 210, y: 120, w: 40, h: 35 }, { x: 120, y: 140, w: 30, h: 30 }], hasiera: [40, 100, 0] }
};
Object.values(PISTAK).forEach(p => { p.hasiera ||= hasieraLerroan(p.lerroa); });

export const ADIBIDEAK = {
  hutsa: { izena: 'Programa hutsa', pista: 'gela', azalpena: 'Hasi hutsetik. «motorrak» blokeak abiadura ezartzen du, eta robotak abiadura horretan jarraitzen du beste agindu bat eman arte.',
    programa: () => E.programa([E.hasieran([]), E.betiko([])]) },
  karratua: { izena: 'Karratua (denborarekin)', pista: 'gela', azalpena: 'Begizta irekiko kontrola: 3 s aurrera eta 785 ms bere lekuan biratu (90°), lau aldiz. Sentsorerik ez: gurpilek irristatuz gero, robotak ez luke jakingo.',
    programa: () => E.programa([E.hasieran([E.errepikatu(4, [E.motorrak(60, 60), E.itxaron(3000), E.motorrak(40, -40), E.itxaron(785)]), E.geldituMotorrak()])]) },
  lerroa: { izena: 'Lerro-jarraitzailea', pista: 'obala', azalpena: 'Bi sentsoreak lerroaren bi aldeetan daude. Ezkerrekoak beltza ikusten badu, robota eskuinerantz desbideratu da: ezkerrera biratu behar du. Eta alderantziz.',
    programa: () => E.programa([E.betiko([
      E.baldinBestela(E.lerroa('EZK'), [E.motorrak(0, 50)], [E.baldinBestela(E.lerroa('ESK'), [E.motorrak(50, 0)], [E.motorrak(50, 50)])])
    ])]) },
  oztopoak: { izena: 'Oztopoak saihestu', pista: 'gela', azalpena: 'Ultrasoinu-sentsoreak aurrean oztopo bat 30 cm baino hurbilago detektatzen badu, robota ezkerrera biratzen da, aurrean 50 cm libre izan arte; bestela, aurrera. Denbora finko bat biratu beharrean, sentsoreari begiratzen dio.',
    programa: () => E.programa([E.betiko([
      E.baldinBestela(E.konparatu(E.distantzia(), 'LT', 30),
        [E.motorrak(-40, 40), E.arte(E.konparatu(E.distantzia(), 'GT', 50), [E.itxaron(20)])],
        [E.motorrak(60, 60)])
    ])]) },
  proportzionala: { izena: 'Paretarekiko distantzia', pista: 'gela', azalpena: 'Kontrol proportzionala: abiadura oztoporako distantziaren araberakoa da. Urrun dagoenean azkar, eta hurbiltzean mantso, 20 cm-ra gelditu arte.',
    programa: () => E.programa([E.betiko([
      E.ezarri('abiadura', E.eragiketa(E.eragiketa(E.distantzia(), 'KEN', 20), 'BIDER', 2)),
      E.baldin(E.konparatu(E.aldagaia('abiadura'), 'GT', 80), [E.ezarri('abiadura', 80)]),
      E.baldin(E.konparatu(E.aldagaia('abiadura'), 'LT', 0), [E.ezarri('abiadura', 0)]),
      E.motorrak(E.aldagaia('abiadura'), E.aldagaia('abiadura'))
    ])], ['abiadura']) }
};

function segmentuDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

export function sortuRobota(pistaId) {
  const r = {
    pista: PISTAK[pistaId], x: 0, y: 0, th: 0, vL: 0, vR: 0, talka: false, arrastoa: [], denbora: 0,
    berrezarri() { [r.x, r.y, r.th] = r.pista.hasiera; r.vL = r.vR = 0; r.talka = false; r.arrastoa = [[r.x, r.y]]; r.denbora = 0; },
    motorrak(a, b) { r.vL = Math.max(-100, Math.min(100, a)); r.vR = Math.max(-100, Math.min(100, b)); },
    sentsorea(alde) {
      const s = alde === 'EZK' ? 1 : -1;
      return [r.x + SENTS_AURRE * Math.cos(r.th) + s * SENTS_ALBO * Math.sin(r.th), r.y + SENTS_AURRE * Math.sin(r.th) - s * SENTS_ALBO * Math.cos(r.th)];
    },
    lerroan(alde) {
      const pts = r.pista.lerroa;
      if (!pts) return false;
      const [px, py] = r.sentsorea(alde);
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if (segmentuDist(px, py, a[0], a[1], b[0], b[1]) < LERRO_ERDIA) return true;
      }
      return false;
    },
    barruan(px, py) { return px < 0 || py < 0 || px > AW || py > AH || r.pista.oztopoak.some(o => px >= o.x && px <= o.x + o.w && py >= o.y && py <= o.y + o.h); },
    // Ultrasoinu-sentsoreak ±15°-ko konoa du: hiru izpiren gutxienekoa
    distantzia() {
      const fx = r.x + 6 * Math.cos(r.th), fy = r.y + 6 * Math.sin(r.th);
      let min = 200;
      for (const da of [-0.26, 0, 0.26]) {
        const c = Math.cos(r.th + da), s = Math.sin(r.th + da);
        for (let d = 0; d < min; d += 0.5) if (r.barruan(fx + d * c, fy + d * s)) { min = d; break; }
      }
      return min;
    },
    talkaDago(x, y) {
      if (x < R_ROBOT || y < R_ROBOT || x > AW - R_ROBOT || y > AH - R_ROBOT) return true;
      return r.pista.oztopoak.some(o => Math.hypot(x - Math.max(o.x, Math.min(x, o.x + o.w)), y - Math.max(o.y, Math.min(y, o.y + o.h))) < R_ROBOT);
    },
    urratsa(dt) {
      if (r.talka) return;
      const v = (r.vL + r.vR) / 2 * VMAX / 100, w = (r.vL - r.vR) * VMAX / 100 / B;
      const th = r.th + w * dt, nx = r.x + v * Math.cos(th) * dt, ny = r.y + v * Math.sin(th) * dt;
      if (r.talkaDago(nx, ny)) { r.talka = true; r.vL = r.vR = 0; return; }
      r.th = th; r.x = nx; r.y = ny; r.denbora += dt;
      const az = r.arrastoa[r.arrastoa.length - 1];
      if (Math.hypot(az[0] - r.x, az[1] - r.y) > 1.5) { r.arrastoa.push([r.x, r.y]); if (r.arrastoa.length > 1500) r.arrastoa.shift(); }
    }
  };
  r.berrezarri();
  return r;
}

export function robotBlokeak(r) {
  return {
    rm_motorrak: { *agindua(x, b) { r.motorrak(zenbakia(x.balioa(b, 'EZK')), zenbakia(x.balioa(b, 'ESK'))); } },
    rm_gelditu: { *agindua() { r.motorrak(0, 0); } },
    rm_lerroa: { balioa: (x, b) => r.lerroan(b.fields?.ALDEA) },
    rm_distantzia: { balioa: () => Math.round(r.distantzia()) }
  };
}

export default function mount(box, opts = {}) {
  const P = 'rm' + Math.random().toString(36).slice(2, 7);
  const ids = opts.adibideak || Object.keys(ADIBIDEAK).filter(k => k !== 'hutsa' || opts.libre);
  const GAKOA = opts.gorde || 'robotika:robota:v1';
  const egoera = { programak: {}, ...irakurri(GAKOA, {}) };
  let aid = ids.includes(opts.adibidea) ? opts.adibidea : ids.includes(egoera.azkena) ? egoera.azkena : ids[0];
  let pid = PISTAK[opts.pista] ? opts.pista : ADIBIDEAK[aid].pista;
  let r = sortuRobota(pid);
  let ex = null, ed = null, raf = 0, last = 0, hilda = false, gordeT = 0, abiadura = 1, arrastoa = true, azkenRead = '';

  box.innerHTML = `
    <div class="sim rb rms">
      <div class="rb-head">
        <label for="${P}-adib">Adibidea</label>
        <select id="${P}-adib">${ids.map(k => `<option value="${k}" ${k === aid ? 'selected' : ''}>${esc(ADIBIDEAK[k].izena)}</option>`).join('')}</select>
        <button class="btn sm ghost" id="${P}-orig" title="Adibidearen jatorrizko programa berriro kargatu">Jatorrizkoa</button>
        <label for="${P}-pista">Pista</label>
        <select id="${P}-pista">${Object.entries(PISTAK).map(([k, p]) => `<option value="${k}" ${k === pid ? 'selected' : ''}>${esc(p.izena)}</option>`).join('')}</select>
      </div>
      <div class="rb-body">
        <div class="rb-kodea">
          <div class="rb-brief"><p class="rb-azal" id="${P}-desk"></p></div>
          <div class="rb-editorea" id="${P}-ed"><div class="rb-kargatzen">Blokeak kargatzen…</div></div>
        </div>
        <div class="rb-mundua">
          <div class="rb-stage"><svg id="${P}-svg" viewBox="0 0 ${AW} ${AH}" role="img" aria-label="Robot mugikorra pistan"><g id="${P}-finko"></g><g id="${P}-dina"></g></svg></div>
          <div class="rb-ctl">
            <div class="pills">
              <button class="btn sm primary" id="${P}-run">▶ Exekutatu</button>
              <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
            </div>
            <div class="seg" role="group" aria-label="Abiadura"><button data-ab="1" class="active">× 1</button><button data-ab="2">× 2</button><button data-ab="4">× 4</button></div>
            <label class="check"><input type="checkbox" id="${P}-arr" checked> Arrastoa erakutsi</label>
            <div class="readouts" id="${P}-read" aria-live="off"></div>
            <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
          </div>
        </div>
      </div>
    </div>`;
  const $ = s => box.querySelector(s);

  function mezua(t, mota = '') { const el = $(`#${P}-msg`); el.className = 'rb-msg' + (mota ? ' ' + mota : ''); el.textContent = t; }

  function finkoa() {
    const p = r.pista;
    let s = `<rect class="rm-lurra" x="0" y="0" width="${AW}" height="${AH}"/>`;
    for (let x = 50; x < AW; x += 50) s += `<line class="rm-sareta" x1="${x}" y1="0" x2="${x}" y2="${AH}"/>`;
    for (let y = 50; y < AH; y += 50) s += `<line class="rm-sareta" x1="0" y1="${y}" x2="${AW}" y2="${y}"/>`;
    if (p.lerroa) s += `<polygon class="rm-lerroa" points="${p.lerroa.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}"/>`;
    p.oztopoak.forEach(o => { s += `<rect class="rm-oztopoa" x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="1.5"/>`; });
    s += `<text class="rm-eskala" x="4" y="${AH - 4}">50 cm</text><line class="rm-eskala-l" x1="4" y1="${AH - 12}" x2="54" y2="${AH - 12}"/>`;
    $(`#${P}-finko`).innerHTML = s;
  }

  function dinamikoa() {
    const ezk = r.lerroan('EZK'), esk = r.lerroan('ESK'), d = r.distantzia();
    const c = Math.cos(r.th), sn = Math.sin(r.th);
    let s = '';
    if (arrastoa && r.arrastoa.length > 1) s += `<polyline class="rm-arrastoa" points="${r.arrastoa.map(q => q.map(v => v.toFixed(1)).join(',')).join(' ')}"/>`;
    if (!r.pista.lerroa || d < 200) s += `<line class="rm-izpia" x1="${(r.x + 6 * c).toFixed(1)}" y1="${(r.y + 6 * sn).toFixed(1)}" x2="${(r.x + (6 + d) * c).toFixed(1)}" y2="${(r.y + (6 + d) * sn).toFixed(1)}"/>`;
    s += `<g transform="translate(${r.x.toFixed(2)} ${r.y.toFixed(2)}) rotate(${(r.th * 180 / Math.PI).toFixed(1)})">
      <rect class="rm-gurpila" x="-4" y="-8" width="8" height="2.6" rx="1"/><rect class="rm-gurpila" x="-4" y="5.4" width="8" height="2.6" rx="1"/>
      <rect class="rm-gorputza${r.talka ? ' talka' : ''}" x="-7" y="-5.6" width="14" height="11.2" rx="2.5"/>
      <circle class="rm-us" cx="6" cy="-2.2" r="1.4"/><circle class="rm-us" cx="6" cy="2.2" r="1.4"/>
      <circle class="rm-ir${ezk ? ' on' : ''}" cx="${SENTS_AURRE}" cy="${-SENTS_ALBO}" r="1"/><circle class="rm-ir${esk ? ' on' : ''}" cx="${SENTS_AURRE}" cy="${SENTS_ALBO}" r="1"/>
    </g>`;
    $(`#${P}-dina`).innerHTML = s;
    const v = (r.vL + r.vR) / 2 * VMAX / 100;
    const read = `<div><span>Motorrak (ezk · esk)</span><b>${fmt(r.vL, 0)} % · ${fmt(r.vR, 0)} %</b></div>
      <div><span>Lerro-sentsoreak (ezk · esk)</span><b>${ezk ? 'beltza' : 'zuria'} · ${esk ? 'beltza' : 'zuria'}</b></div>
      <div><span>Distantzia aurrean</span><b>${d >= 200 ? '> 200' : fmt(d, 0)} cm</b></div>
      <div><span>Abiadura</span><b>${fmt(Math.abs(v), 1)} cm/s</b></div>
      ${ex && ex.aldagaiZerrenda().some(([, v]) => v !== undefined) ? `<div><span>Aldagaiak</span><b>${esc(ex.aldagaiZerrenda().filter(([, v]) => v !== undefined).map(([k, v]) => `${k} = ${fmtBalioa(typeof v === 'number' ? Math.round(v) : v)}`).join(' · '))}</b></div>` : ''}`;
    if (read !== azkenRead) { $(`#${P}-read`).innerHTML = read; azkenRead = read; }
  }

  function exekutatu() {
    const json = ed?.json();
    if (!json) return;
    gelditu();
    r.berrezarri();
    ed.errorea(null);
    ex = new Exekutatzailea({ blokeak: robotBlokeak(r), hatak: { mb_betiko: 'betiko' } });
    ex.on('errorea', e => { mezua(e.message, 'err'); ed?.errorea(e.id); r.motorrak(0, 0); botoiak(); });
    ex.on('egoera', eg => { if (eg === 'amaituta') { mezua('Programa amaitu da.'); ed?.nabarmendu(null); } botoiak(); });
    ex.kargatu(json);
    if (!ex.goikoak.some(b => b.type === 'ekitaldia_hasi' || b.type === 'mb_betiko')) {
      mezua('Jarri blokeak «hasieran» edo «betiko» blokeen barruan.', 'err');
      ex = null;
      return;
    }
    mezua('');
    ex.hasi();
    begizta();
    botoiak();
  }
  function begizta() {
    cancelAnimationFrame(raf);
    last = performance.now();
    const frame = now => {
      if (hilda) return;
      const dt = Math.min(now - last, 100) * abiadura;
      last = now;
      const martxan = ex && ex.egoera === 'martxan';
      // 5 ms-ko urratsak: sentsoreak eta programa fisikarekin batera
      for (let t = 0; t < dt; t += 5) {
        const h = Math.min(5, dt - t);
        if (ex && ex.egoera === 'martxan') ex.aurreratu(h);
        r.urratsa(h / 1000);
        if (r.talka) break;
      }
      if (r.talka && ex && ex.egoera === 'martxan') { ex.gelditu(); mezua('Talka! Robotak oztopo bat edo pareta jo du.', 'err'); }
      if (martxan) ed?.nabarmendu(ex.egoera === 'martxan' ? ex.azkena : null);
      dinamikoa();
      const mugitzen = r.vL !== 0 || r.vR !== 0;
      raf = (ex && ex.egoera === 'martxan') || (mugitzen && !r.talka) ? requestAnimationFrame(frame) : 0;
      if (!raf) botoiak();
    };
    raf = requestAnimationFrame(frame);
  }
  function gelditu() {
    if (ex && ex.egoera === 'martxan') ex.gelditu();
    r.motorrak(0, 0);
    ed?.nabarmendu(null);
    botoiak();
  }
  function botoiak() {
    const martxan = ex && ex.egoera === 'martxan';
    const run = $(`#${P}-run`);
    run.textContent = martxan ? '■ Gelditu' : '▶ Exekutatu';
    run.classList.toggle('primary', !martxan);
  }
  $(`#${P}-run`).addEventListener('click', () => { if (ex && ex.egoera === 'martxan') { gelditu(); mezua('Geldituta.'); } else exekutatu(); });
  $(`#${P}-reset`).addEventListener('click', () => { gelditu(); ex = null; r.berrezarri(); mezua(''); ed?.errorea(null); dinamikoa(); });
  box.querySelectorAll('[data-ab]').forEach(b => b.addEventListener('click', () => {
    abiadura = +b.dataset.ab;
    box.querySelectorAll('[data-ab]').forEach(x => x.classList.toggle('active', x === b));
  }));
  $(`#${P}-arr`).addEventListener('change', e => { arrastoa = e.target.checked; dinamikoa(); });
  function aldatuPista(k) {
    gelditu();
    pid = k;
    $(`#${P}-pista`).value = k;
    r = sortuRobota(k);
    finkoa();
    dinamikoa();
  }
  $(`#${P}-pista`).addEventListener('change', e => { ex = null; aldatuPista(e.target.value); mezua(''); });

  function gordeLaster() {
    clearTimeout(gordeT);
    gordeT = setTimeout(() => {
      if (hilda || !ed) return;
      egoera.programak[aid] = ed.json();
      egoera.azkena = aid;
      gorde(GAKOA, egoera);
    }, 400);
  }
  $(`#${P}-adib`).addEventListener('change', e => {
    if (ed) egoera.programak[aid] = ed.json();
    gelditu();
    ex = null;
    aid = e.target.value;
    egoera.azkena = aid;
    gorde(GAKOA, egoera);
    $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena;
    ed?.kargatu(egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa());
    aldatuPista(ADIBIDEAK[aid].pista);
    mezua('');
  });
  $(`#${P}-orig`).addEventListener('click', () => {
    gelditu();
    delete egoera.programak[aid];
    gorde(GAKOA, egoera);
    ed?.kargatu(ADIBIDEAK[aid].programa());
    mezua('Jatorrizko programa kargatuta.');
  });

  $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena;
  finkoa();
  dinamikoa();
  import('../blokeak/editorea.js').then(({ sortuEditorea }) => sortuEditorea($(`#${P}-ed`), {
    tresnak: 'robotmugikorra',
    json: egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa(),
    onAldaketa: gordeLaster
  })).then(editorea => {
    if (hilda) { editorea.dispose(); return; }
    ed = editorea;
  }).catch(err => {
    console.error(err);
    $(`#${P}-ed`).innerHTML = '<div class="notice err">Bloke-editorea ezin izan da kargatu. Freskatu orria.</div>';
  });

  return () => {
    hilda = true;
    cancelAnimationFrame(raf);
    if (ex && ex.egoera === 'martxan') ex.gelditu();
    clearTimeout(gordeT);
    if (ed) { egoera.programak[aid] = ed.json(); gorde(GAKOA, egoera); ed.dispose(); }
  };
}
