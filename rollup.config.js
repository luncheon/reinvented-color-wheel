import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const config = (format, extension, compress, external) => ({
  input: `es/reinvented-color-wheel.js`,
  external,
  output: {
    format,
    file: `${format}/reinvented-color-wheel.${extension}`,
    name: 'ReinventedColorWheel',
  },
  plugins: [
    resolve(),
    commonjs(),
    ...compress ? [terser({ toplevel: format === 'es', output: { semicolons: false }, warnings: true })] : [],
  ],
})

export default [
  config('es', 'bundle.js', false),
  config('es', 'bundle.min.js', true),
  config('cjs', 'js', false, id => /[/\\]node_modules[/\\]/.test(id)),
  config('iife', 'js', false),
  config('iife', 'min.js', true),
]
