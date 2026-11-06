# picturesOfYou
Kirill Novik CSCI 4229: Music Video for the Cure Song "Pictures of You" Made in WebGL

### Instructions

* Result: https://kino6052.github.io/picturesOfYou/
* Press "Play with sound" to start: browsers don't start a video with sound on their own.
* Move the pointer over the picture (or drag sideways on a phone) to turn the camera.

##### Running it

You need [pnpm](https://pnpm.io) for the packages and [Bun](https://bun.sh) to run the scripts.

```sh
pnpm install
bun run dev      # development server with live reload
bun run build    # type check, then build into the repo root
bun run preview  # serve the build locally
```

The page has to come from a web server; opening `index.html` as a file doesn't work.

##### File layout

GitHub Pages serves the root of a branch, so the built page sits in the root next to its source:

| Path | What it is |
| --- | --- |
| `src/` | **All the source. Edit here.** |
| `src/index.html`, `src/style.css` | The page |
| `src/main.ts` | Startup, frame loop, canvas size, hidden tab, lost GPU context |
| `src/renderer.ts` | Raw WebGL: the scene pass and the post-processing pass |
| `src/rain.ts`, `src/model.ts` | Falling polaroids; TV model loading and normals |
| `src/player.ts`, `src/controls.ts` | Video and start button; light and effect controls |
| `src/shaders/` | GLSL, imported as text |
| `src/assets/` | Video, textures and the TV model |
| `index.html`, `assets/` | **Build output, committed on purpose. Don't edit**; `bun run build` replaces them |

`vite.config.ts` sets `base: "./"`, so every URL in the build is relative and the page works at
`/picturesOfYou/`. Vite warns that its output folder contains the source folder. That is expected
here: nothing in `src/` is written to, and `emptyOutDir` stays off because it would wipe the repo.

To publish, run `bun run build`, commit the result, and point Pages (Settings > Pages) at the root
of the branch that holds it. `.nojekyll` makes Pages serve the files as they are.

##### Assets

The originals are in the git history (commit `90cd933`, `app/assets/`). They were made smaller with
[ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static) and [sharp](https://sharp.pixelplumbing.com):

* `pictures.mp4`, from 29 MB to 17 MB. The picture stays 480x360 at 30 fps and was re-encoded; the
  audio is the original AAC track, copied unchanged:

  ```sh
  ffmpeg -i pictures.mp4 -an -c:v libx264 -preset medium -crf 30 -pix_fmt yuv420p video.mp4
  ffmpeg -i video.mp4 -i pictures.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart out.mp4
  ```

* `textures/*.jpg`: `sharp(file).jpeg({ quality: 72, mozjpeg: true })`. The copyright comment of
  `bg.jpg` was put back afterwards.
* `tv.bin`: the `vertices` and `indices` arrays of the old `tv.js`, unchanged. Two uint32 counts,
  then the float32 vertices, then the uint16 indices.

##### Project Layout
Project Components:                                       (Attributions)

  1. Vertex and Fragment Shaders                          
    1. Goroud Shading                                     _(WebGL Beginner's Guide)
    2. Lambert Lighting                                   _(WebGL Beginner's Guide)
    3. Textures                                           _(WebGL Beginner's Guide, webglacademy.com)
  2. Post-processing Vertex and Fragment Shaders
    1. Wave Effect                                        _(OpenGL_Programming wiki book)          
    2. Noise Effect                                       _(stackoverflow.com/questions/4200224/random-noise-functions-for-glsl) (no longer applied by the shader)
    3. Black and White Effect
    4. Blur Effect                                        _(WebGL Beginner's Guide)
  3. Objects
    1. Planes
       1. Static Texture
       2. Video Texture                                   _(krpano.com/ios/bugs/ios8-webgl-video/)
    2. Blender TV set 3d Model                            _(Turbo-Squid.com)
  4. Background Photo                                     _(copyright 2009 Quang-Tuan Luong, terragalleria.com/photo/?ref=usaz44922)
  5. Matrix Math                                          _(gl-matrix)

##### Description
One of the personal goals  I had for this project was to study the WebGL pipeline on the scale ranging from the basic surface generation to the post processing effects. Looking back, I have to admit that WebGL API has a relatively steep learning curve: while separate components made much sense, it was still challenging to connect the dots and achieve the result I had in mind - a complete music video visualization with animation and visual effects. 

I am very proud of the post processing effects applied to the scene. It startles me how flexible per-fragment shading can be and what limitless possiblities it allows for. Adding a random value raning from 0 to 0.2 to each fragment results in the "grain" effect. Shiffting texture coordinates with sine function gives the wave effect, and sampling surrounding texture values allows to have blur effect. Ideally, I wanted to apply DOF filter, but that would have taken more time, as it also requires a separate depth buffer.

I also find it very helpful that WebGL supports video textures and abstracts the details of handling the details of video texture implementation.

One of the challenges was to import an object from Blender. Luckily, there was a great plugin that allows to export vertex and index data. However, I had to apply some post processing to have webgl to properly read the content of the generated arrays. Luckily, the model was well made and had proper normals.

Looking back, I realize that I wasted a lot of time reading "OpenGL Super Bible," as there are easier ways to get started with the API, including the online tutorials and the API documentation.


