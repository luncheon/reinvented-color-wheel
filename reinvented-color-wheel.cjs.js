"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hsl2hsv_1 = require("pure-color/convert/hsl2hsv");
var hsv2hsl_1 = require("pure-color/convert/hsv2hsl");
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
    hsv: [0, 100, 100],
    hsl: [0, 100, 50],
    wheelDiameter: 200,
    wheelThickness: 20,
    handleDiameter: 16,
    onChange: function () { },
};
var ReinventedColorWheel = /** @class */ (function () {
    function ReinventedColorWheel(options) {
        this.options = options;
        this.wheelDiameter = this.options.wheelDiameter || defaultOptions.wheelDiameter;
        this.wheelThickness = this.options.wheelThickness || defaultOptions.wheelThickness;
        this.handleDiameter = this.options.handleDiameter || defaultOptions.handleDiameter;
        this.onChange = this.options.onChange || defaultOptions.onChange;
        this.containerElement = this.options.appendTo.appendChild(createElementWithClass('div', 'reinvented-color-wheel'));
        this.hueWheelElement = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--hue-wheel'));
        this.hueHandleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-handle'));
        this.hueInnerCircleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-inner-circle')); // to ignore events inside the wheel
        this.svSpaceElement = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--sv-space'));
        this.svHandleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--sv-handle'));
        if (!options.hsv && options.hsl) {
            this.hsv = ReinventedColorWheel.hsl2hsv(this.hsl = normalizeHsvOrDefault(options.hsl, defaultOptions.hsl));
        }
        else {
            this.hsl = ReinventedColorWheel.hsv2hsl(this.hsv = normalizeHsvOrDefault(options.hsv, defaultOptions.hsv));
        }
        var wheelDiameter = this.wheelDiameter;
        var wheelThickness = this.wheelThickness;
        this.containerElement.addEventListener(pointerEventSupported ? 'pointerdown' : 'mousedown', function (event) { return event.preventDefault(); });
        {
            var hueWheelElement = this.hueWheelElement;
            var onMoveHueHandle = this._onMoveHueHandle.bind(this);
            hueWheelElement.width = hueWheelElement.height = wheelDiameter;
            onDragStart(hueWheelElement, onMoveHueHandle);
            onDragMove(hueWheelElement, onMoveHueHandle);
        }
        {
            var hueInnerCircleStyle = this.hueInnerCircleElement.style;
            hueInnerCircleStyle.width = hueInnerCircleStyle.height = wheelDiameter - wheelThickness - wheelThickness + "px";
        }
        {
            var hueHandleStyle = this.hueHandleElement.style;
            var svHandleStyle = this.svHandleElement.style;
            var handleDiameter = this.handleDiameter;
            hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = handleDiameter + "px";
            hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = -handleDiameter / 2 + "px";
        }
        {
            var svSpaceElement = this.svSpaceElement;
            var onMoveSvHandle = this._onMoveSvHandle.bind(this);
            svSpaceElement.width = svSpaceElement.height = (wheelDiameter - wheelThickness - wheelThickness) * Math.sqrt(2) / 2;
            onDragStart(svSpaceElement, onMoveSvHandle);
            onDragMove(svSpaceElement, onMoveSvHandle);
        }
        this._redrawHueWheel();
        this._redrawHueHandle();
        this._redrawSvSpace();
        this._redrawSvHandle();
    }
    ReinventedColorWheel.hsv2hsl = function (hsv) {
        var hsl = hsv2hsl_1.default(hsv);
        return [hsl[0], (hsl[1] * 100 + .5 | 0) / 100, (hsl[2] * 100 + .5 | 0) / 100];
    };
    ReinventedColorWheel.hsl2hsv = function (hsl) {
        var hsv = hsl2hsv_1.default(hsl);
        return [hsv[0], hsv[1] | 0, hsv[2] | 0];
    };
    ReinventedColorWheel.prototype.setHSV = function (h, s, v) {
        var oldHsv = this.hsv;
        this.hsv = normalizeHsvOrDefault([h, s, v], oldHsv);
        this.hsl[0] = this.hsv[0];
        var hueChanged = oldHsv[0] !== this.hsv[0];
        var svChanged = oldHsv[1] !== this.hsv[1] || oldHsv[2] !== this.hsv[2];
        if (hueChanged) {
            this._redrawHueHandle();
            this._redrawSvSpace();
        }
        if (svChanged) {
            this.hsl = ReinventedColorWheel.hsv2hsl(this.hsv);
            this._redrawHueWheel();
            this._redrawSvHandle();
        }
        if (hueChanged || svChanged) {
            this.onChange(this);
        }
    };
    ReinventedColorWheel.prototype.setHSL = function () {
        this.setHSV.apply(this, ReinventedColorWheel.hsl2hsv(normalizeHsvOrDefault(arguments, this.hsl)));
    };
    ReinventedColorWheel.prototype._redrawHueWheel = function () {
        var wheelDiameter = this.wheelDiameter;
        var wheelThickness = this.wheelThickness;
        var center = wheelDiameter / 2;
        var radius = center - wheelThickness / 2;
        var ctx = this.hueWheelElement.getContext('2d');
        var TO_RAD = Math.PI / 180;
        var s = this.hsl[1];
        var l = this.hsl[2];
        ctx.clearRect(0, 0, wheelDiameter, wheelDiameter);
        for (var i = 0; i < 360; i++) {
            ctx.beginPath();
            ctx.arc(center, center, radius, (i - 90.6) * TO_RAD, (i - 89.4) * TO_RAD);
            ctx.strokeStyle = "hsl(" + i + "," + s + "%," + l + "%)";
            ctx.lineWidth = wheelThickness;
            ctx.stroke();
        }
    };
    ReinventedColorWheel.prototype._redrawSvSpace = function () {
        var svSpaceElement = this.svSpaceElement;
        var sideLength = svSpaceElement.width;
        var cellWidth = sideLength / 100;
        var ctx = svSpaceElement.getContext('2d');
        var h = this.hsv[0];
        ctx.clearRect(0, 0, sideLength, sideLength);
        for (var i = 0; i < 100; i++) {
            var gradient = ctx.createLinearGradient(0, 0, 0, sideLength);
            var color0 = ReinventedColorWheel.hsv2hsl([h, i, 100]);
            var color1 = ReinventedColorWheel.hsv2hsl([h, i, 0]);
            gradient.addColorStop(0, "hsl(" + h + "," + color0[1] + "%," + color0[2] + "%)");
            gradient.addColorStop(1, "hsl(" + h + "," + color1[1] + "%," + color1[2] + "%)");
            ctx.fillStyle = gradient;
            ctx.fillRect(i * cellWidth | 0, 0, cellWidth + 1 | 0, sideLength);
        }
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
    ReinventedColorWheel.prototype._onMoveHueHandle = function (event) {
        var hueWheelRect = this.hueWheelElement.getBoundingClientRect();
        var center = this.wheelDiameter / 2;
        var x = event.clientX - hueWheelRect.left - center;
        var y = event.clientY - hueWheelRect.top - center;
        var angle = Math.atan2(y, x);
        this.setHSV(angle * 180 / Math.PI + 90);
    };
    ReinventedColorWheel.prototype._onMoveSvHandle = function (event) {
        var svSpaceRect = this.svSpaceElement.getBoundingClientRect();
        var s = 100 * (event.clientX - svSpaceRect.left) / svSpaceRect.width;
        var v = 100 * (svSpaceRect.bottom - event.clientY) / svSpaceRect.height;
        this.setHSV(this.hsv[0], s, v);
    };
    ReinventedColorWheel.defaultOptions = defaultOptions;
    return ReinventedColorWheel;
}());
exports.default = ReinventedColorWheel;
function normalizeHsvOrDefault(hsvOrHsl, defaultHsvOrHsl) {
    if (hsvOrHsl) {
        return [
            normalizeDegree(hsvOrHsl[0], defaultHsvOrHsl[0]),
            normalizePercentage(hsvOrHsl[1], defaultHsvOrHsl[1]),
            normalizePercentage(hsvOrHsl[2], defaultHsvOrHsl[2]),
        ];
    }
    else {
        return defaultHsvOrHsl;
    }
}
function normalizeDegree(value, defaultValue) {
    return isFiniteNumber(value) ? positiveIntModulo(value, 360) : defaultValue;
}
function normalizePercentage(value, defaultValue) {
    if (isFiniteNumber(value)) {
        return value < 0 ? 0 : value > 100 ? 100 : value + .5 | 0;
    }
    else {
        return defaultValue;
    }
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
