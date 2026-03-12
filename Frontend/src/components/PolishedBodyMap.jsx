import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, Html, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// A single interactive body part
const BodyPart = ({ position, args, name, color = "#0ea5e9", onClick, geometryType = "box" }) => {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);

  // Subtle breathing animation
  useFrame((state) => {
    if (!hovered && meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.02;
    }
  });

  return (
    <group>
      {/* Invisible interactive mesh */}
      <mesh
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onClick(name);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
          document.body.style.cursor = 'auto';
        }}
        visible={false} // Only for interactivity
      >
        {geometryType === "box" && <boxGeometry args={[args[0]*1.2, args[1]*1.2, args[2]*1.2]} />}
        {geometryType === "sphere" && <sphereGeometry args={[args[0]*1.2, args[1], args[2]]} />}
        {geometryType === "cylinder" && <cylinderGeometry args={[args[0]*1.2, args[1]*1.2, args[2]*1.2]} />}
      </mesh>

      {/* Visual wireframe mesh */}
      <mesh ref={meshRef} position={position}>
        {geometryType === "box" && <boxGeometry args={args} />}
        {geometryType === "sphere" && <sphereGeometry args={args} />}
        {geometryType === "cylinder" && <cylinderGeometry args={args} />}
        
        {/* Futuristic Glowing Wireframe Material */}
        <meshStandardMaterial
          color={hovered ? "#38bdf8" : color}
          wireframe={true}
          transparent={true}
          opacity={hovered ? 0.9 : 0.3}
          emissive={hovered ? "#0ea5e9" : color}
          emissiveIntensity={hovered ? 2 : 0.5}
        />
      </mesh>
      
      {/* Floating Label on Hover */}
      {hovered && (
        <Html position={[position[0], position[1] + (geometryType==="sphere" ? args[0] : args[1]/2) + 0.5, position[2]]} center>
          <div className="px-3 py-1 bg-slate-900/80 backdrop-blur border border-sky-500/50 text-sky-400 text-sm font-bold rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.5)] pointer-events-none whitespace-nowrap animate-pulse">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
};

// Abstract Humanoid Assembly
const Humanoid = ({ onPartSelect }) => {
  return (
    <group position={[0, -1, 0]}>
      {/* Core Energy Center (Heart) */}
      <mesh position={[0, 2.7, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
      </mesh>

      {/* Head */}
      <BodyPart name="Head" position={[0, 4.5, 0]} args={[0.5, 16, 16]} geometryType="sphere" onClick={onPartSelect} />
      
      {/* Neck */}
      <BodyPart name="Neck" position={[0, 3.8, 0]} args={[0.2, 0.4, 0.2]} geometryType="cylinder" onClick={onPartSelect} />

      {/* Torso / Chest */}
      <BodyPart name="Chest" position={[0, 2.7, 0]} args={[1.4, 1.6, 0.6]} onClick={onPartSelect} />
      
      {/* Abdomen / Stomach */}
      <BodyPart name="Stomach" position={[0, 1.4, 0]} args={[1.3, 1.0, 0.55]} onClick={onPartSelect} />

      {/* Left Arm (User's Left = Right side of screen) */}
      <BodyPart name="Left Shoulder" position={[0.9, 3.2, 0]} args={[0.3, 16, 16]} geometryType="sphere" onClick={onPartSelect} />
      <BodyPart name="Left Arm" position={[1.1, 2.2, 0]} args={[0.3, 1.6, 0.3]} geometryType="cylinder" onClick={onPartSelect} />
      <BodyPart name="Left Hand" position={[1.15, 1.2, 0]} args={[0.25, 16, 16]} geometryType="sphere" onClick={onPartSelect} />

      {/* Right Arm */}
      <BodyPart name="Right Shoulder" position={[-0.9, 3.2, 0]} args={[0.3, 16, 16]} geometryType="sphere" onClick={onPartSelect} />
      <BodyPart name="Right Arm" position={[-1.1, 2.2, 0]} args={[0.3, 1.6, 0.3]} geometryType="cylinder" onClick={onPartSelect} />
      <BodyPart name="Right Hand" position={[-1.15, 1.2, 0]} args={[0.25, 16, 16]} geometryType="sphere" onClick={onPartSelect} />

      {/* Pelvis */}
      <BodyPart name="Pelvis" position={[0, 0.6, 0]} args={[1.4, 0.6, 0.6]} onClick={onPartSelect} />

      {/* Left Leg */}
      <BodyPart name="Left Thigh" position={[0.4, -0.6, 0]} args={[0.4, 1.8, 0.4]} geometryType="cylinder" onClick={onPartSelect} />
      <BodyPart name="Left Knee" position={[0.4, -1.6, 0]} args={[0.25, 16, 16]} geometryType="sphere" onClick={onPartSelect} />
      <BodyPart name="Left Calf" position={[0.4, -2.6, 0]} args={[0.35, 1.8, 0.35]} geometryType="cylinder" onClick={onPartSelect} />
      <BodyPart name="Left Foot" position={[0.4, -3.6, 0.2]} args={[0.4, 0.2, 0.6]} onClick={onPartSelect} />

      {/* Right Leg */}
      <BodyPart name="Right Thigh" position={[-0.4, -0.6, 0]} args={[0.4, 1.8, 0.4]} geometryType="cylinder" onClick={onPartSelect} />
      <BodyPart name="Right Knee" position={[-0.4, -1.6, 0]} args={[0.25, 16, 16]} geometryType="sphere" onClick={onPartSelect} />
      <BodyPart name="Right Calf" position={[-0.4, -2.6, 0]} args={[0.35, 1.8, 0.35]} geometryType="cylinder" onClick={onPartSelect} />
      <BodyPart name="Right Foot" position={[-0.4, -3.6, 0.2]} args={[0.4, 0.2, 0.6]} onClick={onPartSelect} />
    </group>
  );
};

export default function PolishedBodyMap({ onSelectPart, onClose }) {
  return (
    <div className="w-full h-[500px] bg-slate-950 rounded-3xl overflow-hidden relative shadow-[0_0_50px_rgba(14,165,233,0.15)] border border-slate-800">
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-6 z-10 pointer-events-none">
        <h3 className="text-sky-400 text-xl font-bold tracking-widest uppercase">Biometric Scanner</h3>
        <p className="text-slate-400 text-xs tracking-wider uppercase mt-1">Select physiological anomaly zone</p>
      </div>

      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-slate-900 border border-slate-700 text-slate-300 rounded-full flex items-center justify-center hover:bg-slate-800 hover:text-white hover:border-sky-500 transition-all cursor-pointer"
      >
        ✕
      </button>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 2, 9], fov: 45 }}>
        <fog attach="fog" args={['#020617', 5, 15]} />
        <ambientLight intensity={0.2} />
        
        {/* Floating Humanoid */}
        <Float
          speed={1.5} 
          rotationIntensity={0.1} 
          floatIntensity={0.2} 
        >
          <Humanoid onPartSelect={onSelectPart} />
          {/* Data Particles scanning around the body */}
          <Sparkles count={150} scale={4} size={2} speed={0.4} opacity={0.3} color="#38bdf8" />
        </Float>

        {/* Controls */}
        <OrbitControls 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={5}
          maxDistance={12}
          autoRotate
          autoRotateSpeed={1}
        />
        
        {/* Grid Floor */}
        <gridHelper args={[20, 40, '#0ea5e9', '#0f172a']} position={[0, -4.5, 0]} material-opacity={0.15} material-transparent />
      </Canvas>
    </div>
  );
}
