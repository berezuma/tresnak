/* ============================================================
   TRESNEN NABIGAZIOA
   Orri guztietan barra bat: etxera (tresna guztiak), beste
   tresnetara eta berezuma.com-era. build.sh-ek orri guztietan
   txertatzen du:  <script src="…/nav.js" data-root="…/"></script>

   Hasierako orrian (tresna guztiak zerrendatzen dituena) barrak
   ez ditu tresnak errepikatzen. Tresna baten barruan, izena
   erakusten da eta "Tresna guztiak" menu batek ematen du
   besteetara jauzi egiteko bidea, barra zerrenda luze batekin
   kargatu gabe.

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
      if (path.indexOf("/" + TOOLS[i].id + "/") !== -1) return TOOLS[i];
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
      "#tresnak-nav{display:flex;align-items:center;gap:6px 16px;padding:9px 20px;" +
        "background:#f9f8f5;color:#000;border-bottom:1px solid #dedede;" +
        "font:400 15px/1.3 Lato,system-ui,-apple-system,'Segoe UI',sans-serif;" +
        "position:relative;z-index:45}" +
      "#tresnak-nav a{color:inherit;text-decoration:none;padding:2px 0;white-space:nowrap;border-bottom:1px solid transparent}" +
      "#tresnak-nav a:hover{border-bottom-color:#000}" +
      "#tresnak-nav a.on{font-weight:700;border-bottom-color:#000}" +
      "#tresnak-nav .tn-home{font-family:'DM Serif Display',Georgia,serif;font-size:19px;flex:0 0 auto}" +
      "#tresnak-nav .tn-home.on{font-weight:400}" +
      "#tresnak-nav .tn-current{flex:0 0 auto;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:38vw}" +
      "#tresnak-nav .tn-current::before{content:'/';margin-right:16px;color:#b8b6ac;font-weight:400}" +
      "#tresnak-nav .tn-menu{position:relative;flex:0 0 auto}" +
      "#tresnak-nav .tn-menu-btn{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:2px 0;" +
        "display:flex;align-items:center;gap:4px;border-bottom:1px solid transparent}" +
      "#tresnak-nav .tn-menu-btn:hover,#tresnak-nav .tn-menu-btn[aria-expanded='true']{border-bottom-color:#000}" +
      "#tresnak-nav .tn-menu-btn i{font-style:normal;font-size:10px;transition:transform .15s}" +
      "#tresnak-nav .tn-menu-btn[aria-expanded='true'] i{transform:rotate(180deg)}" +
      "#tresnak-nav .tn-menu-panel{display:none;position:absolute;top:calc(100% + 9px);left:0;min-width:230px;max-width:88vw;" +
        "max-height:70vh;overflow-y:auto;padding:6px;background:#f9f8f5;border:1px solid #dedede;box-shadow:0 8px 20px rgba(0,0,0,.12)}" +
      "#tresnak-nav .tn-menu-panel.open{display:block}" +
      "#tresnak-nav .tn-menu-panel a{display:block;padding:7px 10px;border-bottom:0}" +
      "#tresnak-nav .tn-menu-panel a:hover{background:#efeee8}" +
      "#tresnak-nav .tn-menu-panel a.on{background:#efeee8}" +
      "#tresnak-nav .tn-site{margin-left:auto;color:#666;flex:0 0 auto}" +
      "@media (prefers-color-scheme:dark){#tresnak-nav{background:#141412;color:#f4f3ef;border-bottom-color:#3a3a36}" +
        "#tresnak-nav a:hover,#tresnak-nav a.on{border-bottom-color:#f4f3ef}#tresnak-nav .tn-site{color:#9d9c95}" +
        "#tresnak-nav .tn-current::before{color:#4a4944}" +
        "#tresnak-nav .tn-menu-btn:hover,#tresnak-nav .tn-menu-btn[aria-expanded='true']{border-bottom-color:#f4f3ef}" +
        "#tresnak-nav .tn-menu-panel{background:#141412;border-color:#3a3a36}" +
        "#tresnak-nav .tn-menu-panel a:hover,#tresnak-nav .tn-menu-panel a.on{background:#1f1f1c}}" +
      "@media (max-width:560px){#tresnak-nav{padding:8px 16px;gap:4px 12px}#tresnak-nav .tn-site{display:none}" +
        "#tresnak-nav .tn-current{max-width:32vw}}" +
      "@media print{#tresnak-nav{display:none}}";
    document.head.appendChild(style);

    var nav = document.createElement("nav");
    nav.id = "tresnak-nav";
    nav.setAttribute("aria-label", "Tresnak");
    nav.appendChild(link(root, "Tresnak", !cur, "tn-home", "Hasiera: tresna guztiak"));

    if (cur){
      var current = document.createElement("span");
      current.className = "tn-current";
      current.textContent = cur.name;
      nav.appendChild(current);

      var menu = document.createElement("div");
      menu.className = "tn-menu";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tn-menu-btn";
      btn.setAttribute("aria-haspopup", "true");
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = "Beste tresnak <i>&#9662;</i>";

      var panel = document.createElement("div");
      panel.className = "tn-menu-panel";
      for (var i = 0; i < TOOLS.length; i++){
        var t = TOOLS[i];
        panel.appendChild(link(root + t.id + "/", t.name, t === cur, "tn-tool", t.desc));
      }

      function closeMenu(){
        panel.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
      btn.addEventListener("click", function(e){
        e.stopPropagation();
        var open = panel.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("click", function(e){
        if (!menu.contains(e.target)) closeMenu();
      });
      document.addEventListener("keydown", function(e){
        if (e.key === "Escape") closeMenu();
      });

      menu.appendChild(btn);
      menu.appendChild(panel);
      nav.appendChild(menu);
    }

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
