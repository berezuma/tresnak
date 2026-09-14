// Transmisioa: torloju amaigabea eta koroa
export default {
  izena: 'Torloju amaigabea',
  galdera: 'Gitarraren klabijari bira oso bat ematen diozunean, soka apur bat baino ez da tenkatzen, eta askatzen duzunean ez da bakarrik desafinatzen. Zergatik?',

  ikusi: {
    sim: 'torloju-amaigabea',
    html: ({ fig }) => `<div style="max-width:320px;margin-top:16px">${fig('torloju-amaigabea', 'Benetako torloju amaigabe bat 3Dn: bi ardatzak perpendikularrak dira.')}</div>`,
    proba: '<b>Proba:</b> jarri Z = 10 eta gero Z = 60. Torlojuak zenbat bira ematen ditu koroak bira oso bat eman bitartean? Sakatu «Saiatu koroatik biratzen»: zer gertatzen da?'
  },

  ulertu: () => `
    <h3>Zer da?</h3>
    <p class="def"><strong>Torloju amaigabea</strong> hari helikoidala duen ardatza da, eta hortzdun gurpil batekin (<strong>koroa</strong>) ahokatzen da. Elkarren perpendikular dauden bi ardatzen artean transmititzen du higidura.</p>

    <h3>Ezaugarriak</h3>
    <ul>
      <li><strong>Ardatz perpendikularrak:</strong> 90°-ra.</li>
      <li><strong>Murrizketa handia urrats bakar batean:</strong> torlojuaren bira oso bakoitzean koroak hortz bakar bat aurreratzen du.</li>
      <li><strong>Ez-itzulgarria</strong> normalean: torlojuak koroa mugi dezake, baina koroak ezin du torlojua biratu. Horregatik geratzen da karga bere tokian, balaztarik gabe (klabijak, igogailuak, ate automatikoak).</li>
      <li><strong>Zehaztasuna:</strong> mugimendu txiki eta kontrolatuak.</li>
    </ul>

    <h3>Transmisio-erlazioa</h3>
    <div class="formula">N₂ = N₁ / Z<small>Z: koroaren hortz-kopurua (sarrera bakarreko torlojua)</small></div>
    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>Torloju amaigabe bat 1200 rpm-ra biratzen da, eta koroak 30 hortz ditu. Zein da koroaren abiadura?</p>
      <ol><li>N₂ = N₁ / Z = 1200 / 30 = 40 rpm</li></ol>
      <p class="ans">40 rpm: 30 aldiz motelago, bi engranajerekin lortzeko zaila litzatekeen murrizketa.</p>
    </div>
    <p class="note"><strong>Kontuz:</strong> urrats bakar batean murrizketa handia ematen du, baina ez da beti mekanismorik «indartsuena». Engranaje-tren edo polipasto batek abantaila handiagoa eman dezake, eta torloju amaigabeak marruskaduragatik energia gehiago galtzen du.</p>

    <h3>Aplikazioak</h3>
    <ul>
      <li>Gitarraren eta beste musika-tresnen klabijak</li>
      <li>Igogailuen eta ate automatikoen motorrak</li>
      <li>Garraio-zintak eta nahasgailuak</li>
      <li>Leihoak eta pertsianak irekitzeko biradera-sistemak</li>
    </ul>`,

  ariketak: ['torloju-amaigabea'],

  galdetegia: [
    { g: 'Nola daude kokatuta torloju amaigabearen eta koroaren ardatzak?', a: ['Paraleloan', 'Perpendikular (90°)', 'Ardatz berean', 'Edozein angelutan'], z: 1,
      zergatik: 'Torloju amaigabeak ardatz perpendikularren artean transmititzen du higidura.' },
    { g: 'Zer eskaintzen du torloju amaigabeak?', a: ['Abiadura handitzea', 'Abiadura asko murriztea urrats bakar batean', 'Energia sortzea', 'Higidura lineala'], z: 1,
      zergatik: 'Torlojuaren bira bakoitzean koroak hortz bat aurreratzen du: N₂ = N₁ / Z.' },
    { g: 'Zergatik ez da igogailu bat erortzen motorra gelditzen denean, torloju amaigabea badu?', a: ['Normalean ez-itzulgarria delako', 'Koroa oso arina delako', 'Motorrak beti eusten diolako', 'Kableak elastikoak direlako'], z: 0,
      zergatik: 'Koroak ezin du torlojua biratu; karga bere tokian geratzen da.' }
  ]
};
