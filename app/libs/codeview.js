var cview = new CodeViewer();

$(window).resize(function () {
  cview.updateCanvasSize();
});

function CodeViewer() {
  this.code = [];

  this.TIMER = 0;
  this.WAIT = 1000;

  this.MODE_VIEW = 0;
  this.MODE_VIEW_AND_CODE = 1;
  this.MODE_VIEW_AND_CONTROLS = 2;
  this.NO_CONTROLS = false;
  this.mode = this.MODE_VIEW;
}

CodeViewer.prototype.updateCanvasSize = function () {
  c_width = $("#canvasContainer").width();
  c_height = $("#canvasContainer").height();
  $("canvas").attr("width", c_width);
  $("canvas").attr("height", c_height);
};

CodeViewer.prototype.createDOMElements = function () {
  var buttons = document.createElement("div");
  buttons.id = "buttons";

  var buttons_code = document.createElement("div");
  buttons_code.id = "buttonsCode";
  buttons_code.innerHTML =
    "<input type='radio' id='btnSourceCode' name='radio' onclick='cview.loadSource(0)' checked='checked'/><label for='btnSourceCode'>WebGL JS</label>" +
    "<input type='radio' id='btnVertexShader' name='radio' onclick='cview.loadSource(1)'  /><label for='btnVertexShader'>Vertex Shader</label>" +
    "<input type='radio' id='btnFragmentShader' name='radio' onclick='cview.loadSource(2)' /><label for='btnFragmentShader'>Fragment Shader</label>" +
    "<input type='radio' id='btnHTML' name='radio' onclick='cview.loadSource(3)' /><label for='btnHTML'>HTML</label>";

  var buttons_canvas = document.createElement("div");
  buttons_canvas.id = "buttonsCanvas";

  var btnFullView = document.createElement("input");
  btnFullView.id = "btnFullView";
  btnFullView.setAttribute("type", "radio");
  btnFullView.setAttribute("name", "mode");
  btnFullView.setAttribute("value", "view");

  var btnShowCode = document.createElement("input");
  btnShowCode.id = "btnShowCode";
  btnShowCode.setAttribute("type", "radio");
  btnShowCode.setAttribute("name", "mode");
  btnShowCode.setAttribute("value", "code");

  var btnShowControls = document.createElement("input");
  btnShowControls.id = "btnShowControls";
  btnShowControls.setAttribute("type", "radio");
  btnShowControls.setAttribute("name", "mode");
  btnShowControls.setAttribute("value", "controls");

  buttons_canvas.appendChild(btnFullView);
  buttons_canvas.appendChild(btnShowCode);
  if (!this.NO_CONTROLS) buttons_canvas.appendChild(btnShowControls);

  buttons.appendChild(buttons_code);
  buttons.appendChild(buttons_canvas);

  var code_container = document.createElement("pre");
  code_container.id = "codeContainer";
  code_container.class = "prettyprint linenums";

  var code_area = document.createElement("code");
  code_area.id = "codeArea";

  code_container.appendChild(code_area);

  return { buttons, code_container };
};

CodeViewer.prototype.setInitialState = function (
  canvas_container,
  code_container,
  buttons_code,
  btnFullView,
  bottom
) {
  if (this.mode == this.MODE_VIEW) {
    canvas_container.style.width = "100%";
    code_container.style.display = "none";
    buttons_code.style.display = "none";
    btnFullView.checked = true;
    bottom.style.display = "block";
  } else if (this.mode == this.MODE_CODE_AND_VIEW) {
    code_container.style.display = "block";
    buttons_code.style.display = "block";

    btnFullView.checked = false;
    bottom.style.display = "block";
  } else if (this.mode == this.MODE_VIEW_AND_CONTROLS) {
    canvas_container.style.width = "39%";
    code_container.style.display = "none";
    buttons_code.style.display = "none";
    bottom.style.width = "60%";
    bottom.style.position = "relative";
  }
};

CodeViewer.prototype.assembleGUI = function (buttons, code_container) {
  if (this.mode == this.MODE_VIEW_AND_CONTROLS) {
    $("#contents").prepend($("#bottom").detach());
  }

  $("#buttonsCanvas").buttonset();
  $("#buttonsCode").buttonset();

  $('input[name="mode"]').change(function () {
    var mode = $('input[name="mode"]:checked').val();
    if (mode == "view") {
      cview.showView();
    } else if (mode == "controls") {
      cview.showViewAndControls();
    } else if (mode == "code") {
      cview.showViewAndCode();
    }
  });
};

CodeViewer.prototype.showCanvas = function () {
  this.updateCanvasSize();
  var selector;
  if (this.mode == this.MODE_VIEW) {
    selector = "#canvasContainer";
  } else if (this.mode == this.MODE_VIEW_AND_CONTROLS) {
    selector = "#canvasContainer, #bottom";
  }

  $(selector).fadeIn(600);
};

CodeViewer.prototype.updateGUI = function () {
  var canvas_container = document.getElementById("canvasContainer");
  var bottom = document.getElementById("bottom");

  var { buttons, code_container } = this.createDOMElements();
  var buttons_code = buttons.querySelector("#buttonsCode");
  var btnFullView = buttons.querySelector("#btnFullView");

  this.setInitialState(
    canvas_container,
    code_container,
    buttons_code,
    btnFullView,
    bottom
  );
  this.assembleGUI(buttons, code_container);
  this.showCanvas();
};

CodeViewer.prototype.run = function (m, nc) {
  if (m != null) this.mode = m;
  if (nc != null && nc == true) this.NO_CONTROLS = true;

  if (this.mode == this.MODE_VIEW_AND_CODE) {
    $("#canvasContainer").before(
      "<pre id='codeContainer' class='prettyprint linenums'><p class='wait'>One moment please. Loading source code ...</p></pre>"
    );
  }

  $("#canvasContainer, #bottom").fadeIn(600);
  this.TIMER = setInterval(
    (function (self) {
      return function () {
        self.execute();
      };
    })(this),
    this.WAIT
  );
};

CodeViewer.prototype.execute = function () {
  if (this.TIMER) clearInterval(this.TIMER);

  this.code[0] = window.prettyPrintOne($("#code-js").html(), "js", true);
  this.code[1] = window.prettyPrintOne($("#shader-vs").html(), "js", true);
  this.code[2] = window.prettyPrintOne($("#shader-fs").html(), "js", true);

  $("#codeContainer, #cview").remove();
  var html = $(document.body)
    .html()
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  html = "&lt;body onLoad='runWebGLApp()'&gt;" + html + "&lt;/body&gt;";
  this.code[3] = window.prettyPrintOne(html, "html", true);

  this.updateGUI();
  this.loadSource(0);
};
