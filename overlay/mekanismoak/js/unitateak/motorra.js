// Makina osoak: lau aldiko motorra
export default {
  izena: 'Lau aldiko motorra',
  galdera: 'Gasolina-tanta txiki batek autoa mugitzen du. Zer gertatzen da zilindroaren barruan segundoko dozenaka aldiz?',

  ikusi: {
    sim: 'motorra',
    aukerak: { mode: 'motorra' },
    html: ({ fig }) => `<div style="max-width:340px;margin-top:16px">${fig('lau-aldiko-motorra', 'Motor erreal baten 3D animazioa: goian, bi kamak balbulak irekitzen dituzte.')}</div>`,
    proba: '<b>Proba:</b> gelditu animazioa aldi bakoitzean: pistoia gora ala behera doa? Zein balbula dago irekita? Begiratu kama-ardatzari: zenbat bira ematen ditu birabarkiak bi ematen dituen bitartean?'
  },

  ulertu: () => `
    <h3>Lau aldiak</h3>
    <p>Zilindro bakoitzean pistoiak lau mugimendu egiten ditu, eta hori da <strong>zikloa</strong>. Lau mugimendu horietatik bakar batek egiten du lana; beste hiruretan birabarkiak eta gurpil-hegalak eramaten dute pistoia.</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Aldia</th><th>Pistoia</th><th>Sarrera-balbula</th><th>Ihes-balbula</th><th>Zer gertatzen da</th></tr></thead>
      <tbody>
        <tr><td><strong>1. Sarrera</strong></td><td>Behera</td><td>Irekita</td><td>Itxita</td><td>Aire eta gasolina nahasketa sartzen da</td></tr>
        <tr><td><strong>2. Konpresioa</strong></td><td>Gora</td><td>Itxita</td><td>Itxita</td><td>Nahasketa estutu egiten da</td></tr>
        <tr><td><strong>3. Leherketa</strong></td><td>Behera</td><td>Itxita</td><td>Itxita</td><td>Bujiaren txinpartak nahasketa erretzen du; gasek pistoia indarrez bultzatzen dute. <strong>Lana sortzen duen aldi bakarra.</strong></td></tr>
        <tr><td><strong>4. Ihesa</strong></td><td>Gora</td><td>Itxita</td><td>Irekita</td><td>Erretako gasak kanporatzen dira</td></tr>
      </tbody>
    </table></div>

    <h3>Mekanismo guztiak elkarrekin</h3>
    <ul>
      <li><strong>Biela-biradera (birabarkia):</strong> pistoien joan-etorria → biraketa.</li>
      <li><strong>Kamak (kama-ardatza):</strong> balbulak ireki eta ixten dituzte une zehatzean.</li>
      <li><strong>Uhala, katea edo engranajeak (banaketa):</strong> birabarkiak kama-ardatza mugitzen du.</li>
      <li><strong>Gurpil-hegala:</strong> leherketen artean biraketa mantentzen du.</li>
    </ul>
    <p class="note ok"><strong>Zergatik 2:1?</strong> Ziklo oso batean (lau aldi) birabarkiak <strong>bi bira</strong> ematen ditu, baina balbula bakoitza behin bakarrik ireki behar da. Horregatik, kama-ardatzak birabarkiaren <strong>abiaduraren erdian</strong> biratzen du: banaketako pinoiak kama-ardatzekoaren hortzen erdiak ditu.</p>

    <div class="worked">
      <h4>Adibidea</h4>
      <p>Motor bat 3000 rpm-ra dabil. Zein abiaduratan biratzen du kama-ardatzak? Zilindro bakoitzean, zenbat leherketa gertatzen dira minutuan?</p>
      <ol>
        <li>Kama-ardatza: 3000 / 2 = 1500 rpm</li>
        <li>Leherketa bat ziklo bakoitzeko = bi bira bakoitzeko: 3000 / 2 = 1500 leherketa minutuan</li>
      </ol>
      <p class="ans">1500 rpm eta 1500 leherketa minutuan (25 segundoko), zilindro bakoitzean.</p>
    </div>`,

  ariketak: ['motorra', 'kurtsoa'],

  galdetegia: [
    { g: 'Lau aldietatik, zeinek sortzen du lana?', a: ['Sarrerak', 'Konpresioak', 'Leherketak', 'Ihesak'], z: 2,
      zergatik: 'Leherketan gasen hedapenak bultzatzen du pistoia; beste aldiak birabarkiaren biraketak eramaten ditu.' },
    { g: 'Konpresio aldian, nola daude balbulak?', a: ['Biak irekita', 'Sarrerakoa irekita', 'Ihesekoa irekita', 'Biak itxita'], z: 3,
      zergatik: 'Nahasketa estutzeko, zilindroa itxita egon behar da.' },
    { g: 'Motor bat 2400 rpm-ra badabil, zein abiaduratan biratzen du kama-ardatzak?', a: ['4800 rpm', '2400 rpm', '1200 rpm', '600 rpm'], z: 2,
      zergatik: 'Kama-ardatzak birabarkiaren erdiko abiaduran biratzen du: 2400 / 2 = 1200 rpm.' }
  ]
};
