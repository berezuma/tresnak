// Zirkuitu pneumatikoak: aginte zeharkakoa, ETA eta EDO balbulak, eta bi zilindroko sekuentziak
// (A+ B+ A− B−; A+ B+ B− A− seinale-gatazkarekin; eta kaskada-metodoarekin konponduta).
// Balbula biegonkorrek bi pilotuetan presioa badute, ez dira mugitzen: horixe da seinale-gatazka.
// Aukerak: modua, maila
import { esc } from '../util.js';
import { balbula, zilindroa, zilindroaB, iturria, ihesa, lerroa, testua, muga, logikaBalbula } from './pneumatika-ikurrak.js';

const ABIADURA = 0.75;
const LEIHOA = 16; // s, fase-diagraman

export const MODUAK = {
  zeharkakoa: {
    izena: 'Aginte zeharkakoa', sek: false,
    desk: 'Zilindro handiak balbula handi bat behar du. Balbula hori ez da eskuz eragiten: S1 eta S2 sakagailu txikiek aire-seinale bat bidaltzen diote (pilotaje pneumatikoa). 5/2 balbula biegonkorra da: seinalea kendu arren, posizioa gogoratzen du. Probatu S1 eta S2 aldi berean sakatzen.'
  },
  eta: {
    izena: 'ETA balbula', sek: false,
    desk: 'Prentsa baten segurtasuna: zilindroak aurrera egiten du S1 ETA S2 sakatuta badaude bakarrik, operadorearen bi eskuak prentsatik kanpo egon daitezen. Bi presioko balbulak (ETA) irteeran presioa du bi sarrerek presioa badute.'
  },
  edo: {
    izena: 'EDO balbula', sek: false,
    desk: 'Ate bat bi lekutatik ireki daiteke: S1 EDO S2 sakatzean. Hautagailu-balbularen (EDO) barruko bolak presiorik gabeko sarrera ixten du, airea beste sakagailutik kanpora joan ez dadin.'
  },
  sekuentzia: {
    izena: 'A+ B+ A− B−', sek: true,
    desk: 'Bi zilindroko sekuentzia bat, ibilbide-amaierako detektagailuekin (a0, a1, b0, b1). Mugimendu bakoitzak hurrengoaren seinalea aktibatzen du. Adibidez, pieza bat finkatu (A+), zulatu (B+), askatu (A−) eta zulagailua jaso (B−).',
    pilotuak: s => ({ A14: s.hasi && s.b0, A12: s.b1, B14: s.a1, B12: s.a0 }),
    etiketak: { A14: 'hasi · b0', A12: 'b1', B14: 'a1', B12: 'a0' }
  },
  gatazka: {
    izena: 'A+ B+ B− A− (gatazka)', sek: true,
    desk: 'Sekuentzia hau zuzenean ezin da muntatu. Hasieran b0 aktibo dago eta A balbulari «atzera» esaten dio; «Hasi» sakatzean, «aurrera» ere bai. Bi pilotuek presioa dute eta balbula ez da mugitzen. Gauza bera gertatuko litzateke B+ ondoren, a1 eta b1 aldi berean aktibo daudenean.',
    pilotuak: s => ({ A14: s.hasi, A12: s.b0, B14: s.a1, B12: s.b1 }),
    etiketak: { A14: 'hasi', A12: 'b0', B14: 'a1', B12: 'b1' }
  },
  kaskada: {
    izena: 'A+ B+ B− A− (kaskada)', sek: true,
    desk: 'Kaskada-metodoa: mugimenduak bi taldetan banatzen dira (G1: A+ B+ · G2: B− A−), eta memoria-balbula batek talde bakarrari ematen dio airea aldi berean. Talde aktiboak bakarrik elikatzen ditu bere seinaleak: horrela, ez dago gatazkarik.',
    etiketak: { A14: 'G1', A12: 'b0 · G2', B14: 'a1 · G1', B12: 'G2' }
  }
};

const eguneratu = (v, p14, p12) => p14 && !p12 ? 1 : p12 && !p14 ? 0 : v;
const mugitu = (x, helb, dt) => helb ? Math.min(1, x + ABIADURA * dt) : Math.max(0, x - ABIADURA * dt);

export default function mount(box, opts = {}) {
  const P = 'pz' + Math.random().toString(36).slice(2, 7);
  let modua = MODUAK[opts.modua] ? opts.modua : 'zeharkakoa';
  let S1 = false, S2 = false, xA = 0, xB = 0, vA = 0, vB = 0, M = 0, hasiT = 0, jarraitua = false;
  let t = 0, laginT = 0, laginak = [], raf = 0, hilda = false, last = performance.now();
  let azkenSvg = '', azkenBeste = '';

  box.innerHTML = `
    <div class="sim pzs">
      <div class="sim-body">
        <div class="sim-stage pz-stage">
          <svg id="${P}-svg" viewBox="0 0 640 440" role="img" aria-label="Zirkuitu pneumatikoa"></svg>
          <div id="${P}-fase-w" hidden><svg id="${P}-fase" class="pz-fase" viewBox="0 0 640 150" role="img" aria-label="Espazio-fase diagrama"></svg></div>
        </div>
        <div class="sim-panel">
          <label class="fd-hautatu" for="${P}-sel">Zirkuitua
            <select id="${P}-sel">${Object.entries(MODUAK).map(([k, m]) => `<option value="${k}">${esc(m.izena)}</option>`).join('')}</select>
          </label>
          <div class="pills" id="${P}-bakar">
            <button class="btn" id="${P}-s1" aria-pressed="false">S1 sakagailua</button>
            <button class="btn" id="${P}-s2" aria-pressed="false">S2 sakagailua</button>
          </div>
          <div id="${P}-sek" style="display:grid;gap:8px">
            <div class="pills">
              <button class="btn primary" id="${P}-hasi">Hasi</button>
              <button class="btn ghost" id="${P}-reset">Berrezarri</button>
            </div>
            <label class="check" for="${P}-jar"><input type="checkbox" id="${P}-jar"> Ziklo jarraitua (hasi sakatuta mantendu)</label>
          </div>
          <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
          <div class="readouts" id="${P}-read"></div>
          <p class="lab-hint" id="${P}-desk"></p>
        </div>
      </div>
      <div class="sim-foot"><span>Lerro jarraitua: potentzia-airea · marra etena: pilotaje-seinalea</span><span>Urdina: presioa</span></div>
    </div>`;
  const $ = q => box.querySelector(q);

  function berrezarri() {
    S1 = S2 = false; xA = xB = 0; vA = vB = 0; M = 0; hasiT = 0; t = 0; laginak = []; laginT = 0;
    azkenSvg = azkenBeste = '';
    ['s1', 's2'].forEach(k => { const b = $(`#${P}-${k}`); b.setAttribute('aria-pressed', 'false'); b.classList.remove('primary'); });
  }
  function ezarriModua(m) {
    modua = m;
    berrezarri();
    $(`#${P}-sel`).value = m;
    const sek = MODUAK[m].sek;
    $(`#${P}-bakar`).hidden = sek;
    $(`#${P}-sek`).hidden = !sek;
    $(`#${P}-fase-w`).hidden = !sek;
    $(`#${P}-desk`).textContent = MODUAK[m].desk;
  }

  function bakarra(dt) {
    let p14, p12, q = null, gatazka = false;
    if (modua === 'zeharkakoa') { p14 = S1; p12 = S2; vA = eguneratu(vA, p14, p12); gatazka = S1 && S2; }
    else { q = modua === 'eta' ? S1 && S2 : S1 || S2; p14 = q; p12 = false; vA = q ? 1 : 0; }
    xA = mugitu(xA, vA, dt);

    const cyl = zilindroa({ x: 150, y: 30, L: 220, pos: xA, aurre: vA === 1, atze: vA === 0 });
    const v = balbula({ sx: 380, y: 160, mota: '52', pos: vA, ezk: 'pilotua', esk: modua === 'zeharkakoa' ? 'pilotua' : 'malgukia', pilotuak: { ezk: p14, esk: p12 }, gatazka });
    const [x4, y4] = v.portua('4'), [x2, y2] = v.portua('2');
    let s = lerroa([[x4, y4], [x4, 120], [cyl.aurre[0], 120], cyl.aurre], vA === 1) + lerroa([[x2, y2], [x2, 100], [cyl.atze[0], 100], cyl.atze], vA === 0);
    s += v.svg + iturria(v.portua('1')) + ihesa(v.portua('5')) + ihesa(v.portua('3'));
    s += cyl.svg + testua(140, 56, 'A', 'pn-izena', 'end');
    s += modua === 'zeharkakoa' ? testua(422, 256, '5/2 biegonkorra, pilotatua', 'pn-lab') : testua(422, 276, '5/2 pilotatua, malgukiarekin', 'pn-lab');
    if (modua === 'zeharkakoa') {
      const b1 = balbula({ sx: 90, y: 300, mota: '32', pos: S1 ? 1 : 0 }), b2 = balbula({ sx: 450, y: 300, mota: '32', pos: S2 ? 1 : 0 });
      s += lerroa([b1.portua('A'), [110, v.ym], v.pilEzk], S1, true);
      s += lerroa([b2.portua('A'), [470, 262], [600, 262], [600, v.ym], v.pilEsk], S2, true);
      s += b1.svg + b2.svg + iturria(b1.portua('P')) + ihesa(b1.portua('R')) + iturria(b2.portua('P')) + ihesa(b2.portua('R'));
      s += testua(140, 292, 'S1 (aurrera)', 'pn-lab', 'start') + testua(500, 292, 'S2 (atzera)', 'pn-lab', 'start');
      s += testua(v.pilEzk[0] - 4, v.ym - 14, '14', 'pn-port', 'end') + testua(v.pilEsk[0] + 4, v.ym - 14, '12', 'pn-port', 'start');
    } else {
      const b1 = balbula({ sx: 90, y: 300, mota: '32', pos: S1 ? 1 : 0 }), b2 = balbula({ sx: 320, y: 300, mota: '32', pos: S2 ? 1 : 0 });
      const L = logikaBalbula(modua, 205, 250, { a: S1, b: S2 });
      s += lerroa([b1.portua('A'), [110, 250], L.a], S1, true) + lerroa([b2.portua('A'), [340, 250], L.b], S2, true);
      s += lerroa([L.q, [205, v.ym], v.pilEzk], L.irteera, true);
      s += L.svg + b1.svg + b2.svg + iturria(b1.portua('P')) + ihesa(b1.portua('R')) + iturria(b2.portua('P')) + ihesa(b2.portua('R'));
      s += testua(140, 292, 'S1', 'pn-lab', 'start') + testua(370, 292, 'S2', 'pn-lab', 'start');
    }
    const mezua = modua === 'zeharkakoa'
      ? (gatazka ? ['Bi pilotuek presioa dute: balbula ez da mugitzen (gatazka).', 'err'] : S1 || S2 ? ['', ''] : [vA ? 'Seinalerik gabe ere aurrean geratzen da: memoria.' : '', ''])
      : ['', ''];
    const read = `<div><span>S1 · S2</span><b>${S1 ? 1 : 0} · ${S2 ? 1 : 0}</b></div>
      ${modua === 'zeharkakoa' ? `<div><span>Pilotuak 14 · 12</span><b>${p14 ? 1 : 0} · ${p12 ? 1 : 0}</b></div>` : `<div><span>${modua === 'eta' ? 'ETA' : 'EDO'} balbularen irteera</span><b>${q ? 1 : 0}</b></div>`}
      <div class="hi"><span>A zilindroa</span><b>${xA >= 1 ? 'aurrean' : xA <= 0 ? 'atzean' : vA ? 'aurrera doa' : 'atzera doa'}</b></div>`;
    return { s, read, mezua, h: 400 };
  }

  function sekuentzia(dt) {
    const s0 = { a0: xA <= 0.001, a1: xA >= 0.999, b0: xB <= 0.001, b1: xB >= 0.999, hasi: hasiT > 0 || jarraitua };
    let pil, M1 = false, M2 = false;
    if (modua === 'kaskada') {
      M1 = s0.hasi && s0.a0 && M === 0;
      M2 = s0.b1 && M === 1;
      M = eguneratu(M, M1, M2);
      const g1 = M === 1, g2 = !g1;
      pil = { A14: g1, A12: s0.b0 && g2, B14: s0.a1 && g1, B12: g2 };
    } else pil = MODUAK[modua].pilotuak(s0);
    const gA = pil.A14 && pil.A12, gB = pil.B14 && pil.B12;
    vA = eguneratu(vA, pil.A14, pil.A12);
    vB = eguneratu(vB, pil.B14, pil.B12);
    xA = mugitu(xA, vA, dt);
    xB = mugitu(xB, vB, dt);
    hasiT = Math.max(0, hasiT - dt);

    const cA = zilindroaB({ x: 150, yb: 250, pos: xA, aurre: vA === 1, atze: vA === 0, izena: 'A' });
    const cB = zilindroaB({ x: 440, yb: 250, pos: xB, aurre: vB === 1, atze: vB === 0, izena: 'B' });
    const bA = balbula({ sx: 116, y: 290, mota: '52', pos: vA, ezk: 'pilotua', esk: 'pilotua', pilotuak: { ezk: pil.A14, esk: pil.A12 }, gatazka: gA });
    const bB = balbula({ sx: 406, y: 290, mota: '52', pos: vB, ezk: 'pilotua', esk: 'pilotua', pilotuak: { ezk: pil.B14, esk: pil.B12 }, gatazka: gB });
    let s = '';
    [[cA, bA, vA, 190], [cB, bB, vB, 480]].forEach(([c, b, v, xr]) => {
      const [x4, y4] = b.portua('4'), [x2, y2] = b.portua('2');
      s += lerroa([[x4, y4], c.aurre], v === 1) + lerroa([[x2, y2], [x2, 270], [xr, 270], [xr, c.atze[1]], c.atze], v === 0);
      s += b.svg + iturria(b.portua('1')) + ihesa(b.portua('5')) + ihesa(b.portua('3')) + c.svg;
    });
    s += muga(172, cA.rodTop0 - 3, 'a0', s0.a0) + muga(172, cA.rodTop1 - 3, 'a1', s0.a1);
    s += muga(462, cB.rodTop0 - 3, 'b0', s0.b0) + muga(462, cB.rodTop1 - 3, 'b1', s0.b1);
    const E = MODUAK[modua].etiketak;
    const lab = (x, anchor, k, on, gat) => `<text class="pn-pilet${on ? ' on' : ''}${gat && on ? ' err' : ''}" x="${x}" y="384" text-anchor="${anchor}">${k.slice(1)}: ${esc(E[k])}</text>`;
    s += lab(30, 'start', 'A14', pil.A14, gA) + lab(292, 'end', 'A12', pil.A12, gA) + lab(320, 'start', 'B14', pil.B14, gB) + lab(600, 'end', 'B12', pil.B12, gB);
    const txipak = [['hasi', s0.hasi], ['a0', s0.a0], ['a1', s0.a1], ['b0', s0.b0], ['b1', s0.b1], ...(modua === 'kaskada' ? [['G1', M === 1], ['G2', M === 0]] : [])];
    s += txipak.map(([k, on], i) => `<g class="pn-txip${on ? ' on' : ''}"><rect x="${30 + i * 76}" y="402" width="66" height="26" rx="4"/><text x="${63 + i * 76}" y="420" text-anchor="middle">${k}</text></g>`).join('');

    // fase-diagrama
    t += dt;
    laginT += dt;
    if (laginT >= 0.05) { laginT = 0; laginak.push([t, xA, xB]); while (laginak.length && laginak[0][0] < t - LEIHOA) laginak.shift(); }
    const X = tt => 60 + (tt - (t - LEIHOA)) / LEIHOA * 560;
    const trazua = (i, y0) => `<polyline class="pz-trazua" points="${laginak.map(l => `${X(l[0]).toFixed(1)},${(y0 - l[i] * 34).toFixed(1)}`).join(' ')}"/>`;
    const fase = `<g class="pn">
      <text class="pn-lab" x="60" y="18" text-anchor="start">Espazio-fase diagrama (azken ${LEIHOA} s)</text>
      ${[[1, 'A', 72], [2, 'B', 132]].map(([i, iz, y0]) => `<text class="pn-izena sm" x="40" y="${y0 - 10}" text-anchor="end">${iz}</text>
        <text class="pn-port" x="54" y="${y0 - 30}" text-anchor="end">1</text><text class="pn-port" x="54" y="${y0 + 4}" text-anchor="end">0</text>
        <line class="pz-ax" x1="60" y1="${y0}" x2="620" y2="${y0}"/><line class="pz-ax dim" x1="60" y1="${y0 - 34}" x2="620" y2="${y0 - 34}"/>${trazua(i, y0)}`).join('')}
    </g>`;

    const gat = gA || gB;
    const geldi = gat && !(xA > 0 && xA < 1) && !(xB > 0 && xB < 1);
    const mezua = geldi ? [`Seinale-gatazka ${gA ? 'A' : 'B'} balbulan: 14 eta 12 pilotuek presioa dute aldi berean. Sekuentzia blokeatuta dago.`, 'err']
      : (xA === 0 && xB === 0 && !s0.hasi) ? ['Hasierako posizioan. Sakatu «Hasi».', ''] : ['', ''];
    const read = `<div><span>A balbula · B balbula</span><b>${vA ? 'A+' : 'A−'} · ${vB ? 'B+' : 'B−'}</b></div>
      ${modua === 'kaskada' ? `<div class="hi"><span>Talde aktiboa (memoria)</span><b>${M === 1 ? 'G1: A+ B+' : 'G2: B− A−'}</b></div>` : ''}
      <div><span>Detektagailuak a0 a1 b0 b1</span><b>${[s0.a0, s0.a1, s0.b0, s0.b1].map(Number).join(' ')}</b></div>`;
    return { s, read, mezua, fase, h: 440 };
  }

  function frame(now) {
    if (hilda) return;
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    const R = MODUAK[modua].sek ? sekuentzia(dt) : bakarra(dt);
    const svgTxt = `<g class="pn">${R.s}</g>`;
    if (svgTxt !== azkenSvg) {
      const svg = $(`#${P}-svg`);
      svg.setAttribute('viewBox', `0 0 640 ${R.h}`);
      svg.innerHTML = svgTxt;
      azkenSvg = svgTxt;
    }
    if (R.fase) $(`#${P}-fase`).innerHTML = R.fase;
    const beste = R.read + '|' + R.mezua.join('|');
    if (beste !== azkenBeste) {
      azkenBeste = beste;
      $(`#${P}-read`).innerHTML = R.read;
      const m = $(`#${P}-msg`);
      m.className = 'rb-msg' + (R.mezua[1] ? ' ' + R.mezua[1] : '');
      m.textContent = R.mezua[0];
    }
    raf = requestAnimationFrame(frame);
  }

  ['s1', 's2'].forEach(k => $(`#${P}-${k}`).addEventListener('click', e => {
    const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
    if (k === 's1') S1 = on; else S2 = on;
    e.currentTarget.setAttribute('aria-pressed', String(on));
    e.currentTarget.classList.toggle('primary', on);
  }));
  $(`#${P}-hasi`).addEventListener('click', () => { hasiT = 0.4; });
  $(`#${P}-reset`).addEventListener('click', () => { berrezarri(); jarraitua = false; $(`#${P}-jar`).checked = false; });
  $(`#${P}-jar`).addEventListener('change', e => { jarraitua = e.target.checked; });
  $(`#${P}-sel`).addEventListener('change', e => ezarriModua(e.target.value));

  ezarriModua(modua);
  raf = requestAnimationFrame(frame);
  return () => { hilda = true; cancelAnimationFrame(raf); };
}
