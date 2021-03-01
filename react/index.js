import * as React from 'react';
import ReinventedColorWheel from '../es/reinvented-color-wheel';
var noop = function () { };
export default (function (_a) {
    var wheelThickness = _a.wheelThickness, wheelDiameter = _a.wheelDiameter, handleDiameter = _a.handleDiameter, wheelReflectsSaturation = _a.wheelReflectsSaturation, onChange = _a.onChange, hsv = _a.hsv, hsl = _a.hsl, rgb = _a.rgb, hex = _a.hex;
    var elementRef = React.useRef(null);
    var wheelRef = React.useRef();
    var wheel = wheelRef.current;
    React.useEffect(function () {
        if (wheel) {
            wheelDiameter && (wheel.wheelDiameter = wheelDiameter);
            wheelThickness && (wheel.wheelThickness = wheelThickness);
            handleDiameter && (wheel.handleDiameter = handleDiameter);
            wheelReflectsSaturation != null && (wheel.wheelReflectsSaturation = wheelReflectsSaturation);
            wheel.redraw();
        }
        else {
            wheelRef.current = new ReinventedColorWheel({
                wheelThickness: wheelThickness, wheelDiameter: wheelDiameter, handleDiameter: handleDiameter, wheelReflectsSaturation: wheelReflectsSaturation, onChange: onChange, hsv: hsv, hsl: hsl, rgb: rgb, hex: hex,
                appendTo: elementRef.current,
            });
        }
    }, [wheelDiameter, wheelThickness, handleDiameter, wheelReflectsSaturation]);
    if (wheel) {
        wheel.onChange = onChange || noop;
        if (hsv) {
            wheel.hsv = hsv;
        }
        else if (hsl) {
            wheel.hsl = hsl;
        }
        else if (rgb) {
            wheel.rgb = rgb;
        }
        else if (hex) {
            wheel.hex = hex;
        }
    }
    return React.createElement("div", { ref: elementRef });
});
