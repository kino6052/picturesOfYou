// Builds the six cube faces in src/assets/textures/sky/ from the original background photo.
// The photo repeats around the viewer, flipped every other time, so every join meets itself.
// Above it the clouds fade into a plain zenith; below it the ground continues as noise.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const FACE_SIZE = 1024;
const OUTPUT = "src/assets/textures/sky";
const CREDIT =
  "copyright 2009 Quang-Tuan Luong, all rights reserved. This image from http://www.terragalleria.com/photo/?ref=usaz44922";

// The picture inside the photo's frame and credit strip. It only has about 6 pixels per degree,
// so it's enlarged and sharpened here: thin pylons hold up better than if the GPU stretched them.
const SCALE = 4;
const AREA = { left: 13, top: 13, width: 550, height: 364 };
const HORIZON_ROW = 325 * SCALE; // where the hills meet the sky, inside AREA
const PHOTO_DEGREES = 90; // the width of one copy of the photo
const SQUASH = 1.25; // lowers the pylons a little, so their tops stay in view

const original = execFileSync("git", ["show", "90cd933:app/assets/textures/bg.jpg"], { maxBuffer: 1 << 24 });
const { data, info } = await sharp(original)
  .extract(AREA)
  .resize(AREA.width * SCALE, AREA.height * SCALE, { kernel: "lanczos3" })
  .sharpen({ sigma: 2.2, m1: 0.6, m2: 2.4 })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height } = info;
const rowsPerDegree = (width / PHOTO_DEGREES) * SQUASH;

// The same picture with its pylons and wires blurred away: the clouds above them.
const clouds = await sharp(data, { raw: info }).blur(56).raw().toBuffer();

type Color = [number, number, number];

function sample(x: number, y: number, pixels: Buffer = data): Color {
  const [x0, y0] = [Math.floor(x), Math.floor(y)];
  const [fx, fy] = [x - x0, y - y0];
  const at = (px: number, py: number, channel: number) =>
    pixels[(Math.min(height - 1, Math.max(0, py)) * width + Math.min(width - 1, Math.max(0, px))) * 3 + channel];
  const mix = (channel: number) =>
    (at(x0, y0, channel) * (1 - fx) + at(x0 + 1, y0, channel) * fx) * (1 - fy) +
    (at(x0, y0 + 1, channel) * (1 - fx) + at(x0 + 1, y0 + 1, channel) * fx) * fy;
  return [mix(0), mix(1), mix(2)];
}

function averageRows(from: number, to: number): Color {
  const sum: Color = [0, 0, 0];
  for (let y = from; y < to; y++)
    for (let x = 0; x < width; x++) {
      const color = sample(x, y);
      for (let channel = 0; channel < 3; channel++) sum[channel] += color[channel];
    }
  return sum.map((value) => value / ((to - from) * width)) as Color;
}

const ZENITH = averageRows(0, 30 * SCALE);
const GROUND = averageRows(HORIZON_ROW + 12 * SCALE, height - 2);

// Where the TV stands, for the soft shadow under it. Kept in step with src/renderer.ts. The viewer
// never walks, so a shadow painted onto the sky's ground stays in the right place.
const EYE_HEIGHT = 1.6;
const SHADOW = { x: 0, z: -4.6, halfWidth: 1.75, halfDepth: 1.2, darkness: 0.72 };

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};
const blend = (a: Color, b: Color, amount: number): Color => a.map((value, i) => value + (b[i] - value) * amount) as Color;

const hash = (x: number, y: number) => {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
};
function noise(x: number, y: number): number {
  const [x0, y0] = [Math.floor(x), Math.floor(y)];
  const [fx, fy] = [smoothstep(0, 1, x - x0), smoothstep(0, 1, y - y0)];
  const top = hash(x0, y0) * (1 - fx) + hash(x0 + 1, y0) * fx;
  const bottom = hash(x0, y0 + 1) * (1 - fx) + hash(x0 + 1, y0 + 1) * fx;
  return top * (1 - fy) + bottom * fy;
}
const layeredNoise = (x: number, y: number) =>
  noise(x, y) * 0.5 + noise(x * 2.1, y * 2.1) * 0.25 + noise(x * 4.3, y * 4.3) * 0.15 + noise(x * 8.7, y * 8.7) * 0.1;

function skyColor(x: number, y: number, z: number): Color {
  const longitude = (Math.atan2(x, -z) * 180) / Math.PI;
  const latitude = (Math.atan2(y, Math.hypot(x, z)) * 180) / Math.PI;

  const copies = (longitude + PHOTO_DEGREES / 2) / PHOTO_DEGREES;
  const across = copies - Math.floor(copies);
  const column = (Math.floor(copies) % 2 === 0 ? across : 1 - across) * (width - 1);

  // Past the top of the photo, reflect it so the clouds carry on.
  let row = HORIZON_ROW - latitude * rowsPerDegree;
  if (row < 0) row = -row;
  row = Math.min(row, height - 1);

  const photo = sample(column, row);
  if (latitude >= 0) {
    const sky = blend(photo, sample(column, row, clouds), smoothstep(30, 44, latitude));
    return blend(sky, ZENITH, smoothstep(38, 66, latitude));
  }

  // The ground: a plane under the viewer, so its grain shrinks towards the horizon.
  const distance = 1 / Math.max(0.02, -y);
  const grain = layeredNoise(x * distance * 5 + 40, z * distance * 5 + 40);
  const [groundX, groundZ] = [x * distance * EYE_HEIGHT, z * distance * EYE_HEIGHT];
  const shadow = Math.exp(
    -Math.pow(((groundX - SHADOW.x) / SHADOW.halfWidth) ** 2 + ((groundZ - SHADOW.z) / SHADOW.halfDepth) ** 2, 1.5),
  );
  const dirt = GROUND.map((value) => value * (0.7 + grain * 0.62) * (1 - SHADOW.darkness * shadow)) as Color;
  return blend(photo, dirt, smoothstep(-0.5, -4.5, latitude));
}

const FACES: Record<string, (s: number, t: number) => [number, number, number]> = {
  "px": (s, t) => [1, -t, -s],
  "nx": (s, t) => [-1, -t, s],
  "py": (s, t) => [s, 1, t],
  "ny": (s, t) => [s, -1, -t],
  "pz": (s, t) => [s, -t, 1],
  "nz": (s, t) => [-s, -t, -1],
};

const comment = Buffer.from(CREDIT, "latin1");
const marker = Buffer.from([0xff, 0xfe, (comment.length + 2) >> 8, (comment.length + 2) & 255]);

for (const [name, direction] of Object.entries(FACES)) {
  const pixels = Buffer.alloc(FACE_SIZE * FACE_SIZE * 3);
  for (let j = 0; j < FACE_SIZE; j++)
    for (let i = 0; i < FACE_SIZE; i++) {
      const [x, y, z] = direction(((i + 0.5) / FACE_SIZE) * 2 - 1, ((j + 0.5) / FACE_SIZE) * 2 - 1);
      const length = Math.hypot(x, y, z);
      const color = skyColor(x / length, y / length, z / length);
      for (let channel = 0; channel < 3; channel++) pixels[(j * FACE_SIZE + i) * 3 + channel] = color[channel];
    }
  const jpeg = await sharp(pixels, { raw: { width: FACE_SIZE, height: FACE_SIZE, channels: 3 } })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
  // Encoders drop JPEG comments, so the photographer's notice goes back in by hand.
  writeFileSync(`${OUTPUT}/${name}.jpg`, Buffer.concat([jpeg.subarray(0, 2), marker, comment, jpeg.subarray(2)]));
}
console.log(`6 faces -> ${OUTPUT}`);
