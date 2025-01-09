/* UI Event Handlers and Controls */
const SLIDER_CONFIG = {
  lightDiffuse: {
    value: 1.0,
    min: -0.01,
    max: 1.01,
    step: 0.01,
  },
  blur: {
    value: 1.0,
    min: 1.0,
    max: 5.0,
    step: 0.1,
  },
  wave: {
    value: 1.0,
    min: 1.0,
    max: 5.0,
    step: 0.1,
  },
  lightDirection: {
    value: { x: 0.0, y: -1.0, z: -1.0 },
    min: -1.01,
    max: 1.01,
    step: 0.01,
  },
};

let mouseX = 0;
let mouseY = 0;

/**
 * Sets up event handlers for mouse and button interactions.
 */
function setupEventHandlers() {
  $("#canvas-element-id").mousemove((event) => {
    mouseX = event.pageX;
    mouseY = screen.height - event.pageY;
  });

  $("#bw-value").click(() => {
    bw = !bw;
    updateBlackWhite();
  });

  $("#play").click(() => video.play());
  $("#pause").click(() => video.pause());
}

function updateLightDiffuseTerm() {
  gl.useProgram(prg);
  const ld = $("#slider-ld").slider("value");
  gl.uniform4fv(prg.uLightDiffuse, [ld, ld, ld, 1.0]);
  $("#slider-ld-value").html(ld);
}

function updateBlur() {
  gl.useProgram(postPrg);
  const ba = $("#slider-blur").slider("value");
  gl.uniform1f(postPrg.uBlurAmount, ba);
  $("#slider-blur-value").html(ba);
}

function updateBlackWhite() {
  gl.useProgram(postPrg);
  gl.uniform1i(postPrg.uBW, bw ? 1 : 0);
}

function updateWave() {
  gl.useProgram(postPrg);
  const wa = $("#slider-wave").slider("value");
  gl.uniform1f(postPrg.uWaveAmount, wa);
  $("#slider-wave-value").html(wa);
}

function updateLightDirection() {
  gl.useProgram(prg);
  const x = $("#slider-x").slider("value");
  const y = $("#slider-y").slider("value");
  const z = $("#slider-z").slider("value");
  gl.uniform3fv(prg.uLightDirection, [x, y, z]);
  $("#slider-x-value").html(x);
  $("#slider-y-value").html(y);
  $("#slider-z-value").html(z);
}

function updateObjectColor(r, g, b) {
  gl.useProgram(prg);
  gl.uniform4fv(prg.uMaterialDiffuse, [r, g, b, 1.0]);
}

// Initialize sliders
$("#slider-ld").slider({
  ...SLIDER_CONFIG.lightDiffuse,
  slide: updateLightDiffuseTerm,
});

$("#slider-blur").slider({
  ...SLIDER_CONFIG.blur,
  slide: updateBlur,
});

$("#slider-wave").slider({
  ...SLIDER_CONFIG.wave,
  slide: updateWave,
});

$("#slider-x").slider({
  value: SLIDER_CONFIG.lightDirection.value.x,
  min: SLIDER_CONFIG.lightDirection.min,
  max: SLIDER_CONFIG.lightDirection.max,
  step: SLIDER_CONFIG.lightDirection.step,
  slide: updateLightDirection,
});

$("#slider-y").slider({
  value: SLIDER_CONFIG.lightDirection.value.y,
  min: SLIDER_CONFIG.lightDirection.min,
  max: SLIDER_CONFIG.lightDirection.max,
  step: SLIDER_CONFIG.lightDirection.step,
  slide: updateLightDirection,
});

$("#slider-z").slider({
  value: SLIDER_CONFIG.lightDirection.value.z,
  min: SLIDER_CONFIG.lightDirection.min,
  max: SLIDER_CONFIG.lightDirection.max,
  step: SLIDER_CONFIG.lightDirection.step,
  slide: updateLightDirection,
});

// Initialize color picker
$("#colorSelectorSphere").ColorPicker({
  color: "#555555",
  onSubmit: function (hsb, hex, rgb, el) {
    $(el).val(hex);
    $(el).ColorPickerHide();
  },
  onShow: function (colpkr) {
    $(colpkr).fadeIn(500);
    return false;
  },
  onHide: function (colpkr) {
    $(colpkr).fadeOut(500);
    return false;
  },
  onChange: function (hsb, hex, rgb) {
    $("#colorSelectorSphere div").css("backgroundColor", "#" + hex);
    updateObjectColor(rgb.r / 256, rgb.g / 256, rgb.b / 256);
  },
  onBeforeShow: function (colpkr) {
    $(colpkr).ColorPickerSetColor("rgb(0.5,0.8,0.1)");
  },
});
