import { nahastu } from '../util.js';

const ikurra = (d, izena, azal) => `<tr><td><svg viewBox="0 0 64 36" width="64" height="36" aria-hidden="true">${d}</svg></td><td><strong>${izena}</strong></td><td>${azal}</td></tr>`;

export default {
  izena: 'Algoritmoak eta fluxu-diagramak',
  galdera: 'Nola irudika daiteke algoritmo bat, edozein pertsonak (eta edozein programatzailek) ulertzeko moduan, programazio-lengoaiarik jakin gabe?',

  ikusi: {
    sim: 'fluxu-diagrama',
    proba: 'Hasi «Eskolara joan aurretik» diagramarekin eta erantzun galderei. Gero, «1etik N-ra batu» diagraman, idatzi N = 4 eta jarraitu aldagaiak urratsez urrats: zenbat aldiz igarotzen da fluxua erabakitik? DBH 3-4tik aurrera, jolastu «Asmatu zenbakia»-rekin: gutxienez zenbat saiakerarekin asma daiteke beti?'
  },

  ulertu: () => `
    <p class="def"><strong>Fluxu-diagrama</strong> algoritmo baten irudikapen grafikoa da. Pieza bakoitzak ekintza mota bat adierazten du, eta geziek urratsen ordena (fluxua). Ikurrak nazioartean adostuta daude (ISO 5807 araua), eta horregatik edonork uler ditzake.</p>

    <h3>Ikurrak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Ikurra</th><th>Izena</th><th>Esanahia</th></tr></thead>
      <tbody>
        ${ikurra('<rect class="fd-n fd-hasi" x="4" y="7" width="56" height="22" rx="11"/>', 'Hasiera / amaiera', 'Algoritmoa non hasten eta amaitzen den.')}
        ${ikurra('<rect class="fd-n" x="4" y="7" width="56" height="22"/>', 'Prozesua', 'Ekintza edo kalkulu bat: <code>batura ← batura + i</code>.')}
        ${ikurra('<path class="fd-n fd-sarrera" d="M14 7 H60 L50 29 H4 Z"/>', 'Sarrera / irteera', 'Datu bat irakurri (<code>Irakurri N</code>) edo emaitza bat idatzi (<code>Idatzi batura</code>).')}
        ${ikurra('<path class="fd-n fd-erabakia" d="M32 3 L60 18 L32 33 L4 18 Z"/>', 'Erabakia', 'Galdera bat, bi irteerarekin: <em>bai</em> edo <em>ez</em> (egia edo gezurra).')}
        ${ikurra('<line class="fd-l" x1="6" y1="18" x2="52" y2="18"/><path class="fd-gezia" d="M50 12 L60 18 L50 24 Z"/>', 'Fluxu-lerroa', 'Hurrengo urratsa zein den adierazten du.')}
      </tbody>
    </table></div>

    <h3>Hiru oinarrizko egiturak</h3>
    <ul>
      <li><strong>Sekuentzia:</strong> urratsak bata bestearen atzetik, ordenan.</li>
      <li><strong>Hautapena (erabakia):</strong> baldintza baten arabera bide bat edo bestea hartzen da. <em>Euria ari badu, hartu aterkia.</em></li>
      <li><strong>Errepikapena (begizta):</strong> urrats batzuk behin eta berriz egiten dira baldintza bat bete arte. Fluxu-diagraman, gezi batek atzera egiten du.</li>
    </ul>

    <h3>Aldagaiak eta esleipena</h3>
    <p><strong>Aldagaia</strong> izen bat duen memoria-kutxa bat da. <code>batura ← batura + i</code> honela irakurtzen da: «kalkulatu batura + i, eta gorde emaitza batura-n». Gezia (←) erabiltzen da, ez berdin ikurra, ez baita ekuazio bat: aldagaiaren balioa aldatu egiten da.</p>

    <h3>Pseudokodea</h3>
    <p>Algoritmoak testuz ere idatz daitezke, hizkuntza arrunta eta egitura argia nahastuz. «1etik N-ra batu» algoritmoa:</p>
    <ol class="ex-pseudo"><li style="--s:0"><code>Irakurri N</code></li><li style="--s:0"><code>batura ← 0</code></li><li style="--s:0"><code>i ← 1</code></li><li style="--s:0"><code>i ≤ N den bitartean:</code></li><li style="--s:1"><code>batura ← batura + i</code></li><li style="--s:1"><code>i ← i + 1</code></li><li style="--s:0"><code>Idatzi batura</code></li></ol>

    <div class="worked">
      <h4>Adibidea: algoritmoa trazatu, N = 4</h4>
      <p><strong>Trazatzea</strong> algoritmoa eskuz exekutatzea da, aldagaien balioak taula batean idatziz.</p>
      <div class="table-scroll"><table class="tbl">
        <thead><tr><th>Itzulia</th><th>i ≤ 4 ?</th><th>batura</th><th>i</th></tr></thead>
        <tbody>
          <tr><td>hasieran</td><td>—</td><td>0</td><td>1</td></tr>
          <tr><td>1</td><td>1 ≤ 4 bai</td><td>1</td><td>2</td></tr>
          <tr><td>2</td><td>2 ≤ 4 bai</td><td>3</td><td>3</td></tr>
          <tr><td>3</td><td>3 ≤ 4 bai</td><td>6</td><td>4</td></tr>
          <tr><td>4</td><td>4 ≤ 4 bai</td><td>10</td><td>5</td></tr>
          <tr><td>—</td><td>5 ≤ 4 ez</td><td colspan="2">Idatzi 10</td></tr>
        </tbody>
      </table></div>
      <p class="ans">Emaitza: 10. Erabakitik 5 aldiz igarotzen da: 4 aldiz «bai» eta behin «ez».</p>
    </div>

    <p class="note"><strong>Kontuz begiztekin:</strong> <code>i ← i + 1</code> ahazten bada, i-k beti 1 balio du, baldintza beti egia da eta algoritmoa ez da inoiz amaitzen. Hori <strong>begizta amaigabea</strong> da.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> fluxu-diagrama batekin. Ikur estandarrek eta geziek algoritmoaren egitura erakusten dute (sekuentziak, erabakiak eta begiztak), inolako programazio-lengoaiaren menpe egon gabe.</p>

    <details class="sakondu" data-maila="2"><summary>Estrategia onak: asmatu zenbakia</summary><div class="in">
      <p>«Asmatu zenbakia» algoritmoan, jokalariak nahi duen estrategia erabil dezake. Estrategia batzuk beste batzuk baino askoz hobeak dira:</p>
      <ul>
        <li><strong>Ausaz esan:</strong> batzuetan azkar, beste batzuetan oso motel.</li>
        <li><strong>1etik gora banan-banan:</strong> kasu txarrenean, 100 saiakera.</li>
        <li><strong>Beti erdikoa:</strong> 50, gero 25 edo 75… Saiakera bakoitzak aukeren erdia baztertzen du, eta 7 saiakera nahikoak dira beti (2⁷ = 128 > 100).</li>
      </ul>
      <p>Algoritmo bat diseinatzean, kasu txarrena eta batez besteko kasua hartu behar dira kontuan.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Euklidesen algoritmoa eta programazio egituratua</summary><div class="in">
      <p><strong>Euklidesen algoritmoa</strong> (K.a. 300 inguru) historiako algoritmo zaharrenetako bat da. Bi zenbakiren zatitzaile komunetako handiena (ZKH) kalkulatzen du, zatiketak eginez: ZKH(a, b) = ZKH(b, a mod b), hondarra zero izan arte.</p>
      <p>Adibidez, ZKH(84, 36): 84 mod 36 = 12 → ZKH(36, 12): 36 mod 12 = 0 → emaitza 12.</p>
      <p><strong>Böhm eta Jacopini</strong>-ren teoremak (1966) frogatu zuen edozein algoritmo idatz daitekeela hiru egiturekin bakarrik: sekuentzia, hautapena eta errepikapena. Hori da <strong>programazio egituratuaren</strong> oinarria: jauzi libreak (<code>goto</code>) saihestu eta kodea blokeka antolatu.</p>
    </div></details>`,

  ariketak: ['fluxua-begizta', 'fluxua-erabakia', 'bilaketa'],

  galdetegia: nahastu([
    { g: 'Fluxu-diagrama batean, zein ikurrek adierazten du erabaki bat?', a: ['Erronboak', 'Laukizuzenak', 'Paralelogramoak', 'Obaloak'], z: 0, zergatik: 'Erronboak bi irteera ditu: bai eta ez.' },
    { g: 'Zein ikur erabiltzen da datu bat irakurtzeko edo emaitza bat idazteko?', a: ['Paralelogramoa', 'Erronboa', 'Laukizuzena', 'Zirkulua'], z: 0, zergatik: 'Paralelogramoa sarrera eta irteeretarako da; laukizuzena, prozesuetarako.' },
    { g: 'Erabaki batetik fluxua aurreko pieza batera itzultzen bada, zer dugu?', a: ['Begizta bat (errepikapena)', 'Sekuentzia bat', 'Beti akats bat', 'Algoritmoaren amaiera'], z: 0, zergatik: 'Atzera doan geziak urratsak errepikatzen ditu, baldintza aldatu arte.' },
    { g: '«batura ← batura + i» aginduak zer egiten du?', a: ['batura + i kalkulatu eta emaitza batura aldagaian gorde', 'batura eta i berdinak diren konparatu', 'batura i aldagaian gorde', 'Ez du ezer egiten'], z: 0, zergatik: 'Esleipena da: eskuineko aldea kalkulatu eta ezkerreko aldagaian gorde.' },
    { g: '1etik N-ra batzeko algoritmoan «i ← i + 1» ahazten badugu:', a: ['Begizta ez da inoiz amaitzen', 'Emaitza zero da', 'Algoritmoa azkarrago doa', 'Ez da ezer aldatzen'], z: 0, zergatik: 'i beti 1 denez, i ≤ N beti egia da: begizta amaigabea.' },
    { g: '«Bi zenbakitatik handiena» algoritmoan A = 7 eta B = 7 badira, zer idazten du?', a: ['7, «Ez» adarretik (B idazten du)', 'Ezer ez', 'Errore bat', '14'], z: 0, zergatik: '7 > 7 gezurra denez, «Ez» adarretik doa eta B idazten du. Emaitza zuzena da: biak berdinak dira.' },
    { g: '1 eta 100 arteko zenbaki bat asmatzeko, beti erdiko zenbakia esaten baduzu, kasu txarrenean zenbat saiakera behar dira?', a: ['7', '10', '50', '100'], z: 0, maila: 2, zergatik: 'Saiakera bakoitzak aukerak erdira murrizten ditu: 2⁷ = 128 ≥ 100.' },
    { g: 'Böhm eta Jacopini-ren teoremaren arabera, edozein algoritmo idazteko nahikoak dira:', a: ['Sekuentzia, hautapena eta errepikapena', 'Aldagaiak eta funtzioak', 'Sarrerak eta irteerak', 'Begiztak bakarrik'], z: 0, maila: 3, zergatik: 'Hiru egitura horiek programazio egituratuaren oinarria dira.' }
  ])
};
