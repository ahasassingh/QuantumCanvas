from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

def run_simulation(circuit_data):
    try:
        num_qubits = circuit_data.get("qubits", 1)
        gates = circuit_data.get("gates", [])
        
        # Initialize circuit
        qc = QuantumCircuit(num_qubits)
        
        for gate in gates:
            gate_type = gate.get("type").upper()
            target = gate.get("target")
            control = gate.get("control")
            
            if gate_type == "H":
                qc.h(target)
            elif gate_type == "X":
                qc.x(target)
            elif gate_type == "Y":
                qc.y(target)
            elif gate_type == "Z":
                qc.z(target)
            elif gate_type == "CNOT" or gate_type == "CX":
                if control is not None:
                    qc.cx(control, target)
            elif gate_type == "SWAP":
                qc.swap(control, target)
            # Add more gates as needed
            
        # Get Statevector
        statevector = Statevector.from_instruction(qc)
        
        # Get Probabilities
        probs = statevector.probabilities_dict()
        
        # Format response
        statevector_list = [[float(c.real), float(c.imag)] for c in statevector.data]
        
        return {
            "success": True,
            "probabilities": probs,
            "statevector": statevector_list,
            "explanation": generate_explanation(circuit_data)
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def generate_explanation(circuit_data):
    gates = circuit_data.get("gates", [])
    if not gates:
        return "An empty circuit with no operations."
    
    explanation = []
    for gate in gates:
        g_type = gate.get("type").upper()
        target = gate.get("target")
        if g_type == "H":
            explanation.append(f"Hadamard gate on qubit {target} creates superposition.")
        elif g_type == "CNOT":
            explanation.append(f"CNOT gate entangles qubit {gate.get('control')} and {target}.")
        elif g_type == "X":
            explanation.append(f"Pauli-X gate flips qubit {target}.")
            
    return " ".join(explanation)
