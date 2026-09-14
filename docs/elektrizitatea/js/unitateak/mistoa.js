import { R, Sr, Pr, ebatzi, eskemaSVG } from '../eskema.js';

const tree = Sr(R('R1', 10), Pr(R('R2', 30), R('R3', 60)));
const tree23 = Sr(R('R1', 10), { t: 'R', izena: 'R23', R: 20, berria: true });

export default {
  izena: 'Zirkuitu mistoak',
  galdera: 'Zirkuitu errealetan osagaiak ez daude soilik seriean edo paraleloan. Nola ebazten dira horrelako zirkuituak?',

  ikusi: {
    sim: 'murrizketa',
    proba: 'Sakatu «Hurrengo urratsa» behin eta berriz. <b>B</b> zirkuituan zenbat urrats behar dira erresistentzia bakarra lortzeko? Probatu <b>Ausazkoa</b> eta saiatu zu lehenago kalkulatzen, gero egiaztatzeko.'
  },

  ulertu: () => `
    <p class="def"><strong>Zirkuitu mistoan</strong> osagai batzuk seriean daude eta beste batzuk paraleloan. Ebazteko, zirkuitua pausoz pauso <strong>sinplifikatzen</strong> da, erresistentzia baliokide bakarra geratu arte, eta gero <strong>atzera</strong> egiten da.</p>

    <h3>Metodoa</h3>
    <ol>
      <li><strong>Talde sinple bat bilatu:</strong> seriean edo paraleloan dauden erresistentziak, beste ezer tartean ez dutela.</li>
      <li><strong>Ordezkatu</strong> talde hori bere erresistentzia baliokidearekin.</li>
      <li><strong>Errepikatu</strong> erresistentzia bakarra (R<sub>b</sub>) geratu arte.</li>
      <li><strong>Pilaren korrontea:</strong> I = E / R<sub>b</sub>.</li>
      <li><strong>Atzera:</strong> seriean, korronte bera → V = I · R; paraleloan, tentsio bera → I = V / R.</li>
      <li><strong>Egiaztatu:</strong> nodoetan korronteak bat datoz, eta bide bakoitzeko tentsioen batura pilarena da.</li>
    </ol>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>12 V-ko pila; R₁ = 10 Ω seriean, eta R₂ = 30 Ω eta R₃ = 60 Ω paraleloan.</p>
      <div class="eg-grid" style="grid-template-columns:repeat(auto-fit, minmax(230px, 1fr))">
        <figure class="fig diagram">${eskemaSVG(tree, { E: 12, nabarmendu: ['R2', 'R3'] })}<figcaption>1. R₂ eta R₃ paraleloan daude.</figcaption></figure>
        <figure class="fig diagram">${eskemaSVG(tree23, { E: 12 })}<figcaption>2. R₂₃ = 20 Ω, R₁-ekin seriean.</figcaption></figure>
      </div>
      <ol>
        <li>R₂₃ = 30 · 60 / (30 + 60) = 1800 / 90 = 20 Ω</li>
        <li>R<sub>b</sub> = R₁ + R₂₃ = 10 + 20 = 30 Ω</li>
        <li>I = 12 / 30 = 0,4 A (R₁-etik eta R₂₃ taldetik)</li>
        <li>V₁ = 0,4 · 10 = 4 V; &nbsp;V₂₃ = 0,4 · 20 = 8 V</li>
        <li>I₂ = 8 / 30 ≈ 0,267 A; &nbsp;I₃ = 8 / 60 ≈ 0,133 A</li>
        <li>Egiaztatu: 0,267 + 0,133 = 0,4 A ✓ eta 4 + 8 = 12 V ✓</li>
      </ol>
      <div class="diagram" style="max-width:400px">${eskemaSVG(tree, { E: 12, emaitzak: ebatzi(tree, 12) })}</div>
    </div>

    <p class="note"><strong>Ohiko akatsak:</strong> paraleloan dauden erresistentziak zuzenean batzea; paraleloko baliokidea txikiena baino handiagoa ateratzea (ezinezkoa da); edo seriean dagoen erresistentziari pilaren tentsio osoa ematea.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> barruko taldeetatik kanpora sinplifikatuz, erresistentzia bakarra lortu, korrontea kalkulatu, eta urratsak alderantziz eginez osagai bakoitzaren tentsioa eta korrontea aurkitzen dira.</p>

    <details class="sakondu" data-maila="3"><summary>Serie-paralelo gisa murriztu ezin diren zirkuituak</summary><div class="in">
      <p>Zirkuitu guztiak ez dira sinplifikatzen serie eta paralelo taldeka. Adibidez:</p>
      <ul>
        <li><strong>Wheatstone-ren zubia</strong> (oro har, orekatuta ez dagoenean): erdiko erresistentzia ez dago ez seriean ez paraleloan beste inorekin.</li>
        <li><strong>Sorgailu bat baino gehiago adar desberdinetan:</strong> ezin da erresistentzia baliokide bakar bat kalkulatu.</li>
      </ul>
      <p>Horrelakoetan <strong>Kirchhoff-en legeak</strong> eta <strong>sare-korronteen metodoa</strong> erabiltzen dira (hurrengo atalak), edo triangelu-izar (Δ–Y) transformazioa.</p>
    </div></details>`,

  ariketak: ['mistoa-req', 'mistoa-i', 'mistoa-adarra'],

  galdetegia: [
    { g: 'R₁ seriean dago R₂ eta R₃ paraleloko taldearekin. Zer kalkulatzen da lehenik?', a: ['R₂ eta R₃-ren baliokidea (paraleloan)', 'R₁ + R₂', 'R₁ + R₂ + R₃', 'Pilaren korrontea'], z: 0, zergatik: 'Barruko talde sinpletik hasten da: R₂ ∥ R₃. Gero R₁-ekin batzen da.' },
    { g: 'R₁ = 5 Ω seriean, R₂ = R₃ = 10 Ω paraleloan. Erresistentzia baliokidea:', a: ['10 Ω', '25 Ω', '15 Ω', '5 Ω'], z: 0, zergatik: 'R₂₃ = 10 / 2 = 5 Ω; Rb = 5 + 5 = 10 Ω.' },
    { g: 'Pilaren korrontea (I) ezagututa, seriean dagoen R₁-en tentsioa:', a: ['V₁ = I · R₁', 'V₁ = pilaren tentsioa', 'V₁ = E / R₁', 'V₁ = I / R₁'], z: 0, zergatik: 'Korronte osoa igarotzen da R₁-etik: Ohm-en legea, V₁ = I · R₁.' },
    { g: 'Paraleloan dauden bi adarrek beti dute:', a: ['Tentsio bera', 'Korronte bera', 'Erresistentzia bera', 'Potentzia bera'], z: 0, zergatik: 'Bi puntu berberen artean daude.' },
    { g: 'Nola egiazta dezakezu zirkuitu misto baten emaitza?', a: ['Paraleloko adarren korronteak batuta taldera sartzen den korrontea ematen dute', 'Erresistentzia guztien batura pilaren tentsioa da', 'Korronte guztiak berdinak dira', 'Ezin da egiaztatu'], z: 0, zergatik: 'Nodoetan korronteak bat etorri behar dira, eta bide bakoitzeko tentsioen batura pilarena da.' },
    { g: 'R₂ = 30 Ω eta R₃ = 60 Ω paraleloan. Haien baliokidea:', a: ['90 Ω', '20 Ω', '45 Ω', '30 Ω'], z: 1, zergatik: '30 · 60 / 90 = 20 Ω (txikiena baino txikiagoa).' },
    { g: 'Zein zirkuitu EZIN da seriea eta paraleloa bakarrik erabiliz murriztu (oro har)?', a: ['Wheatstone-ren zubia', 'Bi erresistentzia seriean', 'Hiru adar paraleloan', 'R₁ + (R₂ ∥ R₃)'], z: 0, maila: 3, zergatik: 'Zubiko erdiko erresistentzia ez dago ez seriean ez paraleloan: Kirchhoff-en legeak behar dira.' }
  ]
};
