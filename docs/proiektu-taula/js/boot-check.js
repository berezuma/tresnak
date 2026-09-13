/* Script klasikoa (ez modulua): file:// bidez ere exekutatzen da.
   Orria fitxategi gisa irekitzen bada, edo JS moduluak kargatzen ez badira,
   "Kargatzen…" betiko utzi beharrean azalpen bat erakusten du. */
(function(){
  function show(title, html){
    var app = document.getElementById("app");
    if (!app || !app.querySelector(".loading")) return; // aplikazioa kargatu da
    app.className = "login";
    app.innerHTML =
      '<div class="login-card" style="text-align:left">' +
      '<div class="eyebrow">Ezin da kargatu</div>' +
      '<h1>' + title + '</h1>' + html + '</div>';
  }

  if (location.protocol === "file:"){
    document.addEventListener("DOMContentLoaded", function(){
      show("Orria fitxategi gisa ireki duzu",
        '<p>Tresna honek JavaScript moduluak erabiltzen ditu, eta nabigatzaileek blokeatu egiten dituzte ' +
        'fitxategia zuzenean (klik bikoitzarekin) irekitzean.</p>' +
        '<p>Erabili Interneteko bertsioa, edo abiarazi zerbitzari txiki bat karpeta honetan:</p>' +
        '<pre class="mono" style="background:#0c1723;color:#fff;padding:10px 12px;overflow-x:auto">python3 -m http.server 8000</pre>' +
        '<p>Ondoren ireki <a href="http://localhost:8000">http://localhost:8000</a>.</p>');
    });
    return;
  }

  var errors = [];
  window.addEventListener("error", function(e){
    errors.push((e.message || "Errorea") + (e.filename ? " (" + e.filename.split("/").pop() + ")" : ""));
  }, true);

  window.addEventListener("load", function(){
    setTimeout(function(){
      show("Aplikazioak ez du erantzun",
        '<p>Freskatu orria. Arazoak jarraitzen badu, eguneratu nabigatzailea ' +
        '(Chrome, Firefox, Edge edo Safari bertsio berri bat behar da).</p>' +
        (errors.length ? '<div class="notice err mono" style="font-size:12px">' +
          errors.join("<br>").replace(/</g, "&lt;") + '</div>' : '') +
        '<p class="muted" style="font-size:12.5px">Xehetasun gehiago: F12 → Console.</p>');
    }, 8000);
  });
})();
