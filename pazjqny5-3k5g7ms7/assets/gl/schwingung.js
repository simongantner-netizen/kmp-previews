
(() => {
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;
  const huelle = (x, pk) => pk.reduce((a, [c, w, h]) => a + h * Math.exp(-(((x - c) / w) ** 2)), 0);
  const welle2 = pk => (u, p) => th => { const x = th / Math.PI - 1, t = Math.cos(Math.PI * (u - .5) * 1.7);
    return [x, huelle(x, pk) * Math.sin(7.5 * x + p * 1.4 + u * .35) * t + (u - .5) * .004]; };
  const welle3 = pk => (u, p) => th => { const x = th / Math.PI - 1, t = .55 + .45 * Math.cos(Math.PI * (u - .5) * 1.3);
    return [x, huelle(x, pk) * Math.sin(6.5 * x + p * 1.2 + u * 2.4) * t]; };
  const BREIT = new Set(["flach1", "flach2", "flach3"]);
  const OFFEN = new Set(["paket", "paket1", "flach1", "flach2", "flach3"]);
  const ARTEN = {
    paket: welle2([[.12, .2, .62], [-.4, .17, .42], [.58, .14, .3]]),
    paket1: welle2([[0, .34, .9]]),
    flach1: welle3([[-.45, .26, .09], [.08, .32, .13], [.62, .24, .08]]),
    flach2: welle3([[-.42, .24, .13], [.1, .3, .19], [.6, .22, .11]]),
    flach3: welle3([[0, .5, .26]]),
    kugel: (u, p) => { const th = u * TAU * .955, o = Math.max(0, Math.min(1, (p + .3) / 1.8)), be = o * o * (3 - 2 * o) * .62, dr = .35 + p * .12, ki = .32;
      const cx = Math.sin(be), cy = -1 + Math.cos(be), ct = Math.cos(th + dr), st = Math.sin(th + dr);
      return t => { const uu = cx + Math.cos(t), v = cy + Math.sin(t), X = uu * ct, Z = uu * st; return [X, v * Math.cos(ki) - Z * Math.sin(ki)]; }; },
    band: (u, p) => { const cx = (u - .5) * 1.1, cy = .32 * Math.sin(Math.PI * u * 1.4 + p), a = .52 + .14 * Math.sin(Math.PI * u), b = .2 + .12 * Math.cos(Math.PI * u * 1.2 + p * .5), r = Math.PI * u * .85 + .3 * Math.sin(p);
      return th => { const x = a * Math.cos(th), y = b * Math.sin(th); return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]; }; },
    tunnel: (u, p) => { const R = 1 - .72 * u, o = .28 * u, w = p + u * 1.6; return th => [o * Math.cos(w) + R * Math.cos(th), o * Math.sin(w) + R * Math.sin(th)]; },
    welle: (u, p) => th => { const x = Math.cos(th), y = .1 * Math.sin(th) + .34 * Math.sin(Math.PI * x * 1.15 + u * 1.5 + p) - (u - .5) * .55; return [x * .98, y]; },
    acht: (u, p) => { const s = 1 - .58 * u, r = (u - .5) * .9 + .25 * Math.sin(p); return th => { const n = 1 + Math.sin(th) ** 2, x = s * Math.cos(th) / n, y = s * Math.sin(th) * Math.cos(th) / n * 1.15; return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]; }; },
    spirale: (u, p) => { const s = .98 - .7 * u, r = u * Math.PI * .5 + p * .3; return th => { const c = Math.cos(th), si = Math.sin(th), x = s * Math.sign(c) * Math.abs(c) ** .5, y = s * Math.sign(si) * Math.abs(si) ** .5; return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)]; }; },
    faecher: (u, p) => { const r = -Math.PI * .1 + u * Math.PI * .75 + .15 * Math.sin(p), a = .95, b = .3; return th => { const x = a * Math.cos(th) + a - .95, y = b * Math.sin(th); return [x * Math.cos(r) - y * Math.sin(r) - .2, x * Math.sin(r) + y * Math.cos(r) + .15]; }; },
    vibration: (u, p) => { const R = .95 - .5 * u, ph = u * TAU * .5 + p; return th => { const r = R * (1 + .1 * Math.sin(5 * th + ph)); return [r * Math.cos(th), r * Math.sin(th)]; }; },
    schwung: (u, p) => { const a0 = u * TAU * .5 - Math.PI * .25 + p * .3, n = 1 + Math.sin(a0) ** 2, cx = .62 * Math.cos(a0) / n, cy = .62 * Math.sin(a0) * Math.cos(a0) / n;
      const da = .01, n2 = 1 + Math.sin(a0 + da) ** 2, tx = .62 * Math.cos(a0 + da) / n2 - cx, ty = .62 * Math.sin(a0 + da) * Math.cos(a0 + da) / n2 - cy, r = Math.atan2(ty, tx) + Math.PI / 2;
      const a = .42, b = .14 + .1 * Math.sin(Math.PI * u); return th => { const x = a * Math.cos(th), y = b * Math.sin(th); return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]; }; },
  };
  const STRICHE = new Set(["acht8", "strichband", "takt"]);
  const achtWeg = s => { const r = .42, A0 = -35, A1 = 215, s1 = .44, s2 = .12;
    if (s < s1) { const a = (A0 + (A1 - A0) * s / s1) * Math.PI / 180; return [r * Math.cos(a), .43 + r * Math.sin(a)]; }
    if (s < s1 + s2) { const u = (s - s1) / s2, a = A1 * Math.PI / 180, P0 = [r * Math.cos(a), .43 + r * Math.sin(a)], P1 = [-P0[0], -P0[1]], T = [-Math.sin(a) * .8, Math.cos(a) * .8];
      const h1 = 2 * u ** 3 - 3 * u ** 2 + 1, h2 = -2 * u ** 3 + 3 * u ** 2, h3 = u ** 3 - 2 * u ** 2 + u, h4 = u ** 3 - u ** 2;
      return [h1 * P0[0] + h2 * P1[0] + (h3 + h4) * T[0], h1 * P0[1] + h2 * P1[1] + (h3 + h4) * T[1]]; }
    const a = (35 - 250 * (s - s1 - s2) / (1 - s1 - s2)) * Math.PI / 180; return [r * Math.cos(a), -.43 + r * Math.sin(a)]; };
  const achtStriche = (p, n, still, sw = 1) => { const L = []; for (let i = 0; i < n; i++) { const s = i / (n - 1), P = achtWeg(s), Q = achtWeg(Math.min(1, s + .002)), R = achtWeg(Math.max(0, s - .002));
      const tg = Math.atan2(Q[1] - R[1], Q[0] - R[0]), mitte = Math.exp(-(((s - .5) / .085) ** 2));
      const w = tg + Math.PI / 2 - mitte * 1.05 + (still ? 0 : .05 * sw * Math.sin(p + s * 6)), ein = Math.min(1, s / .1, (1 - s) / .1);
      const puls = still ? 1 : 1 + .1 * sw * Math.sin(Math.PI * 2 * s * 1.5 - p * 1.4);
      L.push([P[1], -P[0], w - Math.PI / 2, .27 * (.55 + .45 * ein) * puls, ein]); } return L; };
  const rgba = (hex, a) => { const h = hex.replace("#", ""), v = h.length === 3 ? h.split("").map(c => c + c) : h.match(/../g); return `rgba(${v.map(x => parseInt(x, 16)).join(",")},${a.toFixed(3)})`; };
  const strich = (x, x1, y1, x2, y2, farbe, e, lw) => { const g = x.createLinearGradient(x1, y1, x2, y2); g.addColorStop(0, rgba(farbe, .15 * e)); g.addColorStop(1, rgba(farbe, e));
    x.strokeStyle = g; x.lineWidth = lw; x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke(); };
  const kreuzt = (A, B) => { const o = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    const d1 = o(A[0], A[1], A[2], A[3], B[0], B[1]), d2 = o(A[0], A[1], A[2], A[3], B[2], B[3]), d3 = o(B[0], B[1], B[2], B[3], A[0], A[1]), d4 = o(B[0], B[1], B[2], B[3], A[2], A[3]);
    return d1 * d2 < 0 && d3 * d4 < 0; };
  const kuerzen = (S, f) => { const mx = (S[0] + S[2]) / 2, my = (S[1] + S[3]) / 2; S[0] = mx + (S[0] - mx) * f; S[1] = my + (S[1] - my) * f; S[2] = mx + (S[2] - mx) * f; S[3] = my + (S[3] - my) * f; };
  const zaehle = (seg, fenster) => { let k = 0; for (let i = 0; i < seg.length; i++) for (let j = i + 1; j < Math.min(seg.length, i + 1 + fenster); j++) if (kreuzt(seg[i], seg[j])) k++; return k; };
  const entwirren = (seg, fenster) => { const S = window.Schwingung || (window.Schwingung = {});
    if (window.SCHWINGUNG_ROH) { S.roh = (S.roh || 0) + zaehle(seg, fenster); return; }
    for (let runde = 0; runde < 12; runde++) { let frei = true;
      for (let i = 0; i < seg.length; i++) for (let j = i + 1; j < Math.min(seg.length, i + 1 + fenster); j++) if (kreuzt(seg[i], seg[j])) { kuerzen(seg[i], .9); kuerzen(seg[j], .9); frei = false; }
      if (frei) break; }
    S.kreuz = (S.kreuz || 0) + zaehle(seg, fenster); };
  const maleStriche = (s, ms, w, h, d) => { const { c, x } = s, farbe = c.dataset.farbe || "#F2F1EE", p = s.still ? 0 : ms / 1000 * .6;
    x.clearRect(0, 0, w, h); x.lineCap = "round";
    if (s.art === "acht8") {
      const klein = h / d < 70, n = +(c.dataset.n || (klein ? 38 : 74)), lw = klein ? .036 : +(c.dataset.stark || 1) * .022;
      if (!s.rahmen) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; achtStriche(0, n, true).forEach(([cx, cy, a, l]) => { for (const k of [-.5, .5]) { const px = cx + Math.cos(a) * l * k, py = cy + Math.sin(a) * l * k; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } });
        s.rahmen = [x0 - lw / 2, y0 - lw / 2, x1 + lw / 2, y1 + lw / 2]; }
      const [x0, y0, x1, y1] = s.rahmen, rand = +(c.dataset.rand || .03), sk = Math.min(w * (1 - 2 * rand) / (x1 - x0), h * (1 - 2 * rand) / (y1 - y0)), ox = w / 2 - (x0 + x1) / 2 * sk, oy = h / 2 + (y0 + y1) / 2 * sk;
      const sw = c.dataset.schwung !== undefined ? +c.dataset.schwung : 1;
      const seg = achtStriche(p, n, s.still, sw).map(([cx, cy, a, l, e]) => { const dx = Math.cos(a) * l / 2, dy = Math.sin(a) * l / 2;
        return [ox + (cx - dx) * sk, oy - (cy - dy) * sk, ox + (cx + dx) * sk, oy - (cy + dy) * sk, e]; });
      entwirren(seg, n); seg.forEach(([x1, y1, x2, y2, e]) => strich(x, x1, y1, x2, y2, farbe, e, Math.max(d, lw * sk)));
    } else if (s.art === "strichband") {
      const n = +(c.dataset.n || Math.max(36, Math.min(170, Math.round(w / Math.max(9 * d, h * .06))))), amp = +(c.dataset.amp || .2), lang = h * +(c.dataset.lang || .3);
      const ds = c.dataset, wl = +(ds.wellen || 1.05), ph = ds.phase !== undefined ? +ds.phase : .7, ng = +(ds.neigung || 0), pb = p * (ds.tempo !== undefined ? +ds.tempo : 1);
      const dr = ds.dreh !== undefined ? +ds.dreh : 1.3, mk = +(ds.mk || 0), mx = +(ds.mx || .5), my = +(ds.my || .5), naehe = u => Math.exp(-(((u - mx) / .14) ** 2));
      const yb = u => h * (.5 + amp * Math.sin(Math.PI * 2 * (u * wl) + ph + pb * 1.25 * .25) - (ng ? ng * (u - .5) : 0));
      const yc = mk > 0 ? u => { const y = yb(u); return y + mk * naehe(u) * (my * h - y) * .6; } : yb, lw = Math.max(1.1 * d, h * .011);
      const seg = []; for (let i = 0; i < n; i++) { const u = i / (n - 1), X = (-.02 + 1.04 * u) * w, Y = yc(u), tg = Math.atan2(yc(u + .002) - yc(u - .002), .004 * 1.04 * w);
        const dreh0 = (.5 + .5 * Math.sin(Math.PI * 2 * u * .9 - .4 - pb * 1.25 * .5)) * dr   ;
        const dreh = mk > 0 ? dreh0 * (1 - .6 * mk * naehe(u)) : dreh0, a = tg + Math.PI / 2 - dreh, e = Math.min(1, u / .07, (1 - u) / .07);
        const dx = Math.cos(a) * lang / 2, dy = Math.sin(a) * lang / 2; seg.push([X - dx, Y - dy, X + dx, Y + dy, Math.max(0, e)]); }
      entwirren(seg, 10); seg.forEach(([x1, y1, x2, y2, e]) => strich(x, x1, y1, x2, y2, farbe, e, lw));
    } else {
      const n = +(c.dataset.n || 9), sp = w / n, lang = Math.min(h * .9, sp * 3.2), lw = Math.max(1.3 * d, lang * .085);
      for (let i = 0; i < n; i++) { const u = n > 1 ? i / (n - 1) : 0, a = Math.PI / 2 - u * Math.PI * .3 - (s.still ? 0 : .06 * Math.sin(p * 1.2 - u * 3)), X = sp * (i + .5), Y = h / 2;
        const dx = Math.cos(a) * lang / 2, dy = Math.sin(a) * lang / 2; strich(x, X - dx, Y + dy, X + dx, Y - dy, farbe, 1, lw); }
    }
    s.gemalt = true; };
  const alle = [];
  const holen = () => document.querySelectorAll("canvas[data-schwingung]").forEach(c => { if (alle.find(x => x.c === c)) return;
    alle.push({ c, x: c.getContext("2d"), art: c.dataset.schwingung, still: c.dataset.still !== undefined || ruhig, rahmen: null }); });
  const kurve = (f, k = 220) => { const pts = []; for (let i = 0; i <= k; i++) pts.push(f(i / k * TAU)); return pts; };
  const male = ms => {
    requestAnimationFrame(male);
    for (const s of alle) {
      if ((s.still && s.gemalt) || !s.c.isConnected || (s.c.checkVisibility && !s.c.checkVisibility({ visibilityProperty: true }))) continue;
      const { c, x } = s, d = Math.min(devicePixelRatio || 1, 2), w = Math.round(c.clientWidth * d), h = Math.round(c.clientHeight * d);
      if (!w || !h) continue; if (c.width !== w || c.height !== h) { c.width = w; c.height = h; s.rahmen = null; }
      if (STRICHE.has(s.art)) { maleStriche(s, ms, w, h, d); continue; }
      const f = ARTEN[s.art]; if (!f) continue;
      const n = +(c.dataset.n || 26), tz = ms / 1000, p = s.still ? (s.art === "kugel" ? .15 : .6) : s.art === "kugel" ? -.3 + 1.8 * Math.max(0, Math.sin(tz * .42)) ** 1.6 : OFFEN.has(s.art) ? tz * .5 : Math.sin(tz * .35) * .9 + .6;
      const kopien = []; for (let k = 0; k < n; k++) kopien.push(kurve(f(k / (n - 1), p)));
      if (!s.rahmen) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const ph of [-.3, .6, 1.5]) for (let k = 0; k < n; k++) for (const [a, b] of kurve(f(k / (n - 1), ph), 90)) { x0 = Math.min(x0, a); x1 = Math.max(x1, a); y0 = Math.min(y0, b); y1 = Math.max(y1, b); }
        s.rahmen = [x0, y0, x1, y1]; }
      const [x0, y0, x1, y1] = s.rahmen, rand = +(c.dataset.rand || .1), sk = BREIT.has(s.art) ? w * (1 - 2 * rand) / (x1 - x0) : Math.min(w * (1 - 2 * rand) / (x1 - x0), h * (1 - 2 * rand) / (y1 - y0));
      const ox = w / 2 - (x0 + x1) / 2 * sk, oy = h / 2 + (y0 + y1) / 2 * sk;
      x.clearRect(0, 0, w, h); x.strokeStyle = c.dataset.farbe || "#111"; x.lineJoin = x.lineCap = "round";
      x.lineWidth = Math.max(1, Math.min(w, h) / 260 * +(c.dataset.stark || 1));
      for (const pts of kopien) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(ox + a * sk, oy - b * sk) : x.moveTo(ox + a * sk, oy - b * sk)); if (!OFFEN.has(s.art)) x.closePath(); x.stroke(); }
      s.gemalt = true;
    }
  };
  holen(); requestAnimationFrame(male);
  window.Schwingung = { holen, ARTEN: Object.keys(ARTEN) };
})();
