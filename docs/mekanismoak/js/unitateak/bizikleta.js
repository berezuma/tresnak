// Makina osoak: bizikleta
export default {
  izena: 'Bizikleta',
  galdera: 'Aldapa gora, zergatik jartzen dugu plater txikia eta pinoi handia, nahiz eta polikiago joan?',

  ikusi: {
    sim: 'bizikleta',
    proba: '<b>Proba:</b> kadentzia 80-an utzita, bilatu 30 km/h-ra joateko konbinazio bat. Gero bilatu garapenik txikiena: zein plater eta pinoirekin lortzen da? Noiz erabiliko zenuke?'
  },

  ulertu: ({ fig }) => `
    <h3>Giza indarrezko makina</h3>
    <p>Bizikleta inoiz asmatu den makina eraginkorrenetako bat da. Makinaren hiru atalak argi ikusten dira:</p>
    <ul>
      <li><strong>Eragilea:</strong> gure hankak, pedalak bultzatzen.</li>
      <li><strong>Mekanismoa:</strong> kate-transmisioa (platera, katea eta pinoia). Pedala eta biela 1. mailako palanka baten antzera ere lan egiten dute.</li>
      <li><strong>Hartzailea:</strong> atzeko gurpila.</li>
    </ul>
    ${fig('bizikleta-transmisioa', 'Bizikletaren transmisioa: platera, katea, pinoiak eta aldagailua.')}
    <p class="note ok">Kate-transmisio garbi eta koipeztatu batek egiten dugun indarraren <strong>% 95 inguru edo gehiago</strong> heltzen du gurpilera. Kate zikin eta lehor batek askoz gehiago galtzen du.</p>

    <h3>Transmisio-erlazioa</h3>
    <div class="formula">erlazioa = Z<sub>platera</sub> / Z<sub>pinoia</sub><small>Pedal-bira bakoitzeko gurpilak ematen dituen birak</small></div>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Konbinazioa</th><th>Erlazioa</th><th>Pedalkada</th><th>Noiz</th></tr></thead>
      <tbody>
        <tr><td>Plater handia + pinoi txikia</td><td>Altua (adib. 52/13 = 4)</td><td>Gogorra, azkarra</td><td>Lauan edo aldapa behera</td></tr>
        <tr><td>Plater txikia + pinoi handia</td><td>Baxua (adib. 34/28 ≈ 1,2)</td><td>Arina, motela</td><td>Aldapa gora</td></tr>
      </tbody>
    </table></div>
    <p>Erlazio baxuarekin, gurpilak bira gutxiago ematen ditu pedal-bira bakoitzeko, baina <strong>indar gutxiago</strong> egin behar dugu. Aldapan hori da behar duguna: bidea luzeagoa da, baina gure hankek jasan dezaketen indarrarekin.</p>

    <h3>Garapena</h3>
    <p>Pedal-bira bakoitzean bizikleta zenbat metro aurreratzen den:</p>
    <div class="formula">garapena = erlazioa · π · D<small>D: gurpilaren diametroa (m)</small></div>
    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>Plateran 52 hortz eta pinoian 13; gurpilaren diametroa 0,7 m. Zenbat aurreratzen da pedal-bira bakoitzean? Eta minutuko 80 pedalkadarekin, zein abiaduratan?</p>
      <ol>
        <li>Erlazioa = 52 / 13 = 4 bira</li>
        <li>Garapena = 4 · 3,14 · 0,7 ≈ 8,8 m</li>
        <li>Abiadura = 8,8 · 80 = 704 m/min ≈ 42 km/h</li>
      </ol>
      <p class="ans">8,8 m pedal-bira bakoitzeko, eta 42 km/h inguru.</p>
    </div>`,

  ariketak: ['bizikleta', 'uhala-abiadura'],

  galdetegia: [
    { g: 'Plateran 40 hortz eta pinoian 20. Pedal-bira bakoitzeko, zenbat bira ematen ditu gurpilak?', a: ['0,5', '2', '20', '60'], z: 1,
      zergatik: 'Erlazioa = 40 / 20 = 2 bira.' },
    { g: 'Zein konbinazio da egokiena aldapa gora igotzeko?', a: ['Plater handia eta pinoi txikia', 'Plater txikia eta pinoi handia', 'Plater handia eta pinoi handia', 'Berdin da'], z: 1,
      zergatik: 'Erlazio baxuak indar gutxiago eskatzen du pedal-bira bakoitzeko, abiaduraren truke.' },
    { g: 'Zer da garapena?', a: ['Gurpilaren diametroa', 'Pedal-bira bakoitzean aurreratzen den distantzia', 'Minutuko pedalkada-kopurua', 'Platerraren hortz-kopurua'], z: 1,
      zergatik: 'Garapena = erlazioa · π · D: pedal-bira bakoitzeko metroak.' }
  ]
};
