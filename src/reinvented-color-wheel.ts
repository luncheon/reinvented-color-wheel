import _hsl2hsv from 'pure-color/convert/hsl2hsv'
import _hsv2hsl from 'pure-color/convert/hsv2hsl'
import _rgb2hsv from './rgb2hsv'
import _hsv2rgb from './hsv2rgb'
import _rgb2hex from 'pure-color/convert/rgb2hex'
import _hex2rgb from 'pure-color/parse/hex'
import { normalizeHsvOrDefault, normalizeHsl } from './normalize'
import { onDrag } from './on-drag'
import { window } from './window'

export interface ReinventedColorWheelOptions {
  readonly appendTo: HTMLElement
  readonly hsv?: Readonly<[number, number, number]>
  readonly hsl?: Readonly<[number, number, number]>
  readonly rgb?: Readonly<[number, number, number]>
  readonly hex?: string
  readonly wheelDiameter?: number
  readonly wheelThickness?: number
  readonly handleDiameter?: number
  readonly wheelReflectsSaturation?: boolean
  readonly onChange?: (color: ReinventedColorWheel) => any
}

const defaultOptions: {
  hsv: [number, number, number],
  hsl: [number, number, number],
  wheelDiameter: number,
  wheelThickness: number,
  handleDiameter: number,
  wheelReflectsSaturation: boolean,
  onChange: (color: ReinventedColorWheel) => any,
} = {
  hsv: [0, 100, 100],
  hsl: [0, 100, 50],
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  wheelReflectsSaturation: true,
  onChange: () => {},
}

const Matrix: typeof DOMMatrixReadOnly = window.DOMMatrix || window.WebKitCSSMatrix || window.MSCSSMatrix
const inverseTransform = (element: Element) => {
  const ancestors: Element[] = [element]
  while (element = element.parentElement!) {
    ancestors.push(element)
  }
  let matrix = new Matrix()
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const style = getComputedStyle(ancestors[i])
    const transform = style.transform
    if (transform && transform !== 'none') {
      const transformOrigin = style.transformOrigin!.split(' ').map(parseFloat)
      matrix = matrix
        .translate(transformOrigin[0], transformOrigin[1])
        .multiply(new Matrix(transform))
        .translate(-transformOrigin[0], -transformOrigin[1])
    }
  }
  return matrix.inverse()
}

const tripletsAreEqual = (a: Readonly<[number, number, number]>, b: Readonly<[number, number, number]>) =>
  a === b || (a[0] === b[0] && a[1] === b[1] && a[2] === b[2])

export default class ReinventedColorWheel {
  static default = ReinventedColorWheel
  static defaultOptions = defaultOptions
  static hsv2hsl = _hsv2hsl
  static hsl2hsv = _hsl2hsv
  static hsv2rgb = _hsv2rgb
  static rgb2hsv = _rgb2hsv
  static rgb2hex = _rgb2hex
  static hex2rgb = _hex2rgb

  wheelDiameter           = this.options.wheelDiameter  || defaultOptions.wheelDiameter
  wheelThickness          = this.options.wheelThickness || defaultOptions.wheelThickness
  handleDiameter          = this.options.handleDiameter || defaultOptions.handleDiameter
  onChange                = this.options.onChange       || defaultOptions.onChange
  wheelReflectsSaturation = this.options.wheelReflectsSaturation !== undefined ? this.options.wheelReflectsSaturation : defaultOptions.wheelReflectsSaturation

  readonly rootElement      = this.options.appendTo.appendChild(createElementWithClass('div', 'reinvented-color-wheel'))
  readonly hueWheelElement  = this.rootElement.appendChild(createElementWithClass('canvas',   'reinvented-color-wheel--hue-wheel'))
  readonly hueWheelContext  = this.hueWheelElement.getContext('2d')!
  readonly hueHandleElement = this.rootElement.appendChild(createElementWithClass('div',      'reinvented-color-wheel--hue-handle'))
  readonly svSpaceElement   = this.rootElement.appendChild(createElementWithClass('canvas',   'reinvented-color-wheel--sv-space'))
  readonly svSpaceContext   = this.svSpaceElement.getContext('2d')!
  readonly svHandleElement  = this.rootElement.appendChild(createElementWithClass('div',      'reinvented-color-wheel--sv-handle'))

  private _redrawHueWheelRequested: boolean | undefined
  private _inverseTransform: DOMMatrixReadOnly | undefined
  private _center: { x: number, y: number } | undefined

  private _hsv: Readonly<[number, number, number]>
  private _hsl: Readonly<[number, number, number]>
  private _rgb: Readonly<[number, number, number]>
  private _hex: string

  get hsv(): Readonly<[number, number, number]> { return this._hsv }
  get hsl(): Readonly<[number, number, number]> { return this._hsl }
  get rgb(): Readonly<[number, number, number]> { return this._rgb }
  get hex(): string { return this._hex }

  set hsv(value: Readonly<[number, number, number]>) {
    tripletsAreEqual(this._hsv, value) || this._setHSV(value)
  }
  set hsl(value: Readonly<[number, number, number]>) {
    tripletsAreEqual(this._hsl, value) || this._setHSV(ReinventedColorWheel.hsl2hsv(value))
  }
  set rgb(value: Readonly<[number, number, number]>) {
    tripletsAreEqual(this._rgb, value) || this._setHSV(ReinventedColorWheel.rgb2hsv(value))
  }
  set hex(value: string) {
    this._hex !== value && (this.rgb = ReinventedColorWheel.hex2rgb(value))
  }

  /** @deprecated */ setHSV() { this.hsv = arguments as any }
  /** @deprecated */ setHSL() { this.hsl = arguments as any }

  constructor(private options: ReinventedColorWheelOptions) {
    this.hueWheelContext.imageSmoothingEnabled = false
    this.svSpaceContext.imageSmoothingEnabled = false

    this._hsv = normalizeHsvOrDefault(
      options.hsv ? options.hsv :
      options.hsl ? ReinventedColorWheel.hsl2hsv(options.hsl) :
      options.rgb ? ReinventedColorWheel.rgb2hsv(options.rgb) :
      options.hex ? ReinventedColorWheel.rgb2hsv(ReinventedColorWheel.hex2rgb(options.hex)) :
      undefined,
      defaultOptions.hsv
    )
    this._hsl = normalizeHsl(ReinventedColorWheel.hsv2hsl(this._hsv))
    this._rgb = ReinventedColorWheel.hsv2rgb(this._hsv)
    this._hex = ReinventedColorWheel.rgb2hex(this._rgb)

    const invertTransform = (x: number, y: number) => {
      const m = this._inverseTransform!.multiply(new Matrix(`matrix(1,0,0,1,${x},${y})`))
      return { x: m.e, y: m.f }
    }
    const onDragStart = (element: HTMLElement) => {
      this._inverseTransform = inverseTransform(element)
      const rect = element.getBoundingClientRect()
      this._center = invertTransform(rect.left + rect.width / 2, rect.top + rect.height / 2)
    }
    const onDragStartHue = (event: { clientX: number, clientY: number }) => {
      onDragStart(this.hueWheelElement)
      const point = invertTransform(event.clientX, event.clientY)
      const x = point.x - this._center!.x
      const y = point.y - this._center!.y
      const wheelInnerRadius = this.wheelDiameter / 2 - this.wheelThickness
      if (x * x + y * y < wheelInnerRadius * wheelInnerRadius) {
        return false
      }
      onDragMoveHue(event)
    }
    const onDragMoveHue = (event: { clientX: number, clientY: number }) => {
      const point = invertTransform(event.clientX, event.clientY)
      const x = point.x - this._center!.x
      const y = point.y - this._center!.y
      const angle = Math.atan2(y, x)
      this.hsv = [angle * 180 / Math.PI + 90, this.hsv[1], this.hsv[2]]
    }
    const onDragMoveSv = (event: { clientX: number, clientY: number }) => {
      const point = invertTransform(event.clientX, event.clientY)
      const a = 100 / this.svSpaceElement.width
      const s = (point.x - this._center!.x) * a + 50
      const v = (this._center!.y - point.y) * a + 50
      this.hsv = [this._hsv[0], s, v]
    }
    const onDragStartSv = (event: { clientX: number, clientY: number }) => {
      onDragStart(this.svSpaceElement)
      onDragMoveSv(event)
    }
    onDrag(this.hueWheelElement, onDragStartHue, onDragMoveHue)
    onDrag(this.svSpaceElement, onDragStartSv, onDragMoveSv)
    onDrag(this.svHandleElement, onDragStartSv, onDragMoveSv)
    this.redraw()
  }

  redraw() {
    this.hueWheelElement.width = this.hueWheelElement.height = this.wheelDiameter
    this.svSpaceElement.width = this.svSpaceElement.height = (this.wheelDiameter - this.wheelThickness * 2) * Math.SQRT1_2

    const hueHandleStyle = this.hueHandleElement.style
    const svHandleStyle  = this.svHandleElement.style
    hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = `${this.handleDiameter}px`
    hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = `${-this.handleDiameter / 2}px`

    this._redrawHueWheel()
    this._redrawHueHandle()
    this._redrawSvSpace()
    this._redrawSvHandle()
  }

  private _setHSV(hsv: Readonly<[number, number, number]>) {
    const oldHsv = this._hsv
    const newHsv = this._hsv = normalizeHsvOrDefault(hsv, oldHsv)
    const hueChanged = oldHsv[0] - newHsv[0]
    const svChanged = oldHsv[1] - newHsv[1] || oldHsv[2] - newHsv[2]
    if (hueChanged) {
      this._hsl = [newHsv[0], this._hsl[1], this._hsl[2]]
      this._redrawHueHandle()
      this._updateSvBackground()
    }
    if (svChanged) {
      this._hsl = normalizeHsl(ReinventedColorWheel.hsv2hsl(newHsv))
      this._redrawSvHandle()
      if (this.wheelReflectsSaturation && !this._redrawHueWheelRequested) {
        requestAnimationFrame(this._redrawHueWheel)
        this._redrawHueWheelRequested = true
      }
    }
    if (hueChanged || svChanged) {
      this._rgb = ReinventedColorWheel.hsv2rgb(newHsv)
      this._hex = ReinventedColorWheel.rgb2hex(this._rgb)
      this.onChange(this)
    }
  }

  private _redrawHueWheel = () => {
    this._redrawHueWheelRequested = false
    const wheelDiameter = this.wheelDiameter
    const center = wheelDiameter / 2
    const radius = center - this.wheelThickness / 2
    const TO_RAD = Math.PI / 180
    const hslPostfix = this.wheelReflectsSaturation ? `,${this._hsl[1]}%,${this._hsl[2]}%)` : ',100%,50%)'
    const ctx = this.hueWheelContext
    ctx.clearRect(0, 0, wheelDiameter, wheelDiameter)
    ctx.lineWidth = this.wheelThickness
    for (let i = 0; i < 360; i++) {
      ctx.beginPath()
      ctx.arc(center, center, radius, (i - 90.7) * TO_RAD, (i - 89.3) * TO_RAD)
      ctx.strokeStyle = 'hsl(' + i + hslPostfix
      ctx.stroke()
    }
  }

  private _redrawSvSpace() {
    this._updateSvBackground()
    const sideLength = this.svSpaceElement.width
    const ctx = this.svSpaceContext
    const saturationGradient = ctx.createLinearGradient(0, 0, sideLength, 0)
    const valueGradient = ctx.createLinearGradient(0, 0, 0, sideLength)
    saturationGradient.addColorStop(0, 'rgba(255,255,255,1)')
    saturationGradient.addColorStop(1, 'rgba(255,255,255,0)')
    valueGradient.addColorStop(0, 'rgba(0,0,0,0)')
    valueGradient.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = saturationGradient
    ctx.fillRect(0, 0, sideLength, sideLength)
    ctx.fillStyle = valueGradient
    ctx.fillRect(0, 0, sideLength, sideLength)
  }

  private _updateSvBackground() {
    this.svSpaceElement.style.backgroundColor = `hsl(${this._hsv[0]},100%,50%)`
  }

  private _redrawHueHandle() {
    const center = this.wheelDiameter / 2
    const wheelRadius = center - this.wheelThickness / 2
    const angle = (this._hsv[0] - 90) * Math.PI / 180
    const hueHandleStyle = this.hueHandleElement.style
    hueHandleStyle.left = `${wheelRadius * Math.cos(angle) + center}px`
    hueHandleStyle.top = `${wheelRadius * Math.sin(angle) + center}px`
  }

  private _redrawSvHandle() {
    const svSpaceElementWidth = this.svSpaceElement.width
    const svHandleStyle = this.svHandleElement.style
    const offset = (this.wheelDiameter - svSpaceElementWidth) / 2
    const hsv = this._hsv
    svHandleStyle.left = `${offset + svSpaceElementWidth * hsv[1] / 100}px`
    svHandleStyle.top = `${offset + svSpaceElementWidth * (1 - hsv[2] / 100)}px`
  }
}

function createElementWithClass<K extends keyof HTMLElementTagNameMap>(tagName: K, className: string) {
  const element = document.createElement(tagName)
  element.className = className
  return element
}
