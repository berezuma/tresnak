#!/usr/bin/env bash
# ============================================================
# BERTSIO IREKIAK SORTU
# Eskolako bertsioak kopiatzen ditu eta overlay/ karpetako fitxategiak
# gainean jartzen ditu (saio-hasierarik eta Firebase-rik gabe).
# Emaitza: docs/  (GitHub Pages-ek karpeta hori argitaratzen du)
#
#   ./build.sh
#
# Iturburuak aldatzeko: SRC_PT=... SRC_MK=... ./build.sh
# ============================================================
set -euo pipefail
cd "$(dirname "$0")"

SRC_PT="${SRC_PT:-../animazioak/public}"
SRC_MK="${SRC_MK:-../marrazketa/public}"
OUT=docs

[ -d "$SRC_PT" ] || { echo "Ez da aurkitu: $SRC_PT"; exit 1; }
[ -d "$SRC_MK" ] || { echo "Ez da aurkitu: $SRC_MK"; exit 1; }

rm -rf "$OUT"
mkdir -p "$OUT"

copy_app(){
  local src=$1 name=$2; shift 2
  mkdir -p "$OUT/$name"
  cp -r "$src"/. "$OUT/$name"/
  # bertsio irekian behar ez direnak (taldeak, irakaslea, proba-orria, Firebase)
  for f in "$@"; do rm -rf "${OUT:?}/$name/$f"; done
  cp -r overlay/_shared/. "$OUT/$name"/
  cp -r "overlay/$name"/. "$OUT/$name"/
  sed -i 's/ — IES Unamuno//g; s/IES Unamuno BHI/Bertsio irekia/g' "$OUT/$name"/*.html
}

copy_app "$SRC_PT" proiektu-taula admin.html taldeak.html js/admin.js js/teams.js
copy_app "$SRC_MK" marrazketa admin.html taldeak.html proba.html js/admin.js js/teams.js js/proba.js js/firebase.js

# Marrazketa Lantegia: bertsio irekian ez dago talderik → "bakarka" etiketa kendu editorean
PZ="$OUT/marrazketa/js/pieza.js"
sed -i 's#h("span",{class:"tag solo", text:"bakarka"})#null#' "$PZ"
if grep -q '"bakarka"' "$PZ"; then echo "ERROREA: bakarka etiketa ez da kendu: $PZ"; exit 1; fi

# Proiektu Taula: Marrazketa Lantegiaren diseinu bera (iturri bakarra: app.css, letra-tipoak)
# eta Gantt, Kanban eta ikasgaiaren egokitzapena (overlay/proiektu-taula/css/diseinua*.css).
PT="$OUT/proiektu-taula"
rm -f "$PT/fonts/"*
cp "$SRC_MK/fonts/"*.woff2 "$PT/fonts/"
cp "$SRC_MK/css/app.css" "$SRC_MK/css/fonts.css" "$PT/css/"
for f in "$PT/"*.html; do
  sed -i 's#</head>#<link rel="stylesheet" href="css/diseinua.css">\n</head>#' "$f"
  grep -q 'href="css/diseinua.css"' "$f" || { echo "ERROREA: diseinua.css ez da txertatu: $f"; exit 1; }
done
LESSON="$PT/ikasgaiak/gantt-diagrama.html"
sed -i '0,/<div class="wrap">/s##<link rel="stylesheet" href="../css/diseinua-ikasgaia.css">\n<div class="wrap">#' "$LESSON"
grep -q 'diseinua-ikasgaia.css' "$LESSON" || { echo "ERROREA: ikasgaiaren diseinua ez da txertatu"; exit 1; }

# Tresna bakunak: GitHub-eko biltegietatik ekarri eta diseinu honetara egokitutako
# HTML fitxategiak (overlay/IZENA/, osorik). Diseinu partekatua docs/oinarria/-n:
# Marrazketa Lantegiaren app.css eta letra-tipoak + liburutegiak (overlay/oinarria/vendor).
# Tresna bakun berri bat: karpeta overlay/-en, izena zerrenda honetan, nav.js eta index.html.
STANDALONE=(mekanismoak elektrizitatea robotika parabolikoa eguzkisistema lurraetaeguzkia irudigeometrikoak baserria paperezkozubia etxeadimentsua)
OIN="$OUT/oinarria"
mkdir -p "$OIN/css" "$OIN/fonts"
cp "$SRC_MK/fonts/"*.woff2 "$OIN/fonts/"
cp "$SRC_MK/css/app.css" "$SRC_MK/css/fonts.css" "$OIN/css/"
cp -r overlay/oinarria/. "$OIN"/
for name in "${STANDALONE[@]}"; do
  [ -f "overlay/$name/index.html" ] || { echo "ERROREA: ez dago overlay/$name/index.html"; exit 1; }
  cp -r "overlay/$name" "$OUT/$name"
  # dena webgunean bertan: kanpoko CDN eta letra-tipo zerbitzaririk ez (jarraipenik gabe)
  if grep -rInE '(src|href)="https?://[^"]*(cdn|unpkg|googleapis|gstatic|rsms\.me)' "$OUT/$name"; then
    echo "ERROREA: $name tresnak kanpoko baliabideak kargatzen ditu (goian)."
    exit 1
  fi
done

cp overlay/index.html "$OUT/index.html"
cp overlay/nav.js "$OUT/nav.js"
touch "$OUT/.nojekyll"
# Domeinu propioa (GitHub Pages): tresnak.berezuma.com. Fitxategi hau gabe helbidea galduko litzateke.
cp overlay/CNAME "$OUT/CNAME"

# Orri guztietan tresnen nabigazioa (etxera eta beste tresnetara).
# Bide erlatiboa orriaren sakoneraren arabera: docs/x.html → "", docs/a/x.html → "../"
while IFS= read -r -d '' f; do
  rel="${f#"$OUT"/}"
  depth=$(awk -F/ '{print NF-1}' <<<"$rel")
  pre=""
  for ((i=0; i<depth; i++)); do pre+="../"; done
  tag="<script src=\"${pre}nav.js\" data-root=\"${pre:-./}\"></script>"
  # Diseinu berria (leuna): orri guztietan, beste estiloen ONDOREN (</head> aurretik)
  css="<link rel=\"stylesheet\" href=\"${pre}oinarria/css/berria.css\">"
  # (</head> gabeko orriak, adib. Gantt ikasgaia, diseinu propioa dute: saltatu)
  if grep -qi '</head>' "$f" && ! grep -q 'oinarria/css/berria.css' "$f"; then
    sed -i "0,/<\/head>/Is##${css}\n</head>#" "$f"
    grep -q 'oinarria/css/berria.css' "$f" || { echo "ERROREA: berria.css ez da txertatu: $f"; exit 1; }
  fi
  # </body> eta </html> aukerakoak dira HTMLn: lehena dagoena erabili, bestela amaieran
  if grep -qi "</body>" "$f"; then
    sed -i "0,/<\/body>/Is##${tag}\n</body>#" "$f"
  elif grep -qi "</html>" "$f"; then
    sed -i "0,/<\/html>/Is##${tag}\n</html>#" "$f"
  else
    printf '\n%s\n' "$tag" >> "$f"
  fi
done < <(find "$OUT" -name "*.html" -print0)

missing=$(grep -rL --include=*.html 'nav.js" data-root=' "$OUT" || true)
if [ -n "$missing" ]; then echo "ERROREA: nabigaziorik gabeko orriak:"; echo "$missing"; exit 1; fi

# Egiaztapena: eskolako daturik eta Firebase-ren arrastorik ez
# (sortzailearen izena bai; eskolako posta ez)
if grep -rIn -i "unamuno\|b\.erezuma@\|gstatic\|firebaseConfig\|apiKey\|firebaseapp" "$OUT"; then
  echo "ERROREA: bertsio irekian eskolako datuak edo Firebase daude (goian)."
  exit 1
fi

echo "Ondo: $OUT/ sortuta ($(find "$OUT" -type f | wc -l) fitxategi)."
