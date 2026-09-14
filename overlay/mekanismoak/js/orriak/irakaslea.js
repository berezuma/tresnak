// Irakasleentzat: ariketa-fitxa inprimagarriak, zenbaki berriekin eta erantzun-orriarekin
import { PRESTAK } from '../unitateak/index.js';
import { ARIKETAK } from '../ariketak.js';
import { fmt, esc } from '../util.js';

const MAILAK = { 1: 'Oinarrizkoa', 2: 'Tartekoa', 3: 'Aditua', 0: 'Nahasia' };
const LETRAK = ['a', 'b', 'c', 'd', 'e'];

export default function render(root, { footer }) {
  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Irakasleentzat</div>
      <h1>Ariketa-fitxak</h1>
      <p class="lede">Aukeratu unitate bat eta sortu fitxa inprimagarri bat. Ariketek zenbaki berriak dituzte aldi bakoitzean, beraz talde bakoitzari fitxa desberdina eman diezaiokezu. Erantzun-orria beste orri batean inprimatzen da.</p>
    </header>

    <div class="teacher-controls">
      <div class="teacher-row">
        <label for="ir-u">Unitatea
          <select id="ir-u">${PRESTAK.map(u => `<option value="${u.id}">${esc(u.izena)}</option>`).join('')}</select>
        </label>
        <label for="ir-m">Maila
          <select id="ir-m">${[1, 2, 3, 0].map(m => `<option value="${m}">${MAILAK[m]}</option>`).join('')}</select>
        </label>
        <label for="ir-n">Ariketak
          <select id="ir-n">${[4, 6, 8, 10].map(n => `<option ${n === 6 ? 'selected' : ''}>${n}</option>`).join('')}</select>
        </label>
      </div>
      <div class="teacher-row">
        <label class="check" for="ir-q"><input type="checkbox" id="ir-q" checked> Galdetegia gehitu</label>
        <label class="check" for="ir-k"><input type="checkbox" id="ir-k" checked> Erantzun-orria gehitu</label>
      </div>
      <div class="teacher-row">
        <button class="btn primary" id="ir-new">Sortu fitxa berria</button>
        <button class="btn" id="ir-print">Inprimatu</button>
        <span class="dim" id="ir-note" style="font-size:14px"></span>
      </div>
    </div>

    <div class="sheet-preview" id="ir-sheet" aria-live="polite"></div>
    ${footer()}`;

  const $ = s => root.querySelector(s);

  async function build() {
    const meta = PRESTAK.find(u => u.id === $('#ir-u').value);
    const u = (await import(`../unitateak/${meta.id}.js`)).default;
    const mailaSel = +$('#ir-m').value, n = +$('#ir-n').value;
    const withQuiz = $('#ir-q').checked, withKey = $('#ir-k').checked;
    const gens = u.ariketak || [];

    const ex = [];
    for (let i = 0; i < (gens.length ? n : 0); i++) {
      const maila = mailaSel || (1 + (i % 3));
      const g = ARIKETAK[gens[i % gens.length]];
      ex.push({ ...g.sortu(maila), izena: g.izena, maila });
    }
    const quiz = withQuiz ? (u.galdetegia || []) : [];
    $('#ir-note').textContent = !gens.length ? 'Unitate honek ez du kalkulu-ariketarik: galdetegia bakarrik.' : '';

    const head = (titulua) => `
      <h2>${esc(u.izena)}${titulua ? ` · ${titulua}` : ''}</h2>
      <p class="sub">Mekanismoen Lantegia · ${esc(meta.taldea)}${gens.length ? ` · Maila: ${MAILAK[mailaSel]}` : ''} · g = 9,8 m/s²</p>`;

    let html = `<div class="fitxa">${head('')}
      <div class="ids"><div>Izena<span></span></div><div>Taldea<span></span></div><div>Data<span></span></div></div>
      ${ex.length ? `<h3 style="font-size:20px;margin:6px 0 10px">Kalkulatu</h3>
        <ol>${ex.map(e => `<li>${e.q}${e.unitatea ? ` <em>(${esc(e.unitatea)})</em>` : ''}<span class="space"></span></li>`).join('')}</ol>` : ''}
      ${quiz.length ? `<h3 style="font-size:20px;margin:16px 0 10px">Egiaztatu</h3>
        <ol start="${ex.length + 1}">${quiz.map(q => `<li>${q.g}<span class="opts">${q.a.map((a, j) => `<span>${LETRAK[j]}) ${a}</span>`).join('')}</span></li>`).join('')}</ol>` : ''}
    </div>`;

    if (withKey && (ex.length || quiz.length)) {
      html += `<div class="fitxa key">${head('Erantzunak')}
        <ol>
          ${ex.map(e => `<li><strong>${fmt(e.erantzuna)} ${esc(e.unitatea)}</strong><span class="steps">${e.ebazpena.join(' → ')}</span></li>`).join('')}
          ${quiz.map(q => `<li><strong>${LETRAK[q.z]}) ${q.a[q.z]}</strong><span class="steps" style="font-family:var(--font-body)">${q.zergatik}</span></li>`).join('')}
        </ol>
      </div>`;
    }
    $('#ir-sheet').innerHTML = html;
  }

  ['#ir-u', '#ir-m', '#ir-n', '#ir-q', '#ir-k'].forEach(s => $(s).addEventListener('change', build));
  $('#ir-new').addEventListener('click', build);
  $('#ir-print').addEventListener('click', () => window.print());
  return build();
}
