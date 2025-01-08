/**
 * Initializes an array of affine transformations.
 * Each transformation is represented as an array containing:
 * - Three random angles (in degrees)
 * - Two random spread values (scaled and centered around 0)
 * - One random speed value
 */
function initAffineTransformationsArray() {
  const affineTransformationsArray = []; // start with an empty array
  for (let i = 0; i < dropletQuantity; i++) {
    const randomAngle = () => Math.random() * 360;
    const randomSpread = () => (Math.random() * spread - spread / 2) / 1000;
    const randomSpeed = () => 10 - Math.random() * 10;

    affineTransformationsArray[i] = [
      randomAngle(),
      randomAngle(),
      randomAngle(),
      randomSpread(),
      randomSpeed(),
      randomSpread(),
    ];
  }
  console.log(affineTransformationsArray);
}

/**
 * Updates the affine transformations array by adjusting the rotation and position
 * of each droplet based on the specified speed and rotation speed.
 *
 * - Rotates each droplet by decreasing its angle.
 * - Moves each droplet downwards.
 * - Resets the position if it goes out of bounds.
 */
function updateAffineTransformationsArray() {
  for (let i = 0; i < dropletQuantity; i++) {
    affineTransformationsArray[i][1] =
      (affineTransformationsArray[i][1] - rotationSpeed) % 360; // fall
    affineTransformationsArray[i][4] -= speed;
    if (affineTransformationsArray[i][4] < -5) {
      affineTransformationsArray[i][4] = 5;
    }
  }
}
