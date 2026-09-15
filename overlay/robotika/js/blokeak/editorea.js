// Blockly bloke-editorea: behin kargatzen da (webgunearen vendor karpetatik, kanpoko zerbitzaririk gabe),
// euskarazko blokeekin, lantegiaren gai argi/ilunarekin eta tresna-kutxa aurrezarriekin.
//   const ed = await sortuEditorea(el, { tresnak: 'microbit' | ['r_aurrera', …], json, onAldaketa })
//   ed.json() · ed.kargatu(json) · ed.tresnak(t) · ed.nabarmendu(id) · ed.errorea(id) · ed.dispose()
import { BLOKEAK, KOLOREAK, itzala } from './definizioak.js';
import { tok } from '../util.js';

const VENDOR = new URL('../../../oinarria/vendor/blockly-13.3.0/', import.meta.url).href;

function script(src) {
  return new Promise((ondo, txarto) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = ondo;
    s.onerror = () => txarto(new Error('Ezin izan da kargatu: ' + src));
    document.head.appendChild(s);
  });
}

const MEZUAK = {
  ADD_COMMENT: 'Gehitu iruzkina', REMOVE_COMMENT: 'Kendu iruzkina', DUPLICATE_BLOCK: 'Bikoiztu', DUPLICATE_COMMENT: 'Bikoiztu iruzkina',
  EXTERNAL_INPUTS: 'Sarrerak kanpoan', INLINE_INPUTS: 'Sarrerak lerroan',
  DELETE_BLOCK: 'Ezabatu blokea', DELETE_X_BLOCKS: 'Ezabatu %1 bloke', DELETE_ALL_BLOCKS: 'Ezabatu %1 blokeak?',
  CLEAN_UP: 'Txukundu blokeak', COLLAPSE_BLOCK: 'Tolestu blokea', COLLAPSE_ALL: 'Tolestu blokeak',
  EXPAND_BLOCK: 'Zabaldu blokea', EXPAND_ALL: 'Zabaldu blokeak', DISABLE_BLOCK: 'Desgaitu blokea', ENABLE_BLOCK: 'Gaitu blokea',
  HELP: 'Laguntza', UNDO: 'Desegin', REDO: 'Berregin', CHANGE_VALUE_TITLE: 'Aldatu balioa:',
  NEW_VARIABLE: 'Sortu aldagaia…', NEW_VARIABLE_TITLE: 'Aldagai berriaren izena:',
  RENAME_VARIABLE: 'Aldatu izena…', RENAME_VARIABLE_TITLE: '«%1» aldagaiaren izen berria:',
  DELETE_VARIABLE: 'Ezabatu «%1» aldagaia', DELETE_VARIABLE_CONFIRMATION: '«%2» aldagaiaren %1 erabilera ezabatu?',
  VARIABLE_ALREADY_EXISTS: '«%1» izeneko aldagaia badago jadanik.', VARIABLES_DEFAULT_NAME: 'x',
  WORKSPACE_COMMENT_DEFAULT_TEXT: 'Idatzi hemen'
};

let kargatzen = null;
export function kargatuBlockly() {
  kargatzen ||= (async () => {
    if (!window.Blockly) {
      await script(VENDOR + 'blockly_compressed.js');
      await script(VENDOR + 'msg/eu.js');
    }
    const B = window.Blockly;
    Object.assign(B.Msg, MEZUAK);
    if (!B.Blocks.kontrol_errepikatu) B.common.defineBlocksWithJsonArray(BLOKEAK);
    return B;
  })();
  return kargatzen;
}

// ---------- gaia: lantegiaren koloreak (argia edo iluna) ----------
function hex(c) { return c.startsWith('#') && c.length === 7 ? c : '#888888'; }
function nahastu(a, b, t) {
  const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16));
  const [x, y] = [p(hex(a)), p(hex(b))];
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
let gaiKont = 0;
function gaia(B) {
  const t = (n, def) => { const v = tok(n); return /^#[0-9a-f]{6}$/i.test(v) ? v : def; };
  const paper = t('--paper', '#f9f8f5'), sheet = t('--sheet', '#ffffff'), ink = t('--ink', '#000000');
  const blockStyles = {}, categoryStyles = {};
  for (const [k, c] of Object.entries(KOLOREAK)) {
    blockStyles[k] = { colourPrimary: c, colourSecondary: nahastu(c, '#ffffff', 0.3), colourTertiary: nahastu(c, '#000000', 0.3), ...(k === 'gertaera' ? { hat: 'cap' } : {}) };
    categoryStyles[k] = { colour: c };
  }
  const g = new B.Theme('robotika-' + (++gaiKont), blockStyles, categoryStyles, {
    workspaceBackgroundColour: paper,
    toolboxBackgroundColour: sheet,
    toolboxForegroundColour: ink,
    flyoutBackgroundColour: t('--chip', '#f3f2ee'),
    flyoutForegroundColour: t('--ink2', '#444444'),
    flyoutOpacity: 1,
    scrollbarColour: t('--ink3', '#666666'),
    scrollbarOpacity: 0.35,
    insertionMarkerColour: ink,
    insertionMarkerOpacity: 0.3,
    cursorColour: t('--s1', '#315eff'),
    selectedGlowColour: t('--s1', '#315eff'),
    selectedGlowOpacity: 0.5,
    replacementGlowColour: t('--s4', '#d85c8a')
  });
  g.setFontStyle({ family: 'Lato, system-ui, sans-serif', weight: '700', size: 12 });
  return g;
}

// ---------- tresna-kutxak ----------
const ITZALAK = {
  kontrol_errepikatu: { TIMES: 4 }, kontrol_itxaron: { MS: 500 },
  mb_zenbakia: { ZENB: 0 }, mb_led: { X: 2, Y: 2 }, mb_nota: { MS: 250 },
  mate_eragiketa: { A: 1, B: 1 }, mate_ausazkoa: { A: 1, B: 6 }, logika_konparatu: { A: 0, B: 0 },
  ar_pwm: { BALIOA: 128 }, ar_servo: { GRADUAK: 90 }, ar_tonua: { HZ: 440, MS: 200 }, ar_map: { BALIOA: 0, NL: 0, NH: 1023, TL: 0, TH: 255 },
  rm_motorrak: { EZK: 50, ESK: 50 }
};
function blokea(type) {
  const b = { kind: 'block', type };
  if (ITZALAK[type]) b.inputs = Object.fromEntries(Object.entries(ITZALAK[type]).map(([k, v]) => [k, itzala(v)]));
  if (type === 'k_idatzi' || type === 'ar_serial' || type === 'ap_etiketa') b.inputs = { BALIOA: { shadow: { type: 'testua', fields: { TEXT: 'kaixo' } } } };
  if (type === 'testu_lotu') b.inputs = { A: { shadow: { type: 'testua', fields: { TEXT: 'emaitza: ' } } }, B: itzala(0) };
  return b;
}
const KONTROLA = ['Kontrola', 'kontrola', ['kontrol_errepikatu', 'kontrol_bitartean', 'kontrol_arte', 'kontrol_baldin', 'kontrol_baldin_bestela']];
const LOGIKA = ['Logika', 'logika', ['logika_konparatu', 'logika_eta_edo', 'logika_ez', 'logika_boolear']];
const MATE = ['Matematika', 'mate', ['math_number', 'mate_eragiketa', 'mate_ausazkoa']];
export const PRESETAK = {
  robota: [
    ['Gertaerak', 'gertaera', ['ekitaldia_hasi']],
    ['Mugimendua', 'mugimendua', ['r_aurrera', 'r_biratu', 'r_margotu', 'r_hartu']],
    ['Sentsoreak', 'sentsorea', ['r_bidea', 'r_helmugan', 'r_izarra']],
    KONTROLA, LOGIKA, MATE, 'ALDAGAIAK'
  ],
  microbit: [
    ['Gertaerak', 'gertaera', ['ekitaldia_hasi', 'mb_betiko', 'mb_botoia', 'mb_astindu']],
    ['Pantaila', 'pantaila', ['mb_ikonoa', 'mb_zenbakia', 'mb_testua', 'mb_led', 'mb_garbitu']],
    ['Sarrerak', 'sentsorea', ['mb_botoia_sakatuta', 'mb_tenperatura', 'mb_argia']],
    ['Pinak', 'pinak', ['mb_pin_idatzi', 'mb_pin_analogikoa']],
    ['Soinua', 'soinua', ['mb_nota']],
    ['Kontrola', 'kontrola', ['kontrol_itxaron', 'kontrol_errepikatu', 'kontrol_bitartean', 'kontrol_baldin', 'kontrol_baldin_bestela']],
    LOGIKA, MATE, 'ALDAGAIAK'
  ],
  kontsola: [
    ['Gertaerak', 'gertaera', ['ekitaldia_hasi']],
    ['Kontsola', 'kontsola', ['k_idatzi', 'testua', 'testu_lotu']],
    KONTROLA, LOGIKA, MATE, 'ALDAGAIAK'
  ],
  arduino: [
    ['Gertaerak', 'gertaera', ['ar_setup', 'ar_loop']],
    ['Irteerak', 'arduino', ['ar_digital_idatzi', 'ar_pwm', 'ar_servo', 'ar_tonua']],
    ['Sarrerak', 'sentsorea', ['ar_digital_irakurri', 'ar_analogiko_irakurri']],
    ['Serie-monitorea', 'kontsola', ['ar_serial', 'testua', 'testu_lotu']],
    ['Kontrola', 'kontrola', ['kontrol_itxaron', 'kontrol_errepikatu', 'kontrol_bitartean', 'kontrol_baldin', 'kontrol_baldin_bestela']],
    LOGIKA, ['Matematika', 'mate', ['math_number', 'mate_eragiketa', 'ar_map', 'mate_ausazkoa']], 'ALDAGAIAK'
  ],
  robotmugikorra: [
    ['Gertaerak', 'gertaera', ['ekitaldia_hasi', 'mb_betiko']],
    ['Motorrak', 'mugimendua', ['rm_motorrak', 'rm_gelditu']],
    ['Sentsoreak', 'sentsorea', ['rm_lerroa', 'rm_distantzia']],
    ['Kontrola', 'kontrola', ['kontrol_itxaron', 'kontrol_errepikatu', 'kontrol_bitartean', 'kontrol_arte', 'kontrol_baldin', 'kontrol_baldin_bestela']],
    LOGIKA, MATE, 'ALDAGAIAK'
  ],
  aplikazioa: [
    ['Gertaerak', 'gertaera', ['ekitaldia_hasi', 'ap_botoia', 'ap_graduatzailea', 'ap_tenporizadorea']],
    ['Osagaiak', 'aplikazioa', ['ap_etiketa', 'ap_irudia', 'ap_kolorea', 'ap_tenp', 'ap_grad_balioa']],
    ['Testua', 'kontsola', ['testua', 'testu_lotu']],
    KONTROLA, LOGIKA, MATE, 'ALDAGAIAK'
  ]
};
export function tresnaKutxa(t) {
  if (Array.isArray(t)) return { kind: 'flyoutToolbox', contents: t.map(blokea) };
  return {
    kind: 'categoryToolbox',
    contents: (PRESETAK[t] || PRESETAK.robota).map(k => k === 'ALDAGAIAK'
      ? { kind: 'category', name: 'Aldagaiak', categorystyle: 'aldagaiak', custom: 'VARIABLE' }
      : { kind: 'category', name: k[0], categorystyle: k[1], contents: k[2].map(blokea) })
  };
}

// ---------- editorea ----------
export async function sortuEditorea(el, { tresnak = 'robota', json = null, onAldaketa = null, eskala = 0.8 } = {}) {
  const B = await kargatuBlockly();
  el.innerHTML = '';
  const host = document.createElement('div');
  host.className = 'blk-host';
  el.appendChild(host);

  const ws = B.inject(host, {
    toolbox: tresnaKutxa(tresnak),
    renderer: 'zelos',
    theme: gaia(B),
    media: VENDOR + 'media/',
    sounds: false,
    trashcan: true,
    zoom: { controls: true, wheel: false, startScale: eskala, maxScale: 1.6, minScale: 0.4, scaleSpeed: 1.15 },
    move: { scrollbars: true, drag: true, wheel: true }
  });

  let isila = false, azkenNab = null, azkenErr = null;
  ws.addChangeListener(B.Events.disableOrphans);
  ws.addChangeListener(e => {
    if (isila || e.isUiEvent || e.type === B.Events.FINISHED_LOADING) return;
    onAldaketa?.(e);
  });

  function kargatu(j) {
    isila = true;
    try {
      ws.clear();
      if (j) B.serialization.workspaces.load(j, ws);
    } finally {
      isila = false;
    }
    ws.clearUndo();
    azkenNab = azkenErr = null;
    ws.scroll(0, 0);
  }
  kargatu(json);

  // Tamaina: edukiontzia aldatzean eta gaia aldatzean
  const ro = new ResizeObserver(() => B.svgResize(ws));
  ro.observe(el);
  const berriroMargotu = () => ws.setTheme(gaia(B));
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', berriroMargotu);
  const mo = new MutationObserver(berriroMargotu);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return {
    ws,
    json: () => B.serialization.workspaces.save(ws),
    kargatu,
    tresnak(t) { ws.updateToolbox(tresnaKutxa(t)); },
    nabarmendu(id) {
      if (id === azkenNab) return;
      azkenNab = id;
      ws.highlightBlock(id && ws.getBlockById(id) ? id : null);
    },
    errorea(id) {
      if (azkenErr) ws.getBlockById(azkenErr)?.getSvgRoot()?.classList.remove('blk-errorea');
      azkenErr = null;
      const b = id && ws.getBlockById(id);
      if (!b) return;
      azkenErr = id;
      b.getSvgRoot()?.classList.add('blk-errorea');
      ws.highlightBlock(id);
      azkenNab = id;
    },
    dispose() {
      ro.disconnect();
      mo.disconnect();
      mq.removeEventListener('change', berriroMargotu);
      ws.dispose();
    }
  };
}
