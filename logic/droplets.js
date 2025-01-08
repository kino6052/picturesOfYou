/* DROPLET PROPERTIES (AFFINE TRANSFORMATIONS)
 *
 *  Project Location: modules/affine-transformations.js)
 *  Description: an array is created that holds information about
 *  rotation and position of particles
 */
/*
 * AFFINE TRANSFORMATIONS
 */
function initAffineTransformationsArray(
  affineTransformationsArray,
  dropletQuantity,
  spread
) {
  // affineTransformationsArray = []; // start with an empty array
  for (var i = 0; i < dropletQuantity; i++) {
    affineTransformationsArray[i] = new Array(0, 0, 0, 0, 0, 0);
    // Random Angles
    affineTransformationsArray[i][0] = (Math.random() * 1000) % 360;
    affineTransformationsArray[i][1] = (Math.random() * 1000) % 360;
    affineTransformationsArray[i][2] = (Math.random() * 1000) % 360;
    // Random Positions
    affineTransformationsArray[i][3] =
      (((Math.random() * 10000) % spread) - spread / 2) / 1000;
    affineTransformationsArray[i][4] =
      10 - ((Math.random() * 10000) % 10000) / 1000;
    affineTransformationsArray[i][5] =
      (((Math.random() * 10000) % spread) - spread / 2) / 1000;
  }
}

function updateAffineTransformationsArray(
  affineTransformationsArray,
  dropletQuantity,
  rotationSpeed,
  speed
) {
  for (var i = 0; i < dropletQuantity; i++) {
    // Update Angles
    affineTransformationsArray[i][1] -= rotationSpeed;
    affineTransformationsArray[i][1] = affineTransformationsArray[i][1] % 360; // fall
    // Update Verticeal Position
    affineTransformationsArray[i][4] -= speed;
    if (affineTransformationsArray[i][4] < -5) {
      affineTransformationsArray[i][4] = 5;
    }
  }
}
