
(() => {
  "use strict";
  const H = document.documentElement;
  const libs = !!(window.gsap && window.ScrollTrigger && window.Lenis);
  const bewegt = H.classList.contains("bewegt") && libs;
  if (!bewegt) H.classList.remove("bewegt");
  H.classList.add("bereit");
  const fein = matchMedia("(pointer: fine)").matches;
  const klemm = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const glatt = (a, b, x) => { const t = klemm((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const aus3 = t => 1 - Math.pow(1 - klemm(t), 3);
  const sinus = t => (1 - Math.cos(Math.PI * klemm(t))) / 2;
  const sinusAus = t => Math.sin(Math.PI / 2 * klemm(t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const rgb = c => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
  const mischF = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const verlauf = (fs, t) => { t = klemm(t) * (fs.length - 1); const i = Math.min(fs.length - 2, Math.floor(t)); return mischF(fs[i], fs[i + 1], t - i); };
  const BLAU = ["#0A2A9E", "#0B3FD0", "#14C4E4", "#4FDCEC"].map(hex);
  const KORALLE = ["#B8321F", "#E9573F", "#F18D46", "#FFD0A0"].map(hex);
  const TUERKIS = ["#0E9CC0", "#14C4E4", "#5FE3EE", "#C2F5F9"].map(hex);
  const enden = (fs, v) => [verlauf(fs, v * .3), verlauf(fs, .7 + v * .3)];
  const MAUS = { sx: 54, sc: 120, sy: 56, sv: 85, A: 100, Emax: 1.2, feder: 150, abstand: 16, spur: 1, heilen: .35, wachsen: .06, spurMax: 24 };
  let tempo = 0, schub = 0, zeit = 2;
  const buehne = { ziel: 0, p: 0, v: 0 };
  const auftakt = { ziel: 0, p: 0, v: 0, top: 0, lauf: 1, sch: 3.2, luecke: 160, breite: 900 };
  const AUF = { offen: [.6, 1.75], ueber: [1.2, 1.6], satz: 1.35, staffel: .85, wort: .4, anker: 2.62 };
  const ART = {
    hero:   { n: 66, lw: 1.15, dpr: 1.5, maus: true },
    buehne: { n: 50, lw: 1.35, dpr: 1.5, maus: true },
    marke:  { n: 12, lw: 1.15, dpr: 2 },
    ecke:   { n: 58, lw: 1.1, dpr: 1.25, maus: true },
    saite:  { n: 1, lw: 1.5, dpr: 2 }
  };
  const felder = [...document.querySelectorAll("canvas[data-feld]")].map((c, i) => {
    const art = c.dataset.feld;
    return { c, x: c.getContext("2d"), art, cfg: ART[art], cw: 0, ch: 0, w: 0, h: 0, d: 1, sicht: false, gemalt: false,
      zeigen: bewegt && (art === "hero" || art === "saite") ? 0 : 1, phase: i * 1.7,
      maus: null, spur: [], mk: null, mkSchluessel: "", zupf: 0, halten: 0, amp: 0 };
  });
  const feldVon = art => felder.filter(F => F.art === art);
  const heroF = feldVon("hero")[0];
  const ro = new ResizeObserver(es => es.forEach(e => { const F = felder.find(f => f.c === e.target); if (!F) return;
    F.cw = e.contentRect.width; F.ch = e.contentRect.height; F.gemalt = false; }));
  const io = new IntersectionObserver(es => es.forEach(e => { const F = felder.find(f => f.c === e.target); if (F) F.sicht = e.isIntersecting; }),
    { rootMargin: "160px 0px" });
  felder.forEach(F => { ro.observe(F.c); io.observe(F.c); });
  const maskeCanvas = (F, q) => { F.mk = F.mk || document.createElement("canvas");
    const mw = Math.max(8, Math.round(F.w * q)), mh = Math.max(8, Math.round(F.h * q));
    if (F.mk.width !== mw || F.mk.height !== mh) { F.mk.width = mw; F.mk.height = mh; F.mkSchluessel = ""; }
    return F.mk; };
  const unrund = (F, m) => {
    const q = Math.min(1, 200 / Math.max(F.w, F.h)), mk = maskeCanvas(F, q), mw = mk.width, mh = mk.height;
    const schluessel = [m.cx, m.cy, m.R, m.ov, m.dreh, m.ph[0], m.ph[1], m.ph[2], m.innen].map(v => v.toFixed(3)).join("|") + mw;
    if (schluessel !== F.mkSchluessel) {
      F.mkSchluessel = schluessel;
      const k = mk.getContext("2d"), bild = k.createImageData(mw, mh), dd = bild.data;
      const cs = Math.cos(m.dreh), sn = Math.sin(m.dreh), R = m.R * q, cx = m.cx * q, cy = m.cy * q, ov = m.ov, innen = m.innen;
      for (let py = 0; py < mh; py++) for (let px = 0; px < mw; px++) {
        const dx = px + .5 - cx, dy = py + .5 - cy;
        const xe = (dx * cs + dy * sn) / R, ye = (-dx * sn + dy * cs) / R * (1 + ov) / (1 - ov);
        const a = Math.atan2(ye, xe), r = 1 + .075 * Math.sin(2 * a + m.ph[0]) + .05 * Math.sin(3 * a + m.ph[1]) + .025 * Math.sin(5 * a + m.ph[2]);
        const u = klemm((Math.hypot(xe, ye) / r - innen) / (1 - innen));
        dd[(py * mw + px) * 4 + 3] = Math.round(255 * (1 - u * u * (3 - 2 * u)));
      }
      k.putImageData(bild, 0, 0);
    }
    return mk;
  };
  const wolke = (F, b, t, voll = 0) => {
    const q = .25, mk = maskeCanvas(F, q), k = mk.getContext("2d"), mh = mk.height, mw = mk.width;
    k.clearRect(0, 0, mw, mh);
    if (voll < 1) {
      k.globalAlpha = 1 - voll;
      const ell = (ux, uy, rx, ry) => { const cx = (b.cx + ux * b.bw) * q, cy = (b.cy + uy * b.bh) * q, RX = rx * b.bw * q, RY = ry * b.bh * q;
        k.save(); k.translate(cx, cy); k.scale(1, RY / RX); const g = k.createRadialGradient(0, 0, RX * .32, 0, 0, RX);
        g.addColorStop(0, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)"); k.fillStyle = g; k.beginPath(); k.arc(0, 0, RX, 0, Math.PI * 2); k.fill(); k.restore(); };
      ell(-.06 + .03 * Math.sin(t * .2), -.02, .36, .42);
      ell(.15 + .03 * Math.cos(t * .17), -.1 + .03 * Math.sin(t * .23), .27, .34);
      ell(-.2 + .02 * Math.sin(t * .13 + 1), .15, .22, .27);
    }
    if (voll > 0) {
      k.globalAlpha = voll;
      const g = k.createLinearGradient(0, 0, 0, mh);
      g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(.17, "rgba(0,0,0,1)"); g.addColorStop(.83, "rgba(0,0,0,1)"); g.addColorStop(1, "rgba(0,0,0,0)");
      k.fillStyle = g; k.fillRect(0, 0, mw, mh);
    }
    k.globalAlpha = 1;
    return mk;
  };
  const welle = (u, v, t, R) =>
    .055 * Math.sin(u * 6.2 + v * 2.1 + t * .7) + .035 * Math.sin(u * 11.5 - v * 4.3 - t * .45) + .02 * Math.sin((u + v) * 17 + t * .9)
    + R * (.03 * Math.sin(u * 27 + v * 11 - t * 1.6) + .02 * Math.sin(u * 43 - v * 19 + t * 2.3));
  const mausPunkte = F => { const z = F.maus; if (!z || (z.s < .005 && !F.spur.length)) return null;
    const P = F.spur.filter(q => q.s > 0); if (z.s >= .005) P.push({ x: z.px, y: z.py, s: z.s }); return P.length ? P : null; };
  const mausFeld = (F, P, xa, schritt, nS) => {
    if (!F.mE || F.mE.length < nS) { F.mE = new Float64Array(nS + 64); F.mC = new Float64Array(nS + 64); }
    const E = F.mE, C = F.mC, d = F.d, sx2 = (MAUS.sx * d) ** 2, sc2 = (MAUS.sc * d) ** 2, Emax = MAUS.Emax;
    for (let k = 0; k < nS; k++) {
      const px = xa + k * schritt; let S = 0, sw = 0, swy = 0;
      for (let j = 0; j < P.length; j++) { const q = P[j], dx2 = (px - q.x) * (px - q.x);
        S += q.s * Math.exp(-dx2 / sx2); const r = 1 + dx2 / sc2, wc = q.s / (r * r); sw += wc; swy += wc * q.y; }
      E[k] = S / Math.pow(1 + Math.pow(S / Emax, 6), 1 / 6); C[k] = sw > 1e-300 ? swy / sw : 0;
    }
    return E;
  };
  const linien = (F, o, t) => {
    const { x, d } = F, n = F.cfg.n, schritt = Math.max(3, 4 * d);
    const voll = o.ganz, x0 = voll ? Math.min(o.cx - o.bw / 2, -schritt) : o.cx - o.bw / 2, x1 = voll ? Math.max(o.cx + o.bw / 2, F.w + schritt) : o.cx + o.bw / 2;
    const xa = x0 - schritt, nS = Math.ceil((x1 + 60 * d + schritt - xa) / schritt) + 2;
    const P = mausPunkte(F), E = P ? mausFeld(F, P, xa, schritt, nS) : null, C = F.mC;
    const sy = MAUS.sy * d, sv2 = (MAUS.sv * d) ** 2, A = MAUS.A * d, L = o.luecke;
    if (!F.pts || F.pts.length < nS * 2) F.pts = new Float64Array(nS * 2 + 128);
    const pts = F.pts;
    x.globalCompositeOperation = "source-over"; x.lineWidth = F.cfg.lw * d * (o.lw || 1); x.lineCap = x.lineJoin = "round";
    for (let i = 0; i < n; i++) {
      const v = n > 1 ? i / (n - 1) : .5;
      const bis = F.zeigen >= 1 ? x1 + schritt : x0 + (x1 - x0 + 60 * d) * klemm(F.zeigen * 1.55 - v * .55);
      if (bis <= x0) continue;
      const [ca, cb] = o.farbe(v), g = x.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, rgb(ca)); g.addColorStop(1, rgb(cb)); x.strokeStyle = g; x.beginPath();
      const seite = v < .5 ? -1 : 1, rueck = L ? seite * L.G * (1 - .3 * Math.abs(2 * v - 1)) : 0;
      let m = 0;
      for (let k = 0; k < nS; k++) {
        const px = xa + k * schritt; if (px > bis) break;
        const u = (px - o.cx) / o.bh;
        let y0 = o.cy + ((v - .5) * o.spread + o.amp * welle(u, v, t, o.rausch) + u * o.neig) * o.bh;
        if (L) { const ab = Math.abs(px - L.mitte); y0 += rueck * (1 - glatt(L.halb, L.halb + L.fall, ab)); }
        let yy = y0;
        if (E && E[k] > 1e-5) { const dy = y0 - C[k]; yy += A * E[k] * Math.tanh(dy / sy) * Math.exp(-dy * dy / sv2); }
        pts[2 * m] = px; pts[2 * m + 1] = yy; m++;
      }
      if (m < 2) continue;
      x.moveTo(pts[0], pts[1]);
      for (let j = 1; j < m - 1; j++) x.quadraticCurveTo(pts[2 * j], pts[2 * j + 1], (pts[2 * j] + pts[2 * j + 2]) / 2, (pts[2 * j + 1] + pts[2 * j + 3]) / 2);
      x.lineTo(pts[2 * m - 2], pts[2 * m - 1]);
      x.stroke();
    }
  };
  const maskieren = (F, mk) => { const x = F.x; x.globalCompositeOperation = "destination-in"; x.imageSmoothingEnabled = true;
    x.drawImage(mk, 0, 0, F.w, F.h); x.globalCompositeOperation = "source-over"; };
  const buehnenZustand = st => ({
    rausch: lerp(1.15, .1, glatt(.02, .27, st)),
    amp: 1 + .62 * glatt(.3, .5, st) - .78 * glatt(.6, .92, st),
    tempo: 1 + .9 * glatt(.3, .5, st) - 1.15 * glatt(.6, .92, st),
    spread: lerp(1.4, 1.06, glatt(.6, .95, st)),
    R: lerp(.42, .36, glatt(.58, .95, st)), innen: lerp(.3, .5, glatt(.58, .95, st)),
    ov: .11 - .05 * st, dreh: .5 + st * 1.2, ph: [1.7 + st * 2.4, 3.9 - st * 1.7, 2.7 + st * 3.2],
    farbe: v => { const a = klemm((st - (.25 + v * .12)) / .07), b = klemm((st - (.58 + v * .12)) / .07);
      const fs = BLAU.map((c, i) => mischF(mischF(c, KORALLE[i], a), TUERKIS[i], b)); return enden(fs, v); }
  });
  const zeichnen = (F, t) => {
    const { x, w, h, d } = F;
    x.clearRect(0, 0, w, h);
    if (F.art === "saite") return saite(F, t);
    if (F.art === "hero") {
      const s = bewegt ? auftakt.p * auftakt.sch : 0, m = glatt(.138, .92, s), o = sinus((s - AUF.offen[0]) / (AUF.offen[1] - AUF.offen[0]));
      const b = { cx: w * lerp(.67, .5, m), cy: h * lerp(.44, .5, m), bw: w * lerp(.7, 1.36, m), bh: h * lerp(.9, 1.04, m) };
      const luecke = o > 0 ? { G: auftakt.luecke * d * o, mitte: w / 2, halb: auftakt.breite * d / 2, fall: w * .2 } : null;
      linien(F, { ...b, spread: lerp(1.32, 1.02, m), neig: lerp(.36, .05, m), amp: (1 + .45 * schub) * lerp(1, .6, m),
        rausch: (.3 + .5 * schub) * (1 - .6 * m), farbe: v => enden(BLAU, lerp(v, .4 + .6 * v, m)), luecke, ganz: true, lw: lerp(1, 1.18, m) }, t);
      maskieren(F, wolke(F, b, t, m));
    } else if (F.art === "ecke") {
      const b = { cx: w * .5, cy: h * .5, bw: w * .95, bh: h * .9 };
      x.globalAlpha = .62;
      linien(F, { ...b, spread: 1.3, neig: .3, amp: 1, rausch: .2, farbe: v => enden(BLAU, v) }, t * .7 + 3);
      x.globalAlpha = 1; maskieren(F, wolke(F, b, t * .7));
    } else if (F.art === "buehne") {
      const st = bewegt ? buehne.p : .22, z = buehnenZustand(st), m = Math.min(w, h * 1.08), cx = w * lerp(.54, .5, st), cy = h * .5;
      linien(F, { cx, cy, bw: m * 1.5, bh: m, spread: z.spread, neig: .34, amp: z.amp * (1 + .35 * schub), rausch: z.rausch + .4 * schub, farbe: z.farbe }, t);
      maskieren(F, unrund(F, { cx, cy, R: m * z.R * (1 + .012 * Math.sin(t * .8)), ov: z.ov, dreh: z.dreh, ph: z.ph, innen: z.innen }));
    } else {
      const m = Math.min(w, h);
      linien(F, { cx: w / 2, cy: h / 2, bw: m * 1.2, bh: m * .96, spread: 1.1, neig: .34, amp: .8, rausch: 0, farbe: v => enden(BLAU, v) }, t);
      maskieren(F, unrund(F, { cx: w / 2, cy: h / 2, R: m * .5, ov: .08, dreh: .9, ph: [1.7, 3.9, 2.7], innen: .5 }));
    }
  };
  const saite = (F, t) => {
    const { x, w, h, d } = F, bis = w * klemm(F.zeigen), mitte = h / 2, A = F.amp * h * .38, schritt = Math.max(3, 5 * d);
    if (bis < 2) return;
    const g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, "rgba(11,63,208,0)"); g.addColorStop(.12, "rgba(11,63,208,.85)"); g.addColorStop(.55, "rgba(20,196,228,.9)");
    g.addColorStop(.88, "rgba(79,220,236,.55)"); g.addColorStop(1, "rgba(79,220,236,0)");
    x.strokeStyle = g; x.lineWidth = F.cfg.lw * d; x.lineCap = "round"; x.lineJoin = "round"; x.beginPath();
    if (A < .05 * d) { x.moveTo(0, mitte); x.lineTo(bis, mitte); x.stroke(); return; }
    for (let px = 0; px <= bis + .5; px += schritt) { const u = px / w, huelle = Math.pow(Math.sin(Math.PI * u), 1.3);
      const y = mitte + A * huelle * (.7 * Math.sin(u * 13 - t * 5.2) + .3 * Math.sin(u * 29 + t * 3.1));
      px ? x.lineTo(px, y) : x.moveTo(px, y); }
    x.stroke();
  };
  const mausSchritt = (F, dt) => {
    const z = F.maus; if (!z) return;
    if (z.cx !== null) { const r = F.c.getBoundingClientRect(), d = F.d || 1; z.x = (z.cx - r.left) * d; z.y = (z.cy - r.top) * d;
      if (z.neu) { z.px = z.x; z.py = z.y; z.lx = z.x; z.ly = z.y; z.neu = false; } }
    const k = MAUS.feder, c = 2 * Math.sqrt(k);
    z.vx += ((z.x - z.px) * k - z.vx * c) * dt; z.px += z.vx * dt;
    z.vy += ((z.y - z.py) * k - z.vy * c) * dt; z.py += z.vy * dt;
    z.s += ((z.innen ? 1 : 0) - z.s) * (1 - Math.exp(-dt * (z.innen ? 3.2 : 2.4)));
    for (const s of F.spur) { s.alter += dt; s.k *= Math.exp(-dt / (s.weg ? .1 : MAUS.heilen));
      s.s = Math.max(0, s.k * glatt(0, MAUS.wachsen, s.alter) - .0025); }
    F.spur = F.spur.filter(s => s.alter < MAUS.wachsen || s.s > 0);
    const dxs = Math.abs(z.px - z.lx), dd = F.d || 1;
    if (z.s > .05 && dxs > MAUS.abstand * dd) {
      F.spur.push({ x: z.px, y: z.py, k: MAUS.spur * z.s * dxs / (MAUS.sx * dd * 1.7725), s: 0, alter: 0, weg: false }); z.lx = z.px; z.ly = z.py;
      let lebend = F.spur.filter(s => !s.weg).length;
      for (const s of F.spur) { if (lebend <= MAUS.spurMax) break; if (!s.weg) { s.weg = true; lebend--; } }
      if (F.spur.length > 2 * MAUS.spurMax) F.spur.shift(); }
  };
  const mausAn = (F, flaeche) => {
    if (!fein || !F || !flaeche) return;
    F.maus = { cx: null, cy: null, x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, lx: 0, ly: 0, s: 0, innen: false, neu: true };
    flaeche.addEventListener("pointermove", e => { const z = F.maus; z.cx = e.clientX; z.cy = e.clientY;
      const r = F.c.getBoundingClientRect(); z.innen = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (z.s < .01 && z.innen) z.neu = true; });
    flaeche.addEventListener("pointerleave", () => { F.maus.innen = false; });
  };
  let letzt = performance.now(), nachSchleife = null;
  const feder = (o, k, dt, z = .98) => { const c = 2 * Math.sqrt(k) * z; o.v += ((o.ziel - o.p) * k - o.v * c) * dt; o.p += o.v * dt;
    if (Math.abs(o.ziel - o.p) < 1e-4 && Math.abs(o.v) < 1e-4) { o.p = o.ziel; o.v = 0; } };
  const schleife = () => {
    const jetzt = performance.now(), dt = Math.min(.05, (jetzt - letzt) / 1000); letzt = jetzt;
    const sZiel = klemm(Math.abs(tempo) / 42); schub += (sZiel - schub) * (1 - Math.exp(-dt * (sZiel > schub ? 7 : 1.8)));
    tempo *= Math.exp(-dt * 4);
    if (bewegt) { feder(buehne, 90, dt); feder(auftakt, 60, dt, 1); }
    const zTempo = bewegt ? buehnenZustand(buehne.p).tempo : 1;
    zeit += dt * (.85 + 2.2 * schub) * zTempo;
    for (const F of felder) {
      if (F.maus && (F.sicht || F.maus.s > .01)) mausSchritt(F, dt);
      if (F.art === "saite") { F.zupf *= Math.exp(-dt / .7); const ziel = Math.max(F.zupf, F.halten * .32) + schub * .6; F.amp += (ziel - F.amp) * (1 - Math.exp(-dt * 9)); }
    }
    if (nachSchleife) nachSchleife(dt);
    for (const F of felder) {
      if (!F.cw || !F.ch) continue;
      if (!F.sicht && F.gemalt) continue;
      if (F.c.checkVisibility && !F.c.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && F.gemalt) continue;
      const d = Math.min(devicePixelRatio || 1, F.cfg.dpr), w = Math.round(F.cw * d), h = Math.round(F.ch * d);
      if (F.c.width !== w || F.c.height !== h) { F.c.width = w; F.c.height = h; F.mkSchluessel = ""; }
      F.w = w; F.h = h; F.d = d;
      const t = F.art === "marke" ? zeit * .55 : zeit;
      zeichnen(F, bewegt ? t : 2); F.gemalt = true;
    }
  };
  const woerter = el => {
    const teile = [];
    [...el.childNodes].forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(s => { if (s) teile.push(/^\s+$/.test(s) ? " " : s); });
      else teile.push(n);
    });
    el.textContent = "";
    const ws = [];
    teile.forEach(tl => {
      if (tl === " ") { el.append(" "); return; }
      const wm = document.createElement("span"), wa = document.createElement("span"), we = document.createElement("span");
      wm.className = "wm"; wa.className = "wa"; we.className = "we";
      we.append(typeof tl === "string" ? tl : tl); wa.append(we); wm.append(wa); el.append(wm); ws.push(wm);
    });
    return ws;
  };
  if (!bewegt) {
    const still = () => requestAnimationFrame(schleife);
    new ResizeObserver(still).observe(document.body); still();
    document.fonts && document.fonts.ready.then(still);
    io.disconnect(); felder.forEach(F => { F.sicht = true; });
    const navR = document.getElementById("nav"), belegt = () => navR.classList.toggle("belegt", scrollY > 30);
    addEventListener("scroll", belegt, { passive: true }); belegt();
    formular(); return;
  }
  gsap.registerPlugin(ScrollTrigger);
  const heroW = woerter(document.querySelector(".hero-titel"));
  const haltungW = woerter(document.querySelector(".haltung"));
  H.classList.add("geteilt");
  const lenis = new Lenis({ lerp: .09, smoothWheel: true, syncTouch: false });
  const nav = document.getElementById("nav");
  let navWeg = false;
  lenis.on("scroll", e => {
    ScrollTrigger.update(); tempo = e.velocity || 0;
    const y = e.scroll; nav.classList.toggle("belegt", y > 30);
    if (y > 180 && e.direction === 1 && !navWeg) { navWeg = true; gsap.to(nav, { yPercent: -112, duration: .7, ease: "power3.out" }); }
    else if ((e.direction === -1 || y < 180) && navWeg) { navWeg = false; gsap.to(nav, { yPercent: 0, duration: .55, ease: "power3.out" }); }
  });
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(schleife);
  const auftaktEl = document.getElementById("auftakt"), heroInhalt = document.querySelector(".hero-inhalt");
  const heroAuf = [...document.querySelectorAll(".hero-auf")], warumUeber = document.querySelector(".warum-ueber");
  const warumInhalt = document.querySelector(".warum-inhalt"), heroSek = document.querySelector(".hero");
  const messen = () => {
    auftakt.top = auftaktEl.getBoundingClientRect().top + scrollY;
    auftakt.lauf = Math.max(1, auftaktEl.offsetHeight - innerHeight); auftakt.sch = auftakt.lauf / innerHeight;
    const r = warumInhalt.getBoundingClientRect(), hl = document.querySelector(".haltung").getBoundingClientRect();
    auftakt.luecke = (hl.bottom - r.top) / 2 + 26 + innerHeight * .07;
    auftakt.breite = Math.min(innerWidth * .9, hl.width + innerWidth * .08);
  };
  messen(); addEventListener("resize", messen); ScrollTrigger.addEventListener("refresh", messen);
  let geladen = false, letzteAuf = "";
  const setze = (el, wert) => { if (el._t !== wert) { el.style.transform = wert; el._t = wert; } };
  nachSchleife = () => {
    auftakt.ziel = klemm((lenis.scroll - auftakt.top) / auftakt.lauf);
    const s = auftakt.p * auftakt.sch;
    if (geladen) {
      heroW.forEach((wm, i) => { const t = aus3((s - .0575 - i * .0276) / .3), wa = wm.firstChild, o = (1 - glatt(.2, .62, t)).toFixed(3);
        setze(wa, `translate3d(0,${(-140 * t).toFixed(2)}%,0)`); if (wa._o !== o) { wa.style.opacity = o; wa._o = o; } });
      const a = glatt(.046, .368, s), auf = `${(1 - a).toFixed(3)}|${(-a * 40).toFixed(1)}`;
      if (auf !== letzteAuf) { letzteAuf = auf; heroAuf.forEach(el => { el.style.opacity = (1 - a).toFixed(3); el.style.transform = `translate3d(0,${(-a * 40).toFixed(1)}px,0)`; }); }
      heroSek.style.visibility = s > .69 ? "hidden" : "";
    }
    warumUeber.style.opacity = glatt(AUF.ueber[0], AUF.ueber[1], s).toFixed(3);
    const n = haltungW.length;
    haltungW.forEach((wm, i) => { const t = sinusAus((s - AUF.satz - i / n * AUF.staffel) / AUF.wort); setze(wm.firstChild, `translate3d(0,${(140 * (1 - t)).toFixed(2)}%,0)`); });
  };
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute("href"); e.preventDefault(); if (id === "#") return;
    const ziel = id === "#oben" ? 0 : document.querySelector(id); if (ziel === null) return;
    const imAuftakt = id === "#warum";
    const y = ziel === 0 ? 0 : imAuftakt ? auftakt.top + auftakt.lauf * AUF.anker / auftakt.sch : ziel.getBoundingClientRect().top + scrollY, weit = Math.abs(y - scrollY);
    const versatz = ziel !== 0 && !imAuftakt && !ziel.matches("section") ? -110 : 0;
    lenis.scrollTo(ziel === 0 || imAuftakt ? y : ziel, { offset: versatz, duration: Math.min(2.6, 1.1 + weit / 5200), easing: t => -(Math.cos(Math.PI * t) - 1) / 2,
      onComplete: () => { if (ziel === 0) return; const f = id === "#kontakt" ? document.getElementById("f-name") : ziel;
        if (!f.hasAttribute("tabindex") && !f.matches("input")) f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); } });
  });
  gsap.fromTo(".nav .lockup, .nav li", { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", stagger: .07, delay: .15 });
  const tl = gsap.timeline({ delay: .2, onComplete: () => { heroAuf.forEach(el => { el.style.opacity = ""; el.style.transform = ""; }); geladen = true; } });
  tl.fromTo(".hero .ueberzeile", { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "expo.out" }, .15)
    .to(".hero-titel .we", { y: 0, yPercent: 0, duration: 1.4, ease: "expo.out", stagger: .07 }, .25)
    .fromTo(".hero-fuss .hero-auf", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: .1 }, .85);
  gsap.set(".hero-titel .we", { y: 0, yPercent: 140 });
  gsap.to(heroF, { zeigen: 1, duration: 2.8, ease: "power2.inOut", delay: .05 });
  if (scrollY > 40) { tl.progress(1); }
  mausAn(heroF, document.querySelector(".auftakt-klebt"));
  mausAn(feldVon("buehne")[0], document.querySelector(".ansatz-klebt"));
  mausAn(feldVon("ecke")[0], document.querySelector(".kontakt"));
  document.querySelectorAll("[data-zeilen]").forEach(el => ScrollTrigger.create({ trigger: el, start: "top 88%", once: true,
    onEnter: () => gsap.to(el.querySelectorAll(".zl > span"), { y: 0, duration: 1.3, ease: "expo.out", stagger: .11 }) }));
  ScrollTrigger.batch("[data-auf]", { start: "top 90%", once: true,
    onEnter: els => gsap.fromTo(els, { opacity: 0, y: 30, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, ease: "expo.out", stagger: .09, clearProps: "filter" }) });
  const ansatz = document.querySelector(".ansatz"), pfs = [...ansatz.querySelectorAll(".pf")];
  let aktiv = 0, gezeigt = false;
  gsap.set(pfs[0].querySelectorAll(".zl > span"), { yPercent: 108 }); gsap.set(pfs[0].querySelectorAll(".pf-nr, .pf-text"), { opacity: 0, y: 24 });
  pfs[0].classList.add("an");
  const pfein = (pf, dir, verz) => {
    gsap.fromTo(pf.querySelectorAll(".zl > span"), { yPercent: 108 * dir }, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: .09, delay: verz, overwrite: true });
    gsap.fromTo(pf.querySelectorAll(".pf-nr, .pf-text"), { opacity: 0, y: 26 * dir }, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: .08, delay: verz + .12, overwrite: true });
  };
  const pfaus = (pf, dir, i) => {
    gsap.to(pf.querySelectorAll(".zl > span"), { yPercent: -108 * dir, duration: .55, ease: "power3.in", stagger: .04, overwrite: true });
    gsap.to(pf.querySelectorAll(".pf-nr, .pf-text"), { opacity: 0, y: -18 * dir, duration: .45, ease: "power2.in", overwrite: true,
      onComplete: () => { if (aktiv !== i) pf.classList.remove("an"); } });
  };
  ScrollTrigger.create({ trigger: ansatz, start: "top 55%", once: true, onEnter: () => { gezeigt = true; if (aktiv === 0) pfein(pfs[0], 1, .1); } });
  ScrollTrigger.create({ trigger: ansatz, start: "top top", end: "bottom bottom",
    onUpdate: self => {
      buehne.ziel = self.progress;
      const neu = Math.min(2, Math.floor(self.progress * 3 + .0001));
      if (neu !== aktiv) { const dir = neu > aktiv ? 1 : -1, alt = aktiv; aktiv = neu; pfs[neu].classList.add("an");
        pfaus(pfs[alt], dir, alt); pfein(pfs[neu], dir, gezeigt ? .32 : 0); gezeigt = true; }
    } });
  gsap.fromTo(".ansatz-feld-auf", { opacity: 0, scale: .84, xPercent: 6 }, { opacity: 1, scale: 1, xPercent: 0, ease: "none",
    scrollTrigger: { trigger: ansatz, start: "top bottom", end: "top top", scrub: .8 } });
  document.querySelectorAll(".ang").forEach(ang => {
    const s = felder.filter(F => F.art === "saite" && ang.contains(F.c));
    ScrollTrigger.create({ trigger: ang, start: "top 86%", once: true, onEnter: () => s.forEach((F, i) => gsap.to(F, { zeigen: 1, duration: 1.8, ease: "power3.inOut", delay: i * .2 })) });
    if (fein) { ang.addEventListener("pointerenter", () => { s[0].zupf = 1; s[0].halten = 1; });
      ang.addEventListener("pointerleave", () => { s[0].halten = 0; }); }
  });
  const bild = document.querySelector(".bild-maske");
  ScrollTrigger.create({ trigger: bild, start: "top 82%", once: true,
    onEnter: () => gsap.to(bild, { clipPath: "inset(0% 0% 0% 0% round 6px)", duration: 1.7, ease: "expo.out" }) });
  gsap.fromTo(".bild-maske img", { scale: 1.16 }, { scale: 1, ease: "none", scrollTrigger: { trigger: bild, start: "top bottom", end: "bottom 35%", scrub: .8 } });
  const punkte = [...document.querySelectorAll(".zeit-punkt")], marken = [.01, .36, .7];
  gsap.to(".zeit-linie span", { scaleX: 1, ease: "none", scrollTrigger: { trigger: ".zeit", start: "top 88%", end: "top 52%", scrub: .8 },
    onUpdate() { const p = this.progress(); punkte.forEach((el, i) => el.classList.toggle("an", p >= marken[i])); } });
  const band = document.querySelector(".band"), spur = band.querySelector(".band-spur");
  [...spur.children].forEach(f => { const k = f.cloneNode(true); k.setAttribute("aria-hidden", "true"); k.setAttribute("inert", ""); spur.append(k); });
  let halbe = spur.scrollWidth / 2, versatz = 0, bandTempo = 0, bandHalt = false;
  new ResizeObserver(() => { halbe = spur.scrollWidth / 2; }).observe(spur);
  band.addEventListener("pointerenter", () => { bandHalt = true; }); band.addEventListener("pointerleave", () => { bandHalt = false; });
  band.addEventListener("focusin", () => { bandHalt = true; }); band.addEventListener("focusout", () => { bandHalt = false; });
  gsap.ticker.add((t, dms) => { const dt = Math.min(.05, dms / 1000), ziel = bandHalt ? 0 : 34 + schub * 160;
    bandTempo += (ziel - bandTempo) * (1 - Math.exp(-dt * (bandHalt ? 5 : 2.5))); versatz -= bandTempo * dt;
    if (versatz <= -halbe) versatz += halbe; spur.style.transform = `translate3d(${versatz.toFixed(2)}px,0,0)`; });
  if (fein) document.querySelectorAll(".magnet").forEach(el => {
    const qx = gsap.quickTo(el, "x", { duration: .6, ease: "power3.out" }), qy = gsap.quickTo(el, "y", { duration: .6, ease: "power3.out" });
    el.addEventListener("pointermove", e => { const r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .3); qy((e.clientY - r.top - r.height / 2) * .35); });
    el.addEventListener("pointerleave", () => { gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: "elastic.out(1, .4)", overwrite: true }); });
  });
  formular();
  document.fonts && document.fonts.ready.then(() => { ScrollTrigger.refresh(); messen(); });
  addEventListener("load", () => { ScrollTrigger.refresh(); messen(); });
  function formular() {
    const f = document.getElementById("formular"); if (!f) return;
    const name = f.querySelector("#f-name"), mail = f.querySelector("#f-email"), danke = f.querySelector(".danke");
    const setze = (inp, txt) => { const feld = inp.closest(".feld"), p = feld.querySelector(".fehler");
      feld.classList.toggle("falsch", !!txt); inp.setAttribute("aria-invalid", txt ? "true" : "false"); p.textContent = txt || ""; };
    [name, mail].forEach(i => i.addEventListener("input", () => { if (i.closest(".feld").classList.contains("falsch")) setze(i, ""); }));
    f.addEventListener("submit", e => {
      e.preventDefault();
      const fn = name.value.trim() ? "" : "Hier fehlt noch dein Name.";
      const fm = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim()) ? "" : "Diese Adresse sieht noch nicht vollständig aus.";
      setze(name, fn); setze(mail, fm);
      if (fn || fm) { (fn ? name : mail).focus(); return; }
      f.classList.add("gesendet"); setTimeout(() => danke.focus({ preventScroll: true }), 400);
    });
  }
})();
