import { onDragStart, onDragMove } from './events'

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
  wheelElement: HTMLCanvasElement
  handleElement: HTMLElement

  constructor(options: ReinventedColorWheelOptions) {
    const defaultOptions  = ReinventedColorWheel.defaultOptions
    const wheelDiameter   = this.wheelDiameter  = options.wheelDiameter  || defaultOptions.wheelDiameter
    const wheelThickness  = this.wheelThickness = options.wheelThickness || defaultOptions.wheelThickness
    const handleDiameter  = this.handleDiameter = options.handleDiameter || defaultOptions.handleDiameter
    this.onChange                               = options.onChange       || defaultOptions.onChange

    const containerElement = this.containerElement = options.parentElement.appendChild(document.createElement('div'))
    const containerStyle = containerElement.style
    containerStyle.position = 'relative'
    containerStyle.display = 'inline-block'
    containerStyle.lineHeight = 0 as any
    containerElement.addEventListener('pointerdown', preventDefault)
    containerElement.addEventListener('mousedown', preventDefault)

    this.wheelElement = containerElement.appendChild(ReinventedColorWheel._createWheelElement(wheelDiameter, h => {
      if (typeof h === 'number' && (h = positiveModulo(h | 0, 360)) !== this.h) {
        this.h = h
        this._redrawHandle()
        this.onChange(this)
      }
    }))
    this.handleElement = containerElement.appendChild(ReinventedColorWheel._createHandleElement(handleDiameter))

    // ignore events inside the wheel
    const innerCircleElement = containerElement.appendChild(document.createElement('div'))
    const innerCircleStyle = innerCircleElement.style
    innerCircleStyle.position = 'absolute'
    innerCircleStyle.borderRadius = '50%'
    innerCircleStyle.left = innerCircleStyle.top = `${wheelThickness}px`
    innerCircleStyle.width = innerCircleStyle.height = `${wheelDiameter - wheelThickness - wheelThickness}px`

    this.setHSL({
      h: typeof options.h === 'number' ? options.h : defaultOptions.h,
      s: typeof options.s === 'number' ? options.s : defaultOptions.s,
      l: typeof options.l === 'number' ? options.l : defaultOptions.l,
    })
  }

  setHSL(hsl: Partial<HSL>) {
    let needsRedrawWheel: undefined | boolean
    if (typeof hsl.s === 'number' && hsl.s !== this.s) {
      this.s = limit(hsl.s | 0, 0, 100)
      needsRedrawWheel = true
    }
    if (typeof hsl.l === 'number' && hsl.l !== this.l) {
      this.l = limit(hsl.l | 0, 0, 100)
      needsRedrawWheel = true
    }
    if (needsRedrawWheel) {
      this._redrawWheel()
    }
    if (typeof hsl.h === 'number' && hsl.h !== this.h) {
      this.h = positiveModulo(hsl.h | 0, 360)
      this._redrawHandle()
    }
  }

  private _redrawWheel() {
    const center = this.wheelDiameter / 2
    const radius = center - this.wheelThickness / 2
    const ctx = this.wheelElement.getContext('2d')!
    const TO_RAD = Math.PI / 180
    for (let i = 0; i < 360; i++) {
      ctx.beginPath()
      ctx.arc(center, center, radius, (i - 90.6) * TO_RAD, (i - 89.4) * TO_RAD)
      ctx.strokeStyle = `hsl(${i},${this.s}%,${this.l}%)`
      ctx.lineWidth = this.wheelThickness
      ctx.stroke()
    }
  }

  private _redrawHandle() {
    const center = this.wheelDiameter / 2
    const wheelRadius = center - this.wheelThickness / 2
    const angle = (this.h - 90) * Math.PI / 180
    this.handleElement.style.left = wheelRadius * Math.cos(angle) + center + 'px'
    this.handleElement.style.top = wheelRadius * Math.sin(angle) + center + 'px'
  }

  private static _createWheelElement(diameter: number, onSelectHue: (hue: number) => any) {
    const wheelElement = document.createElement('canvas')
    const wheelStyle = wheelElement.style
    wheelElement.width = wheelElement.height = diameter
    wheelStyle.borderRadius = '50%'
    // wheelStyle.cursor = 'crosshair'
    wheelStyle.touchAction = 'manipulation'
    wheelStyle.touchAction = 'none'
    wheelStyle.webkitTouchCallout = 'none'
    wheelStyle.webkitTapHighlightColor = 'transparent'
    const onMoveHandle = (event: { clientX: number, clientY: number }) => {
      const wheelRect = wheelElement.getBoundingClientRect()
      const center = diameter / 2
      const x = event.clientX - wheelRect.left - center
      const y = event.clientY - wheelRect.top - center
      const angle = Math.atan2(y, x)
      const hue = Math.round(angle * 180 / Math.PI + 90)
      onSelectHue(hue)
    }
    onDragStart(wheelElement, onMoveHandle)
    onDragMove(wheelElement, onMoveHandle)
    return wheelElement
  }

  private static _createHandleElement(handleDiameter: number) {
    const handleElement = document.createElement('div')
    const handleStyle = handleElement.style
    handleStyle.pointerEvents = 'none'
    handleStyle.position = 'absolute'
    handleStyle.borderRadius = '50%'
    handleStyle.border = '2px solid white'
    handleStyle.boxShadow = '0 0 0 1px inset black'
    handleStyle.boxSizing = 'border-box'
    handleStyle.width = handleElement.style.height = `${handleDiameter}px`
    handleStyle.marginLeft = handleStyle.marginTop = `${-handleDiameter / 2}px`
    return handleElement
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
