import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import logoTexture from '@/assets/muslimhacks-white.png';
import logoWhite from '@/assets/muslimhacks-logo-white.svg';
import ErrorBoundary from "@/components/ErrorBoundary";

function isWebGLAvailable(): boolean {
  try {
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl") ||
      canvas.getContext("webgl2");
    return !!gl;
  } catch {
    return false;
  }
}

function CoinFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className="relative w-48 h-48 md:w-64 md:h-64 rounded-full flex items-center justify-center motion-safe:animate-[coin-float_4s_ease-in-out_infinite]"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #F2D48A 0%, #D4AF37 45%, #B8960C 80%, #93760A 100%)',
          boxShadow:
            '0 0 60px 10px hsl(40 90% 60% / 0.35), inset 0 2px 6px hsl(45 90% 90% / 0.6), inset 0 -8px 16px hsl(30 70% 25% / 0.5)',
        }}
      >
        <div className="absolute inset-2 rounded-full border border-amber-200/40" />
        <img
          src={logoWhite}
          alt="MuslimHacks logo"
          className="w-1/2 h-1/2 object-contain opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
        />
      </div>
      <style>{`
        @keyframes coin-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}

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
      bumpScale: 0.15, // Depth of the embossing - increased for visibility
    });

    return { goldMaterial: gold, ridgeMaterial: ridge, logoFaceMaterial: logoFace };
  }, [texture]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      // Slow rotation (full turn every ~10 seconds)
      meshRef.current.rotation.x += delta * 0.6;
      
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
      <mesh position={[0, -coinThickness / 2 - 0.002, 0]} rotation={[Math.PI / 2, 0, 0]} material={logoFaceMaterial}>
        <circleGeometry args={[coinRadius * 0.85, 64]} />
      </mesh>
    </group>
  );
};

interface GoldenCoinProps {
  className?: string;
}

const GoldenCoin = ({ className = '' }: GoldenCoinProps) => {
  const webglOk = useMemo(() => isWebGLAvailable(), []);

  return (
    <div className={`${className}`}>
      {!webglOk ? (
        <CoinFallback />
      ) : (
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-amber/20 animate-pulse" />
        </div>
      }>
        <ErrorBoundary fallback={<CoinFallback />}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            style={{ background: "transparent" }}
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
        </ErrorBoundary>
      </Suspense>
      )}
    </div>
  );
};

export default GoldenCoin;
