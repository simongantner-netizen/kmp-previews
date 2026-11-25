
(() => {
  "use strict";
  const H = document.documentElement;
  const ruhig = H.classList.contains("ruhig");
  const fein = matchMedia("(pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sm = v => v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v);
  const ss = v => { v = v <= 0 ? 0 : v >= 1 ? 1 : v; return v * v * v * (v * (v * 6 - 15) + 10); };
  const klemm = (v, a, b) => Math.max(a, Math.min(b, v));
  const hatGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const navHoehe = () => parseFloat(getComputedStyle(H).getPropertyValue("--nav-h")) || 112;
  const sinIO = v => { v = v <= 0 ? 0 : v >= 1 ? 1 : v; return -(Math.cos(Math.PI * v) - 1) / 2; };
  const feder = (z, ziel, dt, w) => { const d = z.x - ziel, j = z.v + w * d, e = Math.exp(-w * dt); z.x = ziel + (d + j * dt) * e; z.v = (z.v - w * j * dt) * e; };
  const KIPP = .18, DAUER = 20;
  const SAMT = [36, 73, 108];
  const BLAU = [99, 156, 197];
  const farbe = (dimm, blau) => `rgb(${[0, 1, 2].map(i => { const w = 255 + (SAMT[i] - 255) * dimm; return Math.round(w + (BLAU[i] - w) * blau); }).join(",")})`;
  const hk = { auf: 1, form: 1 };
  const breiteVon = (t, L, n) => ((((t + L / n * DAUER) % DAUER) + DAUER) % DAUER) / DAUER * Math.PI;
  const zeitFuer = (phi, L, n) => phi / Math.PI * DAUER - L / n * DAUER;
  const BAND_A = 57 / 180 * Math.PI, BAND_B = 123 / 180 * Math.PI, BAND_W = 6 / 180 * Math.PI;
  const imBand = lat => Math.sin(Math.PI / 2 * sm((lat - BAND_A) / BAND_W)) * Math.sin(Math.PI / 2 * sm((BAND_B - lat) / BAND_W));
  const KARTEN_BREITE = { 0: .4, 1: .5, 2: .6 };
  const kartePhase = k => { const r = +k.c.dataset.ring; k.t = zeitFuer((KARTEN_BREITE[r] || .5) * Math.PI, r, 9); };
  const kugeln = $$("canvas.kugel").map((c, i) => ({ c, x: c.getContext("2d"), rolle: c.dataset.rolle, n: 9, stark: 4.8,
    t: 4 + i * 3.7, basis: c.dataset.rolle === "marke" ? .32 : .5, ruhe: 1, sichtbar: true, w: c.clientWidth, h: c.clientHeight,
    zustand: c.dataset.ring ? { dimm: .14, klassen: [{ rest: +c.dataset.ring % 3, an: 1 }] } : null }));
  const leinwaende = new Map();
  const groesse = new ResizeObserver(es => es.forEach(e => { const z = leinwaende.get(e.target); if (!z) return;
    z.w = e.contentRect.width; z.h = e.contentRect.height; if (ruhig && z.still) z.still(); }));
  function striche(x, kreise, lw) {
    for (const vorne of [false, true]) for (const kr of kreise) {
      const a = kr.alpha === undefined ? 1 : kr.alpha; if (a <= .004) continue;
      const ganz = a < .999; if (ganz && !vorne) continue;
      x.strokeStyle = kr.farbe; x.globalAlpha = a;
      const p = kr.p; let offen = false, jetzt = -1;
      for (let i = 1; i < p.length; i++) { const p0 = p[i - 1], p1 = p[i], zz = (p0[2] + p1[2]) / 2;
        if (!ganz && (zz >= 0) !== vorne) { if (offen) { x.stroke(); offen = false; } continue; }
        const u = klemm((zz + .35) / .7, 0, 1);
        const w = ganz ? lw * kr.breite * .81 : Math.round(lw * kr.breite * (.62 + .38 * u * u * (3 - 2 * u)) * 4) / 4;
        if (!offen || w !== jetzt) { if (offen) x.stroke(); x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineWidth = w; jetzt = w; offen = true; }
        x.lineTo(p1[0], p1[1]); }
      if (offen) x.stroke(); }
    x.globalAlpha = 1;
  }
  const AUF_STAFFEL = .45, ZU_STAFFEL = .3;
  function heroRinge(k, W, Hh, d) {
    const Rf = Math.min(W * .17, Hh * .33), Rgross = W * .98, cx = W * .785, cy = Hh / 2;
    const cK = Math.cos(KIPP), sK = Math.sin(KIPP), rx0 = Rgross * sinIO(hk.auf), kreise = [];
    const f1 = hk.form / .5, f2 = (hk.form - .45) / .55;
    for (let L = 0; L < k.n; L++) {
      const lat = breiteVon(k.t, L, k.n), rk = Math.sin(lat), abstand = Math.abs(lat - Math.PI / 2) / (Math.PI / 2);
      const a = sinIO((f1 - abstand * AUF_STAFFEL) / (1 - AUF_STAFFEL)), b = sinIO((f2 - abstand * ZU_STAFFEL) / (1 - ZU_STAFFEL));
      let rx = rx0 + (Rgross * (.9 + .1 * rk) - rx0) * a, yc = (Math.PI / 2 - lat) / (Math.PI / 2) * Hh * .36 * a,
        ry = rk * Rgross * .02 * a, zc = 0, zr = rk * a;
      rx += (rk * Rf - rx) * b; yc += (Math.cos(lat) * cK * Rf - yc) * b; ry += (rk * sK * Rf - ry) * b;
      zc += Math.cos(lat) * sK * b; zr += (rk * cK - zr) * b;
      const rot = L / k.n * Math.PI * 2, p = [];
      for (let i = 0; i <= 180; i++) { const w = rot + i / 180 * Math.PI * 2, s = Math.sin(w);
        p.push([cx + Math.cos(w) * rx, cy - yc + s * ry, zc + s * zr]); }
      const pol = sm(Math.min(lat, Math.PI - lat) / .32);
      kreise.push({ p, farbe: farbe(0, 0), breite: .42 + .58 * b, blau: 0, alpha: b > .999 ? 1 : Math.pow(pol, (1 - b) * 3) });
    }
    const box = Rf / .42 / d, lw = Math.max(d, d * 1.4 * k.stark * Math.min(1, box / 300) * Math.max(1, box / 760));
    striche(k.x, kreise, lw);
  }
  function zeichne(k) {
    const c = k.c, d = Math.min(devicePixelRatio || 1, 2), W = Math.round(k.w * d), Hh = Math.round(k.h * d);
    if (!W || !Hh) return;
    if (c.width !== W || c.height !== Hh) { c.width = W; c.height = Hh; }
    const x = k.x; x.clearRect(0, 0, W, Hh);
    x.lineCap = "round"; x.lineJoin = "round";
    if (k.rolle === "hero") { if (hk.auf > .001) heroRinge(k, W, Hh, d); return; }
    const R = Math.min(W, Hh) * .42, cx = W / 2, cy = Hh / 2, box = Math.min(W, Hh) / d;
    const n = box < 24 ? 4 : box < 48 ? 5 : box < 90 ? Math.min(k.n, 7) : k.n;
    const cK = Math.cos(KIPP), sK = Math.sin(KIPP);
    const lw = Math.max(d * (box < 48 ? 1.2 : 1), d * 1.4 * k.stark * Math.min(1, box / 300) * Math.max(1, box / 760));
    const z = k.zustand, dimm = z ? z.dimm : 0, kreise = [];
    for (let L = 0; L < n; L++) {
      const lat0 = breiteVon(k.t, L, n), lat = lat0;
      const rk = Math.sin(lat), y0 = Math.cos(lat), rot = L / n * Math.PI, cR = Math.cos(rot), sR = Math.sin(rot), p = [];
      for (let i = 0; i <= 180; i++) { const a = i / 180 * Math.PI * 2, px = Math.cos(a) * rk, pz = Math.sin(a) * rk;
        const wx = px * cR + pz * sR, wz = -px * sR + pz * cR, yy = y0 * cK - wz * sK, zz = y0 * sK + wz * cK;
        p.push([cx + wx * R, cy - yy * R, zz]); }
      let b = 0;
      if (z && z.klassen && n % 3 === 0) { const e = imBand(lat0); for (const kl of z.klassen) if (L % 3 === kl.rest) b += kl.an * e; }
      kreise.push({ p, farbe: farbe(dimm * (1 - b), b), breite: 1 + .32 * b, blau: b });
    }
    kreise.sort((a, b) => a.blau - b.blau);
    striche(x, kreise, lw);
  }
  kugeln.forEach(k => { leinwaende.set(k.c, k); k.still = () => zeichne(k); groesse.observe(k.c); });
  const mensch = $(".mensch"), mLein = $(".mensch-ring"), mSatz = $(".mensch-satz");
  const mOben = $(".ms-oben > span"), mUnten = $(".ms-unten > span");
  const mz = mLein ? { c: mLein, x: mLein.getContext("2d"), w: mLein.clientWidth, h: mLein.clientHeight, fs: 0, sichtbar: false,
    f: { x: 0, v: 0, an: false }, oben: null, unten: null } : null;
  const menschSchrift = () => { if (mz && mSatz) mz.fs = parseFloat(getComputedStyle(mSatz).fontSize) || 100; };
  menschSchrift();
  function zeichneMensch(p, schub) {
    const c = mz.c, d = Math.min(devicePixelRatio || 1, 2), W = Math.round(mz.w * d), Hh = Math.round(mz.h * d);
    if (!W || !Hh) return;
    if (c.width !== W || c.height !== Hh) { c.width = W; c.height = Hh; }
    const x = mz.x; x.clearRect(0, 0, W, Hh); x.lineCap = "round"; x.lineJoin = "round";
    const zug = sinIO(p / .36), auf = sinIO((p - .36) / .42);
    if (zug <= .001) return;
    const cx = W / 2, cy = Hh / 2, rx = W * .66 * zug, ry = mz.fs * d * 1.72 * auf * (1 + .07 * Math.tanh(schub * .5)), pts = [];
    for (let i = 0; i <= 240; i++) { const a = i / 240 * Math.PI * 2, s = Math.sin(a); pts.push([cx + Math.cos(a) * rx, cy + s * ry, s * auf]); }
    striche(x, [{ p: pts, farbe: "#fff", breite: 1, alpha: 1 }], d * 3.1);
    x.globalAlpha = 1;
    const o = (1 - sinIO((p - .4) / .34)) * 128, u = (1 - sinIO((p - .52) / .34)) * -128;
    if (mOben && o !== mz.oben) { mz.oben = o; mOben.style.transform = `translate3d(0,${o.toFixed(2)}%,0)`; }
    if (mUnten && u !== mz.unten) { mz.unten = u; mUnten.style.transform = `translate3d(0,${u.toFixed(2)}%,0)`; }
  }
  if (mz) { leinwaende.set(mz.c, mz); mz.still = () => { menschSchrift(); zeichneMensch(1, 0); }; groesse.observe(mz.c); }
  const ansatz = $(".ansatz"), buehnenKugel = kugeln.find(k => k.rolle === "buehne");
  const lis = $$(".pfeiler li");
  const START = [.1, .4, .7];
  const buehne = { p: 0, aktiv: -2, wahl: [null, null, null] };
  if (buehnenKugel) buehnenKugel.zustand = { dimm: 0, klassen: [] };
  function bühneStand(p) {
    const z = buehnenKugel.zustand;
    z.dimm = .3 * sm(p / .07);
    z.klassen = [];
    START.forEach((s, i) => { const an = sm((p - s) / .07);
      if (an <= 0) { buehne.wahl[i] = null; return; }
      if (buehne.wahl[i] === null) { let best = -1, bestR = 0;
        for (let L = 0; L < 9; L++) { if (buehne.wahl.includes(L % 3)) continue; const v = Math.sin(breiteVon(buehnenKugel.t, L, 9)); if (v > best) { best = v; bestR = L % 3; } }
        buehne.wahl[i] = bestR; }
      z.klassen.push({ rest: buehne.wahl[i], an }); });
    buehnenKugel.ruhe = 1 - .78 * sm((p - .72) / .2);
    const aktiv = p < START[0] + .03 ? -1 : p < START[1] + .03 ? 0 : p < START[2] + .03 ? 1 : 2;
    if (aktiv !== buehne.aktiv) { buehne.aktiv = aktiv;
      lis.forEach((li, i) => { li.classList.toggle("aktiv", i === aktiv); li.classList.toggle("erreicht", i <= aktiv); }); }
  }
  function stilleBilder() {
    if (buehnenKugel) { buehnenKugel.zustand.dimm = .3; buehnenKugel.zustand.klassen = [0, 1, 2].map(rest => ({ rest, an: 1 })); }
    hk.auf = 1; hk.form = 1;
    lis.forEach(li => li.classList.add("erreicht", "aktiv"));
    kugeln.forEach(k => { k.t = 6; if (k.c.dataset.ring) kartePhase(k); zeichne(k); });
    if (mz) mz.still();
  }
  const form = $("#formular");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#f-name"), mail = $("#f-mail"), fN = $("#f-name-fehler"), fM = $("#f-mail-fehler");
    const nameOk = name.value.trim().length > 0, mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim());
    fN.textContent = nameOk ? "" : "Hier fehlt noch dein Name.";
    fM.textContent = mailOk ? "" : "Diese Adresse sieht noch nicht vollständig aus.";
    name.closest(".feld").classList.toggle("falsch", !nameOk); mail.closest(".feld").classList.toggle("falsch", !mailOk);
    name.setAttribute("aria-invalid", !nameOk); mail.setAttribute("aria-invalid", !mailOk);
    if (!nameOk) { name.focus(); return; } if (!mailOk) { mail.focus(); return; }
    const danke = $(".danke"), box = form.parentElement; box.style.minHeight = box.offsetHeight + "px"; form.hidden = true; danke.hidden = false; danke.setAttribute("tabindex", "-1"); danke.focus({ preventScroll: true });
  });
  const betonen = el => $$(".wort > span, .w", el).forEach(w => { if (/^Freude/.test(w.textContent)) w.classList.add("betont"); });
  if (ruhig || !hatGsap) {
    H.classList.add("bereit");
    if (!ruhig) H.classList.remove("js");
    const haltung = $("[data-haltung]");
    if (haltung) { const t = haltung.textContent.trim(); haltung.innerHTML = t.split(/\s+/).map(w => `<span class="w">${w}</span>`).join(" "); betonen(haltung); }
    const nachZeichnen = () => stilleBilder();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(nachZeichnen);
    addEventListener("resize", nachZeichnen);
    addEventListener("load", nachZeichnen);
    const navR = $("#nav"), grund = () => navR.classList.toggle("unterwegs", scrollY > 40);
    addEventListener("scroll", grund, { passive: true }); grund();
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href"); e.preventDefault();
    if (id === "#") return;
    const ziel = id === "#oben" ? 0 : $(id); if (ziel === null) return;
    const versatz = ziel && ziel.classList && ziel.classList.contains("anker") ? -(navHoehe() + innerHeight * .03) : 0;
    lenis.scrollTo(ziel, { offset: versatz, duration: 1.8, easing: t => -(Math.cos(Math.PI * t) - 1) / 2 });
    if (ziel && ziel.focus && id !== "#oben") { const f = ziel.closest("section") || ziel; f.setAttribute("tabindex", "-1"); setTimeout(() => f.focus({ preventScroll: true }), 1850); }
  });
  const inWoerter = el => { const text = el.textContent.trim(); el.setAttribute("aria-label", text);
    el.innerHTML = text.split(/\s+/).map(w => `<span class="wort" aria-hidden="true"><span>${w}</span></span>`).join(" ");
    return $$(".wort > span", el); };
  const nav = $("#nav");
  const heldWoerter = inWoerter($(".hero-titel"));
  const haltung = $("[data-haltung]"), haltWoerter = haltung ? inWoerter(haltung) : [];
  if (haltung) betonen(haltung);
  gsap.set(heldWoerter, { yPercent: 108 });
  gsap.set(haltWoerter, { yPercent: 135 });
  gsap.set(".haltung-block", { autoAlpha: 0 });
  gsap.set(".haltung-ueber > span", { yPercent: 110 });
  H.classList.add("bereit");
  const intro = gsap.timeline({ defaults: { ease: "expo.out" }, delay: .15 });
  intro.to($$(".nav-marke, .nav li", nav), { opacity: 1, y: 0, duration: 1.2, stagger: .07 }, .2)
    .fromTo(".hero-bild", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 2.0, ease: "power3.out" }, .3)
    .to(heldWoerter, { yPercent: 0, duration: 1.3, stagger: .055 }, .55)
    .fromTo(".hero [data-auftritt]", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 1.3, stagger: .12 }, .8);
  gsap.set(hk, { auf: 0, form: 0 });
  const held = gsap.timeline({ id: "held", paused: true, defaults: { ease: "none" } });
  held.to(heldWoerter, { y: (i, el) => -el.offsetHeight * 1.25, ease: "power2.in", duration: .096, stagger: .0064 }, 0)
    .to(".hero-text", { yPercent: -6, duration: .16 }, 0)
    .to(".hero-text > :not(.hero-titel)", { opacity: 0, y: -30, ease: "power1.in", duration: .096, stagger: .016 }, .008)
    .to(".hero-bild img", { y: () => innerHeight * .16, scale: .94, opacity: 0, ease: "power1.in", duration: .12 }, .008)
    .to(hk, { auf: 1, duration: .168 }, .088)
    .to(hk, { form: 1, duration: .504 }, .196)
    .to(".haltung-block", { autoAlpha: 1, duration: .01 }, .695)
    .to(".haltung-ueber > span", { yPercent: 0, ease: "sine.out", duration: .064 }, .70)
    .to(haltWoerter, { yPercent: 0, ease: "power2.out", duration: .08, stagger: .0072 }, .72)
    .to({}, { duration: .05 }, .95);
  const heldST = ScrollTrigger.create({ trigger: ".hero", start: "top top", end: "bottom bottom" });
  const HELD_W = 8, heldF = { x: 0, v: 0, an: false }, heldF2 = { x: 0, v: 0 };
  if (fein) {
    const ziele = [[".hero-bild", 10], [".hero-text", 4]].map(([s, f]) => ({ f, x: gsap.quickTo(s, "x", { duration: 1.4, ease: "power3.out" }) }));
    $(".hero").addEventListener("pointermove", e => { const u = e.clientX / innerWidth - .5; ziele.forEach(z => z.x(u * z.f * 2)); });
    $(".hero").addEventListener("pointerleave", () => ziele.forEach(z => z.x(0)));
  }
  let letzte = 0;
  lenis.on("scroll", ({ scroll }) => {
    const d = scroll - letzte;
    nav.classList.toggle("unterwegs", scroll > 40);
    if (scroll > 260 && d > 6) nav.classList.add("weg");
    else if (d < -6 || scroll <= 260) nav.classList.remove("weg");
    if (Math.abs(d) > 6) letzte = scroll;
  });
  nav.addEventListener("focusin", () => nav.classList.remove("weg"));
  $$("[data-woerter]").forEach(el => { if (el.classList.contains("hero-titel")) return;
    const w = inWoerter(el); gsap.set(w, { yPercent: 108 });
    ScrollTrigger.create({ trigger: el, start: "top 86%", once: true, onEnter: () => gsap.to(w, { yPercent: 0, duration: 1.25, stagger: .05, ease: "expo.out" }) }); });
  $$("[data-auftritt]").forEach(el => { if (el.closest(".hero")) return;
    gsap.set(el, { y: 28, filter: "blur(6px)" });
    ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(el, { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.3, ease: "expo.out", clearProps: "filter" }) }); });
  if (ansatz && buehnenKugel) gsap.to(buehne, { p: 1, ease: "none", scrollTrigger: { trigger: ansatz, start: "top top", end: "bottom bottom", scrub: .9 } });
  const karten = $$(".karte"), anker = $$(".stapel .anker");
  karten.forEach((k, i) => { if (i === karten.length - 1) return;
    const st = { trigger: anker[i + 1], start: "top bottom", end: () => `top ${navHoehe() + innerHeight * .03 + (i + 1) * 26}px`, scrub: .8, invalidateOnRefresh: true };
    gsap.timeline({ scrollTrigger: st }).to(k, { scale: .94, ease: "none" }, 0).to($(".schleier", k), { opacity: .55, ease: "none" }, 0); });
  karten.forEach(k => gsap.fromTo(k, { y: 90 }, { y: 0, ease: "none", scrollTrigger: { trigger: k, start: "top bottom", end: "top 40%", scrub: .8 }, immediateRender: false }));
  const menschST = mz && mensch ? ScrollTrigger.create({ trigger: mensch, start: "top 75%", end: "bottom bottom" }) : null;
  gsap.fromTo(".ueber-bild img", { clipPath: "inset(100% 0% 0% 0%)", y: 90, scale: 1.04 }, { clipPath: "inset(0% 0% 0% 0%)", y: 0, scale: 1, ease: "none",
    scrollTrigger: { trigger: ".ueber-bild", start: "top 92%", end: "top 22%", scrub: .9 } });
  const zl = gsap.timeline({ scrollTrigger: { trigger: ".zeitleiste", start: "top 86%", end: "top 52%", scrub: .8 } });
  zl.fromTo(".zl-linie i", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
  $$(".zeitleiste li").forEach((li, i) => zl.fromTo(li, { opacity: 0, y: 18 }, { opacity: 1, y: 0, ease: "power2.out", duration: .22 }, i * .36));
  const fc = $(".fuss-claim");
  if (fc) { fc.innerHTML = [...fc.textContent].map(ch => ch === " " ? " " : `<span class="bs" aria-hidden="true">${ch}</span>`).join("");
    const bs = $$(".bs", fc); gsap.set(bs, { yPercent: -60, opacity: 0 });
    ScrollTrigger.create({ trigger: fc, start: "top 88%", once: true, onEnter: () => gsap.to(bs, { yPercent: 0, opacity: 1, duration: 1.4, stagger: .035, ease: "expo.out" }) }); }
  const licht = $(".licht"), lx = gsap.quickTo(licht, "x", { duration: 2.4, ease: "sine.inOut" }), ly = gsap.quickTo(licht, "y", { duration: 2.4, ease: "sine.inOut" });
  gsap.set(licht, { x: innerWidth * .72, y: innerHeight * .4 });
  $$("[data-licht]").forEach(s => { const [px, py] = s.dataset.licht.split(",").map(Number);
    ScrollTrigger.create({ trigger: s, start: "top 55%", end: "bottom 55%", onToggle: self => { if (self.isActive) { lx(innerWidth * px / 100); ly(innerHeight * py / 100); } } }); });
  if (fein) $$(".magnet").forEach(b => { const qx = gsap.quickTo(b, "x", { duration: .6, ease: "power3.out" }), qy = gsap.quickTo(b, "y", { duration: .6, ease: "power3.out" });
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .3); });
    b.addEventListener("pointerleave", () => { gsap.to(b, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, .45)", overwrite: true }); }); });
  const spur = $(".band-spur"), satz = $(".band-satz");
  const band = { x: 0, breite: 0, halt: 1, haltZiel: 1 };
  if (spur && satz) { const kopie = satz.cloneNode(true); kopie.setAttribute("aria-hidden", "true"); $$("li", kopie).forEach(li => li.setAttribute("inert", "")); spur.appendChild(kopie);
    const b = $(".band"); b.addEventListener("pointerenter", () => band.haltZiel = 0); b.addEventListener("pointerleave", () => band.haltZiel = 1);
    b.addEventListener("focusin", () => band.haltZiel = 0); b.addEventListener("focusout", () => band.haltZiel = 1); }
  const io = new IntersectionObserver(es => es.forEach(e => { const k = kugeln.find(q => q.c === e.target); if (!k) return;
    if (e.isIntersecting && !k.sichtbar && k.c.dataset.ring) kartePhase(k);
    k.sichtbar = e.isIntersecting; }), { rootMargin: "120px" });
  kugeln.forEach(k => { if (k.c.dataset.ring) { kartePhase(k); k.sichtbar = false; } });
  kugeln.forEach(k => io.observe(k.c));
  const bandSicht = { an: true };
  const io2 = new IntersectionObserver(es => es.forEach(e => { if (mz && e.target === mz.c) mz.sichtbar = e.isIntersecting; else bandSicht.an = e.isIntersecting; }), { rootMargin: "120px" });
  if (mz) io2.observe(mz.c); if (spur) io2.observe($(".band"));
  let tempo = 0;
  gsap.ticker.add((zeit, dtMs) => {
    const dt = Math.min(dtMs, 50) / 1000;
    const ziel = klemm((lenis.velocity || 0) / 28, -3.2, 3.2);
    tempo += (ziel - tempo) * Math.min(1, dt * 5);
    const hz = heldST.progress; if (!heldF.an) { heldF.x = heldF2.x = hz; heldF.an = true; }
    feder(heldF, hz, dt, HELD_W); feder(heldF2, heldF.x, dt, HELD_W);
    const hp = klemm(heldF2.x, 0, 1); if (Math.abs(hp - held.progress()) > 1e-6) held.progress(hp);
    if (buehnenKugel) bühneStand(buehne.p);
    for (const k of kugeln) { if (!k.sichtbar) continue;
      const gewicht = k.rolle === "hero" ? .35 + .65 * ss(hk.form) * ss(hk.form) : 1;
      k.t += dt * (k.basis * k.ruhe + tempo * 1.25 * gewicht); zeichne(k); }
    if (mz && menschST) { const mzl = menschST.progress; if (!mz.f.an) { mz.f.x = mzl; mz.f.an = true; }
      feder(mz.f, mzl, dt, 6.5); if (mz.sichtbar) zeichneMensch(klemm(mz.f.x, 0, 1), tempo); }
    if (spur && band.breite && bandSicht.an) { band.halt += (band.haltZiel - band.halt) * Math.min(1, dt * 3);
      band.x -= dt * (30 + Math.abs(tempo) * 70) * band.halt; if (band.x <= -band.breite) band.x += band.breite;
      spur.style.transform = `translate3d(${band.x.toFixed(2)}px,0,0)`; }
  });
  const messen = () => { if (satz) band.breite = satz.getBoundingClientRect().width; menschSchrift(); };
  ScrollTrigger.addEventListener("refresh", messen);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { ScrollTrigger.refresh(); messen(); });
  addEventListener("load", () => { ScrollTrigger.refresh(); messen(); });
  messen();
})();
