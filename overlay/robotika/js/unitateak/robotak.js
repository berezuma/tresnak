import { nahastu } from '../util.js';
import { programa } from '../blokeHTML.js';

export default {
  izena: 'Robotak',
  galdera: 'Nola jarraitzen dio biltegi bateko robot batek lurrean margotutako bideari, inork gidatu gabe?',

  ikusi: {
    sim: 'robota',
    aukerak: { gorde: 'robotika:robota:v1' },
    proba: 'Exekutatu <b>Lerro-jarraitzailea</b> pista obalean, eta gero <b>Bihurguneak</b> pistan: abiadura 50etik 80ra igotzean, jarraitzen al dio lerroari? <b>Karratuan</b>, ikusi nola ez den itxi guztiz. <b>Oztopoak saihestu</b>: aldatu 30 cm-ko distantzia; zer gertatzen da biratzeko 400 ms-ko itxaronaldi finko bat jartzen bada «arte» blokearen ordez? Azkenik, konbinatu: jarraitu lerroari eta gelditu oztopo baten aurrean.'
  },

  ulertu: () => `
    <p class="def"><strong>Robota</strong> programagarria den makina bat da, ingurunea sentsoreekin hauteman, erabakiak hartu eta eragingailuekin ekiten duena, zeregin bat bere kabuz edo erdi bere kabuz egiteko. Robota = sentsoreak + kontrola + eragingailuak.</p>

    <h3>Robot motak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Mota</th><th>Ezaugarriak</th><th>Adibideak</th></tr></thead>
      <tbody>
        <tr><td><strong>Industrialak</strong></td><td>Leku finko batean, beso manipulatzaileak</td><td>Soldadura, margoketa, muntaketa</td></tr>
        <tr><td><strong>Mugikorrak</strong></td><td>Gurpilak, hankak, hegalak edo helizeak</td><td>Biltegiko robotak, garbigailuak, droneak, Marteko ibilgailuak</td></tr>
        <tr><td><strong>Zerbitzukoak</strong></td><td>Pertsonekin, etxean edo zerbitzuetan</td><td>Robot kirurgikoak, harrera-robotak</td></tr>
        <tr><td><strong>Humanoideak</strong></td><td>Giza forma</td><td>Ikerketa, erakustaldiak</td></tr>
        <tr><td><strong>Kolaboratiboak (cobot)</strong></td><td>Pertsonen ondoan seguru lan egiteko</td><td>Muntaketa-lerroak, laborategiak</td></tr>
      </tbody>
    </table></div>

    <h3>Robot mugikor baten atalak</h3>
    <ul>
      <li><strong>Egitura (xasisa):</strong> osagaiak eusten ditu.</li>
      <li><strong>Eragingailuak:</strong> DC motorrak erreduktore batekin (abiadura txikiagoa, indar handiagoa), servoak.</li>
      <li><strong>Sentsoreak:</strong> lerro-sentsore infragorriak, ultrasoinuak, ukipen-sentsoreak, enkoderrak.</li>
      <li><strong>Kontrolagailua:</strong> Arduino, Micro:bit edo antzekoa, eta motorren <em>driver</em>-a.</li>
      <li><strong>Energia:</strong> bateriak edo pilak.</li>
    </ul>

    <h3>Trakzio diferentziala</h3>
    <p>Gurpil-robot gehienek bi motor dituzte, bat alde bakoitzean, eta gurpil eroale bat. Ez dute bolanterik: <strong>gurpilen abiadurak desberdinduz</strong> biratzen dira.</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Ezkerreko motorra</th><th>Eskuineko motorra</th><th>Mugimendua</th></tr></thead>
      <tbody>
        <tr><td>+50 %</td><td>+50 %</td><td>Aurrera, zuzen</td></tr>
        <tr><td>−50 %</td><td>−50 %</td><td>Atzera</td></tr>
        <tr><td>+20 %</td><td>+60 %</td><td>Aurrera eta ezkerrera (bira zabala)</td></tr>
        <tr><td>+40 %</td><td>−40 %</td><td>Eskuinera, bere lekuan</td></tr>
        <tr><td>0 %</td><td>+50 %</td><td>Ezkerrera, ezkerreko gurpilaren inguruan</td></tr>
      </tbody>
    </table></div>
    <div class="formula">v = π · d · rpm / 60<small>d gurpilaren diametroa · rpm bira minutuko</small></div>

    <h3>Lerro-jarraitzailea</h3>
    <p><strong>Sentsore infragorri</strong> batek argi infragorria igortzen du, eta lurrak islatzen duena neurtzen du: gainazal zuriak asko islatzen du, eta lerro beltzak gutxi. Bi sentsore lerroaren bi aldeetan jarrita:</p>
    <div class="bk-row">
      <figure>${programa([['gertaera', 'betiko', [['kontrola', 'baldin ⟨lerro-sentsorea ezkerra beltzean⟩ bada', [['mugimendua', 'motorrak: ezkerra {0} % · eskuina {50} %']], 'bestela', [['kontrola', 'baldin ⟨lerro-sentsorea eskuina beltzean⟩ bada', [['mugimendua', 'motorrak: ezkerra {50} % · eskuina {0} %']], 'bestela', [['mugimendua', 'motorrak: ezkerra {50} % · eskuina {50} %']]]]]]]], 'Lerro-jarraitzailearen programa')}<figcaption>Ezkerreko sentsoreak beltza ikusten badu, robota eskuinera desbideratu da: ezkerrera biratu.</figcaption></figure>
    </div>
    <p>Hau <strong>begizta itxiko</strong> kontrola da: robotak etengabe neurtzen du non dagoen lerroa eta zuzendu egiten du. <em>Karratua</em> adibideak, berriz, <strong>begizta irekia</strong> erabiltzen du (denbora): gurpil bat pixka bat irristatzen bada, errorea metatu egiten da eta ez da zuzentzen.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> biltegiko robotek lurreko lerroa (edo QR kodeak) sentsore optikoekin detektatzen dute. Programak etengabe konparatzen du sentsoreek ikusten dutena, eta lerrotik desbideratzean motor baten abiadura aldatzen du zuzentzeko. Oztopo-sentsoreek (ultrasoinuak, laserra) pertsona edo gauza baten aurrean gelditzen dute.</p>

    <details class="sakondu" data-maila="2"><summary>Robotika eta etika</summary><div class="in">
      <p>Isaac Asimov idazleak <strong>robotikaren hiru legeak</strong> asmatu zituen (1942): robot batek ez dio gizaki bati kalterik egingo; gizakien aginduak beteko ditu, lehen legearen aurka ez badoaz; eta bere burua babestuko du, aurreko legeen aurka ez badoa.</p>
      <p>Gaur egun galdera errealak dira: nork du erantzukizuna auto autonomo batek istripu bat duenean? Zer gertatzen da robotek ordezkatzen dituzten lanpostuekin? Nola babestu robot eta droneek biltzen dituzten datuak?</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Odometria, enkoderrak eta SLAM</summary><div class="in">
      <ul>
        <li><strong>Enkoderrak</strong> gurpilen birak neurtzen ditu. <strong>Odometriak</strong>, bira horietatik, robotaren posizioa kalkulatzen du: Δs = (Δs<sub>ezk</sub> + Δs<sub>esk</sub>) / 2 eta Δθ = (Δs<sub>esk</sub> − Δs<sub>ezk</sub>) / b.</li>
        <li>Odometriaren erroreak metatu egiten dira (irristadurak). Horregatik, beste sentsore batzuekin konbinatzen da: giroskopioa, GPSa, kamerak.</li>
        <li><strong>SLAM</strong> (<em>Simultaneous Localization and Mapping</em>): robotak ingurunearen mapa egiten du eta, aldi berean, mapa horretan non dagoen kalkulatzen du. Robot-garbigailu modernoek eta auto autonomoek erabiltzen dute, LIDAR sentsoreekin.</li>
      </ul>
    </div></details>`,

  ariketak: ['gurpila', 'ultrasoinua'],

  galdetegia: nahastu([
    { g: 'Zein hiru atal ditu robot batek, gutxienez?', a: ['Sentsoreak, kontrolagailua eta eragingailuak', 'Gurpilak, pantaila eta bateria', 'Motorra, kamera eta hegalak', 'Programa, teklatua eta sagua'], z: 0, zergatik: 'Hauteman, erabaki eta ekin.' },
    { g: 'Trakzio diferentzialeko robot batek, nola biratzen du?', a: ['Gurpil bakoitza abiadura desberdinean mugituz', 'Bolante batekin', 'Gurpil eroalea biratuz', 'Ezin du biratu'], z: 0, zergatik: 'Abiadura-desberdintasunak biraketa sortzen du.' },
    { g: 'Ezkerreko motorra % 40 aurrera eta eskuinekoa % 40 atzera: nora mugitzen da robota?', a: ['Eskuinera biratzen da, bere lekuan', 'Ezkerrera biratzen da, bere lekuan', 'Aurrera', 'Atzera'], z: 0, zergatik: 'Ezkerreko gurpilak aurrera bultzatzen du eta eskuinekoak atzera: eskuinera biratzen da.' },
    { g: 'Nola bereizten du sentsore infragorri batek lerro beltza lur zuritik?', a: ['Zuriak argi infragorri gehiago islatzen du', 'Beltzak beroa ematen du', 'Soinua neurtuz', 'Kolorea kamera batekin ikusiz'], z: 0, zergatik: 'Gainazal beltzak argia xurgatzen du, eta zuriak islatu.' },
    { g: 'Lerro-jarraitzailean, ezkerreko sentsoreak beltza detektatzen badu, zer egin behar du robotak?', a: ['Ezkerrera biratu', 'Eskuinera biratu', 'Gelditu', 'Atzera egin'], z: 0, zergatik: 'Lerroa ezkerraldean dago: robota eskuinera desbideratu da.' },
    { g: 'Zergatik ez da guztiz itxi karratua denborarekin programatutako robotean?', a: ['Begizta irekia delako: irristadurak eta erroreak ez dira zuzentzen', 'Programa gaizki dagoelako', 'Motorrak ez direlako berdinak', 'Sentsoreak hautsita daudelako'], z: 0, zergatik: 'Sentsorerik gabe, robotak ez daki benetan zenbat biratu duen.' },
    { g: '6 cm-ko gurpilek 100 rpm egiten badituzte, zein da abiadura gutxi gorabehera?', a: ['31 cm/s', '600 cm/s', '10 cm/s', '3 cm/s'], z: 0, maila: 2, zergatik: 'π · 6 · 100 / 60 ≈ 31,4 cm/s.' },
    { g: 'Zer da robot kolaboratibo bat (cobot)?', a: ['Pertsonen ondoan seguru lan egiteko diseinatutako robota', 'Beste robot batzuekin hitz egiten duen robota', 'Etxean bakarrik erabiltzen den robota', 'Urrutitik gidatutako robota'], z: 0, zergatik: 'Indar- eta talka-sentsoreak ditu, pertsonei kalterik ez egiteko.' },
    { g: 'Zer da odometria?', a: ['Gurpilen birak neurtuz robotaren posizioa kalkulatzea', 'Distantzia soinuarekin neurtzea', 'Mapa bat marraztea', 'Bateriaren karga neurtzea'], z: 0, maila: 3, zergatik: 'Enkoderrekin gurpil bakoitzaren bidea neurtzen da, eta hortik posizioa.' }
  ])
};
