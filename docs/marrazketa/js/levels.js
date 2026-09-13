/* ============================================================
   MAILAK ETA ARIKETAK
   Hasiberritik adituraino (5 maila). Ariketa bakoitza hazi batetik sortzen da:
   ikasle guztiek ariketa BERA ikusten dute (gelan komentatzeko).
   ============================================================ */

import { generatePiece, rng, mutatePiece } from "./geo/gen.js";
import { buildSolid, toCellMap, key, parseKey, heightGrid } from "./geo/solid.js";
import { projectView, viewAtoms, sameAtoms } from "./geo/project.js";

export const TYPES = {
  aukeratu:    { title: "Zein da bista?",            short: "Bista aukeratu",   desc: "Biratu pieza 3Dn eta aukeratu eskatutako bista zuzena." },
  zenbakiak:   { title: "Oinplano zenbakidua",       short: "Zenbakiekin eraiki", desc: "Lauki bakoitzeko zenbakiak zutabe horretako kubo kopurua adierazten du. Eraiki pieza." },
  isometrikoa: { title: "Zein da pieza?",            short: "Pieza aukeratu",   desc: "Begiratu hiru bistak eta aukeratu dagokien perspektiba isometrikoa." },
  marraztu:    { title: "Bista marraztu",            short: "Bista marraztu",   desc: "Marraztu eskatutako bista sarean." },
  eraiki:      { title: "Pieza eraiki",              short: "Bistetatik eraiki", desc: "Hiru bistetatik abiatuta, eraiki pieza 3Dn." },
  akotatu:     { title: "Akotatu",                   short: "Akotatu",          desc: "Jarri pieza guztiz zehazteko behar diren kotak: bat ere ez falta, bat ere ez soberan." },
  sistema:     { title: "Europarra ala amerikarra?", short: "Bisten sistema",   desc: "Aukeratu bistak ondo kokatuta dituen orria." }
};

export const VIEW_ORDER = ["F", "T", "L"];

export const LEVELS = [
  {
    n: 1, code: "Hasiberria", title: "Kuboekin pentsatu", hidden: true,
    goals: ["Pieza bat 3Dn biratu eta alde guztietatik ikusi", "Altxaera, oinplanoa eta profila bereizi", "Oinplano zenbakidua irakurri"],
    set: [["aukeratu", 4], ["zenbakiak", 3], ["isometrikoa", 3]],
    theory: [
      { h: "Zer da bista bat?", p: "Pieza bat alde batetik, zuzen-zuzen begiratuta ikusten duguna. Sakonerarik gabe marrazten da: urrutiko eta hurbileko ertzak tamaina berean ikusten dira." },
      { h: "Hiru bista nagusiak", p: "<b class='vF'>Altxaera</b>: aurretik ikusita. <b class='vT'>Oinplanoa</b>: goitik ikusita. <b class='vL'>Ezkerreko profila</b>: ezkerretik ikusita. 3D ikustailean kolore berekin agertzen dira aurpegiak." },
      { h: "Marra etenak", p: "Bista batean ikusten <b>ez</b> diren ertzak (piezaren atzean edo barruan geratzen direnak) <b>marra etenez</b> marrazten dira. Horrela jakin dezakegu zer dagoen ezkutuan." },
      { h: "Oinplano zenbakidua", p: "Oinplanoko lauki bakoitzean zenbaki bat idazten da: zutabe horretan zenbat kubo dauden bata bestearen gainean." }
    ],
    sample: "0_0_0:c 1_0_0:c 2_0_0:c 0_1_0:c 0_0_1:c 0_1_1:c 0_1_2:c"
  },
  {
    n: 2, code: "Oinarrizkoa", title: "Bistak marraztu", hidden: true,
    goals: ["Bistak sarean marraztu", "Bisten kokapena ezagutu (sistema europarra)", "Bisten arteko lerrokatzea ulertu"],
    set: [["aukeratu", 2], ["marraztu", 4], ["isometrikoa", 2], ["eraiki", 2]],
    theory: [
      { h: "Bisten kokapena", p: "Sistema europarrean <b class='vF'>altxaera</b> goian ezkerrean jartzen da, <b class='vT'>oinplanoa</b> haren azpian eta <b class='vL'>ezkerreko profila</b> altxaeraren eskuinean." },
      { h: "Lerrokatuta", p: "Altxaerak eta oinplanoak <b>zabalera</b> bera dute; altxaerak eta profilak <b>altuera</b> bera; oinplanoak eta profilak <b>sakonera</b> bera. Horregatik lerrokatuta marrazten dira." },
      { h: "Noiz marrazten da lerro bat?", p: "Bi aurpegi elkartzen diren lekuan (ertz batean) lerroa marrazten da. Plano berean dauden bi aurpegiren artean ez dago lerrorik." }
    ],
    sample: "0_0_0:c 1_0_0:c 2_0_0:c 0_1_0:c 1_1_0:c 0_0_1:c 0_1_1:c"
  },
  {
    n: 3, code: "Tartekoa", title: "Ezkutuko ertzak", hidden: true,
    goals: ["Ezkutuko ertzak marra etenez marraztu", "Hiru bistetatik pieza irudikatu", "Hegalak eta zuloak dituzten piezak"],
    set: [["marraztu", 4], ["eraiki", 3], ["aukeratu", 2]],
    theory: [
      { h: "Ezkutuko ertzak", p: "Bista batean ikusten EZ diren ertzak <b>marra etenez</b> marrazten dira. Horrela, bista batek piezaren barrualdeaz ere informazioa ematen du." },
      { h: "Lehentasuna", p: "Marra jarraitu batek eta eten batek toki bera betetzen badute, <b>jarraitua</b> marrazten da." },
      { h: "Bistak irakurri", p: "Bista bateko puntu bat beste bistetan bilatzeko, jarraitu lerrokatze-lerroak: altxaeratik oinplanora bertikalki, altxaeratik profilera horizontalki." }
    ],
    sample: "0_0_0:c 2_0_0:c 0_1_0:c 1_1_0:c 2_1_0:c 0_0_1:c 1_0_1:c 2_0_1:c"
  },
  {
    n: 4, code: "Aurreratua", title: "Aurpegi inklinatuak eta akotazioa", hidden: true,
    goals: ["Aurpegi inklinatuak bistetan", "Kotak jarri: kota-lerroa, luzapen-lerroak, geziak", "Akotazioaren oinarrizko arauak"],
    set: [["marraztu", 3], ["eraiki", 2], ["akotatu", 4]],
    theory: [
      { h: "Aurpegi inklinatuak", p: "Ardatz bati paraleloa den aurpegi inklinatu bat bista batean <b>lerro inklinatu</b> gisa ikusten da, eta beste bietan <b>laukizuzen</b> gisa." },
      { h: "Kota baten zatiak", p: "<b>Luzapen-lerroak</b> piezatik ateratzen dira; <b>kota-lerroa</b> haien artean, geziekin; <b>zenbakia</b> kota-lerroaren gainean, milimetrotan eta unitaterik gabe." },
      { h: "Arauak", p: "Neurri bakoitza <b>behin bakarrik</b>. Ez itxi kate-kotak (bat soberan legoke). Jarri <b>neurri orokorrak</b>. Kotak piezatik kanpo, laburrenak barnealdean. Ez akotatu ezkutuko ertzik." }
    ],
    sample: "0_0_0:c 1_0_0:c 2_0_0:c 0_1_0:c 1_1_0:c 2_1_0:c 0_0_1:c 0_1_1:c 1_1_1:w100"
  },
  {
    n: 5, code: "Aditua", title: "Normalizazioa", hidden: true,
    goals: ["Sistema europarra (ISO-E) eta amerikarra (ISO-A)", "Pieza konplexuagoak: hegalak + inklinazioak", "Akotazio osoa eta arrazoitua"],
    set: [["sistema", 2], ["marraztu", 3], ["eraiki", 2], ["akotatu", 4]],
    theory: [
      { h: "Bi sistema", p: "<b>Europarra (ISO-E)</b>: oinplanoa altxaeraren azpian, ezkerreko profila eskuinean. <b>Amerikarra (ISO-A)</b>: oinplanoa altxaeraren gainean, eskuineko profila eskuinean. Planoaren izenburu-koadroan adierazten da zein erabili den." },
      { h: "Akotazio funtzionala", p: "Kotak erreferentzia-aurpegi batetik abiatzen dira. Pieza fabrikatzeko behar den neurri bakoitza zuzenean irakurri behar da, kalkulurik egin gabe, eta bakar bat ere ez errepikatu." },
      { h: "Hurrengo urratsa", p: "Hemen eraikitako piezak <b>STL</b> formatuan esporta ditzakezu eta <b>Tinkercad</b>-en ireki, 3D modelatzen jarraitzeko." }
    ],
    sample: "0_0_0:c 1_0_0:c 2_0_0:c 3_0_0:c 0_1_0:c 3_1_0:c 0_0_1:c 1_0_1:c 2_0_1:c 3_0_1:w100 0_1_1:c 0_1_2:w010"
  }
];

export const levelByN = (n) => LEVELS.find(l => l.n === +n);
export const parseCellString = (str) => new Map(str.split(/\s+/).filter(Boolean).map(t => t.split(":")));

/* Maila bateko ariketa guztiak (gakoekin) */
export function levelExercises(n){
  const L = levelByN(n);
  const out = [];
  for (const [type, count] of L.set) for (let i = 1; i <= count; i++)
    out.push({ key: `L${n}-${type}-${i}`, level: n, type, i });
  return out;
}

export function parseExKey(k){
  let m = /^L(\d)-(\w+)-(\d+)$/.exec(k);
  if (m) return { key: k, level: +m[1], type: m[2], i: +m[3] };
  m = /^P-([\w-]+)-(\w+)$/.exec(k);
  if (m) return { key: k, pid: m[1], type: m[2], i: 1 };
  return null;
}

const viewFor = (ex) => VIEW_ORDER[(ex.i - 1) % 3];

/* Ariketa baten edukia sortu. teacherPiece: irakaslearen pieza (aukerakoa). */
export function buildExercise(ex, teacherPiece = null){
  const level = teacherPiece ? (teacherPiece.exercise?.level || 3) : ex.level;
  const L = levelByN(level);
  const r = rng(ex.key + "/aukerak");
  const cells = teacherPiece ? toCellMap(teacherPiece.cells) : generatePiece(level, ex.key);
  const solid = buildSolid(cells);
  const hidden = L.hidden;
  const out = { ...ex, level, levelInfo: L, cells, solid, hidden, type: ex.type };

  switch (ex.type){
    case "aukeratu": {
      const view = viewFor(ex);
      out.view = view;
      const target = projectView(solid, view);
      const cand = [{ pv: target, correct: true }];
      const seen = [viewAtoms(target, hidden)];
      const tryAdd = (pv) => {
        if (!pv || cand.length >= 4) return;
        const at = viewAtoms(pv, hidden);
        if (seen.some(s => sameAtoms(s, at))) return;
        if (!at.vis.size) return;
        seen.push(at); cand.push({ pv, correct: false });
      };
      const others = r.shuffle(["F", "T", "L", "R", "K", "B"].filter(v => v !== view));
      tryAdd(projectView(solid, others[0]));
      for (let i = 0; i < 12 && cand.length < 3; i++){ const m = mutatePiece(cells, r); if (m) tryAdd(projectView(buildSolid(m), view)); }
      for (const v of others.slice(1)) tryAdd(projectView(solid, v));
      for (let i = 0; i < 20 && cand.length < 4; i++){ const m = mutatePiece(cells, r); if (m) tryAdd(projectView(buildSolid(m), view)); }
      out.options = r.shuffle(cand);
      break;
    }
    case "isometrikoa": {
      const cand = [{ cells, correct: true }];
      const sig = (c) => { const s = buildSolid(c); return ["F", "T", "L"].map(v => viewAtoms(projectView(s, v), hidden)); };
      const seen = [sig(cells)];
      const tryAdd = (c) => {
        if (!c || cand.length >= 4) return;
        const sg = sig(c);
        if (seen.some(s => s.every((a, i) => sameAtoms(a, sg[i])))) return;
        seen.push(sg); cand.push({ cells: c, correct: false });
      };
      tryAdd(mirrorX(cells));
      for (let i = 0; i < 30 && cand.length < 4; i++) tryAdd(mutatePiece(cells, r));
      out.options = r.shuffle(cand);
      break;
    }
    case "zenbakiak":
      out.grid = heightGrid(cells);
      break;
    case "marraztu":
      out.view = viewFor(ex);
      /* Bistak beti ezkutuko marrekin erakusten dira; baina 1-2 mailetan
         marrazteko ertz ikusgaiak bakarrik eskatzen dira. */
      out.hidden = level >= 3;
      out.target = viewAtoms(projectView(solid, out.view), out.hidden);
      break;
    case "eraiki":
    case "akotatu":
      break;
    case "sistema":
      out.ask = ex.i % 2 === 1 ? "E" : "A";
      out.options = r.shuffle([
        { id: "E", place: { F: [0, 0], T: [0, 1], L: [1, 0] }, correct: out.ask === "E" },
        { id: "A", place: { T: [0, 0], F: [0, 1], R: [1, 1] }, correct: out.ask === "A" },
        { id: "x1", place: { F: [0, 0], T: [0, 1], R: [1, 0] }, correct: false },
        { id: "x2", place: { L: [0, 0], F: [1, 0], T: [1, 1] }, correct: false }
      ]);
      break;
  }
  return out;
}

/* Ispilu-irudia (x ardatzean): distraigarri ona */
export function mirrorX(cells){
  let maxX = 0;
  for (const k of cells.keys()) maxX = Math.max(maxX, parseKey(k)[0]);
  const m = new Map();
  for (const [k, v] of cells){
    const [x, y, z] = parseKey(k);
    let s = v;
    if (v[0] === "w"){
      const wk = +v[1]; let ca = +v[2], cb = +v[3];
      // x ardatza "a" (wk=1,2) bada, izkina aldatu
      if (wk === 1 || wk === 2) ca = 1 - ca;
      s = "w" + wk + ca + cb;
    }
    m.set(key(maxX - x, y, z), s);
  }
  return m;
}

/* Mailaren aurrerapena */
export function levelProgress(n, progress){
  const list = levelExercises(n);
  const done = list.filter(e => progress[e.key]?.done).length;
  const tried = list.filter(e => progress[e.key]).length;
  return { total: list.length, done, tried, pct: Math.round(100 * done / list.length) };
}
