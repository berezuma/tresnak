// Glosarioa: euskara · gaztelania · ingelesa (hitzak lantegi bakoitzak ematen ditu: cfg.HITZAK)
import { esc } from '../util.js';

const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function render(root, { footer, cfg }) {
  const HITZAK = [...(cfg.HITZAK || [])].sort((a, b) => a[0].localeCompare(b[0], 'eu'));
  root.innerHTML = `
    <header class="page-head">
      <div class="eyebrow">Errepasatu</div>
      <h1>Glosarioa</h1>
      <p class="lede">Lantegiko hitz teknikoak euskaraz, gaztelaniaz eta ingelesez. Bilatu edozein hizkuntzatan.</p>
    </header>
    <div class="glos-tools">
      <label for="glos-q" style="position:absolute;left:-9999px">Bilatu</label>
      <input id="glos-q" type="search" placeholder="${esc(cfg.glosarioAdibidea || 'Bilatu…')}" autocomplete="off">
      <span class="glos-count" id="glos-n"></span>
      <button class="btn sm no-print" id="glos-print">Inprimatu</button>
    </div>
    <div class="table-scroll">
      <table class="tbl glos-table">
        <thead><tr><th>Euskara</th><th>Gaztelania</th><th>Ingelesa</th><th>Esanahia</th></tr></thead>
        <tbody id="glos-body"></tbody>
      </table>
    </div>
    ${footer()}`;

  const body = root.querySelector('#glos-body'), q = root.querySelector('#glos-q');
  const mark = (text, term) => {
    if (!term) return esc(text);
    const i = norm(text).indexOf(term);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>' + esc(text.slice(i + term.length));
  };
  function draw() {
    const term = norm(q.value.trim());
    const rows = HITZAK.filter(h => !term || h.slice(0, 4).some(x => norm(x).includes(term)));
    body.innerHTML = rows.map(([eu, es, en, def, u]) =>
      `<tr><td><a href="#/${u}">${mark(eu, term)}</a></td><td lang="es">${mark(es, term)}</td><td lang="en">${mark(en, term)}</td><td>${mark(def, term)}</td></tr>`).join('')
      || `<tr><td colspan="4">Ez da hitzik aurkitu «${esc(q.value)}» bilaketarekin.</td></tr>`;
    root.querySelector('#glos-n').textContent = `${rows.length} / ${HITZAK.length} hitz`;
  }
  q.addEventListener('input', draw);
  root.querySelector('#glos-print').addEventListener('click', () => window.print());
  draw();
}
