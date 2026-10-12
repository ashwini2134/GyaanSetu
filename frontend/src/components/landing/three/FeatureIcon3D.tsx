import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Sphere, Cylinder, Octahedron, Torus, RoundedBox } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

type FeatureType = "code" | "mentor" | "portfolio" | "analytics" | "certificate";

function FeatureShape({ type, isHovered }: { type: FeatureType; isHovered: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state, delta) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.y += delta * 0.3;
      if (isHovered) {
        meshRef.current.rotation.y += delta * 2;
      }
    }
  });

  const getShape = () => {
    switch (type) {
      case "code":
        return (
          <RoundedBox ref={meshRef} args={[1.5, 1.5, 0.4]} radius={0.2} smoothness={4}>
            <meshStandardMaterial color="#5B6EF5" roughness={0.2} metalness={0.8} />
          </RoundedBox>
        );
      case "mentor":
        return (
          <Sphere ref={meshRef} args={[1, 32, 32]}>
            <meshStandardMaterial color="#A855F7" roughness={0.3} metalness={0.5} wireframe={isHovered} />
          </Sphere>
        );
      case "portfolio":
        return (
          <Octahedron ref={meshRef} args={[1.2, 0]}>
            <meshStandardMaterial color="#34D399" roughness={0.1} metalness={0.9} />
          </Octahedron>
        );
      case "analytics":
        return (
          <Cylinder ref={meshRef} args={[1, 1, 0.5, 32]}>
            <meshStandardMaterial color="#8B7FFF" roughness={0.4} metalness={0.6} />
          </Cylinder>
        );
      case "certificate":
        return (
          <Torus ref={meshRef} args={[0.8, 0.3, 16, 100]}>
            <meshStandardMaterial color="#EC4899" roughness={0.2} metalness={0.8} />
          </Torus>
        );
      default:
        return (
          <Box ref={meshRef} args={[1, 1, 1]}>
            <meshStandardMaterial color="#5B6EF5" />
          </Box>
        );
    }
  };

  return <group scale={isHovered ? 1.1 : 1}>{getShape()}</group>;
}

export default function FeatureIcon3D({ type }: { type: FeatureType }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="w-16 h-16 relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} color="#ffffff" intensity={1} />
        <pointLight position={[-5, -5, -5]} color="#5B6EF5" intensity={0.5} />
        <FeatureShape type={type} isHovered={isHovered} />
      </Canvas>
    </div>
  );
}
