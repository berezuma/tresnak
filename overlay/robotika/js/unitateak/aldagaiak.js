import { programa } from '../blokeHTML.js';
import { nahastu } from '../util.js';

const forma = (html, testua) => `<figure>${html}<figcaption>${testua}</figcaption></figure>`;

export default {
  izena: 'Aldagaiak eta eragileak',
  galdera: 'Nola gogoratzen du bideo-joko batek zure puntuazioa, eta nola daki noiz gainditu duzun errekorra?',

  ikusi: {
    sim: 'kontsola',
    aukerak: { adibideak: ['agurra', 'kontagailua', 'batura', 'taula', 'bikoitiak', 'notak'], gorde: 'robotika:aldagaiak:v1' },
    proba: 'Exekutatu adibideak <b>urratsez urrats</b> eta begiratu aldagaien kutxak: noiz aldatzen da balioa? «Kontagailua»-n, aldatu «errepikatu» blokeko zenbakia. «Biderketa-taula»-n, aldatu n-ren balioa. «Batez bestekoa»-n, aldatu notak gaindituta edo ez ateratzeko.'
  },

  ulertu: () => `
    <p class="def"><strong>Aldagaia</strong> izen bat duen memoria-kutxa bat da, eta balio bat gordetzen du. Programak balio hori irakur eta alda dezake exekuzioan zehar. Bideo-joko batean, «puntuak», «bizitzak» eta «errekorra» aldagaiak dira.</p>

    <h3>Aldagaiekin egiten dena</h3>
    <div class="bk-row">
      ${forma(programa([['aldagaiak', 'ezarri [puntuak] ← {0}']]), '<strong>Esleitu</strong>: balio bat gorde (aurrekoa galtzen da).')}
      ${forma(programa([['aldagaiak', 'aldatu [puntuak], gehitu {10}']]), '<strong>Aldatu</strong>: balioari zenbaki bat gehitu.')}
      ${forma(programa([['kontsola', 'idatzi [puntuak]']]), '<strong>Irakurri</strong>: balioa erabili.')}
    </div>
    <p class="note"><strong>Esleipena ez da ekuazio bat.</strong> <code>x ← x + 1</code> honela irakurtzen da: «hartu x-ren balioa, gehitu 1 eta gorde berriro x-n». Matematikan x = x + 1 ezinezkoa da; programazioan, oso ohikoa.</p>

    <h3>Datu motak</h3>
    <ul>
      <li><strong>Zenbakiak:</strong> osoak (7, −3) edo hamartarrak (4,5). Kalkuluak egiteko.</li>
      <li><strong>Testuak</strong> (<em>string</em>): “kaixo”, “Ane”. Komatxo artean idazten dira.</li>
      <li><strong>Boolearrak:</strong> egia edo gezurra. Baldintzen emaitza dira.</li>
    </ul>

    <h3>Eragileak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Mota</th><th>Eragileak</th><th>Adibidea</th><th>Emaitza</th></tr></thead>
      <tbody>
        <tr><td>Aritmetikoak</td><td><code>+ − × ÷</code></td><td><code>7 × 3</code></td><td>21</td></tr>
        <tr><td>Hondarra</td><td><code>mod</code></td><td><code>17 mod 5</code></td><td>2 (17 = 3 · 5 + 2)</td></tr>
        <tr><td>Konparaziokoak</td><td><code>= ≠ &lt; ≤ &gt; ≥</code></td><td><code>puntuak &gt; errekorra</code></td><td>egia edo gezurra</td></tr>
        <tr><td>Logikoak</td><td><code>eta, edo, ez</code></td><td><code>bizitzak &gt; 0 eta denbora &gt; 0</code></td><td>biak egia badira, egia</td></tr>
      </tbody>
    </table></div>
    <p><strong>Eragiketen ordena</strong> matematikakoa da: lehenik parentesiak, gero <code>× ÷ mod</code>, eta azkenik <code>+ −</code>. Blokeetan, barruko blokea kalkulatzen da lehenik: blokeen egiturak berak parentesiak adierazten ditu.</p>

    <div class="worked">
      <h4>Adibidea: trazaketa-taula</h4>
      ${programa([['gertaera', 'hasieran', [['aldagaiak', 'ezarri [a] ← {5}'], ['aldagaiak', 'ezarri [b] ← {3}'], ['aldagaiak', 'ezarri [a] ← [a] + [b]'], ['aldagaiak', 'ezarri [b] ← [a] − [b]']]]], 'Trazaketaren programa')}
      <div class="table-scroll"><table class="tbl">
        <thead><tr><th>Blokea</th><th>a</th><th>b</th></tr></thead>
        <tbody>
          <tr><td>ezarri a ← 5</td><td>5</td><td>—</td></tr>
          <tr><td>ezarri b ← 3</td><td>5</td><td>3</td></tr>
          <tr><td>ezarri a ← a + b</td><td>8</td><td>3</td></tr>
          <tr><td>ezarri b ← a − b</td><td>8</td><td>5</td></tr>
        </tbody>
      </table></div>
      <p class="ans">Azkenean a = 8 eta b = 5. Bloke bakoitzak unean uneko balioak erabiltzen ditu, ez hasierakoak.</p>
    </div>

    <h3>Aldagai berezi batzuk</h3>
    <ul>
      <li><strong>Kontagailua:</strong> zerbait zenbat aldiz gertatu den zenbatzen du. Zerotik hasi eta 1 gehitzen zaio: <code>aldatu k, gehitu 1</code>.</li>
      <li><strong>Metagailua:</strong> balioak batzen ditu: <code>batura ← batura + x</code>.</li>
      <li><strong>Bandera:</strong> zerbait gertatu den gogoratzen du: <code>aurkitua ← egia</code>.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> «puntuak» aldagai batean gordetzen ditu, eta txanpon bat hartzean <code>aldatu puntuak, gehitu 10</code> egiten du. Partida amaitzean <code>puntuak &gt; errekorra</code> konparatzen du, eta egia bada, <code>errekorra ← puntuak</code> esleitzen du.</p>

    <details class="sakondu" data-maila="2"><summary>Funtzioak</summary><div class="in">
      <p><strong>Funtzioa</strong> izena duen kode zati bat da, behin definitu eta nahi adina aldiz erabil daitekeena. Funtzioek <strong>parametroak</strong> jaso ditzakete (sarrerako datuak), eta balio bat <strong>itzul</strong> dezakete.</p>
      ${programa([['#7a4fb3', 'funtzioa karratua {aldea}', [['kontrola', 'errepikatu {4} aldiz', [['kontrola', 'errepikatu [aldea] aldiz', ['aurrera egin']], 'biratu eskuinera ↻']]]]], 'Karratua funtzioa')}
      <p>Funtzio honekin, <code>karratua(3)</code> eta <code>karratua(5)</code> idatziz, bi karratu marraz daitezke kodea errepikatu gabe. Funtzioek programak <strong>deskonposatzen</strong> eta berrerabiltzen laguntzen dute.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Datu motak memorian</summary><div class="in">
      <p>Testu-lengoaietan (C++, Java) aldagai bakoitzak mota finko bat du, eta motak zehazten du zenbat memoria behar duen:</p>
      <ul>
        <li><code>int</code> (16 edo 32 bit): zenbaki osoak. Arduino UNO-n, 16 bit: −32.768 eta 32.767 artean. Muga gainditzean, <strong>gainezkatzea</strong> gertatzen da (32.767 + 1 = −32.768).</li>
        <li><code>float</code>: zenbaki hamartarrak, zehaztasun mugatuarekin (0,1 + 0,2 ≠ 0,3 zehazki).</li>
        <li><code>bool</code>: egia edo gezurra. <code>char</code> eta <code>String</code>: karaktereak eta testuak.</li>
      </ul>
      <p>Kontuz zatiketarekin: C++-n, <code>int</code> motako bi zenbaki zatitzean zatiketa osoa egiten da: <code>7 / 2</code> = 3. Hamartarrak lortzeko, <code>7.0 / 2</code> idatzi behar da.</p>
      <p><strong>Zerrendak</strong> (<em>array</em>) balio asko izen bakarrarekin gordetzeko erabiltzen dira: <code>notak[0]</code>, <code>notak[1]</code>… Indizea 0tik hasten da.</p>
    </div></details>`,

  ariketak: ['aldagaiak-trazatu', 'eragileak'],

  galdetegia: nahastu([
    { g: 'Zer da aldagai bat?', a: ['Izen bat duen memoria-kutxa bat, balio bat gordetzen duena', 'Beti balio bera duen zenbaki bat', 'Bloke-kategoria bat', 'Programaren izena'], z: 0, zergatik: 'Aldagaiaren balioa programan zehar alda daiteke; horregatik du izen hori.' },
    { g: 'x-ren balioa 5 da. «ezarri x ← x + 1» exekutatu ondoren, zenbat da x?', a: ['6', '5', '1', 'x + 1'], z: 0, zergatik: 'x + 1 = 6 kalkulatzen da, eta 6 gordetzen da x-n.' },
    { g: 'Zenbat da 17 mod 5?', a: ['2', '3', '3,4', '12'], z: 0, zergatik: '17 = 3 · 5 + 2: hondarra 2 da.' },
    { g: 'Zenbat da 2 + 3 × 4, programazioan?', a: ['14', '20', '24', '9'], z: 0, zergatik: 'Biderketa lehenik: 3 × 4 = 12; gero 2 + 12 = 14.' },
    { g: 'Zein datu mota da “kaixo”?', a: ['Testua', 'Zenbakia', 'Boolearra', 'Aldagaia'], z: 0, zergatik: 'Komatxo arteko karaktere-segida bat testua (string) da.' },
    { g: 'Zenbaki bat bikoitia den jakiteko, zein baldintza erabil daiteke?', a: ['n mod 2 = 0', 'n ÷ 2 = 0', 'n × 2 = 0', 'n − 2 = 0'], z: 0, zergatik: 'Zenbaki bikoitiak 2rekin zatitzean hondarra 0 da.' },
    { g: '«edo» eragilearen emaitza egia da…', a: ['bi baldintzetako bat gutxienez egia denean', 'bi baldintzak egia direnean bakarrik', 'bi baldintzak gezurra direnean', 'inoiz ez'], z: 0, zergatik: '«eta»-k biak behar ditu; «edo»-k, bat nahikoa du.' },
    { g: 'Zertarako erabiltzen dira funtzioak?', a: ['Kode zati bati izena emateko eta hainbat aldiz berrerabiltzeko', 'Programa motelagoa egiteko', 'Aldagaiak ezabatzeko', 'Blokeen kolorea aldatzeko'], z: 0, maila: 2, zergatik: 'Funtzioek kodea deskonposatu eta berrerabiltzen laguntzen dute.' },
    { g: 'C++-n, int motako bi aldagairekin 7 / 2 kalkulatzen bada, emaitza:', a: ['3', '3,5', '4', 'Errorea'], z: 0, maila: 3, zergatik: 'Bi zenbaki oso zatitzean zatiketa osoa egiten da, eta hamartarrak galtzen dira.' }
  ])
};
