export type GateType = "H" | "X" | "Y" | "Z" | "CNOT" | "SWAP";

export interface Gate {
  id: string;
  type: GateType;
  target: number;
  control?: number;
  position: {
    qubit: number;
    step: number;
  };
}

export interface CircuitData {
  qubits: number;
  steps: number;
  gates: Gate[];
}
