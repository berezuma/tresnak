import { ikurra } from '../sim/laborategia.js';

const ik = (c, izena) => `<figure class="fig" style="text-align:center"><svg viewBox="-46 -28 92 56" width="92" height="56" aria-hidden="true">${ikurra(c, {})}</svg><figcaption>${izena}</figcaption></figure>`;
const custom = (inner, izena) => `<figure class="fig" style="text-align:center"><svg viewBox="-46 -28 92 56" width="92" height="56" aria-hidden="true"><g stroke="var(--ink)" stroke-width="2.5" fill="none" stroke-linecap="round">${inner}</g></svg><figcaption>${izena}</figcaption></figure>`;

const IKURRAK = [
  ik({ mota: 'pila' }, 'Pila (+ marra luzea)'),
  ik({ mota: 'kablea' }, 'Kablea (eroalea)'),
  ik({ mota: 'bonbilla' }, 'Bonbilla'),
  ik({ mota: 'erresistentzia' }, 'Erresistentzia'),
  custom('<line x1="-40" y1="0" x2="-15" y2="0"/><line x1="15" y1="0" x2="40" y2="0"/><circle r="15" fill="var(--sheet)"/><text x="0" y="6" text-anchor="middle" font-size="17" font-weight="700" fill="var(--ink)" stroke="none" font-family="Lato, sans-serif">M</text>', 'Motorra'),
  custom('<line x1="-40" y1="0" x2="-12" y2="0"/><line x1="12" y1="0" x2="40" y2="0"/><path d="M-12 -12 L12 0 L-12 12 Z" fill="var(--sheet)"/><line x1="12" y1="-12" x2="12" y2="12"/><path d="M2 -16 L10 -24 M5 -24 L10 -24 L10 -19 M10 -12 L18 -20 M13 -20 L18 -20 L18 -15" stroke-width="1.8"/>', 'LEDa'),
  ik({ mota: 'etengailua', itxita: false }, 'Etengailua (irekita)'),
  ik({ mota: 'etengailua', itxita: true }, 'Etengailua (itxita)'),
  custom('<line x1="-40" y1="0" x2="-14" y2="0"/><line x1="14" y1="0" x2="40" y2="0"/><circle cx="-14" r="3" fill="var(--ink)"/><circle cx="14" r="3" fill="var(--sheet)"/><line x1="-16" y1="-10" x2="16" y2="-10"/><line x1="0" y1="-10" x2="0" y2="-22"/>', 'Pultsagailua'),
  custom('<line x1="-40" y1="0" x2="-14" y2="0"/><circle cx="-14" r="3" fill="var(--ink)"/><line x1="-14" y1="0" x2="12" y2="-12"/><circle cx="14" cy="-14" r="3" fill="var(--sheet)"/><circle cx="14" cy="14" r="3" fill="var(--sheet)"/><line x1="17" y1="-14" x2="40" y2="-14"/><line x1="17" y1="14" x2="40" y2="14"/>', 'Kommutadorea'),
  ik({ mota: 'fusiblea' }, 'Fusiblea'),
  ik({ mota: 'amperimetroa' }, 'Amperimetroa'),
  ik({ mota: 'voltimetroa' }, 'Voltimetroa')
];

export default {
  izena: 'Zirkuitu elektrikoa',
  galdera: 'Zer behar da bonbilla bat pizteko? Pila eta bonbilla nahikoa al dira?',

  ikusi: {
    sim: 'laborategia',
    aukerak: { adibidea: 'sinplea', adibideak: ['sinplea', 'seriea', 'paraleloa', 'etxea'] },
    proba: 'Sakatu <b>S1</b> etengailua irekitzeko eta ixteko. Gero aukeratu <b>Kablea</b> eta lotu bonbillaren bi muturrak kable batez: zergatik itzaltzen da, eta zer abisu agertzen da? Kargatu «Etxeko argiak» adibidea eta piztu argiak banan-banan.'
  },

  ulertu: () => `
    <p class="def"><strong>Zirkuitu elektrikoa</strong> korronte elektrikoa igarotzeko bide itxia da. Bide hori irekitzen bada (etengailu bat, kable eten bat…), korrontea gelditu egiten da zirkuitu osoan.</p>

    <h3>Zirkuitu baten elementuak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Elementua</th><th>Zertarako</th><th>Adibideak</th></tr></thead>
      <tbody>
        <tr><td><strong>Sorgailuak</strong></td><td>Energia elektrikoa ematen dute: elektroiak "bultzatzen" dituzte.</td><td>Pila, bateria, dinamoa, eguzki-panela</td></tr>
        <tr><td><strong>Eroaleak</strong></td><td>Elementuak lotzen dituzte, korrontea eramateko.</td><td>Kobrezko kableak, zirkuitu inprimatuko pistak</td></tr>
        <tr><td><strong>Hartzaileak</strong></td><td>Energia elektrikoa beste energia mota batean bihurtzen dute.</td><td>Bonbilla eta LEDa (argia), motorra (mugimendua), berogailua (beroa), txirrina (soinua)</td></tr>
        <tr><td><strong>Kontrol-elementuak</strong></td><td>Korrontea nahi dugunean igarotzen utzi edo eteten dute.</td><td>Etengailua, pultsagailua, kommutadorea</td></tr>
        <tr><td><strong>Babes-elementuak</strong></td><td>Zirkuitua eta pertsonak babesten dituzte korronte arriskutsuetatik.</td><td>Fusiblea, etengailu magnetotermikoa, etengailu diferentziala</td></tr>
      </tbody>
    </table></div>

    <h3>Ikurrak</h3>
    <p>Eskemetan elementuak ikur normalizatuen bidez marrazten dira, eta kableak lerro zuzenen bidez. Hauek dira ikur ohikoenak:</p>
    <div class="eg-grid" style="grid-template-columns:repeat(auto-fill, minmax(120px, 1fr))">${IKURRAK.join('')}</div>

    <h3>Zirkuitu irekia, itxia eta zirkuitulaburra</h3>
    <ul>
      <li><strong>Zirkuitu itxia:</strong> bidea osoa da; korrontea igarotzen da eta hartzaileek funtzionatzen dute.</li>
      <li><strong>Zirkuitu irekia:</strong> bidea etenda dago (etengailua irekita, kable bat askatuta, bonbilla fundituta…); ez da korronterik igarotzen.</li>
      <li><strong>Zirkuitulaburra:</strong> korronteak ia erresistentziarik gabeko bide bat aurkitzen du, hartzaileak saihestuta. Korrontea oso handia da: kableak berotu, pila hustu eta sua ere sor daiteke.</li>
    </ul>
    <p class="note">Etxeko instalazioetan zirkuitulaburretatik babesteko, lehen <strong>fusibleak</strong> erabiltzen ziren (hari mehe bat, korrontea handiegia denean urtzen dena). Gaur egun <strong>etengailu magnetotermikoak</strong> daude: korrontea eteten dute eta berriro konekta daitezke.</p>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> pila eta bonbilla ez dira nahikoa: bide itxi bat behar da, pilaren borna batetik bonbillara eta bonbillatik beste bornara. Eta etengailu batekin kontrolatzen da noiz piztu.</p>

    <details class="sakondu" data-maila="2"><summary>Eskailera-argia: bi kommutadore</summary><div class="in">
      <p><strong>Kommutadoreak</strong> korrontea bi bideren artean aldatzen du. Bi kommutadore bi kablez lotuta, argi bat bi lekutatik piztu eta itzal daiteke (eskaileraren behean eta goian, edo logela bateko sarreran eta ohe ondoan).</p>
      <p>Bi kommutadoreak "posizio berean" daudenean bidea itxita dago; bat aldatzean, bidea ireki egiten da, eta bestea aldatzean berriro ixten da.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Sorgailu ideala eta erreala</summary><div class="in">
      <p>Sorgailu ideal batek tentsio bera ematen du beti, zenbat korronte eskatu arren. Sorgailu errealak <strong>indar elektroeragilea</strong> (i.e.e., ε) eta <strong>barne-erresistentzia</strong> (r) ditu: korrontea handitzean, bornen arteko tentsioa jaitsi egiten da:</p>
      <div class="formula">V = ε − r · I</div>
      <p>Horregatik jaisten da auto baten argien distira motorra abiaraztean. «Sorgailu errealak» atalean sakonduko dugu.</p>
    </div></details>`,

  galdetegia: [
    { g: 'Zertarako balio du sorgailuak zirkuitu batean?', a: ['Energia elektrikoa emateko, elektroiak bultzatuz', 'Korrontea gelditzeko', 'Zirkuitua babesteko', 'Korrontea neurtzeko'], z: 0, zergatik: 'Sorgailuak (pila, bateria…) ematen du korrontea mugitzeko behar den energia.' },
    { g: 'Zein da hartzailea?', a: ['Pila', 'Etengailua', 'Motorra', 'Fusiblea'], z: 2, zergatik: 'Motorrak energia elektrikoa mugimendu bihurtzen du: hartzailea da. Pila sorgailua da, etengailua kontrola eta fusiblea babesa.' },
    { g: 'Noiz gertatzen da zirkuitulaburra?', a: ['Korronteak ia erresistentziarik gabeko bide bat aurkitzen duenean', 'Etengailua irekita dagoenean', 'Bonbilla fundituta dagoenean', 'Pila hustuta dagoenean'], z: 0, zergatik: 'Erresistentzia ia zero bada, korrontea oso handia da (I = V / R): hori da zirkuitulaburra.' },
    { g: 'Zein da fusiblearen funtzioa?', a: ['Korrontea handiegia denean zirkuitua etetea', 'Tentsioa handitzea', 'Korrontea neurtzea', 'Energia gordetzea'], z: 0, zergatik: 'Fusiblearen haria urtu egiten da korrontea handiegia denean, eta zirkuitua irekitzen du.' },
    { g: 'Eskema batean bi marra paralelo ikusten dituzu: bata luzea eta mehea, bestea laburra eta lodia. Zer da?', a: ['Pila', 'Erresistentzia', 'Bonbilla', 'Etengailua'], z: 0, zergatik: 'Pilaren ikurra da: marra luzea borna positiboa (+) da, eta laburra negatiboa (−).' },
    { g: 'Etengailua irekita badago zirkuitu sinple batean:', a: ['Bonbilla piztuta dago', 'Ez da korronterik igarotzen', 'Korrontea bikoiztu egiten da', 'Zirkuitulaburra dago'], z: 1, zergatik: 'Etengailu irekiak bidea eteten du: zirkuitu irekia da eta ez dago korronterik.' },
    { g: 'Eskailera bateko argia behean eta goian piztu eta itzali nahi da. Zer erabili?', a: ['Bi kommutadore', 'Bi fusible', 'Bi pultsagailu seriean', 'Etengailu bakar bat'], z: 0, maila: 2, zergatik: 'Bi kommutadorerekin edozein lekutatik alda daiteke argiaren egoera.' },
    { g: 'Sorgailu erreal batek korronte handiagoa ematean, bere bornen arteko tentsioa:', a: ['Jaitsi egiten da', 'Igo egiten da', 'Ez da aldatzen', 'Zero bihurtzen da'], z: 0, maila: 3, zergatik: 'V = ε − r · I: barne-erresistentzian galtzen den tentsioa korrontearekin handitzen da.' }
  ]
};
