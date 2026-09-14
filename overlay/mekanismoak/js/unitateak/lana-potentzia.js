// Oinarriak: lana, potentzia eta errendimendua
export default {
  izena: 'Lana eta potentzia',
  galdera: 'Polipasto batekin 100 kg igotzeko indarraren laurdena nahikoa bada, zergatik ez dugu makina batekin «dohainik» energia lortzen?',

  ikusi: {
    sim: 'polipastoa',
    proba: '<b>Proba:</b> aukeratu 0, 1, 2 eta 3 polea mugikor, eta kasu bakoitzean tiratu soka karga 1 m igo arte. Indarra aldatu egiten da, baina begiratu azken bi lerroak: <b>lana ez da aldatzen</b>.'
  },

  ulertu: () => `
    <h3>Lana</h3>
    <p class="def">Indar batek <strong>lana</strong> egiten du objektu bat bere norabidean mugitzen duenean. Lana indarraren eta egindako distantziaren biderkadura da.</p>
    <div class="formula">W = F · d<small>W: lana (J, joule) · F: indarra (N) · d: distantzia (m)</small></div>
    <p>Karga bat altuera batera igotzean, indarra bere pisua da eta distantzia altuera:</p>
    <div class="formula">W = m · g · h</div>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>25 kg-ko motxila bat 2 m-ko apal batera igotzen dugu.</p>
      <ol><li>W = m · g · h = 25 · 9,8 · 2 = 490 J</li></ol>
    </div>

    <h3>Makinen urrezko araua</h3>
    <p class="note ok"><strong>Makinek ez dute lana aurrezten.</strong> Indarra irabazten badugu, bidea galtzen dugu, eta alderantziz. Marruskadurarik gabe, guk egindako lana eta kargak jasotakoa berdinak dira: <span style="font-family:var(--font-code)">F · s = R · h</span>.</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Makina</th><th>Indarra</th><th>Bidea</th><th>Lana</th></tr></thead>
      <tbody>
        <tr><td>Zuzenean igo (100 kg, 1 m)</td><td>980 N</td><td>1 m</td><td>980 J</td></tr>
        <tr><td>Polea mugikorra</td><td>490 N</td><td>2 m</td><td>980 J</td></tr>
        <tr><td>Polipastoa (2 mugikor)</td><td>245 N</td><td>4 m</td><td>980 J</td></tr>
        <tr><td>Arrapala (4 m)</td><td>245 N</td><td>4 m</td><td>980 J</td></tr>
      </tbody>
    </table></div>

    <h3>Potentzia</h3>
    <p class="def"><strong>Potentzia</strong> lana zein azkar egiten den da: denbora-unitate bakoitzean egindako lana.</p>
    <div class="formula">P = W / t<small>P: potentzia (W, watt) · W: lana (J) · t: denbora (s)</small></div>
    <p>Bi garabik karga bera altuera berera igotzen badute, lan bera egiten dute; <strong>azkarrago egiten duenak potentzia handiagoa du</strong>. Unitate handiagoak: 1 kW = 1000 W. Autoetan zaldi-potentzia ere erabiltzen da: 1 CV ≈ 736 W.</p>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>Igogailu batek 300 kg 15 m igotzen ditu 20 s-tan.</p>
      <ol>
        <li>W = 300 · 9,8 · 15 = 44 100 J</li>
        <li>P = 44 100 / 20 = 2205 W ≈ 2,2 kW</li>
      </ol>
    </div>

    <h3>Errendimendua</h3>
    <p>Benetako makinetan, marruskaduragatik, energiaren zati bat <strong>beroa</strong> bihurtzen da. Errendimenduak (η) esaten du sartutako energiaren zein ehuneko bihurtzen den lan erabilgarri:</p>
    <div class="formula">η = W<sub>irteera</sub> / W<sub>sarrera</sub> · 100<small>Beti % 100 baino txikiagoa</small></div>
    <ul>
      <li>Motor elektriko ona: % 85–95</li>
      <li>Bizikletaren kate garbia: % 95 inguru</li>
      <li>Gasolina-motorra: % 25–35</li>
      <li>Lurrun-makina zaharra: % 10 baino gutxiago</li>
    </ul>`,

  ariketak: ['lana', 'potentzia'],

  galdetegia: [
    { g: 'Zein da lanaren unitatea?', a: ['Newtona (N)', 'Joulea (J)', 'Watta (W)', 'Kilogramoa (kg)'], z: 1,
      zergatik: 'Lana joule-tan neurtzen da: 1 J = 1 N · 1 m.' },
    { g: 'Makina batek indarra erdira murrizten badu (marruskadurarik gabe), zer gertatzen da?', a: ['Lana erdira murrizten da', 'Bidea bikoiztu egiten da', 'Energia sortzen da', 'Potentzia bikoizten da'], z: 1,
      zergatik: 'F · s = R · h: indarra erdira bada, bidea bikoitza. Lana berdina da.' },
    { g: 'Bi motorrek lan bera egiten dute; batek 10 s-tan eta besteak 20 s-tan. Zeinek du potentzia handiagoa?', a: ['10 s-tan egiten duenak', '20 s-tan egiten duenak', 'Biek bera', 'Ezin da jakin'], z: 0,
      zergatik: 'P = W / t: denbora txikiagoa, potentzia handiagoa.' },
    { g: 'Motor batek 1000 J jasotzen ditu eta 800 J-eko lana egiten du. Zein da errendimendua?', a: ['% 20', '% 80', '% 125', '% 100'], z: 1,
      zergatik: 'η = 800 / 1000 · 100 = % 80. Beste 200 J beroa bihurtu dira.' }
  ]
};
