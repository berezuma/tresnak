/* ============================================================
   TRESNEN NABIGAZIOA
   Orri guztietan barra bat: etxera (tresna guztiak), beste
   tresnetara eta berezuma.com-era. build.sh-ek orri guztietan
   txertatzen du:  <script src="…/nav.js" data-root="…/"></script>

   TRESNA BERRI BAT GEHITZEKO: gehitu lerro bat TOOLS zerrendan
   (id = docs/ barruko karpetaren izena).
   ============================================================ */
(function(){
  var TOOLS = [
    { id: "proiektu-taula", name: "Proiektu Taula",      desc: "Gantt diagramak eta Kanban taulak" },
    { id: "marrazketa",     name: "Marrazketa Lantegia", desc: "Bistak, akotazioa eta 3D ikuspegia" },
    { id: "mekanismoak",       name: "Mekanismoen Lantegia", desc: "Makinak eta mekanismoak, DBH 2-3" },
    { id: "elektrizitatea",    name: "Elektrizitatearen Lantegia", desc: "Zirkuituak, Ohm eta Kirchhoff, DBH 1etik Batxilergora" },
    { id: "robotika",          name: "Robotikaren Lantegia", desc: "Programazioa, elektronika eta robotika, DBH 1etik Batxilergora" },
    { id: "parabolikoa",       name: "Higidura parabolikoa", desc: "Jaurtiketen simulagailua, 2Dn eta 3Dn" },
    { id: "eguzkisistema",     name: "Eguzki-sistema",       desc: "Planetak 3Dn, datuak eta bisita gidatua" },
    { id: "lurraetaeguzkia",   name: "Lurra eta Eguzkia",    desc: "Urtaroak eta egunaren iraupena" },
    { id: "irudigeometrikoak", name: "Irudi geometrikoak",   desc: "Perimetroa, azalera eta bolumena" },
    { id: "baserria",          name: "Baserria",             desc: "Baserriaren analisi termikoa 3Dn" },
    { id: "etxeadimentsua",    name: "Etxe adimentsua",      desc: "Arduino proiektuen gida" },
    { id: "paperezkozubia",    name: "Paperezko zubia",      desc: "Zubiaren pisua eta hipotenusa" }
  ];
  var SITE = { href: "https://berezuma.com", name: "berezuma.com" };

  var me = document.currentScript;
  var root = (me && me.getAttribute("data-root")) || "./";

  function currentTool(){
    var path = location.pathname;
    for (var i = 0; i < TOOLS.length; i++){
      if (path.indexOf("/" + TOOLS[i].id + "/") !== -1) return TOOLS[i].id;
    }
    return null;
  }

  function link(href, text, on, cls, title){
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    a.className = cls + (on ? " on" : "");
    if (title) a.title = title;
    if (on) a.setAttribute("aria-current", "page");
    return a;
  }

  function build(){
    if (document.getElementById("tresnak-nav")) return;
    var cur = currentTool();

    var style = document.createElement("style");
    style.textContent =
      "#tresnak-nav{display:flex;align-items:center;gap:6px 20px;padding:9px 20px;" +
        "background:#f9f8f5;color:#000;border-bottom:1px solid #dedede;" +
        "font:500 15px/1.3 Raleway,system-ui,-apple-system,'Segoe UI',sans-serif;" +
        "position:relative;z-index:45}" +
      "#tresnak-nav a{color:inherit;text-decoration:none;padding:2px 0;white-space:nowrap;border-bottom:1px solid transparent}" +
      "#tresnak-nav a:hover{border-bottom-color:#000}" +
      "#tresnak-nav a.on{font-weight:700;border-bottom-color:#000}" +
      "#tresnak-nav .tn-home{font-weight:700;font-size:18px;letter-spacing:-.01em;flex:0 0 auto}" +
      "#tresnak-nav .tn-home.on{font-weight:700}" +
      "#tresnak-nav .tn-links{display:flex;gap:20px;overflow-x:auto;min-width:0;scrollbar-width:none}" +
      "#tresnak-nav .tn-links::-webkit-scrollbar{display:none}" +
      "#tresnak-nav .tn-site{margin-left:auto;color:#666;flex:0 0 auto}" +
      "@media (prefers-color-scheme:dark){#tresnak-nav{background:#141412;color:#f4f3ef;border-bottom-color:#3a3a36}" +
        "#tresnak-nav a:hover,#tresnak-nav a.on{border-bottom-color:#f4f3ef}#tresnak-nav .tn-site{color:#9d9c95}}" +
      "@media (max-width:560px){#tresnak-nav{padding:8px 16px;gap:4px 16px}#tresnak-nav .tn-site{display:none}}" +
      "@media print{#tresnak-nav{display:none}}";
    document.head.appendChild(style);

    var nav = document.createElement("nav");
    nav.id = "tresnak-nav";
    nav.setAttribute("aria-label", "Tresnak");
    nav.appendChild(link(root, "Tresnak", !cur, "tn-home", "Hasiera: tresna guztiak"));
    var list = document.createElement("div");
    list.className = "tn-links";
    for (var i = 0; i < TOOLS.length; i++){
      var t = TOOLS[i];
      list.appendChild(link(root + t.id + "/", t.name, t.id === cur, "tn-tool", t.desc));
    }
    nav.appendChild(list);
    nav.appendChild(link(SITE.href, SITE.name, false, "tn-site"));

    document.body.insertBefore(nav, document.body.firstChild);

    /* Aplikazioek beren goiburua gero txertatzen dute gorenean:
       barra hau beti lehena izan dadin. */
    if (window.MutationObserver){
      new MutationObserver(function(){
        if (document.body.firstChild !== nav) document.body.insertBefore(nav, document.body.firstChild);
      }).observe(document.body, { childList: true });
    }
  }

  if (document.body) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
