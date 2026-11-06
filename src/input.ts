import type { Camera } from "./camera";

/** Where the pointer is, from -1 to 1 on each axis, and whether it's touching the scene. */
export const pointer = { x: 0, y: 0, active: false };

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
};

/** Drag to look, with a mouse or a finger. A mouse also just hovers; a finger only counts while down. */
export function bindInput(canvas: HTMLCanvasElement, camera: Camera): void {
  let dragId: number | null = null;
  let lastX = 0;
  let lastY = 0;

  const aim = (event: PointerEvent) => {
    pointer.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    pointer.y = 1 - (event.clientY / canvas.clientHeight) * 2;
    pointer.active = true;
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (dragId !== null) return;
    dragId = event.pointerId;
    canvas.setPointerCapture(dragId);
    [lastX, lastY] = [event.clientX, event.clientY];
    aim(event);
    camera.startDrag();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId === dragId) {
      const scale = camera.radiansPerPixel(canvas.clientHeight);
      camera.drag((event.clientX - lastX) * scale, (event.clientY - lastY) * scale, event.timeStamp);
      [lastX, lastY] = [event.clientX, event.clientY];
      aim(event);
    } else if (dragId === null && event.pointerType === "mouse") {
      aim(event);
      camera.hover(pointer.x, pointer.y);
    }
  });

  const release = (event: PointerEvent) => {
    if (event.pointerId !== dragId) return;
    dragId = null;
    camera.endDrag(event.timeStamp);
    if (event.pointerType !== "mouse") pointer.active = false;
  };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);
  canvas.addEventListener("pointerleave", () => {
    if (dragId === null) pointer.active = false;
  });

  const held = new Set<string>();
  const steer = () => {
    camera.keyX = camera.keyY = 0;
    for (const key of held) {
      camera.keyX += ARROWS[key][0];
      camera.keyY += ARROWS[key][1];
    }
  };
  window.addEventListener("keydown", (event) => {
    // A focused slider uses the arrow keys itself.
    if (!(event.key in ARROWS) || event.target instanceof HTMLInputElement) return;
    event.preventDefault();
    held.add(event.key);
    steer();
  });
  window.addEventListener("keyup", (event) => {
    held.delete(event.key);
    steer();
  });
  window.addEventListener("blur", () => {
    held.clear();
    steer();
  });
}
