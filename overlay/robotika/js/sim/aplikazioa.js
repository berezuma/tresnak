// Aplikazio mugikorra: App Inventor-en antzeko ingurunea. Pantailak osagaiak ditu (irudia, etiketa, bi botoi, graduatzailea,
// tenporizadorea), eta programa gertaeren blokeekin egiten da: aplikazioak ez du hasieratik amaierara exekutatzen,
// erabiltzaileak zerbait egiten duenean erantzuten du.
// Aukerak: adibideak [id], adibidea, gorde (gakoa), libre, maila
import { esc, irakurri, gorde } from '../util.js';
import { Exekutatzailea, fmtBalioa } from '../blokeak/exekutatzailea.js';
import * as E from '../blokeak/eraiki.js';

const L = (...a) => a.reduce((x, y) => E.lotu(x, y));
const V = E.aldagaia, T = E.testua;

export const APLIKAZIO_HATAK = { ap_botoia: b => 'gertaera:botoia' + b.fields?.BOTOIA, ap_graduatzailea: 'gertaera:grad', ap_tenporizadorea: 'gertaera:tenp' };

export const ADIBIDEAK = {
  hutsa: { izena: 'Aplikazio hutsa', azalpena: 'Hasi hutsetik: aukeratu gertaera bat (botoia sakatzean…) eta erabaki zer egin behar duen aplikazioak.',
    programa: () => E.programa([E.hasieran([]), E.apBotoia('B1', [])]) },
  kontagailua: { izena: 'Kontagailua', azalpena: 'Botoia1-ek 1 gehitzen dio kontagailuari, eta Botoia2-k zerora itzultzen du. Aldagaiak aplikazioaren memorian gordetzen dira gertaeren artean.',
    programa: () => E.programa([
      E.hasieran([E.ezarri('kontagailua', 0), E.etiketa(T('0'))]),
      E.apBotoia('B1', [E.aldatu('kontagailua', 1), E.etiketa(V('kontagailua'))]),
      E.apBotoia('B2', [E.ezarri('kontagailua', 0), E.etiketa(V('kontagailua'))])
    ], ['kontagailua']) },
  txanpona: { izena: 'Txanpona bota', azalpena: 'Botoia1 sakatzean, ausazko zenbaki bat (1 edo 2) eta, horren arabera, «aurpegia» edo «gurutzea». Sakatu askotan: bakoitza zenbat aldiz ateratzen da?',
    programa: () => E.programa([
      E.hasieran([E.etiketa(T('Sakatu Botoia1')), E.apIrudia('🪙')]),
      E.apBotoia('B1', [E.baldinBestela(E.konparatu(E.ausazkoa(1, 2), 'EQ', 1), [E.apIrudia('🙂'), E.etiketa(T('Aurpegia'))], [E.apIrudia('⭐'), E.etiketa(T('Gurutzea'))])])
    ]) },
  kronometroa: { izena: 'Kronometroa', azalpena: 'Botoia1-ek tenporizadorea pizten du eta Botoia2-k itzali. Tenporizadorea piztuta dagoen bitartean, segundo bakoitzean gertaera bat gertatzen da.',
    programa: () => E.programa([
      E.hasieran([E.ezarri('segundoak', 0), E.etiketa(T('0 s'))]),
      E.apBotoia('B1', [E.tenporizadorea('ON')]),
      E.apBotoia('B2', [E.tenporizadorea('OFF')]),
      E.apTenporizadorea([E.aldatu('segundoak', 1), E.etiketa(L(V('segundoak'), T(' s')))])
    ], ['segundoak']) },
  argia: { izena: 'Etxeko argia', azalpena: 'Graduatzailea mugitzean, etiketak ehunekoa erakusten du eta pantaila argitu edo iluntzen da. Etxe adimentsu baten aplikazioaren oinarria: benetan, balioa Bluetooth edo WiFi bidez bidaliko litzateke.',
    programa: () => E.programa([
      E.apGraduatzailea([
        E.etiketa(L(T('Argia: '), E.gradBalioa(), T(' %'))),
        E.baldinBestela(E.konparatu(E.gradBalioa(), 'LT', 50), [E.apKolorea('#222222'), E.apIrudia('🌧️')], [E.apKolorea('#fff3c4'), E.apIrudia('☀️')])
      ])
    ]) }
};

const argiaDa = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) > 140; };

export default function mount(box, opts = {}) {
  const P = 'ap' + Math.random().toString(36).slice(2, 7);
  const ids = opts.adibideak || Object.keys(ADIBIDEAK).filter(k => k !== 'hutsa' || opts.libre);
  const GAKOA = opts.gorde || 'robotika:aplikazioa:v1';
  const egoera = { programak: {}, ...irakurri(GAKOA, {}) };
  let aid = ids.includes(opts.adibidea) ? opts.adibidea : ids.includes(egoera.azkena) ? egoera.azkena : ids[0];
  let ex = null, ed = null, raf = 0, last = 0, hilda = false, gordeT = 0, tenp = false, tenpMs = 0, tenpKont = 0, log = [];
  const hasierakoa = { etiketa: 'Etiketa1', irudia: '🤖', kolorea: '#ffffff' };
  const app = { ...hasierakoa };

  box.innerHTML = `
    <div class="sim rb aps">
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
          <div class="rb-stage ap-stage">
            <div class="ap-tel">
              <div class="ap-pant itxita" id="${P}-pant">
                <div class="ap-izenb">Nire aplikazioa</div>
                <div class="ap-irudia" id="${P}-irudia" role="img" aria-label="Irudia1"></div>
                <div class="ap-etiketa" id="${P}-etiketa" aria-live="polite"></div>
                <div class="ap-botoiak"><button class="ap-btn" data-ap="B1">Botoia1</button><button class="ap-btn" data-ap="B2">Botoia2</button></div>
                <label class="ap-grad" for="${P}-grad">Graduatzailea1<input type="range" id="${P}-grad" min="0" max="100" value="50"></label>
                <div class="ap-tenp" id="${P}-tenp"></div>
              </div>
            </div>
          </div>
          <div class="rb-ctl">
            <div class="pills">
              <button class="btn sm primary" id="${P}-run">▶ Ireki aplikazioa</button>
              <button class="btn sm ghost" id="${P}-reset">Berrezarri</button>
            </div>
            <div><h4 class="fd-h">Gertaeren erregistroa</h4><ol class="ap-log" id="${P}-log"></ol></div>
            <div class="readouts" aria-live="off"><div><span>Aldagaiak</span><b id="${P}-vars">—</b></div></div>
            <p class="rb-msg" id="${P}-msg" aria-live="polite"></p>
          </div>
        </div>
      </div>
    </div>`;
  const $ = s => box.querySelector(s);

  function mezua(t, mota = '') { const el = $(`#${P}-msg`); el.className = 'rb-msg' + (mota ? ' ' + mota : ''); el.textContent = t; }
  const martxan = () => ex && ex.egoera === 'martxan';

  function pantaila() {
    const pant = $(`#${P}-pant`);
    pant.style.background = app.kolorea;
    pant.classList.toggle('iluna', !argiaDa(app.kolorea));
    pant.classList.toggle('itxita', !martxan());
    $(`#${P}-etiketa`).textContent = app.etiketa;
    $(`#${P}-irudia`).textContent = app.irudia;
    $(`#${P}-tenp`).textContent = `⏱ Tenporizadorea: ${tenp ? 'piztuta' : 'itzalita'}`;
    $(`#${P}-log`).innerHTML = log.map(l => `<li>${esc(l)}</li>`).join('') || '<li class="dim">Oraindik ez da gertaerarik izan.</li>';
    const vars = ex ? ex.aldagaiZerrenda().filter(([, v]) => v !== undefined).map(([k, v]) => `${k} = ${fmtBalioa(v)}`).join(' · ') : '';
    $(`#${P}-vars`).textContent = vars || '—';
  }
  function erregistratu(t) { log.unshift(t); if (log.length > 8) log.pop(); pantaila(); }

  const blokeak = {
    ap_etiketa: { *agindua(x, b) { app.etiketa = fmtBalioa(x.balioa(b, 'BALIOA')); pantaila(); } },
    ap_irudia: { *agindua(x, b) { app.irudia = b.fields?.IRUDIA || '🤖'; pantaila(); } },
    ap_kolorea: { *agindua(x, b) { app.kolorea = b.fields?.KOLOREA || '#ffffff'; pantaila(); } },
    ap_tenp: { *agindua(x, b) { tenp = b.fields?.EGOERA === 'ON'; tenpMs = 0; pantaila(); } },
    ap_grad_balioa: { balioa: () => +$(`#${P}-grad`).value }
  };

  function ireki() {
    const json = ed?.json();
    if (!json) return;
    itxi();
    Object.assign(app, hasierakoa);
    tenp = false; tenpKont = 0; log = [];
    ed.errorea(null);
    ex = new Exekutatzailea({ blokeak, hatak: APLIKAZIO_HATAK, muga: 200000 });
    ex.on('errorea', e => { mezua(e.message, 'err'); ed?.errorea(e.id); botoiak(); pantaila(); });
    ex.on('egoera', () => { botoiak(); pantaila(); });
    ex.kargatu(json);
    if (!ex.goikoak.some(b => ['ekitaldia_hasi', 'ap_botoia', 'ap_graduatzailea', 'ap_tenporizadorea'].includes(b.type))) {
      mezua('Jarri blokeak gertaera-bloke baten barruan (hasieran, botoia sakatzean…).', 'err');
      ex = null;
      return;
    }
    mezua(ex.entzuten() ? 'Aplikazioa irekita: erabili pantailako osagaiak.' : 'Aplikazio honek ez du gertaerarik entzuten: «hasieran» bakarrik exekutatzen da.');
    erregistratu('Aplikazioa ireki da');
    ex.hasi();
    begizta();
    botoiak();
    pantaila();
  }
  function begizta() {
    cancelAnimationFrame(raf);
    last = performance.now();
    const frame = now => {
      if (hilda) return;
      const dt = Math.min(now - last, 100);
      last = now;
      if (!martxan()) { raf = 0; pantaila(); return; }
      if (tenp) {
        tenpMs += dt;
        while (tenpMs >= 1000) { tenpMs -= 1000; tenpKont++; erregistratu(`Tenporizadorea (${tenpKont}.)`); ex.gertaera('tenp'); }
      }
      ex.aurreratu(dt);
      ed?.nabarmendu(martxan() ? ex.azkena : null);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  }
  function itxi() {
    if (martxan()) ex.gelditu();
    tenp = false;
    ed?.nabarmendu(null);
    botoiak();
  }
  function botoiak() {
    const run = $(`#${P}-run`);
    run.textContent = martxan() ? '■ Itxi aplikazioa' : '▶ Ireki aplikazioa';
    run.classList.toggle('primary', !martxan());
  }

  box.querySelectorAll('[data-ap]').forEach(b => b.addEventListener('click', () => {
    if (!martxan()) { mezua('Ireki aplikazioa lehenik (▶ Ireki aplikazioa).', 'warn'); return; }
    erregistratu(`${b.textContent} sakatuta`);
    ex.gertaera('botoia' + b.dataset.ap);
    ex.aurreratu(0);
  }));
  $(`#${P}-grad`).addEventListener('input', e => {
    if (!martxan()) return;
    if (log[0]?.startsWith('Graduatzailea1')) log.shift();
    erregistratu(`Graduatzailea1 → ${e.target.value}`);
    ex.gertaera('grad');
    ex.aurreratu(0);
  });
  $(`#${P}-run`).addEventListener('click', () => { if (martxan()) { itxi(); mezua('Aplikazioa itxita.'); erregistratu('Aplikazioa itxi da'); } else ireki(); });
  $(`#${P}-reset`).addEventListener('click', () => { itxi(); ex = null; Object.assign(app, hasierakoa); log = []; tenpKont = 0; mezua(''); ed?.errorea(null); pantaila(); });

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
    itxi();
    ex = null;
    aid = e.target.value;
    egoera.azkena = aid;
    gorde(GAKOA, egoera);
    $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena;
    ed?.kargatu(egoera.programak[aid]?.blocks ? egoera.programak[aid] : ADIBIDEAK[aid].programa());
    Object.assign(app, hasierakoa);
    log = [];
    mezua('');
    pantaila();
  });
  $(`#${P}-orig`).addEventListener('click', () => {
    itxi();
    delete egoera.programak[aid];
    gorde(GAKOA, egoera);
    ed?.kargatu(ADIBIDEAK[aid].programa());
    mezua('Jatorrizko programa kargatuta.');
  });

  $(`#${P}-desk`).textContent = ADIBIDEAK[aid].azalpena;
  pantaila();
  import('../blokeak/editorea.js').then(({ sortuEditorea }) => sortuEditorea($(`#${P}-ed`), {
    tresnak: 'aplikazioa',
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
    if (martxan()) ex.gelditu();
    clearTimeout(gordeT);
    if (ed) { egoera.programak[aid] = ed.json(); gorde(GAKOA, egoera); ed.dispose(); }
  };
}
