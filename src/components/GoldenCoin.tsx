import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import logoTexture from '@/assets/muslimhacks-logo.png';

const CoinMesh = () => {
  const meshRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Load logo texture for bump mapping
  const texture = useLoader(THREE.TextureLoader, logoTexture);
  
  // Create materials with the logo as bump map
  const { goldMaterial, ridgeMaterial, logoFaceMaterial } = useMemo(() => {
    const goldColor = new THREE.Color('#D4AF37');
    
    // Configure texture for bump mapping
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.center.set(0.5, 0.5);
    
    const gold = new THREE.MeshStandardMaterial({
      color: goldColor,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.2,
    });

    const ridge = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#B8960C'),
      metalness: 0.9,
      roughness: 0.25,
    });

    // Face material with logo bump map (black = recessed, white = raised)
    const logoFace = new THREE.MeshStandardMaterial({
      color: goldColor,
      metalness: 0.95,
      roughness: 0.15,
      envMapIntensity: 1.2,
      bumpMap: texture,
      bumpScale: 0.15, // Depth of the embossing
    });

    return { goldMaterial: gold, ridgeMaterial: ridge, logoFaceMaterial: logoFace };
  }, [texture]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Slow rotation (full turn every ~10 seconds)
      meshRef.current.rotation.x += delta * 0.3;
      
      // Floating bob effect
      timeRef.current += delta;
      meshRef.current.position.y = Math.sin(timeRef.current * 0.8) * 0.15;
    }
  });

  const coinRadius = 1.5;
  const coinThickness = 0.15;
  const ridgeCount = 120;

  return (
    <group ref={meshRef} rotation={[0, 0.3, 0]}>
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

      {/* Front face with embossed logo */}
      <mesh position={[0, coinThickness / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={logoFaceMaterial}>
        <circleGeometry args={[coinRadius * 0.85, 64]} />
      </mesh>

      {/* Back face with embossed logo (mirrored) */}
      <mesh position={[0, -coinThickness / 2 - 0.002, 0]} rotation={[Math.PI / 2, 0, Math.PI]} material={logoFaceMaterial}>
        <circleGeometry args={[coinRadius * 0.85, 64]} />
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
