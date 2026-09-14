// Mekanismoen Lantegia — tresna partekatuak (oinarria/lantegia) eta lantegi honen aurrerapena
import { makeProgress } from '../../oinarria/lantegia/util.js';
export * from '../../oinarria/lantegia/util.js';

export const G = 9.8; // grabitatea, m/s² (DBHko liburuetan bezala)

export const progress = makeProgress('mekanismoak:aurrerapena:v1');
