import { it } from '@jest/globals'
import { deepStrictEqual } from 'assert'
import hsv2rgb from '../src/hsv2rgb'
import { normalizeHsvOrDefault } from '../src/normalize'
import rgb2hsv from '../src/rgb2hsv'

it('hsv2rgb(rgb2hsv([r, g, b])) = [r, g, b]', () => {
  const defaultHsv = [NaN, NaN, NaN] as const
  for (let r = 0; r < 256; r++) {
    for (let g = 0; g < 256; g++) {
      for (let b = 0; b < 256; b++) {
        deepStrictEqual(hsv2rgb(normalizeHsvOrDefault(rgb2hsv([r, g, b]), defaultHsv)), [r, g, b])
      }
    }
  }
})
