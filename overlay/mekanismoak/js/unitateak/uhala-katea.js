// Transmisioa: uhal-transmisioa eta kate-transmisioa
export default {
  izena: 'Uhala eta katea',
  galdera: 'Bizikletaren pedalak eta atzeko gurpila metro erdi batera daude, eta ez dago engranajerik haien artean. Nola heltzen da hanken indarra gurpilera?',

  ikusi: {
    sim: 'uhala',
    proba: '<b>Proba:</b> uhal zuzenean jarri D₁ = 10 cm eta D₂ = 30 cm: zenbat rpm ditu irteerak? Aldatu <b>Uhal gurutzatura</b>: zer aldatzen da? <b>Katean</b>, zein plater eta pinoirekin ematen ditu gurpilak bira gehien pedal-bira bakoitzeko?'
  },

  ulertu: ({ fig }) => `
    <h3>Uhal-transmisioa</h3>
    <p class="def">Bi polea edo gehiago <strong>uhal</strong> batez lotzen dira. Uhalaren eta polearen arteko <strong>marruskadurak</strong> transmititzen du higidura.</p>
    ${fig('uhala', 'Uhal bidezko transmisioa motor batean.')}
    <ul>
      <li><strong>Distantzia handiak:</strong> elkarrengandik urrun dauden ardatzak lotzen ditu.</li>
      <li><strong>Isila eta malgua:</strong> kolpeak xurgatzen ditu.</li>
      <li><strong>Irrist egin dezake:</strong> karga handiegia bada, uhalak irristatu egiten du. Hori segurtasun-neurria ere bada, baina abiadura ez da zehatza.</li>
      <li><strong>Noranzkoa:</strong> uhal zuzenarekin noranzko bera; uhal <strong>gurutzatuarekin</strong>, kontrakoa.</li>
    </ul>
    <div class="formula">N₁ · D₁ = N₂ · D₂<small>D: polearen diametroa (edozein unitatetan, bi poleetan berdina)</small></div>
    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>1500 rpm-ko motor batek 10 cm-ko polea du, eta 30 cm-ko polea bat mugitzen du. Zein abiaduratan biratzen du?</p>
      <ol><li>N₂ = N₁ · D₁ / D₂ = 1500 · 10 / 30 = 500 rpm</li></ol>
      <p class="ans">500 rpm: polea txikiak handia mugitzen duenez, murriztailea da.</p>
    </div>

    <h3>Kate-transmisioa</h3>
    <p class="def">Bi <strong>hortzdun gurpil</strong> (platera eta pinoia) <strong>kate</strong> batez lotzen dira. Katearen mailak hortzetan sartzen dira.</p>
    ${fig('katea', 'Katea eta hortzdun gurpila.')}
    <ul>
      <li><strong>Ez du irrist egiten:</strong> abiadura zehatza eta indar handiak.</li>
      <li><strong>Noranzko bera:</strong> bi gurpilek noranzko berean biratzen dute.</li>
      <li><strong>Distantzia ertainak:</strong> engranajeekin baino urrunago.</li>
      <li><strong>Mantentze-lana:</strong> koipeztatu behar da eta zaratatsuagoa da.</li>
    </ul>
    <div class="formula">N₁ · Z₁ = N₂ · Z₂<small>Engranajeen formula bera: hortz-kopuruak agintzen du</small></div>

    <h3>Alderaketa</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Uhala</th><th>Katea</th><th>Engranajeak</th></tr></thead>
      <tbody>
        <tr><td>Irrist egiten du?</td><td>Bai</td><td>Ez</td><td>Ez</td></tr>
        <tr><td>Irteerako noranzkoa</td><td>Bera (gurutzatua: kontrakoa)</td><td>Bera</td><td>Kontrakoa</td></tr>
        <tr><td>Ardatzen arteko distantzia</td><td>Handia</td><td>Ertaina</td><td>Txikia</td></tr>
        <tr><td>Zarata</td><td>Isila</td><td>Ertaina</td><td>Zaratatsua</td></tr>
        <tr><td>Adibideak</td><td>Garbigailua, zutabe-zulagailua</td><td>Bizikleta, motozikleta</td><td>Erlojua, zulagailua</td></tr>
      </tbody>
    </table></div>`,

  ariketak: ['uhala-abiadura'],

  galdetegia: [
    { g: 'Zergatik ez da uhal-transmisio baten abiadura beti zehatza?', a: ['Uhalak irrist egin dezakeelako', 'Poleak biribilak direlako', 'Uhalak luzeegiak direlako', 'Zehatza da beti'], z: 0,
      zergatik: 'Marruskaduraz transmititzen du; karga handiegia bada, uhalak irristatu egiten du.' },
    { g: 'Uhal gurutzatu batekin, nola biratzen dute bi poleek?', a: ['Noranzko berean', 'Kontrako noranzkoan', 'Bata geldi dago', 'Abiadura berean beti'], z: 1,
      zergatik: 'Uhala gurutzatzean, bigarren poleak kontrako noranzkoan biratzen du.' },
    { g: '12 cm-ko polea batek (1200 rpm) 36 cm-ko bat mugitzen du. Zenbat rpm ditu bigarrenak?', a: ['3600 rpm', '400 rpm', '100 rpm', '1200 rpm'], z: 1,
      zergatik: 'N₂ = 1200 · 12 / 36 = 400 rpm.' },
    { g: 'Bizikleta batean, plateran 44 hortz eta pinoian 11. Pedal-bira bakoitzeko, zenbat bira ematen ditu gurpilak?', a: ['0,25', '4', '11', '44'], z: 1,
      zergatik: '44 / 11 = 4 bira. Transmisio biderkatzailea da.' }
  ]
};
