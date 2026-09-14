// Erronkak: laborategian baldintza batzuk betetzen dituen zirkuitua diseinatu. Egiaztatzeko, zirkuituaren
// kopiak ebazten dira egoera desberdinetan (etengailuak, zirkuitulaburrak, balio aldatuak).
import mount from '../sim/laborategia.js';
import { ebatzi, neurketa, distira } from '../zirkuitua.js';
import { progress, esc } from '../util.js';

const kopia = (cs, f) => cs.map(c => { const k = { ...c, fundituta: false }; return f ? f(k) : k; });
const mota = (cs, m) => cs.filter(c => c.mota === m);
const Iabs = (res, c) => Math.abs(res.I.get(c.id) || 0);
const garbia = res => res.ondo && !res.zirkuitulaburra;
const konbinazioak = n => Array.from({ length: 1 << n }, (_, k) => Array.from({ length: n }, (_, i) => !!((k >> i) & 1)));
const kargatzen = (p, res) => { const i = res.I.get(p.id) || 0; return p.alderantziz ? i > 1e-4 : i < -1e-4; };

export const ERRONKAK = [
  {
    id: 'argia', maila: 1, izena: 'Lehen argia', laburra: 'Bonbilla bat etengailuarekin',
    brief: 'Muntatu zirkuitu bat pila, bonbilla eta etengailu batekin. Etengailua ixtean bonbillak argia eman behar du, eta irekitzean itzali.',
    pista: 'Bide itxi bakarra behar da: pila → etengailua → bonbilla → pila. Aukeratu pilaren tentsiorako egokia den bonbilla (adibidez, 4,5 V · 0,9 W bonbilla 4,5 V-ko pilarekin).',
    check(cs) {
      const on = kopia(cs, c => { if (c.mota === 'etengailua') c.itxita = true; return c; }), rOn = ebatzi(on);
      const off = kopia(cs, c => { if (c.mota === 'etengailua') c.itxita = false; return c; }), rOff = ebatzi(off);
      const L = mota(on, 'bonbilla');
      return [
        ['Pila bat, bonbilla bat eta etengailu bat gutxienez', mota(cs, 'pila').length >= 1 && L.length >= 1 && mota(cs, 'etengailua').length >= 1],
        ['Etengailuak itxita: bonbillek argia ematen dute, fundituta egon gabe', L.length > 0 && garbia(rOn) && L.every(c => !c.fundituta && distira(c, rOn) >= 0.3)],
        ['Etengailuak irekita: bonbilla guztiak itzalita', L.length > 0 && rOff.ondo && mota(off, 'bonbilla').every(c => distira(c, rOff) < 0.05)]
      ];
    }
  },
  {
    id: 'bi-gela', maila: 1, izena: 'Bi gela, bi etengailu', laburra: 'Argi bakoitza bere etengailuarekin',
    brief: 'Etxe batean bi gela daude, bakoitza bere bonbillarekin. Pila bakar batekin, muntatu zirkuitu bat non etengailu bakoitzak bonbilla bat pizten eta itzaltzen duen, bestearen egoera edozein dela, eta bonbillek distira osoa duten.',
    pista: 'Bonbillak seriean jarriz gero, bat itzaltzean biak itzaltzen dira. Adar bat gela bakoitzeko: etengailua eta bonbilla seriean, eta bi adarrak paraleloan.',
    check(cs) {
      const L = mota(cs, 'bonbilla'), S = mota(cs, 'etengailua');
      const base = ['Bi bonbilla eta bi etengailu gutxienez', L.length >= 2 && S.length >= 2];
      if (!base[1]) return [base, ['Etengailu bakoitzak bonbilla bat kontrolatzen du, bestearen egoera edozein dela', false], ['Piztutako bonbillek distira osoa dute (% 70 gutxienez)', false]];
      const sIds = S.slice(0, 2).map(s => s.id), lIds = L.slice(0, 2).map(l => l.id);
      const emaitzak = konbinazioak(2).map(st => {
        const k = kopia(cs, c => { const i = sIds.indexOf(c.id); if (i >= 0) c.itxita = st[i]; else if (c.mota === 'etengailua') c.itxita = true; return c; });
        const r = ebatzi(k);
        return { st, ok: garbia(r), lit: lIds.map(id => r.ondo ? distira(k.find(x => x.id === id), r) : 0) };
      });
      const mapa = [[0, 1], [1, 0]].some(p => emaitzak.every(({ st, lit }) => st.every((s, i) => (lit[p[i]] >= 0.3) === s)));
      const ondo = emaitzak.every(e => e.ok);
      const distiratsu = emaitzak.every(e => e.lit.every(v => v < 0.3 || v >= 0.7));
      return [base, ['Etengailu bakoitzak bonbilla bat kontrolatzen du, bestearen egoera edozein dela', mapa && ondo], ['Piztutako bonbillek distira osoa dute (% 70 gutxienez)', mapa && ondo && distiratsu]];
    }
  },
  {
    id: 'hiru-osoak', maila: 1, izena: 'Hiru bonbilla, distira osoa', laburra: 'Pila bakarra, hiru argi indartsu',
    brief: 'Pila bakar batekin, piztu hiru bonbilla edo gehiago, guztiak beren distira nominalarekin (ez gutxiago, ez gehiegi).',
    pista: 'Seriean tentsioa banatu egiten da, eta bonbillek distira gutxiago egiten dute. Zein konexiotan jasotzen du bonbilla bakoitzak pilaren tentsio osoa? Pilaren tentsioak bonbillarena izan behar du.',
    check(cs) {
      const k = kopia(cs), r = ebatzi(k), L = mota(k, 'bonbilla');
      return [
        ['Hiru bonbilla gutxienez', L.length >= 3],
        ['Pila bakarra', mota(k, 'pila').length === 1],
        ['Bonbilla guztiek distira nominala (% 80–130)', L.length >= 3 && garbia(r) && L.every(c => { const d = distira(c, r); return d >= 0.8 && d <= 1.3; })]
      ];
    }
  },
  {
    id: 'fusiblea', maila: 1, izena: 'Instalazio babestua', laburra: 'Fusible batek zirkuitulaburretatik babestu',
    brief: 'Muntatu etxeko instalazio txiki bat: bi bonbilla edo gehiago piztuta, eta fusible bat. Fusibleak ez du funditu behar normalean, baina edozein bonbillaren ordez kable bat jarriz gero (zirkuitulaburra), funditu egin behar du.',
    pista: 'Fusiblea pilaren ondoan jarri, korronte guztia bertatik igaro dadin. Bonbillak paraleloan badaude, bat kable batez ordezkatzean pila zirkuitulaburrean geratzen da. Aukeratu fusiblearen korronte maximoa: normaleko korrontea baino handiagoa.',
    check(cs) {
      const k = kopia(cs), r = ebatzi(k), L = mota(k, 'bonbilla'), F = mota(k, 'fusiblea');
      const piztuta = L.filter(c => distira(c, r) >= 0.5);
      const normal = F.length >= 1 && garbia(r) && F.every(f => !f.fundituta);
      const babes = L.length >= 2 && F.length >= 1 && L.every(b => {
        const t = kopia(cs, c => c.id === b.id ? { ...c, mota: 'kablea' } : c), rt = ebatzi(t);
        return rt.ondo && !rt.zirkuitulaburra && mota(t, 'fusiblea').some(f => f.fundituta);
      });
      return [
        ['Bi bonbilla edo gehiago piztuta (% 50 gutxienez)', piztuta.length >= 2],
        ['Fusible bat, eta funtzionamendu normalean ez da funditzen', normal && piztuta.length >= 2],
        ['Edozein bonbilla kable batez ordezkatuta, fusiblea funditzen da', babes]
      ];
    }
  },
  {
    id: 'zehatza', maila: 2, izena: '100 miliampere zehatz', laburra: 'Erresistentziak konbinatu',
    brief: '9 V-ko pila bakar batekin eta bi erresistentzia edo gehiagorekin, lortu amperimetroak 100 mA (0,1 A) neurtzea, ±2 %-ko zehaztasunarekin.',
    pista: 'Ohm-en legea: R = V / I = 9 / 0,1 = 90 Ω behar dira guztira. Ez dago 90 Ω-eko erresistentziarik zerrendan: nola lor dezakezu bi edo gehiago seriean edo paraleloan konbinatuz?',
    check(cs) {
      const k = kopia(cs), r = ebatzi(k), P = mota(k, 'pila'), A = mota(k, 'amperimetroa');
      return [
        ['9 V-ko pila bakarra', P.length === 1 && P[0].balioa === 9],
        ['Bi erresistentzia gutxienez, bonbillarik gabe', mota(k, 'erresistentzia').length >= 2 && mota(k, 'bonbilla').length === 0],
        ['Amperimetroak 100 mA neurtzen ditu (±2 %)', A.length >= 1 && garbia(r) && A.some(a => Math.abs(Iabs(r, a) - 0.1) <= 0.002)]
      ];
    }
  },
  {
    id: 'lau-volt', maila: 2, izena: '4 volt', laburra: 'Tentsio-zatitzailea diseinatu',
    brief: '12 V-ko pila bakar batekin, diseinatu tentsio-zatitzaile bat: voltimetro batek erresistentzia baten muturretan 4 V neurtu behar ditu (±2 %), eta pilaren korrontea 50 mA baino txikiagoa izan behar da.',
    pista: 'V₂ = E · R₂ / (R₁ + R₂) = 4 V → R₂ pilaren tentsioaren herena: R₁ = 2 · R₂. Korrontea txikia izateko, erresistentzia handiak aukeratu (ehunka ohm).',
    check(cs) {
      const k = kopia(cs), r = ebatzi(k), P = mota(k, 'pila'), V = mota(k, 'voltimetroa'), R = mota(k, 'erresistentzia');
      const pot = n => r.V.get(n) ?? 0, same = (x, y) => Math.abs(pot(x) - pot(y)) < 1e-3;
      const neurtua = r.ondo && V.some(v => Math.abs(Math.abs(neurketa(v, r).U) - 4) <= 0.08 &&
        R.some(c => (same(c.a, v.a) && same(c.b, v.b)) || (same(c.a, v.b) && same(c.b, v.a))));
      const Ip = P.length === 1 && r.ondo ? Iabs(r, P[0]) : 0;
      return [
        ['12 V-ko pila bakarra', P.length === 1 && P[0].balioa === 12],
        ['Voltimetro batek 4 V neurtzen ditu erresistentzia baten muturretan (±2 %)', garbia(r) && neurtua],
        ['Pilaren korrontea 50 mA baino txikiagoa (eta ez zero)', Ip > 1e-4 && Ip < 0.05]
      ];
    }
  },
  {
    id: 'hiru-adar', maila: 2, izena: 'Hiru adar, ampere bat', laburra: 'Paraleloa eta korronteen legea',
    brief: '12 V-ko pila bakar batekin, muntatu hiru erresistentzia edo gehiago paraleloan (bakoitza pilaren tentsio osoarekin), adar nagusiko amperimetroak 1 A neurtzeko moduan (±3 %).',
    pista: 'Erresistentzia baliokidea 12 Ω izan behar da. Adar bakoitzeko korronteak batuta 1 A eman behar du: I = 12/R₁ + 12/R₂ + 12/R₃. Adibidez, bi 40 Ω-eko eta… zenbatekoa hirugarrena?',
    check(cs) {
      const k = kopia(cs), r = ebatzi(k), P = mota(k, 'pila'), A = mota(k, 'amperimetroa'), R = mota(k, 'erresistentzia');
      const osoak = r.ondo ? R.filter(c => Math.abs(Math.abs(neurketa(c, r).U) - 12) <= 0.12 && Iabs(r, c) > 0.01) : [];
      const Ip = P.length === 1 && r.ondo ? Iabs(r, P[0]) : 0;
      return [
        ['12 V-ko pila bakarra', P.length === 1 && P[0].balioa === 12],
        ['Hiru erresistentzia gutxienez paraleloan, 12 V-rekin', garbia(r) && osoak.length >= 3],
        ['Adar nagusiko amperimetroak 1 A neurtzen du (±3 %)', garbia(r) && A.some(a => Math.abs(Iabs(r, a) - 1) <= 0.03 && Math.abs(Iabs(r, a) - Ip) < 0.01)]
      ];
    }
  },
  {
    id: 'kargatu', maila: 3, izena: 'Bateria kargatu', laburra: 'Pila batek bestea kargatzen du',
    brief: 'Bi pilarekin eta erresistentziekin, muntatu zirkuitu bat non pila batek bestea kargatzen duen: korronteak kargatzen ari den pilaren + bornatik sartu behar du, 0,4 A eta 0,6 A artean.',
    pista: 'Pilak aurrez aurre jarri (+ bornak alde berean, adibidez biak goian), tentsio desberdinekin, eta erresistentzia bat tartean. Tentsioen legea: I = (E₁ − E₂) / R.',
    check(cs) {
      const k = kopia(cs), r = ebatzi(k), P = mota(k, 'pila');
      const karga = r.ondo ? P.filter(p => kargatzen(p, r)) : [];
      return [
        ['Bi pila gutxienez', P.length >= 2],
        ['Zirkuitulaburrik gabe', P.length >= 2 && garbia(r)],
        ['Pila bat kargatzen ari da (korrontea + bornatik sartzen zaio)', garbia(r) && karga.length > 0],
        ['Karga-korrontea 0,4 A eta 0,6 A artean', garbia(r) && karga.some(p => { const i = Iabs(r, p); return i >= 0.4 && i <= 0.6; })]
      ];
    }
  },
  {
    id: 'zubia', maila: 3, izena: 'Zubia orekatu', laburra: 'Wheatstone-ren zubia',
    hasiera: 'zubia',
    brief: 'Wheatstone-ren zubi hau ez dago orekatuta: erdiko amperimetroak korrontea neurtzen du. Aldatu erresistentzien balioak amperimetroak korronterik neurtu ez dezan (0,5 mA baino gutxiago), zubia benetan erabiliz.',
    pista: 'Zubia orekatuta dago R₁ / R₃ = R₂ / R₄ denean: orduan erdiko adarraren bi muturrek potentzial bera dute. Adibidez, R₁ = 10 Ω eta R₃ = 30 Ω badira, R₂ / R₄-k ere 1/3 izan behar du.',
    check(cs) {
      const k = kopia(cs), r = ebatzi(k), P = mota(k, 'pila'), A = mota(k, 'amperimetroa'), R = mota(k, 'erresistentzia');
      const Ip = P.length && r.ondo ? Iabs(r, P[0]) : 0;
      const zero = A.length >= 1 && garbia(r) && Iabs(r, A[0]) < 5e-4;
      // adar hila ez dela: erresistentzia bat aldatzean amperimetroak korrontea neurtu behar du
      const bizia = A.length >= 1 && R.some(x => {
        const t = kopia(cs, c => c.id === x.id ? { ...c, balioa: c.balioa * 1.5 } : c), rt = ebatzi(t);
        return rt.ondo && Iabs(rt, t.find(c => c.id === A[0].id)) > 5e-4;
      });
      return [
        ['Lau erresistentzia gutxienez eta amperimetro bat', R.length >= 4 && A.length >= 1],
        ['Pilaren korrontea 10 mA baino handiagoa', Ip > 0.01],
        ['Amperimetroak ez du korronterik neurtzen (< 0,5 mA)', zero],
        ['Ez da adar hila: erresistentzia bat aldatzean amperimetroak korrontea neurtzen du', zero && bizia]
      ];
    }
  }
];

export default function render(root, { footer, cfg }) {
  const mailak = cfg.mailak;
  const nireMaila = cfg.maila ? cfg.maila() : 1;
  const ebatziak = () => new Set(progress.get('erronkak').ebatziak || []);
  let cur = ERRONKAK.find(e => !ebatziak().has(e.id) && e.maila <= nireMaila) || ERRONKAK[0];
  let stopLab = null;

  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Aplikatu</div>
      <h1>Erronkak</h1>
      <p class="lede">Diseinatu zuk zeuk baldintza batzuk betetzen dituen zirkuitua. Laborategian muntatu, eta sakatu <b>Egiaztatu</b>: zure zirkuitua egoera desberdinetan probatuko da (etengailuak irekita eta itxita, zirkuitulaburrak, balio aldatuak…).</p>
    </header>
    <div class="er-grid" id="er-grid"></div>
    <section class="challenge-card er-cur" id="er-cur" aria-live="polite"></section>
    <div id="er-lab" style="margin-top:14px"></div>
    ${footer()}`;
  const $ = s => root.querySelector(s);

  function grid() {
    const done = ebatziak();
    $('#er-grid').innerHTML = ERRONKAK.map((e, i) => `
      <button class="er-card ${e === cur ? 'on' : ''} ${done.has(e.id) ? 'done' : ''}" data-er="${e.id}" aria-pressed="${e === cur}">
        <span class="er-num">${i + 1}</span>
        <b>${esc(e.izena)}</b>
        <span>${esc(e.laburra)}</span>
        <span class="state">${done.has(e.id) ? 'Ebatzita ✓' : 'Egiteko'}${e.maila > 1 ? ` <span class="lvl lvl-${e.maila}">${mailak[e.maila].laburra}</span>` : ''}</span>
      </button>`).join('');
    root.querySelectorAll('[data-er]').forEach(b => b.addEventListener('click', () => {
      cur = ERRONKAK.find(e => e.id === b.dataset.er);
      open();
    }));
  }

  function panel(criteria = null) {
    const done = ebatziak().has(cur.id);
    $('#er-cur').innerHTML = `
      <header><h2>${esc(cur.izena)}</h2>
        <div class="tags"><span class="pill strong">${mailak[cur.maila].izena}</span>${done ? '<span class="pill ok">Ebatzita</span>' : ''}</div></header>
      <div class="challenge-body">
        <p class="brief">${cur.brief}</p>
        <ul class="er-crit">${(criteria || cur.check([]).map(([t]) => [t, null])).map(([t, ok]) =>
          `<li class="${ok === null ? '' : ok ? 'ok' : 'no'}"><i aria-hidden="true">${ok === null ? '○' : ok ? '✓' : '✗'}</i>${esc(t)}</li>`).join('')}</ul>
        <div class="pills">
          <button class="btn primary" id="er-check">Egiaztatu</button>
          <button class="btn" id="er-hint">Pista</button>
        </div>
        <p class="ch-hint" id="er-pista" hidden>${cur.pista}</p>
        ${criteria ? `<p class="ch-result ${criteria.every(c => c[1]) ? 'ok' : 'no'}"><span class="verdict">${criteria.every(c => c[1]) ? 'Erronka ebatzita! Zirkuitu bikaina.' : `${criteria.filter(c => c[1]).length} / ${criteria.length} baldintza betetzen dira. Aldatu zirkuitua eta egiaztatu berriro.`}</span></p>` : ''}
      </div>`;
    $('#er-check').addEventListener('click', check);
    $('#er-hint').addEventListener('click', () => { $('#er-pista').hidden = !$('#er-pista').hidden; });
  }

  function check() {
    const api = stopLab?.lab;
    if (!api) return;
    const criteria = cur.check(api.osagaiak());
    if (criteria.every(c => c[1])) {
      const set = ebatziak();
      set.add(cur.id);
      progress.set('erronkak', { ebatziak: [...set] });
    }
    panel(criteria);
    grid();
  }

  function open() {
    if (stopLab) stopLab();
    grid();
    panel();
    stopLab = mount($('#er-lab'), {
      id: 'er', zabala: true, maila: Math.max(nireMaila, cur.maila),
      adibidea: cur.hasiera || 'hutsa', adibideak: [cur.hasiera || 'hutsa'],
      gorde: `elektrizitatea:erronka:${cur.id}`,
      onChange: () => { const r = $('#er-cur .ch-result'); if (r) r.remove(); root.querySelectorAll('.er-crit li').forEach(li => { li.className = ''; li.querySelector('i').textContent = '○'; }); }
    });
  }

  open();
  return () => { if (stopLab) stopLab(); };
}
