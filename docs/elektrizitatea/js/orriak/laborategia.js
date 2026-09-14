// Zirkuitu-laborategia: taula librea, nabigatzailean gordetzen dena
import mount from '../sim/laborategia.js';

export default function render(root, { footer, cfg }) {
  const maila = cfg.maila ? cfg.maila() : 1;
  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Aplikatu</div>
      <h1>Zirkuitu-laborategia</h1>
      <p class="lede">Aukeratu osagai bat goiko barran eta sakatu sareko bi punturen arteko tarte bat hura jartzeko. Zirkuitua une oro ebazten da: bonbillek distira egiten dute, neurgailuek benetako balioak ematen dituzte eta fusibleak fundi daitezke. Zure zirkuitua nabigatzaile honetan gordetzen da.</p>
    </header>
    <div id="lab-page"></div>
    <div class="lab-page-tips">
      <section>
        <h3>Probatu</h3>
        <ul>
          <li>Jarri bi bonbilla <b>seriean</b> eta gero <b>paraleloan</b>. Zeinek egiten du distira gehiago?</li>
          <li>Kendu bonbilla bat paraleloko zirkuituan. Zer gertatzen zaio besteari?</li>
          <li>Lotu kable bat bonbilla baten bi muturretara. Zergatik itzaltzen da?</li>
        </ul>
      </section>
      <section>
        <h3>Neurtu</h3>
        <ul>
          <li>Amperimetroa <b>seriean</b>: jarri zirkuituko hainbat lekutan. Balio bera ematen du seriean?</li>
          <li>Voltimetroa <b>paraleloan</b>: neurtu osagai bakoitzaren tentsioa eta batu.</li>
          <li>Egiaztatu Ohm-en legea: V / I = R?</li>
        </ul>
      </section>
      <section>
        <h3>${maila >= 2 ? 'Kirchhoff' : 'Babestu'}</h3>
        <ul>
          ${maila >= 2 ? `
          <li><b>Nodoa</b> tresnarekin sakatu adarkatze-puntu bat: sartzen dena irteten da?</li>
          <li><b>Begizta</b> tresnarekin egin bira oso bat: tentsioen batura zero da?</li>
          <li>Kargatu «Bi pila, hiru adar» adibidea eta aldatu pilen tentsioak.</li>` : `
          <li>Jarri fusible bat pilaren ondoan eta egin zirkuitulabur bat.</li>
          <li>Bonbilla bat 24 V-ko pila batera lotzen baduzu, zer gertatzen da?</li>
          <li>Kargatu «Etxeko argiak» adibidea eta piztu argiak banan-banan.</li>`}
        </ul>
      </section>
    </div>
    ${footer()}`;
  return mount(root.querySelector('#lab-page'), {
    zabala: true,
    adibidea: 'etxea',
    gorde: 'elektrizitatea:laborategia:v1',
    maila
  });
}
