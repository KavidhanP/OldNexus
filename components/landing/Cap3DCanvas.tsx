"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cap3DCanvas — Moffett AI-style high-density mesh network
   ~130 000 nodes, spatial-hash connections, hub glow nodes.
   Camera positioned to guarantee ZERO clipping at any angle.
   ──────────────────────────────────────────────────────────── */

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 700;
    const H = container.clientHeight || 700;

    const scene  = new THREE.Scene();
    /* Camera at z=11 with FOV 54 — the cap's bounding sphere
       (radius ≈ 5) fits fully inside the frustum at all rotations.
       half-height at z=0 = 11 × tan(27°) ≈ 5.6 > 5.0 ✓          */
    const camera = new THREE.PerspectiveCamera(54, W / H, 0.1, 600);
    camera.position.set(0, 0.3, 11);
    camera.lookAt(0, -0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    /* ── Colours ─────────────────────────────────────────── */
    const RED      = new THREE.Color(0xe11d48);
    const DEEP_RED = new THREE.Color(0xb91c3c);
    const WHITE    = new THREE.Color(0xffffff);
    const SOFT_WHT = new THREE.Color(0xe0dcd8);
    const CHARCOAL = new THREE.Color(0x1a1a1e);
    const DARK     = new THREE.Color(0x0e0e10);

    const vary = (base: THREE.Color, amt = 0.05): THREE.Color => {
      const c = base.clone();
      c.r = Math.min(1, Math.max(0, c.r + (Math.random() - 0.5) * amt));
      c.g = Math.min(1, Math.max(0, c.g + (Math.random() - 0.5) * amt));
      c.b = Math.min(1, Math.max(0, c.b + (Math.random() - 0.5) * amt));
      return c;
    };

    /* ── Cap group ───────────────────────────────────────── */
    const capGroup = new THREE.Group();
    capGroup.rotation.x = 0.35;
    capGroup.rotation.y = -0.4;
    scene.add(capGroup);

    /* ═══════════════════════════════════════════════════════
       1.  SAMPLE ~130 000 SURFACE POINTS
    ═══════════════════════════════════════════════════════ */
    const PS = 3.0;
    const cTR = 1.85, cBR = 2.18, cH = 1.55;

    // Pre-allocate flat arrays for maximum performance
    const MAX_N   = 135000;
    const posArr  = new Float32Array(MAX_N * 3);
    const colArr  = new Float32Array(MAX_N * 3);
    let N = 0;

    const addPt = (x: number, y: number, z: number, col: THREE.Color) => {
      if (N >= MAX_N) return;
      posArr[N * 3]     = x;
      posArr[N * 3 + 1] = y;
      posArr[N * 3 + 2] = z;
      colArr[N * 3]     = col.r;
      colArr[N * 3 + 1] = col.g;
      colArr[N * 3 + 2] = col.b;
      N++;
    };

    /* 1a — Plate top → RED (48 000) */
    for (let i = 0; i < 48000; i++) {
      addPt(
        (Math.random() * 2 - 1) * PS, 0,
        (Math.random() * 2 - 1) * PS,
        vary(Math.random() < 0.7 ? RED : DEEP_RED),
      );
    }

    /* 1b — Plate edges → WHITE (32 000) */
    for (let i = 0; i < 32000; i++) {
      const t = Math.random();
      const d = -0.22 * Math.random();
      const side = Math.floor(Math.random() * 4);
      let x = 0, z = 0;
      if (side === 0) { x = -PS + t * 2 * PS; z = -PS; }
      if (side === 1) { x = -PS + t * 2 * PS; z =  PS; }
      if (side === 2) { x = -PS;              z = -PS + t * 2 * PS; }
      if (side === 3) { x =  PS;              z = -PS + t * 2 * PS; }
      addPt(x, d, z, vary(WHITE, 0.03));
    }

    /* 1c — Plate bottom → CHARCOAL (5 000) */
    for (let i = 0; i < 5000; i++) {
      addPt(
        (Math.random() * 2 - 1) * PS, -0.22,
        (Math.random() * 2 - 1) * PS,
        vary(Math.random() < 0.6 ? CHARCOAL : DARK, 0.03),
      );
    }

    /* 1d — Crown → RED (28 000) */
    for (let i = 0; i < 28000; i++) {
      const t = Math.random();
      const a = Math.random() * Math.PI * 2;
      const r = THREE.MathUtils.lerp(cTR, cBR, t);
      addPt(Math.cos(a) * r, -t * cH - 0.10, Math.sin(a) * r,
            vary(Math.random() < 0.7 ? RED : DEEP_RED));
    }

    /* 1e — Crown collar → WHITE (5 000) */
    for (let i = 0; i < 5000; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = cBR + 0.06;
      addPt(Math.cos(a) * r, -cH - 0.10 - Math.random() * 0.18, Math.sin(a) * r,
            vary(WHITE, 0.03));
    }

    /* 1f — Button → WHITE (2 500) */
    for (let i = 0; i < 2500; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * Math.PI * 0.5;
      const r  = 0.35;
      addPt(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) + 0.12,
            r * Math.sin(ph) * Math.sin(th), vary(WHITE, 0.03));
    }

    /* 1g — Tassel cord → WHITE (5 500) */
    const cordPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.28, 0),
      new THREE.Vector3(0.6, 0.24, 0.58),
      new THREE.Vector3(1.75, 0.20, 1.72),
      new THREE.Vector3(2.50, 0.06, 2.18),
      new THREE.Vector3(2.68, -0.34, 2.14),
      new THREE.Vector3(2.68, -1.15, 2.08),
      new THREE.Vector3(2.68, -1.48, 2.08),
    ]);
    for (let i = 0; i < 5500; i++) {
      const pt = cordPath.getPoint(i / 5500);
      addPt(pt.x + (Math.random() - 0.5) * 0.20,
            pt.y + (Math.random() - 0.5) * 0.20,
            pt.z + (Math.random() - 0.5) * 0.20,
            vary(SOFT_WHT, 0.04));
    }

    /* 1h — Tassel brush → WHITE (4 000) */
    const bCx = 2.68, bCz = 2.08;
    for (let i = 0; i < 4000; i++) {
      const t = Math.random();
      const a = Math.random() * Math.PI * 2;
      const r = (0.38 * Math.sin(t * Math.PI)) * (1 - t * 0.4);
      addPt(bCx + Math.cos(a) * r, -1.55 - t * 1.15, bCz + Math.sin(a) * r,
            vary(SOFT_WHT, 0.04));
    }

    // Trim arrays to actual count
    const posUsed = posArr.subarray(0, N * 3);
    const colUsed = colArr.subarray(0, N * 3);

    /* ═══════════════════════════════════════════════════════
       2.  SPATIAL HASH → CONNECTING LINES
           Only process every 4th point for performance
    ═══════════════════════════════════════════════════════ */
    const CELL = 0.45;
    const grid = new Map<string, number[]>();

    const ck = (x: number, y: number, z: number) =>
      `${Math.floor(x / CELL)},${Math.floor(y / CELL)},${Math.floor(z / CELL)}`;

    // Index every point into the grid
    for (let i = 0; i < N; i++) {
      const k = ck(posUsed[i*3], posUsed[i*3+1], posUsed[i*3+2]);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k)!.push(i);
    }

    // Build connection lines (only every 4th point does lookups)
    const lineV: number[] = [];
    const lineC: number[] = [];
    const DIST2 = CELL * CELL;

    for (let i = 0; i < N; i += 4) {
      const px = posUsed[i*3], py = posUsed[i*3+1], pz = posUsed[i*3+2];
      const cx = Math.floor(px / CELL);
      const cy = Math.floor(py / CELL);
      const cz = Math.floor(pz / CELL);
      let found = 0;

      search:
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const cell = grid.get(`${cx+dx},${cy+dy},${cz+dz}`);
            if (!cell) continue;
            for (const j of cell) {
              if (j <= i) continue;
              const qx = posUsed[j*3], qy = posUsed[j*3+1], qz = posUsed[j*3+2];
              const d2 = (px-qx)**2 + (py-qy)**2 + (pz-qz)**2;
              if (d2 < DIST2 && d2 > 0.01) {
                lineV.push(px, py, pz, qx, qy, qz);
                lineC.push(
                  colUsed[i*3], colUsed[i*3+1], colUsed[i*3+2],
                  colUsed[j*3]*0.4, colUsed[j*3+1]*0.4, colUsed[j*3+2]*0.4,
                );
                found++;
                if (found >= 2) break search;
              }
            }
          }
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineV, 3));
    lineGeo.setAttribute("color",    new THREE.Float32BufferAttribute(lineC, 3));
    capGroup.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.30, depthWrite: false,
    })));

    /* ═══════════════════════════════════════════════════════
       3.  NODE DOTS — two layers
    ═══════════════════════════════════════════════════════ */
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(posUsed), 3));
    dotGeo.setAttribute("color",    new THREE.BufferAttribute(new Float32Array(colUsed), 3));

    /* Solid dots */
    capGroup.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
      size: 0.035, vertexColors: true, transparent: true, opacity: 0.90,
      depthWrite: false, sizeAttenuation: true,
    })));

    /* Soft glow halos */
    capGroup.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.15,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })));

    /* ═══════════════════════════════════════════════════════
       4.  BRIGHT HUB NODES (~2%)
    ═══════════════════════════════════════════════════════ */
    const hubN = Math.floor(N * 0.02);
    const hubP = new Float32Array(hubN * 3);
    const hubC = new Float32Array(hubN * 3);
    for (let h = 0; h < hubN; h++) {
      const idx = Math.floor(Math.random() * N);
      hubP[h*3]   = posUsed[idx*3];
      hubP[h*3+1] = posUsed[idx*3+1];
      hubP[h*3+2] = posUsed[idx*3+2];
      hubC[h*3] = 1; hubC[h*3+1] = 1; hubC[h*3+2] = 1;
    }
    const hubGeo = new THREE.BufferGeometry();
    hubGeo.setAttribute("position", new THREE.BufferAttribute(hubP, 3));
    hubGeo.setAttribute("color",    new THREE.BufferAttribute(hubC, 3));
    capGroup.add(new THREE.Points(hubGeo, new THREE.PointsMaterial({
      size: 0.14, vertexColors: true, transparent: true, opacity: 0.65,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })));

    /* ═══════════════════════════════════════════════════════
       5.  10 SLOW SHOOTING STARS
    ═══════════════════════════════════════════════════════ */
    const NUM_STARS = 10;
    type Star = { pos: THREE.Vector3; dir: THREE.Vector3; speed: number; trailLen: number; life: number; maxLife: number };

    const spawnStar = (): Star => {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r  = 5.5 + Math.random() * 3;
      const pos = new THREE.Vector3(r*Math.sin(ph)*Math.cos(th), r*Math.cos(ph), r*Math.sin(ph)*Math.sin(th));
      const tan = new THREE.Vector3(-Math.sin(th), 0, Math.cos(th)).normalize();
      const rad = pos.clone().normalize();
      const dir = tan.add(rad.multiplyScalar(-0.08)).normalize();
      return { pos, dir, speed: 0.014+Math.random()*0.010, trailLen: 0.9+Math.random()*0.8,
               life: Math.floor(Math.random()*350), maxLife: 300+Math.floor(Math.random()*200) };
    };

    const stars: Star[] = Array.from({ length: NUM_STARS }, spawnStar);
    const sP = new Float32Array(NUM_STARS * 2 * 3);
    const sC = new Float32Array(NUM_STARS * 2 * 3);
    const SCOLS = [WHITE, RED, RED, WHITE, SOFT_WHT];
    const sCA = stars.map((_, i) => SCOLS[i % SCOLS.length]);

    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(sP, 3));
    sGeo.setAttribute("color",    new THREE.BufferAttribute(sC, 3));
    scene.add(new THREE.LineSegments(sGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.80,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    /* ── Animation ───────────────────────────────────────── */
    let raf: number;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      capGroup.rotation.y = -0.4 + t * 0.20;
      capGroup.position.y = Math.sin(t * 0.7) * 0.12;

      const sp = sGeo.attributes.position as THREE.BufferAttribute;
      const sc = sGeo.attributes.color    as THREE.BufferAttribute;
      for (let i = 0; i < NUM_STARS; i++) {
        const s = stars[i];
        s.pos.addScaledVector(s.dir, s.speed);
        s.life++;
        s.dir.applyAxisAngle(new THREE.Vector3(0.08, 1, 0.04).normalize(), 0.0025);
        s.dir.normalize();
        if (s.life > s.maxLife) Object.assign(s, spawnStar());
        const fade = Math.min(1, Math.min(s.life / 50, (s.maxLife - s.life) / 50));
        const col = sCA[i];
        sp.setXYZ(i*2, s.pos.x, s.pos.y, s.pos.z);
        sc.setXYZ(i*2, col.r*fade, col.g*fade, col.b*fade);
        const tail = s.pos.clone().addScaledVector(s.dir, -s.trailLen);
        sp.setXYZ(i*2+1, tail.x, tail.y, tail.z);
        sc.setXYZ(i*2+1, 0, 0, 0);
      }
      sp.needsUpdate = true;
      sc.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize ──────────────────────────────────────────── */
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      if (container?.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[560px] lg:h-[680px] flex items-center justify-center select-none pointer-events-none"
         style={{ overflow: "visible" }}>
      <div ref={mountRef} className="w-full h-full" style={{ overflow: "visible" }} />
    </div>
  );
}
