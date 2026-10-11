/** A scroll-position camera path. No time-based drift, so reverse scroll retraces it. */
export function smoothRange(start: number, end: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
}

export function inwardPose(progress: number, aspect: number) {
  const p = Math.min(1, Math.max(0, progress));
  const compact = aspect < 1;
  return {
    x: Math.sin(p * Math.PI * 2) * (compact ? .035 : .16),
    y: Math.sin(p * Math.PI) * .08,
    z: 12 - smoothRange(.035, .94, p) * 54,
    roll: Math.sin(p * Math.PI * 2) * .009,
    orbit: p * .32,
  };
}

export const inwardChapters = [
  { title: "Build.", description: "Turn a real-world need into a practical idea.", progress: .29 },
  { title: "Reach.", description: "Connect ideas with people, businesses and communities.", progress: .54 },
  { title: "Grow.", description: "Test, learn and improve. Then take the next step.", progress: .79 },
];

export const inwardPhotoLayers = [[0, 1, 4, 3, 2, 7], [5, 6, 8, 9, 10, 11], [1, 4, 0, 8, 3, 6], [6, 3, 8, 7, 0, 9]];
const angles = [.22, 1.42, 2.70, 3.48, 4.62, 5.60];

export function inwardDimensions(aspect: number) {
  const width = aspect < 1 ? Math.min(1.65, aspect * 2.5) : 2.8;
  return { width, height: width / 1.48 };
}

export function inwardFrame(progress: number, aspect: number, ring: number, slot: number) {
  const radiusX = aspect < 1 ? aspect * 3.3 : Math.min(6.05, aspect * 3.5);
  const radiusY = aspect < 1 ? 2.45 : 2.5;
  const contraction = 1 - smoothRange(.02, .86, progress) * .09;
  const angle = angles[slot] + ring * .37 + progress * .32;
  return {
    x: Math.cos(angle) * radiusX * contraction,
    y: Math.sin(angle) * radiusY * contraction,
    z: -ring * 18 + Math.sin(angle * 2) * .55,
    rotationY: -Math.cos(angle) * .075,
    rotationZ: Math.sin(angle) * .04,
  };
}

/** Conservative frustum clearance: fully fade a photograph before it is cut off. */
export function inwardFrameOpacity({ depth, aspect, width, height, x, y }: { depth: number; aspect: number; width: number; height: number; x: number; y: number }) {
  const dimensions = inwardDimensions(aspect);
  const halfHeight = depth * Math.tan(42 * Math.PI / 360);
  const halfWidth = halfHeight * aspect;
  const footer = width < 768 && height > 428 ? 104 : 68;
  const margin = Math.min(
    halfWidth * (1 - 32 / width) - Math.abs(x) - dimensions.width * .54,
    halfHeight * (1 - 32 / height) - y - dimensions.height * .54,
    halfHeight * (1 - footer * 2 / height) + y - dimensions.height * .54,
  );
  return smoothRange(0, dimensions.height * .5, margin) * smoothRange(3, 8, depth) * (1 - smoothRange(42, 68, depth));
}
