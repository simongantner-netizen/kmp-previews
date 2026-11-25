
window.Handschrift = (() => {
  const glaetten = (pts, n) => n < 1 ? pts : pts.map((q, i) => { if (i === 0 || i === pts.length - 1) return q;
    let sx = 0, sy = 0, k = 0; for (let j = Math.max(0, i - n); j <= Math.min(pts.length - 1, i + n); j++) { sx += pts[j][0]; sy += pts[j][1]; k++; }
    return [sx / k, sy / k, q[2], q[3], q[4]]; });
  const breiten = pts => { const mitDruck = pts.some(q => q[3] != null && q[3] > 0 && q[3] < 1);
    const w = pts.map((q, i) => { if (mitDruck) return .3 + .9 * (q[3] ?? .5);
      const a = pts[Math.max(0, i - 2)], b = pts[Math.min(pts.length - 1, i + 2)], dt = Math.max(1, b[2] - a[2]);
      const v = Math.hypot(b[0] - a[0], b[1] - a[1]) / dt; return Math.min(1.25, Math.max(.42, 1.3 - .55 * v)); });
    const sw = w.map((_, i) => { let s = 0, k = 0; for (let j = Math.max(0, i - 3); j <= Math.min(w.length - 1, i + 3); j++) { s += w[j]; k++; } return s / k; });
    const n = sw.length, rampe = Math.min(8, Math.floor(n / 3)), anfang = pts[0][4] ? -Infinity : 0, ende = pts[n - 1][4] ? Infinity : n - 1;
    return sw.map((v, i) => v * Math.min(1, .35 + .65 * Math.min(i - anfang, ende - i) / Math.max(1, rampe))); };
  const vorbereiten = (u, stil = {}) => { const s = { staerke: 3, neigung: 0, glaettung: 2, ...(u.stil || {}), ...stil }, tg = Math.tan(s.neigung * Math.PI / 180);
    const zuege = u.zuege.filter(z => z.length > 1).map(z => { const g = glaetten(z, s.glaettung), w = breiten(g);
      return g.map((q, i) => [q[0] - (q[1] - 0) * tg, q[1], q[2], w[i], q[4]]); });
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, dauer = 0;
    for (const z of zuege) for (const q of z) { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); dauer = Math.max(dauer, q[2]); }
    const rand = s.staerke * 1.4;
    return { zuege, staerke: s.staerke, box: [x0 - rand, y0 - rand, x1 - x0 + 2 * rand, y1 - y0 + 2 * rand], dauer }; };
  const zeichne = (ctx, v, { x = 0, y = 0, b, h, farbe = "#111", bis = Infinity, skalaStaerke = 1 } = {}) => {
    const [bx, by, bw, bh] = v.box, sk = Math.min(b / bw, h / bh), ox = x + (b - bw * sk) / 2 - bx * sk, oy = y + (h - bh * sk) / 2 - by * sk;
    ctx.save(); ctx.strokeStyle = farbe; ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (const z of v.zuege) { if (z[0][2] > bis) break;
      for (let i = 1; i < z.length; i++) { const a = z[i - 1], c = z[i]; if (a[2] > bis) break;
        let cx = c[0], cy = c[1];
        if (c[2] > bis) { const k = (bis - a[2]) / Math.max(1, c[2] - a[2]); cx = a[0] + (c[0] - a[0]) * k; cy = a[1] + (c[1] - a[1]) * k; }
        ctx.lineWidth = Math.max(.6, v.staerke * sk * skalaStaerke * (a[3] + c[3]) / 2);
        ctx.lineCap = (i === 1 && a[4]) || (i === z.length - 1 && c[4] && c[2] <= bis) ? "butt" : "round";
        ctx.beginPath(); ctx.moveTo(ox + a[0] * sk, oy + a[1] * sk); ctx.lineTo(ox + cx * sk, oy + cy * sk); ctx.stroke(); } }
    ctx.restore(); return sk; };
  let gemerkt = null;
  const laden = () => { if (gemerkt) return gemerkt;
    try { const x = new XMLHttpRequest(); x.open("GET", "assets/gl/unterschriften.json", false); x.send(); gemerkt = x.status === 200 ? JSON.parse(x.responseText) : { liste: [] }; }
    catch (e) { gemerkt = { liste: [] }; }
    return gemerkt; };
  const favorit = art => (laden().liste || []).find(u => u.favorit && u.art === art);
  return { vorbereiten, zeichne, laden, favorit, glaetten };
})();
