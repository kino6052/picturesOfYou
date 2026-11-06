import type { Player } from "./player";

/** What the page's controls change. The renderer reads it every frame. */
export const settings = {
  lightDirection: [0, -1, -1],
  lightDiffuse: 1,
  materialDiffuse: [0.5, 0.5, 0.5],
  wave: 1,
  blur: 1,
  blackAndWhite: false,
};

const input = (id: string) => document.getElementById(id) as HTMLInputElement;

function bindSlider(id: string, apply: (value: number) => void): void {
  const slider = input(id);
  const output = slider.previousElementSibling as HTMLOutputElement;
  const update = () => {
    apply(slider.valueAsNumber);
    output.value = slider.valueAsNumber.toFixed(2);
  };
  slider.addEventListener("input", update);
  update();
}

export function bindControls(player: Player): void {
  ["light-x", "light-y", "light-z"].forEach((id, axis) =>
    bindSlider(id, (value) => (settings.lightDirection[axis] = value)),
  );
  bindSlider("light-diffuse", (value) => (settings.lightDiffuse = value));
  bindSlider("wave", (value) => (settings.wave = value));
  bindSlider("blur", (value) => (settings.blur = value));

  input("material").addEventListener("input", (event) => {
    const hex = (event.target as HTMLInputElement).value;
    settings.materialDiffuse = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
  });
  input("black-and-white").addEventListener("change", (event) => {
    settings.blackAndWhite = (event.target as HTMLInputElement).checked;
  });
  input("play").addEventListener("click", () => player.play());
  input("pause").addEventListener("click", () => player.pause());
}
