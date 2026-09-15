// Programak kodetik eraiki, Blockly-ren JSON formatuan: adibideak, arazketako programa okerrak eta probak.
//   programa([hasieran([errepikatu(4, [aurrera()])])])
let kont = 0;
const bid = () => 'p' + (++kont).toString(36) + Math.random().toString(36).slice(2, 6);

const garbitu = o => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export function B(type, { fields, inputs, ...beste } = {}) {
  const b = { type, id: bid(), ...beste };
  if (fields) b.fields = fields;
  if (inputs && Object.keys(garbitu(inputs)).length) b.inputs = garbitu(inputs);
  return b;
}
export function kate(zerrenda) {
  const l = zerrenda.filter(Boolean);
  for (let i = l.length - 2; i >= 0; i--) l[i].next = { block: l[i + 1] };
  return l[0];
}
const multzoa = l => l && l.length ? { block: kate(l) } : undefined;
export const zenb = n => ({ shadow: { type: 'math_number', id: bid(), fields: { NUM: n } } });
// Balio-hutsunea: zenbakia → itzala; blokea → blokea
const bal = v => typeof v === 'number' ? zenb(v) : v ? { block: v } : undefined;
const VAR = izena => ({ VAR: { id: 'v_' + izena } });

// Altueraren estimazioa (zelos errendatzailea): goiko blokeak zutabe batean jartzeko, editore estuetan ere ikus daitezen
const kateAltuera = b => { let h = 0; for (let c = b; c; c = c.next?.block) h += blokeAltuera(c); return h; };
const blokeAltuera = b => 50 + ['DO', 'BESTELA'].filter(k => b.inputs && k in b.inputs).reduce((s, k) => s + Math.max(32, kateAltuera(b.inputs[k].block)) + 30, 0);

export function programa(goikoak, aldagaiak = []) {
  let y = 24;
  goikoak.forEach(t => {
    t.x ??= 24;
    if (t.y === undefined) { t.y = y; y += blokeAltuera(t) + (t.inputs?.DO ? 40 : 90); }
  });
  return { blocks: { languageVersion: 0, blocks: goikoak }, variables: aldagaiak.map(a => ({ name: a, id: 'v_' + a })) };
}

// ---------- gertaerak eta kontrola ----------
export const hasieran = (g, aukerak = {}) => B('ekitaldia_hasi', { inputs: { DO: multzoa(g) }, ...aukerak });
export const betiko = g => B('mb_betiko', { inputs: { DO: multzoa(g) } });
export const botoia = (botoia, g) => B('mb_botoia', { fields: { BOTOIA: botoia }, inputs: { DO: multzoa(g) } });
export const astintzean = g => B('mb_astindu', { inputs: { DO: multzoa(g) } });
export const errepikatu = (n, g) => B('kontrol_errepikatu', { inputs: { TIMES: bal(n), DO: multzoa(g) } });
export const bitartean = (c, g) => B('kontrol_bitartean', { inputs: { BALDINTZA: bal(c), DO: multzoa(g) } });
export const arte = (c, g) => B('kontrol_arte', { inputs: { BALDINTZA: bal(c), DO: multzoa(g) } });
export const betikoErrepikatu = g => B('kontrol_betiko', { inputs: { DO: multzoa(g) } });
export const baldin = (c, g) => B('kontrol_baldin', { inputs: { BALDINTZA: bal(c), DO: multzoa(g) } });
export const baldinBestela = (c, g, h) => B('kontrol_baldin_bestela', { inputs: { BALDINTZA: bal(c), DO: multzoa(g), BESTELA: multzoa(h) } });
export const itxaron = ms => B('kontrol_itxaron', { inputs: { MS: bal(ms) } });

// ---------- logika, matematika, aldagaiak ----------
export const konparatu = (a, op, b) => B('logika_konparatu', { fields: { OP: op }, inputs: { A: bal(a), B: bal(b) } });
export const etaEdo = (a, op, b) => B('logika_eta_edo', { fields: { OP: op }, inputs: { A: bal(a), B: bal(b) } });
export const ez = a => B('logika_ez', { inputs: { BOOL: bal(a) } });
export const zenbakia = n => B('math_number', { fields: { NUM: n } });
export const eragiketa = (a, op, b) => B('mate_eragiketa', { fields: { OP: op }, inputs: { A: bal(a), B: bal(b) } });
export const ausazkoa = (a, b) => B('mate_ausazkoa', { inputs: { A: bal(a), B: bal(b) } });
export const aldagaia = izena => B('variables_get', { fields: VAR(izena) });
export const ezarri = (izena, v) => B('variables_set', { fields: VAR(izena), inputs: { VALUE: bal(v) } });
export const aldatu = (izena, v) => B('math_change', { fields: VAR(izena), inputs: { DELTA: bal(v) } });
export const idatzi = v => B('k_idatzi', { inputs: { BALIOA: bal(v) } });
export const testua = t => B('testua', { fields: { TEXT: t } });
export const lotu = (a, b) => B('testu_lotu', { inputs: { A: bal(a), B: bal(b) } });

// ---------- robota ----------
export const aurrera = () => B('r_aurrera');
export const biratu = nora => B('r_biratu', { fields: { NORA: nora } });
export const margotu = () => B('r_margotu');
export const hartu = () => B('r_hartu');
export const bidea = nora => B('r_bidea', { fields: { NORA: nora } });
export const helmugan = () => B('r_helmugan');
export const izarra = () => B('r_izarra');

// ---------- Micro:bit ----------
export const ikonoa = i => B('mb_ikonoa', { fields: { IKONOA: i } });
export const mbZenbakia = v => B('mb_zenbakia', { inputs: { ZENB: bal(v) } });
export const mbTestua = t => B('mb_testua', { fields: { TEXT: t } });
export const led = (ekintza, x, y) => B('mb_led', { fields: { EKINTZA: ekintza }, inputs: { X: bal(x), Y: bal(y) } });
export const garbituPantaila = () => B('mb_garbitu');
export const sakatuta = b => B('mb_botoia_sakatuta', { fields: { BOTOIA: b } });
export const tenperatura = () => B('mb_tenperatura');
export const argia = () => B('mb_argia');
export const pinIdatzi = (pin, v) => B('mb_pin_idatzi', { fields: { PIN: pin, BALIOA: String(v) } });
export const pinAnalogikoa = pin => B('mb_pin_analogikoa', { fields: { PIN: pin } });
export const nota = (hz, ms) => B('mb_nota', { fields: { NOTA: String(hz) }, inputs: { MS: bal(ms) } });

// ---------- Arduino ----------
export const setup = g => B('ar_setup', { inputs: { DO: multzoa(g) } });
export const loop = g => B('ar_loop', { inputs: { DO: multzoa(g) } });
export const dIdatzi = (pin, v) => B('ar_digital_idatzi', { fields: { PIN: String(pin), BALIOA: v ? 'HIGH' : 'LOW' } });
export const dIrakurri = (pin = 2) => B('ar_digital_irakurri', { fields: { PIN: String(pin) } });
export const aIrakurri = pin => B('ar_analogiko_irakurri', { fields: { PIN: pin } });
export const pwm = (pin, v) => B('ar_pwm', { fields: { PIN: String(pin) }, inputs: { BALIOA: bal(v) } });
export const servo = v => B('ar_servo', { inputs: { GRADUAK: bal(v) } });
export const tonua = (hz, ms) => B('ar_tonua', { inputs: { HZ: bal(hz), MS: bal(ms) } });
export const mapatu = (v, a, b, c, d) => B('ar_map', { inputs: { BALIOA: bal(v), NL: bal(a), NH: bal(b), TL: bal(c), TH: bal(d) } });
export const serial = v => B('ar_serial', { inputs: { BALIOA: bal(v) } });

// ---------- robot mugikorra ----------
export const motorrak = (ezk, esk) => B('rm_motorrak', { inputs: { EZK: bal(ezk), ESK: bal(esk) } });
export const geldituMotorrak = () => B('rm_gelditu');
export const lerroa = alde => B('rm_lerroa', { fields: { ALDEA: alde } });
export const distantzia = () => B('rm_distantzia');

// ---------- aplikazio mugikorra ----------
export const apBotoia = (b, g) => B('ap_botoia', { fields: { BOTOIA: b }, inputs: { DO: multzoa(g) } });
export const apGraduatzailea = g => B('ap_graduatzailea', { inputs: { DO: multzoa(g) } });
export const apTenporizadorea = g => B('ap_tenporizadorea', { inputs: { DO: multzoa(g) } });
export const etiketa = v => B('ap_etiketa', { inputs: { BALIOA: bal(v) } });
export const apIrudia = i => B('ap_irudia', { fields: { IRUDIA: i } });
export const apKolorea = k => B('ap_kolorea', { fields: { KOLOREA: k } });
export const tenporizadorea = e => B('ap_tenp', { fields: { EGOERA: e } });
export const gradBalioa = () => B('ap_grad_balioa');
