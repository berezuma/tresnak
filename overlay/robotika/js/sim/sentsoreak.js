// Sentsoreak eta eragingailuak: sentsore digitalak eta analogikoak (tentsioa denboran eta ADCaren balioa),
// PWM seinalea, eta eragingailuak (servoa, DC motorra H zubiarekin, errelea).
// Aukerak: modua ('sentsoreak' | 'pwm' | 'eragingailuak'), maila
import { fmt, slider } from '../util.js';

const SENTSOREAK = { botoia: 'Botoia', poten: 'Potentziometroa', ldr: 'LDR', ntc: 'NTC', us: 'Ultrasoinuak' };
const ERAGINGAILUAK = { servo: 'Servoa', hzubia: 'DC motorra (H zubia)', errelea: 'Errelea' };
const T = (x, y, s, cls = 'ss-t', anchor = 'middle') => `<text class="${cls}" x="${x}" y="${y}" text-anchor="${anchor}">${s}</text>`;

export default function mount(box, opts = {}) {
  const P = 'ss' + Math.random().toString(36).slice(2, 7);
  let modua = ['sentsoreak', 'pwm', 'eragingailuak'].includes(opts.modua) ? opts.modua : 'sentsoreak';
  let sentsorea = 'ldr', eragingailua = 'servo';
  let s = {}, sakatuta = false, in1 = true, in2 = false, errelea = false;
  let laginak = [], t = 0, last = performance.now(), raf = 0, hilda = false, bira = 0, azkenRead = '';

  box.innerHTML = `
    <div class="sim sss">
      <div class="kn-modua"><div class="seg" role="group" aria-label="Atala">
        <button data-m="sentsoreak">Sentsoreak</button><button data-m="pwm">PWM</button><button data-m="eragingailuak">Eragingailuak</button>
      </div></div>
      <div class="sim-body">
        <div class="sim-stage"><svg id="${P}-svg" viewBox="0 0 640 260" role="img" aria-label="Sentsoreak eta eragingailuak"></svg></div>
        <div class="sim-panel">
          <div id="${P}-azpi"></div>
          <div id="${P}-ctl" style="display:grid;gap:10px"></div>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <p class="lab-hint" id="${P}-txt"></p>
        </div>
      </div>
      <div class="sim-foot"><span id="${P}-f1"></span><span id="${P}-f2"></span></div>
    </div>`;
  const $ = q => box.querySelector(q);

  function kontrolak() {
    const ctl = $(`#${P}-ctl`), azpi = $(`#${P}-azpi`);
    ctl.innerHTML = '';
    s = {};
    laginak = [];
    box.querySelectorAll('[data-m]').forEach(b => { b.classList.toggle('active', b.dataset.m === modua); b.setAttribute('aria-pressed', String(b.dataset.m === modua)); });
    if (modua === 'sentsoreak') {
      azpi.innerHTML = `<div class="seg ss-aukerak" role="group" aria-label="Sentsorea">${Object.entries(SENTSOREAK).map(([k, v]) => `<button data-s="${k}" class="${k === sentsorea ? 'active' : ''}">${v}</button>`).join('')}</div>`;
      if (sentsorea === 'botoia') {
        ctl.innerHTML = `<button class="btn primary pn-sakatu" id="${P}-sak" aria-pressed="false">Sakatu botoia (eutsi)</button>`;
        const b = $(`#${P}-sak`);
        const ezarri = v => { sakatuta = v; b.setAttribute('aria-pressed', String(v)); b.classList.toggle('sakatuta', v); };
        b.addEventListener('pointerdown', e => { ezarri(true); try { b.setPointerCapture(e.pointerId); } catch { /* */ } });
        ['pointerup', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => ezarri(false)));
        b.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); ezarri(true); } });
        b.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') ezarri(false); });
        $(`#${P}-txt`).textContent = 'Sentsore digitala: bi egoera bakarrik. Sakatzean 5 V (1), askatzean 0 V (0). Pull-down erresistentziak pina 0 V-ra eramaten du botoia askatuta dagoenean.';
      } else if (sentsorea === 'poten') {
        s.a = slider(ctl, { id: P + '-a', label: 'Biraketa-angelua', min: 0, max: 270, step: 1, value: 135, unit: '°', format: v => fmt(v, 0) });
        $(`#${P}-txt`).textContent = 'Potentziometroa tentsio-zatitzaile aldakor bat da: kurtsorearen tentsioa angeluarekiko proportzionala da.';
      } else if (sentsorea === 'ldr') {
        s.l = slider(ctl, { id: P + '-l', label: 'Argia', min: 0, max: 3, step: 0.02, value: 2, format: v => `${fmt(10 ** v, 0)} lux` });
        $(`#${P}-txt`).textContent = 'LDRaren erresistentzia argiarekin jaisten da. Tentsio-zatitzaile batean (LDRa goian), argi gehiagorekin tentsio handiagoa.';
      } else if (sentsorea === 'ntc') {
        s.c = slider(ctl, { id: P + '-c', label: 'Tenperatura', min: -10, max: 60, step: 0.5, value: 22, unit: '°C', format: v => fmt(v, 1) });
        $(`#${P}-txt`).textContent = 'NTC termistorearen erresistentzia beroarekin jaisten da (Negative Temperature Coefficient). Ez da lineala: kalibrazio-taula edo formula bat behar da.';
      } else {
        s.d = slider(ctl, { id: P + '-d', label: 'Oztoporako distantzia', min: 2, max: 300, step: 1, value: 60, unit: 'cm', format: v => fmt(v, 0) });
        $(`#${P}-txt`).textContent = 'HC-SR04 sentsoreak ultrasoinu-pultsu bat igortzen du (Trig) eta oihartzuna itzultzen den arte neurtzen du denbora (Echo). Soinuaren abiadura: 343 m/s.';
      }
      azpi.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { sentsorea = b.dataset.s; kontrolak(); }));
    } else if (modua === 'pwm') {
      azpi.innerHTML = '';
      s.d = slider(ctl, { id: P + '-pw', label: 'Lan-zikloa (duty cycle)', min: 0, max: 100, step: 1, value: 25, unit: '%', format: v => fmt(v, 0) });
      $(`#${P}-txt`).textContent = 'Arduinoren pin digitalek ezin dute 2,5 V eman: 0 V edo 5 V bakarrik. PWMak oso azkar txandakatzen ditu (segundoko 490 aldiz). Denbora-tarte bateko batez besteko tentsioa lan-zikloaren araberakoa da.';
    } else {
      azpi.innerHTML = `<div class="seg ss-aukerak" role="group" aria-label="Eragingailua">${Object.entries(ERAGINGAILUAK).map(([k, v]) => `<button data-e="${k}" class="${k === eragingailua ? 'active' : ''}">${v}</button>`).join('')}</div>`;
      if (eragingailua === 'servo') {
        s.p = slider(ctl, { id: P + '-sp', label: 'Pultsuaren iraupena', min: 1, max: 2, step: 0.01, value: 1.5, unit: 'ms', format: v => fmt(v, 2) });
        $(`#${P}-txt`).textContent = 'Servoak 20 ms-ro pultsu bat jasotzen du. Pultsuaren iraupenak adierazten du angelua: 1 ms → 0°, 1,5 ms → 90°, 2 ms → 180°. Barruko kontrol-zirkuitu batek posizio horretan mantentzen du.';
      } else if (eragingailua === 'hzubia') {
        ctl.innerHTML = `<div class="pills"><button class="btn" id="${P}-in1" aria-pressed="${in1}">IN1 = ${+in1}</button><button class="btn" id="${P}-in2" aria-pressed="${in2}">IN2 = ${+in2}</button></div>`;
        s.en = slider(ctl, { id: P + '-en', label: 'ENA abiadura (PWM)', min: 0, max: 255, step: 1, value: 200, format: v => fmt(v, 0) });
        const eg = () => { ['in1', 'in2'].forEach(k => { const b = $(`#${P}-${k}`); const v = k === 'in1' ? in1 : in2; b.textContent = `${k.toUpperCase()} = ${+v}`; b.setAttribute('aria-pressed', String(v)); b.classList.toggle('primary', v); }); };
        $(`#${P}-in1`).addEventListener('click', () => { in1 = !in1; eg(); });
        $(`#${P}-in2`).addEventListener('click', () => { in2 = !in2; eg(); });
        eg();
        $(`#${P}-txt`).textContent = 'H zubiak lau etengailu (transistore) ditu. Bikote diagonal bat ixtean korronteak motorra noranzko batean zeharkatzen du, eta beste bikotea ixtean kontrako noranzkoan: horrela aldatzen da biraketa-noranzkoa. L298N txartela horrelakoa da.';
      } else {
        ctl.innerHTML = `<button class="btn" id="${P}-rel" aria-pressed="${errelea}">7 pina: ${errelea ? 'HIGH' : 'LOW'}</button>`;
        $(`#${P}-rel`).addEventListener('click', e => { errelea = !errelea; e.currentTarget.textContent = `7 pina: ${errelea ? 'HIGH' : 'LOW'}`; e.currentTarget.setAttribute('aria-pressed', String(errelea)); e.currentTarget.classList.toggle('primary', errelea); });
        $(`#${P}-txt`).textContent = 'Erreleak bi zirkuitu bereizten ditu: Arduinoren 5 V-ko zirkuituak bobina bat aktibatzen du, eta eremu magnetikoak 230 V-ko zirkuituaren kontaktua ixten du. Bien artean ez dago lotura elektrikorik.';
      }
      azpi.querySelectorAll('[data-e]').forEach(b => b.addEventListener('click', () => { eragingailua = b.dataset.e; kontrolak(); }));
    }
  }

  // ---------- sentsoreen tentsioa ----------
  function tentsioa() {
    switch (sentsorea) {
      case 'botoia': return sakatuta ? 5 : 0;
      case 'poten': return 5 * s.a.value / 270;
      case 'ldr': { const R = 10 * Math.pow(10 ** s.l.value / 10, -0.7); return 5 * 10 / (R + 10); }
      case 'ntc': { const R = 10 * Math.exp(3950 * (1 / (s.c.value + 273.15) - 1 / 298.15)); return 5 * 10 / (R + 10); }
      default: return 0;
    }
  }

  function marraztuSentsoreak() {
    const V = tentsioa();
    let g = '';
    if (sentsorea === 'us') {
      const d = s.d.value, tUs = 2 * d / 34300 * 1e6;
      const ox = 150 + Math.min(d, 300) / 300 * 60;
      g += `<rect x="20" y="95" width="80" height="50" rx="4" class="ss-us"/><circle cx="42" cy="120" r="14" class="ss-us-c"/><circle cx="78" cy="120" r="14" class="ss-us-c"/>
        ${T(42, 124, 'T', 'ss-t sm')}${T(78, 124, 'R', 'ss-t sm')}${T(60, 164, 'HC-SR04', 'ss-t sm')}
        ${[0, 1, 2].map(i => `<path class="ss-uhina" d="M${108 + i * 12} 105 Q${116 + i * 12} 120 ${108 + i * 12} 135"/>`).join('')}
        <rect x="${ox}" y="80" width="18" height="80" class="ss-oztopoa"/>${T(ox + 9, 176, `${fmt(d, 0)} cm`, 'ss-t sm')}`;
      // Trig eta Echo pultsuak (0–20 ms)
      const X0 = 260, X1 = 620, msX = ms => X0 + ms / 20 * (X1 - X0);
      const ew = Math.min(tUs / 1000, 19);
      g += `${T(250, 76, 'Trig', 'ss-t sm', 'end')}${T(250, 166, 'Echo', 'ss-t sm', 'end')}
        <path class="ss-seinalea" d="M${X0} 80 H${msX(0.5)} V50 H${msX(0.6)} V80 H${X1}"/>
        <path class="ss-seinalea on" d="M${X0} 170 H${msX(0.8)} V140 H${msX(0.8 + ew)} V170 H${X1}"/>
        <line class="ss-ax" x1="${X0}" y1="200" x2="${X1}" y2="200"/>${[0, 5, 10, 15, 20].map(m => T(msX(m), 216, `${m} ms`, 'ss-t sm')).join('')}
        <path class="ss-neurria" d="M${msX(0.8)} 125 H${msX(0.8 + ew)}"/>${T((msX(0.8) + msX(0.8 + ew)) / 2, 118, `t = ${fmt(tUs, 0)} µs`, 'ss-t sm')}`;
      $(`#${P}-read`).innerHTML = `<div><span>Oihartzunaren denbora</span><b>${fmt(tUs, 0)} µs</b></div>
        <div class="hi"><span>Distantzia = t · 343 / 2</span><b>${fmt(tUs * 1e-6 * 343 / 2 * 100, 1)} cm</b></div>
        <div><span>Seinale mota</span><b>denbora (pultsua)</b></div>`;
      $(`#${P}-f1`).textContent = 'd = v · t / 2 (joan-etorria)';
      $(`#${P}-f2`).textContent = `${fmt(tUs, 0)} µs · 0,0343 cm/µs / 2 = ${fmt(tUs * 0.0343 / 2, 1)} cm`;
      return g;
    }
    // eskema: 5 V goian, sentsorea, erdiko nodoa (pina), 10 kΩ, GND
    const pin = sentsorea === 'botoia' ? 'D2' : 'A0';
    g += `<g class="ss-hari"><path d="M90 30 V56 M90 108 V126 M90 134 V152 M90 204 V226 M90 130 H170"/></g>
      ${T(90, 22, '5 V', 'ss-t')}<path class="ss-lurra" d="M76 228 H104 M81 234 H99 M86 240 H94"/>
      <circle cx="90" cy="130" r="4" class="ss-nodoa"/>${T(200, 135, pin, 'ss-t on')}<path class="ss-gezia" d="M170 130 l-8 -5 v10 z"/>`;
    const elementua = (y, label, extra = '') => `<rect x="80" y="${y}" width="20" height="52" class="ss-osagaia"/>${extra}${T(112, y + 30, label, 'ss-t sm', 'start')}`;
    if (sentsorea === 'botoia') {
      g += `<path class="ss-hari-l" d="M90 56 V70 M90 100 V108"/><circle cx="90" cy="70" r="3" class="ss-nodoa"/><circle cx="90" cy="100" r="3" class="ss-nodoa"/>
        <path class="ss-hari-l on" d="M90 70 L${sakatuta ? '90 100' : '112 90'}"/>${T(112, 72, 'botoia', 'ss-t sm', 'start')}` + elementua(152, '10 kΩ (pull-down)');
    } else if (sentsorea === 'poten') {
      const yw = 56 + 96 * (1 - s.a.value / 270);
      g = g.replace('M90 108 V126 M90 134 V152', '');
      g += `<rect x="80" y="56" width="20" height="148" class="ss-osagaia"/><path class="ss-gezia" d="M106 ${yw} l10 -5 v10 z"/><path class="ss-hari-l" d="M116 ${yw} H140 V130"/>${T(46, 130, '10 kΩ', 'ss-t sm', 'end')}`;
      g = g.replace('M90 130 H170', 'M140 130 H170');
    } else {
      const geziak = sentsorea === 'ldr' ? '<path class="ss-uhina" d="M50 58 l18 12 m-6 0 h6 v-6 M46 76 l18 12 m-6 0 h6 v-6"/>' : '<path class="ss-hari-l" d="M72 104 L110 62 H118"/>';
      g += elementua(56, sentsorea === 'ldr' ? 'LDR' : 'NTC', geziak) + elementua(152, '10 kΩ');
    }
    // grafikoa
    const X0 = 260, X1 = 620, Y0 = 220, Y1 = 30, Y = v => Y0 - v / 5 * (Y0 - Y1);
    g += `<rect x="${X0}" y="${Y1}" width="${X1 - X0}" height="${Y0 - Y1}" class="ss-plot"/>
      ${[0, 2.5, 5].map(v => `<line class="ss-ax${v === 2.5 ? ' erdia' : ''}" x1="${X0}" y1="${Y(v)}" x2="${X1}" y2="${Y(v)}"/>${T(X0 - 6, Y(v) + 4, `${fmt(v, 1)} V`, 'ss-t sm', 'end')}`).join('')}
      <polyline class="ss-seinalea on" points="${laginak.map(([tt, v]) => `${(X1 - (t - tt) / 10 * (X1 - X0)).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}"/>
      ${T(X1, Y1 - 8, 'tentsioa, azken 10 s', 'ss-t sm', 'end')}`;
    const adc = Math.round(V / 5 * 1023);
    let magnitudea = '';
    if (sentsorea === 'poten') magnitudea = `<div><span>Angelua</span><b>${fmt(s.a.value, 0)}°</b></div>`;
    if (sentsorea === 'ldr') magnitudea = `<div><span>LDRaren erresistentzia</span><b>${fmt(10 * Math.pow(10 ** s.l.value / 10, -0.7), 2)} kΩ</b></div>`;
    if (sentsorea === 'ntc') magnitudea = `<div><span>NTCaren erresistentzia</span><b>${fmt(10 * Math.exp(3950 * (1 / (s.c.value + 273.15) - 1 / 298.15)), 2)} kΩ</b></div>`;
    $(`#${P}-read`).innerHTML = `${magnitudea}
      <div class="hi"><span>Tentsioa pinean</span><b>${fmt(V, 2)} V</b></div>
      ${sentsorea === 'botoia' ? `<div><span>digitalRead(2)</span><b>${V > 2.5 ? '1 (HIGH)' : '0 (LOW)'}</b></div>` : `<div><span>analogRead(A0), 10 bit</span><b>${adc}</b></div>`}
      <div><span>Seinale mota</span><b>${sentsorea === 'botoia' ? 'digitala' : 'analogikoa'}</b></div>`;
    $(`#${P}-f1`).textContent = sentsorea === 'botoia' ? 'digitala: V > 2,5 V → 1' : 'ADC = V / 5 V · 1023';
    $(`#${P}-f2`).textContent = sentsorea === 'botoia' ? '' : `${fmt(V, 2)} / 5 · 1023 = ${adc}`;
    return g;
  }

  function marraztuPWM() {
    const d = s.d.value / 100;
    const X0 = 260, PER = 120, Yh = 50, Yl = 170;
    let path = `M${X0} ${Yl}`;
    for (let i = 0; i < 3; i++) {
      const x = X0 + i * PER;
      path += d > 0 ? ` V${Yh} H${x + d * PER} V${Yl} H${x + PER}` : ` H${x + PER}`;
    }
    if (d >= 1) path = `M${X0} ${Yl} V${Yh} H${X0 + 3 * PER}`;
    const Yav = Yl - d * (Yl - Yh);
    const g = `<circle cx="110" cy="80" r="${26 + 18 * d}" class="ss-dirdira" opacity="${(0.1 + 0.6 * d).toFixed(2)}"/>
      <path d="M98 94 V78 A12 12 0 0 1 122 78 V94 Z" class="ss-led" style="opacity:${(0.3 + 0.7 * d).toFixed(2)}"/>${T(110, 124, 'LEDa (~9)', 'ss-t sm')}
      <circle cx="110" cy="190" r="26" class="ss-motor"/><g class="ss-helizea" style="transform:rotate(${bira.toFixed(1)}deg);transform-origin:110px 190px"><path d="M110 170 V210 M90 190 H130"/></g>${T(110, 236, 'DC motorra', 'ss-t sm')}
      <path class="ss-seinalea on" d="${path}"/>
      <line class="ss-media" x1="${X0}" y1="${Yav}" x2="${X0 + 3 * PER}" y2="${Yav}"/>${T(X0 + 3 * PER + 6, Yav + 4, `${fmt(5 * d, 2)} V`, 'ss-t sm on', 'start')}
      ${T(X0 - 6, Yh + 4, '5 V', 'ss-t sm', 'end')}${T(X0 - 6, Yl + 4, '0 V', 'ss-t sm', 'end')}
      <path class="ss-neurria" d="M${X0} 200 H${X0 + PER}"/>${T(X0 + PER / 2, 218, 'T ≈ 2 ms (490 Hz)', 'ss-t sm')}
      ${d > 0 && d < 1 ? `<path class="ss-neurria" d="M${X0} 36 H${X0 + d * PER}"/>${T(X0 + d * PER / 2, 30, 't_on', 'ss-t sm')}` : ''}`;
    $(`#${P}-read`).innerHTML = `<div class="hi"><span>Batez besteko tentsioa</span><b>${fmt(5 * d, 2)} V</b></div>
      <div><span>analogWrite(9, …)</span><b>${Math.round(d * 255)}</b></div>
      <div><span>Piztuta (periodo bakoitzean)</span><b>${fmt(2.04 * d, 2)} ms</b></div>`;
    $(`#${P}-f1`).textContent = 'V_bb = lan-zikloa · 5 V · analogWrite = lan-zikloa · 255';
    $(`#${P}-f2`).textContent = `${fmt(d * 100, 0)} % · 255 = ${Math.round(d * 255)}`;
    return g;
  }

  function marraztuEragingailuak() {
    if (eragingailua === 'servo') {
      const pw = s.p.value, ang = (pw - 1) * 180;
      const X0 = 260, X1 = 620, msX = ms => X0 + ms / 40 * (X1 - X0);
      const g = `<rect x="50" y="100" width="130" height="70" rx="6" class="ss-servo"/>${T(115, 190, 'servoa', 'ss-t sm')}
        <path class="ss-arku" d="M70 130 A45 45 0 0 1 160 130"/>
        <g transform="rotate(${-ang} 115 130)"><rect x="115" y="124" width="56" height="12" rx="6" class="ss-besoa"/></g><circle cx="115" cy="130" r="8" class="ss-ardatza"/>
        ${T(64, 144, '0°', 'ss-t sm')}${T(115, 76, '90°', 'ss-t sm')}${T(166, 144, '180°', 'ss-t sm')}
        <path class="ss-seinalea on" d="M${X0} 170 H${msX(1)} V70 H${msX(1 + pw)} V170 H${msX(21)} V70 H${msX(21 + pw)} V170 H${X1}"/>
        ${T(X0 - 6, 74, '5 V', 'ss-t sm', 'end')}${T(X0 - 6, 174, '0 V', 'ss-t sm', 'end')}
        <path class="ss-neurria" d="M${msX(1)} 200 H${msX(21)}"/>${T(msX(11), 218, '20 ms (50 Hz)', 'ss-t sm')}
        ${T(msX(1 + pw / 2), 58, `${fmt(pw, 2)} ms`, 'ss-t sm on')}`;
      $(`#${P}-read`).innerHTML = `<div><span>Pultsua</span><b>${fmt(pw, 2)} ms</b></div><div class="hi"><span>Angelua</span><b>${fmt(ang, 0)}°</b></div>`;
      $(`#${P}-f1`).textContent = 'angelua = (pultsua − 1 ms) · 180°';
      $(`#${P}-f2`).textContent = `(${fmt(pw, 2)} − 1) · 180 = ${fmt(ang, 0)}°`;
      return g;
    }
    if (eragingailua === 'hzubia') {
      const aurrera = in1 && !in2, atzera = in2 && !in1, balazta = in1 && in2;
      const en = s.en.value / 255;
      const S = { 1: aurrera, 4: aurrera, 2: atzera, 3: atzera || balazta };
      if (balazta) S[4] = true;
      const eteng = (x, y, itxia, izena) => `<circle cx="${x}" cy="${y - 20}" r="3" class="ss-nodoa"/><circle cx="${x}" cy="${y + 20}" r="3" class="ss-nodoa"/>
        <path class="ss-hari-l${itxia ? ' on' : ''}" d="M${x} ${y - 20} L${itxia ? `${x} ${y + 20}` : `${x + 18} ${y + 12}`}"/>${T(x - 12, y + 4, izena, 'ss-t sm', 'end')}`;
      const korr = aurrera ? 'M300 40 V90 M300 130 H350 M430 130 H480 V170 V220' : atzera ? 'M480 40 V90 M430 130 H350 M300 130 V170 V220' : '';
      const g = `<g class="ss-hari"><path d="M300 40 H480 M300 40 V70 M480 40 V70 M300 110 V150 M480 110 V150 M300 190 V220 M480 190 V220 M300 220 H480 M300 130 H350 M430 130 H480"/></g>
        ${korr ? `<path class="ss-korrontea" d="${korr}"/>` : ''}
        ${T(390, 30, '+V motorra (9 V)', 'ss-t sm')}<path class="ss-lurra" d="M376 222 H404 M381 228 H399 M386 234 H394"/>
        ${eteng(300, 90, S[1], 'S1')}${eteng(480, 90, S[2], 'S2')}${eteng(300, 170, S[3], 'S3')}${eteng(480, 170, S[4], 'S4')}
        <circle cx="390" cy="130" r="30" class="ss-motor"/><g class="ss-helizea" style="transform:rotate(${bira.toFixed(1)}deg);transform-origin:390px 130px"><path d="M390 108 V152 M368 130 H412"/></g>
        ${T(390, 176, aurrera ? '↻ aurrera' : atzera ? '↺ atzera' : balazta ? 'balazta' : 'geldi (librea)', 'ss-t sm on')}
        <rect x="30" y="70" width="140" height="120" rx="6" class="ss-txartela"/>${T(100, 92, 'Arduino', 'ss-t')}
        ${T(100, 120, `IN1 = ${+in1}`, 'ss-t sm')}${T(100, 142, `IN2 = ${+in2}`, 'ss-t sm')}${T(100, 164, `ENA = ${s.en.value}`, 'ss-t sm')}
        <path class="ss-hari-l" d="M170 130 H250" stroke-dasharray="5 4"/>`;
      $(`#${P}-read`).innerHTML = `<div class="hi"><span>Motorra</span><b>${aurrera ? 'aurrera' : atzera ? 'atzera' : balazta ? 'balazta' : 'geldi'}</b></div>
        <div><span>Etengailu itxiak</span><b>${Object.entries(S).filter(([, v]) => v).map(([k]) => 'S' + k).join(', ') || '—'}</b></div>
        <div><span>Abiadura (ENA)</span><b>% ${fmt(en * 100, 0)}</b></div>`;
      $(`#${P}-f1`).textContent = 'IN1 IN2: 1 0 aurrera · 0 1 atzera · 0 0 geldi · 1 1 balazta';
      $(`#${P}-f2`).textContent = '';
      return g;
    }
    const g = `<rect x="20" y="60" width="120" height="100" rx="6" class="ss-txartela"/>${T(80, 84, 'Arduino', 'ss-t')}${T(80, 120, `7 pina: ${errelea ? 'HIGH' : 'LOW'}`, 'ss-t sm on')}
      <g class="ss-hari"><path d="M140 110 H180 V70 H210 M240 70 H250 V150 H180 V200"/></g>
      <rect x="200" y="84" width="24" height="52" class="ss-bobina${errelea ? ' on' : ''}"/>${T(212, 60, 'bobina', 'ss-t sm')}
      <path class="ss-lurra" d="M166 202 H194 M171 208 H189 M176 214 H184"/>
      <path class="ss-lotura" d="M226 110 H330"/>
      <g class="ss-hari"><path d="M340 60 H360 M400 60 H560 V100 M560 160 V200 H340 V60"/></g>
      <circle cx="340" cy="130" r="18" class="ss-ac"/><path class="ss-hari-l" d="M328 130 q6 -10 12 0 t12 0"/>${T(340, 176, '230 V', 'ss-t sm')}
      <circle cx="360" cy="60" r="3" class="ss-nodoa"/><circle cx="400" cy="60" r="3" class="ss-nodoa"/>
      <path class="ss-hari-l${errelea ? ' on' : ''}" d="M360 60 L${errelea ? '400 60' : '392 40'}"/>${T(380, 34, 'kontaktua', 'ss-t sm')}
      ${errelea ? '<circle cx="560" cy="130" r="40" class="ss-dirdira" opacity=".5"/>' : ''}
      <circle cx="560" cy="130" r="24" class="ss-lanpara${errelea ? ' on' : ''}"/><path class="ss-hari-l" d="M543 113 L577 147 M577 113 L543 147"/>${T(600, 136, 'lanpara', 'ss-t sm', 'start')}`;
    $(`#${P}-read`).innerHTML = `<div><span>Kontrol-zirkuitua</span><b>5 V, ${errelea ? '~70 mA' : '0 mA'}</b></div><div class="hi"><span>Potentzia-zirkuitua</span><b>230 V, ${errelea ? 'lanpara piztuta' : 'irekita'}</b></div>`;
    $(`#${P}-f1`).textContent = 'Bi zirkuitu, isolatuta: kontrola (5 V) eta potentzia (230 V)';
    $(`#${P}-f2`).textContent = '';
    return g;
  }

  function frame(now) {
    if (hilda) return;
    const dt = Math.min(now - last, 100) / 1000;
    last = now;
    t += dt;
    if (modua === 'sentsoreak' && sentsorea !== 'us') {
      laginak.push([t, tentsioa()]);
      while (laginak.length && laginak[0][0] < t - 10) laginak.shift();
    }
    const abiadura = modua === 'pwm' ? s.d.value / 100 : modua === 'eragingailuak' && eragingailua === 'hzubia' ? ((in1 && !in2) ? 1 : (in2 && !in1) ? -1 : 0) * s.en.value / 255 : 0;
    bira = (bira + abiadura * 720 * dt) % 360;
    const g = modua === 'sentsoreak' ? marraztuSentsoreak() : modua === 'pwm' ? marraztuPWM() : marraztuEragingailuak();
    $(`#${P}-svg`).innerHTML = `<g class="ss">${g}</g>`;
    raf = requestAnimationFrame(frame);
  }
  void azkenRead;

  box.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => { if (b.dataset.m !== modua) { modua = b.dataset.m; kontrolak(); } }));
  kontrolak();
  raf = requestAnimationFrame(frame);
  return () => { hilda = true; cancelAnimationFrame(raf); };
}
