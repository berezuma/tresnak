// Sare-korronteen metodoa: bi sareko zirkuitua, ekuazioak, Cramer-en erregela eta potentzia-balantzea
import { fmt, slider } from '../util.js';
import { bisareSVG } from '../eskema.js';

export default function mount(box) {
  let ikusi = 'sareak';
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage stack-stage">
          <div id="sa-fig"></div>
          <div class="sare-eq" id="sa-eq" aria-live="polite"></div>
        </div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Irudian erakutsi">
            <button data-v="sareak" class="active">Sare-korronteak</button><button data-v="adarrak">Adar-korronteak</button>
          </div>
          <div id="sa-ctl" style="display:grid;gap:9px"></div>
          <div class="readouts" id="sa-read"></div>
        </div>
      </div>
      <div class="sim-foot"><span>J₁ eta J₂ erlojuaren orratzen noranzkoan hartzen dira. Emaitza negatiboa → benetako noranzkoa kontrakoa.</span></div>
    </div>`;
  const $ = s => box.querySelector(s);
  const ctl = $('#sa-ctl');
  const sl = {
    E1: slider(ctl, { id: 'sa-e1', label: 'E₁', min: 0, max: 24, step: 0.5, value: 12, unit: 'V', format: v => fmt(v, 1) }),
    E2: slider(ctl, { id: 'sa-e2', label: 'E₂', min: 0, max: 24, step: 0.5, value: 6, unit: 'V', format: v => fmt(v, 1) }),
    R1: slider(ctl, { id: 'sa-r1', label: 'R₁', min: 1, max: 20, step: 1, value: 4, unit: 'Ω', format: v => fmt(v, 0) }),
    R2: slider(ctl, { id: 'sa-r2', label: 'R₂', min: 1, max: 20, step: 1, value: 6, unit: 'Ω', format: v => fmt(v, 0) }),
    R3: slider(ctl, { id: 'sa-r3', label: 'R₃', min: 1, max: 20, step: 1, value: 3, unit: 'Ω', format: v => fmt(v, 0) })
  };

  function draw() {
    const { E1, E2, R1, R2, R3 } = Object.fromEntries(Object.entries(sl).map(([k, s]) => [k, s.value]));
    const a = R1 + R2, d = R2 + R3, D = a * d - R2 * R2;
    const D1 = E1 * d - R2 * E2, D2 = R2 * E1 - a * E2;
    const J1 = D1 / D, J2 = D2 / D, I2 = J1 - J2;
    $('#sa-fig').innerHTML = bisareSVG({ E1, E2, R1, R2, R3, sareak: ikusi === 'sareak', adarrak: ikusi === 'adarrak' ? { I1: J1, I2, I3: J2 } : null });
    const n = (x, dd = 3) => fmt(x, dd);
    const Pgen = E1 * J1 - E2 * J2, Pres = J1 * J1 * R1 + I2 * I2 * R2 + J2 * J2 * R3;
    $('#sa-eq').innerHTML = `
      <p class="an-h">1. Tentsioen legea sare bakoitzean</p>
      <p><b>1. sarea:</b> (R₁ + R₂)·J₁ − R₂·J₂ = E₁ &nbsp;→&nbsp; <code>${a}·J₁ − ${R2}·J₂ = ${n(E1, 1)}</code></p>
      <p><b>2. sarea:</b> −R₂·J₁ + (R₂ + R₃)·J₂ = −E₂ &nbsp;→&nbsp; <code>−${R2}·J₁ + ${d}·J₂ = −${n(E2, 1)}</code></p>
      <p class="an-h">2. Cramer-en erregela</p>
      <p><code>Δ = ${a}·${d} − ${R2}·${R2} = ${n(D, 2)}</code></p>
      <p><code>J₁ = (${n(E1, 1)}·${d} − ${R2}·${n(E2, 1)}) / ${n(D, 2)} = <b>${n(J1)} A</b></code></p>
      <p><code>J₂ = (${R2}·${n(E1, 1)} − ${a}·${n(E2, 1)}) / ${n(D, 2)} = <b>${n(J2)} A</b></code></p>
      <p class="an-h">3. Adar-korronteak</p>
      <p><code>I₁ = J₁ = ${n(J1)} A</code> · <code>I₂ = J₁ − J₂ = ${n(I2)} A</code> · <code>I₃ = J₂ = ${n(J2)} A</code></p>
      <p class="an-h">4. Egiaztapena: potentzia-balantzea</p>
      <p><code>E₁·I₁ − E₂·I₃ = ${n(Pgen, 2)} W</code> &nbsp;=&nbsp; <code>ΣI²·R = ${n(Pres, 2)} W</code> ${Math.abs(Pgen - Pres) < 1e-6 ? '✓' : ''}</p>`;
    const dir = (x, pos, neg) => Math.abs(x) < 1e-9 ? 'korronterik ez' : x > 0 ? pos : neg;
    $('#sa-read').innerHTML = `
      <div><span>I₁ (E₁-en adarra)</span><b>${n(Math.abs(J1))} A</b></div><div><span></span><b style="font-family:var(--font-body);font-weight:400;font-size:13px">${dir(J1, 'gora (E₁-ek ematen du)', 'behera (E₁ kargatzen ari da)')}</b></div>
      <div><span>I₂ (R₂-ren adarra)</span><b>${n(Math.abs(I2))} A</b></div><div><span></span><b style="font-family:var(--font-body);font-weight:400;font-size:13px">${dir(I2, 'behera', 'gora')}</b></div>
      <div><span>I₃ (E₂-ren adarra)</span><b>${n(Math.abs(J2))} A</b></div><div><span></span><b style="font-family:var(--font-body);font-weight:400;font-size:13px">${dir(J2, 'eskuinera (E₂ kargatzen ari da)', 'ezkerrera (E₂-k ematen du)')}</b></div>`;
  }
  Object.values(sl).forEach(s => s.on(draw));
  box.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
    ikusi = b.dataset.v;
    box.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('active', x === b));
    draw();
  }));
  draw();
}
