var cview = new CodeViewer();

$(window).resize(function () {
  cview.updateCanvasSize();
});

function CodeViewer() {
  this.code = [];
  this.TIMER = 0;
  this.WAIT = 1000;
  this.NO_CONTROLS = false;
  this.mode = this.MODE_VIEW;
}

CodeViewer.prototype.MODE_VIEW = 0;
CodeViewer.prototype.MODE_VIEW_AND_CODE = 1;
CodeViewer.prototype.MODE_VIEW_AND_CONTROLS = 2;

CodeViewer.prototype.updateCanvasSize = function () {
  // global variable
  c_width = $("#canvasContainer").width();
  // global variable
  c_height = $("#canvasContainer").height();
  $("canvas").attr("width", c_width);
  $("canvas").attr("height", c_height);
};

CodeViewer.prototype.createRadioButton = function (id, name, value) {
  const button = document.createElement("input");
  button.id = id;
  button.type = "radio";
  button.name = name;
  button.value = value;
  return button;
};

CodeViewer.prototype.setInitialState = function (canvas_container, bottom) {
  const modeHandlers = {
    [this.MODE_VIEW]: () => {
      canvas_container.style.width = "100%";
      bottom.style.display = "block";
    },
    [this.MODE_VIEW_AND_CODE]: () => {
      bottom.style.display = "block";
    },
    [this.MODE_VIEW_AND_CONTROLS]: () => {
      bottom.style.position = "relative";
    },
  };

  const handler = modeHandlers[this.mode];
  if (handler) {
    handler();
  }
};

CodeViewer.prototype.assembleGUI = function () {
  if (this.mode === this.MODE_VIEW_AND_CONTROLS) {
    $("#contents").prepend($("#bottom").detach());
  }

  $('input[name="mode"]').change(() => {
    const mode = $('input[name="mode"]:checked').val();
    if (mode === "view") {
      cview.showView();
    } else if (mode === "controls") {
      cview.showViewAndControls();
    } else if (mode === "code") {
      cview.showViewAndCode();
    }
  });
};

CodeViewer.prototype.showCanvas = function () {
  this.updateCanvasSize();
  const selector = this.mode === this.MODE_VIEW ? "#canvasContainer" : null;
  if (selector) {
    $(selector).fadeIn(600);
  }
};

CodeViewer.prototype.updateGUI = function () {
  const canvas_container = document.getElementById("canvasContainer");
  const bottom = document.getElementById("bottom");

  this.setInitialState(canvas_container, bottom);
  this.assembleGUI();
  this.showCanvas();
};

CodeViewer.prototype.run = function (m, nc) {
  if (m) this.mode = m;
  if (nc) this.NO_CONTROLS = nc;

  $("#canvasContainer, #bottom").fadeIn(600);
  this.TIMER = setInterval(() => this.execute(), this.WAIT);
};

CodeViewer.prototype.execute = function () {
  this.updateGUI();
};
