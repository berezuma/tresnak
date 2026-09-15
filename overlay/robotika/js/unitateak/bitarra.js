import { nahastu } from '../util.js';

const pisuTaula = (bitak, izena = '') => {
  const N = bitak.length;
  return `<div class="table-scroll"><table class="tbl bit-taula">
    <thead><tr><th>Pisua</th>${bitak.map((_, i) => `<th>${2 ** (N - 1 - i)}</th>`).join('')}${izena ? '<th></th>' : ''}</tr></thead>
    <tbody><tr><td><strong>Bita</strong></td>${bitak.map(b => `<td class="${b ? 'bat' : ''}">${b}</td>`).join('')}${izena ? `<td>${izena}</td>` : ''}</tr></tbody>
  </table></div>`;
};

export default {
  izena: 'Sistema bitarra',
  galdera: 'Nola gordetzen ditu ordenagailu batek zenbakiak, letrak eta argazkiak, bi egoera bakarrik dituzten milaka milioi etengailu txikitan?',

  ikusi: {
    sim: 'bitarra',
    proba: 'Piztu bitak banan-banan eta ikusi zenbat balio duen bakoitzak. Sakatu <b>Zenbatu</b> eta begiratu eskuineko bita: txandaka aldatzen da. Idatzi 65 zenbakia byte batean: zein letra da? Gero egin hiru <b>erronka</b>, ahalik eta azkarren.'
  },

  ulertu: () => `
    <p class="def">Sistema digitalek bi egoera bakarrik bereizten dituzte: tentsioa dago edo ez dago, etengailua piztuta edo itzalita. Egoera bakoitza <strong>0</strong> edo <strong>1</strong> digituarekin idazten da, eta digitu horri <strong>bit</strong> deitzen zaio (<em>binary digit</em>). Zortzi bitek <strong>byte</strong> bat osatzen dute.</p>

    <h3>Posizio-sistemak: hamartarra eta bitarra</h3>
    <p>Sistema hamartarrean hamar digitu daude (0–9), eta digitu bakoitzaren balioa bere posizioaren araberakoa da: unitateak, hamarrekoak, ehunekoak… 10en berreturak.</p>
    <div class="formula">345 = 3 · 100 + 4 · 10 + 5 · 1</div>
    <p>Sistema bitarrean bi digitu bakarrik daude (0 eta 1), eta posizioen pisuak <strong>2ren berreturak</strong> dira: eskuinetik ezkerrera, 1, 2, 4, 8, 16, 32, 64, 128…</p>

    <div class="worked">
      <h4>Adibidea: bitarretik hamartarrera</h4>
      <p>Zein zenbaki da 10110₂?</p>
      ${pisuTaula([1, 0, 1, 1, 0])}
      <ol><li>1 duten bitenak batu: 16 + 4 + 2</li><li>= 22</li></ol>
      <p class="ans">10110₂ = 22₁₀</p>
    </div>

    <div class="worked">
      <h4>Adibidea: hamartarretik bitarrera</h4>
      <p>Zatitu 2z behin eta berriz, eta idatzi hondarrak. Zenbakia <strong>behetik gora</strong> irakurtzen da. 13 bitarrez:</p>
      <ol><li>13 : 2 = 6, hondarra <strong>1</strong></li><li>6 : 2 = 3, hondarra <strong>0</strong></li><li>3 : 2 = 1, hondarra <strong>1</strong></li><li>1 : 2 = 0, hondarra <strong>1</strong></li></ol>
      <p class="ans">13₁₀ = 1101₂ (egiaztatu: 8 + 4 + 1 = 13)</p>
    </div>

    <h3>Zenbat balio bit-kopuru batekin?</h3>
    <p>Bit bat gehitzen den bakoitzean, aukerak bikoiztu egiten dira. <strong>n</strong> bitekin 2<sup>n</sup> balio desberdin adieraz daitezke, 0tik 2<sup>n</sup> − 1era.</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Bitak</th><th>1</th><th>2</th><th>4</th><th>8 (byte)</th><th>10</th><th>16</th></tr></thead>
      <tbody><tr><td><strong>Balioak</strong></td><td>2</td><td>4</td><td>16</td><td>256</td><td>1024</td><td>65 536</td></tr></tbody>
    </table></div>
    <p>Adibidez, Micro:bit-en pin analogikoek 10 bit dituzte (0–1023), eta irudi bateko kolore bakoitzak 8 bit (0–255).</p>

    <h3>Informazio-unitateak</h3>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Unitatea</th><th>Baliokidea</th><th>Adibidea</th></tr></thead>
      <tbody>
        <tr><td><strong>bit</strong> (b)</td><td>0 edo 1</td><td>Etengailu bat piztuta edo itzalita</td></tr>
        <tr><td><strong>byte</strong> (B)</td><td>8 bit</td><td>Letra bat testu arruntean</td></tr>
        <tr><td><strong>kilobyte</strong> (KB)</td><td>1024 byte</td><td>Testu-orri bat</td></tr>
        <tr><td><strong>megabyte</strong> (MB)</td><td>1024 KB</td><td>Argazki bat edo abesti bat</td></tr>
        <tr><td><strong>gigabyte</strong> (GB)</td><td>1024 MB</td><td>Film bat</td></tr>
        <tr><td><strong>terabyte</strong> (TB)</td><td>1024 GB</td><td>Disko gogor bat</td></tr>
      </tbody>
    </table></div>

    <h3>Testua, irudiak eta soinua bitetan</h3>
    <ul>
      <li><strong>Testua:</strong> letra bakoitzak zenbaki bat du. <strong>ASCII</strong> kodean «A» 65 da (01000001₂), «a» 97 eta «0» digitua 48. <strong>Unicode</strong>-k (UTF-8) munduko idazkera guztiak biltzen ditu: «ñ» edo emojiak.</li>
      <li><strong>Irudiak:</strong> pixel-sare bat dira. Pixel bakoitzak hiru zenbaki ditu (gorria, berdea, urdina), bakoitza byte batean: 256³ = 16 milioi kolore inguru.</li>
      <li><strong>Soinua:</strong> uhinaren altuera segundoko milaka aldiz neurtzen da (44 100 aldiz CD batean), eta neurketa bakoitza zenbaki bat da.</li>
    </ul>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> dena zenbaki bihurtzen da, eta zenbaki guztiak oinarri bitarrean idazten dira. Transistore bakoitzak bit bat gordetzen du (piztuta = 1, itzalita = 0). Letra bat byte bat da, argazki bat milioika byte, eta bakoitzaren esanahia kodeek erabakitzen dute (ASCII, RGB…).</p>

    <details class="sakondu" data-maila="2"><summary>Sistema hamaseitarra</summary><div class="in">
      <p>Zenbaki bitar luzeak irakurtzen zailak direnez, programatzaileek <strong>oinarri hamaseitarra</strong> (16) erabiltzen dute. Digituak 0–9 eta A–F dira (A = 10… F = 15). Digitu hamaseitar bakoitza 4 bit dira zehazki:</p>
      <div class="formula">1111 0000₂ = F0₁₆ = 240₁₀ &nbsp;&nbsp;·&nbsp;&nbsp; FF₁₆ = 255₁₀</div>
      <p>Web-orrietako koloreak hamaseitarrez idazten dira: <code>#FF8800</code> laranja da (gorria FF = 255, berdea 88 = 136, urdina 00 = 0).</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Batuketa bitarra eta zenbaki negatiboak</summary><div class="in">
      <p>Batuketa bitarrean 1 + 1 = 10 da (0 idatzi eta 1 eraman). Horixe egiten du <strong>batutzaile erdia</strong> zirkuitu logikoak (ikus «Boole-ren aljebra eta ate logikoak»).</p>
      <div class="formula">0110₂ (6) + 0111₂ (7) = 1101₂ (13)</div>
      <p>Zenbaki negatiboak <strong>osagarri bikoa</strong> erabiliz gordetzen dira: bit guztiak alderantzikatu eta 1 gehitu. 8 bitekin, −1 = 11111111₂ eta −128tik +127ra arteko balioak adieraz daitezke. Emaitza tartetik ateratzen bada, <strong>gainezkatzea</strong> (<em>overflow</em>) gertatzen da: 127 + 1 = −128.</p>
    </div></details>`,

  ariketak: ['bitarretik', 'hamartarretik', 'informazioa'],

  galdetegia: nahastu([
    { g: 'Zer da bit bat?', a: ['0 edo 1 izan daitekeen informazio-unitaterik txikiena', '8 zenbakiko multzo bat', 'Ordenagailuaren pieza bat', '1024 byte'], z: 0, zergatik: 'Bit bat digitu bitar bat da: bi balio posible.' },
    { g: 'Zenbat bitek osatzen dute byte bat?', a: ['8', '2', '10', '1024'], z: 0, zergatik: 'Byte bat 8 bit dira, eta 256 balio desberdin gorde ditzake.' },
    { g: 'Zein zenbaki hamartar da 1010₂?', a: ['10', '1010', '5', '12'], z: 0, zergatik: '8 + 2 = 10.' },
    { g: 'Nola idazten da 7 zenbakia bitarrez?', a: ['111', '110', '1000', '101'], z: 0, zergatik: '4 + 2 + 1 = 7.' },
    { g: 'Zenbat balio desberdin adieraz daitezke 4 bitekin?', a: ['16', '8', '4', '15'], z: 0, zergatik: '2⁴ = 16 balio: 0tik 15era.' },
    { g: 'Byte batean gorde daitekeen zenbaki handiena (zeinurik gabe) hau da:', a: ['255', '256', '128', '999'], z: 0, zergatik: '2⁸ − 1 = 255. 256 balio daude, 0tik hasita.' },
    { g: 'Zenbaki bitar baten eskuineko bitaren pisua:', a: ['1', '2', '0', '10'], z: 0, zergatik: '2⁰ = 1. Hurrengoak 2, 4, 8…' },
    { g: 'Zenbat byte ditu kilobyte batek (informatikan)?', a: ['1024', '1000', '8', '100'], z: 0, zergatik: '2¹⁰ = 1024. Nazioarteko sisteman 1000 byteko unitateari kB deitzen zaio, eta 1024koari KiB.' },
    { g: 'Zein da FF₁₆ zenbakia hamartarrez?', a: ['255', '16', '1515', '240'], z: 0, maila: 2, zergatik: 'F = 15: 15 · 16 + 15 = 255.' },
    { g: 'Zergatik erabiltzen da sistema hamaseitarra informatikan?', a: ['Digitu hamaseitar bakoitza 4 bit direlako, eta bitarra laburrago idazten delako', 'Ordenagailuek 16 egoera dituztelako', 'Hamartarra baino zehatzagoa delako', 'Letrak gordetzeko bakarrik'], z: 0, maila: 2, zergatik: 'Byte bat bi digitu hamaseitarrekin idazten da: 11111111₂ = FF₁₆.' },
    { g: '8 biteko osagarri bikoan, zer gertatzen da 127ri 1 gehitzean?', a: ['Gainezkatzea: −128 lortzen da', '128 lortzen da', 'Errore bat eta ordenagailua gelditu', '0 lortzen da'], z: 0, maila: 3, zergatik: '01111111 + 1 = 10000000, eta osagarri bikoan hori −128 da.' }
  ])
};
