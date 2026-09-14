// Makina sinpleak: palanka
function lever(x, y, order, title, ex) {
  // order: [euskarria, R, F] posizioak 0..1 barran
  const L = 170, px = t => x + 10 + t * L;
  const [e, r, f] = order;
  const sameSide = Math.sign(r - e) === Math.sign(f - e);
  const fUp = sameSide;
  return `
  <g font-family="Lato, system-ui, sans-serif">
    <text x="${x + 95}" y="${y}" text-anchor="middle" font-size="16" font-weight="700" fill="var(--ink)">${title}</text>
    <rect x="${x + 6}" y="${y + 62}" width="${L + 8}" height="8" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
    <path d="M${px(e)} ${y + 71} L${px(e) - 13} ${y + 96} L${px(e) + 13} ${y + 96} Z" fill="var(--g3-fill)" stroke="var(--s3)" stroke-width="2"/>
    <rect x="${px(r) - 13}" y="${y + 36}" width="26" height="26" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
    <text x="${px(r)}" y="${y + 54}" text-anchor="middle" font-size="13" font-weight="700" fill="var(--ink)">R</text>
    ${fUp
      ? `<path d="M${px(f)} ${y + 112} V${y + 74} M${px(f) - 6} ${y + 84} L${px(f)} ${y + 73} L${px(f) + 6} ${y + 84}" stroke="var(--s1)" stroke-width="3" fill="none"/>
         <text x="${px(f) + 12}" y="${y + 108}" font-size="14" font-weight="700" fill="var(--s1)">F</text>`
      : `<path d="M${px(f)} ${y + 20} V${y + 58} M${px(f) - 6} ${y + 48} L${px(f)} ${y + 59} L${px(f) + 6} ${y + 48}" stroke="var(--s1)" stroke-width="3" fill="none"/>
         <text x="${px(f) + 10}" y="${y + 30}" font-size="14" font-weight="700" fill="var(--s1)">F</text>`}
    <text x="${x + 95}" y="${y + 132}" text-anchor="middle" font-size="13.5" fill="var(--ink2)">${ex}</text>
  </g>`;
}
const motakSvg = `
<svg viewBox="0 0 600 150" role="img" aria-label="Hiru palanka motak: euskarria, erresistentzia eta indarraren kokapena">
  ${lever(0, 16, [.45, .08, .92], '1. maila: euskarria erdian', 'zabua, artaziak, alikatea')}
  ${lever(200, 16, [.05, .45, .95], '2. maila: R erdian', 'eskorga, intxaur-hauskailua')}
  ${lever(400, 16, [.05, .95, .45], '3. maila: F erdian', 'pintzak, besaurrea')}
</svg>`;

export default {
  izena: 'Palanka',
  galdera: 'Arkimedesek esan omen zuen: «Emaidazu euskarri-puntu bat, eta mundua mugituko dut». Zergatik ematen digu palanka luze batek hainbeste indar?',

  ikusi: {
    sim: 'palanka',
    proba: '<b>Proba:</b> 100 kg-ko karga euskarritik 1 m-ra dagoela, egin indarra 1 m-ra, 2 m-ra eta 3 m-ra. Zenbat indar behar da kasu bakoitzean? Zer gertatzen da euskarria kargara hurbiltzen duzunean?'
  },

  ulertu: () => `
    <h3>Zer da palanka bat?</h3>
    <p class="def"><strong>Palanka</strong> euskarri-puntu baten inguruan biratu dezakeen barra zurruna da. Indar txiki batekin erresistentzia handi bat mugitzeko, indarraren norabidea aldatzeko edo mugimendua handitzeko erabiltzen da.</p>
    <p>Palanka orok lau elementu ditu:</p>
    <dl class="where">
      <dt>F</dt><dd>Indarra (potentzia): guk egiten duguna, newtonetan (N).</dd>
      <dt>R</dt><dd>Erresistentzia: mugitu nahi dugun karga, newtonetan (N).</dd>
      <dt>d<sub>F</sub></dt><dd>Indar-besoa: euskarritik indarrera dagoen distantzia (m).</dd>
      <dt>d<sub>R</sub></dt><dd>Erresistentzia-besoa: euskarritik kargara dagoen distantzia (m).</dd>
    </dl>

    <h3>Palankaren legea</h3>
    <div class="formula">F · d<sub>F</sub> = R · d<sub>R</sub><small>Palanka orekan dago bi aldeetako biderkadurak berdinak direnean</small></div>
    <p>Horregatik, <strong>indar-besoa zenbat eta luzeagoa izan</strong> (edo erresistentzia-besoa laburragoa), orduan eta indar gutxiago behar da. Abantaila mekanikoa besoen arteko zatiketa da:</p>
    <div class="formula">AM = R / F = d<sub>F</sub> / d<sub>R</sub></div>

    <h3>Hiru palanka motak</h3>
    <figure class="fig diagram">${motakSvg}</figure>
    <ul>
      <li><strong>1. mailakoa:</strong> euskarria indarraren eta erresistentziaren artean. Indarra biderkatu edo mugimendua handitu dezake, euskarriaren kokapenaren arabera, eta indarraren norabidea aldatzen du.</li>
      <li><strong>2. mailakoa:</strong> erresistentzia euskarriaren eta indarraren artean. d<sub>F</sub> beti handiagoa denez, <strong>beti biderkatzen du indarra</strong>.</li>
      <li><strong>3. mailakoa:</strong> indarra euskarriaren eta erresistentziaren artean. d<sub>F</sub> beti txikiagoa denez, indar gehiago behar da, baina <strong>mugimendua handitzen du</strong> eta zehaztasuna ematen du.</li>
    </ul>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>200 kg-ko harri bat 4 m-ko barra batekin altxatu nahi dugu. Euskarria harritik 1 m-ra jarri dugu eta beste muturretik bultzatzen dugu. Zenbat indar behar da?</p>
      <ol>
        <li>Harriaren pisua: R = m · g = 200 · 9,8 = 1960 N</li>
        <li>Besoak: d<sub>R</sub> = 1 m; d<sub>F</sub> = 4 − 1 = 3 m (ez 4 m!)</li>
        <li>F = R · d<sub>R</sub> / d<sub>F</sub> = 1960 · 1 / 3 ≈ 653 N</li>
      </ol>
      <p class="ans">653 N inguru behar dira, harriaren pisuaren herena. Hori da 67 kg-ko masa bat eusteko egin behar den indarra, gutxi gorabehera.</p>
    </div>
    <p class="note"><strong>Ohiko akatsa:</strong> indarra kilotan ematea. Kilogramoak masa dira; indarra beti newtonetan (N).</p>`,

  ariketak: ['palanka-indarra', 'palanka-besoa'],

  galdetegia: [
    { g: 'Zein palanka motak du euskarria indarraren eta erresistentziaren artean?', a: ['1. mailakoak', '2. mailakoak', '3. mailakoak', 'Guztiek'], z: 0,
      zergatik: '1. mailakoan euskarria erdian dago (zabua, artaziak).' },
    { g: 'Eskorga batean, gurpila euskarria da, karga erdian dago eta guk heldulekuetatik altxatzen dugu. Zein palanka mota da?', a: ['1. mailakoa', '2. mailakoa', '3. mailakoa', 'Ez da palanka'], z: 1,
      zergatik: 'Erresistentzia (karga) euskarriaren eta indarraren artean dago: 2. mailakoa. Horregatik biderkatzen du beti indarra.' },
    { g: 'Palanka batean d_F = 2 m eta d_R = 0,5 m. 400 N-eko karga bada, zenbat indar behar da orekarako?', a: ['1600 N', '800 N', '200 N', '100 N'], z: 3,
      zergatik: 'F = R · d_R / d_F = 400 · 0,5 / 2 = 100 N.' },
    { g: 'Zergatik erabiltzen dira 3. mailako palankak, indar gehiago behar badute?', a: ['Ez dira erabiltzen', 'Mugimendua handitzen dutelako eta zehaztasuna ematen dutelako', 'Energia sortzen dutelako', 'Beti merkeagoak direlako'], z: 1,
      zergatik: 'Pintzetan edo besaurrean, indarra puntu hurbilean eginez muturra asko eta zehatz mugitzen da.' }
  ]
};
