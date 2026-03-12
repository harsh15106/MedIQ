import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Procedurally generate a DNA double helix
const DNA = () => {
  const groupRef = useRef();

  // Create the DNA structure data once
  const dnaData = useMemo(() => {
    const pairs = 30; // Number of base pairs
    const radius = 1.8; // Radius of the helix
    const heightStep = 0.5; // Vertical space between pairs
    const rotationStep = Math.PI / 10; // Twist angle per pair
    
    const elements = [];
    
    for (let i = 0; i < pairs; i++) {
        const y = (i - pairs / 2) * heightStep;
        const angle = i * rotationStep;
        
        // Helix strand 1 pos
        const x1 = Math.cos(angle) * radius;
        const z1 = Math.sin(angle) * radius;
        
        // Helix strand 2 pos (opposite side)
        const x2 = Math.cos(angle + Math.PI) * radius;
        const z2 = Math.sin(angle + Math.PI) * radius;
        
        elements.push({ y, x1, z1, x2, z2, angle });
    }
    
    return elements;
  }, []);

  // Slowly rotate the entire DNA structure
  useFrame((state) => {
    if (groupRef.current) {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
        groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <group ref={groupRef} rotation={[Math.PI / 4, 0, Math.PI / 6]} scale={1.5}>
      {dnaData.map((data, idx) => (
        <group key={idx}>
          {/* Base Pair Connecting Cylinder */}
          <mesh position={[0, data.y, 0]} rotation={[0, -data.angle, Math.PI / 2]}>
             <cylinderGeometry args={[0.06, 0.06, 3.6, 8]} />
             <meshStandardMaterial color="#38bdf8" opacity={0.3} transparent />
          </mesh>
          
          {/* Backbone Node 1 */}
          <mesh position={[data.x1, data.y, data.z1]}>
             <sphereGeometry args={[0.2, 16, 16]} />
             <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.8} />
          </mesh>
          
          {/* Backbone Node 2 */}
          <mesh position={[data.x2, data.y, data.z2]}>
             <sphereGeometry args={[0.2, 16, 16]} />
             <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export default function FloatingDNA() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#8b5cf6" />
        
        {/* Adds organic floating motion to the DNA */}
        <Float
           speed={1} 
           rotationIntensity={0.5} 
           floatIntensity={1.5}
        >
          <DNA />
        </Float>
      </Canvas>
    </div>
  );
}
