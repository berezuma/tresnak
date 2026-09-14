// Oinarriak: higidura motak
const anim = `
<style>
  .hig-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(190px, 1fr)); gap:14px}
  .hig{display:grid; gap:6px; padding:12px; background:var(--sheet); border:1px solid var(--rule)}
  .hig svg{display:block; width:100%; height:auto; background:var(--paper)}
  .hig b{font-family:var(--font-display); font-weight:400; font-size:21px}
  .hig span{font-size:14.5px; color:var(--ink2)}
  @keyframes hig-lin{0%{transform:translateY(0)}100%{transform:translateY(-70px)}}
  @keyframes hig-rot{to{transform:rotate(360deg)}}
  @keyframes hig-alt{0%,100%{transform:translateX(0)}50%{transform:translateX(70px)}}
  @keyframes hig-osc{0%,100%{transform:rotate(-28deg)}50%{transform:rotate(28deg)}}
  .hig-lin{animation:hig-lin 2.6s linear infinite}
  .hig-rot{transform-box:view-box; transform-origin:100px 60px; animation:hig-rot 3s linear infinite}
  .hig-alt{animation:hig-alt 1.6s ease-in-out infinite}
  .hig-osc{transform-box:view-box; transform-origin:100px 14px; animation:hig-osc 1.8s ease-in-out infinite}
  @media (prefers-reduced-motion: reduce){ .hig-lin, .hig-rot, .hig-alt, .hig-osc{animation:none} }
</style>
<div class="hig-grid">
  <div class="hig">
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <line x1="70" y1="10" x2="70" y2="112" stroke="var(--rule)" stroke-width="2"/><line x1="130" y1="10" x2="130" y2="112" stroke="var(--rule)" stroke-width="2"/>
      <g class="hig-lin"><rect x="76" y="80" width="48" height="30" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/></g>
      <path d="M160 100 V30 M152 40 L160 28 L168 40" stroke="var(--ink)" stroke-width="2" fill="none"/>
    </svg>
    <b>Lineala</b><span>Lerro zuzenean, norabide batean. Igogailua, ate lerragarria.</span>
  </div>
  <div class="hig">
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <g class="hig-rot"><circle cx="100" cy="60" r="44" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
        <line x1="100" y1="60" x2="140" y2="60" stroke="var(--ink)" stroke-width="3"/><line x1="100" y1="60" x2="80" y2="25" stroke="var(--ink)" stroke-width="3"/><line x1="100" y1="60" x2="80" y2="95" stroke="var(--ink)" stroke-width="3"/></g>
      <circle cx="100" cy="60" r="5" fill="var(--ink)"/>
    </svg>
    <b>Zirkularra</b><span>Ardatz baten inguruan biraka. Gurpila, haizagailua, engranajea.</span>
  </div>
  <div class="hig">
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <rect x="20" y="40" width="160" height="40" fill="none" stroke="var(--ink3)" stroke-width="2"/>
      <g class="hig-alt"><rect x="24" y="44" width="30" height="32" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/><line x1="54" y1="60" x2="96" y2="60" stroke="var(--ink)" stroke-width="3"/></g>
    </svg>
    <b>Alternatiboa</b><span>Lineala, joan-etorrian. Motorraren pistoia, josteko makinaren orratza.</span>
  </div>
  <div class="hig">
    <svg viewBox="0 0 200 120" aria-hidden="true">
      <line x1="60" y1="14" x2="140" y2="14" stroke="var(--ink)" stroke-width="3"/>
      <g class="hig-osc"><line x1="100" y1="14" x2="100" y2="92" stroke="var(--ink)" stroke-width="2"/><circle cx="100" cy="100" r="12" fill="var(--g3-fill)" stroke="var(--s3)" stroke-width="2"/></g>
    </svg>
    <b>Oszilatzailea</b><span>Zirkularra, joan-etorrian, bira osoa eman gabe. Pendulua, kulunka.</span>
  </div>
</div>`;

export default {
  izena: 'Higidura motak',
  galdera: 'Garbigailuaren danborrak biratu egiten du, eta josteko makinaren orratzak gora eta behera egiten du. Motor bat biratzen ari bada, nola lortzen da orratzaren joan-etorria?',

  ikusi: {
    html: () => anim,
    proba: 'Begiratu lau animazioak: zeinek itzultzen du hasierako tokira? Zeinek egiten du bira osoa? Pentsatu etxean ikusten dituzun bi adibide mota bakoitzeko.'
  },

  ulertu: ({ fig }) => `
    <p>Makinek lau higidura mota nagusi erabiltzen dituzte. Mekanismoak ulertzeko, lehenik jakin behar da zein higidura sartzen den eta zein ateratzen den.</p>
    <h3>1. Lineala</h3>
    <p>Lerro zuzenean egiten den mugimendua, norabide batean. <em>Adibideak:</em> igogailua igotzen, ate lerragarria, garraio-zinta.</p>
    <h3>2. Zirkularra edo birakaria</h3>
    <p>Ardatz finko baten inguruan biratzea. <em>Adibideak:</em> gurpila, haizagailuaren palak, engranajea.</p>
    ${fig('haizagailua', 'Higidura zirkularra: sabaiko haizagailuaren palak.')}
    <h3>3. Alternatiboa</h3>
    <p>Lineala, baina aurrera eta atzera (joan-etorria). <em>Adibideak:</em> motorraren pistoia, haizetako-garbigailuaren ponpa, zerra.</p>
    ${fig('pistoia', 'Higidura alternatiboa: motor baten pistoia.')}
    <h3>4. Oszilatzailea</h3>
    <p>Zirkularra, baina aurrera eta atzera, bira osoa eman gabe. <em>Adibideak:</em> pendulua, kulunka, haizetako-garbigailuaren besoa.</p>

    <h3>Sarrera eta irteera</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Sarrera</th><th>Irteera</th><th>Mekanismo mota</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td>Zirkularra</td><td>Zirkularra</td><td>Transmisioa</td><td>Engranajeak, uhalak, kateak</td></tr>
        <tr><td>Lineala</td><td>Lineala</td><td>Transmisioa</td><td>Palanka, polea</td></tr>
        <tr><td>Zirkularra</td><td>Lineala edo alternatiboa</td><td>Transformazioa</td><td>Kremalera, kama, biela-biradera</td></tr>
        <tr><td>Lineala edo alternatiboa</td><td>Zirkularra</td><td>Transformazioa</td><td>Biela-biradera (motorra), kremalera</td></tr>
      </tbody>
    </table></div>
    <p class="note"><strong>Itzulgarriak dira:</strong> mekanismo bera bi noranzkoetan erabil daiteke. Autoaren motorrean, pistoiaren joan-etorriak (alternatiboa) birabarkia biratzen du (zirkularra); konpresore batean, alderantziz: motorraren biraketak pistoia mugitzen du.</p>`,

  ariketak: [],

  galdetegia: [
    { g: 'Motor baten pistoiak zilindroaren barruan gora eta behera egiten du. Zein higidura da?', a: ['Lineala', 'Zirkularra', 'Alternatiboa', 'Oszilatzailea'], z: 2,
      zergatik: 'Lineala da, baina joan-etorrian: alternatiboa.' },
    { g: 'Haizetako-garbigailuaren besoak alde batera eta bestera egiten du, bira osoa eman gabe. Zein higidura da?', a: ['Oszilatzailea', 'Alternatiboa', 'Zirkularra', 'Lineala'], z: 0,
      zergatik: 'Ardatz baten inguruan joan-etorria, bira osoa eman gabe: oszilatzailea.' },
    { g: 'Zein da transformazio-mekanismo bat?', a: ['Uhal-transmisioa', 'Engranaje-trena', 'Biela-biradera', 'Katea'], z: 2,
      zergatik: 'Biela-biraderak higidura alternatiboa zirkular bihurtzen du (edo alderantziz): higidura mota aldatzen du.' },
    { g: 'Biela-biradera bat bi noranzkoetan erabil daiteke?', a: ['Ez, beti zirkularretik linealera', 'Ez, beti linealetik zirkularrera', 'Bai: motorrean lineala → zirkularra, konpresorean zirkularra → lineala', 'Bai, baina engranajeekin bakarrik'], z: 2,
      zergatik: 'Mekanismo gehienak itzulgarriak dira; adibidean zein norabidetan erabiltzen den begiratu behar da.' }
  ]
};
