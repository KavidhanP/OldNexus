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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Master Group for rotation
    const capGroup = new THREE.Group();
    scene.add(capGroup);

    // ── 1. Create Mortarboard Top (Flat Diamond Plate) ────────────────────────
    const boardSize = 5.2;
    const boardThickness = 0.15;
    const boardGeo = new THREE.BoxGeometry(boardSize, boardThickness, boardSize);
    
    // Wireframe edges
    const boardWireframeGeo = new THREE.EdgesGeometry(boardGeo);
    const boardLineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    });
    const boardLines = new THREE.LineSegments(boardWireframeGeo, boardLineMat);
    capGroup.add(boardLines);

    // Glowing Nodes at Vertices
    const boardPos = boardGeo.attributes.position.array;
    const boardNodePositions: number[] = [];
    for (let i = 0; i < boardPos.length; i += 3) {
      boardNodePositions.push(boardPos[i], boardPos[i + 1], boardPos[i + 2]);
    }
    const boardNodeGeo = new THREE.BufferGeometry();
    boardNodeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(boardNodePositions, 3)
    );
    const nodeMat = new THREE.PointsMaterial({
      color: 0xff1e42, // Neon red
      size: 0.25,
      transparent: true,
      opacity: 0.9,
    });
    const boardNodes = new THREE.Points(boardNodeGeo, nodeMat);
    capGroup.add(boardNodes);

    // ── 2. Create Cap Skull Crown (Underneath) ──────────────────────────────
    const crownRadius = 1.8;
    const crownHeight = 1.6;
    const crownGeo = new THREE.CylinderGeometry(crownRadius, crownRadius * 1.1, crownHeight, 16, 4, true);
    crownGeo.translate(0, -crownHeight / 2 - boardThickness / 2, 0);

    const crownWireframeGeo = new THREE.WireframeGeometry(crownGeo);
    const crownLineMat = new THREE.LineBasicMaterial({
      color: 0xff2a4b, // Red glow lines
      transparent: true,
      opacity: 0.65,
    });
    const crownLines = new THREE.LineSegments(crownWireframeGeo, crownLineMat);
    capGroup.add(crownLines);

    // Crown Nodes
    const crownPos = crownGeo.attributes.position.array;
    const crownNodePositions: number[] = [];
    for (let i = 0; i < crownPos.length; i += 3) {
      crownNodePositions.push(crownPos[i], crownPos[i + 1], crownPos[i + 2]);
    }
    const crownNodeGeo = new THREE.BufferGeometry();
    crownNodeGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(crownNodePositions, 3)
    );
    const crownNodeMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
    });
    const crownNodes = new THREE.Points(crownNodeGeo, crownNodeMat);
    capGroup.add(crownNodes);

    // ── 3. Top Button ────────────────────────────────────────────────────────
    const buttonGeo = new THREE.SphereGeometry(0.2, 12, 12);
    buttonGeo.translate(0, boardThickness / 2 + 0.1, 0);
    const buttonWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(buttonGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.9, transparent: true })
    );
    capGroup.add(buttonWire);

    // ── 4. Tassel (Hanging Cord & Fringe) ────────────────────────────────────
    const tasselPoints: THREE.Vector3[] = [
      new THREE.Vector3(0, boardThickness / 2 + 0.1, 0),
      new THREE.Vector3(boardSize * 0.45, boardThickness / 2 + 0.05, boardSize * 0.45),
      new THREE.Vector3(boardSize * 0.48, -0.8, boardSize * 0.48),
      new THREE.Vector3(boardSize * 0.48, -2.2, boardSize * 0.48),
    ];
    const tasselCurve = new THREE.CatmullRomCurve3(tasselPoints);
    const tasselTubeGeo = new THREE.TubeGeometry(tasselCurve, 20, 0.04, 6, false);
    const tasselWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(tasselTubeGeo),
      new THREE.LineBasicMaterial({ color: 0xff1e42, opacity: 0.95, transparent: true })
    );
    capGroup.add(tasselWire);

    // Tassel Fringe Node Cluster
    const fringeGeo = new THREE.ConeGeometry(0.35, 1.2, 8);
    fringeGeo.translate(boardSize * 0.48, -2.5, boardSize * 0.48);
    const fringeWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(fringeGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.85, transparent: true })
    );
    capGroup.add(fringeWire);

    // ── 5. Orbital Radar Rings (Reference Image Style) ──────────────────────
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    const createRing = (radius: number, color: number, tiltX: number, tiltZ: number) => {
      const ringGeo = new THREE.BufferGeometry();
      const pointsCount = 120;
      const positions = [];
      for (let i = 0; i <= pointsCount; i++) {
        const theta = (i / pointsCount) * Math.PI * 2;
        positions.push(Math.cos(theta) * radius, 0, Math.sin(theta) * radius);
      }
      ringGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
      const ringMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.35,
      });
      const line = new THREE.Line(ringGeo, ringMat);
      line.rotation.x = tiltX;
      line.rotation.z = tiltZ;
      return line;
    };

    const ring1 = createRing(5.5, 0xffffff, Math.PI / 4, Math.PI / 6);
    const ring2 = createRing(6.8, 0xff1e42, -Math.PI / 6, Math.PI / 3);
    const ring3 = createRing(8.0, 0xffffff, Math.PI / 3, -Math.PI / 4);

    ringGroup.add(ring1);
    ringGroup.add(ring2);
    ringGroup.add(ring3);

    // ── 6. Background Floating Constellation Particles ───────────────────────
    const particleCount = 220;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Mix of Red and White particles
      const isRed = Math.random() > 0.5;
      particleColors[i * 3] = isRed ? 1.0 : 1.0;
      particleColors[i * 3 + 1] = isRed ? 0.12 : 1.0;
      particleColors[i * 3 + 2] = isRed ? 0.26 : 1.0;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Slight angle for aesthetic perspective
    capGroup.rotation.x = 0.35;
    capGroup.rotation.z = -0.15;

    // ── Animation Loop ───────────────────────────────────────────────────────
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth continuous 3D rotation
      capGroup.rotation.y = elapsedTime * 0.45;
      capGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.25; // Gentle float bounce

      // Rotate orbital rings at differential speeds
      ring1.rotation.y = elapsedTime * 0.15;
      ring2.rotation.y = -elapsedTime * 0.22;
      ring3.rotation.y = elapsedTime * 0.1;

      // Particle rotation
      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // ── Responsive Resize Listener ──────────────────────────────────────────
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
    <div className="relative w-full h-[520px] lg:h-[620px] flex items-center justify-center pointer-events-none select-none">
      {/* Glow Backdrop Rings */}
      <div className="absolute w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
}
