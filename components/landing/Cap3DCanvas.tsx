"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   Cap3DCanvas
   ─────────────────────────────────────────────────────────────
   The graduation cap is NOT rendered as solid geometry.
   Instead, hundreds of tiny triangle outlines are scattered
   across every surface of the cap shape, coloured from a
   palette (white, gold, crimson, violet, teal).  Thin lines
   connect nearby triangles.  The overall cap form emerges
   from this particle cloud — matching the Dala-style reference.
   ──────────────────────────────────────────────────────────── */

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 700;
    const H = container.clientHeight || 700;

    /* ── Scene ─────────────────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, W / H, 0.1, 600);
    // Camera far back — guarantees zero clipping at any rotation
    camera.position.set(0, 0.8, 22);
    camera.lookAt(0, -0.3, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    /* ── Minimal lighting — we mostly use vertex colours ──── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    /* ── Colour palette (matching reference) ─────────────── */
    const PALETTE = [
      new THREE.Color(0xffffff),  // white
      new THREE.Color(0xffffff),  // white (2× frequency)
      new THREE.Color(0xf0d060),  // gold / yellow
      new THREE.Color(0xf0d060),  // gold (2× frequency)
      new THREE.Color(0xe11d48),  // crimson red
      new THREE.Color(0xc084fc),  // violet / purple
      new THREE.Color(0x34d399),  // teal / mint green
    ];
    const rndCol = () => PALETTE[Math.floor(Math.random() * PALETTE.length)];

    /* ── Master group ────────────────────────────────────── */
    const capGroup = new THREE.Group();
    capGroup.rotation.x = 0.35;
    capGroup.rotation.y = -0.4;
    scene.add(capGroup);

    /* ═══════════════════════════════════════════════════════
       STEP 1 — Sample surface points on the cap geometry
    ═══════════════════════════════════════════════════════ */
    type SurfacePt = { x: number; y: number; z: number };
    const surfacePts: SurfacePt[] = [];

    const PS = 3.0;   // plate half-size

    /* 1a — Plate top face */
    for (let i = 0; i < 320; i++) {
      const x = (Math.random() * 2 - 1) * PS;
      const z = (Math.random() * 2 - 1) * PS;
      surfacePts.push({ x, y: 0, z });
    }

    /* 1b — Plate edges (4 sides, top & bottom strip) */
    for (let i = 0; i < 100; i++) {
      const t  = Math.random();
      const d  = -0.20 * Math.random();          // plate depth
      const side = Math.floor(Math.random() * 4);
      let x = 0, z = 0;
      if (side === 0) { x = -PS + t * 2 * PS; z = -PS; }
      if (side === 1) { x = -PS + t * 2 * PS; z =  PS; }
      if (side === 2) { x = -PS;              z = -PS + t * 2 * PS; }
      if (side === 3) { x =  PS;              z = -PS + t * 2 * PS; }
      surfacePts.push({ x, y: d, z });
    }

    /* 1c — Plate bottom face (sparse) */
    for (let i = 0; i < 80; i++) {
      const x = (Math.random() * 2 - 1) * PS;
      const z = (Math.random() * 2 - 1) * PS;
      surfacePts.push({ x, y: -0.20, z });
    }

    /* 1d — Crown (truncated cone) */
    const crownTopR = 1.85;
    const crownBotR = 2.18;
    const crownH    = 1.55;
    for (let i = 0; i < 280; i++) {
      const t  = Math.random();                  // 0 = top, 1 = bottom
      const a  = Math.random() * Math.PI * 2;
      const r  = THREE.MathUtils.lerp(crownTopR, crownBotR, t);
      const x  = Math.cos(a) * r;
      const z  = Math.sin(a) * r;
      const y  = -t * crownH - 0.10;
      surfacePts.push({ x, y, z });
    }

    /* 1e — Crown base collar ring */
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = crownBotR + 0.06;
      surfacePts.push({ x: Math.cos(a) * r, y: -crownH - 0.10, z: Math.sin(a) * r });
    }

    /* 1f — Centre button (hemisphere) */
    for (let i = 0; i < 40; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI * 0.5;  // upper hemisphere
      const r     = 0.35;
      surfacePts.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.cos(phi) + 0.12,
        z: r * Math.sin(phi) * Math.sin(theta),
      });
    }

    /* 1g — Tassel cord curve */
    const cordPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,      0.28, 0),
      new THREE.Vector3(0.6,    0.24, 0.58),
      new THREE.Vector3(1.75,   0.20, 1.72),
      new THREE.Vector3(2.50,   0.06, 2.18),
      new THREE.Vector3(2.68,  -0.34, 2.14),
      new THREE.Vector3(2.68,  -1.15, 2.08),
      new THREE.Vector3(2.68,  -1.48, 2.08),
    ]);
    for (let i = 0; i < 60; i++) {
      const pt = cordPath.getPoint(i / 60);
      // scatter slightly around the curve
      surfacePts.push({
        x: pt.x + (Math.random() - 0.5) * 0.16,
        y: pt.y + (Math.random() - 0.5) * 0.16,
        z: pt.z + (Math.random() - 0.5) * 0.16,
      });
    }

    /* 1h — Tassel brush (cone / teardrop) */
    const brushCx = 2.68, brushCz = 2.08;
    for (let i = 0; i < 60; i++) {
      const t  = Math.random();                   // 0 = top, 1 = tip
      const a  = Math.random() * Math.PI * 2;
      const r  = (0.35 * Math.sin(t * Math.PI)) * (1 - t * 0.4);
      const y  = -1.55 - t * 1.15;
      surfacePts.push({ x: brushCx + Math.cos(a) * r, y, z: brushCz + Math.sin(a) * r });
    }

    const NUM_PTS = surfacePts.length; // ~1000 pts

    /* ═══════════════════════════════════════════════════════
       STEP 2 — At each point, create a tiny triangle outline
       Random size (0.06–0.18), random rotation
    ═══════════════════════════════════════════════════════ */
    // We'll batch everything into one big LineSegments buffer
    // Each triangle = 3 edges = 6 line-segment endpoints

    const triVerts: number[] = [];
    const triColors: number[] = [];

    const _v0 = new THREE.Vector3();
    const _v1 = new THREE.Vector3();
    const _v2 = new THREE.Vector3();
    const _axis = new THREE.Vector3();
    const _q   = new THREE.Quaternion();

    for (let i = 0; i < NUM_PTS; i++) {
      const p = surfacePts[i];
      const size = 0.06 + Math.random() * 0.14;
      const col  = rndCol();

      // Equilateral triangle vertices in local XZ plane
      _v0.set(0,            0,  size);
      _v1.set( size * 0.866, 0, -size * 0.5);
      _v2.set(-size * 0.866, 0, -size * 0.5);

      // Random rotation
      _axis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      _q.setFromAxisAngle(_axis, Math.random() * Math.PI * 2);
      _v0.applyQuaternion(_q);
      _v1.applyQuaternion(_q);
      _v2.applyQuaternion(_q);

      // Translate to surface point
      _v0.x += p.x; _v0.y += p.y; _v0.z += p.z;
      _v1.x += p.x; _v1.y += p.y; _v1.z += p.z;
      _v2.x += p.x; _v2.y += p.y; _v2.z += p.z;

      // Edge 0→1
      triVerts.push(_v0.x, _v0.y, _v0.z, _v1.x, _v1.y, _v1.z);
      triColors.push(col.r, col.g, col.b, col.r, col.g, col.b);
      // Edge 1→2
      triVerts.push(_v1.x, _v1.y, _v1.z, _v2.x, _v2.y, _v2.z);
      triColors.push(col.r, col.g, col.b, col.r, col.g, col.b);
      // Edge 2→0
      triVerts.push(_v2.x, _v2.y, _v2.z, _v0.x, _v0.y, _v0.z);
      triColors.push(col.r, col.g, col.b, col.r, col.g, col.b);
    }

    const triGeo = new THREE.BufferGeometry();
    triGeo.setAttribute("position", new THREE.Float32BufferAttribute(triVerts, 3));
    triGeo.setAttribute("color",    new THREE.Float32BufferAttribute(triColors, 3));
    const triMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
    });
    capGroup.add(new THREE.LineSegments(triGeo, triMat));

    /* ═══════════════════════════════════════════════════════
       STEP 3 — Connecting lines between nearby triangles
       For each point, draw a thin line to its 1-2 nearest
       neighbours within a threshold distance.
    ═══════════════════════════════════════════════════════ */
    const connVerts: number[] = [];
    const connColors: number[] = [];
    const CONNECT_DIST = 0.65;

    // For performance, only check a random subset of pairs
    for (let i = 0; i < NUM_PTS; i++) {
      const pi = surfacePts[i];
      let connected = 0;
      // Check ~15 random neighbours
      for (let attempt = 0; attempt < 15 && connected < 2; attempt++) {
        const j = Math.floor(Math.random() * NUM_PTS);
        if (j === i) continue;
        const pj = surfacePts[j];
        const dx = pi.x - pj.x, dy = pi.y - pj.y, dz = pi.z - pj.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECT_DIST) {
          connVerts.push(pi.x, pi.y, pi.z, pj.x, pj.y, pj.z);
          const c = rndCol();
          connColors.push(c.r, c.g, c.b, c.r * 0.3, c.g * 0.3, c.b * 0.3);
          connected++;
        }
      }
    }

    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute("position", new THREE.Float32BufferAttribute(connVerts, 3));
    connGeo.setAttribute("color",    new THREE.Float32BufferAttribute(connColors, 3));
    const connMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    capGroup.add(new THREE.LineSegments(connGeo, connMat));

    /* ═══════════════════════════════════════════════════════
       STEP 4 — Faint glow dots at each surface point
       (small additive-blended sprites give the glow haze
       visible in the reference image)
    ═══════════════════════════════════════════════════════ */
    const dotPositions = new Float32Array(NUM_PTS * 3);
    const dotColors    = new Float32Array(NUM_PTS * 3);
    for (let i = 0; i < NUM_PTS; i++) {
      const p = surfacePts[i];
      dotPositions[i * 3]     = p.x;
      dotPositions[i * 3 + 1] = p.y;
      dotPositions[i * 3 + 2] = p.z;
      const c = rndCol();
      dotColors[i * 3]     = c.r;
      dotColors[i * 3 + 1] = c.g;
      dotColors[i * 3 + 2] = c.b;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(dotPositions, 3));
    dotGeo.setAttribute("color",    new THREE.BufferAttribute(dotColors,    3));
    const dotMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    capGroup.add(new THREE.Points(dotGeo, dotMat));

    /* ═══════════════════════════════════════════════════════
       STEP 5 — 10 slow orbiting shooting-star particles
    ═══════════════════════════════════════════════════════ */
    const NUM_STARS = 10;
    type Star = {
      pos: THREE.Vector3; dir: THREE.Vector3;
      speed: number; trailLen: number;
      life: number; maxLife: number;
    };

    const spawnStar = (): Star => {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 5 + Math.random() * 3.5;
      const pos   = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
      const tangent = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta)).normalize();
      const radial  = pos.clone().normalize();
      const dir     = tangent.add(radial.multiplyScalar(-0.08)).normalize();
      return {
        pos, dir,
        speed:    0.014 + Math.random() * 0.010,
        trailLen: 0.9 + Math.random() * 0.8,
        life:     Math.floor(Math.random() * 350),
        maxLife:  300 + Math.floor(Math.random() * 200),
      };
    };

    const stars: Star[] = Array.from({ length: NUM_STARS }, spawnStar);
    const starPositions = new Float32Array(NUM_STARS * 2 * 3);
    const starColors    = new Float32Array(NUM_STARS * 2 * 3);

    const STAR_COLS = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xf0d060),
      new THREE.Color(0xe11d48),
      new THREE.Color(0xc084fc),
      new THREE.Color(0x34d399),
    ];
    const starColArr = stars.map((_, i) => STAR_COLS[i % STAR_COLS.length]);

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color",    new THREE.BufferAttribute(starColors,    3));
    const starMat = new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.80,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    scene.add(new THREE.LineSegments(starGeo, starMat));

    /* ═══════════════════════════════════════════════════════
       ANIMATION
    ═══════════════════════════════════════════════════════ */
    let raf: number;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      /* Rotate cap — slow and steady */
      capGroup.rotation.y = -0.4 + t * 0.20;
      capGroup.position.y = Math.sin(t * 0.7) * 0.12;

      /* Update stars */
      const sp = starGeo.attributes.position as THREE.BufferAttribute;
      const sc = starGeo.attributes.color    as THREE.BufferAttribute;

      for (let i = 0; i < NUM_STARS; i++) {
        const s = stars[i];
        s.pos.addScaledVector(s.dir, s.speed);
        s.life++;
        // Gentle orbital curve
        s.dir.applyAxisAngle(new THREE.Vector3(0.08, 1, 0.04).normalize(), 0.0025);
        s.dir.normalize();
        if (s.life > s.maxLife) Object.assign(s, spawnStar());

        const fade = Math.min(1, Math.min(s.life / 50, (s.maxLife - s.life) / 50));
        const col  = starColArr[i];

        sp.setXYZ(i * 2,     s.pos.x, s.pos.y, s.pos.z);
        sc.setXYZ(i * 2,     col.r * fade, col.g * fade, col.b * fade);

        const tail = s.pos.clone().addScaledVector(s.dir, -s.trailLen);
        sp.setXYZ(i * 2 + 1, tail.x, tail.y, tail.z);
        sc.setXYZ(i * 2 + 1, 0, 0, 0);
      }
      sp.needsUpdate = true;
      sc.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    /* ── Resize ──────────────────────────────────────────── */
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
