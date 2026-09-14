// Gehiago: beste elementu mekaniko batzuk
const card = (izena, desk, svg) => `
  <div class="el-card">
    <svg viewBox="0 0 200 120" aria-hidden="true">${svg}</svg>
    <b>${izena}</b><span>${desk}</span>
  </div>`;

const trinketea = `
  <g transform="translate(80 62)">
    ${Array.from({ length: 10 }, (_, i) => { const a = i * 36; return `<path d="M0 -38 L10 -38 L0 -26 Z" transform="rotate(${a})" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="1.5"/>`; }).join('')}
    <circle r="27" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/><circle r="4" fill="var(--ink)"/>
  </g>
  <path d="M170 18 L112 32" stroke="var(--s1)" stroke-width="5" stroke-linecap="round"/><circle cx="170" cy="18" r="5" fill="var(--ink)"/>
  <path d="M40 100 A40 40 0 0 1 36 30" fill="none" stroke="var(--ink3)" stroke-width="2"/><path d="M30 36 L36 28 L42 36" fill="none" stroke="var(--ink3)" stroke-width="2"/>`;
const enbragea = `
  <line x1="10" y1="60" x2="80" y2="60" stroke="var(--ink)" stroke-width="8"/><line x1="120" y1="60" x2="190" y2="60" stroke="var(--ink)" stroke-width="8"/>
  <rect x="80" y="15" width="12" height="90" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
  <rect x="108" y="15" width="12" height="90" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
  <path d="M150 30 H126 M132 24 L125 30 L132 36" stroke="var(--ink3)" stroke-width="2" fill="none"/>
  <text x="100" y="118" text-anchor="middle" font-size="12" fill="var(--ink3)" font-family="Lato, sans-serif">motorra · gurpilak</text>`;
const balazta = `
  <circle cx="90" cy="60" r="46" fill="var(--chip)" stroke="var(--ink)" stroke-width="2"/>
  <circle cx="90" cy="60" r="12" fill="var(--sheet)" stroke="var(--ink)" stroke-width="2"/>
  <path d="M122 14 H160 V106 H122 V88 H140 V32 H122 Z" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
  <rect x="126" y="36" width="10" height="20" fill="var(--danger)"/><rect x="126" y="64" width="10" height="20" fill="var(--danger)"/>`;
const errodamendua = `
  <circle cx="100" cy="60" r="50" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
  <circle cx="100" cy="60" r="34" fill="var(--paper)" stroke="var(--s2)" stroke-width="1.5"/>
  ${Array.from({ length: 10 }, (_, i) => { const a = i * Math.PI / 5; return `<circle cx="${(100 + 42 * Math.cos(a)).toFixed(1)}" cy="${(60 + 42 * Math.sin(a)).toFixed(1)}" r="7" fill="var(--sheet)" stroke="var(--ink)" stroke-width="1.5"/>`; }).join('')}
  <circle cx="100" cy="60" r="24" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>`;
const malgukia = `
  <line x1="20" y1="12" x2="180" y2="12" stroke="var(--ink)" stroke-width="3"/>
  <path d="M100 12 L100 24 L120 32 L80 42 L120 52 L80 62 L120 72 L80 82 L100 90 V96" fill="none" stroke="var(--s3)" stroke-width="3" stroke-linejoin="round"/>
  <rect x="80" y="96" width="40" height="18" fill="var(--g2-fill)" stroke="var(--s2)" stroke-width="2"/>
  <path d="M150 40 V80 M144 72 L150 82 L156 72 M144 48 L150 38 L156 48" stroke="var(--ink3)" stroke-width="2" fill="none"/>`;
const akoplamendua = `
  <line x1="10" y1="60" x2="80" y2="60" stroke="var(--ink)" stroke-width="10"/><line x1="120" y1="60" x2="190" y2="60" stroke="var(--ink)" stroke-width="10"/>
  <rect x="76" y="22" width="16" height="76" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
  <rect x="108" y="22" width="16" height="76" fill="var(--g1-fill)" stroke="var(--s1)" stroke-width="2"/>
  <line x1="84" y1="34" x2="116" y2="34" stroke="var(--ink)" stroke-width="4"/><line x1="84" y1="86" x2="116" y2="86" stroke="var(--ink)" stroke-width="4"/>`;

export default {
  izena: 'Beste elementu mekanikoak',
  galdera: 'Bizikletan pedalei atzera eragiten diezunean ez da ezer gertatzen, baina aurrera eragitean gurpilak bultzatzen du. Zein pieza txikik egiten du hori?',

  ikusi: {
    html: () => `
      <style>
        .el-grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:14px}
        .el-card{display:grid; gap:4px; padding:12px; background:var(--sheet); border:1px solid var(--rule)}
        .el-card svg{display:block; width:100%; height:auto; background:var(--paper)}
        .el-card b{font-family:var(--font-display); font-weight:400; font-size:21px}
        .el-card span{font-size:14.5px; color:var(--ink2)}
      </style>
      <div class="el-grid">
        ${card('Trinketea', 'Noranzko bakarrean biratzen uzten du.', trinketea)}
        ${card('Enbragea', 'Motorra eta gurpilak lotu edo askatu.', enbragea)}
        ${card('Balazta', 'Higidura geldiarazi marruskaduraz.', balazta)}
        ${card('Errodamendua', 'Ardatzen marruskadura murriztu.', errodamendua)}
        ${card('Malgukia', 'Energia metatu eta itzuli.', malgukia)}
        ${card('Akoplamendua', 'Bi ardatz lotu, biraketa transmititzeko.', akoplamendua)}
      </div>`,
    proba: 'Pentsatu bizikleta batean: zenbat elementu hauetatik aurkitzen dituzu? (Oharra: gutxienez lau daude.)'
  },

  ulertu: () => `
    <p>Mekanismoek higidura transmititu edo transformatzeaz gain, beste elementu batzuk behar dituzte: higidura <strong>kontrolatzeko</strong>, <strong>gelditzeko</strong>, <strong>energia metatzeko</strong> edo <strong>marruskadura murrizteko</strong>.</p>

    <h3>Trinketea</h3>
    <p>Hortz asimetrikoak dituen gurpila eta <strong>katigu</strong> bat (malguki batek estututa). Noranzko batean, katigua hortzen gainetik irristatzen da; bestean, hortz batean trabatzen da eta biraketa blokeatzen du. <em>Adibideak:</em> bizikletaren pinoi-multzoa, kabestranteak, eskuzko giltza «karraka».</p>

    <h3>Enbragea</h3>
    <p>Bi ardatz (motorrarena eta transmisioarena) <strong>lotu edo askatu</strong> egiten ditu, motorra gelditu gabe. Bi disko elkarren kontra estutzen dira; marruskadurak biraketa transmititzen du. Pedala zapaltzean, diskoak banatzen dira. <em>Adibideak:</em> autoa, motozikleta, zulagailu batzuk.</p>

    <h3>Balaztak</h3>
    <p>Higidura <strong>moteldu edo gelditzeko</strong>, marruskadura erabiliz. Energia zinetikoa beroa bihurtzen dute. <em>Motak:</em> disko-balaztak (pastillak diskoaren kontra), danbor-balaztak (zapatak danborraren barruan), zapata-balaztak (bizikletaren gurpilaren ertzean).</p>

    <h3>Errodamenduak</h3>
    <p>Ardatz baten eta bere euskarriaren artean jartzen dira, <strong>marruskadura murrizteko</strong>. Bi eraztunen artean bolak edo arrabolak daude, eta irristatu ordez biraka egiten dute. <em>Adibideak:</em> bizikletaren gurpilak, patinak, haizagailuak, motorrak.</p>

    <h3>Malgukiak</h3>
    <p>Indar bat egitean deformatzen dira eta <strong>energia metatzen dute</strong>; indarra kentzean, jatorrizko formara itzultzen dira eta energia itzultzen dute. <em>Motak:</em> konpresiozkoak, trakziozkoak, bihurdurazkoak. <em>Adibideak:</em> boligrafoa, esekidura, erloju mekanikoa, balbulak.</p>

    <h3>Akoplamenduak</h3>
    <p>Bi ardatz <strong>lotzen</strong> dituzte, biraketa bat transmititzeko. <strong>Zurrunak</strong> (ardatzak lerrokatuta) edo <strong>malguak</strong> izan daitezke; <strong>kardana</strong>ri esker, angelu bat osatzen duten ardatzak ere lot daitezke. <em>Adibideak:</em> motor-ponpa lotura, autoaren transmisio-ardatza.</p>`,

  ariketak: [],

  galdetegia: [
    { g: 'Zein elementuk uzten du biraketa noranzko bakarrean?', a: ['Errodamenduak', 'Trinketeak', 'Malgukiak', 'Akoplamenduak'], z: 1,
      zergatik: 'Trinketearen katigua hortzetan trabatzen da noranzko batean, eta irristatu egiten da bestean.' },
    { g: 'Zertarako balio du autoaren enbrageak?', a: ['Autoa gelditzeko', 'Motorra eta gurpilak lotu edo askatzeko, motorra gelditu gabe', 'Energia metatzeko', 'Gurpilak argiztatzeko'], z: 1,
      zergatik: 'Enbrageak bi diskoak banatzen edo estutzen ditu, biraketa transmititu edo eteteko.' },
    { g: 'Zer gertatzen da balazta batean energiarekin?', a: ['Desagertu egiten da', 'Beroa bihurtzen da', 'Malguki batean metatzen da', 'Motorrera itzultzen da'], z: 1,
      zergatik: 'Marruskadurak energia zinetikoa beroa bihurtzen du (horregatik berotzen dira diskoak).' },
    { g: 'Zer egiten dute errodamenduek?', a: ['Marruskadura murriztu', 'Marruskadura handitu', 'Biraketa blokeatu', 'Energia sortu'], z: 0,
      zergatik: 'Bolek edo arrabolek biraka egiten dute, irristatu ordez; marruskadura asko txikitzen da.' },
    { g: 'Boligrafo batek sakatzean irteten eta sartzen den punta du. Zein elementuk itzultzen du punta?', a: ['Trinketeak', 'Balaztak', 'Malgukiak', 'Kardanak'], z: 2,
      zergatik: 'Malgukiak sakatzean energia metatzen du eta askatzean itzuli egiten du.' }
  ]
};
