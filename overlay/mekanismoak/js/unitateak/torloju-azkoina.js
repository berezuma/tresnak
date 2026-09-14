// Transformazioa: torloju-azkoina
export default {
  izena: 'Torloju-azkoina',
  galdera: 'Autoaren gurpila aldatzeko katuarekin, pertsona batek tona bat altxatzen du biradera bati eraginez. Nola da posible hainbeste indar?',

  ikusi: {
    sim: 'kremalera',
    aukerak: { mode: 'torloju' },
    proba: '<b>Proba:</b> jarri pausoa 1 mm-ra eta gero 5 mm-ra. Abiadura berean, zeinekin aurreratzen du azkoinak azkarrago? Zeinekin egingo luke indar handiagoa?'
  },

  ulertu: () => `
    <h3>Zer da?</h3>
    <p class="def"><strong>Torloju-azkoina</strong> mekanismoak <strong>higidura zirkularra lineal bihurtzen du</strong>. Torlojua biratzen denean eta azkoinari biratzen uzten ez zaionean, azkoinak torlojuaren ardatzean aurrera egiten du (edo alderantziz: azkoina biratu eta torlojua aurreratu).</p>
    <ul>
      <li><strong>Torlojua:</strong> hari helikoidala duen zilindroa.</li>
      <li><strong>Azkoina:</strong> barruan hari bera duen pieza.</li>
      <li><strong>Pausoa (p):</strong> bi hariren arteko distantzia; bira oso batean aurreratzen dena.</li>
    </ul>

    <h3>Zenbat aurreratzen da?</h3>
    <div class="formula">d = n · p<small>d: aurrerapena (mm) · n: bira-kopurua · p: pausoa (mm)</small></div>
    <p>Torlojuaren haria <a href="#/plano-inklinatua">plano inklinatu</a> bat da, zilindroaren inguruan bilduta. Bira oso bat ematean bide luzea egiten dugu (biraderaren zirkunferentzia), baina azkoinak pauso bat bakarrik aurreratzen du. Horregatik ematen du <strong>abantaila mekaniko oso handia</strong> eta mugimendu <strong>oso zehatza</strong>.</p>

    <div class="worked">
      <h4>Adibide ebatzia: mikrometroa</h4>
      <p>Mikrometro baten torlojuak 0,5 mm-ko pausoa du, eta bere danborrak 50 marra ditu. Zenbat aurreratzen da marra bakoitzeko?</p>
      <ol>
        <li>Bira oso bat = 0,5 mm</li>
        <li>Marra bat = 0,5 / 50 = 0,01 mm</li>
      </ol>
      <p class="ans">Ehuneneko milimetro bat: horregatik neur ditzake hain lodiera txikiak.</p>
    </div>

    <p class="note"><strong>Ez-itzulgarria</strong> izaten da normalean: azkoina bultzatuta ez da torlojua biratzen, marruskaduragatik. Horri esker geratzen da katua altxatuta, edo mahai-tornua estututa.</p>

    <h3>Aplikazioak</h3>
    <ul>
      <li>Mahai-tornua eta sargailuak</li>
      <li>Autoaren katua</li>
      <li>Mikrometroa eta doitze-mekanismoak</li>
      <li>3D inprimagailuak eta CNC makinak (ardatzak mugitzeko)</li>
      <li>Ardo- edo sagardo-prentsa zaharrak</li>
    </ul>`,

  ariketak: ['torloju-azkoina'],

  galdetegia: [
    { g: 'Zer da torloju baten pausoa?', a: ['Torlojuaren luzera', 'Bi hariren arteko distantzia', 'Torlojuaren diametroa', 'Bira-kopurua'], z: 1,
      zergatik: 'Pausoa hari batetik hurrengorako distantzia da: bira oso batean aurreratzen dena.' },
    { g: 'Pausoa 2 mm bada, 15 bira emanda zenbat aurreratzen da azkoina?', a: ['7,5 mm', '17 mm', '30 mm', '2 mm'], z: 2,
      zergatik: 'd = n · p = 15 · 2 = 30 mm.' },
    { g: 'Zergatik geratzen da autoaren katua altxatuta, biradera askatu arren?', a: ['Malguki batek eusten diolako', 'Torloju-azkoina normalean ez-itzulgarria delako', 'Autoa arina delako', 'Katuak motorra duelako'], z: 1,
      zergatik: 'Marruskaduragatik, kargak ezin du torlojua biratu: bere tokian geratzen da.' }
  ]
};
