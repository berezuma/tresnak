// Erronkak: irtenbide bat baino gehiago dituzten diseinu-problemak, eta amaierako proiektua
import { G, fmt, progress, parseNum } from '../util.js';

const KASETEA = [11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 32];
const int = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
const num = id => parseNum(document.getElementById(id)?.value ?? '');

const ERRONKAK = [
  {
    id: 'garbigailua',
    izena: 'Garbigailuaren danborra',
    gaiak: ['Engranajeak', 'Tren konposatua'],
    unitatea: 'engranajeak',
    brief: 'Garbigailu baten motorrak <strong>1400 rpm</strong>-ra biratzen du, baina danborrak <strong>50 rpm inguru</strong> behar ditu garbitzeko. Diseinatu bi urratseko engranaje-tren bat.',
    limits: ['Engranaje bakoitzak 10 eta 80 hortz artean.', 'Danborraren abiadura: 45 eta 55 rpm artean.'],
    inputs: [['Z₁ (motorra)', 'z1', 12], ['Z₂', 'z2', 48], ['Z₃ (Z₂-ren ardatzean)', 'z3', 12], ['Z₄ (danborra)', 'z4', 60]],
    pista: 'Guztira 1400 / 50 = 28 aldiz moteldu behar da. Bi erlazioren biderkadurak 28 eman behar du: adibidez 4 · 7.',
    check() {
      const [z1, z2, z3, z4] = ['z1', 'z2', 'z3', 'z4'].map(k => num('er-garbigailua-' + k));
      if (![z1, z2, z3, z4].every(z => int(z, 10, 80))) return { ok: false, html: 'Hortz-kopuruak zenbaki osoak izan behar dira, 10 eta 80 artean.' };
      const n2 = 1400 * z1 / z2, n4 = n2 * z3 / z4;
      const ok = n4 >= 45 && n4 <= 55;
      return { ok, html: `N₂ = N₃ = 1400 · ${z1} / ${z2} = <b>${fmt(n2, 1)} rpm</b><br>N₄ = ${fmt(n2, 1)} · ${z3} / ${z4} = <b>${fmt(n4, 1)} rpm</b>
        <span class="verdict">${ok ? 'Lortuta! Danborrak garbitzeko abiadura du.' : n4 > 55 ? 'Azkarregi: murriztu gehiago.' : 'Motelegi: murrizketa txikiagoa behar da.'}</span>` };
    }
  },
  {
    id: 'garabia',
    izena: 'Obrako garabia',
    gaiak: ['Poleak', 'Lana'],
    unitatea: 'poleak',
    brief: 'Langile batek <strong>50 kg</strong>-ko zakuak <strong>3 m</strong> igo behar ditu, baina ezin du <strong>150 N</strong> baino gehiago egin. Aukeratu polipasto bat eta kalkulatu zenbat soka tiratu beharko duen.',
    limits: ['g = 9,8 m/s², marruskadurarik gabe.', 'Ahalik eta polea gutxien erabili.'],
    inputs: [['Polea mugikorrak', 'n', 1, [0, 1, 2, 3, 4]], ['Tiratu beharreko soka (m)', 's', '']],
    pista: 'Zakuaren pisua: 50 · 9,8 = 490 N. F = R / (2 · n). Soka: s = 3 · (2 · n).',
    check() {
      const n = num('er-garabia-n'), s = num('er-garabia-s');
      const zatiak = n === 0 ? 1 : 2 * n, F = 50 * G / zatiak, sOk = 3 * zatiak;
      const fOk = F <= 150;
      const sGood = Math.abs(s - sOk) < 0.05;
      const minimo = fOk && n === 2;
      let verdict;
      if (!fOk) verdict = 'Indar gehiegi: langileak ezin du.';
      else if (isNaN(s)) verdict = 'Indarra ondo dago. Orain kalkulatu soka.';
      else if (!sGood) verdict = 'Indarra ondo dago, baina soka-kalkulua ez da zuzena.';
      else verdict = minimo ? 'Lortuta, eta polearik gutxienekin!' : 'Balio du, baina polea gutxiagorekin ere lor daiteke.';
      return { ok: fOk && sGood && minimo, html: `Soka-zatiak: <b>${zatiak}</b> · F = 490 / ${zatiak} = <b>${fmt(F, 1)} N</b>${!isNaN(s) ? `<br>Zure soka: ${fmt(s, 2)} m${sGood ? ' ✓' : ''}` : ''}<span class="verdict">${verdict}</span>` };
    }
  },
  {
    id: 'atea',
    izena: 'Ate lerragarri automatikoa',
    gaiak: ['Kremalera-pinoia'],
    unitatea: 'kremalera',
    brief: 'Denda bateko ate lerragarriak <strong>2 m</strong> ireki behar ditu <strong>10 segundotan</strong>. Motorrak <strong>60 rpm</strong>-ra biratzen du eta pinoi bat du kremalera baten gainean. Aukeratu pinoiaren hortzak eta pausoa.',
    limits: ['Pinoia: 8 eta 40 hortz artean.', 'Pausoa: 2 eta 10 mm artean.', 'Denbora: 9,5 eta 10,5 s artean.'],
    inputs: [['Pinoiaren hortzak, Z', 'z', 20], ['Pausoa, p (mm)', 'p', 5]],
    pista: 'Minutu batean: 60 · Z · p mm. 10 segundotan, horren seirena. 2000 mm behar dira.',
    check() {
      const z = num('er-atea-z'), p = num('er-atea-p');
      if (!int(z, 8, 40) || !(p >= 2 && p <= 10)) return { ok: false, html: 'Z: zenbaki osoa 8 eta 40 artean. p: 2 eta 10 mm artean.' };
      const v = 60 * z * p, t = 2000 / v * 60;
      const ok = t >= 9.5 && t <= 10.5;
      return { ok, html: `Abiadura: 60 · ${z} · ${fmt(p)} = <b>${fmt(v, 0)} mm/min</b> = ${fmt(v / 60, 1)} mm/s<br>2000 mm irekitzeko: <b>${fmt(t, 1)} s</b>
        <span class="verdict">${ok ? 'Lortuta!' : t > 10.5 ? 'Motelegi.' : 'Azkarregi: arriskutsua izan daiteke.'}</span>` };
    }
  },
  {
    id: 'palanka',
    izena: 'Harria mugitzeko palanka',
    gaiak: ['Palanka'],
    unitatea: 'palanka',
    brief: '<strong>120 kg</strong>-ko harri bat mugitu behar dugu <strong>3 m</strong>-ko barra batekin (1. mailako palanka, indarra beste muturrean). Gehienez <strong>300 N</strong> egin ditzakegu. Non jarri euskarria?',
    limits: ['Euskarria harritik gutxienez 0,2 m-ra (harriak tokia behar du).', 'g = 9,8 m/s².'],
    inputs: [['Euskarritik harrira, d_R (m)', 'dr', 0.8]],
    pista: 'R = 120 · 9,8 = 1176 N. d_F = 3 − d_R. F = R · d_R / d_F ≤ 300 izan behar du.',
    check() {
      const dr = num('er-palanka-dr');
      if (!(dr >= 0.2 && dr < 3)) return { ok: false, html: 'd_R: 0,2 m eta 3 m artean.' };
      const R = 120 * G, df = 3 - dr, F = R * dr / df;
      const ok = F <= 300;
      return { ok, html: `d_F = 3 − ${fmt(dr, 2)} = <b>${fmt(df, 2)} m</b><br>F = 1176 · ${fmt(dr, 2)} / ${fmt(df, 2)} = <b>${fmt(F, 0)} N</b>
        <span class="verdict">${ok ? 'Lortuta! Harria mugitzen da.' : 'Indar gehiegi: hurbildu euskarria harrira.'}</span>` };
    }
  },
  {
    id: 'bizikleta',
    izena: 'Aldapa gora',
    gaiak: ['Bizikleta', 'Kate-transmisioa'],
    unitatea: 'bizikleta',
    brief: 'Aldapa gogor bat igotzeko, <strong>2,2 eta 3 m</strong> arteko garapena behar duzu. Bizikletaren gurpilak <strong>0,7 m</strong>-ko diametroa du. Aukeratu platera eta pinoia.',
    limits: ['Platerak: 34, 42 edo 52 hortz.', 'Kasetea: 11etik 32ra.'],
    inputs: [['Platera', 'pl', 34, [34, 42, 52]], ['Pinoia', 'pi', 17, KASETEA]],
    pista: 'Garapena = (platera / pinoia) · π · 0,7. Garapen txikia nahi baduzu, erlazio txikia: plater txikia eta pinoi handia.',
    check() {
      const pl = num('er-bizikleta-pl'), pi = num('er-bizikleta-pi');
      const gar = pl / pi * Math.PI * 0.7;
      const ok = gar >= 2.2 && gar <= 3;
      return { ok, html: `Erlazioa: ${pl} / ${pi} = <b>${fmt(pl / pi, 2)}</b> · garapena = <b>${fmt(gar, 2)} m</b>
        <span class="verdict">${ok ? 'Lortuta! Aldapa hori igotzeko egokia.' : gar > 3 ? 'Gogorregi aldapa honetarako.' : 'Arinegi: ia ez zara aurreratuko.'}</span>` };
    }
  },
  {
    id: 'igogailua',
    izena: 'Igogailuaren motorra',
    gaiak: ['Torloju amaigabea'],
    unitatea: 'torloju-amaigabea',
    brief: 'Igogailu baten motorrak <strong>1500 rpm</strong>-ra biratzen du. Kablea biltzen duen danborrak <strong>30 eta 40 rpm</strong> artean biratu behar du, eta motorra gelditzean kabina ez da erori behar. Zenbat hortz behar ditu koroak?',
    limits: ['Sarrera bakarreko torloju amaigabea.', 'Koroa: 10 eta 80 hortz artean.'],
    inputs: [['Koroaren hortzak, Z', 'z', 30]],
    pista: 'N₂ = N₁ / Z. Zein Z-rekin geratzen da 1500 / Z 30 eta 40 artean?',
    check() {
      const z = num('er-igogailua-z');
      if (!int(z, 10, 80)) return { ok: false, html: 'Z: zenbaki osoa, 10 eta 80 artean.' };
      const n2 = 1500 / z, ok = n2 >= 30 && n2 <= 40;
      return { ok, html: `N₂ = 1500 / ${z} = <b>${fmt(n2, 1)} rpm</b>
        <span class="verdict">${ok ? 'Lortuta! Eta torloju amaigabea ez-itzulgarria denez, kabina ez da eroriko.' : n2 > 40 ? 'Azkarregi: hortz gehiago behar dira.' : 'Motelegi: hortz gutxiago.'}</span>` };
    }
  }
];

export default function render(root, { footer }) {
  const solved = () => progress.get('erronkak').ebatziak || [];
  const countText = () => `Ebatziak: <b>${solved().length} / ${ERRONKAK.length}</b>`;

  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Aplikatu</div>
      <h1>Erronkak</h1>
      <p class="lede">Hemen ez dago erantzun bakarra: zuk diseinatzen duzu mekanismoa, eta lantegiak kalkulatzen du funtzionatzen duen. Proba irtenbide desberdinak eta konparatu ikaskideekin.</p>
      <p class="ex-count" id="er-count">${countText()}</p>
    </header>
    <div class="challenges">
      ${ERRONKAK.map(e => `
        <article class="challenge-card" id="er-${e.id}">
          <header>
            <h2>${e.izena}</h2>
            <div class="tags">${e.gaiak.map(g => `<span class="tag">${g}</span>`).join('')}${solved().includes(e.id) ? '<span class="ch-solved">Ebatzita ✓</span>' : ''}</div>
          </header>
          <div class="challenge-body">
            <p class="brief">${e.brief}</p>
            <ul class="limits">${e.limits.map(l => `<li>${l}</li>`).join('')}</ul>
            <div class="ch-inputs">
              ${e.inputs.map(([label, key, def, options]) => `
                <label for="er-${e.id}-${key}">${label}
                  ${options
                    ? `<select id="er-${e.id}-${key}">${options.map(o => `<option value="${o}" ${o === def ? 'selected' : ''}>${o}</option>`).join('')}</select>`
                    : `<input id="er-${e.id}-${key}" type="text" inputmode="decimal" autocomplete="off" value="${def}">`}
                </label>`).join('')}
              <button class="btn primary" data-check="${e.id}">Probatu diseinua</button>
              <button class="btn sm ghost" data-hint="${e.id}">Pista</button>
            </div>
            <div class="ch-result" id="er-${e.id}-res" hidden aria-live="polite"></div>
            <p class="ch-hint" id="er-${e.id}-hint" hidden>${e.pista} <a href="#/${e.unitatea}">Errepasatu unitatea →</a></p>
          </div>
        </article>`).join('')}
    </div>

    <section class="project" id="proiektua">
      <div class="eyebrow">Amaierako proiektua</div>
      <h2>Asmatu zure makina</h2>
      <p>Taldeka, diseinatu eta eraiki kartoizko maketa bat, gutxienez <strong>bi mekanismo</strong> konbinatzen dituena (adibidez: motor bat, torloju amaigabe bat eta kremalera bat dituen ate bat; edo tornu bat eta polipasto bat dituen garabi bat).</p>
      <ol>
        <li><strong>Arazoa:</strong> zer egin behar du makinak? Idatzi esaldi batean.</li>
        <li><strong>Mekanismoak:</strong> aukeratu zein erabiliko dituzuen eta zergatik. Marraztu blokeen eskema: eragilea → mekanismoak → hartzailea.</li>
        <li><strong>Kalkuluak:</strong> transmisio-erlazioak, abiadurak edo indarrak. Erabili lantegiko formulak eta simulagailuak egiaztatzeko.</li>
        <li><strong>Zirriborroa:</strong> marraztu makina bi bistatan (ikus <a href="../marrazketa/">Marrazketa Lantegia</a>).</li>
        <li><strong>Maketa:</strong> kartoiz eraiki. Motorra nahi baduzue, ikus <a href="../etxeadimentsua/">Etxe adimentsua</a> (servo motorra, ArduinoBlocks).</li>
        <li><strong>Aurkezpena:</strong> 3 minutu. Zer egiten du, nola, zer ikasi duzuen eta zer hobetuko zenuketen.</li>
      </ol>
      <div class="print-only">
        <p style="margin-top:18px"><strong>Taldea:</strong> ________________________________ <strong>Data:</strong> ____________</p>
        <p><strong>1. Arazoa:</strong></p><div style="height:60px;border-bottom:1px solid #999"></div>
        <p><strong>2. Mekanismoak eta blokeen eskema:</strong></p><div style="height:140px;border:1px solid #999"></div>
        <p><strong>3. Kalkuluak:</strong></p><div style="height:160px;border:1px solid #999"></div>
        <p><strong>4. Zirriborroa:</strong></p><div style="height:220px;border:1px solid #999"></div>
      </div>
      <p class="no-print" style="margin-top:14px"><button class="btn" id="er-print">Inprimatu proiektuaren fitxa</button></p>
    </section>
    ${footer()}`;

  ERRONKAK.forEach(e => {
    const res = root.querySelector(`#er-${e.id}-res`);
    root.querySelector(`[data-check="${e.id}"]`).addEventListener('click', () => {
      const r = e.check();
      res.hidden = false;
      res.className = 'ch-result ' + (r.ok ? 'ok' : 'no');
      res.innerHTML = r.html;
      if (r.ok && !solved().includes(e.id)) {
        progress.set('erronkak', { ebatziak: [...solved(), e.id] });
        root.querySelector(`#er-${e.id} .tags`).insertAdjacentHTML('beforeend', '<span class="ch-solved">Ebatzita ✓</span>');
        root.querySelector('#er-count').innerHTML = countText();
      }
    });
    root.querySelector(`[data-hint="${e.id}"]`).addEventListener('click', () => {
      root.querySelector(`#er-${e.id}-hint`).hidden = false;
    });
  });
  root.querySelector('#er-print').addEventListener('click', () => window.print());
}
