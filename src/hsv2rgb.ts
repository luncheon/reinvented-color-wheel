// http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
export default function hsv2rgb(hsv: ArrayLike<number>): [number, number, number] {
  const h = hsv[0] / 60
  const s = hsv[1] / 100
  const v = hsv[2] / 100
  const c = v * s
  const x = c * (1 - Math.abs(h % 2 - 1))
  const m = v - c
  const _x = (x + m) * 255 + .5 | 0
  const _c = (c + m) * 255 + .5 | 0
  const _0 = m * 255 + .5 | 0
  const _h = h | 0
  return (
    _h === 1 ? [_x, _c, _0] :
    _h === 2 ? [_0, _c, _x] :
    _h === 3 ? [_0, _x, _c] :
    _h === 4 ? [_x, _0, _c] :
    _h === 5 ? [_c, _0, _x] :
               [_c, _x, _0]
  )
}
