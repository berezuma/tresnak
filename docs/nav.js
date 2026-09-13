/* ============================================================
   TRESNEN NABIGAZIOA
   Orri guztietan barra bat: etxera (tresna guztiak) eta beste
   tresnetara joateko. build.sh-ek orri guztietan txertatzen du:
     <script src="…/nav.js" data-root="…/"></script>

   TRESNA BERRI BAT GEHITZEKO: gehitu lerro bat TOOLS zerrendan
   (id = docs/ barruko karpetaren izena).
   ============================================================ */
(function(){
  var TOOLS = [
    { id: "proiektu-taula", name: "Proiektu Taula",      desc: "Gantt diagramak eta Kanban taulak" },
    { id: "marrazketa",     name: "Marrazketa Lantegia", desc: "Bistak, akotazioa eta 3D ikuspegia" }
  ];

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
      "#tresnak-nav{display:flex;align-items:center;gap:8px;padding:5px 14px;" +
        "background:var(--ink,#0c1723);color:var(--sheet,#fff);" +
        "font:500 12.5px/1.3 'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',sans-serif;" +
        "position:relative;z-index:45}" +
      "#tresnak-nav a{color:inherit;text-decoration:none;padding:3px 9px;white-space:nowrap;" +
        "border:1px solid transparent;opacity:.8}" +
      "#tresnak-nav a:hover{opacity:1;border-color:color-mix(in srgb,currentColor 40%,transparent)}" +
      "#tresnak-nav a.on{opacity:1;font-weight:600;border-color:color-mix(in srgb,currentColor 60%,transparent)}" +
      "#tresnak-nav .tn-home{font-weight:600;opacity:1;flex:0 0 auto}" +
      "#tresnak-nav .tn-sep{width:1px;align-self:stretch;margin:2px 2px;background:color-mix(in srgb,currentColor 35%,transparent);flex:0 0 auto}" +
      "#tresnak-nav .tn-links{display:flex;gap:4px;overflow-x:auto;min-width:0;scrollbar-width:none}" +
      "#tresnak-nav .tn-links::-webkit-scrollbar{display:none}" +
      "@media print{#tresnak-nav{display:none}}";
    document.head.appendChild(style);

    var nav = document.createElement("nav");
    nav.id = "tresnak-nav";
    nav.setAttribute("aria-label", "Tresnak");
    nav.appendChild(link(root, "⌂ Tresnak", !cur, "tn-home", "Hasiera: tresna guztiak"));
    var sep = document.createElement("span");
    sep.className = "tn-sep";
    nav.appendChild(sep);
    var list = document.createElement("div");
    list.className = "tn-links";
    for (var i = 0; i < TOOLS.length; i++){
      var t = TOOLS[i];
      list.appendChild(link(root + t.id + "/", t.name, t.id === cur, "tn-tool", t.desc));
    }
    nav.appendChild(list);

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
