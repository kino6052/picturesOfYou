// function drawScene() {
//   setupFramebuffer();

//   renderSceneToFramebuffer();

//   renderFramebufferToScreen();

//   updateAffineTransformationsArray();
// }

// /**
//  * Sets up the framebuffer and initializes WebGL state.
//  */
// function setupFramebuffer() {
//   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//   gl.useProgram(prg);
//   gl.clearColor(0.0, 0.0, 0.0, 1.0);
//   gl.clearDepth(100.0);
//   gl.enable(gl.DEPTH_TEST);
//   gl.depthFunc(gl.LEQUAL);
//   gl.viewport(0, 0, 2048, 2048);
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//   mat4.perspective(45, 2048 / 2048, 0.1, 10000.0, pMatrix);
//   setupCamera();
// }

// /**
//  * Sets up the camera transformation.
//  */
// function setupCamera() {
//   mat4.identity(mvMatrix);
//   mat4.translate(mvMatrix, [0.0, -1.3, -3.0]);
//   mat4.rotate(mvMatrix, (-3.14 * 29) / 180 + mouseY / 10000, [1, 0, 0]);
//   mat4.rotate(mvMatrix, mouseX / 10000, [0, 1, 0]);
// }

// /**
//  * Renders the main scene to the framebuffer.
//  */
// function renderSceneToFramebuffer() {
//   drawScreen();
//   drawBackground();
//   drawRain();
//   drawTV();
//   finalizeFramebufferRendering();
// }

// /**
//  * Draws the textured screen.
//  */
// function drawScreen() {
//   prepareObject([-0.0, 0.65, 0.49], (3.14 * 30) / 180, [1.4, 0.95, 0.0]);
//   bindBuffers(
//     screenVerticesBuffer,
//     screenNormalsBuffer,
//     screenTextureCoordBuffer,
//     prg
//   );
//   bindTexture(videoTexture, videoready ? video : null);
//   drawElements(screenIndicesBuffer, 6);
// }

// /**
//  * Draws the background.
//  */
// function drawBackground() {
//   prepareObject([0, 4, -4], (3.14 * 29) / 180, [20, 10, 10]);
//   bindBuffers(
//     screenVerticesBuffer,
//     screenNormalsBuffer,
//     screenTextureCoordBuffer,
//     prg
//   );
//   bindTexture(backgroundTexture, backgroundTexture.image);
//   drawElements(screenIndicesBuffer, 6);
// }

// /**
//  * Draws the rain.
//  */
// function drawRain() {
//   [polaroidTexture00, polaroidTexture01].forEach((texture, index) => {
//     bindTexture(texture, texture.image);
//     setupTextureParameters();
//     renderDroplets(
//       (index * dropletQuantity) / 4,
//       ((index + 1) * dropletQuantity) / 4
//     );
//   });
// }

// /**
//  * Renders droplets for rain effects.
//  */
// function renderDroplets(start, end) {
//   for (let i = start; i < end; i++) {
//     const transforms = affineTransformationsArray[i];
//     prepareObject(
//       [transforms[3], transforms[4], transforms[5]],
//       transforms.slice(0, 3),
//       [0.3, 0.3, 0.3]
//     );
//     bindBuffers(
//       screenVerticesBuffer,
//       screenNormalsBuffer,
//       screenTextureCoordBuffer,
//       prg
//     );
//     drawElements(screenIndicesBuffer, 6);
//   }
// }

// /**
//  * Draws the TV model.
//  */
// function drawTV() {
//   prepareObject([0, 0, 0], (3.14 * 30) / 180, [0.6, 0.6, 0.6]);
//   bindBuffers(verticesBuffer, tvNormalsBuffer, null, prg);
//   disableTexture();
//   drawElements(indicesBuffer, tv.indices.length);
// }

// /**
//  * Finalizes framebuffer rendering.
//  */
// function finalizeFramebufferRendering() {
//   mat4.set(mvMatrix, nMatrix);
//   mat4.inverse(nMatrix);
//   mat4.transpose(nMatrix);
//   gl.uniformMatrix4fv(prg.uNMatrix, false, nMatrix);
//   gl.flush();
//   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// }

// /**
//  * Renders the framebuffer to the screen.
//  */
// function renderFramebufferToScreen() {
//   gl.useProgram(postPrg);
//   gl.clearColor(0.0, 0.0, 0.0, 1.0);
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
//   gl.viewport(0, 0, c_width, c_height);
//   bindBuffers(
//     screenVerticesBuffer,
//     screenNormalsBuffer,
//     screenTextureCoordBuffer,
//     postPrg
//   );
//   bindTexture(framebufferTexture);
//   mat4.identity(postMatrix);
//   gl.uniformMatrix4fv(postPrg.uMVMatrix, false, postMatrix);
//   gl.uniform1f(postPrg.uTime, time);
//   drawElements(screenIndicesBuffer, 6);
//   gl.flush();
// }

// /**
//  * Prepares the transformation matrix for an object.
//  */
// function prepareObject(translation, rotation, scale) {
//   mvPushMatrix();
//   mat4.translate(mvMatrix, translation);
//   if (Array.isArray(rotation)) {
//     rotation.forEach((angle, i) =>
//       mat4.rotate(mvMatrix, angle, [i === 0, i === 1, i === 2])
//     );
//   } else {
//     mat4.rotate(mvMatrix, rotation, [0, 1, 0]);
//   }
//   mat4.scale(mvMatrix, scale);
// }

// /**
//  * Binds vertex buffers and attributes for rendering.
//  */
// function bindBuffers(vertexBuffer, normalBuffer, textureBuffer, program) {
//   if (vertexBuffer) {
//     gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
//     gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
//   }
//   if (normalBuffer) {
//     gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
//     gl.vertexAttribPointer(program.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
//   }
//   if (textureBuffer) {
//     gl.enableVertexAttribArray(program.aTextureCoord);
//     gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
//     gl.vertexAttribPointer(program.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
//   }
// }

// /**
//  * Binds a texture and optionally uploads new data.
//  */
// function bindTexture(texture, data = null) {
//   if (texture) {
//     gl.bindTexture(gl.TEXTURE_2D, texture);
//     if (data) {
//       gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data);
//     }
//   }
// }

// /**
//  * Sets texture parameters for filtering and mipmaps.
//  */
// function setupTextureParameters() {
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//   gl.texParameteri(
//     gl.TEXTURE_2D,
//     gl.TEXTURE_MIN_FILTER,
//     gl.LINEAR_MIPMAP_NEAREST
//   );
//   gl.generateMipmap(gl.TEXTURE_2D);
// }

// /**
//  * Disables the texture for rendering.
//  */
// function disableTexture() {
//   gl.uniform1i(prg.uIsTextureEnabled, false);
// }

// /**
//  * Draws elements using the provided index buffer.
//  */
// function drawElements(indexBuffer, count) {
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
//   gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
//   gl.bindBuffer(gl.ARRAY_BUFFER, null);
//   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
// }
