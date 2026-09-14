// Transformazioa: biela eta biradera
const bielaSvg = `
<svg viewBox="0 0 560 200" role="img" aria-label="Biela-biradera: biradera, biela eta pistoia">
  <g font-family="Lato, system-ui, sans-serif">
    <rect x="300" y="62" width="230" height="76" fill="none" stroke="var(--ink3)" stroke-width="2"/>
    <rect x="392" y="68" width="60" height="64" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
    <circle cx="120" cy="100" r="62" fill="none" stroke="var(--rule)" stroke-width="2" stroke-dasharray="5 5"/>
    <line x1="120" y1="100" x2="164" y2="56" stroke="var(--s2)" stroke-width="10" stroke-linecap="round"/>
    <line x1="164" y1="56" x2="400" y2="100" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/>
    <circle cx="120" cy="100" r="7" fill="var(--ink)"/><circle cx="164" cy="56" r="6" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/><circle cx="400" cy="100" r="6" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
    <text x="96" y="186" font-size="14" font-weight="700" fill="var(--s2-ink)">biradera (r)</text>
    <text x="250" y="60" font-size="14" font-weight="700" fill="var(--ink)">biela</text>
    <text x="422" y="160" text-anchor="middle" font-size="14" font-weight="700" fill="var(--s1)">pistoia</text>
    <path d="M470 100 H520 M512 94 L522 100 L512 106 M470 100 L480 94 M470 100 L480 106" stroke="var(--ink)" stroke-width="2" fill="none"/>
    <path d="M60 40 A70 70 0 0 1 120 30" stroke="var(--ink)" stroke-width="2" fill="none"/><path d="M112 24 L122 30 L112 36" stroke="var(--ink)" stroke-width="2" fill="none"/>
  </g>
</svg>`;

export default {
  izena: 'Biela eta biradera',
  galdera: 'Autoaren motorrean pistoiek gora eta behera egiten dute etengabe, baina gurpilek biratu egiten dute. Nola bihurtzen da joan-etorria biraketa?',

  ikusi: {
    sim: 'motorra',
    aukerak: { mode: 'biela' },
    html: ({ fig }) => `<div style="max-width:360px;margin-top:16px">${fig('lurrun-lokomotora', 'Lurrun-lokomotora: pistoiaren joan-etorriak gurpilak biratzen ditu.')}</div>`,
    proba: '<b>Proba:</b> aldatu biraderaren besoa 2 cm-tik 6 cm-ra: zer gertatzen da kurtsoarekin? Aldatu eragilea (motorra / konpresorea): mekanismoa bera da, baina zein norabidetan erabiltzen da?'
  },

  ulertu: () => `
    <h3>Zer da?</h3>
    <p class="def">Mekanismo honek <strong>higidura alternatiboa zirkular</strong> bihurtzen du, edo alderantziz. Hiru pieza ditu:</p>
    <ul>
      <li><strong>Biradera (manibela):</strong> ardatz birakari bati lotutako besoa.</li>
      <li><strong>Biela:</strong> biradera eta pistoia lotzen dituen barra.</li>
      <li><strong>Pistoia</strong> (edo buruxka): zuzen mugitzen den pieza.</li>
    </ul>

    <h3>Bi norabideetan</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Norabidea</th><th>Nork eragiten du</th><th>Adibideak</th></tr></thead>
      <tbody>
        <tr><td><strong>Alternatiboa → zirkularra</strong></td><td>Pistoiak bielaren bidez biradera bultzatzen du</td><td>Autoaren motorra, lurrun-makina</td></tr>
        <tr><td><strong>Zirkularra → alternatiboa</strong></td><td>Motorraren biraketak pistoia mugitzen du</td><td>Aire-konpresorea, ponpa, zerra elektrikoa</td></tr>
      </tbody>
    </table></div>

    <h3>Pistoiaren kurtsoa</h3>
    <p>Biradera bira oso batean, pistoiak joan-etorri oso bat egiten du. Joanean egiten duen distantzia (<strong>kurtsoa</strong>) biraderaren luzeraren bikoitza da:</p>
    <div class="formula">kurtsoa = 2 · r<small>r: biraderaren luzera (ardatzetik bielaren lotura-puntura)</small></div>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>Motor baten biraderak 4 cm-ko besoa du. Zenbat mugitzen da pistoia goitik behera?</p>
      <ol><li>kurtsoa = 2 · 4 = 8 cm</li></ol>
      <p class="ans">8 cm. Biradera 3000 rpm-ra badabil, pistoiak 3000 joan-etorri egiten ditu minutuan.</p>
    </div>

    <h3>Birabarkia</h3>
    <p>Hainbat biradera ardatz berean konbinatzen direnean, <strong>birabarkia</strong> deitzen zaio. Zilindro askoko motorretan, pistoi bakoitzak bere biradera du, eta desfasatuta daudenez, beti dago pistoiren bat ardatza bultzatzen.</p>`,

  ariketak: ['kurtsoa'],

  galdetegia: [
    { g: 'Zer lotzen du bielak?', a: ['Bi engranaje', 'Biradera eta pistoia', 'Kama eta jarraitzailea', 'Pinoia eta kremalera'], z: 1,
      zergatik: 'Biela biraderaren eta pistoiaren arteko barra da.' },
    { g: 'Aire-konpresore batean, motor elektrikoaren biraketak pistoia mugitzen du. Zein norabidetan erabiltzen da mekanismoa?', a: ['Alternatiboa → zirkularra', 'Zirkularra → alternatiboa', 'Zirkularra → zirkularra', 'Ez da biela-biradera'], z: 1,
      zergatik: 'Konpresorean motorrak (zirkularra) pistoia mugitzen du (alternatiboa): motorraren alderantzizkoa.' },
    { g: 'Biraderaren besoa 5 cm bada, zein da pistoiaren kurtsoa?', a: ['2,5 cm', '5 cm', '10 cm', '25 cm'], z: 2,
      zergatik: 'Kurtsoa = 2 · r = 2 · 5 = 10 cm.' }
  ]
};
