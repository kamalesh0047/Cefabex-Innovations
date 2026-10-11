import * as THREE from "three";
import { moments } from "@/lib/cefabex";
import { inwardPose, inwardDimensions, inwardFrame, inwardFrameOpacity, inwardPhotoLayers, smoothRange } from "@/lib/inward-motion";

type Options = { host: HTMLElement; onReady: () => void; onFailure: () => void };

// Full, unwarped photographs in identical mat frames. The shader only fits the
// photograph inside its frame; it never crops, displaces or stretches the image.
const vertex = `varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}`;
const fragment = `uniform sampler2D uMap;
uniform float uAspect;
uniform float uFrame;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  vec2 fit = vec2(.94);
  if (uAspect > uFrame) fit.y *= uFrame / uAspect;
  else fit.x *= uAspect / uFrame;
  vec2 uv = (vUv - .5) / fit + .5;
  vec3 color = vec3(.965, .976, .988);
  if (all(greaterThanEqual(uv, vec2(0.))) && all(lessThanEqual(uv, vec2(1.)))) {
    color = texture2D(uMap, uv).rgb;
  }
  float edge = min(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y));
  color = mix(vec3(.76, .82, .89), color, smoothstep(.002, .007, edge));
  gl_FragColor = vec4(color, uOpacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function createInwardScene({ host, onReady, onFailure }: Options) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, host.clientWidth < 768 ? 1.4 : 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xf7f9fc, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 120);
  const loader = new THREE.TextureLoader();
  const textures = new Map<number, THREE.Texture>();
  const frames: { mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>; ring: number; slot: number }[] = [];
  const portals: THREE.LineLoop<THREE.BufferGeometry, THREE.LineBasicMaterial>[] = [];
  let progress = 0, dead = false, raf = 0, visible = true, dirty = true;
  let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
  let width = 1, height = 1, aspect = 1, frameWidth = 2.8, frameHeight = 1.89;
  renderer.debug.onShaderError = () => queueMicrotask(() => { if (!dead) onFailure(); });

  // Elliptical gallery outlines give the camera journey a clear vanishing point.
  const portalGeometry = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 128 }, (_, i) => {
      const a = i / 128 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    })
  );
  for (let i = 0; i < 12; i++) {
    const portal = new THREE.LineLoop(portalGeometry, new THREE.LineBasicMaterial({
      color: 0x9ab5d3, transparent: true, opacity: .16, depthWrite: false,
    }));
    portal.position.z = 2 - i * 4.7;
    portals.push(portal);
    scene.add(portal);
  }

  const resize = () => {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    aspect = width / height;
    renderer.setSize(width, height);
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const dimensions = inwardDimensions(aspect);
    frameWidth = dimensions.width;
    frameHeight = dimensions.height;
    frames.forEach(({ mesh }) => mesh.scale.set(frameWidth, frameHeight, 1));
    dirty = true;
    schedule();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) { dirty = true; schedule(); }
  });
  visibility.observe(host);

  const move = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    const bounds = host.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / width - .5) * 2;
    pointerY = ((event.clientY - bounds.top) / height - .5) * 2;
    schedule();
  };
  const leave = () => { pointerX = pointerY = 0; schedule(); };
  const visibilityChange = () => { if (!document.hidden) { dirty = true; schedule(); } };
  const contextLost = (event: Event) => { event.preventDefault(); if (!dead) onFailure(); };
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerleave", leave, { passive: true });
  document.addEventListener("visibilitychange", visibilityChange);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);

  function schedule() {
    if (!raf && !dead && visible && !document.hidden) raf = requestAnimationFrame(render);
  }
  function render() {
    raf = 0;
    if (dead || !visible || document.hidden) return;
    const moving = Math.abs(pointerX - easedX) + Math.abs(pointerY - easedY) > .002;
    if (!dirty && !moving) return;
    dirty = false;
    easedX += (pointerX - easedX) * .065;
    easedY += (pointerY - easedY) * .065;
    const pose = inwardPose(progress, aspect);
    const compact = aspect < 1;
    camera.position.set(pose.x + easedX * .08, pose.y - easedY * .045, pose.z);
    camera.rotation.set(easedY * .004, -easedX * .005, pose.roll);

    // The corridor contracts as you enter it, while true perspective gives each
    // plane its own speed. The opening and three chapters have their own layers.
    const radiusX = compact ? aspect * 3.3 : Math.min(6.05, aspect * 3.5);
    const radiusY = compact ? 2.45 : 2.5;
    const contraction = 1 - smoothRange(.02, .86, progress) * .09;
    frames.forEach(({ mesh, ring, slot }) => {
      const frame = inwardFrame(progress, aspect, ring, slot);
      mesh.position.set(frame.x, frame.y, frame.z);
      mesh.rotation.set(0, frame.rotationY, frame.rotationZ);
      const depth = camera.position.z - frame.z;
      // Fade before a frame passes through the camera; never let a giant face
      // take over the viewport. Distant frames emerge softly from the paper.
      // Each photograph dissolves before its frame touches an edge or toolbar.
      // Passing through the gallery must not mean cropping the supplied images.
      mesh.material.uniforms.uOpacity.value = inwardFrameOpacity({depth, aspect, width, height, x: frame.x - camera.position.x, y: frame.y - camera.position.y});
      mesh.visible = depth > 2.5;
    });
    portals.forEach((portal) => {
      portal.scale.set(radiusX * 1.12 * contraction, radiusY * 1.28 * contraction, 1);
      const depth = camera.position.z - portal.position.z;
      portal.material.opacity = .17 * smoothRange(2, 8, depth) * (1 - smoothRange(35, 65, depth));
      portal.visible = depth > 1;
    });
    try { renderer.render(scene, camera); }
    catch { onFailure(); return; }
    if (moving) schedule();
  }

  let loaded = 0;
  const loads = moments.map(async (photo, index) => {
    const texture = await loader.loadAsync(photo.src);
    if (dead) { texture.dispose(); return; }
    textures.set(index, texture);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    inwardPhotoLayers.forEach((photos, ring) => photos.forEach((photoIndex, slot) => {
      if (photoIndex !== index) return;
      const material = new THREE.ShaderMaterial({
        vertexShader: vertex, fragmentShader: fragment, transparent: true,
        depthWrite: false, side: THREE.DoubleSide,
        uniforms: {
          uMap: { value: texture }, uAspect: { value: texture.image.width / texture.image.height },
          uFrame: { value: 1.48 }, uOpacity: { value: 0 },
        },
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      mesh.scale.set(frameWidth, frameHeight, 1);
      frames.push({ mesh, ring, slot });
      scene.add(mesh);
    }));
    loaded++;
    dirty = true;
    schedule();
  });
  // Keep the immediate HTML photography until the initial layer is populated.
  Promise.allSettled(loads).then(() => {
    if (dead) return;
    if (loaded >= 3) onReady();
    else onFailure();
  });
  schedule();

  return {
    setProgress(value: number) { progress = value; dirty = true; schedule(); },
    dispose() {
      if (dead) return;
      dead = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibilityChange);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      frames.forEach(({ mesh }) => { mesh.geometry.dispose(); mesh.material.dispose(); });
      textures.forEach(texture => texture.dispose());
      portalGeometry.dispose();
      portals.forEach(portal => portal.material.dispose());
      scene.clear();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
