// Lantegiaren atalak.
//   maila: 1 (DBH 1-2) · 2 (DBH 3-4) · 3 (Batxilergoa) — atala zein mailatan hasten den
//   laster: true  → hurrengo fasean gehituko da
//   kalk: false   → ez du "Kalkulatu" urratsik (galdetegiarekin osatzen da)
//   orria: true   → orri berezia, ez da unitatea eta ez du aurrerapenik zenbatzen
export const TALDEAK = [
  {
    izena: 'Oinarriak',
    unitateak: [
      { id: 'karga-korrontea', izena: 'Karga eta korronte elektrikoa', desk: 'Elektroiak, eroaleak eta isolatzaileak, korrontearen noranzkoa', maila: 1 },
      { id: 'zirkuitua', izena: 'Zirkuitu elektrikoa', desk: 'Sorgailua, hartzaileak, kontrola eta babesa; ikurrak', maila: 1, kalk: false },
      { id: 'magnitudeak', izena: 'Tentsioa, intentsitatea, erresistentzia', desk: 'Hiru magnitudeak, haien unitateak eta multiploak', maila: 1 }
    ]
  },
  {
    izena: 'Ohm-en legea eta energia',
    unitateak: [
      { id: 'ohm', izena: 'Ohm-en legea', desk: 'V = I · R: neurtu, grafikatu eta kalkulatu', maila: 1 },
      { id: 'potentzia-energia', izena: 'Potentzia eta energia', desk: 'Watt-ak, kWh-ak, faktura eta Joule efektua', maila: 1 },
      { id: 'erresistibitatea', izena: 'Erresistentzia eta materialak', desk: 'Erresistibitatea eta erresistentzien kolore-kodea', maila: 2 }
    ]
  },
  {
    izena: 'Zirkuituak',
    unitateak: [
      { id: 'seriea', izena: 'Seriezko zirkuituak', desk: 'Korronte bera, tentsioa banatuta', maila: 1 },
      { id: 'paraleloa', izena: 'Paraleloko zirkuituak', desk: 'Tentsio bera, korrontea banatuta', maila: 1 },
      { id: 'mistoa', izena: 'Zirkuitu mistoak', desk: 'Urratsez urrats sinplifikatu eta ebatzi', maila: 2 },
      { id: 'zatitzailea', izena: 'Tentsio-zatitzailea', desk: 'Potentziometroa eta sentsoreak', maila: 2 },
      { id: 'neurketak', izena: 'Neurketak: polimetroa', desk: 'Amperimetroa, voltimetroa eta ohmetroa', maila: 2 }
    ]
  },
  {
    izena: 'Kirchhoff-en legeak',
    unitateak: [
      { id: 'korronteen-legea', izena: 'Korronteen legea (nodoak)', desk: 'Nodo batera sartzen dena irteten da', maila: 2 },
      { id: 'tentsioen-legea', izena: 'Tentsioen legea (begiztak)', desk: 'Begizta itxi batean tentsioen batura zero', maila: 3 },
      { id: 'sareen-metodoa', izena: 'Sare-korronteen metodoa', desk: 'Ekuazio-sistemak zirkuitu konplexuetarako', maila: 3 },
      { id: 'sorgailu-errealak', izena: 'Sorgailu errealak', desk: 'I.e.e., barne-erresistentzia eta potentzia maximoa', maila: 3 }
    ]
  },
  {
    izena: 'Aplikatu eta errepasatu',
    unitateak: [
      { id: 'laborategia', izena: 'Zirkuitu-laborategia', desk: 'Muntatu zuk zeure zirkuituak eta neurtu', orria: true },
      { id: 'erronkak', izena: 'Erronkak', desk: 'Diseinatu baldintzak betetzen dituen zirkuitua', orria: true },
      { id: 'glosarioa', izena: 'Glosarioa', desk: 'Hitzak euskaraz, gaztelaniaz eta ingelesez', orria: true },
      { id: 'irakaslea', izena: 'Irakasleentzat', desk: 'Ariketa-fitxa inprimagarriak, erantzunekin', orria: true }
    ]
  }
];

export const ZERRENDA = TALDEAK.flatMap(t => t.unitateak.map(u => ({ ...u, taldea: t.izena })));
export const PRESTAK = ZERRENDA.filter(u => !u.laster && !u.orria);
