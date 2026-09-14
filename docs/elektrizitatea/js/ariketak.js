// Ariketa-sorgailuak. Maila: 1 = DBH 1-2, 2 = DBH 3-4, 3 = Batxilergoa.
// sortu(maila) → { q (HTML), erantzuna, unitatea, pista, ebazpena[], tol?, zehatza?, hamartarrak? }
import { fmt, pick, randInt } from './util.js';
import { R, Sr, Pr, baliokidea, ebatzi, eskemaSVG, murrizketa, formula, bisareSVG, nodoSVG, begiztaSVG, erresistentziaSVG, KOLOREAK } from './eskema.js';

export const MATERIALAK = [['kobrea', 0.017], ['aluminioa', 0.028], ['burdina', 0.1], ['konstantana', 0.5], ['nikromoa', 1.1]];

// Bi sareko zirkuitua, sare-korronte "politekin": E₁ = J₁(R₁+R₂) − J₂R₂ eta E₂ = J₁R₂ − J₂(R₂+R₃)
export function sareZirkuitua() {
  for (let i = 0; i < 500; i++) {
    const R1 = pick([2, 3, 4, 5, 6]), R2 = pick([2, 3, 4, 6, 10]), R3 = pick([2, 3, 4, 5, 6]);
    const J1 = pick([0.5, 1, 1.5, 2]), J2 = pick([0.25, 0.5, 1]);
    const E1 = J1 * (R1 + R2) - J2 * R2, E2 = J1 * R2 - J2 * (R2 + R3);
    if (E1 >= 2 && E1 <= 30 && E2 >= 1 && E2 <= 30 && Number.isInteger(E1 * 2) && Number.isInteger(E2 * 2) && J1 > J2) return { R1, R2, R3, J1, J2, E1, E2 };
  }
  return { R1: 4, R2: 6, R3: 3, J1: 1.5, J2: 0.5, E1: 12, E2: 4.5 };
}
const sub = n => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);

const b = (x, d = 2) => `<strong>${fmt(x, d)}</strong>`;
const fig = svg => `<div class="ex-fig">${svg}</div>`;
const ELEK = 1.6e-19;

// Bikote paralelo "politak": (a · b) / (a + b) zenbaki osoa
const BIKOTEAK = [[6, 3], [12, 6], [20, 30], [10, 10], [4, 12], [30, 60], [20, 20], [15, 10], [60, 30], [40, 10], [24, 12], [18, 9]];
const HIRUKOTEAK = [[20, 30, 60], [12, 6, 4], [10, 15, 30], [6, 12, 12], [40, 60, 120], [8, 24, 12], [30, 30, 15]];
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);

// Zirkuitu mistoak mailaka
export function mistoa(m) {
  if (m === 1) {
    const r = pick([10, 20, 30, 40]), r1 = pick([5, 10, 15, 20]);
    return Sr(R('R1', r1), Pr(R('R2', r), R('R3', r)));
  }
  if (m === 2) {
    const [a, c] = shuffle(pick(BIKOTEAK)), r = pick([4, 5, 8, 10, 14]);
    return Math.random() < 0.5 ? Sr(R('R1', r), Pr(R('R2', a), R('R3', c))) : Sr(Pr(R('R1', a), R('R2', c)), R('R3', r));
  }
  const k = randInt(0, 2);
  const [a, c] = shuffle(pick(BIKOTEAK));
  if (k === 0) {
    const [d, e] = shuffle(pick(BIKOTEAK));
    return Sr(Pr(R('R1', a), R('R2', c)), Pr(R('R3', d), R('R4', e)));
  }
  const r4 = Math.max(1, Math.round(c / pick([2, 3, 4]))), r3 = c - r4, rs = pick([2, 5, 6, 10]);
  if (k === 1) return Sr(R('R1', rs), Pr(R('R2', a), Sr(R('R3', r3), R('R4', r4))));
  return Sr(Pr(Sr(R('R1', r3), R('R2', r4)), R('R3', a)), R('R4', rs));
}
const reqLerroak = tree => murrizketa(tree).map(u => u.testua);

// Pilatik hosto batera: talde bakoitzaren tentsioa urratsez urrats
const barnean = (n, k) => n.t === 'R' ? n.izena === k : n.ume.some(u => barnean(u, k));
function bideLerroak(n, U, k, out = [], erroa = true) {
  if (n.t === 'R') return out;
  const c = n.ume.find(u => barnean(u, k));
  if (n.t === 'S') {
    const I = U / baliokidea(n), Uc = I * baliokidea(c);
    if (!erroa) out.push(`${formula(n)} adarreko korrontea: I = ${fmt(U, 3)} / ${fmt(baliokidea(n))} = ${fmt(I, 3)} A`);
    if (c.t !== 'R') out.push(`${formula(c)} taldea seriean dago: V = I · R = ${fmt(I, 3)} · ${fmt(baliokidea(c))} = ${fmt(Uc, 3)} V`);
    return bideLerroak(c, Uc, k, out, false);
  }
  if (c.t !== 'R') out.push(`${formula(c)} adarra paraleloan dago: tentsio bera, ${fmt(U, 3)} V`);
  return bideLerroak(c, U, k, out, false);
}

export const ARIKETAK = {
  // ---------- oinarriak ----------
  karga: {
    izena: 'Karga eta intentsitatea',
    sortu(m) {
      if (m === 1) {
        const I = pick([0.5, 1, 2, 3, 4, 5]), t = pick([2, 4, 10, 20, 30, 60]), Q = I * t;
        return { q: `Hari batetik ${b(Q)} C-eko karga igaro da ${b(t)} segundotan. Zein da korrontearen intentsitatea?`, erantzuna: I, unitatea: 'A',
          pista: 'Intentsitatea = karga / denbora: I = Q / t.', ebazpena: ['I = Q / t', `I = ${fmt(Q)} C / ${fmt(t)} s = ${fmt(I)} A`] };
      }
      if (m === 2) {
        const I = pick([0.2, 0.5, 1.5, 2, 2.5]), min = pick([2, 5, 10, 15]), Q = I * min * 60;
        return { q: `Bonbilla batetik ${b(I)} A-ko korrontea igarotzen da ${b(min, 0)} minutuz. Zenbat karga igaro da?`, erantzuna: Q, unitatea: 'C',
          pista: 'Q = I · t, eta denbora segundotan jarri behar da (1 min = 60 s).', ebazpena: [`t = ${min} min · 60 = ${min * 60} s`, `Q = I · t = ${fmt(I)} A · ${min * 60} s = ${fmt(Q)} C`] };
      }
      const mA = pick([200, 320, 480, 800]), t = pick([5, 10, 20]), Q = mA / 1000 * t, n = Q / ELEK / 1e18;
      return { q: `Hari batetik ${b(mA, 0)} mA-ko korrontea igarotzen da ${b(t, 0)} segundoz. Zenbat elektroi igaro dira? Eman emaitza 10¹⁸ elektroitan (adibidez, 5·10¹⁸ bada, idatzi 5). Elektroiaren karga: 1,6·10⁻¹⁹ C.`,
        erantzuna: n, unitatea: '·10¹⁸ e⁻', pista: 'Lehenik Q = I · t (I amperetan); gero n = Q / 1,6·10⁻¹⁹.',
        ebazpena: [`I = ${mA} mA = ${fmt(mA / 1000, 3)} A`, `Q = I · t = ${fmt(mA / 1000, 3)} · ${t} = ${fmt(Q)} C`, `n = Q / e = ${fmt(Q)} / 1,6·10⁻¹⁹ = ${fmt(n)}·10¹⁸ elektroi`] };
    }
  },

  unitateak: {
    izena: 'Unitate-aldaketak',
    sortu(m) {
      const A = {
        1: [
          () => { const a = pick([0.2, 0.25, 0.5, 1.2, 0.05]); return [`${b(a)} A`, 'mA', a * 1000, [`1 A = 1000 mA`, `${fmt(a)} · 1000 = ${fmt(a * 1000)} mA`]]; },
          () => { const a = pick([250, 1500, 40, 600, 2000]); return [`${b(a, 0)} mA`, 'A', a / 1000, [`1000 mA = 1 A`, `${fmt(a)} / 1000 = ${fmt(a / 1000, 3)} A`]]; },
          () => { const a = pick([1, 2.2, 4.7, 10, 0.5]); return [`${b(a)} kΩ`, 'Ω', a * 1000, [`1 kΩ = 1000 Ω`, `${fmt(a)} · 1000 = ${fmt(a * 1000)} Ω`]]; }
        ],
        2: [
          () => { const a = pick([330, 4700, 1500, 68000]); return [`${b(a, 0)} Ω`, 'kΩ', a / 1000, [`1000 Ω = 1 kΩ`, `${fmt(a)} / 1000 = ${fmt(a / 1000, 3)} kΩ`]]; },
          () => { const a = pick([0.0005, 0.002, 0.00025]); return [`${b(a, 5)} A`, 'µA', a * 1e6, [`1 A = 1 000 000 µA`, `${fmt(a, 5)} · 1 000 000 = ${fmt(a * 1e6)} µA`]]; },
          () => { const a = pick([1.5, 3.3, 0.22]); return [`${b(a)} MΩ`, 'kΩ', a * 1000, [`1 MΩ = 1000 kΩ`, `${fmt(a)} · 1000 = ${fmt(a * 1000)} kΩ`]]; },
          () => { const a = pick([750, 50, 1200]); return [`${b(a, 0)} mV`, 'V', a / 1000, [`1000 mV = 1 V`, `${fmt(a)} / 1000 = ${fmt(a / 1000, 3)} V`]]; }
        ],
        3: [
          () => { const a = pick([2.5, 0.75, 1.8, 12]); return [`${b(a)} kWh`, 'MJ', a * 3.6, [`1 kWh = 1000 W · 3600 s = 3 600 000 J = 3,6 MJ`, `${fmt(a)} · 3,6 = ${fmt(a * 3.6)} MJ`]]; },
          () => { const a = pick([2000, 3000, 4500, 1200]); return [`${b(a, 0)} mAh-ko bateria baten karga`, 'C', a / 1000 * 3600, [`1 mAh = 0,001 A · 3600 s = 3,6 C`, `Q = ${fmt(a / 1000)} A · 3600 s = ${fmt(a / 1000 * 3600)} C`]]; },
          () => { const a = pick([90, 450, 7.2]); return [`${b(a)} MJ`, 'kWh', a / 3.6, [`1 kWh = 3,6 MJ`, `${fmt(a)} / 3,6 = ${fmt(a / 3.6)} kWh`]]; }
        ]
      };
      const [from, to, ans, steps] = pick(A[m])();
      return { q: `Adierazi ${from} <strong>${to}</strong>-tan.`, erantzuna: ans, unitatea: to, hamartarrak: 5,
        pista: 'Gogoratu: kilo (k) = 1000, mili (m) = 1/1000, mikro (µ) = 1/1 000 000, mega (M) = 1 000 000.', ebazpena: steps };
    }
  },

  // ---------- Ohm-en legea ----------
  'ohm-i': {
    izena: 'Ohm-en legea: intentsitatea',
    sortu(m) {
      if (m === 1) {
        const Rv = pick([2, 3, 4, 6, 10, 12, 20]), I = pick([0.5, 1, 2, 3]), V = Rv * I;
        return { q: `${b(Rv, 0)} Ω-eko erresistentzia bat ${b(V)} V-ko pila bati lotuta dago. Zein korronte igarotzen da haren barnetik?`, erantzuna: I, unitatea: 'A',
          pista: 'Ohm-en legea: I = V / R.', ebazpena: ['I = V / R', `I = ${fmt(V)} V / ${fmt(Rv)} Ω = ${fmt(I)} A`] };
      }
      if (m === 2) {
        const k = pick([1, 2, 3, 4, 6]), V = pick([6, 12, 24]), mA = V / k;
        return { q: `${b(k, 0)} kΩ-eko erresistentzia bati ${b(V, 0)} V-ko tentsioa aplikatu diogu. Kalkulatu intentsitatea <strong>miliamperetan</strong>.`, erantzuna: mA, unitatea: 'mA',
          pista: 'Pasatu kΩ ohmetara (· 1000), kalkulatu I = V / R amperetan eta gero pasatu mA-ra (· 1000).',
          ebazpena: [`R = ${k} kΩ = ${k * 1000} Ω`, `I = V / R = ${V} / ${k * 1000} = ${fmt(V / (k * 1000), 4)} A`, `I = ${fmt(mA)} mA`] };
      }
      const P = pick([40, 60, 100, 1000]), Rv = 230 * 230 / P, I = 230 / Rv;
      return { q: `Etxeko sarean (${b(230, 0)} V) lan egiten duen bonbilla baten harizpiak ${b(Rv, 1)} Ω-eko erresistentzia du piztuta dagoenean. Zenbateko intentsitatea kontsumitzen du? (3 hamartarrekin)`, erantzuna: I, unitatea: 'A', hamartarrak: 3,
        pista: 'I = V / R. Kontuz hamartarrekin.', ebazpena: ['I = V / R', `I = 230 V / ${fmt(Rv, 1)} Ω = ${fmt(I, 3)} A`] };
    }
  },

  'ohm-v': {
    izena: 'Ohm-en legea: tentsioa',
    sortu(m) {
      if (m === 1) {
        const I = pick([0.5, 1, 2, 3]), Rv = pick([4, 6, 10, 12, 20]), V = I * Rv;
        return { q: `${b(Rv, 0)} Ω-eko erresistentzia batetik ${b(I)} A-ko korrontea igarotzen da. Zenbateko tentsioa dago haren muturren artean?`, erantzuna: V, unitatea: 'V',
          pista: 'Ohm-en legea: V = I · R.', ebazpena: ['V = I · R', `V = ${fmt(I)} A · ${fmt(Rv)} Ω = ${fmt(V)} V`] };
      }
      if (m === 2) {
        const mA = pick([20, 50, 150, 30]), Rv = pick([100, 220, 470, 330]), V = mA / 1000 * Rv;
        return { q: `${b(Rv, 0)} Ω-eko erresistentzia batetik ${b(mA, 0)} mA igarotzen dira. Kalkulatu haren tentsioa.`, erantzuna: V, unitatea: 'V',
          pista: 'Lehenik pasatu mA amperetara (/ 1000), gero V = I · R.', ebazpena: [`I = ${mA} mA = ${fmt(mA / 1000, 3)} A`, `V = I · R = ${fmt(mA / 1000, 3)} · ${Rv} = ${fmt(V)} V`] };
      }
      const mA = pick([2.5, 12, 0.8, 1.5]), k = pick([2.2, 4.7, 10, 1.5]), V = mA * k;
      return { q: `${b(k)} kΩ-eko erresistentzia batetik ${b(mA)} mA igarotzen dira. Kalkulatu tentsioa.`, erantzuna: V, unitatea: 'V',
        pista: 'Trikimailua: mA · kΩ = V (10⁻³ · 10³ = 1).', ebazpena: [`V = I · R = ${fmt(mA / 1000, 4)} A · ${fmt(k * 1000)} Ω`, `V = ${fmt(V)} V  (edo zuzenean: ${fmt(mA)} mA · ${fmt(k)} kΩ)`] };
    }
  },

  'ohm-r': {
    izena: 'Ohm-en legea: erresistentzia',
    sortu(m) {
      if (m === 1) {
        const I = pick([0.5, 1, 2, 3]), Rv = pick([2, 4, 6, 8, 12]), V = I * Rv;
        return { q: `Bonbilla bat ${b(V)} V-ko pila bati lotuta dago eta ${b(I)} A kontsumitzen ditu. Zein da haren erresistentzia?`, erantzuna: Rv, unitatea: 'Ω',
          pista: 'Ohm-en legea: R = V / I.', ebazpena: ['R = V / I', `R = ${fmt(V)} V / ${fmt(I)} A = ${fmt(Rv)} Ω`] };
      }
      if (m === 2) {
        const mA = pick([10, 25, 50, 60, 20]), V = pick([5, 9, 12, 6]), Rv = V / (mA / 1000);
        return { q: `Osagai batek ${b(V, 0)} V-ra ${b(mA, 0)} mA kontsumitzen ditu. Kalkulatu haren erresistentzia ohmetan.`, erantzuna: Rv, unitatea: 'Ω',
          pista: 'Pasatu mA amperetara, eta R = V / I.', ebazpena: [`I = ${mA} mA = ${fmt(mA / 1000, 3)} A`, `R = V / I = ${V} / ${fmt(mA / 1000, 3)} = ${fmt(Rv)} Ω`] };
      }
      const mA = pick([1.5, 2, 4, 2.5]), V = pick([3.3, 5, 12]), k = V / mA;
      return { q: `Sentsore batek ${b(V)} V-ra ${b(mA)} mA kontsumitzen ditu. Kalkulatu haren erresistentzia <strong>kiloohmetan</strong>.`, erantzuna: k, unitatea: 'kΩ', hamartarrak: 3,
        pista: 'V / mA = kΩ.', ebazpena: [`R = V / I = ${fmt(V)} V / ${fmt(mA / 1000, 4)} A = ${fmt(k * 1000)} Ω`, `R = ${fmt(k, 3)} kΩ`] };
    }
  },

  // ---------- potentzia eta energia ----------
  potentzia: {
    izena: 'Potentzia elektrikoa',
    sortu(m) {
      if (m === 1) {
        const V = pick([6, 12, 24]), I = pick([0.5, 1, 2, 3]), P = V * I;
        return { q: `${b(V, 0)} V-ko pila bati lotutako motor batek ${b(I)} A kontsumitzen ditu. Zein da haren potentzia?`, erantzuna: P, unitatea: 'W',
          pista: 'Potentzia = tentsioa · intentsitatea: P = V · I.', ebazpena: ['P = V · I', `P = ${fmt(V)} V · ${fmt(I)} A = ${fmt(P)} W`] };
      }
      if (m === 2) {
        const [izena, P] = pick([['mikrouhin-labea', 920], ['garbigailua', 2070], ['ile-lehorgailua', 1150], ['labea', 2300], ['plantxa', 1840]]), I = P / 230;
        return { q: `${b(P, 0)} W-eko ${izena} bat etxeko sarera (230 V) konektatuta dago. Zenbat korronte kontsumitzen du?`, erantzuna: I, unitatea: 'A',
          pista: 'P = V · I → I = P / V.', ebazpena: ['I = P / V', `I = ${P} W / 230 V = ${fmt(I)} A`] };
      }
      if (Math.random() < 0.5) {
        const I = pick([0.5, 2, 3, 1.5]), Rv = pick([4, 10, 20, 8]), P = I * I * Rv;
        return { q: `${b(Rv, 0)} Ω-eko erresistentzia batetik ${b(I)} A igarotzen dira. Zenbat potentzia xahutzen du bero moduan (Joule efektua)?`, erantzuna: P, unitatea: 'W',
          pista: 'P = V · I eta V = I · R → P = I² · R.', ebazpena: ['P = I² · R', `P = ${fmt(I)}² · ${Rv} = ${fmt(I * I)} · ${Rv} = ${fmt(P)} W`] };
      }
      const V = pick([12, 24, 230]), Rv = V === 230 ? pick([23, 46, 529]) : pick([6, 12, 24, 48]), P = V * V / Rv;
      return { q: `${b(Rv, 0)} Ω-eko berogailu-erresistentzia bat ${b(V, 0)} V-ra konektatzen da. Kalkulatu haren potentzia.`, erantzuna: P, unitatea: 'W',
        pista: 'P = V · I eta I = V / R → P = V² / R.', ebazpena: ['P = V² / R', `P = ${V}² / ${Rv} = ${fmt(V * V)} / ${Rv} = ${fmt(P)} W`] };
    }
  },

  energia: {
    izena: 'Energia eta kostua',
    sortu(m) {
      if (m === 1) {
        const P = pick([60, 100, 500, 1000, 2000]), h = pick([2, 3, 5, 8]), E = P / 1000 * h;
        return { q: `${b(P, 0)} W-eko aparailu bat ${b(h, 0)} orduz piztuta egon da. Zenbat energia kontsumitu du, kWh-tan?`, erantzuna: E, unitatea: 'kWh',
          pista: 'E = P · t, P kilowatt-etan (W / 1000) eta t ordutan.', ebazpena: [`P = ${P} W = ${fmt(P / 1000, 3)} kW`, `E = P · t = ${fmt(P / 1000, 3)} kW · ${h} h = ${fmt(E)} kWh`] };
      }
      if (m === 2) {
        const P = pick([1500, 2000, 800, 1200]), h = pick([1, 2, 3]), d = 30, p = pick([0.15, 0.2, 0.25]), E = P / 1000 * h * d, K = E * p;
        return { q: `${b(P, 0)} W-eko berogailu bat egunero ${b(h, 0)} orduz erabiltzen da, ${b(d, 0)} egunez. Argindarra ${b(p)} €/kWh ordaintzen bada, zenbat kostatzen da?`, erantzuna: K, unitatea: '€',
          pista: 'Lehenik energia guztia kWh-tan (kW · h egunean · egunak), gero bider prezioa.',
          ebazpena: [`E = ${fmt(P / 1000)} kW · ${h} h · ${d} egun = ${fmt(E)} kWh`, `Kostua = ${fmt(E)} kWh · ${fmt(p)} €/kWh = ${fmt(K)} €`] };
      }
      const [Pz, Pl] = pick([[60, 9], [100, 14], [40, 6]]), h = pick([3, 4, 5]), p = pick([0.18, 0.22]), E = (Pz - Pl) / 1000 * h * 365, K = E * p;
      return { q: `Bonbilla gori bat (${b(Pz, 0)} W) argi bera ematen duen LED batekin (${b(Pl, 0)} W) ordezkatu dugu. Egunean ${b(h, 0)} orduz pizten bada eta argindarra ${b(p)} €/kWh bada, zenbat euro aurrezten dira urtean (365 egun)?`, erantzuna: K, unitatea: '€',
        pista: 'Potentzia-aldea (W) → kW, bider urteko orduak, bider prezioa.',
        ebazpena: [`ΔP = ${Pz} − ${Pl} = ${Pz - Pl} W = ${fmt((Pz - Pl) / 1000, 3)} kW`, `t = ${h} h · 365 = ${h * 365} h`, `E = ${fmt((Pz - Pl) / 1000, 3)} · ${h * 365} = ${fmt(E)} kWh`, `Aurrezkia = ${fmt(E)} · ${fmt(p)} = ${fmt(K)} €`] };
    }
  },

  bonbilla: {
    izena: 'Bonbillaren ezaugarriak',
    sortu(m) {
      const [V, P] = pick([[6, 3], [12, 6], [12, 24], [4.5, 0.9], [230, 60], [24, 12]]);
      if (m === 1) {
        return { q: `Bonbilla batek <strong>${fmt(V)} V · ${fmt(P)} W</strong> dio. Zenbat korronte kontsumitzen du bere tentsioan lan egiten duenean?`, erantzuna: P / V, unitatea: 'A', hamartarrak: 3,
          pista: 'P = V · I → I = P / V.', ebazpena: ['I = P / V', `I = ${fmt(P)} W / ${fmt(V)} V = ${fmt(P / V, 3)} A`] };
      }
      const Rv = V * V / P;
      if (m === 2) {
        return { q: `Bonbilla batek <strong>${fmt(V)} V · ${fmt(P)} W</strong> dio. Zein da haren erresistentzia piztuta dagoenean?`, erantzuna: Rv, unitatea: 'Ω',
          pista: 'P = V² / R → R = V² / P.', ebazpena: ['R = V² / P', `R = ${fmt(V)}² / ${fmt(P)} = ${fmt(V * V)} / ${fmt(P)} = ${fmt(Rv)} Ω`] };
      }
      const V2 = V / 2, P2 = V2 * V2 / Rv;
      return { q: `<strong>${fmt(V)} V · ${fmt(P)} W</strong> bonbilla bat ${b(V2)} V-ra konektatzen dugu. Erresistentzia aldatzen ez dela suposatuta, zenbateko potentzia izango du?`, erantzuna: P2, unitatea: 'W', hamartarrak: 3,
        pista: 'Kalkulatu R = V² / P ezaugarrietatik, eta gero P\' = V\'² / R.', ebazpena: [`R = ${fmt(V)}² / ${fmt(P)} = ${fmt(Rv)} Ω`, `P' = ${fmt(V2)}² / ${fmt(Rv)} = ${fmt(P2, 3)} W (laurdena: tentsioa erdia → potentzia laurdena)`] };
    }
  },

  // ---------- seriea ----------
  'seriea-req': {
    izena: 'Seriea: erresistentzia baliokidea',
    sortu(m) {
      if (m === 3) {
        const r1 = pick([10, 20, 30]), r2 = pick([15, 25, 40]), r3 = pick([5, 10, 30]), I = pick([0.1, 0.2, 0.25, 0.5]), E = I * (r1 + r2 + r3);
        return { q: `Hiru erresistentzia seriean ${b(E)} V-ko pila bati lotuta daude eta ${b(I)} A igarotzen dira. R1 = ${b(r1, 0)} Ω eta R2 = ${b(r2, 0)} Ω badira, zenbat balio du R3-k?`,
          erantzuna: r3, unitatea: 'Ω', pista: 'Lehenik Rbaliokidea = E / I; gero kendu ezagutzen dituzunak.',
          ebazpena: [`Rb = E / I = ${fmt(E)} / ${fmt(I)} = ${fmt(r1 + r2 + r3)} Ω`, `R3 = Rb − R1 − R2 = ${r1 + r2 + r3} − ${r1} − ${r2} = ${r3} Ω`] };
      }
      const n = m === 1 ? 2 : 3;
      const vals = Array.from({ length: n }, () => pick(m === 1 ? [2, 3, 4, 5, 6, 10, 12] : [10, 22, 47, 100, 150, 220]));
      const tree = Sr(...vals.map((v, i) => R('R' + (i + 1), v)));
      const Rb = baliokidea(tree);
      return { q: `Kalkulatu seriean dauden erresistentzia hauen erresistentzia baliokidea.${fig(eskemaSVG(tree, {}))}`, erantzuna: Rb, unitatea: 'Ω',
        pista: 'Seriean erresistentziak batu egiten dira: Rb = R1 + R2 + …', ebazpena: [`Rb = ${vals.map((_, i) => 'R' + (i + 1)).join(' + ')}`, `Rb = ${vals.join(' + ')} = ${fmt(Rb)} Ω`] };
    }
  },

  'seriea-i': {
    izena: 'Seriea: intentsitatea',
    sortu(m) {
      const n = m === 1 ? 2 : 3;
      let vals, E, I;
      do {
        vals = Array.from({ length: n }, () => pick([2, 4, 5, 6, 8, 10, 12, 20]));
        I = pick(m === 1 ? [0.5, 1, 2] : [0.25, 0.4, 0.5, 0.75]);
        E = I * vals.reduce((s, v) => s + v, 0);
      } while (E > 48);
      const tree = Sr(...vals.map((v, i) => R('R' + (i + 1), v)));
      const Rb = baliokidea(tree);
      return { q: `Zein korronte igarotzen da zirkuitu honetatik?${fig(eskemaSVG(tree, { E }))}`, erantzuna: I, unitatea: 'A',
        pista: 'Lehenik erresistentzia baliokidea (batu), gero Ohm-en legea: I = E / Rb.', ebazpena: [`Rb = ${vals.join(' + ')} = ${fmt(Rb)} Ω`, `I = E / Rb = ${fmt(E)} / ${fmt(Rb)} = ${fmt(I)} A (berdina erresistentzia guztietan)`] };
    }
  },

  'seriea-v': {
    izena: 'Seriea: tentsio bat',
    sortu(m) {
      if (m === 3) {
        const r1 = pick([10, 20, 30, 40]), r2 = pick([10, 20, 50, 60]), I = pick([0.1, 0.2, 0.3]), V2 = I * r2, E = I * (r1 + r2);
        const tree = Sr(R('R1', r1), R('R2', r2));
        return { q: `Zirkuitu honetan voltimetroak ${b(V2)} V neurtzen ditu R2-ren muturretan. Zenbatekoa da pilaren tentsioa?${fig(eskemaSVG(tree, {}))}`, erantzuna: E, unitatea: 'V',
          pista: 'R2-ren datuekin kalkulatu I (seriean berdina da), eta gero E = I · (R1 + R2).',
          ebazpena: [`I = V2 / R2 = ${fmt(V2)} / ${r2} = ${fmt(I)} A`, `E = I · (R1 + R2) = ${fmt(I)} · ${r1 + r2} = ${fmt(E)} V`] };
      }
      const n = m === 1 ? 2 : 3;
      const vals = Array.from({ length: n }, () => pick([2, 3, 4, 6, 10, 12]));
      const Rb = vals.reduce((s, v) => s + v, 0), I = pick([0.5, 1, 1.5]), E = I * Rb;
      const k = randInt(0, n - 1), Vk = I * vals[k];
      const tree = Sr(...vals.map((v, i) => R('R' + (i + 1), v)));
      return { q: `Zenbateko tentsioa dago <strong>R${k + 1}</strong>-en muturren artean?${fig(eskemaSVG(tree, { E }))}`, erantzuna: Vk, unitatea: 'V',
        pista: 'Kalkulatu korrontea (I = E / Rb) eta gero V = I · R.',
        ebazpena: [`Rb = ${vals.join(' + ')} = ${Rb} Ω`, `I = ${fmt(E)} / ${Rb} = ${fmt(I)} A`, `V${k + 1} = I · R${k + 1} = ${fmt(I)} · ${vals[k]} = ${fmt(Vk)} V`] };
    }
  },

  // ---------- paraleloa ----------
  'paraleloa-req': {
    izena: 'Paraleloa: erresistentzia baliokidea',
    sortu(m) {
      let vals;
      if (m === 1) { const r = pick([10, 20, 40, 60, 100]); vals = [r, r]; }
      else if (m === 2) vals = shuffle(pick(BIKOTEAK));
      else vals = shuffle(pick(HIRUKOTEAK));
      const tree = Pr(...vals.map((v, i) => R('R' + (i + 1), v)));
      const Rb = baliokidea(tree);
      const lerroak = vals.length === 2
        ? ['Bi erresistentzia paraleloan: Rb = R1 · R2 / (R1 + R2)', `Rb = ${vals[0]} · ${vals[1]} / (${vals[0]} + ${vals[1]}) = ${vals[0] * vals[1]} / ${vals[0] + vals[1]} = ${fmt(Rb)} Ω`]
        : ['1/Rb = 1/R1 + 1/R2 + 1/R3', `1/Rb = 1/${vals[0]} + 1/${vals[1]} + 1/${vals[2]} = ${fmt(1 / Rb, 4)}`, `Rb = 1 / ${fmt(1 / Rb, 4)} = ${fmt(Rb)} Ω`];
      if (m === 1) lerroak.push('Bi erresistentzia berdin paraleloan: baten erdia.');
      return { q: `Kalkulatu paraleloan dauden erresistentzia hauen erresistentzia baliokidea.${fig(eskemaSVG(tree, {}))}`, erantzuna: Rb, unitatea: 'Ω',
        pista: 'Paraleloan: 1/Rb = 1/R1 + 1/R2 + … Baliokidea txikiena baino txikiagoa da beti.', ebazpena: lerroak };
    }
  },

  'paraleloa-i': {
    izena: 'Paraleloa: korronteak',
    sortu(m) {
      const vals = m === 3 ? shuffle(pick(HIRUKOTEAK)) : shuffle(pick(BIKOTEAK));
      const E = pick([6, 12, 24].filter(e => vals.every(v => (e / v * 100) % 1 === 0)).concat([60]).slice(0, 3));
      const tree = Pr(...vals.map((v, i) => R('R' + (i + 1), v)));
      const Is = vals.map(v => E / v), It = Is.reduce((s, x) => s + x, 0);
      if (m === 1) {
        const k = randInt(0, vals.length - 1);
        return { q: `Zein korronte igarotzen da <strong>R${k + 1}</strong>-etik?${fig(eskemaSVG(tree, { E }))}`, erantzuna: Is[k], unitatea: 'A', hamartarrak: 3,
          pista: 'Paraleloan adar guztiek pilaren tentsio bera dute: I = E / R.', ebazpena: [`V${k + 1} = E = ${E} V`, `I${k + 1} = ${E} / ${vals[k]} = ${fmt(Is[k], 3)} A`] };
      }
      if (m === 2) {
        return { q: `Zein korronte ematen du pilak?${fig(eskemaSVG(tree, { E }))}`, erantzuna: It, unitatea: 'A', hamartarrak: 3,
          pista: 'Kalkulatu adar bakoitzeko korrontea (E / R) eta batu. Edo: I = E / Rb.',
          ebazpena: [...vals.map((v, i) => `I${i + 1} = ${E} / ${v} = ${fmt(Is[i], 3)} A`), `I = ${Is.map(x => fmt(x, 3)).join(' + ')} = ${fmt(It, 3)} A`] };
      }
      return { q: `Hiru erresistentzia paraleloan ${b(E, 0)} V-ra daude. R1 = ${b(vals[0], 0)} Ω eta R2 = ${b(vals[1], 0)} Ω dira, eta pilak ${b(It, 3)} A ematen ditu. Zenbat balio du R3-k?`, erantzuna: vals[2], unitatea: 'Ω',
        pista: 'Kalkulatu I1 eta I2; I3 = I − I1 − I2; eta R3 = E / I3.',
        ebazpena: [`I1 = ${E} / ${vals[0]} = ${fmt(Is[0], 3)} A;  I2 = ${E} / ${vals[1]} = ${fmt(Is[1], 3)} A`, `I3 = ${fmt(It, 3)} − ${fmt(Is[0], 3)} − ${fmt(Is[1], 3)} = ${fmt(Is[2], 3)} A`, `R3 = E / I3 = ${E} / ${fmt(Is[2], 3)} = ${fmt(vals[2])} Ω`] };
    }
  },

  // ---------- mistoak ----------
  'mistoa-req': {
    izena: 'Mistoa: erresistentzia baliokidea',
    sortu(m) {
      const tree = mistoa(m), Rb = baliokidea(tree);
      return { q: `Kalkulatu zirkuitu mistoaren erresistentzia baliokidea.${fig(eskemaSVG(tree, {}))}`, erantzuna: Rb, unitatea: 'Ω',
        pista: 'Hasi barruko taldeetatik: seriean daudenak batu, paraleloan daudenak R1·R2/(R1+R2), eta errepikatu erresistentzia bakarra geratu arte.', ebazpena: reqLerroak(tree) };
    }
  },

  'mistoa-i': {
    izena: 'Mistoa: pilaren korrontea',
    sortu(m) {
      const tree = mistoa(m), Rb = baliokidea(tree);
      const I = pick([0.5, 1, 1.5, 2].filter(i => i * Rb <= 60)) ?? 0.5, E = I * Rb;
      return { q: `Zein korronte ematen du pilak?${fig(eskemaSVG(tree, { E }))}`, erantzuna: I, unitatea: 'A',
        pista: 'Lehenik erresistentzia baliokidea, gero I = E / Rb.', ebazpena: [...reqLerroak(tree), `I = E / Rb = ${fmt(E)} / ${fmt(Rb)} = ${fmt(I)} A`] };
    }
  },

  'mistoa-adarra': {
    izena: 'Mistoa: adar bateko tentsioa eta korrontea',
    sortu(m) {
      const tree = mistoa(Math.max(2, m)), Rb = baliokidea(tree);
      const I = pick([0.5, 1, 2].filter(i => i * Rb <= 60)) ?? 0.5, E = I * Rb;
      const sol = ebatzi(tree, E);
      const leaves = Object.keys(sol);
      const k = pick(leaves), s = sol[k];
      const tentsioa = m < 3 && Math.random() < 0.5;
      const lerroak = [...reqLerroak(tree), `I = E / Rb = ${fmt(E)} / ${fmt(Rb)} = ${fmt(I)} A`];
      lerroak.push(...bideLerroak(tree, E, k));
      lerroak.push(`${k}: V = ${fmt(s.V, 3)} V, I = V / R = ${fmt(s.V, 3)} / ${fmt(s.R)} = ${fmt(s.I, 3)} A`);
      return { q: `Zirkuitu honetan, zenbateko ${tentsioa ? 'tentsioa dago' : 'korrontea igarotzen da'} <strong>${k}</strong>${tentsioa ? '-en muturren artean' : '-etik'}?${fig(eskemaSVG(tree, { E }))}`,
        erantzuna: tentsioa ? s.V : s.I, unitatea: tentsioa ? 'V' : 'A', hamartarrak: 3,
        pista: 'Kalkulatu pilaren korrontea, gero taldeen tentsioak: seriean tentsioa banatzen da, paraleloan korrontea.', ebazpena: lerroak };
    }
  },

  // ---------- materialak ----------
  erresistibitatea: {
    izena: 'Erresistibitatea: R = ρ · L / S',
    sortu(m) {
      if (m === 3) {
        const Rv = pick([10, 20, 44, 50]), d = pick([0.2, 0.3, 0.5]), S = Math.PI * d * d / 4, L = Rv * S / 1.1;
        return { q: `Nikromozko hari batekin (ρ = 1,1 Ω·mm²/m) ${b(Rv, 0)} Ω-eko berogailu-erresistentzia egin nahi da. Hariaren diametroa ${b(d)} mm bada, zenbat metro behar dira?`, erantzuna: L, unitatea: 'm', hamartarrak: 3,
          pista: 'Lehenik sekzioa: S = π · d² / 4 (mm²). Gero L = R · S / ρ.',
          ebazpena: [`S = π · ${fmt(d)}² / 4 = ${fmt(S, 4)} mm²`, `L = R · S / ρ = ${Rv} · ${fmt(S, 4)} / 1,1 = ${fmt(L, 3)} m`] };
      }
      const [mat, rho] = m === 1 ? MATERIALAK[0] : pick(MATERIALAK);
      const L = m === 1 ? pick([10, 50, 100, 200]) : pick([2, 5, 20, 40]);
      const S = m === 1 ? pick([0.5, 1, 1.5, 2.5]) : pick([0.1, 0.2, 0.5, 1]);
      const Rv = rho * L / S;
      return { q: `Kalkulatu ${mat}zko hari baten erresistentzia: luzera ${b(L, 0)} m, sekzioa ${b(S)} mm² eta erresistibitatea ρ = ${b(rho, 3)} Ω·mm²/m.`, erantzuna: Rv, unitatea: 'Ω', hamartarrak: 3,
        pista: 'R = ρ · L / S. Unitateak: ρ Ω·mm²/m-tan, L metrotan eta S mm²-tan → R ohmetan.',
        ebazpena: ['R = ρ · L / S', `R = ${fmt(rho, 3)} · ${L} / ${fmt(S)} = ${fmt(Rv, 3)} Ω`] };
    }
  },

  'kolore-kodea': {
    izena: 'Erresistentzien kolore-kodea',
    sortu(m) {
      const d1 = randInt(1, 9), d2 = randInt(0, 9);
      const mult = m === 1 ? randInt(0, 2) : randInt(1, 4);
      const tol = m === 3 ? pick(['urrea', 'zilarra']) : 'urrea';
      const Rv = (d1 * 10 + d2) * 10 ** mult;
      const izenak = [KOLOREAK[d1][0], KOLOREAK[d2][0], KOLOREAK[mult][0], tol].join(', ');
      const irudia = fig(erresistentziaSVG([d1, d2, mult, tol], 260));
      const hasiera = [`1. eta 2. banda: ${KOLOREAK[d1][0]} (${d1}) eta ${KOLOREAK[d2][0]} (${d2}) → ${d1}${d2}`, `3. banda (biderkatzailea): ${KOLOREAK[mult][0]} → × ${fmt(10 ** mult, 0)}`, `R = ${d1}${d2} · ${fmt(10 ** mult, 0)} = ${fmt(Rv, 0)} Ω`];
      if (m === 1) return { q: `Erresistentzia baten koloreak hauek dira: <strong>${izenak}</strong>. Zein da haren balioa ohmetan?${irudia}`, erantzuna: Rv, unitatea: 'Ω',
        pista: 'Beltza 0, marroia 1, gorria 2, laranja 3, horia 4, berdea 5, urdina 6, morea 7, grisa 8, zuria 9. Hirugarren bandak zenbat zero gehitu esaten du.', ebazpena: hasiera };
      if (m === 2) return { q: `Erresistentzia baten koloreak: <strong>${izenak}</strong>. Eman balioa <strong>kiloohmetan</strong>.${irudia}`, erantzuna: Rv / 1000, unitatea: 'kΩ', hamartarrak: 3,
        pista: 'Kalkulatu ohmetan eta zatitu 1000z.', ebazpena: [...hasiera, `R = ${fmt(Rv / 1000, 3)} kΩ`] };
      const p = tol === 'urrea' ? 5 : 10, max = Rv * (1 + p / 100);
      return { q: `Erresistentzia baten koloreak: <strong>${izenak}</strong>. Laugarren bandak tolerantzia adierazten du (urrea ±5 %, zilarra ±10 %). Zein da haren balio <strong>maximoa</strong> ohmetan?${irudia}`, erantzuna: max, unitatea: 'Ω',
        pista: 'Balio nominala kalkulatu, eta gehitu tolerantziaren ehunekoa.', ebazpena: [...hasiera, `Tolerantzia: ${tol} → ±${p} %`, `Rmax = ${fmt(Rv, 0)} · ${fmt(1 + p / 100)} = ${fmt(max)} Ω`] };
    }
  },

  zatitzailea: {
    izena: 'Tentsio-zatitzailea',
    sortu(m) {
      if (m === 3) {
        const E = 12, Rk = 10, RL = pick([10, 20, 40, 90]), Rp = Rk * RL / (Rk + RL), V = E * Rp / (Rk + Rp);
        return { q: `Tentsio-zatitzaile batek R₁ = R₂ = ${b(Rk, 0)} kΩ ditu eta ${b(E, 0)} V-ra dago. Irteeran (R₂-ren muturretan) ${b(RL, 0)} kΩ-eko karga bat konektatzen da. Zein da irteerako tentsioa?`, erantzuna: V, unitatea: 'V', hamartarrak: 3,
          pista: 'Karga R₂-rekin paraleloan dago: kalkulatu R₂ ∥ RL, eta gero zatitzailearen formula.',
          ebazpena: [`R₂ ∥ RL = ${Rk} · ${RL} / (${Rk} + ${RL}) = ${fmt(Rp, 3)} kΩ`, `V = E · Rp / (R₁ + Rp) = ${E} · ${fmt(Rp, 3)} / (${Rk} + ${fmt(Rp, 3)}) = ${fmt(V, 3)} V`, `Kargarik gabe ${fmt(E / 2)} V lirateke: kargak tentsioa jaisten du.`] };
      }
      const E = m === 1 ? pick([6, 12]) : pick([5, 9, 12]);
      const [R1, R2] = m === 1 ? pick([[10, 10], [10, 20], [20, 10], [100, 200]]) : [pick([1, 2.2, 4.7, 10]), pick([1, 2.2, 4.7, 10])];
      const u = m === 1 ? 'Ω' : 'kΩ', V = E * R2 / (R1 + R2);
      return { q: `Tentsio-zatitzaile batean R₁ = ${b(R1)} ${u} (goian) eta R₂ = ${b(R2)} ${u} (behean) daude, ${b(E, 0)} V-ko pila bati lotuta. Zein da R₂-ren muturretako irteera-tentsioa?${fig(eskemaSVG(Sr(R('R1', R1), R('R2', R2)), { E, balioak: m === 1 }))}`,
        erantzuna: V, unitatea: 'V', hamartarrak: 3, pista: 'V_irteera = E · R₂ / (R₁ + R₂).',
        ebazpena: ['V = E · R₂ / (R₁ + R₂)', `V = ${E} · ${fmt(R2)} / (${fmt(R1)} + ${fmt(R2)}) = ${fmt(V, 3)} V`] };
    }
  },

  neurgailua: {
    izena: 'Neurgailuen irakurketak',
    sortu(m) {
      if (m === 3) {
        const E = 10, Rk = 10, Rv = pick([10, 20, 100]), Rp = Rk * Rv / (Rk + Rv), V = E * Rp / (Rk + Rp);
        return { q: `Bi ${b(Rk, 0)} kΩ-eko erresistentzia seriean ${b(E, 0)} V-ra daude. R₂-ren tentsioa ${b(Rv, 0)} kΩ-eko barne-erresistentzia duen voltimetro batekin neurtzen da. Zer irakurriko du voltimetroak?`, erantzuna: V, unitatea: 'V', hamartarrak: 3,
          pista: 'Voltimetroa R₂-rekin paraleloan dago eta zirkuitua aldatzen du: R₂ ∥ Rv kalkulatu.',
          ebazpena: [`R₂ ∥ Rv = ${Rk} · ${Rv} / (${Rk} + ${Rv}) = ${fmt(Rp, 3)} kΩ`, `V = ${E} · ${fmt(Rp, 3)} / (${Rk} + ${fmt(Rp, 3)}) = ${fmt(V, 3)} V`, `Voltimetro idealarekin ${fmt(E / 2)} V irakurriko lirateke.`] };
      }
      const E = pick([6, 9, 12]), R1 = pick([100, 200, 300]), R2 = pick([100, 200, 300, 600]);
      const I = E / (R1 + R2), tree = Sr(R('R1', R1), R('R2', R2));
      if (m === 1) return { q: `Zirkuitu honetan amperimetroa seriean dago. Zer irakurriko du, <strong>miliamperetan</strong>?${fig(eskemaSVG(tree, { E }))}`, erantzuna: I * 1000, unitatea: 'mA', hamartarrak: 2,
        pista: 'Amperimetroak zirkuituko korrontea neurtzen du: I = E / (R₁ + R₂), eta gero mA-ra pasatu.', ebazpena: [`I = ${E} / (${R1} + ${R2}) = ${fmt(I, 4)} A`, `I = ${fmt(I * 1000, 2)} mA`] };
      return { q: `Voltimetroa <strong>R₂</strong>-ren muturretan dago. Zer irakurriko du?${fig(eskemaSVG(tree, { E }))}`, erantzuna: I * R2, unitatea: 'V', hamartarrak: 3,
        pista: 'Korrontea kalkulatu (seriea) eta V₂ = I · R₂.', ebazpena: [`I = ${E} / ${R1 + R2} = ${fmt(I, 4)} A`, `V₂ = ${fmt(I, 4)} · ${R2} = ${fmt(I * R2, 3)} V`] };
    }
  },

  // ---------- Kirchhoff ----------
  kcl: {
    izena: 'Korronteen legea (nodoak)',
    sortu(m) {
      if (m === 1) {
        const a = pick([0.5, 1, 1.5, 2, 2.5]), c = pick([0.5, 1, 2, 3]);
        return { q: `Nodo honetara bi korronte sartzen dira eta bat irteten da. Zenbatekoa da I₃?${fig(nodoSVG([{ izena: 'I₁', testua: `${fmt(a)} A`, sartu: true }, { izena: 'I₂', testua: `${fmt(c)} A`, sartu: true }, { izena: 'I₃', testua: '?', sartu: false }]))}`,
          erantzuna: a + c, unitatea: 'A', pista: 'Nodo batera sartzen den korronte guztia irten egiten da: ΣI sartu = ΣI irten.', ebazpena: ['I₃ = I₁ + I₂', `I₃ = ${fmt(a)} + ${fmt(c)} = ${fmt(a + c)} A`] };
      }
      if (m === 2) {
        const c = pick([0.5, 1, 1.5]), d = pick([0.5, 1, 2, 2.5]), a = pick([0.5, 1, 1.5, 2].filter(x => x < c + d)), bb = c + d - a;
        return { q: `Zenbatekoa da I₄?${fig(nodoSVG([{ izena: 'I₁', testua: `${fmt(a)} A`, sartu: true }, { izena: 'I₃', testua: `${fmt(c)} A`, sartu: false }, { izena: 'I₂', testua: `${fmt(bb)} A`, sartu: true }, { izena: 'I₄', testua: '?', sartu: false }]))}`,
          erantzuna: d, unitatea: 'A', pista: 'Sartzen direnak batu, irteten direnak batu, eta berdindu.', ebazpena: ['I₁ + I₂ = I₃ + I₄', `${fmt(a)} + ${fmt(bb)} = ${fmt(c)} + I₄`, `I₄ = ${fmt(a + bb)} − ${fmt(c)} = ${fmt(d)} A`] };
      }
      let i1, i2, o3, o4, net;
      do { i1 = randInt(8, 40) * 10; i2 = randInt(3, 30) * 10; o3 = randInt(5, 35) * 10; o4 = randInt(2, 20) * 10; net = i1 + i2 - o3 - o4; } while (Math.abs(net) < 20);
      return { q: `Nodo batera I₁ = ${b(i1, 0)} mA eta I₂ = ${b(i2, 0)} mA sartzen dira, eta I₃ = ${b(o3, 0)} mA eta I₄ = ${b(o4, 0)} mA irteten dira. Bosgarren adarraren noranzkoa ez dakigu. Zenbatekoa da I₅-en balioa (mA)?${fig(nodoSVG([{ izena: 'I₁', testua: `${i1} mA`, sartu: true }, { izena: 'I₂', testua: `${i2} mA`, sartu: true }, { izena: 'I₃', testua: `${o3} mA`, sartu: false }, { izena: 'I₄', testua: `${o4} mA`, sartu: false }, { izena: 'I₅', testua: '?', sartu: null }]))}`,
        erantzuna: Math.abs(net), unitatea: 'mA', pista: 'Suposatu I₅ irteten dela: ΣI sartu − ΣI irten = 0. Emaitza negatiboa bada, sartu egiten da.',
        ebazpena: [`Irteten dela suposatuta: ${i1} + ${i2} = ${o3} + ${o4} + I₅`, `I₅ = ${i1 + i2} − ${o3 + o4} = ${net < 0 ? '−' : ''}${Math.abs(net)} mA`, net > 0 ? `Positiboa: I₅ irten egiten da, ${Math.abs(net)} mA.` : `Negatiboa: I₅ nodora sartzen da, ${Math.abs(net)} mA.`] };
    }
  },

  kvl: {
    izena: 'Tentsioen legea (begiztak)',
    sortu(m) {
      if (m === 3) {
        let E1, E2, V1, V2;
        do { E1 = pick([12, 18, 24]); E2 = pick([4.5, 6, 9]); V1 = pick([1.5, 2, 3, 4, 5]); V2 = E1 - E2 - V1; } while (V2 <= 0.5);
        return { q: `Begizta honetan bi pila elkarren aurka daude eta korrontea erlojuaren orratzen noranzkoan doa (E₁ handiagoa delako). R₁-en tentsioa ${b(V1)} V bada, zenbatekoa da R₂-rena?${fig(begiztaSVG([{ mota: 'E', izena: 'E₁', testua: `${fmt(E1)} V` }, { mota: 'R', izena: 'V₁', testua: `${fmt(V1)} V` }, { mota: 'E', izena: 'E₂', testua: `${fmt(E2)} V` }, { mota: 'R', izena: 'V₂', testua: '?' }]))}`,
          erantzuna: V2, unitatea: 'V', pista: 'Ibilbidean: E₁-ek potentziala igotzen du, E₂-k (kontrako noranzkoan) jaisten du, eta erresistentziek jaisten dute. Batura zero.',
          ebazpena: ['E₁ − V₁ − E₂ − V₂ = 0', `V₂ = E₁ − E₂ − V₁ = ${fmt(E1)} − ${fmt(E2)} − ${fmt(V1)} = ${fmt(V2)} V`] };
      }
      const E = pick([6, 9, 12, 24]);
      if (m === 1) {
        const V1 = pick([1.5, 2, 3, 4, 4.5].filter(v => v < E));
        return { q: `Begizta honetan pilaren tentsioa ${b(E, 0)} V da eta V₁ = ${b(V1)} V. Zenbatekoa da V₂?${fig(begiztaSVG([{ mota: 'E', izena: 'E', testua: `${E} V` }, { mota: 'R', izena: 'V₁', testua: `${fmt(V1)} V` }, { mota: 'R', izena: 'V₂', testua: '?' }]))}`,
          erantzuna: E - V1, unitatea: 'V', pista: 'Pilak igotzen duena erresistentziek jaisten dute: E = V₁ + V₂.', ebazpena: ['E = V₁ + V₂', `V₂ = ${E} − ${fmt(V1)} = ${fmt(E - V1)} V`] };
      }
      let V1, V2;
      do { V1 = pick([1, 1.5, 2, 3, 4]); V2 = pick([0.5, 1, 2, 2.5, 3]); } while (E - V1 - V2 <= 0.4);
      return { q: `Zenbatekoa da V₃ begizta honetan?${fig(begiztaSVG([{ mota: 'E', izena: 'E', testua: `${E} V` }, { mota: 'R', izena: 'V₁', testua: `${fmt(V1)} V` }, { mota: 'R', izena: 'V₂', testua: `${fmt(V2)} V` }, { mota: 'R', izena: 'V₃', testua: '?' }]))}`,
        erantzuna: E - V1 - V2, unitatea: 'V', pista: 'Begizta itxi batean: ΣE = ΣV (edo potentzial-aldaketen batura = 0).', ebazpena: ['E − V₁ − V₂ − V₃ = 0', `V₃ = ${E} − ${fmt(V1)} − ${fmt(V2)} = ${fmt(E - V1 - V2)} V`] };
    }
  },

  sareak: {
    izena: 'Sare-korronteen metodoa',
    sortu(m) {
      const z = sareZirkuitua();
      const I2 = z.J1 - z.J2;
      if (m === 1) {
        return { q: `Zirkuitu honetako korronteen noranzkoak irudian daude. Goiko nodoan Kirchhoff-en korronteen legea aplikatuta, zenbatekoa da I₂?${fig(bisareSVG({ ...z, adarrak: { I1: z.J1, I3: z.J2, I2: '?' } }))}`,
          erantzuna: I2, unitatea: 'A', pista: 'Goiko nodora I₁ sartzen da; I₂ eta I₃ irteten dira.', ebazpena: ['I₁ = I₂ + I₃', `I₂ = ${fmt(z.J1)} − ${fmt(z.J2)} = ${fmt(I2)} A`] };
      }
      if (m === 2) {
        return { q: `Sare-korronteak J₁ = ${b(z.J1)} A eta J₂ = ${b(z.J2)} A dira (erlojuaren orratzen noranzkoan). Zenbateko tentsioa dago R₂-ren muturretan?${fig(bisareSVG({ ...z, sareak: true }))}`,
          erantzuna: I2 * z.R2, unitatea: 'V', pista: 'R₂ bi sareen artean dago: bertatik J₁ − J₂ igarotzen da.', ebazpena: [`I₂ = J₁ − J₂ = ${fmt(z.J1)} − ${fmt(z.J2)} = ${fmt(I2)} A`, `V₂ = I₂ · R₂ = ${fmt(I2)} · ${z.R2} = ${fmt(I2 * z.R2)} V`] };
      }
      const a = z.R1 + z.R2, d = z.R2 + z.R3, D = a * d - z.R2 * z.R2, D1 = z.E1 * d - z.R2 * z.E2, D2 = z.R2 * z.E1 - a * z.E2;
      const galdera = pick(['I2', 'J1', 'J2']);
      const erantzuna = { I2, J1: z.J1, J2: z.J2 }[galdera];
      const testua = { I2: 'R₂-tik (erdiko adarretik) igarotzen den korrontea', J1: 'E₁-etik igarotzen den korrontea (J₁)', J2: 'R₃-tik igarotzen den korrontea (J₂)' }[galdera];
      return { q: `Ebatzi zirkuitua sare-korronteen metodoaz (J₁ eta J₂ erlojuaren orratzen noranzkoan). Zenbatekoa da ${testua}?${fig(bisareSVG({ ...z, sareak: true }))}`,
        erantzuna, unitatea: 'A', hamartarrak: 3, pista: '1. sarea: (R₁+R₂)·J₁ − R₂·J₂ = E₁. 2. sarea: −R₂·J₁ + (R₂+R₃)·J₂ = −E₂. Ebatzi Cramer-en erregelaz.',
        ebazpena: [`${a}·J₁ − ${z.R2}·J₂ = ${fmt(z.E1)}`, `−${z.R2}·J₁ + ${d}·J₂ = −${fmt(z.E2)}`, `Δ = ${a}·${d} − ${z.R2}² = ${D}`, `J₁ = (${fmt(z.E1)}·${d} − ${z.R2}·${fmt(z.E2)}) / ${D} = ${fmt(D1 / D, 3)} A`, `J₂ = (${z.R2}·${fmt(z.E1)} − ${a}·${fmt(z.E2)}) / ${D} = ${fmt(D2 / D, 3)} A`, `I₂ = J₁ − J₂ = ${fmt(I2, 3)} A (behera)`] };
    }
  },

  sorgailua: {
    izena: 'Sorgailu errealak',
    sortu(m) {
      const e = pick([4.5, 9, 12, 24]), r = pick([0.5, 1, 1.5, 2]), Rv = pick([2, 4, 5, 8, 10]);
      const I = e / (Rv + r), V = e - r * I;
      if (m === 1) return { q: `Pila batek ε = ${b(e)} V-ko indar elektroeragilea eta r = ${b(r)} Ω-eko barne-erresistentzia ditu. ${b(Rv, 0)} Ω-eko erresistentzia bati lotzen zaio. Zein da korrontea?`, erantzuna: I, unitatea: 'A', hamartarrak: 3,
        pista: 'Barne-erresistentzia kanpokoarekin seriean dago: I = ε / (R + r).', ebazpena: ['I = ε / (R + r)', `I = ${fmt(e)} / (${Rv} + ${fmt(r)}) = ${fmt(I, 3)} A`] };
      if (m === 2) return { q: `ε = ${b(e)} V eta r = ${b(r)} Ω dituen bateria bat ${b(Rv, 0)} Ω-eko karga bati lotzen zaio. Zenbatekoa da bateriaren bornen arteko tentsioa?`, erantzuna: V, unitatea: 'V', hamartarrak: 3,
        pista: 'Kalkulatu I = ε / (R + r), gero V = ε − r · I (edo V = I · R).', ebazpena: [`I = ${fmt(e)} / ${fmt(Rv + r)} = ${fmt(I, 3)} A`, `V = ε − r · I = ${fmt(e)} − ${fmt(r)} · ${fmt(I, 3)} = ${fmt(V, 3)} V`] };
      if (Math.random() < 0.5) {
        const Vr = Number(V.toFixed(2)), Ir = Vr / Rv, rr = (e - Vr) / Ir;
        return { q: `Pila baten tentsioa zirkuitu irekian ${b(e)} V da. ${b(Rv, 0)} Ω-eko erresistentzia bat lotzean, bornen arteko tentsioa ${b(Vr)} V-ra jaisten da. Zein da barne-erresistentzia?`, erantzuna: rr, unitatea: 'Ω', hamartarrak: 3,
          pista: 'Zirkuitu irekian V = ε. Kargarekin I = V / R eta r = (ε − V) / I.', ebazpena: [`I = V / R = ${fmt(Vr)} / ${Rv} = ${fmt(Ir, 4)} A`, `r = (ε − V) / I = (${fmt(e)} − ${fmt(Vr)}) / ${fmt(Ir, 4)} = ${fmt(rr, 3)} Ω`] };
      }
      const Pm = e * e / (4 * r);
      return { q: `ε = ${b(e)} V eta r = ${b(r)} Ω dituen sorgailu batek kanpoko erresistentzia bati eman diezaiokeen potentzia maximoa zein da?`, erantzuna: Pm, unitatea: 'W', hamartarrak: 2,
        pista: 'Potentzia maximoa R = r denean lortzen da: P = ε² / (4r).', ebazpena: ['R = r denean: I = ε / (2r)', `P = I² · r = ε² / (4r) = ${fmt(e)}² / (4 · ${fmt(r)}) = ${fmt(Pm)} W`] };
    }
  }
};

export function zuzena(ariketa, balioa) {
  const e = ariketa.erantzuna;
  if (ariketa.zehatza) return Math.abs(balioa - e) <= 0.5;
  const tol = ariketa.tol ?? Math.max(Math.abs(e) * 0.01, Math.abs(e) < 0.1 ? 0.0005 : 0.01);
  return Math.abs(balioa - e) <= tol;
}
