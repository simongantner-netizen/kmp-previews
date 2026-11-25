
(() => {
  const html = document.documentElement, $ = (s, w = document) => w.querySelector(s), $$ = (s, w = document) => [...w.querySelectorAll(s)];
  const bewegt = html.classList.contains("bewegt") && window.gsap && window.ScrollTrigger && window.Lenis;
  const feinZeiger = matchMedia("(pointer: fine)").matches;
  const klemm = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const sanft = k => { k = klemm(k); return k * k * k * (k * (k * 6 - 15) + 10); };
  const aus3 = k => 1 - Math.pow(1 - klemm(k), 3);
  const zurueck = k => { k = klemm(k); const c = 1.35, u = k - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
  const strecke = (p, a, b) => klemm((p - a) / (b - a));
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const misch = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const rgb = c => Math.round(c[0] * 255) + "," + Math.round(c[1] * 255) + "," + Math.round(c[2] * 255);
  const NAVY = hex("#19283E"), TAUBE = hex("#7D8CA2");
  const FL = ["#19283E", "#2B3D5C", "#7D8CA2", "#A9B7C9"].map(hex);
  const flasche = (u, v, t) => { const g = .05 + .085 * Math.sin(u * 2.4 + t * 1.3) + .04 * Math.sin(u * 4.3 - t * .95 + 1.1) + u * .06 * Math.sin(t * .37);
    return misch(misch(FL[0], FL[1], sanft((v + 1.1) / (g + 1.1))), misch(FL[2], FL[3], sanft((v - g) / (1.1 - g))), sanft(v - g + .5)); };
  const zeiger = { x: -1e4, y: -1e4, da: false };
  addEventListener("pointermove", e => { zeiger.x = e.clientX; zeiger.y = e.clientY; zeiger.da = true; }, { passive: true });
  html.addEventListener("pointerleave", () => { zeiger.da = false; });
  if (window.Einsatz && Einsatz.lockups) Einsatz.lockups();
  const form = $("#formular");
  if (form) {
    const pruefen = (feld, ok, text) => { const box = feld.closest(".feld"), f = box.querySelector(".fehler");
      box.classList.toggle("falsch", !ok); feld.setAttribute("aria-invalid", ok ? "false" : "true"); f.textContent = ok ? "" : text; return ok; };
    const name = $("#f-name"), mail = $("#f-mail");
    form.addEventListener("submit", e => { e.preventDefault();
      const a = pruefen(name, name.value.trim().length > 0, "Hier fehlt noch dein Name.");
      const b = pruefen(mail, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim()), "Diese Adresse sieht noch nicht vollständig aus.");
      if (!a) { name.focus(); return; } if (!b) { mail.focus(); return; }
      const danke = $(".danke", form); danke.hidden = false; danke.tabIndex = -1; form.classList.add("gesendet");
      setTimeout(() => danke.focus({ preventScroll: true }), 650); });
    [name, mail].forEach(f => f.addEventListener("input", () => { if (f.closest(".feld").classList.contains("falsch")) { f.closest(".feld").classList.remove("falsch"); f.setAttribute("aria-invalid", "false"); f.closest(".feld").querySelector(".fehler").textContent = ""; } }));
  }
  $$("a[data-tot]").forEach(a => a.addEventListener("click", e => e.preventDefault()));
  const N = 26, S0 = .14, S1 = 2, S2 = 3.3;
  const leinwand = $(".buehne-leinwand"), lx = leinwand && leinwand.getContext("2d");
  const lift = new Float32Array(N), ring = { mx: 0, my: 0, mk: 0 };
  let LW = 0, LH = 0, ld = 1, einStart = -1, textRechts = 0;
  const maleBuehne = (p, t, ein, v, dt) => {
    if (!lx) return;
    const d = Math.min(2, devicePixelRatio || 1), W = LW, H = LH; if (!W || !H) return;
    if (leinwand.width !== Math.round(W * d) || leinwand.height !== Math.round(H * d) || ld !== d) { leinwand.width = Math.round(W * d); leinwand.height = Math.round(H * d); ld = d; }
    lx.setTransform(d, 0, 0, d, 0, 0); lx.clearRect(0, 0, W, H);
    const k = sanft(strecke(p, .2, .58)), x = sanft(strecke(p, .86, 1));
    if (x >= 1) return;
    const morph = strecke(p, .02, .3), va = Math.abs(v);
    const R = S0 * Math.pow(S1 / S0, k) * Math.pow(S2 / S1, x) * .5 * H, cx = W / 2, cy = H / 2, dreh = -1.1 * (1 - k);
    const atem = 1 + .02 * Math.sin(t * .8), welle = (t * .12) % 1;
    { const mx = (zeiger.x - cx) / R, my = -(zeiger.y - cy) / R, m = Math.hypot(mx, my) || 1;
      let zx = mx / m, zy = my / m, ziel = zeiger.da ? klemm((2.6 - m) / 1.4) : 0;
      if (va > .03) { zx = 0; zy = v > 0 ? -1 : 1; ziel = Math.min(1, va * 1.15); }
      ring.mx += (zx - ring.mx) * .14; ring.my += (zy - ring.my) * .14; ring.mk += (ziel - ring.mk) * .08; }
    const oben = H * .14, unten = H * .985, sp = (unten - oben) / N, bwE = sp * .64, Lmax = Math.min(W * .32, H * .7);
    const schwung = H * .006 * Math.sin(t * .45), mitte = .5 + .08 * Math.sin(t * .42);
    const naheX = zeiger.da ? klemm((zeiger.x - (W - Lmax * 1.45)) / (Lmax * .35)) : 0, fe = 1 - Math.exp(-dt / .16);
    lx.globalAlpha = 1 - x; lx.lineCap = "round";
    for (let i = 0; i < N; i++) {
      const u = (i + .5) / N, y = oben + (i + .5) * sp + schwung;
      const e = ein === Infinity ? 1 : zurueck((ein - Math.abs(u - .5) * .55) / 1.15);
      lift[i] += ((naheX * Math.exp(-(((zeiger.y - y) / (H * .085)) ** 2))) - lift[i]) * fe;
      const buckel = Math.exp(-(((u - mitte) / .36) ** 2));
      let f = .2 + .62 * buckel + .16 * Math.sin(i * .55 - t * .95) + .06 * Math.sin(i * .21 + t * .4);
      f = klemm(f + .38 * lift[i] + .3 * va * buckel, .14, 1.4);
      let len = Lmax * f * e; const frei = Math.max(Lmax * .45, W - textRechts - 56), g0 = frei * .78;
      if (len > g0) len = g0 + (frei - g0) * (1 - Math.exp(-(len - g0) / (frei - g0)));
      const mi = sanft(strecke(morph, Math.abs(u - .5) * .6, Math.abs(u - .5) * .6 + .7));
      if (len < .5 && mi <= 0) continue;
      const a = (12.5 - i) * 2 * Math.PI / N + dreh, nx = Math.cos(a), ny = Math.sin(a);
      const sI = ((12.5 - i) / N + 1) % 1, ds = ((sI - welle) % 1 + 1.5) % 1 - .5, stoss = Math.exp(-((ds / .1) ** 2));
      const zug = ring.mk * Math.max(0, nx * ring.mx + ny * ring.my) ** 2.5, hell = .96 + .04 * Math.max(stoss, zug);
      const ra = .8 + .2 * Math.min(2.15, 1 + .45 * stoss + zug) * atem, ri = .6;
      const Ax = cx + nx * ra * R, Ay = cy - ny * ra * R, Ix = cx + nx * ri * R, Iy = cy - ny * ri * R;
      const L = (p0, p1) => p0 + (p1 - p0) * mi;
      const S = [L(W + bwE, Ax), L(y, Ay)], G = [L(W, Ax), L(y, Ay)], T = [L(W - len, Ix), L(y, Iy)];
      if (Math.hypot(T[0] - G[0], T[1] - G[1]) < .5) continue;
      const gr = lx.createLinearGradient(G[0], G[1], T[0], T[1]);
      const fa = mi > 0 ? flasche(nx * ra, -ny * ra, t) : null, fi = mi > 0 ? flasche(nx * ri, -ny * ri, t) : null;
      for (let s = 0; s <= 10; s++) { const q = s / 10;
        let c = misch(NAVY, TAUBE, q), al = 1 - .33 * q;
        if (mi > 0) { const ee = sanft(Math.min(1, (1 - q) / .92));
          c = misch(c, misch(fi, fa, ee), mi); al += (hell * ee ** 1.1 - al) * mi; }
        gr.addColorStop(q, `rgba(${rgb(c)},${al.toFixed(3)})`); }
      lx.strokeStyle = gr; lx.lineWidth = bwE + (.13 * R - bwE) * mi;
      lx.beginPath(); lx.moveTo(S[0], S[1]); lx.lineTo(T[0], T[1]); lx.stroke();
    }
    lx.globalAlpha = 1;
  };
  const kanten = $$("canvas[data-vi-kante]").map(c => ({ c, x: c.getContext("2d"), abstand: +c.dataset.abstand || 29, ab: +c.dataset.ab || 0,
    links: c.dataset.seite !== "rechts", zug: 0, g: bewegt ? 0 : 1, top: 0, left: 0, w: 0, h: 0 }));
  const messeKanten = () => kanten.forEach(k => { const r = k.c.getBoundingClientRect(); k.top = r.top + scrollY; k.left = r.left; k.w = k.c.clientWidth; k.h = k.c.clientHeight; });
  const maleKante = (k, t, v, dt) => {
    const d = Math.min(2, devicePixelRatio || 1), W = k.w, H = k.h; if (!W || !H) return;
    if (k.c.width !== Math.round(W * d) || k.c.height !== Math.round(H * d)) { k.c.width = Math.round(W * d); k.c.height = Math.round(H * d); }
    const x = k.x; x.setTransform(d, 0, 0, d, 0, 0); x.clearRect(0, 0, W, H);
    const oben = k.top - scrollY, nah = zeiger.da && zeiger.y > oben - 60 && zeiger.y < oben + H + 60 && zeiger.x > k.left - 60 && zeiger.x < k.left + W + 60;
    k.zug += ((nah ? 1 : 0) - k.zug) * (1 - Math.exp(-dt / .2)); const mx = zeiger.x - k.left;
    const n = Math.max(8, Math.round(W / k.abstand)), sp = W / n, bw = Math.max(2, Math.min(sp * .56, H * .2)), va = Math.abs(v);
    x.lineCap = "round";
    for (let i = 0; i < n; i++) { const bx = (i + .5) * sp, j = k.links ? i : n - 1 - i;
      let f = .58 + .2 * Math.sin(j * .5 - t * .8 + .72) + .08 * Math.sin(j * .17 + t * .35);
      f += k.zug * .3 * Math.exp(-(((mx - bx) / (W * .14)) ** 2)) + .16 * va;
      f *= 1 - k.ab * j / n; f = klemm(f, .2, 1);
      const sicht = (H - 1) * f * k.g; if (sicht < 1) continue;
      const g = x.createLinearGradient(0, H - 2, 0, H - sicht); g.addColorStop(0, "rgba(25,40,62,1)"); g.addColorStop(1, "rgba(125,140,162,.667)");
      x.strokeStyle = g; x.lineWidth = bw; x.beginPath(); x.moveTo(bx, H + bw); x.lineTo(bx, H - sicht + bw / 2); x.stroke(); }
  };
  const messeLeinwand = () => { if (!leinwand) return; LW = leinwand.clientWidth; LH = leinwand.clientHeight;
    const r = document.createRange(); textRechts = 0;
    $$(".hero-titel, .hero-unter, .hero-knopf .knopf").forEach(el => { r.selectNodeContents(el); for (const k of r.getClientRects()) if (k.width > 0) textRechts = Math.max(textRechts, k.right); }); };
  if (!bewegt) { html.classList.remove("bewegt"); html.classList.add("bereit", "los");
    const nav = $("#nav"), belegt = () => nav.classList.toggle("belegt", scrollY > 30); addEventListener("scroll", belegt, { passive: true }); belegt();
    const still = () => { messeLeinwand(); messeKanten(); maleBuehne(0, 3.2, Infinity, 0, 1); kanten.forEach(k => maleKante(k, 2, 0, 1)); };
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(still); still(); addEventListener("resize", still);
    return; }
  const { gsap, ScrollTrigger } = window; gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  history.scrollRestoration = "manual";
  const inMasken = (el, innen) => { let i = 0;
    const wort = inhalt => { const m = document.createElement("span"), a = document.createElement("span"); m.className = "wm"; a.className = innen[0]; m.append(a);
      let z = a; for (const kl of innen.slice(1)) { const s = document.createElement("span"); s.className = kl; z.append(s); z = s; }
      z.style.setProperty("--i", i++); z.append(inhalt); return m; };
    const gehe = knoten => [...knoten.childNodes].forEach(n => {
      if (n.nodeType === 3) { const teile = n.textContent.split(/(\s+)/), frag = document.createDocumentFragment();
        teile.forEach(t => { if (!t) return; if (/^\s+$/.test(t)) frag.append(" "); else frag.append(wort(t)); }); n.replaceWith(frag); }
      else if (n.nodeType === 1) { if (n.hasAttribute("data-mark")) { const platz = document.createComment(""); n.replaceWith(platz); platz.replaceWith(wort(n)); } else gehe(n); } });
    gehe(el); };
  const h1 = $(".hero-titel"); if (h1) inMasken(h1, ["wa", "wl"]);
  const satz = $(".haltung-satz"); if (satz) inMasken(satz, ["wi"]);
  const buehne = $("#buehne"), heroText = $(".hero-text"), heroAuf = $$(".hero-auf"), heroWa = $$(".hero-titel .wa");
  const haltUeber = $(".haltung-ueber"), haltWi = $$(".haltung-satz .wi");
  let bTop = 0, bLauf = 1;
  const messeBuehne = () => { if (!buehne) return; bTop = buehne.getBoundingClientRect().top + scrollY; bLauf = Math.max(1, buehne.offsetHeight - innerHeight); };
  const roh = () => klemm((scrollY - bTop) / bLauf);
  const feder = { p: 0, v: 0 };
  let buehneSicht = true; if (buehne) new IntersectionObserver(es => es.forEach(e => buehneSicht = e.isIntersecting)).observe(buehne);
  const kanteSicht = new WeakMap(), ioK = new IntersectionObserver(es => es.forEach(e => kanteSicht.set(e.target, e.isIntersecting)), { rootMargin: "120px" });
  kanten.forEach(k => ioK.observe(k.c));
  const setzeText = p => {
    heroAuf.forEach((el, j) => { const e = sanft(strecke(p, j * .012, .11 + j * .012));
      if (e <= .0005) { el.style.removeProperty("opacity"); el.style.removeProperty("transform"); } else { el.style.opacity = (1 - e).toFixed(3); el.style.transform = `translate3d(0,${(-e * 56).toFixed(1)}px,0)`; } });
    heroWa.forEach((w, j) => { const e = sanft(strecke(p, .004 + j * .011, .1 + j * .011)); w.style.transform = e <= .0005 ? "" : `translate3d(0,${(-e * 112).toFixed(2)}%,0)`; });
    if (heroText) heroText.style.visibility = p > .22 ? "hidden" : "";
    if (haltUeber) { const e = sanft(strecke(p, .5, .57)); haltUeber.style.opacity = e.toFixed(3); haltUeber.style.transform = `translate3d(0,${((1 - e) * 16).toFixed(1)}px,0)`; }
    const n = haltWi.length;
    haltWi.forEach((w, j) => { const a = .53 + j * (.27 / Math.max(1, n)), e = aus3(strecke(p, a, a + .075)); w.style.transform = e >= .9995 ? "none" : `translate3d(0,${((1 - e) * 112).toFixed(2)}%,0)`; });
  };
  document.addEventListener("click", e => { const a = e.target.closest('a[href^="#"]'); if (!a || a.hasAttribute("data-tot")) return;
    const id = a.getAttribute("href"); if (id === "#") return; let ziel = id === "#top" ? 0 : $(id); if (ziel === null) return;
    e.preventDefault(); if (ziel && ziel.closest && ziel.closest(".buehne")) ziel = bTop + bLauf * .88;
    const offen = ziel && ziel.matches && ziel.matches(".ang") ? -120 : 0;
    lenis.scrollTo(ziel, { offset: offen, duration: 1.5, easing: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
      onComplete: () => { if (a.hasAttribute("data-anliegen") || (id === "#kontakt" && a.closest(".hero"))) $("#f-name").focus({ preventScroll: true });
        else if (id === "#warum") $("#warum").focus({ preventScroll: true }); } }); });
  const warum = $("#warum"); if (warum) warum.tabIndex = -1;
  const nav = $("#nav");
  lenis.on("scroll", ({ scroll, direction }) => { nav.classList.toggle("belegt", scroll > 30);
    if (nav.contains(document.activeElement)) { nav.classList.remove("weg"); return; }
    if (direction === 1 && scroll > 260) nav.classList.add("weg"); else if (direction === -1) nav.classList.remove("weg"); });
  const spur = $(".band-spur");
  if (spur) [...spur.children].forEach(li => { const k = li.cloneNode(true); k.setAttribute("aria-hidden", "true"); spur.append(k); });
  $$(".pfeiler > li").forEach((li, i) => li.style.setProperty("--verz", (i * .14) + "s"));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("da"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
  $$("[data-auf], [data-zeilen]").forEach(el => io.observe(el));
  gsap.to(".haarlinie span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".haarlinie", start: "top 88%", end: "top 50%", scrub: .8 } });
  gsap.to(".portraet-vorhang", { scaleY: 0, duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: ".portraet", start: "top 78%", once: true } });
  gsap.fromTo(".portraet-bild", { scale: 1.16 }, { scale: 1, duration: 2.2, ease: "expo.out", scrollTrigger: { trigger: ".portraet", start: "top 78%", once: true } });
  gsap.fromTo(".portraet-bild canvas", { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: ".portraet", start: "top bottom", end: "bottom top", scrub: .8 } });
  const stationen = $$(".station");
  let lagen = []; const messen = () => { const z = $(".zeit"); if (z) lagen = stationen.map(s => s.offsetLeft / z.offsetWidth); };
  const allesMessen = () => { messen(); messeBuehne(); messeLeinwand(); messeKanten(); };
  ScrollTrigger.addEventListener("refreshInit", messen); ScrollTrigger.addEventListener("refresh", () => { messeBuehne(); messeLeinwand(); messeKanten(); });
  allesMessen(); feder.p = roh();
  gsap.to(".zeit-linie span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".zeit", start: "top 86%", end: "top 40%", scrub: .8 },
    onUpdate() { const p = this.progress(); stationen.forEach((s, i) => s.classList.toggle("an", p >= (lagen[i] || 0) - .005)); } });
  let tempo = 0, bandX = 0, bandTempo = 0, bandHalt = false, bandSicht = false;
  const band = $(".band");
  if (band) { band.addEventListener("pointerenter", () => bandHalt = true); band.addEventListener("pointerleave", () => bandHalt = false); band.addEventListener("focusin", () => bandHalt = true); band.addEventListener("focusout", () => bandHalt = false);
    new IntersectionObserver(es => es.forEach(e => bandSicht = e.isIntersecting)).observe(band); }
  let letzteP = -1;
  gsap.ticker.add((zeit, dtMs) => {
    const dt = Math.min(.05, Math.max(.001, dtMs / 1000)), v = lenis.velocity || 0;
    tempo += (klemm(v / 34, -1, 1) - tempo) * (1 - Math.exp(-dt / .12));
    const ziel = roh(); let schritte = 2; while (schritte--) { const h = dt / 2, a = (130 * (ziel - feder.p) - 32 * feder.v) / .7; feder.v += a * h; feder.p += feder.v * h; }
    if (Math.abs(ziel - feder.p) < .00005 && Math.abs(feder.v) < .0005) { feder.p = ziel; feder.v = 0; }
    const p = klemm(feder.p);
    if (Math.abs(p - letzteP) > .00002) { setzeText(p); letzteP = p; }
    if (buehneSicht) maleBuehne(p, zeit, einStart < 0 ? 0 : zeit - einStart, tempo, dt);
    for (const k of kanten) { if (kanteSicht.get(k.c) === false) continue;
      const z = klemm((scrollY + innerHeight - k.top) / (k.h + innerHeight * .28)); k.g += (sanft(z) - k.g) * (1 - Math.exp(-dt / .22));
      maleKante(k, zeit, tempo, dt); }
    if (spur && bandSicht) { const grund = bandHalt ? 0 : 34, schub = Math.min(260, Math.abs(v) * 6) * (bandHalt ? 0 : 1);
      bandTempo += (grund + schub - bandTempo) * .06; bandX -= bandTempo * dt;
      const halb = spur.scrollWidth / 2; if (halb > 0 && -bandX >= halb) bandX += halb; spur.style.transform = `translate3d(${bandX.toFixed(2)}px,0,0)`; } });
  if (feinZeiger) $$(".magnet").forEach(el => { const qx = gsap.quickTo(el, "x", { duration: .5, ease: "power3" }), qy = gsap.quickTo(el, "y", { duration: .5, ease: "power3" });
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .38); });
    el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, .38)", overwrite: true }); }); });
  const los = () => { html.classList.add("los", "bereit"); ScrollTrigger.refresh(); if (einStart < 0) einStart = gsap.ticker.time + .25; };
  Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(los);
  addEventListener("load", () => ScrollTrigger.refresh());
  addEventListener("resize", () => { messeLeinwand(); });
})();
