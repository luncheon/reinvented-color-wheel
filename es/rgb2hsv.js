// http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
export default function rgb2hsv(rgb) {
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var delta = max - min;
    var h = delta && 60 * (max === r ? (g - b) / delta % 6 :
        max === g ? (b - r) / delta + 2 :
            (r - g) / delta + 4);
    return [
        h < 0 ? h + 360 : h,
        max && delta * 100 / max,
        max * 100 / 255,
    ];
}
