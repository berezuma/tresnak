// Oinarriak: makinak, mekanismoak, atalak eta abantaila mekanikoa
const atalakSvg = `
<svg viewBox="0 0 640 170" role="img" aria-label="Makinaren hiru atalak: eragilea, mekanismoa eta hartzailea">
  <defs><marker id="mk-ar" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0 0 L10 4 L0 8 Z" fill="var(--ink)"/></marker></defs>
  <g font-family="Lato, system-ui, sans-serif" text-anchor="middle">
    <rect x="10" y="30" width="170" height="80" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
    <text x="95" y="62" font-size="17" font-weight="700" fill="var(--ink)">Eragilea</text>
    <text x="95" y="86" font-size="14" fill="var(--ink2)">indarra edo higidura</text>
    <rect x="235" y="30" width="170" height="80" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
    <text x="320" y="62" font-size="17" font-weight="700" fill="var(--ink)">Mekanismoa</text>
    <text x="320" y="86" font-size="14" fill="var(--ink2)">transmititu / transformatu</text>
    <rect x="460" y="30" width="170" height="80" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
    <text x="545" y="62" font-size="17" font-weight="700" fill="var(--ink)">Hartzailea</text>
    <text x="545" y="86" font-size="14" fill="var(--ink2)">lan erabilgarria</text>
    <line x1="182" y1="70" x2="231" y2="70" stroke="var(--ink)" stroke-width="2.5" marker-end="url(#mk-ar)"/>
    <line x1="407" y1="70" x2="456" y2="70" stroke="var(--ink)" stroke-width="2.5" marker-end="url(#mk-ar)"/>
    <text x="95" y="145" font-size="14" fill="var(--ink3)">Bizikletan: hankak</text>
    <text x="320" y="145" font-size="14" fill="var(--ink3)">platera, katea, pinoia</text>
    <text x="545" y="145" font-size="14" fill="var(--ink3)">atzeko gurpila</text>
  </g>
</svg>`;

export default {
  izena: 'Makinak eta mekanismoak',
  galdera: 'Nola altxatzen du garabi batek tonaka pisatzen duen karga, guk eskuz zaku bat altxatzeko ere lan egiten dugunean?',

  ikusi: {
    html: ({ fig }) => `
      <div class="eg-grid">
        ${fig('garabia', 'Garabia: karga astunak altxatzen ditu.', 'photo')}
        ${fig('hondeamakina', 'Hondeamakina: beso hidraulikoa.', 'photo')}
        ${fig('bizikleta', 'Bizikleta: gure indarra gurpiletara.', 'photo')}
        ${fig('motor-elektrikoa', 'Motor elektrikoa, barrutik ikusita.', 'photo')}
      </div>
      <p class="sim-try">Makina hauek guztiek gauza bera egiten dute: <b>indar edo higidura bat hartu eta beste modu batera ematen dute</b>, guk egin beharreko ahalegina errazteko.</p>`
  },

  ulertu: ({ fig }) => `
    <h3>Zer da makina bat?</h3>
    <p class="def"><strong>Makina</strong> lan bat egiteko behar den ahalegina murrizteko edo indarraren norabidea aldatzeko diseinatutako gailua da.</p>
    <p>Makina batzuk oso sinpleak dira (labana, pintzak, palanka bat) eta beste batzuk konplexuak (garabia, igogailua, robota). Makina konplexuak makina sinple eta mekanismo askoren konbinazioa dira.</p>

    <h3>Zer da mekanismo bat?</h3>
    <p class="def"><strong>Mekanismoa</strong> makinaren zati bat da: higidura eta indarra elementu eragiletik elementu hartzailera <strong>transmititzen</strong> edo <strong>transformatzen</strong> ditu.</p>
    <p>Makinaren «lotura-pieza» da. Adibidez: engranajeak, poleak, uhalak, kateak eta palankak.</p>

    <h3>Makinaren hiru atalak</h3>
    <figure class="fig diagram">${atalakSvg}</figure>
    <ol>
      <li><strong>Elementu eragilea:</strong> hasierako indarra edo higidura ematen du. Motor elektrikoa, gasolina-motorra, gure giharrak, haizea edo ur-korrontea.</li>
      <li><strong>Mekanismoa:</strong> higidura hori transmititu edo transformatu egiten du.</li>
      <li><strong>Elementu hartzailea:</strong> lan erabilgarria egiten du. Gurpilak, zerraren orria, zulagailuaren buka, ponparen bultzatzailea.</li>
    </ol>
    <div class="eg-grid">
      ${fig('gasolina-motorra', 'Eragilea: gasolina-motorra.', 'photo')}
      ${fig('engranajeak', 'Mekanismoa: engranajeak.', 'photo')}
      ${fig('zulagailu-buka', 'Hartzailea: zulagailuaren buka.', 'photo')}
      ${fig('ponpa-bultzatzailea', 'Hartzailea: ponparen bultzatzailea.', 'photo')}
    </div>

    <h3>Abantaila mekanikoa</h3>
    <p>Makina batek zenbat «laguntzen» digun neurtzeko, <strong>abantaila mekanikoa</strong> erabiltzen dugu: mugitu nahi dugun erresistentziaren eta egin behar dugun indarraren arteko zatiketa.</p>
    <div class="formula">AM = R / F<small>R: erresistentzia (N) · F: aplikatutako indarra (N)</small></div>
    <div class="worked">
      <h4>Adibidea</h4>
      <p>Palanka batekin 150 N-eko indarra eginez 600 N-eko harri bat mugitzen dugu.</p>
      <ol><li>AM = R / F = 600 / 150 = 4</li></ol>
      <p class="ans">Makinak indarra 4 aldiz biderkatu du.</p>
    </div>
    <p class="note"><strong>Kontuz:</strong> makinek ez dute energia «opari» ematen. Indar gutxiago egiten badugu, bide luzeagoa egin behar dugu: palanka luzeagoa mugitu, soka gehiago tiratu, pedal-bira gehiago eman.</p>
    <p class="note"><strong>Masa eta indarra:</strong> kilogramoak (kg) masa dira, ez indarra. Indarra newtonetan (N) neurtzen da. Pisua kalkulatzeko: <span style="font-family:var(--font-code)">P = m · g</span>, g = 9,8 m/s². 10 kg-ko zaku batek 98 N pisatzen du.</p>

    <h3>Transmisioa eta transformazioa</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Mekanismo mota</th><th>Zer egiten du</th><th>Adibideak</th></tr></thead>
      <tbody>
        <tr><td><strong>Transmisioa</strong></td><td>Higidura mota bera pasatzen du (zirkularra → zirkularra)</td><td>Engranajeak, uhalak, kateak, poleak</td></tr>
        <tr><td><strong>Transformazioa</strong></td><td>Higidura mota aldatzen du (zirkularra ↔ lineala)</td><td>Kremalera, biela-biradera, kamak</td></tr>
      </tbody>
    </table></div>`,

  ariketak: ['abantaila'],

  galdetegia: [
    { g: 'Zein da makina baten helburu nagusia?', a: ['Ezerezetik energia sortzea', 'Lana egiteko ahalegina murriztea edo indarraren norabidea aldatzea', 'Pisua handitzea', 'Ahalik eta pieza gehien izatea'], z: 1,
      zergatik: 'Makinek ez dute energiarik sortzen; indarra biderkatu edo bideratu egiten dute lana errazteko.' },
    { g: 'Bizikleta batean, zein da elementu hartzailea?', a: ['Hankak', 'Katea', 'Atzeko gurpila', 'Platera'], z: 2,
      zergatik: 'Gurpilak egiten du lan erabilgarria (bizikleta aurrera eraman). Hankak eragilea dira, eta platera eta katea mekanismoa.' },
    { g: 'Makina batekin 200 N-eko indarra eginez 1000 N-eko karga mugitzen dugu. Zein da abantaila mekanikoa?', a: ['0,2', '5', '800', '1200'], z: 1,
      zergatik: 'AM = R / F = 1000 / 200 = 5.' },
    { g: '50 kg-ko motxila bat. Zein da haren pisua?', a: ['50 N', '5 N', '490 N', '50 kg da pisua'], z: 2,
      zergatik: 'Pisua indarra da: P = m · g = 50 · 9,8 = 490 N.' }
  ]
};
