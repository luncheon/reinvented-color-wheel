import hsl2hsv from 'pure-color/convert/hsl2hsv'
import hsv2hsl from 'pure-color/convert/hsv2hsl'

let onDragStart: (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any
let onDragMove:  (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any

let dragging: HTMLElement | undefined
if ('PointerEvent' in window) {
  onDragStart = (element, callback) => element.addEventListener('pointerdown',  event => (dragging = element, callback(event)))
  onDragMove  = (element, callback) =>         addEventListener('pointermove',  event => dragging === element && callback(event))
  addEventListener('pointerup', () => dragging = undefined)
} else if ('ontouchend' in window) {
  onDragStart = (element, callback) => element.addEventListener('touchstart',   event => (event.preventDefault(), callback(event.targetTouches[0])))
  onDragMove  = (element, callback) => element.addEventListener('touchmove',    event => (event.preventDefault(), callback(event.targetTouches[0])))
} else {
  onDragStart = (element, callback) => element.addEventListener('mousedown',    event => (dragging = element, callback(event)))
  onDragMove  = (element, callback) =>         addEventListener('mousemove',    event => dragging === element && callback(event))
  addEventListener('mouseup', () => dragging = undefined)
}

export interface HSL {
  readonly h: number
  readonly s: number
  readonly l: number
}

export interface ReinventedColorWheelOptions extends Partial<HSL> {
  readonly parentElement: HTMLElement
  readonly wheelDiameter?: number
  readonly wheelThickness?: number
  readonly handleDiameter?: number
  readonly onChange?: (hsl: HSL) => any
}

const defaultOptions = {
  h: 0,
  s: 100,
  l: 50,
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  onChange: noop,
}

export default class ReinventedColorWheel {
  static defaultOptions = defaultOptions

  h = NaN
  s = NaN
  l = NaN
  wheelDiameter = this.options.wheelDiameter || defaultOptions.wheelDiameter
  wheelThickness = this.options.wheelThickness || defaultOptions.wheelThickness
  handleDiameter = this.options.handleDiameter || defaultOptions.handleDiameter
  onChange = this.options.onChange || defaultOptions.onChange

  containerElement = this.options.parentElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel'))
  hueWheelElement = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--hue-wheel'))
  hueHandleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-handle'))
  hueInnerCircleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--hue-inner-circle'))  // to ignore events inside the wheel
  svSpaceElement = this.containerElement.appendChild(createElementWithClass('canvas', 'reinvented-color-wheel--sv-space'))
  svHandleElement = this.containerElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel--sv-handle'))

  constructor(private options: ReinventedColorWheelOptions) {
    const wheelDiameter = this.wheelDiameter
    const wheelThickness = this.wheelThickness

    this.containerElement.addEventListener('pointerdown', preventDefault)
    this.containerElement.addEventListener('mousedown', preventDefault)

    {
      const hueWheelElement = this.hueWheelElement
      const onMoveHueHandle = this._onMoveHueHandle.bind(this)
      hueWheelElement.width = hueWheelElement.height = wheelDiameter
      onDragStart(hueWheelElement, onMoveHueHandle)
      onDragMove(hueWheelElement, onMoveHueHandle)
    }
    {
      const hueHandleStyle = this.hueHandleElement.style
      const svHandleStyle = this.svHandleElement.style
      const handleDiameter = this.handleDiameter
      hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = `${handleDiameter}px`
      hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = `${-handleDiameter / 2}px`
    }
    this.hueInnerCircleElement.style.width = this.hueInnerCircleElement.style.height = `${wheelDiameter - wheelThickness - wheelThickness}px`
    {
      const svSpaceElement = this.svSpaceElement
      const onMoveSvHandle = this._onMoveSvHandle.bind(this)
      svSpaceElement.width = svSpaceElement.height = (wheelDiameter - wheelThickness - wheelThickness) * Math.sqrt(2) * .5
      onDragStart(svSpaceElement, onMoveSvHandle)
      onDragMove(svSpaceElement, onMoveSvHandle)
    }

    this.setHSL({
      h: typeof options.h === 'number' ? options.h : defaultOptions.h,
      s: typeof options.s === 'number' ? options.s : defaultOptions.s,
      l: typeof options.l === 'number' ? options.l : defaultOptions.l,
    })
  }

  setHSL(hsl: Partial<HSL>) {
    let svChanged: undefined | boolean
    if (typeof hsl.s === 'number' && hsl.s !== this.s) {
      this.s = limitInt(hsl.s, 0, 100)
      svChanged = true
    }
    if (typeof hsl.l === 'number' && hsl.l !== this.l) {
      this.l = limitInt(hsl.l, 0, 100)
      svChanged = true
    }
    if (svChanged) {
      this._redrawHueWheel()
      this._redrawSvHandle()
    }
    if (typeof hsl.h === 'number' && hsl.h !== this.h) {
      this.h = positiveIntModulo(hsl.h, 360)
      this._redrawHueHandle()
      this._redrawSvSpace()
      this.onChange(this)
    } else if (svChanged) {
      this.onChange(this)
    }
  }

  private _redrawHueWheel() {
    const center = this.wheelDiameter / 2
    const radius = center - this.wheelThickness / 2
    const ctx = this.hueWheelElement.getContext('2d')!
    const TO_RAD = Math.PI / 180
    for (let i = 0; i < 360; i++) {
      ctx.beginPath()
      ctx.arc(center, center, radius, (i - 90.6) * TO_RAD, (i - 89.4) * TO_RAD)
      ctx.strokeStyle = `hsl(${i},${this.s}%,${this.l}%)`
      ctx.lineWidth = this.wheelThickness
      ctx.stroke()
    }
  }

  private _redrawSvSpace() {
    const svSpaceElement = this.svSpaceElement
    const sideLength = svSpaceElement.width
    const cellWidth = sideLength / 100
    const ctx = svSpaceElement.getContext('2d')!
    ctx.clearRect(0, 0, sideLength, sideLength)
    for (let i = 0; i < 100; i++) {
      const gradient = ctx.createLinearGradient(0, 0, 0, sideLength)
      const color0 = hsv2hsl([this.h, i, 100])
      const color1 = hsv2hsl([this.h, i, 0])
      gradient.addColorStop(0, `hsl(${color0[0]},${color0[1]}%,${color0[2]}%)`)
      gradient.addColorStop(1, `hsl(${color1[0]},${color1[1]}%,${color1[2]}%)`)
      ctx.fillStyle = gradient
      ctx.fillRect((i * cellWidth) | 0, 0, (cellWidth + 1) | 0, sideLength)
    }
  }

  private _redrawHueHandle() {
    const center = this.wheelDiameter / 2
    const wheelRadius = center - this.wheelThickness / 2
    const angle = (this.h - 90) * Math.PI / 180
    this.hueHandleElement.style.left = `${wheelRadius * Math.cos(angle) + center}px`
    this.hueHandleElement.style.top = `${wheelRadius * Math.sin(angle) + center}px`
  }

  private _redrawSvHandle() {
    const hsv = hsl2hsv([this.h, this.s, this.l])
    this.svHandleElement.style.left = `${this.svSpaceElement.offsetLeft + this.svSpaceElement.offsetWidth * hsv[1] / 100}px`
    this.svHandleElement.style.top = `${this.svSpaceElement.offsetTop + this.svSpaceElement.offsetHeight * (1 - hsv[2] / 100)}px`
  }

  private _onMoveHueHandle(event: { clientX: number, clientY: number }) {
    const hueWheelRect = this.hueWheelElement.getBoundingClientRect()
    const center = this.wheelDiameter / 2
    const x = event.clientX - hueWheelRect.left - center
    const y = event.clientY - hueWheelRect.top - center
    const angle = Math.atan2(y, x)
    this.setHSL({ h: angle * 180 / Math.PI + 90 })
  }

  private _onMoveSvHandle(event: { clientX: number, clientY: number }) {
    const svSpaceRect = this.svSpaceElement.getBoundingClientRect()
    const x = limitInt(event.clientX - svSpaceRect.left, 0, svSpaceRect.width - 1)
    const y = limitInt(event.clientY - svSpaceRect.top, 0, svSpaceRect.height - 1)
    const hsl = hsv2hsl([this.h, (100 * x / svSpaceRect.width) | 0, (100 - 100 * y / svSpaceRect.height) | 0])
    this.setHSL({ s: hsl[1], l: hsl[2] })
  }
}

function limitInt(value: number, min: number, max: number) {
  return Math.min(Math.max(value | 0, min), max)
}

function positiveIntModulo(value: number, divisor: number) {
  const modulo = (value | 0) % divisor
  return modulo < 0 ? modulo + divisor : modulo
}

function noop() {
}

function preventDefault(event: Event) {
  event.preventDefault()
}

function createElementWithClass<K extends keyof HTMLElementTagNameMap>(tagName: K, className: string) {
  const element = document.createElement(tagName)
  element.className = className
  return element
}
