"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html, Float } from "@react-three/drei";
import * as THREE from "three";

interface BlochSphereProps {
  statevector?: number[][]; // List of [real, imag] pairs
  qubitIndex?: number;
}

function SphereContent({ statevector, qubitIndex = 0 }: BlochSphereProps) {
  const vectorRef = useRef<THREE.Group>(null);

  // Calculate position on sphere from statevector
  // alpha|0> + beta|1>
  // |psi> = cos(theta/2)|0> + e^(i*phi)sin(theta/2)|1>
  const vector = useMemo(() => {
    if (!statevector || statevector.length < 2) return new THREE.Vector3(0, 1, 0);
    
    // For simplicity, we handle the first qubit or a single qubit state
    // statevector format from backend is [ [r0, i0], [r1, i1], ... ]
    const alpha_r = statevector[0][0];
    const alpha_i = statevector[0][1];
    const beta_r = statevector[1][0];
    const beta_i = statevector[1][1];

    const alpha = new THREE.Vector2(alpha_r, alpha_i);
    const beta = new THREE.Vector2(beta_r, beta_i);

    // Calculate Bloch coordinates
    // x = 2 * Re(alpha_conj * beta)
    // y = 2 * Im(alpha_conj * beta)
    // z = |alpha|^2 - |beta|^2
    
    const x = 2 * (alpha_r * beta_r + alpha_i * beta_i);
    const y = 2 * (alpha_r * beta_i - alpha_i * beta_r);
    const z = (alpha_r**2 + alpha_i**2) - (beta_r**2 + beta_i**2);

    return new THREE.Vector3(x, z, y).normalize(); // Swapping y and z for Three.js coords
  }, [statevector]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <group>
          {/* Main Sphere */}
          <Sphere args={[1, 32, 32]}>
            <meshStandardMaterial 
              color="#7c3aed" 
              transparent 
              opacity={0.1} 
              wireframe 
            />
          </Sphere>

          {/* Axes */}
          <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="#ffffff" opacity={0.3} transparent lineWidth={1} />
          <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#ffffff" opacity={0.3} transparent lineWidth={1} />
          <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="#ffffff" opacity={0.3} transparent lineWidth={1} />

          {/* Axis Labels */}
          <Html position={[0, 1.3, 0]} center>
            <span className="text-[10px] font-bold text-white/50">|0⟩</span>
          </Html>
          <Html position={[0, -1.3, 0]} center>
            <span className="text-[10px] font-bold text-white/50">|1⟩</span>
          </Html>

          {/* State Vector */}
          <group ref={vectorRef}>
             <Line 
               points={[[0, 0, 0], [vector.x, vector.y, vector.z]]} 
               color="#22d3ee" 
               lineWidth={3} 
             />
             <Sphere args={[0.05, 16, 16]} position={[vector.x, vector.y, vector.z]}>
               <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} />
             </Sphere>
          </group>
        </group>
      </Float>

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </>
  );
}

export default function BlochSphere({ statevector }: BlochSphereProps) {
  return (
    <div className="h-full w-full cursor-move">
      <Canvas camera={{ position: [3, 3, 3], fov: 40 }}>
        <SphereContent statevector={statevector} />
      </Canvas>
    </div>
  );
}
