"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Save, Share2, Plus, Trash2, Info, ChevronRight, LayoutDashboard, Cpu, Activity, Info as InfoIcon, Terminal, BarChart3, Globe } from "lucide-react";
import CircuitCanvas from "@/components/CircuitCanvas";
import BlochSphere from "@/components/BlochSphere";
import { CircuitData, GateType } from "@/types/quantum";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Workspace() {
  const [activeTab, setActiveTab] = useState("results");
  const [circuit, setCircuit] = useState<CircuitData>({
    qubits: 3,
    steps: 10,
    gates: []
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<string>("");

  const addQubit = () => {
    if (circuit.qubits < 10) {
      setCircuit({ ...circuit, qubits: circuit.qubits + 1 });
    }
  };

  const removeQubit = () => {
    if (circuit.qubits > 1) {
      // Remove any gates that were on the last qubit
      const newGates = circuit.gates.filter(g => g.target < circuit.qubits - 1 && (g.control === undefined || g.control < circuit.qubits - 1));
      setCircuit({ ...circuit, qubits: circuit.qubits - 1, gates: newGates });
    }
  };

  const resetCircuit = () => {
    setCircuit({ ...circuit, gates: [] });
    setResults(null);
    setExplanation("");
  };

  const runSimulation = async () => {
    setLoading(true);
    setActiveTab("results");
    try {
      // Format circuit for backend
      const backendCircuit = {
        qubits: circuit.qubits,
        gates: circuit.gates.map(g => ({
          type: g.type,
          target: g.target,
          control: g.control
        }))
      };

      const response = await fetch(`${API_URL}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendCircuit)
      });
      
      const data = await response.json();
      setResults(data);
      setExplanation(data.explanation || "Simulation complete.");
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDragStart = (e: React.DragEvent, gateType: GateType) => {
    e.dataTransfer.setData("gateType", gateType);
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground scanline">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/30 px-6 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 neon-border">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight neon-text">QuantumCanvas</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Interactive Circuit Visualizer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={resetCircuit}
            className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2 text-sm font-medium transition-all hover:bg-secondary border border-border/50"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button 
            onClick={runSimulation}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
                <Play className="h-4 w-4 fill-current" />
            )}
            Run Simulation
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Gate Palette */}
        <aside className="w-64 border-r border-border/50 bg-card/20 p-4 backdrop-blur-sm z-10">
          <div className="mb-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Single Qubit Gates</h2>
            <div className="grid grid-cols-2 gap-3">
              {["H", "X", "Y", "Z"].map((gate) => (
                <div
                  key={gate}
                  draggable
                  onDragStart={(e) => onDragStart(e, gate as GateType)}
                  className="flex h-14 cursor-grab items-center justify-center rounded-xl border border-border/50 bg-secondary/30 text-lg font-bold transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:cursor-grabbing hover:shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                >
                  {gate}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Multi Qubit Gates</h2>
            <div className="grid grid-cols-1 gap-3">
              {["CNOT", "SWAP"].map((gate) => (
                <div
                  key={gate}
                  draggable
                  onDragStart={(e) => onDragStart(e, gate as GateType)}
                  className="flex h-14 cursor-grab items-center justify-center rounded-xl border border-border/50 bg-secondary/30 text-lg font-bold transition-all hover:border-accent/50 hover:bg-accent/5 hover:text-accent active:cursor-grabbing hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                >
                  {gate}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-auto pt-6 border-t border-border/30 space-y-3">
            <button 
              onClick={addQubit}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 p-3 text-xs font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="h-4 w-4" /> Add Qubit
            </button>
            <button 
              onClick={removeQubit}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 p-3 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" /> Remove Qubit
            </button>
          </div>
        </aside>

        {/* Center Canvas - Circuit Grid */}
        <section className="relative flex-1 overflow-auto circuit-grid bg-[#030303]">
           <div className="min-w-fit min-h-full">
              <CircuitCanvas circuit={circuit} onUpdate={setCircuit} />
           </div>
           
           <div className="absolute top-6 right-6 flex gap-3 pointer-events-none z-10">
              <div className="glass px-3 py-1.5 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-primary"></div> Steps: {circuit.steps}
              </div>
              <div className="glass px-3 py-1.5 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                 <div className="h-1 w-1 rounded-full bg-accent"></div> Qubits: {circuit.qubits}
              </div>
           </div>
        </section>

        {/* Right Sidebar - Results & AI */}
        <aside className="w-80 border-l border-border/50 bg-card/20 backdrop-blur-md overflow-y-auto">
          <div className="flex h-12 items-center border-b border-border/50 px-2 sticky top-0 bg-card/80 backdrop-blur-md z-10">
             {["results", "ai"].map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={`flex-1 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                   activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                 }`}
               >
                 {tab}
                 {activeTab === tab && (
                   <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_rgba(124,58,237,0.5)]" />
                 )}
               </button>
             ))}
          </div>
          
          <div className="p-5 space-y-8">
             {activeTab === "results" ? (
               <>
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
                      <BarChart3 className="h-4 w-4" /> Probabilities
                    </h3>
                    <div className="min-h-[200px] rounded-2xl border border-border/50 bg-secondary/20 p-4 relative overflow-hidden group">
                       {results?.probabilities ? (
                         <div className="space-y-3">
                            {Object.entries(results.probabilities).map(([state, prob]: [string, any]) => (
                              <div key={state} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-mono">
                                  <span>|{state}⟩</span>
                                  <span className="text-accent">{(prob * 100).toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${prob * 100}%` }}
                                     className="h-full bg-gradient-to-r from-accent/50 to-accent shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                                   />
                                </div>
                              </div>
                            ))}
                         </div>
                       ) : (
                         <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center">
                            <Activity className="h-8 w-8 text-muted-foreground/30 mb-2" />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">No simulation data</p>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                      <Globe className="h-4 w-4" /> Bloch Sphere
                    </h3>
                    <div className="aspect-square rounded-2xl border border-border/50 bg-secondary/20 flex flex-col items-center justify-center text-center overflow-hidden">
                       <BlochSphere statevector={results?.statevector} />
                    </div>
                  </div>
               </>
             ) : (
               <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                      <Terminal className="h-4 w-4" /> AI Explanation
                    </h3>
                    <div className="rounded-2xl border border-border/50 bg-primary/5 p-4 min-h-[150px]">
                      {explanation ? (
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                          "{explanation}"
                        </p>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center opacity-30">
                           <InfoIcon className="h-8 w-8 mb-2" />
                           <p className="text-[10px] uppercase tracking-widest">Awaiting Simulation</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-border/50 bg-secondary/10 p-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Quantum Tip</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      The Hadamard gate (H) is essential for creating superposition, allowing a qubit to be in both |0⟩ and |1⟩ states simultaneously.
                    </p>
                  </div>
               </div>
             )}
          </div>
        </aside>
      </main>

      {/* Footer / Status Bar */}
      <footer className="flex h-8 items-center justify-between border-t border-border/50 bg-card/50 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 z-20">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <div className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"}`}></div> 
            {loading ? "Processing..." : "System Active"}
          </span>
          <span className="opacity-50">Local Backend: 8000</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-primary transition-colors cursor-help">Documentation</span>
          <span className="opacity-30">|</span>
          <span>Build: 2026.05.12</span>
        </div>
      </footer>
    </div>
  );
}
