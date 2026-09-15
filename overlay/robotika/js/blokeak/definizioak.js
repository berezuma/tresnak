// Blokeen definizioak (Blockly-ren JSON formatua), euskaraz.
// Kategorien koloreak berak erabiltzen dira irudi estatikoetan (blokeHTML.js), bi lekuetan berdin ikus daitezen.
// Kolore guztiek letra zuriarekin 4,5:1 kontrastea gutxienez dute.

export const KOLOREAK = {
  gertaera: '#b8457a',
  kontrola: '#9a6700',
  logika: '#0f7f74',
  mate: '#2e7d4a',
  aldagaiak: '#b54d15',
  mugimendua: '#315eff',
  sentsorea: '#6d4fc9',
  pantaila: '#3552c0',
  pinak: '#a33d3d',
  soinua: '#a0368a',
  kontsola: '#4f5b69',
  arduino: '#00796b',
  aplikazioa: '#0b6e99'
};

// Micro:bit-en 5×5 ikonoak (errenkadak goitik behera)
export const IKONOAK = {
  BIHOTZA: ['01010', '11111', '11111', '01110', '00100'],
  BIHOTZ_TXIKIA: ['00000', '01010', '01110', '00100', '00000'],
  POZIK: ['00000', '01010', '00000', '10001', '01110'],
  TRISTE: ['00000', '01010', '00000', '01110', '10001'],
  BAI: ['00000', '00001', '00010', '10100', '01000'],
  EZ: ['10001', '01010', '00100', '01010', '10001'],
  GORA: ['00100', '01110', '10101', '00100', '00100'],
  BEHERA: ['00100', '00100', '10101', '01110', '00100'],
  EZKERRA: ['00100', '01000', '11111', '01000', '00100'],
  ESKUINA: ['00100', '00010', '11111', '00010', '00100'],
  NOTA: ['01111', '01001', '01001', '11011', '11011'],
  ATERKIA: ['01110', '11111', '00100', '10100', '01100'],
  EGUZKIA: ['10101', '01110', '11011', '01110', '10101'],
  TANTA: ['00100', '01110', '11111', '11111', '01110']
};
const IKONO_AUKERAK = [
  ['♥ bihotza', 'BIHOTZA'], ['♡ bihotz txikia', 'BIHOTZ_TXIKIA'], ['☺ pozik', 'POZIK'], ['☹ triste', 'TRISTE'],
  ['✓ bai', 'BAI'], ['✗ ez', 'EZ'], ['↑ gora', 'GORA'], ['↓ behera', 'BEHERA'], ['← ezkerrera', 'EZKERRA'], ['→ eskuinera', 'ESKUINA'],
  ['♪ musika', 'NOTA'], ['☂ aterkia', 'ATERKIA'], ['☀ eguzkia', 'EGUZKIA'], ['● ur tanta', 'TANTA']
];

const DO = [{ type: 'input_statement', name: 'DO' }];
const num = name => ({ type: 'input_value', name, check: 'Number' });
const bool = name => ({ type: 'input_value', name, check: 'Boolean' });
const dd = (name, options) => ({ type: 'field_dropdown', name, options });
const aldagaia = { type: 'field_variable', name: 'VAR', variable: 'x' };

const txapela = (type, message0, args0, tooltip) =>
  ({ type, message0, args0, message1: '%1', args1: DO, style: 'gertaera', tooltip });
const agindua = (type, style, message0, args0, tooltip, extra = {}) =>
  ({ type, message0, args0, previousStatement: null, nextStatement: null, style, tooltip, ...extra });
const balioa = (type, style, message0, args0, output, tooltip) =>
  ({ type, message0, args0, output, style, tooltip, inputsInline: true });

export const BLOKEAK = [
  // ---------- gertaerak ----------
  txapela('ekitaldia_hasi', 'hasieran', [], 'Programa hastean exekutatzen da, behin.'),
  txapela('mb_betiko', 'betiko', [], 'Barruko blokeak behin eta berriz exekutatzen dira, plaka piztuta dagoen bitartean.'),
  txapela('mb_botoia', 'botoia %1 sakatzean', [dd('BOTOIA', [['A', 'A'], ['B', 'B'], ['A+B', 'AB']])], 'Botoia sakatzen den bakoitzean exekutatzen da.'),
  txapela('mb_astindu', 'astintzean', [], 'Plaka astintzen denean exekutatzen da.'),

  // ---------- kontrola ----------
  { type: 'kontrol_errepikatu', message0: 'errepikatu %1 aldiz', args0: [num('TIMES')], message1: '%1', args1: DO, previousStatement: null, nextStatement: null, style: 'kontrola', tooltip: 'Barruko blokeak zenbaki jakin bat aldiz exekutatzen ditu.' },
  { type: 'kontrol_bitartean', message0: 'errepikatu %1 bitartean', args0: [bool('BALDINTZA')], message1: '%1', args1: DO, previousStatement: null, nextStatement: null, style: 'kontrola', tooltip: 'Baldintza egia den bitartean errepikatzen ditu barruko blokeak.' },
  { type: 'kontrol_arte', message0: 'errepikatu %1 arte', args0: [bool('BALDINTZA')], message1: '%1', args1: DO, previousStatement: null, nextStatement: null, style: 'kontrola', tooltip: 'Barruko blokeak errepikatzen ditu, baldintza egia izan arte.' },
  { type: 'kontrol_betiko', message0: 'betiko errepikatu', message1: '%1', args1: DO, previousStatement: null, style: 'kontrola', tooltip: 'Barruko blokeak etengabe errepikatzen ditu.' },
  { type: 'kontrol_baldin', message0: 'baldin %1 bada', args0: [bool('BALDINTZA')], message1: '%1', args1: DO, previousStatement: null, nextStatement: null, style: 'kontrola', tooltip: 'Baldintza egia bada bakarrik exekutatzen ditu barruko blokeak.' },
  { type: 'kontrol_baldin_bestela', message0: 'baldin %1 bada', args0: [bool('BALDINTZA')], message1: '%1', args1: DO, message2: 'bestela', message3: '%1', args3: [{ type: 'input_statement', name: 'BESTELA' }], previousStatement: null, nextStatement: null, style: 'kontrola', tooltip: 'Baldintza egia bada lehen taldea exekutatzen du; bestela, bigarrena.' },
  agindua('kontrol_itxaron', 'kontrola', 'itxaron %1 ms', [num('MS')], 'Programa pausatzen du (1000 ms = 1 segundo).', { inputsInline: true }),

  // ---------- logika ----------
  balioa('logika_konparatu', 'logika', '%1 %2 %3', [{ type: 'input_value', name: 'A' }, dd('OP', [['=', 'EQ'], ['≠', 'NEQ'], ['<', 'LT'], ['≤', 'LTE'], ['>', 'GT'], ['≥', 'GTE']]), { type: 'input_value', name: 'B' }], 'Boolean', 'Bi balio konparatzen ditu: emaitza egia edo gezurra da.'),
  balioa('logika_eta_edo', 'logika', '%1 %2 %3', [bool('A'), dd('OP', [['eta', 'ETA'], ['edo', 'EDO']]), bool('B')], 'Boolean', 'eta: biak egia badira. edo: bat gutxienez egia bada.'),
  balioa('logika_ez', 'logika', 'ez %1', [bool('BOOL')], 'Boolean', 'Egia gezurra bihurtzen du, eta gezurra egia.'),
  balioa('logika_boolear', 'logika', '%1', [dd('BOOL', [['egia', 'EGIA'], ['gezurra', 'GEZURRA']])], 'Boolean', 'Egia edo gezurra.'),

  // ---------- matematika ----------
  balioa('math_number', 'mate', '%1', [{ type: 'field_number', name: 'NUM', value: 0 }], 'Number', 'Zenbaki bat.'),
  balioa('mate_eragiketa', 'mate', '%1 %2 %3', [num('A'), dd('OP', [['+', 'GEHI'], ['−', 'KEN'], ['×', 'BIDER'], ['÷', 'ZATI'], ['mod', 'HONDARRA']]), num('B')], 'Number', 'Eragiketa aritmetikoa. mod: zatiketaren hondarra.'),
  balioa('mate_ausazkoa', 'mate', 'ausazkoa %1 eta %2 artean', [num('A'), num('B')], 'Number', 'Bi zenbakien arteko ausazko zenbaki oso bat (biak barne).'),

  // ---------- aldagaiak ----------
  balioa('variables_get', 'aldagaiak', '%1', [aldagaia], null, 'Aldagaian gordetako balioa.'),
  agindua('variables_set', 'aldagaiak', 'ezarri %1 ← %2', [aldagaia, { type: 'input_value', name: 'VALUE' }], 'Aldagaian balio bat gordetzen du (aurrekoa ordezkatuz).', { inputsInline: true }),
  agindua('math_change', 'aldagaiak', 'aldatu %1, gehitu %2', [aldagaia, num('DELTA')], 'Aldagaiari zenbaki bat gehitzen dio (negatiboa bada, kendu egiten dio).', { inputsInline: true }),

  // ---------- robota (sareta) ----------
  agindua('r_aurrera', 'mugimendua', 'aurrera egin', [], 'Robotak lauki bat egiten du aurrera.'),
  agindua('r_biratu', 'mugimendua', 'biratu %1', [dd('NORA', [['ezkerrera ↺', 'EZK'], ['eskuinera ↻', 'ESK']])], 'Robotak 90° biratzen du, lekuz aldatu gabe.'),
  agindua('r_margotu', 'mugimendua', 'margotu laukia', [], 'Robotaren azpiko laukia margotzen du.'),
  agindua('r_hartu', 'mugimendua', 'hartu izarra', [], 'Robotaren laukian dagoen izarra hartzen du.'),
  balioa('r_bidea', 'sentsorea', 'bidea libre %1', [dd('NORA', [['aurrean', 'AURRE'], ['ezkerrean', 'EZK'], ['eskuinean', 'ESK']])], 'Boolean', 'Egia, norabide horretan hormarik ez badago.'),
  balioa('r_helmugan', 'sentsorea', 'helmugan nago', [], 'Boolean', 'Egia, robota helmugan badago.'),
  balioa('r_izarra', 'sentsorea', 'izarra hemen', [], 'Boolean', 'Egia, robotaren laukian izar bat badago.'),

  // ---------- Micro:bit ----------
  agindua('mb_ikonoa', 'pantaila', 'erakutsi ikonoa %1', [dd('IKONOA', IKONO_AUKERAK)], 'LED pantailan irudi bat erakusten du.'),
  agindua('mb_zenbakia', 'pantaila', 'erakutsi zenbakia %1', [num('ZENB')], 'Zenbaki bat erakusten du (zifra bat baino gehiago baditu, korritzen).', { inputsInline: true }),
  agindua('mb_testua', 'pantaila', 'erakutsi testua %1', [{ type: 'field_input', name: 'TEXT', text: 'Kaixo!' }], 'Testu bat korritzen du pantailan.'),
  agindua('mb_led', 'pantaila', '%1 LEDa x %2 y %3', [dd('EKINTZA', [['piztu', 'PIZTU'], ['itzali', 'ITZALI'], ['aldatu', 'ALDATU']]), num('X'), num('Y')], 'LED bakar bat: x zutabea eta y errenkada, 0tik 4ra.', { inputsInline: true }),
  agindua('mb_garbitu', 'pantaila', 'garbitu pantaila', [], 'LED guztiak itzaltzen ditu.'),
  balioa('mb_botoia_sakatuta', 'sentsorea', 'botoia %1 sakatuta', [dd('BOTOIA', [['A', 'A'], ['B', 'B']])], 'Boolean', 'Egia, botoia une honetan sakatuta badago.'),
  balioa('mb_tenperatura', 'sentsorea', 'tenperatura (°C)', [], 'Number', 'Plakaren tenperatura-sentsorea, gradu zentigradutan.'),
  balioa('mb_argia', 'sentsorea', 'argi-maila', [], 'Number', 'LED pantailak neurtzen duen argia: 0 (iluna) eta 255 (argi handia) artean.'),
  agindua('mb_pin_idatzi', 'pinak', 'idatzi %1 %2 pin digitalean', [dd('BALIOA', [['1', '1'], ['0', '0']]), dd('PIN', [['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2']])], 'Pin bat piztu (1) edo itzali (0): LEDak, ponpak, erreleak…'),
  balioa('mb_pin_analogikoa', 'pinak', 'irakurri %1 pin analogikoa', [dd('PIN', [['P1', 'P1'], ['P0', 'P0'], ['P2', 'P2']])], 'Number', 'Pinari lotutako sentsore analogikoaren balioa: 0 eta 1023 artean.'),
  agindua('mb_nota', 'soinua', 'jo %1 nota %2 ms', [dd('NOTA', [['do', '262'], ['re', '294'], ['mi', '330'], ['fa', '349'], ['sol', '392'], ['la', '440'], ['si', '494'], ['do′', '523']]), num('MS')], 'Nota bat jotzen du bozgorailuan.', { inputsInline: true }),

  // ---------- kontsola ----------
  agindua('k_idatzi', 'kontsola', 'idatzi %1', [{ type: 'input_value', name: 'BALIOA' }], 'Balio bat kontsolan idazten du, lerro berri batean.', { inputsInline: true }),
  balioa('testua', 'kontsola', '“%1”', [{ type: 'field_input', name: 'TEXT', text: 'kaixo' }], 'String', 'Testu bat.'),
  balioa('testu_lotu', 'kontsola', 'lotu %1 %2', [{ type: 'input_value', name: 'A' }, { type: 'input_value', name: 'B' }], 'String', 'Bi testu edo zenbaki elkarren segidan jartzen ditu.'),

  // ---------- Arduino ----------
  txapela('ar_setup', 'setup: hasieran', [], 'Arduino piztean exekutatzen da, behin (void setup).'),
  txapela('ar_loop', 'loop: betiko', [], 'Etengabe errepikatzen da, setup amaitu ondoren (void loop).'),
  agindua('ar_digital_idatzi', 'arduino', 'idatzi %1 pinean %2', [dd('PIN', [['13 (LED gorria)', '13'], ['12 (LED horia)', '12'], ['11 (LED berdea)', '11'], ['9 (LED urdina)', '9'], ['7 (haizagailua)', '7']]), dd('BALIOA', [['HIGH (1)', 'HIGH'], ['LOW (0)', 'LOW']])], 'digitalWrite: pin digital bat 5 V-ra (HIGH) edo 0 V-ra (LOW) jartzen du.'),
  agindua('ar_pwm', 'arduino', 'idatzi PWM %1 pinean %2', [dd('PIN', [['~9 (LED urdina)', '9'], ['~11 (LED berdea)', '11']]), num('BALIOA')], 'analogWrite: 0 (itzalita) eta 255 (potentzia osoa) arteko balioa, PWM bidez.', { inputsInline: true }),
  agindua('ar_servo', 'arduino', 'mugitu servoa (~6) %1 gradura', [num('GRADUAK')], 'Servomotorra 0° eta 180° arteko angelu batera mugitzen du.', { inputsInline: true }),
  agindua('ar_tonua', 'arduino', 'jo tonua (8) %1 Hz %2 ms', [num('HZ'), num('MS')], 'tone: buzzerrean maiztasun bateko soinua jotzen du.', { inputsInline: true }),
  agindua('ar_serial', 'kontsola', 'Serial idatzi %1', [{ type: 'input_value', name: 'BALIOA' }], 'Serial.println: ordenagailuaren serie-monitorean idazten du.', { inputsInline: true }),
  balioa('ar_digital_irakurri', 'sentsorea', 'irakurri %1 pin digitala', [dd('PIN', [['2 (botoia)', '2']])], ['Number', 'Boolean'], 'digitalRead: 1 (HIGH, 5 V) edo 0 (LOW, 0 V).'),
  balioa('ar_analogiko_irakurri', 'sentsorea', 'irakurri %1 pin analogikoa', [dd('PIN', [['A0 (potentziometroa)', 'A0'], ['A1 (LDR)', 'A1']])], 'Number', 'analogRead: 0 (0 V) eta 1023 (5 V) arteko balioa.'),
  balioa('ar_map', 'mate', 'mapatu %1 [%2, %3] → [%4, %5]', [num('BALIOA'), num('NL'), num('NH'), num('TL'), num('TH')], 'Number', 'map: tarte bateko balioa beste tarte batera eramaten du, proportzioan (zenbaki osoak).'),

  // ---------- robot mugikorra ----------
  agindua('rm_motorrak', 'mugimendua', 'motorrak: ezkerra %1 % · eskuina %2 %', [num('EZK'), num('ESK')], 'Motor bakoitzaren abiadura: −100 (atzera) eta 100 (aurrera) artean.', { inputsInline: true }),
  agindua('rm_gelditu', 'mugimendua', 'gelditu motorrak', [], 'Bi motorrak gelditzen ditu.'),
  balioa('rm_lerroa', 'sentsorea', 'lerro-sentsorea %1 beltzean', [dd('ALDEA', [['ezkerra', 'EZK'], ['eskuina', 'ESK']])], 'Boolean', 'Egia, sentsorearen azpian lerro beltza badago (infragorri-sentsorea).'),
  balioa('rm_distantzia', 'sentsorea', 'distantzia aurrean (cm)', [], 'Number', 'Ultrasoinu-sentsorea: aurrean dagoen oztoporaino dagoen distantzia, zentimetrotan.'),

  // ---------- aplikazio mugikorra ----------
  txapela('ap_botoia', '%1 sakatzean', [dd('BOTOIA', [['Botoia1', 'B1'], ['Botoia2', 'B2']])], 'Botoia sakatzen den bakoitzean exekutatzen da.'),
  txapela('ap_graduatzailea', 'Graduatzailea1 aldatzean', [], 'Graduatzailea mugitzen den bakoitzean exekutatzen da.'),
  txapela('ap_tenporizadorea', 'Tenporizadorea: segundoro', [], 'Tenporizadorea piztuta dagoen bitartean, segundo bakoitzean exekutatzen da.'),
  agindua('ap_etiketa', 'aplikazioa', 'ezarri Etiketa1 testua %1', [{ type: 'input_value', name: 'BALIOA' }], 'Etiketaren testua aldatzen du.', { inputsInline: true }),
  agindua('ap_irudia', 'aplikazioa', 'erakutsi irudia %1', [dd('IRUDIA', [['🤖 robota', '🤖'], ['🙂 aurpegia', '🙂'], ['⭐ izarra', '⭐'], ['🪙 txanpona', '🪙'], ['☀️ eguzkia', '☀️'], ['🌧️ euria', '🌧️'], ['❤️ bihotza', '❤️'], ['🚦 semaforoa', '🚦']])], 'Irudi-osagaiaren irudia aldatzen du.'),
  agindua('ap_kolorea', 'aplikazioa', 'ezarri pantailaren kolorea %1', [dd('KOLOREA', [['zuria', '#ffffff'], ['horia', '#fff3c4'], ['berdea', '#d4f5dc'], ['urdina', '#d6e4ff'], ['gorria', '#ffd6d2'], ['beltza', '#222222']])], 'Pantailaren atzeko kolorea aldatzen du.'),
  agindua('ap_tenp', 'aplikazioa', 'tenporizadorea %1', [dd('EGOERA', [['piztu', 'ON'], ['itzali', 'OFF']])], 'Tenporizadorea piztu edo itzaltzen du.'),
  balioa('ap_grad_balioa', 'aplikazioa', 'Graduatzailea1 balioa', [], 'Number', 'Graduatzailearen posizioa: 0 eta 100 artean.')
];

// Tresna-kutxetan zenbakiek hutsune lehenetsia izan dezaten
export const itzala = (NUM = 0) => ({ shadow: { type: 'math_number', fields: { NUM } } });
