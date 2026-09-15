import { nahastu } from '../util.js';
import { programa } from '../blokeHTML.js';
import { sortuKodea, margotu } from '../blokeak/kodea.js';
import * as E from '../blokeak/eraiki.js';

export default {
  izena: 'Arduino',
  galdera: 'Nola bihurtzen da ideia bat (farola bat, alarma bat, robot bat) benetan funtzionatzen duen gailu, 25 euroko plaka batekin?',

  ikusi: {
    sim: 'arduino',
    aukerak: { gorde: 'robotika:arduino:v1' },
    proba: 'Hasi <b>Keinuka</b> adibidearekin eta aldatu denborak: begiratu nola aldatzen den C++ kodea behean. <b>Argi-erregulagailuan</b>, mugitu potentziometroa eta irakurri serie-monitorea. Gero, egin zure <b>semaforoa</b> botoiarekin: oinezkoak sakatzean, gorria jarri.'
  },

  ulertu: () => `
    <p class="def"><strong>Arduino</strong> hardware libreko mikrokontrolagailu-plaka bat da (Ivrea, 2005), prototipoak eta hezkuntzarako proiektuak egiteko sortua. Sentsoreak irakurri, programa bat exekutatu eta eragingailuak kontrolatzen ditu. Blokeekin (ArduinoBlocks) edo C++ lengoaian (Arduino IDE) programatzen da.</p>

    <h3>Arduino UNO plaka</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Atala</th><th>Ezaugarriak</th></tr></thead>
      <tbody>
        <tr><td><strong>Mikrokontrolagailua</strong></td><td>ATmega328P: 16 MHz, 32 KB flash (programa), 2 KB RAM</td></tr>
        <tr><td><strong>Pin digitalak</strong> (0–13)</td><td>Sarrera edo irteera: 0 V edo 5 V. ~ ikurra dutenak (3, 5, 6, 9, 10, 11) PWM</td></tr>
        <tr><td><strong>Pin analogikoak</strong> (A0–A5)</td><td>Sarrerak: 0–5 V → 0–1023 (10 bit)</td></tr>
        <tr><td><strong>Elikadura</strong></td><td>USB (5 V) edo 7–12 V-ko konektorea; 5 V eta 3,3 V-ko pinak</td></tr>
        <tr><td><strong>USB</strong></td><td>Programa kargatu eta serie-monitorearekin komunikatu</td></tr>
      </tbody>
    </table></div>

    <h3>Programaren egitura</h3>
    <div class="bk-row">
      <figure>${programa([['gertaera', 'setup: hasieran', [['arduino', 'mugitu servoa (~6) {90} gradura']]], ['gertaera', 'loop: betiko', [['arduino', 'idatzi 13 pinean HIGH (1)'], ['kontrola', 'itxaron {500} ms'], ['arduino', 'idatzi 13 pinean LOW (0)'], ['kontrola', 'itxaron {500} ms']]]], 'Arduino programa blokeekin')}<figcaption>Blokeak</figcaption></figure>
      <figure><pre class="kd-kodea">${margotu(sortuKodea(E.programa([E.setup([E.servo(90)]), E.loop([E.dIdatzi(13, 1), E.itxaron(500), E.dIdatzi(13, 0), E.itxaron(500)])]), 'cpp'), 'cpp')}</pre><figcaption>C++ (Arduino IDE)</figcaption></figure>
    </div>
    <ul>
      <li><strong><code>setup()</code></strong>: behin exekutatzen da, plaka piztean. Pinen modua (sarrera/irteera) eta hasierako balioak.</li>
      <li><strong><code>loop()</code></strong>: etengabe errepikatzen da. Kontrol-sistemaren begizta: irakurri, erabaki, ekin.</li>
    </ul>

    <h3>Oinarrizko funtzioak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Funtzioa</th><th>Zer egiten du</th></tr></thead>
      <tbody>
        <tr><td><code>pinMode(13, OUTPUT)</code></td><td>Pin bat irteera (OUTPUT) edo sarrera (INPUT) gisa konfiguratu</td></tr>
        <tr><td><code>digitalWrite(13, HIGH)</code></td><td>Irteera digitala: HIGH (5 V) edo LOW (0 V)</td></tr>
        <tr><td><code>digitalRead(2)</code></td><td>Sarrera digitala irakurri: HIGH edo LOW</td></tr>
        <tr><td><code>analogRead(A0)</code></td><td>Sarrera analogikoa irakurri: 0–1023</td></tr>
        <tr><td><code>analogWrite(9, 128)</code></td><td>PWM irteera: 0–255</td></tr>
        <tr><td><code>delay(500)</code></td><td>Itxaron milisegundo batzuk</td></tr>
        <tr><td><code>map(v, 0, 1023, 0, 255)</code></td><td>Balio bat tarte batetik bestera eraman</td></tr>
        <tr><td><code>Serial.println(v)</code></td><td>Balio bat ordenagailuko serie-monitorera bidali</td></tr>
      </tbody>
    </table></div>

    <div class="worked">
      <h4>Adibidea: argi-erregulagailua</h4>
      <p>Potentziometroak 512 irakurtzen du A0 pinean. Programak <code>analogWrite(9, map(balioa, 0, 1023, 0, 255))</code> egiten du.</p>
      <ol><li>map: 512 · 255 / 1023 = 127,6 → 127 (zati hamartarra kentzen da)</li><li>Lan-zikloa: 127 / 255 = % 50</li><li>Batez besteko tentsioa: 0,5 · 5 V = 2,5 V</li></ol>
      <p class="ans">LEDak distira erdiarekin egiten du argia.</p>
    </div>

    <h3>Muntaketa: kontuan hartzekoak</h3>
    <ul>
      <li><strong>LEDa:</strong> beti erresistentzia batekin (220–330 Ω), eta hanka luzea (anodoa) pinaren aldera.</li>
      <li><strong>Botoia:</strong> 10 kΩ-eko <em>pull-down</em> erresistentzia batekin, bestela sarrera «airean» geratzen da eta ausazko balioak irakurtzen ditu.</li>
      <li><strong>Motorrak eta erreleak:</strong> transistore, driver edo errele-modulu baten bidez, eta kanpoko elikadurarekin. GND guztiak elkarrekin lotu.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> Arduinok sentsoreak (LDRa, botoia) pin batzuetan irakurtzen ditu, eta eragingailuak (LEDa, buzzerra) beste batzuetan kontrolatzen ditu. Programak, <code>loop()</code> begiztan, erabakitzen du zer egin. Programa blokeekin edo C++-ez idatzi, USB bidez kargatu, eta plakak bere kabuz lan egiten du, ordenagailurik gabe.</p>

    <details class="sakondu" data-maila="2"><summary>Blokeetatik kodera: konpilatu eta kargatu</summary><div class="in">
      <ol>
        <li><strong>Idatzi</strong> programa blokeekin (ArduinoBlocks) edo C++-ez (Arduino IDE).</li>
        <li><strong>Egiaztatu/konpilatu:</strong> konpilatzaileak C++ kodea makina-kode bihurtzen du. Sintaxi-akatsak hemen agertzen dira.</li>
        <li><strong>Kargatu:</strong> USB bidez, programa mikrokontrolagailuaren flash memorian gordetzen da. Plaka itzali arren, bertan geratzen da.</li>
        <li><strong>Liburutegiak</strong> (<code>#include &lt;Servo.h&gt;</code>): beste batzuek idatzitako funtzioak, servoak, pantailak edo sentsore konplexuak erraz erabiltzeko.</li>
      </ol>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Denbora blokeatu gabe: millis()</summary><div class="in">
      <p><code>delay()</code> erabiltzean, plakak ez du beste ezer egiten itxaron bitartean: ez du botoirik irakurtzen. Proiektu konplexuetan <code>millis()</code> erabiltzen da: plaka piztu zenetik igarotako milisegundoak ematen ditu.</p>
      <pre class="kd-kodea">${margotu(`unsigned long azkena = 0;

void loop() {
  if (millis() - azkena >= 500) {
    azkena = millis();
    digitalWrite(13, !digitalRead(13));
  }
  // hemen beste gauza batzuk egin daitezke, blokeatu gabe
}`, 'cpp')}</pre>
      <p>Horrela, hainbat ataza «aldi berean» egin daitezke. Gertaera oso azkarretarako (enkoderrak), <strong>etenak</strong> (<em>interrupts</em>) erabiltzen dira: <code>attachInterrupt()</code>.</p>
    </div></details>`,

  ariketak: ['map-funtzioa', 'arduino-denbora', 'pwm'],

  galdetegia: nahastu([
    { g: 'Arduino programa batean, zenbat aldiz exekutatzen da setup()?', a: ['Behin, plaka piztean', 'Etengabe', 'Botoia sakatzean', 'Segundoro'], z: 0, zergatik: 'setup() behin; loop() etengabe.' },
    { g: 'Zer egiten du digitalWrite(13, HIGH) aginduak?', a: ['13 pina 5 V-ra jartzen du', '13 pina irakurtzen du', '13 aldiz errepikatzen du', '13 ms itxaroten du'], z: 0, zergatik: 'HIGH = 5 V, LOW = 0 V.' },
    { g: 'Arduino UNOn, zein pin erabil daitezke PWMrako?', a: ['~ ikurra dutenak (3, 5, 6, 9, 10, 11)', 'A0–A5', 'Guztiak', '0 eta 1 bakarrik'], z: 0, zergatik: 'Pin horiek tenporizadore bati lotuta daude.' },
    { g: 'analogRead(A0)-k zein balio itzultzen du 5 V daudenean?', a: ['1023', '255', '5', '100'], z: 0, zergatik: '10 biteko ADCa: 0–1023.' },
    { g: 'Zenbat da map(1023, 0, 1023, 0, 180)?', a: ['180', '1023', '0', '90'], z: 0, zergatik: 'Jatorrizko tartearen muturra helburuko tartearen muturrera doa.' },
    { g: 'Zergatik jartzen da 10 kΩ-eko erresistentzia bat botoi batekin (pull-down)?', a: ['Botoia askatuta dagoenean sarrerak 0 V izan ditzan, eta ez ausazko balioak', 'Botoia ez erretzeko', 'Korrontea handitzeko', 'LEDa pizteko'], z: 0, zergatik: 'Lotu gabeko sarrera bat «airean» dago eta zarata jasotzen du.' },
    { g: 'Zer egiten du Serial.println(balioa) aginduak?', a: ['Balioa ordenagailuko serie-monitorean idazten du', 'Balioa pantaila batean idazten du', 'Balioa memorian gordetzen du', 'LED bat pizten du'], z: 0, zergatik: 'USB bidez bidaltzen da, eta Arduino IDEko serie-monitorean ikusten da.' },
    { g: 'Nola lotu behar da DC motor bat Arduino batera?', a: ['Driver edo transistore baten bidez, kanpoko elikadurarekin', 'Zuzenean pin digital batera', 'Pin analogiko batera', 'USB konektorera'], z: 0, maila: 2, zergatik: 'Pinek ez dute motorrak behar duen korronterik ematen.' },
    { g: 'Zer da konpilatzea?', a: ['Programaren kodea mikrokontrolagailuak exekuta dezakeen makina-kode bihurtzea', 'Programa ezabatzea', 'Plaka elikatzea', 'Pinak konfiguratzea'], z: 0, maila: 2, zergatik: 'Konpilatzaileak C++ itzultzen du, eta sintaxi-akatsak detektatzen ditu.' },
    { g: 'Zergatik erabiltzen da millis() delay()-ren ordez proiektu konplexuetan?', a: ['Programa blokeatu gabe denbora neurtzeko, beste gauza batzuk egin bitartean', 'Zehatzagoa delako mikrosegundotan', 'delay() ez delako existitzen', 'Memoria gutxiago erabiltzeko'], z: 0, maila: 3, zergatik: 'delay()-k plaka geldiarazten du; millis()-ekin denbora konparatu eta beste atazak egin daitezke.' }
  ])
};
