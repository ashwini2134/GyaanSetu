import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Icosahedron, MeshDistortMaterial } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";

function AbstractShape() {
  const meshRef = useRef<THREE.Mesh>(null);
  const prefersReducedMotion = useReducedMotion();

  useFrame((state, delta) => {
    if (meshRef.current && !prefersReducedMotion) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Icosahedron ref={meshRef} args={[2, 4]} scale={1.5}>
      <MeshDistortMaterial
        color="#5B6EF5"
        emissive="#A855F7"
        emissiveIntensity={0.2}
        wireframe
        distort={0.3}
        speed={prefersReducedMotion ? 0 : 2}
      />
    </Icosahedron>
  );
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {isVisible ? (
        <Canvas 
          dpr={[1, 2]} 
          camera={{ position: [0, 0, 8], fov: 45 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} color="#5B6EF5" intensity={1.5} />
          <pointLight position={[-10, -10, -10]} color="#A855F7" intensity={1} />
          <AbstractShape />
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      ) : null}
    </div>
  );
}
