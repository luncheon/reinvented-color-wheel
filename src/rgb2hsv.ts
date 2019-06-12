// http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
export default function rgb2hsv(rgb: ArrayLike<number>): [number, number, number] {
  const r = rgb[0]
  const g = rgb[1]
  const b = rgb[2]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const h = delta && 60 * (
    max === r ? (g - b) / delta % 6 :
    max === g ? (b - r) / delta + 2 :
                (r - g) / delta + 4
  )
  return [
    h < 0 ? h + 360 : h,
    max && delta * 100 / max,
    max * 100 / 255,
  ]
}
