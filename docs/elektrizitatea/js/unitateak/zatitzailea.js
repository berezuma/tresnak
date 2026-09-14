import { R, Sr, eskemaSVG, ebatzi } from '../eskema.js';

const tree = Sr(R('R1', 10), R('R2', 20));

export default {
  izena: 'Tentsio-zatitzailea',
  galdera: 'Nola jakiten du farola automatiko batek noiz iluntzen den?',

  ikusi: {
    sim: 'zatitzailea',
    proba: 'Bi erresistentzia berdinekin, zenbat da irteera? Mugitu <b>potentziometroa</b> muturretik muturrera. <b>LDR</b> moduan, jaitsi argia pixkanaka: zein lux-etan pizten da farola?'
  },

  ulertu: () => `
    <p class="def"><strong>Tentsio-zatitzailea</strong> seriean dauden bi erresistentziaz osatutako zirkuitua da. Haietako baten muturretan pilaren tentsioaren <strong>zati bat</strong> lortzen da.</p>
    <p>Seriean korronte bera igarotzen denez, I = E / (R₁ + R₂). R₂-ren tentsioa V = I · R₂ da:</p>
    <div class="formula">V<sub>irteera</sub> = E · R₂ / (R₁ + R₂)</div>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>12 V-ko pila; R₁ = 10 Ω eta R₂ = 20 Ω.</p>
      <div class="diagram" style="max-width:330px">${eskemaSVG(tree, { E: 12, emaitzak: ebatzi(tree, 12) })}</div>
      <ol><li>V = 12 · 20 / (10 + 20)</li><li>V = 240 / 30</li></ol>
      <p class="ans">V<sub>irteera</sub> = 8 V (R₁-ek beste 4 V hartzen ditu)</p>
    </div>
    <ul>
      <li>R₁ = R₂ bada, irteera pilaren <strong>erdia</strong> da.</li>
      <li>R₂ R₁ baino handiagoa bada, tentsioaren zati <strong>handiagoa</strong> hartzen du.</li>
      <li>Irteera ez da inoiz pilaren tentsioa baino handiagoa.</li>
    </ul>

    <h3>Potentziometroa</h3>
    <p><strong>Potentziometroa</strong> hiru terminaleko erresistentzia bat da: bi mutur finko eta erdiko kontaktu mugikor bat (kurtsorea). Kurtsorea mugitzean, R₁ eta R₂ aldatzen dira, baina haien batura berdina da. Irteerako tentsioa 0 V-tik E-raino alda daiteke.</p>
    <p>Erabilerak: bolumen-kontrolak, argi-erregulagailuak, joystickak, autoko pedalen sentsoreak.</p>

    <h3>Sentsoreak zatitzaileetan</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Sentsorea</th><th>Zer aldatzen du bere erresistentzia</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td><strong>LDR</strong> (fotoerresistentzia)</td><td>Argia: zenbat eta argi gehiago, orduan eta erresistentzia txikiagoa</td><td>Farolak, gaueko argiak</td></tr>
        <tr><td><strong>NTC</strong> termistorea</td><td>Tenperatura: berotzean erresistentzia jaitsi</td><td>Termostatoak, termometro digitalak</td></tr>
        <tr><td><strong>PTC</strong> termistorea</td><td>Tenperatura: berotzean erresistentzia igo</td><td>Motorren babesa</td></tr>
      </tbody>
    </table></div>
    <p>Sentsorea zatitzaile batean jartzean, erresistentziaren aldaketa <strong>tentsio-aldaketa</strong> bihurtzen da, eta hori txip batek (Arduino, adibidez) edo transistore batek irakur dezake.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> farolak LDR bat du zatitzaile batean. Iluntzean LDRaren erresistentzia handitzen da, irteerako tentsioa igo egiten da, eta muga bat gainditzean zirkuitu batek argia pizten du.</p>

    <details class="sakondu" data-maila="3"><summary>Karga-efektua eta Thévenin-en baliokidea</summary><div class="in">
      <p>Zatitzailearen irteeran karga bat (R<sub>L</sub>) konektatzen bada, R₂-rekin paraleloan geratzen da eta irteerako tentsioa <strong>jaitsi</strong> egiten da: V = E · (R₂ ∥ R<sub>L</sub>) / (R₁ + R₂ ∥ R<sub>L</sub>). Simulagailuan, Batxilergoko mailan, karga konekta dezakezu.</p>
      <p>Irteeratik begiratuta, zatitzailea sorgailu erreal baten baliokidea da (<strong>Thévenin-en teorema</strong>):</p>
      <div class="formula">V<sub>th</sub> = E · R₂ / (R₁ + R₂) &nbsp;&nbsp;&nbsp; R<sub>th</sub> = R₁ ∥ R₂</div>
      <p>Karga-efektua txikia izateko, R<sub>L</sub> R<sub>th</sub> baino askoz handiagoa izan behar da (10 aldiz gutxienez).</p>
    </div></details>`,

  ariketak: ['zatitzailea'],

  galdetegia: [
    { g: 'Tentsio-zatitzaile batean R₁ = R₂ bada, irteerako tentsioa:', a: ['Pilaren erdia', 'Pilaren bikoitza', 'Pilaren berdina', 'Zero'], z: 0, zergatik: 'V = E · R / 2R = E / 2.' },
    { g: '12 V-ko pila, R₁ = 10 Ω eta R₂ = 20 Ω. Zenbat da R₂-ren tentsioa?', a: ['4 V', '6 V', '8 V', '12 V'], z: 2, zergatik: 'V = 12 · 20 / 30 = 8 V.' },
    { g: 'Zer da potentziometroa?', a: ['Erdiko kontaktu mugikorra duen erresistentzia', 'Tentsioa neurtzeko tresna', 'Pila mota bat', 'Etengailu bat'], z: 0, zergatik: 'Hiru terminal ditu, eta kurtsoreak erresistentzia bi zatitan banatzen du.' },
    { g: 'LDR batean argi gehiago jasotzean, bere erresistentzia:', a: ['Jaitsi egiten da', 'Igo egiten da', 'Ez da aldatzen', 'Infinitu bihurtzen da'], z: 0, zergatik: 'Fotoerresistentzia da: argiak eroankortasuna handitzen du.' },
    { g: 'Zatitzaile batean R₂ handitzen bada (R₁ berdin), R₂-ren tentsioa:', a: ['Handitu egiten da', 'Txikitu egiten da', 'Ez da aldatzen', 'Pilarena baino handiagoa bihurtzen da'], z: 0, zergatik: 'Tentsioaren zati handiagoa hartzen du, baina inoiz ez E baino gehiago.' },
    { g: 'Irteeran karga bat konektatzean, irteerako tentsioa:', a: ['Jaitsi egiten da, karga R₂-rekin paraleloan dagoelako', 'Igo egiten da', 'Ez da aldatzen', 'Pilaren tentsioa bihurtzen da'], z: 0, maila: 3, zergatik: 'R₂ ∥ R_L < R₂: zatitzailearen beheko erresistentzia txikiagoa da.' }
  ]
};
