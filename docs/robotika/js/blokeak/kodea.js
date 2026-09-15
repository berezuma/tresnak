// Blokeetatik testu-kodera: Python eta C++ (Arduino), Blockly-ren JSON serializaziotik zuzenean.
// Ikasleak blokeen eta benetako kodearen arteko lotura ikus dezan: bloke bakoitza lerro bat edo adierazpen bat da.
//   sortuKodea(json, 'python' | 'cpp') → testua
//   margotu(testua, hizkuntza) → HTML (sintaxia koloreztatuta)
import { esc } from '../util.js';

const HITZ_ERRESERBATUAK = new Set(['and', 'or', 'not', 'if', 'else', 'elif', 'while', 'for', 'in', 'def', 'return', 'True', 'False', 'None', 'print', 'range', 'int', 'float', 'str', 'import', 'time', 'random', 'class', 'pass', 'break', 'continue', 'lambda', 'global',
  'void', 'setup', 'loop', 'true', 'false', 'const', 'long', 'char', 'bool', 'String', 'switch', 'case', 'do', 'delay', 'map', 'tone', 'min', 'max', 'abs', 'new', 'this', 'auto', 'double', 'return']);

const desgaituta = b => b.enabled === false || (Array.isArray(b.disabledReasons) && b.disabledReasons.length > 0);

function izenGarbia(s) {
  let t = String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ñ/g, 'n').replace(/Ñ/g, 'N').replace(/[^A-Za-z0-9_]/g, '_');
  if (!t) t = 'x';
  if (/^\d/.test(t)) t = '_' + t;
  return HITZ_ERRESERBATUAK.has(t) ? t + '_' : t;
}

const HASIERA = new Set(['ekitaldia_hasi', 'ar_setup']);
const BETIKO = new Set(['ar_loop', 'mb_betiko']);
const KONP = { EQ: '==', NEQ: '!=', LT: '<', LTE: '<=', GT: '>', GTE: '>=' };

export function sortuKodea(json, hizk = 'python') {
  const P = hizk === 'python';
  const ind = P ? '    ' : '  ';
  const izenak = new Map((json?.variables || []).map(v => [v.id, izenGarbia(v.name)]));
  const goikoak = (json?.blocks?.blocks || []).filter(b => !desgaituta(b));
  const G = { inportak: new Set(), irteerak: new Set(), sarrerak: new Set(), servo: false, serial: false, testuak: new Set(), begiztak: 0 };

  // aldagai testualak (C++-en String motakoak)
  const bisitatu = b => {
    if (!b) return;
    if (b.type === 'variables_set') {
      const v = b.inputs?.VALUE?.block || b.inputs?.VALUE?.shadow;
      if (v && (v.type === 'testua' || v.type === 'testu_lotu')) G.testuak.add(b.fields?.VAR?.id ?? b.fields?.VAR);
    }
    Object.values(b.inputs || {}).forEach(i => { bisitatu(i.block); bisitatu(i.shadow); });
    bisitatu(b.next?.block);
  };
  goikoak.forEach(bisitatu);

  const izena = b => { const f = b.fields?.VAR; const id = f && typeof f === 'object' ? f.id : f; return izenak.get(id) || izenGarbia(id || 'x'); };
  const zenbakiLiterala = c => c && (c.type === 'math_number') ? Number(c.fields?.NUM ?? 0) : null;

  // ---------- adierazpenak: [kodea, lehentasuna] ----------
  function sarrera(b, izenaI) { return b.inputs?.[izenaI]?.block || b.inputs?.[izenaI]?.shadow || null; }
  function bil(b, izenaI, gutxienez) {
    const c = sarrera(b, izenaI);
    if (!c) return P ? 'None' : '0';
    const [k, p] = adierazpena(c);
    return p < gutxienez ? `(${k})` : k;
  }
  function adierazpena(c) {
    switch (c.type) {
      case 'math_number': { const n = Number(c.fields?.NUM ?? 0); return [String(n), n < 0 ? 55 : 100]; }
      case 'logika_boolear': return [c.fields?.BOOL === 'GEZURRA' ? (P ? 'False' : 'false') : (P ? 'True' : 'true'), 100];
      case 'testua': return [JSON.stringify(String(c.fields?.TEXT ?? '')), 100];
      case 'variables_get': return [izena(c), 100];
      case 'logika_ez': return P ? [`not ${bil(c, 'BOOL', 40)}`, 35] : [`!${bil(c, 'BOOL', 90)}`, 80];
      case 'logika_eta_edo': {
        const edo = c.fields?.OP === 'EDO', p = edo ? 20 : 30;
        return [`${bil(c, 'A', p)} ${P ? (edo ? 'or' : 'and') : (edo ? '||' : '&&')} ${bil(c, 'B', p + 1)}`, p];
      }
      case 'logika_konparatu': return [`${bil(c, 'A', 41)} ${KONP[c.fields?.OP] || '=='} ${bil(c, 'B', 41)}`, 40];
      case 'mate_eragiketa': {
        const op = c.fields?.OP;
        if (op === 'HONDARRA') return P ? [`${bil(c, 'A', 61)} % ${bil(c, 'B', 61)}`, 60] : [`fmod(${bil(c, 'A', 0)}, ${bil(c, 'B', 0)})`, 100];
        if (op === 'ZATI') {
          if (P) return [`${bil(c, 'A', 60)} / ${bil(c, 'B', 61)}`, 60];
          const n = zenbakiLiterala(sarrera(c, 'B'));
          return n !== null && Number.isInteger(n) ? [`${bil(c, 'A', 60)} / ${n}.0`, 60] : [`${bil(c, 'A', 60)} / ${bil(c, 'B', 61)}`, 60];
        }
        const [s, p] = { GEHI: ['+', 50], KEN: ['-', 50], BIDER: ['*', 60] }[op] || ['+', 50];
        return [`${bil(c, 'A', p)} ${s} ${bil(c, 'B', p + 1)}`, p];
      }
      case 'mate_ausazkoa': {
        if (P) { G.inportak.add('random'); return [`random.randint(${bil(c, 'A', 0)}, ${bil(c, 'B', 0)})`, 100]; }
        const n = zenbakiLiterala(sarrera(c, 'B'));
        return [`random(${bil(c, 'A', 0)}, ${n !== null ? n + 1 : bil(c, 'B', 51) + ' + 1'})`, 100];
      }
      case 'testu_lotu': {
        // testuak eta beste lotura batzuk ez dira berriz bihurtu behar; C++-en ezkerreko zatiak String izan behar du
        const zatia = (izenaI, ezkerra) => {
          const s = sarrera(c, izenaI);
          if (!s) return '""';
          const [k] = adierazpena(s);
          if (s.type === 'testu_lotu') return k;
          if (s.type === 'testua') return P || !ezkerra ? k : `String(${k})`;
          return P ? `str(${k})` : `String(${k})`;
        };
        return [`${zatia('A', true)} + ${zatia('B', false)}`, 50];
      }
      // Arduino
      case 'ar_digital_irakurri': G.sarrerak.add(c.fields?.PIN); return [`digitalRead(${c.fields?.PIN})`, 100];
      case 'ar_analogiko_irakurri': return [`analogRead(${c.fields?.PIN})`, 100];
      case 'ar_map': return [`map(${['BALIOA', 'NL', 'NH', 'TL', 'TH'].map(k => bil(c, k, 0)).join(', ')})`, 100];
      default: return [P ? `None  # «${c.type}» blokea` : `0 /* «${c.type}» blokea */`, 100];
    }
  }

  // ---------- aginduak ----------
  function pila(b, izenaI, sak) {
    const lerroak = [];
    let c = b?.inputs?.[izenaI]?.block;
    while (c) {
      if (!desgaituta(c)) lerroak.push(...agindua(c, sak));
      c = c.next?.block;
    }
    return lerroak;
  }
  const blokea = (goiburua, gorputza, sak) => P
    ? [ind.repeat(sak) + goiburua + ':', ...(gorputza.length ? gorputza : [ind.repeat(sak + 1) + 'pass'])]
    : [ind.repeat(sak) + goiburua + ' {', ...gorputza, ind.repeat(sak) + '}'];
  const baldintza = (c, izenaI) => { const k = bil(c, izenaI, 0); return P ? k : `(${k})`; };

  function agindua(c, sak) {
    const i = ind.repeat(sak), sc = P ? '' : ';';
    switch (c.type) {
      case 'variables_set': return [`${i}${izena(c)} = ${bil(c, 'VALUE', 0)}${sc}`];
      case 'math_change': return [`${i}${izena(c)} += ${bil(c, 'DELTA', 0)}${sc}`];
      case 'k_idatzi': case 'ar_serial':
        if (!P) G.serial = true;
        return [P ? `${i}print(${bil(c, 'BALIOA', 0)})` : `${i}Serial.println(${bil(c, 'BALIOA', 0)});`];
      case 'kontrol_errepikatu': {
        const erabiliak = new Set(izenak.values());
        const aukerak = ['i', 'j', 'k', 'n', 'm'].filter(v => !erabiliak.has(v));
        const v = aukerak[G.begiztak % aukerak.length] || '_i';
        G.begiztak++;
        const n = bil(c, 'TIMES', 0), nl = zenbakiLiterala(sarrera(c, 'TIMES'));
        const gorp = pila(c, 'DO', sak + 1);
        G.begiztak--;
        return blokea(P ? `for ${v} in range(${nl !== null ? Math.floor(nl) : `int(${n})`})` : `for (int ${v} = 0; ${v} < ${n}; ${v}++)`, gorp, sak);
      }
      case 'kontrol_bitartean': return blokea(`while ${baldintza(c, 'BALDINTZA')}`, pila(c, 'DO', sak + 1), sak);
      case 'kontrol_arte': {
        const k = bil(c, 'BALDINTZA', P ? 40 : 90);
        return blokea(P ? `while not ${k}` : `while (!${k})`, pila(c, 'DO', sak + 1), sak);
      }
      case 'kontrol_betiko': return blokea(P ? 'while True' : 'while (true)', pila(c, 'DO', sak + 1), sak);
      case 'kontrol_baldin': return blokea(`if ${baldintza(c, 'BALDINTZA')}`, pila(c, 'DO', sak + 1), sak);
      case 'kontrol_baldin_bestela': {
        const lehena = blokea(`if ${baldintza(c, 'BALDINTZA')}`, pila(c, 'DO', sak + 1), sak);
        const bigarrena = blokea('else', pila(c, 'BESTELA', sak + 1), sak);
        if (P) return [...lehena, ...bigarrena];
        lehena[lehena.length - 1] = i + '} else {';
        return [...lehena, ...bigarrena.slice(1)];
      }
      case 'kontrol_itxaron': {
        const nl = zenbakiLiterala(sarrera(c, 'MS'));
        if (P) { G.inportak.add('time'); return [`${i}time.sleep(${nl !== null ? nl / 1000 : bil(c, 'MS', 60) + ' / 1000'})`]; }
        return [`${i}delay(${bil(c, 'MS', 0)});`];
      }
      case 'ar_digital_idatzi': G.irteerak.add(c.fields?.PIN); return [`${i}digitalWrite(${c.fields?.PIN}, ${c.fields?.BALIOA === 'HIGH' ? 'HIGH' : 'LOW'});`];
      case 'ar_pwm': G.irteerak.add(c.fields?.PIN); return [`${i}analogWrite(${c.fields?.PIN}, ${bil(c, 'BALIOA', 0)});`];
      case 'ar_servo': G.servo = true; return [`${i}servoa.write(${bil(c, 'GRADUAK', 0)});`];
      case 'ar_tonua': {
        G.irteerak.add('8');
        const ms = bil(c, 'MS', 0);
        return [`${i}tone(8, ${bil(c, 'HZ', 0)}, ${ms});`, `${i}delay(${ms});`];
      }
      default: return [P ? `${i}# «${c.type}» blokea` : `${i}// «${c.type}» blokea`];
    }
  }

  const hasiera = goikoak.filter(b => HASIERA.has(b.type)).flatMap(b => pila(b, 'DO', P ? 0 : 1));
  const betikoak = goikoak.filter(b => BETIKO.has(b.type));
  const betiko = betikoak.flatMap(b => pila(b, 'DO', 1));
  const bestelakoak = goikoak.filter(b => !HASIERA.has(b.type) && !BETIKO.has(b.type) && b.type !== 'variables_get');

  const aldagaiak = [...izenak].map(([id, iz]) => [iz, G.testuak.has(id)]);
  const out = [];
  if (P) {
    [...G.inportak].sort().forEach(m => out.push(`import ${m}`));
    if (G.inportak.size) out.push('');
    // hasieran zuzenean ezartzen diren aldagaiek ez dute hasierako baliorik behar
    const ezarriak = new Set();
    for (const top of goikoak.filter(b => HASIERA.has(b.type))) {
      for (let c = top.inputs?.DO?.block; c && c.type === 'variables_set'; c = c.next?.block) {
        const f = c.fields?.VAR;
        ezarriak.add(f && typeof f === 'object' ? f.id : f);
      }
    }
    const hasieratu = [...izenak].filter(([id]) => !ezarriak.has(id));
    if (hasieratu.length) { hasieratu.forEach(([id, iz]) => out.push(`${iz} = ${G.testuak.has(id) ? '""' : '0'}`)); out.push(''); }
    out.push(...hasiera);
    if (betikoak.length) { if (hasiera.length) out.push(''); out.push('while True:', ...(betiko.length ? betiko : ['    pass'])); }
    if (!hasiera.length && !betikoak.length) out.push('# Programa hutsik: jarri blokeak «hasieran» blokearen barruan.');
  } else {
    if (G.servo) out.push('#include <Servo.h>', '', 'Servo servoa;');
    aldagaiak.forEach(([iz, t]) => out.push(t ? `String ${iz} = "";` : `float ${iz} = 0;`));
    if (G.servo || aldagaiak.length) out.push('');
    const konfig = [];
    if (G.serial) konfig.push('  Serial.begin(9600);');
    [...G.irteerak].sort((a, b) => b - a).forEach(p => konfig.push(`  pinMode(${p}, OUTPUT);`));
    [...G.sarrerak].sort((a, b) => b - a).forEach(p => konfig.push(`  pinMode(${p}, INPUT);`));
    if (G.servo) konfig.push('  servoa.attach(6);');
    out.push('void setup() {', ...konfig, ...(konfig.length && hasiera.length ? [''] : []), ...hasiera, '}', '');
    out.push('void loop() {', ...(betiko.length ? betiko : ['  // hemen: etengabe errepikatzen dena']), '}');
  }
  if (bestelakoak.length) out.push('', P ? '# Oharra: «hasieran» edo «betiko» blokeetatik kanpoko blokeak ez dira kodean sartu.' : '// Oharra: setup edo loop blokeetatik kanpoko blokeak ez dira kodean sartu.');
  return out.join('\n');
}

const HITZ_GAKOAK = {
  python: /\b(import|while|for|in|range|if|else|elif|not|and|or|True|False|None|pass|print|int|str)\b/,
  cpp: /\b(void|float|int|String|for|while|if|else|true|false|return|include|Servo)\b/
};
export function margotu(kodea, hizk) {
  const gakoak = HITZ_GAKOAK[hizk].source;
  const re = new RegExp(`(#include[^\\n]*|#[^\\n]*|\\/\\/[^\\n]*)|("(?:\\\\.|[^"\\\\])*")|\\b(\\d+(?:\\.\\d+)?)\\b|${gakoak}|([A-Za-z_]\\w*)(?=\\()`, 'g');
  let html = '', azkena = 0, m;
  while ((m = re.exec(kodea))) {
    html += esc(kodea.slice(azkena, m.index));
    const [tok, iruzkina, katea, zenb, gakoa, funtzioa] = m;
    const cls = iruzkina ? (hizk === 'cpp' && tok.startsWith('#include') ? 'kd-g' : 'kd-i') : katea ? 'kd-s' : zenb ? 'kd-n' : gakoa ? 'kd-g' : funtzioa ? 'kd-f' : '';
    html += cls ? `<span class="${cls}">${esc(tok)}</span>` : esc(tok);
    azkena = m.index + tok.length;
  }
  return html + esc(kodea.slice(azkena));
}
