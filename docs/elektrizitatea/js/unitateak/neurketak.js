export default {
  izena: 'Neurketak: polimetroa',
  galdera: 'Zergatik fundi daiteke polimetroaren fusiblea korrontea neurtzen ari garela?',

  ikusi: {
    sim: 'polimetroa',
    proba: 'Bete lau zereginak (✓). Gero egin akatsak nahita: jarri amperimetroa pilaren muturretan (A eta D), eskala txikiegia aukeratu, edo neurtu erresistentzia pila konektatuta. Zer erakusten du pantailak?'
  },

  ulertu: () => `
    <p class="def"><strong>Polimetroak</strong> (edo multimetroak) hainbat neurgailu biltzen ditu tresna bakarrean: voltimetroa, amperimetroa eta ohmetroa, eta batzuetan jarraitutasun-probatzailea, kondentsadoreen neurgailua…</p>

    <h3>Polimetroaren atalak</h3>
    <ul>
      <li><strong>Pantaila:</strong> neurketa eta unitatea. <strong>OL</strong> (overload) agertzen bada, balioa eskala baino handiagoa da.</li>
      <li><strong>Hautagailua:</strong> magnitudea (V⎓, A⎓, Ω…) eta eskala aukeratzeko.</li>
      <li><strong>Bornak:</strong> <strong>COM</strong> (punta beltza, beti), <strong>VΩmA</strong> (punta gorria, tentsioa, erresistentzia eta korronte txikiak) eta <strong>10 A</strong> (korronte handiak).</li>
    </ul>

    <h3>Nola neurtu</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Magnitudea</th><th>Nola konektatu</th><th>Kontuz</th></tr></thead>
      <tbody>
        <tr><td><strong>Tentsioa</strong> (voltimetroa)</td><td><strong>Paraleloan</strong>, osagaiaren bi muturretan. Ez da zirkuitua eten behar.</td><td>Zirkuitua elikatuta egon behar da.</td></tr>
        <tr><td><strong>Intentsitatea</strong> (amperimetroa)</td><td><strong>Seriean</strong>: zirkuitua eten eta puntak etenaren bi aldeetan jarri.</td><td>Inoiz ez paraleloan: zirkuitulabur bat egiten da.</td></tr>
        <tr><td><strong>Erresistentzia</strong> (ohmetroa)</td><td>Osagaiaren muturretan, <strong>zirkuitua elikatu gabe</strong> (hobe osagaia deskonektatuta).</td><td>Ohmetroak bere pila du; kanpoko tentsioak neurketa hondatzen du.</td></tr>
      </tbody>
    </table></div>

    <h3>Neurketa onak egiteko</h3>
    <ol>
      <li>Aukeratu magnitudea hautagailuan <strong>konektatu aurretik</strong>.</li>
      <li>Balioa ez badakizu, hasi <strong>eskala handienetik</strong> eta jaitsi, zehaztasun gehiago lortzeko.</li>
      <li>Balio negatiboa agertzen bada, puntak alderantziz daude: gorria potentzial baxuagoan dago.</li>
      <li>Korrontea neurtzeko, egiaztatu punta gorria borna egokian dagoela (mA edo 10 A).</li>
    </ol>
    <p class="note"><strong>Segurtasuna:</strong> etxeko sarean (230 V) ez da inoiz neurketarik egin behar irakaslerik gabe eta neurgailu egokirik gabe. Lantegi honetako zirkuituak pila txikikoak dira.</p>

    <h3>Neurgailu idealak</h3>
    <p>Neurgailu batek zirkuitua ahalik eta gutxien aldatu behar du:</p>
    <ul>
      <li><strong>Voltimetro ideala:</strong> erresistentzia infinitua (ez du korronterik hartzen). Errealak 10 MΩ inguru ditu.</li>
      <li><strong>Amperimetro ideala:</strong> erresistentzia zero (ez du tentsiorik kentzen). Horregatik da hain arriskutsua paraleloan jartzea: zirkuitulabur bat da.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> amperimetroak ia erresistentziarik ez duenez, paraleloan (adibidez, pilaren muturretan) jartzen bada korronte izugarria igarotzen da haren barnetik. Fusibleak neurgailua babesten du, urtu eta zirkuitua etenez.</p>

    <details class="sakondu" data-maila="3"><summary>Karga-efektua eta neurketaren errorea</summary><div class="in">
      <p>Voltimetro errealak R<sub>V</sub> barne-erresistentzia du, eta neurtzen duen osagaiarekin paraleloan geratzen da. Erresistentzia handiko zirkuituetan errorea handia izan daiteke.</p>
      <p>Adibidez, bi 10 kΩ-eko erresistentzia seriean 10 V-ra: R₂-ren tentsioa 5 V da. 10 kΩ-eko voltimetro batekin neurtuta, R₂ ∥ R<sub>V</sub> = 5 kΩ eta irakurketa 3,33 V da. 10 MΩ-eko batekin, 4,998 V.</p>
      <p>Amperimetroarekin gauza bera gertatzen da alderantziz: bere barne-erresistentzia seriean gehitzen da eta korrontea pixka bat txikitzen du.</p>
    </div></details>`,

  ariketak: ['neurgailua'],

  galdetegia: [
    { g: 'Nola konektatzen da voltimetroa?', a: ['Paraleloan, osagaiaren muturretan', 'Seriean, zirkuitua etenez', 'Pila deskonektatuta', 'Borna 10 A-n'], z: 0, zergatik: 'Tentsioa bi punturen artean neurtzen da: paraleloan.' },
    { g: 'Nola konektatzen da amperimetroa?', a: ['Paraleloan', 'Seriean, zirkuitua etenez', 'Pilaren muturretan', 'Ez du garrantzirik'], z: 1, zergatik: 'Korronte guztiak neurgailutik igaro behar du: seriean.' },
    { g: 'Erresistentzia bat neurtzeko:', a: ['Zirkuitua elikatu gabe egon behar da', 'Pilak konektatuta egon behar du', 'Seriean jarri behar da', 'Eskala txikiena aukeratu behar da beti'], z: 0, zergatik: 'Ohmetroak bere pila erabiltzen du; kanpoko tentsioak neurketa hondatzen du.' },
    { g: 'Pantailan «OL» agertzen da. Zer esan nahi du?', a: ['Balioa eskala baino handiagoa da', 'Neurgailua hondatuta dago', 'Tentsioa zero da', 'Pila agortuta dago'], z: 0, zergatik: 'Overload: aukeratu eskala handiago bat.' },
    { g: 'Voltimetroak −6,00 V erakusten ditu. Zer gertatzen da?', a: ['Puntak alderantziz daude', 'Pila hondatuta dago', 'Zirkuitulabur bat dago', 'Eskala okerra da'], z: 0, zergatik: 'Neurgailuak V(gorria) − V(beltza) erakusten du: negatiboa bada, gorria potentzial baxuagoan dago.' },
    { g: 'Zergatik da arriskutsua amperimetroa paraleloan jartzea?', a: ['Ia erresistentziarik ez duelako eta zirkuitulabur bat egiten delako', 'Erresistentzia oso handia duelako', 'Tentsioa neurtzen duelako', 'Ez da arriskutsua'], z: 0, zergatik: 'Amperimetro idealak erresistentzia zero du: paraleloan korronte izugarria igarotzen da.' },
    { g: 'Voltimetro erreal batek erresistentzia handiko osagai baten tentsioa neurtzean:', a: ['Balio txikiagoa neurtzen du, zirkuitua aldatzen duelako', 'Balio handiagoa neurtzen du', 'Balio zehatza beti', 'Ezin du neurtu'], z: 0, maila: 3, zergatik: 'R_V osagaiarekin paraleloan dago eta taldearen erresistentzia jaisten du (karga-efektua).' }
  ]
};
