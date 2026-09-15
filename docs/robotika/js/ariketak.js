// Ariketa-sorgailuak. Maila: 1 = DBH 1-2, 2 = DBH 3-4, 3 = Batxilergoa.
// sortu(maila) → { q (HTML), erantzuna, unitatea, pista, ebazpena[], tol?, zehatza?, hamartarrak? }
import { fmt, pick, randInt } from './util.js';
import { programa } from './blokeHTML.js';
import { sinplifikatu, terminoHTML } from './sim/karnaugh.js';
import { margotu } from './blokeak/kodea.js';

const fig = html => `<div class="ex-fig">${html}</div>`;
const pseudo = lerroak => `<ol class="ex-pseudo">${lerroak.map(([t, s = 0]) => `<li style="--s:${s}"><code>${t}</code></li>`).join('')}</ol>`;
const milaka = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const hasieran = g => programa([['gertaera', 'hasieran', g]]);
const oso = { unitatea: '', zehatza: true, hamartarrak: 0 };

// ---------- robota sareta batean (y handitzen da iparralderantz) ----------
const NORAK = ['iparraldera', 'ekialdera', 'hegoaldera', 'mendebaldera'];
const DX = [0, 1, 0, -1], DY = [1, 0, -1, 0];
const robotLerroak = prog => prog.map(o => o === 'A' ? 'aurrera egin' : o === 'L' ? 'biratu ezkerrera ↺' : o === 'R' ? 'biratu eskuinera ↻' : ['kontrola', `errepikatu {${o.rep}} aldiz`, robotLerroak(o.body)]);
function robotExec(prog, s) {
  for (const o of prog) {
    if (o === 'A') { s.x += DX[s.d]; s.y += DY[s.d]; }
    else if (o === 'L') s.d = (s.d + 3) % 4;
    else if (o === 'R') s.d = (s.d + 1) % 4;
    else for (let i = 0; i < o.rep; i++) robotExec(o.body, s);
  }
  return s;
}
const kokapena = s => `(${s.x}, ${s.y}), ${NORAK[s.d]} begira`;
const blokeIzena = o => o === 'A' ? 'aurrera' : o === 'L' ? 'biratu ezkerrera' : o === 'R' ? 'biratu eskuinera' : `errepikatu ${o.rep}`;

// ---------- Micro:bit pantaila ----------
function ledak(piztuak, etiketak = false) {
  let s = etiketak ? '<b></b>' + [0, 1, 2, 3, 4].map(x => `<b>${x}</b>`).join('') : '';
  for (let y = 0; y < 5; y++) {
    if (etiketak) s += `<b>${y}</b>`;
    for (let x = 0; x < 5; x++) s += `<i class="${piztuak.has(x + ',' + y) ? 'on' : ''}"></i>`;
  }
  return `<div class="ex-leds${etiketak ? ' lab' : ''}" role="img" aria-label="5 × 5 LED pantaila, ${piztuak.size} LED piztuta">${s}</div>`;
}

export const ARIKETAK = {
  // ---------- pentsamendu konputazionala ----------
  'sareta-posizioa': {
    izena: 'Robotaren kokapena',
    sortu(m) {
      let prog;
      if (m === 1) {
        prog = Array.from({ length: randInt(5, 7) }, () => Math.random() < 0.62 ? 'A' : pick(['L', 'R']));
        if (prog.every(o => o === 'A')) prog[randInt(1, prog.length - 2)] = pick(['L', 'R']);
        if (prog.filter(o => o === 'A').length < 2) { prog[0] = 'A'; prog[prog.length - 1] = 'A'; }
      } else if (m === 2) {
        prog = [{ rep: randInt(2, 4), body: [...Array(randInt(1, 3)).fill('A'), pick(['L', 'R'])] }, ...Array(randInt(1, 2)).fill('A')];
      } else {
        prog = [{ rep: randInt(2, 3), body: [{ rep: randInt(2, 4), body: ['A'] }, pick(['L', 'R'])] }, pick(['L', 'R']), { rep: randInt(2, 5), body: ['A'] }];
      }
      const ax = pick(['x', 'y']);
      const s = { x: 0, y: 0, d: 1 };
      const ebazpena = ['Hasieran: (0, 0), ekialdera begira'];
      for (const o of prog) {
        if (typeof o === 'object') {
          for (let i = 0; i < o.rep; i++) { robotExec(o.body, s); ebazpena.push(`${blokeIzena(o)}, ${i + 1}. itzulia → ${kokapena(s)}`); }
        } else {
          robotExec([o], s);
          ebazpena.push(`${blokeIzena(o)} → ${kokapena(s)}`);
        }
      }
      ebazpena.push(`${ax} = ${s[ax]}`);
      return {
        q: `Robota (0, 0) laukian dago, <strong>ekialdera</strong> begira. Ekialdera x handitzen da, eta iparraldera y. Programa hau exekutatu ondoren, zein da robotaren <strong>${ax}</strong> koordenatua?` + fig(hasieran(robotLerroak(prog))),
        erantzuna: s[ax], ...oso,
        pista: m === 1 ? 'Marraztu sareta bat eta jarraitu robota bloke bakar batez. Biratzean ez da lekuz aldatzen.' : 'Egin begiztaren barrukoa behin eta idatzi non geratzen den; gero errepikatu, norabidea kontuan hartuta.',
        ebazpena
      };
    }
  },

  patroia: {
    izena: 'Patroiak',
    sortu(m) {
      let t, azal;
      if (m === 1) {
        const a = randInt(1, 20), k = randInt(2, 9);
        t = [0, 1, 2, 3, 4].map(i => a + k * i);
        azal = `Zenbaki bakoitza aurrekoa gehi ${k} da.`;
      } else if (m === 2) {
        const mota = randInt(0, 2);
        if (mota === 0) {
          const a = randInt(1, 5), r = pick([2, 3]);
          t = [0, 1, 2, 3, 4].map(i => a * r ** i);
          azal = `Zenbaki bakoitza aurrekoa bider ${r} da.`;
        } else if (mota === 1) {
          const p = randInt(2, 5), q = randInt(6, 9);
          t = [randInt(1, 10)];
          for (let i = 1; i < 6; i++) t.push(t[i - 1] + (i % 2 ? p : q));
          azal = `Txandaka batzen da: +${p}, +${q}, +${p}, +${q}…`;
        } else {
          const a = randInt(60, 99), k = randInt(3, 8);
          t = [0, 1, 2, 3, 4].map(i => a - k * i);
          azal = `Zenbaki bakoitza aurrekoa ken ${k} da.`;
        }
      } else {
        const mota = randInt(0, 2);
        if (mota === 0) {
          const n = randInt(1, 6);
          t = [0, 1, 2, 3, 4].map(i => (n + i) ** 2);
          azal = `Karratuak dira: ${n}², ${n + 1}², ${n + 2}²… Hurrengoa ${n + 4}² da.`;
        } else if (mota === 1) {
          t = [randInt(1, 4), randInt(1, 6)];
          while (t.length < 7) t.push(t.at(-1) + t.at(-2));
          azal = 'Zenbaki bakoitza aurreko biak batuta lortzen da (Fibonacciren segidaren antzera).';
        } else {
          const s = randInt(1, 5);
          t = [0, 1, 2, 3, 4].map(i => (s + i) * (s + i + 1) / 2);
          azal = 'Diferentziak bana handitzen dira: zenbaki triangeluarrak dira.';
        }
      }
      const erakutsi = t.slice(0, -1), erantzuna = t.at(-1);
      const dif = erakutsi.slice(1).map((v, i) => (v - erakutsi[i] >= 0 ? '+' : '−') + Math.abs(v - erakutsi[i]));
      return {
        q: `Bilatu <strong>patroia</strong> eta idatzi segidaren hurrengo zenbakia:<div class="ex-seg">${erakutsi.join(', ')}, …</div>`,
        erantzuna, ...oso,
        pista: m === 1 ? 'Kalkulatu zenbat aldatzen den zenbaki batetik hurrengora.' : m === 2 ? 'Batzen, kentzen ala biderkatzen da? Begiratu diferentziak, eta konstanteak ez badira, zatidurak.' : 'Diferentziak konstanteak ez badira, begiratu nola aldatzen diren, edo aurreko bi zenbakien arteko erlazioa.',
        ebazpena: [`Diferentziak: ${dif.join(', ')}`, azal, `Hurrengoa: ${erantzuna}`]
      };
    }
  },

  // ---------- algoritmoak ----------
  'fluxua-begizta': {
    izena: 'Begizta bat trazatu',
    sortu(m) {
      if (m === 1) {
        const N = randInt(3, 7), eb = [];
        let s = 0;
        for (let i = 1; i <= N; i++) { s += i; eb.push(`i = ${i}: batura = ${s}`); }
        eb.push(`i = ${N + 1}: ${N + 1} ≤ ${N} gezurra → idatzi ${s}`);
        return {
          q: `N = <strong>${N}</strong> bada, zer idazten du algoritmo honek?` + pseudo([['batura ← 0'], ['i ← 1'], ['i ≤ N den bitartean:'], ['batura ← batura + i', 1], ['i ← i + 1', 1], ['Idatzi batura']]),
          erantzuna: s, ...oso, pista: 'Egin taula bat bi zutaberekin (i eta batura) eta idatzi itzuli bakoitzeko balioak.', ebazpena: eb
        };
      }
      if (m === 2) {
        if (Math.random() < 0.5) {
          const a = randInt(1, 5), k = pick([2, 3]), b = a + k * randInt(3, 5) + randInt(0, k - 1), eb = [];
          let s = 0;
          for (let i = a; i <= b; i += k) { s += i; eb.push(`i = ${i}: batura = ${s}`); }
          eb.push(`i = ${a + k * (Math.floor((b - a) / k) + 1)} > ${b} → idatzi ${s}`);
          return {
            q: 'Zer idazten du algoritmo honek?' + pseudo([['batura ← 0'], [`i ← ${a}`], [`i ≤ ${b} den bitartean:`], ['batura ← batura + i', 1], [`i ← i + ${k}`, 1], ['Idatzi batura']]),
            erantzuna: s, ...oso, pista: `i-k ez du 1 gehitzen, ${k} baizik. Idatzi i-ren balio guztiak ${b} gainditu arte.`, ebazpena: eb
          };
        }
        const N = randInt(3, 6), eb = [];
        let f = 1;
        for (let i = 1; i <= N; i++) { f *= i; eb.push(`i = ${i}: f = ${f}`); }
        eb.push(`Hau ${N}-ren faktoriala da: ${N}! = ${milaka(f)}`);
        return {
          q: `N = <strong>${N}</strong> bada, zer idazten du algoritmo honek?` + pseudo([['f ← 1'], ['i ← 1'], ['i ≤ N den bitartean:'], ['f ← f × i', 1], ['i ← i + 1', 1], ['Idatzi f']]),
          erantzuna: f, ...oso, pista: 'f-k 1ekin hasten da (ez 0rekin), biderkatzen delako.', ebazpena: eb
        };
      }
      const N = pick([3, 5, 6, 10, 12]), seg = [N];
      let n = N, u = 0;
      while (n !== 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; u++; seg.push(n); }
      return {
        q: `N = <strong>${N}</strong> bada, zer idazten du algoritmo honek (Collatzen segida)?` + pseudo([['n ← N'], ['urratsak ← 0'], ['n ≠ 1 den bitartean:'], ['n mod 2 = 0 bada:', 1], ['n ← n ÷ 2', 2], ['bestela:', 1], ['n ← 3 × n + 1', 2], ['urratsak ← urratsak + 1', 1], ['Idatzi urratsak']]),
        erantzuna: u, ...oso, pista: 'Idatzi n-k hartzen dituen balio guztiak, 1 lortu arte, eta zenbatu aldaketak.', ebazpena: [seg.join(' → '), `${u} urrats`]
      };
    }
  },

  'fluxua-erabakia': {
    izena: 'Erabakiak trazatu',
    sortu(m) {
      if (m === 1) {
        const A = randInt(2, 40);
        let B = randInt(2, 40);
        if (A === B) B += 3;
        const r = Math.abs(A - B);
        return {
          q: `A = <strong>${A}</strong> eta B = <strong>${B}</strong> badira, zer idazten du algoritmo honek?` + pseudo([['Irakurri A'], ['Irakurri B'], ['A > B bada:'], ['Idatzi A − B', 1], ['bestela:'], ['Idatzi B − A', 1]]),
          erantzuna: r, ...oso, pista: 'Lehenik erabaki zein adarretatik joaten den: A > B egia ala gezurra da?',
          ebazpena: [`${A} > ${B} → ${A > B ? 'egia' : 'gezurra'}`, A > B ? `Idatzi ${A} − ${B} = ${r}` : `Idatzi ${B} − ${A} = ${r}`]
        };
      }
      if (m === 2) {
        const P = pick([12, 18, 20, 25, 40, 50, 55, 80]);
        const r = P > 50 ? P - 10 : P > 20 ? P - 5 : P;
        return {
          q: `Denda batek algoritmo hau erabiltzen du prezioak kalkulatzeko. P = <strong>${P}</strong> € bada, zer idazten du?` + pseudo([['prezioa ← P'], ['P > 50 bada:'], ['prezioa ← P − 10', 1], ['bestela:'], ['P > 20 bada:', 1], ['prezioa ← P − 5', 2], ['Idatzi prezioa']]),
          erantzuna: r, ...oso, unitatea: '€', pista: 'Kontuz mugekin: 50 > 50 gezurra da, eta 20 > 20 ere bai.',
          ebazpena: [`${P} > 50 → ${P > 50 ? 'egia' : 'gezurra'}`, ...(P > 50 ? [`prezioa = ${P} − 10 = ${r}`] : [`${P} > 20 → ${P > 20 ? 'egia' : 'gezurra'}`, P > 20 ? `prezioa = ${P} − 5 = ${r}` : `prezioa = ${P} (ez da aldatzen)`]), `Idatzi ${r}`]
        };
      }
      const N = randInt(20, 60), k = pick([3, 4, 6, 7]), r = Math.floor(N / k);
      return {
        q: `N = <strong>${N}</strong> bada, zer idazten du algoritmo honek?` + pseudo([['kont ← 0'], ['i ← 1'], ['i ≤ N den bitartean:'], [`i mod ${k} = 0 bada:`, 1], ['kont ← kont + 1', 2], ['i ← i + 1', 1], ['Idatzi kont']]),
        erantzuna: r, ...oso, pista: `i mod ${k} = 0 denean, i ${k}-ren multiploa da. Zenbat multiplo daude 1 eta N artean?`,
        ebazpena: [`${k}-ren multiploak: ${Array.from({ length: Math.min(r, 6) }, (_, j) => k * (j + 1)).join(', ')}${r > 6 ? ', …' : ''}`, `${N} / ${k} = ${fmt(N / k, 2)} → ${r} multiplo`]
      };
    }
  },

  bilaketa: {
    izena: 'Bilaketa-algoritmoak',
    sortu(m) {
      if (m === 1) {
        const N = pick([16, 32, 64, 128]), g = randInt(1, 3), r = N / 2 ** g;
        return {
          q: `Lagun batek 1 eta ${N} arteko zenbaki bat pentsatu du. Zuk zenbaki bat esaten duzun bakoitzean, «handiagoa» edo «txikiagoa» erantzuten dizu. Beti geratzen diren zenbakien <strong>erdikoa</strong> esaten baduzu, <strong>${g}</strong> galderaren ondoren gehienez zenbat zenbaki geratzen dira aukeran?`,
          erantzuna: r, ...oso, unitatea: 'zenbaki', pista: 'Galdera bakoitzak aukerak erdira murrizten ditu.',
          ebazpena: Array.from({ length: g }, (_, i) => `${i + 1}. galderaren ondoren: ${N / 2 ** (i + 1)}`)
        };
      }
      if (m === 2) {
        const N = pick([15, 31, 63, 127, 255, 511, 1023]), k = Math.log2(N + 1);
        return {
          q: `Bilaketa bitarrarekin (beti erdiko zenbakia esanez), 1 eta ${milaka(N)} artean, <strong>kasu txarrenean</strong> zenbat galdera behar dira zenbakia asmatzeko?`,
          erantzuna: k, ...oso, unitatea: 'galdera', pista: 'k galderarekin 2^k − 1 zenbakiren artean asma daiteke.',
          ebazpena: [`2^${k} − 1 = ${milaka(N)}`, `${k} galdera`]
        };
      }
      const N = pick([1000, 100000, 1000000]), k = Math.ceil(Math.log2(N + 1)), r = N / k;
      return {
        q: `${milaka(N)} elementu ordenaturen artean bilatzen da. Bilaketa linealak (banan-banan) ${milaka(N)} konparaketa behar ditu kasu txarrenean. Bilaketa bitarrak zenbat aldiz <strong>konparaketa gutxiago</strong> behar ditu?`,
        erantzuna: r, unitatea: 'aldiz', hamartarrak: 0, tol: Math.max(1, r * 0.01),
        pista: 'Bilaketa bitarraren kasu txarra: 2^k − 1 ≥ N betetzen duen k txikiena.',
        ebazpena: [`2^${k} − 1 = ${milaka(2 ** k - 1)} ≥ ${milaka(N)} → k = ${k}`, `${milaka(N)} / ${k} ≈ ${milaka(Math.round(r))}`]
      };
    }
  },

  // ---------- blokeak ----------
  errepikapenak: {
    izena: 'Begiztak zenbatu',
    sortu(m) {
      if (m === 1) {
        if (Math.random() < 0.5) {
          const a = randInt(2, 6), c = randInt(2, 3);
          return {
            q: 'Zenbat aldiz exekutatzen da «aurrera egin» blokea?' + fig(hasieran([['kontrola', `errepikatu {${a}} aldiz`, Array(c).fill('aurrera egin')]])),
            erantzuna: a * c, ...oso, unitatea: 'aldiz', pista: 'Barruko blokeak itzuli bakoitzean exekutatzen dira.',
            ebazpena: [`Itzuli bakoitzean: ${c} aldiz`, `${a} itzuli × ${c} = ${a * c}`]
          };
        }
        const a = randInt(2, 7), c = randInt(2, 7);
        return {
          q: 'Zenbat aldiz exekutatzen da «aurrera egin» blokea?' + fig(hasieran([['kontrola', `errepikatu {${a}} aldiz`, ['aurrera egin']], 'biratu eskuinera ↻', ['kontrola', `errepikatu {${c}} aldiz`, ['aurrera egin']]])),
          erantzuna: a + c, ...oso, unitatea: 'aldiz', pista: 'Bi begizta daude, bata bestearen atzetik.',
          ebazpena: [`Lehen begizta: ${a}`, `Bigarrena: ${c}`, `${a} + ${c} = ${a + c}`]
        };
      }
      if (m === 2) {
        const a = randInt(2, 5), c = randInt(2, 6), zer = pick(['aurrera egin', 'biratu eskuinera']);
        const r = zer === 'aurrera egin' ? a * c : a;
        return {
          q: `Zenbat aldiz exekutatzen da «${zer}» blokea?` + fig(hasieran([['kontrola', `errepikatu {${a}} aldiz`, [['kontrola', `errepikatu {${c}} aldiz`, ['aurrera egin']], 'biratu eskuinera ↻']]])),
          erantzuna: r, ...oso, unitatea: 'aldiz', pista: 'Barruko begizta osoa kanpoko begiztaren itzuli bakoitzean exekutatzen da.',
          ebazpena: zer === 'aurrera egin' ? [`Kanpoko itzuli bakoitzean: ${c} aldiz`, `${a} × ${c} = ${r}`] : ['Kanpoko begiztaren barruan dago, baina ez barrukoaren barruan', `${a} aldiz`]
        };
      }
      const a = randInt(2, 4), c = randInt(2, 5), d = randInt(2, 5);
      return {
        q: 'Zer idazten du programa honek kontsolan?' + fig(hasieran([['aldagaiak', 'ezarri [k] ← {0}'], ['kontrola', `errepikatu {${a}} aldiz`, [['kontrola', `errepikatu {${c}} aldiz`, [['aldagaiak', `aldatu [k], gehitu {${d}}`]]]]], ['kontsola', 'idatzi [k]']])),
        erantzuna: a * c * d, ...oso, pista: 'Zenbatu zenbat aldiz exekutatzen den «aldatu» blokea, eta biderkatu gehitzen den zenbakiarekin.',
        ebazpena: [`«aldatu»: ${a} × ${c} = ${a * c} aldiz`, `k = ${a * c} × ${d} = ${a * c * d}`]
      };
    }
  },

  baldintzak: {
    izena: 'Baldintzak trazatu',
    sortu(m) {
      if (m === 1) {
        const x = randInt(1, 12), t = randInt(4, 9), s = randInt(2, 5), r = x > t ? x - s : x + s;
        return {
          q: 'Zer idazten du programa honek?' + fig(hasieran([['aldagaiak', `ezarri [x] ← {${x}}`], ['kontrola', `baldin ⟨[x] > {${t}}⟩ bada`, [['aldagaiak', `ezarri [x] ← [x] − {${s}}`]], 'bestela', [['aldagaiak', `ezarri [x] ← [x] + {${s}}`]]], ['kontsola', 'idatzi [x]']])),
          erantzuna: r, ...oso, pista: 'Baldintza egia bada goiko taldea exekutatzen da; gezurra bada, «bestela» taldea.',
          ebazpena: [`${x} > ${t} → ${x > t ? 'egia' : 'gezurra'}`, x > t ? `x = ${x} − ${s} = ${r}` : `x = ${x} + ${s} = ${r}`]
        };
      }
      if (m === 2) {
        const n = randInt(5, 8), t = randInt(6, 12), a = randInt(3, 5), c = randInt(1, 3), eb = [];
        let x = 0;
        for (let i = 1; i <= n; i++) {
          const e = x < t;
          x = e ? x + a : x - c;
          eb.push(`${i}. itzulia: ${e ? `egia, +${a}` : `gezurra, −${c}`} → x = ${x}`);
        }
        return {
          q: 'Zer idazten du programa honek?' + fig(hasieran([['aldagaiak', 'ezarri [x] ← {0}'], ['kontrola', `errepikatu {${n}} aldiz`, [['kontrola', `baldin ⟨[x] < {${t}}⟩ bada`, [['aldagaiak', `aldatu [x], gehitu {${a}}`]], 'bestela', [['aldagaiak', `aldatu [x], gehitu {−${c}}`]]]]], ['kontsola', 'idatzi [x]']])),
          erantzuna: x, ...oso, pista: `Egin taula bat: itzulia, x < ${t} egia ala gezurra, eta x-ren balio berria.`, ebazpena: eb
        };
      }
      const a = randInt(1, 9), c = randInt(1, 9), p = randInt(2, 7), q = randInt(3, 8);
      const e1 = a > p, e2 = c < q, e3 = a === c, r = (e1 && e2) || e3 ? 1 : 0;
      const eg = v => v ? 'egia' : 'gezurra';
      return {
        q: 'Zer idazten du programa honek? Kontuz ordenarekin: parentesiaren barrukoa lehenik.' + fig(hasieran([['aldagaiak', `ezarri [a] ← {${a}}`], ['aldagaiak', `ezarri [b] ← {${c}}`], ['kontrola', `baldin ⟨( [a] > {${p}} eta [b] < {${q}} ) edo [a] = [b]⟩ bada`, [['kontsola', 'idatzi {1}']], 'bestela', [['kontsola', 'idatzi {0}']]]])),
        erantzuna: r, ...oso, pista: '«eta»: biak egia badira. «edo»: bat gutxienez egia bada.',
        ebazpena: [`${a} > ${p} → ${eg(e1)}; ${c} < ${q} → ${eg(e2)}`, `parentesia (eta) → ${eg(e1 && e2)}`, `${a} = ${c} → ${eg(e3)}`, `edo → ${eg(r)}: idatzi ${r}`]
      };
    }
  },

  // ---------- aldagaiak ----------
  'aldagaiak-trazatu': {
    izena: 'Aldagaiak trazatu',
    sortu(m) {
      if (m === 1) {
        const p = randInt(2, 15), q = randInt(2, 15), ask = pick(['a', 'b']), a = p + q, b = p;
        return {
          q: `Programa hau exekutatu ondoren, zein da <strong>${ask}</strong> aldagaiaren balioa?` + fig(hasieran([['aldagaiak', `ezarri [a] ← {${p}}`], ['aldagaiak', `ezarri [b] ← {${q}}`], ['aldagaiak', 'ezarri [a] ← [a] + [b]'], ['aldagaiak', 'ezarri [b] ← [a] − [b]']])),
          erantzuna: ask === 'a' ? a : b, ...oso, pista: 'Egin trazaketa-taula: bloke bakoitzaren ondoren idatzi a eta b. Aldagai batek balio berria hartzean, aurrekoa galdu egiten da.',
          ebazpena: [`a = ${p}, b = ${q}`, `a = ${p} + ${q} = ${a}`, `b = ${a} − ${q} = ${b}`]
        };
      }
      if (m === 2) {
        const p = randInt(2, 12), q = randInt(2, 12), ask = pick(['x', 'y']), k = pick([2, 3]), x = q * k, y = p;
        return {
          q: `Programa hau exekutatu ondoren, zein da <strong>${ask}</strong> aldagaiaren balioa?` + fig(hasieran([['aldagaiak', `ezarri [x] ← {${p}}`], ['aldagaiak', `ezarri [y] ← {${q}}`], ['aldagaiak', 'ezarri [lag] ← [x]'], ['aldagaiak', 'ezarri [x] ← [y]'], ['aldagaiak', 'ezarri [y] ← [lag]'], ['aldagaiak', `ezarri [x] ← [x] × {${k}}`]])),
          erantzuna: ask === 'x' ? x : y, ...oso, pista: '«lag» aldagai laguntzailea da: x-ren balioa gordetzen du, galdu ez dadin.',
          ebazpena: [`lag = ${p}`, `x = ${q}`, `y = ${p}`, `x = ${q} × ${k} = ${x}`]
        };
      }
      const N = randInt(102, 9876), eb = [];
      let s = 0, n = N;
      while (n > 0) { const d = n % 10; s += d; n = (n - d) / 10; eb.push(`s = ${s}, n = ${n}`); }
      return {
        q: 'Zer idazten du programa honek?' + fig(hasieran([['aldagaiak', `ezarri [n] ← {${N}}`], ['aldagaiak', 'ezarri [s] ← {0}'], ['kontrola', 'errepikatu ⟨[n] > {0}⟩ bitartean', [['aldagaiak', 'aldatu [s], gehitu [n] mod {10}'], ['aldagaiak', 'ezarri [n] ← ([n] − [n] mod {10}) ÷ {10}']]], ['kontsola', 'idatzi [s]']])),
        erantzuna: s, ...oso, pista: 'n mod 10 zenbakiaren azken zifra da, eta (n − n mod 10) ÷ 10 eginez azken zifra kentzen zaio.',
        ebazpena: [...eb, `Zifren batura: ${String(N).split('').join(' + ')} = ${s}`]
      };
    }
  },

  eragileak: {
    izena: 'Eragileak',
    sortu(m) {
      if (m === 1) {
        const a = randInt(2, 12), c = randInt(2, 9), d = randInt(2, 6), k = randInt(0, 2);
        const [ad, r, eb] = k === 0 ? [`${a} + ${c} × ${d}`, a + c * d, [`Lehenik biderketa: ${c} × ${d} = ${c * d}`, `${a} + ${c * d} = ${a + c * d}`]]
          : k === 1 ? [`(${a} + ${c}) × ${d}`, (a + c) * d, [`Lehenik parentesia: ${a} + ${c} = ${a + c}`, `${a + c} × ${d} = ${(a + c) * d}`]]
          : [`${a * d + c} − ${c * d} ÷ ${d}`, a * d, [`Lehenik zatiketa: ${c * d} ÷ ${d} = ${c}`, `${a * d + c} − ${c} = ${a * d}`]];
        return {
          q: `Programa batek eragiketa hau kalkulatzen du. Zein da emaitza?<div class="ex-seg">${ad}</div>`,
          erantzuna: r, ...oso, pista: 'Matematikan bezala: parentesiak lehenik, gero biderketak eta zatiketak, eta azkenik batuketak eta kenketak.', ebazpena: eb
        };
      }
      if (m === 2) {
        const k = randInt(3, 9), N = k * randInt(3, 9) + randInt(1, k - 1);
        return {
          q: `${N} gozoki ${k} ikasleren artean banatu nahi dira, bakoitzari kopuru bera emanez. Programak <code>${N} mod ${k}</code> kalkulatzen du: zenbat gozoki geratzen dira banatu gabe?`,
          erantzuna: N % k, ...oso, unitatea: 'gozoki', pista: 'mod eragileak zatiketa osoaren hondarra ematen du.',
          ebazpena: [`${N} ÷ ${k} = ${Math.floor(N / k)}, hondarra ${N % k}`, `Egiaztatu: ${Math.floor(N / k)} × ${k} + ${N % k} = ${N}`]
        };
      }
      const x = randInt(0, 9), y = randInt(0, 4), k = randInt(0, 2);
      const eg = v => v ? 'egia' : 'gezurra';
      const [ad, r, eb] = k === 0 ? ['(x > 3) eta ez (y = 2)', x > 3 && y !== 2, [`x > 3 → ${eg(x > 3)}`, `y = 2 → ${eg(y === 2)}, beraz ez (y = 2) → ${eg(y !== 2)}`]]
        : k === 1 ? ['(x mod 2 = 0) edo (y > x)', x % 2 === 0 || y > x, [`x mod 2 = ${x % 2} → ${eg(x % 2 === 0)}`, `y > x → ${eg(y > x)}`]]
        : ['ez ((x &lt; 5) eta (y &lt; 2))', !(x < 5 && y < 2), [`x &lt; 5 → ${eg(x < 5)}`, `y &lt; 2 → ${eg(y < 2)}`, `eta → ${eg(x < 5 && y < 2)}, eta «ez» alderantzikatu egiten du`]];
      return {
        q: `x = <strong>${x}</strong> eta y = <strong>${y}</strong> badira, zein da adierazpen honen balioa? Idatzi <strong>1</strong> egia bada, eta <strong>0</strong> gezurra bada.<div class="ex-seg">${ad}</div>`,
        erantzuna: r ? 1 : 0, ...oso, pista: '«eta»: biak egia. «edo»: bat gutxienez egia. «ez»: alderantzizkoa.',
        ebazpena: [...eb, `Emaitza: ${r ? 'egia → 1' : 'gezurra → 0'}`]
      };
    }
  },

  // ---------- Micro:bit ----------
  'led-koordenatuak': {
    izena: 'LED pantaila',
    sortu(m) {
      if (m === 1) {
        const x = randInt(0, 4), y = randInt(0, 4), ask = pick(['x', 'y']);
        return {
          q: `Micro:bit-en pantailan LED bat dago piztuta. Goiko ezkerreko LEDa (0, 0) da; x zutabea da (ezkerretik eskuinera) eta y errenkada (goitik behera). Zein da LED piztuaren <strong>${ask}</strong> koordenatua?` + fig(ledak(new Set([x + ',' + y]))),
          erantzuna: ask === 'x' ? x : y, ...oso, pista: 'Zenbatu 0tik hasita, ez 1etik.',
          ebazpena: [`LEDa ${x + 1}. zutabean eta ${y + 1}. errenkadan dago`, `x = ${x}, y = ${y}`]
        };
      }
      const lerroak = [];
      while (lerroak.length < (m === 2 ? 2 : 3)) {
        const s = pick(['E', 'Z', 'D']), k = s === 'D' ? 0 : randInt(0, 4);
        if (!lerroak.some(o => o.s === s && o.k === k)) lerroak.push({ s, k });
      }
      const ekintza = m === 2 ? 'piztu' : 'aldatu', kont = new Map(), g = [];
      for (const o of lerroak) {
        for (let i = 0; i < 5; i++) {
          const key = (o.s === 'E' ? [i, o.k] : o.s === 'Z' ? [o.k, i] : [i, i]).join(',');
          kont.set(key, (kont.get(key) || 0) + 1);
        }
        const koord = o.s === 'E' ? `x [i] y {${o.k}}` : o.s === 'Z' ? `x {${o.k}} y [i]` : 'x [i] y [i]';
        g.push(['aldagaiak', 'ezarri [i] ← {0}'], ['kontrola', 'errepikatu {5} aldiz', [['pantaila', `${ekintza} LEDa ${koord}`], ['aldagaiak', 'aldatu [i], gehitu {1}']]]);
      }
      const piztuak = [...kont].filter(([, n]) => m === 2 ? n > 0 : n % 2 === 1).map(([k]) => k);
      return {
        q: `Pantaila hutsik dago. Programa hau exekutatu ondoren, zenbat LED daude <strong>piztuta</strong>?${m === 3 ? ' «aldatu» blokeak LEDa piztuta badago itzali egiten du, eta itzalita badago piztu.' : ''}` + fig(hasieran(g)),
        erantzuna: piztuak.length, ...oso, unitatea: 'LED',
        pista: m === 2 ? 'Marraztu 5 × 5 sareta bat. Bi lerroek LED bat partekatzen badute, behin bakarrik zenbatzen da.' : 'Bi aldiz aldatzen den LEDa itzalita geratzen da.',
        ebazpena: [...lerroak.map(o => o.s === 'E' ? `y = ${o.k} errenkada` : o.s === 'Z' ? `x = ${o.k} zutabea` : 'diagonala (x = y)'), `Piztuta: ${piztuak.length}`, ledak(new Set(piztuak))]
      };
    }
  },

  analogikoa: {
    izena: 'Seinale analogikoak',
    sortu(m) {
      if (m === 1) {
        const n = randInt(80, 1000), r = n / 1023 * 100;
        return {
          q: `Micro:bit-en pin analogikoek 0 eta 1023 arteko balioak irakurtzen dituzte. Hezetasun-sentsore batek <strong>${n}</strong> irakurtzen badu, zenbat da ehunekotan? (0 = % 0 eta 1023 = % 100)`,
          erantzuna: r, unitatea: '%', hamartarrak: 1, tol: 0.2, pista: 'Ehunekoa = balioa / 1023 × 100', ebazpena: [`${n} / 1023 × 100`, `= % ${fmt(r, 1)}`]
        };
      }
      if (m === 2) {
        const n = randInt(50, 1020), r = n / 1023 * 3.3;
        return {
          q: `Pin analogiko batek 0 eta 3,3 V arteko tentsioa neurtzen du, 0 eta 1023 arteko balioekin. <strong>${n}</strong> irakurtzen bada, zein da pineko tentsioa?`,
          erantzuna: r, unitatea: 'V', hamartarrak: 2, tol: 0.01, pista: 'V = balioa / 1023 × 3,3 V', ebazpena: [`V = ${n} / 1023 × 3,3`, `V = ${fmt(r, 2)} V`]
        };
      }
      const p = pick([20, 25, 30, 35, 40, 45]), r = Math.round(p / 100 * 1023);
      return {
        q: `Ureztatze-sistema batek ponpa piztu behar du lurraren hezetasuna <strong>% ${p}</strong>-tik behera dagoenean. Sentsoreak 0 (lehorra) eta 1023 (bustia) artean ematen du. Zein zenbaki idatzi behar da «baldin» blokeko atalasean?`,
        erantzuna: r, unitatea: '', hamartarrak: 0, tol: 1, pista: 'Alderantzizko kalkulua: balioa = ehunekoa / 100 × 1023', ebazpena: [`${p} / 100 × 1023 = ${fmt(p / 100 * 1023, 2)}`, `≈ ${r}`]
      };
    }
  },

  denbora: {
    izena: 'Denbora eta maiztasuna',
    sortu(m) {
      if (m === 3) {
        const on = pick([50, 100, 125, 200, 250, 500]), off = pick([50, 100, 125, 200, 250, 500]), T = on + off, f = 1000 / T;
        return {
          q: 'LED batek P0 pinean keinu egiten du programa honekin. Zein da keinuaren <strong>maiztasuna</strong>?' + fig(programa([['gertaera', 'betiko', [['pinak', 'idatzi {1} P0 pin digitalean'], ['kontrola', `itxaron {${on}} ms`], ['pinak', 'idatzi {0} P0 pin digitalean'], ['kontrola', `itxaron {${off}} ms`]]]])),
          erantzuna: f, unitatea: 'Hz', hamartarrak: 2, tol: 0.02, pista: 'Periodoa: T = piztuta + itzalita (segundotan). Maiztasuna: f = 1 / T',
          ebazpena: [`T = ${on} + ${off} = ${T} ms = ${fmt(T / 1000, 3)} s`, `f = 1 / ${fmt(T / 1000, 3)} = ${fmt(f, 2)} Hz`]
        };
      }
      let a, c;
      if (m === 1) {
        a = pick([100, 200, 300, 400, 500]);
        c = pick([100, 200, 300, 400, 500]);
      } else {
        const rest = pick([1500, 2000, 2400, 3000, 4000, 5000]) - 1200;
        a = Math.max(100, Math.round(rest * pick([0.25, 0.5, 0.75]) / 100) * 100);
        c = rest - a;
      }
      const tot = 1200 + a + c;
      const prog = fig(programa([['gertaera', 'betiko', [['pantaila', 'erakutsi ikonoa ♥'], ['kontrola', `itxaron {${a}} ms`], ['pantaila', 'erakutsi ikonoa ♡'], ['kontrola', `itxaron {${c}} ms`]]]]));
      if (m === 1) {
        return {
          q: '«erakutsi ikonoa» blokeak <strong>600 ms</strong> irauten du. Zenbat milisegundo irauten du «betiko» blokearen itzuli batek?' + prog,
          erantzuna: tot, ...oso, unitatea: 'ms', pista: 'Batu itzuli bateko bloke guztien denborak.', ebazpena: [`600 + ${a} + 600 + ${c} = ${tot} ms`]
        };
      }
      return {
        q: '«erakutsi ikonoa» blokeak <strong>600 ms</strong> irauten du. Bihotzak zenbat taupada egiten ditu <strong>minutu batean</strong>?' + prog,
        erantzuna: 60000 / tot, ...oso, unitatea: 'taupada', pista: '1 minutu = 60 000 ms. Zatitu itzuli baten iraupenarekin.',
        ebazpena: [`Itzulia: 600 + ${a} + 600 + ${c} = ${tot} ms`, `60 000 / ${tot} = ${fmt(60000 / tot, 2)}`]
      };
    }
  },

  // ---------- osagai elektronikoak ----------
  'led-erresistentzia': {
    izena: 'LEDaren erresistentzia',
    sortu(m) {
      if (m === 3) {
        const [kol, Vf] = pick([['gorri', 1.8], ['berde', 2.1], ['urdin', 3]]), E = pick([5, 9, 12]), R = pick([220, 330, 470, 680, 1000]);
        const I = (E - Vf) / R * 1000;
        return {
          q: `LED ${kol} bat (V<sub>LED</sub> = ${fmt(Vf, 1)} V) <strong>${R} Ω</strong>-eko erresistentzia batekin seriean konektatu da, <strong>${E} V</strong>-eko pila batera. Zenbat korronte pasatzen da?`,
          erantzuna: I, unitatea: 'mA', hamartarrak: 1, tol: Math.max(0.1, I * 0.01),
          pista: 'Erresistentziaren tentsioa E − V_LED da. Gero, Ohm-en legea: I = V / R (eta A → mA, bider 1000).',
          ebazpena: [`V_R = ${E} − ${fmt(Vf, 1)} = ${fmt(E - Vf, 1)} V`, `I = ${fmt(E - Vf, 1)} / ${R} = ${fmt(I / 1000, 4)} A = ${fmt(I, 1)} mA`]
        };
      }
      const Vf = m === 1 ? 2 : pick([1.8, 2.1, 3]), E = pick(m === 1 ? [5, 9, 12] : [5, 6, 9, 12]), I = m === 1 ? 20 : pick([10, 15, 20]);
      const R = (E - Vf) / (I / 1000);
      return {
        q: `LED batek <strong>${fmt(Vf, 1)} V</strong> eta <strong>${I} mA</strong> behar ditu. Zein erresistentzia jarri behar zaio seriean, <strong>${E} V</strong>-eko pila batekin erabiltzeko?`,
        erantzuna: R, unitatea: 'Ω', hamartarrak: 0,
        pista: `Erresistentziak soberan dagoen tentsioa hartzen du (E − V_LED). Pasatu korrontea amperetara: ${I} mA = ${fmt(I / 1000, 3)} A.`,
        ebazpena: [`V_R = ${E} − ${fmt(Vf, 1)} = ${fmt(E - Vf, 1)} V`, `I = ${I} mA = ${fmt(I / 1000, 3)} A`, `R = ${fmt(E - Vf, 1)} / ${fmt(I / 1000, 3)} = ${fmt(R, 0)} Ω`]
      };
    }
  },

  'rc-denbora': {
    izena: 'Kondentsadorearen denbora',
    sortu(m) {
      const R = pick([1, 2.2, 4.7, 10, 22, 47]), C = pick([100, 220, 470, 1000]);
      const tau = R * C / 1000;
      const datuak = `<strong>R = ${fmt(R, 1)} kΩ</strong> eta <strong>C = ${C} µF</strong>`;
      const e1 = `τ = R · C = ${fmt(R * 1000, 0)} Ω · ${fmt(C / 1e6, 6)} F = ${fmt(tau, 3)} s`;
      if (m === 1) return { q: `Kondentsadore bat erresistentzia baten bidez kargatzen da: ${datuak}. Zein da denbora-konstantea, τ?`, erantzuna: tau, unitatea: 's', hamartarrak: 3, pista: 'τ = R · C, ohmetan eta faradetan: 1 kΩ = 1000 Ω eta 1 µF = 0,000 001 F.', ebazpena: [e1] };
      if (m === 2) return { q: `Tenporizadore batean ${datuak} daude. Gutxi gorabehera zenbat denbora behar du kondentsadoreak ia guztiz kargatzeko (5τ)?`, erantzuna: 5 * tau, unitatea: 's', hamartarrak: 2, pista: 'Lehenik τ = R · C; kondentsadorea ia beteta dago 5τ ondoren.', ebazpena: [e1, `5τ = 5 · ${fmt(tau, 3)} = ${fmt(5 * tau, 2)} s`] };
      const E = pick([5, 9, 12]), k = pick([0.5, 1, 2, 3]), t = k * tau, V = E * (1 - Math.exp(-k));
      return {
        q: `Hutsik dagoen kondentsadore bat <strong>${E} V</strong>-eko pila batera konektatzen da, ${datuak} direla. Zein tentsio du <strong>${fmt(t, 3)} s</strong> ondoren?`,
        erantzuna: V, unitatea: 'V', hamartarrak: 2, tol: 0.05,
        pista: 'V(t) = E · (1 − e^(−t/τ)). Kalkulatu lehenik τ eta t/τ.',
        ebazpena: [e1, `t / τ = ${fmt(t, 3)} / ${fmt(tau, 3)} = ${fmt(k, 1)}`, `V = ${E} · (1 − e^−${fmt(k, 1)}) = ${E} · ${fmt(1 - Math.exp(-k), 3)} = ${fmt(V, 2)} V`]
      };
    }
  },

  transistorea: {
    izena: 'Transistorea',
    sortu(m) {
      if (m === 1) {
        const b = pick([100, 150, 200, 250]), Ib = pick([0.1, 0.2, 0.4, 0.5]), Ic = b * Ib;
        return { q: `Transistore batek β = <strong>${b}</strong> korronte-irabazia du, eta oinarritik <strong>${fmt(Ib, 1)} mA</strong> sartzen dira. Zenbat korronte pasatzen da kolektoretik (eskualde aktiboan)?`, erantzuna: Ic, unitatea: 'mA', hamartarrak: 0, pista: 'Kolektoreko korrontea oinarrikoa bider β da.', ebazpena: [`I_C = β · I_B = ${b} · ${fmt(Ib, 1)} = ${fmt(Ic, 0)} mA`] };
      }
      const Ic = pick([100, 150, 200, 300, 500]), b = pick([50, 100, 150, 200]), Ib = Ic / b;
      if (m === 2) return { q: `Motor batek <strong>${Ic} mA</strong> behar ditu, eta transistoreak β = <strong>${b}</strong> du. Gutxienez zenbat korronte behar da oinarrian?`, erantzuna: Ib, unitatea: 'mA', hamartarrak: 2, pista: 'I_C = β · I_B denez, I_B = I_C / β.', ebazpena: [`I_B = ${Ic} / ${b} = ${fmt(Ib, 2)} mA`] };
      const Vin = pick([3.3, 5]), Rb = (Vin - 0.7) / Ib;
      return {
        q: `<strong>${fmt(Vin, 1)} V</strong>-eko pin batek transistore bat kontrolatzen du (V<sub>BE</sub> = 0,7 V, β = <strong>${b}</strong>). Motorrak <strong>${Ic} mA</strong> behar ditu. Zein da oinarriko erresistentziaren balio maximoa?`,
        erantzuna: Rb, unitatea: 'kΩ', hamartarrak: 2,
        pista: 'Lehenik I_B = I_C / β. Gero R_B = (V_in − 0,7) / I_B; voltak eta miliampereak erabiliz, emaitza kΩ-etan dago.',
        ebazpena: [`I_B = ${Ic} / ${b} = ${fmt(Ib, 3)} mA`, `R_B = (${fmt(Vin, 1)} − 0,7) / ${fmt(Ib, 3)} = ${fmt(Rb, 2)} kΩ`]
      };
    }
  },

  // ---------- sistema bitarra ----------
  bitarretik: {
    izena: 'Bitarretik hamartarrera',
    sortu(m) {
      const N = m === 1 ? 4 : m === 2 ? 8 : 12;
      const v = randInt(m === 1 ? 3 : m === 2 ? 17 : 260, 2 ** N - 1);
      const b = v.toString(2).padStart(N, '0');
      const piztuak = [...b].map((c, i) => c === '1' ? 2 ** (N - 1 - i) : 0).filter(Boolean);
      return {
        q: `Zein zenbaki hamartar da <strong class="ex-bin">${b}₂</strong>?`,
        erantzuna: v, ...oso,
        pista: 'Idatzi bit bakoitzaren gainean bere pisua (eskuinetik ezkerrera: 1, 2, 4, 8, 16…) eta batu 1 duten bitenak.',
        ebazpena: [...(N <= 8 ? [`Pisuak: ${[...b].map((c, i) => `${c}·${2 ** (N - 1 - i)}`).join(' + ')}`] : []), `${piztuak.join(' + ')} = ${v}`]
      };
    }
  },

  hamartarretik: {
    izena: 'Hamartarretik bitarrera',
    sortu(m) {
      const v = m === 1 ? randInt(5, 15) : m === 2 ? randInt(17, 255) : randInt(260, 1023);
      const b = v.toString(2), eb = [];
      for (let x = v; x > 0; x = Math.floor(x / 2)) eb.push(`${x} : 2 = ${Math.floor(x / 2)}, hondarra ${x % 2}`);
      eb.push(`Hondarrak behetik gora: ${b}₂`);
      return {
        q: `Idatzi <strong>${v}</strong> zenbakia oinarri bitarrean (0 eta 1 digituekin).`,
        erantzuna: Number(b), unitatea: '₂', zehatza: true, hamartarrak: 0,
        pista: 'Zatitu 2z behin eta berriz eta idatzi hondarrak; gero irakurri behetik gora. Edo bilatu sartzen den 2ren berretura handiena eta kendu.',
        ebazpena: eb
      };
    }
  },

  informazioa: {
    izena: 'Bitak eta byteak',
    sortu(m) {
      if (m === 1) {
        const n = randInt(2, 8);
        return { q: `Zenbat balio desberdin adieraz daitezke <strong>${n} bit</strong>ekin?`, erantzuna: 2 ** n, ...oso, pista: 'Bit bakoitzak aukerak bikoiztu egiten ditu: 2 · 2 · 2…', ebazpena: [`2<sup>${n}</sup> = ${2 ** n}`] };
      }
      if (m === 2) {
        const [N, zer] = pick([[randInt(20, 60), 'ikasle'], [randInt(100, 250), 'kolore'], [randInt(9, 30), 'gela'], [randInt(300, 1000), 'produktu']]);
        const b = Math.ceil(Math.log2(N));
        return { q: `<strong>${N} ${zer}</strong> identifikatu nahi dira, bakoitza zenbaki bitar desberdin batekin. Gutxienez zenbat bit behar dira?`, erantzuna: b, ...oso, pista: 'Bilatu kopurua bera edo handiagoa den 2ren berretura txikiena.', ebazpena: [`2<sup>${b - 1}</sup> = ${2 ** (b - 1)} < ${N}`, `2<sup>${b}</sup> = ${2 ** b} ≥ ${N} → ${b} bit`] };
      }
      const [w, h] = pick([[320, 240], [640, 480], [800, 600], [1024, 768], [1280, 720]]), byte = pick([1, 3]);
      const KB = w * h * byte / 1024;
      return {
        q: `Konprimitu gabeko irudi batek <strong>${w} × ${h}</strong> pixel ditu, eta pixel bakoitzak <strong>${byte === 1 ? 'byte 1' : '3 byte'}</strong> behar ${byte === 1 ? 'du (grisak)' : 'ditu (RGB koloreak)'}. Zenbat KB betetzen ditu? (1 KB = 1024 byte)`,
        erantzuna: KB, unitatea: 'KB', hamartarrak: 1,
        pista: 'Pixel-kopurua bider pixel bakoitzeko byteak; gero zatitu 1024z.',
        ebazpena: [`${w} · ${h} = ${milaka(w * h)} pixel`, `${milaka(w * h)} · ${byte} = ${milaka(w * h * byte)} byte`, `${milaka(w * h * byte)} / 1024 = ${fmt(KB, 1)} KB`]
      };
    }
  },

  // ---------- ate logikoak eta diseinu logikoa ----------
  'ate-irteera': {
    izena: 'Zirkuitu logiko baten irteera',
    sortu(m) {
      const t = logAdierazpena(m), vars = logAldagaiak(t);
      const v = Object.fromEntries(vars.map(k => [k, Math.random() < 0.5]));
      const eb = [vars.map(k => `${k} = ${+v[k]}`).join(', ')];
      const bisitatu = u => { if (typeof u === 'string') return; u.slice(1).forEach(bisitatu); eb.push(`${logHTML(u)} = ${+logEval(u, v)}`); };
      bisitatu(t);
      return {
        q: `Zein da irteeraren balioa (0 edo 1)?<div class="formula ex-log">Q = ${logHTML(t)}</div><p class="ex-sar">${vars.map(k => `<strong>${k} = ${+v[k]}</strong>`).join(' · ')}</p>`,
        erantzuna: +logEval(t, v), ...oso,
        pista: 'Kalkulatu barrutik kanpora: lehenik parentesiak eta ezeztapenak (goiko marra), gero ETA (·) eta azkenik EDO (+).',
        ebazpena: eb
      };
    }
  },

  'egia-taula-batak': {
    izena: 'Egia-taula',
    sortu(m) {
      const t = logAdierazpena(m), vars = logAldagaiak(t), n = vars.length, batak = [];
      for (let k = 0; k < 2 ** n; k++) {
        const v = Object.fromEntries(vars.map((x, i) => [x, !!(k >> (n - 1 - i) & 1)]));
        if (logEval(t, v)) batak.push(k.toString(2).padStart(n, '0'));
      }
      return {
        q: `Egin adierazpen honen egia-taula. Zenbat errenkadatan da <strong>Q = 1</strong>?<div class="formula ex-log">Q = ${logHTML(t)}</div>`,
        erantzuna: batak.length, ...oso,
        pista: `${n} aldagai → ${2 ** n} errenkada. Idatzi konbinazio guztiak ordena bitarrean (${'0'.repeat(n)}, ${'0'.repeat(n - 1)}1…) eta kalkulatu Q bakoitzean.`,
        ebazpena: [`${vars.join('')}: ${2 ** n} errenkada`, batak.length ? `Q = 1: ${batak.join(', ')}` : 'Ez dago Q = 1 duen errenkadarik', `${batak.length} errenkada`]
      };
    }
  },

  errenkadak: {
    izena: 'Konbinazioak',
    sortu(m) {
      if (m === 3) {
        const n = pick([1, 2, 3]), F = 2 ** (2 ** n);
        return { q: `Zenbat funtzio logiko desberdin daude <strong>${n}</strong> sarrerarekin? (Funtzio bakoitza egia-taulako Q zutabe desberdin bat da.)`, erantzuna: F, ...oso, pista: 'Lehenik kalkulatu errenkada-kopurua; gero, errenkada bakoitzean Q 0 edo 1 izan daiteke.', ebazpena: [`Errenkadak: 2<sup>${n}</sup> = ${2 ** n}`, `Q zutabe posibleak: 2<sup>${2 ** n}</sup> = ${milaka(F)}`] };
      }
      const n = m === 1 ? randInt(2, 4) : randInt(5, 8);
      return { q: `Zirkuitu logiko batek <strong>${n} sarrera</strong> ditu (sentsoreak eta etengailuak). Zenbat errenkada ditu bere egia-taulak?`, erantzuna: 2 ** n, ...oso, pista: 'Sarrera bakoitzak 2 balio ditu, eta sarrera bat gehitzean konbinazioak bikoiztu egiten dira.', ebazpena: [`2<sup>${n}</sup> = ${2 ** n}`] };
    }
  },

  'karnaugh-terminoak': {
    izena: 'Karnaugh-en mapa',
    sortu(m) {
      const n = m === 1 ? 2 : m === 2 ? 3 : 4;
      let bat, S;
      do {
        bat = Array.from({ length: 2 ** n }, (_, k) => k).filter(() => Math.random() < 0.45);
        S = sinplifikatu(n, bat);
      } while (bat.length < 2 || bat.length > 2 ** n - 2 || S.terminoak.length < (n === 2 ? 1 : 2));
      const T = S.terminoak.length;
      return {
        q: `Funtzio logiko baten forma kanonikoa <strong>Q = Σm(${bat.join(', ')})</strong> da (${n} aldagai: ${['A', 'B', 'C', 'D'].slice(0, n).join(', ')}; A da bit esanguratsuena). Karnaugh-en mapa batekin sinplifikatuz gero, zenbat termino (biderkadura) ditu adierazpen minimoak?`,
        erantzuna: T, ...oso,
        pista: 'Kokatu 1ekoak mapan (Gray ordena: 00, 01, 11, 10). Egin ahalik eta talde handienak (1, 2, 4 edo 8 gelaxka) eta ahalik eta talde gutxien. Talde bakoitza termino bat da.',
        ebazpena: [`${bat.length} mintermino`, 'Q = ' + S.terminoak.map(t => terminoHTML(n, t)).join(' + '), `${T} termino`]
      };
    }
  },

  biegonkorra: {
    izena: 'RS biegonkorra',
    sortu(m) {
      const n = m === 1 ? 3 : m === 2 ? 5 : 7;
      const aukerak = m === 1 ? [[1, 0], [0, 1]] : [[1, 0], [0, 1], [0, 0]];
      const hasiera = pick([0, 1]), seq = [], eb = [`Hasieran Q = ${hasiera}`];
      let q = hasiera;
      for (let i = 0; i < n; i++) {
        const [S, R] = pick(aukerak);
        seq.push([S, R]);
        if (S) q = 1; else if (R) q = 0;
        eb.push(`${i + 1}. S = ${S}, R = ${R} → ${S ? 'ezarri' : R ? 'berrezarri' : 'memoria'}: Q = ${q}`);
      }
      const taula = `<div class="table-scroll"><table class="ex-rs"><tr><th></th>${seq.map((_, i) => `<th>${i + 1}.</th>`).join('')}</tr><tr><th>S</th>${seq.map(r => `<td>${r[0]}</td>`).join('')}</tr><tr><th>R</th>${seq.map(r => `<td>${r[1]}</td>`).join('')}</tr></table></div>`;
      return {
        q: `RS biegonkor batek hasieran Q = <strong>${hasiera}</strong> du. Sarrerak ordena honetan aldatzen dira. Zein da Q-ren balioa azkenean?${taula}`,
        erantzuna: q, ...oso,
        pista: 'S = 1 → Q = 1 (ezarri); R = 1 → Q = 0 (berrezarri); biak 0 → Q-k aurreko balioari eusten dio.',
        ebazpena: eb
      };
    }
  },

  // ---------- pneumatika ----------
  'pn-indarra': {
    izena: 'Zilindroaren indarra',
    sortu(m) {
      const p = pick([4, 5, 6, 7, 8]), D = pick([20, 25, 32, 40, 50, 63]);
      const A = Math.PI * D * D / 4;
      if (m === 1) {
        const F = p * 0.1 * A;
        return { q: `Zilindro baten enboloak <strong>${D} mm</strong>-ko diametroa du, eta <strong>${p} bar</strong>-eko presioarekin lan egiten du. Zein indarrarekin egiten du aurrera?`, erantzuna: F, unitatea: 'N', hamartarrak: 0, pista: 'A = π · D² / 4 (mm²), eta 1 bar = 0,1 N/mm². F = p · A.', ebazpena: [`A = π · ${D}² / 4 = ${fmt(A, 1)} mm²`, `p = ${p} bar = ${fmt(p * 0.1, 1)} N/mm²`, `F = ${fmt(p * 0.1, 1)} · ${fmt(A, 1)} = ${fmt(F, 0)} N`] };
      }
      if (m === 2) {
        const d = { 20: 8, 25: 10, 32: 12, 40: 16, 50: 20, 63: 20 }[D], Aat = A - Math.PI * d * d / 4, F = p * 0.1 * Aat;
        return { q: `Efektu bikoitzeko zilindro batek D = <strong>${D} mm</strong>-ko enboloa eta d = <strong>${d} mm</strong>-ko zurtoina ditu. <strong>${p} bar</strong>-ekin, zein indarrarekin egiten du <strong>atzera</strong>?`, erantzuna: F, unitatea: 'N', hamartarrak: 0, pista: 'Atzera egitean, aireak ez du zurtoinaren azalera bultzatzen: A = π · (D² − d²) / 4.', ebazpena: [`A = π · (${D}² − ${d}²) / 4 = ${fmt(Aat, 1)} mm²`, `F = ${fmt(p * 0.1, 1)} · ${fmt(Aat, 1)} = ${fmt(F, 0)} N`] };
      }
      const F = pick([500, 800, 1000, 1500, 2000]), Dmin = Math.sqrt(4 * F / (0.9 * p * 0.1 * Math.PI));
      const hurrengoa = [20, 25, 32, 40, 50, 63, 80, 100, 125].find(x => x >= Dmin);
      return {
        q: `Prentsa batek <strong>${F} N</strong>-eko indarra behar du, <strong>${p} bar</strong>-eko presioarekin. Marruskaduran indarraren % 10 galtzen da (η = 0,9). Zein da enboloaren gutxieneko diametroa?`,
        erantzuna: Dmin, unitatea: 'mm', hamartarrak: 1,
        pista: 'F = η · p · π · D² / 4. Bakandu D, presioa N/mm²-tan jarrita.',
        ebazpena: ['D = √(4 · F / (η · p · π))', `D = √(4 · ${F} / (0,9 · ${fmt(p * 0.1, 1)} · π)) = ${fmt(Dmin, 1)} mm`, `Merkataritzako hurrengo neurria: ${hurrengoa} mm`]
      };
    }
  },

  'pn-kontsumoa': {
    izena: 'Aire-kontsumoa',
    sortu(m) {
      const D = pick([2, 2.5, 3.2, 4, 5]), L = pick([10, 15, 20, 25]), d = { 2: 0.8, 2.5: 1, 3.2: 1.2, 4: 1.6, 5: 2 }[D];
      const A = Math.PI * D * D / 4;
      if (m === 1) {
        const V = A * L;
        return { q: `Efektu bakuneko zilindro batek <strong>${fmt(D, 1)} cm</strong>-ko diametroa eta <strong>${L} cm</strong>-ko ibilbidea ditu. Zenbat aire (presiopean) behar du aurrera egiteko?`, erantzuna: V, unitatea: 'cm³', hamartarrak: 1, pista: 'Zilindroaren bolumena: V = A · L = π · D² / 4 · L.', ebazpena: [`A = π · ${fmt(D, 1)}² / 4 = ${fmt(A, 2)} cm²`, `V = ${fmt(A, 2)} · ${L} = ${fmt(V, 1)} cm³`] };
      }
      const Aat = A - Math.PI * d * d / 4, Vz = (A + Aat) * L;
      const lehen = [`A = π · ${fmt(D, 1)}² / 4 = ${fmt(A, 2)} cm²`, `A' = π · (${fmt(D, 1)}² − ${fmt(d, 1)}²) / 4 = ${fmt(Aat, 2)} cm²`, `V = (${fmt(A, 2)} + ${fmt(Aat, 2)}) · ${L} = ${fmt(Vz, 1)} cm³`];
      const datuak = `D = <strong>${fmt(D, 1)} cm</strong>, zurtoina d = <strong>${fmt(d, 1)} cm</strong> eta ibilbidea L = <strong>${L} cm</strong>`;
      if (m === 2) return { q: `Efektu bikoitzeko zilindro batek ${datuak} ditu. Zenbat aire (presiopean) behar du ziklo oso batean (aurrera eta atzera)?`, erantzuna: Vz, unitatea: 'cm³', hamartarrak: 1, pista: 'Aurrera: A · L. Atzera: (A − zurtoinaren azalera) · L. Batu biak.', ebazpena: lehen };
      const p = pick([5, 6, 7]), n = pick([10, 15, 20, 30]), Vl = Vz * n * (p + 1) / 1000;
      return {
        q: `Efektu bikoitzeko zilindro batek ${datuak} ditu, eta minutuko <strong>${n} ziklo</strong> egiten ditu <strong>${p} bar</strong>-ekin. Zenbat aire libre (atmosferikoa) kontsumitzen du minutuko? (Hartu p<sub>abs</sub> = p + 1 bar.)`,
        erantzuna: Vl, unitatea: 'L/min', hamartarrak: 2,
        pista: 'Kalkulatu ziklo baten bolumena, bider ziklo-kopurua; aire konprimitua atmosferako (p + 1) aldiz bolumen handiagoa da. 1 L = 1000 cm³.',
        ebazpena: [...lehen, `${fmt(Vz, 1)} · ${n} · (${p} + 1) = ${milaka(Math.round(Vz * n * (p + 1)))} cm³`, `= ${fmt(Vl, 2)} L/min`]
      };
    }
  },

  'pn-sekuentzia': {
    izena: 'Sekuentzien denbora',
    sortu(m) {
      const t = pick([0.5, 0.8, 1, 1.2, 1.5]);
      if (m === 1) return { q: `A+ B+ A− B− sekuentzian mugimendu bakoitzak <strong>${fmt(t, 1)} s</strong> irauten du. Zenbat irauten du ziklo osoak?`, erantzuna: 4 * t, unitatea: 's', hamartarrak: 1, pista: 'Zenbatu mugimenduak eta biderkatu.', ebazpena: [`4 mugimendu · ${fmt(t, 1)} s = ${fmt(4 * t, 1)} s`] };
      const pausa = pick([1, 2, 3]);
      if (m === 2) {
        const T = 4 * t + pausa, N = Math.floor(3600 / T);
        return { q: `A+ B+ A− B− sekuentzian mugimendu bakoitzak <strong>${fmt(t, 1)} s</strong> irauten du, eta ziklo bakoitzaren amaieran <strong>${pausa} s</strong>-ko pausa dago pieza aldatzeko. Gehienez zenbat pieza oso egiten dira ordu batean?`, erantzuna: N, ...oso, unitatea: 'pieza', pista: 'Zikloa: mugimenduak + pausa. Ordu batean 3600 s daude.', ebazpena: [`Zikloa: 4 · ${fmt(t, 1)} + ${pausa} = ${fmt(T, 1)} s`, `3600 / ${fmt(T, 1)} = ${fmt(3600 / T, 2)} → ${N} pieza`] };
      }
      const helburua = pick([600, 720, 900, 1200]), p2 = pick([1, 2]), Tmax = 3600 / helburua, tmax = (Tmax - p2) / 4;
      return {
        q: `Orduko <strong>${helburua} pieza</strong> egin behar dira A+ B+ A− B− sekuentzia batekin. Ziklo bakoitzaren amaieran <strong>${p2} s</strong>-ko pausa dago. Gehienez zenbat iraun dezake mugimendu bakoitzak (denak berdinak)?`,
        erantzuna: tmax, unitatea: 's', hamartarrak: 2,
        pista: 'Kalkulatu ziklo baten gehieneko denbora (3600 / pieza-kopurua), kendu pausa eta banatu lau mugimenduen artean.',
        ebazpena: [`T = 3600 / ${helburua} = ${fmt(Tmax, 2)} s`, `Mugimenduak: ${fmt(Tmax, 2)} − ${p2} = ${fmt(Tmax - p2, 2)} s`, `t = ${fmt(Tmax - p2, 2)} / 4 = ${fmt(tmax, 2)} s`]
      };
    }
  },

  // ---------- sentsoreak eta eragingailuak ----------
  adc: {
    izena: 'Seinale analogikoak (ADC)',
    sortu(m) {
      if (m === 1) {
        const V = pick([1, 1.5, 2, 2.5, 3, 4, 4.5]), n = Math.round(V / 5 * 1023);
        return { q: `Arduinoren pin analogiko batek <strong>${fmt(V, 1)} V</strong> jasotzen ditu. Zein balio itzultzen du <code>analogRead</code>-ek? (0 V → 0, 5 V → 1023)`, erantzuna: n, unitatea: '', hamartarrak: 0, tol: 1, pista: 'Balioa tentsioarekiko proportzionala da: n = V / 5 · 1023.', ebazpena: [`n = ${fmt(V, 1)} / 5 · 1023 = ${fmt(V / 5 * 1023, 1)} → ${n}`] };
      }
      if (m === 2) {
        const n = randInt(50, 1000), V = n * 5 / 1023;
        return { q: `<code>analogRead</code>-ek <strong>${n}</strong> itzuli du. Zein da pineko tentsioa?`, erantzuna: V, unitatea: 'V', hamartarrak: 2, tol: 0.01, pista: 'V = n / 1023 · 5 V', ebazpena: [`V = ${n} / 1023 · 5 = ${fmt(V, 3)} V`] };
      }
      const Rs = pick([2.2, 4.7, 15, 22, 33, 47]), V = 5 * 10 / (Rs + 10), n = Math.round(V / 5 * 1023);
      return {
        q: `LDR bat tentsio-zatitzaile batean dago: LDRa goian (orain <strong>${fmt(Rs, 1)} kΩ</strong>) eta 10 kΩ-eko erresistentzia behean, 5 V-ra lotuta. Erdiko puntua A0 pinera doa. Zein balio irakurriko du <code>analogRead(A0)</code>-k?`,
        erantzuna: n, unitatea: '', hamartarrak: 0, tol: 2,
        pista: 'Lehenik zatitzailearen tentsioa: V = 5 · 10 / (R_LDR + 10). Gero n = V / 5 · 1023.',
        ebazpena: [`V = 5 · 10 / (${fmt(Rs, 1)} + 10) = ${fmt(V, 3)} V`, `n = ${fmt(V, 3)} / 5 · 1023 = ${n}`]
      };
    }
  },

  pwm: {
    izena: 'PWM eta servoak',
    sortu(m) {
      if (m === 1) {
        const d = pick([10, 20, 25, 40, 50, 60, 75, 80, 90]);
        return { q: `PWM seinale batek <strong>% ${d}</strong>-eko lan-zikloa du, 5 V-ko pin batean. Zein da batez besteko tentsioa?`, erantzuna: 5 * d / 100, unitatea: 'V', hamartarrak: 2, pista: 'Batez besteko tentsioa = lan-zikloa · 5 V.', ebazpena: [`V = ${d} / 100 · 5 = ${fmt(5 * d / 100, 2)} V`] };
      }
      if (m === 2) {
        const v = randInt(10, 250), V = v / 255 * 5;
        return { q: `<code>analogWrite(9, ${v})</code> aginduak zein batez besteko tentsio ematen du 9 pinean?`, erantzuna: V, unitatea: 'V', hamartarrak: 2, tol: 0.02, pista: 'analogWrite-ren balioa 0 (% 0) eta 255 (% 100) artean dago.', ebazpena: [`Lan-zikloa: ${v} / 255 = % ${fmt(v / 255 * 100, 1)}`, `V = ${fmt(v / 255, 3)} · 5 = ${fmt(V, 2)} V`] };
      }
      if (Math.random() < 0.5) {
        const a = pick([0, 30, 45, 60, 90, 120, 135, 150, 180]), pw = 1 + a / 180;
        return { q: `Servo batek 1 ms-ko pultsuarekin 0° eta 2 ms-koarekin 180° hartzen ditu. Zein pultsu behar da <strong>${a}°</strong>-ra mugitzeko?`, erantzuna: pw, unitatea: 'ms', hamartarrak: 3, tol: 0.005, pista: 'Lineala da: t = 1 ms + angelua / 180° · 1 ms.', ebazpena: [`t = 1 + ${a} / 180 = ${fmt(pw, 3)} ms`] };
      }
      const pw = pick([1.1, 1.25, 1.4, 1.6, 1.75, 1.9]), a = (pw - 1) * 180;
      return { q: `Servo bati <strong>${fmt(pw, 2)} ms</strong>-ko pultsuak bidaltzen zaizkio (1 ms → 0°, 2 ms → 180°). Zein angelutan jartzen da?`, erantzuna: a, unitatea: '°', hamartarrak: 0, tol: 0.5, pista: 'Angelua = (t − 1 ms) · 180°.', ebazpena: [`(${fmt(pw, 2)} − 1) · 180 = ${fmt(a, 0)}°`] };
    }
  },

  ultrasoinua: {
    izena: 'Ultrasoinu-sentsorea',
    sortu(m) {
      if (m === 1) {
        const t = pick([580, 1160, 1750, 2900, 4060, 5830]), d = t * 0.0343 / 2;
        return { q: `Ultrasoinu-sentsore batek <strong>${milaka(t)} µs</strong> neurtu ditu oihartzuna itzuli arte. Zein distantziatara dago oztopoa? (Soinua: 343 m/s = 0,0343 cm/µs)`, erantzuna: d, unitatea: 'cm', hamartarrak: 1, pista: 'Soinuak joan-etorria egiten du: distantzia = abiadura · denbora / 2.', ebazpena: [`d = 0,0343 · ${milaka(t)} / 2 = ${fmt(d, 1)} cm`] };
      }
      if (m === 2) {
        const d = randInt(5, 250), t = 2 * d / 0.0343;
        return { q: `Robot baten aurrean, <strong>${d} cm</strong>-ra, horma bat dago. Zenbat mikrosegundo behar ditu ultrasoinu-pultsuak joan eta itzultzeko?`, erantzuna: t, unitatea: 'µs', hamartarrak: 0, tol: Math.max(2, t * 0.01), pista: 't = 2 · d / v, eta v = 0,0343 cm/µs.', ebazpena: [`t = 2 · ${d} / 0,0343 = ${fmt(t, 0)} µs`] };
      }
      const T = pick([0, 10, 30, 35]), t = pick([2000, 3000, 5000]), v = 331.3 + 0.606 * T, d = v * t * 1e-6 / 2 * 100;
      return {
        q: `Soinuaren abiadura tenperaturaren araberakoa da: v = 331,3 + 0,606 · T (m/s). <strong>${T} °C</strong>-an, oihartzunak <strong>${milaka(t)} µs</strong> behar ditu. Zein da distantzia?`,
        erantzuna: d, unitatea: 'cm', hamartarrak: 1,
        pista: 'Kalkulatu v, eta erabili d = v · t / 2 (t segundotan); gero pasatu cm-ra.',
        ebazpena: [`v = 331,3 + 0,606 · ${T} = ${fmt(v, 1)} m/s`, `d = ${fmt(v, 1)} · ${fmt(t * 1e-6, 4)} / 2 = ${fmt(d / 100, 4)} m = ${fmt(d, 1)} cm`]
      };
    }
  },

  // ---------- kontrol-sistemak ----------
  'kontrol-errorea': {
    izena: 'Kontrol-sistemak',
    sortu(m) {
      if (m === 1) {
        const sp = pick([19, 20, 21, 22, 23]), Tt = randInt(12, 26) + pick([0, 0.5]), e = sp - Tt;
        return { q: `Termostato baten konsigna <strong>${sp} °C</strong> da eta sentsoreak <strong>${fmt(Tt, 1)} °C</strong> neurtzen ditu. Zein da errorea (konsigna − neurketa)?`, erantzuna: e, unitatea: '°C', hamartarrak: 1, tol: 0.05, pista: 'Errorea = nahi dena − dagoena. Negatiboa bada, beroegi dago.', ebazpena: [`e = ${sp} − ${fmt(Tt, 1)} = ${fmt(e, 1)} °C`] };
      }
      if (m === 2) {
        const sp = pick([20, 21, 22]), h = pick([1, 2, 3]), piztu = Math.random() < 0.5, v = piztu ? sp - h / 2 : sp + h / 2;
        return { q: `Termostato baten konsigna <strong>${sp} °C</strong> da, eta histeresia <strong>${h} °C</strong> (konsignaren inguruko tarte osoa). Zein tenperaturatan <strong>${piztu ? 'pizten' : 'itzaltzen'}</strong> da berogailua?`, erantzuna: v, unitatea: '°C', hamartarrak: 1, tol: 0.05, pista: 'Tartea konsignaren bi aldeetara banatzen da: erdia behean eta erdia goian.', ebazpena: [`h / 2 = ${fmt(h / 2, 1)} °C`, `${piztu ? 'Piztu' : 'Itzali'}: ${sp} ${piztu ? '−' : '+'} ${fmt(h / 2, 1)} = ${fmt(v, 1)} °C`] };
      }
      const kp = pick([10, 20, 25, 40, 50]), Tt = pick([17, 18, 18.5, 19, 20, 20.5]), e = 21 - Tt, u = Math.min(100, kp * e);
      return {
        q: `Kontrolagailu proportzional batek u = Kp · e erabiltzen du, Kp = <strong>${kp} %/°C</strong> dela (gehienez % 100). Konsigna 21 °C da eta gela <strong>${fmt(Tt, 1)} °C</strong>-an dago. Zenbat potentzia ematen dio berogailuari?`,
        erantzuna: u, unitatea: '%', hamartarrak: 1, tol: 0.1,
        pista: 'Kalkulatu errorea eta biderkatu Kp-z. % 100 gainditzen badu, % 100 da.',
        ebazpena: [`e = 21 − ${fmt(Tt, 1)} = ${fmt(e, 1)} °C`, `u = ${kp} · ${fmt(e, 1)} = ${fmt(kp * e, 1)} %${kp * e > 100 ? ' → % 100 (muga)' : ''}`]
      };
    }
  },

  'berotze-energia': {
    izena: 'Energia eta kostua',
    sortu(m) {
      const P = pick([1, 1.5, 2, 2.5]);
      if (m === 1) {
        const h = pick([2, 3, 4, 5, 6]);
        return { q: `<strong>${fmt(P, 1)} kW</strong>-eko berogailu bat <strong>${h} orduz</strong> piztuta egon da. Zenbat energia kontsumitu du?`, erantzuna: P * h, unitatea: 'kWh', hamartarrak: 2, pista: 'E = P · t (kW · h = kWh).', ebazpena: [`E = ${fmt(P, 1)} · ${h} = ${fmt(P * h, 2)} kWh`] };
      }
      if (m === 2) {
        const h = pick([4, 6, 8]), prezioa = pick([0.12, 0.15, 0.18, 0.2]), k = P * h * prezioa * 30;
        return { q: `<strong>${fmt(P, 1)} kW</strong>-eko berogailu batek egunean <strong>${h} ordu</strong> lan egiten du, eta energiak <strong>${fmt(prezioa, 2)} €/kWh</strong> balio du. Zenbat kostatzen da hilabetea (30 egun)?`, erantzuna: k, unitatea: '€', hamartarrak: 2, pista: 'Eguneko energia, bider prezioa, bider 30.', ebazpena: [`E = ${fmt(P, 1)} · ${h} = ${fmt(P * h, 1)} kWh egunean`, `${fmt(P * h, 1)} · ${fmt(prezioa, 2)} · 30 = ${fmt(k, 2)} €`] };
      }
      const on = pick([6, 8, 10, 12]), off = pick([10, 14, 18, 20]), d = on / (on + off), E = P * 24 * d;
      return {
        q: `Termostato batek berogailua <strong>${on} minutuz</strong> pizten du eta <strong>${off} minutuz</strong> itzali, behin eta berriz. <strong>${fmt(P, 1)} kW</strong>-eko berogailua bada, zenbat energia kontsumitzen du 24 ordutan?`,
        erantzuna: E, unitatea: 'kWh', hamartarrak: 2,
        pista: 'Kalkulatu zer denbora-zatitan dagoen piztuta (lan-zikloa), eta biderkatu P · 24 h-rekin.',
        ebazpena: [`Lan-zikloa: ${on} / (${on} + ${off}) = % ${fmt(d * 100, 1)}`, `E = ${fmt(P, 1)} · 24 · ${fmt(d, 3)} = ${fmt(E, 2)} kWh`]
      };
    }
  },

  // ---------- Arduino ----------
  'map-funtzioa': {
    izena: 'map() funtzioa',
    sortu(m) {
      const mapa = (v, a, b, c, d) => Math.trunc((v - a) * (d - c) / (b - a) + c);
      if (m === 1) {
        const v = pick([0, 256, 341, 512, 682, 767, 1023]), r = mapa(v, 0, 1023, 0, 255);
        return { q: `Zer itzultzen du <code>map(${v}, 0, 1023, 0, 255)</code> funtzioak? (Arduinok zati hamartarra baztertzen du.)`, erantzuna: r, ...oso, pista: 'Proportzio bat da: v · 255 / 1023.', ebazpena: [`${v} · 255 / 1023 = ${fmt(v * 255 / 1023, 2)} → ${r}`] };
      }
      if (m === 2) {
        const v = randInt(0, 1023), r = mapa(v, 0, 1023, 0, 180);
        return { q: `Potentziometro batek <strong>${v}</strong> irakurtzen du. Programak <code>servoa.write(map(balioa, 0, 1023, 0, 180))</code> egiten du. Zein angelutan jartzen da servoa?`, erantzuna: r, unitatea: '°', hamartarrak: 0, tol: 1, pista: 'v · 180 / 1023, zati hamartarrik gabe.', ebazpena: [`${v} · 180 / 1023 = ${fmt(v * 180 / 1023, 2)} → ${r}°`] };
      }
      const helb = pick([64, 100, 128, 200]), v = Math.ceil(helb * 1023 / 255);
      return {
        q: `<code>analogWrite(9, map(balioa, 0, 1023, 0, 255))</code> programan, zein da gutxieneko <code>analogRead</code> balioa LEDak <strong>${helb}</strong> jaso dezan?`,
        erantzuna: v, unitatea: '', hamartarrak: 0, tol: 1,
        pista: 'Alderantzizko proportzioa: balioa = emaitza · 1023 / 255. Zati hamartarra baztertzen denez, biribildu gora.',
        ebazpena: [`${helb} · 1023 / 255 = ${fmt(helb * 1023 / 255, 2)} → ${v}`]
      };
    }
  },

  'arduino-denbora': {
    izena: 'Denbora eta maiztasuna',
    sortu(m) {
      if (m === 1) {
        const a = pick([100, 200, 250, 500, 1000]), b = pick([100, 250, 500, 1000]);
        return { q: `LED batek keinu egiten du <code>loop</code> honekin: <code>digitalWrite(13, HIGH); delay(${a}); digitalWrite(13, LOW); delay(${b});</code>. Zenbat keinu egiten ditu <strong>minutu batean</strong>?`, erantzuna: 60000 / (a + b), unitatea: 'keinu', hamartarrak: 1, pista: 'Itzuli bat: bi delay-ak batuta. Minutu batean 60 000 ms daude.', ebazpena: [`Itzulia: ${a} + ${b} = ${a + b} ms`, `60 000 / ${a + b} = ${fmt(60000 / (a + b), 1)} keinu`] };
      }
      if (m === 2) {
        const g = pick([2000, 3000, 4000]), h = pick([500, 1000]), r = pick([2000, 3000]), T = g + h + r;
        return { q: `Semaforo baten <code>loop</code>-ak berdea <strong>${g} ms</strong>, horia <strong>${h} ms</strong> eta gorria <strong>${r} ms</strong> pizten ditu. Zenbat ziklo oso egiten ditu ordu erdian?`, erantzuna: Math.floor(1800000 / T), ...oso, unitatea: 'ziklo', pista: 'Ordu erdia = 1 800 000 ms. Zatitu ziklo baten iraupenarekin.', ebazpena: [`Zikloa: ${g} + ${h} + ${r} = ${T} ms`, `1 800 000 / ${T} = ${fmt(1800000 / T, 2)} → ${Math.floor(1800000 / T)} ziklo`] };
      }
      const k = pick([5, 10, 20, 50]), d = pick([2, 5, 10]);
      return { q: `Programa batek, <code>loop</code> bakoitzean, sentsore bat irakurtzen du (<strong>${d} ms</strong>) eta <code>delay(${k})</code> egiten du. Zenbat neurketa egiten ditu segundoko (maiztasuna)?`, erantzuna: 1000 / (k + d), unitatea: 'Hz', hamartarrak: 1, pista: 'f = 1 / T, T itzuli baten iraupena segundotan.', ebazpena: [`T = ${k} + ${d} = ${k + d} ms`, `f = 1000 / ${k + d} = ${fmt(1000 / (k + d), 1)} Hz`] };
    }
  },

  // ---------- aplikazioak ----------
  'app-gertaerak': {
    izena: 'Gertaerak trazatu',
    sortu(m) {
      const seq = arr => `<div class="ex-seq">${arr.map(s => `<span>${s}</span>`).join('<i>→</i>')}</div>`;
      if (m === 3) {
        const tartea = [], ekintzak = [];
        let t = 0, on = false, guztira = 0;
        for (let i = 0; i < 4; i++) {
          t += randInt(3, 12);
          const b = i % 2 === 0 ? 'Botoia1' : 'Botoia2';
          ekintzak.push(`${t} s: ${b}`);
          if (b === 'Botoia1') { on = t; } else { guztira += t - on; tartea.push(`${on}–${t} s: ${t - on} s`); }
        }
        const prog = programa([['gertaera', 'Botoia1 sakatzean', [['aplikazioa', 'tenporizadorea piztu']]], ['gertaera', 'Botoia2 sakatzean', [['aplikazioa', 'tenporizadorea itzali']]], ['gertaera', 'Tenporizadorea: segundoro', [['aldagaiak', 'aldatu [segundoak], gehitu {1}']]]]);
        return { q: `Kronometro-aplikazio batean <strong>segundoak</strong> = 0 da hasieran. Erabiltzaileak botoiak sakatzen ditu une hauetan. Zenbat balio du <strong>segundoak</strong> aldagaiak azkenean?${fig(prog)}${seq(ekintzak)}`, erantzuna: guztira, ...oso, pista: 'Tenporizadorea piztuta dagoen tarteetan bakarrik gehitzen da segundo bat segundoro. Batu tarteak.', ebazpena: [...tartea, `Guztira: ${guztira}`] };
      }
      const a = m === 1 ? 1 : randInt(2, 5);
      const n = m === 1 ? randInt(6, 8) : 5;
      const sakak = Array.from({ length: n }, () => Math.random() < 0.7 ? 'Botoia1' : 'Botoia2');
      let k = m === 1 ? 0 : randInt(1, 3);
      const hasiera = k, eb = [`Hasieran: ${k}`];
      sakak.forEach(s => {
        if (s === 'Botoia1') k += a; else k = m === 1 ? 0 : k * 2;
        eb.push(`${s} → ${k}`);
      });
      const prog = programa([['gertaera', 'Botoia1 sakatzean', [['aldagaiak', `aldatu [k], gehitu {${a}}`]]], ['gertaera', 'Botoia2 sakatzean', [m === 1 ? ['aldagaiak', 'ezarri [k] ← {0}'] : ['aldagaiak', 'ezarri [k] ← [k] × {2}']]]]);
      return { q: `Aplikazio batean <strong>k = ${hasiera}</strong> da hasieran. Erabiltzaileak ordena honetan sakatzen ditu botoiak. Zenbat balio du <strong>k</strong>-k azkenean?${fig(prog)}${seq(sakak)}`, erantzuna: k, ...oso, pista: 'Jarraitu gertaerak banan-banan eta idatzi k-ren balioa bakoitzaren ondoren.', ebazpena: eb };
    }
  },

  // ---------- testu bidezko programazioa ----------
  'kodea-trazatu': {
    izena: 'Kodea trazatu',
    sortu(m) {
      const kod = (t, h) => `<pre class="kd-kodea ex-kodea">${margotu(t, h)}</pre>`;
      if (m === 1) {
        const N = randInt(4, 8), K = randInt(2, 5), batura = Math.random() < 0.5;
        const erantzuna = batura ? N * (N - 1) / 2 : N * K;
        const t = batura ? `s = 0\nfor i in range(${N}):\n    s = s + i\nprint(s)` : `s = 0\nfor i in range(${N}):\n    s = s + ${K}\nprint(s)`;
        return { q: `Zer idazten du Python programa honek?${kod(t, 'python')}`, erantzuna, ...oso, pista: `range(${N}) = 0, 1, …, ${N - 1}: ${N} itzuli.`, ebazpena: [batura ? `s = ${Array.from({ length: N }, (_, i) => i).join(' + ')}` : `s = ${N} · ${K}`, `print → ${erantzuna}`] };
      }
      if (m === 2) {
        const A = randInt(3, 12);
        let n = A, k = 0;
        const bidea = [n];
        while (n > 1) { n = n % 2 === 0 ? n / 2 : 3 * n + 1; k++; bidea.push(n); }
        const t = `n = ${A}\nk = 0\nwhile n > 1:\n    if n % 2 == 0:\n        n = n // 2\n    else:\n        n = 3 * n + 1\n    k = k + 1\nprint(k)`;
        return { q: `Zer idazten du Python programa honek? (<code>//</code> zatiketa osoa da.)${kod(t, 'python')}`, erantzuna: k, ...oso, pista: 'Idatzi n-ren balioak banan-banan 1era iritsi arte, eta zenbatu urratsak.', ebazpena: [`n: ${bidea.join(' → ')}`, `k = ${k}`] };
      }
      const A = randInt(3, 6), B = randInt(4, 8);
      let kont = 0;
      const eb = [];
      for (let i = 0; i < A; i++) { const lehen = kont; for (let j = i; j < B; j++) kont++; eb.push(`i = ${i}: j ${i}–${B - 1} → +${kont - lehen} (${kont})`); }
      const t = `int kont = 0;\nfor (int i = 0; i < ${A}; i++) {\n  for (int j = i; j < ${B}; j++) {\n    kont++;\n  }\n}\nSerial.println(kont);`;
      return { q: `Zer idazten du C++ kode honek serie-monitorean?${kod(t, 'cpp')}`, erantzuna: kont, ...oso, pista: 'Barruko begiztak B − i itzuli egiten ditu i bakoitzeko (i < B bada).', ebazpena: [...eb, `kont = ${kont}`] };
    }
  },

  // ---------- robotak ----------
  gurpila: {
    izena: 'Robot mugikorra',
    sortu(m) {
      const d = pick([4, 5, 6, 6.5, 7]), rpm = pick([60, 90, 120, 150, 200]), v = Math.PI * d * rpm / 60;
      const lehen = [`Perimetroa: π · ${fmt(d, 1)} = ${fmt(Math.PI * d, 2)} cm`, `${rpm} / 60 = ${fmt(rpm / 60, 2)} bira/s`, `v = ${fmt(Math.PI * d, 2)} · ${fmt(rpm / 60, 2)} = ${fmt(v, 1)} cm/s`];
      if (m === 1) return { q: `Robot baten gurpilek <strong>${fmt(d, 1)} cm</strong>-ko diametroa dute eta <strong>${rpm} rpm</strong> (bira minutuko) egiten dituzte. Zein abiaduratan mugitzen da?`, erantzuna: v, unitatea: 'cm/s', hamartarrak: 1, pista: 'Bira batean robotak gurpilaren perimetroa (π · d) egiten du. rpm / 60 = bira segundoko.', ebazpena: lehen };
      if (m === 2) {
        const L = pick([100, 150, 200, 300]);
        return { q: `Robot baten gurpilek <strong>${fmt(d, 1)} cm</strong>-ko diametroa dute eta <strong>${rpm} rpm</strong> egiten dituzte. Zenbat denbora behar du <strong>${L} cm</strong> egiteko?`, erantzuna: L / v, unitatea: 's', hamartarrak: 2, pista: 'Lehenik abiadura (v = π · d · rpm / 60), gero t = distantzia / abiadura.', ebazpena: [...lehen, `t = ${L} / ${fmt(v, 2)} = ${fmt(L / v, 2)} s`] };
      }
      const b = pick([10, 12, 14, 16]), vr = pick([10, 15, 20]), t = Math.PI * b / (4 * vr);
      return {
        q: `Trakzio diferentzialeko robot batek <strong>${b} cm</strong> ditu gurpilen artean. Bere lekuan biratzeko, gurpil bat <strong>${vr} cm/s</strong>-ra aurrera eta bestea ${vr} cm/s-ra atzera mugitzen da. Zenbat denbora behar du 90° biratzeko?`,
        erantzuna: t, unitatea: 's', hamartarrak: 3,
        pista: 'Gurpil bakoitzak b/2 erradioko zirkulu bat egiten du. 90° = zirkuluaren laurdena: π · b / 4.',
        ebazpena: [`Gurpil bakoitzaren bidea: π · ${b} / 4 = ${fmt(Math.PI * b / 4, 2)} cm`, `t = ${fmt(Math.PI * b / 4, 2)} / ${vr} = ${fmt(t, 3)} s`]
      };
    }
  },

  // ---------- robot-besoa ----------
  zinematika: {
    izena: 'Zinematika',
    sortu(m) {
      const r = g => g * Math.PI / 180;
      if (m === 1) {
        const L = pick([10, 12, 15, 20]), th = pick([0, 30, 45, 60, 90, 120, 150]), ax = pick(['x', 'y']);
        const f = ax === 'x' ? Math.cos(r(th)) : Math.sin(r(th)), val = L * f;
        return { q: `Artikulazio bakarreko beso batek <strong>${L} cm</strong> ditu eta <strong>${th}°</strong>-ko angelua osatzen du horizontalarekin. Zein da muturraren <strong>${ax}</strong> koordenatua?`, erantzuna: val, unitatea: 'cm', hamartarrak: 2, tol: 0.05, pista: 'x = L · cos θ eta y = L · sin θ.', ebazpena: [`${ax} = ${L} · ${ax === 'x' ? 'cos' : 'sin'} ${th}° = ${L} · ${fmt(f, 4)} = ${fmt(val, 2)} cm`] };
      }
      const L1 = pick([10, 12]), L2 = pick([8, 9]), t1 = pick([30, 45, 60, 90]), t2 = pick([-45, 30, 45, 60, 90]);
      if (m === 2) {
        const ax = pick(['x', 'y']), fn = ax === 'x' ? Math.cos : Math.sin, F = ax === 'x' ? 'cos' : 'sin';
        const a = L1 * fn(r(t1)), b = L2 * fn(r(t1 + t2)), val = a + b;
        return {
          q: `Bi segmentuko beso batek L₁ = <strong>${L1} cm</strong> eta L₂ = <strong>${L2} cm</strong> ditu. Angeluak: θ₁ = <strong>${t1}°</strong> (horizontalarekiko) eta θ₂ = <strong>${t2}°</strong> (lehen segmentuarekiko). Zein da pintzaren <strong>${ax}</strong> koordenatua?`,
          erantzuna: val, unitatea: 'cm', hamartarrak: 2, tol: 0.05,
          pista: `${ax} = L₁ · ${F} θ₁ + L₂ · ${F}(θ₁ + θ₂)`,
          ebazpena: [`θ₁ + θ₂ = ${t1 + t2}°`, `${ax} = ${L1} · ${F} ${t1}° + ${L2} · ${F} ${t1 + t2}°`, `= ${fmt(a, 2)} + ${fmt(b, 2)} = ${fmt(val, 2)} cm`]
        };
      }
      const x = Math.round((L1 * Math.cos(r(t1)) + L2 * Math.cos(r(t1 + t2))) * 10) / 10;
      const y = Math.round((L1 * Math.sin(r(t1)) + L2 * Math.sin(r(t1 + t2))) * 10) / 10;
      const c2 = (x * x + y * y - L1 * L1 - L2 * L2) / (2 * L1 * L2), th2 = Math.acos(Math.max(-1, Math.min(1, c2))) * 180 / Math.PI;
      return {
        q: `Bi segmentuko beso batek L₁ = <strong>${L1} cm</strong> eta L₂ = <strong>${L2} cm</strong> ditu. Pintzak (<strong>${fmt(x, 1)}; ${fmt(y, 1)}</strong>) cm puntura iritsi behar du. Zein da ukondoaren angeluaren balio absolutua, |θ₂|?`,
        erantzuna: th2, unitatea: '°', hamartarrak: 1, tol: 0.3,
        pista: 'Kosinuaren teorema: cos θ₂ = (x² + y² − L₁² − L₂²) / (2 · L₁ · L₂).',
        ebazpena: [`x² + y² = ${fmt(x * x + y * y, 2)}`, `cos θ₂ = (${fmt(x * x + y * y, 2)} − ${L1 * L1} − ${L2 * L2}) / (2 · ${L1} · ${L2}) = ${fmt(c2, 4)}`, `|θ₂| = ${fmt(th2, 1)}°`]
      };
    }
  },

  'lan-eremua': {
    izena: 'Lan-eremua',
    sortu(m) {
      const L1 = pick([10, 12, 15, 20]), L2 = pick([6, 8, 9, 10, 12]);
      if (m === 1) {
        const L3 = Math.random() < 0.5 ? pick([4, 5, 6]) : 0;
        const R = L1 + L2 + L3;
        return { q: `Robot-beso batek segmentu hauek ditu: <strong>${[L1, L2, L3].filter(Boolean).join(' cm, ')} cm</strong>. Zein da oinarritik irits daitekeen gehieneko distantzia?`, erantzuna: R, unitatea: 'cm', ...{ zehatza: true, hamartarrak: 0 }, pista: 'Besoa guztiz luzatuta, segmentu guztien luzerak batzen dira.', ebazpena: [`${[L1, L2, L3].filter(Boolean).join(' + ')} = ${R} cm`] };
      }
      if (m === 2) return { q: `Bi segmentuko beso batek L₁ = <strong>${L1} cm</strong> eta L₂ = <strong>${L2} cm</strong> ditu, eta ukondoa guztiz tolestu daiteke. Zein da oinarritik irits daitekeen gutxieneko distantzia?`, erantzuna: Math.abs(L1 - L2), unitatea: 'cm', zehatza: true, hamartarrak: 0, pista: 'Ukondoa tolestuta, bigarren segmentua lehenaren gainean itzultzen da: |L₁ − L₂|.', ebazpena: [`|${L1} − ${L2}| = ${Math.abs(L1 - L2)} cm`] };
      const R = L1 + L2, rr = Math.abs(L1 - L2), A = Math.PI * (R * R - rr * rr) / 2;
      return {
        q: `Bi segmentuko beso planar batek L₁ = <strong>${L1} cm</strong> eta L₂ = <strong>${L2} cm</strong> ditu, eta mahaiaren gaineko erdia bakarrik erabil dezake (erdi-eraztuna). Zein da lan-eremuaren azalera?`,
        erantzuna: A, unitatea: 'cm²', hamartarrak: 1,
        pista: 'Eraztunaren azalera: π · (R² − r²), R = L₁ + L₂ eta r = |L₁ − L₂|. Erdia hartu.',
        ebazpena: [`R = ${R} cm, r = ${rr} cm`, `A = π · (${R}² − ${rr}²) / 2 = ${fmt(A, 1)} cm²`]
      };
    }
  },

  // ---------- gauzen Internet ----------
  'iot-datuak': {
    izena: 'IoT: datuak eta bateria',
    sortu(m) {
      if (m === 1) {
        const tartea = pick([5, 10, 15, 30, 60]), s = pick([1, 2, 3]), n = 86400 / tartea * s;
        return { q: `Nodo batek <strong>${s} sentsore</strong> ditu, eta sentsore bakoitzak mezu bat bidaltzen du <strong>${tartea} segundoro</strong>. Zenbat mezu bidaltzen dira egunean?`, erantzuna: n, ...oso, pista: 'Egun batean 86 400 segundo daude.', ebazpena: [`86 400 / ${tartea} = ${milaka(86400 / tartea)} mezu sentsoreko`, `· ${s} = ${milaka(n)} mezu`] };
      }
      if (m === 2) {
        const tartea = pick([10, 30, 60]), byte = pick([60, 80, 120, 200]), MB = 86400 / tartea * byte * 30 / (1024 * 1024);
        return { q: `Sentsore batek <strong>${byte} byteko</strong> mezu bat bidaltzen du <strong>${tartea} segundoro</strong>. Zenbat MB bidaltzen ditu hilabetean (30 egun)? (1 MB = 1024 · 1024 byte)`, erantzuna: MB, unitatea: 'MB', hamartarrak: 2, pista: 'Eguneko mezuak · mezuaren tamaina · 30, eta gero zatitu 1 048 576z.', ebazpena: [`${milaka(86400 / tartea)} mezu egunean`, `${milaka(86400 / tartea)} · ${byte} · 30 = ${milaka(86400 / tartea * byte * 30)} byte`, `= ${fmt(MB, 2)} MB`] };
      }
      const C = pick([1000, 2000, 2500]), Ia = pick([80, 120, 150]), ta = pick([1, 2, 3]), T = pick([60, 300, 600]), Is = 0.1;
      const I = (Ia * ta + Is * (T - ta)) / T, egunak = C / I / 24;
      return {
        q: `Nodo batek <strong>${C} mAh</strong>-ko bateria du. <strong>${T} segundoro</strong> esnatzen da, eta <strong>${ta} s</strong>-z <strong>${Ia} mA</strong> kontsumitzen ditu (neurtu eta WiFi bidez bidali). Gainerako denboran lo dago, <strong>0,1 mA</strong>-rekin. Zenbat egun irauten du bateriak?`,
        erantzuna: egunak, unitatea: 'egun', hamartarrak: 1,
        pista: 'Batez besteko korrontea = (I_aktiboa · t_aktiboa + I_loa · t_loa) / T. Iraupena = edukiera / korrontea (orduak), gero zatitu 24z.',
        ebazpena: [`I = (${Ia} · ${ta} + 0,1 · ${T - ta}) / ${T} = ${fmt(I, 3)} mA`, `${C} / ${fmt(I, 3)} = ${fmt(C / I, 0)} h`, `${fmt(C / I, 0)} / 24 = ${fmt(egunak, 1)} egun`]
      };
    }
  },

  // ---------- adimen artifiziala ----------
  'ia-zehaztasuna': {
    izena: 'Ereduaren zehaztasuna',
    sortu(m) {
      if (m === 1) {
        const N = pick([40, 50, 80, 100, 200]), ondo = randInt(Math.round(N * 0.6), N - 1);
        return { q: `Irudi-sailkatzaile batek <strong>${N}</strong> proba-irudietatik <strong>${ondo}</strong> asmatu ditu. Zein da bere zehaztasuna?`, erantzuna: ondo / N * 100, unitatea: '%', hamartarrak: 1, pista: 'Zehaztasuna = asmatuak / guztiak · 100.', ebazpena: [`${ondo} / ${N} · 100 = % ${fmt(ondo / N * 100, 1)}`] };
      }
      const TP = randInt(30, 60), FN = randInt(2, 15), FP = randInt(2, 15), TN = randInt(30, 70);
      const matrizea = `<div class="table-scroll"><table class="ex-rs"><tr><th></th><th>Iragarpena: spam</th><th>Iragarpena: ez</th></tr><tr><th>Benetan spam</th><td>${TP}</td><td>${FN}</td></tr><tr><th>Benetan ez</th><td>${FP}</td><td>${TN}</td></tr></table></div>`;
      if (m === 2) {
        const a = (TP + TN) / (TP + TN + FP + FN) * 100;
        return { q: `Zabor-posta (spam) detektatzaile baten nahasmen-matrizea. Zein da zehaztasuna (asmatutako mezuak, guztien artean)?${matrizea}`, erantzuna: a, unitatea: '%', hamartarrak: 1, pista: 'Asmatuak diagonalean daude: spam → spam eta ez → ez.', ebazpena: [`Asmatuak: ${TP} + ${TN} = ${TP + TN}`, `Guztira: ${TP + TN + FP + FN}`, `% ${fmt(a, 1)}`] };
      }
      const doit = Math.random() < 0.5;
      const v = doit ? TP / (TP + FP) * 100 : TP / (TP + FN) * 100;
      return {
        q: `Zabor-posta detektatzaile baten nahasmen-matrizea. ${doit ? '<strong>Doitasuna</strong>: «spam» esan dituenetatik, zenbat ziren benetan spam?' : '<strong>Estaldura</strong>: benetako spam-etatik, zenbat detektatu ditu?'} Eman ehunekotan.${matrizea}`,
        erantzuna: v, unitatea: '%', hamartarrak: 1,
        pista: doit ? 'Doitasuna = spam ondo / («spam» iragarri guztiak).' : 'Estaldura = spam ondo / (benetako spam guztiak).',
        ebazpena: [doit ? `${TP} / (${TP} + ${FP}) = % ${fmt(v, 1)}` : `${TP} / (${TP} + ${FN}) = % ${fmt(v, 1)}`]
      };
    }
  },

  neurona: {
    izena: 'Neurona artifiziala',
    sortu(m) {
      const d = () => pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
      const w = () => pick([-1, -0.5, 0.5, 1, 1.5, 2]);
      const x1 = d(), x2 = d(), w1 = w(), w2 = w();
      if (m === 1) {
        const s = x1 * w1 + x2 * w2;
        return { q: `Neurona batek bi sarrera ditu: x₁ = <strong>${fmt(x1, 1)}</strong> eta x₂ = <strong>${fmt(x2, 1)}</strong>. Pisuak: w₁ = <strong>${fmt(w1, 1)}</strong> eta w₂ = <strong>${fmt(w2, 1)}</strong>. Zein da batura haztatua, s = x₁·w₁ + x₂·w₂?`, erantzuna: s, unitatea: '', hamartarrak: 2, tol: 0.005, pista: 'Biderkatu sarrera bakoitza bere pisuaz eta batu.', ebazpena: [`s = ${fmt(x1, 1)} · ${fmt(w1, 1)} + ${fmt(x2, 1)} · ${fmt(w2, 1)} = ${fmt(x1 * w1, 2)} + ${fmt(x2 * w2, 2)} = ${fmt(s, 2)}`] };
      }
      const b = pick([-1, -0.5, 0, 0.5]), s = x1 * w1 + x2 * w2 + b, y = s > 0 ? 1 : 0;
      if (m === 2) {
        return { q: `Neurona batek x₁ = <strong>${fmt(x1, 1)}</strong>, x₂ = <strong>${fmt(x2, 1)}</strong>, w₁ = <strong>${fmt(w1, 1)}</strong>, w₂ = <strong>${fmt(w2, 1)}</strong> eta b = <strong>${fmt(b, 1)}</strong> ditu. Irteera 1 da batura 0 baino handiagoa bada, eta 0 bestela. Zein da irteera?`, erantzuna: y, ...oso, pista: 's = x₁·w₁ + x₂·w₂ + b; gero konparatu 0rekin.', ebazpena: [`s = ${fmt(x1 * w1, 2)} + ${fmt(x2 * w2, 2)} + (${fmt(b, 1)}) = ${fmt(s, 2)}`, `${fmt(s, 2)} ${s > 0 ? '>' : '≤'} 0 → y = ${y}`] };
      }
      const t = 1 - y, eta = pick([0.1, 0.2, 0.5]), w1b = w1 + eta * (t - y) * x1;
      return {
        q: `Pertzeptroi batek x₁ = <strong>${fmt(x1, 1)}</strong>, x₂ = <strong>${fmt(x2, 1)}</strong>, w₁ = <strong>${fmt(w1, 1)}</strong>, w₂ = <strong>${fmt(w2, 1)}</strong> eta b = <strong>${fmt(b, 1)}</strong> ditu (y = 1 batura &gt; 0 bada). Adibide honen etiketa zuzena t = <strong>${t}</strong> da. Ikasteko abiadura η = <strong>${fmt(eta, 1)}</strong> bada, zein da w₁-en balio berria?`,
        erantzuna: w1b, unitatea: '', hamartarrak: 2, tol: 0.005,
        pista: 'Lehenik kalkulatu y. Gero w₁ ← w₁ + η · (t − y) · x₁.',
        ebazpena: [`s = ${fmt(s, 2)} → y = ${y}`, `t − y = ${t - y}`, `w₁ = ${fmt(w1, 1)} + ${fmt(eta, 1)} · (${t - y}) · ${fmt(x1, 1)} = ${fmt(w1b, 2)}`]
      };
    }
  }
};

// ---------- adierazpen logikoak (ariketetarako) ----------
const LOG = {
  ETA: v => v.every(Boolean), EDO: v => v.some(Boolean), EZ: v => !v[0],
  EZETA: v => !v.every(Boolean), EZEDO: v => !v.some(Boolean), EDOB: v => v.filter(Boolean).length % 2 === 1
};
const ezM = s => `<span class="ez">${s}</span>`;
function logEval(t, v) { return typeof t === 'string' ? v[t] : LOG[t[0]](t.slice(1).map(u => logEval(u, v))); }
function logHTML(t) {
  if (typeof t === 'string') return t;
  const [op, a, b] = t;
  const bil = (u, ops) => typeof u !== 'string' && ops.includes(u[0]) ? `(${logHTML(u)})` : logHTML(u);
  switch (op) {
    case 'EZ': return ezM(logHTML(a));
    case 'ETA': return `${bil(a, ['EDO', 'EDOB'])} · ${bil(b, ['EDO', 'EDOB'])}`;
    case 'EDO': return `${bil(a, ['EDOB'])} + ${bil(b, ['EDOB'])}`;
    case 'EDOB': return `${bil(a, ['EDO', 'EDOB'])} ⊕ ${bil(b, ['EDO', 'EDOB'])}`;
    case 'EZETA': return ezM(`${bil(a, ['EDO', 'EDOB'])} · ${bil(b, ['EDO', 'EDOB'])}`);
    default: return ezM(`${bil(a, ['EDOB'])} + ${bil(b, ['EDOB'])}`);
  }
}
const LOG_M2 = [
  ['ETA', ['EDO', 'A', 'B'], 'C'], ['EDO', ['ETA', 'A', 'B'], ['EZ', 'C']], ['ETA', 'A', ['EZ', ['EDO', 'B', 'C']]],
  ['EDO', ['ETA', 'A', ['EZ', 'B']], ['ETA', ['EZ', 'A'], 'C']], ['EDOB', ['ETA', 'A', 'B'], 'C'], ['EZETA', 'A', ['EDO', 'B', 'C']]
];
const LOG_M3 = [
  ['EDO', ['ETA', 'A', 'B'], ['ETA', 'C', 'D']], ['ETA', ['EDO', 'A', ['EZ', 'B']], ['EDO', 'C', 'D']], ['EZEDO', ['ETA', 'A', 'B'], ['EDOB', 'C', 'D']],
  ['EDOB', ['EDOB', 'A', 'B'], ['EDOB', 'C', 'D']], ['ETA', ['EZETA', 'A', 'B'], ['EDO', ['EZ', 'C'], 'D']]
];
function logAdierazpena(m) {
  if (m === 1) return Math.random() < 0.2 ? ['EZ', 'A'] : [pick(['ETA', 'EDO', 'EDOB', 'EZETA', 'EZEDO']), 'A', 'B'];
  return pick(m === 2 ? LOG_M2 : LOG_M3);
}
const logAldagaiak = t => [...new Set(JSON.stringify(t).match(/"[A-D]"/g).map(s => s[1]))].sort();

export function zuzena(ariketa, balioa) {
  const e = ariketa.erantzuna;
  if (ariketa.zehatza) return Math.abs(balioa - e) <= 0.5;
  const tol = ariketa.tol ?? Math.max(Math.abs(e) * 0.01, Math.abs(e) < 0.1 ? 0.0005 : 0.01);
  return Math.abs(balioa - e) <= tol;
}
