"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Position camera far enough back to guarantee ZERO cut-off during 360° rotation
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 1.8, 15.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Master Cap Group (scaled to stay safely within viewport bounding box)
    const capGroup = new THREE.Group();
    capGroup.scale.set(0.9, 0.9, 0.9);
    scene.add(capGroup);

    // ── Colors ─────────────────────────────────────────────────────────────────
    const COLOR_RED = 0xff1e42;
    const COLOR_WHITE = 0xffffff;
    const COLOR_DARK_RED = 0x990b22;

    // ── 1. Intricate Mortarboard Top (Double Plate + Inset Grid) ───────────────
    const boardWidth = 5.4;
    const boardThickness = 0.18;

    // Main Outer Board
    const mainBoardGeo = new THREE.BoxGeometry(boardWidth, boardThickness, boardWidth, 6, 1, 6);
    const boardWireframeGeo = new THREE.WireframeGeometry(mainBoardGeo);
    const boardLineMat = new THREE.LineBasicMaterial({
      color: COLOR_WHITE,
      transparent: true,
      opacity: 0.85,
    });
    const boardLines = new THREE.LineSegments(boardWireframeGeo, boardLineMat);
    capGroup.add(boardLines);

    // Inset Top Lattice Grid
    const gridPositions: number[] = [];
    const gridSize = 5;
    const step = boardWidth / gridSize;
    const half = boardWidth / 2;
    const topY = boardThickness / 2 + 0.02;

    for (let i = 0; i <= gridSize; i++) {
      const pos = -half + i * step;
      // Lines along X
      gridPositions.push(-half, topY, pos, half, topY, pos);
      // Lines along Z
      gridPositions.push(pos, topY, -half, pos, topY, half);
    }

    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: COLOR_RED,
      transparent: true,
      opacity: 0.6,
    });
    const topGrid = new THREE.LineSegments(gridGeo, gridMat);
    capGroup.add(topGrid);

    // Nodes at Top Grid Intersections (Dense Constellation Nodes)
    const gridNodePositions: number[] = [];
    for (let ix = 0; ix <= gridSize; ix++) {
      for (let iz = 0; iz <= gridSize; iz++) {
        const x = -half + ix * step;
        const z = -half + iz * step;
        gridNodePositions.push(x, topY, z);
      }
    }
    const gridNodeGeo = new THREE.BufferGeometry();
    gridNodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(gridNodePositions, 3));
    const gridNodeMat = new THREE.PointsMaterial({
      color: COLOR_RED,
      size: 0.22,
      transparent: true,
      opacity: 0.95,
    });
    const gridNodes = new THREE.Points(gridNodeGeo, gridNodeMat);
    capGroup.add(gridNodes);

    // ── 2. Multi-Segmented Skull Crown (32 Segments + Rib Rings) ──────────────
    const crownRadiusTop = 1.85;
    const crownRadiusBottom = 2.05;
    const crownHeight = 1.7;
    const radialSegments = 32;
    const heightSegments = 6;

    const crownGeo = new THREE.CylinderGeometry(
      crownRadiusTop,
      crownRadiusBottom,
      crownHeight,
      radialSegments,
      heightSegments,
      true
    );
    crownGeo.translate(0, -crownHeight / 2 - boardThickness / 2, 0);

    const crownWireframeGeo = new THREE.WireframeGeometry(crownGeo);
    const crownLineMat = new THREE.LineBasicMaterial({
      color: COLOR_WHITE,
      transparent: true,
      opacity: 0.65,
    });
    const crownLines = new THREE.LineSegments(crownWireframeGeo, crownLineMat);
    capGroup.add(crownLines);

    // Dense Node Points along Skull Vertices
    const crownPos = crownGeo.attributes.position.array;
    const crownNodePositions: number[] = [];
    for (let i = 0; i < crownPos.length; i += 3) {
      crownNodePositions.push(crownPos[i], crownPos[i + 1], crownPos[i + 2]);
    }
    const crownNodeGeo = new THREE.BufferGeometry();
    crownNodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(crownNodePositions, 3));
    const crownNodeMat = new THREE.PointsMaterial({
      color: COLOR_WHITE,
      size: 0.14,
      transparent: true,
      opacity: 0.8,
    });
    const crownNodes = new THREE.Points(crownNodeGeo, crownNodeMat);
    capGroup.add(crownNodes);

    // Headband / Base Trim Ring
    const bandGeo = new THREE.TorusGeometry(crownRadiusBottom, 0.08, 12, 32);
    bandGeo.rotateX(Math.PI / 2);
    bandGeo.translate(0, -crownHeight - boardThickness / 2, 0);
    const bandLines = new THREE.LineSegments(
      new THREE.WireframeGeometry(bandGeo),
      new THREE.LineBasicMaterial({ color: COLOR_RED, opacity: 0.9, transparent: true })
    );
    capGroup.add(bandLines);

    // ── 3. Top Button & Radial Starburst ───────────────────────────────────────
    const buttonGeo = new THREE.SphereGeometry(0.25, 16, 16);
    buttonGeo.translate(0, topY + 0.12, 0);
    const buttonWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(buttonGeo),
      new THREE.LineBasicMaterial({ color: COLOR_WHITE, opacity: 0.95, transparent: true })
    );
    capGroup.add(buttonWire);

    // Starburst Radial Lines around Button
    const starPositions: number[] = [];
    const starRays = 12;
    const rayLength = 0.9;
    for (let i = 0; i < starRays; i++) {
      const angle = (i / starRays) * Math.PI * 2;
      starPositions.push(0, topY + 0.05, 0);
      starPositions.push(Math.cos(angle) * rayLength, topY + 0.05, Math.sin(angle) * rayLength);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
    const starLines = new THREE.LineSegments(
      starGeo,
      new THREE.LineBasicMaterial({ color: COLOR_RED, opacity: 0.75, transparent: true })
    );
    capGroup.add(starLines);

    // ── 4. Intricate Tassel & Hanging Threads ─────────────────────────────────
    const cornerX = boardWidth * 0.46;
    const cornerZ = boardWidth * 0.46;
    const tasselCurvePoints = [
      new THREE.Vector3(0, topY + 0.12, 0),
      new THREE.Vector3(cornerX * 0.5, topY + 0.1, cornerZ * 0.5),
      new THREE.Vector3(cornerX, topY + 0.05, cornerZ),
      new THREE.Vector3(cornerX + 0.2, -0.6, cornerZ + 0.2),
      new THREE.Vector3(cornerX + 0.25, -2.1, cornerZ + 0.25),
    ];
    const tasselCurve = new THREE.CatmullRomCurve3(tasselCurvePoints);
    const tasselTubeGeo = new THREE.TubeGeometry(tasselCurve, 30, 0.05, 8, false);
    const tasselWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(tasselTubeGeo),
      new THREE.LineBasicMaterial({ color: COLOR_RED, opacity: 0.95, transparent: true })
    );
    capGroup.add(tasselWire);

    // Tassel Ring Collar
    const collarGeo = new THREE.TorusGeometry(0.2, 0.05, 8, 16);
    collarGeo.rotateX(Math.PI / 2);
    collarGeo.translate(cornerX + 0.25, -2.1, cornerZ + 0.25);
    const collarWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(collarGeo),
      new THREE.LineBasicMaterial({ color: COLOR_WHITE, opacity: 0.9, transparent: true })
    );
    capGroup.add(collarWire);

    // Multi-Strand Tassel Fringe Threads
    const fringeStrands = 16;
    const fringePositions: number[] = [];
    const fringeNodes: number[] = [];
    const fringeLength = 1.4;

    for (let i = 0; i < fringeStrands; i++) {
      const angle = (i / fringeStrands) * Math.PI * 2;
      const rx = Math.cos(angle) * 0.18;
      const rz = Math.sin(angle) * 0.18;

      const startX = cornerX + 0.25 + rx;
      const startY = -2.15;
      const startZ = cornerZ + 0.25 + rz;

      const endX = startX + (Math.random() - 0.5) * 0.15;
      const endY = startY - fringeLength - Math.random() * 0.3;
      const endZ = startZ + (Math.random() - 0.5) * 0.15;

      fringePositions.push(startX, startY, startZ, endX, endY, endZ);
      fringeNodes.push(endX, endY, endZ);
    }

    const fringeGeo = new THREE.BufferGeometry();
    fringeGeo.setAttribute("position", new THREE.Float32BufferAttribute(fringePositions, 3));
    const fringeLines = new THREE.LineSegments(
      fringeGeo,
      new THREE.LineBasicMaterial({ color: COLOR_WHITE, opacity: 0.85, transparent: true })
    );
    capGroup.add(fringeLines);

    // Fringe Terminal Node Lights
    const fringeNodeGeo = new THREE.BufferGeometry();
    fringeNodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(fringeNodes, 3));
    const fringeNodePoints = new THREE.Points(
      fringeNodeGeo,
      new THREE.PointsMaterial({ color: COLOR_RED, size: 0.18, transparent: true, opacity: 0.95 })
    );
    capGroup.add(fringeNodePoints);

    // ── 5. Orbital Radar Rings & Nodes (Reference Image Style) ─────────────
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const createRadarRing = (radius: number, color: number, tiltX: number, tiltZ: number, nodeCount: number) => {
      const ringGeo = new THREE.BufferGeometry();
      const pointsCount = 120;
      const positions = [];
      const nodePos = [];

      for (let i = 0; i <= pointsCount; i++) {
        const theta = (i / pointsCount) * Math.PI * 2;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        positions.push(x, 0, z);

        if (i % Math.floor(pointsCount / nodeCount) === 0) {
          nodePos.push(x, 0, z);
        }
      }

      ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const line = new THREE.Line(
        ringGeo,
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 })
      );
      line.rotation.x = tiltX;
      line.rotation.z = tiltZ;

      // Node lights on the ring
      const nGeo = new THREE.BufferGeometry();
      nGeo.setAttribute("position", new THREE.Float32BufferAttribute(nodePos, 3));
      const p = new THREE.Points(
        nGeo,
        new THREE.PointsMaterial({ color, size: 0.18, transparent: true, opacity: 0.85 })
      );
      p.rotation.x = tiltX;
      p.rotation.z = tiltZ;

      const subGroup = new THREE.Group();
      subGroup.add(line);
      subGroup.add(p);
      return subGroup;
    };

    const ring1 = createRadarRing(5.6, COLOR_WHITE, Math.PI / 5, Math.PI / 6, 8);
    const ring2 = createRadarRing(6.8, COLOR_RED, -Math.PI / 6, Math.PI / 3, 12);
    const ring3 = createRadarRing(8.2, COLOR_WHITE, Math.PI / 3.5, -Math.PI / 4, 10);

    ringGroup.add(ring1);
    ringGroup.add(ring2);
    ringGroup.add(ring3);

    // ── 6. Constellation Particle Field ────────────────────────────────────────
    const particleCount = 260;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 22;

      const isRed = Math.random() > 0.45;
      particleColors[i * 3] = isRed ? 1.0 : 1.0;
      particleColors[i * 3 + 1] = isRed ? 0.12 : 1.0;
      particleColors[i * 3 + 2] = isRed ? 0.26 : 1.0;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({
        size: 0.13,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
      })
    );
    scene.add(particles);

    // Initial rotation tilt for aesthetic 3D perspective
    capGroup.rotation.x = 0.38;
    capGroup.rotation.z = -0.12;

    // ── Animation Loop ────────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth continuous 3D rotation around Y
      capGroup.rotation.y = elapsedTime * 0.42;
      capGroup.position.y = Math.sin(elapsedTime * 1.1) * 0.22; // Gentle float bounce

      // Rotate orbital radar rings at differential speeds
      ring1.rotation.y = elapsedTime * 0.14;
      ring2.rotation.y = -elapsedTime * 0.2;
      ring3.rotation.y = elapsedTime * 0.08;

      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // ── Responsive Resize Handler ──────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-[540px] lg:h-[650px] flex items-center justify-center pointer-events-none select-none overflow-visible">
      {/* Background Ambient Glows */}
      <div className="absolute w-[420px] h-[420px] rounded-full bg-red-600/10 blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-white/5 blur-[80px] pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full overflow-visible" />
    </div>
  );
}
