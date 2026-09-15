import { nahastu } from '../util.js';
import { programa } from '../blokeHTML.js';
import { sortuKodea, margotu } from '../blokeak/kodea.js';
import * as E from '../blokeak/eraiki.js';

const BATURA = () => E.programa([E.hasieran([E.ezarri('batura', 0), E.ezarri('i', 1),
  E.bitartean(E.konparatu(E.aldagaia('i'), 'LTE', 10), [E.aldatu('batura', E.aldagaia('i')), E.aldatu('i', 1)]),
  E.idatzi(E.aldagaia('batura'))])], ['batura', 'i']);

const kodea = h => `<pre class="kd-kodea">${margotu(sortuKodea(BATURA(), h), h)}</pre>`;

export default {
  izena: 'Testu bidezko programazioa',
  galdera: 'Blokeekin programatzen badakizu, zer falta zaizu Python edo C++ lengoaian programatzeko?',

  ikusi: {
    sim: 'kontsola',
    aukerak: { kodea: true, adibideak: ['agurra', 'kontagailua', 'batura', 'taula', 'bikoitiak', 'notak'], gorde: 'robotika:testua:v1' },
    proba: 'Aukeratu adibide bat eta konparatu blokeak eta kodea: bloke bakoitza lerro bat da. Aldatu bloke bat (zenbaki bat, baldintza bat) eta ikusi zer aldatzen den Pythonen eta C++-en. Aurkitu bi lengoaien arteko hiru desberdintasun.'
  },

  ulertu: () => `
    <p class="def">Bloke-lengoaiak eta testu-lengoaiak <strong>kontzeptu berak</strong> erabiltzen dituzte: aldagaiak, sekuentziak, baldintzak, begiztak eta funtzioak. Testu-lengoaietan, aginduak teklatuarekin idazten dira, lengoaiaren <strong>sintaxia</strong> (idazteko arauak) zehatz betez. Horren truke, askoz azkarrago idazten dira programa luzeak, eta edozein lekutan erabil daitezke.</p>

    <h3>Blokeak, Python eta C++</h3>
    <div class="table-scroll"><table class="tbl kd-taula">
      <thead><tr><th>Kontzeptua</th><th>Blokea</th><th>Python</th><th>C++ (Arduino)</th></tr></thead>
      <tbody>
        <tr><td>Aldagaia</td><td>ezarri [x] ← 5</td><td><code>x = 5</code></td><td><code>float x = 5;</code></td></tr>
        <tr><td>Idatzi</td><td>idatzi x</td><td><code>print(x)</code></td><td><code>Serial.println(x);</code></td></tr>
        <tr><td>Errepikatu n aldiz</td><td>errepikatu 4 aldiz</td><td><code>for i in range(4):</code></td><td><code>for (int i = 0; i &lt; 4; i++) { }</code></td></tr>
        <tr><td>Bitartean</td><td>errepikatu ⟨x &lt; 10⟩ bitartean</td><td><code>while x &lt; 10:</code></td><td><code>while (x &lt; 10) { }</code></td></tr>
        <tr><td>Baldintza</td><td>baldin … bada / bestela</td><td><code>if x &gt; 0:</code> … <code>else:</code></td><td><code>if (x &gt; 0) { } else { }</code></td></tr>
        <tr><td>Konparatu</td><td>= ≠ ≤ ≥</td><td><code>== != &lt;= &gt;=</code></td><td><code>== != &lt;= &gt;=</code></td></tr>
        <tr><td>Logika</td><td>eta · edo · ez</td><td><code>and or not</code></td><td><code>&amp;&amp; || !</code></td></tr>
        <tr><td>Hondarra (mod)</td><td>x mod 2</td><td><code>x % 2</code></td><td><code>x % 2</code> (osoak)</td></tr>
      </tbody>
    </table></div>
    <p class="note">Kontuz: <code>=</code> <strong>esleipena</strong> da (gorde), eta <code>==</code> <strong>konparazioa</strong> (berdinak al dira?). Nahastea oso akats ohikoa da.</p>

    <div class="worked">
      <h4>Adibidea: 1etik 10era batu, hiru eratara</h4>
      <div class="bk-row kd-hirukoa">
        <figure>${programa([['gertaera', 'hasieran', [['aldagaiak', 'ezarri [batura] ← {0}'], ['aldagaiak', 'ezarri [i] ← {1}'], ['kontrola', 'errepikatu ⟨[i] ≤ {10}⟩ bitartean', [['aldagaiak', 'aldatu [batura], gehitu [i]'], ['aldagaiak', 'aldatu [i], gehitu {1}']]], ['kontsola', 'idatzi [batura]']]]], 'Batura blokeekin')}<figcaption>Blokeak</figcaption></figure>
        <figure>${kodea('python')}<figcaption>Python</figcaption></figure>
        <figure>${kodea('cpp')}<figcaption>C++ (Arduino)</figcaption></figure>
      </div>
      <p class="ans">Hirurek 55 idazten dute. Egitura bera da; sintaxia aldatzen da.</p>
    </div>

    <h3>Python eta C++: desberdintasunak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Python</th><th>C++</th></tr></thead>
      <tbody>
        <tr><td><strong>Blokeak</strong></td><td>Koska (4 zuriune) eta bi puntu <code>:</code></td><td>Giltzak <code>{ }</code></td></tr>
        <tr><td><strong>Lerroen amaiera</strong></td><td>Ezer ez</td><td>Puntu eta koma <code>;</code></td></tr>
        <tr><td><strong>Datu motak</strong></td><td>Ez dira idazten (dinamikoak)</td><td>Idatzi behar dira: <code>int</code>, <code>float</code>, <code>String</code>, <code>bool</code></td></tr>
        <tr><td><strong>Exekuzioa</strong></td><td>Interpretatua: lerroz lerro</td><td>Konpilatua: lehenik makina-kode bihurtu</td></tr>
        <tr><td><strong>Erabilera</strong></td><td>Datuak, AA, zientzia, Micro:bit (MicroPython), Raspberry Pi</td><td>Arduino, bideojokoak, sistema eragileak, abiadura behar denean</td></tr>
      </tbody>
    </table></div>

    <h3>Sintaxi-akats ohikoak</h3>
    <ul>
      <li>C++-en <code>;</code> edo <code>}</code> bat ahaztea.</li>
      <li>Python-en koska gaizki: <code>if</code> baten barruko lerroak ez daude eskuinerago.</li>
      <li>Maiuskulak eta minuskulak: <code>Serial</code> ≠ <code>serial</code>, <code>batura</code> ≠ <code>Batura</code>.</li>
      <li>Komatxoak itxi gabe: <code>print("kaixo)</code>.</li>
      <li>Aldagai bat sortu gabe erabiltzea.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> logika dagoeneko badakizu: aldagaiak, begiztak eta baldintzak berdinak dira. Ikasi behar dena <strong>sintaxia</strong> da (nola idazten den bloke bakoitza) eta <strong>datu motak</strong>. Blokeek kodea sortzen dutenez, aldi berean ikus daitezke biak, eta pixkanaka blokeak utz daitezke.</p>

    <details class="sakondu" data-maila="3"><summary>Funtzioak eta liburutegiak</summary><div class="in">
      <p><strong>Funtzio</strong> batek izen bat ematen dio bloke-multzo bati, eta hainbat aldiz erabil daiteke, parametroekin:</p>
      <pre class="kd-kodea">${margotu(`def batu_tartea(a, b):
    batura = 0
    for i in range(a, b + 1):
        batura = batura + i
    return batura

print(batu_tartea(1, 10))   # 55`, 'python')}</pre>
      <p><strong>Liburutegiak</strong> beste batzuek idatzitako funtzio-multzoak dira: <code>import random</code> (Python) edo <code>#include &lt;Servo.h&gt;</code> (C++). Gurpila ez da berriz asmatu behar.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Datu motak eta memoria</summary><div class="in">
      <div class="table-scroll"><table class="tbl">
        <thead><tr><th>C++ mota</th><th>Tamaina (Arduino UNO)</th><th>Balioak</th></tr></thead>
        <tbody>
          <tr><td><code>bool</code></td><td>1 byte</td><td>true / false</td></tr>
          <tr><td><code>byte</code></td><td>1 byte</td><td>0–255</td></tr>
          <tr><td><code>int</code></td><td>2 byte</td><td>−32 768 – 32 767</td></tr>
          <tr><td><code>long</code></td><td>4 byte</td><td>±2 147 483 647</td></tr>
          <tr><td><code>float</code></td><td>4 byte</td><td>Hamartarrak, 6–7 digitu zehatz</td></tr>
        </tbody>
      </table></div>
      <p>Arduino UNOk 2 KB RAM bakarrik ditu: mota egokia aukeratzeak garrantzia du. <code>int</code> batek 32 767 gainditzen badu, <strong>gainezkatzea</strong> gertatzen da eta negatibo bihurtzen da. Gainera, bi <code>int</code> zatitzean emaitza osoa da: <code>7 / 2</code> = 3.</p>
    </div></details>`,

  ariketak: ['kodea-trazatu', 'aldagaiak-trazatu', 'eragileak'],

  galdetegia: nahastu([
    { g: 'Python-en, nola adierazten da begizta baten barruan dauden lerroak?', a: ['Koskarekin (lerroak eskuinerago)', 'Giltzekin { }', 'Puntu eta komarekin', 'Parentesiekin'], z: 0, zergatik: 'Python-en koskak zehazten ditu blokeak.' },
    { g: 'C++-en, zer jartzen da agindu bakoitzaren amaieran?', a: [';', ':', '.', 'Ezer ez'], z: 0, zergatik: 'Puntu eta koma ahaztea sintaxi-akats ohikoenetako bat da.' },
    { g: 'Zein da x = 5 eta x == 5 arteko desberdintasuna?', a: ['Lehenak balioa gordetzen du; bigarrenak konparatzen du', 'Berdinak dira', 'Lehenak konparatzen du; bigarrenak gordetzen du', 'Bigarrena akats bat da'], z: 0, zergatik: '= esleipena; == berdintasun-konparazioa.' },
    { g: 'Zenbat aldiz exekutatzen da «for i in range(5):» begizta?', a: ['5', '4', '6', '0'], z: 0, zergatik: 'range(5) = 0, 1, 2, 3, 4.' },
    { g: '«eta» blokea nola idazten da C++-en?', a: ['&&', 'and', '||', '!'], z: 0, zergatik: 'C++: && (eta), || (edo), ! (ez).' },
    { g: 'Zer esan nahi du C++ lengoaia konpilatua dela?', a: ['Programa osoa makina-kode bihurtzen dela exekutatu aurretik', 'Lerroz lerro exekutatzen dela', 'Blokeekin bakarrik idazten dela', 'Ez duela aldagairik'], z: 0, zergatik: 'Konpilatzaileak itzulpena egiten du; Python, berriz, interpretatzen da.' },
    { g: 'Python-en, zer idazten du print(7 % 3)?', a: ['1', '2', '2.33', '21'], z: 0, zergatik: '% hondarra da: 7 = 2 · 3 + 1.' },
    { g: 'Zergatik adierazten dira datu motak C++-en (int, float…)?', a: ['Konpilatzaileak jakin dezan zenbat memoria behar den eta nola gorde', 'Programa politagoa izateko', 'Ez dira beharrezkoak', 'Python-ekin bateragarria izateko'], z: 0, zergatik: 'Mota bakoitzak tamaina eta balio-tarte bat ditu.' },
    { g: 'Arduino UNOn, zenbat da C++-eko «7 / 2», biak int direnean?', a: ['3', '3.5', '4', '3,5'], z: 0, zergatik: 'Bi zenbaki oso zatitzean, emaitza osoa da: zati hamartarra galtzen da.' }
  ])
};
