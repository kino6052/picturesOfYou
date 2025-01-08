class Utils {
  /**
   * Obtains a WebGL context for the canvas with the given id.
   * This function is invoked when the WebGL app is starting.
   * @param {string} name - The id of the canvas element.
   * @returns {WebGLRenderingContext|null} The WebGL context, or null if unavailable.
   */
  getGLContext(name) {
    const getContext = (canvas, names) => {
      for (const name of names) {
        const context = canvas.getContext(name);
        if (context) return context;
      }
      return null;
    };

    const canvas = document.getElementById(name);
    if (!canvas) {
      alert("There is no canvas on this page");
      return null;
    }

    const names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    const ctx = getContext(canvas, names);

    if (!ctx) {
      alert("Could not initialise WebGL");
      return null;
    }
    return ctx;
  }

  /**
   * Utility function to set up shaders using an embedded script element.
   * The script element should have its type attribute set to either "x-shader/x-fragment" or "x-shader/x-vertex".
   * The function compiles the shader and returns it.
   * @param {WebGLRenderingContext} renderingContext - The WebGL rendering context.
   * @param {string} scriptId - The id of the script element containing the shader source.
   * @returns {WebGLShader|null} The compiled shader, or null if an error occurred.
   */
  getShader(renderingContext, scriptId) {
    const script = document.getElementById(scriptId);
    if (!script) return null;

    const shaderType =
      script.type === "x-shader/x-fragment"
        ? renderingContext.FRAGMENT_SHADER
        : script.type === "x-shader/x-vertex"
        ? renderingContext.VERTEX_SHADER
        : null;
    if (!shaderType) return null;

    const shader = renderingContext.createShader(shaderType);
    renderingContext.shaderSource(shader, script.textContent);
    renderingContext.compileShader(shader);

    if (
      !renderingContext.getShaderParameter(
        shader,
        renderingContext.COMPILE_STATUS
      )
    ) {
      alert(renderingContext.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  /**
   * Calculates normals for a set of vertices and indices.
   * Indices must be fully defined; only TRIANGLES are supported, not TRIANGLE_STRIP.
   * @param {number[]} vertices - The vertex positions.
   * @param {number[]} indices - The indices defining the triangles.
   * @returns {number[]} The calculated normals.
   */
  calculateNormals(vertices, indices) {
    const normals = new Array(vertices.length).fill(0);

    for (let i = 0; i < indices.length; i += 3) {
      const [i0, i1, i2] = [indices[i], indices[i + 1], indices[i + 2]];
      const v0 = vertices.slice(i0 * 3, i0 * 3 + 3);
      const v1 = vertices.slice(i1 * 3, i1 * 3 + 3);
      const v2 = vertices.slice(i2 * 3, i2 * 3 + 3);

      const cross = (a, b) => [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
      ];

      const sub = (a, b) => a.map((val, idx) => val - b[idx]);

      const normal = cross(sub(v1, v0), sub(v2, v1));

      for (const idx of [i0, i1, i2]) {
        normals[idx * 3] += normal[0];
        normals[idx * 3 + 1] += normal[1];
        normals[idx * 3 + 2] += normal[2];
      }
    }

    for (let i = 0; i < normals.length; i += 3) {
      const len = Math.hypot(normals[i], normals[i + 1], normals[i + 2]);
      if (len > 0) {
        normals[i] /= len;
        normals[i + 1] /= len;
        normals[i + 2] /= len;
      }
    }

    return normals;
  }

  /**
   * Calculates tangents for a set of vertices and normals.
   * Tangent calculation logic should be implemented here.
   * @param {number[]} vertices - The vertex positions.
   * @param {number[]} normals - The vertex normals.
   * @returns {number[]} The calculated tangents.
   */
  calculateTangents(vertices, normals) {
    const tangents = new Array(vertices.length).fill(0.0);
    // Tangent calculation logic should be implemented here
    return tangents;
  }

  /**
   * Provides requestAnimationFrame in a cross-browser way.
   * @param {Function} callback - The callback to execute on the next frame.
   */
  requestAnimFrame(callback) {
    const fn =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      ((cb) => window.setTimeout(cb, 1000 / 60));
    fn(callback);
  }
}

// Usage:
const utils = new Utils();
