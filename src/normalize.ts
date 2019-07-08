export function normalizeHsvOrDefault(
  hsv: ArrayLike<number | undefined> | undefined,
  defaultHsvOrHsl: Readonly<[number, number, number]>,
): Readonly<[number, number, number]> {
  if (hsv) {
    return [
      isFiniteNumber(hsv[0]) ? normalizeHue(hsv[0]!)        : defaultHsvOrHsl[0],
      isFiniteNumber(hsv[1]) ? normalizePercentage(hsv[1]!) : defaultHsvOrHsl[1],
      isFiniteNumber(hsv[2]) ? normalizePercentage(hsv[2]!) : defaultHsvOrHsl[2],
    ]
  } else {
    return defaultHsvOrHsl
  }
}

export function normalizeHsl(hsl: ArrayLike<number>): [number, number, number] {
  return [
    normalizeHue(hsl[0]),
    normalizePercentage(hsl[1]),
    normalizePercentage(hsl[2]),
  ]
}

function normalizeHue(value: number) {
  const modulo = Math.round(value % 360 * 10) / 10
  return modulo < 0 ? modulo + 360 : modulo
}

function normalizePercentage(value: number) {
  return value < 0 ? 0 : value > 100 ? 100 : (value * 10 + .5 | 0) / 10
}

function isFiniteNumber(n: any): n is number {
  return typeof n === 'number' && isFinite(n)
}
