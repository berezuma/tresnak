import { programa } from '../blokeHTML.js';
import { nahastu } from '../util.js';

const forma = (html, testua) => `<figure>${html}<figcaption>${testua}</figcaption></figure>`;

export default {
  izena: 'Blokeka programatzen',
  galdera: 'Zergatik erabiltzen dira blokeak programatzen ikasteko, eta zer dute komunean benetako programazio-lengoaiekin?',

  ikusi: {
    sim: 'sareta',
    aukerak: { modua: 'blokeak', puzleak: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'], gorde: 'robotika:blokeak:v1' },
    proba: 'Egin puzzleak ordenan. Arrastatu blokeak ezkerreko zerrendatik «hasieran» blokearen barrura. 2. puzzletik aurrera, bloke kopurua mugatuta dago: begiztak erabili behar dira. 5. eta 6. puzzleetan ez dakizu non dagoen helmuga edo izarrak: sentsoreak eta baldintzak behar dira, eta programa kasu guztiekin probatzen da.'
  },

  ulertu: () => `
    <p class="def"><strong>Bloke bidezko programazioan</strong> aginduak puzzle-piezak bezala elkartzen dira. Pieza bakoitzaren formak adierazten du non jar daitekeen, eta horregatik ezin da idazketa-akatsik egin: arreta logikan jartzen da. Scratch, MakeCode (Micro:bit), ArduinoBlocks eta App Inventor bloke-inguruneak dira, eta atzean benetako kodea sortzen dute.</p>

    <h3>Blokeen formak</h3>
    <div class="bk-row">
      ${forma(programa([['gertaera', 'hasieran', []]]), '<strong>Gertaera</strong> (txapela): noiz hasten den programa.')}
      ${forma(programa(['aurrera egin']), '<strong>Agindua</strong>: ekintza bat.')}
      ${forma(programa([['kontrola', 'errepikatu {4} aldiz', []]]), '<strong>Kontrol-blokea</strong>: beste bloke batzuk barruan.')}
      ${forma(programa([['sentsorea', '⟨bidea libre aurrean⟩']]), '<strong>Baldintza</strong> (ertz zorrotzak): egia edo gezurra.')}
      ${forma(programa([['mate', '{7}']]), '<strong>Balioa</strong> (borobila): zenbaki bat.')}
    </div>

    <h3>1. Sekuentzia</h3>
    <p>Blokeak <strong>goitik behera</strong> exekutatzen dira, bata bestearen atzetik. Bi bloke trukatzen badira, emaitza aldatu egin daiteke.</p>

    <h3>2. Errepikapena (begiztak)</h3>
    <div class="bk-row">
      ${forma(programa([['kontrola', 'errepikatu {5} aldiz', ['aurrera egin']]]), 'Badakigu <strong>zenbat aldiz</strong>.')}
      ${forma(programa([['kontrola', 'errepikatu ⟨helmugan nago⟩ arte', ['aurrera egin']]]), 'Ez dakigu zenbat: <strong>baldintza bat bete arte</strong>.')}
      ${forma(programa([['kontrola', 'betiko errepikatu', ['aurrera egin']]]), '<strong>Betiko</strong>, programa gelditu arte.')}
    </div>
    <p><strong>Begizta habiaratuak:</strong> begizta baten barruan beste begizta bat. Kanpokoak <em>a</em> itzuli eta barrukoak <em>b</em> itzuli egiten baditu, barruko blokeak <em>a · b</em> aldiz exekutatzen dira.</p>
    <div class="worked">
      <h4>Adibidea: karratua margotu</h4>
      ${programa([['gertaera', 'hasieran', [['kontrola', 'errepikatu {4} aldiz', [['kontrola', 'errepikatu {3} aldiz', ['margotu laukia', 'aurrera egin']], 'biratu eskuinera ↻']]]]], 'Karratuaren programa')}
      <p class="ans">«margotu» eta «aurrera» 4 · 3 = 12 aldiz exekutatzen dira, eta «biratu» 4 aldiz. 5 bloke 16 ordez: begiztek programak laburrago eta aldatzeko errazago egiten dituzte.</p>
    </div>

    <h3>3. Hautapena (baldintzak)</h3>
    <p><strong>Sentsoreek</strong> galdera bati erantzuten diote: <em>egia</em> edo <em>gezurra</em>. «Baldin» blokeak erantzunaren arabera erabakitzen du zer egin.</p>
    <div class="bk-row">
      ${forma(programa([['kontrola', 'baldin ⟨izarra hemen⟩ bada', ['hartu izarra']]]), 'Egia bada bakarrik.')}
      ${forma(programa([['kontrola', 'baldin ⟨bidea libre aurrean⟩ bada', ['aurrera egin'], 'bestela', ['biratu ezkerrera ↺']]]), 'Egia bada bat; bestela, bestea.')}
    </div>

    <div class="worked">
      <h4>Adibidea: labirintotik irten</h4>
      <p>«Eskuineko eskuaren araua»: eskuineko eskua hormari itsatsita ibiliz gero, adarkatutako labirinto batetik irteten da beti (bide itxirik ez badu).</p>
      ${programa([['gertaera', 'hasieran', [['kontrola', 'errepikatu ⟨helmugan nago⟩ arte', [['kontrola', 'baldin ⟨bidea libre eskuinean⟩ bada', ['biratu eskuinera ↻', 'aurrera egin'], 'bestela', [['kontrola', 'baldin ⟨bidea libre aurrean⟩ bada', ['aurrera egin'], 'bestela', ['biratu ezkerrera ↺']]]]]]]]], 'Labirintoaren programa')}
      <p class="ans">Programa honek ez daki mapa: sentsoreekin erabakitzen du urrats bakoitzean. Horregatik labirinto askotan balio du.</p>
    </div>

    <p class="note ok"><strong>Galderaren erantzuna:</strong> blokeek sintaxi-akatsak ekiditen dituzte eta programaren egitura ikusgai jartzen dute. Baina kontzeptuak benetako lengoaienak berak dira: sekuentziak, begiztak (<code>for</code>, <code>while</code>), baldintzak (<code>if</code>, <code>else</code>), aldagaiak eta sentsoreak.</p>

    <details class="sakondu" data-maila="2"><summary>Programa orokorrak eta probak</summary><div class="in">
      <p>Programa batek kasu bakarrean funtzionatzea ez da nahikoa. 5. puzzlean «errepikatu 6 aldiz» jartzen baduzu, helmuga 6 laukitara dagoenean bakarrik balio du. Sentsorea erabiltzen duen programa <strong>orokorra</strong> da: kasu guztietan balio du.</p>
      <p>Horregatik lantegiak programa <strong>aldaera guztiekin</strong> probatzen du. Benetako programazioan ere berdin egiten da: programa kasu askorekin probatzen da (<em>proba-kasuak</em>), baita muga-kasuekin ere.</p>
    </div></details>

    <details class="sakondu" data-maila="3"><summary>Blokeetatik testura</summary><div class="in">
      <p>Labirintoaren programa bera, Python eta C++ lengoaietan:</p>
      <pre class="formula" style="text-align:left">while not helmugan():
    if bidea_libre(ESKUINA):
        biratu(ESKUINA)
        aurrera()
    elif bidea_libre(AURREA):
        aurrera()
    else:
        biratu(EZKERRA)</pre>
      <pre class="formula" style="text-align:left">while (!helmugan()) {
  if (bideaLibre(ESKUINA)) { biratu(ESKUINA); aurrera(); }
  else if (bideaLibre(AURREA)) { aurrera(); }
  else { biratu(EZKERRA); }
}</pre>
      <p>Python-ek koskak (indentazioa) erabiltzen ditu blokeak mugatzeko; C++-ek giltzak <code>{ }</code> eta puntu eta koma. Blokeen C formak koska horien baliokideak dira.</p>
    </div></details>`,

  ariketak: ['errepikapenak', 'baldintzak', 'sareta-posizioa'],

  galdetegia: nahastu([
    { g: 'Zer gerta daiteke sekuentzia bateko bi bloke trukatzen badira?', a: ['Emaitza aldatzea, ordenak garrantzia duelako', 'Ezer ez, ordenak ez du axola', 'Programak ez du inoiz funtzionatzen', 'Blokeak ezabatu egiten dira'], z: 0, zergatik: 'Blokeak goitik behera exekutatzen dira: ordena aldatzean, ekintzen ordena aldatzen da.' },
    { g: 'Programa batean «errepikatu 3 aldiz» baten barruan «errepikatu 4 aldiz [aurrera egin]» dago. Zenbat aldiz egiten du aurrera?', a: ['12', '7', '3', '4'], z: 0, zergatik: 'Begizta habiaratuak: 3 · 4 = 12.' },
    { g: 'Robotak ez daki helmuga zenbat laukitara dagoen. Zein bloke da egokiena?', a: ['errepikatu … arte, «helmugan nago» sentsorearekin', 'errepikatu 10 aldiz', 'betiko errepikatu', 'baldin … bada'], z: 0, zergatik: 'Errepikapen-kopurua ezezaguna denean, baldintza bat bete arte errepikatzen da.' },
    { g: 'Zein formak adierazten du egia edo gezurra den balio bat (baldintza bat)?', a: ['Ertz zorrotzeko blokeak (hexagonoak)', 'Bloke borobilak', 'C formako blokeak', 'Txapeldun blokeak'], z: 0, zergatik: 'Baldintzek ertz zorrotzak dituzte, eta «baldin» edo «arte» blokeen hutsuneetan bakarrik sartzen dira.' },
    { g: '«baldin ⟨izarra hemen⟩ bada [hartu izarra]» blokean, izarrik ez badago:', a: ['Barruko blokea ez da exekutatzen, eta programak aurrera jarraitzen du', 'Programa gelditu egiten da', 'Robotak izar bat sortzen du', 'Errore bat ematen du beti'], z: 0, zergatik: 'Baldintza gezurra bada, barrukoa saltatu egiten da.' },
    { g: 'Zer egiten du «betiko errepikatu» blokeak?', a: ['Barruko blokeak etengabe errepikatzen ditu, programa gelditu arte', 'Barrukoak behin exekutatzen ditu', 'Bi aldiz exekutatzen ditu', 'Programa amaitzen du'], z: 0, zergatik: 'Kontrol-sistemetan erabiltzen da asko: sentsoreak behin eta berriz irakurtzeko.' },
    { g: 'Programa batek puzzlearen kasu batean funtzionatzen du, baina helmuga lekuz aldatzean ez. Zer da ziurrenik?', a: ['Zenbaki finko bat erabili duela sentsore baten ordez', 'Blokeen koloreak okerrak direla', 'Robota hondatuta dagoela', 'Programak ez duela «hasieran» blokerik'], z: 0, maila: 2, zergatik: 'Programa ez da orokorra: kasu bakar baterako idatzita dago.' },
    { g: 'Zein da «errepikatu ⟨baldintza⟩ arte» blokearen baliokidea Python-en?', a: ['while not baldintza:', 'for i in range(n):', 'if baldintza:', 'def baldintza():'], z: 0, maila: 3, zergatik: '«arte» = baldintza bete ez den bitartean: while not.' }
  ])
};
