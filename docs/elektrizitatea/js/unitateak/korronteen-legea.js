import { nodoSVG } from '../eskema.js';

export default {
  izena: 'Korronteen legea (nodoak)',
  galdera: 'Ibai bat bi adarretan banatzen denean, ura galtzen al da? Eta korrontea, zirkuitu bateko adarkatze batean?',

  ikusi: {
    sim: 'laborategia',
    aukerak: { adibidea: 'paraleloa-r', adibideak: ['paraleloa-r', 'mistoa', 'kirchhoff', 'zubia'], tresna: 'nodoa', balioak: true },
    proba: '<b>Nodoa</b> tresna aukeratuta dago: sakatu hiru adar edo gehiago elkartzen diren puntu bat. Sartzen diren korronteen batura eta irteten direnena berdinak dira? Aldatu erresistentzia bat (Hautatu tresnarekin) eta egiaztatu berriro. Probatu «Bi pila, hiru adar» adibidearekin ere.'
  },

  ulertu: () => `
    <h3>Hitz batzuk</h3>
    <ul>
      <li><strong>Nodoa:</strong> hiru eroale edo gehiago elkartzen diren puntua.</li>
      <li><strong>Adarra:</strong> bi nodoren arteko zatia; bertako osagai guztietatik korronte bera igarotzen da.</li>
      <li><strong>Begizta</strong> (edo sarea): zirkuituaren bide itxi bat.</li>
    </ul>

    <h3>Kirchhoff-en lehen legea: korronteen legea</h3>
    <p class="def">Nodo batera <strong>sartzen</strong> diren korronteen batura nodotik <strong>irteten</strong> diren korronteen baturaren berdina da.</p>
    <div class="formula">ΣI<sub>sartu</sub> = ΣI<sub>irten</sub> &nbsp;&nbsp; edo &nbsp;&nbsp; ΣI = 0<small>(sartzen direnak positibo, irteten direnak negatibo)</small></div>
    <p>Legea <strong>karga elektrikoaren kontserbazioaren</strong> ondorioa da: karga ez da sortzen, ez da desagertzen eta ez da nodoetan pilatzen. Zenbat karga sartu, beste hainbeste irteten da segundo bakoitzean.</p>

    <div class="worked">
      <h4>Adibidea</h4>
      <div class="diagram" style="max-width:320px">${nodoSVG([{ izena: 'I₁', testua: '2 A', sartu: true }, { izena: 'I₂', testua: '0,5 A', sartu: false }, { izena: 'I₃', testua: '1 A', sartu: true }, { izena: 'I₄', testua: '?', sartu: false }])}</div>
      <ol>
        <li>Sartzen direnak: I₁ + I₃ = 2 + 1 = 3 A</li>
        <li>Irteten direnak: I₂ + I₄ = 0,5 + I₄</li>
        <li>3 = 0,5 + I₄</li>
      </ol>
      <p class="ans">I₄ = 2,5 A (irteten)</p>
    </div>

    <h3>Noranzkoa ez dakigunean</h3>
    <p>Korronte baten noranzkoa ezezaguna bada, <strong>noranzko bat suposatzen da</strong> eta legea aplikatzen da. Emaitza <strong>negatiboa</strong> bada, benetako noranzkoa suposatutakoaren kontrakoa da. Balioa ondo dago; zeinuak noranzkoa bakarrik adierazten du.</p>

    <h3>Paraleloko zirkuituen legea, berriro</h3>
    <p>Paraleloko zirkuitu batean pilaren korrontea adarren artean banatzen dela esan genuen: I = I₁ + I₂ + I₃. Hori korronteen legea da, adarkatze-nodoan aplikatuta.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> ez da urik galtzen: adar bien emarien batura ibaiaren emaria da. Korrontearekin berdin: nodo batera sartzen dena irteten da, adarren artean banatuta.</p>

    <details class="sakondu" data-maila="3"><summary>Nodoen metodoa</summary><div class="in">
      <p>Zirkuitu konplexuak ebazteko, nodo bat erreferentzia gisa hartzen da (0 V) eta beste nodoen <strong>potentzialak</strong> dira ezezagunak. Nodo bakoitzean korronteen legea idazten da, korronte bakoitza Ohm-en legearen bidez adierazita: I = (V<sub>A</sub> − V<sub>B</sub>) / R.</p>
      <p>n nodo badaude, n − 1 ekuazio behar dira. Lantegi honetako laborategiak metodo horixe erabiltzen du (analisi nodal aldatua) zure zirkuituak ebazteko!</p>
      <p>Adibidez, «Bi pila, hiru adar» zirkuituan goiko nodoaren potentziala V bada: (12 − V)/4 + (6 − V)/3 = V/6 → V = 6,67 V.</p>
    </div></details>`,

  ariketak: ['kcl'],

  galdetegia: [
    { g: 'Zer da nodoa?', a: ['Hiru eroale edo gehiago elkartzen diren puntua', 'Bi osagairen arteko kablea', 'Pilaren borna positiboa', 'Zirkuitu itxi bat'], z: 0, zergatik: 'Nodoetan banatzen edo elkartzen dira korronteak.' },
    { g: 'Zer dio Kirchhoff-en korronteen legeak?', a: ['Nodo batera sartzen den korrontea eta irteten dena berdinak dira', 'Begizta batean tentsioen batura zero da', 'Korrontea tentsioaren proportzionala da', 'Nodoetan korrontea pilatzen da'], z: 0, zergatik: 'ΣI sartu = ΣI irten.' },
    { g: 'Zer printzipiotan oinarritzen da korronteen legea?', a: ['Karga elektrikoaren kontserbazioan', 'Energiaren kontserbazioan', 'Ohm-en legean', 'Joule efektuan'], z: 0, zergatik: 'Karga ez da sortzen, ez desagertzen eta ez da nodoetan pilatzen.' },
    { g: 'Nodo batera 3 A eta 2 A sartzen dira, eta 4 A irteten dira adar batetik. Zer gertatzen da hirugarren adarrean?', a: ['1 A irteten da', '1 A sartzen da', '9 A irteten dira', 'Ez da korronterik'], z: 0, zergatik: '3 + 2 = 4 + I → I = 1 A, irteten.' },
    { g: 'Korronte baten noranzkoa suposatu eta emaitza −0,5 A atera da. Zer esan nahi du?', a: ['Korrontea 0,5 A da, suposatutakoaren kontrako noranzkoan', 'Kalkulua gaizki dago', 'Korronterik ez dago', 'Korrontea 0,5 A baino txikiagoa da'], z: 0, zergatik: 'Zeinu negatiboak noranzkoa adierazten du; balioa 0,5 A da.' },
    { g: 'Paraleloan hiru adar daude: 0,2 A, 0,3 A eta 0,5 A. Pilaren korrontea:', a: ['1 A', '0,5 A', '0,33 A', '0,03 A'], z: 0, zergatik: 'Korronteen legea adarkatze-nodoan: 0,2 + 0,3 + 0,5 = 1 A.' },
    { g: 'Zirkuitu batek 4 nodo ditu. Nodoen metodoaz, zenbat ekuazio independente idazten dira?', a: ['3', '4', '5', '2'], z: 0, maila: 3, zergatik: 'Nodo bat erreferentzia da: n − 1 = 3 ekuazio.' }
  ]
};
