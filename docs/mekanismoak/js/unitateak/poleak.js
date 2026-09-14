// Makina sinpleak: poleak eta polipastoa
export default {
  izena: 'Poleak eta polipastoa',
  galdera: 'Obra batean, langile batek 50 kg-ko zakua igo behar du soka batekin. Nola egin lezake zakuaren pisuaren erdia bakarrik eginez?',

  ikusi: {
    sim: 'polipastoa',
    proba: '<b>Proba:</b> hasi <b>0</b> polea mugikorrekin eta tiratu 2 m soka. Gero egin gauza bera 1 eta 2 polea mugikorrekin. Zer gertatzen da indarrarekin? Eta kargaren igoerarekin? Begiratu azken bi lerroak: <b>F · s</b> eta <b>R · h</b> beti berdinak dira.'
  },

  ulertu: ({ fig }) => `
    <h3>Zer da polea bat?</h3>
    <p class="def"><strong>Polea</strong> (edo txirrika) ertzean ildo bat duen gurpila da, ardatz baten inguruan biratzen duena; ildotik soka, kable edo uhal bat pasatzen da.</p>
    ${fig('polea-z', 'Polea-sistema bat sokarekin.')}

    <h3>Polea finkoa</h3>
    <p>Polearen ardatza euskarri bati lotuta dago eta ez da mugitzen. <strong>Ez du indarra murrizten</strong>, baina norabidea aldatzen du: errazagoa da behera tiratzea gora altxatzea baino, gure pisua ere erabiltzen dugulako.</p>
    <div class="formula">F = R<small>Abantaila mekanikoa: 1</small></div>

    <h3>Polea mugikorra</h3>
    <p>Polea kargarekin batera mugitzen da. Karga <strong>bi soka-zatik</strong> eusten dute, eta bakoitzak pisuaren erdia jasotzen du.</p>
    <div class="formula">F = R / 2</div>

    <h3>Polipastoa</h3>
    <p>Polea finko eta mugikorren konbinazioa da. Simulagailuko polipastoan, polea mugikor bakoitzak bi soka-zati gehitzen ditu:</p>
    <div class="formula">F = R / (2 · n)<small>n: polea mugikorren kopurua (2 · n: kargari eusten dioten soka-zatiak)</small></div>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Polea mugikorrak</th><th>Soka-zatiak</th><th>AM</th><th>100 kg igotzeko indarra</th><th>1 m igotzeko soka</th></tr></thead>
      <tbody>
        <tr><td>0 (finkoa)</td><td>1</td><td>1</td><td>980 N</td><td>1 m</td></tr>
        <tr><td>1</td><td>2</td><td>2</td><td>490 N</td><td>2 m</td></tr>
        <tr><td>2</td><td>4</td><td>4</td><td>245 N</td><td>4 m</td></tr>
        <tr><td>3</td><td>6</td><td>6</td><td>≈ 163 N</td><td>6 m</td></tr>
      </tbody>
    </table></div>
    <p class="note ok"><strong>Gogoratu:</strong> indarra erdira, soka bikoitza. Polipastoak indarra murrizten du, baina soka gehiago tiratu behar da. Egindako lana (indarra · bidea) berdina da: <span style="font-family:var(--font-code)">F · s = R · h</span>.</p>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>50 kg-ko zakua polea mugikor bakarreko sistema batekin igotzen da. Zenbat indar behar da? Zakua 3 m igotzeko, zenbat soka tiratu behar da?</p>
      <ol>
        <li>R = m · g = 50 · 9,8 = 490 N</li>
        <li>F = R / 2 = 490 / 2 = 245 N</li>
        <li>s = 2 · h = 2 · 3 = 6 m</li>
      </ol>
      <p class="ans">245 N eginez, baina 6 m soka tiratuz.</p>
    </div>`,

  ariketak: ['polea-indarra', 'abantaila'],

  galdetegia: [
    { g: 'Zertarako balio du polea finko batek?', a: ['Indarra erdira murrizteko', 'Indarraren norabidea aldatzeko', 'Energia sortzeko', 'Karga arintzeko'], z: 1,
      zergatik: 'Polea finkoak ez du indarra murrizten (F = R), baina behera tiratuz gora igo dezakegu.' },
    { g: 'Polipasto baten abantaila mekanikoa zeren araberakoa da?', a: ['Polearen kolorearen araberakoa', 'Kargari eusten dioten soka-zatien kopuruaren araberakoa', 'Sokaren materialaren araberakoa', 'Polearen pisuaren araberakoa'], z: 1,
      zergatik: 'Soka-zati bakoitzak kargaren zati bat eusten du: zenbat eta zati gehiago, orduan eta indar gutxiago.' },
    { g: '2 polea mugikorreko polipasto batekin 800 N-eko karga igo nahi dugu. Zenbat indar behar da?', a: ['800 N', '400 N', '200 N', '1600 N'], z: 2,
      zergatik: 'F = R / (2 · n) = 800 / 4 = 200 N.' },
    { g: 'Polea mugikor bakarrarekin karga 2 m igo nahi badugu, zenbat soka tiratu behar dugu?', a: ['1 m', '2 m', '4 m', '8 m'], z: 2,
      zergatik: 'Indarra erdira doan bezala, soka bikoitza tiratu behar da: 2 · 2 = 4 m.' }
  ]
};
