// Elektrizitatearen Lantegia — tresna partekatuak (oinarria/lantegia), aurrerapena eta unitateen formatuak
import { makeProgress, fmt } from '../../oinarria/lantegia/util.js';
export * from '../../oinarria/lantegia/util.js';

export const progress = makeProgress('elektrizitatea:aurrerapena:v1');

// Intentsitatea: 1 A-tik behera hamartar gehiago; 10 mA-tik behera miliamperetan
export function fmtA(I) {
  const a = Math.abs(I);
  if (a < 5e-7) return '0 A';
  if (a >= 1) return fmt(I, 2) + ' A';
  if (a >= 0.01) return fmt(I, 3) + ' A';
  return fmt(I * 1000, a * 1000 < 1 ? 3 : 2) + ' mA';
}
export const fmtV = U => fmt(U, Math.abs(U) >= 100 ? 1 : 2) + ' V';
export function fmtR(R) {
  if (!isFinite(R)) return '∞ Ω';
  if (R >= 1e6) return fmt(R / 1e6, 2) + ' MΩ';
  if (R >= 1000) return fmt(R / 1000, 2) + ' kΩ';
  return fmt(R, 2) + ' Ω';
}
export function fmtP(P) {
  const a = Math.abs(P);
  if (a >= 1000) return fmt(P / 1000, 2) + ' kW';
  return fmt(P, a >= 10 ? 1 : a >= 1 ? 2 : 3) + ' W';
}
