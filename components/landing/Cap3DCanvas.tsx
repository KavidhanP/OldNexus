"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Cap3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    // Scene with clean solid dark background (no glowing halos)
    const scene = new THREE.Scene();

    // Camera — Adjusted position to render cap LARGER while ensuring zero cut-off
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(0, 0.6, 12.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // ── Studio Professional Lighting (No neon/glowing lights) ───────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Key Light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(6, 12, 8);
    scene.add(keyLight);

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-8, -4, 6);
    scene.add(fillLight);

    // Rim/Specular Highlight Light
    const rimLight = new THREE.DirectionalLight(0xe11d48, 1.2);
    rimLight.position.set(0, 8, -10);
    scene.add(rimLight);

    // Master Group — Scaled LARGER as requested
    const capGroup = new THREE.Group();
    capGroup.scale.set(0.92, 0.92, 0.92);
    capGroup.position.set(0, 0.2, 0);
    scene.add(capGroup);

    // ── Professional Physical Materials (Matte Dark Cap, Satin Red Trim, White Cord) ─
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      roughness: 0.35,
      metalness: 0.15,
    });

    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0d,
      roughness: 0.5,
      metalness: 0.1,
    });

    const redAccentMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // Professional Crimson Red
      roughness: 0.25,
      metalness: 0.45,
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Crisp White
      roughness: 0.3,
      metalness: 0.1,
    });

    const metallicGoldMat = new THREE.MeshStandardMaterial({
      color: 0xd4a843,
      roughness: 0.2,
      metalness: 0.8,
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });

    const redLineMat = new THREE.LineBasicMaterial({
      color: 0xe11d48,
      transparent: true,
      opacity: 0.7,
    });

    // ── 1. HIGH-DETAIL MORTARBOARD TOP PLATE ────────────────────────────────────
    const plateSize = 2.7; // Large spacious plate
    const cornerRadius = 0.28;

    const plateShape = new THREE.Shape();
    plateShape.moveTo(-plateSize + cornerRadius, -plateSize);
    plateShape.lineTo(plateSize - cornerRadius, -plateSize);
    plateShape.quadraticCurveTo(plateSize, -plateSize, plateSize, -plateSize + cornerRadius);
    plateShape.lineTo(plateSize, plateSize - cornerRadius);
    plateShape.quadraticCurveTo(plateSize, plateSize, plateSize - cornerRadius, plateSize);
    plateShape.lineTo(-plateSize + cornerRadius, plateSize);
    plateShape.quadraticCurveTo(-plateSize, plateSize, -plateSize, plateSize - cornerRadius);
    plateShape.lineTo(-plateSize, -plateSize + cornerRadius);
    plateShape.quadraticCurveTo(-plateSize, -plateSize, -plateSize + cornerRadius, -plateSize);

    const extrudeSettings = {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.06,
      bevelThickness: 0.06,
    };

    const plateGeo = new THREE.ExtrudeGeometry(plateShape, extrudeSettings);
    plateGeo.rotateX(Math.PI / 2); // Make flat plate horizontal

    const mainPlate = new THREE.Mesh(plateGeo, capMat);
    capGroup.add(mainPlate);

    // Subtle Structural Wireframe Accent Overlay
    const plateWireGeo = new THREE.WireframeGeometry(plateGeo);
    const plateWire = new THREE.LineSegments(plateWireGeo, lineMat);
    capGroup.add(plateWire);

    // Inset Top Panel Surface (Grooved Inner Perimeter)
    const insetSize = 2.45;
    const insetShape = new THREE.Shape();
    insetShape.moveTo(-insetSize, -insetSize);
    insetShape.lineTo(insetSize, -insetSize);
    insetShape.lineTo(insetSize, insetSize);
    insetShape.lineTo(-insetSize, insetSize);
    insetShape.closePath();

    const insetGeo = new THREE.ShapeGeometry(insetShape);
    insetGeo.rotateX(Math.PI / 2);
    insetGeo.translate(0, 0.125, 0);

    const insetMesh = new THREE.Mesh(insetGeo, innerMat);
    capGroup.add(insetMesh);

    // Solid Crimson Red Outer Border Trim (Matching Ref Image Gold/Red Rim)
    const rimPoints = [
      new THREE.Vector3(-plateSize + 0.08, 0.12, -plateSize + 0.08),
      new THREE.Vector3(plateSize - 0.08, 0.12, -plateSize + 0.08),
      new THREE.Vector3(plateSize - 0.08, 0.12, plateSize - 0.08),
      new THREE.Vector3(-plateSize + 0.08, 0.12, plateSize - 0.08),
      new THREE.Vector3(-plateSize + 0.08, 0.12, -plateSize + 0.08),
    ];
    const rimGeo = new THREE.BufferGeometry().setFromPoints(rimPoints);
    const rimLine = new THREE.Line(rimGeo, redLineMat);
    capGroup.add(rimLine);

    // Corner Metallic Stud Rivets
    const corners = [
      [-plateSize + 0.3, plateSize - 0.3],
      [plateSize - 0.3, plateSize - 0.3],
      [plateSize - 0.3, -plateSize + 0.3],
      [-plateSize + 0.3, -plateSize + 0.3],
    ];

    corners.forEach(([cx, cz]) => {
      const studGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 12);
      studGeo.translate(cx, 0.13, cz);
      const stud = new THREE.Mesh(studGeo, redAccentMat);
      capGroup.add(stud);
    });

    // ── 2. DETAILED CROWN SKULL CAP (Multi-Paneled + Base Collar Band) ──────────
    const crownTopR = 1.85;
    const crownBottomR = 2.15;
    const crownHeight = 1.5;
    const crownSegments = 32;

    const crownGeo = new THREE.CylinderGeometry(crownTopR, crownRadiusBottom, crownHeight, crownSegments, 4);
    crownGeo.translate(0, -crownHeight / 2 - 0.1, 0);

    const crownMesh = new THREE.Mesh(crownGeo, capMat);
    capGroup.add(crownMesh);

    const crownWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(crownGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
    );
    capGroup.add(crownWire);

    // 8 Vertical Structural Seam Ribs around the Cap Skull
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const seamGeo = new THREE.BoxGeometry(0.04, crownHeight, 0.04);
      seamGeo.rotateY(angle);
      const rad = (crownTopR + crownBottomR) / 2;
      seamGeo.translate(Math.cos(angle) * rad, -crownHeight / 2 - 0.1, Math.sin(angle) * rad);
      const seamMesh = new THREE.Mesh(seamGeo, redAccentMat);
      capGroup.add(seamMesh);
    }

    // Double Accent Collar Band at Base of Cap (Ref Image Blue/Red Collar)
    const baseBandGeo1 = new THREE.TorusGeometry(crownBottomR + 0.03, 0.09, 16, 36);
    baseBandGeo1.rotateX(Math.PI / 2);
    baseBandGeo1.translate(0, -crownHeight - 0.1, 0);
    const baseBand1 = new THREE.Mesh(baseBandGeo1, redAccentMat);
    capGroup.add(baseBand1);

    const baseBandGeo2 = new THREE.TorusGeometry(crownBottomR + 0.05, 0.05, 12, 36);
    baseBandGeo2.rotateX(Math.PI / 2);
    baseBandGeo2.translate(0, -crownHeight - 0.22, 0);
    const baseBand2 = new THREE.Mesh(baseBandGeo2, whiteMat);
    capGroup.add(baseBand2);

    // ── 3. LAYERED CENTER BUTTON & FERRULE ──────────────────────────────────────
    // Ferrule Ring Base
    const ferruleGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.08, 20);
    ferruleGeo.translate(0, 0.16, 0);
    const ferruleMesh = new THREE.Mesh(ferruleGeo, metallicGoldMat);
    capGroup.add(ferruleMesh);

    // Center Dome Button
    const buttonGeo = new THREE.SphereGeometry(0.28, 24, 24);
    buttonGeo.translate(0, 0.26, 0);
    const buttonMesh = new THREE.Mesh(buttonGeo, redAccentMat);
    capGroup.add(buttonMesh);

    // ── 4. HIGH-DETAIL CURVED TASSEL CORD, BEADED COLLAR & BRUSH ───────────────
    // Smooth 3D Curved Cord Path (Starts from center button, lays over plate, drapes down)
    const tasselPoints = [
      new THREE.Vector3(0, 0.28, 0),
      new THREE.Vector3(0.7, 0.25, 0.7),
      new THREE.Vector3(1.9, 0.2, 1.9),
      new THREE.Vector3(2.55, 0.08, 2.3),
      new THREE.Vector3(2.7, -0.4, 2.3),
      new THREE.Vector3(2.7, -1.3, 2.2),
    ];
    const tasselCurve = new THREE.CatmullRomCurve3(tasselPoints);
    const cordTubeGeo = new THREE.TubeGeometry(tasselCurve, 50, 0.1, 14, false);
    const cordMesh = new THREE.Mesh(cordTubeGeo, whiteMat);
    capGroup.add(cordMesh);

    // Fine Cord Texture Overlay
    const cordWireGeo = new THREE.WireframeGeometry(cordTubeGeo);
    const cordWire = new THREE.LineSegments(cordWireGeo, redLineMat);
    capGroup.add(cordWire);

    // 3-Bead Neck Collar Ring Assembly (Matching Reference Image)
    const collarGroup = new THREE.Group();
    collarGroup.position.set(2.7, -1.45, 2.2);

    for (let b = 0; b < 3; b++) {
      const beadGeo = new THREE.TorusGeometry(0.15, 0.05, 12, 24);
      beadGeo.rotateX(Math.PI / 2);
      beadGeo.translate(0, -b * 0.1, 0);
      const beadMat = b % 2 === 0 ? redAccentMat : metallicGoldMat;
      const beadMesh = new THREE.Mesh(beadGeo, beadMat);
      collarGroup.add(beadMesh);
    }
    capGroup.add(collarGroup);

    // Flared Teardrop Tassel Brush (Golden/Red Tassel Tip from Reference Image)
    const brushShapePoints: THREE.Vector2[] = [];
    brushShapePoints.push(new THREE.Vector2(0.08, 0.0));
    brushShapePoints.push(new THREE.Vector2(0.25, -0.2));
    brushShapePoints.push(new THREE.Vector2(0.35, -0.5));
    brushShapePoints.push(new THREE.Vector2(0.28, -0.85));
    brushShapePoints.push(new THREE.Vector2(0.0, -1.0));

    const brushGeo = new THREE.LatheGeometry(brushShapePoints, 24);
    brushGeo.translate(2.7, -1.75, 2.2);

    const tasselBrush = new THREE.Mesh(brushGeo, redAccentMat);
    capGroup.add(tasselBrush);

    const brushWire = new THREE.LineSegments(
      new THREE.WireframeGeometry(brushGeo),
      new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.7, transparent: true })
    );
    capGroup.add(brushWire);

    // Individual Thread Definition Lines hanging from brush tip
    const threadPositions: number[] = [];
    const numThreads = 18;
    for (let i = 0; i < numThreads; i++) {
      const angle = (i / numThreads) * Math.PI * 2;
      const rx = Math.cos(angle) * 0.12;
      const rz = Math.sin(angle) * 0.12;
      threadPositions.push(2.7 + rx, -2.75, 2.2 + rz);
      threadPositions.push(2.7 + rx * 1.5, -3.1 - Math.random() * 0.3, 2.2 + rz * 1.5);
    }
    const threadGeo = new THREE.BufferGeometry();
    threadGeo.setAttribute("position", new THREE.Float32BufferAttribute(threadPositions, 3));
    const threadLines = new THREE.LineSegments(threadGeo, redLineMat);
    capGroup.add(threadLines);

    // Initial Rotation Angle (Matching Ref Image Perspective)
    capGroup.rotation.x = 0.42;
    capGroup.rotation.y = -0.38;

    // ── Animation Loop (Smooth Professional Rotation) ─────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation
      capGroup.rotation.y = -0.38 + elapsedTime * 0.32;
      capGroup.position.y = 0.2 + Math.sin(elapsedTime * 1.1) * 0.12; // Gentle float

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
    <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center pointer-events-none select-none overflow-visible">
      {/* WebGL Canvas — Clean studio view without blurry glows */}
      <div ref={mountRef} className="w-full h-full overflow-visible" />
    </div>
  );
}
