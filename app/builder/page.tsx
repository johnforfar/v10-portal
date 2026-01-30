"use client"

import React, { useState, useEffect, useRef } from "react"
import { Monitor, Cpu, Zap, ShieldCheck, FileCode, X, HardDrive, Share2, Terminal, Globe } from "lucide-react"

export default function BuilderPage() {
  const [mounted, setMounted] = useState(false)
  const [displayMode, setDisplayMode] = useState<'web' | 'vm'>('web')
  const [vmActive, setVmActive] = useState(false)
  const [nativeActive, setNativeActive] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showVmWarning, setShowVmWarning] = useState(false)
  const [showResetWarning, setShowResetWarning] = useState(false)
  const [sessionUuid, setSessionUuid] = useState<string | null>(null)
  const [manifest, setManifest] = useState<{ files: string[], updated?: string } | null>(null)
  const [lastManifestUpdate, setLastManifestUpdate] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
        const savedLogs = localStorage.getItem("v10_builder_logs");
        return savedLogs ? JSON.parse(savedLogs) : [
            "System: V10 Orchestrator initialized.",
            "Status: AI Builders online, awaiting user instructions..."
        ];
    }
    return [
        "System: V10 Orchestrator initialized.",
        "Status: AI Builders online, awaiting user instructions..."
    ];
  })
  const [aiderReady, setAiderReady] = useState(false)
  const [aiderMode, setAiderMode] = useState<'normal' | 'verbose'>('verbose')
  const logEndRef = useRef<HTMLDivElement>(null)

  // Persistence for Logs
  useEffect(() => {
    if (mounted) {
        localStorage.setItem("v10_builder_logs", JSON.stringify(logs));
    }
  }, [logs, mounted]);

  // Unified Service & Session Synchronization Monitor
  useEffect(() => {
    if (!mounted) return;

    const syncSessionAndServices = async () => {
      const isMac = /Mac/.test(navigator.userAgent);
      
      // Heartbeat for Aider (ttyd)
      try {
        const aRes = await fetch("http://localhost:3001", { mode: 'no-cors' });
        setAiderReady(true);
      } catch (e) {
        setAiderReady(false);
      }

      // 1. Dynamic Handshake: Priority Truth from Local Studio
      try {
        const sRes = await fetch("http://localhost:3005/session.json?t=" + Date.now(), {
            cache: 'no-store',
            mode: 'cors' // Ensure we get full response access
        });
        if (sRes.ok) {
            const sData = await sRes.json();
            if (sData.sessionUuid && sData.sessionUuid !== sessionUuid) {
                setSessionUuid(sData.sessionUuid);
                localStorage.setItem("v10_session_uuid", sData.sessionUuid);
                return;
            }
        }
      } catch (e) {
          // If server is down and we are on localhost, DON'T fall back to old UUIDs
          // This prevents stuck sessions during resets.
          if (window.location.hostname === 'localhost' && !sessionUuid) {
             setSessionUuid("synchronizing...");
          }
      }

      // 2. Heartbeat for VNC (Method 3)
      // MAC BYPASS: macOS chipset issues with MicroVMs mean Port 8502 is often inactive or 405.
      if (!isMac) {
        try {
          await fetch("http://localhost:8502", { mode: 'no-cors' });
          setVmActive(true);
        } catch (e) {
          setVmActive(false);
        }
      } else {
          // Force VM inactive on Mac to stop heartbeat noise
          if (vmActive) setVmActive(false);
      }

      // 3. Heartbeat for Native Display (Method 1)
      if (sessionUuid) {
        try {
          const mRes = await fetch(`http://localhost:3005/${sessionUuid}/manifest.json?t=${Date.now()}`, { cache: 'no-store' });
          if (mRes.ok) {
            const data = await mRes.json();
            setManifest(prev => (prev?.updated !== data.updated ? data : prev));
            setNativeActive(true);
          } else {
            setNativeActive(false);
          }
        } catch (e) {
          setNativeActive(false);
        }
      }
    }

    const timer = setInterval(syncSessionAndServices, 2000);
    syncSessionAndServices(); // Initial check
    return () => clearInterval(timer);
  }, [mounted, sessionUuid]);

  // Handle Mount Transition
  useEffect(() => {
    // SECURITY: On development host, clear stale cache to force handshake truth
    if (window.location.hostname === 'localhost') {
        localStorage.removeItem("v10_session_uuid");
        localStorage.removeItem("v10_ephemeral_uuid");
    }
    setMounted(true);
  }, [])

  const handleReset = async () => {
    localStorage.removeItem("v10_session_uuid");
    localStorage.removeItem("v10_ephemeral_uuid");
    
    // BACKEND HANDSHAKE: Force the local builder to generate a new UUID
    // This connects the 'Reset' button to the 'test-session-reset.sh' logic.
    try {
        await fetch("http://localhost:3005/reset", { method: 'POST', mode: 'cors' });
    } catch (e) {
        console.error("Studio reset handshake failed, performing local-only reset.");
    }
    
    window.location.reload();
  }

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  // Trigger iframe refresh only when manifest timestamp changes
  useEffect(() => {
    if (manifest?.updated && manifest.updated !== lastManifestUpdate) {
        setLastManifestUpdate(manifest.updated);
        // FORCE NATIVE ACTIVE: If manifest updated, we must be active
        if (!nativeActive) setNativeActive(true);
    }
  }, [manifest?.updated, nativeActive, lastManifestUpdate])

  return (
    <div className="flex flex-col h-screen bg-black relative">
      {/* Builder Header */}
      <div className="h-12 border-b border-white/5 flex items-center px-6 justify-between bg-[#1A1B1C]">
        <div className="flex items-center gap-3">
          <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Hardware Studio v10</span>
        </div>
        <div className="flex gap-4">
          {(nativeActive && sessionUuid && !sessionUuid.includes('synchronizing')) ? (
            <a
                href={`http://localhost:3005/${sessionUuid}/index.html?t=${Date.now()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1 rounded bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-all group animate-in fade-in zoom-in duration-300"
            >
                <Globe className="size-3 text-green-500 group-hover:rotate-12 transition-transform" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Direct Web View</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 opacity-40 cursor-not-allowed grayscale">
                <Globe className="size-3 text-white/40" />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Linking Hub...</span>
            </div>
          )}
          <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/5">
             <button
                onClick={() => setDisplayMode('web')}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${displayMode === 'web' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
             >
                Web View
             </button>
             <button
                onClick={() => {
                    if (displayMode !== 'vm') {
                        setShowVmWarning(true);
                    }
                }}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${displayMode === 'vm' ? 'bg-purple-600 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
             >
                MicroVM
             </button>
          </div>

          <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${vmActive || nativeActive ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-white/20 bg-white/5 border-white/10'}`}>
            {displayMode === 'vm' && vmActive ? 'Digital Twin Active' : displayMode === 'web' && nativeActive ? 'Live Preview Active' : 'Service Standby'}
          </div>

          <button
            onClick={() => setShowResetWarning(true)}
            className="flex items-center gap-2 px-3 py-1 rounded bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all group"
          >
            <X className="size-3 group-hover:rotate-90 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Reset App Build</span>
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Sandbox Terminal */}
        <div className="flex-1 relative border-r border-white/5 bg-black overflow-hidden">
          <div className="absolute top-3 left-6 z-10 flex items-center gap-4">
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">Conversational Forge</span>
            <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/10">
              <button 
                onClick={() => setAiderMode('normal')}
                className={`px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${aiderMode === 'normal' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
              >
                Normal
              </button>
              <button 
                onClick={() => setAiderMode('verbose')}
                className={`px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${aiderMode === 'verbose' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/20 hover:text-white/40'}`}
              >
                Verbose
              </button>
            </div>
          </div>
          <div className={`w-full h-full transition-all duration-500 ${aiderMode === 'normal' ? 'scale-[1.1] translate-y-[-12%]' : 'scale-100 translate-y-0'}`}>
          {aiderReady ? (
            <iframe 
              src="http://localhost:3001" 
              title="Aider Sandbox Terminal" 
              className={`w-full h-full border-none pt-12 transition-all duration-500`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-4 pt-8">
               <div className="relative">
                  <div className="size-12 rounded-lg border border-white/5 flex items-center justify-center bg-white/[0.02]">
                    <Terminal className="size-6 text-white/10 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 size-12 rounded-lg border-t-2 border-blue-500 animate-spin opacity-40" />
               </div>
               <div className="text-center">
                 <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Warming Engine</p>
                 <p className="text-[9px] text-white/10 mt-1">Initializing sovereign TTY bridge...</p>
               </div>
            </div>
          )}
          </div>
          {aiderMode === 'normal' && aiderReady && (
            <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-black via-black to-transparent pointer-events-none z-[5]" />
          )}
        </div>

        {/* Right Panel: MicroVM Preview */}
        <div className="w-[45%] relative bg-[#0A0A0A]">
          <div className="absolute top-3 left-6 z-10 flex items-center gap-2">
            <Monitor className="size-3 text-white/20" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono">
                {displayMode === 'vm' ? 'Real-Time Hardware Preview' : 'Web-Native Instant Preview'}
            </span>
          </div>
          
          <div className="w-full h-full flex flex-col items-center justify-center p-8">
             {displayMode === 'vm' && vmActive ? (
                <iframe
                    src="http://localhost:8502"
                    title="MicroVM Preview"
                    className="w-full h-full rounded-xl border border-white/10 shadow-2xl bg-black"
                />
             ) : displayMode === 'web' && nativeActive && mounted ? (
                <iframe
                    key={`${sessionUuid}-${lastManifestUpdate}`}
                    src={`http://localhost:3005/${sessionUuid}/index.html?t=${lastManifestUpdate}`}
                    title="Native App Preview"
                    className="w-full h-full rounded-xl border border-white/10 shadow-2xl bg-white"
                />
             ) : (
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="relative">
                            <div className="size-20 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
                                <Cpu className="size-10 text-white/10 animate-pulse" />
                            </div>
                            <div className="absolute inset-0 size-20 rounded-full border-t-2 border-blue-500 animate-spin opacity-40" />
                        </div>
                        
                        <div className="space-y-3">
                            <h3 className="text-white text-lg font-bold tracking-tight">Hardware Pipeline Standby</h3>
                            <p className="text-xs text-white/30 leading-relaxed italic max-w-[280px] mx-auto">
                                AI Builders online. Waiting for your first instruction to forge the Digital Twin.
                            </p>
                            
                            <div className="pt-6 flex flex-col items-center gap-2">
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Identity Matrix</span>
                                <div className="px-4 py-2 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-[11px] text-blue-400/80 shadow-inner">
                                    {sessionUuid || 'Allocating...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             )}
          </div>

          <div className="absolute bottom-6 right-6 flex gap-3">
             <button
                onClick={() => setShowLogs(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 hover:bg-black/60 transition-all group"
             >
                <Terminal className="size-3 text-white/20 group-hover:text-blue-400 transition-colors" />
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">NixOS Logs</span>
             </button>
             <button
                onClick={() => setShowFiles(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 transition-all group shadow-lg shadow-blue-500/5"
             >
                <FileCode className="size-3 text-blue-500" />
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Blueprint Assets</span>
             </button>
          </div>
        </div>
      </div>

      {/* Floating Action Menu (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#1A1B1C]/80 backdrop-blur-md border border-white/5 shadow-2xl z-50">
        <div className="flex items-center gap-2 px-3 py-1 border-r border-white/10">
          <div className="size-1.5 rounded-full bg-green-500" />
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Stack: Fully Open Source (Nixos + Ollama)</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1">
          <Zap className="size-3 text-yellow-500" />
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Host: Apple M1 (Silicon Native)</span>
        </div>
      </div>

      {/* Files Overlay */}
      {showFiles && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowFiles(false)} />
            <div className="relative w-full max-w-2xl bg-[#1A1B1C] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="h-14 border-b border-white/5 flex items-center px-8 justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <FileCode className="size-4 text-blue-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Blueprint Asset Manifest</span>
                    </div>
                    <button onClick={() => setShowFiles(false)} className="text-white/20 hover:text-white transition-colors">
                        <X className="size-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-2 gap-4">
                        {manifest?.files.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <FileCode className="size-4 text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium text-white/80">{file}</span>
                                    <span className="text-[9px] text-white/20 uppercase tracking-tighter">Nix Artifact</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* VM Warning Modal */}
      {showVmWarning && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowVmWarning(false)} />
            <div className="relative w-full max-w-md bg-[#1A1B1C] rounded-2xl border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-600" />
                <div className="p-8 text-center space-y-6">
                    <div className="size-16 rounded-2xl bg-purple-600/10 flex items-center justify-center mx-auto border border-purple-500/20">
                        <Cpu className="size-8 text-purple-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">Initialize MicroVM?</h3>
                        <p className="text-sm text-white/40 leading-relaxed">
                            This will boot a full NixOS kernel (Method 3) to validate your hardware blueprint. This consumes significant local resources.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowVmWarning(false)}
                            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                setDisplayMode('vm');
                                setShowVmWarning(false);
                                // Trigger backend boot
                                try {
                                    await fetch("http://localhost:3005/boot-vm", { method: 'POST' });
                                } catch (e) {}
                            }}
                            className="flex-1 px-4 py-2 rounded-xl bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition-all shadow-lg shadow-purple-900/20"
                        >
                            Boot Twin
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Reset Warning Modal */}
      {showResetWarning && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowResetWarning(false)} />
            <div className="relative w-full max-w-md bg-[#1A1B1C] rounded-2xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
                <div className="p-8 text-center space-y-6">
                    <div className="size-16 rounded-2xl bg-red-600/10 flex items-center justify-center mx-auto border border-red-500/20">
                        <X className="size-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-white tracking-tight">Reset Workspace?</h3>
                        <p className="text-sm text-white/40 leading-relaxed">
                            This will clear your local project history and current session. Your progress will be **permanently deleted** unless you have connected your wallet and saved your work.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowResetWarning(false)}
                            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white/60 hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                        >
                            Reset Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowLogs(false)} />
            <div className="relative w-full max-w-2xl bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[60vh]">
                <div className="h-14 border-b border-white/5 flex items-center px-8 justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <Terminal className="size-4 text-blue-500" />
                        <span className="text-xs font-bold text-white uppercase tracking-widest">System Event Stream</span>
                    </div>
                    <button onClick={() => setShowLogs(false)} className="text-white/20 hover:text-white transition-colors">
                        <X className="size-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-2">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 border-b border-white/[0.02] pb-2">
                            <span className="text-white/20 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                            <span className={log.includes('Error') ? 'text-red-400' : 'text-white/60'}>{log}</span>
                        </div>
                    ))}
                    <div ref={logEndRef} />
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
