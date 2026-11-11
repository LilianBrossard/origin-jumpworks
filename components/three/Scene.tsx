"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { PerspectiveCamera } from "three";
import { cameraDistance, FOV } from "./camera";
import { Flock } from "./Flock";
import { GoldenThread } from "./GoldenThread";
import { Starfield } from "./Starfield";
import { useThemeColors } from "./useThemeColors";

/**
 * Caméra calée sur la page : x = pixels depuis la gauche, y = −pixels depuis le haut.
 * Elle suit le défilement : un objet placé à (x, −y, 0) reste collé à ce point du document.
 */
function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    camera.fov = FOV;
    camera.near = 1;
    camera.far = cameraDistance(size.height) + 6000;
    camera.updateProjectionMatrix();
  }, [camera, size.height]);

  useFrame(() => {
    const d = cameraDistance(size.height);
    const x = size.width / 2;
    const y = -(window.scrollY + size.height / 2);
    camera.position.set(x, y, d);
    camera.lookAt(x, y, 0);
  });

  return null;
}

export default function Scene({ pathname }: { pathname: string }) {
  const colors = useThemeColors();

  return (
    <Canvas
      aria-hidden
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, position: [0, 0, 1000] }}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      <CameraRig />
      <Starfield colors={colors} />
      <Flock colors={colors} />
      {pathname === "/" && <GoldenThread colors={colors} />}
    </Canvas>
  );
}
