// Sistema bitarra: bitak piztu eta itzali, pisuak ikusi eta zenbakia hamartarrez, hamaseitarrez eta ASCII karaktere gisa irakurri.
// «Zenbatu» botoiak bitarrez zenbatzen du; «Erronka» moduan, helburu-zenbaki bat lortu behar da.
// Aukerak: bitak (4 | 8), maila
import { esc } from '../util.js';

const hex = (v, N) => v.toString(16).toUpperCase().padStart(N / 4, '0');
const bin = (v, N) => v.toString(2).padStart(N, '0');

export default function mount(box, opts = {}) {
  const maila = opts.maila || 2;
  const P = 'bt' + Math.random().toString(36).slice(2, 7);
  let N = opts.bitak === 4 ? 4 : 8, v = 0, helburua = null, asmatuak = 0, timer = 0;

  box.innerHTML = `
    <div class="sim bts">
      <div class="sim-body">
        <div class="sim-stage bt-stage">
          <div class="bt-bitak" id="${P}-bitak" role="group" aria-label="Bitak"></div>
          <div class="bt-batura" id="${P}-batura" aria-live="polite"></div>
        </div>
        <div class="sim-panel">
          <div class="seg" role="group" aria-label="Bit kopurua"><button data-n="4">4 bit</button><button data-n="8">8 bit (byte bat)</button></div>
          <div class="pills">
            <button class="btn sm" id="${P}-minus" aria-label="Kendu bat">−1</button>
            <button class="btn sm" id="${P}-plus" aria-label="Gehitu bat">+1</button>
            <button class="btn sm primary" id="${P}-zenbatu">▶ Zenbatu</button>
            <button class="btn sm ghost" id="${P}-garbitu">Garbitu</button>
          </div>
          <div class="readouts" id="${P}-read" aria-live="polite"></div>
          <div class="bt-erronka">
            <div class="pills"><button class="btn sm" id="${P}-erronka">Erronka berria</button></div>
            <p class="rb-msg" id="${P}-msg" aria-live="polite">Sakatu «Erronka berria»: zenbaki bat agertuko da, eta bitekin idatzi beharko duzu.</p>
          </div>
        </div>
      </div>
      <div class="sim-foot"><span>Bit bakoitzaren pisua 2ren berretura bat da: eskuinetik ezkerrera 1, 2, 4, 8…</span><span id="${P}-foot"></span></div>
    </div>`;
  const $ = s => box.querySelector(s);

  function bitak() {
    $(`#${P}-bitak`).style.setProperty('--n', N);
    $(`#${P}-bitak`).innerHTML = Array.from({ length: N }, (_, j) => {
      const i = N - 1 - j, on = !!(v >> i & 1);
      return `<button class="bt-bit${on ? ' on' : ''}" data-i="${i}" aria-pressed="${on}" aria-label="${2 ** i}-ko bita: ${on ? 1 : 0}">
        <span class="bt-pisua">${2 ** i}</span><i class="bt-led"></i><b>${on ? 1 : 0}</b><span class="bt-ber">2<sup>${i}</sup></span></button>`;
    }).join('');
  }

  function marraztu() {
    bitak();
    const piztuak = Array.from({ length: N }, (_, j) => N - 1 - j).filter(i => v >> i & 1).map(i => 2 ** i);
    $(`#${P}-batura`).innerHTML = `<span>${piztuak.length ? piztuak.join(' + ') : '0'}</span> = <b>${v}</b>`;
    const ascii = N === 8 && v >= 32 && v <= 126 ? `«${esc(String.fromCharCode(v))}»` : N === 8 && v < 32 ? 'kontrol-karakterea' : N === 8 ? 'ASCII hedatua' : '—';
    $(`#${P}-read`).innerHTML = `
      <div><span>Bitarra</span><b>${bin(v, N)}<sub>2</sub></b></div>
      <div class="hi"><span>Hamartarra</span><b>${v}<sub>10</sub></b></div>
      <div><span>Hamaseitarra</span><b>${hex(v, N)}<sub>16</sub></b></div>
      ${N === 8 ? `<div><span>ASCII karakterea</span><b>${ascii}</b></div>` : ''}
      <div><span>Balio posibleak</span><b>2<sup>${N}</sup> = ${2 ** N} (0–${2 ** N - 1})</b></div>`;
    $(`#${P}-foot`).textContent = N === 8 ? '8 bit = byte 1' : '4 bit = nibble 1 = hamaseitar-digitu 1';
    box.querySelectorAll('[data-n]').forEach(b => { b.classList.toggle('active', +b.dataset.n === N); b.setAttribute('aria-pressed', String(+b.dataset.n === N)); });
    if (helburua !== null) {
      const m = $(`#${P}-msg`);
      if (v === helburua) {
        asmatuak++;
        m.className = 'rb-msg ok';
        m.textContent = `Lortuta! ${helburua} = ${bin(helburua, N)}₂. Asmatuak: ${asmatuak}.`;
        helburua = null;
      } else {
        m.className = 'rb-msg warn';
        m.innerHTML = `Idatzi <b>${helburua}</b> zenbakia bitekin. Orain: ${v}${v < helburua ? ' (txikiegia)' : ' (handiegia)'}.`;
      }
    }
  }

  function zenbatzeaGelditu() {
    clearInterval(timer);
    timer = 0;
    $(`#${P}-zenbatu`).textContent = '▶ Zenbatu';
  }
  function ezarri(nv) { v = (nv + 2 ** N) % 2 ** N; marraztu(); }

  $(`#${P}-bitak`).addEventListener('click', e => {
    const b = e.target.closest('[data-i]');
    if (!b) return;
    zenbatzeaGelditu();
    ezarri(v ^ (1 << +b.dataset.i));
    box.querySelector(`[data-i="${b.dataset.i}"]`)?.focus({ preventScroll: true });
  });
  box.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => {
    N = +b.dataset.n;
    zenbatzeaGelditu();
    helburua = null;
    $(`#${P}-msg`).className = 'rb-msg';
    $(`#${P}-msg`).textContent = 'Sakatu «Erronka berria» zenbaki bat bitekin idazteko.';
    ezarri(v % 2 ** N);
  }));
  $(`#${P}-plus`).addEventListener('click', () => { zenbatzeaGelditu(); ezarri(v + 1); });
  $(`#${P}-minus`).addEventListener('click', () => { zenbatzeaGelditu(); ezarri(v - 1); });
  $(`#${P}-garbitu`).addEventListener('click', () => { zenbatzeaGelditu(); ezarri(0); });
  $(`#${P}-zenbatu`).addEventListener('click', () => {
    if (timer) { zenbatzeaGelditu(); return; }
    helburua = null;
    $(`#${P}-zenbatu`).textContent = '⏸ Gelditu';
    timer = setInterval(() => ezarri(v + 1), N === 4 ? 700 : 350);
  });
  $(`#${P}-erronka`).addEventListener('click', () => {
    zenbatzeaGelditu();
    const max = 2 ** N - 1;
    do { helburua = 1 + Math.floor(Math.random() * (maila >= 3 ? max : Math.min(max, N === 8 ? 200 : max))); } while (helburua === v);
    marraztu();
  });

  marraztu();
  return () => clearInterval(timer);
}
