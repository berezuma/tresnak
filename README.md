# Tresnak

Teknologia gelarako tresna irekiak, euskaraz.

Euskarazko bi web tresna bigarren hezkuntzarako, **saio-hasierarik gabe** eta
**daturik bidali gabe** (lana nabigatzailean gordetzen da):

- **Proiektu Taula** — Gantt diagramak eta Kanban taulak.
- **Marrazketa Lantegia** — piezak 3Dn, bistak, ezkutuko ertzak, akotazioa eta 5 mailatako ariketak.

Sortzailea: **Beñat Erezuma** — <https://berezuma.com>

Eskolako bertsioetatik sortzen dira (Google saioa, taldeak eta irakaslearen panela dituztenak).

## Nola sortzen den

```
build.sh              eskolako bertsioak kopiatu + overlay/ gainean → docs/
overlay/_shared/      bi tresnek partekatzen dituztenak (pribatutasuna, boot-check)
overlay/proiektu-taula/   saio-hasierarik gabe, datuak localStorage-n
overlay/marrazketa/       berdin
overlay/index.html    hasierako orria (bi tresnak)
docs/                 ARGITARATZEN DENA (GitHub Pages)
test/stores.test.js   datu-geruzen probak
```

Eskolako bertsioan zerbait hobetzen denean:

```bash
./build.sh                    # docs/ berriro sortu
node test/stores.test.js      # probak
```

`build.sh`-ek huts egiten du bertsio irekian eskolako daturik edo Firebase-ren
arrastorik geratzen bada.

Bertsio irekian **ez** daude: saio-hasiera, taldeak, denbora errealeko lankidetza,
irakaslearen panela eta irakaslearen ariketak. Horren ordez, proiektuak eta piezak
**esportatu eta inportatu** daitezke (`.json` fitxategia).

## Zure ordenagailuan probatu

```bash
cd docs
python3 -m http.server 8000
```

Ireki <http://localhost:8000>.

## GitHub Pages-en argitaratu

1. GitHub-en biltegi **publiko** berri bat sortu.
2. Karpeta hau bertara igo.
3. Biltegian: **Settings → Pages → Build and deployment**:
   *Source* = «Deploy from a branch», *Branch* = `main`, karpeta = `/docs`.
4. Minutu batzuk barru: `https://ERABILTZAILEA.github.io/BILTEGIA/`

## Lizentzia

**MIT** — ikusi [LICENSE](LICENSE). Edonork erabil, aldatu eta partekatu dezake,
egilea (Beñat Erezuma) aipatuta.

Erabilitako software librea: Three.js (MIT), Archivo eta IBM Plex letra-tipoak
(SIL Open Font License).
