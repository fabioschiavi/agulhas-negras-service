/* Agulhas Negras Service — "feixe de luz": um fragment shader, um triângulo.
   N tubos de luz (núcleo fino + bainha macia) correm por uma faixa ondulada; pulsos entram por uma
   borda e morrem antes da outra; o cursor "agarra" o feixe por uma janela gaussiana ao longo do eixo.
   Parâmetros (ângulo, deslocamento, abertura, alpha) são interpolados conforme o scroll (ver main.js).
   Mecânica estudada na ficha "Light Cables" do Originkit e no feixe único do layer Relay (GetLayers). */

export function createStream(canvas, { core = [0.92, 0.97, 1], sheath = [0.45, 0.78, 0.98], bg = [0.0196, 0.0235, 0.0275] } = {}) {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, powerPreference: "high-performance" });
  if (!gl) return null;
  const mobile = innerWidth < 760;
  const N = mobile ? 12 : 20;

  const vs = `#version 300 es
  void main(){ vec2 p = vec2(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0); gl_Position = vec4(p, 0.0, 1.0); }`;
  const fs = `#version 300 es
  precision highp float;
  out vec4 o;
  uniform vec2 uRes, uMouse, uOffset;
  uniform float uTime, uMouseOn, uIntro, uAngle, uSpread, uAlpha, uFan;
  uniform vec3 uCore, uSheath, uBg;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  void main(){
    float asp = uRes.x / uRes.y;
    vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
    float c = cos(uAngle), s = sin(uAngle);
    mat2 R = mat2(c, -s, s, c);
    vec2 p = R * (uv - uOffset);
    vec2 m = R * ((uMouse - 0.5 * uRes) / uRes.y - uOffset);
    float t = p.x;
    float base = 0.10 * sin(t * 1.7 + uTime * 0.22) + 0.05 * sin(t * 4.1 - uTime * 0.31) + 0.03 * sin(t * 9.0 + uTime * 0.5);
    float g = exp(-pow((t - m.x) / 0.42, 2.0)) * uMouseOn;
    float fan = 1.0 + uFan * smoothstep(-asp, asp, t);
    float feed = smoothstep(-asp * 1.15, -asp * 0.55, t) * (1.0 - smoothstep(asp * 0.45, asp * 1.1, t));
    vec3 col = vec3(0.0);
    for (int i = 0; i < ${N}; i++) {
      float fi = float(i);
      float h1 = hash(vec2(fi, 1.0)), h2 = hash(vec2(fi, 2.0)), h3 = hash(vec2(fi, 3.0));
      float off = (fi - float(${N - 1}) * 0.5) * uSpread * fan * (1.0 + 0.25 * sin(fi * 1.7 + t * 1.1 + uTime * 0.17));
      float wob = 0.018 * sin(t * 6.0 + fi * 2.3 + uTime * (0.4 + 0.3 * h1));
      float yc = base + off + wob;
      yc = mix(yc, m.y + off * 0.5, g * 0.85);
      float d = abs(p.y - yc);
      float w = 0.0016 + 0.0012 * h2;
      float core = exp(-d * d / (2.0 * w * w));
      float sheath = exp(-d * d / (2.0 * 0.018 * 0.018));
      float pulse = 0.5 + 0.5 * sin(t * (2.2 + 1.5 * h3) - uTime * (0.9 + 0.5 * h1) + h2 * 6.2831);
      pulse = pulse * pulse * pulse;
      float bright = 0.18 + 0.82 * h3 * h3 * h3; // poucas fibras vivas, muitas discretas
      float k = (0.25 + 0.75 * pulse) * feed * bright;
      col += uCore * core * k * (0.75 + 1.4 * g) + uSheath * sheath * k * 0.16;
    }
    col += uSheath * 0.03 * feed * exp(-abs(p.y - base) * 3.0);
    col *= uIntro * uAlpha;
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    o = vec4(uBg + col, 1.0);
  }`;

  const sh = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error("shader: " + gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("program: " + gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  gl.bindVertexArray(gl.createVertexArray());
  const U = {};
  for (const n of ["uRes", "uMouse", "uOffset", "uTime", "uMouseOn", "uIntro", "uAngle", "uSpread", "uAlpha", "uFan", "uCore", "uSheath", "uBg"]) U[n] = gl.getUniformLocation(prog, n);
  gl.uniform3fv(U.uCore, core); gl.uniform3fv(U.uSheath, sheath); gl.uniform3fv(U.uBg, bg);

  const DPR = Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5);
  let W = 0, H = 0;
  function resize() {
    W = Math.max(1, Math.round(innerWidth * DPR)); H = Math.max(1, Math.round(innerHeight * DPR));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    gl.viewport(0, 0, W, H);
  }
  resize();
  addEventListener("resize", resize);

  // estado alvo e estado atual (interpolados a cada frame)
  const cur = { angle: -0.35, ox: 0.15, oy: 0.05, spread: 0.012, alpha: 1, fan: 0.8 };
  const tgt = { ...cur };
  let mx = innerWidth * 0.6, my = innerHeight * 0.4, smx = mx, smy = my, mouseOn = 0, mouseTgt = 0, intro = 0, introTgt = 0;
  addEventListener("pointermove", (e) => { if (e.pointerType === "touch") return; mx = e.clientX; my = e.clientY; mouseTgt = 1; }, { passive: true });
  addEventListener("pointerleave", () => { mouseTgt = 0; });
  document.addEventListener("mouseleave", () => { mouseTgt = 0; });

  const t0 = performance.now();
  let running = true, paused = false;
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (paused) return;
    const t = (now - t0) / 1000;
    for (const k in tgt) cur[k] += (tgt[k] - cur[k]) * 0.05;
    smx += (mx - smx) * 0.07; smy += (my - smy) * 0.07;
    mouseOn += (mouseTgt - mouseOn) * 0.04;
    intro += (introTgt - intro) * 0.03;
    gl.uniform2f(U.uRes, W, H);
    gl.uniform2f(U.uMouse, smx * DPR, H - smy * DPR);
    gl.uniform2f(U.uOffset, cur.ox, cur.oy);
    gl.uniform1f(U.uTime, t);
    gl.uniform1f(U.uMouseOn, mouseOn);
    gl.uniform1f(U.uIntro, intro);
    gl.uniform1f(U.uAngle, cur.angle);
    gl.uniform1f(U.uSpread, cur.spread);
    gl.uniform1f(U.uAlpha, cur.alpha);
    gl.uniform1f(U.uFan, cur.fan);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  requestAnimationFrame(frame);
  window.__stream = { cur, tgt, step: frame }; // hook headless

  return {
    set(p) { Object.assign(tgt, p); },
    intro(v) { introTgt = v; },
    pause(v) { paused = v; },
    destroy() { running = false; },
  };
}
