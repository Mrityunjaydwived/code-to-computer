import React from 'react';
import { Compass, Smartphone, Gamepad2, ArrowRight, CheckCircle2, Server, Database, Monitor, Cpu } from 'lucide-react';
import { useExecutionStore } from '../../store/executionStore';

export const RealWorldView: React.FC = () => {
  const { selectedRealWorldScenario, setSelectedRealWorldScenario } = useExecutionStore();

  const appSteps = [
    { title: '1. OS Fork & Exec', desc: 'OS kernel spawns process, loads ELF executable from flash storage into virtual memory.', icon: Cpu },
    { title: '2. Dynamic Linker & Memory', desc: 'Shared libraries (libc, UI frameworks) loaded; BSS, Data, Stack, and Heap mapped.', icon: Monitor },
    { title: '3. Main Thread Event Loop', desc: 'Main thread initializes runtime, inflates UI views, and binds interaction handlers.', icon: Smartphone },
    { title: '4. TLS / HTTPS Handshake', desc: 'Socket connection opened to backend API cluster; TLS 1.3 cryptographic session established.', icon: Server },
    { title: '5. DB Query & Cache', desc: 'Server queries distributed Redis cache & PostgreSQL DB, returning JSON feed to client.', icon: Database },
    { title: '6. GPU Composition & Render', desc: 'Client parses feed, downloads images into GPU VRAM textures, and renders at 120 FPS.', icon: Monitor },
  ];

  const gameSteps = [
    { title: '1. Binary Launch & Driver Init', desc: 'Executable loads DirectX / Vulkan driver hooks and checks hardware feature levels.', icon: Cpu },
    { title: '2. Asset Decompression', desc: 'Compressed 3D meshes, textures, and audio streams streamed from NVMe SSD into RAM.', icon: Server },
    { title: '3. Shader Compilation', desc: 'High-Level Shading Language (HLSL) compiled by GPU driver into hardware microcode.', icon: Monitor },
    { title: '4. VRAM Texture Upload', desc: 'Mipmapped PBR textures and vertex index buffers copied over PCIe Gen 4 bus into VRAM.', icon: Database },
    { title: '5. Game Loop Tick', desc: 'Physics step computed on CPU, skeletal animation matrices sent to GPU vertex shaders.', icon: Gamepad2 },
    { title: '6. Rasterization & Post-Processing', desc: 'Geometry rasterized, ray-traced reflections blended, and double-buffer swapped to display.', icon: Monitor },
  ];

  const steps = selectedRealWorldScenario === 'app' ? appSteps : gameSteps;

  return (
    <div className="bg-white border border-[#E0E0E0] rounded-xl p-4 shadow-sm flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E0E0E0] pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-[#2874F0]" />
          <div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              Real-World Systems Architecture Walkthrough
            </h2>
            <span className="text-[10px] text-[#666666] font-mono">
              See what happens inside modern operating systems & distributed hardware
            </span>
          </div>
        </div>

        {/* Scenario Toggle */}
        <div className="flex items-center bg-[#F1F3F6] border border-[#E0E0E0] rounded-lg p-0.5 text-xs font-mono overflow-x-auto touch-pan-x max-w-full">
          <button
            onClick={() => setSelectedRealWorldScenario('app')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              selectedRealWorldScenario === 'app'
                ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Opening An App (e.g. Flipkart)</span>
          </button>

          <button
            onClick={() => setSelectedRealWorldScenario('game')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
              selectedRealWorldScenario === 'game'
                ? 'bg-[#2874F0] text-white font-bold shadow-xs'
                : 'text-[#666666] hover:text-[#212121]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Launching A 3D Game Engine</span>
          </button>
        </div>
      </div>

      {/* Scenario Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white border border-[#E0E0E0] hover:border-[#2874F0] flex flex-col justify-between gap-2 shadow-xs transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] border border-[#B3D4FC] flex items-center justify-center text-[#2874F0] group-hover:bg-[#2874F0] group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-[#878787]">Stage #{idx + 1}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#212121] mb-1">{st.title}</h4>
                <p className="text-[11px] text-[#666666] leading-relaxed">{st.desc}</p>
              </div>

              <div className="pt-2 border-t border-[#E0E0E0] flex items-center justify-between text-[10px] font-mono text-[#878787]">
                <span className="text-[#388E3C] font-semibold">Validated</span>
                <span>Latency: &lt; 15 ms</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
