import _hsl2hsv from 'pure-color/convert/hsl2hsv';
import _hsv2hsl from 'pure-color/convert/hsv2hsl';
import _rgb2hsv from './rgb2hsv';
import _hsv2rgb from './hsv2rgb';
import _rgb2hex from 'pure-color/convert/rgb2hex';
import _hex2rgb from 'pure-color/parse/hex';
import { normalizeHsvOrDefault, normalizeHsl } from './normalize';
import { onDrag } from './on-drag';
import { window } from './window';
var defaultOptions = {
    hsv: [0, 100, 100],
    hsl: [0, 100, 50],
    wheelDiameter: 200,
    wheelThickness: 20,
    handleDiameter: 16,
    wheelReflectsSaturation: true,
    onChange: function () { },
};
var Matrix = window.DOMMatrix || window.WebKitCSSMatrix || window.MSCSSMatrix;
var inverseTransform = function (element) {
    var ancestors = [element];
    while (element = element.parentElement) {
        ancestors.push(element);
    }
    var matrix = new Matrix();
    for (var i = ancestors.length - 1; i >= 0; i--) {
        var style = getComputedStyle(ancestors[i]);
        var transform = style.transform;
        if (transform && transform !== 'none') {
            var transformOrigin = style.transformOrigin.split(' ').map(parseFloat);
            matrix = matrix
                .translate(transformOrigin[0], transformOrigin[1])
                .multiply(new Matrix(transform))
                .translate(-transformOrigin[0], -transformOrigin[1]);
        }
    }
    return matrix.inverse();
};
var tripletsAreEqual = function (a, b) {
    return a === b || (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
};
var ReinventedColorWheel = /** @class */ (function () {
    function ReinventedColorWheel(options) {
        var _this = this;
        this.options = options;
        this.wheelDiameter = this.options.wheelDiameter || defaultOptions.wheelDiameter;
        this.wheelThickness = this.options.wheelThickness || defaultOptions.wheelThickness;
        this.handleDiameter = this.options.handleDiameter || defaultOptions.handleDiameter;
        this.onChange = this.options.onChange || defaultOptions.onChange;
        this.wheelReflectsSaturation = this.options.wheelReflectsSaturation !== undefined ? this.options.wheelReflectsSaturation : defaultOptions.wheelReflectsSaturation;
        this.rootElement = this.options.appendTo.appendChild(createElementWithClass('div', 'reinvented-color-wheel'));
        this.hueWheelElement = this.rootElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--hue-wheel'));
        this.hueWheelContext = this.hueWheelElement.getContext('2d');
        this.hueHandleElement = this.rootElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-handle'));
        this.svSpaceElement = this.rootElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--sv-space'));
        this.svSpaceContext = this.svSpaceElement.getContext('2d');
        this.svHandleElement = this.rootElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--sv-handle'));
        this._redrawHueWheel = function () {
            _this._redrawHueWheelRequested = false;
            var wheelDiameter = _this.wheelDiameter;
            var center = wheelDiameter / 2;
            var radius = center - _this.wheelThickness / 2;
            var TO_RAD = Math.PI / 180;
            var hslPostfix = _this.wheelReflectsSaturation ? "," + _this._hsl[1] + "%," + _this._hsl[2] + "%)" : ',100%,50%)';
            var ctx = _this.hueWheelContext;
            ctx.clearRect(0, 0, wheelDiameter, wheelDiameter);
            ctx.lineWidth = _this.wheelThickness;
            for (var i = 0; i < 360; i++) {
                ctx.beginPath();
                ctx.arc(center, center, radius, (i - 90.7) * TO_RAD, (i - 89.3) * TO_RAD);
                ctx.strokeStyle = 'hsl(' + i + hslPostfix;
                ctx.stroke();
            }
        };
        this.hueWheelContext.imageSmoothingEnabled = false;
        this.svSpaceContext.imageSmoothingEnabled = false;
        this._hsv = normalizeHsvOrDefault(options.hsv ? options.hsv :
            options.hsl ? ReinventedColorWheel.hsl2hsv(options.hsl) :
                options.rgb ? ReinventedColorWheel.rgb2hsv(options.rgb) :
                    options.hex ? ReinventedColorWheel.rgb2hsv(ReinventedColorWheel.hex2rgb(options.hex)) :
                        undefined, defaultOptions.hsv);
        this._hsl = normalizeHsl(ReinventedColorWheel.hsv2hsl(this._hsv));
        this._rgb = ReinventedColorWheel.hsv2rgb(this._hsv);
        this._hex = ReinventedColorWheel.rgb2hex(this._rgb);
        var invertTransform = function (x, y) {
            var m = _this._inverseTransform.multiply(new Matrix("matrix(1,0,0,1," + x + "," + y + ")"));
            return { x: m.e, y: m.f };
        };
        var onDragStart = function (element) {
            _this._inverseTransform = inverseTransform(element);
            var rect = element.getBoundingClientRect();
            _this._center = invertTransform(rect.left + rect.width / 2, rect.top + rect.height / 2);
        };
        var onDragStartHue = function (event) {
            onDragStart(_this.hueWheelElement);
            var point = invertTransform(event.clientX, event.clientY);
            var x = point.x - _this._center.x;
            var y = point.y - _this._center.y;
            var wheelInnerRadius = _this.wheelDiameter / 2 - _this.wheelThickness;
            if (x * x + y * y < wheelInnerRadius * wheelInnerRadius) {
                return false;
            }
            onDragMoveHue(event);
        };
        var onDragMoveHue = function (event) {
            var point = invertTransform(event.clientX, event.clientY);
            var x = point.x - _this._center.x;
            var y = point.y - _this._center.y;
            var angle = Math.atan2(y, x);
            _this.hsv = [angle * 180 / Math.PI + 90, _this.hsv[1], _this.hsv[2]];
        };
        var onDragMoveSv = function (event) {
            var point = invertTransform(event.clientX, event.clientY);
            var a = 100 / _this.svSpaceElement.width;
            var s = (point.x - _this._center.x) * a + 50;
            var v = (_this._center.y - point.y) * a + 50;
            _this.hsv = [_this._hsv[0], s, v];
        };
        var onDragStartSv = function (event) {
            onDragStart(_this.svSpaceElement);
            onDragMoveSv(event);
        };
        onDrag(this.hueWheelElement, onDragStartHue, onDragMoveHue);
        onDrag(this.svSpaceElement, onDragStartSv, onDragMoveSv);
        onDrag(this.svHandleElement, onDragStartSv, onDragMoveSv);
        this.redraw();
    }
    Object.defineProperty(ReinventedColorWheel.prototype, "hsv", {
        get: function () { return this._hsv; },
        set: function (value) {
            tripletsAreEqual(this._hsv, value) || this._setHSV(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReinventedColorWheel.prototype, "hsl", {
        get: function () { return this._hsl; },
        set: function (value) {
            tripletsAreEqual(this._hsl, value) || this._setHSV(ReinventedColorWheel.hsl2hsv(value));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReinventedColorWheel.prototype, "rgb", {
        get: function () { return this._rgb; },
        set: function (value) {
            tripletsAreEqual(this._rgb, value) || this._setHSV(ReinventedColorWheel.rgb2hsv(value));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ReinventedColorWheel.prototype, "hex", {
        get: function () { return this._hex; },
        set: function (value) {
            this._hex !== value && (this.rgb = ReinventedColorWheel.hex2rgb(value));
        },
        enumerable: false,
        configurable: true
    });
    /** @deprecated */ ReinventedColorWheel.prototype.setHSV = function () { this.hsv = arguments; };
    /** @deprecated */ ReinventedColorWheel.prototype.setHSL = function () { this.hsl = arguments; };
    ReinventedColorWheel.prototype.redraw = function () {
        this.hueWheelElement.width = this.hueWheelElement.height = this.wheelDiameter;
        this.svSpaceElement.width = this.svSpaceElement.height = (this.wheelDiameter - this.wheelThickness * 2) * Math.SQRT1_2;
        var hueHandleStyle = this.hueHandleElement.style;
        var svHandleStyle = this.svHandleElement.style;
        hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = this.handleDiameter + "px";
        hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = -this.handleDiameter / 2 + "px";
        this._redrawHueWheel();
        this._redrawHueHandle();
        this._redrawSvSpace();
        this._redrawSvHandle();
    };
    ReinventedColorWheel.prototype._setHSV = function (hsv) {
        var oldHsv = this._hsv;
        var newHsv = this._hsv = normalizeHsvOrDefault(hsv, oldHsv);
        var hueChanged = oldHsv[0] - newHsv[0];
        var svChanged = oldHsv[1] - newHsv[1] || oldHsv[2] - newHsv[2];
        if (hueChanged) {
            this._hsl = [newHsv[0], this._hsl[1], this._hsl[2]];
            this._redrawHueHandle();
            this._updateSvBackground();
        }
        if (svChanged) {
            this._hsl = normalizeHsl(ReinventedColorWheel.hsv2hsl(newHsv));
            this._redrawSvHandle();
            if (this.wheelReflectsSaturation && !this._redrawHueWheelRequested) {
                requestAnimationFrame(this._redrawHueWheel);
                this._redrawHueWheelRequested = true;
            }
        }
        if (hueChanged || svChanged) {
            this._rgb = ReinventedColorWheel.hsv2rgb(newHsv);
            this._hex = ReinventedColorWheel.rgb2hex(this._rgb);
            this.onChange(this);
        }
    };
    ReinventedColorWheel.prototype._redrawSvSpace = function () {
        this._updateSvBackground();
        var sideLength = this.svSpaceElement.width;
        var ctx = this.svSpaceContext;
        var saturationGradient = ctx.createLinearGradient(0, 0, sideLength, 0);
        var valueGradient = ctx.createLinearGradient(0, 0, 0, sideLength);
        saturationGradient.addColorStop(0, 'rgba(255,255,255,1)');
        saturationGradient.addColorStop(1, 'rgba(255,255,255,0)');
        valueGradient.addColorStop(0, 'rgba(0,0,0,0)');
        valueGradient.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = saturationGradient;
        ctx.fillRect(0, 0, sideLength, sideLength);
        ctx.fillStyle = valueGradient;
        ctx.fillRect(0, 0, sideLength, sideLength);
    };
    ReinventedColorWheel.prototype._updateSvBackground = function () {
        this.svSpaceElement.style.backgroundColor = "hsl(" + this._hsv[0] + ",100%,50%)";
    };
    ReinventedColorWheel.prototype._redrawHueHandle = function () {
        var center = this.wheelDiameter / 2;
        var wheelRadius = center - this.wheelThickness / 2;
        var angle = (this._hsv[0] - 90) * Math.PI / 180;
        var hueHandleStyle = this.hueHandleElement.style;
        hueHandleStyle.left = wheelRadius * Math.cos(angle) + center + "px";
        hueHandleStyle.top = wheelRadius * Math.sin(angle) + center + "px";
    };
    ReinventedColorWheel.prototype._redrawSvHandle = function () {
        var svSpaceElementWidth = this.svSpaceElement.width;
        var svHandleStyle = this.svHandleElement.style;
        var offset = (this.wheelDiameter - svSpaceElementWidth) / 2;
        var hsv = this._hsv;
        svHandleStyle.left = offset + svSpaceElementWidth * hsv[1] / 100 + "px";
        svHandleStyle.top = offset + svSpaceElementWidth * (1 - hsv[2] / 100) + "px";
    };
    ReinventedColorWheel.default = ReinventedColorWheel;
    ReinventedColorWheel.defaultOptions = defaultOptions;
    ReinventedColorWheel.hsv2hsl = _hsv2hsl;
    ReinventedColorWheel.hsl2hsv = _hsl2hsv;
    ReinventedColorWheel.hsv2rgb = _hsv2rgb;
    ReinventedColorWheel.rgb2hsv = _rgb2hsv;
    ReinventedColorWheel.rgb2hex = _rgb2hex;
    ReinventedColorWheel.hex2rgb = _hex2rgb;
    return ReinventedColorWheel;
}());
export default ReinventedColorWheel;
function createElementWithClass(tagName, className) {
    var element = document.createElement(tagName);
    element.className = className;
    return element;
}
