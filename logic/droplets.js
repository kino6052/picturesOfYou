// Helper function to generate a random value in a range [min, max)
const getRandomInRange = (min, max) => Math.random() * (max - min) + min;

// Helper function to generate a random angle (0-360)
const getRandomAngle = () => getRandomInRange(0, 360);

// Helper function to generate a random position (within a given spread)
const getRandomPosition = (spread) =>
  getRandomInRange(-spread / 2, spread / 2) / 1000;

function resetAndAddItems(arrayRef, newItems) {
  // Clear the array
  arrayRef.length = 0;

  // Push new items into the array
  arrayRef.push(...newItems);
}

// Function to initialize the affine transformations array for droplets
const initAffineTransformationsArray = (
  affineTransformationsArray,
  dropletQuantity,
  spread
) => {
  const next = Array.from({ length: dropletQuantity }, () => [
    getRandomAngle(), // Random Angle 1
    getRandomAngle(), // Random Angle 2
    getRandomAngle(), // Random Angle 3
    getRandomPosition(spread), // Random Position X
    10 - getRandomInRange(0, 10), // Random Position Y (from 10 to 0)
    getRandomPosition(spread), // Random Position Z
  ]);
  resetAndAddItems(affineTransformationsArray, next);
};

// Function to update the affine transformations array for droplets
const updateAffineTransformationsArray = (
  affineTransformationsArray,
  rotationSpeed,
  speed
) => {
  const next = affineTransformationsArray.map((transformation) => {
    // Update angles
    const updatedAngle = transformation[1] - rotationSpeed;

    // Update vertical position
    let updatedPositionY = transformation[4] - speed;
    if (updatedPositionY < -5) {
      updatedPositionY = 5;
    }

    return [
      transformation[0], // Keep angle 1 unchanged
      updatedAngle, // Update angle 2
      transformation[2], // Keep angle 3 unchanged
      transformation[3], // Keep position X unchanged
      updatedPositionY, // Update position Y
      transformation[5], // Keep position Z unchanged
    ];
  });

  resetAndAddItems(affineTransformationsArray, next);
};
