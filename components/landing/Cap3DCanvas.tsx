"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const W = container.clientWidth  || 640;
    const H = container.clientHeight || 640;

    /* ─── RENDERER / CAMERA ─────────────────────────────────
       Camera pulled far back + wide FOV so the full cap +
       tassel is NEVER clipped at any rotation angle.
    ──────────────────────────────────────────────────────── */
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(38, W / H, 0.1, 500);
    camera.position.set(0, 1.0, 18);   // z=18 gives generous room
    camera.lookAt(0, -0.5, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping  = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    /* ─── LIGHTING ─────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(8, 14, 10); scene.add(key);
    const rim = new THREE.DirectionalLight(0xe11d48, 1.0);
    rim.position.set(0, 8, -12); scene.add(rim);
    const under = new THREE.DirectionalLight(0xffd070, 0.35);
    under.position.set(0, -8, 4); scene.add(under);

    /* ─── COLOUR HELPERS ───────────────────────────────────── */
    const edgeMat  = (hex: number, opacity = 1.0) =>
      new THREE.LineBasicMaterial({ color: hex, transparent: opacity < 1, opacity, depthWrite: false });

    const faceMat  = (hex: number, opacity = 0.08) =>
      new THREE.MeshStandardMaterial({
        color: hex, roughness: 0.4, metalness: 0.2,
        transparent: true, opacity, side: THREE.DoubleSide,
        depthWrite: false,
      });

    const solidMat = (hex: number) =>
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.25, metalness: 0.55 });

    /* Helper — add a geometry as ghost faces + visible edges */
    const addWireObj = (
      geo: THREE.BufferGeometry,
      faceColor: number,
      lineColor: number,
      faceOpacity = 0.07,
      lineOpacity = 1.0,
      parent: THREE.Object3D = capGroup,
    ) => {
      parent.add(new THREE.Mesh(geo, faceMat(faceColor, faceOpacity)));
      parent.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 12), edgeMat(lineColor, lineOpacity)));
    };

    /* ─── CAP GROUP ────────────────────────────────────────── */
    const capGroup = new THREE.Group();
    // Scaled DOWN from earlier version so nothing clips
    capGroup.scale.set(0.82, 0.82, 0.82);
    capGroup.rotation.x = 0.36;
    capGroup.rotation.y = -0.40;
    scene.add(capGroup);

    /* ═══════════════════════════════════════════════════════
       1.  MORTARBOARD PLATE
           Low-poly approach — edges define the form, ghost face fill.
    ═══════════════════════════════════════════════════════ */
    const PS  = 2.8;
    const CR  = 0.30;
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
      depth: 0.20, bevelEnabled: true,
      bevelSegments: 3, steps: 1,
      bevelSize: 0.06, bevelThickness: 0.06,
    });
    plateGeo.rotateX(Math.PI / 2);
    addWireObj(plateGeo, 0x111114, 0xffffff, 0.06, 0.75);

    /* Red trim border ring on plate edge */
    const rimPts = [
      new THREE.Vector3(-PS + 0.07, 0.20, -PS + 0.07),
      new THREE.Vector3( PS - 0.07, 0.20, -PS + 0.07),
      new THREE.Vector3( PS - 0.07, 0.20,  PS - 0.07),
      new THREE.Vector3(-PS + 0.07, 0.20,  PS - 0.07),
      new THREE.Vector3(-PS + 0.07, 0.20, -PS + 0.07),
    ];
    capGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(rimPts),
      edgeMat(0xe11d48, 0.9)
    ));

    /* Gold inner accent ring */
    const goldPts = rimPts.map(v => new THREE.Vector3(
      v.x * 0.87, v.y, v.z * 0.87
    ));
    capGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(goldPts),
      edgeMat(0xd4a520, 0.7)
    ));

    /* Corner stud rivets — solid small cylinders */
    [[-PS+0.28,-PS+0.28],[PS-0.28,-PS+0.28],[PS-0.28,PS-0.28],[-PS+0.28,PS-0.28]].forEach(([cx, cz]) => {
      const g = new THREE.CylinderGeometry(0.07, 0.07, 0.06, 8);
      g.translate(cx as number, 0.21, cz as number);
      capGroup.add(new THREE.Mesh(g, solidMat(0xd4a520)));
      capGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat(0xffffff, 0.5)));
    });

    /* ═══════════════════════════════════════════════════════
       2.  CROWN — cylindrical, low-poly edges + ghost fill
    ═══════════════════════════════════════════════════════ */
    const crownTopR = 1.80;
    const crownBotR = 2.14;
    const crownH    = 1.52;

    // Use low segment count so edges are clearly visible (geometric look)
    const crownGeo = new THREE.CylinderGeometry(crownTopR, crownBotR, crownH, 14, 4, false);
    crownGeo.translate(0, -crownH / 2 - 0.08, 0);
    addWireObj(crownGeo, 0x111114, 0xffffff, 0.06, 0.65);

    /* Red seam lines down the crown */
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const pts: THREE.Vector3[] = [];
      for (let t = 0; t <= 1; t += 0.08) {
        const r = THREE.MathUtils.lerp(crownTopR, crownBotR, t) + 0.014;
        pts.push(new THREE.Vector3(Math.cos(a)*r, -crownH*t - 0.08, Math.sin(a)*r));
      }
      capGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat(0xe11d48, 0.50)));
    }

    /* Horizontal ring bands */
    [0.33, 0.66].forEach(t => {
      const y  = -crownH * t - 0.08;
      const r  = THREE.MathUtils.lerp(crownTopR, crownBotR, t) + 0.016;
      const rGeo = new THREE.TorusGeometry(r, 0.028, 6, 22);
      rGeo.rotateX(Math.PI / 2); rGeo.translate(0, y, 0);
      addWireObj(rGeo, 0x6b0a1f, 0xe11d48, 0.12, 0.8);
    });

    /* Base collar bands */
    const bBase = -crownH - 0.08;
    const b1Geo = new THREE.TorusGeometry(crownBotR + 0.04, 0.10, 6, 22);
    b1Geo.rotateX(Math.PI / 2); b1Geo.translate(0, bBase, 0);
    addWireObj(b1Geo, 0xcc1133, 0xe11d48, 0.15, 0.9);

    const b2Geo = new THREE.TorusGeometry(crownBotR + 0.06, 0.055, 6, 22);
    b2Geo.rotateX(Math.PI / 2); b2Geo.translate(0, bBase - 0.17, 0);
    addWireObj(b2Geo, 0xd4a520, 0xffd070, 0.15, 0.9);

    /* ═══════════════════════════════════════════════════════
       3.  CENTRE FERRULE + BUTTON
    ═══════════════════════════════════════════════════════ */
    const ferGeo = new THREE.CylinderGeometry(0.36, 0.41, 0.10, 14);
    ferGeo.translate(0, 0.18, 0);
    addWireObj(ferGeo, 0xd4a520, 0xffd070, 0.25, 0.9);

    const btnGeo = new THREE.SphereGeometry(0.28, 10, 8);
    btnGeo.translate(0, 0.30, 0);
    addWireObj(btnGeo, 0xcc1133, 0xe11d48, 0.25, 0.9);

    /* ═══════════════════════════════════════════════════════
       4.  TASSEL CORD + COLLAR + BRUSH
    ═══════════════════════════════════════════════════════ */
    const cordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0,      0.30, 0),
      new THREE.Vector3(0.62,   0.26, 0.60),
      new THREE.Vector3(1.80,   0.21, 1.78),
      new THREE.Vector3(2.55,   0.08, 2.24),
      new THREE.Vector3(2.72,  -0.32, 2.20),
      new THREE.Vector3(2.72,  -1.18, 2.14),
      new THREE.Vector3(2.72,  -1.50, 2.14),
    ]);

    // Tube with low radial segments — visible geometric edges
    const cordGeo = new THREE.TubeGeometry(cordCurve, 28, 0.085, 7, false);
    addWireObj(cordGeo, 0xf0e8d0, 0xffffff, 0.18, 0.7);

    /* Collar beads */
    const collarEnd = cordCurve.getPoint(1);
    for (let b = 0; b < 4; b++) {
      const beadGeo = new THREE.TorusGeometry(0.16, 0.055, 5, 14);
      beadGeo.rotateX(Math.PI / 2);
      beadGeo.translate(collarEnd.x, collarEnd.y - b * 0.13, collarEnd.z);
      addWireObj(beadGeo, b % 2 === 0 ? 0xcc1133 : 0xd4a520, b % 2 === 0 ? 0xe11d48 : 0xffd070, 0.20, 0.9);
    }

    /* Tassel brush */
    const brushPts: THREE.Vector2[] = [
      new THREE.Vector2(0.04,  0.00),
      new THREE.Vector2(0.22, -0.14),
      new THREE.Vector2(0.33, -0.42),
      new THREE.Vector2(0.36, -0.68),
      new THREE.Vector2(0.28, -0.92),
      new THREE.Vector2(0.14, -1.06),
      new THREE.Vector2(0.00, -1.12),
    ];
    const brushGeo = new THREE.LatheGeometry(brushPts, 10);
    brushGeo.translate(collarEnd.x, collarEnd.y - 0.55, collarEnd.z);
    addWireObj(brushGeo, 0xcc1133, 0xe11d48, 0.20, 0.80);

    /* Thread lines */
    const threadPos: number[] = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const rx = Math.cos(a) * 0.13; const rz = Math.sin(a) * 0.13;
      threadPos.push(collarEnd.x + rx, collarEnd.y - 1.68, collarEnd.z + rz);
      threadPos.push(collarEnd.x + rx * 1.55, collarEnd.y - 2.08 - Math.random() * 0.30, collarEnd.z + rz * 1.55);
    }
    const threadGeo = new THREE.BufferGeometry();
    threadGeo.setAttribute("position", new THREE.Float32BufferAttribute(threadPos, 3));
    capGroup.add(new THREE.LineSegments(threadGeo, edgeMat(0xf0e8d0, 0.8)));

    /* ═══════════════════════════════════════════════════════
       5.  PARTICLES — max 3, very slow, orbiting shooting stars
    ═══════════════════════════════════════════════════════ */
    type StarData = {
      /** world position */ pos: THREE.Vector3;
      /** direction unit vector */ dir: THREE.Vector3;
      /** current speed (very slow) */ speed: number;
      /** trail length */ trailLen: number;
      /** how long it has lived */ life: number;
      /** max life before respawn */ maxLife: number;
    };

    const NUM_STARS = 3;

    const spawnStar = (): StarData => {
      // Spawn at a random point on a sphere around the cap
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 5.5 + Math.random() * 3;
      const pos   = new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
      // Direction: tangent to the sphere (orbit-like), slightly inward
      const radial = pos.clone().normalize();
      const tangent = new THREE.Vector3(
        -(Math.sin(theta)),
        0,
        Math.cos(theta),
      ).normalize();
      const dir = tangent.add(radial.multiplyScalar(-0.12)).normalize();

      return {
        pos,
        dir,
        speed:    0.018 + Math.random() * 0.012, // very slow
        trailLen: 1.2  + Math.random() * 1.0,
        life:     Math.floor(Math.random() * 300),
        maxLife:  260  + Math.floor(Math.random() * 180),
      };
    };

    const stars: StarData[] = Array.from({ length: NUM_STARS }, spawnStar);

    // Each star: 2 points (head + tail) = LineSegments
    const starPositions = new Float32Array(NUM_STARS * 2 * 3);
    const starColors    = new Float32Array(NUM_STARS * 2 * 3);
    const STAR_PALETTE  = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xffd070),
      new THREE.Color(0xe11d48),
    ];

    // Assign a fixed colour per star
    const starCol = stars.map((_, i) => STAR_PALETTE[i % STAR_PALETTE.length]);

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute("color",    new THREE.BufferAttribute(starColors,    3));

    const starMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent:  true,
      opacity:      0.85,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
      linewidth:    1,
    });
    scene.add(new THREE.LineSegments(starGeo, starMat));

    /* ─── ANIMATION ────────────────────────────────────────── */
    let raf: number;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      /* Rotate cap — gentle, steady */
      capGroup.rotation.y = -0.40 + t * 0.22;
      capGroup.position.y = Math.sin(t * 0.8) * 0.14;

      /* Update shooting stars */
      const sPos = starGeo.attributes.position as THREE.BufferAttribute;
      const sCol = starGeo.attributes.color    as THREE.BufferAttribute;

      for (let i = 0; i < NUM_STARS; i++) {
        const s = stars[i];
        s.pos.addScaledVector(s.dir, s.speed);
        s.life++;

        // Gently curve direction so it orbits
        s.dir.applyAxisAngle(new THREE.Vector3(0.1, 1, 0.05).normalize(), 0.003);
        s.dir.normalize();

        if (s.life > s.maxLife) Object.assign(s, spawnStar());

        const fade = Math.min(1, Math.min(s.life / 40, (s.maxLife - s.life) / 40));

        // Head
        sPos.setXYZ(i * 2,     s.pos.x, s.pos.y, s.pos.z);
        sCol.setXYZ(i * 2,     starCol[i].r * fade, starCol[i].g * fade, starCol[i].b * fade);
        // Tail
        const tail = s.pos.clone().addScaledVector(s.dir, -s.trailLen);
        sPos.setXYZ(i * 2 + 1, tail.x, tail.y, tail.z);
        sCol.setXYZ(i * 2 + 1, 0, 0, 0); // tail fades to black
      }
      sPos.needsUpdate = true;
      sCol.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    /* ─── RESIZE ───────────────────────────────────────────── */
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
    <div className="relative w-full h-[520px] lg:h-[640px] flex items-center justify-center select-none overflow-visible pointer-events-none">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
