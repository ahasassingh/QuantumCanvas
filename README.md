# ⚛️ QuantumCanvas

QuantumCanvas is a modern, high-performance web-based quantum circuit visualizer and simulator. It combines an intuitive drag-and-drop interface with powerful backend simulations to make quantum computing accessible and visually stunning.

## 🚀 Features

- **Drag-and-Drop Circuit Builder**: Build complex quantum circuits with ease.
- **Real-time 3D State Visualization**: Visualize quantum states on the Bloch Sphere using Three.js.
- **High-Performance Simulations**: Backend powered by FastAPI and Qiskit for accurate quantum gate executions.
- **Futuristic UI**: A premium, dark-themed interface designed for the next generation of quantum developers.
- **Probability Analysis**: Real-time probability distributions for circuit outcomes.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **3D Rendering**: Three.js / React Three Fiber
- **Components**: Radix UI / Shadcn UI

### Backend
- **Framework**: FastAPI (Python)
- **Quantum Logic**: IBM Qiskit
- **Simulation**: NumPy / SciPy

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ahasassingh/QuantumCanvas.git
   cd QuantumCanvas
   ```

2. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Setup Backend**:
   ```bash
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

## 🎨 Aesthetic
QuantumCanvas follows a "Cyber-Quantum" design language, featuring deep blacks, neon accents, and glassmorphism effects to evoke the feeling of working on a futuristic quantum console.

---
Built with ❤️ by Antigravity