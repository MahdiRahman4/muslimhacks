import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

const CoinMesh = () => {
  const meshRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Slow rotation (full turn every ~10 seconds)
      meshRef.current.rotation.y += delta * 0.6;
      
      // Floating bob effect
      timeRef.current += delta;
      meshRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.15;
    }
  });

  // Gold material properties
  const goldColor = new THREE.Color('#D4AF37');
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: goldColor,
    metalness: 0.95,
    roughness: 0.15,
    envMapIntensity: 1.2,
  });

  // Darker gold for ridges
  const ridgeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#B8960C'),
    metalness: 0.9,
    roughness: 0.25,
  });

  // Face indentation material (slightly different tone)
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#C9A227'),
    metalness: 0.92,
    roughness: 0.2,
  });

  const coinRadius = 1.5;
  const coinThickness = 0.15;
  const ridgeCount = 120;

  return (
    <group ref={meshRef} rotation={[0.15, 0, 0.1]}>
      {/* Main coin body */}
      <mesh material={goldMaterial}>
        <cylinderGeometry args={[coinRadius, coinRadius, coinThickness, 64]} />
      </mesh>

      {/* Edge ridges */}
      {Array.from({ length: ridgeCount }).map((_, i) => {
        const angle = (i / ridgeCount) * Math.PI * 2;
        const x = Math.cos(angle) * coinRadius;
        const z = Math.sin(angle) * coinRadius;
        return (
          <mesh
            key={i}
            position={[x, 0, z]}
            rotation={[0, -angle + Math.PI / 2, 0]}
            material={ridgeMaterial}
          >
            <boxGeometry args={[0.025, coinThickness * 1.1, 0.06]} />
          </mesh>
        );
      })}

      {/* Front face - circular indentation (logo placeholder) */}
      <mesh position={[0, coinThickness / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} material={faceMaterial}>
        <ringGeometry args={[0.3, 0.9, 32]} />
      </mesh>

      {/* Back face - circular indentation (logo placeholder) */}
      <mesh position={[0, -coinThickness / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]} material={faceMaterial}>
        <ringGeometry args={[0.3, 0.9, 32]} />
      </mesh>

      {/* Center emboss placeholder - front */}
      <mesh position={[0, coinThickness / 2 + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} material={goldMaterial}>
        <circleGeometry args={[0.4, 32]} />
      </mesh>

      {/* Center emboss placeholder - back */}
      <mesh position={[0, -coinThickness / 2 - 0.005, 0]} rotation={[Math.PI / 2, 0, 0]} material={goldMaterial}>
        <circleGeometry args={[0.4, 32]} />
      </mesh>
    </group>
  );
};

interface GoldenCoinProps {
  className?: string;
}

const GoldenCoin = ({ className = '' }: GoldenCoinProps) => {
  return (
    <div className={`${className}`}>
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-amber/20 animate-pulse" />
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1.5} color="#FFE4B5" />
          <pointLight position={[-5, -3, 3]} intensity={0.8} color="#FFA500" />
          <pointLight position={[0, 5, -5]} intensity={0.6} color="#FFFFFF" />
          
          {/* Environment for reflections */}
          <Environment preset="sunset" />
          
          {/* The coin */}
          <CoinMesh />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default GoldenCoin;
