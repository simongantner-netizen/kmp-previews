
(() => {
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const FLASCHE = { tag: ["#0A2A9E", "#0B3FD0", "#14C4E4", "#4FDCEC"].map(hex), nacht: ["#2F5BFF", "#4C7BFF", "#14C4E4", "#6FE6F2"].map(hex) };
  const misch = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k), sanft = k => { k = Math.min(1, Math.max(0, k)); return k * k * k * (k * (k * 6 - 15) + 10); };
  const STUFEN = {}, stufen = art => FLASCHE[art] || STUFEN[art] || (art && art.includes("#") ? (STUFEN[art] = art.split(",").map(s => hex(s.trim()))) : FLASCHE.tag);
  const flasche = (art, u, v, t) => { const [o1, o2, u1, u2] = stufen(art);
    const g = .05 + .085 * Math.sin(u * 2.4 + t * 1.3) + .04 * Math.sin(u * 4.3 - t * .95 + 1.1) + u * .06 * Math.sin(t * .37);
    return misch(misch(o1, o2, sanft((v + 1.1) / (g + 1.1))), misch(u1, u2, sanft((v - g) / (1.1 - g))), sanft((v - g + .5) / 1)); };
  const css = c => c.map(v => Math.round(v * 255)).join(",");
  const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS = `precision highp float;
uniform vec2 aufl;uniform float t;uniform float px;uniform vec3 vorne;uniform vec3 hinten;uniform float atem;uniform float flimmer;uniform float ruhe;
uniform vec3 akz;uniform float fl;uniform vec3 o1;uniform vec3 o2;uniform vec3 u1;uniform vec3 u2;uniform float ft;
float sanft(float k){k=clamp(k,0.,1.);return k*k*k*(k*(k*6.-15.)+10.);}
float h(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 zelle=floor(gl_FragCoord.xy/px)*px+px*.5;
  vec2 uv=(zelle-aufl*.5)/(min(aufl.x,aufl.y)*.5);
  float r=.86+.02*atem; float d=length(uv);
  if(d>r){gl_FragColor=vec4(hinten,0.);return;}
  vec3 n=vec3(uv/r,sqrt(max(0.,1.-dot(uv/r,uv/r))));
  vec3 l=normalize(vec3(cos(t*.23)*.8,sin(t*.17)*.6+.35,.75));
  float hell=clamp(dot(n,l)*.85+.18,0.,1.);
  hell=pow(hell,1.15);
  float schwelle=h(zelle+floor(t*8.)*.37*flimmer);
  // ruhe (data-ruhe, 0..1): mischt das harte Zufallsraster mit einem weichen Verlauf, weniger Körnung
  float an=mix(step(schwelle,hell),smoothstep(.08,.92,hell),ruhe);
  vec3 farbe=vorne;
  if(fl>.5){float u=uv.x/r,v=-uv.y/r;float g=.05+.085*sin(u*2.4+ft*1.3)+.04*sin(u*4.3-ft*.95+1.1)+u*.06*sin(ft*.37);
    farbe=mix(mix(o1,o2,sanft((v+1.1)/(g+1.1))),mix(u1,u2,sanft((v-g)/(1.1-g))),sanft(v-g+.5));}
  // Ein einziger Punkt in Scarlet Red wandert über die Vorderseite (Deck 11.11.2026, data-akzent; «one surprising color»)
  if(akz.x>=0.){vec3 ap=normalize(vec3(cos(t*.21)*.58,.16+sin(t*.13)*.3,.78));float rad=max(.034,px*2.5/(min(aufl.x,aufl.y)*.5));
    if(length(uv-ap.xy*r)<rad){farbe=akz;an=1.;}}
  gl_FragColor=ruhe>0.?vec4(farbe*an,an):vec4(mix(hinten,farbe,an),an>0.?1.:0.);
}`;
  const kugeln = [];
  const geteilt = (() => { const gc = document.createElement("canvas"), gl = gc.getContext("webgl", { premultipliedAlpha: false, alpha: true }); if (!gl) return null;
    const sh = (typ, src) => { const s = gl.createShader(typ); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uu = {}; return { gc, gl, u: n => uu[n] || (uu[n] = gl.getUniformLocation(pr, n)) }; })();
  if (geteilt) document.querySelectorAll("canvas[data-kugel]").forEach(c => {
    const { gl, u } = geteilt;
    kugeln.push({ c, gl, u, x2: c.getContext("2d"), flasche: c.dataset.flasche, farben: (c.dataset.farben || "#E8462A").split(",").map(hex), grund: hex(c.dataset.grund || "#FFFFFF"), px: +(c.dataset.px || 2), still: c.dataset.still !== undefined,
      tempo: +(c.dataset.tempo || 1), akzent: c.dataset.akzent ? hex(c.dataset.akzent) : [-1, -1, -1], flimmer: c.dataset.flimmer === undefined ? 1 : +c.dataset.flimmer, ruhe: +(c.dataset.ruhe || 0) });
  });
  const ringe = [...document.querySelectorAll("canvas[data-ring]:not([data-atemkreis])")].map(c => ({ c, x: c.getContext("2d"), farbe: c.dataset.farbe || "#111",
    still: c.dataset.still !== undefined, form: c.dataset.form || "welle",
    farben: (c.dataset.farben || "#0A2A9E,#0B3FD0,#14C4E4,#4FDCEC").split(",").map(hex), dunkel: c.dataset.dunkel !== undefined, flasche: c.dataset.flasche }));
  const zeiger = { x: 0, y: 0, da: false };
  addEventListener("pointermove", e => { zeiger.x = e.clientX; zeiger.y = e.clientY; zeiger.da = true; }, { passive: true });
  document.documentElement.addEventListener("pointerleave", () => { zeiger.da = false; });
  const strahlen = [...document.querySelectorAll("canvas[data-strahl]")].map(c => { const f = (c.dataset.farben || c.dataset.farbe || "#111111").split(",");
    const innen = hex(f[0]), aussen = hex(f[f.length - 1]);
    return { c, x: c.getContext("2d"), innen, aussen, flasche: c.dataset.flasche, mx: 0, my: 0, mk: 0, voll: c.dataset.flasche ? .96 : (aussen[0] + aussen[1] + aussen[2]) / 3 < .5 ? .96 : .74, still: c.dataset.still !== undefined }; });
  const schlaufen = [...document.querySelectorAll("canvas[data-schlaufe]")].map(c => { const f = (c.dataset.farben || c.dataset.farbe || "#111111").split(",").map(hex);
    return { c, x: c.getContext("2d"), a: f[0], b: f[f.length - 1], flasche: c.dataset.flasche, n: +(c.dataset.linien || 11), stark: +(c.dataset.stark || 1), still: c.dataset.still !== undefined }; });
  const alls = [...document.querySelectorAll("canvas[data-all]")].map(c => ({ c, x: c.getContext("2d"),
    farben: (c.dataset.farben || "#F28C28,#E8462A,#F0647A,#FFFFFF").split(","), sterne: null, spuren: [] }));
  const erosionen = [...document.querySelectorAll("canvas[data-erosion]")].map(c => {
    const n = 1400, pts = [], gold = 2.399963;
    for (let i = 0; i < n; i++) { const y = 1 - (i + .5) / n * 2, r = Math.sqrt(1 - y * y), a = i * gold; pts.push([Math.cos(a) * r, y, Math.sin(a) * r, 0]); }
    const wand = Array.from({ length: 7 }, () => ({ p: [0, 0, 1].map(() => Math.random() * 2 - 1), v: [0, 0, 0].map(() => Math.random() * 2 - 1), weg: [] }));
    return { c, x: c.getContext("2d"), pts, wand, punkt: c.dataset.punkt || "rgba(255,255,255,.5)", glut: c.dataset.glut || "#F5A142" };
  });
  const orbs = [...document.querySelectorAll("canvas[data-orb]")].map(c => ({ c, x: c.getContext("2d"), farbe: c.dataset.farbe || "#eeeeee", farben: c.dataset.farben ? c.dataset.farben.split(",") : null,
    n: +(c.dataset.linien || 20), stark: +(c.dataset.stark || 1), geo: c.dataset.geo !== undefined, akzent: c.dataset.akzent || null }));
  const FORMEN = { sanft: [[2, .048, .4], [3, .022, 1.9]], schief: [[1, .036, .8], [2, .05, 2.2], [3, .016, .3]], ruhig: [[2, .03, 1.1], [4, .01, .2]] };
  const atemkreise = [...document.querySelectorAll("canvas[data-atemkreis]")].map(c => ({ c, x: c.getContext("2d"),
    farbe: c.dataset.farbe || "#E8462A", form: FORMEN[c.dataset.form || "sanft"] || FORMEN.sanft, still: c.dataset.still !== undefined, ring: c.dataset.ring !== undefined, strich: +(c.dataset.strich || .06),
    zwei: (c.dataset.farben || "").split(",").length === 4 ? c.dataset.farben.split(",") : null }));
  const atemWert = t => { const p = (t % 10) / 10; return p < .4 ? .5 - .5 * Math.cos(Math.PI * p / .4) : .5 + .5 * Math.cos(Math.PI * (p - .4) / .6); };
  const norm = v => { const l = Math.hypot(...v) || 1; return v.map(q => q / l); };
  const filterGeht = "filter" in CanvasRenderingContext2D.prototype;
  const ebene = (r, k, W, H) => { const e = r[k] || (r[k] = document.createElement("canvas")); if (e.width !== W || e.height !== H) { e.width = W; e.height = H; }
    const g = e.getContext("2d"); g.clearRect(0, 0, W, H); return [e, g]; };
  const band = (r, d, tt) => {
    const x = r.x, W = r.c.width, H = r.c.height, f = r.farben, nf = f.length, n = 260, C = Math.cos, Sn = Math.sin;
    x.clearRect(0, 0, W, H);
    const [fe, fg] = ebene(r, "farbEbene", W, H), [ge, gg] = ebene(r, "glasEbene", W, H);
    const R = Math.min(W / 3.7, H / 2.05), S = R * 1.25;
    const ax = .3 + Sn(tt * .17) * .22, ay = Sn(tt * .21) * .55, az = Sn(tt * .13) * .08;
    const dreh = v => { const y1 = v[1] * C(ax) - v[2] * Sn(ax), z1 = v[1] * Sn(ax) + v[2] * C(ax), x2 = v[0] * C(ay) + z1 * Sn(ay), z2 = -v[0] * Sn(ay) + z1 * C(ay);
      return [x2 * C(az) - y1 * Sn(az), x2 * Sn(az) + y1 * C(az), z2]; };
    const pers = q => { const p = 3.4 * S / (3.4 * S - q[2]); return [W / 2 + q[0] * p, H / 2 + q[1] * p, q[2]]; };
    const mitte = a => { const s2 = 1 + Sn(a) ** 2; return [S * C(a) / s2, S * Sn(a) * C(a) / s2, S * .2 * Sn(a) + S * .04 * Sn(3 * a - tt * .7)]; };
    const farbe = a => { const p = ((a / (2 * Math.PI) + tt * .025) % 1 + 1) % 1 * nf, i = Math.floor(p), k = p - i, c0 = f[i % nf], c1 = f[(i + 1) % nf];
      return c0.map((v, j) => Math.round((v + (c1[j] - v) * k) * 255)).join(","); };
    const P = [];
    for (let i = 0; i <= n; i++) { const a = i / n * 2 * Math.PI, c0 = mitte(a), c1 = mitte(a + .001);
      const T = norm([c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]]), U = norm([T[1], -T[0], 0]), V = [T[1] * U[2] - T[2] * U[1], T[2] * U[0] - T[0] * U[2], T[0] * U[1] - T[1] * U[0]];
      const th = a + .35 * Sn(2 * a + tt * .5), D = U.map((u, j) => u * C(th) + V[j] * Sn(th)), w = R * (.23 + .07 * Sn(3 * a - tt * .8));
      const Nn = dreh([T[1] * D[2] - T[2] * D[1], T[2] * D[0] - T[0] * D[2], T[0] * D[1] - T[1] * D[0]]);
      P.push({ A: pers(dreh(c0.map((v, j) => v + D[j] * w))), B: pers(dreh(c0.map((v, j) => v - D[j] * w))), offen: Math.abs(Nn[2]), a }); }
    const seg = []; for (let i = 0; i < n; i++) seg.push([P[i], P[i + 1], (P[i].A[2] + P[i].B[2] + P[i + 1].A[2] + P[i + 1].B[2]) / 4]);
    seg.sort((p, q) => p[2] - q[2]);
    const viereck = (g, p, q) => { g.beginPath(); g.moveTo(p.A[0], p.A[1]); g.lineTo(q.A[0], q.A[1]); g.lineTo(q.B[0], q.B[1]); g.lineTo(p.B[0], p.B[1]); g.closePath(); };
    gg.fillStyle = r.dunkel ? "#C8D7FF" : "#E9E7FA"; gg.strokeStyle = gg.fillStyle; gg.lineWidth = d;
    for (const [p, q] of seg) { const kipp = 1 - (p.offen + q.offen) / 2, tropfen = Math.max(0, Sn(p.a * 2 - tt * .45)) ** 6;
      viereck(fg, p, q); fg.fillStyle = `rgba(${farbe(p.a)},${Math.min(.95, .03 + .85 * kipp ** 2.2 + .65 * tropfen)})`; fg.fill();
      viereck(gg, p, q); gg.fill(); gg.stroke(); }
    x.globalAlpha = r.dunkel ? .14 : .5; x.drawImage(ge, 0, 0);
    x.globalAlpha = 1;
    if (filterGeht) { x.filter = `blur(${R * .07}px)`; x.drawImage(fe, 0, 0); x.filter = "none"; }
    else { const [ke, kg] = ebene(r, "kleinEbene", Math.max(1, W >> 3), Math.max(1, H >> 3)); kg.drawImage(fe, 0, 0, ke.width, ke.height); x.imageSmoothingQuality = "high"; x.drawImage(ke, 0, 0, W, H); }
    x.globalAlpha = .2; x.drawImage(fe, 0, 0);
    x.lineWidth = 1.1 * d; x.lineCap = "round";
    for (const [p, q] of seg) { const kipp = 1 - (p.offen + q.offen) / 2; x.strokeStyle = `rgba(${farbe(p.a)},${.15 + .75 * kipp})`; x.globalAlpha = 1;
      x.beginPath(); x.moveTo(p.A[0], p.A[1]); x.lineTo(q.A[0], q.A[1]); x.moveTo(p.B[0], p.B[1]); x.lineTo(q.B[0], q.B[1]); x.stroke(); }
    x.globalAlpha = 1; };
  const groesse = c => { const d = Math.min(devicePixelRatio || 1, 2), w = c.clientWidth * d, h = c.clientHeight * d; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; } return d; };
  const farbeZu = (f, t) => { if (f.length === 1) return f[0]; const s = t / 6, i = Math.floor(s) % f.length, a = f[i], b = f[(i + 1) % f.length], k = s % 1, w = k * k * (3 - 2 * k); return a.map((v, j) => v + (b[j] - v) * w); };
  const sichtbar = new WeakMap(), io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => sichtbar.set(e.target, e.isIntersecting)), { rootMargin: "300px" }) : null;
  if (io) document.querySelectorAll("canvas").forEach(c => io.observe(c));
  const druck = /[?&]print/.test(location.search), folieVon = new WeakMap();
  const zeigen = c => { if (druck || !document.getElementById("stage")) return true; let f = folieVon.get(c); if (f === undefined) { f = c.closest(".slide"); folieVon.set(c, f); }
    return f ? f.classList.contains("active") : sichtbar.get(c) !== false; };
  const male = ms => {
    const t = ms / 1000;
    for (const k of kugeln) { if (!zeigen(k.c)) continue; const d = groesse(k.c), gl = k.gl, tt = (ruhig || k.still) ? 3 : t * k.tempo, gc = geteilt.gc;
      if (gc.width !== k.c.width || gc.height !== k.c.height) { gc.width = k.c.width; gc.height = k.c.height; }
      gl.viewport(0, 0, k.c.width, k.c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(k.u("aufl"), k.c.width, k.c.height); gl.uniform1f(k.u("t"), tt); gl.uniform1f(k.u("px"), k.px * d);
      gl.uniform3fv(k.u("vorne"), farbeZu(k.farben, tt)); gl.uniform3fv(k.u("hinten"), k.grund);
      gl.uniform1f(k.u("atem"), Math.sin(tt * 2 * Math.PI / 10)); gl.uniform1f(k.u("flimmer"), k.flimmer); gl.uniform1f(k.u("ruhe"), k.ruhe); gl.uniform3fv(k.u("akz"), k.akzent);
      gl.uniform1f(k.u("fl"), k.flasche ? 1 : 0); gl.uniform1f(k.u("ft"), (ruhig || k.still) ? 3 : t);
      if (k.flasche) { const f = stufen(k.flasche); ["o1", "o2", "u1", "u2"].forEach((n, i) => gl.uniform3fv(k.u(n), f[i])); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); k.x2.clearRect(0, 0, k.c.width, k.c.height); k.x2.drawImage(gc, 0, 0); }
    for (const r of ringe) { if (!zeigen(r.c)) continue; const d = groesse(r.c), x = r.x, W = r.c.width, H = r.c.height, tt = (ruhig || r.still) ? 2 : t;
      if (r.form === "fluessig") { band(r, d, tt); continue; }
      x.clearRect(0, 0, W, H); x.fillStyle = r.farbe;
      const unendlich = r.form === "unendlich", R = unendlich ? (r.c.dataset.marken ? Math.min(W / 6.2, H / 2.2) : Math.min(W / 3, H / 1.75)) : Math.min(W, H) * .36, pts = [];
      const frontal = unendlich && r.c.dataset.frontal !== undefined;
      const kp = +(r.c.dataset.kipp || 1), ax = frontal ? 0 : unendlich ? .36 + Math.sin(tt * .19) * Math.min(.34, .16 * kp) : .9 + Math.sin(tt * .2) * .15, ay = frontal ? 0 : unendlich ? Math.sin(tt * .23) * .56 : tt * .35;
      const az = frontal ? 0 : unendlich ? Math.sin(tt * .13) * .22 : 0, caz = Math.cos(az), saz = Math.sin(az);
      const klein = unendlich && (R / d < 62 || r.c.dataset.klein !== undefined);
      const fein = Math.min(1, R / (90 * d)), nb = klein ? 3 : fein < .6 ? 8 : 12;
      const S = unendlich ? R * 1.2 : R, rr = unendlich ? R * .15 : R * .22, na = klein ? 28 : Math.round((unendlich ? 110 : 64) * (.5 + .5 * fein)), w = r.form === "rund" ? 0 : 1;
      const mitte = a => {
        if (unendlich) { const s2 = 1 + Math.sin(a) ** 2; return [S * Math.cos(a) / s2, S * Math.sin(a) * Math.cos(a) / s2, frontal ? 0 : S * .22 * Math.sin(a)]; }
        const k = 1 + w * (.065 * Math.sin(2 * a + .6 + tt * .23) + .03 * Math.sin(3 * a + 1.4 - tt * .17));
        return [R * k * Math.cos(a), R * k * Math.sin(a), w * R * .07 * Math.sin(2 * a - tt * .2)]; };
      for (let i = 0; i < na; i++) { const a = i / na * Math.PI * 2 + tt * (unendlich ? .08 : .15), c0 = mitte(a), c1 = mitte(a + .001);
        const T = norm([c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]]), N = norm([T[1], -T[0], 0]), B = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]];
        for (let j = 0; j < nb; j++) { const b = j / nb * Math.PI * 2, cb = Math.cos(b) * rr, sb = Math.sin(b) * rr;
          const px = c0[0] + cb * N[0] + sb * B[0], py = c0[1] + cb * N[1] + sb * B[1], pz = c0[2] + cb * N[2] + sb * B[2];
          const y1 = py * Math.cos(ax) - pz * Math.sin(ax), z1 = py * Math.sin(ax) + pz * Math.cos(ax);
          const x2 = px * Math.cos(ay) + z1 * Math.sin(ay), z2 = -px * Math.sin(ay) + z1 * Math.cos(ay);
          const p = unendlich ? 3.4 * S / (3.4 * S - z2) : 1, x3 = x2 * caz - y1 * saz, y3 = x2 * saz + y1 * caz;
          pts.push([x3 * p, y3 * p, z2, p]); } }
      pts.sort((p, q) => p[2] - q[2]);
      for (const [px, py, pz, p] of pts) { const tiefe = Math.min(1, Math.max(0, (pz / (S * 1.1 + rr) + 1) / 2)); x.globalAlpha = .15 + .85 * tiefe;
        if (r.flasche) x.fillStyle = `rgb(${css(flasche(r.flasche, px / (S * .75), py / (S * .5), tt))})`;
        x.beginPath(); x.arc(W / 2 + px, H / 2 + py, klein ? rr * (.2 + .14 * tiefe) * p : (1 + 1.6 * tiefe) * d * (.4 + .6 * fein) * p * Math.max(1, R / (380 * d)) * (+(r.c.dataset.punkt || 1)), 0, Math.PI * 2); x.fill(); }
      if (unendlich && r.c.dataset.marken) {
        const fs = Math.max(11 * d, W * .019), farbe = r.c.dataset.textfarbe || r.farbe;
        x.font = `500 ${fs}px ${r.c.dataset.schrift || "sans-serif"}`; x.textBaseline = "middle";
        for (const m of r.c.dataset.marken.split(";")) { const [txt, aa] = m.split("|"), c0 = mitte(+aa);
          const y1 = c0[1] * Math.cos(ax) - c0[2] * Math.sin(ax), z1 = c0[1] * Math.sin(ax) + c0[2] * Math.cos(ax);
          const x2 = c0[0] * Math.cos(ay) + z1 * Math.sin(ay), z2 = -c0[0] * Math.sin(ay) + z1 * Math.cos(ay);
          const p = 3.4 * S / (3.4 * S - z2), sx = W / 2 + (x2 * caz - y1 * saz) * p, sy = H / 2 + (x2 * saz + y1 * caz) * p;
          const dx = sx - W / 2, dy = sy - H / 2, dl = Math.hypot(dx, dy) || 1;
          x.globalAlpha = 1; x.fillStyle = farbe; x.beginPath(); x.arc(sx, sy, rr * .55, 0, Math.PI * 2); x.fill();
          x.strokeStyle = farbe; x.lineWidth = 1.5 * d; x.beginPath(); x.moveTo(sx + dx / dl * rr * .7, sy + dy / dl * rr * .7); x.lineTo(sx + dx / dl * rr * 2.2, sy + dy / dl * rr * 2.2); x.stroke();
          x.textAlign = dx >= 0 ? "left" : "right"; x.fillText(txt, sx + dx / dl * rr * 2.6, sy + dy / dl * rr * 2.6); } }
      x.globalAlpha = 1; }
    for (const a of alls) { if (!zeigen(a.c)) continue; const d = groesse(a.c), x = a.x, W = a.c.width, H = a.c.height, tt = ruhig ? 20 : t;
      if (!a.sterne || a.sterne.W !== W) { a.sterne = Array.from({ length: Math.round(W * H / (9000 * d)) }, () => [Math.random() * W, Math.random() * H, Math.random()]); a.sterne.W = W; }
      x.clearRect(0, 0, W, H);
      for (const [sx, sy, sh] of a.sterne) { x.globalAlpha = .15 + .5 * sh * (.7 + .3 * Math.sin(tt * (1 + sh * 2) + sx)); x.fillStyle = "#fff"; x.fillRect((sx - tt * 4 * d * sh) % W + (sx - tt * 4 * d * sh < 0 ? W : 0), sy, d * (sh > .9 ? 1.6 : 1), d * (sh > .9 ? 1.6 : 1)); }
      const kx = W * (+(a.c.dataset.kx || .62) + .06 * Math.sin(tt * .05)), ky = H * (+(a.c.dataset.ky || .66) - .05 * Math.sin(tt * .07)), vx = 1, vy = -.35;
      const len = Math.hypot(vx, vy), ux = vx / len, uy = vy / len, nx = -uy, ny = ux;
      x.lineWidth = d * .8;
      a.farben.forEach((f, i) => { const rad = Math.min(W, H) * (.05 + i * .045), om = 1.4 / (1 + i * .55);
        x.strokeStyle = f; x.beginPath();
        for (let k = 0; k <= 160; k++) { const back = k * 1.6 * d; const ph = tt * om - k * .045;
          const px = kx - ux * back + nx * Math.cos(ph) * rad, py = ky - uy * back + ny * Math.cos(ph) * rad * .55 + Math.sin(ph) * rad * .25;
          x.globalAlpha = (1 - k / 160) * .55; k ? x.lineTo(px, py) : x.moveTo(px, py);
          if (k % 8 === 0) { x.stroke(); x.beginPath(); x.moveTo(px, py); } }
        x.stroke();
        const ph = tt * om; x.globalAlpha = 1; x.fillStyle = f; x.beginPath(); x.arc(kx + nx * Math.cos(ph) * rad, ky + ny * Math.cos(ph) * rad * .55 + Math.sin(ph) * rad * .25, d * 2.2, 0, Math.PI * 2); x.fill(); });
      x.globalAlpha = 1; const g = x.createRadialGradient(kx, ky, 0, kx, ky, 18 * d); g.addColorStop(0, "rgba(255,240,220,1)"); g.addColorStop(.25, "rgba(255,200,150,.6)"); g.addColorStop(1, "rgba(255,160,100,0)");
      x.fillStyle = g; x.beginPath(); x.arc(kx, ky, 18 * d, 0, Math.PI * 2); x.fill(); }
    for (const e of erosionen) { if (!zeigen(e.c)) continue; const d = groesse(e.c), x = e.x, W = e.c.width, H = e.c.height, tt = ruhig ? 4 : t;
      const R = Math.min(W, H) * .4, cx = W / 2, cy = H / 2, ry = tt * .12, rx = .35;
      const dreh = p => { let [a, b, c] = p; const x1 = a * Math.cos(ry) + c * Math.sin(ry), z1 = -a * Math.sin(ry) + c * Math.cos(ry);
        const y2 = b * Math.cos(rx) - z1 * Math.sin(rx), z2 = b * Math.sin(rx) + z1 * Math.cos(rx); return [cx + x1 * R, cy + y2 * R, z2]; };
      if (!ruhig) for (const w of e.wand) { const s = .012; w.v = norm(w.v.map((q, i) => q + (Math.random() - .5) * .25));
        w.p = norm(w.p.map((q, i) => q + w.v[i] * s)); w.weg.push(w.p.slice()); if (w.weg.length > 70) w.weg.shift();
        if (Math.random() < .002) { w.weg = []; w.p = norm([0, 0, 0].map(() => Math.random() * 2 - 1)); } }
      for (const p of e.pts) { p[3] *= .985; for (const w of e.wand) { const q = w.p; const dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (dd < .004) p[3] = Math.min(1, p[3] + .35); } }
      x.clearRect(0, 0, W, H);
      for (const p of e.pts) { const [X, Y, Z] = dreh(p); const vorn = (Z + 1) / 2;
        if (p[3] > .9 && Math.sin(tt * 3 + p[0] * 40) > .6) continue;
        x.globalAlpha = .18 + .7 * vorn; x.fillStyle = e.punkt; x.fillRect(X, Y, d * 1.4, d * 1.4);
        if (p[3] > .05) { x.globalAlpha = p[3] * (.35 + .65 * vorn); x.fillStyle = e.glut; x.beginPath(); x.arc(X, Y, d * (1 + 1.6 * p[3]), 0, Math.PI * 2); x.fill(); } }
      x.globalCompositeOperation = "lighter";
      for (const w of e.wand) { if (w.weg.length < 2) continue; x.strokeStyle = e.glut; x.lineWidth = d * 1.6;
        for (let i = 1; i < w.weg.length; i++) { const a = dreh(w.weg[i - 1]), b = dreh(w.weg[i]); if (b[2] < -.15) continue;
          x.globalAlpha = (i / w.weg.length) * .8 * ((b[2] + 1) / 2); x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke(); } }
      x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; }
    for (const o of orbs) { if (!zeigen(o.c)) continue; const d = groesse(o.c), x = o.x, W = o.c.width, H = o.c.height, tt = ruhig ? 6 : t;
      const R = Math.min(W, H) * .42, cx = W / 2, cy = H / 2, dauer = 20, sq = o.geo ? 0 : .04, fr = 4, sp = 2, kipp = .18;
      x.clearRect(0, 0, W, H);
      if (o.farben) { const g = x.createLinearGradient(0, cy - R, 0, cy + R); g.addColorStop(0, o.farben[0]); g.addColorStop(1, o.farben[1]); x.strokeStyle = g; } else x.strokeStyle = o.farbe;
      const css = Math.min(W, H) / d, n = css < 24 ? 4 : css < 48 ? 5 : css < 90 ? Math.min(o.n, 7) : o.n;
      const lw = Math.max(d * (css < 48 ? 1.2 : 1), d * 1.4 * o.stark * Math.min(1, css / 300) * Math.max(1, css / 760)); x.lineCap = "round"; x.lineJoin = "round";
      const grund = x.strokeStyle, akzL = o.akzent && o.c.dataset.stand === undefined ? Math.round(n * .4) : -1, kreise = [];
      for (let L = 0; L < n; L++) { const rot = L / n * Math.PI, cR = Math.cos(rot), sR = Math.sin(rot); x.strokeStyle = L === akzL ? o.akzent : grund;
        const lat = ((tt + L / n * dauer) % dauer) / dauer * Math.PI, rk = Math.sin(lat), y0 = Math.cos(lat);
        const pkte = [];
        for (let i = 0; i <= 180; i++) { const a = i / 180 * Math.PI * 2;
          const s1 = Math.sin(a * fr + tt * sp + L * .5) * sq, s2 = Math.cos(a * 5 + tt * sp * .8) * sq * .5, s3 = Math.sin(a * 3 + tt * sp * 1.2) * sq * .4;
          const r = rk + (s1 + s2) * rk, px = Math.cos(a) * r, py = y0 + s3 * rk, pz = Math.sin(a) * r;
          const wx = px * cR + pz * sR, wz = -px * sR + pz * cR;
          const yy = py * Math.cos(kipp) - wz * Math.sin(kipp), zz = py * Math.sin(kipp) + wz * Math.cos(kipp);
          pkte.push([cx + wx * R, cy - yy * R, zz]); }
        kreise.push([pkte, x.strokeStyle]); }
      if (o.c.dataset.stand !== undefined && o.akzent) { const lat = Math.max(.04, Math.min(.96, +o.c.dataset.stand)) * Math.PI, rk = Math.sin(lat), y0 = Math.cos(lat), pk = [];
        for (let i = 0; i <= 180; i++) { const a = i / 180 * Math.PI * 2, px = Math.cos(a) * rk, pz = Math.sin(a) * rk;
          const yy = y0 * Math.cos(kipp) - pz * Math.sin(kipp), zz = y0 * Math.sin(kipp) + pz * Math.cos(kipp); pk.push([cx + px * R, cy - yy * R, zz]); }
        kreise.push([pk, o.akzent]); }
      const hinten = o.c.dataset.hinten !== undefined ? +o.c.dataset.hinten : .32;
      if (hinten >= 1) { for (const vorne of [false, true]) for (const [pkte, farbe] of kreise) { x.strokeStyle = farbe; x.globalAlpha = 1;
          for (let i = 1; i < pkte.length; i++) { const p0 = pkte[i - 1], p1 = pkte[i], z = (p0[2] + p1[2]) / 2; if ((z >= 0) !== vorne) continue;
            const u = Math.max(0, Math.min(1, (z + .35) / .7)); x.lineWidth = lw * (.62 + .38 * u * u * (3 - 2 * u)); x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.stroke(); } }
        x.globalAlpha = 1; continue; }
      for (const vorne of [false, true]) for (const [pkte, farbe] of kreise) { x.strokeStyle = farbe; x.globalAlpha = vorne ? 1 : hinten; x.lineWidth = vorne ? lw : lw * .62; x.beginPath(); let an = false;
        for (let i = 1; i < pkte.length; i++) { const p0 = pkte[i - 1], p1 = pkte[i], v = (p0[2] + p1[2]) / 2 >= 0;
          if (v === vorne) { if (!an) { x.moveTo(p0[0], p0[1]); an = true; } x.lineTo(p1[0], p1[1]); } else an = false; }
        x.stroke(); }
      x.globalAlpha = 1; }
    for (const a of atemkreise) { if (!zeigen(a.c)) continue; const d = groesse(a.c), x = a.x, W = a.c.width, H = a.c.height;
      const steht = ruhig || a.still, ein = steht ? .6 : atemWert(t), drift = steht ? 0 : t * .2 + ein * .9;
      const R = Math.min(W, H) * .44 * (.80 + .20 * ein), formStaerke = 1.86 - 1.26 * ein, n = 200;
      x.clearRect(0, 0, W, H); x.beginPath(); const umriss = [];
      for (let i = 0; i <= n; i++) { const w = i / n * Math.PI * 2; let r = 1;
        for (const [k, amp, ph] of a.form) r += amp * formStaerke * Math.sin(k * w + ph + drift * (k % 2 ? 1 : -1));
        const px = W / 2 + Math.cos(w) * R * r, py = H / 2 + Math.sin(w) * R * r; i ? x.lineTo(px, py) : x.moveTo(px, py);
        if (i % 4 === 0) umriss.push([px / d, py / d]); }
      a.c.umriss = umriss;
      x.closePath();
      if (a.zwei) {
        const [o1, o2, u1, u2] = a.zwei, top = H / 2 - R * 1.2, bot = H / 2 + R * 1.2, art = a.c.dataset.uebergang || "hart";
        const gy = H / 2 + R * (steht ? .05 : .16 - .3 * ein), welle = steht ? 0 : R, kipp = steht ? 0 : .06 * Math.sin(t * .37);
        const grenze = xx => { const u = (xx - W / 2) / R;
          return gy + welle * (.085 * Math.sin(u * 2.4 + t * 1.3) + .04 * Math.sin(u * 4.3 - t * .95 + 1.1)) + (xx - W / 2) * kipp; };
        const lage = y => Math.min(1, Math.max(0, (y - top) / (bot - top)));
        if (a.ring) {
          const g = x.createLinearGradient(0, top, 0, bot), k = Math.min(.98, Math.max(.02, lage(gy)));
          const hb = art === "verlauf" ? R * +(a.c.dataset.breite || .3) : 0, k1 = lage(gy - hb), k2 = Math.max(k1 + .001, lage(gy + hb));
          if (hb) { g.addColorStop(0, o1); g.addColorStop(k1, o2); g.addColorStop(Math.min(1, k2), u1); g.addColorStop(1, u2); }
          else { g.addColorStop(0, o1); g.addColorStop(k, o2); g.addColorStop(k, u1); g.addColorStop(1, u2); }
          x.strokeStyle = g; x.lineWidth = Math.max(1.5 * d, R * a.strich * (1.15 - .3 * ein)); x.stroke();
        } else if (art === "verlauf") {
          x.save(); x.clip();
          const b = 2 * R * +(a.c.dataset.breite || .3), sp = W / 90;
          for (let xx = 0; xx < W; xx += sp) { const g0 = grenze(xx + sp / 2), g = x.createLinearGradient(0, top, 0, bot);
            const k1 = lage(g0 - b / 2), k2 = Math.max(k1 + .001, lage(g0 + b / 2));
            g.addColorStop(0, o1); g.addColorStop(k1, o2); g.addColorStop(Math.min(1, k2), u1); g.addColorStop(1, u2);
            x.fillStyle = g; x.fillRect(xx, 0, sp + 1, H); }
          x.restore();
        } else {
          x.save(); x.clip();
          const go = x.createLinearGradient(0, top, 0, gy); go.addColorStop(0, o1); go.addColorStop(1, o2);
          x.fillStyle = go; x.fillRect(0, 0, W, H);
          const gu = x.createLinearGradient(0, gy, 0, bot); gu.addColorStop(0, u1); gu.addColorStop(1, u2);
          const linie = () => { x.beginPath(); x.moveTo(0, grenze(0)); for (let xx = W / 120; xx <= W + 1; xx += W / 120) x.lineTo(xx, grenze(xx)); };
          linie(); x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fillStyle = gu; x.fill();
          if (art === "glut") {
            const s = .75 + .25 * ein; linie(); x.lineCap = "round";
            x.shadowColor = "#7FF0FF"; x.shadowBlur = R * .16 * s; x.strokeStyle = "rgba(160,245,255,.55)"; x.lineWidth = R * .05 * s; x.stroke();
            x.shadowBlur = R * .05 * s; x.strokeStyle = "#EFFFFF"; x.lineWidth = Math.max(d, R * .014); x.stroke();
          }
          x.restore();
        }
      } else if (a.ring) { x.strokeStyle = a.farbe; x.lineWidth = Math.max(1.5 * d, R * a.strich * (1.15 - .3 * ein)); x.stroke(); } else { x.fillStyle = a.farbe; x.fill(); } }
    for (const g of strahlen) { if (!zeigen(g.c)) continue; const d = groesse(g.c), x = g.x, W = g.c.width, H = g.c.height, tt = (ruhig || g.still) ? 3.2 : t;
      x.clearRect(0, 0, W, H);
      const R = Math.min(W, H) / 2 / 1.32, cx = W / 2, cy = H / 2, fein = R > 34 * d;
      if (!(R > 0)) continue;
      if (!isFinite(g.mx + g.my + g.mk)) { g.mx = g.my = g.mk = 0; }
      { const r = g.c.getBoundingClientRect(), mx = (zeiger.x - r.left - r.width / 2) * d / R, my = -(zeiger.y - r.top - r.height / 2) * d / R, m = Math.hypot(mx, my) || 1;
        const ziel = zeiger.da && !g.still ? Math.max(0, Math.min(1, (2.6 - m) / 1.4)) : 0;
        g.mx += (mx / m - g.mx) * .14; g.my += (my / m - g.my) * .14; g.mk += (ziel - g.mk) * .08; }
      if (g.c.dataset.zeiger) { const [zx, zy] = g.c.dataset.zeiger.split(",").map(Number), zm = Math.hypot(zx, zy) || 1; g.mx = zx / zm; g.my = zy / zm; g.mk = +(g.c.dataset.zug || 1); }
      const g0 = g.weg || (g.weg = (() => { const pts = [], rm = .8, a0 = Math.PI / 2, a1 = Math.PI / 2 + 2 * Math.PI;
        for (let a = a0; a <= a1 + 1e-9; a += .004) pts.push([rm * Math.cos(a), rm * Math.sin(a), 0]);
        let L = 0; pts[0][3] = 0; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); pts[i][3] = L; }
        return { pts, L, Lb: L }; })());
      const { pts, L, Lb } = g0, abstand = L / Math.round(L / (.195 * (fein ? 1 : 1.55))), br = R * (fein ? .13 : .17), atem = 1 + .02 * Math.sin(tt * .8), welle = (tt * .12) % 1;
      x.lineCap = "round"; x.lineWidth = br;
      let j = 0, schritt = abstand;
      for (let l = 0; l < L - 1e-6; l += schritt) { while (j < pts.length - 2 && pts[j + 1][3] < l) j++;
        const p = pts[j], q = pts[j + 1], tx = q[0] - p[0], ty = q[1] - p[1], tl = Math.hypot(tx, ty) || 1, nx = ty / tl, ny = -tx / tl;
        const s = 1 - l / L, ds = ((s - welle) % 1 + 1.5) % 1 - .5, stoss = Math.exp(-((ds / .1) ** 2)), zug = g.mk * Math.max(0, nx * g.mx + ny * g.my) ** 2.5, hell = g.voll + (1 - g.voll) * Math.max(stoss, zug);
        const kurz = l <= Lb ? 1 : Math.max(.12, 1 - (l - Lb) / (L - Lb) * .95), halb = .2 * kurz;
        schritt = abstand * (.55 + .45 * kurz); x.lineWidth = br * (.75 + .25 * kurz);
        const x0 = p[0] - nx * halb, y0 = p[1] - ny * halb, aus = halb * Math.min(2.15, 1 + .45 * stoss + 1 * zug) * atem, x1 = p[0] + nx * aus, y1 = p[1] + ny * aus;
        const P0 = [cx + x0 * R, cy - y0 * R], P1 = [cx + x1 * R, cy - y1 * R], gr = x.createLinearGradient(P0[0], P0[1], P1[0], P1[1]);
        const fi = g.flasche ? flasche(g.flasche, x0, -y0, tt) : g.innen, fa = g.flasche ? flasche(g.flasche, x1, -y1, tt) : g.aussen;
        for (let k = 0; k <= 16; k++) { const u = k / 16, v = Math.min(1, u / .92), e = v * v * v * (v * (v * 6 - 15) + 10);
          gr.addColorStop(u, `rgba(${css(misch(fi, fa, e))},${hell * e ** 1.1})`); }
        x.strokeStyle = gr; x.beginPath(); x.moveTo(P0[0], P0[1]); x.lineTo(P1[0], P1[1]); x.stroke(); } }
    for (const q of schlaufen) { if (!zeigen(q.c)) continue; const d = groesse(q.c), x = q.x, W = q.c.width, H = q.c.height, tt = (ruhig || q.still) ? 9 : t;
      x.clearRect(0, 0, W, H);
      const D = Math.min(W / 3.12, H / 2.12), cy = H / 2, xl = W / 2 - D / 2, xr = W / 2 + D / 2, schritt = 2.5 * Math.PI / 180;
      const bogen = 320 * Math.PI / 180, aus = 150 * Math.PI / 180, licht = (tt * .07) % 1.6 - .3;
      const n = Math.min(q.n, Math.max(3, Math.round(D / (6 * d))));
      x.lineWidth = Math.max(d * .9, D * .024 * q.stark * Math.sqrt(q.n / n)); x.lineCap = "butt";
      const glatt = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
      for (let k = 0; k < n; k++) { const r = D * (k + .5) / n, r2 = D - r, L = (r + r2) * bogen;
        const punkt = w => w < bogen ? [xl + r * Math.cos(w + 2 * Math.PI - bogen), cy - r * Math.sin(w + 2 * Math.PI - bogen), r * w]
          : [xr + r2 * Math.cos(Math.PI - (w - bogen)), cy - r2 * Math.sin(Math.PI - (w - bogen)), r * bogen + r2 * (w - bogen)];
        let vor = punkt(0);
        for (let w = schritt; w <= 2 * bogen + 1e-6; w += schritt) { const p = punkt(w), u = (p[2] + vor[2]) / 2 / L, wm = w - schritt / 2;
          const deck = glatt(wm / aus) * glatt((2 * bogen - wm) / aus), schein = Math.exp(-(((u - licht) / .14) ** 2));
          const f = q.flasche ? css(flasche(q.flasche, (p[0] - W / 2) / D, (p[1] - cy) / D, tt)) : css(misch(q.a, q.b, u));
          x.strokeStyle = `rgba(${f},${deck * (.74 + .26 * schein)})`; x.beginPath(); x.moveTo(vor[0], vor[1]); x.lineTo(p[0], p[1]); x.stroke(); vor = p; } } }
    if (!ruhig) requestAnimationFrame(male);
  };
  requestAnimationFrame(male);
})();
