// Transmisioa: engranajeak eta engranaje-trenak
export default {
  izena: 'Engranajeak',
  galdera: 'Garbigailuaren motorrak minutuko milaka bira ematen ditu, baina danborrak askoz polikiago biratzen du. Nola moteltzen da biraketa, eta zer irabazten da horrela?',

  ikusi: {
    sim: 'engranajeak',
    proba: '<b>Proba:</b> jarri Z₁ = 20 eta Z₂ = 40: zenbat rpm ditu irteerak? Gero aukeratu <b>Tartekoa</b> eta aldatu Z₂: zer gertatzen da irteerako abiadurarekin? Eta noranzkoarekin? Azkenik, <b>Tren konposatuan</b>, lortu 100 rpm baino gutxiago.'
  },

  ulertu: ({ fig }) => `
    <h3>Zer da engranaje bat?</h3>
    <p class="def"><strong>Engranajea</strong> beste hortzdun gurpil batekin ahokatzen den hortzdun gurpila da. Bi ardatzen artean higidura zirkularra transmititzen du.</p>
    ${fig('engranajeak', 'Hainbat tamainatako engranajeak.')}
    <ul>
      <li><strong>Ez du irrist egiten:</strong> hortzak elkarren artean sartzen dira, eta indar handiak transmiti ditzakete.</li>
      <li><strong>Noranzkoa aldatzen du:</strong> ahokatutako bi engranajek kontrako noranzkoan biratzen dute.</li>
      <li><strong>Abiadura aldatzen du:</strong> hortz-kopuruen arteko erlazioaren arabera.</li>
    </ul>
    <p>Engranaje bat <strong>eragilea</strong> da (motorrak mugitzen duena) eta bestea <strong>eragina</strong> (mugitua).</p>

    <h3>Transmisio-erlazioa</h3>
    <p>Bi engranajeetan hortz-kopuru bera pasatzen da denbora berean. Horregatik:</p>
    <div class="formula">N₁ · Z₁ = N₂ · Z₂<small>N: abiadura (rpm, minutuko birak) · Z: hortz-kopurua</small></div>
    <div class="formula">i = N₂ / N₁ = Z₁ / Z₂</div>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Mota</th><th>Erlazioa</th><th>Irteera</th><th>Nola</th></tr></thead>
      <tbody>
        <tr><td><strong>Biderkatzailea</strong></td><td>i &gt; 1</td><td>Azkarrago</td><td>Engranaje handiak txikia mugitzen du</td></tr>
        <tr><td><strong>Neutroa</strong></td><td>i = 1</td><td>Abiadura bera</td><td>Hortz-kopuru bera</td></tr>
        <tr><td><strong>Murriztailea</strong></td><td>i &lt; 1</td><td>Polikiago</td><td>Engranaje txikiak handia mugitzen du</td></tr>
      </tbody>
    </table></div>
    <p class="note"><strong>Zer irabazten da moteltzean?</strong> Indarra. Transmisio murriztaile batek abiadura murrizten du, baina irteerako indar-momentua (biratzeko indarra) handitzen du proportzio berean. Horregatik moteltzen dute motorrak garbigailuetan, zulagailuetan edo garabietan.</p>

    <div class="worked">
      <h4>Adibide ebatzia</h4>
      <p>Motor batek 20 hortzeko engranajea mugitzen du 1000 rpm-ra, eta honek 50 hortzeko beste bat. Zein da irteerako abiadura?</p>
      <ol>
        <li>i = Z₁ / Z₂ = 20 / 50 = 0,4</li>
        <li>N₂ = N₁ · i = 1000 · 0,4 = 400 rpm</li>
      </ol>
      <p class="ans">400 rpm: transmisio murriztailea da.</p>
    </div>

    <h3>Tarteko engranajea</h3>
    <p>Bi engranajeren artean hirugarren bat jartzen bada, <strong>irteerako noranzkoa aldatzen da</strong> (sarreraren berdina da berriro), baina <strong>abiadura ez</strong>: N₃ = N₁ · Z₁ / Z₃. Tarteko engranajearen tamainak ez du eraginik.</p>

    <h3>Engranaje-tren konposatuak</h3>
    <p>Bi engranaje ardatz berean jartzen direnean, abiadura bera dute. Horrela, erlazio txikiak biderkatuz murrizketa handiak lortzen dira:</p>
    <div class="formula">i = (Z₁ / Z₂) · (Z₃ / Z₄)<small>N₄ = N₁ · i</small></div>

    <h3>Engranaje motak</h3>
    <ul>
      <li><strong>Zuzenak:</strong> hortz zuzenak; ardatz paraleloetarako. Ohikoenak.</li>
      <li><strong>Helikoidalak:</strong> hortz makurrak; isilagoak eta leunagoak.</li>
      <li><strong>Konikoak:</strong> kono formakoak; ardatz perpendikularretarako (esku-zulagailua, autoaren diferentziala).</li>
    </ul>`,

  ariketak: ['engranaje-abiadura'],

  galdetegia: [
    { g: 'Ahokatutako bi engranajek zein noranzkotan biratzen dute?', a: ['Noranzko berean', 'Kontrako noranzkoan', 'Tamainaren araberakoa da', 'Ez dute biratzen'], z: 1,
      zergatik: 'Hortzek elkar bultzatzen dute ukipen-puntuan, eta horregatik kontrako noranzkoan biratzen dute.' },
    { g: '12 hortzeko engranaje batek 36 hortzeko bat mugitzen du. Nolakoa da transmisioa?', a: ['Biderkatzailea', 'Neutroa', 'Murriztailea', 'Ezin da jakin'], z: 2,
      zergatik: 'i = 12 / 36 = 0,33 < 1: txikiak handia mugitzen du, irteera motelagoa da.' },
    { g: 'Motorrak 900 rpm; eragileak 15 hortz eta eraginak 45. Zenbat rpm ditu eraginak?', a: ['2700 rpm', '300 rpm', '450 rpm', '60 rpm'], z: 1,
      zergatik: 'N₂ = N₁ · Z₁ / Z₂ = 900 · 15 / 45 = 300 rpm.' },
    { g: 'Zertarako jartzen da tarteko engranaje bat?', a: ['Abiadura bikoizteko', 'Irteerako noranzkoa sarrerarena bera izan dadin', 'Indarra murrizteko', 'Hortzak ez apurtzeko'], z: 1,
      zergatik: 'Tarteko engranajeak noranzkoa aldatzen du, baina ez du eraginik abiaduran.' }
  ]
};
