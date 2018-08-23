import hsl2hsv from 'pure-color/convert/hsl2hsv';
import hsv2hsl from 'pure-color/convert/hsv2hsl';
var onDragStart;
var onDragMove;
var dragging;
if ('PointerEvent' in window) {
    onDragStart = function (element, callback) { return element.addEventListener('pointerdown', function (event) { return (dragging = element, callback(event)); }); };
    onDragMove = function (element, callback) { return addEventListener('pointermove', function (event) { return dragging === element && callback(event); }); };
    addEventListener('pointerup', function () { return dragging = undefined; });
}
else if ('ontouchend' in window) {
    onDragStart = function (element, callback) { return element.addEventListener('touchstart', function (event) { return (event.preventDefault(), callback(event.targetTouches[0])); }); };
    onDragMove = function (element, callback) { return element.addEventListener('touchmove', function (event) { return (event.preventDefault(), callback(event.targetTouches[0])); }); };
}
else {
    onDragStart = function (element, callback) { return element.addEventListener('mousedown', function (event) { return (dragging = element, callback(event)); }); };
    onDragMove = function (element, callback) { return addEventListener('mousemove', function (event) { return dragging === element && callback(event); }); };
    addEventListener('mouseup', function () { return dragging = undefined; });
}
var defaultOptions = {
    h: 0,
    s: 100,
    l: 50,
    wheelDiameter: 200,
    wheelThickness: 20,
    handleDiameter: 16,
    onChange: noop,
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
            svSpaceElement.width = svSpaceElement.height = (wheelDiameter - wheelThickness - wheelThickness) * Math.sqrt(2) * .5;
            onDragStart(svSpaceElement, onMoveSvHandle);
            onDragMove(svSpaceElement, onMoveSvHandle);
        }
        this.setHSL({
            h: typeof options.h === 'number' ? options.h : defaultOptions.h,
            s: typeof options.s === 'number' ? options.s : defaultOptions.s,
            l: typeof options.l === 'number' ? options.l : defaultOptions.l,
        });
    }
    ReinventedColorWheel.prototype.setHSL = function (hsl) {
        var svChanged;
        if (typeof hsl.s === 'number' && hsl.s !== this.s) {
            this.s = limitInt(hsl.s, 0, 100);
            svChanged = true;
        }
        if (typeof hsl.l === 'number' && hsl.l !== this.l) {
            this.l = limitInt(hsl.l, 0, 100);
            svChanged = true;
        }
        if (svChanged) {
            this._redrawHueWheel();
            this._redrawSvHandle();
        }
        if (typeof hsl.h === 'number' && hsl.h !== this.h) {
            this.h = positiveIntModulo(hsl.h, 360);
            this._redrawHueHandle();
            this._redrawSvSpace();
            this.onChange(this);
        }
        else if (svChanged) {
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
        ctx.clearRect(0, 0, sideLength, sideLength);
        for (var i = 0; i < 100; i++) {
            var gradient = ctx.createLinearGradient(0, 0, 0, sideLength);
            var color0 = hsv2hsl([this.h, i, 100]);
            var color1 = hsv2hsl([this.h, i, 0]);
            gradient.addColorStop(0, "hsl(" + color0[0] + "," + color0[1] + "%," + color0[2] + "%)");
            gradient.addColorStop(1, "hsl(" + color1[0] + "," + color1[1] + "%," + color1[2] + "%)");
            ctx.fillStyle = gradient;
            ctx.fillRect((i * cellWidth) | 0, 0, (cellWidth + 1) | 0, sideLength);
        }
    };
    ReinventedColorWheel.prototype._redrawHueHandle = function () {
        var center = this.wheelDiameter / 2;
        var wheelRadius = center - this.wheelThickness / 2;
        var angle = (this.h - 90) * Math.PI / 180;
        this.hueHandleElement.style.left = wheelRadius * Math.cos(angle) + center + "px";
        this.hueHandleElement.style.top = wheelRadius * Math.sin(angle) + center + "px";
    };
    ReinventedColorWheel.prototype._redrawSvHandle = function () {
        var hsv = hsl2hsv([this.h, this.s, this.l]);
        this.svHandleElement.style.left = this.svSpaceElement.offsetLeft + this.svSpaceElement.offsetWidth * hsv[1] / 100 + "px";
        this.svHandleElement.style.top = this.svSpaceElement.offsetTop + this.svSpaceElement.offsetHeight * (1 - hsv[2] / 100) + "px";
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
        var x = limitInt(event.clientX - svSpaceRect.left, 0, svSpaceRect.width - 1);
        var y = limitInt(event.clientY - svSpaceRect.top, 0, svSpaceRect.height - 1);
        var hsl = hsv2hsl([this.h, (100 * x / svSpaceRect.width) | 0, (100 - 100 * y / svSpaceRect.height) | 0]);
        this.setHSL({ s: hsl[1], l: hsl[2] });
    };
    ReinventedColorWheel.defaultOptions = defaultOptions;
    return ReinventedColorWheel;
}());
export default ReinventedColorWheel;
function limitInt(value, min, max) {
    return Math.min(Math.max(value | 0, min), max);
}
function positiveIntModulo(value, divisor) {
    var modulo = (value | 0) % divisor;
    return modulo < 0 ? modulo + divisor : modulo;
}
function noop() {
}
function preventDefault(event) {
    event.preventDefault();
}
function createElementWithClass(tagName, className) {
    var element = document.createElement(tagName);
    element.className = className;
    return element;
}
