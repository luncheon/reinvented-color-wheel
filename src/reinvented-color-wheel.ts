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

export default class ReinventedColorWheel {
  static defaultOptions = {
    h: 0,
    s: 100,
    l: 50,
    wheelDiameter: 200,
    wheelThickness: 20,
    handleDiameter: 16,
    onChange: noop,
  }

  h = NaN
  s = NaN
  l = NaN
  wheelDiameter: number
  wheelThickness: number
  handleDiameter: number
  onChange: (hsl: HSL) => any

  containerElement: HTMLElement
  hueWheelElement: HTMLCanvasElement
  hueHandleElement: HTMLElement

  constructor(options: ReinventedColorWheelOptions) {
    const defaultOptions  = ReinventedColorWheel.defaultOptions
    const wheelDiameter   = this.wheelDiameter  = options.wheelDiameter  || defaultOptions.wheelDiameter
    const wheelThickness  = this.wheelThickness = options.wheelThickness || defaultOptions.wheelThickness
    const handleDiameter  = this.handleDiameter = options.handleDiameter || defaultOptions.handleDiameter
    this.onChange                               = options.onChange       || defaultOptions.onChange

    const containerElement = this.containerElement = options.parentElement.appendChild(document.createElement('div'))
    containerElement.className = 'reinvented-color-wheel'
    containerElement.addEventListener('pointerdown', preventDefault)
    containerElement.addEventListener('mousedown', preventDefault)
    {
      const hueWheelElement = this.hueWheelElement = containerElement.appendChild(document.createElement('canvas'))
      const onMoveHueHandle = this._onMoveHueHandle.bind(this)
      hueWheelElement.className = 'reinvented-color-wheel--hue-wheel'
      hueWheelElement.width = hueWheelElement.height = wheelDiameter
      onDragStart(hueWheelElement, onMoveHueHandle)
      onDragMove(hueWheelElement, onMoveHueHandle)
    }
    {
      const hueHandleElement = this.hueHandleElement = containerElement.appendChild(document.createElement('div'))
      const handleStyle = hueHandleElement.style
      hueHandleElement.className = 'reinvented-color-wheel--hue-handle'
      handleStyle.width = handleStyle.height = `${handleDiameter}px`
      handleStyle.marginLeft = handleStyle.marginTop = `${-handleDiameter / 2}px`
    }
    {
      // ignore events inside the wheel
      const innerCircleElement = containerElement.appendChild(document.createElement('div'))
      const innerCircleStyle = innerCircleElement.style
      innerCircleElement.className = 'reinvented-color-wheel--hue-inner-circle'
      innerCircleStyle.left = innerCircleStyle.top = `${wheelThickness}px`
      innerCircleStyle.width = innerCircleStyle.height = `${wheelDiameter - wheelThickness - wheelThickness}px`
    }
    this.setHSL({
      h: typeof options.h === 'number' ? options.h : defaultOptions.h,
      s: typeof options.s === 'number' ? options.s : defaultOptions.s,
      l: typeof options.l === 'number' ? options.l : defaultOptions.l,
    })
  }

  setHSL(hsl: Partial<HSL>) {
    let needsRedrawHueWheel: undefined | boolean
    if (typeof hsl.s === 'number' && hsl.s !== this.s) {
      this.s = limit(hsl.s | 0, 0, 100)
      needsRedrawHueWheel = true
    }
    if (typeof hsl.l === 'number' && hsl.l !== this.l) {
      this.l = limit(hsl.l | 0, 0, 100)
      needsRedrawHueWheel = true
    }
    if (needsRedrawHueWheel) {
      this._redrawHueWheel()
    }
    if (typeof hsl.h === 'number' && hsl.h !== this.h) {
      this.h = positiveModulo(hsl.h | 0, 360)
      this._redrawHueHandle()
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

  private _redrawHueHandle() {
    const center = this.wheelDiameter / 2
    const wheelRadius = center - this.wheelThickness / 2
    const angle = (this.h - 90) * Math.PI / 180
    this.hueHandleElement.style.left = wheelRadius * Math.cos(angle) + center + 'px'
    this.hueHandleElement.style.top = wheelRadius * Math.sin(angle) + center + 'px'
  }

  private _onMoveHueHandle(event: { clientX: number, clientY: number }) {
    const wheelRect = this.hueWheelElement.getBoundingClientRect()
    const center = this.wheelDiameter / 2
    const x = event.clientX - wheelRect.left - center
    const y = event.clientY - wheelRect.top - center
    const angle = Math.atan2(y, x)
    const h = positiveModulo(Math.round(angle * 180 / Math.PI + 90) | 0, 360)
    if (h !== this.h) {
      this.h = h
      this._redrawHueHandle()
      this.onChange(this)
    }
  }
}

function limit(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function positiveModulo(value: number, divisor: number) {
  const modulo = value % divisor
  return modulo < 0 ? modulo + divisor : modulo
}

function noop() {
}

function preventDefault(event: Event) {
  event.preventDefault()
}
