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
  var ld = $("#slider-ld").slider("value");
  gl.uniform4fv(prg.uLightDiffuse, [ld, ld, ld, 1.0]);
  $("#slider-ld-value").html(ld);
}

$("#slider-ld").slider({
  value: 1.0,
  min: -0.01,
  max: 1.01,
  step: 0.01,
  slide: updateLightDiffuseTerm,
});

function updateBlur() {
  gl.useProgram(postPrg);
  var ba = $("#slider-blur").slider("value");
  gl.uniform1f(postPrg.uBlurAmount, ba);
  $("#slider-blur-value").html(ba);
}

$("#slider-blur").slider({
  value: 1.0,
  min: 1.0,
  max: 5.0,
  step: 0.1,
  slide: updateBlur,
});

function updateBlackWhite() {
  gl.useProgram(postPrg);
  if (bw == 1) gl.uniform1i(postPrg.uBW, 1);
  else gl.uniform1f(postPrg.uBW, 0);
}

function updateWave() {
  gl.useProgram(postPrg);
  var wa = $("#slider-wave").slider("value");
  gl.uniform1f(postPrg.uWaveAmount, wa);
  $("#slider-wave-value").html(wa);
}

$("#slider-wave").slider({
  value: 1.0,
  min: 1.0,
  max: 5.0,
  step: 0.1,
  slide: updateWave,
});

function updateLightDirection() {
  gl.useProgram(prg);
  var x = $("#slider-x").slider("value");
  var y = $("#slider-y").slider("value");
  var z = $("#slider-z").slider("value");
  gl.uniform3fv(prg.uLightDirection, [x, y, z]);
  $("#slider-x-value").html(x);
  $("#slider-y-value").html(y);
  $("#slider-z-value").html(z);
}

$("#slider-x").slider({
  value: 0.0,
  min: -1.01,
  max: 1.01,
  step: 0.01,
  slide: updateLightDirection,
});
$("#slider-y").slider({
  value: -1.0,
  min: -1.01,
  max: 1.01,
  step: 0.01,
  slide: updateLightDirection,
});
$("#slider-z").slider({
  value: -1.0,
  min: -1.01,
  max: 1.01,
  step: 0.01,
  slide: updateLightDirection,
});

function updateObjectColor(r, g, b) {
  gl.useProgram(prg);
  gl.uniform4fv(prg.uMaterialDiffuse, [r, g, b, 1.0]);
}

$("#colorSelectorSphere").ColorPicker({
  onSubmit: function (hsb, hex, rgb, el) {
    $(el).val(hex);
    $(el).ColorPickerHide();
  },
  color: "#555555",
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
