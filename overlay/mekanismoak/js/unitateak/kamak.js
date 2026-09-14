// Transformazioa: kamak eta eszentrikoak
const kamaSvg = `
<svg viewBox="0 0 560 220" role="img" aria-label="Kama bat jarraitzaile zuzenarekin eta eszentriko bat">
  <g font-family="Lato, system-ui, sans-serif">
    <rect x="118" y="22" width="24" height="70" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
    <line x1="100" y1="36" x2="160" y2="36" stroke="var(--ink3)" stroke-width="2"/><line x1="100" y1="64" x2="160" y2="64" stroke="var(--ink3)" stroke-width="2"/>
    <path d="M130 92 C 200 100, 205 170, 130 186 C 80 180, 75 110, 130 92 Z" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
    <circle cx="130" cy="140" r="5" fill="var(--ink)"/>
    <path d="M168 18 V6 M162 12 L168 4 L174 12 M168 96 V108 M162 102 L168 110 L174 102" stroke="var(--ink)" stroke-width="2" fill="none"/>
    <text x="130" y="210" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">Kama + jarraitzailea</text>
    <text x="182" y="60" font-size="13" fill="var(--ink2)">jarraitzailea</text>
    <text x="182" y="150" font-size="13" fill="var(--ink2)">kama (profila)</text>

    <rect x="398" y="22" width="24" height="70" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
    <line x1="380" y1="36" x2="440" y2="36" stroke="var(--ink3)" stroke-width="2"/><line x1="380" y1="64" x2="440" y2="64" stroke="var(--ink3)" stroke-width="2"/>
    <circle cx="410" cy="138" r="46" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
    <circle cx="410" cy="152" r="5" fill="var(--ink)"/>
    <circle cx="410" cy="138" r="2.5" fill="var(--ink3)"/>
    <line x1="410" y1="138" x2="410" y2="152" stroke="var(--danger)" stroke-width="2"/>
    <text x="418" y="150" font-size="12" fill="var(--danger)">e</text>
    <text x="410" y="210" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">Eszentrikoa</text>
    <text x="462" y="120" font-size="13" fill="var(--ink2)">ardatza ez</text>
    <text x="462" y="136" font-size="13" fill="var(--ink2)">dago erdian</text>
  </g>
</svg>`;

export default {
  izena: 'Kamak eta eszentrikoak',
  galdera: 'Autoaren motorrean, balbulak segundoko dozenaka aldiz ireki eta ixten dira, beti une zehatzean. Nork «gogoratzen» du noiz ireki behar diren?',

  ikusi: {
    sim: 'kama',
    html: ({ fig }) => `<div style="max-width:320px;margin-top:16px">${fig('kama', 'Kama-ardatza: kama bakoitzak bere balbula une jakin batean bultzatzen du.')}</div>`,
    proba: '<b>Proba:</b> konparatu hiru profilak grafikoan: zeinek igotzen du jarraitzailea bi aldiz bira bakoitzean? Zeinek egiten du abiadura konstantean (lerro zuzenak)?'
  },

  ulertu: () => `
    <h3>Zer da kama bat?</h3>
    <p class="def"><strong>Kama</strong> profil berezia duen pieza birakaria da. Biratzean, bere gainean dagoen <strong>jarraitzailea</strong> bultzatzen du, eta higidura zirkularra jarraitzailearen joan-etorri bihurtzen du.</p>
    <figure class="fig diagram">${kamaSvg}</figure>
    <ul>
      <li><strong>Kama:</strong> ardatz batean biratzen den profila.</li>
      <li><strong>Jarraitzailea:</strong> kamaren gainean dagoen pieza. Malguki batek kamaren kontra estutzen du, beti ukitzen egon dadin.</li>
    </ul>
    <p>Kamaren <strong>formak</strong> erabakitzen du jarraitzailea noiz, zenbat eta zein abiaduratan mugitzen den. Horregatik dira hain erabilgarriak mugimenduak «programatzeko».</p>
    <p class="note"><strong>Zein higidura sortzen du?</strong> Jarraitzaile zuzenarekin, <strong>lineal alternatiboa</strong> (gora eta behera). Jarraitzailea kulunkari-beso bat bada, <strong>oszilatzailea</strong>.</p>

    <h3>Eszentrikoa</h3>
    <p>Eszentrikoa gurpil biribil bat da, baina bere biraketa-ardatza <strong>ez dago erdian</strong>, desplazatuta baizik. Jarraitzaileari joan-etorri leuna ematen dio. Jarraitzailearen kurtsoa (goitik beherako distantzia) eszentrikotasunaren (e) bikoitza da:</p>
    <div class="formula">kurtsoa = 2 · e</div>

    <h3>Aplikazioak</h3>
    <ul>
      <li><strong>Motorrak:</strong> kama-ardatzak balbulak ireki eta ixten ditu une zehatzean.</li>
      <li><strong>Josteko makinak</strong> eta ehungailuak.</li>
      <li><strong>Automatak eta jostailu mekanikoak:</strong> figura baten mugimenduak kamen profilean «idatzita» daude.</li>
      <li><strong>Sarrailak</strong> eta etengailu mekanikoak.</li>
    </ul>`,

  ariketak: ['kurtsoa'],

  galdetegia: [
    { g: 'Zerk erabakitzen du jarraitzailearen mugimendua?', a: ['Kamaren kolorea', 'Kamaren profila (forma)', 'Motorraren tamaina', 'Malgukiaren luzera bakarrik'], z: 1,
      zergatik: 'Profilak erabakitzen du jarraitzailea noiz eta zenbat igotzen den.' },
    { g: 'Jarraitzaile zuzen batekin, zein higidura sortzen du kamak?', a: ['Zirkularra', 'Lineal alternatiboa', 'Beti oszilatzailea', 'Ez du higidurarik sortzen'], z: 1,
      zergatik: 'Jarraitzaileak gora eta behera egiten du: lineal alternatiboa. Oszilatzailea kulunkari-besoarekin bakarrik.' },
    { g: 'Eszentriko baten eszentrikotasuna 8 mm da. Zenbat da jarraitzailearen kurtsoa?', a: ['4 mm', '8 mm', '16 mm', '64 mm'], z: 2,
      zergatik: 'Kurtsoa = 2 · e = 2 · 8 = 16 mm.' }
  ]
};
