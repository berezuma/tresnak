/* ============================================================
   3D IKUSTAILEA ETA ERAIKITZAILEA (Three.js)
   Piezaren koordenatuak (x zabalera, y sakonera, z altuera)
   Three.js-ekoetara: (x, z, -y). Aurrealdea kamerarantz (+Z) begira.
   ============================================================ */

import * as THREE from "three";
import { OrbitControls } from "../../vendor/OrbitControls.js";
import { buildSolid, key } from "./solid.js";

const FACE_COLORS = {
  "0,-1,0": 0x8dbcf2,   // aurrea  → altxaera (urdina)
  "0,0,1":  0xf6cf7a,   // goia    → oinplanoa (horia)
  "-1,0,0": 0x93d6a2,   // ezkerra → ezkerreko profila (berdea)
  "1,0,0":  0xd9e0e8,
  "0,1,0":  0xc7d0da,
  "0,0,-1": 0xb4bec9
};
const SLOPE_COLOR = 0xf2afc9;
const NEUTRAL = 0xe3e9f0;

/* Kamera-norabideak (Three.js koordenatuetan, xedetik kamerara) */
const VIEW_DIRS = {
  F: [0, 0, 1], T: [0, 1, 0.0001], L: [-1, 0, 0], R: [1, 0, 0], K: [0, 0, -1], B: [0, -1, 0.0001],
  I: [-1, 1, 1]
};

export class PieceViewer {
  constructor(container, opts = {}){
    this.el = container;
    this.opts = { editable: false, colors: true, size: { x: 6, y: 6, z: 5 }, floorLabel: true, ...opts };
    this.tool = "orbit";
    this.shape = "c";
    this.cells = new Map();
    this.size = { ...this.opts.size };

    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setClearColor(0x000000, 0);
    container.appendChild(r.domElement);
    r.domElement.classList.add("v3d-canvas");

    this.scene = new THREE.Scene();
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8894a4, 1.6));
    const dl = new THREE.DirectionalLight(0xffffff, 1.3);
    dl.position.set(-4, 8, 6);
    this.scene.add(dl);

    this.persp = new THREE.PerspectiveCamera(32, 1, 0.1, 500);
    this.ortho = new THREE.OrthographicCamera(-5, 5, 5, -5, -200, 500);
    this.camera = this.persp;
    this.controls = new OrbitControls(this.camera, r.domElement);
    this.controls.enableDamping = false;
    this.controls.screenSpacePanning = true;
    this.controls.addEventListener("change", () => this.requestRender());

    this.pieceGroup = new THREE.Group();
    this.helpers = new THREE.Group();
    this.scene.add(this.pieceGroup, this.helpers);

    this.ghost = new THREE.Mesh(new THREE.BoxGeometry(1.001, 1.001, 1.001),
      new THREE.MeshBasicMaterial({ color: 0x2a78d6, transparent: true, opacity: 0.25, depthWrite: false }));
    this.ghost.visible = false;
    this.scene.add(this.ghost);

    this.raycaster = new THREE.Raycaster();
    this._bindPointer();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);

    this.setWorkspace(this.size);
    this.setView("I", false);
    this.resize();
  }

  /* ---------- eszena ---------- */
  setWorkspace(size){
    this.size = { ...size };
    const g = this.helpers;
    while (g.children.length){ const c = g.children.pop(); c.geometry?.dispose(); c.material?.dispose?.(); }
    const { x: sx, y: sy } = this.size;
    const pts = [];
    for (let i = 0; i <= sx; i++) pts.push(i, 0, 0, i, 0, -sy);
    for (let j = 0; j <= sy; j++) pts.push(0, 0, -j, sx, 0, -j);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    /* depthWrite:false → sareak ez ditu ezkutuko ertzak (marra etenak) oztopatzen */
    g.add(new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x9fb0c4, transparent: true, opacity: 0.7, depthWrite: false })));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(sx, sy),
      new THREE.MeshBasicMaterial({ color: 0xdfe7f1, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(sx / 2, -0.001, -sy / 2);
    floor.userData.floor = true;
    this.floor = floor;
    g.add(floor);
    if (this.opts.floorLabel){
      const lab = textSprite("AURREA", "#2a78d6");
      lab.position.set(sx / 2, 0.02, 0.75);
      lab.scale.set(1.9, 0.48, 1);
      g.add(lab);
      const arrowShape = new THREE.Shape([new THREE.Vector2(-0.3, 0), new THREE.Vector2(0.3, 0), new THREE.Vector2(0, -0.35)]);
      const tri = new THREE.Mesh(new THREE.ShapeGeometry(arrowShape), new THREE.MeshBasicMaterial({ color: 0x2a78d6, side: THREE.DoubleSide }));
      tri.rotation.x = -Math.PI / 2;
      tri.position.set(sx / 2, 0.01, 0.2);
      g.add(tri);
    }
    this.target = new THREE.Vector3(sx / 2, Math.min(this.size.z, 3) / 2, -sy / 2);
    this.controls.target.copy(this.target);
    this.radius = Math.max(sx, sy, this.size.z) * 2.6 + 4;
    this.requestRender();
  }

  setCells(cells){
    this.cells = new Map(cells);
    const g = this.pieceGroup;
    while (g.children.length){ const c = g.children.pop(); c.geometry?.dispose(); c.material?.dispose?.(); }
    if (!this.cells.size){ this.requestRender(); return; }
    const solid = buildSolid(this.cells);
    const pos = [], nor = [], col = [];
    const color = new THREE.Color();
    for (const t of solid.tris){
      const nk = t.n.join(",");
      const slope = t.n.filter(v => v !== 0).length > 1;
      color.setHex(!this.opts.colors ? NEUTRAL : slope ? SLOPE_COLOR : (FACE_COLORS[nk] ?? NEUTRAL));
      const len = Math.hypot(...t.n);
      for (const v of t.v){
        pos.push(v[0] / 2, v[2] / 2, -v[1] / 2);
        nor.push(t.n[0] / len, t.n[2] / len, -t.n[1] / len);
        col.push(color.r, color.g, color.b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }));
    mesh.userData.piece = true;
    this.mesh = mesh;
    g.add(mesh);
    const ep = [];
    for (const e of solid.edges) ep.push(e.a[0] / 2, e.a[2] / 2, -e.a[1] / 2, e.b[0] / 2, e.b[2] / 2, -e.b[1] / 2);
    const eg = new THREE.BufferGeometry();
    eg.setAttribute("position", new THREE.Float32BufferAttribute(ep, 3));
    g.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: 0x0c1723 })));
    /* Ezkutuko ertzak: ertz berak, marra etenez, eta piezaren ATZEAN
       daudenean bakarrik marrazten dira (GreaterDepth). Aurpegiek
       polygonOffset dutenez, gainazaleko ertz ikusgaiak ez dira etenak. */
    const hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.Float32BufferAttribute(ep, 3));
    const dashed = new THREE.LineSegments(hg, new THREE.LineDashedMaterial({
      color: 0x0c1723, dashSize: 0.14, gapSize: 0.1,
      depthFunc: THREE.GreaterDepth, depthWrite: false, transparent: true, opacity: 0.85
    }));
    dashed.computeLineDistances();
    dashed.renderOrder = 2;
    dashed.visible = !!this.opts.hiddenEdges;
    this.hiddenLines = dashed;
    g.add(dashed);
    this.requestRender();
  }

  setColors(on){ this.opts.colors = on; this.setCells(this.cells); }

  /* Ezkutuko ertzak marra etenez erakutsi / ezkutatu */
  setHiddenEdges(on){
    this.opts.hiddenEdges = !!on;
    if (this.hiddenLines) this.hiddenLines.visible = !!on;
    this.requestRender();
  }

  /* Pieza erdiratu (ariketetan) */
  frameCells(){
    let min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const k of this.cells.keys()){
      const c = k.split("_").map(Number);
      for (let i = 0; i < 3; i++){ min[i] = Math.min(min[i], c[i]); max[i] = Math.max(max[i], c[i] + 1); }
    }
    if (!isFinite(min[0])) return;
    this.target.set((min[0] + max[0]) / 2, (min[2] + max[2]) / 2, -(min[1] + max[1]) / 2);
    this.controls.target.copy(this.target);
    this.radius = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]) * 2.8 + 3;
    this.setView(this.currentView || "I", false);
  }

  /* ---------- kamera ---------- */
  setView(id, animate = true){
    this.currentView = id;
    const d = new THREE.Vector3(...VIEW_DIRS[id]).normalize();
    const to = this.target.clone().add(d.multiplyScalar(this.radius));
    if (!animate){ this.camera.position.copy(to); this.controls.target.copy(this.target); this.controls.update(); this._syncOrtho(); this.requestRender(); return; }
    const from = this.camera.position.clone();
    const tFrom = this.controls.target.clone();
    const sph0 = new THREE.Spherical().setFromVector3(from.clone().sub(tFrom));
    const sph1 = new THREE.Spherical().setFromVector3(to.clone().sub(this.target));
    let dTheta = sph1.theta - sph0.theta;
    if (dTheta > Math.PI) dTheta -= 2 * Math.PI;
    if (dTheta < -Math.PI) dTheta += 2 * Math.PI;
    const t0 = performance.now(), dur = 480;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const sp = new THREE.Spherical(sph0.radius + (sph1.radius - sph0.radius) * e, sph0.phi + (sph1.phi - sph0.phi) * e, sph0.theta + dTheta * e);
      const tg = tFrom.clone().lerp(this.target, e);
      this.camera.position.copy(tg).add(new THREE.Vector3().setFromSpherical(sp));
      this.controls.target.copy(tg);
      this.controls.update();
      this.requestRender();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  setOrtho(on){
    const from = this.camera;
    this.camera = on ? this.ortho : this.persp;
    this.camera.position.copy(from.position);
    this.camera.quaternion.copy(from.quaternion);
    this.controls.object = this.camera;
    this.controls.update();
    this._syncOrtho();
    this.resize();
  }
  get isOrtho(){ return this.camera === this.ortho; }

  _syncOrtho(){
    if (!this.isOrtho) return;
    const w = this.el.clientWidth || 1, hgt = this.el.clientHeight || 1;
    const span = this.radius * 0.36;
    const aspect = w / hgt;
    this.ortho.left = -span * aspect; this.ortho.right = span * aspect;
    this.ortho.top = span; this.ortho.bottom = -span;
    this.ortho.updateProjectionMatrix();
  }

  resize(){
    const w = this.el.clientWidth || 300, hgt = this.el.clientHeight || 300;
    this.renderer.setSize(w, hgt, false);
    this.persp.aspect = w / hgt;
    this.persp.updateProjectionMatrix();
    this._syncOrtho();
    this.requestRender();
  }

  requestRender(){
    if (this._raf) return;
    this._raf = requestAnimationFrame(() => { this._raf = 0; this.renderer.render(this.scene, this.camera); });
  }

  /* ---------- tresnak ---------- */
  setTool(tool){ this.tool = tool; this.ghost.visible = false; this.el.dataset.tool = tool; this.requestRender(); }
  setShape(shape){ this.shape = shape; }

  _bindPointer(){
    const dom = this.renderer.domElement;
    let down = null;
    let touches = 0;
    dom.addEventListener("pointerdown", (e) => { touches++; down = { x: e.clientX, y: e.clientY, t: performance.now(), multi: touches > 1 }; });
    const up = (e) => {
      touches = Math.max(0, touches - 1);
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const wasMulti = down.multi;
      down = null;
      if (wasMulti || moved > 6 || e.button > 0) return;
      if (!this.opts.editable || this.tool === "orbit") return;
      const hit = this._pick(e);
      if (hit && this.opts.onPick) this.opts.onPick(hit);
    };
    dom.addEventListener("pointerup", up);
    dom.addEventListener("pointercancel", () => { touches = Math.max(0, touches - 1); down = null; });
    dom.addEventListener("pointermove", (e) => {
      if (down || !this.opts.editable || this.tool === "orbit" || e.pointerType === "touch"){ if (this.ghost.visible){ this.ghost.visible = false; this.requestRender(); } return; }
      const hit = this._pick(e);
      if (hit){
        const [x, y, z] = hit.cell;
        this.ghost.position.set(x + 0.5, z + 0.5, -y - 0.5);
        this.ghost.material.color.setHex(hit.type === "remove" ? 0xd13b34 : hit.type === "replace" ? 0xeda100 : 0x2a78d6);
        this.ghost.visible = true;
      } else this.ghost.visible = false;
      this.requestRender();
    });
    dom.addEventListener("pointerleave", () => { if (this.ghost.visible){ this.ghost.visible = false; this.requestRender(); } });
    dom.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  _pick(e){
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const targets = [this.floor];
    if (this.mesh) targets.unshift(this.mesh);
    const hits = this.raycaster.intersectObjects(targets, false);
    if (!hits.length) return null;
    const h = hits[0];
    const S = this.size;
    const inside = (c) => c[0] >= 0 && c[1] >= 0 && c[2] >= 0 && c[0] < S.x && c[1] < S.y && c[2] < S.z;
    if (h.object === this.floor){
      if (this.tool !== "add") return null;
      const c = [Math.floor(h.point.x), Math.floor(-h.point.z), 0];
      return inside(c) && !this.cells.has(key(...c)) ? { type: "add", cell: c } : null;
    }
    const n3 = h.face.normal;                        // Three.js koordenatuetan
    const n = [n3.x, -n3.z, n3.y];                   // piezaren koordenatuetara
    const p = [h.point.x, -h.point.z, h.point.y];
    const inner = p.map((v, i) => Math.floor(v - n[i] * 0.02));
    if (this.tool === "remove" || this.tool === "replace"){
      return this.cells.has(key(...inner)) ? { type: this.tool, cell: inner } : null;
    }
    // gehitu: aurpegi zuzenetan ondoko gelaxka; aurpegi inklinatuetan, gorantz (edo ardatz nagusian)
    let out;
    const nz = n.map(v => Math.abs(v) > 0.2 ? Math.sign(v) : 0);
    if (nz.filter(Boolean).length === 1) out = p.map((v, i) => Math.floor(v + n[i] * 0.02));
    else {
      const axis = nz[2] !== 0 ? 2 : (nz[0] !== 0 ? 0 : 1);
      out = inner.slice(); out[axis] += nz[axis];
    }
    if (!inside(out) || this.cells.has(key(...out))) return null;
    return { type: "add", cell: out };
  }

  /* Irudia (PNG) */
  snapshot(){ this.renderer.render(this.scene, this.camera); return this.renderer.domElement.toDataURL("image/png"); }

  dispose(){
    this.ro.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

function textSprite(text, color){
  const c = document.createElement("canvas");
  c.width = 256; c.height = 64;
  const ctx = c.getContext("2d");
  ctx.fillStyle = color;
  ctx.font = "700 36px Lato, Arial, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  // sprite gisa erabiltzen da baina lurrean etzanda
  return m;
}
