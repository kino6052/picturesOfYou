# picturesOfYou
Kirill Novik CSCI 4229: Music Video for the Cure Song "Pictures of You" Made in WebGL

### Instructions

* Result: https://kino6052.github.io/picturesOfYou/
* Press "Play with sound" to start: browsers don't start a video with sound on their own.
* Drag, or use the arrow keys, to look around. Polaroids move out of the pointer's way, or the finger's.
* Space plays and pauses, M mutes, Esc closes the panel.
* "Effects and light" (top right) has the post-processing effects, each with a switch and an amount.

It needs WebGL 2. Under `prefers-reduced-motion` the rain slows right down and the camera has no inertia.

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
| `src/index.html`, `src/style.css` | The page and the HUD's look |
| `src/main.ts` | Startup, frame loop, canvas size, hidden tab, lost GPU context |
| `src/renderer.ts` | Raw WebGL 2: the scene, motion echo and post-processing passes |
| `src/camera.ts`, `src/input.ts` | Looking around; pointer, touch and arrow keys |
| `src/rain.ts` | The falling polaroids and the pointer's push, in flat typed arrays |
| `src/hud.ts`, `src/settings.ts` | HUD behaviour; the effects list and what the renderer reads |
| `src/player.ts`, `src/pulse.ts` | Video and start button; bass level for the audio pulse |
| `src/model.ts` | TV model loading and normals |
| `src/shaders/` | GLSL, imported as text |
| `src/assets/` | Video, sky faces, polaroid atlas and the TV model |
| `scripts/` | Rebuild the sky faces and the atlas from the originals in git history |
| `index.html`, `assets/` | **Build output, committed on purpose. Don't edit**; `bun run build` replaces them |

`vite.config.ts` sets `base: "./"`, so every URL in the build is relative and the page works at
`/picturesOfYou/`. Vite warns that its output folder contains the source folder. That is expected
here: nothing in `src/` is written to, and `emptyOutDir` stays off because it would wipe the repo.

To publish, run `bun run build`, commit the result, and point Pages (Settings > Pages) at the root
of the branch that holds it. `.nojekyll` makes Pages serve the files as they are.

##### Assets

The originals are in the git history (commit `90cd933`, `app/assets/`).

* `pictures.mp4`, from 29 MB to 17 MB. The picture stays 480x360 at 30 fps and was re-encoded; the
  audio is the original AAC track, copied unchanged:

  ```sh
  ffmpeg -i pictures.mp4 -an -c:v libx264 -preset medium -crf 30 -pix_fmt yuv420p video.mp4
  ffmpeg -i video.mp4 -i pictures.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart out.mp4
  ```

* `textures/sky/*.jpg`: `bun scripts/make-sky.ts`. The old cubemap in the history is an office lobby,
  so the faces are built from the background photo instead, repeated and flipped around the viewer.
  That photo is only 576 pixels wide, so the sky stays a little soft on large screens. The script
  also paints the TV's shadow onto the ground; keep it in step with the TV's place in `renderer.ts`.
* `textures/atlas.jpg`: `FFMPEG=path/to/ffmpeg bun scripts/make-atlas.ts`. 24 frames of the video and
  the two old polaroid images, each with a polaroid border, in one texture so they draw in one call.
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
    2. Noise Effect                                       _(stackoverflow.com/questions/4200224/random-noise-functions-for-glsl)
    3. Black and White Effect
    4. Blur Effect                                        _(WebGL Beginner's Guide)
  3. Objects
    1. Planes
       1. Static Texture
       2. Video Texture                                   _(krpano.com/ios/bugs/ios8-webgl-video/)
    2. Blender TV set 3d Model                            _(Turbo-Squid.com)
  4. Skybox from a Background Photo                       _(copyright 2009 Quang-Tuan Luong, terragalleria.com/photo/?ref=usaz44922)
  5. Matrix Math                                          _(gl-matrix)

##### Description
One of the personal goals  I had for this project was to study the WebGL pipeline on the scale ranging from the basic surface generation to the post processing effects. Looking back, I have to admit that WebGL API has a relatively steep learning curve: while separate components made much sense, it was still challenging to connect the dots and achieve the result I had in mind - a complete music video visualization with animation and visual effects. 

I am very proud of the post processing effects applied to the scene. It startles me how flexible per-fragment shading can be and what limitless possiblities it allows for. Adding a random value raning from 0 to 0.2 to each fragment results in the "grain" effect. Shiffting texture coordinates with sine function gives the wave effect, and sampling surrounding texture values allows to have blur effect. Ideally, I wanted to apply DOF filter, but that would have taken more time, as it also requires a separate depth buffer.

I also find it very helpful that WebGL supports video textures and abstracts the details of handling the details of video texture implementation.

One of the challenges was to import an object from Blender. Luckily, there was a great plugin that allows to export vertex and index data. However, I had to apply some post processing to have webgl to properly read the content of the generated arrays. Luckily, the model was well made and had proper normals.

Looking back, I realize that I wasted a lot of time reading "OpenGL Super Bible," as there are easier ways to get started with the API, including the online tutorials and the API documentation.


