import hsl2hsv from 'pure-color/convert/hsl2hsv'
import hsv2hsl from 'pure-color/convert/hsv2hsl'

let onDragStart: (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any
let onDragMove:  (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any

let dragging: HTMLElement | boolean | undefined
const pointerEventSupported = 'PointerEvent' in window
if (!pointerEventSupported && 'ontouchend' in window) {
  onDragStart = (element, callback) => element.addEventListener('touchstart', event => {
    if (dragging = event.touches.length === 1 && element) {
      event.preventDefault()
      callback(event.targetTouches[0])
    }
  })
  onDragMove = (element, callback) => element.addEventListener('touchmove', event => {
    if (dragging === element) {
      event.preventDefault()
      callback(event.targetTouches[0])
    }
  })
} else {
  onDragStart = (element, callback) => element.addEventListener(pointerEventSupported ? 'pointerdown' : 'mousedown', event => {
    if (event.button === 0) {
      dragging = element
      callback(event)
    }
  })
  onDragMove = (element, callback) => addEventListener(pointerEventSupported ? 'pointermove' : 'mousemove', event => {
    if (dragging === element) {
      callback(event)
    }
  })
  addEventListener(pointerEventSupported ? 'pointerup' : 'mouseup', () => { dragging = undefined })
}

export interface ReinventedColorWheelOptions {
  readonly appendTo: HTMLElement
  readonly hsv?: number[]
  readonly hsl?: number[]
  readonly wheelDiameter?: number
  readonly wheelThickness?: number
  readonly handleDiameter?: number
  readonly wheelReflectsSaturation?: boolean
  readonly onChange?: (color: { hsl: number[], hsv: number[] }) => any
}

const defaultOptions = {
  hsv: [0, 100, 100],
  hsl: [0, 100, 50],
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  wheelReflectsSaturation: true,
  onChange: (() => {}) as NonNullable<ReinventedColorWheelOptions['onChange']>,
}

export default class ReinventedColorWheel {
  static default = ReinventedColorWheel
  static defaultOptions = defaultOptions
  static hsv2hsl = hsv2hsl
  static hsl2hsv = hsl2hsv

  hsv: number[]
  hsl: number[]
  wheelDiameter           = this._option('wheelDiameter')
  wheelThickness          = this._option('wheelThickness')
  handleDiameter          = this._option('handleDiameter')
  onChange                = this._option('onChange')
  wheelReflectsSaturation = this._option('wheelReflectsSaturation')

  rootElement      = this.options.appendTo.appendChild(createElementWithClass('div', 'reinvented-color-wheel'))
  hueWheelElement  = this.rootElement.appendChild(createElementWithClass('canvas',   'reinvented-color-wheel--hue-wheel'))
  hueHandleElement = this.rootElement.appendChild(createElementWithClass('div',      'reinvented-color-wheel--hue-handle'))
  svSpaceElement   = this.rootElement.appendChild(createElementWithClass('canvas',   'reinvented-color-wheel--sv-space'))
  svHandleElement  = this.rootElement.appendChild(createElementWithClass('div',      'reinvented-color-wheel--sv-handle'))

  private _redrawHueWheelRequested: boolean | undefined
  private _redrawSvSpaceRequested: boolean | undefined

  constructor(private options: ReinventedColorWheelOptions) {
    if (!options.hsv && options.hsl) {
      this.hsv = ReinventedColorWheel.hsl2hsv(this.hsl = normalizeHsvOrDefault(options.hsl, defaultOptions.hsl))
    } else {
      this.hsl = ReinventedColorWheel.hsv2hsl(this.hsv = normalizeHsvOrDefault(options.hsv, defaultOptions.hsv))
    }
    onDragStart(this.hueWheelElement, event => {
      const rect = this.hueWheelElement.getBoundingClientRect()
      if (this.hueWheelElement.getContext('2d')!.getImageData(event.clientX - rect.left, event.clientY - rect.top, 1, 1).data[3]) {
        this._onMoveHueHandle(event)
      } else {
        dragging = undefined
      }
    })
    onDragMove(this.hueWheelElement, this._onMoveHueHandle)
    onDragStart(this.svSpaceElement, this._onMoveSvHandle)
    onDragMove(this.svSpaceElement, this._onMoveSvHandle)
    this.redraw()
  }

  setHSV(h?: number, s?: number, v?: number): void
  setHSV() {
    const oldHsv = this.hsv
    const newHsv = this.hsv = normalizeHsvOrDefault(arguments, oldHsv)
    const hueChanged = oldHsv[0] - newHsv[0]
    const svChanged = oldHsv[1] - newHsv[1] || oldHsv[2] - newHsv[2]
    if (hueChanged) {
      this.hsl[0] = this.hsv[0]
      this._redrawHueHandle()
      if (!this._redrawSvSpaceRequested) {
        requestAnimationFrame(this._redrawSvSpace)
        this._redrawSvSpaceRequested = true
      }
    }
    if (svChanged) {
      this.hsl = ReinventedColorWheel.hsv2hsl(newHsv)
      this._redrawSvHandle()
      if (this.wheelReflectsSaturation && !this._redrawHueWheelRequested) {
        requestAnimationFrame(this._redrawHueWheel)
        this._redrawHueWheelRequested = true
      }
    }
    if (hueChanged || svChanged) {
      this.onChange(this)
    }
  }

  setHSL(h?: number, s?: number, l?: number): void
  setHSL() {
    this.setHSV(...ReinventedColorWheel.hsl2hsv(normalizeHsvOrDefault(arguments, this.hsl)))
  }

  redraw() {
    this.hueWheelElement.width = this.hueWheelElement.height = this.wheelDiameter
    this.svSpaceElement.width = this.svSpaceElement.height = (this.wheelDiameter - this.wheelThickness * 2) * Math.sqrt(2) / 2

    const hueHandleStyle = this.hueHandleElement.style
    const svHandleStyle  = this.svHandleElement.style
    hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = `${this.handleDiameter}px`
    hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = `${-this.handleDiameter / 2}px`

    this._redrawHueWheel()
    this._redrawHueHandle()
    this._redrawSvSpace()
    this._redrawSvHandle()
  }

  private _redrawHueWheel = () => {
    this._redrawHueWheelRequested = false
    const wheelDiameter = this.wheelDiameter
    const center = wheelDiameter / 2
    const radius = center - this.wheelThickness / 2
    const TO_RAD = Math.PI / 180
    const hslPostfix = this.wheelReflectsSaturation ? `,${this.hsl[1]}%,${this.hsl[2]}%)` : ',100%,50%)'
    const ctx = this.hueWheelElement.getContext('2d')!
    ctx.clearRect(0, 0, wheelDiameter, wheelDiameter)
    ctx.lineWidth = this.wheelThickness
    for (let i = 0; i < 360; i++) {
      ctx.beginPath()
      ctx.arc(center, center, radius, (i - 90.7) * TO_RAD, (i - 89.3) * TO_RAD)
      ctx.strokeStyle = 'hsl(' + i + hslPostfix
      ctx.stroke()
    }
  }

  private _redrawSvSpace = () => {
    this._redrawSvSpaceRequested = false
    const svSpaceElement = this.svSpaceElement
    const sideLength = svSpaceElement.width
    const cellWidth = sideLength / 100
    const cellFillWidth = cellWidth + 1 | 0
    const h = this.hsv[0]
    const hslPrefix = `hsl(${h},`
    const hsv0 = [h, 0, 100]
    const hsv1 = [h, 0, 0]
    const ctx = svSpaceElement.getContext('2d')!
    ctx.clearRect(0, 0, sideLength, sideLength)
    for (let i = 0; i < 100; i++) {
      hsv0[1] = hsv1[1] = i
      const gradient = ctx.createLinearGradient(0, 0, 0, sideLength)
      const color0 = ReinventedColorWheel.hsv2hsl(hsv0)
      const color1 = ReinventedColorWheel.hsv2hsl(hsv1)
      gradient.addColorStop(0, `${hslPrefix}${color0[1]}%,${color0[2]}%)`)
      gradient.addColorStop(1, `${hslPrefix}${color1[1]}%,${color1[2]}%)`)
      ctx.fillStyle = gradient
      ctx.fillRect(i * cellWidth | 0, 0, cellFillWidth, sideLength)
    }
  }

  private _redrawHueHandle() {
    const center = this.wheelDiameter / 2
    const wheelRadius = center - this.wheelThickness / 2
    const angle = (this.hsv[0] - 90) * Math.PI / 180
    const hueHandleStyle = this.hueHandleElement.style
    hueHandleStyle.left = `${wheelRadius * Math.cos(angle) + center}px`
    hueHandleStyle.top = `${wheelRadius * Math.sin(angle) + center}px`
  }

  private _redrawSvHandle() {
    const svSpaceElement = this.svSpaceElement
    const svHandleStyle = this.svHandleElement.style
    svHandleStyle.left = `${svSpaceElement.offsetLeft + svSpaceElement.offsetWidth * this.hsv[1] / 100}px`
    svHandleStyle.top = `${svSpaceElement.offsetTop + svSpaceElement.offsetHeight * (1 - this.hsv[2] / 100)}px`
  }

  private _onMoveHueHandle = (event: { clientX: number, clientY: number }) => {
    const hueWheelRect = this.hueWheelElement.getBoundingClientRect()
    const center = this.wheelDiameter / 2
    const x = event.clientX - hueWheelRect.left - center
    const y = event.clientY - hueWheelRect.top - center
    const angle = Math.atan2(y, x)
    this.setHSV(angle * 180 / Math.PI + 90)
  }

  private _onMoveSvHandle = (event: { clientX: number, clientY: number }) => {
    const svSpaceRect = this.svSpaceElement.getBoundingClientRect()
    const s = 100 * (event.clientX - svSpaceRect.left) / svSpaceRect.width
    const v = 100 * (svSpaceRect.bottom - event.clientY) / svSpaceRect.height
    this.setHSV(this.hsv[0], s, v)
  }

  private _option<P extends keyof typeof defaultOptions>(property: P): typeof defaultOptions[P] {
    const option = this.options[property]
    return option !== undefined ? option! : defaultOptions[property]
  }
}

function normalizeHsvOrDefault(hsv: ArrayLike<number | undefined> | undefined, defaultHsvOrHsl: number[]) {
  if (hsv) {
    return [
      isFiniteNumber(hsv[0]) ? positiveIntModulo(hsv[0]!, 360) : defaultHsvOrHsl[0],
      isFiniteNumber(hsv[1]) ? normalizePercentage(hsv[1]!) : defaultHsvOrHsl[1],
      isFiniteNumber(hsv[2]) ? normalizePercentage(hsv[2]!) : defaultHsvOrHsl[2],
    ]
  } else {
    return defaultHsvOrHsl
  }
}

function normalizePercentage(value: number) {
  return value < 0 ? 0 : value > 100 ? 100 : value
}

function isFiniteNumber(n: any): n is number {
  return typeof n === 'number' && isFinite(n)
}

function positiveIntModulo(value: number, divisor: number) {
  const modulo = (value + .5 | 0) % divisor
  return modulo < 0 ? modulo + divisor : modulo
}

function createElementWithClass<K extends keyof HTMLElementTagNameMap>(tagName: K, className: string) {
  const element = document.createElement(tagName)
  element.className = className
  return element
}
