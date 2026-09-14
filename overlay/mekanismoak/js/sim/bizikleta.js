// Bizikletaren simulagailua: platera, pinoia, kadentzia eta garapena
import { fmt, svgEl, svgText, slider, reducedMotion } from '../util.js';
import { gearPath } from './engranajeak.js';

const W = 600, H = 330, SLOW = 4;
const PLATERAK = [34, 42, 52];
const KASETEA = [11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 32];

export default function mount(box) {
  box.innerHTML = `
    <div class="sim">
      <div class="sim-body">
        <div class="sim-stage"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Bizikletaren transmisioa: platera, katea, pinoia eta gurpila"></svg></div>
        <div class="sim-panel">
          <div>
            <div class="ctl-top" style="margin-bottom:4px"><span><span class="dot f"></span>Platera</span></div>
            <div class="seg" role="group" aria-label="Platera">${PLATERAK.map(p => `<button data-pl="${p}">${p} hortz</button>`).join('')}</div>
          </div>
          <div id="bz-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" aria-live="polite" id="bz-read"></div>
          <div class="pills" id="bz-pills"></div>
        </div>
      </div>
      <div class="sim-foot"><span>Pedalak eta gurpilak ${SLOW} aldiz motelago.</span><button class="btn sm ghost" id="bz-play" aria-pressed="true">Gelditu</button></div>
    </div>`;

  const svg = box.querySelector('svg');
  const ctl = box.querySelector('#bz-ctl');
  let plater = 42;
  const sP = slider(ctl, { id: 'bz-p', label: 'Pinoia (kasetea)', min: 0, max: KASETEA.length - 1, value: 5, format: v => `${KASETEA[v]} hortz`, dot: 'r' });
  const sK = slider(ctl, { id: 'bz-k', label: 'Kadentzia', min: 40, max: 110, step: 5, value: 80, unit: 'pedalkada/min' });
  const sD = slider(ctl, { id: 'bz-d', label: 'Gurpilaren diametroa', min: 0.5, max: 0.75, step: 0.01, value: 0.7, format: v => fmt(v, 2), unit: 'm' });
  [sP, sK, sD].forEach(s => s.on(build));
  box.querySelectorAll('[data-pl]').forEach(bt => bt.addEventListener('click', () => { plater = +bt.dataset.pl; build(); }));

  let phi = 0, road = 0, running = !reducedMotion(), last = 0, raf = 0, parts = {};
  const play = box.querySelector('#bz-play');
  const setPlay = () => { play.textContent = running ? 'Gelditu' : 'Martxan jarri'; play.setAttribute('aria-pressed', String(running)); };
  play.addEventListener('click', () => { running = !running; setPlay(); });
  setPlay();

  function build() {
    box.querySelectorAll('[data-pl]').forEach(x => x.classList.toggle('active', +x.dataset.pl === plater));
    const pinoi = KASETEA[sP.value], ratio = plater / pinoi, D = sD.value;
    const pitch = 4.2;
    const r1 = pitch * plater / (2 * Math.PI) * 2.3, r2 = pitch * pinoi / (2 * Math.PI) * 2.3;
    const C1 = [210, 185], C2 = [430, 185], wheelR = D * 150;
    svg.textContent = '';
    parts = { ratio };

    // errepidea
    const groundY = C2[1] + wheelR + 6;
    svgEl('line', { x1: 0, y1: groundY, x2: W, y2: groundY, stroke: 'var(--ink)', 'stroke-width': 2 }, svg);
    parts.road = svgEl('line', { x1: 0, y1: groundY + 10, x2: W, y2: groundY + 10, stroke: 'var(--ink3)', 'stroke-width': 3, 'stroke-dasharray': '18 22' }, svg);

    // atzeko gurpila
    parts.wheel = svgEl('g', { transform: `translate(${C2[0]} ${C2[1]})` }, svg);
    parts.wheelRot = svgEl('g', {}, parts.wheel);
    svgEl('circle', { r: wheelR, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 7 }, parts.wheelRot);
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6;
      svgEl('line', { x1: 0, y1: 0, x2: (wheelR - 4) * Math.cos(a), y2: (wheelR - 4) * Math.sin(a), stroke: 'var(--rule)', 'stroke-width': 1.2 }, parts.wheelRot);
    }
    svgEl('line', { x1: 0, y1: 0, x2: wheelR - 4, y2: 0, stroke: 'var(--s2)', 'stroke-width': 3 }, parts.wheelRot);

    // katea (kanpoko tangenteak)
    const d = C2[0] - C1[0], b = Math.asin((r1 - r2) / d), sb = Math.sin(b), cb = Math.cos(b);
    const t1 = [C1[0] + r1 * sb, C1[1] - r1 * cb], t2 = [C2[0] + r2 * sb, C2[1] - r2 * cb];
    const u1 = [C1[0] + r1 * sb, C1[1] + r1 * cb], u2 = [C2[0] + r2 * sb, C2[1] + r2 * cb];
    const path = `M${t1} L${t2} A${r2} ${r2} 0 ${b < 0 ? 1 : 0} 1 ${u2} L${u1} A${r1} ${r1} 0 ${b > 0 ? 1 : 0} 1 ${t1} Z`;
    svgEl('path', { d: path, fill: 'none', stroke: 'var(--ink3)', 'stroke-width': 8 }, svg);
    parts.chain = svgEl('path', { d: path, fill: 'none', stroke: 'var(--sheet)', 'stroke-width': 3.5, 'stroke-dasharray': '5 4' }, svg);
    parts.r1 = r1;

    const gear = (c, r, Z, fill, stroke) => {
      const g = svgEl('g', { transform: `translate(${c[0]} ${c[1]})` }, svg);
      const rot = svgEl('g', {}, g);
      svgEl('path', { d: gearPath(Z, 2 * r / Z), fill, stroke, 'stroke-width': 1.3 }, rot);
      svgEl('circle', { r: 5, fill: 'var(--ink)' }, g);
      return rot;
    };
    parts.chainring = gear(C1, r1, plater, 'var(--g1-fill)', 'var(--s1)');
    parts.sprocket = gear(C2, r2, pinoi, 'var(--g2-fill)', 'var(--s2)');
    // biela eta pedala
    parts.crank = svgEl('g', { transform: `translate(${C1[0]} ${C1[1]})` }, svg);
    parts.crankRot = svgEl('g', {}, parts.crank);
    svgEl('line', { x1: 0, y1: 0, x2: 0, y2: 70, stroke: 'var(--ink)', 'stroke-width': 8, 'stroke-linecap': 'round' }, parts.crankRot);
    parts.pedal = svgEl('rect', { x: -16, y: 64, width: 32, height: 10, fill: 'var(--sheet)', stroke: 'var(--ink)', 'stroke-width': 2 }, svg);

    svgText(svg, C1[0], 34, `Platera ${plater} · ${sK.value} pedalkada/min`, { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 13 });
    svgText(svg, C2[0], 34, `Pinoia ${pinoi} · ${fmt(sK.value * ratio, 0)} bira/min`, { 'text-anchor': 'middle', 'font-weight': 700, 'font-size': 13 });

    // irakurketak
    const gar = ratio * Math.PI * D, v = gar * sK.value * 60 / 1000;
    const ro = (k, val, hi) => `<div class="${hi ? 'hi' : ''}"><span>${k}</span><b>${val}</b></div>`;
    box.querySelector('#bz-read').innerHTML =
      ro('Erlazioa = platera / pinoia', `${plater} / ${pinoi} = ${fmt(ratio, 2)}`) +
      ro('Garapena = erlazioa · π · D', `${fmt(gar, 2)} m`) +
      ro('Abiadura', `${fmt(v, 1)} km/h`, true);
    const feel = gar < 3.5 ? ['Pedalkada arina', 'Aldapa gora'] : gar < 6 ? ['Pedalkada ertaina', 'Laua'] : ['Pedalkada gogorra', 'Laua azkar edo aldapa behera'];
    box.querySelector('#bz-pills').innerHTML = `<span class="pill strong">${feel[0]}</span><span class="pill">Egokia: ${feel[1]}</span>`;
    parts.v = v;
    draw();
  }

  function draw() {
    if (!parts.crankRot) return;
    parts.crankRot.setAttribute('transform', `rotate(${(phi * 180 / Math.PI).toFixed(2)})`);
    const px = 210 - 70 * Math.sin(phi), py = 185 + 70 * Math.cos(phi);
    parts.pedal.setAttribute('x', (px - 16).toFixed(1)); parts.pedal.setAttribute('y', (py - 5).toFixed(1));
    parts.chainring.setAttribute('transform', `rotate(${(phi * 180 / Math.PI).toFixed(2)})`);
    parts.sprocket.setAttribute('transform', `rotate(${(phi * parts.ratio * 180 / Math.PI).toFixed(2)})`);
    parts.wheelRot.setAttribute('transform', `rotate(${(phi * parts.ratio * 180 / Math.PI).toFixed(2)})`);
    parts.chain.setAttribute('stroke-dashoffset', (-phi * parts.r1).toFixed(1));
    parts.road.setAttribute('stroke-dashoffset', road.toFixed(1));
  }

  function tick(now) {
    if (running) {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 0;
      const dphi = dt * (sK.value / 60) * 2 * Math.PI / SLOW;
      phi += dphi;
      road += dphi * parts.ratio * sD.value * 150;
      draw();
    }
    last = now;
    raf = requestAnimationFrame(tick);
  }

  build();
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
