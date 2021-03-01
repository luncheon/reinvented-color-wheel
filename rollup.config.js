import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

const config = (format, extension, compress, external) => ({
  input: `es/reinvented-color-wheel.js`,
  external,
  output: {
    format,
    exports: 'default',
    file: `${format}/reinvented-color-wheel.${extension}`,
    name: 'ReinventedColorWheel',
  },
  plugins: [
    filesize({ showBrotliSize: true }),
    resolve(),
    commonjs(),
    ...compress ? [terser({ toplevel: format === 'es', output: { semicolons: false }, warnings: true, compress: { passes: 3 } })] : [],
  ],
})

export default [
  config('es', 'bundle.js', false),
  config('es', 'bundle.min.js', true),
  config('cjs', 'js', false, id => id.startsWith('pure-color/')),
  config('iife', 'js', false),
  config('iife', 'min.js', true),
]
