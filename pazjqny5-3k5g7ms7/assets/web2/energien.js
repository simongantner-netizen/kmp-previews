
(() => {
  const html = document.documentElement, $ = (s, w = document) => w.querySelector(s), $$ = (s, w = document) => [...w.querySelectorAll(s)];
  const bewegt = html.classList.contains("bewegt") && window.gsap && window.ScrollTrigger && window.Lenis;
  const feinZeiger = matchMedia("(pointer: fine)").matches;
  const klemme = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const woerterIn = (el, bau) => { const teile = [];
    [...el.childNodes].forEach(n => { if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => t && teile.push(t)); else teile.push(n); });
    el.textContent = ""; let i = 0;
    teile.forEach(t => { if (typeof t === "string" && /^\s+$/.test(t)) { el.append(" "); return; } el.append(bau(t, i++)); }); };
  const maske = (t, klasse, innen) => { const m = document.createElement("span"); m.className = klasse; let z = m;
    innen.forEach(k => { const e = document.createElement("span"); e.className = k; z.append(e); z = e; });
    z.append(t); return { m, z }; };
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
    [name, mail].forEach(f => f.addEventListener("input", () => { const box = f.closest(".feld"); if (box.classList.contains("falsch")) {
      box.classList.remove("falsch"); f.setAttribute("aria-invalid", "false"); box.querySelector(".fehler").textContent = ""; } }));
  }
  $$("a[data-tot]").forEach(a => a.addEventListener("click", e => e.preventDefault()));
  const titel = $(".hero-titel");
  if (titel) woerterIn(titel, (t, i) => { const { m, z } = maske(t, "hw", ["hw-aus", "hw-ein"]); z.style.setProperty("--v", i); return m; });
  $$("[data-lesen]").forEach(p => woerterIn(p, t => { const { m } = maske(t, "w", ["w-in"]);
    if (/^Freude/.test(typeof t === "string" ? t : t.textContent)) m.classList.add("freude"); return m; }));
  if (!bewegt) {
    html.classList.remove("bewegt"); html.classList.add("bereit", "los");
    const nav = $("#nav"), belegt = () => nav.classList.toggle("belegt", scrollY > 30); addEventListener("scroll", belegt, { passive: true }); belegt();
    return;
  }
  const { gsap, ScrollTrigger } = window; gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  history.scrollRestoration = "manual";
  let einstiegZiel = null;
  const kurve = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  document.addEventListener("click", e => { const a = e.target.closest('a[href^="#"]'); if (!a || a.hasAttribute("data-tot")) return;
    const id = a.getAttribute("href"); if (id === "#") return;
    const ziel = id === "#top" ? 0 : id === "#warum" && einstiegZiel ? einstiegZiel() : $(id); if (ziel === null) return;
    e.preventDefault(); const offen = ziel && ziel.matches && ziel.matches(".ang") ? -110 : 0;
    const weit = Math.abs(typeof ziel === "number" ? ziel - scrollY : ziel.getBoundingClientRect().top);
    lenis.scrollTo(ziel, { offset: offen, duration: klemme(1.1 + weit / 6000, 1.1, 2.4), easing: kurve,
      onComplete: () => { if (id === "#warum") $("#warum-titel").focus({ preventScroll: true });
        if (a.hasAttribute("data-anliegen") || (id === "#kontakt" && a.closest(".hero"))) $("#f-name").focus({ preventScroll: true }); } }); });
  const nav = $("#nav");
  lenis.on("scroll", ({ scroll, direction }) => { nav.classList.toggle("belegt", scroll > 30);
    if (nav.contains(document.activeElement)) { nav.classList.remove("weg"); return; }
    if (direction === 1 && scroll > 260) nav.classList.add("weg"); else if (direction === -1) nav.classList.remove("weg"); });
  const spur = $(".band-spur");
  if (spur) [...spur.children].forEach(li => { const k = li.cloneNode(true); k.setAttribute("aria-hidden", "true"); spur.append(k); });
  $$(".ang-unten").forEach(el => el.style.setProperty("--verz", ".12s"));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("da"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
  $$("[data-auf], [data-zeilen]").forEach(el => io.observe(el));
  const flutM = $(".flut-maske"), flutG = $(".flut-gegen"), flutEbene = $(".hero-flut"), heroStrom = $(".hero-strom");
  const flut = { y: 1 };
  const flutSetzen = () => { const y = flut.y * innerHeight;
    flutM.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`; flutG.style.transform = `translate3d(0,${(-y).toFixed(1)}px,0)`;
    heroStrom.style.visibility = flut.y > -.47 ? "" : "hidden";
    flutEbene.style.visibility = flut.y < .995 ? "" : "hidden"; };
  const hw = $$(".hero-titel .hw-aus"), satz = $$(".haltung .w-in");
  gsap.set(satz, { y: 0, yPercent: 118 });
  const einstieg = gsap.timeline({ defaults: { ease: "none" }, onUpdate: flutSetzen,
    scrollTrigger: { trigger: ".einstieg", start: "top top", end: "bottom bottom", scrub: .8 } });
  einstieg
    .to(".hero-ober", { autoAlpha: 0, y: -40, duration: .1, ease: "power1.in" }, .02)
    .to(hw, { yPercent: -118, duration: .1, stagger: { amount: .08 }, ease: "power2.in" }, .03)
    .to(".hero-zusatz", { autoAlpha: 0, y: -70, duration: .14, ease: "power1.in" }, .04)
    .to(heroStrom, { scale: 1.2, yPercent: -8, duration: .66, ease: "power1.inOut" }, 0)
    .to(flut, { y: .04, duration: .42, ease: "power1.inOut" }, .08)
    .to(".warum-ueber", { autoAlpha: 1, y: 0, duration: .07, ease: "power2.out" }, .31)
    .to(satz, { yPercent: 0, duration: .07, stagger: { amount: .3 }, ease: "power2.out" }, .34)
    .to(flut, { y: -.5, duration: .22, ease: "power1.inOut" }, .74)
    .to({}, { duration: .04 }, .96);
  flutSetzen();
  einstiegZiel = () => { const st = einstieg.scrollTrigger; return st ? st.start + (st.end - st.start) * .76 : 0; };
  const welten = $$(".welt"), masken = welten.map(w => $(".welt-maske", w)), gegen = welten.map(w => $(".welt-gegen", w));
  const pf = $$(".pf");
  const W = [null, [.34, .46], [.62, .74]];
  gsap.set(masken.slice(1), { yPercent: 100 }); gsap.set(gegen.slice(1), { yPercent: -140 });
  pf.forEach(li => { gsap.set($$(".zl > span", li), { yPercent: 135 }); gsap.set([$(".pf-nr", li), $(".pf-text", li)], { opacity: 0, y: 24 }); });
  let buehne = null;
  const sichtbar = () => { if (!buehne) return; const t = buehne.progress();
    const a2 = klemme((t - W[1][0]) / (W[1][1] - W[1][0])), a3 = klemme((t - W[2][0]) / (W[2][1] - W[2][0]));
    welten[0].style.visibility = a2 < 1 ? "visible" : "hidden";
    welten[1].style.visibility = a2 > 0 && a3 < 1 ? "visible" : "hidden";
    welten[2].style.visibility = a3 > 0 ? "visible" : "hidden";
    pf.forEach((li, i) => { const an = i === 0 ? t > .06 && t < W[1][1] : i === 1 ? t > W[1][0] && t < W[2][1] : t > W[2][0]; li.style.visibility = an ? "visible" : "hidden"; }); };
  buehne = gsap.timeline({ defaults: { ease: "none" }, onUpdate: sichtbar,
    scrollTrigger: { trigger: ".buehne", start: "top top", end: "bottom bottom", scrub: .9 } });
  const rein = (li, bei) => buehne
    .to($$(".zl > span", li), { yPercent: 0, duration: .07, stagger: .018, ease: "power2.out" }, bei)
    .to($(".pf-nr", li), { opacity: 1, y: 0, duration: .05 }, bei)
    .to($(".pf-text", li), { opacity: 1, y: 0, duration: .06 }, bei + .03);
  const raus = (li, bei) => buehne
    .to($$(".zl > span", li), { yPercent: -120, duration: .06, stagger: .012, ease: "power2.in" }, bei)
    .to([$(".pf-nr", li), $(".pf-text", li)], { opacity: 0, y: -24, duration: .05 }, bei);
  buehne
    .fromTo(".fenster", { clipPath: "inset(17% 5% 17% 52% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: .14, ease: "power2.inOut" }, 0)
    .to(".buehne-kopf", { x: -60, opacity: 0, duration: .1 }, .03);
  rein(pf[0], .1);
  raus(pf[0], W[1][0]);
  buehne.to(masken[1], { yPercent: 0, duration: W[1][1] - W[1][0], ease: "power1.inOut" }, W[1][0])
    .to(gegen[1], { yPercent: 0, duration: W[1][1] - W[1][0], ease: "power1.inOut" }, W[1][0]);
  rein(pf[1], W[1][0] + .06);
  raus(pf[1], W[2][0]);
  buehne.to(masken[2], { yPercent: 0, duration: W[2][1] - W[2][0], ease: "power1.inOut" }, W[2][0])
    .to(gegen[2], { yPercent: 0, duration: W[2][1] - W[2][0], ease: "power1.inOut" }, W[2][0]);
  rein(pf[2], W[2][0] + .06);
  buehne.to({}, { duration: .06 }, .94);
  sichtbar();
  $$(".ang-linie span").forEach(s => gsap.to(s, { scaleX: 1, ease: "none", scrollTrigger: { trigger: s.parentElement, start: "top 90%", end: "top 55%", scrub: .8 } }));
  gsap.fromTo(".portraet-flaeche", { clipPath: "inset(100% 0% 0% 0% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none",
    scrollTrigger: { trigger: ".portraet", start: "top 88%", end: "top 30%", scrub: .9 } });
  gsap.fromTo(".portraet-flaeche img", { yPercent: 12, scale: 1.08 }, { yPercent: 0, scale: 1, ease: "none",
    scrollTrigger: { trigger: ".portraet", start: "top 88%", end: "bottom 60%", scrub: .9 } });
  const stationen = $$(".station");
  let lagen = []; const messen = () => { const z = $(".zeit"); if (z) lagen = stationen.map(s => s.offsetLeft / z.offsetWidth); };
  ScrollTrigger.addEventListener("refreshInit", messen); messen();
  gsap.to(".zeit-linie span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".zeit", start: "top 88%", end: "top 45%", scrub: .8,
    onUpdate(self) { stationen.forEach((s, i) => s.classList.toggle("an", self.progress >= (lagen[i] || 0) - .005)); } } });
  gsap.fromTo(".fuss-strom", { yPercent: -28 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".fuss-buehne", start: "top bottom", end: "bottom bottom", scrub: .9 } });
  const stroeme = $$(".strom");
  let zug = 0, bandX = 0, bandTempo = 0, bandHalt = false, bandSicht = false;
  const band = $(".band");
  if (band) { band.addEventListener("pointerenter", () => bandHalt = true); band.addEventListener("pointerleave", () => bandHalt = false);
    band.addEventListener("focusin", () => bandHalt = true); band.addEventListener("focusout", () => bandHalt = false);
    new IntersectionObserver(es => es.forEach(e => bandSicht = e.isIntersecting)).observe(band); }
  gsap.ticker.add((zeit, dt) => {
    const v = lenis.velocity || 0, ziel = klemme(Math.abs(v) / 40);
    zug += (ziel - zug) * .08;
    const s = (1 + zug * .07).toFixed(4);
    for (const el of stroeme) el.style.transform = zug > .002 ? `scale(${s})` : "";
    if (spur && bandSicht) { const grund = bandHalt ? 0 : 30, schub = Math.min(280, Math.abs(v) * 6) * (bandHalt ? 0 : 1);
      bandTempo += (grund + schub - bandTempo) * .06; bandX -= bandTempo * dt / 1000;
      const halb = spur.scrollWidth / 2; if (halb > 0 && -bandX >= halb) bandX += halb; spur.style.transform = `translate3d(${bandX.toFixed(2)}px,0,0)`; } });
  if (feinZeiger) $$(".magnet").forEach(el => { const qx = gsap.quickTo(el, "x", { duration: .5, ease: "power3" }), qy = gsap.quickTo(el, "y", { duration: .5, ease: "power3" });
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .38); });
    el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, .38)", overwrite: true }); }); });
  addEventListener("resize", flutSetzen);
  const los = () => { html.classList.add("los", "bereit"); ScrollTrigger.refresh(); };
  const schrift = document.fonts ? Promise.all([document.fonts.load('700 100px "Inter Tight"'), document.fonts.load('500 24px "Inter Tight"'), document.fonts.load('400 18px "Inter Tight"')]) : Promise.resolve();
  Promise.race([schrift, new Promise(r => setTimeout(r, 1500))]).then(los, los);
  addEventListener("load", () => ScrollTrigger.refresh());
  window.__lenis = lenis;
})();
