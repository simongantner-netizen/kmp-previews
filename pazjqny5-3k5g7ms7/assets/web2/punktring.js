
(() => {
  const html = document.documentElement;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const libs = !!(window.gsap && window.ScrollTrigger && window.Lenis);
  const bewegt = !ruhig && libs;
  if (!bewegt) html.classList.remove("bewegt");
  const feineMaus = matchMedia("(pointer: fine)").matches;
  const PI = Math.PI, TAU = PI * 2;
  const klemm = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sanft = k => { k = klemm(k); return k * k * (3 - 2 * k); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const misch = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
  const sanft5 = k => { k = Math.min(1, Math.max(0, k)); return k * k * k * (k * (k * 6 - 15) + 10); };
  const [o1, o2, u1, u2] = "#3A63FF,#5C86FF,#8FB0FF,#C9D9FF".split(",").map(hex);
  const flasche = (u, v, t) => {
    const g = .05 + .085 * Math.sin(u * 2.4 + t * 1.3) + .04 * Math.sin(u * 4.3 - t * .95 + 1.1) + u * .06 * Math.sin(t * .37);
    return misch(misch(o1, o2, sanft5((v + 1.1) / (g + 1.1))), misch(u1, u2, sanft5((v - g) / (1.1 - g))), sanft5((v - g + .5) / 1)); };
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const rgb = f => `rgb(${Math.round(f[0] * 255)},${Math.round(f[1] * 255)},${Math.round(f[2] * 255)})`;
  function zeichneAcht(x, d, o) {
    const { cx, cy, S, ax, ay, az = 0, fluss = 0, t = 0, alpha = 1, punkt = 1, na = 160, nb = 12, flach = 0, schutz = null, schutzStark = 0 } = o;
    if (alpha <= .005 || S <= 0) return null;
    const R = S / 1.2, rr = R * .15, fein = Math.min(1, R / (90 * d)), gross = Math.max(1, R / (380 * d)) * punkt;
    const cax = Math.cos(ax), sax = Math.sin(ax), cay = Math.cos(ay), say = Math.sin(ay), caz = Math.cos(az), saz = Math.sin(az);
    const tz = S * .22 * (1 - flach);
    const mitte = a => { const s2 = 1 + Math.sin(a) ** 2; return [S * Math.cos(a) / s2, S * Math.sin(a) * Math.cos(a) / s2, tz * Math.sin(a)]; };
    const pts = [];
    for (let i = 0; i < na; i++) {
      const a = i / na * TAU + fluss, c0 = mitte(a), c1 = mitte(a + .001);
      const T = norm([c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]]), N = norm([T[1], -T[0], 0]), B = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]];
      for (let j = 0; j < nb; j++) {
        const b = j / nb * TAU, cb = Math.cos(b) * rr, sb = Math.sin(b) * rr;
        const px = c0[0] + cb * N[0] + sb * B[0], py = c0[1] + cb * N[1] + sb * B[1], pz = c0[2] + cb * N[2] + sb * B[2];
        const y1 = py * cax - pz * sax, z1 = py * sax + pz * cax;
        const x2 = px * cay + z1 * say, z2 = -px * say + z1 * cay;
        const q = 3.4 * S / (3.4 * S - z2), x3 = x2 * caz - y1 * saz, y3 = x2 * saz + y1 * caz;
        pts.push([x3 * q, y3 * q, z2, q]);
      }
    }
    pts.sort((A, Bp) => A[2] - Bp[2]);
    let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
    for (const [px, py, pz, q] of pts) {
      const sx = cx + px, sy = cy + py, tiefe = Math.min(1, Math.max(0, (pz / (S * 1.1 + rr) + 1) / 2));
      const r = (1 + 1.6 * tiefe) * d * (.4 + .6 * fein) * q * gross;
      if (sx - r < bx0) bx0 = sx - r; if (sx + r > bx1) bx1 = sx + r; if (sy - r < by0) by0 = sy - r; if (sy + r > by1) by1 = sy + r;
      let f = 1;
      if (schutz && schutzStark > 0) { let w = 0; const weich = 34 * d;
        for (const z of schutz) { const innen = Math.min(sx - z[0], z[2] - sx, sy - z[1], z[3] - sy); if (innen > -weich) w = Math.max(w, klemm((innen + weich) / (2 * weich))); }
        f = 1 - schutzStark * w; }
      x.globalAlpha = (.15 + .85 * tiefe) * alpha * f;
      x.fillStyle = rgb(flasche(px / (S * .75), py / (S * .5), t));
      x.beginPath(); x.arc(sx, sy, r, 0, TAU); x.fill();
    }
    x.globalAlpha = 1;
    return [bx0, by0, bx1, by1];
  }
  const passe = c => { const d = Math.min(devicePixelRatio || 1, 2), w = Math.round(c.clientWidth * d), h = Math.round(c.clientHeight * d);
    if (w && h && (c.width !== w || c.height !== h)) { c.width = w; c.height = h; } return d; };
  function woerter(el, blau) {
    if (!el) return [];
    const maske = (inhalt, wort) => { const m = document.createElement("span"), i = document.createElement("span");
      m.className = "wm"; i.className = "wi"; if (blau && wort && blau.test(wort)) i.classList.add("blau"); i.append(inhalt); m.append(i); return m; };
    const gehe = knoten => { for (const k of [...knoten.childNodes]) {
      if (k.nodeType === 3) { const frag = document.createDocumentFragment();
        k.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) frag.append(" "); else frag.append(maske(w, w)); });
        k.replaceWith(frag); }
      else if (k.nodeType === 1 && !k.classList.contains("wm")) { if (k.hasAttribute("data-mark")) { const platz = document.createElement("span"); k.replaceWith(platz); platz.replaceWith(maske(k, k.textContent)); } else gehe(k); } } };
    gehe(el); return $$(".wi", el);
  }
  woerter($(".hero .h1"));
  woerter($(".haltung"), /^Freude/);
  const Spur = (() => {
    const c = $(".spur"); if (!c) return null;
    const x = c.getContext("2d");
    const HELL = [.93, .96, 1];
    const PLAN = [[0, PI - .6], [.08, PI], [.30, PI], [.44, 1.5 * PI], [.62, 1.5 * PI], [.78, TAU], [.94, TAU], [1, TAU + .28]];
    const kopf = p => { for (let i = 0; i < PLAN.length - 1; i++) { const [p0, a0] = PLAN[i], [p1, a1] = PLAN[i + 1];
      if (p <= p1) return a0 + (a1 - a0) * sanft((p - p0) / (p1 - p0)); } return PLAN[PLAN.length - 1][1]; };
    const zustand = { p: 0, fluss: 0, schub: 0, t: 0 };
    function male(ganz) {
      const d = passe(c), W = c.width, H = c.height; if (!W || !H) return;
      const { p, fluss, schub, t } = zustand;
      x.clearRect(0, 0, W, H);
      const S = ganz ? Math.min(W * .4, (H * .5 - 22 * d) / .56) : Math.min(W * .66, (H * .5 - 30 * d) / .56);
      const R = S / 1.2, rr = R * .15;
      const ax = ganz ? .3 : .3 + .05 * Math.sin(t * .19), ay = ganz ? 0 : -.17 + .34 * p;
      const cax = Math.cos(ax), sax = Math.sin(ax), cay = Math.cos(ay), say = Math.sin(ay);
      const mitte = a => { const s2 = 1 + Math.sin(a) ** 2; return [S * Math.cos(a) / s2, S * Math.sin(a) * Math.cos(a) / s2, S * .22 * Math.sin(a)]; };
      const proj = (px, py, pz) => {
        const y1 = py * cax - pz * sax, z1 = py * sax + pz * cax;
        const x2 = px * cay + z1 * say, z2 = -px * say + z1 * cay;
        const q = 3.4 * S / (3.4 * S - z2); return [x2 * q, y1 * q, z2, q]; };
      const aH = ganz ? -9 : kopf(p);
      let cx = W / 2; const cy = H / 2;
      if (!ganz) { const ac = klemm(aH, PI, TAU), m = mitte(ac), pm = proj(m[0], m[1], m[2]); cx = W * (.64 + .14 * sanft((ac - PI) / PI)) - pm[0] * pm[3]; }
      const aus = sx => ganz ? 1 : sanft((sx / W - .33) / .22);
      const fein = Math.min(1, R / (90 * d)), na = ganz ? 150 : 196, nb = ganz ? 12 : 13;
      const gross = Math.max(1, R / (380 * d)) * 1.3, schwanz = .95 + .7 * schub;
      const pts = [];
      for (let i = 0; i < na; i++) {
        const a = i / na * TAU + fluss, c0 = mitte(a), c1 = mitte(a + .001);
        const T = norm([c1[0] - c0[0], c1[1] - c0[1], c1[2] - c0[2]]), N = norm([T[1], -T[0], 0]), B = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]];
        let k = 0;
        if (!ganz) { const dd = ((aH - a) % TAU + TAU * 1.5) % TAU - PI; k = dd >= 0 ? (dd < schwanz ? (1 - dd / schwanz) ** 1.8 : 0) : (dd > -.08 ? 1 + dd / .08 : 0); }
        for (let j = 0; j < nb; j++) { const b = j / nb * TAU, cb = Math.cos(b) * rr, sb = Math.sin(b) * rr;
          const q = proj(c0[0] + cb * N[0] + sb * B[0], c0[1] + cb * N[1] + sb * B[1], c0[2] + cb * N[2] + sb * B[2]);
          pts.push([q[0] * q[3], q[1] * q[3], q[2], q[3], k]); }
      }
      pts.sort((A, Bp) => A[2] - Bp[2]);
      for (const [px, py, pz, q, k] of pts) {
        const sx = cx + px, sy = cy + py; if (sx < -20 || sx > W + 20) continue;
        const f = aus(sx); if (f <= .01) continue;
        const tiefe = Math.min(1, Math.max(0, (pz / (S * 1.1 + rr) + 1) / 2));
        let farbe = flasche(px / (S * .75), py / (S * .5), t);
        if (k > 0) farbe = misch(farbe, HELL, k * .56);
        const kk = k * .66;
        x.globalAlpha = ((.15 + .85 * tiefe) * (1 - kk) + kk) * f;
        x.fillStyle = rgb(farbe);
        x.beginPath(); x.arc(sx, sy, (1 + 1.6 * tiefe) * d * (.4 + .6 * fein) * q * gross * (1 + .36 * k), 0, TAU); x.fill();
      }
      if (!ganz) { const m = mitte(aH), pm = proj(m[0], m[1], m[2]), hx = cx + pm[0] * pm[3], hy = cy + pm[1] * pm[3], r = (90 + 50 * schub) * d;
        const g = x.createRadialGradient(hx, hy, 0, hx, hy, r); g.addColorStop(0, `rgba(201,217,255,${.13 + .08 * schub})`); g.addColorStop(1, "rgba(201,217,255,0)");
        x.globalCompositeOperation = "lighter"; x.globalAlpha = aus(hx); x.fillStyle = g; x.beginPath(); x.arc(hx, hy, r, 0, TAU); x.fill(); x.globalCompositeOperation = "source-over"; }
      x.globalAlpha = 1;
    }
    return { zustand, male, kopf };
  })();
  const buehne = $(".auftakt-buehne"), leinwand = $(".auftakt-acht"), lx = leinwand && leinwand.getContext("2d");
  const heroLage = (W, H, d) => { const S = Math.min(W * .29, (H * .4 - 18 * d) / .7); return { cx: W * .7, cy: H * .4, S }; };
  const satzLage = (W, H, d) => ({ cx: W * .5, cy: H * .5, S: (H * .5 - 26 * d) / .55 });
  const raender = $$("canvas[data-acht-rand]").map((c, i) => ({ c, x: c.getContext("2d"), rechts: c.dataset.achtRand === "rechts", sicht: false, p: .5, v: 0, ziel: .5, fluss: i * 2.1 }));
  function maleRand(r, ein, t, schub, richtung) {
    const d = passe(r.c), W = r.c.width, H = r.c.height; if (!W || !H) return;
    r.x.clearRect(0, 0, W, H);
    const S = Math.min((H * .5 - 22 * d) / .7, (W - 30 * d) / 1.56), innen = S * .37;
    const seite = r.rechts ? 1 : -1, weg = (1 - ein) * S * .6;
    const cx = r.rechts ? W - innen + weg : innen - weg;
    zeichneAcht(r.x, d, { cx, cy: H / 2, S, ax: .34 + .14 * Math.sin(t * .19 + r.fluss), ay: seite * (r.p - .5) * 1.7 + seite * schub * .28 * richtung,
      az: .1 * Math.sin(t * .13 + r.fluss), fluss: r.fluss, t, punkt: 1.2, na: 150, nb: 12, alpha: .35 + .65 * ein });
  }
  if (!bewegt) {
    const zeichne = () => {
      if (Spur) Spur.male(true);
      if (leinwand) { const d = passe(leinwand), W = leinwand.width, H = leinwand.height; lx.clearRect(0, 0, W, H);
        const L = heroLage(W, H, d); zeichneAcht(lx, d, { ...L, ax: .36, ay: -.25, az: .06, t: 2, punkt: 1.3 }); }
      raender.forEach(r => maleRand(r, 1, 2, 0, 1));
    };
    zeichne(); addEventListener("resize", zeichne); document.fonts && document.fonts.ready.then(zeichne);
    initFormular(); html.classList.add("bereit");
    const nav = document.getElementById("nav"); addEventListener("scroll", () => nav.classList.toggle("belegt", scrollY > 30), { passive: true });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false });
  let tempo = 0, richtung = 1;
  const nav = document.getElementById("nav");
  let navZu = false;
  lenis.on("scroll", e => {
    ScrollTrigger.update(); tempo = e.velocity || 0; if (e.direction) richtung = e.direction;
    const y = e.scroll ?? e.animatedScroll ?? scrollY;
    nav.classList.toggle("belegt", y > 30);
    const zu = y > 240 && richtung > 0 && !nav.contains(document.activeElement);
    if (zu !== navZu) { navZu = zu; nav.classList.toggle("weg", zu); }
  });
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  nav.addEventListener("focusin", () => { navZu = false; nav.classList.remove("weg"); });
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href"); e.preventDefault(); if (id === "#") return;
    const ziel = id === "#top" ? 0 : document.querySelector(id); if (ziel === null) return;
    const rand = ziel === 0 ? 0 : -(parseFloat(getComputedStyle(ziel).scrollMarginTop) || 0);
    lenis.scrollTo(ziel, { offset: rand, duration: 1.8, easing: t => -(Math.cos(PI * t) - 1) / 2,
      onComplete: () => { if (ziel && ziel.focus) { if (!ziel.hasAttribute("tabindex")) ziel.setAttribute("tabindex", "-1"); ziel.focus({ preventScroll: true }); } } });
  });
  const auftakt = $(".auftakt"), h1Woerter = $$(".hero .h1 .wi"), satzWoerter = $$(".haltung .wi");
  const heroKopf = $(".hero-kopf"), heroUnten = $(".hero-unten"), hinweis = $(".hero-hinweis"), warumLabel = $(".warum-label");
  const A = { ziel: 0, p: 0, v: 0, ein: 0, hinweis: 0, sicht: true, box: null, schutz: [], fluss: 0 };
  const einW = h1Woerter.map(() => ({ v: 0 }));
  ScrollTrigger.create({ trigger: auftakt, start: "top top", end: "bottom bottom", onUpdate: s => { A.ziel = s.progress; } });
  new IntersectionObserver(es => es.forEach(e => { A.sicht = e.isIntersecting; }), { rootMargin: "60px" }).observe(auftakt);
  const ein = gsap.timeline({ defaults: { ease: "expo.out" } });
  ein.to(A, { ein: 1, duration: 2.8, ease: "power3.out" }, 0)
    .fromTo(".nav [data-ein]", { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 1.2, stagger: .07 }, .2)
    .fromTo(".hero .label", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 1.2 }, .4)
    .to(einW, { v: 1, duration: 1.5, stagger: .075 }, .5)
    .fromTo(".hero-unterzeile", { autoAlpha: 0, y: 10, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.6, clearProps: "filter" }, 1.05)
    .fromTo(".hero .knopf", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.3 }, 1.25)
    .to(A, { hinweis: 1, duration: 1.2, ease: "power2.out" }, 1.8);
  const misseSchutz = () => {
    if (!leinwand) return; const d = Math.min(devicePixelRatio || 1, 2), r0 = leinwand.getBoundingClientRect();
    A.schutz = [...$$(".hero .h1 .wm"), $(".hero-unterzeile")].filter(Boolean).map(el => { const r = el.getBoundingClientRect();
      return [(r.left - r0.left - 10) * d, (r.top - r0.top) * d, (r.right - r0.left + 10) * d, (r.bottom - r0.top) * d]; });
  };
  addEventListener("resize", misseSchutz); document.fonts && document.fonts.ready.then(() => { misseSchutz(); ScrollTrigger.refresh(); }); misseSchutz();
  const Z = { zieht: false, ox: 0, oy: 0, vx: 0, vy: 0, los: -1e9, zx: null, zy: null, px: 0, py: 0, pt: 0, mx: 0, my: 0, smx: 0, smy: 0 };
  const SPANN = .0068;
  const ueberAcht = e => {
    if (!A.box || A.p > .08) return false;
    if (e.target.closest && e.target.closest(".wm, p, a, button, input, textarea, nav")) return false;
    const r = leinwand.getBoundingClientRect(), d = leinwand.width / (r.width || 1), x = (e.clientX - r.left) * d, y = (e.clientY - r.top) * d, b = A.box;
    return x > b[0] && x < b[2] && y > b[1] && y < b[3];
  };
  if (feineMaus && buehne) {
    buehne.addEventListener("pointerdown", e => {
      if (e.button !== 0 || !ueberAcht(e)) return;
      e.preventDefault(); Z.zieht = true; Z.zx = Z.zy = null; Z.px = e.clientX; Z.py = e.clientY; Z.pt = performance.now(); Z.vx = Z.vy = 0;
      buehne.setPointerCapture(e.pointerId); buehne.classList.add("zieht");
    });
    buehne.addEventListener("pointermove", e => {
      if (Z.zieht) {
        const jetzt = performance.now(), dt = Math.max(.008, (jetzt - Z.pt) / 1000), dx = (e.clientX - Z.px) * SPANN, dy = (e.clientY - Z.py) * SPANN;
        Z.oy += dx; Z.ox += dy; Z.vy = lerp(Z.vy, dx / dt, .55); Z.vx = lerp(Z.vx, dy / dt, .55);
        Z.px = e.clientX; Z.py = e.clientY; Z.pt = jetzt;
      } else buehne.classList.toggle("greifbar", ueberAcht(e));
    });
    const loslassen = () => { if (!Z.zieht) return; Z.zieht = false; Z.los = performance.now();
      if (performance.now() - Z.pt > 90) { Z.vx = 0; Z.vy = 0; }
      buehne.classList.remove("zieht"); };
    buehne.addEventListener("pointerup", loslassen); buehne.addEventListener("pointercancel", loslassen);
    buehne.addEventListener("pointerleave", () => { if (!Z.zieht) buehne.classList.remove("greifbar"); });
    addEventListener("pointermove", e => { Z.mx = e.clientX / innerWidth - .5; Z.my = e.clientY / innerHeight - .5; }, { passive: true });
  }
  const fuehre = dt => {
    Z.smx += (Z.mx - Z.smx) * (1 - Math.exp(-dt * 2.2)); Z.smy += (Z.my - Z.smy) * (1 - Math.exp(-dt * 2.2));
    if (Z.zieht) return;
    const tau = (performance.now() - Z.los) / 1000, reib = Math.exp(-dt * 1.5);
    Z.vx *= reib; Z.vy *= reib;
    const k = 6 * sanft((tau - .7) / 1.6);
    if (k > 0) {
      if (Z.zx === null) { Z.zx = Math.round(Z.ox / TAU) * TAU; Z.zy = Math.round(Z.oy / TAU) * TAU; }
      const c = 2 * Math.sqrt(k);
      Z.vx += (-k * (Z.ox - Z.zx) - c * Z.vx) * dt; Z.vy += (-k * (Z.oy - Z.zy) - c * Z.vy) * dt;
    }
    Z.ox += Z.vx * dt; Z.oy += Z.vy * dt;
  };
  const maleAuftakt = (t, schub) => {
    const d = passe(leinwand), W = leinwand.width, H = leinwand.height; if (!W || !H) return;
    lx.clearRect(0, 0, W, H);
    const p = klemm(A.p), m = sanft((p - .04) / .5), hL = heroLage(W, H, d), sL = satzLage(W, H, d);
    const eAx = .36 + Math.sin(t * .19) * .34, eAy = Math.sin(t * .23) * .56, eAz = Math.sin(t * .13) * .22;
    const hand = 1 - m, blick = (1 - m) * (Z.zieht ? 0 : 1);
    const ax = lerp(eAx + Z.ox * hand + Z.smy * .16 * blick, .1, m);
    const ay = lerp(eAy + Z.oy * hand + Z.smx * .26 * blick, 0, m) + schub * .22 * richtung * (1 - m);
    const az = lerp(eAz, .02 * Math.sin(t * .4), m);
    const ein = A.ein, S = lerp(hL.S, sL.S, m) * (.86 + .14 * ein);
    A.box = zeichneAcht(lx, d, { cx: lerp(hL.cx, sL.cx, m), cy: lerp(hL.cy, sL.cy, m), S, ax, ay, az, fluss: A.fluss, t,
      alpha: ein * lerp(1, .34, sanft((p - .16) / .36)), punkt: 1.3, na: 170, nb: 12, flach: m * .75,
      schutz: A.schutz, schutzStark: .55 * (1 - sanft(p / .1)) });
    leinwand.style.cursor = "";
  };
  const stelleText = p => {
    h1Woerter.forEach((w, i) => { const aus = sanft((p - .025 - i * .011) / .15);
      w.style.transform = `translate3d(0,${((1 - einW[i].v) * 140 - aus * 140).toFixed(2)}%,0)`; });
    const kA = sanft(p / .09), uA = sanft(p / .11);
    heroKopf.style.opacity = (1 - kA).toFixed(3);
    heroUnten.style.opacity = (1 - uA).toFixed(3); heroUnten.style.transform = `translate3d(0,${(-36 * uA).toFixed(1)}px,0)`;
    heroUnten.style.visibility = uA > .99 ? "hidden" : "";
    hinweis.style.opacity = (A.hinweis * (1 - sanft(p / .05))).toFixed(3);
    const lb = sanft((p - .3) / .08); warumLabel.style.opacity = lb.toFixed(3); warumLabel.style.transform = `translate3d(0,${(14 * (1 - lb)).toFixed(1)}px,0)`;
    const n = satzWoerter.length;
    satzWoerter.forEach((w, i) => { const e = sanft((p - .34 - i * (.46 / n)) / .1);
      w.style.transform = `translate3d(0,${((1 - e) * 140).toFixed(2)}%,0)`; });
  };
  hinweis.style.opacity = "0";
  ScrollTrigger.batch("[data-auftritt]", { start: "top 89%", once: true,
    onEnter: els => gsap.fromTo(els, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: "expo.out", stagger: .09, overwrite: true }) });
  $$("[data-zeilen]").forEach(hd => gsap.fromTo(hd.querySelectorAll(".zeile > span"), { y: 0, yPercent: 140 },
    { y: 0, yPercent: 0, duration: 1.4, ease: "expo.out", stagger: .11, scrollTrigger: { trigger: hd, start: "top 88%", once: true } }));
  $$(".punktlinie").forEach(el => gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0% 0 0)", duration: 2, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 92%", once: true } }));
  gsap.timeline({ scrollTrigger: { trigger: ".portraet", start: "top 92%", end: "center 52%", scrub: .8 } })
    .fromTo(".portraet-maske", { clipPath: "inset(12% 9% 12% 9% round 3px)" }, { clipPath: "inset(0% 0% 0% 0% round 3px)", ease: "none" }, 0)
    .fromTo(".portraet-maske img", { scale: 1.24 }, { scale: 1, ease: "none" }, 0);
  const zeitTl = gsap.timeline({ scrollTrigger: { trigger: ".zeit", start: "top 86%", end: "top 42%", scrub: .8 } });
  zeitTl.fromTo(".zeit-linie i", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
  $$(".zeit-punkt").forEach((li, i) => zeitTl.fromTo(li, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .16, ease: "power2.out" }, i * .19));
  $$("[data-buchstaben]").forEach(el => {
    el.setAttribute("aria-label", el.textContent);
    el.innerHTML = [...el.textContent].map(ch => ch === " " ? " " : `<span class="zeichen-m" aria-hidden="true"><span class="zeichen-z">${ch}</span></span>`).join("");
    const z = el.querySelectorAll(".zeichen-z"); gsap.set(z, { yPercent: 112 });
    gsap.to(z, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: .035, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
  });
  const gruppe = $(".stimmen-gruppe");
  if (gruppe) { const k = gruppe.cloneNode(true); k.setAttribute("aria-hidden", "true"); k.setAttribute("inert", ""); gruppe.parentNode.appendChild(k); }
  const ansatz = $(".ansatz");
  const panels = $$(".pf").map(li => ({ nr: $(".pf-nr", li), zeilen: $$(".zeile > span", li), text: $(".pf-text", li) }));
  const FENSTER = [[0, .07, .31, .36], [.40, .47, .63, .68], [.74, .81, 9, 9]];
  const kopfZeilen = $$(".buehne-kopf .zeile > span"), kopfLabel = $(".buehne-kopf .label");
  gsap.set(kopfZeilen, { y: 0, yPercent: 140 }); gsap.set(kopfLabel, { autoAlpha: 0 });
  ScrollTrigger.create({ trigger: ansatz, start: "top 70%", once: true, onEnter: () => {
    gsap.to(kopfLabel, { autoAlpha: 1, duration: 1.2, ease: "expo.out" });
    gsap.to(kopfZeilen, { yPercent: 0, duration: 1.4, ease: "expo.out", stagger: .11 }); } });
  let ziel = 0, buehneSichtbar = false;
  ScrollTrigger.create({ trigger: ansatz, start: "top top", end: "bottom bottom", onUpdate: s => { ziel = s.progress; } });
  new IntersectionObserver(es => es.forEach(e => { buehneSichtbar = e.isIntersecting; }), { rootMargin: "100px" }).observe(ansatz);
  const stelle = p => panels.forEach((pn, i) => {
    const [e0, e1, a0, a1] = FENSTER[i], o = sanft((p - a0) / (a1 - a0));
    pn.zeilen.forEach((z, j) => { const e = sanft((p - e0 - j * .014) / (e1 - e0)); z.style.transform = `translate3d(0,${((1 - e) * 140 - o * 140).toFixed(2)}%,0)`; });
    const e = sanft((p - e0 - .01) / (e1 - e0)), sicht = e * (1 - o);
    pn.text.style.opacity = sicht.toFixed(3); pn.text.style.transform = `translate3d(0,${((1 - e) * 26 - o * 18).toFixed(1)}px,0)`;
    pn.nr.style.opacity = sicht.toFixed(3);
  });
  raender.forEach(r => {
    ScrollTrigger.create({ trigger: r.c.parentNode, start: "top bottom", end: "bottom top", onUpdate: s => { r.ziel = s.progress; } });
    new IntersectionObserver(es => es.forEach(e => { r.sicht = e.isIntersecting; }), { rootMargin: "80px" }).observe(r.c);
  });
  const band = $(".band-spur"), bandGruppe = $(".band-gruppe");
  let bandX = 0, bandBreite = 0, bandSichtbar = false;
  const misse = () => { bandBreite = bandGruppe ? bandGruppe.getBoundingClientRect().width : 0; };
  misse(); addEventListener("resize", misse); document.fonts && document.fonts.ready.then(() => { misse(); ScrollTrigger.refresh(); });
  if (band) new IntersectionObserver(es => es.forEach(e => { bandSichtbar = e.isIntersecting; }), { rootMargin: "200px" }).observe(band);
  const feder = (z, soll, k, dt) => { const c = 2 * Math.sqrt(k); z.v += (k * (soll - z.p) - c * z.v) * dt; z.p += z.v * dt; };
  const spurF = { p: 0, v: 0 };
  let schub = 0, vorher = performance.now();
  gsap.ticker.add(() => {
    const jetzt = performance.now(), dt = Math.min(.05, (jetzt - vorher) / 1000), t = jetzt / 1000; vorher = jetzt;
    const soll = Math.min(1, Math.abs(tempo) / 32); schub += (soll - schub) * (1 - Math.exp(-dt * (soll > schub ? 9 : 2.6)));
    tempo *= Math.exp(-dt * 6);
    if (band && bandSichtbar && bandBreite) { bandX -= richtung * (42 + 720 * schub) * dt; if (bandX <= -bandBreite) bandX += bandBreite; if (bandX > 0) bandX -= bandBreite;
      band.style.transform = `translate3d(${bandX.toFixed(2)}px,0,0)`; }
    const AF = { p: A.p, v: A.v }; feder(AF, A.ziel, 110, dt); A.p = AF.p; A.v = AF.v;
    if (Math.abs(A.p - A.ziel) < 1e-5 && Math.abs(A.v) < 1e-5) { A.p = A.ziel; A.v = 0; }
    fuehre(dt); A.fluss += dt * (.08 + 1.15 * schub);
    if (A.sicht && leinwand) { maleAuftakt(t, schub); stelleText(A.p); }
    feder(spurF, ziel, 95, dt);
    if (Spur) { const z = Spur.zustand; z.fluss += dt * (.08 + 1.15 * schub); z.schub = schub; z.t = t; z.p = klemm(spurF.p); }
    if (buehneSichtbar && Spur) { Spur.male(false); stelle(spurF.p); }
    for (const r of raender) { feder(r, r.ziel, 60, dt); r.fluss += dt * (.06 + 1.0 * schub);
      if (r.sicht) maleRand(r, sanft(klemm(r.p) / .42), t, schub, richtung); }
  });
  if (feineMaus) $$(".magnet").forEach(el => {
    const kx = gsap.quickTo(el, "x", { duration: .7, ease: "power3.out" }), ky = gsap.quickTo(el, "y", { duration: .7, ease: "power3.out" });
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); kx((e.clientX - r.left - r.width / 2) * .28); ky((e.clientY - r.top - r.height / 2) * .4); });
    el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 1.2, ease: "elastic.out(1, .4)", overwrite: true }));
  });
  initFormular();
  html.classList.add("bereit");
  function initFormular() {
    const f = $(".formular"); if (!f) return;
    const name = $("#f-name", f), mail = $("#f-mail", f), danke = $(".danke", f);
    const fehler = (feld, text) => { const p = document.getElementById(feld.id + "-fehler"); p.textContent = text; feld.setAttribute("aria-invalid", text ? "true" : "false"); };
    [name, mail].forEach(el => el.addEventListener("input", () => fehler(el, "")));
    f.addEventListener("submit", e => {
      e.preventDefault();
      const nOk = name.value.trim().length > 0, mOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim());
      fehler(name, nOk ? "" : "Hier fehlt noch dein Name."); fehler(mail, mOk ? "" : "Diese Adresse sieht noch nicht vollständig aus.");
      if (!nOk) { name.focus(); return; } if (!mOk) { mail.focus(); return; }
      f.classList.add("gesendet"); danke.hidden = false; danke.setAttribute("tabindex", "-1"); danke.focus({ preventScroll: true });
      if (window.gsap && !ruhig) gsap.fromTo(danke.children, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: .1, delay: .25 });
    });
  }
})();
