"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 640;

    /* ─── SCENE ─────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 13);
    camera.lookAt(0, -0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    /* ─── LIGHTING ──────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(8, 14, 10);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffeedd, 0.5);
    fill.position.set(-10, -4, 8);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0xe11d48, 1.4);
    rim.position.set(0, 10, -12);
    scene.add(rim);

    const under = new THREE.DirectionalLight(0xffd700, 0.4);
    under.position.set(0, -8, 4);
    scene.add(under);

    /* ─── MATERIALS ─────────────────────────────────────────── */
    const matCap = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.3, metalness: 0.25 });
    const matCapInner = new THREE.MeshStandardMaterial({ color: 0x080809, roughness: 0.6, metalness: 0.05 });
    const matRed = new THREE.MeshStandardMaterial({ color: 0xcc1133, roughness: 0.22, metalness: 0.55 });
    const matGold = new THREE.MeshStandardMaterial({ color: 0xd4a520, roughness: 0.18, metalness: 0.85 });
    const matWhite = new THREE.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.28, metalness: 0.08 });
    const matSilk = new THREE.MeshStandardMaterial({ color: 0xe8e0d0, roughness: 0.45, metalness: 0.1 });
    const matDarkRed = new THREE.MeshStandardMaterial({ color: 0x6b0a1f, roughness: 0.4, metalness: 0.3 });

    /* ─── CAP GROUP ─────────────────────────────────────────── */
    const capGroup = new THREE.Group();
    capGroup.rotation.x = 0.38;
    capGroup.rotation.y = -0.42;
    capGroup.position.set(0, 0, 0);
    scene.add(capGroup);

    /* ═══════════════════════════════════════════════════════════
       1.  MORTARBOARD PLATE  (rounded corners, bevelled edges)
    ═══════════════════════════════════════════════════════════ */
    const PS = 2.85;          // plate half-size
    const CR = 0.32;           // corner radius

    const plateShape = new THREE.Shape();
    plateShape.moveTo(-PS + CR, -PS);
    plateShape.lineTo( PS - CR, -PS);
    plateShape.quadraticCurveTo( PS, -PS,  PS, -PS + CR);
    plateShape.lineTo( PS,  PS - CR);
    plateShape.quadraticCurveTo( PS,  PS,  PS - CR,  PS);
    plateShape.lineTo(-PS + CR,  PS);
    plateShape.quadraticCurveTo(-PS,  PS, -PS,  PS - CR);
    plateShape.lineTo(-PS, -PS + CR);
    plateShape.quadraticCurveTo(-PS, -PS, -PS + CR, -PS);

    const plateGeo = new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.22, bevelEnabled: true,
      bevelSegments: 6, steps: 2,
      bevelSize: 0.07, bevelThickness: 0.07,
    });
    plateGeo.rotateX(Math.PI / 2);

    capGroup.add(new THREE.Mesh(plateGeo, matCap));

    /* inner panel (slightly recessed darker face) */
    const IS = 2.55;
    const innerShape = new THREE.Shape();
    innerShape.moveTo(-IS, -IS); innerShape.lineTo(IS, -IS);
    innerShape.lineTo(IS, IS); innerShape.lineTo(-IS, IS); innerShape.closePath();
    const innerGeo = new THREE.ExtrudeGeometry(innerShape, { depth: 0.01, bevelEnabled: false });
    innerGeo.rotateX(Math.PI / 2);
    innerGeo.translate(0, 0.21, 0);
    capGroup.add(new THREE.Mesh(innerGeo, matCapInner));

    /* red perimeter trim strip */
    const trimShape = new THREE.Shape();
    const TS = PS - 0.06; const TI = PS - 0.22;
    trimShape.moveTo(-TS, -TS); trimShape.lineTo(TS, -TS); trimShape.lineTo(TS, TS); trimShape.lineTo(-TS, TS); trimShape.closePath();
    const trimHole = new THREE.Path();
    trimHole.moveTo(-TI, -TI); trimHole.lineTo(TI, -TI); trimHole.lineTo(TI, TI); trimHole.lineTo(-TI, TI); trimHole.closePath();
    trimShape.holes.push(trimHole);
    const trimGeo = new THREE.ExtrudeGeometry(trimShape, { depth: 0.04, bevelEnabled: false });
    trimGeo.rotateX(Math.PI / 2);
    trimGeo.translate(0, 0.20, 0);
    capGroup.add(new THREE.Mesh(trimGeo, matRed));

    /* secondary gold inner accent line */
    const goldAccentPoints = [
      new THREE.Vector3(-TI + 0.06, 0.22, -TI + 0.06),
      new THREE.Vector3( TI - 0.06, 0.22, -TI + 0.06),
      new THREE.Vector3( TI - 0.06, 0.22,  TI - 0.06),
      new THREE.Vector3(-TI + 0.06, 0.22,  TI - 0.06),
      new THREE.Vector3(-TI + 0.06, 0.22, -TI + 0.06),
    ];
    const goldAccentGeo = new THREE.BufferGeometry().setFromPoints(goldAccentPoints);
    capGroup.add(new THREE.Line(goldAccentGeo, new THREE.LineBasicMaterial({ color: 0xd4a520, opacity: 0.9, transparent: true })));

    /* corner stud rivets */
    [[-PS+0.28, -PS+0.28],[PS-0.28,-PS+0.28],[PS-0.28,PS-0.28],[-PS+0.28,PS-0.28]].forEach(([cx, cz]) => {
      const g = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 14);
      g.translate(cx as number, 0.22, cz as number);
      capGroup.add(new THREE.Mesh(g, matGold));
      // stud top dome
      const d = new THREE.SphereGeometry(0.07, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
      d.translate(cx as number, 0.25, cz as number);
      capGroup.add(new THREE.Mesh(d, matGold));
    });

    /* decorative cross-hatch etching lines on plate surface */
    const etchMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.07 });
    for (let i = -2; i <= 2; i += 0.35) {
      const pts = [new THREE.Vector3(-IS, 0.215, i), new THREE.Vector3(IS, 0.215, i)];
      capGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), etchMat));
      const pts2 = [new THREE.Vector3(i, 0.215, -IS), new THREE.Vector3(i, 0.215, IS)];
      capGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts2), etchMat));
    }

    /* ═══════════════════════════════════════════════════════════
       2.  CROWN / SKULL CAP
    ═══════════════════════════════════════════════════════════ */
    const crownTopR   = 1.82;
    const crownBotR   = 2.18;
    const crownH      = 1.55;

    /* main crown body */
    const crownGeo = new THREE.CylinderGeometry(crownTopR, crownBotR, crownH, 36, 6, false);
    crownGeo.translate(0, -crownH / 2 - 0.08, 0);
    capGroup.add(new THREE.Mesh(crownGeo, matCap));

    /* subtle surface panel lines on crown (6 vertical seams) */
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const seamPts: THREE.Vector3[] = [];
      for (let t = 0; t <= 1; t += 0.05) {
        const y = -crownH * t - 0.08;
        const r = THREE.MathUtils.lerp(crownTopR, crownBotR, t) + 0.012;
        seamPts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      const seamGeo = new THREE.BufferGeometry().setFromPoints(seamPts);
      capGroup.add(new THREE.Line(seamGeo, new THREE.LineBasicMaterial({ color: 0xe11d48, transparent: true, opacity: 0.55 })));
    }

    /* thin satin ridge rings on crown */
    [0.3, 0.65, 1.0].forEach(t => {
      const y = -crownH * t - 0.08;
      const r = THREE.MathUtils.lerp(crownTopR, crownBotR, t);
      const rGeo = new THREE.TorusGeometry(r + 0.015, 0.025, 10, 36);
      rGeo.rotateX(Math.PI / 2);
      rGeo.translate(0, y, 0);
      capGroup.add(new THREE.Mesh(rGeo, matDarkRed));
    });

    /* base accent collar band (double) */
    const bBase = -crownH - 0.08;
    const b1Geo = new THREE.TorusGeometry(crownBotR + 0.04, 0.1, 18, 40);
    b1Geo.rotateX(Math.PI / 2); b1Geo.translate(0, bBase, 0);
    capGroup.add(new THREE.Mesh(b1Geo, matRed));

    const b2Geo = new THREE.TorusGeometry(crownBotR + 0.06, 0.055, 14, 40);
    b2Geo.rotateX(Math.PI / 2); b2Geo.translate(0, bBase - 0.15, 0);
    capGroup.add(new THREE.Mesh(b2Geo, matGold));

    /* ═══════════════════════════════════════════════════════════
       3.  CENTRE BUTTON + FERRULE
    ═══════════════════════════════════════════════════════════ */
    /* ferrule ring */
    const ferGeo = new THREE.CylinderGeometry(0.38, 0.43, 0.1, 22);
    ferGeo.translate(0, 0.19, 0);
    capGroup.add(new THREE.Mesh(ferGeo, matGold));

    /* knurled texture rings on ferrule */
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const kg = new THREE.BoxGeometry(0.035, 0.1, 0.035);
      kg.translate(Math.cos(a) * 0.41, 0.19, Math.sin(a) * 0.41);
      kg.rotateY(a);
      capGroup.add(new THREE.Mesh(kg, matDarkRed));
    }

    /* dome button with flat top ring */
    const btnGeo = new THREE.SphereGeometry(0.30, 28, 28);
    btnGeo.translate(0, 0.31, 0);
    capGroup.add(new THREE.Mesh(btnGeo, matRed));

    const btnRingGeo = new THREE.TorusGeometry(0.30, 0.035, 12, 28);
    btnRingGeo.rotateX(Math.PI / 2); btnRingGeo.translate(0, 0.30, 0);
    capGroup.add(new THREE.Mesh(btnRingGeo, matGold));

    /* ═══════════════════════════════════════════════════════════
       4.  TASSEL CORD + BEADED COLLAR + BRUSH
    ═══════════════════════════════════════════════════════════ */
    /* main cord curve */
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,      0.31, 0),
      new THREE.Vector3(0.65,   0.27, 0.65),
      new THREE.Vector3(1.85,   0.22, 1.82),
      new THREE.Vector3(2.60,   0.10, 2.30),
      new THREE.Vector3(2.78,  -0.35, 2.25),
      new THREE.Vector3(2.78,  -1.20, 2.18),
      new THREE.Vector3(2.78,  -1.55, 2.18),
    ]);

    const cordGeo = new THREE.TubeGeometry(cordCurve, 64, 0.09, 16, false);
    capGroup.add(new THREE.Mesh(cordGeo, matSilk));

    /* spiral twist overlay on cord */
    const spiralPts: THREE.Vector3[] = [];
    for (let t = 0; t <= 1; t += 0.015) {
      const pos = cordCurve.getPoint(t);
      const tang = cordCurve.getTangent(t);
      const normal = new THREE.Vector3(-tang.z, 0, tang.x).normalize();
      const offset = normal.multiplyScalar(0.10 * Math.sin(t * Math.PI * 12));
      spiralPts.push(pos.clone().add(offset));
    }
    const spiralGeo = new THREE.BufferGeometry().setFromPoints(spiralPts);
    capGroup.add(new THREE.Line(spiralGeo, new THREE.LineBasicMaterial({ color: 0xcc1133, transparent: true, opacity: 0.8 })));

    /* 3-bead collar */
    const collarCenter = cordCurve.getPoint(1);
    for (let b = 0; b < 4; b++) {
      const beadGeo = new THREE.TorusGeometry(0.17, 0.06, 14, 28);
      beadGeo.rotateX(Math.PI / 2);
      beadGeo.translate(collarCenter.x, collarCenter.y - b * 0.13, collarCenter.z);
      capGroup.add(new THREE.Mesh(beadGeo, b % 2 === 0 ? matRed : matGold));
    }

    /* tassel brush body (lathe) */
    const brushPts: THREE.Vector2[] = [
      new THREE.Vector2(0.04,  0.00),
      new THREE.Vector2(0.20, -0.12),
      new THREE.Vector2(0.30, -0.38),
      new THREE.Vector2(0.38, -0.62),
      new THREE.Vector2(0.32, -0.90),
      new THREE.Vector2(0.18, -1.05),
      new THREE.Vector2(0.00, -1.12),
    ];
    const brushGeo = new THREE.LatheGeometry(brushPts, 28);
    brushGeo.translate(collarCenter.x, collarCenter.y - 0.55, collarCenter.z);
    capGroup.add(new THREE.Mesh(brushGeo, matRed));

    /* brush cap top disc */
    const brushCapGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.06, 22);
    brushCapGeo.translate(collarCenter.x, collarCenter.y - 0.55, collarCenter.z);
    capGroup.add(new THREE.Mesh(brushCapGeo, matGold));

    /* individual thread lines hanging from brush */
    const threadPos: number[] = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const rx = Math.cos(a) * 0.14; const rz = Math.sin(a) * 0.14;
      threadPos.push(collarCenter.x + rx, collarCenter.y - 1.65, collarCenter.z + rz);
      threadPos.push(collarCenter.x + rx * 1.6, collarCenter.y - 2.05 - Math.random() * 0.35, collarCenter.z + rz * 1.6);
    }
    const threadGeo = new THREE.BufferGeometry();
    threadGeo.setAttribute("position", new THREE.Float32BufferAttribute(threadPos, 3));
    capGroup.add(new THREE.LineSegments(threadGeo, new THREE.LineBasicMaterial({ color: 0xf0e8d0, transparent: true, opacity: 0.85 })));

    /* ═══════════════════════════════════════════════════════════
       5.  ORBITAL SHOOTING-STAR PARTICLE SYSTEM
          Inspired by reference image — small geometric sprites
          orbiting in concentric tilted rings, some fast streaks.
    ═══════════════════════════════════════════════════════════ */

    // --- 5a. Orbiting triangle/diamond sprites (like ref image) ---
    const NUM_ORBIT_PARTICLES = 380;
    const orbitPositions = new Float32Array(NUM_ORBIT_PARTICLES * 3);
    const orbitVelocities: { theta: number; phi: number; radius: number; speed: number; tiltAxis: THREE.Vector3 }[] = [];

    const orbitColors = new Float32Array(NUM_ORBIT_PARTICLES * 3);
    const orbitSizes = new Float32Array(NUM_ORBIT_PARTICLES);

    // color palette: white, gold, crimson red, soft pink
    const palette = [
      new THREE.Color(0xffffff),  // white
      new THREE.Color(0xffffff),  // white (doubled for frequency)
      new THREE.Color(0xd4a520),  // gold
      new THREE.Color(0xe11d48),  // crimson
      new THREE.Color(0xff6688),  // soft pink
      new THREE.Color(0xffd680),  // light gold
    ];

    for (let i = 0; i < NUM_ORBIT_PARTICLES; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1); // spherical distribution
      const radius = 3.8 + Math.random() * 3.5;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      orbitPositions[i * 3]     = x;
      orbitPositions[i * 3 + 1] = y;
      orbitPositions[i * 3 + 2] = z;

      const col = palette[Math.floor(Math.random() * palette.length)];
      orbitColors[i * 3]     = col.r;
      orbitColors[i * 3 + 1] = col.g;
      orbitColors[i * 3 + 2] = col.b;

      orbitSizes[i] = 2.5 + Math.random() * 5.5;

      // each particle has its own orbital plane (random tilt axis) + speed
      const tiltAxis = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize();

      orbitVelocities.push({
        theta, phi, radius,
        speed: (0.18 + Math.random() * 0.28) * (Math.random() > 0.5 ? 1 : -1),
        tiltAxis,
      });
    }

    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute("position", new THREE.BufferAttribute(orbitPositions, 3));
    orbitGeo.setAttribute("color",    new THREE.BufferAttribute(orbitColors,    3));
    orbitGeo.setAttribute("size",     new THREE.BufferAttribute(orbitSizes,     1));

    const orbitMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const orbitParticles = new THREE.Points(orbitGeo, orbitMat);
    scene.add(orbitParticles);

    // --- 5b. Fast shooting-star streaks (LineSegments) ---
    const NUM_STREAKS = 55;
    const streakPositions = new Float32Array(NUM_STREAKS * 2 * 3); // 2 points per streak
    type Streak = { x: number; y: number; z: number; vx: number; vy: number; vz: number; len: number; life: number; maxLife: number };
    const streaks: Streak[] = [];

    const spawnStreak = (): Streak => ({
      x: (Math.random() - 0.5) * 18,
      y: (Math.random() - 0.5) * 12,
      z: (Math.random() - 0.5) * 18,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      vz: (Math.random() - 0.5) * 0.35,
      len: 0.4 + Math.random() * 0.8,
      life: Math.random() * 120,
      maxLife: 80 + Math.random() * 100,
    });

    for (let i = 0; i < NUM_STREAKS; i++) streaks.push(spawnStreak());

    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
    const streakMat = new THREE.LineBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const streakLines = new THREE.LineSegments(streakGeo, streakMat);
    scene.add(streakLines);

    // --- 5c. Inner tight glow halo (tiny dense cloud near cap) ---
    const NUM_HALO = 120;
    const haloPts = new Float32Array(NUM_HALO * 3);
    const haloColors = new Float32Array(NUM_HALO * 3);
    for (let i = 0; i < NUM_HALO; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 2.8 + Math.random() * 1.2;
      haloPts[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      haloPts[i*3+1] = r * Math.cos(phi) * 0.65; // flatten vertically
      haloPts[i*3+2] = r * Math.sin(phi) * Math.sin(theta);
      const hcol = palette[Math.floor(Math.random() * palette.length)];
      haloColors[i*3]   = hcol.r;
      haloColors[i*3+1] = hcol.g;
      haloColors[i*3+2] = hcol.b;
    }
    const haloGeo = new THREE.BufferGeometry();
    haloGeo.setAttribute("position", new THREE.BufferAttribute(haloPts, 3));
    haloGeo.setAttribute("color",    new THREE.BufferAttribute(haloColors, 3));
    const haloMat = new THREE.PointsMaterial({
      size: 0.045, vertexColors: true, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    });
    scene.add(new THREE.Points(haloGeo, haloMat));

    /* ─── ANIMATION ─────────────────────────────────────────── */
    let raf: number;
    const clock = new THREE.Clock();
    const _tmpVec = new THREE.Vector3();
    const _quat   = new THREE.Quaternion();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      /* rotate cap */
      capGroup.rotation.y = -0.42 + t * 0.28;
      capGroup.position.y = Math.sin(t * 0.9) * 0.18;

      /* orbit particles — each moves along its own tilted orbital ring */
      const pos = orbitGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < NUM_ORBIT_PARTICLES; i++) {
        const ov = orbitVelocities[i];
        ov.theta += ov.speed * 0.012;

        // rotate position around tilt axis
        _tmpVec.set(
          ov.radius * Math.sin(ov.phi) * Math.cos(ov.theta),
          ov.radius * Math.cos(ov.phi),
          ov.radius * Math.sin(ov.phi) * Math.sin(ov.theta),
        );
        _quat.setFromAxisAngle(ov.tiltAxis, t * 0.06 * Math.sign(ov.speed));
        _tmpVec.applyQuaternion(_quat);

        pos.setXYZ(i, _tmpVec.x, _tmpVec.y, _tmpVec.z);
      }
      pos.needsUpdate = true;

      /* gentle breathing opacity on orbit cloud */
      orbitMat.opacity = 0.72 + 0.16 * Math.sin(t * 1.3);

      /* shooting star streaks */
      const spos = streakGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < NUM_STREAKS; i++) {
        const s = streaks[i];
        s.x += s.vx; s.y += s.vy; s.z += s.vz;
        s.life++;
        if (s.life > s.maxLife) { Object.assign(s, spawnStreak()); }

        const headX = s.x, headY = s.y, headZ = s.z;
        const norm = Math.sqrt(s.vx*s.vx + s.vy*s.vy + s.vz*s.vz) || 1;
        const tailX = headX - (s.vx/norm) * s.len;
        const tailY = headY - (s.vy/norm) * s.len;
        const tailZ = headZ - (s.vz/norm) * s.len;

        spos.setXYZ(i * 2,     headX, headY, headZ);
        spos.setXYZ(i * 2 + 1, tailX, tailY, tailZ);
      }
      spos.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    /* ─── RESIZE ────────────────────────────────────────────── */
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
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
    <div className="relative w-full h-[540px] lg:h-[650px] flex items-center justify-center select-none overflow-visible pointer-events-none">
      <div ref={mountRef} className="w-full h-full overflow-visible" />
    </div>
  );
}
