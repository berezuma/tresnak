export default {
  izena: 'Potentzia eta energia',
  galdera: 'Zergatik kontsumitzen du labe batek LED bonbilla batek baino askoz gehiago? Eta nola kalkulatzen da argiaren faktura?',

  ikusi: {
    sim: 'etxea',
    proba: 'Piztu <b>labea</b> eta <b>berogailua</b> aldi berean: potentzia kontratatua gainditzen duzu? Aldatu erabilera-orduak eta ikusi zein aparailuk kostatzen duen gehien hilean. Zer aldatzen da prezioa 0,30 €/kWh denean?'
  },

  ulertu: () => `
    <h3>Potentzia elektrikoa</h3>
    <p class="def"><strong>Potentzia</strong> aparailu batek energia zein abiaduratan kontsumitzen (edo bihurtzen) duen da: denbora-unitateko energia. Unitatea <strong>watta (W)</strong> da; 1 kW = 1000 W.</p>
    <div class="formula">P = V · I<small>potentzia = tentsioa · intentsitatea</small></div>
    <dl class="where">
      <dt>P</dt><dd>potentzia, wattetan (W)</dd>
      <dt>V</dt><dd>tentsioa, voltetan (V)</dd>
      <dt>I</dt><dd>intentsitatea, amperetan (A)</dd>
    </dl>
    <p>Aparailuen ezaugarri-plakan tentsioa eta potentzia adierazten dira. Adibidez, <strong>230 V · 2000 W</strong> berogailu batek I = P / V = 2000 / 230 ≈ <strong>8,7 A</strong> kontsumitzen ditu.</p>

    <h3>Energia elektrikoa</h3>
    <p class="def"><strong>Energia</strong> potentzia bider denbora da. Nazioarteko sisteman joule (J) da, baina argindarraren fakturan <strong>kilowatt-ordua (kWh)</strong> erabiltzen da.</p>
    <div class="formula">E = P · t<small>kW · h = kWh &nbsp;·&nbsp; W · s = J &nbsp;·&nbsp; 1 kWh = 3 600 000 J</small></div>
    <div class="worked">
      <h4>Adibidea: faktura</h4>
      <p>2000 W-eko berogailua egunean 3 orduz piztuta, 30 egunez, argindarra 0,20 €/kWh-an.</p>
      <ol>
        <li>P = 2000 W = 2 kW</li>
        <li>E = 2 kW · 3 h · 30 egun = 180 kWh</li>
        <li>Kostua = 180 kWh · 0,20 €/kWh</li>
      </ol>
      <p class="ans">36 € hilean</p>
    </div>

    <h3>Joule efektua</h3>
    <p>Korrontea eroale batetik igarotzean, eroalea <strong>berotu</strong> egiten da: energia elektrikoaren zati bat bero bihurtzen da. Hori da <strong>Joule efektua</strong>. Berogailuetan, labeetan eta txigorgailuetan erabilgarria da; kableetan eta motorretan, berriz, galera bat da.</p>

    <h3>Potentzia kontratatua</h3>
    <p>Etxe bakoitzak potentzia maximo bat kontratatzen du (adibidez 4,6 kW). Aldi berean piztutako aparailuen potentzia hori baino handiagoa bada, <strong>potentzia kontrolatzeko etengailu automatikoak</strong> (IKP) korrontea mozten du.</p>
    <p class="note">Aurrezteko: LED bonbillak erabili (bonbilla goriek baino % 85 gutxiago kontsumitzen dute), A klase energetikoko aparailuak aukeratu, eta stand-by moduan dauden aparailuak itzali.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> labeak (2200 W) LED batek (9 W) baino 240 aldiz potentzia handiagoa du; ordu berean 240 aldiz energia gehiago kontsumitzen du. Faktura kWh-tan kalkulatzen da: potentzia (kW) · orduak · prezioa.</p>

    <details class="sakondu" data-maila="2"><summary>Potentzia Ohm-en legearekin: P = I² · R eta P = V² / R</summary><div class="in">
      <p>P = V · I eta V = I · R konbinatuz, potentzia beste bi modutan idatz daiteke:</p>
      <div class="formula">P = I² · R &nbsp;&nbsp;&nbsp; P = V² / R</div>
      <p>Lehenak Joule efektuaren beroa kalkulatzeko balio du: korrontea bikoiztean, beroa <strong>laukoiztu</strong> egiten da. Horregatik behar dituzte aparailu indartsuek kable lodiagoak.</p>
      <div class="worked">
        <h4>Adibidea: bonbillaren erresistentzia</h4>
        <p>12 V · 6 W bonbilla bat: R = V² / P = 144 / 6 = <strong>24 Ω</strong>. 6 V-ra konektatzen badugu: P = 6² / 24 = <strong>1,5 W</strong> (laurdena).</p>
      </div>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Zergatik garraiatzen da energia goi-tentsioan?</summary><div class="in">
      <p>Zentral batek 10 MW garraiatu nahi ditu 5 Ω-eko linea batean. Linean galtzen den potentzia P<sub>galera</sub> = I² · R da, eta I = P / V:</p>
      <div class="table-scroll"><table class="tbl">
        <thead><tr><th>Garraio-tentsioa</th><th>Korrontea</th><th>Galerak (I² · R)</th></tr></thead>
        <tbody>
          <tr><td>20 kV</td><td>500 A</td><td>1 250 000 W (% 12,5)</td></tr>
          <tr><td>400 kV</td><td>25 A</td><td>3125 W (% 0,03)</td></tr>
        </tbody>
      </table></div>
      <p>Tentsioa 20 aldiz handitzean, korrontea 20 aldiz txikitzen da eta galerak <strong>400 aldiz</strong>. Horregatik igotzen da tentsioa transformadoreekin garraiatzeko, eta jaisten da kontsumitzeko.</p>
    </div></details>`,

  ariketak: ['potentzia', 'energia', 'bonbilla'],

  galdetegia: [
    { g: 'Zein da potentziaren unitatea?', a: ['Watta (W)', 'Joulea (J)', 'Kilowatt-ordua (kWh)', 'Volta (V)'], z: 0, zergatik: 'Potentzia wattetan neurtzen da. Joulea eta kWh energia-unitateak dira.' },
    { g: 'Nola kalkulatzen da potentzia elektrikoa?', a: ['P = V · I', 'P = V / I', 'P = I · R', 'P = V · R'], z: 0, zergatik: 'Potentzia = tentsioa bider intentsitatea.' },
    { g: 'Zer magnitude neurtzen da kWh-tan?', a: ['Energia', 'Potentzia', 'Intentsitatea', 'Denbora'], z: 0, zergatik: 'kW · h = energia. Fakturan kontsumitutako energia ordaintzen da.' },
    { g: '1000 W-eko aparailu bat 2 orduz piztuta. Zenbat energia?', a: ['2000 kWh', '2 kWh', '500 kWh', '0,5 kWh'], z: 1, zergatik: 'E = 1 kW · 2 h = 2 kWh.' },
    { g: 'Zer da Joule efektua?', a: ['Korronteak eroaleak berotzea', 'Pilak kargatzea', 'Motorrak biratzea', 'Argia islatzea'], z: 0, zergatik: 'Korrontea igarotzean energia elektrikoaren zati bat bero bihurtzen da.' },
    { g: 'Zer gertatzen da aldi berean piztutako aparailuen potentzia kontratatua baino handiagoa denean?', a: ['Etengailu automatikoak korrontea mozten du', 'Tentsioa igo egiten da', 'Aparailuek potentzia gutxiagorekin funtzionatzen dute', 'Ez da ezer gertatzen'], z: 0, zergatik: 'Potentzia kontrolatzeko etengailuak (IKP) instalazioa deskonektatzen du.' },
    { g: 'Erresistentzia batetik igarotzen den korrontea bikoizten bada, Joule efektuaren potentzia:', a: ['Bikoiztu egiten da', 'Laukoiztu egiten da', 'Erdira jaisten da', 'Ez da aldatzen'], z: 1, maila: 2, zergatik: 'P = I² · R: I bikoitza → P lau aldiz handiagoa.' },
    { g: 'Zergatik garraiatzen da energia elektrikoa goi-tentsioan?', a: ['Korrontea txikiagoa denez, Joule galerak (I² · R) askoz txikiagoak direlako', 'Goi-tentsioak energia gehiago sortzen duelako', 'Kableen erresistentzia handitzen delako', 'Arriskua gutxitzeko'], z: 0, maila: 3, zergatik: 'Potentzia berarekin V handia → I txikia → galerak I²-ren proportzionalak.' }
  ]
};
