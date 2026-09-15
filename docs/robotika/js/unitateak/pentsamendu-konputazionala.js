import { programa } from '../blokeHTML.js';
import { nahastu } from '../util.js';

export default {
  izena: 'Pentsamendu konputazionala',
  galdera: 'Nola azalduko zenioke robot bati, urratsez urrats, nola iritsi gelako atetik zure mahaira?',

  ikusi: {
    sim: 'sareta',
    aukerak: { modua: 'txartelak', gorde: 'robotika:txartelak:v1' },
    proba: 'Osatu lau erronkak txartelekin. Hirugarrenean, bilatu <b>patroia</b> programa idatzi baino lehen; laugarrenean, <b>deskonposatu</b> problema zati txikiagotan. Robotak ez du asmatzen: zuk esandakoa egiten du, ez zuk pentsatutakoa.'
  },

  ulertu: () => `
    <p class="def"><strong>Pentsamendu konputazionala</strong> problemak ebazteko modu antolatu bat da: problema ulertu, zatitan banatu eta irtenbidea hain zehatz idatzi, non ordenagailu batek (edo beste pertsona batek) jarraitu ahal izango duen. Ez da ordenagailuekin bakarrik erabiltzen: errezeta bat, altzari bat muntatzeko jarraibideak edo GPS baten ibilbidea ere horren adibideak dira.</p>

    <h3>Lau zutabeak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Zutabea</th><th>Zer da</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td><strong>Deskonposizioa</strong></td><td>Problema handi bat zati txikiago eta errazagoetan banatzea.</td><td>Ikasturte-amaierako txangoa: garraioa, ostatua, jarduerak eta aurrekontua bereiz antolatu.</td></tr>
        <tr><td><strong>Patroiak</strong></td><td>Zatien arteko antzekotasunak aurkitzea, irtenbide bera berrerabiltzeko.</td><td>Eskailera baten maila guztiak berdin igotzen dira: maila bat nola igo jakinda, eskailera osoa igo daiteke.</td></tr>
        <tr><td><strong>Abstrakzioa</strong></td><td>Garrantzitsua dena gorde eta beharrezkoak ez diren xehetasunak alde batera uztea.</td><td>Metroaren mapak geltokiak eta loturak erakusten ditu, ez kaleak edo distantzia errealak.</td></tr>
        <tr><td><strong>Algoritmoak</strong></td><td>Problema ebazteko urrats ordenatu eta zehatzen zerrenda.</td><td>Errezeta bat: osagaiak, urratsak eta ordena.</td></tr>
      </tbody>
    </table></div>

    <h3>Algoritmo on baten ezaugarriak</h3>
    <ul>
      <li><strong>Zehatza:</strong> urrats bakoitzak esanahi bakarra du. «Jarri ogia» ez da nahikoa: zein ogi, non eta nola?</li>
      <li><strong>Ordenatua:</strong> urratsen ordenak garrantzia du. Lehenik jantzi eta gero atera etxetik, ez alderantziz.</li>
      <li><strong>Finitua:</strong> amaiera du. Ezin da betiko jarraitu.</li>
      <li><strong>Eraginkorra:</strong> urrats alferrikakorik gabe iristen da helburura.</li>
    </ul>

    <div class="worked">
      <h4>Adibidea: robota izkinan</h4>
      <p>Robotak bi lauki egin behar ditu aurrera, eskuinera biratu eta beste bi lauki aurrera. Algoritmoa, blokeekin:</p>
      ${programa([['gertaera', 'hasieran', ['aurrera egin', 'aurrera egin', 'biratu eskuinera ↻', 'aurrera egin', 'aurrera egin']]], 'Izkinako programa')}
      <p class="ans">Biratzean robota ez da lekuz aldatzen: norabidea bakarrik aldatzen du. Horregatik «eskuinera» robotaren eskuina da, ez zurea.</p>
    </div>

    <p class="note"><strong>Programa</strong> algoritmo bat da, ordenagailuak ulertzen duen hizkuntza batean idatzia (blokeak, Python, C++…). Algoritmoa ideia da; programa, ideia hori makinarako idatzita.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> lehenik deskonposatu (atetik korridorera, korridoretik zure ilarara…), gero bilatu patroiak (lauki bat aurrera, behin eta berriz), abstraitu (mahaiak eta aulkiak oztopoak dira, ez du axola zein kolore duten) eta azkenik idatzi urratsak ordena zehatzean.</p>

    <details class="sakondu" data-maila="2"><summary>Algoritmoen eraginkortasuna</summary><div class="in">
      <p>Bi algoritmok emaitza bera eman dezakete urrats-kopuru oso desberdinarekin. Hiztegi batean «robota» hitza bilatzeko:</p>
      <ul>
        <li><strong>Bilaketa lineala:</strong> lehen orrialdetik hasi eta banan-banan pasatu. 1.000 orrialde badira, kasu txarrenean 1.000 orrialde begiratu behar dira.</li>
        <li><strong>Bilaketa bitarra:</strong> erdian ireki; hitza aurrerago badago, bigarren erdia hartu, eta abar. 1.000 orrialdetan, 10 urrats nahikoak dira.</li>
      </ul>
      <p>Ez da nahikoa programa batek funtzionatzea: denbora eta baliabide gutxiago erabiltzea ere garrantzitsua da, batez ere datu asko daudenean.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Konplexutasuna: O(n) eta O(log n)</summary><div class="in">
      <p>Informatikan, algoritmo baten <strong>konplexutasunak</strong> adierazten du nola hazten den urrats-kopurua datuen tamaina (n) handitzean.</p>
      <div class="table-scroll"><table class="tbl">
        <thead><tr><th>n</th><th>Lineala, O(n)</th><th>Bitarra, O(log₂ n)</th></tr></thead>
        <tbody>
          <tr><td>1.000</td><td>1.000</td><td>10</td></tr>
          <tr><td>1.000.000</td><td>1.000.000</td><td>20</td></tr>
          <tr><td>1.000.000.000</td><td>1.000.000.000</td><td>30</td></tr>
        </tbody>
      </table></div>
      <p>Datuak bikoizteak urrats bakarra gehitzen dio bilaketa bitarrari. Horregatik bilatzaileek eta datu-baseek datuak ordenatuta edo indexatuta gordetzen dituzte.</p>
    </div></details>`,

  ariketak: ['sareta-posizioa', 'patroia'],

  galdetegia: nahastu([
    { g: 'Zer da algoritmo bat?', a: ['Problema bat ebazteko urrats ordenatu eta zehatzen zerrenda', 'Ordenagailuaren pieza bat', 'Programazio-lengoaia bat', 'Ausaz ematen den erantzun bat'], z: 0, zergatik: 'Algoritmoa urratsen zerrenda da; programa, berriz, algoritmo hori makina baten lengoaian idatzita.' },
    { g: 'Txangoa antolatzeko, garraioa, ostatua eta jarduerak bereiz aztertzen dituzu. Zein zutabe da hori?', a: ['Abstrakzioa', 'Deskonposizioa', 'Patroiak', 'Algoritmoa'], z: 1, zergatik: 'Problema handia zati txikiagoetan banatzea deskonposizioa da.' },
    { g: 'Metroaren mapak ez ditu kaleak eta eraikinak erakusten, geltokiak eta loturak baizik. Hori da:', a: ['Deskonposizioa', 'Abstrakzioa', 'Patroi bat', 'Akats bat'], z: 1, zergatik: 'Garrantzitsua dena gordetzen da (geltokiak eta loturak) eta gainerakoa alde batera uzten da.' },
    { g: 'Robota ekialdera begira dago eta «biratu eskuinera» exekutatzen du. Nora begira geratzen da?', a: ['Iparraldera', 'Hegoaldera', 'Mendebaldera', 'Ekialdera'], z: 1, zergatik: 'Ekialdetik eskuinera 90° biratuz gero (erlojuaren orratzen noranzkoan), hegoaldera begira geratzen da.' },
    { g: 'Zein da algoritmo on baten ezaugarria?', a: ['Amaiera bat izatea eta urrats bakoitza zehatza izatea', 'Ahalik eta urrats gehien izatea', 'Ordenak garrantzirik ez izatea', 'Pertsona bakoitzak nahi duen moduan ulertzea'], z: 0, zergatik: 'Algoritmo batek zehatza, ordenatua eta finitua izan behar du.' },
    { g: 'Eskailera batean «aurrera, eskuinera, aurrera, ezkerrera» behin eta berriz errepikatzen dela ohartzea hau da:', a: ['Patroi bat aurkitzea', 'Abstrakzioa', 'Arazketa', 'Deskonposizioa'], z: 0, zergatik: 'Errepikatzen den egitura bat da; programan begizta batekin idatz daiteke.' },
    { g: 'Hiztegi batean hitz bat bilatzeko, lehen orrialdetik hasi beharrean erdian irekitzen duzu. Zergatik da hobea?', a: ['Urrats askoz gutxiago behar direlako', 'Hitza beti erdian dagoelako', 'Orrialdeak ordenan ez daudelako', 'Ez da hobea'], z: 0, maila: 2, zergatik: 'Urrats bakoitzean aukeren erdia baztertzen da: bilaketa bitarra da.' },
    { g: '1.000.000 elementu ordenaturen artean, bilaketa bitarrak kasu txarrenean gutxi gorabehera zenbat urrats behar ditu?', a: ['20', '1.000', '500.000', '1.000.000'], z: 0, maila: 3, zergatik: '2²⁰ ≈ 1.048.576 denez, 20 urrats nahikoak dira: O(log₂ n).' }
  ])
};
