export function normalizeHsvOrDefault(hsv, defaultHsvOrHsl) {
    if (hsv) {
        return [
            isFiniteNumber(hsv[0]) ? normalizeHue(hsv[0]) : defaultHsvOrHsl[0],
            isFiniteNumber(hsv[1]) ? normalizePercentage(hsv[1]) : defaultHsvOrHsl[1],
            isFiniteNumber(hsv[2]) ? normalizePercentage(hsv[2]) : defaultHsvOrHsl[2],
        ];
    }
    else {
        return defaultHsvOrHsl;
    }
}
export function normalizeHsl(hsl) {
    return [
        normalizeHue(hsl[0]),
        normalizePercentage(hsl[1]),
        normalizePercentage(hsl[2]),
    ];
}
function normalizeHue(value) {
    var modulo = Math.round(value % 360 * 10) / 10;
    return modulo < 0 ? modulo + 360 : modulo;
}
function normalizePercentage(value) {
    return value < 0 ? 0 : value > 100 ? 100 : (value * 10 + .5 | 0) / 10;
}
function isFiniteNumber(n) {
    return typeof n === 'number' && isFinite(n);
}
