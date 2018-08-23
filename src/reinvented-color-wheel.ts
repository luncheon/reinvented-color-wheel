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
  onChange: () => {},
}

export default class ReinventedColorWheel {
  static defaultOptions = defaultOptions

  h = NaN
  s = NaN
  l = NaN
  wheelDiameter   = this.options.wheelDiameter  || defaultOptions.wheelDiameter
  wheelThickness  = this.options.wheelThickness || defaultOptions.wheelThickness
  handleDiameter  = this.options.handleDiameter || defaultOptions.handleDiameter
  onChange        = this.options.onChange       || defaultOptions.onChange

  containerElement      = this.options.parentElement.appendChild(createElementWithClass('div', 'reinvented-color-wheel'))
  hueWheelElement       = this.containerElement.appendChild(createElementWithClass('canvas',   'reinvented-color-wheel--hue-wheel'))
  hueHandleElement      = this.containerElement.appendChild(createElementWithClass('div',      'reinvented-color-wheel--hue-handle'))
  hueInnerCircleElement = this.containerElement.appendChild(createElementWithClass('div',      'reinvented-color-wheel--hue-inner-circle')) // to ignore events inside the wheel
  svSpaceElement        = this.containerElement.appendChild(createElementWithClass('canvas',   'reinvented-color-wheel--sv-space'))
  svHandleElement       = this.containerElement.appendChild(createElementWithClass('div',      'reinvented-color-wheel--sv-handle'))

  constructor(private options: ReinventedColorWheelOptions) {
    const wheelDiameter  = this.wheelDiameter
    const wheelThickness = this.wheelThickness

    this.containerElement.addEventListener('pointerdown', preventDefault)
    this.containerElement.addEventListener('mousedown',   preventDefault)

    {
      const hueWheelElement = this.hueWheelElement
      const onMoveHueHandle = this._onMoveHueHandle.bind(this)
      hueWheelElement.width = hueWheelElement.height = wheelDiameter
      onDragStart(hueWheelElement, onMoveHueHandle)
      onDragMove(hueWheelElement, onMoveHueHandle)
    }
    {
      const hueHandleStyle = this.hueHandleElement.style
      const svHandleStyle  = this.svHandleElement.style
      const handleDiameter = this.handleDiameter
      hueHandleStyle.width = hueHandleStyle.height = svHandleStyle.width = svHandleStyle.height = `${handleDiameter}px`
      hueHandleStyle.marginLeft = hueHandleStyle.marginTop = svHandleStyle.marginLeft = svHandleStyle.marginTop = `${-handleDiameter / 2}px`
    }
    this.hueInnerCircleElement.style.width = this.hueInnerCircleElement.style.height = `${wheelDiameter - wheelThickness - wheelThickness}px`
    {
      const svSpaceElement = this.svSpaceElement
      const onMoveSvHandle = this._onMoveSvHandle.bind(this)
      svSpaceElement.width = svSpaceElement.height = (wheelDiameter - wheelThickness - wheelThickness) * Math.sqrt(2) / 2
      onDragStart(svSpaceElement, onMoveSvHandle)
      onDragMove(svSpaceElement, onMoveSvHandle)
    }

    this.setHSL({
      h: isFiniteNumber(options.h) ? options.h : defaultOptions.h,
      s: isFiniteNumber(options.s) ? options.s : defaultOptions.s,
      l: isFiniteNumber(options.l) ? options.l : defaultOptions.l,
    })
  }

  setHSL(hsl: Partial<HSL>) {
    const oldH = this.h
    const oldS = this.s
    const oldL = this.l
    isFiniteNumber(hsl.h) && (this.h = positiveIntModulo(hsl.h, 360))
    isFiniteNumber(hsl.s) && (this.s = limit_0_100(hsl.s))
    isFiniteNumber(hsl.l) && (this.l = limit_0_100(hsl.l))
    const hueChanged = oldH !== this.h
    const slChanged = oldS !== this.s || oldL !== this.l
    if (hueChanged) {
      this._redrawHueHandle()
      this._redrawSvSpace()
    }
    if (slChanged) {
      this._redrawHueWheel()
      this._redrawSvHandle()
    }
    if (hueChanged || slChanged) {
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
    const h = this.h
    ctx.clearRect(0, 0, sideLength, sideLength)
    for (let i = 0; i < 100; i++) {
      const gradient = ctx.createLinearGradient(0, 0, 0, sideLength)
      const color0 = hsv2hsl([h, i, 100])
      const color1 = hsv2hsl([h, i, 0])
      gradient.addColorStop(0, `hsl(${h},${color0[1]}%,${color0[2]}%)`)
      gradient.addColorStop(1, `hsl(${h},${color1[1]}%,${color1[2]}%)`)
      ctx.fillStyle = gradient
      ctx.fillRect((i * cellWidth) | 0, 0, (cellWidth + 1) | 0, sideLength)
    }
  }

  private _redrawHueHandle() {
    const center = this.wheelDiameter / 2
    const wheelRadius = center - this.wheelThickness / 2
    const angle = (this.h - 90) * Math.PI / 180
    const hueHandleStyle = this.hueHandleElement.style
    hueHandleStyle.left = `${wheelRadius * Math.cos(angle) + center}px`
    hueHandleStyle.top = `${wheelRadius * Math.sin(angle) + center}px`
  }

  private _redrawSvHandle() {
    const hsv = hsl2hsv([this.h, this.s, this.l])
    const svSpaceElement = this.svSpaceElement
    const svHandleStyle = this.svHandleElement.style
    svHandleStyle.left = `${svSpaceElement.offsetLeft + svSpaceElement.offsetWidth * hsv[1] / 100}px`
    svHandleStyle.top = `${svSpaceElement.offsetTop + svSpaceElement.offsetHeight * (1 - hsv[2] / 100)}px`
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
    const s = 100 * (event.clientX - svSpaceRect.left) / svSpaceRect.width
    const v = 100 * (svSpaceRect.bottom - event.clientY) / svSpaceRect.height
    const hsl = hsv2hsl([this.h, s, v])
    this.setHSL({ s: hsl[1], l: hsl[2] })
  }
}

function isFiniteNumber(n: any): n is number {
  return typeof n === 'number' && isFinite(n)
}

function limit_0_100(value: number) {
  return value < 0 ? 0 : value > 100 ? 100 : (value + .5) | 0
}

function positiveIntModulo(value: number, divisor: number) {
  const modulo = ((value + .5) | 0) % divisor
  return modulo < 0 ? modulo + divisor : modulo
}

function preventDefault(event: Event) {
  event.preventDefault()
}

function createElementWithClass<K extends keyof HTMLElementTagNameMap>(tagName: K, className: string) {
  const element = document.createElement(tagName)
  element.className = className
  return element
}
