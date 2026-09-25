import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const StudyVisualizer3D = ({ timerState = 'idle', timerType = 'pomodoro', isRunning = false }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    currentMount.appendChild(renderer.domElement);

    // 3. Central Focus Crystal (Composite 3D Object)
    const crystalGroup = new THREE.Group();
    scene.add(crystalGroup);

    // Outer Crystal (Icosahedron with glass-like shimmer)
    const outerGeo = new THREE.IcosahedronGeometry(1.6, 0);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      emissive: 0x312e81,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.85,
      ior: 1.5,
      transparent: true,
      opacity: 0.88,
      wireframe: false,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    crystalGroup.add(outerMesh);

    // Glowing Wireframe Overlay
    const wireframeGeo = new THREE.WireframeGeometry(outerGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: 0xa5b4fc,
      transparent: true,
      opacity: 0.5,
      linewidth: 1.5,
    });
    const wireframeLines = new THREE.LineSegments(wireframeGeo, wireframeMat);
    crystalGroup.add(wireframeLines);

    // Inner Glowing Core (Octahedron)
    const innerGeo = new THREE.OctahedronGeometry(0.8, 0);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      wireframe: true,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    crystalGroup.add(innerMesh);

    // 4. Gyroscopic Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.4, 0.025, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.7, 0.02, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    scene.add(ring2);

    // 5. Ambient Starfield / Particle Cloud
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color('#818cf8'), // Indigo
      new THREE.Color('#38bdf8'), // Cyan
      new THREE.Color('#c084fc'), // Purple
      new THREE.Color('#34d399'), // Mint
    ];

    for (let i = 0; i < particleCount; i++) {
      const radius = 3.5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x818cf8, 3, 20);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2.5, 20);
    pointLight2.position.set(-5, -4, 4);
    scene.add(pointLight2);

    // 7. Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e) => {
      const rect = currentMount.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.4;
      mouseY = y * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      // Adjust dynamics based on timer state
      let speedMultiplier = 1;
      if (isRunning && timerType === 'pomodoro') {
        speedMultiplier = 2.2;
      } else if (timerType === 'short-break' || timerType === 'long-break') {
        speedMultiplier = 0.6;
      }

      // Crystal rotation & floating wave
      crystalGroup.rotation.y += 0.008 * speedMultiplier;
      crystalGroup.rotation.x = Math.sin(elapsedTime * 0.6 * speedMultiplier) * 0.15 + targetY;
      crystalGroup.rotation.z = Math.cos(elapsedTime * 0.4 * speedMultiplier) * 0.1 + targetX;
      crystalGroup.position.y = Math.sin(elapsedTime * 1.2 * speedMultiplier) * 0.2;

      // Inner core counter-rotation
      innerMesh.rotation.y -= 0.02 * speedMultiplier;
      innerMesh.rotation.x -= 0.015 * speedMultiplier;

      // Ring rotations
      ring1.rotation.z += 0.006 * speedMultiplier;
      ring1.rotation.y += 0.004 * speedMultiplier;
      ring2.rotation.z -= 0.005 * speedMultiplier;
      ring2.rotation.x += 0.003 * speedMultiplier;

      // Particle subtle orbit
      particles.rotation.y = elapsedTime * 0.03 * speedMultiplier;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

      // Color shifts based on mode
      if (timerType === 'short-break' || timerType === 'long-break') {
        outerMat.color.lerp(new THREE.Color(0x10b981), 0.05); // Calming Emerald
        outerMat.emissive.lerp(new THREE.Color(0x064e3b), 0.05);
        innerMat.color.lerp(new THREE.Color(0x34d399), 0.05);
        pointLight1.color.lerp(new THREE.Color(0x10b981), 0.05);
      } else if (isRunning) {
        outerMat.color.lerp(new THREE.Color(0x6366f1), 0.05); // Laser Indigo
        outerMat.emissive.lerp(new THREE.Color(0x4338ca), 0.05);
        innerMat.color.lerp(new THREE.Color(0xa855f7), 0.05); // Radiant Purple
        pointLight1.color.lerp(new THREE.Color(0xc084fc), 0.05);
      } else {
        outerMat.color.lerp(new THREE.Color(0x3b82f6), 0.05); // Calm Blue
        outerMat.emissive.lerp(new THREE.Color(0x1e3a8a), 0.05);
        innerMat.color.lerp(new THREE.Color(0x38bdf8), 0.05);
        pointLight1.color.lerp(new THREE.Color(0x818cf8), 0.05);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }

      // Dispose geometries and materials
      outerGeo.dispose();
      outerMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [timerState, timerType, isRunning]);

  return (
    <div className="relative w-full h-full min-h-[320px] md:min-h-[420px] flex items-center justify-center overflow-hidden">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Mode Overlay Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300">
        <span
          className={`w-2 h-2 rounded-full ${
            isRunning
              ? 'bg-emerald-400 animate-ping'
              : timerType.includes('break')
              ? 'bg-teal-400'
              : 'bg-indigo-400'
          }`}
        />
        <span className="capitalize">
          {isRunning ? `Focusing: ${timerType}` : `Ready: ${timerType}`}
        </span>
      </div>

      {/* Floating 3D Interaction Tip */}
      <div className="absolute bottom-3 right-4 z-10 text-[11px] text-slate-500 font-mono tracking-wider bg-slate-950/40 px-2.5 py-1 rounded-md border border-white/5 pointer-events-none">
        3D Core • Drag / Move Cursor
      </div>
    </div>
  );
};
