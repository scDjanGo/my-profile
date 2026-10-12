"use client";

import { useEffect, useRef, useState } from "react";
import type * as T from "three";
import { ACCENTS, system, type SystemState } from "./system";

/** Set while the wallpaper is fully covered (a maximized window): nothing to draw */
let covered = false;
export function setWallpaperCovered(value: boolean) {
  covered = value;
}

/**
 * Abstract glass-and-chrome sculpture: rings, lenses and domes on one axis, lit by a
 * procedural studio of light strips. The same studio, blurred, is the backdrop — that's
 * where the soft light streaks come from. It drifts on its own; the cursor tilts it and
 * slides the reflections across the glass. three.js is loaded lazily; without WebGL the
 * flat SVG wallpaper is shown instead.
 */
export default function Wallpaper3D() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    Promise.all([
      import("three"),
      import("three/addons/postprocessing/EffectComposer.js"),
      import("three/addons/postprocessing/RenderPass.js"),
      import("three/addons/postprocessing/UnrealBloomPass.js"),
      import("three/addons/postprocessing/OutputPass.js"),
    ])
      .then(([THREE, { EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }]) => {
        if (disposed) return;

        let renderer: T.WebGLRenderer;
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        } catch {
          setFailed(true);
          return;
        }
        const mobile = window.innerWidth < 640;
        // The scene is soft and slow, so a modest resolution looks the same and keeps the UI smooth
        const maxRatio = Math.min(window.devicePixelRatio, mobile ? 1 : 1.25);
        let ratio = maxRatio;
        renderer.setPixelRatio(ratio);
        renderer.transmissionResolutionScale = 0.5;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
        camera.position.set(0, 0, 14);

        /* ---------- Procedural studio: light strips -> PMREM environment ---------- */
        const pmrem = new THREE.PMREMGenerator(renderer);
        let envTarget: T.WebGLRenderTarget | null = null;

        const buildStudio = (s: SystemState) => {
          const dark = s.theme === "dark";
          const studio = new THREE.Scene();
          studio.background = new THREE.Color(dark ? "#010307" : "#5d7596");
          const strip = (color: string, power: number, w: number, h: number, pos: [number, number, number]) => {
            const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
            mesh.position.set(...pos);
            mesh.lookAt(0, 0, 0);
            studio.add(mesh);
          };
          // long cool strips, like light streaking across glass
          strip("#cfe6ff", dark ? 7 : 6, 14, 1.2, [4, 7, -6]);
          strip("#7fb6ff", 5, 1.4, 12, [-8, 1, -3]);
          strip("#ffffff", dark ? 9 : 7, 6, 2.5, [6, 3, 6]);
          strip("#3d7bd6", 4, 10, 1, [-3, -6, 5]);
          strip("#a9d4ff", 3.5, 2, 9, [9, -2, -6]);
          // the accent and a warm counter-light give the colored glints on the edges
          strip(ACCENTS[s.accent].light, 9, 1.2, 6, [-6, -4, -7]);
          strip("#ff6a2b", 7, 3, 0.5, [2, -7, -4]);
          // broad soft streaks that read as blurred light behind the sculpture
          strip("#6fa8ff", dark ? 2.2 : 1.6, 18, 2.2, [-2, 4, -9]);
          strip("#dbeaff", dark ? 2.6 : 2, 3, 16, [-9, 2, -7]);
          if (!dark) strip("#e8f1ff", 2.2, 30, 30, [0, 12, 0]);

          const next = pmrem.fromScene(studio, 0.035);
          studio.traverse((o) => {
            const m = o as T.Mesh;
            if (m.isMesh) {
              m.geometry.dispose();
              (m.material as T.Material).dispose();
            }
          });
          envTarget?.dispose();
          envTarget = next;
          scene.environment = next.texture;
          scene.background = next.texture;
          scene.backgroundBlurriness = 0.38;
          scene.backgroundIntensity = dark ? 0.24 : 0.8;
        };

        /* ---------- Materials ---------- */
        const glass = new THREE.MeshPhysicalMaterial({
          color: "#ffffff",
          metalness: 0.05,
          roughness: 0.03,
          transmission: 1,
          thickness: 0.7,
          ior: 1.5,
          iridescence: 0.7,
          iridescenceIOR: 1.35,
          iridescenceThicknessRange: [120, 700],
          clearcoat: 1,
          clearcoatRoughness: 0.02,
          specularIntensity: 1,
          envMapIntensity: 2.4,
          attenuationDistance: 2.2,
          side: THREE.DoubleSide,
        });
        const chrome = new THREE.MeshPhysicalMaterial({
          color: "#dbe7ff",
          metalness: 1,
          roughness: 0.05,
          clearcoat: 1,
          clearcoatRoughness: 0.03,
          iridescence: 0.4,
          iridescenceThicknessRange: [200, 600],
          envMapIntensity: 2,
        });

        /* ---------- Sculpture (built along the X axis) ---------- */
        type V3 = [number, number, number];
        const geometries: T.BufferGeometry[] = [];
        const add = (
          parent: T.Object3D,
          geo: T.BufferGeometry,
          mat: T.Material,
          pos: V3 = [0, 0, 0],
          rot: V3 = [0, 0, 0],
          scale: V3 = [1, 1, 1],
        ) => {
          geometries.push(geo);
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(...pos);
          mesh.rotation.set(...rot);
          mesh.scale.set(...scale);
          parent.add(mesh);
          return mesh;
        };
        const faceX: V3 = [0, Math.PI / 2, 0];
        const halfSphere = (r: number) => new THREE.SphereGeometry(r, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);

        const sculpture = new THREE.Group();
        scene.add(sculpture);

        // the big ring with a glass rim between two chrome edges
        const mainRing = new THREE.Group();
        sculpture.add(mainRing);
        add(mainRing, new THREE.TorusGeometry(2.25, 0.07, 32, 220), chrome, [0.17, 0, 0], faceX);
        add(mainRing, new THREE.TorusGeometry(2.25, 0.07, 32, 220), chrome, [-0.17, 0, 0], faceX);
        add(mainRing, new THREE.CylinderGeometry(2.27, 2.27, 0.36, 220, 1, true), glass, [0, 0, 0], [0, 0, Math.PI / 2]);
        add(mainRing, new THREE.TorusGeometry(2.0, 0.035, 16, 200), glass, [0, 0, 0], faceX);

        // the "nozzle" on the left: stacked rings and a glass dome
        const nozzle = new THREE.Group();
        nozzle.position.x = -2.35;
        sculpture.add(nozzle);
        add(nozzle, new THREE.TorusGeometry(0.82, 0.13, 40, 140), glass, [-0.62, 0, 0], faceX);
        add(nozzle, new THREE.TorusGeometry(0.95, 0.21, 48, 160), glass, [-0.25, 0, 0], faceX);
        add(nozzle, new THREE.TorusGeometry(0.86, 0.09, 32, 140), chrome, [0.08, 0, 0], faceX);
        add(nozzle, halfSphere(0.98), glass, [0.22, 0, 0], [0, 0, -Math.PI / 2], [0.55, 1, 1]);

        // crescent lenses bridging the nozzle and the ring
        for (const side of [1, -1]) {
          add(sculpture, new THREE.SphereGeometry(0.6, 48, 24), glass, [-1.25, side * 1.28, 0.1], [0, 0, side * -0.55], [0.22, 1, 0.55]);
        }

        // small ring with a lens dome on the right
        const satellite = new THREE.Group();
        satellite.position.set(1.85, -0.25, 0.35);
        sculpture.add(satellite);
        add(satellite, new THREE.TorusGeometry(0.62, 0.06, 24, 120), chrome, [0.25, 0, 0], faceX);
        add(satellite, halfSphere(0.5), glass, [0, 0, 0], [0, 0, -Math.PI / 2], [0.6, 1, 1]);
        add(satellite, new THREE.TorusGeometry(0.95, 0.045, 16, 120, Math.PI * 1.1), glass, [0.55, 0, 0], [0, Math.PI / 2, Math.PI * 0.45]);

        // three-quarter view
        const baseRot = new THREE.Euler(0.28, -0.42, -0.2);

        /* ---------- Post-processing ---------- */
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.38, 0.5, 0.82);
        if (!mobile) composer.addPass(bloom);
        composer.addPass(new OutputPass());

        /* ---------- Theme / accent ---------- */
        let lastKey = "";
        const white = new THREE.Color("#ffffff");
        const applySystem = (s: SystemState) => {
          const k = `${s.theme}-${s.accent}`;
          if (k === lastKey) return;
          lastKey = k;
          buildStudio(s);
          glass.attenuationColor.set(ACCENTS[s.accent].light).lerp(white, 0.55);
          bloom.strength = s.theme === "dark" ? 0.34 : 0.2;
          renderer.toneMappingExposure = s.theme === "dark" ? 1 : 1.08;
        };
        applySystem(system.get());

        /* ---------- Interaction ---------- */
        const pointer = { x: 0, y: 0, active: false };
        const onMove = (e: PointerEvent) => {
          pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
          pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
          pointer.active = true;
        };
        const onLeave = () => {
          pointer.active = false;
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);

        let offsetX = 0;
        const resize = () => {
          const w = el.clientWidth || window.innerWidth;
          const h = el.clientHeight || window.innerHeight;
          renderer.setSize(w, h, false);
          composer.setSize(w, h);
          camera.aspect = w / h;
          // portrait screens: pull back so the whole sculpture fits
          camera.position.z = w / h < 1 ? 13 / Math.max(0.45, w / h) : 12.6;
          // leave room for the icon column on wide screens
          offsetX = w / h > 1.2 ? 0.9 : 0;
          camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const timer = new THREE.Timer();
        let raf = 0;
        const tilt = { x: 0, y: 0, env: 0 };

        const draw = (t: number) => {
          const px = pointer.active ? pointer.x : Math.sin(t * 0.13) * 0.5;
          const py = pointer.active ? pointer.y : Math.cos(t * 0.11) * 0.3;
          tilt.x += (py * 0.16 - tilt.x) * 0.03;
          tilt.y += (px * 0.22 - tilt.y) * 0.03;
          tilt.env += (px * 0.7 - tilt.env) * 0.025;

          // slow float; the cursor tilts it and slides the reflections around
          sculpture.rotation.set(baseRot.x + tilt.x + Math.sin(t * 0.21) * 0.05, baseRot.y + tilt.y + Math.sin(t * 0.17) * 0.08, baseRot.z);
          sculpture.position.set(offsetX, Math.sin(t * 0.4) * 0.12, 0);
          nozzle.rotation.x = t * 0.25;
          satellite.rotation.x = -t * 0.35;
          mainRing.rotation.x = Math.sin(t * 0.15) * 0.4;
          scene.environmentRotation.set(0, tilt.env + t * 0.02, 0);
          scene.backgroundRotation.set(0, tilt.env * 0.6 + t * 0.02, 0);

          composer.render();
        };

        // ~60 fps even on 120 Hz screens; frozen while hidden behind a maximized window
        // or while a window is being dragged; resolution adapts if frames get slow.
        let last = 0;
        let slowFrames = 0;
        let fastFrames = 0;
        const loop = (now: number) => {
          raf = requestAnimationFrame(loop);
          if (now - last < 15.5) return;
          const delta = now - last;
          last = now;
          timer.update(now);
          if (covered || document.body.classList.contains("win-dragging")) return;

          if (delta > 24) slowFrames++;
          else if (delta < 18) fastFrames++;
          if (slowFrames > 40 && ratio > 0.6) {
            ratio = Math.max(0.6, ratio - 0.15);
            renderer.setPixelRatio(ratio);
            composer.setPixelRatio(ratio);
            slowFrames = fastFrames = 0;
          } else if (fastFrames > 600 && ratio < maxRatio) {
            ratio = Math.min(maxRatio, ratio + 0.1);
            renderer.setPixelRatio(ratio);
            composer.setPixelRatio(ratio);
            slowFrames = fastFrames = 0;
          }
          draw(timer.getElapsed());
        };
        const start = () => {
          cancelAnimationFrame(raf);
          if (reduced) draw(4);
          else if (!document.hidden) raf = requestAnimationFrame(loop);
        };
        const unsubscribe = system.subscribe(() => {
          applySystem(system.get());
          if (reduced) draw(4);
        });
        document.addEventListener("visibilitychange", start);
        start();
        setReady(true);

        cleanup = () => {
          cancelAnimationFrame(raf);
          unsubscribe();
          window.removeEventListener("pointermove", onMove);
          document.documentElement.removeEventListener("pointerleave", onLeave);
          window.removeEventListener("resize", resize);
          document.removeEventListener("visibilitychange", start);
          timer.dispose();
          geometries.forEach((g) => g.dispose());
          glass.dispose();
          chrome.dispose();
          envTarget?.dispose();
          pmrem.dispose();
          bloom.dispose();
          composer.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => setFailed(true));

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden
      data-ready={ready || undefined}
      className={`win-sky pointer-events-none absolute inset-0 ${failed ? "win-wallpaper" : ""}`}
    />
  );
}
