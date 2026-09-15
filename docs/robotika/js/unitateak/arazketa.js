import { programa } from '../blokeHTML.js';
import { nahastu } from '../util.js';

export default {
  izena: 'Akatsak eta arazketa',
  galdera: 'Programa batek ez du espero genuena egiten. Nola aurkitzen da akatsa, programa osoa berriro idatzi gabe?',

  ikusi: {
    sim: 'sareta',
    aukerak: { modua: 'blokeak', puzleak: ['a1', 'a2', 'a3', 'a4'], gorde: 'robotika:arazketa:v1' },
    proba: 'Programa bakoitzak akats bat du. Sakatu <b>Urratsa</b> behin eta berriz: nabarmendutako blokea exekutatzen ari dena da. Aurkitu robota non hasten den gaizki egiten, konpondu blokea eta egiaztatu berriro. Konpondu ahalik eta bloke gutxien aldatuta.'
  },

  ulertu: () => `
    <p class="def"><strong>Arazketa</strong> (ingelesez <em>debugging</em>) programa bateko akatsak aurkitu, ulertu eta zuzentzeko prozesua da. Akatsak ez dira porrot bat: programatzaile guztiek egiten dituzte egunero, eta akatsak aztertuz ikasten da gehien.</p>

    <p class="note"><strong>Zergatik «bug»?</strong> 1947an, Harvard-eko Mark II ordenagailuaren barruan sits bat aurkitu zuten, eta lan-koadernoan itsatsi zuten ohar honekin: <em>«First actual case of bug being found»</em>. Ingeniariek lehendik ere «bug» deitzen zieten akatsei, baina istorioa oso ezaguna egin zen Grace Hopper informatikariari esker.</p>

    <h3>Akats motak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Mota</th><th>Zer gertatzen da</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td><strong>Sintaxi-akatsa</strong></td><td>Lengoaiaren arauak ez dira betetzen, eta programa ez da exekutatzen.</td><td>Testu-lengoaietan, parentesi bat falta. Blokeekin ia ezinezkoa da: formak ez dira elkartzen.</td></tr>
        <tr><td><strong>Exekuzio-akatsa</strong></td><td>Programa hasten da, baina une batean gelditu egiten da.</td><td>Zeroz zatitu; robota hormaren kontra; izarrik gabeko lauki batean «hartu».</td></tr>
        <tr><td><strong>Akats logikoa</strong></td><td>Programa amaitzen da, errorerik gabe, baina emaitza okerra da.</td><td>Karratuaren alde bat falta; begizta batek itzuli bat gehiago egiten du.</td></tr>
      </tbody>
    </table></div>
    <p>Akats logikoak dira zailenak aurkitzen: ordenagailuak ez du ezer esaten, eta zuk konturatu behar duzu emaitza okerra dela.</p>

    <h3>Arazketa-metodoa</h3>
    <ol>
      <li><strong>Errepikatu akatsa:</strong> noiz gertatzen da? Beti ala kasu batzuetan bakarrik?</li>
      <li><strong>Aurreikusi:</strong> zer egin beharko luke programak urrats bakoitzean?</li>
      <li><strong>Exekutatu urratsez urrats</strong> eta konparatu gertatzen dena aurreikusitakoarekin.</li>
      <li><strong>Aurkitu lehen desberdintasuna:</strong> akatsa hor dago, edo lehenago.</li>
      <li><strong>Aldatu gauza bakar bat</strong> eta probatu berriro. Asko aldi berean aldatuz gero, ez dakizu zerk konpondu duen.</li>
      <li><strong>Probatu beste kasu batzuekin</strong>, konponketak beste zerbait hautsi ez duela ziurtatzeko.</li>
    </ol>

    <h3>Ohiko akatsak</h3>
    <ul>
      <li><strong>Bat gehiago edo bat gutxiago</strong> (<em>off-by-one</em>): 1. laukitik 7.era 6 urrats dira, ez 7.</li>
      <li><strong>Ordena okerra:</strong> «aurrera» eta «biratu» trukatuta.</li>
      <li><strong>Baldintza alderantziz:</strong> &lt; jarri &gt; jarri beharrean.</li>
      <li><strong>Begizta amaigabea:</strong> baldintzako aldagaia ez da begiztaren barruan aldatzen.</li>
      <li><strong>Aldagaia hasieratu gabe:</strong> kontagailua ez da zerotik hasten.</li>
      <li><strong>Egiaztatu gabeko ekintza:</strong> izarrik dagoen begiratu gabe «hartu».</li>
    </ul>

    <div class="worked">
      <h4>Adibidea: bat gehiegi</h4>
      ${programa([['gertaera', 'hasieran', [['kontrola', 'errepikatu {7} aldiz', ['aurrera egin']]]]], 'Programa okerra')}
      <p>Robota 1. laukian dago eta helmuga 7.ean. Urratsez urrats exekutatuz: 6. urratsaren ondoren robota helmugan dago, baina begiztak beste itzuli bat egiten du eta hormaren kontra joaten da.</p>
      <p class="ans">Konponketa: «errepikatu 6 aldiz». Laukiak ez, urratsak zenbatu behar dira: 7 − 1 = 6.</p>
    </div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> programa urratsez urrats exekutatuz eta urrats bakoitzean espero genuena gertatzen denarekin konparatuz. Lehen desberdintasunak akatsa non dagoen erakusten du. Gero aldaketa txiki bat egin eta berriro probatzen da.</p>

    <details class="sakondu" data-maila="2"><summary>Proba-kasuak diseinatu</summary><div class="in">
      <p>Programa bat ondo dagoela ziurtatzeko, ez da nahikoa behin probatzea. <strong>Proba-kasuak</strong> aukeratu behar dira, batez ere akatsak ezkutatzen diren lekuetan:</p>
      <ul>
        <li><strong>Muga-kasuak:</strong> 0, 1, balio maximoa. «i ≤ N» ala «i &lt; N»? N = 1 denean, begizta behin exekutatzen da?</li>
        <li><strong>Berdintasunak:</strong> «handiena» algoritmoan, A = B denean.</li>
        <li><strong>Datu bereziak:</strong> zenbaki negatiboak, testu hutsa, izarrik gabeko korridorea.</li>
      </ul>
      <p>Proba-kasu bakoitzerako, idatzi aurretik <em>zer emaitza espero den</em>. Horrela, emaitza okerra berehala ikusiko da.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Arazketa testu-lengoaietan</summary><div class="in">
      <ul>
        <li><strong>Errore-mezuak irakurri:</strong> lerro-zenbakia eta akats mota ematen dituzte. Lehen mezua da garrantzitsuena; besteak haren ondorio izan daitezke.</li>
        <li><strong>Mezuak idatzi</strong> (<code>print</code>, <code>Serial.println</code>): aldagaien balioak une jakinetan erakutsi.</li>
        <li><strong>Eten-puntuak</strong> (<em>breakpoints</em>): programa lerro jakin batean gelditu eta memoriaren egoera aztertu.</li>
        <li><strong>Baieztapenak</strong> (<code>assert</code>) eta <strong>unitate-probak</strong>: programak berak egiaztatzen du emaitzak zuzenak direla, aldaketa bakoitzaren ondoren.</li>
        <li><strong>Ahuntz-metodoa</strong> (<em>rubber duck debugging</em>): kodea lerroz lerro ozen azaltzea, beste norbaiti edo ahate bati. Azaltzean konturatzen gara askotan akatsaz.</li>
      </ul>
    </div></details>`,

  galdetegia: nahastu([
    { g: 'Zer da arazketa?', a: ['Programa bateko akatsak aurkitu eta zuzentzea', 'Programa ezabatu eta berriz hastea', 'Programa azkarrago exekutatzea', 'Blokeak ordenatzea'], z: 0, zergatik: 'Arazketa (debugging) akatsak aurkitu, ulertu eta konpontzea da.' },
    { g: 'Programa errorerik gabe amaitzen da, baina karratuaren alde bat margotu gabe geratzen da. Zer akats mota da?', a: ['Akats logikoa', 'Sintaxi-akatsa', 'Exekuzio-akatsa', 'Ez da akatsa'], z: 0, zergatik: 'Programa amaitzen da baina emaitza okerra da: akats logikoa.' },
    { g: 'Programa bat zeroz zatitzean gelditzen da. Zer akats mota da?', a: ['Exekuzio-akatsa', 'Akats logikoa', 'Sintaxi-akatsa', 'Patroi bat'], z: 0, zergatik: 'Exekuzioan zehar gertatzen da eta programa gelditzen du.' },
    { g: 'Robota 1. laukian dago eta helmuga 7.ean, lerro zuzenean. Zenbat aldiz egin behar du aurrera?', a: ['6', '7', '8', '1'], z: 0, zergatik: '7 − 1 = 6 urrats. Laukiak eta urratsak nahastea akats oso ohikoa da.' },
    { g: 'Urratsez urrats exekutatzean, nola aurkitzen da akatsa?', a: ['Espero dena eta gertatzen dena konparatuz, lehen desberdintasuna bilatuz', 'Bloke guztiak aldi berean aldatuz', 'Abiadura handituz', 'Programa ezabatuz'], z: 0, zergatik: 'Lehen desberdintasunak adierazten du non hasten den programa gaizki.' },
    { g: 'Zergatik da ona aldaketa txiki bakar bat egin eta berehala probatzea?', a: ['Zer aldaketak konpondu (edo hautsi) duen jakiteko', 'Programa luzeagoa izateko', 'Blokeak gordetzeko', 'Ez da ona'], z: 0, zergatik: 'Gauza asko aldi berean aldatuz gero, ezin da jakin zein izan den ona.' },
    { g: 'Begizta bat ez da inoiz amaitzen. Zein da kausa ohikoena?', a: ['Baldintzako aldagaia ez da begiztaren barruan aldatzen', 'Begiztak bloke gehiegi ditu', 'Programak «hasieran» blokea du', 'Aldagaiek izen luzeegiak dituzte'], z: 0, zergatik: 'Baldintza aldatzen ez bada, beti egia izaten jarraitzen du.' },
    { g: '«Handiena» algoritmoa probatzeko, zein proba-kasu da garrantzitsuena ez ahazteko?', a: ['A eta B berdinak direnean', 'A = 5 eta B = 3', 'A = 100 eta B = 1', 'A = 8 eta B = 2'], z: 0, maila: 2, zergatik: 'Muga-kasua da: > eta ≥ nahasi badira, hor ikusten da.' },
    { g: 'Zer da eten-puntu bat (breakpoint)?', a: ['Programa lerro jakin batean gelditzeko marka, egoera aztertzeko', 'Programa hondatzen duen errore bat', 'Begizta baten amaiera', 'Aldagai mota bat'], z: 0, maila: 3, zergatik: 'Arazketa-tresnek eten-puntuetan gelditzen dute programa, aldagaiak aztertu ahal izateko.' }
  ])
};
