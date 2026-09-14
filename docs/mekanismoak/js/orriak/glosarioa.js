// Glosarioa: euskara · gaztelania · ingelesa
import { esc } from '../util.js';

// [euskara, gaztelania, ingelesa, definizioa, unitatea]
const HITZAK = [
  ['abantaila mekanikoa', 'ventaja mecánica', 'mechanical advantage', 'Erresistentziaren eta aplikatutako indarraren arteko zatiketa: AM = R / F.', 'makinak'],
  ['abiadura (rpm)', 'velocidad (rpm)', 'speed (rpm)', 'Minutu batean ematen diren birak.', 'engranajeak'],
  ['akoplamendua', 'acoplamiento', 'coupling', 'Bi ardatz lotzen dituen pieza, biraketa transmititzeko.', 'elementuak'],
  ['ardatza', 'eje', 'shaft, axle', 'Pieza birakariek biratzeko duten barra.', 'makinak'],
  ['azkoina', 'tuerca', 'nut', 'Barruan haria duen pieza, torloju baten gainean aurreratzen dena.', 'torloju-azkoina'],
  ['balazta', 'freno', 'brake', 'Higidura marruskaduraz moteldu edo gelditzen duen elementua.', 'elementuak'],
  ['balbula', 'válvula', 'valve', 'Motorrean, gasen sarrera eta irteera irekitzen eta ixten duen pieza.', 'motorra'],
  ['biela', 'biela', 'connecting rod', 'Biradera eta pistoia lotzen dituen barra.', 'biela-biradera'],
  ['biradera', 'manivela', 'crank', 'Ardatz birakari bati lotutako besoa.', 'biela-biradera'],
  ['birabarkia', 'cigüeñal', 'crankshaft', 'Ardatz berean hainbat biradera dituen pieza, motorretan.', 'biela-biradera'],
  ['bujia', 'bujía', 'spark plug', 'Nahasketa erretzeko txinparta sortzen duen pieza.', 'motorra'],
  ['danborra', 'tambor', 'drum', 'Soka edo kablea biltzen den zilindroa.', 'tornua'],
  ['elementu eragilea', 'elemento motriz', 'driving element', 'Makinari hasierako indarra edo higidura ematen diona.', 'makinak'],
  ['elementu hartzailea', 'elemento receptor', 'driven element', 'Lan erabilgarria egiten duen makinaren atala.', 'makinak'],
  ['enbragea', 'embrague', 'clutch', 'Motorra eta transmisioa lotu edo askatzen dituen elementua.', 'elementuak'],
  ['engranajea', 'engranaje', 'gear', 'Beste batekin ahokatzen den hortzdun gurpila.', 'engranajeak'],
  ['engranaje-trena', 'tren de engranajes', 'gear train', 'Hainbat engranajez osatutako transmisioa.', 'engranajeak'],
  ['errendimendua', 'rendimiento', 'efficiency', 'Lan erabilgarriaren eta sartutako energiaren arteko ehunekoa.', 'lana-potentzia'],
  ['errodamendua', 'rodamiento', 'bearing', 'Ardatzen marruskadura murrizten duen elementua, bolekin edo arrabolekin.', 'elementuak'],
  ['erresistentzia, karga', 'resistencia, carga', 'load', 'Mugitu edo altxatu nahi den indarra (pisua).', 'palanka'],
  ['eszentrikoa', 'excéntrica', 'eccentric', 'Ardatza erdian ez duen gurpil biribila.', 'kamak'],
  ['euskarria', 'punto de apoyo, fulcro', 'fulcrum', 'Palankak biratzeko duen puntua.', 'palanka'],
  ['garapena', 'desarrollo', 'development, roll-out', 'Pedal-bira bakoitzean bizikletak aurreratzen duen distantzia.', 'bizikleta'],
  ['higidura alternatiboa', 'movimiento alternativo', 'reciprocating motion', 'Joan-etorriko higidura lineala.', 'higidura'],
  ['higidura lineala', 'movimiento lineal', 'linear motion', 'Lerro zuzeneko higidura.', 'higidura'],
  ['higidura oszilatzailea', 'movimiento oscilante', 'oscillating motion', 'Joan-etorriko higidura zirkularra, bira osoa eman gabe.', 'higidura'],
  ['higidura zirkularra', 'movimiento circular, rotatorio', 'rotary motion', 'Ardatz baten inguruko biraketa.', 'higidura'],
  ['hortza', 'diente', 'tooth', 'Engranaje edo hortzdun gurpil baten ertzeko irtengunea.', 'engranajeak'],
  ['indarra', 'fuerza', 'force', 'Objektu baten higidura edo forma aldatu dezakeen eragina. Newtonetan (N).', 'makinak'],
  ['indar-momentua', 'par, momento de fuerza', 'torque', 'Biratzeko indarra: indarra bider besoa (N·m).', 'engranajeak'],
  ['jarraitzailea', 'seguidor', 'follower', 'Kamaren profila jarraitzen duen pieza.', 'kamak'],
  ['kama', 'leva', 'cam', 'Profil berezia duen pieza birakaria.', 'kamak'],
  ['kama-ardatza', 'árbol de levas', 'camshaft', 'Motorreko balbulak eragiten dituzten kamen ardatza.', 'motorra'],
  ['katea', 'cadena', 'chain', 'Hortzdun gurpilak lotzen dituen mailaz osatutako elementua.', 'uhala-katea'],
  ['koroa', 'corona', 'worm wheel', 'Torloju amaigabearekin ahokatzen den hortzdun gurpila.', 'torloju-amaigabea'],
  ['kremalera', 'cremallera', 'rack', 'Hortzak dituen barra zuzena.', 'kremalera'],
  ['kurtsoa', 'carrera', 'stroke', 'Pistoiak edo jarraitzaileak egiten duen distantzia muturretik muturrera.', 'biela-biradera'],
  ['lana', 'trabajo', 'work', 'Indarra bider indarraren norabidean egindako distantzia. Joule-tan (J).', 'lana-potentzia'],
  ['makina', 'máquina', 'machine', 'Lana errazteko edo indarraren norabidea aldatzeko gailua.', 'makinak'],
  ['malgukia', 'muelle, resorte', 'spring', 'Deformatzean energia metatzen eta itzultzen duen elementua.', 'elementuak'],
  ['marruskadura', 'rozamiento', 'friction', 'Bi gainazal elkarren gainean mugitzean agertzen den aurkako indarra.', 'marruskadura-gurpilak'],
  ['marruskadura-gurpilak', 'ruedas de fricción', 'friction wheels', 'Ukipenez higidura transmititzen duten bi gurpil.', 'marruskadura-gurpilak'],
  ['masa', 'masa', 'mass', 'Gorputz baten materia-kantitatea. Kilogramotan (kg). Ez da indarra.', 'makinak'],
  ['mekanismoa', 'mecanismo', 'mechanism', 'Higidura eta indarra transmititzen edo transformatzen dituen makinaren zatia.', 'makinak'],
  ['palanka', 'palanca', 'lever', 'Euskarri baten inguruan biratzen den barra zurruna.', 'palanka'],
  ['pausoa', 'paso', 'pitch', 'Bi hariren edo bi hortzen arteko distantzia.', 'torloju-azkoina'],
  ['pinoia', 'piñón', 'pinion, sprocket', 'Hortzdun gurpil txikia (engranajeetan, kremaleran edo bizikletan).', 'kremalera'],
  ['pisua', 'peso', 'weight', 'Grabitateak gorputz bati egiten dion indarra: P = m · g.', 'makinak'],
  ['pistoia', 'pistón, émbolo', 'piston', 'Zilindro barruan joan-etorrian mugitzen den pieza.', 'motorra'],
  ['plano inklinatua', 'plano inclinado', 'inclined plane', 'Horizontalarekin angelu bat osatzen duen gainazal laua.', 'plano-inklinatua'],
  ['platera', 'plato', 'chainring', 'Bizikletan, pedalekin batera biratzen den hortzdun gurpil handia.', 'bizikleta'],
  ['polea', 'polea', 'pulley', 'Soka edo uhal bat pasatzeko ildoa duen gurpila.', 'poleak'],
  ['polipastoa', 'polipasto', 'block and tackle', 'Polea finko eta mugikorren konbinazioa.', 'poleak'],
  ['potentzia', 'potencia', 'power', 'Denbora-unitateko lana. Watt-etan (W).', 'lana-potentzia'],
  ['torloju amaigabea', 'tornillo sin fin', 'worm', 'Koroa bat eragiten duen hari helikoidaleko ardatza.', 'torloju-amaigabea'],
  ['torlojua', 'tornillo', 'screw', 'Hari helikoidala duen zilindroa: plano inklinatu bilbatua.', 'torloju-azkoina'],
  ['tornua', 'torno', 'winch, windlass', 'Biradera batez biratzen den danborra, kargak igotzeko.', 'tornua'],
  ['transmisio-erlazioa', 'relación de transmisión', 'gear ratio', 'Irteerako eta sarrerako abiaduren arteko zatiketa: i = N₂ / N₁.', 'engranajeak'],
  ['trinketea', 'trinquete', 'ratchet', 'Biraketa noranzko bakarrean uzten duen mekanismoa.', 'elementuak'],
  ['uhala', 'correa', 'belt', 'Poleak lotzen dituen banda malgua.', 'uhala-katea'],
  ['ziria', 'cuña', 'wedge', 'Bi plano inklinatu elkartuta, gauzak zabaltzeko edo mozteko.', 'plano-inklinatua'],
  ['zilindroa', 'cilindro', 'cylinder', 'Motorrean, pistoia mugitzen den hodia.', 'motorra']
].sort((a, b) => a[0].localeCompare(b[0], 'eu'));

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function render(root, { footer }) {
  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Errepasatu</div>
      <h1>Glosarioa</h1>
      <p class="lede">Lantegiko hitz teknikoak euskaraz, gaztelaniaz eta ingelesez. Bilatu edozein hizkuntzatan.</p>
    </header>
    <div class="glos-tools">
      <label class="sr-only" for="glos-q" style="position:absolute;left:-9999px">Bilatu</label>
      <input id="glos-q" type="search" placeholder="Bilatu: engranaje, gear, polea…" autocomplete="off">
      <span class="glos-count" id="glos-n"></span>
      <button class="btn sm no-print" id="glos-print">Inprimatu</button>
    </div>
    <div class="table-scroll">
      <table class="tbl glos-table">
        <thead><tr><th>Euskara</th><th>Gaztelania</th><th>Ingelesa</th><th>Esanahia</th></tr></thead>
        <tbody id="glos-body"></tbody>
      </table>
    </div>
    ${footer()}`;

  const body = root.querySelector('#glos-body'), q = root.querySelector('#glos-q');
  const mark = (text, term) => {
    if (!term) return esc(text);
    const i = norm(text).indexOf(term);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>' + esc(text.slice(i + term.length));
  };
  function draw() {
    const term = norm(q.value.trim());
    const rows = HITZAK.filter(h => !term || h.slice(0, 4).some(x => norm(x).includes(term)));
    body.innerHTML = rows.map(([eu, es, en, def, u]) =>
      `<tr><td><a href="#/${u}">${mark(eu, term)}</a></td><td lang="es">${mark(es, term)}</td><td lang="en">${mark(en, term)}</td><td>${mark(def, term)}</td></tr>`).join('')
      || `<tr><td colspan="4">Ez da hitzik aurkitu «${esc(q.value)}» bilaketarekin.</td></tr>`;
    root.querySelector('#glos-n').textContent = `${rows.length} / ${HITZAK.length} hitz`;
  }
  q.addEventListener('input', draw);
  root.querySelector('#glos-print').addEventListener('click', () => window.print());
  draw();
}
