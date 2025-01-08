const generateRandomValue = (min, max) => Math.random() * (max - min) + min;

const generateRandomAngle = () => generateRandomValue(0, 360);

const calculateRandomPosition = (spread) =>
  generateRandomValue(-spread / 2, spread / 2) / 1000;

const generateRandomVerticalPosition = () => 10 - generateRandomValue(0, 10);

const replaceArrayContents = (arrayRef, newItems) => {
  arrayRef.length = 0;
  arrayRef.push(...newItems);
};
