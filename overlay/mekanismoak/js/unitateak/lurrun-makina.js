// Makina osoak: lurrun-makina
export default {
  izena: 'Lurrun-makina',
  galdera: 'XVIII. mendera arte, makinak gizakiek, animaliek, haizeak edo urak mugitzen zituzten. Nola lortu zuen ikatzak fabrikak eta trenak mugitzea?',

  ikusi: {
    html: ({ fig }) => `
      <div class="eg-grid" style="grid-template-columns:repeat(auto-fill, minmax(260px, 1fr))">
        ${fig('lurrun-makina-watt', 'Boulton eta Watt-en lurrun-makina (1784), grabatu batean.')}
        ${fig('lurrun-lokomotora', 'Lurrun-lokomotora baten zilindroa, biela eta gurpilak.')}
      </div>`,
    proba: 'Lokomotoraren animazioan, bilatu hiru mekanismo: non dago pistoia? Non biela? Zein piezak egiten du biraderaren lana?'
  },

  ulertu: () => `
    <h3>Historia apur bat</h3>
    <p>Lehen lurrun-makina erabilgarria <strong>Thomas Newcomen</strong>-ek eraiki zuen <strong>1712an</strong>, meategietatik ura ponpatzeko. Oso erregai gutxi aprobetxatzen zuen.</p>
    <p><strong>James Watt</strong>-ek <strong>kondentsadore bereizia</strong> asmatu zuen (patentea, 1769): lurruna zilindrotik kanpo hozten zenez, zilindroak ez zuen berotu eta hoztu behar ziklo bakoitzean, eta makina askoz eraginkorragoa bihurtu zen. Gero, biela-biradera eta beste mekanismo batzuekin, <strong>higidura zirkularra</strong> ematea lortu zuten, fabriketako makinak mugitzeko.</p>
    <p>Lurrun-makina Industria Iraultzaren motorra izan zen: ehungintza, meatzaritza, trenak eta itsasontziak.</p>

    <h3>Nola funtzionatzen du</h3>
    <ol>
      <li><strong>Erregaia:</strong> ikatza edo egurra erretzen da labean.</li>
      <li><strong>Galdara:</strong> beroak ura irakiten du eta presio altuko lurruna sortzen da.</li>
      <li><strong>Zilindroa:</strong> lurruna zilindroan sartzen da eta pistoia bultzatzen du (higidura alternatiboa). Balbula batek lurruna txandaka alde batetik eta bestetik sartzen du.</li>
      <li><strong>Biela-biradera:</strong> pistoiaren joan-etorria gurpilen edo gurpil-hegalaren biraketa bihurtzen du.</li>
      <li><strong>Kondentsadorea edo tximinia:</strong> erabilitako lurruna hoztu edo kanporatu egiten da.</li>
    </ol>
    <p class="note"><strong>Energiaren bidea:</strong> erregaiaren energia kimikoa → beroa → lurrunaren presioa → pistoiaren higidura → gurpilen biraketa. Urrats bakoitzean energiaren zati bat galdu egiten da beroan: lurrun-makina zaharrek erregaiaren energiaren % 10 baino gutxiago bihurtzen zuten lan.</p>

    <h3>Zein mekanismo erabiltzen ditu?</h3>
    <ul>
      <li><strong>Biela-biradera:</strong> pistoiaren joan-etorria → biraketa.</li>
      <li><strong>Eszentrikoa:</strong> balbula mugitzeko, une egokian.</li>
      <li><strong>Gurpil-hegala (bolantea):</strong> gurpil astuna, biraketa erregular mantentzeko.</li>
    </ul>`,

  ariketak: [],

  galdetegia: [
    { g: 'Nork eraiki zuen lehen lurrun-makina erabilgarria, eta zertarako?', a: ['James Watt-ek, trenetarako (1769)', 'Thomas Newcomen-ek, meategietako ura ponpatzeko (1712)', 'Arkimedesek, ura igotzeko', 'Henry Ford-ek, autoetarako'], z: 1,
      zergatik: 'Newcomen-en makina (1712) lehenagokoa da; Watt-ek askoz eraginkorrago bihurtu zuen kondentsadore bereiziarekin.' },
    { g: 'Lurrun-makinan, zerk bihurtzen du pistoiaren joan-etorria gurpilen biraketa?', a: ['Galdarak', 'Biela-biraderak', 'Tximiniak', 'Ikatzak'], z: 1,
      zergatik: 'Biela-biradera transformazio-mekanismoa da: alternatiboa → zirkularra.' },
    { g: 'Zer asmatu zuen James Watt-ek makina eraginkorrago bihurtzeko?', a: ['Galdara', 'Pistoia', 'Kondentsadore bereizia', 'Gurpila'], z: 2,
      zergatik: 'Lurruna zilindrotik kanpo hoztuz, zilindroak ez zuen energia galtzen ziklo bakoitzean.' }
  ]
};
