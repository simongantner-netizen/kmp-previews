
(() => {
  const html = document.documentElement;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const libs = !!(window.gsap && window.ScrollTrigger && window.Lenis);
  const bewegt = !ruhig && libs;
  if (!bewegt) html.classList.remove("bewegt");
  const VOR = window.VorMalen || [];
  const feineMaus = matchMedia("(pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const klemm = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sanft = k => { k = klemm(k); return k * k * (3 - 2 * k); };
  const TAU = Math.PI * 2;
  const rgba = (hex, a) => { const h = hex.replace("#", ""), v = h.length === 3 ? h.split("").map(c => c + c) : h.match(/../g); return `rgba(${v.map(x => parseInt(x, 16)).join(",")},${a.toFixed(3)})`; };
  const strich = (x, x1, y1, x2, y2, farbe, e, lw) => { if (e <= .003) return; const g = x.createLinearGradient(x1, y1, x2, y2); g.addColorStop(0, rgba(farbe, .15 * e)); g.addColorStop(1, rgba(farbe, e));
    x.strokeStyle = g; x.lineWidth = lw; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
  const kreuzt = (A, B) => { const o = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const d1 = o(A[0], A[1], A[2], A[3], B[0], B[1]), d2 = o(A[0], A[1], A[2], A[3], B[2], B[3]), d3 = o(B[0], B[1], B[2], B[3], A[0], A[1]), d4 = o(B[0], B[1], B[2], B[3], A[2], A[3]);
    return d1 * d2 < 0 && d3 * d4 < 0; };
  const kuerzen = (S, f) => { const mx = (S[0] + S[2]) / 2, my = (S[1] + S[3]) / 2; S[0] = mx + (S[0] - mx) * f; S[1] = my + (S[1] - my) * f; S[2] = mx + (S[2] - mx) * f; S[3] = my + (S[3] - my) * f; };
  const zaehle = (seg, fenster) => { let k = 0; for (let i = 0; i < seg.length; i++) for (let j = i + 1; j < Math.min(seg.length, i + 1 + fenster); j++) if (kreuzt(seg[i], seg[j])) k++; return k; };
  const ZAEHLER = window.SchwungZaehler = { buehne: { bilder: 0, roh: 0, kreuz: 0 }, bogen: { bilder: 0, roh: 0, kreuz: 0 } };
  const entwirren = (seg, fenster, z) => { const roh = zaehle(seg, fenster); z.bilder++; z.roh += roh;
    if (!roh || window.SCHWINGUNG_ROH) return;
    for (let runde = 0; runde < 12; runde++) { let frei = true;
      for (let i = 0; i < seg.length; i++) for (let j = i + 1; j < Math.min(seg.length, i + 1 + fenster); j++) if (kreuzt(seg[i], seg[j])) { kuerzen(seg[i], .9); kuerzen(seg[j], .9); frei = false; }
      if (frei) break; }
    z.kreuz += zaehle(seg, fenster); };
  const pixel = () => Math.min(devicePixelRatio || 1, 2);
  const achtWeg = s => { const r = .42, A0 = -35, A1 = 215, s1 = .44, s2 = .12;
    if (s < s1) { const a = (A0 + (A1 - A0) * s / s1) * Math.PI / 180; return [r * Math.cos(a), .43 + r * Math.sin(a)]; }
    if (s < s1 + s2) { const u = (s - s1) / s2, a = A1 * Math.PI / 180, P0 = [r * Math.cos(a), .43 + r * Math.sin(a)], P1 = [-P0[0], -P0[1]], T = [-Math.sin(a) * .8, Math.cos(a) * .8];
      const h1 = 2 * u ** 3 - 3 * u ** 2 + 1, h2 = -2 * u ** 3 + 3 * u ** 2, h3 = u ** 3 - 2 * u ** 2 + u, h4 = u ** 3 - u ** 2;
      return [h1 * P0[0] + h2 * P1[0] + (h3 + h4) * T[0], h1 * P0[1] + h2 * P1[1] + (h3 + h4) * T[1]]; }
    const a = (35 - 250 * (s - s1 - s2) / (1 - s1 - s2)) * Math.PI / 180; return [r * Math.cos(a), -.43 + r * Math.sin(a)]; };
  const N8 = 74, LW8 = .022, L8 = .27;
  const ACHT = Array.from({ length: N8 }, (_, i) => { const s = i / (N8 - 1), P = achtWeg(s), Q = achtWeg(Math.min(1, s + .002)), R = achtWeg(Math.max(0, s - .002));
    const tg = Math.atan2(Q[1] - R[1], Q[0] - R[0]), mitte = Math.exp(-(((s - .5) / .085) ** 2)), ein = Math.min(1, s / .1, (1 - s) / .1);
    return { s, x: P[1], y: -P[0], w: tg - mitte * 1.05, nx: Math.cos(tg), ny: Math.sin(tg), ein }; });
  const RAHMEN8 = (() => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const a of ACHT) { const l = L8 * (.55 + .45 * a.ein); for (const k of [-.5, .5]) { const px = a.x + Math.cos(a.w) * l * k, py = a.y + Math.sin(a.w) * l * k;
      x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } }
    return [x0 - LW8 / 2, y0 - LW8 / 2, x1 + LW8 / 2, y1 + LW8 / 2]; })();
  const maleAcht = (c, x, cssW, cssH, rand, atem) => {
    const d = pixel(), w = Math.round(cssW * d), h = Math.round(cssH * d);
    if (!w || !h) return; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const k = atem ? atem.k : 0, [x0, y0, x1, y1] = RAHMEN8, farbe = c.dataset.farbe || "#F2F1EE";
    const sk = Math.min(w * (1 - 2 * rand) / (x1 - x0), h * (1 - 2 * rand) / (y1 - y0)) * (1 + .015 * k * (atem ? Math.sin(atem.pb) : 0));
    const ox = w / 2 - (x0 + x1) / 2 * sk, oy = h / 2 + (y0 + y1) / 2 * sk;
    const seg = ACHT.map(a => {
      const dw = atem ? .16 * k * Math.sin(atem.p1 - TAU * 1.5 * a.s) : 0;
      const puls = atem ? 1 + .1 * k * Math.sin(atem.p2 - TAU * 2 * a.s + .8) : 1;
      const quer = atem ? .025 * k * Math.sin(atem.p3 - TAU * a.s) : 0;
      const cx = a.x + a.nx * quer, cy = a.y + a.ny * quer, w2 = a.w + dw, l = L8 * (.55 + .45 * a.ein) * puls, dx = Math.cos(w2) * l / 2, dy = Math.sin(w2) * l / 2;
      return [ox + (cx - dx) * sk, oy - (cy - dy) * sk, ox + (cx + dx) * sk, oy - (cy + dy) * sk, a.ein]; });
    entwirren(seg, N8, ZAEHLER.buehne);
    x.clearRect(0, 0, w, h); x.lineCap = "round";
    const lw = Math.max(d, LW8 * sk); for (const [a1, b1, a2, b2, e] of seg) strich(x, a1, b1, a2, b2, farbe, e, lw);
  };
  const maleBogen = (c, x, cssW, cssH, q, k, b1, b2, mk, mx, my) => {
    const d = pixel(), w = Math.round(cssW * d), h = Math.round(cssH * d);
    if (!w || !h) return; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const farbe = c.dataset.farbe || "#F2F1EE", L = h * .16, lw = Math.max(1.2 * d, h * .006), m = L / 2 + 2 * lw;
    const xa = .68 * w, ya = m + .02 * h, xs = .06 * w, ys = h - m - .02 * h, R = ((xa - xs) ** 2 + (ys - ya) ** 2) / (2 * (ys - ya)), cx = xa, cy = ya + R;
    const f0 = Math.asin(klemm((xs - cx) / R, -1, 1)), f1 = Math.asin(klemm((1.04 * w - cx) / R, -1, 1));
    const naehe = X => Math.exp(-(((X / w - mx) / .12) ** 2));
    const lage = u => { const f = f0 + (f1 - f0) * u, X = cx + R * Math.sin(f); let Y = cy - R * Math.cos(f);
      if (mk > 0) Y += mk * naehe(X) * (my * h - Y) * .45; return [X, klemm(Y, m, h - m)]; };
    const n = Math.round(klemm(R * (f1 - f0) / (13 * d), 48, 180)), seg = [];
    for (let i = 0; i < n; i++) { const u = i / (n - 1), [X, Y] = lage(u), A = lage(u + .002), B = lage(u - .002), tg = Math.atan2(A[1] - B[1], A[0] - B[0]);
      const g = sanft((q * 1.3 - u) / .3), ein = Math.min(1, u / .09); if (g <= 0) continue;
      const tau = (.16 + .7 * u ** 1.25) * (1 - .55 * mk * naehe(X)) + .07 * k * Math.sin(b1 - TAU * 1.3 * u);
      const a = tg + Math.PI / 2 + tau, l = L * (.55 + .45 * ein) * (1 + .06 * k * Math.sin(b2 - TAU * 1.8 * u)) * g, dx = Math.cos(a) * l / 2, dy = Math.sin(a) * l / 2;
      seg.push([X - dx, Y - dy, X + dx, Y + dy, ein * g]); }
    entwirren(seg, 10, ZAEHLER.bogen);
    x.clearRect(0, 0, w, h); x.lineCap = "round";
    for (const [a1, b1_, a2, b2_, e] of seg) strich(x, a1, b1_, a2, b2_, farbe, e, lw);
  };
  const hero = $(".hero"), kamera = $(".kamera"), leinwand = kamera && $("canvas", kamera), stift = leinwand && leinwand.getContext("2d");
  const bogenFeld = $(".bogen"), bogenC = bogenFeld && $("canvas", bogenFeld), bogenStift = bogenC && bogenC.getContext("2d");
  const heroText = $(".hero-text"), claim = $(".buehne-claim .zeile > span"), schleier = $(".buehne-schleier");
  const START = { A: 1.2, x: .9, y: .02 }, MITTE = { A: .44, x: .5, y: .42 }, ENDE = { A: .29, x: .5, y: .335 };
  const M = .04;
  const START_Y = START.y, kopf = $(".hero-text .label");
  let W = 0, H = 0, KW = 0, KH = 0, heroTop = 0, heroLauf = 1, heroH = 1, buehneRand = M, bogenH = 1;
  const mass = () => {
    W = html.clientWidth; H = innerHeight;
    KW = START.A * W / (1 - 2 * M); KH = KW / 2;
    if (kamera) { kamera.style.width = KW.toFixed(1) + "px"; kamera.style.height = KH.toFixed(1) + "px"; }
    if (hero) { heroTop = hero.getBoundingClientRect().top + scrollY; heroH = hero.offsetHeight; heroLauf = Math.max(1, heroH - H); }
    if (bogenFeld) bogenH = bogenFeld.offsetHeight;
    START.y = START_Y;
    if (kopf && heroText) { const frei = heroText.offsetTop + kopf.offsetTop - 26, unten = START_Y * H + .265 * START.A * W;
      if (unten > frei) START.y = START_Y - Math.min(.13, (unten - frei) / H); }
  };
  const intro = { s: bewegt ? 1.12 : 1, o: bewegt ? 0 : 1 };
  const setzeKamera = (e, e2 = 0) => {
    if (!kamera) return;
    const A1 = Math.exp(Math.log(START.A) + (Math.log(MITTE.A) - Math.log(START.A)) * e), k = (START.A - A1) / (START.A - MITTE.A);
    const A = A1 * Math.exp((Math.log(ENDE.A) - Math.log(MITTE.A)) * e2);
    const cx = (START.x + (MITTE.x - START.x) * k + (ENDE.x - MITTE.x) * e2) * W, cy = (START.y + (MITTE.y - START.y) * k + (ENDE.y - MITTE.y) * e2) * H;
    buehneRand = (1 - (A / START.A) * (1 - 2 * M)) / 2;
    kamera.style.transform = `translate3d(${(cx - KW / 2).toFixed(2)}px,${(cy - KH / 2).toFixed(2)}px,0) scale(${intro.s.toFixed(4)})`;
    kamera.style.opacity = intro.o.toFixed(3);
    return A;
  };
  mass(); setzeKamera(0);
  const teileWoerter = el => {
    if (!el) return [];
    const teile = [];
    el.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent.split(/\s+/).forEach(w => { if (w) teile.push(document.createTextNode(w)); });
      else if (n.nodeType === 1) teile.push(n.cloneNode(true)); });
    el.textContent = "";
    teile.forEach((t, i) => { const m = document.createElement("span"), w = document.createElement("span"); m.className = "wm"; w.className = "wi";
      w.appendChild(t); m.appendChild(w); el.appendChild(m); if (i < teile.length - 1) el.appendChild(document.createTextNode(" ")); });
    el.classList.add("geteilt");
    return $$(".wi", el);
  };
  if (!bewegt) {
    const still = () => { mass(); setzeKamera(0);
      if (stift) maleAcht(leinwand, stift, KW, KH, buehneRand, null);
      if (bogenStift) maleBogen(bogenC, bogenStift, W, bogenH, 1, 0, 0, 0, 0, .5, .5); };
    still(); addEventListener("resize", still);
    formular();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.lagSmoothing(0);
  VOR.push(t => lenis.raf(t));
  window.SchwungSeite = { lenis };
  let zuletzt = performance.now();
  const kam = { p: 0, v: 0 }, schub = { p: 0, v: 0, ziel: 0 };
  const feder = (f, ziel, k, zeta, dt) => { f.v += ((ziel - f.p) * k - f.v * 2 * zeta * Math.sqrt(k)) * dt; f.p += f.v * dt; };
  const baender = $$(".band > .band-schwung").map(el => ({ el, c: $("canvas", el) }));
  const mausBaender = $$("canvas[data-maus]").map(c => { const amp = +(c.dataset.amp || .2), ng = Math.abs(+(c.dataset.neigung || 0));
    return { c, box: c.closest(".band"), spiegel: !!c.closest(".band-gespiegelt"), lo: .5 - amp - ng / 2, hi: .5 + amp + ng / 2,
      top: 0, left: 0, breite: 1, hoehe: 1, mx: { p: .5, v: 0 }, my: { p: .5, v: 0 }, mk: { p: 0, v: 0 }, alt: "" }; });
  let zeiger = null;
  if (feineMaus) {
    addEventListener("pointermove", e => { zeiger = [e.clientX, e.clientY]; }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { zeiger = null; });
  }
  const haltung = $("[data-lesen]"), halt = { p: 0, v: 0, alt: [] };
  let haltWoerter = [];
  if (haltung) haltWoerter = teileWoerter(haltung);
  const atem = { k: 1, p1: 0, p2: 1.3, p3: 2.1, pb: 0 };
  const bg = { top: 0, yS: 0, yE: 1, q: { p: 0, v: 0 }, b1: 0, b2: .9, mx: { p: .5, v: 0 }, my: { p: .5, v: 0 }, mk: { p: 0, v: 0 } };
  let haltTop = 0, haltH = 1;
  const spur = $(".laufband-spur"), laufband = $(".laufband");
  const lauf = { x: 0, breite: 1, grund: 30, tempo: 30, halt: false };
  let heroSichtbar = true;
  VOR.push(t => {
    const jetzt = performance.now(), dt = Math.min(1 / 30, (jetzt - zuletzt) / 1000); zuletzt = jetzt;
    const y = scrollY;
    const roh = klemm((y - heroTop) / heroLauf);
    feder(kam, roh, 150, 1, dt);
    if (Math.abs(kam.p - roh) < 1e-4 && Math.abs(kam.v) < 1e-4) { kam.p = roh; kam.v = 0; }
    const p = klemm(kam.p);
    const e2 = sanft((p - .6) / .3);
    const A = setzeKamera(sanft((p - .05) / .6), e2);
    if (claim) claim.style.transform = `translateY(${((1 - sanft((p - .64) / .22)) * 108).toFixed(2)}%)`;
    schub.ziel = klemm(Math.abs(lenis.velocity || 0) / 38);
    feder(schub, schub.ziel, 70, .45, dt);
    const s = Math.max(-.12, schub.p), sp = Math.max(0, s);
    if (heroText) { const a = klemm(y - heroTop, 0, H * .5), o = 1 - sanft(a / (H * .4));
      heroText.style.opacity = o.toFixed(3); heroText.style.visibility = o > 0 ? "" : "hidden";
      if (schleier) schleier.style.opacity = o.toFixed(3);
      heroText.style.transform = `translate3d(0,${(-a * .16).toFixed(1)}px,0)`; }
    const sicht = y < heroTop + heroH;
    if (sicht !== heroSichtbar) { heroSichtbar = sicht; leinwand.style.visibility = sicht ? "" : "hidden"; }
    const tempo = 1 + .35 * e2 + .6 * sp;
    atem.p1 += dt * TAU / 4.5 * tempo; atem.p2 += dt * TAU / 3.8 * tempo; atem.p3 += dt * TAU / 6 * tempo; atem.pb += dt * TAU / 5.5;
    atem.k = (1 + 1.1 * e2 + .9 * sp) * klemm((MITTE.A / A) ** .6, .5, 1.15);
    if (sicht && stift) maleAcht(leinwand, stift, KW, KH, buehneRand, atem);
    for (const b of baender) b.el.style.transform = `scaleY(${(1 + .4 * s).toFixed(4)})`;
    mausBaender.forEach(b => {
      const r = { top: b.top - y, left: b.left, width: b.breite, height: b.hoehe }; if (r.top + r.height < -50 || r.top > H + 50) return;
      let zk = 0, zu = b.mx.p, zv = b.my.p;
      if (zeiger) { let u = (zeiger[0] - r.left) / r.width; if (b.spiegel) u = 1 - u; const v = (zeiger[1] - r.top) / r.height;
        const aussen = v < 0 ? -v : v > 1 ? v - 1 : 0; zk = klemm(1 - aussen / .5); zu = klemm(u); zv = klemm(v, b.lo, b.hi); }
      if (!zk && b.mk.p < .002) { if (b.alt !== "0") { b.c.dataset.mk = "0"; b.alt = "0"; } return; }
      feder(b.mx, zu, 60, .95, dt); feder(b.my, zv, 60, .95, dt); feder(b.mk, zk, 26, 1, dt);
      const mk = klemm(b.mk.p), neu = mk.toFixed(3) + b.mx.p.toFixed(3) + b.my.p.toFixed(3);
      if (neu !== b.alt) { b.alt = neu; b.c.dataset.mk = mk.toFixed(3); b.c.dataset.mx = b.mx.p.toFixed(4); b.c.dataset.my = klemm(b.my.p, b.lo, b.hi).toFixed(4); }
    });
    if (bogenStift) {
      feder(bg.q, klemm((y - bg.yS) / (bg.yE - bg.yS)), 38, 1, dt);
      const top = bg.top - y, imBild = top < H + 80 && top + bogenH > -80;
      let zk = 0, zu = bg.mx.p, zv = bg.my.p;
      if (zeiger && imBild) { const v = (zeiger[1] - top) / bogenH, aussen = v < 0 ? -v : v > 1 ? v - 1 : 0; zk = klemm(1 - aussen / .5); zu = klemm(zeiger[0] / W); zv = klemm(v, .1, .9); }
      feder(bg.mx, zu, 60, .95, dt); feder(bg.my, zv, 60, .95, dt); feder(bg.mk, zk, 26, 1, dt);
      bg.b1 += dt * TAU / 7 * (1 + .8 * sp); bg.b2 += dt * TAU / 5.2 * (1 + .8 * sp);
      if (imBild) maleBogen(bogenC, bogenStift, W, bogenH, klemm(bg.q.p), 1 + 1.6 * sp, bg.b1, bg.b2, klemm(bg.mk.p), bg.mx.p, bg.my.p);
    }
    if (haltung) { const r = { top: haltTop - y, height: haltH }, roh = klemm((H * .88 - r.top) / (H * .18 + r.height));
      feder(halt, roh, 90, 1, dt); const N = haltWoerter.length, L = 3, hp = klemm(halt.p);
      for (let i = 0; i < N; i++) { const t = sanft((hp * (N + L) - i) / L), v = ((1 - t) * 112).toFixed(1);
        if (halt.alt[i] !== v) { halt.alt[i] = v; haltWoerter[i].style.transform = v === "0.0" ? "none" : `translate3d(0,${v}%,0)`; } } }
    if (spur && lauf.breite > 1) {
      const ziel = lauf.halt ? 0 : lauf.grund;
      lauf.tempo += (ziel - lauf.tempo) * (1 - Math.exp(-dt / .35));
      lauf.x -= (lauf.tempo + Math.max(0, s) * 260) * dt;
      if (-lauf.x >= lauf.breite) lauf.x += lauf.breite;
      spur.style.transform = `translate3d(${lauf.x.toFixed(2)}px,0,0)`;
    }
    for (const m of magnete) {
      feder(m.fx, m.tx, 170, .42, dt); feder(m.fy, m.ty, 170, .42, dt);
      const ruht = Math.abs(m.fx.p) + Math.abs(m.fy.p) + Math.abs(m.fx.v) + Math.abs(m.fy.v) < .01 && !m.tx && !m.ty;
      if (ruht) { if (m.an) { m.el.style.transform = ""; m.an = false; } continue; }
      m.an = true; m.el.style.transform = `translate3d(${m.fx.p.toFixed(2)}px,${m.fy.p.toFixed(2)}px,0)`;
    }
  });
  const io = new IntersectionObserver(es => es.forEach(e => { e.target.style.visibility = e.isIntersecting ? "" : "hidden"; }), { rootMargin: "120px 0px" });
  baender.forEach(b => io.observe(b.c));
  html.classList.add("bereit");
  gsap.to(intro, { s: 1, o: 1, duration: 3, ease: "power3.out", delay: .1 });
  const navEin = $$(".nav [data-ein]");
  gsap.fromTo(navEin, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: .07, delay: .35 });
  const kopfWoerter = teileWoerter($('[data-hero="headline"]'));
  const tl = gsap.timeline({ delay: .5, defaults: { ease: "expo.out" } });
  tl.fromTo(".hero-text .label", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.1 })
    .fromTo(kopfWoerter, { yPercent: 112, y: 0 }, { yPercent: 0, y: 0, duration: 1.5, stagger: .075 }, "-=.85")
    .fromTo(".hero-unterzeile", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2 }, "-=1.05")
    .fromTo(".hero-unten .knopf", { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" }, "-=1")
    .fromTo(".hero-hinweis", { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.out" }, "-=.6");
  $$("[data-zeilen]").forEach(h => {
    const z = $$(".zeile > span", h);
    gsap.fromTo(z, { yPercent: 108, y: 0 }, { yPercent: 0, y: 0, duration: 1.35, ease: "expo.out", stagger: .1,
      scrollTrigger: { trigger: h, start: "top 88%", once: true } });
  });
  ScrollTrigger.batch("[data-auftritt]", {
    start: "top 90%", once: true,
    onEnter: els => {
      gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: .12, overwrite: true });
      els.forEach((el, i) => { const st = $$(".strich", el); if (st.length) gsap.to(st, { scaleX: 1, duration: 1.4, ease: "expo.out", delay: .3 + i * .12 }); });
    },
  });
  const zl = $(".zeit-linie span");
  if (zl) gsap.fromTo(zl, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".zeit", start: "top 92%", end: "top 48%", scrub: .8 } });
  const fm = $(".foto-maske");
  if (fm) {
    const st = { trigger: fm, start: "top 92%", end: "top 30%", scrub: .8 };
    gsap.fromTo($(".foto-vorhang", fm), { scaleY: 1 }, { scaleY: 0, ease: "power2.inOut", scrollTrigger: st });
    gsap.fromTo($("img", fm), { scale: 1.16 }, { scale: 1, ease: "none", scrollTrigger: { ...st } });
  }
  if (spur) {
    $$(".stimme", spur).forEach(li => { const k = li.cloneNode(true); k.setAttribute("aria-hidden", "true"); k.setAttribute("inert", ""); spur.appendChild(k); });
    laufband.addEventListener("pointerenter", () => { lauf.halt = true; });
    laufband.addEventListener("pointerleave", () => { lauf.halt = false; });
    laufband.addEventListener("focusin", () => { lauf.halt = true; });
    laufband.addEventListener("focusout", () => { lauf.halt = false; });
  }
  const laufMass = () => { if (spur) lauf.breite = spur.scrollWidth / 2; };
  const nav = $("#nav");
  let navY = 0;
  lenis.on("scroll", ({ scroll, direction }) => {
    if (scroll > 260 && direction > 0 && scroll - navY > 6) nav.classList.add("weg");
    else if (direction < 0 || scroll < 260) nav.classList.remove("weg");
    nav.classList.toggle("unterlegt", scroll > heroTop + heroLauf + 40);
    navY = scroll;
  });
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href");
    if (id === "#") { e.preventDefault(); return; }
    const ziel = id === "#top" ? hero : $(id); if (!ziel) return;
    e.preventDefault();
    lenis.scrollTo(id === "#top" ? 0 : ziel, { offset: id === "#top" ? 0 : -40, duration: 1.8, easing: k => -(Math.cos(Math.PI * k) - 1) / 2 });
    const fokus = id === "#inhalt" ? $(".hero-text h1") : ziel;
    if (fokus && id !== "#top") { if (!fokus.hasAttribute("tabindex")) fokus.setAttribute("tabindex", "-1"); fokus.focus({ preventScroll: true }); }
  });
  const magnete = [];
  if (feineMaus) $$(".magnet").forEach(el => {
    const m = { el, fx: { p: 0, v: 0 }, fy: { p: 0, v: 0 }, tx: 0, ty: 0, an: false };
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect();
      m.tx = (e.clientX - (r.left + r.width / 2) - m.fx.p) * .3; m.ty = (e.clientY - (r.top + r.height / 2) - m.fy.p) * .3; });
    el.addEventListener("pointerleave", () => { m.tx = 0; m.ty = 0; });
    magnete.push(m);
  });
  formular(gsap);
  const dokTop = el => el.getBoundingClientRect().top + scrollY;
  const lage = () => {
    for (const b of mausBaender) { const r = b.box.getBoundingClientRect(); b.top = r.top + scrollY; b.left = r.left; b.breite = r.width; b.hoehe = r.height; }
    if (haltung) { haltTop = dokTop(haltung); haltH = haltung.offsetHeight; }
    if (bogenFeld) { const yMax = Math.max(0, html.scrollHeight - H); bg.top = dokTop(bogenFeld);
      bg.yE = Math.min(yMax, bg.top - .22 * H); bg.yS = Math.min(bg.top - .95 * H, bg.yE - 240); }
  };
  const neu = () => { mass(); laufMass(); lage(); };
  addEventListener("resize", neu);
  if (window.ResizeObserver) new ResizeObserver(() => { mass(); lage(); }).observe(document.body);
  ScrollTrigger.addEventListener("refresh", neu);
  neu();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { neu(); ScrollTrigger.refresh(); });
  addEventListener("load", () => { neu(); ScrollTrigger.refresh(); });
  function formular(g) {
    const f = $("#formular"); if (!f) return;
    const felder = $(".formular-felder", f), danke = $(".danke", f);
    const pruefe = (input, fehler, ok) => { const gut = ok(input.value.trim()); fehler.hidden = gut; input.setAttribute("aria-invalid", gut ? "false" : "true"); return gut; };
    const name = $("#f-name"), mail = $("#f-email");
    const regeln = [[name, $("#fehler-name"), v => v.length > 0], [mail, $("#fehler-email"), v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)]];
    regeln.forEach(([i, fe, ok]) => i.addEventListener("input", () => { if (i.getAttribute("aria-invalid") === "true") pruefe(i, fe, ok); }));
    f.addEventListener("submit", e => {
      e.preventDefault();
      const ergebnis = regeln.map(r => pruefe(...r));
      const erster = regeln.find((r, i) => !ergebnis[i]);
      if (erster) { erster[0].focus(); return; }
      f.style.minHeight = f.offsetHeight + "px";
      const zeige = () => { felder.hidden = true; danke.hidden = false; $(".danke-titel", danke).focus({ preventScroll: true }); };
      if (g) {
        g.to(felder, { opacity: 0, y: -12, duration: .45, ease: "power2.in", onComplete: () => {
          zeige();
          g.fromTo(danke.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: .1 });
        } });
      } else zeige();
    });
  }
})();
