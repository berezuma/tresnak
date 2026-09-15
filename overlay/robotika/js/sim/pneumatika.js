// Pneumatika: efektu bakuneko eta bikoitzeko zilindroak, 3/2 eta 5/2 balbulekin.
// Indarra F = p · A da; karga indarra baino handiagoa bada, zilindroa ez da aurrera mugitzen.
// Aukerak: modua ('bakuna' | 'bikoitza' | 'memoria'), maila
import { fmt, slider } from '../util.js';
import { balbula, zilindroa, iturria, ihesa, lerroa, testua } from './pneumatika-ikurrak.js';

const DIAMETROAK = [16, 20, 25, 32, 40, 50, 63];
const ZURTOINA = { 16: 6, 20: 8, 25: 10, 32: 12, 40: 16, 50: 20, 63: 20 };
const ABIADURA = 0.6;  // ibilbide osoa / s

export const MODUAK = {
  bakuna: { izena: 'Efektu bakunekoa', balbula: '3/2 balbula normalki itxia · sakagailua eta malgukia', desk: 'Sakatu eta eutsi: aireak enboloa aurrera bultzatzen du. Askatzean, balbulak airea kanpora ateratzen du eta malgukiak zilindroa atzera eramaten du.' },
  bikoitza: { izena: 'Efektu bikoitzekoa', balbula: '5/2 balbula · sakagailua eta malgukia', desk: 'Sakatuta dagoen bitartean, airea atzeko ganberara doa eta zilindroak aurrera egiten du. Askatzean, airea aurreko ganberara doa: aireak berak itzultzen du zilindroa.' },
  memoria: { izena: 'Palanka (memoria)', balbula: '5/2 balbula · palanka eta enkliketa (biegonkorra)', desk: 'Palankak ez du malgukirik: balbula azken posizioan geratzen da. Zilindroa aurrean edo atzean geratzen da, palanka berriro mugitu arte.' }
};

export default function mount(box, opts = {}) {
  const P = 'pn' + Math.random().toString(36).slice(2, 7);
  let modua = MODUAK[opts.modua] ? opts.modua : 'bakuna';
  let sakatuta = false, mantendu = false, palanka = 0, x = 0, raf = 0, hilda = false, last = performance.now();
  let azkenSvg = '', azkenRead = '';

  box.innerHTML = `
    <div class="sim pns">
      <div class="sim-body">
        <div class="sim-stage"><svg id="${P}-svg" viewBox="0 0 520 350" role="img" aria-label="Zirkuitu pneumatikoa"></svg></div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Zirkuitua">${Object.entries(MODUAK).map(([k, M]) => `<button data-m="${k}">${M.izena}</button>`).join('')}</div>
          <div class="pn-aginte">
            <button class="btn primary pn-sakatu" id="${P}-sak" aria-pressed="false">Sakatu (eutsi)</button>
            <label class="check" for="${P}-mant" id="${P}-mant-l"><input type="checkbox" id="${P}-mant"> Sakatuta mantendu</label>
            <button class="btn primary" id="${P}-pal" hidden>Mugitu palanka</button>
          </div>
          <div id="${P}-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <p class="lab-hint" id="${P}-desk"></p>
        </div>
      </div>
      <div class="sim-foot"><span>F = p · A &nbsp;(1 bar = 0,1 N/mm²)</span><span id="${P}-foot"></span></div>
    </div>`;
  const $ = q => box.querySelector(q);
  const ctl = $(`#${P}-ctl`);
  const sP = slider(ctl, { id: P + '-p', label: 'Presioa, p', min: 1, max: 8, step: 0.5, value: 6, unit: 'bar', format: v => fmt(v, 1) });
  const sD = slider(ctl, { id: P + '-d', label: 'Enboloaren diametroa, D', min: 0, max: DIAMETROAK.length - 1, step: 1, value: 4, format: v => `${DIAMETROAK[v]} mm` });
  const sK = slider(ctl, { id: P + '-k', label: 'Karga (aurrera egitean aurka)', min: 0, max: 2000, step: 50, value: 300, unit: 'N', format: v => fmt(v, 0) });

  const eragina = () => modua === 'memoria' ? palanka === 1 : sakatuta || mantendu;

  function modua_ezarri(m) {
    modua = m;
    box.querySelectorAll('[data-m]').forEach(b => { b.classList.toggle('active', b.dataset.m === m); b.setAttribute('aria-pressed', String(b.dataset.m === m)); });
    $(`#${P}-sak`).hidden = $(`#${P}-mant-l`).hidden = m === 'memoria';
    $(`#${P}-pal`).hidden = m !== 'memoria';
    $(`#${P}-desk`).textContent = MODUAK[m].desk;
    azkenSvg = '';
  }

  function frame(now) {
    if (hilda) return;
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    const p = sP.value, D = DIAMETROAK[sD.value], d = ZURTOINA[D], K = sK.value;
    const A = Math.PI * D * D / 4, Aat = A - Math.PI * d * d / 4;
    const Fa = p * 0.1 * A, Fat = p * 0.1 * Aat, Fm = modua === 'bakuna' ? 0.03 * A : 0;
    const pos = eragina() ? 1 : 0;
    let egoera;
    if (pos === 1) {
      const net = Fa - Fm - K;
      if (net > 0) {
        x = Math.min(1, x + ABIADURA * dt * Math.min(1, 0.35 + net / Fa));
        egoera = x >= 1 ? 'aurrean' : 'aurrera doa';
      } else egoera = x > 0 ? 'geldituta: indarra ez da nahikoa' : 'ez da mugitzen: indarra < karga';
    } else {
      x = Math.max(0, x - ABIADURA * dt);
      egoera = x <= 0 ? 'atzean' : 'atzera doa';
    }

    // marrazkia
    const bakuna = modua === 'bakuna';
    const cyl = zilindroa({ x: 110, y: 40, L: 180, pos: x, bakuna, aurre: pos === 1, atze: !bakuna && pos === 0, karga: `${fmt(K, 0)} N` });
    let s = '';
    if (bakuna) {
      const v = balbula({ sx: 104, y: 190, mota: '32', pos, ezk: 'botoia', esk: 'malgukia' });
      s += lerroa([v.portua('A'), cyl.aurre], pos === 1) + v.svg + iturria(v.portua('P')) + ihesa(v.portua('R'));
      s += testua(134, 290, `p = ${fmt(p, 1)} bar`, 'pn-lab', 'start');
    } else {
      const v = balbula({ sx: 180, y: 190, mota: '52', pos, ezk: modua === 'memoria' ? 'palanka' : 'botoia', esk: modua === 'memoria' ? 'enkliketa' : 'malgukia' });
      const [x4, y4] = v.portua('4'), [x2, y2] = v.portua('2');
      s += lerroa([[x4, y4], [x4, 150], [cyl.aurre[0], 150], cyl.aurre], pos === 1);
      s += lerroa([[x2, y2], [x2, 130], [cyl.atze[0], 130], cyl.atze], pos === 0);
      s += v.svg + iturria(v.portua('1')) + ihesa(v.portua('5')) + ihesa(v.portua('3'));
      s += testua(232, 290, `p = ${fmt(p, 1)} bar`, 'pn-lab', 'start');
      s += testua(x4 - 4, 186, '4', 'pn-port', 'end') + testua(x2 + 4, 186, '2', 'pn-port', 'start');
    }
    s += cyl.svg;
    s += testua(110, 26, bakuna ? 'Efektu bakuneko zilindroa' : 'Efektu bikoitzeko zilindroa', 'pn-lab', 'start');
    s += testua(20, 338, MODUAK[modua].balbula, 'pn-lab', 'start');
    const svgTxt = `<g class="pn">${s}</g>`;
    if (svgTxt !== azkenSvg) {
      $(`#${P}-svg`).innerHTML = svgTxt;
      $(`#${P}-svg`).setAttribute('aria-label', `${MODUAK[modua].izena}: balbula ${pos ? 'eraginda' : 'atsedenean'}, zilindroa ${egoera}`);
      azkenSvg = svgTxt;
    }
    const read = `
      <div><span>Enboloaren azalera, A</span><b>${fmt(A / 100, 2)} cm²</b></div>
      <div class="hi"><span>Aurrera egiteko indarra</span><b>${fmt(Fa - Fm, 0)} N</b></div>
      ${bakuna ? '' : `<div><span>Atzera egiteko indarra (zurtoina ${d} mm)</span><b>${fmt(Fat, 0)} N</b></div>`}
      <div><span>Karga</span><b>${fmt(K, 0)} N</b></div>
      <div><span>Zilindroa</span><b style="color:${egoera.startsWith('gel') || egoera.startsWith('ez') ? 'var(--danger)' : 'inherit'}">${egoera}</b></div>`;
    if (read !== azkenRead) { $(`#${P}-read`).innerHTML = read; azkenRead = read; }
    $(`#${P}-foot`).textContent = `${fmt(p, 1)} bar · ${fmt(A, 0)} mm² · 0,1 = ${fmt(p * 0.1 * A, 0)} N${bakuna ? ` − malgukia ${fmt(Fm, 0)} N` : ''}`;
    raf = requestAnimationFrame(frame);
  }

  const sak = $(`#${P}-sak`);
  const ezarriSak = v => { sakatuta = v; sak.setAttribute('aria-pressed', String(v)); sak.classList.toggle('sakatuta', v); };
  sak.addEventListener('pointerdown', e => { ezarriSak(true); sak.setPointerCapture?.(e.pointerId); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => sak.addEventListener(ev, () => ezarriSak(false)));
  sak.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); ezarriSak(true); } });
  sak.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') ezarriSak(false); });
  sak.addEventListener('blur', () => ezarriSak(false));
  $(`#${P}-mant`).addEventListener('change', e => { mantendu = e.target.checked; });
  $(`#${P}-pal`).addEventListener('click', () => {
    palanka = 1 - palanka;
    $(`#${P}-pal`).textContent = palanka ? 'Mugitu palanka (orain: aurrera)' : 'Mugitu palanka (orain: atzera)';
  });
  $(`#${P}-pal`).textContent = 'Mugitu palanka (orain: atzera)';
  box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.m === modua) return;
    x = 0; palanka = 0; mantendu = false;
    $(`#${P}-mant`).checked = false;
    $(`#${P}-pal`).textContent = 'Mugitu palanka (orain: atzera)';
    modua_ezarri(b.dataset.m);
  }));

  modua_ezarri(modua);
  raf = requestAnimationFrame(frame);
  return () => { hilda = true; cancelAnimationFrame(raf); };
}
