// Ariketa-sorgailua: ariketa bakoitzak zenbaki berriak ditu aldiro.
// sortu(maila) → { q, erantzuna, unitatea, tol, pista, ebazpena[] }
//   maila: 1 oinarrizkoa, 2 tartekoa, 3 aditua
//   tol: onartutako errore erlatiboa (0.01 = %1); `zehatza: true` → zenbaki osoa
import { G, fmt, pick, randInt, round } from './util.js';

const b = x => `<strong>${fmt(x)}</strong>`;

export const ARIKETAK = {

  abantaila: {
    izena: 'Abantaila mekanikoa',
    sortu(maila) {
      if (maila === 1) {
        const F = pick([50, 80, 100, 120, 150, 200]), AM = pick([2, 3, 4, 5, 8]), R = F * AM;
        return { q: `Makina batekin ${b(F)} N-eko indarra eginez ${b(R)} N-eko karga mugitzen dugu. Zein da abantaila mekanikoa?`,
          erantzuna: AM, unitatea: '', pista: 'Abantaila mekanikoa = erresistentzia / indarra.',
          ebazpena: [`AM = R / F`, `AM = ${fmt(R)} / ${fmt(F)} = ${fmt(AM)}`] };
      }
      const m = pick([20, 30, 40, 50, 60, 80]), AM = pick([2, 4, 5, 8, 10]), R = m * G, F = R / AM;
      return { q: `${b(m)} kg-ko zaku bat altxatzeko makina batek abantaila mekanikoa ${b(AM)} du. Zenbat indar egin behar da? (g = 9,8 m/s²)`,
        erantzuna: round(F, 2), unitatea: 'N', pista: 'Lehenik kalkulatu zakuaren pisua newtonetan: R = m · g. Gero F = R / AM.',
        ebazpena: [`R = m · g = ${fmt(m)} · 9,8 = ${fmt(R)} N`, `F = R / AM = ${fmt(R)} / ${fmt(AM)} = ${fmt(F)} N`] };
    }
  },

  'palanka-indarra': {
    izena: 'Palankaren legea',
    sortu(maila) {
      if (maila === 1) {
        const dF = pick([1, 1.5, 2, 2.5, 3]), dR = pick([0.25, 0.5, 0.75, 1].filter(d => d < dF)), R = pick([200, 300, 400, 500, 600]);
        const F = R * dR / dF;
        return { q: `Palanka batean erresistentzia ${b(R)} N da eta euskarritik ${b(dR)} m-ra dago. Indarra euskarritik ${b(dF)} m-ra egiten dugu. Zenbat indar behar da orekarako?`,
          erantzuna: round(F, 2), unitatea: 'N', pista: 'Palankaren legea: F · dF = R · dR. Bakandu F.',
          ebazpena: [`F · dF = R · dR`, `F = R · dR / dF`, `F = ${fmt(R)} · ${fmt(dR)} / ${fmt(dF)} = ${fmt(F)} N`] };
      }
      if (maila === 2) {
        const m = pick([30, 40, 50, 60, 80, 100]), dR = pick([0.2, 0.3, 0.4, 0.5]), dF = pick([1, 1.2, 1.5, 2]);
        const R = m * G, F = R * dR / dF;
        return { q: `${b(m)} kg-ko harri bat palanka batekin altxatu nahi dugu. Harria euskarritik ${b(dR)} m-ra dago, eta guk euskarritik ${b(dF)} m-ra bultzatzen dugu. Zenbat indar egin behar dugu? (g = 9,8 m/s²)`,
          erantzuna: round(F, 2), unitatea: 'N', pista: 'Masa (kg) ez da indarra. Lehenik R = m · g, gero palankaren legea.',
          ebazpena: [`R = m · g = ${fmt(m)} · 9,8 = ${fmt(R)} N`, `F = R · dR / dF = ${fmt(R)} · ${fmt(dR)} / ${fmt(dF)} = ${fmt(F)} N`] };
      }
      const L = pick([2, 2.5, 3, 4]), dR = pick([0.4, 0.5, 0.8, 1].filter(d => d < L / 2)), R = pick([600, 800, 1000, 1200]);
      const dF = L - dR, F = R * dR / dF;
      return { q: `${b(L)} m-ko barra bat lehen mailako palanka gisa erabiltzen dugu. Euskarria kargatik ${b(dR)} m-ra jarri dugu, eta indarra barraren beste muturrean egiten dugu. Karga ${b(R)} N bada, zenbat indar behar da?`,
        erantzuna: round(F, 2), unitatea: 'N', pista: 'Indar-besoa ez da barra osoa: dF = L − dR.',
        ebazpena: [`dF = L − dR = ${fmt(L)} − ${fmt(dR)} = ${fmt(dF)} m`, `F = R · dR / dF = ${fmt(R)} · ${fmt(dR)} / ${fmt(dF)} = ${fmt(F)} N`] };
    }
  },

  'palanka-besoa': {
    izena: 'Palankaren besoa',
    sortu(maila) {
      const R = pick([300, 400, 600, 800]), dR = pick([0.3, 0.5, 0.6]), F = pick([100, 120, 150, 200].filter(f => f < R));
      const dF = R * dR / F;
      return { q: `Gehienez ${b(F)} N-eko indarra egin dezakegu. ${b(R)} N-eko karga euskarritik ${b(dR)} m-ra badago, gutxienez zenbateko indar-besoa behar dugu?`,
        erantzuna: round(dF, 3), unitatea: 'm', pista: 'Palankaren legetik bakandu dF: dF = R · dR / F.',
        ebazpena: [`dF = R · dR / F`, `dF = ${fmt(R)} · ${fmt(dR)} / ${fmt(F)} = ${fmt(dF, 3)} m`] };
    }
  },

  'polea-indarra': {
    izena: 'Polipastoa',
    sortu(maila) {
      const n = maila === 1 ? pick([1, 2]) : pick([2, 3]);
      const sokak = 2 * n;
      if (maila === 3) {
        const h = pick([1, 1.5, 2, 3]);
        return { q: `Polipasto batek ${b(n)} polea mugikor ditu (${b(sokak)} soka-zatik eusten diote kargari). Karga ${b(h)} m igo nahi badugu, zenbat metro soka tiratu behar ditugu?`,
          erantzuna: round(h * sokak, 2), unitatea: 'm', pista: 'Indarra zatitzen den bezala, soka biderkatzen da: soka-kopurua bider igoera.',
          ebazpena: [`s = h · (2 · n)`, `s = ${fmt(h)} · ${sokak} = ${fmt(h * sokak)} m`] };
      }
      const m = pick([40, 50, 60, 80, 100, 120]), R = m * G, F = R / sokak;
      return { q: `${b(m)} kg-ko karga bat igo nahi dugu ${b(n)} polea mugikor dituen polipasto batekin. Zenbat indar egin behar da? (g = 9,8 m/s²; marruskadurarik gabe)`,
        erantzuna: round(F, 2), unitatea: 'N', pista: `Polea mugikor bakoitzak indarra erdira murrizten du: F = R / (2 · n).`,
        ebazpena: [`R = m · g = ${fmt(m)} · 9,8 = ${fmt(R)} N`, `F = R / (2 · n) = ${fmt(R)} / ${sokak} = ${fmt(F)} N`] };
    }
  },

  'engranaje-abiadura': {
    izena: 'Engranajeak',
    sortu(maila) {
      if (maila === 1) {
        const z1 = pick([10, 12, 15, 20, 24, 30]), z2 = pick([20, 30, 40, 45, 60, 80].filter(z => z !== z1)), n1 = pick([300, 600, 900, 1000, 1200, 1500]);
        const n2 = n1 * z1 / z2;
        return { q: `Motor batek ${b(z1)} hortzeko engranajea mugitzen du ${b(n1)} rpm-ra, eta honek ${b(z2)} hortzeko beste bat. Zein abiaduratan biratzen du bigarrenak?`,
          erantzuna: round(n2, 2), unitatea: 'rpm', pista: 'N₁ · Z₁ = N₂ · Z₂. Bakandu N₂.',
          ebazpena: [`N₂ = N₁ · Z₁ / Z₂`, `N₂ = ${fmt(n1)} · ${z1} / ${z2} = ${fmt(n2)} rpm`] };
      }
      if (maila === 2) {
        const z1 = pick([12, 15, 16, 20, 24]), k = pick([2, 3, 4, 5]), n1 = pick([600, 900, 1200, 1500, 1800]);
        const z2 = z1 * k, n2 = n1 / k;
        return { q: `Eragileak ${b(z1)} hortz ditu eta ${b(n1)} rpm-ra biratzen du. Eraginak ${b(n2)} rpm-ra biratu behar badu, zenbat hortz behar ditu?`,
          erantzuna: z2, unitatea: 'hortz', zehatza: true, pista: 'N₁ · Z₁ = N₂ · Z₂ → Z₂ = N₁ · Z₁ / N₂.',
          ebazpena: [`Z₂ = N₁ · Z₁ / N₂`, `Z₂ = ${fmt(n1)} · ${z1} / ${fmt(n2)} = ${z2} hortz`] };
      }
      const z1 = pick([10, 12, 15]), z2 = pick([30, 36, 45]), z3 = pick([12, 15, 20]), z4 = pick([40, 48, 60]), n1 = pick([1200, 1500, 1800]);
      const n3 = n1 * (z1 / z2) * (z3 / z4);
      return { q: `Engranaje-tren konposatu bat: ${b(z1)} hortzeko eragileak (${b(n1)} rpm) ${b(z2)} hortzekoa mugitzen du. Ardatz berean ${b(z3)} hortzeko bat dago, eta honek ${b(z4)} hortzekoa mugitzen du. Zein abiaduratan biratzen du azkenak?`,
        erantzuna: round(n3, 2), unitatea: 'rpm', pista: 'Ardatz bereko bi engranajeek abiadura bera dute. Kalkulatu urratsez urrats, edo biderkatu bi erlazioak.',
        ebazpena: [`N₂ = ${fmt(n1)} · ${z1} / ${z2} = ${fmt(n1 * z1 / z2)} rpm (= N₃)`, `N₄ = N₃ · ${z3} / ${z4} = ${fmt(n3)} rpm`] };
    }
  },

  'uhala-abiadura': {
    izena: 'Uhal-transmisioa',
    sortu(maila) {
      if (maila === 1) {
        const d1 = pick([5, 8, 10, 12]), d2 = pick([20, 24, 30, 40]), n1 = pick([900, 1200, 1400, 1500]);
        const n2 = n1 * d1 / d2;
        return { q: `Motorraren poleak ${b(d1)} cm-ko diametroa du eta ${b(n1)} rpm-ra biratzen du. Uhalak ${b(d2)} cm-ko polea bat mugitzen du. Zein abiaduratan biratzen du?`,
          erantzuna: round(n2, 2), unitatea: 'rpm', pista: 'N₁ · D₁ = N₂ · D₂.',
          ebazpena: [`N₂ = N₁ · D₁ / D₂`, `N₂ = ${fmt(n1)} · ${d1} / ${d2} = ${fmt(n2)} rpm`] };
      }
      if (maila === 2) {
        const d1 = pick([6, 8, 10, 12]), k = pick([2, 3, 4]), n1 = pick([1200, 1500, 1800]), n2 = n1 / k;
        return { q: `${b(n1)} rpm-ko motor batek ${b(d1)} cm-ko polea du. Garbigailuaren danborrak ${b(n2)} rpm-ra biratu behar badu, zein diametro behar du haren poleak?`,
          erantzuna: d1 * k, unitatea: 'cm', pista: 'D₂ = N₁ · D₁ / N₂.',
          ebazpena: [`D₂ = N₁ · D₁ / N₂`, `D₂ = ${fmt(n1)} · ${d1} / ${fmt(n2)} = ${fmt(d1 * k)} cm`] };
      }
      const t = pick([24, 32, 36, 42]), p = pick([12, 14, 16, 18]), kad = pick([60, 70, 80, 90]);
      const n2 = kad * t / p;
      return { q: `Kate-transmisio batean platerak ${b(t)} hortz ditu eta pinoiak ${b(p)}. Minutuko ${b(kad)} pedalkada ematen baditugu, zenbat bira ematen ditu gurpilak minutuko?`,
        erantzuna: round(n2, 2), unitatea: 'rpm', pista: 'Kateak engranajeen formula bera erabiltzen du: N₂ = N₁ · Z₁ / Z₂.',
        ebazpena: [`N₂ = N₁ · Z₁ / Z₂`, `N₂ = ${fmt(kad)} · ${t} / ${p} = ${fmt(n2)} rpm`] };
    }
  },

  'torloju-amaigabea': {
    izena: 'Torloju amaigabea',
    sortu(maila) {
      const z = pick([20, 25, 30, 40, 50, 60]), n1 = pick([600, 1200, 1500, 1800, 3000]);
      if (maila >= 2) {
        const birak = pick([2, 3, 5, 10]);
        return { q: `Koroak ${b(z)} hortz ditu. Koroak ${b(birak)} bira oso eman ditzan, zenbat bira eman behar ditu torloju amaigabeak?`,
          erantzuna: z * birak, unitatea: 'bira', zehatza: true, pista: 'Torlojuaren bira bakoitzak koroa hortz bakar bat aurreratzen du.',
          ebazpena: [`Koroaren bira bat = ${z} torloju-bira`, `${birak} bira · ${z} = ${z * birak} bira`] };
      }
      return { q: `Torloju amaigabe bat (sarrera bakarrekoa) ${b(n1)} rpm-ra biratzen da, eta ${b(z)} hortzeko koroa bat mugitzen du. Zein abiaduratan biratzen du koroak?`,
        erantzuna: round(n1 / z, 2), unitatea: 'rpm', pista: 'N₂ = N₁ / Z.',
        ebazpena: [`N₂ = N₁ / Z`, `N₂ = ${fmt(n1)} / ${z} = ${fmt(n1 / z)} rpm`] };
    }
  },

  kremalera: {
    izena: 'Kremalera eta pinoia',
    sortu(maila) {
      const z = pick([10, 12, 15, 20]), p = pick([3, 4, 5, 6]), n = pick([2, 3, 5, 10]);
      const d = z * p * n;
      if (maila >= 2) {
        const nmin = pick([20, 30, 40, 60]), v = z * p * nmin / 1000;
        return { q: `Pinoiak ${b(z)} hortz ditu eta hortzen arteko pausoa ${b(p)} mm da. ${b(nmin)} rpm-ra biratzen badu, zenbat metro aurreratzen du kremalerak minutu batean?`,
          erantzuna: round(v, 3), unitatea: 'm', pista: 'Bira batean kremalerak Z · p aurreratzen du. Gero biderkatu bira-kopuruarekin eta pasatu metrotara.',
          ebazpena: [`Bira batean: ${z} · ${p} = ${z * p} mm`, `Minutuan: ${z * p} · ${nmin} = ${fmt(z * p * nmin)} mm = ${fmt(v, 3)} m`] };
      }
      return { q: `Pinoiak ${b(z)} hortz ditu eta kremaleraren hortzen arteko pausoa ${b(p)} mm da. Pinoiak ${b(n)} bira ematen baditu, zenbat mm mugitzen da kremalera?`,
        erantzuna: d, unitatea: 'mm', pista: 'Bira oso batean pinoiak bere hortz guztiak pasatzen ditu: d = n · Z · p.',
        ebazpena: [`d = n · Z · p`, `d = ${n} · ${z} · ${p} = ${d} mm`] };
    }
  },

  bizikleta: {
    izena: 'Bizikleta',
    sortu(maila) {
      const t = pick([34, 36, 40, 42, 44, 48, 52]), p = pick([11, 12, 13, 14, 16, 18, 21, 24, 28]);
      const erl = t / p;
      if (maila === 1) {
        return { q: `Plateran ${b(t)} hortz eta pinoian ${b(p)}. Pedal-bira bakoitzean, zenbat bira ematen ditu atzeko gurpilak?`,
          erantzuna: round(erl, 2), unitatea: 'bira', pista: 'Erlazioa = plater-hortzak / pinoi-hortzak.',
          ebazpena: [`${t} / ${p} = ${fmt(erl)} bira`] };
      }
      const D = pick([0.66, 0.7, 0.74]);
      const gar = erl * Math.PI * D;
      if (maila === 2) {
        return { q: `Plateran ${b(t)} hortz eta pinoian ${b(p)}; gurpilaren diametroa ${b(D)} m da. Zein da garapena, hau da, zenbat metro aurreratzen da pedal-bira bakoitzean?`,
          erantzuna: round(gar, 2), unitatea: 'm', pista: 'Garapena = erlazioa · π · D.',
          ebazpena: [`Erlazioa = ${t} / ${p} = ${fmt(erl, 3)}`, `Garapena = ${fmt(erl, 3)} · 3,1416 · ${fmt(D)} = ${fmt(gar)} m`] };
      }
      const kad = pick([60, 70, 80, 90]), v = gar * kad * 60 / 1000;
      return { q: `Plateran ${b(t)} hortz, pinoian ${b(p)} eta gurpilaren diametroa ${b(D)} m. Minutuko ${b(kad)} pedalkadarekin, zein abiaduratan goaz km/h-tan?`,
        erantzuna: round(v, 2), unitatea: 'km/h', pista: 'Kalkulatu garapena, biderkatu minutuko pedalkadekin (m/min) eta pasatu km/h-ra (· 60 / 1000).',
        ebazpena: [`Garapena = ${t}/${p} · π · ${fmt(D)} = ${fmt(gar)} m`, `v = ${fmt(gar)} · ${kad} = ${fmt(gar * kad)} m/min`, `v = ${fmt(gar * kad)} · 60 / 1000 = ${fmt(v)} km/h`] };
    }
  },

  'plano-inklinatua': {
    izena: 'Plano inklinatua',
    sortu(maila) {
      const L = pick([2, 3, 4, 5, 6]), h = pick([0.5, 0.8, 1, 1.2, 1.5].filter(x => x < L));
      if (maila === 3) {
        const m = pick([40, 60, 80, 100]), P = m * G, F = pick([150, 200, 250]);
        const Lmin = P * h / F;
        return { q: `${b(m)} kg-ko kaxa bat ${b(h)} m-ko altuerara igo nahi dugu arrapala batetik, eta gehienez ${b(F)} N-eko indarra egin dezakegu. Gutxienez zenbat metroko luzera behar du arrapalak? (marruskadurarik gabe)`,
          erantzuna: round(Lmin, 2), unitatea: 'm', pista: 'F · L = P · h. Bakandu L, eta ez ahaztu P = m · g.',
          ebazpena: [`P = m · g = ${fmt(m)} · 9,8 = ${fmt(P)} N`, `L = P · h / F = ${fmt(P)} · ${fmt(h)} / ${fmt(F)} = ${fmt(Lmin)} m`] };
      }
      const m = pick([30, 50, 60, 80, 120]), P = maila === 1 ? pick([300, 500, 600, 800, 1000]) : m * G;
      const F = P * h / L;
      const pesoa = maila === 1 ? `${b(P)} N pisatzen duen kaxa bat` : `${b(m)} kg-ko kaxa bat`;
      return { q: `${pesoa} ${b(L)} m-ko arrapala batetik igotzen dugu, ${b(h)} m-ko altuerara. Zenbat indar egin behar da arrapalaren norabidean? (marruskadurarik gabe${maila === 2 ? '; g = 9,8 m/s²' : ''})`,
        erantzuna: round(F, 2), unitatea: 'N', pista: 'Plano inklinatuaren legea: F · L = P · h.',
        ebazpena: [...(maila === 2 ? [`P = m · g = ${fmt(m)} · 9,8 = ${fmt(P)} N`] : []), `F = P · h / L = ${fmt(P)} · ${fmt(h)} / ${fmt(L)} = ${fmt(F)} N`] };
    }
  },

  tornua: {
    izena: 'Tornua',
    sortu(maila) {
      const r = pick([5, 8, 10, 12]), Rb = pick([25, 30, 40, 50, 60]);
      if (maila === 3) {
        const h = pick([3, 5, 8, 10]), zirk = 2 * Math.PI * r / 100, n = h / zirk;
        return { q: `Putzu bateko tornuaren danborrak ${b(r)} cm-ko erradioa du. Ontzia ${b(h)} m igotzeko, zenbat bira eman behar zaizkio biraderari?`,
          erantzuna: round(n, 2), unitatea: 'bira', tol: 0.02, pista: 'Bira bakoitzean danborrak bere zirkunferentzia adina soka biltzen du: 2 · π · r (metrotan).',
          ebazpena: [`Bira bakoitzeko: 2 · π · ${fmt(r / 100)} = ${fmt(zirk, 3)} m`, `n = ${fmt(h)} / ${fmt(zirk, 3)} = ${fmt(n)} bira`] };
      }
      const m = pick([10, 15, 20, 25, 40]), R = maila === 1 ? pick([100, 150, 200, 300, 400]) : m * G;
      const F = R * r / Rb;
      return { q: `Tornu baten danborrak ${b(r)} cm-ko erradioa du eta biraderak ${b(Rb)} cm-ko besoa. ${maila === 1 ? `${b(R)} N-eko ontzi bat` : `${b(m)} kg-ko ontzi bat`} igotzeko, zenbat indar egin behar da biraderan?${maila === 2 ? ' (g = 9,8 m/s²)' : ''}`,
        erantzuna: round(F, 2), unitatea: 'N', pista: 'Tornua palanka bat bezala da: F · (biraderaren besoa) = R · (danborraren erradioa).',
        ebazpena: [...(maila === 2 ? [`R = m · g = ${fmt(m)} · 9,8 = ${fmt(R)} N`] : []), `F = R · r / R_b = ${fmt(R)} · ${r} / ${Rb} = ${fmt(F)} N`] };
    }
  },

  marruskadura: {
    izena: 'Marruskadura-gurpilak',
    sortu(maila) {
      const d1 = pick([4, 5, 6, 8, 10]), n1 = pick([600, 900, 1200, 1500]);
      if (maila >= 2) {
        const k = pick([2, 3, 4, 5]), n2 = n1 / k;
        return { q: `${b(d1)} cm-ko gurpil eragile batek ${b(n1)} rpm-ra biratzen du. Ukitzen duen gurpilak ${b(n2)} rpm-ra biratu behar badu, zein diametro behar du?`,
          erantzuna: d1 * k, unitatea: 'cm', pista: 'N₁ · D₁ = N₂ · D₂ → D₂ = N₁ · D₁ / N₂.',
          ebazpena: [`D₂ = ${fmt(n1)} · ${d1} / ${fmt(n2)} = ${fmt(d1 * k)} cm`] };
      }
      const d2 = pick([12, 15, 20, 24, 30].filter(d => d !== d1)), n2 = n1 * d1 / d2;
      return { q: `Marruskadura-gurpil eragileak ${b(d1)} cm-ko diametroa du eta ${b(n1)} rpm-ra biratzen du. Ukitzen duen gurpilak ${b(d2)} cm ditu. Zein abiaduratan biratzen du?`,
        erantzuna: round(n2, 2), unitatea: 'rpm', pista: 'Uhalen formula bera: N₁ · D₁ = N₂ · D₂.',
        ebazpena: [`N₂ = N₁ · D₁ / D₂ = ${fmt(n1)} · ${d1} / ${d2} = ${fmt(n2)} rpm`] };
    }
  },

  'torloju-azkoina': {
    izena: 'Torloju-azkoina',
    sortu(maila) {
      const p = pick([1, 1.25, 1.5, 2, 2.5, 3]);
      if (maila === 1) {
        const n = pick([4, 5, 8, 10, 12, 20]);
        return { q: `Torloju baten pausoa ${b(p)} mm da. Torlojuari ${b(n)} bira ematen badizkiogu, zenbat aurreratzen da azkoina?`,
          erantzuna: round(n * p, 2), unitatea: 'mm', pista: 'Bira oso bakoitzean azkoinak pauso bat aurreratzen du: d = n · p.',
          ebazpena: [`d = n · p = ${n} · ${fmt(p)} = ${fmt(n * p)} mm`] };
      }
      if (maila === 2) {
        const d = pick([10, 15, 20, 30, 45, 60]);
        return { q: `Mahai-tornu baten torlojuaren pausoa ${b(p)} mm da. Masailak ${b(d)} mm itxi nahi baditugu, zenbat bira eman behar ditugu?`,
          erantzuna: round(d / p, 2), unitatea: 'bira', pista: 'n = d / p.',
          ebazpena: [`n = d / p = ${fmt(d)} / ${fmt(p)} = ${fmt(d / p)} bira`] };
      }
      const N = pick([30, 60, 120, 240]), d = pick([60, 120, 180, 300]);
      const t = d / (N * p) * 60;
      return { q: `Motor batek ${b(p)} mm-ko pausoa duen torloju bat ${b(N)} rpm-ra biratzen du. Zenbat segundo behar ditu azkoinak ${b(d)} mm aurreratzeko?`,
        erantzuna: round(t, 2), unitatea: 's', pista: 'Minutuan aurreratzen dena: N · p (mm/min). Gero denbora = distantzia / abiadura, eta pasatu segundotara.',
        ebazpena: [`v = N · p = ${N} · ${fmt(p)} = ${fmt(N * p)} mm/min`, `t = ${fmt(d)} / ${fmt(N * p)} = ${fmt(d / (N * p), 3)} min = ${fmt(t)} s`] };
    }
  },

  lana: {
    izena: 'Lana',
    sortu(maila) {
      if (maila === 1) {
        const F = pick([20, 50, 80, 100, 150, 200]), d = pick([2, 3, 5, 10, 12]);
        return { q: `Kaxa bat ${b(d)} m bultzatzen dugu ${b(F)} N-eko indarrarekin, indarraren norabide berean. Zenbat lan egin dugu?`,
          erantzuna: F * d, unitatea: 'J', pista: 'Lana = indarra · distantzia: W = F · d.',
          ebazpena: [`W = F · d = ${F} · ${d} = ${F * d} J`] };
      }
      const m = pick([10, 20, 25, 40, 50]), h = pick([1, 2, 3, 4, 5]);
      if (maila === 2) {
        const W = m * G * h;
        return { q: `${b(m)} kg-ko zaku bat ${b(h)} m-ko altuerara igotzen dugu. Zenbat lan egiten dugu? (g = 9,8 m/s²)`,
          erantzuna: round(W, 2), unitatea: 'J', pista: 'Indarra pisua da (P = m · g), eta distantzia altuera: W = m · g · h.',
          ebazpena: [`P = ${m} · 9,8 = ${fmt(m * G)} N`, `W = P · h = ${fmt(m * G)} · ${h} = ${fmt(W)} J`] };
      }
      const R = m * G, s = 2 * h, F = R / 2;
      return { q: `${b(m)} kg-ko zakua ${b(h)} m igotzen dugu polea mugikor batekin (${b(F)} N eginez, ${b(s)} m soka tiratuz). Zenbat lan egin dugu guk?`,
        erantzuna: round(F * s, 2), unitatea: 'J', pista: 'W = F · s, sokaren indarra eta tiratutako soka erabiliz. Konparatu m · g · h-rekin.',
        ebazpena: [`W = F · s = ${fmt(F)} · ${s} = ${fmt(F * s)} J`, `Konprobazioa: m · g · h = ${fmt(R)} · ${h} = ${fmt(R * h)} J (berdina)`] };
    }
  },

  potentzia: {
    izena: 'Potentzia eta errendimendua',
    sortu(maila) {
      if (maila === 1) {
        const W = pick([600, 1200, 1500, 3000, 6000]), t = pick([2, 3, 5, 10, 20]);
        return { q: `Motor batek ${b(W)} J-eko lana egiten du ${b(t)} segundotan. Zein da bere potentzia?`,
          erantzuna: round(W / t, 2), unitatea: 'W', pista: 'Potentzia = lana / denbora: P = W / t.',
          ebazpena: [`P = W / t = ${W} / ${t} = ${fmt(W / t)} W`] };
      }
      if (maila === 2) {
        const m = pick([50, 80, 100, 200, 500]), h = pick([2, 5, 10, 15]), t = pick([5, 10, 20, 25]);
        const P = m * G * h / t;
        return { q: `Garabi batek ${b(m)} kg-ko karga ${b(h)} m igotzen du ${b(t)} s-tan. Zein da garabiaren potentzia? (g = 9,8 m/s²)`,
          erantzuna: round(P, 2), unitatea: 'W', pista: 'Lehenik lana (W = m · g · h), gero potentzia (P = W / t).',
          ebazpena: [`W = ${m} · 9,8 · ${h} = ${fmt(m * G * h)} J`, `P = ${fmt(m * G * h)} / ${t} = ${fmt(P)} W`] };
      }
      const Pin = pick([500, 800, 1000, 1500, 2000]), eta = pick([60, 70, 75, 80, 90]);
      const Pout = Pin * eta / 100;
      return { q: `Motor elektriko batek ${b(Pin)} W kontsumitzen ditu eta ${b(Pout)} W-eko potentzia mekanikoa ematen du. Zein da bere errendimendua?`,
        erantzuna: eta, unitatea: '%', pista: 'Errendimendua = irteerako potentzia / sarrerako potentzia · 100.',
        ebazpena: [`η = ${fmt(Pout)} / ${Pin} · 100 = ${eta} %`, `Galdutako ${fmt(Pin - Pout)} W beroa bihurtzen dira (marruskadura).`] };
    }
  },

  kurtsoa: {
    izena: 'Kurtsoa',
    sortu(maila) {
      if (maila === 1) {
        const e = pick([3, 4, 5, 6, 8, 10, 12]);
        return { q: `Eszentriko baten eszentrikotasuna (ardatzetik zentrora dagoen distantzia) ${b(e)} mm da. Zenbat da jarraitzailearen kurtsoa?`,
          erantzuna: 2 * e, unitatea: 'mm', pista: 'Kurtsoa = 2 · e: ardatzaren alde batetik bestera.',
          ebazpena: [`kurtsoa = 2 · ${e} = ${2 * e} mm`] };
      }
      const r = pick([3, 4, 4.5, 5, 6]), N = pick([600, 1200, 2400, 3000]);
      if (maila === 2) {
        return { q: `Konpresore baten biraderak ${b(r)} cm-ko besoa du. Zenbat da pistoiaren kurtsoa?`,
          erantzuna: round(2 * r, 2), unitatea: 'cm', pista: 'Kurtsoa = 2 · r.',
          ebazpena: [`kurtsoa = 2 · ${fmt(r)} = ${fmt(2 * r)} cm`] };
      }
      const bidea = 2 * (2 * r) * N / 100;
      return { q: `Motor baten biraderak ${b(r)} cm-ko besoa du eta ${b(N)} rpm-ra biratzen du. Minutu batean, zenbat metro egiten ditu pistoiak (gora eta behera batuta)?`,
        erantzuna: round(bidea, 2), unitatea: 'm', pista: 'Bira bakoitzean pistoia igo eta jaitsi egiten da: 2 · kurtsoa. Biderkatu birekin eta pasatu metrotara.',
        ebazpena: [`kurtsoa = 2 · ${fmt(r)} = ${fmt(2 * r)} cm`, `Bira bakoitzean: 2 · ${fmt(2 * r)} = ${fmt(4 * r)} cm`, `Minutuan: ${fmt(4 * r)} · ${N} = ${fmt(4 * r * N)} cm = ${fmt(bidea)} m`] };
    }
  },

  motorra: {
    izena: 'Lau aldiko motorra',
    sortu(maila) {
      const N = pick([1200, 1800, 2400, 3000, 3600, 4800]);
      if (maila === 1) {
        return { q: `Lau aldiko motor baten birabarkia ${b(N)} rpm-ra dabil. Zein abiaduratan biratzen du kama-ardatzak?`,
          erantzuna: N / 2, unitatea: 'rpm', pista: 'Ziklo batean birabarkiak bi bira ematen ditu eta kama-ardatzak bat: erdia.',
          ebazpena: [`N_kama = ${N} / 2 = ${N / 2} rpm`] };
      }
      const z = maila === 2 ? 1 : pick([2, 3, 4, 6]);
      const leh = N / 2 * z;
      return { q: `${z === 1 ? 'Zilindro bakarreko' : `${b(z)} zilindroko`} lau aldiko motor bat ${b(N)} rpm-ra dabil. Zenbat leherketa gertatzen dira minutuan${z > 1 ? ', zilindro guztiak batuta' : ''}?`,
        erantzuna: leh, unitatea: 'leherketa', pista: 'Zilindro bakoitzean leherketa bat ziklo bakoitzeko, hau da, bi bira bakoitzeko.',
        ebazpena: [`Zilindro bakoitzean: ${N} / 2 = ${N / 2} leherketa/min`, ...(z > 1 ? [`${z} zilindro: ${N / 2} · ${z} = ${leh} leherketa/min`] : [])] };
    }
  }
};

// Erantzuna zuzena den: %1eko tartea (gutxienez 0,01), edo zehatza zenbaki osoetan
export function zuzena(ariketa, balioa) {
  if (!isFinite(balioa)) return false;
  if (ariketa.zehatza) return Math.abs(balioa - ariketa.erantzuna) < 0.5;
  const tol = Math.max(0.01, Math.abs(ariketa.erantzuna) * (ariketa.tol ?? 0.01));
  return Math.abs(balioa - ariketa.erantzuna) <= tol;
}
