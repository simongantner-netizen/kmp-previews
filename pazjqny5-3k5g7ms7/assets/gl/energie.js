
(() => {
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hex = h => [1, 3, 5].map(i => parseInt(h.trim().slice(i, i + 2), 16) / 255);
  const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS = `precision highp float;
uniform vec2 r;uniform float t;uniform vec3 c0,c1,c2,c3;uniform vec2 m;uniform float z,mk,gz;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}
vec3 ramp(float x){x=clamp(x,0.,1.);return x<.33?mix(c0,c1,x/.33):x<.66?mix(c1,c2,(x-.33)/.33):mix(c2,c3,(x-.66)/.34);}
void main(){vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y)*z;
 vec2 d=p-m;float infl=mk*exp(-dot(d,d)*3.);p+=normalize(d+1e-4)*infl*.25;
 vec2 q=vec2(fbm(p+vec2(0.,t*.05)),fbm(p+vec2(5.2,1.3)-t*.04));
 vec2 s=vec2(fbm(p+3.*q+vec2(1.7,9.2)+t*.06),fbm(p+3.*q+vec2(8.3,2.8)-t*.05));
 float v=fbm(p+2.6*s);
 float band=smoothstep(0.,1.,v*1.25-.12+.18*sin(6.*s.x+t*.2));
 vec3 col=ramp(band);
 col+=pow(max(0.,sin((v+s.y)*18.+t*.4)),24.)*.22*gz;
 col*=.94+.06*n(gl_FragCoord.xy*.7);
 gl_FragColor=vec4(col,1.);}`;
  const gc = document.createElement("canvas");
  const gl = gc.getContext("webgl", { antialias: false, preserveDrawingBuffer: true });
  let U = null;
  if (gl) {
    const sh = (typ, src) => { const s = gl.createShader(typ); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const lp = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    const L = n => gl.getUniformLocation(pr, n);
    U = { r: L("r"), t: L("t"), m: L("m"), z: L("z"), mk: L("mk"), gz: L("gz"), c: [L("c0"), L("c1"), L("c2"), L("c3")] };
  }
  const alle = [];
  const io = new IntersectionObserver(es => es.forEach(x => { const e = alle.find(a => a.c === x.target); if (e) e.sicht = x.isIntersecting; }), { rootMargin: "150px" });
  const holen = () => document.querySelectorAll("canvas[data-energie]").forEach(c => {
    if (alle.find(a => a.c === c)) return;
    if (!gl) { c.style.background = `linear-gradient(135deg,${c.dataset.farben})`; return; }
    alle.push({ c, x: c.getContext("2d"), tempo: +(c.dataset.tempo || 1), zoom: +(c.dataset.zoom || 1.6), maus: c.dataset.maus !== undefined,
      still: c.dataset.still !== undefined || ruhig, m: [9, 9], mk: 0, ziel: 0, sicht: false, versatz: Math.random() * 100 });
    io.observe(c);
  });
  holen();
  addEventListener("pointermove", ev => alle.forEach(e => { if (!e.maus) return; const r = e.c.getBoundingClientRect(), s = Math.min(r.width, r.height);
    e.m = [((ev.clientX - r.left) - r.width / 2) / s * e.zoom, (r.height / 2 - (ev.clientY - r.top)) / s * e.zoom]; e.ziel = 1; }));
  let q = 1, vor = 0, summe = 0, n = 0;
  const male = ms => {
    if (vor && !document.hidden) { const dt = ms - vor; if (dt < 200) { summe += dt; n++; }
      if (n >= 40) { if (summe / n > 24 && q > .46) q = Math.max(.45, q * .8); summe = 0; n = 0; } }
    vor = ms;
    for (const e of alle) {
      if (!e.c.isConnected || !e.sicht || (e.c.checkVisibility && !e.c.checkVisibility({ visibilityProperty: true }))) continue;
      if (e.still && e.gemalt) continue;
      const { c } = e, dpr = Math.min(devicePixelRatio || 1, 2);
      const f = c.clientWidth * c.clientHeight * dpr * dpr > 2500000 ? .8 * q : q;
      const w = Math.max(2, Math.round(c.clientWidth * dpr * f)), h = Math.max(2, Math.round(c.clientHeight * dpr * f));
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
      if (gc.width !== w || gc.height !== h) { gc.width = w; gc.height = h; }
      gl.viewport(0, 0, w, h);
      e.mk += (e.ziel - e.mk) * .05; e.ziel *= .97;
      (c.dataset.farben || "#0A2A9E,#0B3FD0,#14C4E4,#4FDCEC").split(",").map(hex).forEach((v, i) => gl.uniform3fv(U.c[i], v));
      gl.uniform2f(U.r, w, h); gl.uniform1f(U.t, e.still ? 12 + e.versatz : ms / 1000 * e.tempo + e.versatz);
      gl.uniform2f(U.m, e.m[0], e.m[1]); gl.uniform1f(U.z, e.zoom); gl.uniform1f(U.mk, e.mk); gl.uniform1f(U.gz, c.dataset.matt !== undefined ? 0 : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (c.dataset.kiesel !== undefined) { const x = e.x; x.clearRect(0, 0, w, h); x.save(); x.beginPath();
        for (let k = 0; k <= 180; k++) { const a = k / 180 * Math.PI * 2, r = 1 + .08 * (.6 * Math.sin(2 * a + .7) + .4 * Math.sin(3 * a + 2.1));
          const px = w * (.5 + .5 * r / 1.08 * Math.cos(a)), py = h * (.5 + .5 * r / 1.08 * Math.sin(a)); k ? x.lineTo(px, py) : x.moveTo(px, py); }
        x.closePath(); x.clip(); x.drawImage(gc, 0, 0, w, h, 0, 0, w, h); x.restore(); }
      else e.x.drawImage(gc, 0, 0, w, h, 0, 0, w, h);
      e.gemalt = true;
    }
    requestAnimationFrame(male);
  };
  requestAnimationFrame(male);
  window.Energie = { holen };
})();
