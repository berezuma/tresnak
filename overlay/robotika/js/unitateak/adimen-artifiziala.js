import { nahastu } from '../util.js';

const NEURONA = `<figure class="fig diagram" style="max-width:560px">
  <svg viewBox="0 0 560 190" role="img" aria-label="Neurona artifizial bat: sarrerak, pisuak, batura eta aktibazio-funtzioa">
    <defs><marker id="ia-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--ink)"/></marker></defs>
    <g style="fill:var(--sheet);stroke:var(--ink);stroke-width:2.5">
      <circle cx="60" cy="55" r="26" style="fill:var(--g1-fill)"/><circle cx="60" cy="135" r="26" style="fill:var(--g1-fill)"/>
      <circle cx="280" cy="95" r="38"/><rect x="380" y="70" width="70" height="50" style="fill:var(--g2-fill)"/>
    </g>
    <g style="stroke:var(--ink);stroke-width:2.5;fill:none">
      <line x1="86" y1="60" x2="242" y2="88" marker-end="url(#ia-g)"/><line x1="86" y1="130" x2="242" y2="102" marker-end="url(#ia-g)"/>
      <line x1="280" y1="10" x2="280" y2="55" marker-end="url(#ia-g)"/>
      <line x1="318" y1="95" x2="377" y2="95" marker-end="url(#ia-g)"/><line x1="450" y1="95" x2="540" y2="95" marker-end="url(#ia-g)"/>
      <path d="M393 108 H412 V82 H437" style="stroke:var(--s1)"/>
    </g>
    <g style="font-family:Lato, system-ui, sans-serif;fill:var(--ink)" text-anchor="middle">
      <text x="60" y="60" style="font-weight:700;font-size:15px">x₁</text><text x="60" y="140" style="font-weight:700;font-size:15px">x₂</text>
      <text x="165" y="62" style="font-size:14px;font-weight:700;fill:var(--s4)">w₁</text><text x="165" y="136" style="font-size:14px;font-weight:700;fill:var(--s4)">w₂</text>
      <text x="280" y="101" style="font-size:22px;font-weight:700">Σ</text><text x="296" y="20" style="font-size:13px;font-weight:700" text-anchor="start">b (bias)</text>
      <text x="415" y="140" style="font-size:12px;fill:var(--ink2)">aktibazioa</text>
      <text x="515" y="85" style="font-size:15px;font-weight:700">y</text>
      <text x="60" y="184" style="font-size:12px;fill:var(--ink2)">sarrerak</text><text x="280" y="160" style="font-size:12px;fill:var(--ink2)">s = x₁·w₁ + x₂·w₂ + b</text>
    </g>
  </svg>
  <figcaption>Neurona artifizial bat: sarrera bakoitza pisu batez biderkatu, batu, eta emaitza atalase bat gainditzen badu, irteera 1.</figcaption>
</figure>`;

export default {
  izena: 'Adimen artifiziala',
  galdera: 'Nola ikasten du mugikor batek zure aurpegia ezagutzen, inork «begiak hemen, sudurra hor» bezalako araurik programatu gabe?',

  ikusi: {
    sim: 'ia',
    proba: '<b>k-NN:</b> gehitu «galdera» puntuak eta ikusi zein auzokidek erabakitzen duten. Aldatu k. <b>Nahasiak</b> datuetan, aktibatu probarako herena: zein da zehaztasuna? <b>Neurona</b>: entrenatu aroka eta ikusi lerroa nola mugitzen den. Azkenik, <b>Alboratuak</b>: zergatik egiten ditu akatsak laranja txikiekin?'
  },

  ulertu: () => `
    <p class="def"><strong>Adimen artifiziala</strong> (AA) gizakion adimena behar duten zereginak egiten dituzten sistema informatikoen arloa da: irudiak ezagutu, hizkuntza ulertu, erabakiak hartu edo iragarpenak egin. Gaur egungo AA gehiena <strong>ikasketa automatikoa</strong> da: arauak programatu beharrean, sistemak <strong>datuetatik ikasten</strong> du.</p>

    <h3>Programazio klasikoa eta ikasketa automatikoa</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Programazio klasikoa</th><th>Ikasketa automatikoa</th></tr></thead>
      <tbody>
        <tr><td>Arauak + datuak → erantzunak</td><td>Datuak + erantzunak (adibideak) → arauak (eredua)</td></tr>
        <tr><td>«baldin kolorea &gt; 5 bada, laranja»</td><td>1000 fruitu etiketatuta erakutsi, eta ereduak berak aurkitzen du muga</td></tr>
        <tr><td>Arau argiak dituzten problemak</td><td>Arauak idazten zailak direnean: aurpegiak, ahotsa, zabor-posta</td></tr>
      </tbody>
    </table></div>

    <h3>Ikasketa motak</h3>
    <ul>
      <li><strong>Gainbegiratua:</strong> adibide etiketatuekin (sagarra/laranja, spam/ez). <em>Sailkapena</em> (kategoriak) edo <em>erregresioa</em> (zenbakiak: etxe baten prezioa).</li>
      <li><strong>Gainbegiratu gabea:</strong> etiketarik gabe, antzekoak taldekatzen ditu (bezero motak, musika-estiloak).</li>
      <li><strong>Errefortzu bidezkoa:</strong> sariak eta zigorrak jasoz ikasten du, probatuz (jokoak, robotak ibiltzen ikasten).</li>
    </ul>

    <h3>Ereduaren bizi-zikloa</h3>
    <ol>
      <li><strong>Datuak bildu</strong> eta etiketatu.</li>
      <li><strong>Prestatu:</strong> garbitu, ezaugarriak aukeratu (tamaina, kolorea).</li>
      <li><strong>Entrenatu</strong> eredua datuen zati handiarekin.</li>
      <li><strong>Ebaluatu</strong> sekula ikusi ez dituen <strong>proba-datuekin</strong>: zehaztasuna = asmatuak / guztiak.</li>
      <li><strong>Erabili</strong> eta datu berriekin hobetu.</li>
    </ol>

    <h3>Bi algoritmo sinple</h3>
    <p><strong>k auzokide hurbilenak (k-NN):</strong> adibide berri bat sailkatzeko, entrenamenduko k adibide antzekoenak bilatzen dira, eta gehiengoaren klasea ematen zaio. Ez du formularik ikasten: datuak gogoratzen ditu.</p>
    <p><strong>Neurona artifiziala:</strong> garun-neuronetan inspiratua. Sarrera bakoitza pisu batez biderkatzen du, batu, eta atalase bat gainditzen bada «pizten» da.</p>
    ${NEURONA}
    <div class="worked">
      <h4>Adibidea: neurona batek erabaki</h4>
      <p>x₁ = tamaina = 0,7 eta x₂ = kolorea = 0,8 (0–1 tartean). Pisuak: w₁ = 0,5, w₂ = 1,5 eta b = −1. Irteera 1 (laranja) batura 0 baino handiagoa bada.</p>
      <ol><li>s = 0,7 · 0,5 + 0,8 · 1,5 − 1</li><li>s = 0,35 + 1,2 − 1 = 0,55</li><li>0,55 &gt; 0 → y = 1</li></ol>
      <p class="ans">Laranja. Entrenatzean, akats bakoitzarekin pisuak pixka bat aldatzen dira.</p>
    </div>
    <p><strong>Sare neuronalak</strong> milaka edo milioika neurona dituzte, geruzatan antolatuta. Geruza askorekin, <strong>ikasketa sakona</strong> (<em>deep learning</em>) deitzen zaio: irudiak, ahotsa eta hizkuntza-eredu handiak (txatbotak) horrela egiten dira.</p>

    <h3>Arriskuak eta etika</h3>
    <ul>
      <li><strong>Alborapena:</strong> datuek errealitatea gaizki islatzen badute, ereduak akats horiek errepikatzen ditu. Aurpegi-sistema batek, pertsona talde batzuen argazki gutxirekin entrenatuta, akats gehiago egiten ditu haiekin.</li>
      <li><strong>Pribatutasuna:</strong> ereduak datu pertsonalekin entrenatzen dira askotan.</li>
      <li><strong>Desinformazioa:</strong> irudi, ahots eta bideo faltsuak (<em>deepfake</em>).</li>
      <li><strong>Gardentasuna:</strong> sare handi batek zergatik erabaki duen jakitea zaila da.</li>
      <li><strong>Energia eta lana:</strong> eredu handiak entrenatzeak energia asko kontsumitzen du; lanbide batzuk aldatu egingo dira.</li>
    </ul>
    <p>Europar Batasunaren <strong>AA Legeak</strong> (2024) arriskuaren arabera sailkatzen ditu sistemak, eta arrisku handikoei (hezkuntza, osasuna, enplegua) baldintza zorrotzak ezartzen dizkie.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> mugikorrak zure aurpegiaren argazki asko hartzen ditu, eta aurpegia beste aurpegi askotatik bereizten ikasi duen sare neuronal batek zenbaki-multzo bat ateratzen du (aurpegiaren «hatz-marka»). Desblokeatzean, kamerako aurpegiaren zenbakiak gordetakoekin konparatzen dira. Arauak ez dira eskuz idazten: milioika adibidetik ikasi dira.</p>

    <details class="sakondu" data-maila="2"><summary>Gainegokitzea: buruz ikastea ez da ulertzea</summary><div class="in">
      <p>Eredu batek entrenamenduko datuak «buruz» ikas ditzake, zarata eta guzti: entrenamenduan ia % 100 asmatzen du, baina datu berriekin huts egiten du. Horri <strong>gainegokitzea</strong> (<em>overfitting</em>) deitzen zaio. k-NN-n, k = 1 erabiltzean gertatzen da askotan.</p>
      <p>Horregatik, beti gordetzen da datuen zati bat <strong>probarako</strong>, ereduak sekula ikusi ez duena, benetako zehaztasuna neurtzeko.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Pertzeptroiaren ikasketa-araua</summary><div class="in">
      <p>Entrenamenduko adibide bakoitzeko: iragarpena y kalkulatu, benetako etiketarekin t konparatu, eta pisuak zuzendu:</p>
      <div class="formula">wᵢ ← wᵢ + η · (t − y) · xᵢ &nbsp;&nbsp;·&nbsp;&nbsp; b ← b + η · (t − y)<small>η ikasteko abiadura · asmatzen badu (t = y), ez da ezer aldatzen</small></div>
      <p>Datuak lerro zuzen batekin bereiz badaitezke, pertzeptroiak beti aurkitzen du muga. Bestela (EDO-B problema bezala), geruza gehiagoko sareak behar dira.</p>
    </div></details>`,

  ariketak: ['ia-zehaztasuna', 'neurona'],

  galdetegia: nahastu([
    { g: 'Zein da ikasketa automatikoaren ideia nagusia?', a: ['Sistemak datu eta adibideetatik ikastea, arauak eskuz programatu gabe', 'Ordenagailuak azkarrago egitea', 'Programak blokeekin idaztea', 'Datuak ezabatzea'], z: 0, zergatik: 'Adibideetatik eredu bat eraikitzen da.' },
    { g: 'Sagarren eta laranjen argazki etiketatuekin entrenatzea, zer ikasketa mota da?', a: ['Gainbegiratua', 'Gainbegiratu gabea', 'Errefortzu bidezkoa', 'Ez da ikasketa'], z: 0, zergatik: 'Adibide bakoitzak bere etiketa du.' },
    { g: 'Zergatik gordetzen dira datu batzuk probarako, entrenatzeko erabili gabe?', a: ['Ereduak sekula ikusi ez dituen datuekin benetako zehaztasuna neurtzeko', 'Memoria aurrezteko', 'Entrenamendua azkarragoa izateko', 'Ez dira gordetzen'], z: 0, zergatik: 'Entrenamenduko datuekin neurtuta, emaitza baikorregia da.' },
    { g: 'k-NN algoritmoan k = 3 bada, nola sailkatzen da puntu berri bat?', a: ['3 adibide hurbilenen gehiengoaren klasearekin', 'Lehen 3 adibideekin', '3 aldiz entrenatuz', 'Ausaz'], z: 0, zergatik: 'Auzokide hurbilenek bozkatzen dute.' },
    { g: 'Eredu batek 50 proba-adibidetik 45 asmatzen ditu. Zein da zehaztasuna?', a: ['% 90', '% 45', '% 95', '% 10'], z: 0, zergatik: '45 / 50 = 0,9.' },
    { g: 'Neurona artifizial batean, zer egiten dute pisuek?', a: ['Sarrera bakoitzaren garrantzia adierazten dute', 'Irteera gordetzen dute', 'Neurona elikatzen dute', 'Datuak ezabatzen dituzte'], z: 0, zergatik: 'Sarrera bakoitza bere pisuaz biderkatzen da.' },
    { g: 'Zer da AA sistema baten alborapena?', a: ['Datu desorekatuen ondorioz talde batzuekin akats gehiago egitea', 'Sistema azkarregia izatea', 'Entrenamendu luzea', 'Pisu negatiboak izatea'], z: 0, zergatik: 'Ereduak datuetako desorekak ikasten eta errepikatzen ditu.' },
    { g: 'Zer da gainegokitzea (overfitting)?', a: ['Ereduak entrenamenduko datuak buruz ikastea, eta datu berriekin huts egitea', 'Datu gutxiegi izatea', 'Eredua sinpleegia izatea', 'Proba-datuak ez izatea'], z: 0, maila: 2, zergatik: 'Entrenamenduan ondo, baina orokortzen ez du ondo egiten.' },
    { g: 'Pertzeptroiaren arauan, zer gertatzen da pisuekin iragarpena zuzena denean?', a: ['Ez dira aldatzen', 'Bikoiztu egiten dira', 'Zerora itzultzen dira', 'Ausaz aldatzen dira'], z: 0, maila: 3, zergatik: 't − y = 0 denez, zuzenketa zero da.' }
  ])
};
