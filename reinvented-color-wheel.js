(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.ReinventedColorWheel = factory());
}(this, (function () { 'use strict';

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
      onDragStart = function (element, callback) { return element.addEventListener('touchstart', function (event) { event.preventDefault(); callback(event.targetTouches[0]); }); };
      onDragMove = function (element, callback) { return element.addEventListener('touchmove', function (event) { event.preventDefault(); callback(event.targetTouches[0]); }); };
  }
  else {
      onDragStart = function (element, callback) { return element.addEventListener(pointerEventSupported ? 'pointerdown' : 'mousedown', function (event) { dragging = element; callback(event); }); };
      onDragMove = function (element, callback) { return addEventListener(pointerEventSupported ? 'pointermove' : 'mousemove', function (event) { dragging === element && callback(event); }); };
      addEventListener(pointerEventSupported ? 'pointerup' : 'mouseup', function () { return dragging = undefined; });
  }
  var defaultOptions = {
      h: 0,
      s: 100,
      l: 50,
      wheelDiameter: 200,
      wheelThickness: 20,
      handleDiameter: 16,
      onChange: function () { },
  };
  var ReinventedColorWheel = /** @class */ (function () {
      function ReinventedColorWheel(options) {
          this.options = options;
          this.h = NaN;
          this.s = NaN;
          this.l = NaN;
          this.wheelDiameter = this.options.wheelDiameter || defaultOptions.wheelDiameter;
          this.wheelThickness = this.options.wheelThickness || defaultOptions.wheelThickness;
          this.handleDiameter = this.options.handleDiameter || defaultOptions.handleDiameter;
          this.onChange = this.options.onChange || defaultOptions.onChange;
          this.containerElement = this.options.parentElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel'));
          this.hueWheelElement = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--hue-wheel'));
          this.hueHandleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-handle'));
          this.hueInnerCircleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-inner-circle')); // to ignore events inside the wheel
          this.svSpaceElement = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--sv-space'));
          this.svHandleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--sv-handle'));
          var wheelDiameter = this.wheelDiameter;
          var wheelThickness = this.wheelThickness;
          this.containerElement.addEventListener('pointerdown', preventDefault);
          this.containerElement.addEventListener('mousedown', preventDefault);
          {
              var hueWheelElement = this.hueWheelElement;
              var onMoveHueHandle = this._onMoveHueHandle.bind(this);
              hueWheelElement.width = hueWheelElement.height = wheelDiameter;
              onDragStart(hueWheelElement, onMoveHueHandle);
              onDragMove(hueWheelElement, onMoveHueHandle);
          }
          {
              var hueHandleStyle = this.hueHandleElement.style;
              var svHandleStyle = this.svHandleElement.style;
              var handleDiameter = this.handleDiameter;
              hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = handleDiameter + "px";
              hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = -handleDiameter / 2 + "px";
          }
          this.hueInnerCircleElement.style.width = this.hueInnerCircleElement.style.height = wheelDiameter - wheelThickness - wheelThickness + "px";
          {
              var svSpaceElement = this.svSpaceElement;
              var onMoveSvHandle = this._onMoveSvHandle.bind(this);
              svSpaceElement.width = svSpaceElement.height = (wheelDiameter - wheelThickness - wheelThickness) * Math.sqrt(2) / 2;
              onDragStart(svSpaceElement, onMoveSvHandle);
              onDragMove(svSpaceElement, onMoveSvHandle);
          }
          this.setHSL({
              h: isFiniteNumber(options.h) ? options.h : defaultOptions.h,
              s: isFiniteNumber(options.s) ? options.s : defaultOptions.s,
              l: isFiniteNumber(options.l) ? options.l : defaultOptions.l,
          });
      }
      ReinventedColorWheel.prototype.setHSL = function (hsl) {
          var oldH = this.h;
          var oldS = this.s;
          var oldL = this.l;
          isFiniteNumber(hsl.h) && (this.h = positiveIntModulo(hsl.h, 360));
          isFiniteNumber(hsl.s) && (this.s = limit_0_100(hsl.s));
          isFiniteNumber(hsl.l) && (this.l = limit_0_100(hsl.l));
          var hueChanged = oldH !== this.h;
          var slChanged = oldS !== this.s || oldL !== this.l;
          if (hueChanged) {
              this._redrawHueHandle();
              this._redrawSvSpace();
          }
          if (slChanged) {
              this._redrawHueWheel();
              this._redrawSvHandle();
          }
          if (hueChanged || slChanged) {
              this.onChange(this);
          }
      };
      ReinventedColorWheel.prototype._redrawHueWheel = function () {
          var center = this.wheelDiameter / 2;
          var radius = center - this.wheelThickness / 2;
          var ctx = this.hueWheelElement.getContext('2d');
          var TO_RAD = Math.PI / 180;
          for (var i = 0; i < 360; i++) {
              ctx.beginPath();
              ctx.arc(center, center, radius, (i - 90.6) * TO_RAD, (i - 89.4) * TO_RAD);
              ctx.strokeStyle = "hsl(" + i + "," + this.s + "%," + this.l + "%)";
              ctx.lineWidth = this.wheelThickness;
              ctx.stroke();
          }
      };
      ReinventedColorWheel.prototype._redrawSvSpace = function () {
          var svSpaceElement = this.svSpaceElement;
          var sideLength = svSpaceElement.width;
          var cellWidth = sideLength / 100;
          var ctx = svSpaceElement.getContext('2d');
          var h = this.h;
          ctx.clearRect(0, 0, sideLength, sideLength);
          for (var i = 0; i < 100; i++) {
              var gradient = ctx.createLinearGradient(0, 0, 0, sideLength);
              var color0 = hsv2hsl_1([h, i, 100]);
              var color1 = hsv2hsl_1([h, i, 0]);
              gradient.addColorStop(0, "hsl(" + h + "," + color0[1] + "%," + color0[2] + "%)");
              gradient.addColorStop(1, "hsl(" + h + "," + color1[1] + "%," + color1[2] + "%)");
              ctx.fillStyle = gradient;
              ctx.fillRect((i * cellWidth) | 0, 0, (cellWidth + 1) | 0, sideLength);
          }
      };
      ReinventedColorWheel.prototype._redrawHueHandle = function () {
          var center = this.wheelDiameter / 2;
          var wheelRadius = center - this.wheelThickness / 2;
          var angle = (this.h - 90) * Math.PI / 180;
          var hueHandleStyle = this.hueHandleElement.style;
          hueHandleStyle.left = wheelRadius * Math.cos(angle) + center + "px";
          hueHandleStyle.top = wheelRadius * Math.sin(angle) + center + "px";
      };
      ReinventedColorWheel.prototype._redrawSvHandle = function () {
          var hsv = hsl2hsv_1([this.h, this.s, this.l]);
          var svSpaceElement = this.svSpaceElement;
          var svHandleStyle = this.svHandleElement.style;
          svHandleStyle.left = svSpaceElement.offsetLeft + svSpaceElement.offsetWidth * hsv[1] / 100 + "px";
          svHandleStyle.top = svSpaceElement.offsetTop + svSpaceElement.offsetHeight * (1 - hsv[2] / 100) + "px";
      };
      ReinventedColorWheel.prototype._onMoveHueHandle = function (event) {
          var hueWheelRect = this.hueWheelElement.getBoundingClientRect();
          var center = this.wheelDiameter / 2;
          var x = event.clientX - hueWheelRect.left - center;
          var y = event.clientY - hueWheelRect.top - center;
          var angle = Math.atan2(y, x);
          this.setHSL({ h: angle * 180 / Math.PI + 90 });
      };
      ReinventedColorWheel.prototype._onMoveSvHandle = function (event) {
          var svSpaceRect = this.svSpaceElement.getBoundingClientRect();
          var s = 100 * (event.clientX - svSpaceRect.left) / svSpaceRect.width;
          var v = 100 * (svSpaceRect.bottom - event.clientY) / svSpaceRect.height;
          var hsl = hsv2hsl_1([this.h, s, v]);
          this.setHSL({ s: hsl[1], l: hsl[2] });
      };
      ReinventedColorWheel.defaultOptions = defaultOptions;
      return ReinventedColorWheel;
  }());
  function isFiniteNumber(n) {
      return typeof n === 'number' && isFinite(n);
  }
  function limit_0_100(value) {
      return value < 0 ? 0 : value > 100 ? 100 : (value + .5) | 0;
  }
  function positiveIntModulo(value, divisor) {
      var modulo = ((value + .5) | 0) % divisor;
      return modulo < 0 ? modulo + divisor : modulo;
  }
  function preventDefault(event) {
      event.preventDefault();
  }
  function createElementWithClass(tagName, className) {
      var element = document.createElement(tagName);
      element.className = className;
      return element;
  }

  return ReinventedColorWheel;

})));
