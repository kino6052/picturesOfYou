/**
 * The falling polaroids, simulated on the CPU in flat arrays: nothing is allocated per frame,
 * and the only thing sent to the GPU is one small buffer of positions and rotations.
 */

/** The atlas layout, kept in step with scripts/make-atlas.ts. */
export const ATLAS_COLUMNS = 6;
export const ATLAS_ROWS = 5;
const PICTURES = 26;

export const GROUND = -1.6;
export const CEILING = 8;

const MIN_RADIUS = 1.6;
const MAX_RADIUS = 15;
const TV_DISTANCE = 4.4;
const TV_HALF_ANGLE = 0.42; // radians either side of straight ahead
const IN_FRONT_OF_TV = 0.06; // the share of pictures allowed to cross in front of it

const MIN_SIZE = 0.24;
const MAX_SIZE = 0.62;
const MIN_FALL = 0.3;
const MAX_FALL = 1.05;

const TUMBLE = 0.7; // radians per second, at most, around each axis
const SWAY = 0.32; // how far a picture slips from side to side
const ROCK = 0.6; // radians it rocks as it slips
const MIN_FLUTTER = 0.9; // radians per second
const MAX_FLUTTER = 2.3;

// The push reaches this far from the pointer's ray. It widens with distance, so the
// same patch of screen clears however deep the pictures in it are.
const PUSH_REACH = 0.28;
const PUSH_REACH_PER_DEPTH = 0.17;
const PUSH_FORCE = 15; // per second squared, times the reach
const PUSH_SPIN = 7;
const PUSH_RATE = 7; // how fast the push fades in and out, per second
const DRAG = 2.4; // how fast a pushed picture slows down, per second
const SPIN_DRAG = 1.5;

const random = (min: number, max: number) => min + Math.random() * (max - min);

export type Rain = ReturnType<typeof createRain>;

export function createRain(count: number) {
  const [x, y, z] = [new Float32Array(count), new Float32Array(count), new Float32Array(count)];
  const [pushX, pushY, pushZ] = [new Float32Array(count), new Float32Array(count), new Float32Array(count)];
  const [turnX, turnY, turnZ] = [new Float32Array(count), new Float32Array(count), new Float32Array(count)];
  const [tumbleX, tumbleY, tumbleZ] = [new Float32Array(count), new Float32Array(count), new Float32Array(count)];
  const [kickX, kickZ] = [new Float32Array(count), new Float32Array(count)];
  const [fall, phase, flutter] = [new Float32Array(count), new Float32Array(count), new Float32Array(count)];

  /** Per picture: x, y, z, then its turn around x, y, z. Rewritten every frame. */
  const instances = new Float32Array(count * 6);
  /** Per picture: atlas tile, size. Never changes. */
  const looks = new Float32Array(count * 2);

  let clock = 0;
  let strength = 0;

  /** Somewhere on the ring around the viewer, mostly keeping the view of the TV clear. */
  function place(index: number): void {
    for (;;) {
      const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.random() ** 1.45;
      const angle = random(-Math.PI, Math.PI);
      const blocksTV = radius < TV_DISTANCE && Math.abs(angle) < TV_HALF_ANGLE;
      if (blocksTV && Math.random() > IN_FRONT_OF_TV) continue;
      x[index] = Math.sin(angle) * radius;
      z[index] = -Math.cos(angle) * radius;
      return;
    }
  }

  for (let i = 0; i < count; i++) {
    place(i);
    y[i] = random(GROUND, CEILING);
    turnX[i] = random(0, Math.PI * 2);
    turnY[i] = random(0, Math.PI * 2);
    turnZ[i] = random(0, Math.PI * 2);
    tumbleX[i] = random(-TUMBLE, TUMBLE);
    tumbleY[i] = random(-TUMBLE, TUMBLE);
    tumbleZ[i] = random(-TUMBLE, TUMBLE) * 0.5;
    fall[i] = random(MIN_FALL, MAX_FALL);
    phase[i] = random(0, Math.PI * 2);
    flutter[i] = random(MIN_FLUTTER, MAX_FLUTTER);
    looks[i * 2] = i % PICTURES;
    looks[i * 2 + 1] = random(MIN_SIZE, MAX_SIZE);
  }

  return {
    count,
    instances,
    looks,

    /**
     * Moves everything on by `seconds`. `motion` scales the falling and tumbling, for
     * reduced motion; the push ignores it, because the viewer is the one causing that.
     * `ray` holds the pointer's eye and unit direction.
     */
    update(seconds: number, motion: number, ray: Float32Array, pushing: boolean): void {
      const step = seconds * motion;
      clock += step;
      strength += ((pushing ? 1 : 0) - strength) * (1 - Math.exp(-PUSH_RATE * seconds));

      const rayX = ray[0];
      const rayY = ray[1];
      const rayZ = ray[2];
      const alongX = ray[3];
      const alongY = ray[4];
      const alongZ = ray[5];
      const drag = Math.exp(-DRAG * seconds);
      const spinDrag = Math.exp(-SPIN_DRAG * seconds);
      const force = PUSH_FORCE * strength * seconds;

      for (let i = 0; i < count; i++) {
        const wobble = clock * flutter[i] + phase[i];
        const sin = Math.sin(wobble);
        const cos = Math.cos(wobble);

        // Paper drops fastest when it's edge-on, at the ends of each swing.
        y[i] -= fall[i] * (0.75 + 0.5 * sin * sin) * step;
        turnX[i] += (tumbleX[i] * motion + kickX[i]) * seconds;
        turnY[i] += tumbleY[i] * step;
        turnZ[i] += (tumbleZ[i] * motion + kickZ[i]) * seconds;

        const shownX = x[i] + SWAY * sin;
        const shownZ = z[i] + SWAY * 0.6 * cos;

        if (strength > 0.001) {
          const fromX = shownX - rayX;
          const fromY = y[i] - rayY;
          const fromZ = shownZ - rayZ;
          const depth = fromX * alongX + fromY * alongY + fromZ * alongZ;
          const offX = fromX - depth * alongX;
          const offY = fromY - depth * alongY;
          const offZ = fromZ - depth * alongZ;
          const offSquared = offX * offX + offY * offY + offZ * offZ;
          const reach = PUSH_REACH + depth * PUSH_REACH_PER_DEPTH;

          if (depth > 0 && offSquared < reach * reach) {
            const off = Math.sqrt(offSquared) || 0.001;
            const closeness = 1 - offSquared / (reach * reach);
            const shove = force * reach * closeness * closeness;
            pushX[i] += (offX / off) * shove;
            pushY[i] += (offY / off) * shove;
            pushZ[i] += (offZ / off) * shove;
            kickX[i] += (offY / off) * shove * PUSH_SPIN;
            kickZ[i] -= (offX / off) * shove * PUSH_SPIN;
          }
        }

        x[i] += pushX[i] * seconds;
        y[i] += pushY[i] * seconds;
        z[i] += pushZ[i] * seconds;
        pushX[i] *= drag;
        pushY[i] *= drag;
        pushZ[i] *= drag;
        kickX[i] *= spinDrag;
        kickZ[i] *= spinDrag;

        if (y[i] < GROUND) {
          place(i);
          y[i] = CEILING;
          pushX[i] = pushY[i] = pushZ[i] = kickX[i] = kickZ[i] = 0;
        }

        const at = i * 6;
        instances[at] = shownX;
        instances[at + 1] = y[i];
        instances[at + 2] = shownZ;
        instances[at + 3] = turnX[i] + ROCK * sin;
        instances[at + 4] = turnY[i];
        instances[at + 5] = turnZ[i] + ROCK * 0.5 * cos;
      }
    },
  };
}
