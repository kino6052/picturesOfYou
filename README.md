# picturesOfYou

Kirill Novik CSCI 4229: Music Video for the Cure Song "Pictures of You" Made in WebGL

##### Project Layout
Project Components:                                       Attributions:

  1. Vertex and Fragment Shaders                          
    1. Goroud Shading                                     WebGL Beginner's Guide
    2. Lambert Lighting                                   WebGL Beginner's Guide
    3. Textures                                           WebGL Beginner's Guide, webglacademy.com
  2. Post-processing Vertex and Fragment Shaders
    1. Wave Effect                                        OpenGL_Programming wiki book          
    2. Noise Effect                                       stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
    3. Black and White Effect
    4. Blur Effect                                        WebGL Beginner's Guide
  3. Objects
    1. Planes
       1. Static Texture
       2. Video Texture                                   krpano.com/ios/bugs/ios8-webgl-video/
    2. Blender TV set 3d Model                            Turbo-Squid.com 

##### Description
One of the personal goals  I had for this project was to study the WebGL pipeline on the scale ranging from the basic surface generation to the post processing effects. Looking back, I have to admit that WebGL API has a relatively steep learning curve: while separate components made much sense, it was still challenging to connect the dots and achieve the result I had in mind - a complete music video visualization with animation and visual effects. 

I am very proud of the post processing effects applied to the scene. It startles me how flexible per-fragment shading can be and what limitless possiblities it allows for. Adding a random value raning from 0 to 0.2 to each fragment results in the "grain" effect. Shiffting texture coordinates with sine function gives the wave effect, and sampling surrounding texture values allows to have blur effect. Ideally, I wanted to apply DOF filter, but that would have taken more time, as it also requires a separate depth buffer.

I also find it very helpful that WebGL supports video textures and abstracts the details of handling the details of video texture implementation.

One of the challenges was to import an object from Blender. Luckily, there was a great plugin that allows to export vertex and index data. However, I had to apply some post processing to have webgl to properly read the content of the generated arrays. Luckily, the model was well made and had proper normals.

Looking back, I realize that I wasted a lot of time reading "OpenGL Super Bible," as there are easier ways to get started with the API, including the online tutorials and the API documentation.


