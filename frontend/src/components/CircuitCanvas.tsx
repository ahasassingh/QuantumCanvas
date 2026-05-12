"use client";

import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Gate, CircuitData, GateType } from "@/types/quantum";
import { Trash2 } from "lucide-react";

interface CircuitCanvasProps {
  circuit: CircuitData;
  onUpdate: (circuit: CircuitData) => void;
}

export default function CircuitCanvas({ circuit, onUpdate }: CircuitCanvasProps) {
  const [hoveredCell, setHoveredCell] = useState<{ qubit: number; step: number } | null>(null);

  const handleDrop = (e: React.DragEvent, qubit: number, step: number) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData("gateType") as GateType;
    if (!gateType) return;

    const newGate: Gate = {
      id: Math.random().toString(36).substr(2, 9),
      type: gateType,
      target: qubit,
      position: { qubit, step },
    };

    // Handle CNOT/SWAP (needs control/target)
    if (gateType === "CNOT" || gateType === "SWAP") {
        newGate.control = qubit > 0 ? qubit - 1 : qubit + 1;
    }

    // Check if cell is occupied
    const filteredGates = circuit.gates.filter(
      (g) => !(g.position.qubit === qubit && g.position.step === step)
    );

    onUpdate({
      ...circuit,
      gates: [...filteredGates, newGate],
    });
  };

  const removeGate = (id: string) => {
    onUpdate({
      ...circuit,
      gates: circuit.gates.filter((g) => g.id !== id),
    });
  };

  return (
    <div className="relative flex flex-col gap-12 p-10 pl-24 select-none">
      {/* Qubit Wires */}
      {Array.from({ length: circuit.qubits }).map((_, qIdx) => (
        <div key={qIdx} className="relative flex items-center h-16 group">
          {/* Qubit Label */}
          <div className="absolute -left-16 flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 text-xs font-bold text-primary neon-text">
            q{qIdx}
          </div>

          
          {/* Wire */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 shadow-[0_0_10px_rgba(124,58,237,0.2)]"></div>

          {/* Grid Cells */}
          <div className="flex w-full ml-4">
            {Array.from({ length: circuit.steps }).map((_, sIdx) => {
              const gate = circuit.gates.find(
                (g) => g.position.qubit === qIdx && g.position.step === sIdx
              );

              return (
                <div
                  key={`${qIdx}-${sIdx}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setHoveredCell({ qubit: qIdx, step: sIdx });
                  }}
                  onDragLeave={() => setHoveredCell(null)}
                  onDrop={(e) => handleDrop(e, qIdx, sIdx)}
                  className={`relative flex h-16 w-16 items-center justify-center border-l border-transparent transition-all ${
                    hoveredCell?.qubit === qIdx && hoveredCell?.step === sIdx ? "bg-primary/10 border-primary/30" : ""
                  }`}
                >
                  {gate && (
                    <motion.div
                      layoutId={gate.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`z-10 flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border text-sm font-bold shadow-lg transition-all hover:scale-110 active:scale-95 ${
                        gate.type === "CNOT" || gate.type === "SWAP" 
                        ? "border-accent bg-accent/20 text-accent neon-border" 
                        : "border-primary bg-primary/20 text-primary neon-border"
                      }`}
                    >
                      {gate.type}
                      <button 
                        onClick={() => removeGate(gate.id)}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[8px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </motion.div>
                  )}
                  
                  {/* Multi-qubit connection lines */}
                  {gate && (gate.type === "CNOT" || gate.type === "SWAP") && gate.control !== undefined && (
                      <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[2px] bg-accent/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                        style={{ 
                            height: `${Math.abs(gate.control - qIdx) * 64}px`,
                            transform: `translate(-50%, ${gate.control > qIdx ? "0" : "-100%"})`
                        }}
                      >
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent"></div>
                      </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
