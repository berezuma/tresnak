// Transformazioa: kremalera eta pinoia
export default {
  izena: 'Kremalera eta pinoia',
  galdera: 'Ate lerragarri automatiko batek motor birakari bat du, baina ateak lerro zuzenean egiten du. Nola bihurtzen da biraketa mugimendu zuzen?',

  ikusi: {
    sim: 'kremalera',
    aukerak: { mode: 'kremalera' },
    proba: '<b>Proba:</b> pinoiak bira oso bat ematen duenean, zenbat hortz pasatzen dira? Gelditu animazioa eta <b>arrastatu kremalera</b> eskuz: zer egiten du pinoiak?'
  },

  ulertu: () => `
    <h3>Zer da?</h3>
    <p class="def">Mekanismo honek <strong>higidura zirkularra lineal bihurtzen du</strong>, edo alderantziz. Bi pieza ditu:</p>
    <ul>
      <li><strong>Pinoia:</strong> hortzdun gurpil txikia.</li>
      <li><strong>Kremalera:</strong> hortzak dituen barra zuzena.</li>
    </ul>

    <h3>Nola funtzionatzen du</h3>
    <p>Pinoiak biratzen duenean, bere hortzek kremaleraren hortzak bultzatzen dituzte eta kremalera lerro zuzenean mugitzen da. Hortzek ez dute irrist egiten, beraz mugimendua zehatza da.</p>
    <p>Bi noranzkoetan erabil daiteke:</p>
    <ul>
      <li><strong>Zirkularra → lineala:</strong> ate lerragarriaren motorra, zutabe-zulagailuaren heldulekua (biratzean buka jaisten da), autoaren direkzioa (bolantea biratu, gurpilak alboetara).</li>
      <li><strong>Lineala → zirkularra:</strong> kremalera bultzatzean pinoia biratzen da, adibidez zenbait jostailu eta neurgailutan.</li>
    </ul>

    <h3>Zenbat aurreratzen da kremalera?</h3>
    <p>Bira oso batean pinoiak bere hortz guztiak pasatzen ditu. Hortzen arteko distantziari <strong>pausoa</strong> (p) deritzo:</p>
    <div class="formula">d = n · Z · p<small>n: pinoiaren birak · Z: pinoiaren hortzak · p: pausoa (mm)</small></div>
    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>Ate baten pinoiak 12 hortz ditu eta pausoa 5 mm da. Motorrak 20 bira ematen baditu, zenbat irekitzen da atea?</p>
      <ol>
        <li>Bira batean: Z · p = 12 · 5 = 60 mm</li>
        <li>d = 20 · 60 = 1200 mm = 1,2 m</li>
      </ol>
      <p class="ans">Atea 1,2 m irekitzen da.</p>
    </div>

    <h3>Aplikazioak</h3>
    <ul>
      <li>Ate lerragarri automatikoak eta aparkalekuetako hesiak</li>
      <li>Autoen direkzio-sistema</li>
      <li>Zutabe-zulagailuak eta mikroskopioen fokatze-mekanismoa</li>
      <li>Kremailera-trenak: malda handiak igotzeko</li>
    </ul>`,

  ariketak: ['kremalera'],

  galdetegia: [
    { g: 'Zer egiten du kremalera-pinoia mekanismoak?', a: ['Abiadura biderkatu', 'Higidura zirkularra lineal bihurtu (edo alderantziz)', 'Indarraren norabidea aldatu soilik', 'Higidura oszilatzailea sortu'], z: 1,
      zergatik: 'Transformazio-mekanismoa da: zirkularra ↔ lineala.' },
    { g: 'Autoaren direkzioan, bolantea biratzean gurpilak alboetara mugitzen dira. Zein norabidetan erabiltzen da mekanismoa?', a: ['Linealetik zirkularrera', 'Zirkularretik linealera', 'Zirkularretik zirkularrera', 'Linealetik linealera'], z: 1,
      zergatik: 'Bolantearen biraketak (zirkularra) kremalera mugitzen du alde batera (lineala).' },
    { g: 'Pinoiak 10 hortz ditu, pausoa 4 mm da eta 3 bira ematen ditu. Zenbat mugitzen da kremalera?', a: ['40 mm', '120 mm', '12 mm', '30 mm'], z: 1,
      zergatik: 'd = n · Z · p = 3 · 10 · 4 = 120 mm.' }
  ]
};
