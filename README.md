# Tresnak

Teknologia gelarako tresna irekiak, euskaraz.

Euskarazko web tresnak bigarren hezkuntzarako, **saio-hasierarik gabe** eta
**daturik bidali gabe** (lana nabigatzailean gordetzen da):

- **Proiektu Taula** — Gantt diagramak eta Kanban taulak.
- **Marrazketa Lantegia** — piezak 3Dn, bistak, ezkutuko ertzak, akotazioa eta 5 mailatako ariketak.
- **Mekanismoen Lantegia** — makinak eta mekanismoak DBH 2-3rako: simulagailuak, azalpenak,
  ariketa-sorgailua eta galdetegiak (`overlay/mekanismoak/`, ES moduluak, build-ik gabe;
  aurrerapena nabigatzailean). `mekanismoenikastaroaEUS` ikastaroan oinarritua.
- **Elektrizitatearen Lantegia** — elektrizitatea DBH 1etik Batxilergora, Ohm-en legetik
  Kirchhoff-en legeetaraino: zirkuitu-laborategia (analisi nodal bidezko ebazle erreala),
  polimetroa, sare-korronteen metodoa, ariketa-sorgailua mailaka (`overlay/elektrizitatea/`).
- **Etxe adimentsua** — Arduino eta ArduinoBlocks bidezko 8 proiektuko gida.
- **Paperezko zubia** — zubiaren pisua eta hipotenusa kalkulatzeko.
- **Simulagailuak** — Higidura parabolikoa, Eguzki-sistema, Lurra eta Eguzkia,
  Irudi geometrikoak eta Baserria (analisi termikoa).

Sortzailea: **Beñat Erezuma** — <https://berezuma.com>

Proiektu Taula eta Marrazketa Lantegia eskolako bertsioetatik sortzen dira (Google saioa,
taldeak eta irakaslearen panela dituztenak). Beste zazpiak GitHub-eko biltegi banatatik
ekarri eta diseinu honetara egokituak dira (`berezuma/parabolikoa`, `berezuma/eguzkisistema`…);
jatorrizko biltegiak ez dira aldatu.

## Nola sortzen den

```
build.sh                  eskolako bertsioak kopiatu + overlay/ gainean → docs/
overlay/_shared/          Proiektu Taulak eta Marrazketak partekatzen dituztenak
overlay/proiektu-taula/   saio-hasierarik gabe, datuak localStorage-n
overlay/marrazketa/       berdin
overlay/oinarria/         tresna bakunen oinarria → docs/oinarria/
  css/tresna.css            osagai partekatuak (graduatzaileak, emaitzak, pantaila osoa)
  lantegia/                 bi lantegien motorra: nabigazioa, urratsak, ariketak, galdetegiak,
                            aurrerapena, ikas-mailak, glosarioa eta irakasleen fitxak
  vendor/                   liburutegiak: Three.js, Chart.js, Tween.js, SunCalc
overlay/parabolikoa/ …    tresna bakunak: HTML fitxategi bat (+ irudiak), osorik
overlay/index.html        hasierako orria
overlay/nav.js            orri guztietako goiko barra
docs/                     ARGITARATZEN DENA (GitHub Pages)
test/stores.test.js       datu-geruzen probak
```

`build.sh`-ek Marrazketa Lantegiaren `app.css` eta letra-tipoak kopiatzen ditu
`docs/oinarria/`-ra: tresna guztiek diseinu-iturri bakarra dute.

```bash
./build.sh                    # docs/ berriro sortu
node test/stores.test.js      # probak
```

`build.sh`-ek huts egiten du:
- bertsio irekian eskolako daturik edo Firebase-ren arrastorik geratzen bada;
- tresna bakun batek kanpoko CDN, letra-tipo zerbitzari edo irudirik kargatzen badu
  (dena webgunean bertan dago, jarraipenik gabe).

Salbuespen bakarra: **Lurra eta Eguzkia**-k hiriak bilatzeko OpenStreetMap-en Nominatim
zerbitzua eta ordu-eremuetarako timeapi.io erabiltzen ditu (panelean adierazita).

Bertsio irekian **ez** daude: saio-hasiera, taldeak, denbora errealeko lankidetza,
irakaslearen panela eta irakaslearen ariketak. Horren ordez, proiektuak eta piezak
**esportatu eta inportatu** daitezke (`.json` fitxategia).

## Tresna berri bat gehitzeko

Orri guztiek goian barra bat dute: **Tresnak** (hasiera) eta tresna guztietarako
estekak. HTML fitxategi bakarreko tresna bat gehitzeko:

1. `overlay/IZENA/index.html` sortu. Diseinua hartzeko, `<head>`-en:
   ```html
   <link rel="stylesheet" href="../oinarria/css/fonts.css">
   <link rel="stylesheet" href="../oinarria/css/app.css">
   <link rel="stylesheet" href="../oinarria/css/tresna.css">
   ```
   Liburutegiak `overlay/oinarria/vendor/`-en jarri, ez CDN batetik.
2. `build.sh` → `STANDALONE` zerrendan izena gehitu.
3. `overlay/nav.js` → `TOOLS` zerrendan lerro bat: `{ id: "IZENA", name: "…", desc: "…" }`.
4. `overlay/index.html` → hasierako orrian txartel bat.
5. `./build.sh` → barra automatikoki txertatzen da orri guztietan.

## Zure ordenagailuan probatu

```bash
cd docs
python3 -m http.server 8000
```

Ireki <http://localhost:8000>.

## GitHub Pages-en argitaratu

`docs/` karpeta `main` adarretik argitaratzen da (**Settings → Pages**), eta
`docs/CNAME` fitxategiak `tresnak.berezuma.com` domeinua ematen dio.

## Lizentzia

**MIT** — ikusi [LICENSE](LICENSE). Edonork erabil, aldatu eta partekatu dezake,
egilea (Beñat Erezuma) aipatuta. Simulagailu batzuk **CC BY-SA 4.0** dira
(Higidura parabolikoa, Eguzki-sistema, Baserria), bakoitzean adierazten den bezala.

Erabilitako software librea: Three.js (MIT), Chart.js (MIT), Tween.js (MIT), SunCalc (BSD),
DM Serif Display eta Lato letra-tipoak (SIL Open Font License).
Planeten irudiak: NASA (jabari publikoa) eta ESA/MPS OSIRIS (CC BY-SA 3.0 IGO), Wikimedia Commons bidez.
