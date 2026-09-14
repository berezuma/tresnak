export default {
  izena: 'Sorgailu errealak',
  galdera: 'Zergatik ahultzen dira auto baten argiak motorra abiarazten den unean?',

  ikusi: {
    sim: 'sorgailua',
    proba: 'Jaitsi kanpoko erresistentzia pixkanaka: bornen arteko tentsioa jaisten da? Sakatu <b>R = r</b>: kanpoko potentzia maximoa da? Zenbatekoa da orduan errendimendua? Sakatu <b>Zirkuitulaburra</b>: non xahutzen da energia guztia?'
  },

  ulertu: () => `
    <h3>Indar elektroeragilea eta barne-erresistentzia</h3>
    <p class="def"><strong>Indar elektroeragilea</strong> (i.e.e., ε) sorgailuak karga-unitate bakoitzari ematen dion energia da: ε = W / q. Voltetan neurtzen da, eta sorgailuaren "tentsio teorikoa" da.</p>
    <p class="def"><strong>Barne-erresistentzia</strong> (r) sorgailuaren barruko materialek korronteari jartzen dioten oztopoa da. Sorgailu erreal bat sorgailu ideal bat (ε) eta r seriean bezala adierazten da.</p>
    <div class="formula">V = ε − r · I &nbsp;&nbsp;&nbsp; I = ε / (R + r)</div>
    <dl class="where">
      <dt>V</dt><dd>bornen arteko tentsioa (voltimetroak neurtzen duena)</dd>
      <dt>ε</dt><dd>indar elektroeragilea</dd>
      <dt>r</dt><dd>barne-erresistentzia</dd>
      <dt>R</dt><dd>kanpoko erresistentzia (karga)</dd>
    </dl>

    <h3>Hiru egoera berezi</h3>
    <ul>
      <li><strong>Zirkuitu irekia</strong> (I = 0): V = ε. Horregatik neurtzen da i.e.e. voltimetro batekin kargarik gabe.</li>
      <li><strong>Karga batekin</strong>: V &lt; ε. Korrontea zenbat eta handiagoa, orduan eta tentsio gehiago galtzen da barnean.</li>
      <li><strong>Zirkuitulaburra</strong> (R = 0): I<sub>cc</sub> = ε / r eta V = 0. Energia guztia sorgailuaren barruan bero bihurtzen da.</li>
    </ul>

    <div class="worked">
      <h4>Adibidea</h4>
      <p>Bateria batek ε = 12 V eta r = 0,5 Ω ditu. 5,5 Ω-eko karga bati lotzen zaio.</p>
      <ol>
        <li>I = ε / (R + r) = 12 / 6 = 2 A</li>
        <li>V = ε − r · I = 12 − 0,5 · 2 = 11 V</li>
        <li>P<sub>kanpoan</sub> = V · I = 22 W; P<sub>barnean</sub> = r · I² = 2 W; P<sub>guztira</sub> = ε · I = 24 W</li>
      </ol>
      <p class="ans">Errendimendua: η = V / ε = 11 / 12 ≈ % 92</p>
    </div>

    <h3>Potentzia-balantzea eta errendimendua</h3>
    <div class="formula">ε · I = V · I + r · I² &nbsp;&nbsp;&nbsp; η = P<sub>erabilgarria</sub> / P<sub>guztira</sub> = V / ε</div>

    <h3>Potentzia maximoaren transferentzia</h3>
    <p>Kanpoko erresistentziak jasotzen duen potentzia P = ε² · R / (R + r)² da. Funtzio honek maximoa du <strong>R = r</strong> denean:</p>
    <div class="formula">P<sub>max</sub> = ε² / (4r)</div>
    <p>Baina orduan errendimendua % 50 besterik ez da: energiaren erdia sorgailuaren barruan galtzen da. Horregatik, audioan (bozgorailuak eta anplifikadoreak egokitzean) potentzia maximoa bilatzen da, eta energia-sareetan, berriz, errendimendu handia.</p>

    <h3>Sorgailuak seriean eta paraleloan</h3>
    <ul>
      <li><strong>Seriean:</strong> i.e.e.-ak eta barne-erresistentziak batu egiten dira: ε<sub>b</sub> = ε₁ + ε₂, r<sub>b</sub> = r₁ + r₂.</li>
      <li><strong>Paraleloan</strong> (n sorgailu berdin): i.e.e. bera, r<sub>b</sub> = r / n. Korronte handiagoa eman dezakete.</li>
    </ul>

    <h3>Hartzaileak: indar kontraelektroeragilea</h3>
    <p>Motor batek energia elektrikoa mugimendu bihurtzen du. Bere bornetako tentsioa <strong>indar kontraelektroeragilearen</strong> (ε′) eta bere barne-erresistentziaren (r′) araberakoa da:</p>
    <div class="formula">V = ε′ + r′ · I</div>
    <p>Sorgailu bat eta motor bat dituen zirkuituan: I = (ε − ε′) / (R + r + r′).</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> abiarazleak korronte izugarria eskatzen du (100 A baino gehiago). Bateriaren barne-erresistentziak (r · I) tentsio asko kentzen du, eta bornen arteko tentsioa jaisten denez, argiek distira gutxiago egiten dute.</p>`,

  ariketak: ['sorgailua'],

  galdetegia: [
    { g: 'Zirkuitu irekian (korronterik gabe), sorgailu erreal baten bornen arteko tentsioa:', a: ['Indar elektroeragilearen berdina da', 'Zero da', 'r · I da', 'Erdia da'], z: 0, zergatik: 'V = ε − r · 0 = ε.' },
    { g: 'ε = 9 V eta r = 1 Ω dituen pila bat 8 Ω-eko erresistentzia bati lotzen zaio. Korrontea:', a: ['1 A', '9 A', '1,125 A', '0,9 A'], z: 0, zergatik: 'I = 9 / (8 + 1) = 1 A.' },
    { g: 'Aurreko zirkuituan, bornen arteko tentsioa:', a: ['8 V', '9 V', '1 V', '10 V'], z: 0, zergatik: 'V = 9 − 1 · 1 = 8 V (edo V = I · R = 8 V).' },
    { g: 'Zirkuitulaburrean (R = 0), sorgailuaren korrontea:', a: ['I = ε / r', 'Infinitua', 'Zero', 'I = ε · r'], z: 0, zergatik: 'Barne-erresistentziak bakarrik mugatzen du korrontea.' },
    { g: 'Kanpoko erresistentziak zein baliorekin jasotzen du potentzia maximoa?', a: ['R = r', 'R = 0', 'R oso handia', 'R = 2r'], z: 0, zergatik: 'Potentzia maximoaren teorema: kargaren eta sorgailuaren erresistentziak berdinak.' },
    { g: 'Potentzia maximoa transferitzen denean, errendimendua:', a: ['% 50', '% 100', '% 25', '% 75'], z: 0, zergatik: 'R = r denean V = ε/2, beraz η = V/ε = 0,5.' },
    { g: 'ε = 1,5 V eta r = 0,2 Ω dituzten 4 pila seriean. Multzoaren i.e.e. eta barne-erresistentzia:', a: ['6 V eta 0,8 Ω', '1,5 V eta 0,05 Ω', '6 V eta 0,2 Ω', '1,5 V eta 0,8 Ω'], z: 0, zergatik: 'Seriean ε-ak eta r-ak batu egiten dira.' }
  ]
};
