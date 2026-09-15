// Fluxu-diagramak: algoritmo bat urratsez urrats exekutatu. Exekutatutako pieza nabarmentzen da,
// erabakietan baldintza balioekin idazten da, eta aldagaiak eta irteera ikusten dira.
// Aukerak: diagrama (hasierakoa), diagramak [id], maila
import { fmt, esc, slider } from '../util.js';

const NW = 190, NH = 46, DW = 200, DH = 70;
const ausaz = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

// Lerroak: [nondik, nora, irteera-portua='b', sarrera-portua='t', etiketa?, tarteko puntuak?]
// Portuak: t goian · b behean · l ezkerrean · r eskuinean
export const DIAGRAMAK = {
  goiza: {
    izena: 'Eskolara joan aurretik', maila: 1, w: 600, h: 470,
    azalpena: 'Sekuentzia bat eta erabaki bat: urratsak ordenan egiten dira, eta euria ari badu bide bati jarraitzen zaio.',
    nodoak: [
      { id: 'h', mota: 'hasi', testua: 'Hasi', x: 240, y: 30, next: 'e1' },
      { id: 'e1', mota: 'ekintza', testua: 'Esnatu eta jantzi', x: 240, y: 105, next: 'e2' },
      { id: 'e2', mota: 'ekintza', testua: 'Gosaldu', x: 240, y: 180, next: 'd' },
      { id: 'd', mota: 'erabakia', testua: 'Euria ari du?', x: 240, y: 270, galdera: true, bai: 'e3', ez: 'e4' },
      { id: 'e3', mota: 'ekintza', testua: 'Hartu aterkia', x: 470, y: 270, next: 'e4' },
      { id: 'e4', mota: 'ekintza', testua: 'Irten etxetik', x: 240, y: 365, next: 'a' },
      { id: 'a', mota: 'amaiera', testua: 'Amaiera', x: 240, y: 440 }
    ],
    lerroak: [['h', 'e1'], ['e1', 'e2'], ['e2', 'd'], ['d', 'e3', 'r', 'l', 'Bai'], ['d', 'e4', 'b', 't', 'Ez'], ['e3', 'e4', 'b', 'r', null, [[470, 365]]], ['e4', 'a']]
  },
  handiena: {
    izena: 'Bi zenbakitatik handiena', maila: 1, w: 500, h: 500,
    azalpena: 'Bi datu irakurri, konparatu eta handiena idatzi. Probatu A eta B berdinak direnean ere.',
    nodoak: [
      { id: 'h', mota: 'hasi', testua: 'Hasi', x: 250, y: 30, next: 'ra' },
      { id: 'ra', mota: 'sarrera', testua: 'Irakurri A', x: 250, y: 105, aldagaia: 'A', min: -999, max: 999, next: 'rb' },
      { id: 'rb', mota: 'sarrera', testua: 'Irakurri B', x: 250, y: 180, aldagaia: 'B', min: -999, max: 999, next: 'd' },
      { id: 'd', mota: 'erabakia', testua: 'A > B ?', x: 250, y: 275, baldintza: v => v.A > v.B, bai: 'oa', ez: 'ob' },
      { id: 'oa', mota: 'irteera', testua: 'Idatzi A', x: 110, y: 375, idatzi: v => v.A, next: 'a' },
      { id: 'ob', mota: 'irteera', testua: 'Idatzi B', x: 390, y: 375, idatzi: v => v.B, next: 'a' },
      { id: 'a', mota: 'amaiera', testua: 'Amaiera', x: 250, y: 465 }
    ],
    lerroak: [['h', 'ra'], ['ra', 'rb'], ['rb', 'd'], ['d', 'oa', 'l', 't', 'Bai', [[110, 275]]], ['d', 'ob', 'r', 't', 'Ez', [[390, 275]]], ['oa', 'a', 'b', 'l', null, [[110, 465]]], ['ob', 'a', 'b', 'r', null, [[390, 465]]]]
  },
  batura: {
    izena: '1etik N-ra batu', maila: 1, w: 600, h: 570,
    azalpena: 'Begizta bat: erabakiak fluxua atzera bidaltzen du, i N baino handiagoa izan arte. Aldagaiek balioa aldatzen dute itzuli bakoitzean.',
    nodoak: [
      { id: 'h', mota: 'hasi', testua: 'Hasi', x: 240, y: 30, next: 'r' },
      { id: 'r', mota: 'sarrera', testua: 'Irakurri N', x: 240, y: 105, aldagaia: 'N', min: 1, max: 30, iradokizuna: 5, next: 'i1' },
      { id: 'i1', mota: 'ekintza', testua: 'batura ← 0', x: 240, y: 180, exec: v => { v.batura = 0; }, next: 'i2' },
      { id: 'i2', mota: 'ekintza', testua: 'i ← 1', x: 240, y: 255, exec: v => { v.i = 1; }, next: 'd' },
      { id: 'd', mota: 'erabakia', testua: 'i ≤ N ?', x: 240, y: 350, baldintza: v => v.i <= v.N, bai: 's1', ez: 'o' },
      { id: 's1', mota: 'ekintza', testua: 'batura ← batura + i', x: 240, y: 450, exec: v => { v.batura += v.i; }, next: 's2' },
      { id: 's2', mota: 'ekintza', testua: 'i ← i + 1', x: 240, y: 525, exec: v => { v.i += 1; }, next: 'd' },
      { id: 'o', mota: 'irteera', testua: 'Idatzi batura', x: 475, y: 350, w: 180, idatzi: v => v.batura, next: 'a' },
      { id: 'a', mota: 'amaiera', testua: 'Amaiera', x: 475, y: 440, w: 180 }
    ],
    lerroak: [['h', 'r'], ['r', 'i1'], ['i1', 'i2'], ['i2', 'd'], ['d', 's1', 'b', 't', 'Bai'], ['s1', 's2'], ['s2', 'd', 'l', 'l', null, [[50, 525], [50, 350]]], ['d', 'o', 'r', 'l', 'Ez'], ['o', 'a']]
  },
  asmatu: {
    izena: 'Asmatu zenbakia', maila: 2, w: 640, h: 720, ezkutuak: ['sekretua'],
    azalpena: 'Ordenagailuak zenbaki bat pentsatzen du eta pistak ematen ditu. Estrategia onena erdiko zenbakia esatea da: 100 zenbakitatik, gehienez 7 saiakera.',
    nodoak: [
      { id: 'h', mota: 'hasi', testua: 'Hasi', x: 250, y: 30, next: 's' },
      { id: 's', mota: 'ekintza', testua: 'sekretua ← ausazkoa(1, 100)', x: 250, y: 105, w: 260, exec: v => { v.sekretua = ausaz(1, 100); }, next: 'k' },
      { id: 'k', mota: 'ekintza', testua: 'saiakerak ← 0', x: 250, y: 180, exec: v => { v.saiakerak = 0; }, next: 'r' },
      { id: 'r', mota: 'sarrera', testua: 'Irakurri zenbakia', x: 250, y: 255, aldagaia: 'zenbakia', min: 1, max: 100, iradokizuna: 50, next: 'k2' },
      { id: 'k2', mota: 'ekintza', testua: 'saiakerak ← saiakerak + 1', x: 250, y: 330, w: 250, exec: v => { v.saiakerak += 1; }, next: 'd1' },
      { id: 'd1', mota: 'erabakia', testua: 'zenbakia = sekretua ?', x: 250, y: 430, w: 230, baldintza: v => v.zenbakia === v.sekretua, bai: 'o1', ez: 'd2' },
      { id: 'o1', mota: 'irteera', testua: 'Idatzi "Asmatu duzu!"', x: 520, y: 430, w: 210, idatzi: v => `Asmatu duzu! ${v.saiakerak} saiakera`, next: 'a' },
      { id: 'a', mota: 'amaiera', testua: 'Amaiera', x: 520, y: 520, w: 170 },
      { id: 'd2', mota: 'erabakia', testua: 'zenbakia < sekretua ?', x: 250, y: 550, w: 230, baldintza: v => v.zenbakia < v.sekretua, bai: 'o2', ez: 'o3' },
      { id: 'o2', mota: 'irteera', testua: 'Idatzi "Handiagoa da"', x: 250, y: 655, w: 210, idatzi: () => 'Handiagoa da', next: 'r' },
      { id: 'o3', mota: 'irteera', testua: 'Idatzi "Txikiagoa da"', x: 520, y: 655, w: 210, idatzi: () => 'Txikiagoa da', next: 'r' }
    ],
    lerroak: [['h', 's'], ['s', 'k'], ['k', 'r'], ['r', 'k2'], ['k2', 'd1'], ['d1', 'o1', 'r', 'l', 'Bai'], ['o1', 'a'], ['d1', 'd2', 'b', 't', 'Ez'],
      ['d2', 'o2', 'b', 't', 'Bai'], ['d2', 'o3', 'r', 't', 'Ez', [[520, 550]]],
      ['o2', 'r', 'l', 'l', null, [[34, 655], [34, 255]]], ['o3', 'r', 'b', 'l', null, [[520, 700], [34, 700], [34, 255]]]]
  },
  zkh: {
    izena: 'Zatitzaile komunetako handiena (Euklides)', maila: 3, w: 600, h: 560,
    azalpena: 'Euklidesen algoritmoa (K.a. 300): historiako algoritmo zaharrenetako bat. Zatiketaren hondarra (mod) zero izan arte errepikatzen da.',
    nodoak: [
      { id: 'h', mota: 'hasi', testua: 'Hasi', x: 240, y: 30, next: 'ra' },
      { id: 'ra', mota: 'sarrera', testua: 'Irakurri a', x: 240, y: 105, aldagaia: 'a', min: 1, max: 9999, iradokizuna: 84, next: 'rb' },
      { id: 'rb', mota: 'sarrera', testua: 'Irakurri b', x: 240, y: 180, aldagaia: 'b', min: 1, max: 9999, iradokizuna: 36, next: 'd' },
      { id: 'd', mota: 'erabakia', testua: 'b ≠ 0 ?', x: 240, y: 275, baldintza: v => v.b !== 0, bai: 's1', ez: 'o' },
      { id: 's1', mota: 'ekintza', testua: 'h ← a mod b', x: 240, y: 370, exec: v => { v.h = v.a % v.b; }, next: 's2' },
      { id: 's2', mota: 'ekintza', testua: 'a ← b', x: 240, y: 445, exec: v => { v.a = v.b; }, next: 's3' },
      { id: 's3', mota: 'ekintza', testua: 'b ← h', x: 240, y: 520, exec: v => { v.b = v.h; }, next: 'd' },
      { id: 'o', mota: 'irteera', testua: 'Idatzi a', x: 470, y: 275, w: 170, idatzi: v => v.a, next: 'a' },
      { id: 'a', mota: 'amaiera', testua: 'Amaiera', x: 470, y: 370, w: 170 }
    ],
    lerroak: [['h', 'ra'], ['ra', 'rb'], ['rb', 'd'], ['d', 's1', 'b', 't', 'Bai'], ['s1', 's2'], ['s2', 's3'], ['s3', 'd', 'l', 'l', null, [[50, 520], [50, 275]]], ['d', 'o', 'r', 'l', 'Ez'], ['o', 'a']]
  }
};

function neurriak(n) {
  return { w: n.w || (n.mota === 'erabakia' ? DW : NW), h: n.mota === 'erabakia' ? DH : NH };
}
function portua(n, p) {
  const { w, h } = neurriak(n);
  const sk = n.mota === 'sarrera' || n.mota === 'irteera' ? 7 : 0;
  if (p === 't') return [n.x, n.y - h / 2];
  if (p === 'b') return [n.x, n.y + h / 2];
  if (p === 'l') return [n.x - w / 2 + sk, n.y];
  return [n.x + w / 2 - sk, n.y];
}
function forma(n, cls, estiloa = '') {
  const { w, h } = neurriak(n), x0 = n.x - w / 2, y0 = n.y - h / 2;
  const st = estiloa ? ` style="${estiloa}"` : '';
  switch (n.mota) {
    case 'hasi': case 'amaiera': return `<rect class="${cls}"${st} x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${h / 2}"/>`;
    case 'erabakia': return `<path class="${cls}"${st} d="M${n.x} ${y0} L${x0 + w} ${n.y} L${n.x} ${y0 + h} L${x0} ${n.y} Z"/>`;
    case 'sarrera': case 'irteera': return `<path class="${cls}"${st} d="M${x0 + 14} ${y0} H${x0 + w} L${x0 + w - 14} ${y0 + h} H${x0} Z"/>`;
    default: return `<rect class="${cls}"${st} x="${x0}" y="${y0}" width="${w}" height="${h}"/>`;
  }
}
const fmtBal = v => typeof v === 'number' ? fmt(v, 3) : String(v);

function legenda() {
  const item = (mota, testua) => {
    const n = { mota, x: 18, y: 10, w: 32 };
    const s = mota === 'erabakia' ? `<path class="fd-n fd-erabakia" style="stroke-width:1.5" d="M18 1 L34 10 L18 19 L2 10 Z"/>`
      : mota === 'sarrera' ? `<path class="fd-n fd-sarrera" style="stroke-width:1.5" d="M8 3 H34 L28 17 H2 Z"/>`
      : mota === 'hasi' ? `<rect class="fd-n fd-hasi" style="stroke-width:1.5" x="2" y="3" width="32" height="14" rx="7"/>`
      : `<rect class="fd-n" style="stroke-width:1.5" x="2" y="3" width="32" height="14"/>`;
    void n;
    return `<span><svg viewBox="0 0 36 20" aria-hidden="true">${s}</svg>${testua}</span>`;
  };
  return item('hasi', 'Hasiera / amaiera') + item('ekintza', 'Prozesua (ekintza)') + item('sarrera', 'Sarrera / irteera (datuak)') + item('erabakia', 'Erabakia (bai / ez)');
}

export default function mount(box, opts = {}) {
  const maila = opts.maila || 1;
  const P = 'fd' + Math.random().toString(36).slice(2, 7);
  const ids = (opts.diagramak || Object.keys(DIAGRAMAK)).filter(k => DIAGRAMAK[k] && (opts.diagramak || DIAGRAMAK[k].maila <= maila));
  let id = ids.includes(opts.diagrama) ? opts.diagrama : ids[0];
  let D, byId, cur, azkena, azkenLerroa, vars, berriak, out, steps, zain, done, martxan = false, timer = 0, info = '', erakutsiEzkutuak = false;

  box.innerHTML = `
    <div class="sim fd">
      <div class="sim-body">
        <div class="sim-stage"><svg id="${P}-svg" role="img" aria-label="Fluxu-diagrama"></svg></div>
        <div class="sim-panel">
          <label class="fd-hautatu" for="${P}-sel">Algoritmoa
            <select id="${P}-sel">${ids.map(k => `<option value="${k}" ${k === id ? 'selected' : ''}>${esc(DIAGRAMAK[k].izena)}</option>`).join('')}</select>
          </label>
          <p class="lab-hint" id="${P}-desk"></p>
          <div class="pills">
            <button class="btn sm primary" id="${P}-step">Urratsa</button>
            <button class="btn sm" id="${P}-run">▶ Exekutatu</button>
            <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
          </div>
          <div id="${P}-ctl"></div>
          <div class="fd-galdera" id="${P}-in" hidden></div>
          <div class="readouts" aria-live="polite">
            <div><span>Urratsak</span><b id="${P}-n">0</b></div>
            <div class="fd-info" id="${P}-info"></div>
          </div>
          <div>
            <h4 class="fd-h">Aldagaiak</h4>
            <table class="fd-vars"><tbody id="${P}-vars"></tbody></table>
            <label class="check" id="${P}-ezk-l" hidden style="margin-top:6px"><input type="checkbox" id="${P}-ezk"> Erakutsi ezkutuko aldagaiak</label>
          </div>
          <div><h4 class="fd-h">Irteera</h4><pre class="fd-out" id="${P}-out"></pre></div>
        </div>
      </div>
      <div class="fd-legend">${legenda()}</div>
    </div>`;

  const $ = s => box.querySelector(s);
  const svg = $(`#${P}-svg`);
  const sAbiadura = slider($(`#${P}-ctl`), { id: P + '-sp', label: 'Abiadura', min: 1, max: 5, step: 1, value: 3, format: v => ['oso motela', 'motela', 'ertaina', 'azkarra', 'oso azkarra'][v - 1] });
  const atzerapena = () => [1500, 1000, 650, 350, 120][sAbiadura.value - 1];

  function hautatu(k) {
    gelditu();
    id = k;
    D = DIAGRAMAK[k];
    byId = Object.fromEntries(D.nodoak.map(n => [n.id, n]));
    $(`#${P}-desk`).textContent = D.azalpena;
    $(`#${P}-ezk-l`).hidden = !D.ezkutuak;
    berrezarri();
  }
  function berrezarri() {
    gelditu();
    cur = D.nodoak[0].id;
    azkena = azkenLerroa = zain = null;
    vars = {};
    berriak = new Set();
    out = [];
    steps = 0;
    done = false;
    info = 'Sakatu <b>Urratsa</b> algoritmoa pieza batez aurrera eramateko.';
    marraztu();
  }

  const ezkutua = k => D.ezkutuak?.includes(k) && !erakutsiEzkutuak;
  const ordezkatu = t => esc(t).replace(/[A-Za-zñÑ_]+/g, w => (w in vars) && !ezkutua(w) ? fmtBal(vars[w]) : w);

  function urratsa() {
    if (done || zain) return;
    if (steps >= 2000) { info = 'Urrats gehiegi: algoritmoa ez al da amaitzen?'; gelditu(); marraztu(); return; }
    const n = byId[cur];
    azkena = n.id;
    steps++;
    berriak = new Set();
    let next = null;
    switch (n.mota) {
      case 'hasi':
        info = 'Algoritmoa hasi da.';
        next = n.next;
        break;
      case 'ekintza': {
        const aurretik = { ...vars };
        n.exec?.(vars);
        Object.keys(vars).forEach(k => { if (vars[k] !== aurretik[k]) berriak.add(k); });
        const aldatua = [...berriak][0];
        info = `<b>${esc(n.testua)}</b>` + (aldatua ? ` → ${esc(aldatua)} = <b>${ezkutua(aldatua) ? '?' : fmtBal(vars[aldatua])}</b>` : '');
        next = n.next;
        break;
      }
      case 'sarrera':
        zain = n;
        info = `Datu bat behar da: idatzi <b>${esc(n.aldagaia)}</b>-ren balioa.`;
        marraztu();
        return;
      case 'irteera': {
        const s = fmtBal(n.idatzi(vars));
        out.push(s);
        info = `Idatzi: <b>${esc(s)}</b>`;
        next = n.next;
        break;
      }
      case 'erabakia':
        if (n.galdera) {
          zain = n;
          info = `Erabakia: <b>${esc(n.testua)}</b>`;
          marraztu();
          return;
        } else {
          const r = n.baldintza(vars);
          info = `${ordezkatu(n.testua)} → <b>${r ? 'Bai' : 'Ez'}</b>`;
          next = r ? n.bai : n.ez;
        }
        break;
      case 'amaiera':
        info = 'Algoritmoa amaitu da.';
        done = true;
        break;
    }
    azkenLerroa = next ? [n.id, next] : null;
    if (next) cur = next;
    marraztu();
  }

  function erantzun(balioa) {
    const n = zain;
    if (!n) return;
    zain = null;
    berriak = new Set();
    if (n.mota === 'sarrera') {
      vars[n.aldagaia] = balioa;
      berriak.add(n.aldagaia);
      info = `Irakurri: <b>${esc(n.aldagaia)} = ${fmtBal(balioa)}</b>`;
      cur = n.next;
    } else {
      info = `${esc(n.testua)} → <b>${balioa ? 'Bai' : 'Ez'}</b>`;
      cur = balioa ? n.bai : n.ez;
    }
    azkenLerroa = [n.id, cur];
    marraztu();
    if (martxan) timer = setTimeout(tick, atzerapena());
  }

  function tick() {
    if (!martxan) return;
    urratsa();
    if (done) { martxan = false; botoiak(); return; }
    if (!zain) timer = setTimeout(tick, atzerapena());
  }
  function gelditu() {
    martxan = false;
    clearTimeout(timer);
    botoiak();
  }
  function botoiak() {
    const run = $(`#${P}-run`), step = $(`#${P}-step`);
    run.textContent = martxan ? '⏸ Pausatu' : '▶ Exekutatu';
    run.disabled = !!done;
    step.disabled = !!done || !!zain || martxan;
  }

  function marraztu() {
    svg.setAttribute('viewBox', `0 0 ${D.w} ${D.h}`);
    let s = `<defs>${['', 'on'].map(k => `<marker id="${P}-m${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" class="fd-gezia ${k}"/></marker>`).join('')}</defs>`;
    let lerroOn = '';
    for (const [a, b, pa = 'b', pb = 't', label, via = []] of D.lerroak) {
      const on = azkenLerroa && azkenLerroa[0] === a && azkenLerroa[1] === b;
      const pts = [portua(byId[a], pa), ...via, portua(byId[b], pb)];
      const lerroa = `<polyline class="fd-l${on ? ' on' : ''}" points="${pts.map(p => p.join(',')).join(' ')}" marker-end="url(#${P}-m${on ? 'on' : ''})"/>`;
      if (on) lerroOn = lerroa; else s += lerroa;
      if (label) {
        const [x, y] = pts[0];
        const [dx, dy, anc] = pa === 'r' ? [8, -8, 'start'] : pa === 'l' ? [-8, -8, 'end'] : [9, 19, 'start'];
        s += `<text class="fd-lab" x="${x + dx}" y="${y + dy}" text-anchor="${anc}">${label}</text>`;
      }
    }
    s += lerroOn;
    for (const n of D.nodoak) {
      s += `<g>${forma(n, `fd-n fd-${n.mota}${n.id === azkena ? ' on' : ''}`)}<text class="fd-t" x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="central">${esc(n.testua)}</text></g>`;
    }
    svg.innerHTML = s;

    $(`#${P}-n`).textContent = steps;
    $(`#${P}-info`).innerHTML = info;
    const ks = Object.keys(vars);
    $(`#${P}-vars`).innerHTML = ks.length
      ? ks.map(k => `<tr class="${berriak.has(k) ? 'berria' : ''}"><th>${esc(k)}</th><td>${ezkutua(k) ? '?' : esc(fmtBal(vars[k]))}</td></tr>`).join('')
      : '<tr><td class="dim">Oraindik ez dago aldagairik.</td></tr>';
    const o = $(`#${P}-out`);
    o.textContent = out.join('\n');
    o.scrollTop = o.scrollHeight;

    const inp = $(`#${P}-in`);
    if (zain?.mota === 'sarrera') {
      const n = zain, def = n.iradokizuna ?? ausaz(Math.max(n.min, 1), Math.min(n.max, 20));
      inp.hidden = false;
      inp.innerHTML = `<label for="${P}-v">${esc(n.aldagaia)} =</label><input id="${P}-v" type="number" inputmode="numeric" min="${n.min}" max="${n.max}" step="1" value="${def}"><button class="btn sm primary" id="${P}-ok">Sartu</button><p class="fd-err" id="${P}-e" hidden></p>`;
      const input = inp.querySelector('input');
      const bidali = () => {
        const v = Number(String(input.value).replace(',', '.'));
        if (!Number.isInteger(v) || v < n.min || v > n.max) {
          const e = inp.querySelector(`#${P}-e`);
          e.hidden = false;
          e.textContent = `Idatzi zenbaki oso bat, ${n.min} eta ${n.max} artean.`;
          return;
        }
        erantzun(v);
      };
      inp.querySelector(`#${P}-ok`).addEventListener('click', bidali);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') bidali(); });
      input.focus({ preventScroll: true });
      input.select();
    } else if (zain?.mota === 'erabakia') {
      inp.hidden = false;
      inp.innerHTML = `<span>${esc(zain.testua)}</span><button class="btn sm" data-b="1">Bai</button><button class="btn sm" data-b="0">Ez</button>`;
      inp.querySelectorAll('[data-b]').forEach(bt => bt.addEventListener('click', () => erantzun(bt.dataset.b === '1')));
      inp.querySelector('[data-b]').focus({ preventScroll: true });
    } else {
      inp.hidden = true;
      inp.innerHTML = '';
    }
    botoiak();
  }

  $(`#${P}-sel`).addEventListener('change', e => hautatu(e.target.value));
  $(`#${P}-step`).addEventListener('click', urratsa);
  $(`#${P}-run`).addEventListener('click', () => {
    if (martxan) { gelditu(); return; }
    martxan = true;
    botoiak();
    if (!zain) tick();
  });
  $(`#${P}-reset`).addEventListener('click', berrezarri);
  $(`#${P}-ezk`).addEventListener('change', e => { erakutsiEzkutuak = e.target.checked; marraztu(); });

  hautatu(id);
  return () => gelditu();
}
