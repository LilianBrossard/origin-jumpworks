"use client";

import { useEffect, useRef, useState } from "react";
import { ShipPicture } from "@/components/ui/ShipPicture";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/lib/data/schema";
import { useReducedMotion } from "@/lib/use-preferences";

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Décalage proportionnel à la profondeur : le vaisseau (proche) glisse plus que le fond.
// L'image est légèrement agrandie pour ne jamais laisser voir ses bords.
const FRAGMENT = `
precision mediump float;
uniform sampler2D uImage;
uniform sampler2D uDepth;
uniform vec2 uOffset;
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) * 0.96 + 0.5;
  float depth = texture2D(uDepth, uv).r;
  vec2 shifted = uv + uOffset * (depth - 0.35);
  gl_FragColor = texture2D(uImage, shifted);
}`;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * M4 · Profondeur sur les photos : l'image prend du relief et bouge très légèrement
 * avec la souris (ou au doigt). Repli : l'image fixe, en dessous, toujours présente.
 * Animations réduites ou sans WebGL : image fixe uniquement.
 */
export function DepthImage({
  image,
  depthSrc,
  alt,
  className,
  priority,
}: {
  image: ImageAsset;
  depthSrc?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const box = wrap.current;
    if (!el || !box || !depthSrc || reduced) return;
    const gl = el.getContext("webgl", { premultipliedAlpha: false, antialias: false });
    if (!gl) return;

    let disposed = false;
    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const uOffset = { loc: null as WebGLUniformLocation | null };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    uOffset.loc = gl.getUniformLocation(program, "uOffset");

    const texture = (unit: number, img: HTMLImageElement, name: string) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.uniform1i(gl.getUniformLocation(program, name), unit);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(box.clientWidth * dpr);
      el.height = Math.round(box.clientHeight * dpr);
      gl.viewport(0, 0, el.width, el.height);
    };

    const draw = () => {
      gl.uniform2f(uOffset.loc, current.x, current.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    // Boucle seulement pendant le mouvement : au repos, rien ne tourne.
    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      draw();
      if (Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.00005) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };
    const kick = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      target.x = -nx * 0.03;
      target.y = -ny * 0.02;
      kick();
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
      kick();
    };

    // Plus grande source disponible pour la couleur, carte de profondeur à part
    const src = image.webp[image.webp.length - 1]?.src ?? image.webp[0]!.src;
    Promise.all([loadImage(src), loadImage(depthSrc)])
      .then(([img, depth]) => {
        if (disposed) return;
        texture(0, img, "uImage");
        texture(1, depth, "uDepth");
        resize();
        draw();
        setReady(true);
        box.addEventListener("pointermove", onMove);
        box.addEventListener("pointerleave", onLeave);
      })
      .catch(() => undefined);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(box);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      ro.disconnect();
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [image, depthSrc, reduced]);

  return (
    <div ref={wrap} className={cn("relative overflow-hidden", className)}>
      <ShipPicture
        image={image}
        alt={alt}
        priority={priority}
        sizes="100vw"
        className="absolute inset-0 h-full w-full"
        // Même léger agrandissement que le rendu WebGL : aucun saut au fondu
        imgClassName="scale-[1.0417]"
      />
      <canvas
        ref={canvas}
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-(--duration-base)",
          ready && !reduced ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
