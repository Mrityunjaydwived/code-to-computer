import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3d } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const Architecture3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { snapshots, currentStepIndex } = useExecutionStore();
  const currentSnapshot = snapshots[currentStepIndex];
  const busActivity = currentSnapshot?.busActivity;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 450;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF1F3F6); // Flipkart background #F1F3F6

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 18, 26);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(10, 25, 15);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x2874F0, 2, 40);
    blueLight.position.set(-6, 6, 0);
    scene.add(blueLight);

    // 4. Motherboard / PCB Base (Deep Blue #1F74BA)
    const pcbGeo = new THREE.BoxGeometry(28, 0.6, 20);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x1F74BA,
      roughness: 0.4,
      metalness: 0.6,
    });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    pcb.position.y = -0.3;
    scene.add(pcb);

    // Grid Traces on PCB
    const grid = new THREE.GridHelper(26, 26, 0x2874F0, 0x90CAF9);
    grid.position.y = 0.01;
    scene.add(grid);

    // 5. CPU Socket & Heat Spreader / Die
    const cpuGroup = new THREE.Group();
    const cpuBaseGeo = new THREE.BoxGeometry(8, 0.8, 8);
    const cpuBaseMat = new THREE.MeshStandardMaterial({
      color: 0xE0E0E0,
      metalness: 0.9,
      roughness: 0.2,
    });
    const cpuBase = new THREE.Mesh(cpuBaseGeo, cpuBaseMat);
    cpuBase.position.set(-6, 0.4, 0);
    cpuGroup.add(cpuBase);

    // CPU Die / Core (Flipkart Blue #2874F0)
    const dieGeo = new THREE.BoxGeometry(5, 0.4, 5);
    const dieMat = new THREE.MeshStandardMaterial({
      color: 0x2874F0,
      emissive: 0x2874F0,
      emissiveIntensity: 0.6,
      metalness: 0.6,
      roughness: 0.2,
    });
    const die = new THREE.Mesh(dieGeo, dieMat);
    die.position.set(-6, 0.9, 0);
    cpuGroup.add(die);
    scene.add(cpuGroup);

    // 6. L1/L2 Cache Banks (Green #388E3C)
    const cacheGeo = new THREE.BoxGeometry(2.5, 0.6, 5);
    const cacheMat = new THREE.MeshStandardMaterial({
      color: 0x388E3C,
      emissive: 0x388E3C,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.2,
    });
    const cacheMesh = new THREE.Mesh(cacheGeo, cacheMat);
    cacheMesh.position.set(-0.5, 0.4, 0);
    scene.add(cacheMesh);

    // 7. RAM DIMM Modules (Right side)
    const ramGroup = new THREE.Group();
    for (let r = 0; r < 2; r++) {
      const dimmGeo = new THREE.BoxGeometry(1.2, 2.5, 10);
      const dimmMat = new THREE.MeshStandardMaterial({
        color: 0x212121,
        metalness: 0.8,
        roughness: 0.3,
      });
      const dimm = new THREE.Mesh(dimmGeo, dimmMat);
      dimm.position.set(6 + r * 3, 1.25, 0);
      ramGroup.add(dimm);

      // RAM memory IC chips
      for (let c = -3; c <= 3; c += 2) {
        const icGeo = new THREE.BoxGeometry(1.3, 0.8, 1.2);
        const icMat = new THREE.MeshStandardMaterial({
          color: 0x2874F0,
          emissive: 0x2874F0,
          emissiveIntensity: 0.4,
        });
        const ic = new THREE.Mesh(icGeo, icMat);
        ic.position.set(6 + r * 3, 1.25, c);
        ramGroup.add(ic);
      }
    }
    scene.add(ramGroup);

    // 8. Data Highway Bus Tracks
    const busLineGeo = new THREE.BoxGeometry(16, 0.1, 1.2);
    const busLineMat = new THREE.MeshStandardMaterial({
      color: 0x2874F0,
      emissive: 0x1F74BA,
      emissiveIntensity: 0.8,
    });
    const busLine = new THREE.Mesh(busLineGeo, busLineMat);
    busLine.position.set(0, 0.05, 0);
    scene.add(busLine);

    // 9. Moving Data Packet Particles (Flipkart Orange #FF9F00 / #F09120)
    const particleCount = 8;
    const particles: THREE.Mesh[] = [];
    const packetGeo = new THREE.SphereGeometry(0.3, 12, 12);
    const packetMat = new THREE.MeshStandardMaterial({
      color: 0xFF9F00,
      emissive: 0xF09120,
      emissiveIntensity: 1.5,
    });

    for (let p = 0; p < particleCount; p++) {
      const packet = new THREE.Mesh(packetGeo, packetMat);
      packet.position.set(-7 + (p / particleCount) * 15, 0.3, 0);
      scene.add(packet);
      particles.push(packet);
    }

    // Orbit controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = 0;
    let rotX = 0.6;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      rotY += deltaX * 0.008;
      rotX = Math.max(0.1, Math.min(1.2, rotX + deltaY * 0.008));

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(12, Math.min(45, camera.position.z + e.deltaY * 0.02));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      camera.position.x = Math.sin(rotY) * 28;
      camera.position.z = Math.cos(rotY) * 28;
      camera.position.y = rotX * 22;
      camera.lookAt(0, 0, 0);

      // Animate packet particles along bus
      particles.forEach((pkt, idx) => {
        const offset = (elapsedTime * 3 + idx * 2) % 16;
        pkt.position.x = -8 + offset;
        pkt.position.y = 0.3 + Math.sin(elapsedTime * 6 + idx) * 0.05;
      });

      dieMat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 4) * 0.2;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white border border-[#E0E0E0] rounded-xl overflow-hidden shadow-sm relative font-sans">
      {/* 3D Viewport Controls Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E0E0E0] text-xs font-mono text-[#212121] shadow-xs">
        <Rotate3d className="w-4 h-4 text-[#2874F0]" />
        <span className="font-bold">3D Silicon Architecture View</span>
        <span className="text-[10px] text-[#878787] hidden sm:inline">| Drag to rotate • Scroll to zoom</span>
      </div>

      {/* Component Quick Legend */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/95 border border-[#E0E0E0] text-[#2874F0] font-bold shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2874F0] inline-block shadow-xs" />
          <span>CPU Core</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/95 border border-[#E0E0E0] text-[#388E3C] font-bold shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#388E3C] inline-block shadow-xs" />
          <span>L1/L2 Cache</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/95 border border-[#E0E0E0] text-[#F09120] font-bold shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F00] inline-block shadow-xs" />
          <span>Bus Packets</span>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full min-h-[420px] cursor-grab active:cursor-grabbing bg-[#F1F3F6]" />

      {/* Bottom Live Hardware Bus Telemetry */}
      <div className="h-10 bg-white border-t border-[#E0E0E0] px-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-[#666666]">
          <span className="w-2 h-2 rounded-full bg-[#388E3C] animate-ping" />
          <span>Clock Frequency: 3.8 GHz</span>
          <span className="text-[#BDBDBD]">•</span>
          <span>Silicon Node: 4nm FinFET</span>
        </div>
        <div className="text-[#2874F0] font-bold">
          {busActivity?.active ? `Bus Traffic: ${busActivity.label}` : 'Bus Idle: Ready'}
        </div>
      </div>
    </div>
  );
};
