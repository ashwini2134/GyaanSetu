import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

function CodeBrackets({ isHovered }: { isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state, delta) => {
    if (groupRef.current && !prefersReducedMotion) {
      // Idle slow rotation
      groupRef.current.rotation.y += delta * 0.5;
      
      if (isHovered) {
        groupRef.current.rotation.y += delta * 2;
      }
    }
  });

  const color = "#5B6EF5"; // Indigo

  return (
    <group ref={groupRef} scale={isHovered ? 1.1 : 1}>
      {/* Left Bracket < */}
      <Box args={[0.2, 1.2, 0.2]} position={[-0.8, 0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </Box>
      <Box args={[0.2, 1.2, 0.2]} position={[-0.8, -0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </Box>

      {/* Right Bracket > */}
      <Box args={[0.2, 1.2, 0.2]} position={[0.8, 0.4, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </Box>
      <Box args={[0.2, 1.2, 0.2]} position={[0.8, -0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </Box>

      {/* Center slash / */}
      <Box args={[0.2, 2, 0.2]} position={[0, 0, 0]} rotation={[0, 0, -Math.PI / 8]}>
        <meshStandardMaterial color="#8B7FFF" roughness={0.3} metalness={0.7} />
      </Box>
    </group>
  );
}

export default function PythonIcon3D({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="w-full h-full">
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#5B6EF5" intensity={1.2} />
        <pointLight position={[-10, -10, -10]} color="#34D399" intensity={0.5} />
        <CodeBrackets isHovered={isHovered} />
      </Canvas>
    </div>
  );
}
