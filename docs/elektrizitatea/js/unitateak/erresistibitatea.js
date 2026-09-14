import { erresistentziaSVG, KOLOREAK } from '../eskema.js';

export default {
  izena: 'Erresistentzia eta materialak',
  galdera: 'Zergatik dira labe edo berogailu baten kableak mugikorraren kargagailuarenak baino askoz lodiagoak?',

  ikusi: {
    sim: 'haria',
    proba: 'Bikoiztu hariaren luzera: zer gertatzen zaio erresistentziari? Eta sekzioa bikoiztean? Konparatu <b>kobrea</b> eta <b>nikromoa</b> neurri berekin. Gero pasatu <b>Kolore-kodea</b> modura eta jokatu «Asmatu balioa».'
  },

  ulertu: () => `
    <h3>Zeren araberakoa da hari baten erresistentzia?</h3>
    <ul>
      <li><strong>Materiala:</strong> material batzuek beste batzuek baino errazago eroaten dute korrontea.</li>
      <li><strong>Luzera (L):</strong> zenbat eta luzeagoa, orduan eta erresistentzia handiagoa (proportzionala).</li>
      <li><strong>Sekzioa (S):</strong> zenbat eta lodiagoa, orduan eta erresistentzia txikiagoa (alderantziz proportzionala).</li>
    </ul>
    <div class="formula">R = ρ · L / S</div>
    <dl class="where">
      <dt>R</dt><dd>erresistentzia, ohmetan (Ω)</dd>
      <dt>ρ</dt><dd>erresistibitatea (materialaren ezaugarria), Ω·mm²/m-tan</dd>
      <dt>L</dt><dd>luzera, metrotan (m)</dd>
      <dt>S</dt><dd>sekzioa, mm²-tan</dd>
    </dl>
    <p class="def"><strong>Erresistibitatea (ρ)</strong> material bakoitzaren propietatea da: 1 m luze eta 1 mm²-ko sekzioa duen hari batek duen erresistentzia.</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Materiala</th><th>ρ (Ω·mm²/m, 20 °C)</th><th>Erabilera</th></tr></thead>
      <tbody>
        <tr><td>Zilarra</td><td>0,016</td><td>kontaktu bereziak</td></tr>
        <tr><td>Kobrea</td><td>0,017</td><td>kableak, bobinak</td></tr>
        <tr><td>Aluminioa</td><td>0,028</td><td>goi-tentsioko lineak (arina)</td></tr>
        <tr><td>Burdina</td><td>0,1</td><td>—</td></tr>
        <tr><td>Konstantana</td><td>0,5</td><td>neurketa-erresistentziak</td></tr>
        <tr><td>Nikromoa</td><td>1,1</td><td>berogailuak, txigorgailuak</td></tr>
      </tbody>
    </table></div>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>100 m-ko kobrezko kablea, 1,5 mm²-koa. Zein da haren erresistentzia?</p>
      <ol><li>R = ρ · L / S</li><li>R = 0,017 · 100 / 1,5</li></ol>
      <p class="ans">R ≈ 1,13 Ω</p>
    </div>

    <h3>Eroaleak, erdieroaleak eta isolatzaileak</h3>
    <p>Erresistibitate txikiko materialak <strong>eroaleak</strong> dira (metalak). Erresistibitate izugarri handikoak <strong>isolatzaileak</strong> (plastikoa, beira: milioika milioi aldiz handiagoa). Tartean <strong>erdieroaleak</strong> daude (silizioa, germanioa): haien erresistentzia tenperaturarekin, argiarekin edo beste material batzuk gehituta alda daiteke, eta horiekin egiten dira diodoak, transistoreak eta txipak.</p>

    <h3>Erresistentzia komertzialak: kolore-kodea</h3>
    <p>Zirkuitu elektronikoetako erresistentziek koloretako bandak dituzte. Lehen bi bandak digituak dira, hirugarrena biderkatzailea (zenbat zero), eta laugarrena tolerantzia.</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr>${KOLOREAK.map(([n, c]) => `<th style="text-align:center"><span style="display:inline-block;width:18px;height:18px;background:${c};border:1px solid var(--ink3);vertical-align:-4px"></span><br>${n}</th>`).join('')}</tr></thead>
      <tbody><tr>${KOLOREAK.map((_, i) => `<td style="text-align:center;font-weight:700">${i}</td>`).join('')}</tr></tbody>
    </table></div>
    <div class="worked">
      <h4>Adibidea: horia, morea, gorria, urrea</h4>
      <div class="diagram" style="max-width:320px">${erresistentziaSVG([4, 7, 2, 'urrea'], 300)}</div>
      <ol><li>Horia = 4, morea = 7 → 47</li><li>Gorria = × 100</li><li>Urrea = ±5 %</li></ol>
      <p class="ans">R = 4700 Ω = 4,7 kΩ ± 5 % (4465 Ω eta 4935 Ω artean)</p>
    </div>
    <p class="note">Erresistentziek <strong>potentzia nominala</strong> ere badute (1/4 W, 1/2 W…): potentzia hori gainditzen bada, gehiegi berotu eta hondatu egiten dira.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> labeak korronte handia kontsumitzen du (10 A inguru). Kable meheak erresistentzia handiagoa du eta, P = I² · R denez, gehiegi berotuko litzateke. Sekzio handiagoko kableak erresistentzia txikiagoa du, eta ez da berotzen.</p>

    <details class="sakondu" data-maila="3"><summary>Tenperatura eta Nazioarteko Sistemako unitateak</summary><div class="in">
      <p>Metaletan erresistibitatea tenperaturarekin handitzen da: R = R₂₀ · (1 + α · (T − 20)). Kobrean α ≈ 0,0039 °C⁻¹; konstantanan ia zero da, eta horregatik erabiltzen da neurketa zehatzetan. Simulagailuan, Batxilergoko mailan, tenperatura alda dezakezu.</p>
      <p>Nazioarteko Sisteman ρ Ω·m-tan ematen da: 1 Ω·mm²/m = 10⁻⁶ Ω·m. Kobrea: 1,7 · 10⁻⁸ Ω·m.</p>
      <p>Material batzuk tenperatura oso baxuetan <strong>supereroale</strong> bihurtzen dira: erresistentzia zero dute (MRI eskanerretako imanak, partikula-azeleragailuak).</p>
    </div></details>`,

  ariketak: ['erresistibitatea', 'kolore-kodea'],

  galdetegia: [
    { g: 'Hari baten luzera bikoizten bada (material eta sekzio berarekin), erresistentzia:', a: ['Bikoiztu egiten da', 'Erdira jaisten da', 'Ez da aldatzen', 'Laukoiztu egiten da'], z: 0, zergatik: 'R = ρ · L / S: R luzeraren proportzionala da.' },
    { g: 'Hari baten sekzioa bikoizten bada, erresistentzia:', a: ['Bikoiztu egiten da', 'Erdira jaisten da', 'Ez da aldatzen', 'Laukoiztu egiten da'], z: 1, zergatik: 'R sekzioaren alderantziz proportzionala da.' },
    { g: 'Zein materialek du erresistibitate txikiena?', a: ['Kobrea', 'Nikromoa', 'Burdina', 'Konstantana'], z: 0, zergatik: 'Kobrearen ρ = 0,017 Ω·mm²/m da, zerrendako txikiena.' },
    { g: 'Zergatik egiten dira berogailuen erresistentziak nikromoz?', a: ['Erresistibitate handia duelako eta tenperatura altuak jasaten dituelako', 'Oso eroale ona delako', 'Merkeena delako', 'Isolatzailea delako'], z: 0, zergatik: 'Erresistibitate handiarekin hari labur batek erresistentzia nahikoa du beroa sortzeko, eta ez da oxidatzen.' },
    { g: 'Marroia, beltza, gorria koloreak dituen erresistentzia batek balio du:', a: ['102 Ω', '1000 Ω', '100 Ω', '10 000 Ω'], z: 1, zergatik: 'Marroia 1, beltza 0 → 10; gorria × 100 → 1000 Ω.' },
    { g: 'Zer adierazten du erresistentzia baten laugarren bandak (urrea edo zilarra)?', a: ['Tolerantzia', 'Potentzia', 'Tentsio maximoa', 'Materiala'], z: 0, zergatik: 'Urrea ±5 %, zilarra ±10 %: balio errealaren tartea.' },
    { g: 'Nola aldatzen da metal baten erresistentzia berotzean?', a: ['Handitu egiten da', 'Txikitu egiten da', 'Ez da aldatzen', 'Zero bihurtzen da'], z: 0, maila: 3, zergatik: 'R = R₂₀ (1 + α ΔT), α positiboa metaletan.' }
  ]
};
