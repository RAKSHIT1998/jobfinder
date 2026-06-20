"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Gem() {
  const meshRef = useRef<THREE.Mesh>(null);
  const spin = useRef(0);
  const elapsed = useRef(0);

  // R3F tracks pointer position over the canvas in state.pointer (-1..1) -
  // no manual mousemove listener needed for the "rotates on cursor hover" effect.
  // Tracks its own elapsed time from delta rather than state.clock.elapsedTime,
  // which three.js deprecated in favor of THREE.Timer.
  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    spin.current += delta * 0.18;
    elapsed.current += delta;
    const targetX = state.pointer.y * 0.5;
    const targetY = spin.current + state.pointer.x * 0.9;

    mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetX, 0.06);
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetY, 0.06);
    mesh.position.y = Math.sin(elapsed.current * 0.6) * 0.08;
  });

  return (
    <mesh ref={meshRef} scale={1.6}>
      <icosahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        color="#cabffd"
        roughness={0.15}
        metalness={0.1}
        transmission={0.55}
        thickness={1.6}
        clearcoat={1}
        clearcoatRoughness={0.1}
        iridescence={0.7}
        iridescenceIOR={1.3}
        iridescenceThicknessRange={[100, 400]}
        flatShading
      />
    </mesh>
  );
}

export default function HeroCrystalCanvas({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.6], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.5} />
      <pointLight color="#7c3aed" position={[3, 2, 4]} intensity={60} />
      <pointLight color="#4f46e5" position={[-3, -2, -2]} intensity={35} />
      <directionalLight color="#ffffff" position={[0, 5, 5]} intensity={0.6} />
      <Gem />
    </Canvas>
  );
}
