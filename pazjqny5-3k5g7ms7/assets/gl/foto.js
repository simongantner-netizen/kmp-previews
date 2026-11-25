
(() => {
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const cache = {};
  const laden = src => cache[src] || (cache[src] = new Promise(ok => { const i = new Image(); i.onload = () => ok(i); i.src = src; }));
  const helligkeit = (img, W, H, fx, fy, aufl) => {
    const w = Math.max(8, Math.round(W / aufl)), h = Math.max(8, Math.round(H / aufl));
    const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
    const s = Math.max(w / img.width, h / img.height), iw = img.width * s, ih = img.height * s;
    x.drawImage(img, Math.min(0, Math.max(w - iw, w / 2 - fx * iw)), Math.min(0, Math.max(h - ih, h / 2 - fy * ih)), iw, ih);
    const d = x.getImageData(0, 0, w, h).data, L = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) L[i] = (.2126 * d[i * 4] + .7152 * d[i * 4 + 1] + .0722 * d[i * 4 + 2]) / 255;
    const s2 = Array.from(L).sort((a, b) => a - b), lo = s2[Math.floor(s2.length * .01)], hi = s2[Math.floor(s2.length * .995)];
    for (let i = 0; i < L.length; i++) L[i] = Math.min(1, Math.max(0, (L[i] - lo) / Math.max(.01, hi - lo)));
    return { L, w, h };
  };
  async function zeichne(c) {
    const img = await laden(c.dataset.foto), dpr = Math.min(2, devicePixelRatio || 1);
    const W = Math.round(c.clientWidth * dpr), H = Math.round(c.clientHeight * dpr); if (!W || !H) return;
    c.width = W; c.height = H; const x = c.getContext("2d");
    const [fx, fy] = (c.dataset.fokus || ".5,.4").split(",").map(Number), art = c.dataset.art || "duoton";
    const [dunkel, hell] = (c.dataset.farben || "#19283E,#E4D7C4").split(",").map(s => s.trim());
    const raster = +(c.dataset.raster || 6) * dpr * (W / dpr < 260 ? .7 : 1);
    x.clearRect(0, 0, W, H);
    if (c.dataset.grund) { x.fillStyle = c.dataset.grund; x.fillRect(0, 0, W, H); }
    if (art === "duoton") {
      const { L, w, h } = helligkeit(img, W, H, fx, fy, 1), a = hex(dunkel), b = hex(hell), out = x.createImageData(w, h);
      for (let i = 0; i < w * h; i++) { const k = L[i] ** .9; for (let j = 0; j < 3; j++) out.data[i * 4 + j] = a[j] + (b[j] - a[j]) * k; out.data[i * 4 + 3] = 255; }
      x.putImageData(out, 0, 0); return;
    }
    const { L, w, h } = helligkeit(img, W, H, fx, fy, raster / 2);
    const ox = +(c.dataset.ox || .5), oy = +(c.dataset.oy || .62), kx = W * fx, ky = H * Math.min(.62, fy + .22);
    const recht = c.dataset.maske === "rechteck";
    const weg = (px, py) => { const e = recht ? Math.pow(Math.abs(px / W - .5) ** 6 / .5 ** 6 + Math.abs(py / H - .5) ** 6 / .5 ** 6, 1 / 6) : Math.hypot((px - kx) / (W * ox), (py - ky) / (H * oy));
      const t = Math.min(1, Math.max(0, (e - (recht ? .82 : .55)) / (recht ? .18 : .5))); return t * t * (3 - 2 * t); };
    const at = (px, py) => { const v = L[Math.min(h - 1, Math.floor(py / H * h)) * w + Math.min(w - 1, Math.floor(px / W * w))]; return v + (1 - v) * weg(px, py); };
    x.fillStyle = x.strokeStyle = dunkel;
    if (art === "punkte") {
      for (let py = raster / 2, r = 0; py < H; py += raster, r++) for (let px = raster / 2 + (r % 2) * raster / 2; px < W; px += raster) {
        const d = 1 - at(px, py), rad = raster * .5 * Math.sqrt(d) * .95; if (rad < .35 * dpr) continue;
        x.beginPath(); x.arc(px, py, rad, 0, 6.2832); x.fill(); }
    } else if (art === "linien") {
      for (let py = raster / 2; py < H; py += raster) { x.beginPath();
        for (let px = 0; px <= W; px += 2 * dpr) { const t = (1 - at(px, py)) * raster * .46; x.lineTo(px, py - t); }
        for (let px = W; px >= 0; px -= 2 * dpr) { const t = (1 - at(px, py)) * raster * .46; x.lineTo(px, py + t); }
        x.closePath(); x.fill(); }
    } else if (art === "ringe") {
      const cx = W * fx, cy = H * fy, R = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy));
      for (let r = raster / 2; r < R; r += raster) { x.beginPath(); let erst = true;
        const n = Math.max(24, Math.round(r * 6.2832 / (2 * dpr)));
        for (let k = 0; k <= n; k++) { const a = k / n * 6.2832, px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
          if (px < -raster || py < -raster || px > W + raster || py > H + raster) { erst = true; continue; }
          const d = (1 - at(Math.min(W - 1, Math.max(0, px)), Math.min(H - 1, Math.max(0, py)))) * raster * .45; x.lineWidth = Math.max(.4 * dpr, d);
          if (erst) { x.stroke(); x.beginPath(); x.moveTo(px, py); erst = false; } else x.lineTo(px, py); }
        x.stroke(); }
    }
  }
  const alle = () => document.querySelectorAll("canvas[data-foto]").forEach(zeichne);
  const ro = new ResizeObserver(es => es.forEach(e => zeichne(e.target)));
  addEventListener("DOMContentLoaded", () => document.querySelectorAll("canvas[data-foto]").forEach(c => { ro.observe(c); zeichne(c); }));
  window.Foto = { zeichne, alle };
})();
