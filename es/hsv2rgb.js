// http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
export default function hsv2rgb(hsv) {
    var h = hsv[0] / 60;
    var s = hsv[1] / 100;
    var v = hsv[2] / 100;
    var c = v * s;
    var x = c * (1 - Math.abs(h % 2 - 1));
    var m = v - c;
    var _x = (x + m) * 255 + .5 | 0;
    var _c = (c + m) * 255 + .5 | 0;
    var _0 = m * 255 + .5 | 0;
    var _h = h | 0;
    return (_h === 1 ? [_x, _c, _0] :
        _h === 2 ? [_0, _c, _x] :
            _h === 3 ? [_0, _x, _c] :
                _h === 4 ? [_x, _0, _c] :
                    _h === 5 ? [_c, _0, _x] :
                        [_c, _x, _0]);
}
