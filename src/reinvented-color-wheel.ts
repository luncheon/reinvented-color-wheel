import hsl2hsv from 'pure-color/convert/hsl2hsv'
import hsv2hsl from 'pure-color/convert/hsv2hsl'

let onDragStart: (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any
let onDragMove:  (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any

let dragging: HTMLElement | undefined
const pointerEventSupported = 'PointerEvent' in window
if (!pointerEventSupported && 'ontouchend' in window) {
  onDragStart = (element, callback) => element.addEventListener('touchstart', event => { event.preventDefault(); callback(event.targetTouches[0]) })
  onDragMove  = (element, callback) => element.addEventListener('touchmove',  event => { event.preventDefault(); callback(event.targetTouches[0]) })
} else {
  onDragStart = (element, callback) => element.addEventListener(pointerEventSupported ? 'pointerdown' : 'mousedown',  event => { dragging = element; callback(event) })
  onDragMove  = (element, callback) =>         addEventListener(pointerEventSupported ? 'pointermove' : 'mousemove',  event => { dragging === element && callback(event) })
  addEventListener(pointerEventSupported ? 'pointerup' : 'mouseup', () => dragging = undefined)
}

export interface ReinventedColorWheelOptions {
  readonly appendTo: HTMLElement
  readonly hsv?: number[]
  readonly hsl?: number[]
  readonly wheelDiameter?: number
  readonly wheelThickness?: number
  readonly handleDiameter?: number
  readonly onChange?: (color: { hsl: number[], hsv: number[] }) => any
}

const defaultOptions = {
  hsv: [0, 100, 100],
  hsl: [0, 100, 50],
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  onChange: () => {},
}

export default class ReinventedColorWheel {
  static defaultOptions = defaultOptions

  static hsv2hsl(hsv: number[]) {
    const hsl = hsv2hsl(hsv)
    return [hsl[0], (hsl[1] * 100 + .5 | 0) / 100, (hsl[2] * 100 + .5 | 0) / 100]
  }

  static hsl2hsv(hsl: number[]) {
    const hsv = hsl2hsv(hsl)
    return [hsv[0], hsv[1] | 0, hsv[2] | 0]
  }

  hsv: number[]
  hsl: number[]
  wheelDiameter   = this.options.wheelDiameter  || defaultOptions.wheelDiameter
  wheelThickness  = this.options.wheelThickness || defaultOptions.wheelThickness
  handleDiameter  = this.options.handleDiameter || defaultOptions.handleDiameter
  onChange        = this.options.onChange       || defaultOptions.onChange

  containerElement      = this.options.appendTo.appendChild(createElementWithClass('div',    'reinvented-color-wheel'))
  hueWheelElement       = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--hue-wheel'))
  hueHandleElement      = this.containerElement.appendChild(createElementWithClass('div',    'reinvented-color-wheel--hue-handle'))
  hueInnerCircleElement = this.containerElement.appendChild(createElementWithClass('div',    'reinvented-color-wheel--hue-inner-circle')) // to ignore events inside the wheel
  svSpaceElement        = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--sv-space'))
  svHandleElement       = this.containerElement.appendChild(createElementWithClass('div',    'reinvented-color-wheel--sv-handle'))

  constructor(private options: ReinventedColorWheelOptions) {
    if (!options.hsv && options.hsl) {
      this.hsv = ReinventedColorWheel.hsl2hsv(this.hsl = normalizeHsvOrDefault(options.hsl, defaultOptions.hsl))
    } else {
      this.hsl = ReinventedColorWheel.hsv2hsl(this.hsv = normalizeHsvOrDefault(options.hsv, defaultOptions.hsv))
    }

    const wheelDiameter  = this.wheelDiameter
    const wheelThickness = this.wheelThickness

    this.containerElement.addEventListener(pointerEventSupported ? 'pointerdown' : 'mousedown', event => event.preventDefault())
    {
      const hueWheelElement = this.hueWheelElement
      const onMoveHueHandle = this._onMoveHueHandle.bind(this)
      hueWheelElement.width = hueWheelElement.height = wheelDiameter
      onDragStart(hueWheelElement, onMoveHueHandle)
      onDragMove(hueWheelElement, onMoveHueHandle)
    }
    {
      const hueInnerCircleStyle = this.hueInnerCircleElement.style
      hueInnerCircleStyle.width = hueInnerCircleStyle.height = `${wheelDiameter - wheelThickness - wheelThickness}px`
    }
    {
      const hueHandleStyle = this.hueHandleElement.style
      const svHandleStyle  = this.svHandleElement.style
      const handleDiameter = this.handleDiameter
      hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = `${handleDiameter}px`
      hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = `${-handleDiameter / 2}px`
    }
    {
      const svSpaceElement = this.svSpaceElement
      const onMoveSvHandle = this._onMoveSvHandle.bind(this)
      svSpaceElement.width = svSpaceElement.height = (wheelDiameter - wheelThickness - wheelThickness) * Math.sqrt(2) / 2
      onDragStart(svSpaceElement, onMoveSvHandle)
      onDragMove(svSpaceElement, onMoveSvHandle)
    }

    this._redrawHueWheel()
    this._redrawHueHandle()
    this._redrawSvSpace()
    this._redrawSvHandle()
  }

  setHSV(h?: number, s?: number, v?: number) {
    const oldHsv = this.hsv
    this.hsv = normalizeHsvOrDefault([h, s, v], oldHsv)
    this.hsl[0] = this.hsv[0]
    const hueChanged = oldHsv[0] !== this.hsv[0]
    const svChanged = oldHsv[1] !== this.hsv[1] || oldHsv[2] !== this.hsv[2]
    if (hueChanged) {
      this._redrawHueHandle()
      this._redrawSvSpace()
    }
    if (svChanged) {
      this.hsl = ReinventedColorWheel.hsv2hsl(this.hsv)
      this._redrawHueWheel()
      this._redrawSvHandle()
    }
    if (hueChanged || svChanged) {
      this.onChange(this)
    }
  }

  setHSL(h?: number, s?: number, l?: number): void
  setHSL() {
    this.setHSV(...ReinventedColorWheel.hsl2hsv(normalizeHsvOrDefault(arguments, this.hsl)))
  }

  private _redrawHueWheel() {
    const wheelDiameter = this.wheelDiameter
    const wheelThickness = this.wheelThickness
    const center = wheelDiameter / 2
    const radius = center - wheelThickness / 2
    const ctx = this.hueWheelElement.getContext('2d')!
    const TO_RAD = Math.PI / 180
    const s = this.hsl[1]
    const l = this.hsl[2]
    ctx.clearRect(0, 0, wheelDiameter, wheelDiameter)
    for (let i = 0; i < 360; i++) {
      ctx.beginPath()
      ctx.arc(center, center, radius, (i - 90.6) * TO_RAD, (i - 89.4) * TO_RAD)
      ctx.strokeStyle = `hsl(${i},${s}%,${l}%)`
      ctx.lineWidth = wheelThickness
      ctx.stroke()
    }
  }

  private _redrawSvSpace() {
    const svSpaceElement = this.svSpaceElement
    const sideLength = svSpaceElement.width
    const cellWidth = sideLength / 100
    const ctx = svSpaceElement.getContext('2d')!
    const h = this.hsv[0]
    ctx.clearRect(0, 0, sideLength, sideLength)
    for (let i = 0; i < 100; i++) {
      const gradient = ctx.createLinearGradient(0, 0, 0, sideLength)
      const color0 = ReinventedColorWheel.hsv2hsl([h, i, 100])
      const color1 = ReinventedColorWheel.hsv2hsl([h, i, 0])
      gradient.addColorStop(0, `hsl(${h},${color0[1]}%,${color0[2]}%)`)
      gradient.addColorStop(1, `hsl(${h},${color1[1]}%,${color1[2]}%)`)
      ctx.fillStyle = gradient
      ctx.fillRect(i * cellWidth | 0, 0, cellWidth + 1 | 0, sideLength)
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

  private _onMoveHueHandle(event: { clientX: number, clientY: number }) {
    const hueWheelRect = this.hueWheelElement.getBoundingClientRect()
    const center = this.wheelDiameter / 2
    const x = event.clientX - hueWheelRect.left - center
    const y = event.clientY - hueWheelRect.top - center
    const angle = Math.atan2(y, x)
    this.setHSV(angle * 180 / Math.PI + 90)
  }

  private _onMoveSvHandle(event: { clientX: number, clientY: number }) {
    const svSpaceRect = this.svSpaceElement.getBoundingClientRect()
    const s = 100 * (event.clientX - svSpaceRect.left) / svSpaceRect.width
    const v = 100 * (svSpaceRect.bottom - event.clientY) / svSpaceRect.height
    this.setHSV(this.hsv[0], s, v)
  }
}

function normalizeHsvOrDefault(hsvOrHsl: ArrayLike<number | undefined> | undefined, defaultHsvOrHsl: number[]) {
  if (hsvOrHsl) {
    return [
      normalizeDegree(hsvOrHsl[0], defaultHsvOrHsl[0]),
      normalizePercentage(hsvOrHsl[1], defaultHsvOrHsl[1]),
      normalizePercentage(hsvOrHsl[2], defaultHsvOrHsl[2]),
    ]
  } else {
    return defaultHsvOrHsl
  }
}

function normalizeDegree(value: number | undefined, defaultValue: number) {
  return isFiniteNumber(value) ? positiveIntModulo(value, 360) : defaultValue
}

function normalizePercentage(value: number | undefined, defaultValue: number) {
  if (isFiniteNumber(value)) {
    return value < 0 ? 0 : value > 100 ? 100 : value + .5 | 0
  } else {
    return defaultValue
  }
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
