/**
 * The viewer stands still and looks around. Dragging and the arrow keys turn the view, and it
 * keeps turning for a moment after a flick. A mouse at rest also shifts the eye a little, which
 * moves near things against far ones.
 */
const radians = (degrees: number) => (degrees * Math.PI) / 180;

const START_PITCH = radians(-2.5);
const MIN_PITCH = radians(-32);
const MAX_PITCH = radians(52);

const FOLLOW_RATE = 16; // how fast the view catches up with where it's aimed, per second
const FRICTION = 3; // how fast a flick dies away, per second
const KEY_SPEED = 1.1; // radians per second
const KEY_RATE = 7;
const STOPPED_AFTER_MS = 90; // a drag held still this long releases without a flick

const PARALLAX_RATE = 2.5;
const PARALLAX_ANGLE = radians(1.2);
const PARALLAX_SHIFT = 0.14;

// Horizontal view of at least this much, so the TV fits on a phone held upright.
const MIN_HORIZONTAL_FOV = radians(62);
const MIN_VERTICAL_FOV = radians(50);
const MAX_VERTICAL_FOV = radians(100);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export type Camera = ReturnType<typeof createCamera>;

export function createCamera(reducedMotion: MediaQueryList) {
  let aimYaw = 0;
  let aimPitch = START_PITCH;
  let viewYaw = aimYaw;
  let viewPitch = aimPitch;
  let flickYaw = 0;
  let flickPitch = 0;
  let dragging = false;
  let lastDragTime = 0;
  let hoverX = 0;
  let hoverY = 0;
  let parallaxX = 0;
  let parallaxY = 0;

  const camera = {
    /** What the renderer reads. */
    yaw: aimYaw,
    pitch: aimPitch,
    eyeX: 0,
    eyeY: 0,
    eyeZ: 0,
    fov: MIN_VERTICAL_FOV,
    aspect: 1,
    /** -1, 0 or 1, from the arrow keys. */
    keyX: 0,
    keyY: 0,

    /** Radians of vertical view per screen pixel, so a dragged point stays under the finger. */
    radiansPerPixel: (height: number) => camera.fov / height,

    startDrag(): void {
      dragging = true;
      flickYaw = flickPitch = 0;
    },

    drag(yaw: number, pitch: number, time: number): void {
      aimYaw += yaw;
      aimPitch = clamp(aimPitch + pitch, MIN_PITCH, MAX_PITCH);
      const seconds = Math.max(time - lastDragTime, 1) / 1000;
      flickYaw += (yaw / seconds - flickYaw) * 0.4;
      flickPitch += (pitch / seconds - flickPitch) * 0.4;
      lastDragTime = time;
    },

    endDrag(time: number): void {
      dragging = false;
      if (time - lastDragTime > STOPPED_AFTER_MS) flickYaw = flickPitch = 0;
    },

    /** Where a resting mouse is, from -1 to 1 on each axis. */
    hover(x: number, y: number): void {
      hoverX = x;
      hoverY = y;
    },

    update(dt: number, width: number, height: number): void {
      const still = reducedMotion.matches;
      camera.aspect = width / height;
      const verticalForWidth = 2 * Math.atan(Math.tan(MIN_HORIZONTAL_FOV / 2) / camera.aspect);
      camera.fov = clamp(verticalForWidth, MIN_VERTICAL_FOV, MAX_VERTICAL_FOV);

      if (still) {
        flickYaw = flickPitch = 0;
        aimYaw -= camera.keyX * KEY_SPEED * dt;
        aimPitch += camera.keyY * KEY_SPEED * dt;
      } else if (!dragging) {
        const keying = camera.keyX !== 0 || camera.keyY !== 0;
        if (keying) {
          flickYaw += (-camera.keyX * KEY_SPEED - flickYaw) * ease(KEY_RATE, dt);
          flickPitch += (camera.keyY * KEY_SPEED - flickPitch) * ease(KEY_RATE, dt);
        } else {
          const slowed = Math.exp(-FRICTION * dt);
          flickYaw *= slowed;
          flickPitch *= slowed;
        }
        aimYaw += flickYaw * dt;
        aimPitch += flickPitch * dt;
      }

      if (aimPitch < MIN_PITCH || aimPitch > MAX_PITCH) {
        aimPitch = clamp(aimPitch, MIN_PITCH, MAX_PITCH);
        flickPitch = 0;
      }

      const follow = still ? 1 : ease(FOLLOW_RATE, dt);
      viewYaw += (aimYaw - viewYaw) * follow;
      viewPitch += (aimPitch - viewPitch) * follow;

      const shift = ease(PARALLAX_RATE, dt);
      parallaxX += ((still || dragging ? 0 : hoverX) - parallaxX) * shift;
      parallaxY += ((still || dragging ? 0 : hoverY) - parallaxY) * shift;

      camera.yaw = viewYaw - parallaxX * PARALLAX_ANGLE;
      camera.pitch = viewPitch + parallaxY * PARALLAX_ANGLE;
      // The eye slides along the view's own sideways direction.
      camera.eyeX = parallaxX * PARALLAX_SHIFT * Math.cos(camera.yaw);
      camera.eyeY = parallaxY * PARALLAX_SHIFT;
      camera.eyeZ = -parallaxX * PARALLAX_SHIFT * Math.sin(camera.yaw);
    },

    /** Fills `ray` with the eye and the unit direction through a screen point (-1 to 1). */
    ray(x: number, y: number, ray: Float32Array): void {
      const reach = Math.tan(camera.fov / 2);
      const cameraX = x * reach * camera.aspect;
      const cameraY = y * reach;
      const sinPitch = Math.sin(camera.pitch);
      const cosPitch = Math.cos(camera.pitch);
      const sinYaw = Math.sin(camera.yaw);
      const cosYaw = Math.cos(camera.yaw);

      // Tilt, then turn: a point straight ahead is at z = -1.
      const tiltedY = cameraY * cosPitch + sinPitch;
      const tiltedZ = cameraY * sinPitch - cosPitch;
      const worldX = cameraX * cosYaw + tiltedZ * sinYaw;
      const worldZ = -cameraX * sinYaw + tiltedZ * cosYaw;
      const length = Math.hypot(worldX, tiltedY, worldZ);

      ray[0] = camera.eyeX;
      ray[1] = camera.eyeY;
      ray[2] = camera.eyeZ;
      ray[3] = worldX / length;
      ray[4] = tiltedY / length;
      ray[5] = worldZ / length;
    },
  };

  return camera;
}
