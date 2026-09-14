// Makina sinpleak: tornua
const tornuaSvg = `
<svg viewBox="0 0 560 260" role="img" aria-label="Putzu bateko tornua: danborra, biradera, soka eta ontzia">
  <g font-family="Lato, system-ui, sans-serif">
    <rect x="70" y="60" width="14" height="170" fill="var(--chip)" stroke="var(--ink)" stroke-width="2"/>
    <rect x="316" y="60" width="14" height="170" fill="var(--chip)" stroke="var(--ink)" stroke-width="2"/>
    <rect x="84" y="70" width="232" height="40" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
    <line x1="130" y1="70" x2="140" y2="110" stroke="var(--s2)"/><line x1="160" y1="70" x2="170" y2="110" stroke="var(--s2)"/><line x1="190" y1="70" x2="200" y2="110" stroke="var(--s2)"/>
    <line x1="330" y1="90" x2="380" y2="90" stroke="var(--ink)" stroke-width="5"/>
    <line x1="380" y1="90" x2="380" y2="170" stroke="var(--s1)" stroke-width="7" stroke-linecap="round"/>
    <line x1="380" y1="170" x2="420" y2="170" stroke="var(--s1)" stroke-width="7" stroke-linecap="round"/>
    <line x1="220" y1="110" x2="220" y2="190" stroke="var(--ink)" stroke-width="2"/>
    <path d="M200 190 H240 L234 228 H206 Z" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
    <path d="M440 170 V210 M434 202 L440 212 L446 202" stroke="var(--s1)" stroke-width="3" fill="none"/>
    <text x="448" y="196" font-size="14" font-weight="700" fill="var(--s1)">F</text>
    <text x="232" y="250" font-size="14" font-weight="700" fill="var(--s2-ink)">R (ontzia)</text>
    <path d="M390 130 H410" stroke="var(--ink3)"/><text x="414" y="134" font-size="13" fill="var(--ink2)">R_b: biraderaren besoa</text>
    <text x="110" y="52" font-size="13" fill="var(--ink2)">danborra (r: erradioa)</text>
  </g>
</svg>`;

export default {
  izena: 'Tornua',
  galdera: 'Antzinako putzuetan, ur-ontzi astun bat sakonetik igotzeko ez zen sokatik zuzenean tiratzen: biradera bati eragiten zitzaion. Zergatik?',

  ikusi: {
    html: () => `<figure class="fig diagram">${tornuaSvg}</figure>`,
    proba: 'Eskeman, bilatu palanka bat: non dago euskarria? Non egiten da indarra, eta non dago erresistentzia? Zein beso da luzeagoa?'
  },

  ulertu: () => `
    <h3>Zer da tornua?</h3>
    <p class="def"><strong>Tornua</strong> ardatz baten inguruan biratzen den <strong>danborra</strong> da, eta <strong>biradera</strong> bati eraginez biratzen da. Danborrean soka bat biltzen da, karga bat igotzeko.</p>
    <p>Palanka bat bezala lan egiten du, baina etengabe biraka: <strong>euskarria ardatza</strong> da, indar-besoa <strong>biraderaren besoa</strong> (R<sub>b</sub>) eta erresistentzia-besoa <strong>danborraren erradioa</strong> (r).</p>

    <h3>Tornuaren legea</h3>
    <div class="formula">F · R<sub>b</sub> = R · r<small>F: biraderan egindako indarra · R: karga · R<sub>b</sub>: biraderaren besoa · r: danborraren erradioa</small></div>
    <div class="formula">AM = R<sub>b</sub> / r</div>
    <p>Biradera <strong>zenbat eta luzeagoa</strong> eta danborra <strong>zenbat eta meheagoa</strong>, orduan eta indar gutxiago. Baina bira gehiago eman behar dira karga altuera berera igotzeko.</p>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>Putzu bateko tornuaren danborrak 10 cm-ko erradioa du eta biraderak 40 cm-ko besoa. 20 kg-ko ontzi bat igotzeko, zenbat indar egin behar da?</p>
      <ol>
        <li>R = m · g = 20 · 9,8 = 196 N</li>
        <li>F = R · r / R<sub>b</sub> = 196 · 10 / 40 = 49 N</li>
      </ol>
      <p class="ans">49 N: ontziaren pisuaren laurdena.</p>
    </div>

    <h3>Zenbat soka biltzen da?</h3>
    <p>Bira bakoitzean danborrak bere zirkunferentzia adina soka biltzen du: <span style="font-family:var(--font-code)">2 · π · r</span>. 10 cm-ko erradioarekin, 0,63 m bira bakoitzeko.</p>

    <h3>Aplikazioak</h3>
    <ul>
      <li>Putzuak eta ur-ontziak</li>
      <li>Garabiak eta kabestranteak (ontzietako aingurak)</li>
      <li>Bolanteak eta giltzak: printzipio bera (beso luzea, ardatz mehea)</li>
    </ul>`,

  ariketak: ['tornua'],

  galdetegia: [
    { g: 'Tornu batean, zein da euskarria?', a: ['Biradera', 'Ardatza', 'Soka', 'Ontzia'], z: 1,
      zergatik: 'Tornua palanka birakaria da: ardatzaren inguruan biratzen du.' },
    { g: 'Biraderaren besoa 60 cm eta danborraren erradioa 15 cm. 400 N-eko karga igotzeko, zenbat indar behar da?', a: ['1600 N', '400 N', '100 N', '25 N'], z: 2,
      zergatik: 'F = R · r / R_b = 400 · 15 / 60 = 100 N.' },
    { g: 'Nola murriztu dezakegu tornu batean egin beharreko indarra?', a: ['Danborra lodiagoa eginez', 'Biradera laburragoa eginez', 'Biradera luzeagoa eginez', 'Soka luzeagoa jarriz'], z: 2,
      zergatik: 'AM = R_b / r: indar-besoa (biradera) luzatuz.' }
  ]
};
