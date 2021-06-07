import ReinventedColorWheel from '../es/reinvented-color-wheel'
import ReinventedColorWheelCss from '../css/reinvented-color-wheel.min.css'

const observedAttributes = Object.freeze(['hsv', 'hsl', 'rgb', 'hex', 'wheel-diameter', 'wheel-thickness', 'handle-diameter', 'wheel-reflects-saturation'])

export class ReinventedColorWheelElement extends HTMLElement {
  static get observedAttributes() {
    return observedAttributes
  }

  colorWheel: ReinventedColorWheel
  #settingColorAttributes = 0
  #setColorAttributes = () => {
    this.#settingColorAttributes = 1
    try {
      const { colorWheel } = this
      this.setAttribute('hsv', colorWheel.hsv as string & readonly [number, number, number])
      this.setAttribute('hsl', colorWheel.hsl as string & readonly [number, number, number])
      this.setAttribute('rgb', colorWheel.rgb as string & readonly [number, number, number])
      this.setAttribute('hex', colorWheel.hex)
    } finally {
      this.#settingColorAttributes = 0
    }
  }

  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })
    shadowRoot.appendChild(document.createElement('style')).textContent = ReinventedColorWheelCss
    this.colorWheel = new ReinventedColorWheel({
      appendTo: shadowRoot,
      onChange: colorWheel => {
        this.#setColorAttributes()
        this.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: colorWheel }))
      },
    })
  }

  connectedCallback() {
    if (String(this.colorWheel.hex) !== this.getAttribute('hex')) {
      this.#setColorAttributes()
    }
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    const colorWheel = this.colorWheel
    switch (name) {
      case 'hex':
        if (!this.#settingColorAttributes) {
          colorWheel.hex = newValue
        }
        return
      case 'hsv':
      case 'hsl':
      case 'rgb':
        if (!this.#settingColorAttributes) {
          const newColor = newValue.split(',').map(n => +n)
          if (newColor[0] >= 0 && newColor[1] >= 0 && newColor[2] >= 0) {
            colorWheel[name] = newColor as [number, number, number]
          }
        }
        return
      case 'wheel-diameter':
        colorWheel.wheelDiameter = +newValue
        colorWheel.redraw()
        return
      case 'wheel-thickness':
        colorWheel.wheelThickness = +newValue
        colorWheel.redraw()
        return
      case 'handle-diameter':
        colorWheel.handleDiameter = +newValue
        colorWheel.redraw()
        return
      case 'wheel-reflects-saturation':
        colorWheel.wheelReflectsSaturation = newValue !== 'false'
        colorWheel.redraw()
        return
    }
  }
}

customElements.define('reinvented-color-wheel', ReinventedColorWheelElement)
