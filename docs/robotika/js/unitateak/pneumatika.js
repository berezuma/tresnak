import { nahastu } from '../util.js';
import { balbula, zilindroa, iturria, ihesa, testua } from '../sim/pneumatika-ikurrak.js';

const ATALAK = `<figure class="fig diagram" style="max-width:680px">
  <svg viewBox="0 0 680 150" role="img" aria-label="Instalazio pneumatiko baten atalak: konpresorea, biltegia, unitate prestatzailea, balbulak eta eragingailuak">
    <defs><marker id="pn-g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 Z" style="fill:var(--ink)"/></marker></defs>
    <g style="fill:var(--sheet);stroke:var(--ink);stroke-width:2.5">
      <rect x="6" y="36" width="118" height="80"/><rect x="146" y="36" width="118" height="80"/><rect x="286" y="36" width="118" height="80" style="fill:var(--g2-fill)"/>
      <rect x="426" y="36" width="110" height="80" style="fill:var(--g1-fill)"/><rect x="558" y="36" width="116" height="80" style="fill:var(--g3-fill)"/>
    </g>
    <g style="stroke:var(--ink);stroke-width:2.5;fill:none"><line x1="126" y1="76" x2="142" y2="76" marker-end="url(#pn-g)"/><line x1="266" y1="76" x2="282" y2="76" marker-end="url(#pn-g)"/><line x1="406" y1="76" x2="422" y2="76" marker-end="url(#pn-g)"/><line x1="538" y1="76" x2="554" y2="76" marker-end="url(#pn-g)"/></g>
    <g style="font-family:Lato, system-ui, sans-serif;fill:var(--ink)" text-anchor="middle">
      <text x="65" y="66" style="font-weight:700;font-size:15px">Konpresorea</text><text x="65" y="88" style="font-size:12.5px;fill:var(--ink2)">airea hartu eta</text><text x="65" y="104" style="font-size:12.5px;fill:var(--ink2)">konprimitu</text>
      <text x="205" y="66" style="font-weight:700;font-size:15px">Biltegia</text><text x="205" y="88" style="font-size:12.5px;fill:var(--ink2)">airea metatu,</text><text x="205" y="104" style="font-size:12.5px;fill:var(--ink2)">presioa egonkortu</text>
      <text x="345" y="60" style="font-weight:700;font-size:15px">Unitate</text><text x="345" y="77" style="font-weight:700;font-size:15px">prestatzailea</text><text x="345" y="96" style="font-size:12.5px;fill:var(--ink2)">iragazi, erregulatu</text><text x="345" y="111" style="font-size:12.5px;fill:var(--ink2)">eta lubrifikatu</text>
      <text x="481" y="66" style="font-weight:700;font-size:15px">Balbulak</text><text x="481" y="88" style="font-size:12.5px;fill:var(--ink2)">airea bideratu</text><text x="481" y="104" style="font-size:12.5px;fill:var(--ink2)">(kontrola)</text>
      <text x="616" y="66" style="font-weight:700;font-size:15px">Eragingailuak</text><text x="616" y="88" style="font-size:12.5px;fill:var(--ink2)">zilindroak,</text><text x="616" y="104" style="font-size:12.5px;fill:var(--ink2)">motor pneumatikoak</text>
      <text x="135" y="22" style="font-size:13px;font-weight:700;fill:var(--s1)">aire konprimitua sortu</text>
      <text x="345" y="22" style="font-size:13px;font-weight:700;fill:var(--s1)">prestatu</text>
      <text x="548" y="22" style="font-size:13px;font-weight:700;fill:var(--s1)">kontrolatu eta lan egin</text>
    </g>
  </svg>
  <figcaption>Instalazio pneumatiko baten atalak, airearen bidean.</figcaption>
</figure>`;

function ikurrak() {
  const z1 = zilindroa({ x: 20, y: 36, L: 150, bakuna: true });
  const z2 = zilindroa({ x: 20, y: 122, L: 150 });
  const v1 = balbula({ sx: 290, y: 60, mota: '32', pos: 0 });
  const v2 = balbula({ sx: 510, y: 60, mota: '52', pos: 0, ezk: 'pilotua', esk: 'malgukia' });
  let s = z1.svg + z2.svg + v1.svg + v2.svg + iturria(v1.portua('P')) + ihesa(v1.portua('R')) + iturria(v2.portua('1')) + ihesa(v2.portua('5')) + ihesa(v2.portua('3'));
  s += testua(105, 24, 'Efektu bakuneko zilindroa') + testua(105, 110, 'Efektu bikoitzeko zilindroa');
  s += testua(v1.portua('A')[0] - 4, 54, '2', 'pn-port', 'end') + testua(v1.portua('P')[0] - 5, 122, '1', 'pn-port', 'end') + testua(v1.portua('R')[0] + 6, 122, '3', 'pn-port', 'start');
  [['4', 'end', -4, 54], ['2', 'start', 4, 54], ['5', 'end', -5, 122], ['1', 'end', -5, 122], ['3', 'start', 6, 122]].forEach(([k, a, dx, y]) => { s += testua(v2.portua(k)[0] + dx, y, k, 'pn-port', a); });
  s += testua(280, 176, '3/2 NI balbula') + testua(280, 192, 'sakagailua eta malgukia') + testua(552, 176, '5/2 balbula') + testua(552, 192, 'pilotua eta malgukia');
  return `<figure class="fig diagram" style="max-width:680px"><svg viewBox="0 0 680 204" role="img" aria-label="Ikur pneumatikoak: efektu bakuneko eta bikoitzeko zilindroak, 3/2 eta 5/2 balbulak"><g class="pn">${s}</g></svg>
    <figcaption>Ikurrak atseden-posizioan. Balbula bateko kutxa bakoitza posizio bat da; geziek airearen bidea adierazten dute, eta T ikurrak bide itxia.</figcaption></figure>`;
}

export default {
  izena: 'Pneumatika',
  galdera: 'Nola irekitzen eta ixten dira autobus baten ateak, hain indar handiarekin eta hain leun, motor elektrikorik gabe?',

  ikusi: {
    sim: 'pneumatika',
    proba: '<b>Efektu bakunekoa:</b> sakatu eta eutsi botoia; askatzean, malgukiak itzultzen du zilindroa. <b>Efektu bikoitzekoa:</b> igo karga zilindroa gelditu arte; gero aurkitu presio edo diametro handiago batekin nola mugitzen den berriro. Konparatu aurrera eta atzera egiteko indarrak. <b>Palanka:</b> ikusi balbulak posizioa gogoratzen duela.'
  },

  ulertu: () => `
    <p class="def"><strong>Pneumatikak</strong> aire konprimitua erabiltzen du energia transmititzeko eta mugimenduak sortzeko. Industrian oso ohikoa da: piezak mugitu, prentsatu, estutu edo ateak ireki. <strong>Hidraulikak</strong>, berriz, olioa erabiltzen du, indar askoz handiagoetarako (hondeamakinak, prentsak).</p>

    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Abantailak</th><th>Desabantailak</th></tr></thead>
      <tbody><tr>
        <td><ul><li>Airea doakoa eta nonahikoa da.</li><li>Garbia: ihesek ez dute ezer zikintzen.</li><li>Mugimendu azkarrak eta erregulagarriak.</li><li>Segurua: ez du txinpartarik sortzen, eta gainkargak ez ditu osagaiak hondatzen.</li></ul></td>
        <td><ul><li>Indar mugatuak (airea konprimitu egiten da).</li><li>Posizio zehatzak lortzea zaila da.</li><li>Zaratatsua (ihesak).</li><li>Airea prestatu behar da: ura eta hautsa kendu.</li></ul></td>
      </tr></tbody>
    </table></div>

    <h3>Instalazio pneumatiko baten atalak</h3>
    ${ATALAK}
    <p><strong>Unitate prestatzaileak</strong> hiru osagai ditu: <strong>iragazkia</strong> (ura eta hautsa kendu), <strong>presio-erregulagailua</strong> manometroarekin (lan-presioa finkatu, 6 bar inguru) eta <strong>lubrifikatzailea</strong> (olio-tanta txikiak, osagaiak ez higatzeko).</p>

    <h3>Presioa</h3>
    <div class="formula">p = F / A &nbsp;&nbsp;→&nbsp;&nbsp; F = p · A<small>1 bar = 100 000 Pa = 0,1 N/mm² ≈ 1 atm</small></div>
    <p>Manometroek <strong>presio erlatiboa</strong> neurtzen dute (atmosferaren gainetik): «6 bar» esaten denean, aireak atmosferak baino 6 bar gehiago bultzatzen du.</p>

    <h3>Zilindroak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th></th><th>Efektu bakunekoa</th><th>Efektu bikoitzekoa</th></tr></thead>
      <tbody>
        <tr><td><strong>Airea</strong></td><td>Ganbera bakar batean</td><td>Bi ganberetan, txandaka</td></tr>
        <tr><td><strong>Itzulera</strong></td><td>Malgukiak</td><td>Aireak</td></tr>
        <tr><td><strong>Indarra</strong></td><td>Noranzko batean (malgukiarena kenduta)</td><td>Bi noranzkoetan</td></tr>
        <tr><td><strong>Erabilera</strong></td><td>Estutu, markatu, ibilbide laburrak</td><td>Bultzatu eta tiratu, ibilbide luzeak</td></tr>
      </tbody>
    </table></div>
    <div class="formula">F<sub>aurrera</sub> = p · π · D² / 4 &nbsp;&nbsp;·&nbsp;&nbsp; F<sub>atzera</sub> = p · π · (D² − d²) / 4<small>D enboloaren diametroa · d zurtoinarena</small></div>
    <p>Atzera egitean, zurtoinak enboloaren azaleraren zati bat hartzen du; horregatik, indarra txikiagoa da.</p>

    <div class="worked">
      <h4>Adibidea: 40 mm-ko zilindroa 6 bar-ekin</h4>
      <p>Enboloaren diametroa 40 mm da eta zurtoinarena 16 mm. Presioa 6 bar.</p>
      <ol>
        <li>p = 6 bar = 0,6 N/mm²</li>
        <li>A = π · 40² / 4 = 1256,6 mm² → F<sub>aurrera</sub> = 0,6 · 1256,6 = 754 N</li>
        <li>A' = π · (40² − 16²) / 4 = 1055,6 mm² → F<sub>atzera</sub> = 0,6 · 1055,6 = 633 N</li>
      </ol>
      <p class="ans">754 N inguru: 75 kg-ko pisu bat altxatzeko adina (marruskadura kontuan hartu gabe).</p>
    </div>

    <h3>Balbulak</h3>
    <p>Balbulak <strong>bide</strong>-kopuruarekin eta <strong>posizio</strong>-kopuruarekin izendatzen dira: <strong>3/2</strong> balbulak 3 bide (portu) eta 2 posizio ditu. Posizio bakoitza kutxa bat da ikurrean.</p>
    ${ikurrak()}
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Portua</th><th>Esanahia</th></tr></thead>
      <tbody>
        <tr><td><strong>1</strong> (P)</td><td>Elikadura: aire konprimitua sartzen da</td></tr>
        <tr><td><strong>2, 4</strong> (A, B)</td><td>Lan-irteerak: zilindrora doaz</td></tr>
        <tr><td><strong>3, 5</strong> (R, S)</td><td>Ihesak: airea kanpora ateratzen da</td></tr>
        <tr><td><strong>12, 14</strong></td><td>Pilotaje-seinaleak (14 → 1 eta 4 lotu; 12 → 1 eta 2 lotu)</td></tr>
      </tbody>
    </table></div>
    <p><strong>Aginte-motak:</strong> eskuzkoak (sakagailua, palanka, pedala), mekanikoak (malgukia, rola), pneumatikoak (pilotua: beste balbula baten aire-seinalea) eta elektrikoak (elektroimana). <strong>Normalki itxia</strong> (NI) balbula batek ez du airea pasatzen uzten atsedenean.</p>
    <p>Beste osagai batzuk: <strong>emari-erregulagailuak</strong> zilindroaren abiadura kontrolatzen du, airearen irteera murriztuz; <strong>atzera-ezinezko balbulak</strong> noranzko bakarrean uzten du pasatzen airea (diodo baten antzera).</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> autobusaren motorrak konpresore bat mugitzen du, eta airea biltegi batean gordetzen da. Gidariak botoia sakatzean, balbula batek airea efektu bikoitzeko zilindro baten ganbera batera edo bestera bidaltzen du. Emari-erregulagailuek irteerako airea murrizten dute, atea leun mugi dadin, eta aireak, konprimitzen denez, ez du inor zapaltzen.</p>

    <details class="sakondu" data-maila="2"><summary>Aire-kontsumoa</summary><div class="in">
      <p>Zilindro batek, ibilbide bakoitzean, bere ganberaren bolumena betetzeko adina aire behar du:</p>
      <div class="formula">V = A · L<small>L ibilbidea da. Efektu bikoitzekoan: V<sub>zikloa</sub> = π · D² / 4 · L + π · (D² − d²) / 4 · L</small></div>
      <p>Konpresorea aukeratzeko, zilindro guztien minutuko kontsumoa batzen da. Kontuan hartu behar da aire hori konprimituta dagoela: 6 bar-eko 1 litro, atmosferako 7 litro inguru dira.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Hidraulika eta Pascal-en printzipioa</summary><div class="in">
      <p>Fluido batean eragindako presioa berdin transmititzen da norabide guztietan (<strong>Pascal-en printzipioa</strong>). Horregatik, bi enbolo lotuta badaude, indarrak azaleren proportzionalak dira:</p>
      <div class="formula">F₁ / A₁ = F₂ / A₂</div>
      <p>Olioa ia ez da konprimitzen: horregatik lortzen dira indar oso handiak eta posizio zehatzak, baina instalazioa garestiagoa eta zikinagoa da, eta olioa depositura itzuli behar da. Aireak, berriz, atmosferara egiten du ihes.</p>
    </div></details>`,

  ariketak: ['pn-indarra', 'pn-kontsumoa'],

  galdetegia: nahastu([
    { g: 'Zer du efektu bakuneko zilindro batek itzultzeko?', a: ['Malguki bat', 'Aire konprimitua beste ganberan', 'Motor elektriko bat', 'Grabitatea bakarrik'], z: 0, zergatik: 'Airea ganbera bakarrean sartzen da; malgukiak itzultzen du enboloa.' },
    { g: 'Zenbat bide eta posizio ditu 5/2 balbula batek?', a: ['5 bide eta 2 posizio', '5 posizio eta 2 bide', '2 sarrera eta 5 irteera', '5 zilindro eta 2 botoi'], z: 0, zergatik: 'Lehen zenbakia bideak (portuak) dira eta bigarrena posizioak (kutxak).' },
    { g: 'Zein osagaik kentzen ditu ura eta hautsa aire konprimituari?', a: ['Unitate prestatzailearen iragazkiak', 'Konpresoreak', 'Zilindroak', 'Balbulak'], z: 0, zergatik: 'Unitate prestatzaileak iragazi, erregulatu eta lubrifikatu egiten du.' },
    { g: 'Zilindro batean presioa bikoizten bada (diametro berarekin), indarra…', a: ['bikoiztu egiten da', 'lau aldiz handiagoa da', 'ez da aldatzen', 'erdira jaisten da'], z: 0, zergatik: 'F = p · A: presioarekiko proportzionala da.' },
    { g: 'Diametroa bikoizten bada (presio berarekin), indarra…', a: ['lau aldiz handiagoa da', 'bikoiztu egiten da', 'ez da aldatzen', 'erdira jaisten da'], z: 0, zergatik: 'A = π · D² / 4: diametroa bikoiztean azalera 4 aldiz handiagoa da.' },
    { g: 'Zergatik da txikiagoa efektu bikoitzeko zilindroaren atzera egiteko indarra?', a: ['Zurtoinak enboloaren azaleraren zati bat hartzen duelako', 'Malgukiak kontra egiten duelako', 'Presioa txikiagoa delako itzuleran', 'Ez da txikiagoa'], z: 0, zergatik: 'Atzeko aldean aireak A − a azalera bultzatzen du (a = zurtoinaren azalera).' },
    { g: 'Balbula batean, zer adierazten du 1 zenbakiak?', a: ['Elikadura (aire konprimitua sartzen den portua)', 'Ihesa', 'Lan-irteera', 'Pilotaje-seinalea'], z: 0, zergatik: '1 = elikadura; 2 eta 4 lan-irteerak; 3 eta 5 ihesak.' },
    { g: 'Zer da 3/2 balbula normalki itxi bat (NI)?', a: ['Atsedenean airea pasatzen uzten ez duena', 'Beti irekita dagoena', 'Hiru posizio dituena', 'Ez duena ihesik'], z: 0, zergatik: 'Eragin gabe (atsedenean), elikadura itxita dago.' },
    { g: 'Zer osagaik kontrolatzen du zilindro baten abiadura?', a: ['Emari-erregulagailuak', 'Manometroak', 'Lubrifikatzaileak', 'Biltegiak'], z: 0, maila: 2, zergatik: 'Airearen emaria murrizten du, eta zilindroa mantsoago mugitzen da.' },
    { g: 'Zergatik lortzen du hidraulikak pneumatikak baino indar handiagoak?', a: ['Olioa ia ez delako konprimitzen, eta presio askoz handiagoak erabiltzen direlako', 'Olioa airea baino arinagoa delako', 'Motor elektrikoak dituelako', 'Ez da egia'], z: 0, maila: 3, zergatik: 'Sistema hidraulikoek 100–300 bar erabiltzen dituzte, eta pneumatikoek 6–10 bar.' }
  ])
};
