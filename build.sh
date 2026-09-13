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

cp overlay/index.html "$OUT/index.html"
cp overlay/nav.js "$OUT/nav.js"
touch "$OUT/.nojekyll"

# Orri guztietan tresnen nabigazioa (etxera eta beste tresnetara).
# Bide erlatiboa orriaren sakoneraren arabera: docs/x.html → "", docs/a/x.html → "../"
while IFS= read -r -d '' f; do
  rel="${f#"$OUT"/}"
  depth=$(awk -F/ '{print NF-1}' <<<"$rel")
  pre=""
  for ((i=0; i<depth; i++)); do pre+="../"; done
  tag="<script src=\"${pre}nav.js\" data-root=\"${pre:-./}\"></script>"
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
