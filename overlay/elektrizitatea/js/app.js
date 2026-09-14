// Elektrizitatearen Lantegia — lantegiaren konfigurazioa (motorra: oinarria/lantegia/motorra.js)
import { lantegia } from '../../oinarria/lantegia/motorra.js';
import { TALDEAK, ZERRENDA, PRESTAK } from './unitateak/index.js';
import { ARIKETAK, zuzena } from './ariketak.js';
import { HITZAK } from './glosarioa.js';
import { progress } from './util.js';

lantegia({
  izena: 'Elektrizitatearen Lantegia',
  aplikazioa: 'elektrizitatearen-lantegia',
  eyebrow: 'DBH 1etik Batxilergora · Teknologia eta Fisika',
  lede: 'Ikusi korrontea zirkuituetan, muntatu eta neurtu zure zirkuituak laborategian, eta ikasi kalkulatzen Ohm-en legetik Kirchhoff-en legeetaraino, zure mailan.',
  TALDEAK, ZERRENDA, PRESTAK, ARIKETAK, zuzena, progress, HITZAK,
  mailak: {
    1: { izena: 'DBH 1-2', laburra: 'DBH 1-2', azalpena: '<b>DBH 1-2:</b> zer den korronte elektrikoa, zirkuitu sinpleak eta haien ikurrak, Ohm-en legea eta seriea eta paraleloa kalkulu errazekin.' },
    2: { izena: 'DBH 3-4', laburra: 'DBH 3-4', azalpena: '<b>DBH 3-4:</b> gainera, zirkuitu mistoak, potentzia eta energia (kWh eta kostua), neurketak, erresistibitatea eta korronteen legea.' },
    3: { izena: 'Batxilergoa', laburra: 'Batx.', azalpena: '<b>Batxilergoa:</b> gainera, Kirchhoff-en bi legeak osorik, sare-korronteen metodoa, sorgailu errealak (i.e.e. eta barne-erresistentzia) eta potentzialak.' }
  },
  ariketaMailak: ['DBH 1-2', 'DBH 3-4', 'Batxilergoa'],
  glosarioAdibidea: 'Bilatu: tentsioa, current, resistencia…',
  bukaera: { href: '#/laborategia', testua: 'Zirkuitu-laborategia →' },
  unitatea: id => import(`./unitateak/${id}.js`),
  sim: izena => import(`./sim/${izena}.js`),
  orriak: {
    laborategia: () => import('./orriak/laborategia.js'),
    erronkak: () => import('./orriak/erronkak.js')
  }
});
