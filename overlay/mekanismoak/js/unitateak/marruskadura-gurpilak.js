// Transmisioa: marruskadura-gurpilak
export default {
  izena: 'Marruskadura-gurpilak',
  galdera: 'Disko-jogailu zahar batean edo bizikleta-dinamo batean ez dago ez hortzik ez uhalik: gurpil batek bestea ukitzen du, eta horrekin nahikoa da. Nola?',

  ikusi: {
    sim: 'uhala',
    aukerak: { mode: 'gurpilak', modes: ['gurpilak'] },
    proba: '<b>Proba:</b> jarri D₁ = 10 cm eta D₂ = 20 cm. Zenbat rpm ditu bigarrenak? Zein noranzkotan biratzen du? Aldatu D₁ D₂ baino handiagoa izan dadin: zer gertatzen da?'
  },

  ulertu: () => `
    <h3>Zer dira?</h3>
    <p class="def"><strong>Marruskadura-gurpilak</strong> elkar ukitzen duten bi gurpil dira. Eragileak biratzean, <strong>marruskadurak</strong> bestea biratzen du. Transmisio-sistemarik sinpleena da.</p>
    <ul>
      <li><strong>Kontrako noranzkoan</strong> biratzen dute (engranajeek bezala).</li>
      <li><strong>Irrist egin dezakete:</strong> indar txikiak transmititzeko bakarrik balio dute.</li>
      <li>Gainazalak <strong>kautxuzkoak</strong> edo zimurrak izaten dira, marruskadura handitzeko.</li>
      <li>Isilak eta merkeak dira, eta ez dute koipeztatu behar.</li>
    </ul>

    <h3>Transmisio-erlazioa</h3>
    <p>Ukipen-puntuan bi gurpilek abiadura lineal bera dute (irristatu ezean). Horregatik, uhalen formula bera betetzen da:</p>
    <div class="formula">N₁ · D₁ = N₂ · D₂<small>i = N₂ / N₁ = D₁ / D₂</small></div>
    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>5 cm-ko gurpil batek 1200 rpm-ra biratzen du eta 15 cm-ko beste bat ukitzen du. Zein da bigarrenaren abiadura?</p>
      <ol><li>N₂ = N₁ · D₁ / D₂ = 1200 · 5 / 15 = 400 rpm</li></ol>
      <p class="ans">400 rpm, kontrako noranzkoan.</p>
    </div>

    <h3>Alderaketa</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Marruskadura-gurpilak</th><th>Uhala</th><th>Engranajeak</th></tr></thead>
      <tbody>
        <tr><td>Noranzkoa</td><td>Kontrakoa</td><td>Bera</td><td>Kontrakoa</td></tr>
        <tr><td>Irrist egiten du?</td><td>Bai</td><td>Bai</td><td>Ez</td></tr>
        <tr><td>Indarrak</td><td>Txikiak</td><td>Ertainak</td><td>Handiak</td></tr>
        <tr><td>Ardatzen distantzia</td><td>Oso txikia (ukitzen)</td><td>Handia</td><td>Txikia</td></tr>
      </tbody>
    </table></div>

    <h3>Aplikazioak</h3>
    <ul>
      <li>Bizikleta-dinamoa (gurpilak dinamoaren buru txikia biratzen du)</li>
      <li>Disko-jogailuak eta kaseteak</li>
      <li>Inprimagailuen arrabolak eta paper-sarrerak</li>
      <li>Ijezketa-makinak eta zenbait jostailu</li>
    </ul>`,

  ariketak: ['marruskadura'],

  galdetegia: [
    { g: 'Nola biratzen dute bi marruskadura-gurpilek?', a: ['Noranzko berean', 'Kontrako noranzkoan', 'Bata geldi dago', 'Beti abiadura berean'], z: 1,
      zergatik: 'Ukipen-puntuan elkar bultzatzen dute, engranajeek bezala: kontrako noranzkoan.' },
    { g: 'Zergatik ez dira erabiltzen indar handiak transmititzeko?', a: ['Zaratatsuak direlako', 'Irrist egiten dutelako', 'Oso garestiak direlako', 'Hortz gehiegi dituztelako'], z: 1,
      zergatik: 'Marruskaduraz transmititzen dute; indarra handiegia bada, irristatu egiten dute.' },
    { g: '8 cm-ko gurpil batek (900 rpm) 24 cm-ko bat ukitzen du. Zenbat rpm ditu bigarrenak?', a: ['2700 rpm', '300 rpm', '900 rpm', '112,5 rpm'], z: 1,
      zergatik: 'N₂ = 900 · 8 / 24 = 300 rpm.' }
  ]
};
