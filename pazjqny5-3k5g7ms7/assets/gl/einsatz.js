
window.Einsatz = (() => {
  const PAL = {
    A: { name: "Perlmutt", herkunft: "Pantone Mother of Pearl, Mystic Navy, Chocolate Cremoso und ein Taubenblau",
      farben: [["Perlmutt", "#E4D7C4"], ["Taubenblau", "#7D8CA2"], ["Mystic Navy", "#19283E"], ["Chocolate, satter", "#3D2E26"]] },
    B: { name: "Espresso und Himmel", herkunft: "Espresso, Kaffee, Himmelblau, Eisblau",
      farben: [["Espresso", "#1E140E"], ["Kaffee", "#3B281C"], ["Himmelblau", "#A9C5D9"], ["Eisblau", "#C8DAE6"]] },
    C: { name: "Buttercream", herkunft: "Pantone Downtown Brown, Buttercream, Ice Melt, Estate Blue",
      farben: [["Buttercream", "#EBE2D2"], ["Ice Melt", "#D6E4EE"], ["Estate Blue", "#273554"], ["Downtown Brown, satter", "#50301F"]] },
  };
  const KREIS = {
    A_hell: "#19283E,#2B3D5C,#7D8CA2,#A9B7C9", A_dunkel: "#7D8CA2,#9AA8BC,#C9D3E0,#E8EDF3",
    B_hell: "#27405E,#3D5C80,#A9C5D9,#C8DAE6", B_dunkel: "#5F86AD,#7FA3C6,#A9C5D9,#DCE8F1",
    C_hell: "#273554,#3A4C70,#93ABC4,#C3D5E4", C_dunkel: "#6E87A8,#93ABC4,#C3D5E4,#E6EEF5",
    neon: "#7FB7FF,#9CC9FF,#C8E6FF,#F2FAFF",
  };
  const SCHRIFT = {
    geist: { echt: "Geist", css: "font-family:'Geist',sans-serif;font-weight:500;letter-spacing:-.025em", ersatz: false },
    institute: { echt: "LT Institute", css: "font-family:'LT Institute','Hanken Grotesk',sans-serif;font-weight:400;letter-spacing:-.01em", ersatz: false },
    nohemi: { echt: "Nohemi", css: "font-family:'Nohemi','Outfit',sans-serif;font-weight:500;letter-spacing:-.01em", ersatz: false },
    silk: { echt: "Silk Sans", css: "font-family:'Silk Sans Display','Tenor Sans',sans-serif;font-weight:400;letter-spacing:.01em", ersatz: false },
    soria: { echt: "Soria", css: "font-family:'Bodoni Moda',serif;font-weight:500;font-optical-sizing:none;font-variation-settings:'opsz' 96;letter-spacing:0", ersatz: "Bodoni Moda" },
    megante: { echt: "Megante", css: "font-family:'Megante','Italiana',serif;font-weight:400;letter-spacing:.06em;text-transform:uppercase", ersatz: false },
    urbanist: { echt: "Urbanist", css: "font-family:'Urbanist',sans-serif;font-weight:500;letter-spacing:-.02em", ersatz: false },
    sora: { echt: "Sora", css: "font-family:'Sora',sans-serif;font-weight:600;letter-spacing:-.02em", ersatz: false },
    intertight: { echt: "Inter Tight", css: "font-family:'Inter Tight',sans-serif;font-weight:600;letter-spacing:-.03em", ersatz: false },
    instrument: { echt: "Instrument Sans", css: "font-family:'Instrument Sans',sans-serif;font-weight:600;letter-spacing:-.02em", ersatz: false },
  };
  const ZEICHEN = {
    atemkreis: f => `<canvas data-atemkreis data-farben="${f.verlauf}" data-uebergang="verlauf" data-breite=".5"></canvas>`,
    punktkugel: f => { const g = (f.grund || "#03203D").replace("#", ""), hell = parseInt(g.slice(0, 2), 16) + parseInt(g.slice(2, 4), 16) + parseInt(g.slice(4, 6), 16) > 380;
      return `<canvas data-orb data-geo data-farben="${hell ? "#2B5F8E,#639CC5" : "#FFFFFF,#C4DCEE"}" data-linien="9" data-stark="4.8"></canvas>`; },
    linienkugel: f => { const v = f.verlauf.split(","); return `<canvas data-orb data-geo data-farben="${v[1]},${v[3]}" data-linien="9" data-stark="4.8"${f.akzent ? ` data-akzent="${f.akzent}"` : ""}></canvas>`; },
    punktring: f => `<canvas data-ring data-form="unendlich" data-kipp="2.2" data-flasche="${f.verlauf}" data-farbe="${f.schrift}"></canvas>`,
    voninnen: f => `<canvas data-strahl data-flasche="${f.verlauf}" data-farbe="${f.schrift}"></canvas>`,
    ineinander: f => `<canvas data-schlaufe data-flasche="${f.verlauf}" data-farbe="${f.schrift}"></canvas>`,
    vonhand: f => `<span data-zeichen="unterschrift" data-farbe="${f.schrift}"></span>`,
    frequenz: f => `<canvas data-frequenz="feld" data-form="unrund" data-saat="1" data-farben="${f.verlauf}" data-linien="24" data-stark="1.6"></canvas>`,
    pulsring: f => `<canvas data-frequenz="ring" data-farben="${f.verlauf}"></canvas>`,
    energien: f => `<canvas data-energie data-matt data-farben="${f.verlauf}" data-zoom="1.1" data-tempo="1.1"></canvas>`,
    schwingung: f => `<canvas data-schwingung="acht8" data-farbe="${f.schrift}"></canvas>`,
  };
  const breit = { punktring: 1.8, ineinander: 1.5, vonhand: 2.7, schwingung: 1.8 };
  const foto = (datei, art, farben, extra = "") => `<canvas class="fo" data-foto="assets/fotos-web/${datei}.jpg" data-art="${art}" data-farben="${farben}" ${extra}></canvas>`;
  const mild = (datei, tint, fokus = ".5,.3") => { const [fx, fy] = fokus.split(",").map(Number);
    return `<span class="mild" style="--tint:${tint}"><img src="assets/fotos-web/${datei}.jpg" alt="" loading="lazy" style="object-position:${fx * 100}% ${fy * 100}%"></span>`; };
  const bsp = t => `<span class="bsp">Beispiel${t ? ": " + t : ""}</span>`;
  return { PAL, KREIS, SCHRIFT, ZEICHEN, breit, foto, mild, bsp };
})();
Object.assign(Einsatz, (() => {
  const { ZEICHEN, SCHRIFT, breit } = Einsatz;
  const z = (L, ort = "hell", stil = "") => { const f = { verlauf: ort === "dunkel" ? L.verlaufDunkel : L.verlauf, schrift: ort === "dunkel" ? L.hellText : L.schrift, grund: ort === "dunkel" ? L.dunkel : L.grund };
    let h = ZEICHEN[L.id](f); if (L.id === "linienkugel") h = h.replace('data-linien="9" data-stark="4.8"', 'data-linien="6" data-stark="2.6"');
    return `<span class="zc z-${L.id}" style="--ar:${breit[L.id] || 1};${stil}">${h}</span>`; };
  const lockup = (L, ort = "hell", gr = "1em") => L.nurWort ? `<span style="${SCHRIFT[L.schriftart].css};font-size:${gr};white-space:nowrap;color:${ort === "dunkel" ? L.hellText : L.schrift}">Gianluca Lombardi</span>`
    : `<span class="lk2" style="${SCHRIFT[L.schriftart].css};font-size:${gr};color:${ort === "dunkel" ? L.hellText : L.schrift}">${z(L, ort)}<span>Gianluca Lombardi</span></span>`;
  const folie = (L, inhalt, ort = "hell") => `<div class="m-folie ${ort}" style="--g:${ort === "dunkel" ? L.dunkel : L.grund};--t:${ort === "dunkel" ? L.hellText : L.schrift}">${inhalt}</div>`;
  const browser = (L, inhalt) => `<div class="m-browser"><div class="leiste"><i></i><i></i><i></i><span>gianlucalombardi.ch</span></div><div class="seite" style="--g:${L.grund};--t:${L.schrift}">${inhalt}</div></div>`;
  const telefon = (L, inhalt, ort = "hell") => `<div class="m-tel"><div class="schirm ${ort}" style="--g:${ort === "dunkel" ? L.dunkel : L.grund};--t:${ort === "dunkel" ? L.hellText : L.schrift}">${inhalt}</div></div>`;
  return { z, lockup, folie, browser, telefon };
})());
Einsatz.E = (() => {
  let n = 0; const id = p => `${p}${++n}`;
  const kieselPfad = (() => { const pts = []; for (let k = 0; k < 180; k++) { const a = k / 180 * 2 * Math.PI, r = 1 + .08 * (.6 * Math.sin(2 * a + .7) + .4 * Math.sin(3 * a + 2.1));
    pts.push([.5 + .5 * r / 1.08 * Math.cos(a), .5 + .5 * r / 1.08 * Math.sin(a)]); } return "M" + pts.map(p => p.map(v => v.toFixed(4)).join(" ")).join("L") + "Z"; })();
  const kieselForm = (k0, sk, ph) => { const pts = []; for (let k = 0; k < 120; k++) { const a = k / 120 * 2 * Math.PI, r = (1 + .08 * (.6 * Math.sin(2 * a + .7 + ph) + .4 * Math.sin(3 * a + 2.1 - ph))) * sk;
    pts.push([.5 + .5 * r / 1.08 * Math.cos(a), .5 + .5 * r / 1.08 * Math.sin(a)]); } return "M" + pts.map(p => p.map(v => v.toFixed(4)).join(" ")).join("L") + "Z"; };
  const kieselAtem = inhalt => { const i = id("ka"), d0 = kieselForm(0, .9, 0), d1 = kieselForm(0, 1, .35);
    return `<div class="e-kiesel" style="clip-path:url(#${i})"><svg width="0" height="0" style="position:absolute"><clipPath id="${i}" clipPathUnits="objectBoundingBox"><path d="${d0}"><animate attributeName="d" values="${d0};${d1};${d0}" keyTimes="0;.4;1" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1" dur="6.5s" repeatCount="indefinite"/></path></clipPath></svg>${inhalt}</div>`; };
  const kiesel = inhalt => { const i = id("ki"); return `<div class="e-kiesel" style="clip-path:url(#${i})"><svg width="0" height="0" style="position:absolute"><clipPath id="${i}" clipPathUnits="objectBoundingBox"><path d="${kieselPfad}"/></clipPath></svg>${inhalt}</div>`; };
  const breiten = (farbe, nZ = 18, stark = 1, seite = "rechts") => { const m = id("bk"); let l = "";
    for (let i = 1; i < nZ; i++) { const y0 = 50 - 50 * Math.cos(Math.PI * i / nZ), amp = 0; let d = "";
      for (let k = 0; k <= 60; k++) { const x = k / 60 * 100, y = y0 + amp * (Math.sin(x / 100 * 2 * Math.PI * 2 + i * .7) * .7 + Math.sin(x / 100 * 2 * Math.PI * 3 - i * .4) * .3); d += (k ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(2); }
      l += `<path d="${d}" vector-effect="non-scaling-stroke"/>`; }
    const r = seite === "links" ? [["0", 1], [".55", 0]] : seite === "mitte" ? [["0", 0], [".5", 1], ["1", 0]] : [["0", 0], [".45", 0], ["1", 1]];
    return `<svg class="e-voll" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="${m}">${r.map(([o, a]) => `<stop offset="${o}" stop-color="#fff" stop-opacity="${a}"/>`).join("")}</linearGradient><mask id="${m}m"><rect width="100" height="100" fill="url(#${m})"/></mask></defs><g mask="url(#${m}m)" fill="none" stroke="${farbe}" stroke-width="${stark * .8}" opacity=".85">${l}</g></svg>`; };
  const ellipse = (vorne, hinten) => `<svg class="e-ell" viewBox="0 0 200 24"><path d="M2 12 A98 9 0 0 1 198 12" fill="none" stroke="${hinten}" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M2 12 A98 9 0 0 0 198 12" fill="none" stroke="${vorne}" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>`;
  const punktlinie = (farbe, w = 2.4) => `<svg class="e-pl" viewBox="0 0 200 6" preserveAspectRatio="none"><line x1="3" x2="197" y1="3" y2="3" stroke="${farbe}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="0 ${w * 2.5}"/></svg>`;
  const achter = (farbe, schritte = [], textFarbe = farbe) => { const P = t => { const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s; return [100 + 88 * c / d, 50 + 88 * s * c / d]; };
    let d = ""; for (let k = 0; k <= 200; k++) { const [x, y] = P(k / 200 * 2 * Math.PI); d += (k ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2); }
    const lagen = schritte.length === 2 ? [0, Math.PI] : [1.75 * Math.PI, Math.PI, .25 * Math.PI, 1.2 * Math.PI];
    const marken = schritte.map((s, k) => { const [x, y] = P(lagen[k % lagen.length]); return `<circle cx="${x}" cy="${y}" r="3.4" fill="${farbe}"/><text x="${x}" y="${y + (y < 49 ? -8 : 14)}" fill="${textFarbe}" text-anchor="middle">${s}</text>`; }).join("");
    return `<svg class="e-achter" viewBox="-34 -6 268 112"><path d="${d}" fill="none" stroke="${farbe}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0 4.2" opacity=".85"/>${marken}</svg>`; };
  const strahlenkante = (dunkel, hell, nS = 46, welle = 0, extra = "") => `<canvas class="e-sk" data-sk data-d="${dunkel}" data-h="${hell}" data-n="${nS}" data-w="${welle}" ${extra}></canvas>`;
  const sPfad = "M0 0 H100 V38 C78 38 70 20 50 20 C30 20 22 62 50 62 C70 62 66 100 100 100 V100 H0 Z";
  const sTeilung = (a, b) => `<svg class="e-voll" viewBox="0 0 100 100" preserveAspectRatio="none"><rect width="100" height="100" fill="${b}"/><path d="M0 0 H100 V22 C72 22 66 50 50 50 C34 50 28 78 0 78 Z" fill="${a}"/></svg>`;
  const buendel = (farbe, nL = 11, bogen = 18) => { const m = id("bm"); let l = "";
    for (let k = 0; k < nL; k++) { const y = 20 + k * (60 / Math.max(1, nL - 1)); l += `<path d="M0 ${y} C 35 ${y - bogen} 65 ${y + bogen} 100 ${y}"/>`; }
    return `<svg class="e-voll" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="${m}"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff"/><stop offset=".8" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${m}m"><rect width="100" height="100" fill="url(#${m})"/></mask></defs><g mask="url(#${m}m)" fill="none" stroke="${farbe}" stroke-width="1" vector-effect="non-scaling-stroke">${l}</g></svg>`; };
  const rasterband = (farbe, zeilen = 4) => { let p = ""; const sp = 1.4;
    for (let r = 0; r < zeilen; r++) for (let x = sp / 2 + (r % 2) * sp / 2; x < 100; x += sp) { const t = x / 100, rad = sp * .48 * (1 - t) ** 1.4; if (rad > .08) p += `<circle cx="${x.toFixed(2)}" cy="${(r * sp + sp / 2).toFixed(2)}" r="${rad.toFixed(2)}"/>`; }
    return `<svg class="e-rb" viewBox="0 0 100 ${zeilen * sp}" preserveAspectRatio="xMinYMid slice"><g fill="${farbe}">${p}</g></svg>`; };
  const handstrich = farbe => `<svg class="e-hs" viewBox="0 0 220 26"><path d="M4 17 C 40 10, 92 8, 132 11 C 160 13, 186 18, 214 9" fill="none" stroke="${farbe}" stroke-width="3.2" stroke-linecap="round" pathLength="1"/></svg>`;
  const haken = farbe => `<svg class="e-hk" viewBox="0 0 40 30"><path d="M4 17 L14 26 L36 4" fill="none" stroke="${farbe}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>`;
  return { kiesel, kieselAtem, breiten, ellipse, punktlinie, achter, strahlenkante, sTeilung, buendel, rasterband, handstrich, haken };
})();
Einsatz.unterKreis = () => {
  const paare = [...document.querySelectorAll("[data-unter-kreis]")].map(el => {
    const box = el.closest(".m-folie,.seite,.m-plakat,.el") || el.parentElement, c = [...box.querySelectorAll("canvas[data-atemkreis]")].sort((p, q) => q.clientWidth - p.clientWidth)[0];
    if (!c) return null; const k = el.cloneNode(true); k.removeAttribute("data-unter-kreis"); k.setAttribute("aria-hidden", "true");
    k.classList.add("weiss-kopie"); k.style.clipPath = "polygon(0 0)"; el.after(k); return { k, c, box }; }).filter(Boolean);
  const groesster = box => [...box.querySelectorAll("canvas[data-atemkreis]")].sort((p, q) => q.clientWidth - p.clientWidth)[0];
  const schritt = () => { for (const p of paare) { if (p.c.clientWidth < 60) p.c = groesster(p.box) || p.c; const { k, c } = p; const u = c.umriss; if (!u) continue;
      const rc = c.getBoundingClientRect(), rk = k.getBoundingClientRect(); if (rk.bottom < -50 || rk.top > innerHeight + 50) continue;
      const sx = rc.width / (c.clientWidth || 1), sy = rc.height / (c.clientHeight || 1), dx = rc.left - rk.left, dy = rc.top - rk.top;
      const ks = rk.width / (k.offsetWidth || 1) || 1;
      k.style.clipPath = `polygon(${u.map(([x, y]) => `${((dx + x * sx) / ks).toFixed(1)}px ${((dy + y * sy) / ks).toFixed(1)}px`).join(",")})`; }
    requestAnimationFrame(schritt); };
  if (paare.length) requestAnimationFrame(schritt);
};
Einsatz.app = (L, B) => { L = B.L || L; const { telefon, bsp } = Einsatz, A = Einsatz.APP, s = Einsatz.SCHRIFT[L.schriftart].css, ort = B.ort || "hell";
  const tx = ort === "dunkel" ? L.hellText : L.schrift, an = ort === "dunkel" ? L.hellText : L.display, leise = L.leise;
  const st = `<div class="status"><span>9:41</span><span>●●●</span></div>`;
  const video = (titel, dauer, gross) => `<div style="position:relative;border-radius:4cqw;overflow:hidden;aspect-ratio:${gross ? "4/5" : "16/10"};background:#222">${B.foto(gross)}<div style="position:absolute;inset:auto 0 0 0;padding:${gross ? 5 : 2.6}cqw;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff"><div style="font:600 ${gross ? 3.2 : 2.4}cqw Inter;opacity:.8;letter-spacing:.04em;text-transform:uppercase">Video · ${dauer}</div><div style="${s};font-size:${gross ? 6.4 : 3.4}cqw;line-height:1.15;margin-top:1cqw">${titel}</div></div><div style="position:absolute;right:${gross ? 5 : 3}cqw;top:${gross ? 5 : 3}cqw;width:${gross ? 11 : 6}cqw;aspect-ratio:1;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center"><span style="width:0;height:0;border-left:${gross ? 3.4 : 1.9}cqw solid #222;border-top:${gross ? 2.1 : 1.2}cqw solid transparent;border-bottom:${gross ? 2.1 : 1.2}cqw solid transparent;margin-left:${gross ? 1 : .5}cqw"></span></div></div>`;
  const s1 = telefon(L, `${st}<div style="padding:7cqw 7cqw 0;display:flex;justify-content:space-between;align-items:center">${B.kopf}<span style="font:500 3.6cqw Inter;color:${leise}">Do, 7. Jan.</span></div>
    <div style="padding:5cqw 7cqw 0;${s};font-size:8cqw;line-height:1.05;color:${an}">${A.gruss}</div>
    <div style="padding:5cqw 7cqw 0">${video(A.videos[0], "12 Min.", true)}</div>
    <div style="padding:5cqw 7cqw 0;font:600 3.2cqw Inter;letter-spacing:.06em;text-transform:uppercase;color:${leise}">Affirmation des Tages</div>
    <div style="padding:1.5cqw 7cqw 0;${s};font-size:5.4cqw;line-height:1.25;color:${tx}">${A.affirmationen[0]}</div>`, ort);
  const s2 = telefon(L, `${st}<div style="padding:8cqw 7cqw 0;${s};font-size:8cqw;color:${an}">Meine Ziele 2027</div>
    ${A.ziele.map((z, i) => `<div style="padding:5cqw 7cqw 0"><div style="font:500 4.2cqw/1.35 Inter;color:${tx}">${z}</div><div style="margin-top:2.4cqw">${B.fortschritt([.7, .35, .15][i])}</div></div>`).join("")}
    <div style="padding:7cqw 7cqw 0;font:600 3.2cqw Inter;letter-spacing:.06em;text-transform:uppercase;color:${leise}">Weitere Videos</div>
    <div style="display:flex;gap:3cqw;padding:2.5cqw 7cqw 0">${A.videos.slice(1, 3).map(v => `<div style="flex:1">${video(v, "8 Min.")}</div>`).join("")}</div>`, ort);
  const tage = ["M", "D", "M", "D", "F", "S", "S"], muster = [[1, 1, 1, 0, 1, 0, 0], [1, 0, 1, 1, 1, 1, 0], [0, 1, 1, 1, 0, 0, 0], [1, 1, 1, 1, 1, 0, 0]];
  const s3 = telefon(L, `${st}<div style="padding:8cqw 7cqw 0;${s};font-size:8cqw;color:${an}">Routinen</div><div style="padding:1cqw 7cqw 3cqw;font:400 3.8cqw Inter;color:${leise}">Diese Woche</div>
    <div style="display:grid;grid-template-columns:1fr repeat(7,6.2cqw);gap:2.4cqw 1.6cqw;align-items:center;padding:0 7cqw;font:500 3.2cqw Inter;color:${leise}"><span></span>${tage.map(t => `<span style="text-align:center">${t}</span>`).join("")}
    ${A.routinen.map((r, i) => `<span style="font:500 3.8cqw/1.3 Inter;color:${tx}">${r}</span>${muster[i].map(m => `<span style="display:grid;place-items:center;height:6.2cqw">${B.tag(m)}</span>`).join("")}`).join("")}</div>
    <div style="padding:7cqw 7cqw 0;font:600 3.2cqw Inter;letter-spacing:.06em;text-transform:uppercase;color:${leise}">Affirmationen</div>
    ${A.affirmationen.slice(1, 4).map(a => `<div style="padding:2.6cqw 7cqw 0;${s};font-size:4.6cqw;line-height:1.3;color:${tx}">${a}</div>`).join("")}`, ort);
  return [s1, s2, s3]; };
Einsatz.kanten = () => {
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches, zeiger = { x: -1e4, y: -1e4 }, sicht = new WeakMap();
  addEventListener("pointermove", e => { zeiger.x = e.clientX; zeiger.y = e.clientY; }, { passive: true });
  const io = new IntersectionObserver(es => es.forEach(e => sicht.set(e.target, e.isIntersecting)), { rootMargin: "200px" });
  const alle = [...document.querySelectorAll("canvas[data-sk]")]; alle.forEach(c => { io.observe(c); c.zug = 0; });
  const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const male = ms => { const t = ruhig ? 2 : ms / 1000;
    for (const c of alle) { if (sicht.get(c) === false) continue; const d = Math.min(2, devicePixelRatio || 1), W = Math.round(c.clientWidth * d), H = Math.round(c.clientHeight * d); if (!W || !H) continue;
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      const dir = c.dataset.dir || "unten", quer = dir === "links" || dir === "rechts";
      const x = c.getContext("2d"), n = +c.dataset.n || 40, w = +c.dataset.w || 0, r = c.getBoundingClientRect();
      const aus = c.dataset.aus !== undefined;
      const nah = zeiger.y > r.top - 60 && zeiger.y < r.bottom + 60 && zeiger.x > r.left - 60 && zeiger.x < r.right + 60;
      c.zug += ((nah ? 1 : 0) - c.zug) * .08; const mx = (quer ? zeiger.y - r.top : zeiger.x - r.left) * d;
      x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H);
      if (dir === "links") x.setTransform(0, 1, -1, 0, W, 0); else if (dir === "rechts") x.setTransform(0, 1, 1, 0, 0, 0); else if (dir === "oben") x.setTransform(1, 0, 0, -1, 0, H);
      const Wf = quer ? H : W, Hf = quer ? W : H;
      x.lineCap = "round";
      const n2 = Math.max(8, Math.round(n * .55)), sp = Wf / n2, bw = Math.max(2 * d, Math.min(sp * .56, Hf * .2));
      for (let i = 0; i < n2; i++) { const bx = (i + .5) * sp;
        let f = .58 + .2 * Math.sin(i * .5 - t * .8 + w * 6) + .08 * Math.sin(i * .17 + t * .35);
        f += c.zug * .3 * Math.exp(-(((mx - bx) / (Wf * .14)) ** 2));
        if (c.dataset.ab) f *= 1 - +c.dataset.ab * i / n2;
        const len = (Hf - bw) * Math.min(1, Math.max(.2, f)), y1 = Hf - bw / 2 - len, y0 = aus ? Hf + bw : Hf - bw / 2;
        const g = x.createLinearGradient(0, aus ? Hf : y0, 0, y1); g.addColorStop(0, c.dataset.d); g.addColorStop(1, c.dataset.h + "AA");
        x.strokeStyle = g; x.lineWidth = bw; x.beginPath(); x.moveTo(bx, y0); x.lineTo(bx, y1); x.stroke(); } }
    if (!ruhig) requestAnimationFrame(male); };
  if (alle.length) requestAnimationFrame(male);
};
Einsatz.lockups = (wurzel = document) => {
  const mc = document.createElement("canvas").getContext("2d");
  const tinte = c => {
    const w = c.width, h = c.height; if (!w || !h) return null; let d; try { d = c.getContext("2d").getImageData(0, 0, w, h).data; } catch (e) { return null; }
    const er = d[0], eg = d[1], eb = d[2], ea = d[3]; let x0 = w, y0 = h, x1 = -1, y1 = -1; const st = Math.max(1, Math.round(Math.min(w, h) / 220));
    for (let y = 0; y < h; y += st) for (let x = 0; x < w; x += st) { const i = (y * w + x) * 4, a = d[i + 3];
      const ist = ea < 30 ? a > 40 : a > 40 && Math.abs(d[i] - er) + Math.abs(d[i + 1] - eg) + Math.abs(d[i + 2] - eb) > 40;
      if (ist) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    return x1 < 0 ? null : [x0 / w, y0 / h, (x1 + st) / w, (y1 + st) / h]; };
  const setzen = (el, f) => {
    const kids = [...el.children], m = kids.find(k => k.matches(".marke,.zc,.marke-w") || k.querySelector("canvas")), t = kids[kids.length - 1];
    if (!m || !t || m === t) return; const cs = getComputedStyle(t), fs = parseFloat(cs.fontSize);
    mc.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; try { mc.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing; } catch (e) {}
    const zeilen = t.innerHTML.split(/<br\s*\/?>/i).map(z => z.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim()).filter(Boolean), n = zeilen.length || 1;
    if (!zeilen.length) return;
    const h0 = mc.measureText("Hg"), fA = h0.fontBoundingBoxAscent, fD = h0.fontBoundingBoxDescent, cap = mc.measureText("H").actualBoundingBoxAscent;
    const L = cs.lineHeight === "normal" ? fA + fD : parseFloat(cs.lineHeight), b = (L - (fA + fD)) / 2 + fA;
    const links = Math.min(...zeilen.map(z => -mc.measureText(z).actualBoundingBoxLeft));
    const T = cap + (n - 1) * L, H = n > 1 ? 1.5 * T : 3 * cap, mitteT = n > 1 ? (b - cap + b + (n - 1) * L) / 2 : b - cap / 2, dy = mitteT - n * L / 2;
    const [fx0, fy0, fx1, fy1] = f, asp = (m.clientWidth || 1) / (m.clientHeight || 1);
    const Bh = H / (fy1 - fy0), Bw = Bh * asp, inkMitte = ((fy0 + fy1) / 2 - .5) * Bh, gap = H / 3 - (1 - fx1) * Bw - links;
    m.style.width = Bw.toFixed(1) + "px"; m.style.height = Bh.toFixed(1) + "px"; m.style.flex = "none";
    m.style.position = "relative"; m.style.marginTop = m.style.marginBottom = "0px"; m.style.top = (dy - inkMitte).toFixed(1) + "px";
    el.style.gap = "0px"; el.style.alignItems = "center"; m.style.marginRight = gap.toFixed(1) + "px";
    m.style.marginLeft = (-fx0 * Bw).toFixed(1) + "px";
    el.dataset.lockupGesetzt = `H ${H.toFixed(1)} · Abstand ${(H / 3).toFixed(1)}`;
  };
  const els = [...wurzel.querySelectorAll(".gl-lockup,.gl-ein,.lk2,.lockup")].filter(el => el.dataset.lockupFrei === undefined && !el.dataset.lockupGesetzt);
  if (!els.length) return;
  const TINTE = { strahl: [.066, .085, .907, .937], atemkreis: [.072, .054, .925, .961], orb: [.072, .072, .931, .931], kugel: [.084, .06, .943, .919], acht: [.041, .05, .901, .89], feld: [.15, .09, .871, .858], pring: [.102, .144, .901, .847], schw: [.084, .17, .919, .83], kiesel: [.032, .052, .99, .956], s8: [.026, .12, .973, .88] };
  const art = c => c && (c.dataset.strahl !== undefined ? "strahl" : c.dataset.atemkreis !== undefined ? "atemkreis" : c.dataset.orb !== undefined ? "orb" : c.dataset.kugel !== undefined ? "kugel" : c.dataset.ring !== undefined && c.dataset.atemkreis === undefined ? "acht" : c.dataset.frequenz === "feld" && c.dataset.form === "unrund" ? "feld" : c.dataset.frequenz === "ring" ? "pring" : c.dataset.schwingung === "acht8" ? "s8" : c.dataset.energie !== undefined && c.dataset.kiesel !== undefined ? "kiesel" : null);
  document.fonts.ready.then(() => els.forEach(el => { const c = el.querySelector("canvas"), f = TINTE[art(c)]; if (f && el.dataset.lockupGesetzt === undefined) { setzen(el, f); el.dataset.lockupFest = "1"; } }));
  const rahmen = new Map(); let k = 0;
  const sammeln = () => { for (const el of els) { const c = el.querySelector("canvas"); if (!c || !c.clientWidth) continue; const f = tinte(c); if (!f) continue;
      const r = rahmen.get(el); rahmen.set(el, r ? [Math.min(r[0], f[0]), Math.min(r[1], f[1]), Math.max(r[2], f[2]), Math.max(r[3], f[3])] : f); }
    if (++k < 9) setTimeout(sammeln, 120); else { for (const [el, f] of rahmen) setzen(el, f);
      const offen = els.filter(el => !el.dataset.lockupGesetzt); if (offen.length) { const n = +(wurzel.dataset ? wurzel.dataset.lockupVersuch || 0 : 0);
        if (n < 5 && wurzel.dataset) { wurzel.dataset.lockupVersuch = n + 1; setTimeout(() => Einsatz.lockups(wurzel), 1500); } else if (!wurzel.dataset) setTimeout(() => Einsatz.lockups(document.body), 1500); } } };
  document.fonts.ready.then(() => setTimeout(sammeln, 500));
};
