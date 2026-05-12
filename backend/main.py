from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import os

from simulator import run_simulation

app = FastAPI(title="QuantumCanvas API")

# Enable CORS
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Gate(BaseModel):
    type: str
    target: int
    control: Optional[int] = None

class Circuit(BaseModel):
    qubits: int
    gates: List[Gate]

@app.get("/")
async def root():
    return {"message": "QuantumCanvas API is running"}

@app.post("/simulate")
async def simulate(circuit: Circuit):
    result = run_simulation(circuit.dict())
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@app.get("/algorithms")
async def get_algorithms():
    return [
        {
            "id": "bell-state",
            "name": "Bell State",
            "description": "The simplest example of entanglement.",
            "circuit": {
                "qubits": 2,
                "gates": [
                    {"type": "H", "target": 0},
                    {"type": "CNOT", "control": 0, "target": 1}
                ]
            }
        },
        {
            "id": "ghz-state",
            "name": "GHZ State",
            "description": "Three-qubit entanglement.",
            "circuit": {
                "qubits": 3,
                "gates": [
                    {"type": "H", "target": 0},
                    {"type": "CNOT", "control": 0, "target": 1},
                    {"type": "CNOT", "control": 1, "target": 2}
                ]
            }
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
