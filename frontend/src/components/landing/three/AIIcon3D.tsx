import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Line } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

function AINode({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state, delta) => {
    if (groupRef.current && !prefersReducedMotion) {
      // Idle slow rotation
      groupRef.current.rotation.y += delta * 0.5;
      
      // Speed up on hover
      if (isHovered) {
        groupRef.current.rotation.y += delta * 2;
      }
    }
  });

  const color = "#A855F7"; // Violet

  return (
    <group ref={groupRef} scale={isHovered ? 1.1 : 1}>
      {/* Central Node */}
      <Sphere args={[0.6, 32, 32]}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} emissive={color} emissiveIntensity={0.2} />
      </Sphere>

      {/* Orbiting Nodes */}
      <group rotation={[0, 0, Math.PI / 4]}>
        <Sphere args={[0.2, 16, 16]} position={[1.5, 0, 0]}>
          <meshStandardMaterial color="#EC4899" />
        </Sphere>
        <Sphere args={[0.2, 16, 16]} position={[-1.5, 0, 0]}>
          <meshStandardMaterial color="#EC4899" />
        </Sphere>
        {/* Connecting lines */}
        <Line points={[[-1.5, 0, 0], [1.5, 0, 0]]} color={color} lineWidth={1} />
      </group>

      <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <Sphere args={[0.2, 16, 16]} position={[0, 1.5, 0]}>
          <meshStandardMaterial color="#5B6EF5" />
        </Sphere>
        <Sphere args={[0.2, 16, 16]} position={[0, -1.5, 0]}>
          <meshStandardMaterial color="#5B6EF5" />
        </Sphere>
        <Line points={[[0, -1.5, 0], [0, 1.5, 0]]} color={color} lineWidth={1} />
      </group>
    </group>
  );
}

export default function AIIcon3D({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#A855F7" intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#EC4899" intensity={0.5} />
        <AINode isHovered={isHovered} />
      </Canvas>
    </div>
  );
}
