var ReinventedColorWheel = (function () {
  'use strict';

  function hsl2hsv(hsl) {
    var h = hsl[0],
        s = hsl[1] / 100,
        l = hsl[2] / 100,
        sv, v;

    if(l === 0) {
        // no need to do calc on black
        // also avoids divide by 0 error
        return [0, 0, 0];
    }

    l *= 2;
    s *= (l <= 1) ? l : 2 - l;
    v = (l + s) / 2;
    sv = (2 * s) / (l + s);
    return [h, sv * 100, v * 100];
  }

  var hsl2hsv_1 = hsl2hsv;

  function hsv2hsl(hsv) {
    var h = hsv[0],
        s = hsv[1] / 100,
        v = hsv[2] / 100,
        sl, l;

    l = (2 - s) * v;
    sl = s * v;
    sl /= (l <= 1) ? l : 2 - l;
    sl = sl || 0;
    l /= 2;
    return [h, sl * 100, l * 100];
  }

  var hsv2hsl_1 = hsv2hsl;

  var onDragStart;
  var onDragMove;
  var dragging;
  var pointerEventSupported = 'PointerEvent' in window;
  if (!pointerEventSupported && 'ontouchend' in window) {
      onDragStart = function (element, callback) { return element.addEventListener('touchstart', function (event) {
          if (dragging = event.touches.length === 1 && element) {
              event.preventDefault();
              callback(event.targetTouches[0]);
          }
      }); };
      onDragMove = function (element, callback) { return element.addEventListener('touchmove', function (event) {
          if (dragging === element) {
              event.preventDefault();
              callback(event.targetTouches[0]);
          }
      }); };
  }
  else {
      onDragStart = function (element, callback) { return element.addEventListener(pointerEventSupported ? 'pointerdown' : 'mousedown', function (event) {
          if (event.button === 0) {
              dragging = element;
              callback(event);
          }
      }); };
      onDragMove = function (element, callback) { return addEventListener(pointerEventSupported ? 'pointermove' : 'mousemove', function (event) {
          if (dragging === element) {
              callback(event);
          }
      }); };
      addEventListener(pointerEventSupported ? 'pointerup' : 'mouseup', function () { dragging = undefined; });
  }
  var defaultOptions = {
      hsv: [0, 100, 100],
      hsl: [0, 100, 50],
      wheelDiameter: 200,
      wheelThickness: 20,
      handleDiameter: 16,
      onChange: function () { },
  };
  var ReinventedColorWheel = /** @class */ (function () {
      function ReinventedColorWheel(options) {
          var _this = this;
          this.options = options;
          this.wheelDiameter = this.options.wheelDiameter || defaultOptions.wheelDiameter;
          this.wheelThickness = this.options.wheelThickness || defaultOptions.wheelThickness;
          this.handleDiameter = this.options.handleDiameter || defaultOptions.handleDiameter;
          this.onChange = this.options.onChange || defaultOptions.onChange;
          this.rootElement = this.options.appendTo.appendChild(createElementWithClass('div', 'reinvented-color-wheel'));
          this.hueWheelElement = this.rootElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--hue-wheel'));
          this.hueHandleElement = this.rootElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-handle'));
          this.svSpaceElement = this.rootElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--sv-space'));
          this.svHandleElement = this.rootElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--sv-handle'));
          this._redrawHueWheel = function () {
              _this._redrawHueWheelRequested = false;
              var wheelDiameter = _this.wheelDiameter;
              var center = wheelDiameter / 2;
              var radius = center - _this.wheelThickness / 2;
              var TO_RAD = Math.PI / 180;
              var hslPostfix = "," + _this.hsl[1] + "%," + _this.hsl[2] + "%)";
              var ctx = _this.hueWheelElement.getContext('2d');
              ctx.clearRect(0, 0, wheelDiameter, wheelDiameter);
              ctx.lineWidth = _this.wheelThickness;
              for (var i = 0; i < 360; i++) {
                  ctx.beginPath();
                  ctx.arc(center, center, radius, (i - 90.7) * TO_RAD, (i - 89.3) * TO_RAD);
                  ctx.strokeStyle = 'hsl(' + i + hslPostfix;
                  ctx.stroke();
              }
          };
          this._redrawSvSpace = function () {
              _this._redrawSvSpaceRequested = false;
              var svSpaceElement = _this.svSpaceElement;
              var sideLength = svSpaceElement.width;
              var cellWidth = sideLength / 100;
              var cellFillWidth = cellWidth + 1 | 0;
              var h = _this.hsv[0];
              var hslPrefix = "hsl(" + h + ",";
              var hsv0 = [h, 0, 100];
              var hsv1 = [h, 0, 0];
              var ctx = svSpaceElement.getContext('2d');
              ctx.clearRect(0, 0, sideLength, sideLength);
              for (var i = 0; i < 100; i++) {
                  hsv0[1] = hsv1[1] = i;
                  var gradient = ctx.createLinearGradient(0, 0, 0, sideLength);
                  var color0 = ReinventedColorWheel.hsv2hsl(hsv0);
                  var color1 = ReinventedColorWheel.hsv2hsl(hsv1);
                  gradient.addColorStop(0, "" + hslPrefix + color0[1] + "%," + color0[2] + "%)");
                  gradient.addColorStop(1, "" + hslPrefix + color1[1] + "%," + color1[2] + "%)");
                  ctx.fillStyle = gradient;
                  ctx.fillRect(i * cellWidth | 0, 0, cellFillWidth, sideLength);
              }
          };
          this._onMoveHueHandle = function (event) {
              var hueWheelRect = _this.hueWheelElement.getBoundingClientRect();
              var center = _this.wheelDiameter / 2;
              var x = event.clientX - hueWheelRect.left - center;
              var y = event.clientY - hueWheelRect.top - center;
              var angle = Math.atan2(y, x);
              _this.setHSV(angle * 180 / Math.PI + 90);
          };
          this._onMoveSvHandle = function (event) {
              var svSpaceRect = _this.svSpaceElement.getBoundingClientRect();
              var s = 100 * (event.clientX - svSpaceRect.left) / svSpaceRect.width;
              var v = 100 * (svSpaceRect.bottom - event.clientY) / svSpaceRect.height;
              _this.setHSV(_this.hsv[0], s, v);
          };
          if (!options.hsv && options.hsl) {
              this.hsv = ReinventedColorWheel.hsl2hsv(this.hsl = normalizeHsvOrDefault(options.hsl, defaultOptions.hsl));
          }
          else {
              this.hsl = ReinventedColorWheel.hsv2hsl(this.hsv = normalizeHsvOrDefault(options.hsv, defaultOptions.hsv));
          }
          onDragStart(this.hueWheelElement, function (event) {
              var rect = _this.hueWheelElement.getBoundingClientRect();
              if (_this.hueWheelElement.getContext('2d').getImageData(event.clientX - rect.left, event.clientY - rect.top, 1, 1).data[3]) {
                  _this._onMoveHueHandle(event);
              }
              else {
                  dragging = undefined;
              }
          });
          onDragMove(this.hueWheelElement, this._onMoveHueHandle);
          onDragStart(this.svSpaceElement, this._onMoveSvHandle);
          onDragMove(this.svSpaceElement, this._onMoveSvHandle);
          this.redraw();
      }
      ReinventedColorWheel.prototype.setHSV = function () {
          var oldHsv = this.hsv;
          var newHsv = this.hsv = normalizeHsvOrDefault(arguments, oldHsv);
          var hueChanged = oldHsv[0] - newHsv[0];
          var svChanged = oldHsv[1] - newHsv[1] || oldHsv[2] - newHsv[2];
          if (hueChanged) {
              this.hsl[0] = this.hsv[0];
              this._redrawHueHandle();
              if (!this._redrawSvSpaceRequested) {
                  requestAnimationFrame(this._redrawSvSpace);
                  this._redrawSvSpaceRequested = true;
              }
          }
          if (svChanged) {
              this.hsl = ReinventedColorWheel.hsv2hsl(newHsv);
              this._redrawSvHandle();
              if (!this._redrawHueWheelRequested) {
                  requestAnimationFrame(this._redrawHueWheel);
                  this._redrawHueWheelRequested = true;
              }
          }
          if (hueChanged || svChanged) {
              this.onChange(this);
          }
      };
      ReinventedColorWheel.prototype.setHSL = function () {
          this.setHSV.apply(this, ReinventedColorWheel.hsl2hsv(normalizeHsvOrDefault(arguments, this.hsl)));
      };
      ReinventedColorWheel.prototype.redraw = function () {
          this.hueWheelElement.width = this.hueWheelElement.height = this.wheelDiameter;
          this.svSpaceElement.width = this.svSpaceElement.height = (this.wheelDiameter - this.wheelThickness * 2) * Math.sqrt(2) / 2;
          var hueHandleStyle = this.hueHandleElement.style;
          var svHandleStyle = this.svHandleElement.style;
          hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = this.handleDiameter + "px";
          hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = -this.handleDiameter / 2 + "px";
          this._redrawHueWheel();
          this._redrawHueHandle();
          this._redrawSvSpace();
          this._redrawSvHandle();
      };
      ReinventedColorWheel.prototype._redrawHueHandle = function () {
          var center = this.wheelDiameter / 2;
          var wheelRadius = center - this.wheelThickness / 2;
          var angle = (this.hsv[0] - 90) * Math.PI / 180;
          var hueHandleStyle = this.hueHandleElement.style;
          hueHandleStyle.left = wheelRadius * Math.cos(angle) + center + "px";
          hueHandleStyle.top = wheelRadius * Math.sin(angle) + center + "px";
      };
      ReinventedColorWheel.prototype._redrawSvHandle = function () {
          var svSpaceElement = this.svSpaceElement;
          var svHandleStyle = this.svHandleElement.style;
          svHandleStyle.left = svSpaceElement.offsetLeft + svSpaceElement.offsetWidth * this.hsv[1] / 100 + "px";
          svHandleStyle.top = svSpaceElement.offsetTop + svSpaceElement.offsetHeight * (1 - this.hsv[2] / 100) + "px";
      };
      ReinventedColorWheel.defaultOptions = defaultOptions;
      ReinventedColorWheel.hsv2hsl = hsv2hsl_1;
      ReinventedColorWheel.hsl2hsv = hsl2hsv_1;
      return ReinventedColorWheel;
  }());
  function normalizeHsvOrDefault(hsv, defaultHsvOrHsl) {
      if (hsv) {
          return [
              isFiniteNumber(hsv[0]) ? positiveIntModulo(hsv[0], 360) : defaultHsvOrHsl[0],
              isFiniteNumber(hsv[1]) ? normalizePercentage(hsv[1]) : defaultHsvOrHsl[1],
              isFiniteNumber(hsv[2]) ? normalizePercentage(hsv[2]) : defaultHsvOrHsl[2],
          ];
      }
      else {
          return defaultHsvOrHsl;
      }
  }
  function normalizePercentage(value) {
      return value < 0 ? 0 : value > 100 ? 100 : value;
  }
  function isFiniteNumber(n) {
      return typeof n === 'number' && isFinite(n);
  }
  function positiveIntModulo(value, divisor) {
      var modulo = (value + .5 | 0) % divisor;
      return modulo < 0 ? modulo + divisor : modulo;
  }
  function createElementWithClass(tagName, className) {
      var element = document.createElement(tagName);
      element.className = className;
      return element;
  }

  return ReinventedColorWheel;

}());
