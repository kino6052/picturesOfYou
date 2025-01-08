/**
 * Loads a shader or script source from an external file and appends it to the document head.
 * @param {string} url - The URL of the file.
 * @param {string} id - The ID for the new script tag.
 * @param {string} type - The type attribute for the script tag (e.g., "x-shader/x-vertex").
 * @returns {Promise<void>} A promise that resolves when the script is appended.
 */
async function loadAndAppendScript(url, id, type) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load: ${url}`);
    }
    const text = await response.text();
    const script = document.createElement("script");
    script.setAttribute("id", id);
    script.setAttribute("type", type);
    script.innerHTML = text;
    document.head.appendChild(script);
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Main function to load all shaders and scripts, then run the WebGL app.
 */
async function run() {
  const scriptsToLoad = [
    {
      url: "./shaders/vertex.glsl",
      id: "shader-vs",
      type: "x-shader/x-vertex",
    },
    {
      url: "./shaders/vertex.post.glsl",
      id: "shader-post-vs",
      type: "x-shader/x-vertex",
    },
    {
      url: "./shaders/fragment.glsl",
      id: "shader-fs",
      type: "x-shader/x-fragment",
    },
    {
      url: "./shaders/fragment.post.glsl",
      id: "shader-post-fs",
      type: "x-shader/x-fragment",
    },
    { url: "./logic/index.js", id: "code-js", type: "text/javascript" },
  ];

  // Load all scripts sequentially
  for (const { url, id, type } of scriptsToLoad) {
    await loadAndAppendScript(url, id, type);
  }

  // Start the WebGL application
  runWebGLApp();
}

run();
