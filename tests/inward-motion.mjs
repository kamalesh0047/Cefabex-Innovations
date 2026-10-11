import assert from 'node:assert/strict';
import { PerspectiveCamera, Vector3, Euler } from 'three';
import { inwardPose, inwardFrame, inwardFrameOpacity, inwardDimensions, inwardPhotoLayers, inwardChapters } from '../lib/inward-motion.ts';

// Check the scene's actual 3D projection, without a browser or WebGL context.
// Every visible image must fit the viewport and clear its persistent controls.
const viewports = [[320, 496], [390, 772], [430, 860], [667, 303], [768, 944], [1024, 688], [1440, 820], [1920, 1000]];
let projections = 0;
for (const [width, height] of viewports) {
  const aspect = width / height;
  const camera = new PerspectiveCamera(42, aspect, .1, 120);
  const dimensions = inwardDimensions(aspect);
  const footer = width < 768 && height > 428 ? 104 : 68;
  let previous = inwardPose(0, aspect);
  for (let n = 0; n <= 1000; n++) {
    const pose = inwardPose(n / 1000, aspect);
    assert.ok(pose.z <= previous.z, 'Forward scroll always moves the camera inward');
    assert.ok(Math.abs(pose.z - previous.z) < .1, 'Camera path has no depth discontinuities');
    assert.ok(Object.values(pose).every(Number.isFinite));
    previous = pose;
  }
  assert.equal(inwardPose(-1, aspect).z, 12);
  assert.equal(inwardPose(2, aspect).z, -42);

  for (let n = 0; n <= 100; n++) {
    const progress = n / 100;
    const pose = inwardPose(progress, aspect);
    for (const pointer of [-1, 0, 1]) {
      camera.position.set(pose.x + pointer * .08, pose.y - pointer * .045, pose.z);
      camera.rotation.set(pointer * .004, -pointer * .005, pose.roll);
      camera.updateMatrixWorld();
      inwardPhotoLayers.forEach((photos, ring) => photos.forEach((_, slot) => {
        const frame = inwardFrame(progress, aspect, ring, slot);
        const depth = camera.position.z - frame.z;
        const opacity = inwardFrameOpacity({depth, aspect, width, height, x: frame.x - camera.position.x, y: frame.y - camera.position.y});
        assert.ok(opacity >= 0 && opacity <= 1 && Number.isFinite(opacity));
        if (depth <= 0) assert.equal(opacity, 0, 'Images behind the camera are hidden');
        if (opacity <= .02) return;
        for (const x of [-.5, .5]) for (const y of [-.5, .5]) {
          const point = new Vector3(x * dimensions.width, y * dimensions.height, 0)
            .applyEuler(new Euler(0, frame.rotationY, frame.rotationZ))
            .add(new Vector3(frame.x, frame.y, frame.z)).project(camera);
          const pixelX = (point.x + 1) * width / 2;
          const pixelY = (1 - point.y) * height / 2;
          assert.ok(pixelX >= 0 && pixelX <= width, `Full photograph width at ${width}×${height}, p=${progress}`);
          assert.ok(pixelY >= 0 && pixelY <= height - footer + 1, `Full photograph height clears toolbar at ${width}×${height}, p=${progress}: ${pixelY}`);
          projections++;
        }
      }));
    }
  }
  inwardChapters.forEach((chapter, index) => {
    const pose = inwardPose(chapter.progress, aspect);
    const visible = inwardPhotoLayers[index + 1].filter((_, slot) => {
      const frame = inwardFrame(chapter.progress, aspect, index + 1, slot);
      return inwardFrameOpacity({depth: pose.z - frame.z, aspect, width, height, x: frame.x - pose.x, y: frame.y - pose.y}) > .5;
    });
    assert.ok(visible.length >= 3, `Each chapter has visible authentic photographs at ${width}×${height}`);
  });
}
assert.equal(new Set(inwardPhotoLayers.flat()).size, 12, 'All supplied gallery photographs participate');
console.log(JSON.stringify({passed: true,viewports:viewports.length,photographCornerProjections:projections,scope:'Monotonic camera travel, continuity, chapter photography, full-image viewport and toolbar clearance'}));
