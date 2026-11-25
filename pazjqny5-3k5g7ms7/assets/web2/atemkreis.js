
(() => {
  "use strict";
  const H = document.documentElement;
  const bewegt = H.classList.contains("bewegt") && !!(window.gsap && window.ScrollTrigger && window.Lenis);
  if (!bewegt) H.classList.remove("bewegt");
  H.classList.add("laeuft");
  const feinZeiger = matchMedia("(pointer: fine)").matches;
  const klemm = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const sanft = (a, b, v) => { const k = klemm((v - a) / (b - a)); return k * k * (3 - 2 * k); };
  const misch = (a, b, k) => a + (b - a) * k;
  const expoAus = k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k);
  const NAV = 84;
  const TAG = ["#0A2A9E", "#0B3FD0", "#14C4E4", "#4FDCEC"], NACHT = ["#2F5BFF", "#4C7BFF", "#14C4E4", "#6FE6F2"];
  const FORM = [[2, .048, .4], [3, .022, 1.9]];
  const atemWert = t => { const p = ((t % 10) + 10) % 10 / 10; return p < .4 ? .5 - .5 * Math.cos(Math.PI * p / .4) : .5 + .5 * Math.cos(Math.PI * (p - .4) / .6); };
  let unruhe = 0;
  const kreise = [...document.querySelectorAll("canvas[data-kreis]")].map(c => ({
    c, x: c.getContext("2d"), art: c.dataset.kreis, phase: +(c.dataset.phase || 0),
    farben: c.dataset.nacht !== undefined ? NACHT : TAG, breite: .5,
    dprMax: c.dataset.gross !== undefined || c.dataset.kreis === "buehne" || c.dataset.kreis === "hero" ? 1.5 : 2,
    sichtbar: !bewegt, extra: 0, ext: null, umriss: null }));
  const grosse = kreise.filter(K => K.c.dataset.gross !== undefined || K.art === "buehne" || K.art === "hero");
  const heroRuhe = (W, Hv) => { const Rm = Math.max(150, ((Hv - NAV) / 2 - 20) / 1.05); return { cx: W - Rm * .6, cy: NAV + (Hv - NAV) / 2, Rm }; };
  function zeichne(K, t) {
    const c = K.c, x = K.x, d = Math.min(devicePixelRatio || 1, K.dprMax);
    const W = Math.round(c.clientWidth * d), Hh = Math.round(c.clientHeight * d);
    if (!W || !Hh) return;
    if (c.width !== W || c.height !== Hh) { c.width = W; c.height = Hh; }
    const steht = !bewegt, E = K.ext;
    const tt = steht ? 0 : t + K.phase;
    let ein, cx, cy, R;
    if (E) { ein = E.ein; cx = E.cx * d; cy = E.cy * d; R = E.R * d; }
    else { ein = steht ? .6 : atemWert(tt); cx = W / 2; cy = Hh / 2; R = Math.min(W, Hh) * .44 * (.80 + .20 * ein); }
    if (!(R > 0)) return;
    const drift = steht ? 0 : tt * .2 + ein * .9 + K.extra, formStaerke = 1.86 - 1.26 * ein + unruhe * .95, n = 200;
    x.clearRect(0, 0, W, Hh); x.beginPath(); const umriss = [];
    for (let i = 0; i <= n; i++) { const w = i / n * Math.PI * 2; let r = 1;
      for (const [k, amp, ph] of FORM) r += amp * formStaerke * Math.sin(k * w + ph + drift * (k % 2 ? 1 : -1));
      const px = cx + Math.cos(w) * R * r, py = cy + Math.sin(w) * R * r; i ? x.lineTo(px, py) : x.moveTo(px, py);
      if (i % 2 === 0) umriss.push([px / d, py / d]); }
    K.umriss = umriss; c.umriss = umriss; x.closePath();
    const [o1, o2, u1, u2] = K.farben, top = cy - R * 1.2, bot = cy + R * 1.2;
    const gyRel = cy + R * (steht ? .05 : .16 - .3 * ein);
    const gy = E && E.gy != null ? E.gy * d : gyRel, welle = steht ? 0 : (E && E.welle != null ? E.welle * d : R);
    const kipp = steht ? 0 : .06 * Math.sin(tt * .37) * (E && E.kipp != null ? E.kipp : 1);
    const grenze = xx => { const u = (xx - cx) / R; return gy + welle * (.085 * Math.sin(u * 2.4 + tt * 1.3) + .04 * Math.sin(u * 4.3 - tt * .95 + 1.1)) + (xx - cx) * kipp; };
    const lage = y => klemm((y - top) / (bot - top));
    x.save(); x.clip();
    const b = E && E.band != null ? E.band * d : 2 * R * K.breite, sp = Math.max(2 * d, Math.min(R / 36, 40 * d));
    const x0 = Math.max(0, cx - R * 1.3), x1 = Math.min(W, cx + R * 1.3), y0 = Math.max(0, cy - R * 1.3), y1 = Math.min(Hh, cy + R * 1.3);
    for (let xx = x0; xx < x1; xx += sp) { const g0 = grenze(xx + sp / 2), g = x.createLinearGradient(0, top, 0, bot);
      const k1 = lage(g0 - b / 2), k2 = Math.max(k1 + .001, lage(g0 + b / 2));
      g.addColorStop(0, o1); g.addColorStop(k1, o2); g.addColorStop(Math.min(1, k2), u1); g.addColorStop(1, u2);
      x.fillStyle = g; x.fillRect(xx, y0, sp + 1, y1 - y0); }
    x.restore();
  }
  function woerterBauen(el, satzUmbruch) {
    const frag = document.createDocumentFragment(); let letztes = null;
    const fenster = knoten => { const m = document.createElement("span"), i = document.createElement("span"); m.className = "wm";
      i.appendChild(knoten); m.appendChild(i); frag.appendChild(m); letztes = m; };
    const luecke = () => { if (letztes) { frag.appendChild(document.createTextNode(" ")); letztes = null; } };
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => { if (!t) return;
        if (/^\s+$/.test(t)) { if (satzUmbruch && letztes && /[.!?]$/.test(letztes.textContent)) { frag.appendChild(document.createElement("br")); letztes = null; } else luecke(); return; }
        if (letztes && frag.lastChild === letztes) letztes.firstChild.appendChild(document.createTextNode(t)); else fenster(document.createTextNode(t)); });
      else if (n.nodeName === "BR") { frag.appendChild(document.createElement("br")); letztes = null; }
      else if (n.nodeType === 1) { if (letztes && frag.lastChild === letztes) letztes.firstChild.appendChild(n.cloneNode(true)); else fenster(n.cloneNode(true)); }
    });
    el.textContent = ""; el.appendChild(frag);
  }
  document.querySelectorAll("[data-woerter]").forEach(el => woerterBauen(el, el.classList.contains("haltung-satz")));
  const kopien = new Map();
  const weisse = [...document.querySelectorAll("[data-weiss]")].map(el => {
    const hulle = document.createElement("div"); hulle.className = "wk" + (el.closest(".nav") ? " nav-wk" : "");
    el.parentNode.insertBefore(hulle, el); hulle.appendChild(el);
    let k;
    if (/^H\d$/.test(el.tagName)) { k = document.createElement("div"); k.className = el.className; k.innerHTML = el.innerHTML; }
    else k = el.cloneNode(true);
    k.removeAttribute("id"); k.removeAttribute("data-weiss"); k.removeAttribute("data-hero"); k.removeAttribute("data-woerter"); k.classList.add("weiss"); k.setAttribute("aria-hidden", "true");
    k.querySelectorAll("a").forEach(a => { a.setAttribute("tabindex", "-1"); a.removeAttribute("href"); });
    hulle.appendChild(k); kopien.set(el, k);
    return { el, k, nav: !!el.closest(".nav"), clip: "" };
  });
  const LEER = "polygon(0 0, 0 0, 0 0)";
  const setzeClip = (w, wert) => { if (w.clip !== wert) { w.clip = wert; w.k.style.clipPath = wert; } };
  function weissSchritt() {
    for (const w of weisse) {
      if (w.nav && nav.classList.contains("matt")) { setzeClip(w, LEER); continue; }
      const rk = w.k.getBoundingClientRect();
      if (rk.bottom < 0 || rk.top > innerHeight || !rk.width) { setzeClip(w, LEER); continue; }
      let poly = null;
      for (const K of grosse) {
        if (!K.umriss) continue;
        const rc = K.c.getBoundingClientRect();
        if (rc.right < rk.left || rc.left > rk.right || rc.bottom < rk.top || rc.top > rk.bottom || !rc.width) continue;
        const sx = rc.width / (K.c.clientWidth || 1), sy = rc.height / (K.c.clientHeight || 1), dx = rc.left - rk.left, dy = rc.top - rk.top;
        poly = "polygon(" + K.umriss.map(([px, py]) => (dx + px * sx).toFixed(1) + "px " + (dy + py * sy).toFixed(1) + "px").join(",") + ")";
        break;
      }
      setzeClip(w, poly || LEER);
    }
  }
  const paar = (el, sel) => { const k = kopien.get(el); return [...el.querySelectorAll(sel), ...(k ? k.querySelectorAll(sel) : [])]; };
  const satz = document.querySelector(".haltung-satz");
  const fussWort = document.querySelector(".fuss-wort");
  if (fussWort) { const t = fussWort.textContent;
    fussWort.innerHTML = [...t].map(ch => `<span class="bst" aria-hidden="true"><span>${ch === " " ? " " : ch}</span></span>`).join(""); }
  const passeWortmarke = () => { if (!fussWort) return; fussWort.style.fontSize = "100px";
    const b = [...fussWort.querySelectorAll(".bst > span")], breite = b[b.length - 1].getBoundingClientRect().right - b[0].getBoundingClientRect().left;
    const verfuegbar = fussWort.clientWidth; if (breite > 0) fussWort.style.fontSize = (100 * verfuegbar / breite * .995).toFixed(2) + "px"; };
  const spur = document.querySelector(".band-spur");
  if (spur) [...spur.children].forEach(f => { const k = f.cloneNode(true); k.setAttribute("aria-hidden", "true"); spur.appendChild(k); });
  const kieselForm = (sk, ph) => { const pts = []; for (let k = 0; k < 120; k++) { const a = k / 120 * 2 * Math.PI, r = (1 + .08 * (.6 * Math.sin(2 * a + .7 + ph) + .4 * Math.sin(3 * a + 2.1 - ph))) * sk;
    pts.push([.5 + .5 * r / 1.08 * Math.cos(a), .5 + .5 * r / 1.08 * Math.sin(a)]); } return "M" + pts.map(p => p.map(v => v.toFixed(4)).join(" ")).join("L") + "Z"; };
  if (bewegt) { const pfad = document.getElementById("kieselAtemPfad");
    if (pfad) { const d0 = kieselForm(.94, 0), d1 = kieselForm(1, .35), an = document.createElementNS("http://www.w3.org/2000/svg", "animate");
      pfad.setAttribute("d", d0);
      Object.entries({ attributeName: "d", values: `${d0};${d1};${d0}`, keyTimes: "0;.4;1", calcMode: "spline", keySplines: ".45 0 .55 1;.45 0 .55 1", dur: "10s", repeatCount: "indefinite" })
        .forEach(([k, v]) => an.setAttribute(k, v));
      pfad.appendChild(an); } }
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
      const danke = form.querySelector(".danke"); danke.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => { form.classList.add("gesendet"); if (!bewegt) kreise.forEach(K => zeichne(K, 0)); }));
    });
  }
  const nav = document.getElementById("nav");
  const heroK = kreise.find(K => K.art === "hero");
  if (!bewegt) {
    const alles = () => { if (heroK) { const r = heroRuhe(heroK.c.clientWidth, heroK.c.clientHeight); heroK.ext = { ein: .6, cx: r.cx, cy: r.cy, R: r.Rm * .93 }; }
      kreise.forEach(K => zeichne(K, 0)); weissSchritt(); };
    const navZustand = () => nav.classList.toggle("matt", scrollY > 8);
    addEventListener("scroll", () => { navZustand(); weissSchritt(); }, { passive: true });
    addEventListener("resize", () => { alles(); passeWortmarke(); });
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { alles(); passeWortmarke(); });
    navZustand(); alles(); passeWortmarke();
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
  const io = new IntersectionObserver(es => es.forEach(e => { const K = kreise.find(k => k.c === e.target); if (K) K.sichtbar = e.isIntersecting; }), { rootMargin: "120px" });
  kreise.forEach(K => io.observe(K.c));
  const navListe = document.querySelector(".nav ul");
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .to(".nav .marke", { opacity: 1, y: 0, duration: 1.1 }, .15)
    .to(navListe.querySelectorAll("li"), { opacity: 1, y: 0, duration: 1.1, stagger: .06 }, .25);
  document.querySelectorAll("[data-zeilen]").forEach(h => ScrollTrigger.create({ trigger: h, start: "top 87%", once: true,
    onEnter: () => gsap.to(h.querySelectorAll(".zeile > span"), { y: 0, duration: 1.4, ease: "expo.out", stagger: .1 }) }));
  ScrollTrigger.batch("[data-auftritt]", { start: "top 90%", once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: .09, overwrite: true }) });
  document.querySelectorAll(".ang-linie").forEach(l => ScrollTrigger.create({ trigger: l.parentNode, start: "top 88%", once: true,
    onEnter: () => gsap.to(l, { scaleX: 1, duration: 1.8, ease: "expo.inOut" }) }));
  gsap.fromTo(".ueber-rahmen", { scale: .72 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".ueber", start: "top bottom", end: "top 15%", scrub: .9 } });
  gsap.fromTo(".ueber-rahmen img", { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".ueber", start: "top bottom", end: "top 15%", scrub: .9 } });
  gsap.to(".zl-schiene i", { scaleY: 1, ease: "none", scrollTrigger: { trigger: ".zeitleiste", start: "top 74%", end: "bottom 58%", scrub: .9 } });
  document.querySelectorAll(".zeitleiste li").forEach(li => ScrollTrigger.create({ trigger: li, start: "top 70%",
    onEnter: () => li.classList.add("an"), onLeaveBack: () => li.classList.remove("an") }));
  gsap.fromTo(".kontakt-kreis", { yPercent: 7 }, { yPercent: -7, ease: "none", scrollTrigger: { trigger: ".kontakt", start: "top bottom", end: "bottom bottom", scrub: .9 } });
  ScrollTrigger.create({ trigger: ".fuss-wort", start: "top 94%", once: true,
    onEnter: () => gsap.to(".fuss-wort .bst > span", { y: 0, duration: 1.5, ease: "expo.out", stagger: .035 }) });
  const feder = (f, dt) => { const n = Math.max(1, Math.ceil(dt / .008)), h = dt / n;
    for (let i = 0; i < n; i++) { const a = (130 * (f.ziel - f.ist) - 32 * f.v) / .7; f.v += a * h; f.ist += f.v * h; } return klemm(f.ist); };
  const setze = (el, eig, wert) => { const k = "_" + eig; if (el[k] !== wert) { el[k] = wert; el.style[eig] = wert; } };
  const abBuehne = document.querySelector(".atem-buehne"), heroSek = document.querySelector(".hero");
  const heroTitel = document.querySelector(".hero-titel"), heroWk = [...document.querySelectorAll(".hero-text > .wk")];
  const [ueberWk, , unterWk] = heroWk, heroKnopf = document.querySelector(".hero-knopf");
  const hw = [...heroTitel.querySelectorAll(".wm > span")], hwK = [...kopien.get(heroTitel).querySelectorAll(".wm > span")];
  const sw = satz ? [...satz.querySelectorAll(".wm > span")] : [], warumUeber = document.querySelector(".warum-ueber");
  const hf = { ziel: 0, ist: 0, v: 0 };
  ScrollTrigger.create({ trigger: abBuehne, start: "top top", end: "bottom bottom",
    onUpdate: s => { hf.ziel = s.progress; }, onRefresh: s => { hf.ziel = s.progress; } });
  let tStart = null;
  function heroSchritt(dt, time) {
    if (tStart === null) tStart = time;
    const seit = time - tStart, p = feder(hf, dt);
    const auf = 1 - Math.pow(1 - klemm((seit - .05) / 3.2), 2);
    const W = heroK.c.clientWidth, Hv = heroK.c.clientHeight, r = heroRuhe(W, Hv);
    const s = sanft(0, .44, p), sb = sanft(.1, .44, p), atem = atemWert(time + heroK.phase);
    const ein = atem + (1 - atem) * sanft(0, .3, p);
    const Rruhe = r.Rm * (.82 + .18 * ein) * (.62 + .38 * auf), Rdeck = Math.hypot(W, Hv) / 2 / .86;
    const cx = misch(r.cx, W / 2, s), cy = misch(r.cy, Hv / 2, s), R = misch(Rruhe, Rdeck, Math.pow(s, 1.35));
    heroK.ext = { ein, cx, cy, R, gy: misch(cy + R * (.16 - .3 * ein), Hv * .8, sb), band: misch(R, Hv * .32, sb),
      welle: misch(R, Hv * .36, sb) * (1 + unruhe * .9), kipp: misch(1, .35, sb) };
    setze(heroK.c, "opacity", auf >= 1 ? "1" : auf.toFixed(3));
    const n = hw.length;
    for (let i = 0; i < n; i++) { const e = expoAus(klemm((seit - .35 - .07 * i) / 1.5)), a = .07 + .14 * i / Math.max(1, n - 1), o = sanft(a, a + .12, p);
      const t = `translate3d(0, ${((1 - e) * 130 - o * 130).toFixed(2)}%, 0)`; setze(hw[i], "transform", t); if (hwK[i]) setze(hwK[i], "transform", t); }
    const ue = expoAus(klemm((seit - .3) / 1)), ueO = sanft(.03, .14, p);
    setze(ueberWk, "opacity", (ue * (1 - ueO)).toFixed(3)); setze(ueberWk, "transform", `translate3d(0, ${(-ueO * 30).toFixed(1)}px, 0)`);
    const un = 1 - Math.pow(1 - klemm((seit - .85) / 1.4), 2), unO = sanft(.09, .24, p);
    setze(unterWk, "opacity", (un * (1 - unO)).toFixed(3)); setze(unterWk, "transform", `translate3d(0, ${(-unO * 44).toFixed(1)}px, 0)`);
    setze(unterWk, "filter", un >= 1 ? "none" : `blur(${((1 - un) * 10).toFixed(2)}px)`);
    const kn = expoAus(klemm((seit - 1.05) / 1.2)), knO = sanft(.12, .26, p);
    setze(heroKnopf, "opacity", (kn * (1 - knO)).toFixed(3)); setze(heroKnopf, "transform", `translate3d(0, ${((1 - kn) * 18 - knO * 44).toFixed(1)}px, 0)`);
    heroSek.classList.toggle("fort", p > .2);
    const wu = sanft(.38, .48, p);
    setze(warumUeber, "opacity", wu.toFixed(3)); setze(warumUeber, "transform", `translate3d(0, ${((1 - wu) * 24).toFixed(1)}px, 0)`);
    const m = sw.length;
    for (let i = 0; i < m; i++) { const a = .42 + .34 * i / Math.max(1, m - 1), v = sanft(a, a + .1, p);
      setze(sw[i], "transform", `translate3d(0, ${((1 - v) * 130).toFixed(2)}%, 0)`); }
  }
  const ansatz = document.querySelector(".ansatz"), buehneK = kreise.find(K => K.art === "buehne");
  const pfs = [...document.querySelectorAll(".pf")].map(pf => ({ pf, zeilen: [paar(pf.querySelector(".pf-titel"), ".zeile:nth-child(1) > span"), paar(pf.querySelector(".pf-titel"), ".zeile:nth-child(2) > span")],
    text: pf.querySelector(".pf-text") }));
  const amNr = [...document.querySelectorAll(".am-nr")];
  const FENSTER = [[0, .06, .31, .365], [.365, .425, .605, .66], [.66, .72, 2, 3]];
  const af = { ziel: 0, ist: 0, v: 0 };
  ScrollTrigger.create({ trigger: ansatz, start: "top top", end: "bottom bottom",
    onUpdate: s => { af.ziel = s.progress; }, onRefresh: s => { af.ziel = s.progress; } });
  function buehneSchritt(dt) {
    const p = feder(af, dt);
    const ein = sanft(.04, .36, p) * (1 - sanft(.64, .95, p)), halten = sanft(.36, .5, p) * (1 - sanft(.5, .64, p));
    const W = buehneK.c.clientWidth, Hv = buehneK.c.clientHeight;
    buehneK.ext = { ein, cx: W * .65, cy: Hv * .5, R: Hv * (.15 + .29 * ein) * (1 + .03 * halten) };
    pfs.forEach((o, i) => {
      const [a, b, c, d] = FENSTER[i], rein = sanft(a, b, p), raus = sanft(c, d, p), vis = rein * (1 - raus), richtung = raus > 0 ? -1 : 1;
      o.zeilen.forEach((spans, j) => { const v = klemm(vis * 1.18 - j * .18), y = (1 - v) * 112 * richtung;
        spans.forEach(s => { s.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`; }); });
      const tv = klemm(vis * 1.3 - .3);
      o.text.style.opacity = tv.toFixed(3);
      o.text.style.transform = `translate3d(0, ${((1 - tv) * 26 * richtung).toFixed(1)}px, 0)`;
    });
    const aktiv = p < .365 ? 0 : p < .66 ? 1 : 2;
    amNr.forEach((e, i) => e.classList.toggle("an", i === aktiv));
  }
  let mx = -1e4, my = -1e4, mausDa = false;
  if (feinZeiger) { addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; mausDa = true; }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { mausDa = false; }); }
  const magnete = [...document.querySelectorAll("[data-magnet]")].map((b, i) => {
    const m = { b, i, wort: b.querySelector(".knopf-wort"), x: 0, y: 0, vx: 0, vy: 0, nah: 0, sicht: false };
    new IntersectionObserver(es => { m.sicht = es[0].isIntersecting; }, { rootMargin: "80px" }).observe(b);
    return m; });
  function magnetSchritt(dt, time) {
    for (const m of magnete) { if (!m.sicht) continue;
      let tx = 0, ty = 0, f = 0;
      if (feinZeiger && mausDa) { const r = m.b.getBoundingClientRect(), dx = mx - (r.left + r.width / 2 - m.x), dy = my - (r.top + r.height / 2 - m.y);
        const feld = Math.max(170, r.width * 1.5), k = klemm(1 - Math.hypot(dx, dy) / feld); f = k * k * (3 - 2 * k);
        tx = klemm(dx * .3 * f, -30, 30); ty = klemm(dy * .38 * f, -24, 24); }
      m.nah += (f - m.nah) * Math.min(1, dt * (f > m.nah ? 6 : 2.5));
      const n = Math.max(1, Math.ceil(dt / .008)), h = dt / n;
      for (let i = 0; i < n; i++) { m.vx += (170 * (tx - m.x) - 13 * m.vx) * h; m.vy += (170 * (ty - m.y) - 13 * m.vy) * h; m.x += m.vx * h; m.y += m.vy * h; }
      if (Math.abs(m.x) + Math.abs(m.y) + Math.abs(m.vx) + Math.abs(m.vy) < .02 && !tx && !ty) { m.x = m.y = m.vx = m.vy = 0; }
      setze(m.b, "transform", `translate3d(${m.x.toFixed(2)}px, ${m.y.toFixed(2)}px, 0)`);
      if (m.wort) setze(m.wort, "transform", `translate3d(${(m.x * .35).toFixed(2)}px, ${(m.y * .35).toFixed(2)}px, 0)`);
    }
  }
  const band = document.querySelector("[data-band]");
  let bandX = 0, bandTempo = 1, bandZiel = 1, bandHalb = 0, bandSichtbar = false;
  if (band) { band.addEventListener("pointerenter", () => { bandZiel = 0; }); band.addEventListener("pointerleave", () => { bandZiel = 1; });
    band.addEventListener("focusin", () => { bandZiel = 0; }); band.addEventListener("focusout", () => { bandZiel = 1; });
    new IntersectionObserver(es => { bandSichtbar = es[0].isIntersecting; }).observe(band); }
  const messeBand = () => { if (spur) bandHalb = spur.scrollWidth / 2 + 11; };
  function bandSchritt(dt) {
    if (!band || !bandSichtbar || !bandHalb) return;
    bandTempo += (bandZiel - bandTempo) * Math.min(1, dt * 3.5);
    bandX -= (32 + unruhe * 160) * bandTempo * dt;
    if (bandX <= -bandHalb) bandX += bandHalb;
    spur.style.transform = `translate3d(${bandX.toFixed(2)}px, 0, 0)`;
  }
  let navY = 0;
  function navSchritt() {
    const y = lenis.scroll, dy = y - navY;
    nav.classList.toggle("matt", y > 8);
    if (Math.abs(dy) > 6) { nav.classList.toggle("weg", dy > 0 && y > 260); navY = y; }
    if (y < 260) nav.classList.remove("weg");
  }
  let tAlt = null;
  gsap.ticker.add(time => {
    const dt = tAlt === null ? 1 / 60 : Math.min(.05, Math.max(0, time - tAlt)); tAlt = time;
    const ziel = Math.min(1, Math.abs(lenis.velocity || 0) / 55);
    unruhe += (ziel - unruhe) * Math.min(1, dt * (ziel > unruhe ? 7 : 1.4));
    if (heroK.sichtbar) heroSchritt(dt, time);
    buehneSchritt(dt);
    for (const K of kreise) { K.extra += unruhe * dt * 1.4; if (K.sichtbar) zeichne(K, time); }
    weissSchritt(); navSchritt(); magnetSchritt(dt, time); bandSchritt(dt);
  });
  const nachLayout = () => { passeWortmarke(); messeBand(); ScrollTrigger.refresh(); };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(nachLayout);
  addEventListener("load", nachLayout);
  addEventListener("resize", () => { passeWortmarke(); messeBand(); });
  passeWortmarke(); messeBand();
})();
