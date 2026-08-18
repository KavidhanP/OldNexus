"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera with generous frustum buffer so NO particles, strings or caps ever cut off
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const redLight = new THREE.PointLight(0xff1e42, 2, 20);
    redLight.position.set(-4, 3, 5);
    scene.add(redLight);

    // Master Cap Group — Centered & Scaled to ensure 100% visibility without clipping
    const capGroup = new THREE.Group();
    capGroup.scale.set(0.68, 0.68, 0.68);
    // Shift slightly down so top plate and hanging tassel string fit perfectly centered
    capGroup.position.set(0, 0.3, 0);
    scene.add(capGroup);

    // ── 1. Top Plate (Mortarboard with Rounded Corners & Accent Rim) ─────────
    const shape = new THREE.Shape();
    const size = 2.4; // Half width
    const radius = 0.25; // Corner radius

    shape.moveTo(-size + radius, -size);
    shape.lineTo(size - radius, -size);
    shape.quadraticCurveTo(size, -size, size, -size + radius);
    shape.lineTo(size, size - radius);
    shape.quadraticCurveTo(size, size, size - radius, size);
    shape.lineTo(-size + radius, size);
    shape.quadraticCurveTo(-size, size, -size, size - radius);
    shape.lineTo(-size, -size + radius);
    shape.quadraticCurveTo(-size, -size, -size + radius, -size);

    const extrudeSettings = {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    const boardGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    boardGeo.rotateX(Math.PI / 2); // Make flat plate horizontal

    // Dark sleek cap material
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x121216,
      roughness: 0.3,
      metalness: 0.2,
    });
    const mainBoard = new THREE.Mesh(boardGeo, capMat);
    capGroup.add(mainBoard);

    // Wireframe Overlay for technical pop
    const boardWireGeo = new THREE.WireframeGeometry(boardGeo);
    const boardWireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const boardWire = new THREE.LineSegments(boardWireGeo, boardWireMat);
    capGroup.add(boardWire);

    // Red Accent Outer Rim (Matching Reference Image Outer Trim)
    const rimPoints = [
      new THREE.Vector3(-size, 0.1, -size),
      new THREE.Vector3(size, 0.1, -size),
      new THREE.Vector3(size, 0.1, size),
      new THREE.Vector3(-size, 0.1, size),
      new THREE.Vector3(-size, 0.1, -size),
    ];
    const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPoints);
    const rimMat = new THREE.LineBasicMaterial({ color: 0xff1e42, linewidth: 3 });
    const rimLine = new THREE.Line(rimGeo, rimMat);
    capGroup.add(rimLine);

    // Corner Nodes on Plate
    const cornerNodePositions = [
      -size, 0.1, -size,
      size, 0.1, -size,
      size, 0.1, size,
      -size, 0.1, size,
      0, 0.1, 0, // Center
    ];
    const cornerNodeGeo = new THREE.BufferGeometry();
    cornerNodeGeo.setAttribute("position", new THREE.Float32BufferAttribute(cornerNodePositions, 3));
    const cornerNodes = new THREE.Points(
      cornerNodeGeo,
      new THREE.PointsMaterial({ color: 0xff1e42, size: 0.28, transparent: true, opacity: 0.95 })
    );
    capGroup.add(cornerNodes);

    // ── 2. Skull Crown (Base Dome under Plate) ────────────────────────────────
    const crownRadiusTop = 1.6;
    const crownRadiusBottom = 1.85;
    const crownHeight = 1.3;
    const crownGeo = new THREE.CylinderGeometry(crownRadiusTop, crownRadiusBottom, crownHeight, 32);
    crownGeo.translate(0, -crownHeight / 2 - 0.08, 0);

    const crownMesh = new THREE.Mesh(crownGeo, capMat);
    capGroup.add(crownMesh);

    const crownWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(crownGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
    );
    capGroup.add(crownWire);

    // Bottom Base Rim Band (Accent Blue/Red Collar in Ref Image)
    const baseBandGeo = new THREE.TorusGeometry(crownRadiusBottom + 0.02, 0.08, 12, 32);
    baseBandGeo.rotateX(Math.PI / 2);
    baseBandGeo.translate(0, -crownHeight - 0.08, 0);
    const baseBandMat = new THREE.MeshStandardMaterial({
      color: 0xff1e42,
      roughness: 0.2,
      metalness: 0.5,
    });
    const baseBand = new THREE.Mesh(baseBandGeo, baseBandMat);
    capGroup.add(baseBand);

    // ── 3. Center Button ──────────────────────────────────────────────────────
    const buttonGeo = new THREE.SphereGeometry(0.25, 20, 20);
    buttonGeo.translate(0, 0.2, 0);
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0xff1e42,
      roughness: 0.2,
      metalness: 0.8,
    });
    const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
    capGroup.add(buttonMesh);

    // ── 4. Thick Curving Tassel String & Flared Brush (Ref Image Style) ───────
    // Path starting from center button, draping over front-left corner
    const tasselPoints = [
      new THREE.Vector3(0, 0.22, 0),
      new THREE.Vector3(0.6, 0.2, 0.6),
      new THREE.Vector3(1.7, 0.15, 1.7),
      new THREE.Vector3(2.2, 0.05, 2.0),
      new THREE.Vector3(2.35, -0.4, 2.0),
      new THREE.Vector3(2.35, -1.2, 1.9),
    ];
    const tasselCurve = new THREE.CatmullRomCurve3(tasselPoints);
    const tubeGeo = new THREE.TubeGeometry(tasselCurve, 40, 0.09, 12, false);
    const stringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.2,
    });
    const tasselString = new THREE.Mesh(tubeGeo, stringMat);
    capGroup.add(tasselString);

    // Tassel Cord Wireframe
    const tasselWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(tubeGeo),
      new THREE.LineBasicMaterial({ color: 0xff1e42, transparent: true, opacity: 0.5 })
    );
    capGroup.add(tasselWire);

    // Beaded Collar (3 stacked rings at bottom of cord matching ref image)
    const collarGroup = new THREE.Group();
    collarGroup.position.set(2.35, -1.35, 1.9);

    for (let b = 0; b < 3; b++) {
      const beadGeo = new THREE.TorusGeometry(0.12, 0.04, 10, 20);
      beadGeo.rotateX(Math.PI / 2);
      beadGeo.translate(0, -b * 0.09, 0);
      const beadMesh = new THREE.Mesh(
        beadGeo,
        new THREE.MeshStandardMaterial({ color: 0xff1e42, metalness: 0.5 })
      );
      collarGroup.add(beadMesh);
    }
    capGroup.add(collarGroup);

    // Flared Teardrop Tassel Brush (Golden/Red Tassel Tip from Ref Image)
    const brushGeo = new THREE.ConeGeometry(0.28, 0.85, 20);
    brushGeo.rotateX(Math.PI); // Point downwards
    brushGeo.translate(2.35, -1.95, 1.9);

    const brushMat = new THREE.MeshStandardMaterial({
      color: 0xff1e42,
      roughness: 0.2,
      metalness: 0.6,
    });
    const tasselBrush = new THREE.Mesh(brushGeo, brushMat);
    capGroup.add(tasselBrush);

    const brushWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(brushGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.8, transparent: true })
    );
    capGroup.add(brushWire);

    // ── 5. Clean Floating Constellation Particles (Tight Bounds) ──────────────
    // Constrained radius (r < 5.0) to strictly prevent any particle edge clipping
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const r = 2.0 + Math.random() * 3.2; // Radius strictly inside viewport
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      particlePositions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      particlePositions[i * 3 + 1] = r * Math.sin(phi);
      particlePositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);

      const isRed = Math.random() > 0.5;
      particleColors[i * 3] = isRed ? 1.0 : 1.0;
      particleColors[i * 3 + 1] = isRed ? 0.12 : 1.0;
      particleColors[i * 3 + 2] = isRed ? 0.26 : 1.0;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Initial Aesthetic Rotation Angle (Matching Ref Image Perspective)
    capGroup.rotation.x = 0.45;
    capGroup.rotation.y = -0.4;

    // ── Animation Loop ────────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth subtle oscillation + 360 rotation
      capGroup.rotation.y = -0.4 + elapsedTime * 0.35;
      capGroup.position.y = 0.3 + Math.sin(elapsedTime * 1.2) * 0.15; // Gentle float

      particles.rotation.y = elapsedTime * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
    <div className="relative w-full h-[450px] lg:h-[540px] flex items-center justify-center pointer-events-none select-none overflow-visible">
      {/* Background Soft Glow */}
      <div className="absolute w-[320px] h-[320px] rounded-full bg-red-600/10 blur-[80px] pointer-events-none" />

      {/* WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full overflow-visible" />
    </div>
  );
}
