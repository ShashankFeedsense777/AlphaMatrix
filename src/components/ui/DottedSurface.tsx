/**
 * DottedSurface — Three.js animated particle wave background.
 *
 * Adapted from https://github.com/... (open-source).
 * Stripped of next-themes / shadcn dependencies for Vite + React use.
 * Uses IntersectionObserver to pause the render loop when off-screen.
 *
 * @dependency  three
 */

import React, { useEffect, useRef, useState, memo } from 'react';
import * as THREE from 'three';

// ─── Configuration ──────────────────────────────────────────────────
const SEPARATION = 100;
const AMOUNT_X = 100;
const AMOUNT_Y = 100;

// Saffron brand color (matches --color-brand-saffron: #f97316)
const DOT_COLOR: [number, number, number] = [249 / 255, 115 / 255, 22 / 255];

const CAMERA_POSITION = { x: 0, y: 355, z: 1220 };
const FOG_FAR = 10000;
const DOT_SIZE = 8;
const DOT_OPACITY = 0.8;
const WAVE_SPEED = 0.1;

// ─── Types ──────────────────────────────────────────────────────────
interface DottedSurfaceProps extends Omit<React.ComponentProps<'div'>, 'ref'> {
  /** Override the dot color with a CSS hex string */
  dotColor?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Parse hex to normalised [r,g,b] */
const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : DOT_COLOR;
};

// ─── Component ──────────────────────────────────────────────────────

const DottedSurface: React.FC<DottedSurfaceProps> = ({
  className = '',
  dotColor,
  children,
  style,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    animationId: number;
  } | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ── Visibility gating ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Three.js lifecycle ──
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    const container = containerRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 2000, FOG_FAR);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      1,
      FOG_FAR,
    );
    camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Geometry
    const positions: number[] = [];
    const colors: number[] = [];
    const [r, g, b] = dotColor ? hexToRgb(dotColor) : DOT_COLOR;

    for (let ix = 0; ix < AMOUNT_X; ix++) {
      for (let iy = 0; iy < AMOUNT_Y; iy++) {
        positions.push(
          ix * SEPARATION - (AMOUNT_X * SEPARATION) / 2,
          0, // animated later
          iy * SEPARATION - (AMOUNT_Y * SEPARATION) / 2,
        );
        colors.push(r, g, b);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: DOT_SIZE,
      vertexColors: true,
      transparent: true,
      opacity: DOT_OPACITY,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;

    // Render loop
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const pos = geometry.attributes.position.array as Float32Array;
      let i = 0;
      for (let ix = 0; ix < AMOUNT_X; ix++) {
        for (let iy = 0; iy < AMOUNT_Y; iy++) {
          pos[i * 3 + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }
      geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      count += WAVE_SPEED;
    };

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Start
    animate();
    sceneRef.current = { renderer, animationId };

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Points) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }

      sceneRef.current = null;
    };
  }, [isVisible, dotColor]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`.trim()}
      style={{ ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

export default memo(DottedSurface);
