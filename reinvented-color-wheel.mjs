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
var ReinventedColorWheel = /** @class */ (function () {
    function ReinventedColorWheel(options) {
        this.h = NaN;
        this.s = NaN;
        this.l = NaN;
        var defaultOptions = ReinventedColorWheel.defaultOptions;
        var wheelDiameter = this.wheelDiameter = options.wheelDiameter || defaultOptions.wheelDiameter;
        var wheelThickness = this.wheelThickness = options.wheelThickness || defaultOptions.wheelThickness;
        var handleDiameter = this.handleDiameter = options.handleDiameter || defaultOptions.handleDiameter;
        this.onChange = options.onChange || defaultOptions.onChange;
        var containerElement = this.containerElement = options.parentElement.appendChild(document.createElement('div'));
        containerElement.className = 'reinvented-color-wheel';
        containerElement.addEventListener('pointerdown', preventDefault);
        containerElement.addEventListener('mousedown', preventDefault);
        {
            var hueWheelElement = this.hueWheelElement = containerElement.appendChild(document.createElement('canvas'));
            var onMoveHueHandle = this._onMoveHueHandle.bind(this);
            hueWheelElement.className = 'reinvented-color-wheel--hue-wheel';
            hueWheelElement.width = hueWheelElement.height = wheelDiameter;
            onDragStart(hueWheelElement, onMoveHueHandle);
            onDragMove(hueWheelElement, onMoveHueHandle);
        }
        {
            var hueHandleElement = this.hueHandleElement = containerElement.appendChild(document.createElement('div'));
            var handleStyle = hueHandleElement.style;
            hueHandleElement.className = 'reinvented-color-wheel--hue-handle';
            handleStyle.width = handleStyle.height = handleDiameter + "px";
            handleStyle.marginLeft = handleStyle.marginTop = -handleDiameter / 2 + "px";
        }
        {
            // ignore events inside the wheel
            var innerCircleElement = containerElement.appendChild(document.createElement('div'));
            var innerCircleStyle = innerCircleElement.style;
            innerCircleElement.className = 'reinvented-color-wheel--hue-inner-circle';
            innerCircleStyle.left = innerCircleStyle.top = wheelThickness + "px";
            innerCircleStyle.width = innerCircleStyle.height = wheelDiameter - wheelThickness - wheelThickness + "px";
        }
        this.setHSL({
            h: typeof options.h === 'number' ? options.h : defaultOptions.h,
            s: typeof options.s === 'number' ? options.s : defaultOptions.s,
            l: typeof options.l === 'number' ? options.l : defaultOptions.l,
        });
    }
    ReinventedColorWheel.prototype.setHSL = function (hsl) {
        var needsRedrawHueWheel;
        if (typeof hsl.s === 'number' && hsl.s !== this.s) {
            this.s = limit(hsl.s | 0, 0, 100);
            needsRedrawHueWheel = true;
        }
        if (typeof hsl.l === 'number' && hsl.l !== this.l) {
            this.l = limit(hsl.l | 0, 0, 100);
            needsRedrawHueWheel = true;
        }
        if (needsRedrawHueWheel) {
            this._redrawHueWheel();
        }
        if (typeof hsl.h === 'number' && hsl.h !== this.h) {
            this.h = positiveModulo(hsl.h | 0, 360);
            this._redrawHueHandle();
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
    ReinventedColorWheel.prototype._redrawHueHandle = function () {
        var center = this.wheelDiameter / 2;
        var wheelRadius = center - this.wheelThickness / 2;
        var angle = (this.h - 90) * Math.PI / 180;
        this.hueHandleElement.style.left = wheelRadius * Math.cos(angle) + center + 'px';
        this.hueHandleElement.style.top = wheelRadius * Math.sin(angle) + center + 'px';
    };
    ReinventedColorWheel.prototype._onMoveHueHandle = function (event) {
        var wheelRect = this.hueWheelElement.getBoundingClientRect();
        var center = this.wheelDiameter / 2;
        var x = event.clientX - wheelRect.left - center;
        var y = event.clientY - wheelRect.top - center;
        var angle = Math.atan2(y, x);
        var h = positiveModulo(Math.round(angle * 180 / Math.PI + 90) | 0, 360);
        if (h !== this.h) {
            this.h = h;
            this._redrawHueHandle();
            this.onChange(this);
        }
    };
    ReinventedColorWheel.defaultOptions = {
        h: 0,
        s: 100,
        l: 50,
        wheelDiameter: 200,
        wheelThickness: 20,
        handleDiameter: 16,
        onChange: noop,
    };
    return ReinventedColorWheel;
}());
export default ReinventedColorWheel;
function limit(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function positiveModulo(value, divisor) {
    var modulo = value % divisor;
    return modulo < 0 ? modulo + divisor : modulo;
}
function noop() {
}
function preventDefault(event) {
    event.preventDefault();
}
