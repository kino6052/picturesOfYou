// Builds src/assets/textures/atlas.jpg: the polaroids, 6x5 tiles of 320x384.
// Reads the originals from git history. Needs ffmpeg: on PATH, or set FFMPEG (see ffmpeg-static).
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ORIGINALS = "90cd933:app/assets";
const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const OUTPUT = "src/assets/textures/atlas.jpg";

// Hand-picked from frames scored for brightness, contrast, sharpness and difference from each other.
const VIDEO_SECONDS = [
  5.25, 11.25, 23.25, 36.75, 50.25, 54.75, 59.25, 63.75, 69.75, 80.25, 86.25, 110.25, 140.25, 153.75, 161.25, 167.25,
  180.75, 194.25, 216.75, 219.75, 231.75, 239.25, 255.75, 282.75,
];
const STILLS = ["polaroid.jpg", "polaroid04.jpg"];

// Keep in step with ATLAS_COLUMNS, ATLAS_ROWS and PICTURES in src/rain.ts.
const COLUMNS = 6;
const ROWS = 5;
const TILE = { width: 320, height: 384 };
const PHOTO = { size: 288, inset: 16 };
const PAPER = { r: 243, g: 240, b: 231 };

const fromGit = (path: string) => execFileSync("git", ["show", `${ORIGINALS}/${path}`], { maxBuffer: 1 << 26 });

execFileSync("sh", ["-c", `git show ${ORIGINALS}/pictures.mp4 > /tmp/pictures-original.mp4`]);
const frame = (seconds: number) =>
  execFileSync(
    FFMPEG,
    ["-loglevel", "error", "-ss", `${seconds}`, "-i", "/tmp/pictures-original.mp4", "-frames:v", "1", "-vf", "crop=360:360", "-f", "image2pipe", "-c:v", "png", "-"],
    { maxBuffer: 1 << 26 },
  );

const photos = [...VIDEO_SECONDS.map(frame), ...STILLS.map((name) => fromGit(`textures/${name}`))];

const hairline = Buffer.from(
  `<svg width="${PHOTO.size}" height="${PHOTO.size}"><rect x="0.5" y="0.5" width="${PHOTO.size - 1}" height="${PHOTO.size - 1}" fill="none" stroke="#000" stroke-opacity="0.35"/></svg>`,
);

// Shuffled in a fixed order so neighbours in the video don't sit together in the rain.
const tiles = await Promise.all(
  photos.map(async (photo, index) => {
    const tile = (index * 7) % photos.length;
    return {
      input: await sharp(photo).resize(PHOTO.size, PHOTO.size).composite([{ input: hairline }]).toBuffer(),
      left: (tile % COLUMNS) * TILE.width + PHOTO.inset,
      top: Math.floor(tile / COLUMNS) * TILE.height + PHOTO.inset,
    };
  }),
);

await sharp({ create: { width: COLUMNS * TILE.width, height: ROWS * TILE.height, channels: 3, background: PAPER } })
  .composite(tiles)
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUTPUT);

console.log(`${photos.length} pictures -> ${OUTPUT}`);
