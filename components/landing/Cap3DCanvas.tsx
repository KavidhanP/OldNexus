"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cap3DCanvas — Moffett AI-style point-cloud mesh network
   ─────────────────────────────────────────────────────────────
   Points scattered across the graduation cap surface, connected
   by thin lines to nearby neighbours.  No triangles — just
   nodes + edges forming a clean wireframe mesh.

   Colour zones:
     • Cap body (plate top, crown)  → crimson RED
     • Borders, collar, button      → WHITE
     • Plate underside              → charcoal
     • Tassel cord + brush          → WHITE
   ──────────────────────────────────────────────────────────── */

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 700;
    const H = container.clientHeight || 700;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 600);
    camera.position.set(0, 0.8, 22);
    camera.lookAt(0, -0.3, 0);

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

    const vary = (base: THREE.Color, amt = 0.06): THREE.Color => {
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
       1.  SAMPLE SURFACE POINTS
    ═══════════════════════════════════════════════════════ */
    type Pt = { x: number; y: number; z: number; col: THREE.Color; size: number };
    const pts: Pt[] = [];
    const PS = 3.0;

    const addPt = (x: number, y: number, z: number, col: THREE.Color) => {
      pts.push({ x, y, z, col, size: 0.03 + Math.random() * 0.05 });
    };

    /* 1a — Plate top → RED (4800) */
    for (let i = 0; i < 4800; i++) {
      addPt(
        (Math.random() * 2 - 1) * PS, 0,
        (Math.random() * 2 - 1) * PS,
        vary(Math.random() < 0.7 ? RED : DEEP_RED),
      );
    }

    /* 1b — Plate edges → WHITE (3200) */
    for (let i = 0; i < 3200; i++) {
      const t = Math.random();
      const d = -0.22 * Math.random();
      const side = Math.floor(Math.random() * 4);
      let x = 0, z = 0;
      if (side === 0) { x = -PS + t * 2 * PS; z = -PS; }
      if (side === 1) { x = -PS + t * 2 * PS; z =  PS; }
      if (side === 2) { x = -PS;              z = -PS + t * 2 * PS; }
      if (side === 3) { x =  PS;              z = -PS + t * 2 * PS; }
      addPt(x, d, z, vary(WHITE, 0.04));
    }

    /* 1c — Plate bottom → CHARCOAL (500) */
    for (let i = 0; i < 500; i++) {
      addPt(
        (Math.random() * 2 - 1) * PS, -0.22,
        (Math.random() * 2 - 1) * PS,
        vary(Math.random() < 0.6 ? CHARCOAL : DARK, 0.03),
      );
    }

    /* 1d — Crown → RED (2800) */
    const cTR = 1.85, cBR = 2.18, cH = 1.55;
    for (let i = 0; i < 2800; i++) {
      const t = Math.random();
      const a = Math.random() * Math.PI * 2;
      const r = THREE.MathUtils.lerp(cTR, cBR, t);
      addPt(Math.cos(a) * r, -t * cH - 0.10, Math.sin(a) * r,
            vary(Math.random() < 0.7 ? RED : DEEP_RED));
    }

    /* 1e — Crown collar → WHITE (500) */
    for (let i = 0; i < 500; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = cBR + 0.06;
      addPt(Math.cos(a) * r, -cH - 0.10 - Math.random() * 0.18, Math.sin(a) * r,
            vary(WHITE, 0.04));
    }

    /* 1f — Button → WHITE (250) */
    for (let i = 0; i < 250; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.random() * Math.PI * 0.5;
      const r  = 0.35;
      addPt(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) + 0.12,
            r * Math.sin(ph) * Math.sin(th), vary(WHITE, 0.04));
    }

    /* 1g — Tassel cord → WHITE (550) */
    const cordPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.28, 0),
      new THREE.Vector3(0.6, 0.24, 0.58),
      new THREE.Vector3(1.75, 0.20, 1.72),
      new THREE.Vector3(2.50, 0.06, 2.18),
      new THREE.Vector3(2.68, -0.34, 2.14),
      new THREE.Vector3(2.68, -1.15, 2.08),
      new THREE.Vector3(2.68, -1.48, 2.08),
    ]);
    for (let i = 0; i < 550; i++) {
      const pt = cordPath.getPoint(i / 550);
      addPt(pt.x + (Math.random() - 0.5) * 0.18,
            pt.y + (Math.random() - 0.5) * 0.18,
            pt.z + (Math.random() - 0.5) * 0.18,
            vary(SOFT_WHT, 0.05));
    }

    /* 1h — Tassel brush → WHITE (600) */
    const bCx = 2.68, bCz = 2.08;
    for (let i = 0; i < 600; i++) {
      const t = Math.random();
      const a = Math.random() * Math.PI * 2;
      const r = (0.38 * Math.sin(t * Math.PI)) * (1 - t * 0.4);
      addPt(bCx + Math.cos(a) * r, -1.55 - t * 1.15, bCz + Math.sin(a) * r,
            vary(SOFT_WHT, 0.05));
    }

    const N = pts.length; // ~13 200

    /* ═══════════════════════════════════════════════════════
       2.  SPATIAL HASH for fast neighbour lookup
    ═══════════════════════════════════════════════════════ */
    const CELL = 0.55; // grid cell size = connection threshold
    const grid = new Map<string, number[]>();

    const cellKey = (x: number, y: number, z: number) =>
      `${Math.floor(x / CELL)},${Math.floor(y / CELL)},${Math.floor(z / CELL)}`;

    for (let i = 0; i < N; i++) {
      const k = cellKey(pts[i].x, pts[i].y, pts[i].z);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k)!.push(i);
    }

    /* ═══════════════════════════════════════════════════════
       3.  CONNECTING LINES (mesh edges)
    ═══════════════════════════════════════════════════════ */
    const lineV: number[] = [];
    const lineC: number[] = [];
    const MAX_CONN = 3;        // max connections per node
    const DIST2    = CELL * CELL;

    for (let i = 0; i < N; i++) {
      const pi = pts[i];
      const cx = Math.floor(pi.x / CELL);
      const cy = Math.floor(pi.y / CELL);
      const cz = Math.floor(pi.z / CELL);
      let found = 0;

      // Check 27 neighbouring cells
      outer:
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const nk = `${cx + dx},${cy + dy},${cz + dz}`;
            const cell = grid.get(nk);
            if (!cell) continue;
            for (const j of cell) {
              if (j <= i) continue; // avoid duplicates
              const pj = pts[j];
              const d2 = (pi.x-pj.x)**2 + (pi.y-pj.y)**2 + (pi.z-pj.z)**2;
              if (d2 < DIST2) {
                lineV.push(pi.x, pi.y, pi.z, pj.x, pj.y, pj.z);
                // blend colours: bright at nodes, dim at midpoint
                lineC.push(pi.col.r, pi.col.g, pi.col.b,
                           pj.col.r * 0.5, pj.col.g * 0.5, pj.col.b * 0.5);
                found++;
                if (found >= MAX_CONN) break outer;
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
      vertexColors: true, transparent: true, opacity: 0.32, depthWrite: false,
    })));

    /* ═══════════════════════════════════════════════════════
       4.  NODE DOTS — two layers (base + bright)
    ═══════════════════════════════════════════════════════ */
    const dotP = new Float32Array(N * 3);
    const dotC = new Float32Array(N * 3);
    const dotS = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      dotP[i*3]   = pts[i].x;
      dotP[i*3+1] = pts[i].y;
      dotP[i*3+2] = pts[i].z;
      dotC[i*3]   = pts[i].col.r;
      dotC[i*3+1] = pts[i].col.g;
      dotC[i*3+2] = pts[i].col.b;
      dotS[i]     = pts[i].size;
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotP, 3));
    dotGeo.setAttribute("color",    new THREE.BufferAttribute(dotC, 3));

    /* Layer 1 — solid dots */
    capGroup.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
      size: 0.055, vertexColors: true, transparent: true, opacity: 0.92,
      depthWrite: false, sizeAttenuation: true,
    })));

    /* Layer 2 — soft additive glow halos */
    capGroup.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
      size: 0.12, vertexColors: true, transparent: true, opacity: 0.22,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })));

    /* ═══════════════════════════════════════════════════════
       5.  BRIGHT HUB NODES — ~3% of points are larger/brighter
    ═══════════════════════════════════════════════════════ */
    const hubCount = Math.floor(N * 0.03);
    const hubP = new Float32Array(hubCount * 3);
    const hubC = new Float32Array(hubCount * 3);

    for (let h = 0; h < hubCount; h++) {
      const idx = Math.floor(Math.random() * N);
      hubP[h*3]   = pts[idx].x;
      hubP[h*3+1] = pts[idx].y;
      hubP[h*3+2] = pts[idx].z;
      hubC[h*3]   = 1; hubC[h*3+1] = 1; hubC[h*3+2] = 1; // bright white
    }

    const hubGeo = new THREE.BufferGeometry();
    hubGeo.setAttribute("position", new THREE.BufferAttribute(hubP, 3));
    hubGeo.setAttribute("color",    new THREE.BufferAttribute(hubC, 3));

    capGroup.add(new THREE.Points(hubGeo, new THREE.PointsMaterial({
      size: 0.18, vertexColors: true, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })));

    /* ═══════════════════════════════════════════════════════
       6.  10 SLOW SHOOTING STARS
    ═══════════════════════════════════════════════════════ */
    const NUM_STARS = 10;
    type Star = { pos: THREE.Vector3; dir: THREE.Vector3; speed: number; trailLen: number; life: number; maxLife: number };

    const spawnStar = (): Star => {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      const r  = 5 + Math.random() * 3.5;
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
    <div className="relative w-full h-[540px] lg:h-[660px] flex items-center justify-center select-none pointer-events-none"
         style={{ overflow: "visible" }}>
      <div ref={mountRef} className="w-full h-full" style={{ overflow: "visible" }} />
    </div>
  );
}
