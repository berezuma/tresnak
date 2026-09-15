// Robotikaren Lantegia — lantegiaren konfigurazioa (motorra: oinarria/lantegia/motorra.js)
import { lantegia } from '../../oinarria/lantegia/motorra.js';
import { TALDEAK, ZERRENDA, PRESTAK } from './unitateak/index.js';
import { ARIKETAK, zuzena } from './ariketak.js';
import { HITZAK } from './glosarioa.js';
import { progress } from './util.js';

lantegia({
  izena: 'Robotikaren Lantegia',
  aplikazioa: 'robotikaren-lantegia',
  eyebrow: 'DBH 1etik Batxilergora · Teknologia eta Digitalizazioa',
  lede: 'Pentsamendu konputazionala, programazioa, elektronika eta robotika: ikusi algoritmoak urratsez urrats, programatu robot bat eta Micro:bit plaka blokeekin, diseinatu zirkuitu logikoak eta pneumatikoak, eta ikasi zure mailan.',
  TALDEAK, ZERRENDA, PRESTAK, ARIKETAK, zuzena, progress, HITZAK,
  mailak: {
    1: { izena: 'DBH 1-2', laburra: 'DBH 1-2', azalpena: '<b>DBH 1-2:</b> pentsamendu konputazionala, algoritmoak eta fluxu-diagramak, blokeka programatzea (sekuentziak, errepikapenak, baldintzak eta aldagaiak), arazketa eta Micro:bit plaka.' },
    2: { izena: 'DBH 3-4', laburra: 'DBH 3-4', azalpena: '<b>DBH 3-4:</b> gainera, funtzioak eta algoritmo luzeagoak, sentsoreak eta eragingailuak, kontrol-sistemak, Arduino, elektronika analogikoa eta digitala, pneumatika, robotika, gauzen Internet eta adimen artifiziala.' },
    3: { izena: 'Batxilergoa', laburra: 'Batx.', azalpena: '<b>Batxilergoa:</b> gainera, algoritmoen eraginkortasuna, testu bidezko programazioa, diseinu logikoa, zirkuitu pneumatiko sekuentzialak eta robot-besoen modelizazioa.' }
  },
  ariketaMailak: ['DBH 1-2', 'DBH 3-4', 'Batxilergoa'],
  glosarioAdibidea: 'Bilatu: algoritmoa, bucle, sensor…',
  bukaera: { href: '#/laborategia', testua: 'Programazio-laborategia →' },
  unitatea: id => import(`./unitateak/${id}.js`),
  sim: izena => import(`./sim/${izena}.js`),
  orriak: {
    laborategia: () => import('./orriak/laborategia.js'),
    erronkak: () => import('./orriak/erronkak.js')
  }
});
