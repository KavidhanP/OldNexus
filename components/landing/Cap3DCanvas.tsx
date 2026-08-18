"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cap3DCanvas — 10 000+ triangle particle cloud
   ─────────────────────────────────────────────────────────────
   Colours are assigned BY REGION for a clean, cohesive look:
     • Cap body (plate top, crown)  → rich crimson RED
     • Borders, edges, collar       → crisp WHITE
     • Plate underside              → dark charcoal / near-black
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

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    /* ── Region colours ──────────────────────────────────── */
    const RED       = new THREE.Color(0xe11d48);
    const DEEP_RED  = new THREE.Color(0xb91c3c);
    const WHITE     = new THREE.Color(0xffffff);
    const SOFT_WHT  = new THREE.Color(0xe8e0e0);
    const CHARCOAL  = new THREE.Color(0x1a1a1e);
    const DARK      = new THREE.Color(0x0e0e10);

    /* Slight per-triangle colour variation within a region */
    const vary = (base: THREE.Color, amount = 0.08): THREE.Color => {
      const c = base.clone();
      c.r = Math.min(1, Math.max(0, c.r + (Math.random() - 0.5) * amount));
      c.g = Math.min(1, Math.max(0, c.g + (Math.random() - 0.5) * amount));
      c.b = Math.min(1, Math.max(0, c.b + (Math.random() - 0.5) * amount));
      return c;
    };

    /* ── Master group ────────────────────────────────────── */
    const capGroup = new THREE.Group();
    capGroup.rotation.x = 0.35;
    capGroup.rotation.y = -0.4;
    scene.add(capGroup);

    /* ═══════════════════════════════════════════════════════
       STEP 1 — Sample surface points WITH region colour
    ═══════════════════════════════════════════════════════ */
    type Pt = { x: number; y: number; z: number; col: THREE.Color };
    const pts: Pt[] = [];

    const PS = 3.0;

    /* 1a — Plate top face → RED  (3200 pts) */
    for (let i = 0; i < 3200; i++) {
      pts.push({
        x: (Math.random() * 2 - 1) * PS,
        y: 0,
        z: (Math.random() * 2 - 1) * PS,
        col: vary(Math.random() < 0.7 ? RED : DEEP_RED, 0.06),
      });
    }

    /* 1b — Plate edges → WHITE  (800 pts) */
    for (let i = 0; i < 800; i++) {
      const t = Math.random();
      const d = -0.20 * Math.random();
      const side = Math.floor(Math.random() * 4);
      let x = 0, z = 0;
      if (side === 0) { x = -PS + t * 2 * PS; z = -PS; }
      if (side === 1) { x = -PS + t * 2 * PS; z =  PS; }
      if (side === 2) { x = -PS;              z = -PS + t * 2 * PS; }
      if (side === 3) { x =  PS;              z = -PS + t * 2 * PS; }
      pts.push({ x, y: d, z, col: vary(WHITE, 0.05) });
    }

    /* 1c — Plate bottom → CHARCOAL  (600 pts) */
    for (let i = 0; i < 600; i++) {
      pts.push({
        x: (Math.random() * 2 - 1) * PS,
        y: -0.20,
        z: (Math.random() * 2 - 1) * PS,
        col: vary(Math.random() < 0.6 ? CHARCOAL : DARK, 0.04),
      });
    }

    /* 1d — Crown body → RED  (3200 pts) */
    const crownTopR = 1.85;
    const crownBotR = 2.18;
    const crownH    = 1.55;
    for (let i = 0; i < 3200; i++) {
      const t = Math.random();
      const a = Math.random() * Math.PI * 2;
      const r = THREE.MathUtils.lerp(crownTopR, crownBotR, t);
      pts.push({
        x: Math.cos(a) * r,
        y: -t * crownH - 0.10,
        z: Math.sin(a) * r,
        col: vary(Math.random() < 0.7 ? RED : DEEP_RED, 0.06),
      });
    }

    /* 1e — Crown base collar → WHITE  (500 pts) */
    for (let i = 0; i < 500; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = crownBotR + 0.06;
      pts.push({
        x: Math.cos(a) * r,
        y: -crownH - 0.10 - Math.random() * 0.18,
        z: Math.sin(a) * r,
        col: vary(WHITE, 0.05),
      });
    }

    /* 1f — Centre button → WHITE  (300 pts) */
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI * 0.5;
      const r     = 0.35;
      pts.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi) + 0.12,
        z: r * Math.sin(phi) * Math.sin(theta),
        col: vary(WHITE, 0.04),
      });
    }

    /* 1g — Tassel cord → WHITE  (700 pts) */
    const cordPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,      0.28, 0),
      new THREE.Vector3(0.6,    0.24, 0.58),
      new THREE.Vector3(1.75,   0.20, 1.72),
      new THREE.Vector3(2.50,   0.06, 2.18),
      new THREE.Vector3(2.68,  -0.34, 2.14),
      new THREE.Vector3(2.68,  -1.15, 2.08),
      new THREE.Vector3(2.68,  -1.48, 2.08),
    ]);
    for (let i = 0; i < 700; i++) {
      const pt = cordPath.getPoint(i / 700);
      pts.push({
        x: pt.x + (Math.random() - 0.5) * 0.18,
        y: pt.y + (Math.random() - 0.5) * 0.18,
        z: pt.z + (Math.random() - 0.5) * 0.18,
        col: vary(SOFT_WHT, 0.06),
      });
    }

    /* 1h — Tassel brush → WHITE  (700 pts) */
    const brushCx = 2.68, brushCz = 2.08;
    for (let i = 0; i < 700; i++) {
      const t = Math.random();
      const a = Math.random() * Math.PI * 2;
      const r = (0.38 * Math.sin(t * Math.PI)) * (1 - t * 0.4);
      const y = -1.55 - t * 1.15;
      pts.push({
        x: brushCx + Math.cos(a) * r,
        y,
        z: brushCz + Math.sin(a) * r,
        col: vary(SOFT_WHT, 0.06),
      });
    }

    const N = pts.length; // ~10 000

    /* ═══════════════════════════════════════════════════════
       STEP 2 — Tiny triangle outlines at each point
    ═══════════════════════════════════════════════════════ */
    const triVerts:  number[] = [];
    const triColors: number[] = [];

    const _v0 = new THREE.Vector3();
    const _v1 = new THREE.Vector3();
    const _v2 = new THREE.Vector3();
    const _ax = new THREE.Vector3();
    const _q  = new THREE.Quaternion();

    for (let i = 0; i < N; i++) {
      const p = pts[i];
      const sz = 0.05 + Math.random() * 0.12;
      const c  = p.col;

      _v0.set(0,             0,  sz);
      _v1.set( sz * 0.866,   0, -sz * 0.5);
      _v2.set(-sz * 0.866,   0, -sz * 0.5);

      _ax.set(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      _q.setFromAxisAngle(_ax, Math.random() * Math.PI * 2);
      _v0.applyQuaternion(_q); _v1.applyQuaternion(_q); _v2.applyQuaternion(_q);

      _v0.x+=p.x; _v0.y+=p.y; _v0.z+=p.z;
      _v1.x+=p.x; _v1.y+=p.y; _v1.z+=p.z;
      _v2.x+=p.x; _v2.y+=p.y; _v2.z+=p.z;

      // 3 edges
      triVerts.push(_v0.x,_v0.y,_v0.z, _v1.x,_v1.y,_v1.z);
      triColors.push(c.r,c.g,c.b, c.r,c.g,c.b);
      triVerts.push(_v1.x,_v1.y,_v1.z, _v2.x,_v2.y,_v2.z);
      triColors.push(c.r,c.g,c.b, c.r,c.g,c.b);
      triVerts.push(_v2.x,_v2.y,_v2.z, _v0.x,_v0.y,_v0.z);
      triColors.push(c.r,c.g,c.b, c.r,c.g,c.b);
    }

    const triGeo = new THREE.BufferGeometry();
    triGeo.setAttribute("position", new THREE.Float32BufferAttribute(triVerts, 3));
    triGeo.setAttribute("color",    new THREE.Float32BufferAttribute(triColors, 3));
    capGroup.add(new THREE.LineSegments(triGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.88, depthWrite: false,
    })));

    /* ═══════════════════════════════════════════════════════
       STEP 3 — Connecting lines (same region colour)
    ═══════════════════════════════════════════════════════ */
    const connV: number[] = [];
    const connC: number[] = [];
    const CD = 0.55;

    for (let i = 0; i < N; i++) {
      const pi = pts[i];
      let found = 0;
      for (let att = 0; att < 12 && found < 2; att++) {
        const j = Math.floor(Math.random() * N);
        if (j === i) continue;
        const pj = pts[j];
        const dx = pi.x-pj.x, dy = pi.y-pj.y, dz = pi.z-pj.z;
        if (dx*dx + dy*dy + dz*dz < CD*CD) {
          connV.push(pi.x,pi.y,pi.z, pj.x,pj.y,pj.z);
          const c = pi.col;
          connC.push(c.r,c.g,c.b, c.r*0.4,c.g*0.4,c.b*0.4);
          found++;
        }
      }
    }

    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute("position", new THREE.Float32BufferAttribute(connV, 3));
    connGeo.setAttribute("color",    new THREE.Float32BufferAttribute(connC, 3));
    capGroup.add(new THREE.LineSegments(connGeo, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.28, depthWrite: false,
    })));

    /* ═══════════════════════════════════════════════════════
       STEP 4 — Glow dots (additive)
    ═══════════════════════════════════════════════════════ */
    const dotP = new Float32Array(N * 3);
    const dotC = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      dotP[i*3] = pts[i].x; dotP[i*3+1] = pts[i].y; dotP[i*3+2] = pts[i].z;
      const c = pts[i].col;
      dotC[i*3] = c.r; dotC[i*3+1] = c.g; dotC[i*3+2] = c.b;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotP, 3));
    dotGeo.setAttribute("color",    new THREE.BufferAttribute(dotC, 3));
    capGroup.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })));

    /* ═══════════════════════════════════════════════════════
       STEP 5 — 10 slow shooting-star particles
    ═══════════════════════════════════════════════════════ */
    const NUM_STARS = 10;
    type Star = { pos: THREE.Vector3; dir: THREE.Vector3; speed: number; trailLen: number; life: number; maxLife: number };

    const spawnStar = (): Star => {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 5 + Math.random() * 3.5;
      const pos   = new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
      const tangent = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta)).normalize();
      const radial  = pos.clone().normalize();
      const dir     = tangent.add(radial.multiplyScalar(-0.08)).normalize();
      return { pos, dir, speed: 0.014 + Math.random()*0.010, trailLen: 0.9 + Math.random()*0.8, life: Math.floor(Math.random()*350), maxLife: 300 + Math.floor(Math.random()*200) };
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
        s.dir.applyAxisAngle(new THREE.Vector3(0.08,1,0.04).normalize(), 0.0025);
        s.dir.normalize();
        if (s.life > s.maxLife) Object.assign(s, spawnStar());
        const fade = Math.min(1, Math.min(s.life/50, (s.maxLife-s.life)/50));
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
