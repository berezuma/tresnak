// Lantegiaren atalak.
//   maila: 1 (DBH 1-2) · 2 (DBH 3-4) · 3 (Batxilergoa) — atala zein mailatan hasten den
//   laster: true  → hurrengo fasean gehituko da
//   kalk: false   → ez du "Kalkulatu" urratsik (galdetegiarekin osatzen da)
//   orria: true   → orri berezia, ez da unitatea eta ez du aurrerapenik zenbatzen
export const TALDEAK = [
  {
    izena: 'Pentsamendu konputazionala',
    unitateak: [
      { id: 'pentsamendu-konputazionala', izena: 'Pentsamendu konputazionala', desk: 'Deskonposizioa, patroiak, abstrakzioa eta algoritmoak', maila: 1 },
      { id: 'algoritmoak', izena: 'Algoritmoak eta fluxu-diagramak', desk: 'Sekuentziak, erabakiak eta begiztak, urratsez urrats', maila: 1 },
      { id: 'blokeak', izena: 'Blokeka programatzen', desk: 'Sekuentzia, errepikapena eta baldintzak robot batekin', maila: 1 },
      { id: 'aldagaiak', izena: 'Aldagaiak eta eragileak', desk: 'Datuak gorde, kalkulatu eta konparatu', maila: 1 },
      { id: 'arazketa', izena: 'Akatsak eta arazketa', desk: 'Programa bat probatu, akatsa aurkitu eta konpondu', maila: 1, kalk: false }
    ]
  },
  {
    izena: 'Kontrol programatua',
    unitateak: [
      { id: 'microbit', izena: 'Micro:bit plaka', desk: 'Sarrerak, prozesua eta irteerak: LEDak, botoiak eta sentsoreak', maila: 1 },
      { id: 'sentsoreak-eragingailuak', izena: 'Sentsoreak eta eragingailuak', desk: 'Seinale digitalak eta analogikoak, PWM, motorrak eta erreleak', maila: 2 },
      { id: 'kontrol-sistemak', izena: 'Kontrol-sistemak', desk: 'Begizta irekia eta itxia: termostatoa, histeresia eta P kontrola', maila: 2 },
      { id: 'arduino', izena: 'Arduino', desk: 'Pin digitalak, analogikoak eta PWM, blokeetatik C++ kodera', maila: 2 },
      { id: 'aplikazioak', izena: 'Aplikazio mugikorrak', desk: 'Gertaeretan oinarritutako programazioa', maila: 2 },
      { id: 'testu-programazioa', izena: 'Testu bidezko programazioa', desk: 'Python eta C++: blokeetatik testura', maila: 3 }
    ]
  },
  {
    izena: 'Elektronika eta pneumatika',
    unitateak: [
      { id: 'osagai-elektronikoak', izena: 'Osagai elektronikoak', desk: 'Diodoa, LEDa, kondentsadorea, transistorea eta sentsoreak', maila: 2 },
      { id: 'bitarra', izena: 'Sistema bitarra', desk: 'Bitak, byteak eta zenbakiak oinarri bitarrean', maila: 2 },
      { id: 'ate-logikoak', izena: 'Boole-ren aljebra eta ate logikoak', desk: 'EZ, ETA, EDO eta egia-taulak', maila: 2 },
      { id: 'logika-diseinua', izena: 'Diseinu logikoa', desk: 'Egia-taulatik zirkuitura, Karnaugh-en mapak eta biegonkorrak', maila: 3 },
      { id: 'pneumatika', izena: 'Pneumatika', desk: 'Konpresorea, zilindroak, balbulak eta sinbologia', maila: 2 },
      { id: 'pneumatika-zirkuituak', izena: 'Zirkuitu pneumatikoak', desk: 'Aginte zeharkakoa, balbula logikoak eta sekuentziak', maila: 3 }
    ]
  },
  {
    izena: 'Robotika eta teknologia berriak',
    unitateak: [
      { id: 'robotak', izena: 'Robotak', desk: 'Robot mugikorrak: motorrak, sentsoreak eta lerro-jarraitzailea', maila: 2 },
      { id: 'robot-besoa', izena: 'Robot-besoa', desk: 'Askatasun-graduak eta zinematika', maila: 3 },
      { id: 'gauzen-internet', izena: 'Gauzen Internet', desk: 'Sentsoreak sarean, MQTT eta hodeia', maila: 2 },
      { id: 'adimen-artifiziala', izena: 'Adimen artifiziala', desk: 'Datuetatik ikasten duten makinak: k-NN eta neuronak', maila: 2 }
    ]
  },
  {
    izena: 'Aplikatu eta errepasatu',
    unitateak: [
      { id: 'laborategia', izena: 'Programazio-laborategia', desk: 'Programatu libreki robotak, Micro:bit, Arduino eta aplikazioak, eta diseinatu zirkuitu logikoak', orria: true },
      { id: 'erronkak', izena: 'Erronkak', desk: 'Programatu baldintzak betetzen dituen irtenbidea', orria: true, laster: true },
      { id: 'glosarioa', izena: 'Glosarioa', desk: 'Hitzak euskaraz, gaztelaniaz eta ingelesez', orria: true, laster: true },
      { id: 'irakaslea', izena: 'Irakasleentzat', desk: 'Ariketa-fitxa inprimagarriak, erantzunekin', orria: true }
    ]
  }
];

export const ZERRENDA = TALDEAK.flatMap(t => t.unitateak.map(u => ({ ...u, taldea: t.izena })));
export const PRESTAK = ZERRENDA.filter(u => !u.laster && !u.orria);
