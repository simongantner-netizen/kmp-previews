
(() => {
  "use strict";
  const H = document.documentElement;
  const bewegt = H.classList.contains("bewegt") && !!(window.gsap && window.ScrollTrigger && window.Lenis);
  if (!bewegt) H.classList.remove("bewegt");
  H.classList.add("laeuft");
  const feinZeiger = matchMedia("(pointer: fine)").matches;
  const klemm = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sanft = (a, b, v) => { const k = klemm((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const TINTE = "#273554";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  function inWoerter(el) {
    const einheiten = []; let akt = null, offen = false;
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { offen = false; return; }
        if (!offen) { akt = []; einheiten.push(akt); offen = true; } akt.push(document.createTextNode(t)); });
      else if (n.nodeType === 1 && n.tagName === "BR") { einheiten.push("br"); offen = false; }
      else if (n.nodeType === 1) { if (!offen) { akt = []; einheiten.push(akt); offen = true; } akt.push(n); }
    });
    el.textContent = "";
    const woerter = [];
    einheiten.forEach((teile, i) => {
      if (teile === "br") { el.append(document.createElement("br")); return; }
      const w = document.createElement("span"), wi = document.createElement("span"); w.className = "w"; wi.className = "wi";
      teile.forEach(t => wi.append(t)); w.append(wi); el.append(w); woerter.push(wi);
      if (i < einheiten.length - 1 && einheiten[i + 1] !== "br") el.append(" ");
    });
    return woerter;
  }
  const heroTitel = $(".hero-titel");
  const heroWoerter = heroTitel ? inWoerter(heroTitel) : [];
  const satz = $("[data-woerter]");
  let haltWoerter = [];
  if (satz) {
    const ziel = satz.dataset.kreisWort, txt = satz.textContent.trim();
    const i = ziel ? txt.lastIndexOf(ziel) : -1;
    if (i >= 0) { satz.textContent = ""; const m = document.createElement("span"); m.dataset.mark = "kreis"; m.textContent = ziel;
      satz.append(txt.slice(0, i), m, txt.slice(i + ziel.length)); }
    haltWoerter = inWoerter(satz);
  }
  const striche = $$("canvas[data-strich]").map(c => {
    const fav = window.Handschrift && Handschrift.favorit(c.dataset.strich);
    if (!fav) return null;
    const fett = +(c.dataset.fett || 1);
    const v = Handschrift.vorbereiten(fav, { staerke: ((fav.stil && fav.stil.staerke) || 3) * fett });
    const [, , bw, bh] = v.box; c.style.aspectRatio = (bw / bh).toFixed(4);
    return { c, g: c.getContext("2d"), v, farbe: c.dataset.farbe || TINTE, tempo: +(c.dataset.tempo || 1), p: 0, gemalt: -1 };
  }).filter(Boolean);
  const strich = c => striche.find(S => S.c === c);
  function male(S, p = S.p, zwingen = false) {
    const c = S.c, d = Math.min(devicePixelRatio || 1, 2), w = Math.round(c.clientWidth * d), h = Math.round(c.clientHeight * d);
    if (!w || !h) return;
    const neu = c.width !== w || c.height !== h;
    if (neu) { c.width = w; c.height = h; }
    if (!neu && !zwingen && Math.abs(p - S.gemalt) < 1e-4) return;
    S.gemalt = p; S.g.clearRect(0, 0, w, h);
    if (p <= 0) return;
    Handschrift.zeichne(S.g, S.v, { b: w, h, farbe: S.farbe, bis: p >= 1 ? Infinity : p * S.v.dauer });
  }
  if ("ResizeObserver" in window) { const ro = new ResizeObserver(es => es.forEach(e => { const S = strich(e.target); if (S) male(S, S.p, true); })); striche.forEach(S => ro.observe(S.c)); }
  const ARTEN = { kreis: [1, 2, 3, 4, 5, 6, 7, 8].map(i => "kreis-" + i), unterstrich: [2, 3, 4, 5, 6, 7, 8].map(i => "unterstrich-" + i) };
  const vorrat = {};
  const zug = art => { if (art in vorrat) return vorrat[art]; const f = window.Handschrift && Handschrift.favorit(art); return (vorrat[art] = f ? Handschrift.vorbereiten(f) : null); };
  function zeichneGedehnt(g, v, { x, y, b, h, farbe, bis = Infinity, breite }) {
    const [bx, by, bw, bh] = v.box, rand = v.staerke * 1.4, sx = b / (bw - 2 * rand), sy = h / (bh - 2 * rand), T = 4;
    const cr = (k0, k1, k2, k3, t) => .5 * (2 * k1 + (k2 - k0) * t + (2 * k0 - 5 * k1 + 4 * k2 - k3) * t * t + (3 * k1 - k0 - 3 * k2 + k3) * t * t * t);
    g.save(); g.strokeStyle = farbe; g.lineCap = "round"; g.lineJoin = "round";
    for (const z of v.zuege) { if (z[0][2] > bis) break;
      for (let i = 1; i < z.length; i++) { const a = z[i - 1], c = z[i]; if (a[2] > bis) break;
        const p0 = z[Math.max(0, i - 2)], p3 = z[Math.min(z.length - 1, i + 1)];
        const ende = c[2] > bis ? (bis - a[2]) / Math.max(1, c[2] - a[2]) : 1;
        let ax = x + (a[0] - bx - rand) * sx, ay = y + (a[1] - by - rand) * sy;
        for (let k = 1; k <= T; k++) { const t = Math.min(k / T, ende);
          const nx = x + (cr(p0[0], a[0], c[0], p3[0], t) - bx - rand) * sx, ny = y + (cr(p0[1], a[1], c[1], p3[1], t) - by - rand) * sy;
          g.lineWidth = Math.max(.6, breite * (a[3] + (c[3] - a[3]) * t));
          g.beginPath(); g.moveTo(ax, ay); g.lineTo(nx, ny); g.stroke(); ax = nx; ay = ny; if (t >= ende) break; } } }
    g.restore();
  }
  const marken = $$("[data-mark]").map(el => {
    const traeger = el.closest(".hero-titel, .haltung, .titel-gross, .station-jahr") || el.parentElement;
    traeger.classList.add("mark-traeger");
    const c = document.createElement("canvas"); c.className = "mark-zug"; c.setAttribute("aria-hidden", "true"); traeger.append(c);
    const sonde = document.createElement("span"); sonde.setAttribute("aria-hidden", "true"); sonde.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline"; el.append(sonde);
    const farbe = getComputedStyle(traeger).getPropertyValue("--mark-farbe").trim() || TINTE;
    return { el, traeger, c, g: c.getContext("2d"), sonde, wunsch: el.dataset.mark || "", farbe, p: 0, gemalt: -1, v: null, box: null };
  });
  const marke = el => marken.find(M => M.el === el || M.el.contains(el));
  function legeMarke(M) {
    const lage = e => { let x = 0, y = 0, n = e; while (n && n !== M.traeger) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return n === M.traeger ? [x, y] : null; };
    const l = lage(M.el), ls = lage(M.sonde); if (!l || !ls) return;
    const [x] = l, fs = parseFloat(getComputedStyle(M.el).fontSize), w = M.el.offsetWidth, grund = ls[1];
    let typ = M.wunsch.replace(/-\d+$/, "");
    if (typ !== "kreis" && typ !== "unterstrich") typ = M.el.textContent.trim().length <= 7 ? "kreis" : "unterstrich";
    const box = typ === "kreis"
      ? { x: x - .24 * fs, y: grund - .36 * fs - .6 * fs, b: w + .48 * fs, h: 1.2 * fs }
      : { x: x - .03 * fs, y: grund + .1 * fs, b: w + .08 * fs, h: .16 * fs };
    let art = /-\d+$/.test(M.wunsch) ? M.wunsch : null;
    if (!art) { const ziel = box.b / box.h; let best = 1e9;
      for (const a of ARTEN[typ]) { const v = zug(a); if (!v) continue; const r = v.staerke * 2.8, d = Math.abs(Math.log((v.box[2] - r) / (v.box[3] - r) / ziel)); if (d < best) { best = d; art = a; } } }
    M.v = art && zug(art); M.art = art;
    const breite = klemm(fs * (typ === "kreis" ? .052 : .05), 2.4, 9), rand = breite * 2.2;
    M.box = box; M.breite = breite; M.rand = rand;
    Object.assign(M.c.style, { left: (box.x - rand).toFixed(1) + "px", top: (box.y - rand).toFixed(1) + "px", width: (box.b + 2 * rand).toFixed(1) + "px", height: (box.h + 2 * rand).toFixed(1) + "px" });
    malMarke(M, M.p, true);
  }
  function malMarke(M, p = M.p, zwingen = false) {
    if (!M.v || !M.box) return;
    const d = Math.min(devicePixelRatio || 1, 2), W = Math.round((M.box.b + 2 * M.rand) * d), Hh = Math.round((M.box.h + 2 * M.rand) * d);
    const neu = M.c.width !== W || M.c.height !== Hh; if (neu) { M.c.width = W; M.c.height = Hh; }
    if (!neu && !zwingen && Math.abs(p - M.gemalt) < 1e-4) return;
    M.gemalt = p; M.g.clearRect(0, 0, W, Hh); if (p <= 0) return;
    zeichneGedehnt(M.g, M.v, { x: M.rand * d, y: M.rand * d, b: M.box.b * d, h: M.box.h * d, farbe: M.farbe, breite: M.breite * d, bis: p >= 1 ? Infinity : p * M.v.dauer });
  }
  const legeAlle = () => marken.forEach(legeMarke);
  const schreibe = (S, faktor, verzug = 0) => S && S.v && gsap.to(S, { p: 1, duration: S.v.dauer / 1000 * (faktor ?? S.tempo), delay: verzug, ease: "none", overwrite: true, onUpdate: () => (S.box !== undefined ? malMarke(S) : male(S)) });
  const form = document.getElementById("formular");
  if (form) {
    const felder = { name: form.querySelector("#f-name"), mail: form.querySelector("#f-mail") };
    const pruefe = { name: v => v.trim().length > 0, mail: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) };
    const zeige = (k, falsch) => { const f = felder[k], feld = f.closest(".feld"), p = feld.querySelector(".fehler");
      feld.classList.toggle("falsch", falsch); p.hidden = !falsch; if (falsch) f.setAttribute("aria-invalid", "true"); else f.removeAttribute("aria-invalid"); };
    Object.keys(felder).forEach(k => felder[k].addEventListener("input", () => { if (felder[k].closest(".feld").classList.contains("falsch") && pruefe[k](felder[k].value)) zeige(k, false); }));
    form.addEventListener("submit", e => {
      e.preventDefault();
      const falsch = Object.keys(felder).filter(k => !pruefe[k](felder[k].value));
      Object.keys(felder).forEach(k => zeige(k, falsch.includes(k)));
      if (falsch.length) { felder[falsch[0]].focus(); return; }
      const danke = form.querySelector(".danke"), dz = strich(danke.querySelector("canvas"));
      danke.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        form.classList.add("gesendet");
        if (!dz) return;
        if (bewegt) { dz.p = 0; male(dz, 0, true); schreibe(dz, 1, .9); } else { dz.p = 1; male(dz, 1, true); }
      }));
    });
  }
  const nav = document.getElementById("nav");
  if (!bewegt) {
    const alles = () => { striche.forEach(S => { if (!S.c.closest(".danke")) S.p = 1; male(S, S.p, true); }); marken.forEach(M => { M.p = 1; }); legeAlle(); };
    addEventListener("scroll", () => nav.classList.toggle("matt", scrollY > 40), { passive: true });
    addEventListener("resize", legeAlle);
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(alles);
    addEventListener("load", alles);
    alles(); nav.classList.toggle("matt", scrollY > 40);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href^='#']"); if (!a) return;
    const ziel = a.getAttribute("href"); e.preventDefault(); if (ziel === "#") return;
    const el = document.querySelector(ziel); if (!el) return;
    lenis.scrollTo(ziel === "#oben" ? 0 : el, { offset: ziel === "#oben" ? 0 : -(nav.offsetHeight + 24), duration: 1.8, easing: k => -(Math.cos(Math.PI * k) - 1) / 2 });
  });
  const buehnen = [];
  const buehne = (el, schritt) => { if (!el) return; const B = { ziel: 0, ist: 0, v: 0, gemalt: -1, schritt };
    ScrollTrigger.create({ trigger: el, start: "top top", end: "bottom bottom", onUpdate: s => { B.ziel = s.progress; }, onRefresh: s => { B.ziel = s.progress; } });
    buehnen.push(B); };
  function federn(dt) {
    for (const B of buehnen) {
      const n = Math.max(1, Math.ceil(dt / .008)), h = dt / n;
      for (let i = 0; i < n; i++) { const a = (130 * (B.ziel - B.ist) - 32 * B.v) / .7; B.v += a * h; B.ist += B.v * h; }
      if (Math.abs(B.ziel - B.ist) < 1e-5 && Math.abs(B.v) < 1e-5) { B.ist = B.ziel; B.v = 0; }
      const p = klemm(B.ist);
      if (Math.abs(p - B.gemalt) > 1e-5 || B.gemalt < 0) { B.gemalt = p; B.schritt(p); }
    }
  }
  $$("[data-zeilen]").forEach(h => ScrollTrigger.create({ trigger: h, start: "top 87%", once: true,
    onEnter: () => gsap.to(h.querySelectorAll(".zeile > span"), { y: 0, duration: 1.4, ease: "expo.out", stagger: .11,
      onComplete: () => h.querySelectorAll(".zeile").forEach(z => z.classList.add("frei")) }) }));
  ScrollTrigger.batch("[data-auftritt]", { start: "top 90%", once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: .09, overwrite: true }) });
  const woerterZustand = heroWoerter.map(el => ({ el, ein: 1, aus: 0 }));
  const haltZustand = haltWoerter.map(el => ({ el, e: 0 }));
  const heroUeber = $(".hero-ueber"), heroUnter = $(".hero-unter"), heroKnopf = $(".hero-schluss .knopf"), warumUeber = $(".warum-ueber");
  const blatt = $(".hero-bild .bild-blatt"), heroImg = $(".hero-bild img"), heroBild = $(".hero-bild");
  const heroMarke = heroTitel && marken.find(M => M.traeger === heroTitel), haltMarke = satz && marken.find(M => M.traeger === satz);
  const ein = { ueber: 0, unter: 0, knopf: 0, blatt: 0, bild: 1.14 }, aus = { p: 0 };
  let heroMarkeEin = 0;
  function auftaktZeichnen() {
    const p = aus.p;
    const N = Math.max(1, woerterZustand.length);
    woerterZustand.forEach((o, i) => { o.aus = sanft(.03 + .13 * i / N, .03 + .13 * i / N + .13, p);
      o.el.style.transform = `translate3d(0, ${(o.ein * 145 - o.aus * 135).toFixed(2)}%, 0)`; });
    const leise = sanft(.015, .15, p);
    heroUeber.style.opacity = (ein.ueber * (1 - leise)).toFixed(3);
    heroUnter.style.opacity = (ein.unter * (1 - leise)).toFixed(3);
    heroUnter.style.transform = `translate3d(0, ${(-leise * 34).toFixed(1)}px, 0)`;
    heroKnopf.parentElement.style.opacity = (1 - leise).toFixed(3);
    heroKnopf.parentElement.style.transform = `translate3d(0, ${(-leise * 46).toFixed(1)}px, 0)`;
    heroKnopf.parentElement.style.visibility = leise >= 1 ? "hidden" : "";
    if (heroMarke) { heroMarke.p = heroMarkeEin * (1 - sanft(.02, .16, p)); malMarke(heroMarke); }
    const deck = sanft(.05, .3, p);
    blatt.style.transform = deck > 0 ? `translate3d(0, ${(101 * (1 - deck)).toFixed(2)}%, 0)` : `translate3d(0, ${ein.blatt.toFixed(2)}%, 0)`;
    heroImg.style.transform = `scale(${(ein.bild + deck * .06).toFixed(4)})`;
    heroBild.style.transform = `translate3d(0, ${(-deck * 5).toFixed(2)}vh, 0)`;
    heroBild.style.opacity = (1 - sanft(.24, .3, p)).toFixed(3);
    heroBild.style.visibility = deck >= 1 ? "hidden" : "";
    const u = sanft(.3, .38, p);
    warumUeber.style.opacity = u.toFixed(3); warumUeber.style.transform = `translate3d(0, ${((1 - u) * 18).toFixed(1)}px, 0)`;
    const M = Math.max(1, haltZustand.length);
    haltZustand.forEach((o, i) => { const a = .33 + .42 * i / M; o.e = sanft(a, a + .11, p);
      o.el.style.transform = o.e >= 1 ? "none" : `translate3d(0, ${((1 - o.e) * 145).toFixed(2)}%, 0) rotate(${((1 - o.e) * 5).toFixed(2)}deg)`; });
    if (haltMarke) { haltMarke.p = sanft(.8, .95, p); malMarke(haltMarke); }
  }
  buehne($(".auftakt"), p => { aus.p = p; auftaktZeichnen(); });
  const navZug = strich($(".marke-zug canvas"));
  const auftakt = gsap.timeline({ defaults: { ease: "expo.out" }, onUpdate: auftaktZeichnen });
  auftakt
    .to(".nav li", { opacity: 1, y: 0, duration: 1.1, stagger: .06 }, .2)
    .add(() => schreibe(navZug, navZug && navZug.tempo), .15)
    .to(ein, { ueber: 1, duration: 1 }, .25)
    .to(woerterZustand, { ein: 0, duration: 1.5, stagger: .07 }, .3)
    .to(ein, { blatt: -101, duration: 1.9, ease: "power3.inOut" }, .2)
    .to(ein, { bild: 1, duration: 2.6, ease: "power2.out" }, .2)
    .to(ein, { unter: 1, duration: 1.4, ease: "power2.out" }, .95)
    .fromTo(heroUnter, { filter: "blur(10px)" }, { filter: "blur(0px)", duration: 1.4, ease: "power2.out", onComplete: () => { heroUnter.style.filter = "none"; } }, .95)
    .to(heroKnopf, { opacity: 1, y: 0, duration: 1.2 }, 1.15);
  if (heroMarke) { const st = { k: 0 };
    auftakt.to(st, { k: 1, duration: Math.max(.7, (heroMarke.v ? heroMarke.v.dauer : 400) / 1000 * 2.4), ease: "none", onUpdate: () => { heroMarkeEin = st.k; auftaktZeichnen(); } }, 1.25); }
  const markeEl = $(".marke");
  if (navZug && markeEl) markeEl.addEventListener("pointerenter", () => { if (navZug.p < 1) return; navZug.p = 0; male(navZug, 0, true); schreibe(navZug, .45); });
  const pfs = $$(".pf").map(pf => ({ haken: strich($(".pf-haken canvas", pf)), titel: $(".pf-titel", pf), text: $(".pf-text", pf) }));
  const START = [.07, .36, .65];
  buehne($(".ansatz"), p => pfs.forEach((o, i) => {
    const s = START[i];
    if (o.haken) { o.haken.p = klemm((p - s) / .1); male(o.haken); }
    const t = sanft(s + .075, s + .135, p), x = sanft(s + .1, s + .18, p);
    o.titel.style.opacity = (.22 + .78 * t).toFixed(3);
    o.titel.style.transform = `translate3d(0, ${((1 - t) * 10).toFixed(2)}px, 0)`;
    o.text.style.opacity = x.toFixed(3);
    o.text.style.transform = `translate3d(0, ${((1 - x) * 18).toFixed(2)}px, 0)`;
  }));
  const blaetter = $$(".blatt");
  const LAGE = [[-2.4, 120], [1.6, 190], [-1.3, 150]], FLATTERN = [.9, -.7, .6];
  blaetter.forEach((b, i) => gsap.fromTo($(".blatt-papier", b), { rotation: LAGE[i][0], y: LAGE[i][1] }, { rotation: 0, y: 0, ease: "none", snap: { y: 1 },
    scrollTrigger: { trigger: ".blaetter", start: "top bottom", end: "top 42%", scrub: .9,
      onToggle: s => $(".blatt-papier", b).classList.toggle("bewegt-sich", s.isActive) } }));
  gsap.to(".ueber-bild .bild-blatt", { yPercent: -101, ease: "none", scrollTrigger: { trigger: ".ueber", start: "top 88%", end: "top 22%", scrub: .9 } });
  gsap.fromTo(".ueber-bild img", { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".ueber", start: "top 88%", end: "top 5%", scrub: .9 } });
  const band = $(".laufbahn-band");
  const stationen = $$(".station").map(st => ({ st, jahr: $(".station-jahr > span", st), satz: $(".station-satz", st), mitte: 0 }));
  stationen.forEach(o => { o.marke = marke(o.jahr); });
  const weg = { x0: 0, lauf: 0, p: 0 };
  const wegMass = () => { if (!band || !stationen.length) return; const W = H.clientWidth;
    stationen.forEach(o => { o.mitte = o.st.offsetLeft + o.jahr.offsetWidth / 2; });
    weg.x0 = .7 * W - stationen[0].mitte; weg.lauf = Math.max(1, stationen[stationen.length - 1].mitte + weg.x0 - .4 * W); };
  let wegNeig = 0;
  function wegZeichnen() {
    if (!band) return; const W = H.clientWidth, x = weg.x0 - weg.p * weg.lauf;
    band.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0) skewX(${wegNeig.toFixed(2)}deg)`;
    stationen.forEach(o => {
      const q = klemm((.64 * W - (o.mitte + x)) / (.24 * W));
      if (o.marke) { o.marke.p = klemm(q / .85); malMarke(o.marke); }
      const steht = sanft(.55, .95, q), satzE = sanft(.7, 1, q);
      o.jahr.style.opacity = (.2 + .8 * steht).toFixed(3);
      o.satz.style.opacity = satzE.toFixed(3);
      o.satz.style.transform = `translate3d(0, ${((1 - satzE) * 26).toFixed(1)}px, 0)`;
    });
  }
  buehne($(".laufbahn"), p => { weg.p = p; wegZeichnen(); });
  $$(".stimmen .spalte").forEach(sp => { const k = +sp.dataset.tempo;
    gsap.fromTo(sp, { y: () => k * innerHeight }, { y: () => -k * innerHeight, ease: "none", scrollTrigger: { trigger: ".stimmen", start: "top bottom", end: "bottom top", scrub: 1, invalidateOnRefresh: true } }); });
  const unter = marke($("#kontakt-titel [data-mark]"));
  ScrollTrigger.create({ trigger: "#kontakt-titel", start: "top 72%", once: true, onEnter: () => schreibe(unter, 2.6, 1.15) });
  const fussZug = strich($(".fuss-zug canvas"));
  ScrollTrigger.create({ trigger: ".fuss", start: "top 72%", once: true, onEnter: () => schreibe(fussZug, 1, .2) });
  let navY = 0;
  function navSchritt() {
    const y = lenis.scroll, dy = y - navY;
    nav.classList.toggle("matt", y > 40);
    if (Math.abs(dy) > 6) { nav.classList.toggle("weg", dy > 0 && y > 260); navY = y; }
    if (y < 260) nav.classList.remove("weg");
  }
  const magnete = feinZeiger ? $$("[data-magnet]").map(b => {
    const m = { b, wort: $(".knopf-wort", b), x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, ruht: true };
    b.addEventListener("pointermove", e => { const r = b.getBoundingClientRect();
      m.tx = (e.clientX - r.left - r.width / 2) * .28; m.ty = (e.clientY - r.top - r.height / 2) * .36; m.ruht = false; });
    b.addEventListener("pointerleave", () => { m.tx = 0; m.ty = 0; m.ruht = false; });
    return m; }) : [];
  function magnetSchritt(dt) {
    for (const m of magnete) { if (m.ruht) continue;
      const n = Math.max(1, Math.ceil(dt / .008)), h = dt / n;
      for (let i = 0; i < n; i++) { m.vx += (170 * (m.tx - m.x) - 13 * m.vx) * h; m.vy += (170 * (m.ty - m.y) - 13 * m.vy) * h; m.x += m.vx * h; m.y += m.vy * h; }
      if (Math.abs(m.tx - m.x) + Math.abs(m.ty - m.y) + Math.abs(m.vx) + Math.abs(m.vy) < .02) { m.x = m.tx; m.y = m.ty; m.vx = m.vy = 0; if (!m.tx && !m.ty) m.ruht = true; }
      m.b.style.translate = `${m.x.toFixed(2)}px ${m.y.toFixed(2)}px`;
      if (m.wort) m.wort.style.transform = `translate3d(${(m.x * .35).toFixed(2)}px, ${(m.y * .35).toFixed(2)}px, 0)`; }
  }
  const geneigt = [".marke-zug", ".fuss-zug"].map(s => $(s)).filter(Boolean);
  let eile = 0;
  function tempoSchritt(dt) {
    const ziel = klemm((lenis.velocity || 0) / 45, -1, 1);
    eile += (ziel - eile) * Math.min(1, dt * (Math.abs(ziel) > Math.abs(eile) ? 6 : 1.6));
    if (Math.abs(eile) < .004 && Math.abs(ziel) < .004) eile = 0;
    const neig = (-eile * 9).toFixed(2);
    geneigt.forEach(el => { el.style.transform = `skewX(${neig}deg)`; });
    const wn = -eile * 7; if (Math.abs(wn - wegNeig) > .01 || (!eile && wegNeig)) { wegNeig = eile ? wn : 0; wegZeichnen(); }
    blaetter.forEach((b, i) => { b.style.transform = eile ? `rotate(${(eile * FLATTERN[i]).toFixed(3)}deg) translateY(${(Math.abs(eile) * -6).toFixed(2)}px)` : ""; });
  }
  let tAlt = null;
  gsap.ticker.add(time => {
    const dt = tAlt === null ? 1 / 60 : Math.min(.05, Math.max(0, time - tAlt)); tAlt = time;
    federn(dt); navSchritt(); magnetSchritt(dt); tempoSchritt(dt);
  });
  const nachLayout = () => { striche.forEach(S => male(S, S.p, true)); legeAlle(); wegMass(); wegZeichnen(); ScrollTrigger.refresh(); };
  addEventListener("resize", () => { legeAlle(); wegMass(); wegZeichnen(); });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(nachLayout);
  addEventListener("load", nachLayout);
  legeAlle(); wegMass(); auftaktZeichnen(); wegZeichnen();
})();
