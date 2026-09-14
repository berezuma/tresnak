// Makina sinpleak: plano inklinatua eta ziria
const ziriaSvg = `
<svg viewBox="0 0 560 170" role="img" aria-label="Ziria: plano inklinatu bikoitza, egurra zabaltzen">
  <g font-family="Lato, system-ui, sans-serif">
    <rect x="40" y="70" width="200" height="80" fill="var(--chip)" stroke="var(--ink3)" stroke-width="2"/>
    <path d="M140 70 L155 150 L125 150 Z" fill="var(--paper)" stroke="none"/>
    <path d="M122 16 L158 16 L140 118 Z" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2" stroke-linejoin="round"/>
    <path d="M140 0 V12 M134 4 L140 13 L146 4" stroke="var(--s1)" stroke-width="3" fill="none"/>
    <text x="152" y="10" font-size="13" font-weight="700" fill="var(--s1)">F</text>
    <path d="M118 95 H84 M92 89 L83 95 L92 101 M162 95 H196 M188 89 L197 95 L188 101" stroke="var(--s3)" stroke-width="3" fill="none"/>
    <text x="140" y="165" text-anchor="middle" font-size="13" fill="var(--ink2)">Aizkora, labana, iltzea</text>
    <text x="300" y="50" font-size="15" font-weight="700" fill="var(--ink)">Ziria = plano inklinatu bikoitza</text>
    <text x="300" y="76" font-size="14" fill="var(--ink2)">Behera bultzatzen dugu (F), eta albora</text>
    <text x="300" y="96" font-size="14" fill="var(--ink2)">indar handiagoak egiten ditu, egurra</text>
    <text x="300" y="116" font-size="14" fill="var(--ink2)">zabalduz. Zenbat eta meheagoa eta</text>
    <text x="300" y="136" font-size="14" fill="var(--ink2)">luzeagoa, orduan eta indar gutxiago.</text>
  </g>
</svg>`;

export default {
  izena: 'Plano inklinatua eta ziria',
  galdera: 'Garraiolariek ez dute garbigailu bat kamioira besoetan igotzen: arrapala bat jartzen dute. Zergatik da errazagoa, bide luzeagoa egin arren?',

  ikusi: {
    sim: 'plano-inklinatua',
    proba: '<b>Proba:</b> altuera 1 m-an utzita, jarri arrapala 2 m-koa eta gero 4 m-koa. Zer gertatzen da indarrarekin? Mugitu kaxa goraino eta begiratu azken bi lerroak: <b>lana bera da</b> kasu guztietan.'
  },

  ulertu: () => `
    <h3>Zer da plano inklinatua?</h3>
    <p class="def"><strong>Plano inklinatua</strong> horizontalarekin angelu bat osatzen duen gainazal laua da (arrapala, aldapa). Karga bat altuera batera igotzeko behar den indarra murrizten du, bidea luzatzearen truke.</p>
    <p>Karga zuzenean igotzeko, bere pisu osoa (P) egin behar dugu. Arrapala batetik, askoz indar txikiagoa nahikoa da, baina distantzia luzeagoa egin behar dugu.</p>

    <h3>Plano inklinatuaren legea</h3>
    <div class="formula">F · L = P · h<small>F: indarra arrapalaren norabidean (N) · L: arrapalaren luzera (m) · P: pisua (N) · h: altuera (m)</small></div>
    <div class="formula">AM = P / F = L / h</div>
    <p>Arrapala <strong>zenbat eta luzeagoa</strong> (malda leunagoa), orduan eta indar gutxiago. Lana ez da aldatzen: F · L = P · h.</p>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>60 kg-ko garbigailu bat 1,2 m-ko altuerako kamioira igo nahi dugu 4 m-ko arrapala batetik. Zenbat indar behar da (marruskadurarik gabe)?</p>
      <ol>
        <li>P = m · g = 60 · 9,8 = 588 N</li>
        <li>F = P · h / L = 588 · 1,2 / 4 ≈ 176 N</li>
      </ol>
      <p class="ans">176 N inguru: pisuaren % 30 baino gutxiago. Zuzenean igotzeko 588 N beharko genituzke.</p>
    </div>

    <h3>Ziria</h3>
    <p>Ziria <strong>bi plano inklinatu</strong> elkartuta dira. Behera bultzatzean, alboetara indar handiak egiten ditu. Aizkorak, labanek, iltzeek eta ateak eusteko ziriek printzipio hori erabiltzen dute.</p>
    <figure class="fig diagram">${ziriaSvg}</figure>

    <h3>Torlojua: plano inklinatu bilbatua</h3>
    <p>Torloju baten haria plano inklinatu bat da, zilindro baten inguruan bilduta. Horregatik egiten dute torlojuek hainbesteko indarra: bira bakoitzean bide luzea egiten dugu, baina pauso txiki bat bakarrik aurreratzen dute (ikus <a href="#/torloju-azkoina">Torloju-azkoina</a>).</p>

    <p class="note"><strong>Benetako munduan</strong> marruskadura dago: indarra kalkulatutakoa baino handiagoa da. Gurpilak edo arrabolak jartzen dira marruskadura murrizteko.</p>`,

  ariketak: ['plano-inklinatua'],

  galdetegia: [
    { g: 'Zer irabazten da plano inklinatu bat erabiltzean?', a: ['Energia', 'Indar txikiagoa behar da, bide luzeagoaren truke', 'Denbora', 'Pisua murrizten da'], z: 1,
      zergatik: 'F · L = P · h: indarra txikitzen da, baina bidea (L) luzatzen da; lana berdina da.' },
    { g: '800 N-eko kaxa bat 1 m igo nahi da 4 m-ko arrapala batetik. Zenbat indar behar da?', a: ['800 N', '400 N', '200 N', '3200 N'], z: 2,
      zergatik: 'F = P · h / L = 800 · 1 / 4 = 200 N.' },
    { g: 'Zer da ziria?', a: ['Palanka bat', 'Bi plano inklinatu elkartuta', 'Polea bat', 'Engranaje bat'], z: 1,
      zergatik: 'Ziria plano inklinatu bikoitza da: behera bultzatuta, alboetara indarra egiten du.' },
    { g: 'Arrapala bat luzeagoa egiten badugu (altuera bera), zer gertatzen da?', a: ['Indar gehiago behar da', 'Indar gutxiago behar da', 'Ez da ezer aldatzen', 'Karga arinagoa da'], z: 1,
      zergatik: 'L handitzean, F = P · h / L txikitzen da.' }
  ]
};
