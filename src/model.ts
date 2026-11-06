export interface Model {
  vertices: Float32Array<ArrayBuffer>;
  normals: Float32Array<ArrayBuffer>;
  indices: Uint16Array<ArrayBuffer>;
}

/** Reads the TV model. Layout of tv.bin: two uint32 counts, float32 vertices, uint16 indices. */
export async function loadModel(url: string): Promise<Model> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const data = await response.arrayBuffer();

  const [vertexCount, indexCount] = new Uint32Array(data, 0, 2);
  const vertices = new Float32Array(data, 8, vertexCount);
  const indices = new Uint16Array(data, 8 + vertexCount * 4, indexCount);
  return { vertices, indices, normals: calculateNormals(vertices, indices) };
}

/** Smooth vertex normals: the sum of the face normals around each vertex, normalized. */
function calculateNormals(vertices: Float32Array, indices: Uint16Array): Float32Array<ArrayBuffer> {
  const sums = new Float64Array(vertices.length);

  for (let i = 0; i < indices.length; i += 3) {
    const [a, b, c] = [indices[i] * 3, indices[i + 1] * 3, indices[i + 2] * 3];
    const [ux, uy, uz] = [vertices[b] - vertices[a], vertices[b + 1] - vertices[a + 1], vertices[b + 2] - vertices[a + 2]];
    const [vx, vy, vz] = [vertices[c] - vertices[b], vertices[c + 1] - vertices[b + 1], vertices[c + 2] - vertices[b + 2]];
    const normal = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];

    for (const vertex of [a, b, c]) {
      sums[vertex] += normal[0];
      sums[vertex + 1] += normal[1];
      sums[vertex + 2] += normal[2];
    }
  }

  for (let i = 0; i < sums.length; i += 3) {
    const length = Math.hypot(sums[i], sums[i + 1], sums[i + 2]) || 1;
    sums[i] /= length;
    sums[i + 1] /= length;
    sums[i + 2] /= length;
  }
  return Float32Array.from(sums);
}
