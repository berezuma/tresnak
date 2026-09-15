// Kontsola: blokeekin programatu eta emaitza testuz ikusi. Aldagaiak kutxa gisa agertzen dira,
// eta balioa aldatzen zaienean distira egiten dute. Urratsez urrats exekuta daiteke.
// Aukerak: adibideak [id], adibidea, gorde (gakoa), libre (programa hutsa ere bai)
import { esc, slider, irakurri, gorde } from '../util.js';
import { Exekutatzailea, zenbakia, fmtBalioa } from '../blokeak/exekutatzailea.js';
import * as E from '../blokeak/eraiki.js';
import { sortuKodea, margotu } from '../blokeak/kodea.js';

const L = (...a) => a.reduce((x, y) => E.lotu(x, y));
const V = E.aldagaia, T = E.testua;

export const ADIBIDEAK = {
  hutsa: { izena: 'Programa hutsa', azalpena: 'Hasi hutsetik. Aldagai bat sortzeko, ireki «Aldagaiak» kategoria eta sakatu «Sortu aldagaia…».',
    programa: () => E.programa([E.hasieran([])]) },
  agurra: { izena: 'Agurra', azalpena: '«izena» aldagaiak testu bat gordetzen du, eta «lotu» blokeak bi testu elkartzen ditu. Aldatu izena eta exekutatu berriro.',
    programa: () => E.programa([E.hasieran([E.ezarri('izena', T('Ane')), E.idatzi(L(T('Kaixo, '), V('izena'), T('!'))), E.idatzi(T('Ongi etorri programaziora.'))])], ['izena']) },
  kontagailua: { izena: 'Kontagailua', azalpena: 'Aldagai bat zero balioarekin hasten da, eta errepikapen bakoitzean bat gehitzen zaio. Horrela zenbatzen dute programek.',
    programa: () => E.programa([E.hasieran([E.ezarri('k', 0), E.errepikatu(5, [E.aldatu('k', 1), E.idatzi(V('k'))]), E.idatzi(T('Amaiera'))])], ['k']) },
  batura: { izena: '1etik 10era batu', azalpena: 'Metagailu bat: «batura» aldagaiak itzuli bakoitzeko «i» gehitzen du. Fluxu-diagramen ataleko algoritmo bera da, blokeekin.',
    programa: () => E.programa([E.hasieran([E.ezarri('batura', 0), E.ezarri('i', 1),
      E.bitartean(E.konparatu(V('i'), 'LTE', 10), [E.aldatu('batura', V('i')), E.aldatu('i', 1)]),
      E.idatzi(L(T('1etik 10era batuta: '), V('batura')))])], ['batura', 'i']) },
  taula: { izena: 'Biderketa-taula', azalpena: 'Eragile bat (×) eta errepikapen bat taula oso bat idazteko. Aldatu «n»-ren balioa beste taula bat lortzeko.',
    programa: () => E.programa([E.hasieran([E.ezarri('n', 7), E.ezarri('i', 1),
      E.errepikatu(10, [E.idatzi(L(V('n'), T(' × '), V('i'), T(' = '), E.eragiketa(V('n'), 'BIDER', V('i')))), E.aldatu('i', 1)])])], ['n', 'i']) },
  bikoitiak: { izena: 'Bikoitiak eta bakoitiak', azalpena: '«mod» eragileak zatiketaren hondarra ematen du: i mod 2 = 0 bada, zenbakia bikoitia da.',
    programa: () => E.programa([E.hasieran([E.ezarri('i', 1),
      E.errepikatu(8, [E.baldinBestela(E.konparatu(E.eragiketa(V('i'), 'HONDARRA', 2), 'EQ', 0), [E.idatzi(L(V('i'), T(' bikoitia da')))], [E.idatzi(L(V('i'), T(' bakoitia da')))]), E.aldatu('i', 1)])])], ['i']) },
  notak: { izena: 'Batez bestekoa', azalpena: 'Hiru notaren batez bestekoa kalkulatu eta erabaki bat hartu. Parentesiak blokeen barruan daude: barrukoa lehenik kalkulatzen da.',
    programa: () => E.programa([E.hasieran([E.ezarri('nota1', 6), E.ezarri('nota2', 4.5), E.ezarri('nota3', 8),
      E.ezarri('batezbestekoa', E.eragiketa(E.eragiketa(E.eragiketa(V('nota1'), 'GEHI', V('nota2')), 'GEHI', V('nota3')), 'ZATI', 3)),
      E.idatzi(L(T('Batez bestekoa: '), V('batezbestekoa'))),
      E.baldinBestela(E.konparatu(V('batezbestekoa'), 'GTE', 5), [E.idatzi(T('Gaindituta!'))], [E.idatzi(T('Ez gaindituta'))])])], ['nota1', 'nota2', 'nota3', 'batezbestekoa']) }
};

export function kontsolaBlokeak(k, ms = 300) {
  return {
    k_idatzi: { *agindua(x, b) { k.idatzi(fmtBalioa(x.balioa(b, 'BALIOA'))); yield { mota: 'itxaron', ms }; } },
    variables_set: { *agindua(x, b) { x.ezarri(b, x.balioa(b, 'VALUE')); yield { mota: 'itxaron', ms }; } },
    math_change: { *agindua(x, b) { x.ezarri(b, zenbakia(x.aldagaia(b)) + zenbakia(x.balioa(b, 'DELTA'))); yield { mota: 'itxaron', ms }; } }
  };
}

export default function mount(box, opts = {}) {
  const P = 'ks' + Math.random().toString(36).slice(2, 7);
  const ids = opts.adibideak || Object.keys(ADIBIDEAK).filter(k => k !== 'hutsa' || opts.libre);
  const GAKOA = opts.gorde || 'robotika:kontsola:v1';
  const egoera = { programak: {}, ...irakurri(GAKOA, {}) };
  let aid = ids.includes(opts.adibidea) ? opts.adibidea : ids.includes(egoera.azkena) ? egoera.azkena : ids[0];
  let ex = null, ed = null, raf = 0, last = 0, hilda = false, gordeT = 0, lerroak = [];

  box.innerHTML = `
    <div class="sim rb ks">
      <div class="rb-head">
        <label for="${P}-adib">Adibidea</label>
        <select id="${P}-adib">${ids.map(k => `<option value="${k}" ${k === aid ? 'selected' : ''}>${esc(ADIBIDEAK[k].izena)}</option>`).join('')}</select>
        <button class="btn sm ghost" id="${P}-orig" title="Adibidearen jatorrizko programa berriro kargatu">Jatorrizkoa</button>
      </div>
      <div class="rb-body">
        <div class="rb-kodea">
          <div class="rb-brief"><p class="rb-azal" id="${P}-desk"></p></div>
          <div class="rb-editorea" id="${P}-ed"><div class="rb-kargatzen">Blokeak kargatzen…</div></div>
        </div>
        <div class="rb-mundua">
          <div class="rb-ctl">
            <div class="pills">
              <button class="btn sm primary" id="${P}-run">▶ Exekutatu</button>
              <button class="btn sm" id="${P}-step" title="Bloke bat exekutatu eta gelditu">Urratsa</button>
              <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
            </div>
            <div id="${P}-speed"></div>
            <div><h4 class="fd-h">Aldagaiak (memoria)</h4><div class="ks-kutxak" id="${P}-vars" aria-live="polite"></div></div>
            <div><h4 class="fd-h">Kontsola</h4><pre class="ks-out" id="${P}-out" aria-live="polite"></pre></div>
            <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
          </div>
        </div>
      </div>
      ${opts.kodea ? `<div class="kd-panela">
        <div class="kd-head"><span class="rb-head-l">Blokeak testu-kode gisa</span>
          <div class="seg" role="group" aria-label="Lengoaia"><button data-h="python" class="active" aria-pressed="true">Python</button><button data-h="cpp" aria-pressed="false">C++ (Arduino)</button></div>
        </div>
        <pre class="kd-kodea"><code id="${P}-kodea"></code></pre>
      </div>` : ''}
    </div>`;

  const $ = s => box.querySelector(s);
  const sAbiadura = slider($(`#${P}-speed`), { id: P + '-sp', label: 'Abiadura', min: 1, max: 5, step: 1, value: 3, format: v => ['oso motela', 'motela', 'ertaina', 'azkarra', 'berehala'][v - 1] });
  const ABIADURAK = [0.4, 0.8, 1.6, 4, 1e6];

  function mezua(t, mota = '') {
    const el = $(`#${P}-msg`);
    el.className = 'rb-msg' + (mota ? ' ' + mota : '');
    el.textContent = t;
  }
  const kontsola = {
    idatzi(t) {
      lerroak.push(t);
      if (lerroak.length > 500) lerroak.shift();
      const o = $(`#${P}-out`);
      o.textContent = lerroak.join('\n');
      o.scrollTop = o.scrollHeight;
    }
  };
  function kutxak(aldatua = null) {
    const zerr = ex ? ex.aldagaiZerrenda() : (ed?.json().variables || []).map(v => [v.name, undefined]);
    $(`#${P}-vars`).innerHTML = zerr.map(([k, v]) => `<div class="ks-kutxa${k === aldatua ? ' aldatu' : ''}"><span>${esc(k)}</span><b>${v === undefined ? '—' : esc(typeof v === 'string' ? '“' + v + '”' : fmtBalioa(v))}</b></div>`).join('');
  }
  function brief() { $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena; }
  // Aukerazkoa (opts.kodea): blokeen programa Python eta C++ lengoaietan
  let hizk = 'python';
  function kodea() {
    if (!opts.kodea || !ed) return;
    $(`#${P}-kodea`).innerHTML = margotu(sortuKodea(ed.json(), hizk), hizk);
  }
  box.querySelectorAll('[data-h]').forEach(bt => bt.addEventListener('click', () => {
    hizk = bt.dataset.h;
    box.querySelectorAll('[data-h]').forEach(x => { x.classList.toggle('active', x === bt); x.setAttribute('aria-pressed', String(x === bt)); });
    kodea();
  }));

  function prestatu(pausaka) {
    const json = ed?.json();
    if (!json) return;
    gelditu();
    lerroak = [];
    $(`#${P}-out`).textContent = '';
    ed.errorea(null);
    ex = new Exekutatzailea({ blokeak: kontsolaBlokeak(kontsola), muga: 20000, mugaMezua: 'Programak ez du amaierarik: begizta baten baldintza ez al da inoiz betetzen?' });
    ex.on('blokea', id => ed?.nabarmendu(id));
    ex.on('aldagaia', izena => kutxak(izena));
    ex.on('errorea', e => { mezua(e.message, 'err'); ed?.errorea(e.id); botoiak(); });
    ex.on('egoera', eg => {
      if (eg === 'amaituta') { ed?.nabarmendu(null); mezua('Programa amaitu da.', 'ok'); }
      botoiak();
    });
    ex.kargatu(json);
    if (!ex.goikoak.some(b => b.type === 'ekitaldia_hasi' && b.inputs?.DO?.block)) {
      mezua('Jarri blokeak «hasieran» blokearen barruan.', 'err');
      ex = null;
      return;
    }
    mezua(pausaka ? 'Urratsez urrats: sakatu «Urratsa» hurrengo blokerako.' : '');
    ex.hasi({ pausaka });
    kutxak();
    ex.aurreratu(0);
    begizta();
    botoiak();
  }
  function begizta() {
    cancelAnimationFrame(raf);
    last = performance.now();
    const frame = now => {
      if (hilda) return;
      const dt = Math.min(now - last, 100);
      last = now;
      if (ex && ex.egoera === 'martxan') ex.aurreratu(dt * ABIADURAK[sAbiadura.value - 1]);
      raf = ex && ex.egoera === 'martxan' ? requestAnimationFrame(frame) : 0;
    };
    raf = requestAnimationFrame(frame);
  }
  function gelditu() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (ex && ex.egoera === 'martxan') ex.gelditu();
    ed?.nabarmendu(null);
  }
  function botoiak() {
    const martxan = ex && ex.egoera === 'martxan';
    const run = $(`#${P}-run`);
    run.textContent = martxan && !ex.pausaka ? '■ Gelditu' : martxan ? '▶ Jarraitu' : '▶ Exekutatu';
    run.classList.toggle('primary', !(martxan && !ex.pausaka));
  }

  $(`#${P}-run`).addEventListener('click', () => {
    if (ex && ex.egoera === 'martxan') {
      if (ex.pausaka) { ex.jarraitu(); mezua(''); } else { gelditu(); mezua('Geldituta.'); }
      botoiak();
      return;
    }
    prestatu(false);
  });
  $(`#${P}-step`).addEventListener('click', () => {
    if (ex && ex.egoera === 'martxan') {
      if (ex.pausaka) ex.urratsa(); else { ex.pausatu(); mezua('Urratsez urrats: sakatu «Urratsa» hurrengo blokerako.'); }
      botoiak();
      return;
    }
    prestatu(true);
  });
  $(`#${P}-reset`).addEventListener('click', () => {
    gelditu();
    ex = null;
    lerroak = [];
    $(`#${P}-out`).textContent = '';
    ed?.errorea(null);
    kutxak();
    mezua('');
    botoiak();
  });

  function gordeLaster() {
    clearTimeout(gordeT);
    gordeT = setTimeout(() => {
      if (hilda || !ed) return;
      egoera.programak[aid] = ed.json();
      egoera.azkena = aid;
      gorde(GAKOA, egoera);
      kodea();
      if (!ex || ex.egoera !== 'martxan') kutxak();
    }, 400);
  }
  $(`#${P}-adib`).addEventListener('change', e => {
    if (ed) egoera.programak[aid] = ed.json();
    gelditu();
    ex = null;
    aid = e.target.value;
    egoera.azkena = aid;
    gorde(GAKOA, egoera);
    brief();
    ed?.kargatu(egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa());
    kodea();
    lerroak = [];
    $(`#${P}-out`).textContent = '';
    kutxak();
    mezua('');
    botoiak();
  });
  $(`#${P}-orig`).addEventListener('click', () => {
    gelditu();
    ex = null;
    delete egoera.programak[aid];
    gorde(GAKOA, egoera);
    ed?.kargatu(ADIBIDEAK[aid].programa());
    kodea();
    kutxak();
    mezua('Jatorrizko programa kargatuta.');
    botoiak();
  });

  brief();
  import('../blokeak/editorea.js').then(({ sortuEditorea }) => sortuEditorea($(`#${P}-ed`), {
    tresnak: 'kontsola',
    json: egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa(),
    onAldaketa: () => { if (ex && ex.egoera === 'martxan') { gelditu(); botoiak(); } gordeLaster(); }
  })).then(editorea => {
    if (hilda) { editorea.dispose(); return; }
    ed = editorea;
    kutxak();
    kodea();
  }).catch(err => {
    console.error(err);
    $(`#${P}-ed`).innerHTML = '<div class="notice err">Bloke-editorea ezin izan da kargatu. Freskatu orria.</div>';
  });

  return () => {
    hilda = true;
    gelditu();
    clearTimeout(gordeT);
    if (ed) { egoera.programak[aid] = ed.json(); gorde(GAKOA, egoera); ed.dispose(); }
  };
}
