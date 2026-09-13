/* Interfazerako tresna txikiak: elementuak sortzea, modalak, oharrak, datak. */

export function h(tag, props, ...kids){
  const el = document.createElement(tag);
  if (props) for (const [k,v] of Object.entries(props)){
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "html") el.innerHTML = v;
    else if (k === "text") el.textContent = v;
    else if (k === "style" && typeof v === "object") setStyle(el, v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(3)){
    if (kid === null || kid === undefined || kid === false) continue;
    el.appendChild(typeof kid === "object" ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
/* CSS aldagai pertsonalizatuak (--x) setProperty-rekin ezarri behar dira */
function setStyle(el, obj){
  for (const [k,v] of Object.entries(obj)){
    if (v === null || v === undefined) continue;
    if (k.startsWith("--")) el.style.setProperty(k, v);
    else el.style[k] = v;
  }
}

export const qs  = (s, r=document) => r.querySelector(s);
export const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
export function clear(node){ while(node.firstChild) node.removeChild(node.firstChild); return node; }

/* ---------- oharrak ---------- */
export function toast(msg, kind=""){
  let box = qs("#toasts");
  if (!box){ box = h("div",{id:"toasts"}); document.body.appendChild(box); }
  const t = h("div",{class:"toast "+kind, text:msg});
  box.appendChild(t);
  setTimeout(() => { t.style.transition="opacity .3s"; t.style.opacity="0"; setTimeout(()=>t.remove(),320); }, kind==="err" ? 5200 : 2800);
}

/* ---------- modala ---------- */
export function modal({title, body, okText="Gorde", cancelText="Utzi", onOk, onClose, wide=false, danger=false}){
  const bodyEl = h("div",{class:"modal-body"}, body);
  const okBtn  = h("button",{class:"btn "+(danger?"danger":"primary"), type:"submit"}, okText);
  const form   = h("form",{class:"modal", style: wide ? {width:"min(860px,100%)"} : null, onsubmit: async (e)=>{
    e.preventDefault();
    okBtn.disabled = true;
    try { const r = onOk ? await onOk() : true; if (r !== false) close(true); }
    catch(err){ console.error(err); toast(err.message || "Errorea", "err"); }
    finally { okBtn.disabled = false; }
  }},
    h("div",{class:"modal-head"}, h("h3",{text:title}),
      h("button",{class:"btn icon ghost", type:"button", title:"Itxi", onclick:()=>close()}, "✕")),
    bodyEl,
    h("div",{class:"modal-foot"},
      h("button",{class:"btn", type:"button", onclick:()=>close()}, cancelText), okBtn)
  );
  const back = h("div",{class:"modal-back", onclick:(e)=>{ if(e.target===back) close(); }}, form);
  let closed = false;
  function close(ok=false){ if(closed) return; closed = true; back.remove(); document.removeEventListener("keydown", esc); if (onClose) onClose(ok); }
  function esc(e){ if(e.key==="Escape") close(); }
  document.addEventListener("keydown", esc);
  document.body.appendChild(back);
  const first = form.querySelector("input,textarea,select");
  if (first) setTimeout(()=>first.focus(), 40);
  return { close, form };
}

export function confirmBox(title, text, okText="Ezabatu"){
  return new Promise(res => {
    modal({ title, body:[h("p",{class:"muted", text})], okText, danger:true,
      onOk: ()=>{}, onClose: (ok)=> res(ok) });
  });
}

export function field(label, input){ return h("label",{class:"field"}, label, input); }

/* ---------- datak (UTC oinarrian, ordu-aldaketek ez eragiteko) ---------- */
export const MONTHS = ["urtarrila","otsaila","martxoa","apirila","maiatza","ekaina","uztaila","abuztua","iraila","urria","azaroa","abendua"];
export const MONTHS_S = ["urt","ots","mar","api","mai","eka","uzt","abu","ira","urr","aza","abe"];
export const DAYS_S = ["ig","al","ar","az","og","or","lr"]; // getUTCDay(): 0=igandea

export function parseYMD(s){
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
  if (!m) return null;
  return Date.UTC(+m[1], +m[2]-1, +m[3]);
}
export function ymd(ts){
  const d = new Date(ts);
  return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0");
}
export const DAY = 86400000;
export const addDays = (ts, n) => ts + n*DAY;
export const diffDays = (a, b) => Math.round((b-a)/DAY);
export function todayUTC(){
  const n = new Date();
  return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
}
export function fmtDate(ts){
  if (ts === null || ts === undefined) return "—";
  const d = new Date(ts);
  return d.getUTCDate()+" "+MONTHS_S[d.getUTCMonth()];
}
export function fmtDateLong(ts){
  const d = new Date(ts);
  return d.getUTCDate()+" "+MONTHS[d.getUTCMonth()]+" "+d.getUTCFullYear();
}
export function isWeekend(ts){ const w = new Date(ts).getUTCDay(); return w===0 || w===6; }

export function fmtWhen(tsLike){
  if (!tsLike) return "—";
  const d = tsLike.toDate ? tsLike.toDate()
          : (typeof tsLike.seconds === "number" ? new Date(tsLike.seconds*1000) : new Date(tsLike));
  if (isNaN(d.getTime())) return "—";
  const diff = (Date.now() - d.getTime())/1000;
  if (diff < 60) return "oraintxe";
  if (diff < 3600) return Math.floor(diff/60)+" min";
  if (diff < 86400) return Math.floor(diff/3600)+" ordu";
  if (diff < 7*86400) return Math.floor(diff/86400)+" egun";
  return d.getDate()+"/"+(d.getMonth()+1)+"/"+String(d.getFullYear()).slice(2);
}

/* ---------- besteak ---------- */
export function uid(p="i"){ return p + Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-3); }
export function debounce(fn, ms){
  let t; const f = (...a)=>{ clearTimeout(t); t = setTimeout(()=>fn(...a), ms); };
  f.flush = (...a)=>{ clearTimeout(t); fn(...a); };
  f.cancel = ()=> clearTimeout(t);
  return f;
}
export function initials(name, email){
  const s = (name || email || "?").trim();
  const p = s.split(/[\s.@_-]+/).filter(Boolean);
  return ((p[0]?.[0]||"") + (p[1]?.[0]||"")).toUpperCase() || s[0].toUpperCase();
}
export function download(filename, text, mime="text/plain;charset=utf-8"){
  const a = h("a",{href:URL.createObjectURL(new Blob([text],{type:mime})), download:filename});
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
export function param(name){ return new URLSearchParams(location.search).get(name); }
export function esc(s){ return String(s??"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
