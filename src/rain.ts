/** One falling polaroid: rotation angles around x, y, z, and its position. */
export interface Droplet {
  rotation: [number, number, number];
  position: [number, number, number];
}

const SPREAD = 3;
const FALL_SPEED = 0.01;
const SPIN_SPEED = 0.01;
const FLOOR = -5;
const CEILING = 5;

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomAngle = () => random(0, 360);
const randomOffset = () => random(-SPREAD / 2, SPREAD / 2);

export const createDroplets = (count: number): Droplet[] =>
  Array.from({ length: count }, () => ({
    rotation: [randomAngle(), randomAngle(), randomAngle()],
    position: [randomOffset(), random(0, 10), randomOffset()],
  }));

/** Advances the rain by `steps` animation steps (one step is 1/60 s). */
export function updateDroplets(droplets: Droplet[], steps: number): void {
  for (const { rotation, position } of droplets) {
    rotation[1] -= SPIN_SPEED * steps;
    position[1] -= FALL_SPEED * steps;
    if (position[1] < FLOOR) position[1] = CEILING;
  }
}
