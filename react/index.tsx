import * as React from 'react'
import ReinventedColorWheel, { ReinventedColorWheelOptions } from '../es/reinvented-color-wheel'

const noop = () => {}

export default ({ wheelThickness, wheelDiameter, handleDiameter, wheelReflectsSaturation, onChange, hsv, hsl, rgb, hex }: Omit<ReinventedColorWheelOptions, 'appendTo'>) => {
  const elementRef = React.useRef<HTMLDivElement | null>(null)
  const wheelRef = React.useRef<ReinventedColorWheel | undefined>()
  const wheel = wheelRef.current

  React.useEffect(() => {
    if (wheel) {
      wheelDiameter && (wheel.wheelDiameter = wheelDiameter)
      wheelThickness && (wheel.wheelThickness = wheelThickness)
      handleDiameter && (wheel.handleDiameter = handleDiameter)
      wheelReflectsSaturation != null && (wheel.wheelReflectsSaturation = wheelReflectsSaturation)
      wheel.redraw()
    } else {
      wheelRef.current = new ReinventedColorWheel({
        wheelThickness, wheelDiameter, handleDiameter, wheelReflectsSaturation, onChange, hsv, hsl, rgb, hex,
        appendTo: elementRef.current!,
      })
    }
  }, [wheelDiameter, wheelThickness, handleDiameter, wheelReflectsSaturation])

  if (wheel) {
    wheel.onChange = onChange || noop
    if (hsv) {
      wheel.hsv = hsv
    } else if (hsl) {
      wheel.hsl = hsl
    } else if (rgb) {
      wheel.rgb = rgb
    } else if (hex) {
      wheel.hex = hex
    }
  }

  return <div ref={elementRef} />
}
