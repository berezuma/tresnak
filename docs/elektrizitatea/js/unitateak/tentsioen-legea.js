import { begiztaSVG } from '../eskema.js';

export default {
  izena: 'Tentsioen legea (begiztak)',
  galdera: 'Mendi-ibilaldi batean irten zinen puntura itzultzen bazara, zenbat igo eta jaitsi duzu, guztira?',

  ikusi: {
    sim: 'laborategia',
    aukerak: { adibidea: 'kirchhoff', adibideak: ['seriea-r', 'kirchhoff', 'mistoa', 'zubia'], tresna: 'begizta', balioak: true },
    proba: '<b>Begizta</b> tresna aukeratuta dago: sakatu puntuak banan-banan, osagaien gainetik, hasierako puntura itzuli arte. Potentzial-aldaketen batura zero da? Egin beste begizta bat eskuineko sarean, eta beste bat kanpoko biratik (bi pilak barne).'
  },

  ulertu: () => `
    <h3>Kirchhoff-en bigarren legea: tentsioen legea</h3>
    <p class="def">Zirkuitu bateko edozein <strong>begizta itxitan</strong>, potentzial-aldaketen batura zero da: sorgailuek igotzen dutena hartzaileek jaisten dute.</p>
    <div class="formula">ΣΔV = 0 &nbsp;&nbsp; ⇔ &nbsp;&nbsp; ΣE = Σ(I · R)</div>
    <p>Legea <strong>energiaren kontserbazioaren</strong> ondorioa da. Karga batek begizta osoa egin eta hasierako puntura itzultzean, potentzial berean dago: irabazitako eta galdutako energia berdinak dira.</p>

    <h3>Zeinuen irizpidea</h3>
    <p>Aukeratu ibilbidearen noranzko bat (adibidez, erlojuaren orratzena) eta batu elementu bakoitzeko aldaketa:</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Elementua</th><th>Nola zeharkatzen den</th><th>ΔV</th></tr></thead>
      <tbody>
        <tr><td>Sorgailua</td><td>− bornatik + bornara</td><td><strong>+E</strong></td></tr>
        <tr><td>Sorgailua</td><td>+ bornatik − bornara</td><td><strong>−E</strong></td></tr>
        <tr><td>Erresistentzia</td><td>korrontearen noranzkoan</td><td><strong>−I · R</strong></td></tr>
        <tr><td>Erresistentzia</td><td>korrontearen kontra</td><td><strong>+I · R</strong></td></tr>
      </tbody>
    </table></div>

    <div class="worked">
      <h4>Adibidea: bi pila aurrez aurre</h4>
      <div class="diagram" style="max-width:380px">${begiztaSVG([{ mota: 'E', izena: 'E₁', testua: '12 V' }, { mota: 'R', izena: 'R₁', testua: '4 Ω' }, { mota: 'E', izena: 'E₂', testua: '6 V' }, { mota: 'R', izena: 'R₂', testua: '2 Ω' }])}</div>
      <p>Bi pilek + borna goian dute: kontrako noranzkoan bultzatzen dute. E₁ handiagoa denez, korrontea erlojuaren orratzen noranzkoan doa.</p>
      <ol>
        <li>Ibilbidea (erlojuaren orratzen noranzkoan, beheko ezkerreko izkinatik): +E₁ − I·R₁ − E₂ − I·R₂ = 0</li>
        <li>12 − 4I − 6 − 2I = 0 → 6 = 6I</li>
        <li>I = 1 A; V₁ = 4 V eta V₂ = 2 V</li>
        <li>Egiaztatu: +12 − 4 − 6 − 2 = 0 ✓</li>
      </ol>
      <p class="ans">E₂ kargatzen ari da: korrontea bere + bornatik sartzen zaio.</p>
    </div>

    <h3>Seriearen legea, berriro</h3>
    <p>Seriezko zirkuitu batean V = V₁ + V₂ + V₃ esan genuen: begizta bakarreko tentsioen legea da.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> hasierako puntura itzultzean, altuera-aldaketen batura zero da: igo duzuna jaitsi duzu. Potentziala altueraren antzekoa da: pilak "igotzen" du, erresistentziek "jaisten" dute, eta bira osoan batura zero da.</p>`,

  ariketak: ['kvl'],

  galdetegia: [
    { g: 'Zer dio Kirchhoff-en tentsioen legeak?', a: ['Begizta itxi batean potentzial-aldaketen batura zero da', 'Nodo batean korronteen batura zero da', 'Tentsioa korrontearen proportzionala da', 'Paraleloan tentsioa banatzen da'], z: 0, zergatik: 'ΣΔV = 0 edozein begizta itxitan.' },
    { g: 'Zer printzipiotan oinarritzen da tentsioen legea?', a: ['Energiaren kontserbazioan', 'Kargaren kontserbazioan', 'Ohm-en legean', 'Masaren kontserbazioan'], z: 0, zergatik: 'Hasierako puntura itzultzean karga potentzial berean dago: energia-balantzea zero.' },
    { g: 'Sorgailu bat − bornatik + bornara zeharkatzean, potentzial-aldaketa:', a: ['+E', '−E', '0', '−I·R'], z: 0, zergatik: 'Sorgailuak potentziala igotzen du − bornatik + bornara.' },
    { g: 'Erresistentzia bat korrontearen noranzkoan zeharkatzean:', a: ['Potentziala I·R jaisten da', 'Potentziala I·R igotzen da', 'Ez da aldatzen', 'Potentziala E igotzen da'], z: 0, zergatik: 'Korrontea potentzial altutik baxura doa erresistentzia batean.' },
    { g: '12 V-ko pila bat eta hiru erresistentzia seriean. Bi erresistentziek 3 V eta 5 V dituzte. Hirugarrenak:', a: ['4 V', '8 V', '20 V', '2 V'], z: 0, zergatik: '12 − 3 − 5 = 4 V.' },
    { g: 'Begizta batean E₁ = 9 V eta E₂ = 3 V aurrez aurre daude, eta erresistentzia bakarra R = 2 Ω. Korrontea:', a: ['3 A', '6 A', '4,5 A', '1,5 A'], z: 0, zergatik: '9 − 3 = 2 · I → I = 3 A.' },
    { g: 'Begizta batean pila bat + bornatik − bornara zeharkatzen bada eta korrontea bertatik noranzko horretan igarotzen bada, pila:', a: ['Kargatzen ari da (energia hartzen du)', 'Energia ematen ari da', 'Zirkuitulaburrean dago', 'Ez du funtziorik'], z: 0, zergatik: 'Korrontea + bornatik sartzen zaio: energia jasotzen du (bateria bat kargatzean bezala).' }
  ]
};
