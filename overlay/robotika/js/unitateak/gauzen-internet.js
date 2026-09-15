import { nahastu } from '../util.js';
import { margotu } from '../blokeak/kodea.js';

const GERUZAK = `<figure class="fig diagram" style="max-width:680px">
  <svg viewBox="0 0 680 150" role="img" aria-label="Gauzen Interneteko sistema baten geruzak: gailuak, konexioa, hodeia eta aplikazioa">
    <defs><marker id="iot-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--ink)"/></marker></defs>
    <g style="fill:var(--sheet);stroke:var(--ink);stroke-width:2.5">
      <rect x="8" y="36" width="140" height="84" style="fill:var(--g3-fill)"/><rect x="186" y="36" width="140" height="84"/><rect x="364" y="36" width="140" height="84" style="fill:var(--g1-fill)"/><rect x="542" y="36" width="130" height="84" style="fill:var(--g2-fill)"/>
    </g>
    <g style="stroke:var(--ink);stroke-width:2.5;fill:none"><line x1="150" y1="78" x2="184" y2="78" marker-start="url(#iot-g)" marker-end="url(#iot-g)"/><line x1="328" y1="78" x2="362" y2="78" marker-start="url(#iot-g)" marker-end="url(#iot-g)"/><line x1="506" y1="78" x2="540" y2="78" marker-start="url(#iot-g)" marker-end="url(#iot-g)"/></g>
    <g style="font-family:Lato, system-ui, sans-serif;fill:var(--ink)" text-anchor="middle">
      <text x="78" y="62" style="font-weight:700;font-size:15px">Gailuak</text><text x="78" y="84" style="font-size:12.5px;fill:var(--ink2)">sentsoreak eta</text><text x="78" y="100" style="font-size:12.5px;fill:var(--ink2)">eragingailuak</text>
      <text x="256" y="62" style="font-weight:700;font-size:15px">Konexioa</text><text x="256" y="84" style="font-size:12.5px;fill:var(--ink2)">WiFi, Bluetooth,</text><text x="256" y="100" style="font-size:12.5px;fill:var(--ink2)">LoRa, 4G/5G</text>
      <text x="434" y="62" style="font-weight:700;font-size:15px">Hodeia</text><text x="434" y="84" style="font-size:12.5px;fill:var(--ink2)">gorde, prozesatu,</text><text x="434" y="100" style="font-size:12.5px;fill:var(--ink2)">arauak</text>
      <text x="607" y="62" style="font-weight:700;font-size:15px">Aplikazioa</text><text x="607" y="84" style="font-size:12.5px;fill:var(--ink2)">aginte-panela,</text><text x="607" y="100" style="font-size:12.5px;fill:var(--ink2)">alarmak</text>
      <text x="340" y="20" style="font-size:13px;font-weight:700;fill:var(--s1)">datuak gora · aginduak behera</text>
    </g>
  </svg>
  <figcaption>Gauzen Interneteko sistema baten geruzak.</figcaption>
</figure>`;

export default {
  izena: 'Gauzen Internet',
  galdera: 'Nola jakin dezake nekazari batek, etxetik mugikorrarekin, bere berotegiko lurra lehorra dagoen, eta nola piztu dezake ureztatzea?',

  ikusi: {
    sim: 'iot',
    proba: 'Begiratu paketeak bidean eta MQTT mezuak. Desaktibatu <b>arau automatikoa</b> eta piztu ponpa zuk mugikorretik. Gero eten <b>WiFi</b>-a minutu erdiz: zer gertatzen da aginte-panelean? Eta berriro konektatzean? Aldatu bidalketa-tartea eta konparatu datu-kopurua.'
  },

  ulertu: () => `
    <p class="def"><strong>Gauzen Internet</strong> (IoT, <em>Internet of Things</em>) Internetera konektatutako objektu fisikoen sarea da: sentsoreek datuak bidaltzen dituzte, eta eragingailuek urrutitik jasotzen dituzte aginduak. Objektu horiek elkarrekin eta pertsonekin komunikatzen dira, eta askotan erabakiak bere kabuz hartzen dituzte.</p>

    <h3>Geruzak</h3>
    ${GERUZAK}

    <h3>Konexio motak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Teknologia</th><th>Irismena</th><th>Kontsumoa</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td><strong>Bluetooth LE</strong></td><td>10–50 m</td><td>Oso txikia</td><td>Erlojuak, Micro:bit, mugikorreko osagarriak</td></tr>
        <tr><td><strong>WiFi</strong></td><td>30–100 m</td><td>Handia</td><td>Etxe adimentsua, kamerak (ESP32)</td></tr>
        <tr><td><strong>Zigbee</strong></td><td>10–100 m (sare-mailan)</td><td>Txikia</td><td>Bonbillak, etxeko sentsoreak</td></tr>
        <tr><td><strong>LoRaWAN</strong></td><td>2–15 km</td><td>Oso txikia</td><td>Nekazaritza, kontagailuak, hiriak</td></tr>
        <tr><td><strong>4G / 5G</strong></td><td>Estaldura mugikorra</td><td>Handia</td><td>Ibilgailuak, industria</td></tr>
      </tbody>
    </table></div>

    <h3>MQTT: argitaratu eta harpidetu</h3>
    <p>IoTko protokolo arinenetako bat da. Gailuek ez dute elkarren berri: <strong>zerbitzari</strong> (<em>broker</em>) bati bidaltzen diete dena.</p>
    <ul>
      <li>Nodo batek mezu bat <strong>argitaratzen</strong> du gai (<em>topic</em>) batean: <code>berotegia/hezetasuna</code>.</li>
      <li>Gai horretara <strong>harpidetuta</strong> dauden guztiek (mugikorra, datu-basea, beste nodo bat) jasotzen dute.</li>
      <li>Gaiak hierarkikoak dira: <code>etxea/sukaldea/tenperatura</code>. <code>etxea/#</code> harpidetzeak etxeko mezu guztiak jasotzen ditu.</li>
    </ul>
    <p>Datuak testu txiki batean bidaltzen dira, askotan <strong>JSON</strong> formatuan:</p>
    <pre class="kd-kodea">${margotu('{ "tenperatura": 22.4, "hezetasuna": 38, "ponpa": false }', 'python')}</pre>

    <h3>Aplikazioak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Arloa</th><th>Adibideak</th></tr></thead>
      <tbody>
        <tr><td><strong>Etxea</strong></td><td>Termostatoak, argiak, pertsianak, alarmak, kontsumoaren neurketa</td></tr>
        <tr><td><strong>Nekazaritza</strong></td><td>Lurraren hezetasuna, ureztatze automatikoa, eguraldi-estazioak, abereen kokapena</td></tr>
        <tr><td><strong>Hiria</strong></td><td>Aparkaleku libreak, kaleko argiak, hondakin-edukiontzien betetze-maila, airearen kalitatea</td></tr>
        <tr><td><strong>Osasuna</strong></td><td>Erloju adimentsuak, glukosa-neurgailuak, adinekoen erorikoen detekzioa</td></tr>
        <tr><td><strong>Industria 4.0</strong></td><td>Makinen mantentze prediktiboa, ekoizpenaren jarraipena</td></tr>
      </tbody>
    </table></div>

    <h3>Arriskuak</h3>
    <ul>
      <li><strong>Segurtasuna:</strong> fabrikako pasahitzak aldatu gabe, eguneraketarik gabe edo zifratu gabe, gailu bat erraz eraso daiteke (kamerak, sarrailak). Botnet batek milaka gailu erabil ditzake eraso bat egiteko.</li>
      <li><strong>Pribatutasuna:</strong> kontagailu batek badaki noiz zauden etxean; erloju batek, zure bihotz-taupadak.</li>
      <li><strong>Konexioaren menpekotasuna:</strong> sistemak Internetik gabe ere oinarrizko funtzioak bete behar ditu.</li>
      <li><strong>Energia eta hondakinak:</strong> milioika gailu txiki, bateriekin eta birziklatzen zailak.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> berotegiko nodo batek (ESP32 edo Micro:bit bat WiFi-arekin) hezetasun-sentsorea irakurtzen du eta datuak hodeiko zerbitzari batera bidaltzen ditu. Mugikorreko aplikazioak datu horiek erakusten ditu. Nekazariak ponpa pizteko botoia sakatzean, agindu bat bidaltzen da nodora, eta nodoak errele bat aktibatzen du. Zerbitzariko arau batek ere egin dezake bere kabuz.</p>

    <details class="sakondu" data-maila="2"><summary>Energia: lo-modua eta bateriak</summary><div class="in">
      <p>Pilaz elikatutako nodo batek ezin du beti piztuta egon. Gehienetan <strong>lo-moduan</strong> dago (mikroampere gutxi batzuk), eta aldian behin esnatu, neurtu, bidali eta berriz lo egiten du.</p>
      <div class="formula">I<sub>batez bestekoa</sub> = (I<sub>aktiboa</sub> · t<sub>aktiboa</sub> + I<sub>loa</sub> · t<sub>loa</sub>) / T &nbsp;&nbsp;·&nbsp;&nbsp; iraupena = edukiera / I<sub>batez bestekoa</sub></div>
      <p>Adibidez, 80 mA 2 segundoz minuturo eta 0,1 mA gainerakoan: batez beste 2,76 mA; 2000 mAh-ko bateria batek 30 egun inguru irauten du.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Big Data eta edge computing</summary><div class="in">
      <p>Milioika sentsorek datu-kopuru izugarriak sortzen dituzte. <strong>Big Data</strong> teknikek datu horiek gordetzen, prozesatzen eta aztertzen dituzte, patroiak aurkitzeko (adibidez, makina bat noiz hondatuko den iragartzeko).</p>
      <p><strong>Edge computing</strong> (ertzeko konputazioa): datuak gailuan bertan edo hurbileko ordenagailu batean prozesatzen dira, hodeira dena bidali gabe. Latentzia txikiagoa, datu gutxiago sarean eta pribatutasun handiagoa. Auto autonomoek, adibidez, ezin dute hodeiaren erantzunaren zain egon balazta jotzeko.</p>
    </div></details>`,

  ariketak: ['iot-datuak', 'informazioa'],

  galdetegia: nahastu([
    { g: 'Zer da Gauzen Internet (IoT)?', a: ['Internetera konektatutako objektu fisikoen sarea, sentsore eta eragingailuekin', 'Sare sozial bat', 'Ordenagailuen arteko sare bat bakarrik', 'Programazio-lengoaia bat'], z: 0, zergatik: 'Objektuek datuak bidali eta aginduak jasotzen dituzte.' },
    { g: 'Zein konexio da egokiena kilometro batzuetara dagoen sentsore batentzat, bateria urte batez irauteko?', a: ['LoRaWAN', 'WiFi', 'Bluetooth', 'USB kablea'], z: 0, zergatik: 'Irismen handia eta kontsumo oso txikia ditu.' },
    { g: 'MQTT protokoloan, zer egiten du zerbitzariak (broker)?', a: ['Gai batean argitaratutako mezuak harpidetuta dauden guztiei bidaltzen dizkie', 'Sentsoreak irakurtzen ditu', 'Ponpa pizten du', 'Datuak ezabatzen ditu'], z: 0, zergatik: 'Argitaratzaileak eta harpidedunak ez dira zuzenean ezagutzen.' },
    { g: 'Zer da «topic» bat MQTT-n?', a: ['Mezuak antolatzeko izen hierarkikoa, adibidez etxea/sukaldea/tenperatura', 'Gailu baten pasahitza', 'Datu mota bat', 'Sare baten izena'], z: 0, zergatik: 'Gaien arabera harpidetzen dira aplikazioak.' },
    { g: 'Hauetako zein da IoTko segurtasun-arrisku bat?', a: ['Kamera bat fabrikako pasahitzarekin uztea', 'Sentsore bat kalibratzea', 'Datuak JSON formatuan bidaltzea', 'Lo-modua erabiltzea'], z: 0, zergatik: 'Pasahitz lehenetsiak Internetetik erraz aurkitzen dira.' },
    { g: 'Zergatik gordetzen ditu nodo batek mezuak konexioa galtzen duenean?', a: ['Konexioa itzultzean bidali eta daturik ez galtzeko', 'Memoria betetzeko', 'Bateria kargatzeko', 'Ez ditu gordetzen'], z: 0, zergatik: 'Horrela, datu-seriea osatuta geratzen da.' },
    { g: '10 segundoro mezu bat bidaltzen duen sentsoreak, zenbat mezu bidaltzen ditu egunean?', a: ['8640', '864', '86 400', '1440'], z: 0, zergatik: '86 400 s / 10 s = 8640.' },
    { g: 'Zergatik egiten du lo nodo batek neurketen artean?', a: ['Energia aurrezteko eta bateriak gehiago irauteko', 'Datuak zifratzeko', 'Beroa ez sortzeko', 'Sarea ez betetzeko bakarrik'], z: 0, maila: 2, zergatik: 'Lo-moduan korrontea mila aldiz txikiagoa izan daiteke.' },
    { g: 'Zer da edge computing?', a: ['Datuak gailuan bertan edo hurbil prozesatzea, hodeira dena bidali gabe', 'Datuak hodeian bakarrik gordetzea', 'Kable bidezko konexioa', 'Bateria mota bat'], z: 0, maila: 3, zergatik: 'Latentzia eta sareko datuak murrizten ditu.' }
  ])
};
