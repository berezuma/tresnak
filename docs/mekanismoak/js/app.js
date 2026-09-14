// Mekanismoen Lantegia — lantegiaren konfigurazioa (motorra: oinarria/lantegia/motorra.js)
import { lantegia } from '../../oinarria/lantegia/motorra.js';
import { TALDEAK, ZERRENDA, PRESTAK } from './unitateak/index.js';
import { ARIKETAK, zuzena } from './ariketak.js';
import { HITZAK } from './glosarioa.js';
import { progress } from './util.js';

lantegia({
  izena: 'Mekanismoen Lantegia',
  aplikazioa: 'mekanismoen-lantegia',
  eyebrow: 'DBH 2 eta 3 · Teknologia',
  lede: 'Makinek nola mugitzen eta biderkatzen duten indarra: ikusi simulagailuetan, ulertu formulak, kalkulatu zure ariketekin eta egiaztatu ikasitakoa.',
  TALDEAK, ZERRENDA, PRESTAK, ARIKETAK, zuzena, progress, HITZAK,
  ariketaMailak: ['Oinarrizkoa', 'Tartekoa', 'Aditua'],
  glosarioAdibidea: 'Bilatu: engranaje, gear, polea…',
  fitxaOharra: 'g = 9,8 m/s²',
  bukaera: { href: '#/erronkak', testua: 'Erronkak →' },
  irudiak: 'irudiak.json',
  unitatea: id => import(`./unitateak/${id}.js`),
  sim: izena => import(`./sim/${izena}.js`),
  orriak: { erronkak: () => import('./orriak/erronkak.js') }
});
