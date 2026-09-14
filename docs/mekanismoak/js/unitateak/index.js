// Lantegiaren atalak.
//   laster: true  → hurrengo fasean gehituko da
//   kalk: false   → ez du "Kalkulatu" urratsik (galdetegiarekin osatzen da)
export const TALDEAK = [
  {
    izena: 'Oinarriak',
    unitateak: [
      { id: 'makinak', izena: 'Makinak eta mekanismoak', desk: 'Zer den makina bat, haren atalak eta abantaila mekanikoa' },
      { id: 'higidura', izena: 'Higidura motak', desk: 'Lineala, zirkularra, alternatiboa eta oszilatzailea', kalk: false },
      { id: 'lana-potentzia', izena: 'Lana eta potentzia', desk: 'Makinek ez dute energia irabazten' }
    ]
  },
  {
    izena: 'Makina sinpleak',
    unitateak: [
      { id: 'palanka', izena: 'Palanka', desk: 'Palankaren legea eta hiru motak' },
      { id: 'poleak', izena: 'Poleak eta polipastoa', desk: 'Indarra erdira, soka bikoitza' },
      { id: 'plano-inklinatua', izena: 'Plano inklinatua eta ziria', desk: 'Indar txikiagoa, bide luzeagoa' },
      { id: 'tornua', izena: 'Tornua', desk: 'Putzuko ura igotzeko makina' }
    ]
  },
  {
    izena: 'Transmisioa',
    unitateak: [
      { id: 'engranajeak', izena: 'Engranajeak', desk: 'Transmisio-erlazioa eta engranaje-trenak' },
      { id: 'uhala-katea', izena: 'Uhala eta katea', desk: 'Polea eta hortzdun gurpil urrunak lotzeko' },
      { id: 'marruskadura-gurpilak', izena: 'Marruskadura-gurpilak', desk: 'Ukipenez transmititzea' },
      { id: 'torloju-amaigabea', izena: 'Torloju amaigabea', desk: 'Abiadura asko murrizteko' }
    ]
  },
  {
    izena: 'Transformazioa',
    unitateak: [
      { id: 'kremalera', izena: 'Kremalera eta pinoia', desk: 'Zirkularra ↔ lineala' },
      { id: 'torloju-azkoina', izena: 'Torloju-azkoina', desk: 'Biraketatik aurrerapen zehatzera' },
      { id: 'kamak', izena: 'Kamak eta eszentrikoak', desk: 'Profilak jarraitzailea mugitzen du' },
      { id: 'biela-biradera', izena: 'Biela eta biradera', desk: 'Pistoiaren joan-etorria eta biraketa' }
    ]
  },
  {
    izena: 'Makina osoak',
    unitateak: [
      { id: 'bizikleta', izena: 'Bizikleta', desk: 'Platerak, pinoiak eta garapena' },
      { id: 'lurrun-makina', izena: 'Lurrun-makina', desk: 'Industria Iraultzaren motorra', kalk: false },
      { id: 'motorra', izena: 'Lau aldiko motorra', desk: 'Sarrera, konpresioa, leherketa, ihesa' }
    ]
  },
  {
    izena: 'Gehiago',
    unitateak: [
      { id: 'elementuak', izena: 'Beste elementu mekanikoak', desk: 'Trinketea, enbragea, balaztak, errodamenduak, malgukiak', kalk: false },
      { id: 'erronkak', izena: 'Erronkak', desk: 'Diseinatu zuk zeure mekanismoa', laster: true }
    ]
  }
];

export const ZERRENDA = TALDEAK.flatMap(t => t.unitateak.map(u => ({ ...u, taldea: t.izena })));
export const PRESTAK = ZERRENDA.filter(u => !u.laster);
