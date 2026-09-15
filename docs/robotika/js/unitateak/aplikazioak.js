import { nahastu } from '../util.js';
import { programa } from '../blokeHTML.js';

const forma = (html, testua) => `<figure>${html}<figcaption>${testua}</figcaption></figure>`;

export default {
  izena: 'Aplikazio mugikorrak',
  galdera: 'Nola dakite mugikorreko aplikazioek zer egin behar duten, eta zergatik ez dira programa arrunt bat bezala «amaitzen»?',

  ikusi: {
    sim: 'aplikazioa',
    aukerak: { gorde: 'robotika:aplikazioa:v1' },
    proba: 'Ireki <b>Kontagailua</b> eta sakatu botoiak: begiratu gertaeren erregistroa. <b>Kronometroan</b>, zer gertatzen da Botoia1 bi aldiz sakatzean? <b>Etxeko argian</b>, mugitu graduatzailea. Gero, aldatu aplikazio bat: gehitu kontagailuari «kendu 1» botoia, edo jarri txanponari puntuazio bat.'
  },

  ulertu: () => `
    <p class="def"><strong>Aplikazio mugikorra</strong> telefono edo tableta batean exekutatzen den programa da. Hasieratik amaierara exekutatu beharrean, <strong>gertaerei erantzuten die</strong>: erabiltzaileak botoi bat sakatzen duenean, mezu bat iristen denean edo tenporizadore batek jotzen duenean. <strong>MIT App Inventor</strong> eta Thunkable blokeekin aplikazioak egiteko inguruneak dira.</p>

    <h3>Bi zati: diseinua eta blokeak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Diseinatzailea</th><th>Blokeen editorea</th></tr></thead>
      <tbody><tr>
        <td>Pantailako <strong>osagaiak</strong> kokatu eta haien propietateak aukeratu: testua, kolorea, tamaina.</td>
        <td>Osagaien <strong>portaera</strong> programatu: zer gertatzen den gertaera bakoitzean.</td>
      </tr></tbody>
    </table></div>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Osagai ikusgaiak</th><th>Osagai ez-ikusgaiak</th></tr></thead>
      <tbody><tr>
        <td>Botoia, etiketa, testu-kutxa, irudia, graduatzailea, zerrenda, marrazteko oihala</td>
        <td>Erlojua (tenporizadorea), azelerometroa, kokapena (GPS), Bluetooth, soinua, hizketa, datu-basea (TinyDB)</td>
      </tr></tbody>
    </table></div>

    <h3>Gertaeretan oinarritutako programazioa</h3>
    <div class="bk-row">
      ${forma(programa([['gertaera', 'Botoia1 sakatzean', [['aldagaiak', 'aldatu [kontagailua], gehitu {1}'], ['aplikazioa', 'ezarri Etiketa1 testua [kontagailua]']]]], 'Botoia sakatzean kontagailua handitzen duen programa'), '<strong>Gertaera</strong> gertatzen den bakoitzean, barruko blokeak exekutatzen dira.')}
      ${forma(programa([['gertaera', 'Tenporizadorea: segundoro', [['aldagaiak', 'aldatu [segundoak], gehitu {1}']]]], 'Tenporizadorearen programa'), 'Ez-ikusgaiak ere gertaerak sortzen ditu.')}
    </div>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Programa sekuentziala</th><th>Gertaeretan oinarritua</th></tr></thead>
      <tbody>
        <tr><td>Hasieratik amaierara, ordenan</td><td>Erabiltzailearen edo sistemaren gertaerei erantzuten die</td></tr>
        <tr><td>Programak erabakitzen du noiz eskatu datuak</td><td>Erabiltzaileak erabakitzen du zer egin eta noiz</td></tr>
        <tr><td>Amaitu egiten da</td><td>Irekita dagoen bitartean, zain dago</td></tr>
        <tr><td>Kontsolako programak, kalkuluak</td><td>Aplikazioak, jokoak, web-orriak, Micro:bit-en botoiak</td></tr>
      </tbody>
    </table></div>
    <p>Gertaera bakoitzaren blokeak bereiz exekutatzen dira, baina <strong>aldagai globalek</strong> haien artean informazioa gordetzen dute: kontagailuak bere balioa gogoratzen du sakatze batetik bestera.</p>

    <div class="worked">
      <h4>Adibidea: kontagailuaren gertaerak</h4>
      <p>Hasieran kontagailua = 0. Botoia1-ek 1 gehitzen du eta Botoia2-k zerora itzultzen du. Erabiltzaileak sakatzen du: Botoia1, Botoia1, Botoia2, Botoia1, Botoia1, Botoia1.</p>
      <ol><li>1, 2 (Botoia1 bi aldiz)</li><li>0 (Botoia2)</li><li>1, 2, 3 (Botoia1 hiru aldiz)</li></ol>
      <p class="ans">Etiketak 3 erakusten du.</p>
    </div>

    <h3>Aplikazioak eta gailu fisikoak</h3>
    <p>Mugikorra aginte-urruneko bat izan daiteke: aplikazio batek <strong>Bluetooth</strong> bidez Micro:bit edo Arduino plaka bati bidal diezaioke agindu bat (argia piztu, robota mugitu), edo sentsoreen datuak jaso eta erakutsi. Mugikorrak berak ere sentsore asko ditu: azelerometroa, GPSa, kamera, mikrofonoa.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> aplikazioek gertaeretan oinarritutako programazioa erabiltzen dute. Programatzaileak gertaera bakoitzerako erantzun bat idazten du («botoia sakatzean…»), eta aplikazioa zain geratzen da. Ez da amaitzen erabiltzaileak itxi arte, gertaera berrien zain dagoelako.</p>

    <details class="sakondu" data-maila="2"><summary>Erabiltzaile-interfaze ona</summary><div class="in">
      <ul>
        <li><strong>Argia:</strong> ekintza nagusiak begi-bistan eta etiketa ulergarriekin.</li>
        <li><strong>Irisgarria:</strong> kolore-kontraste nahikoa, hatzarekin sakatzeko moduko botoiak (gutxienez 48 × 48 px) eta irakurgailuentzako testu alternatiboak.</li>
        <li><strong>Erantzuna ematen du:</strong> sakatzean zerbait aldatu behar da (kolorea, mezu bat, bibrazioa), erabiltzaileak jakin dezan ekintza jaso dela.</li>
        <li><strong>Datuak gordetzen ditu:</strong> TinyDB bezalako datu-base batek aplikazioa itxi arren gogoratzen ditu balioak.</li>
      </ul>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Aplikazioen garapen profesionala eta baimenak</summary><div class="in">
      <ul>
        <li><strong>Jatorrizko aplikazioak:</strong> Android (Kotlin, Java) eta iOS (Swift). <strong>Plataforma anitzekoak:</strong> Flutter, React Native. <strong>Web-aplikazioak</strong> (PWA): nabigatzailean, instalatu gabe.</li>
        <li><strong>Baimenak:</strong> kamera, kokapena edo kontaktuak erabiltzeko, aplikazioak baimena eskatu behar du. Aplikazio batek behar dituen baimenak bakarrik eskatu behar ditu.</li>
        <li><strong>Pribatutasuna:</strong> Europako Datuak Babesteko Erregelamenduak (DBEO) datu pertsonalak nola erabil daitezkeen arautzen du.</li>
      </ul>
    </div></details>`,

  ariketak: ['app-gertaerak', 'aldagaiak-trazatu'],

  galdetegia: nahastu([
    { g: 'Zer da gertaera bat aplikazio batean?', a: ['Aplikazioak erantzun behar dion zerbait: botoi bat sakatzea, tenporizadore bat…', 'Aplikazioaren diseinua', 'Aldagai mota bat', 'Programaren amaiera'], z: 0, zergatik: 'Gertaera bakoitzari bloke-multzo bat lotzen zaio.' },
    { g: 'App Inventor-en, non kokatzen dira botoiak eta etiketak?', a: ['Diseinatzailean', 'Blokeen editorean', 'Kontsolan', 'Datu-basean'], z: 0, zergatik: 'Diseinatzailean osagaiak kokatzen dira; blokeetan portaera programatzen da.' },
    { g: 'Hauetako zein da osagai ez-ikusgai bat?', a: ['Tenporizadorea (erlojua)', 'Botoia', 'Etiketa', 'Irudia'], z: 0, zergatik: 'Ez da pantailan ikusten, baina gertaerak sortzen ditu.' },
    { g: 'Zergatik ez da aplikazio bat amaitzen «hasieran» blokea exekutatu ondoren?', a: ['Gertaera berrien zain geratzen delako', 'Begizta amaigabe bat duelako', 'Errore bat dagoelako', 'Mugikorrak ez duelako uzten'], z: 0, zergatik: 'Gertaeretan oinarritutako programak itxaron egiten du.' },
    { g: 'Kontagailuak 5 du. Botoia2-k zerora itzultzen du eta Botoia1-ek 1 gehitzen du. Sakatzen dira: Botoia1, Botoia2, Botoia1. Zenbat du?', a: ['1', '6', '7', '0'], z: 0, zergatik: '6 → 0 → 1.' },
    { g: 'Zertarako behar dira aldagai globalak aplikazio batean?', a: ['Gertaera batetik bestera balioak gordetzeko', 'Botoien kolorea aldatzeko', 'Aplikazioa azkarrago ibiltzeko', 'Ez dira behar'], z: 0, zergatik: 'Gertaera-bloke bakoitza bereiz exekutatzen da; aldagaiak partekatzen dira.' },
    { g: 'Nola kontrola dezake mugikorreko aplikazio batek Arduino plaka bat?', a: ['Bluetooth edo WiFi bidez aginduak bidaliz', 'Pantaila ukituz plakaren gainean', 'Ezin da', 'Kablerik gabe, magnetismoz'], z: 0, zergatik: 'Aplikazioak mezu bat bidaltzen du, eta plakaren programak interpretatzen du.' },
    { g: 'Zer da irisgarritasuna aplikazio batean?', a: ['Pertsona guztiek erabili ahal izatea, ezgaitasunak dituztenek barne', 'Aplikazioa doakoa izatea', 'Aplikazioa azkarra izatea', 'Internetik gabe ibiltzea'], z: 0, maila: 2, zergatik: 'Kontrastea, tamaina eta irakurgailuentzako etiketak garrantzitsuak dira.' },
    { g: 'Zergatik eskatu behar ditu aplikazio batek behar dituen baimenak bakarrik?', a: ['Erabiltzailearen pribatutasuna babesteko', 'Azkarrago instalatzeko', 'Bateria gutxiago erabiltzeko bakarrik', 'Legeak debekatzen duelako aplikazioak egitea'], z: 0, maila: 3, zergatik: 'Datu pertsonalak (kokapena, kontaktuak) babestu behar dira.' }
  ])
};
