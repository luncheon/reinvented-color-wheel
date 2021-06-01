import { ReinventedColorWheelOptions } from '../es/reinvented-color-wheel';
declare const _default: (node : Node, { wheelThickness, wheelDiameter, handleDiameter, wheelReflectsSaturation, onChange, hsv, hsl, rgb, hex }: 
    Omit<ReinventedColorWheelOptions, 'appendTo'>) => 
    {
        update: (props: Omit<ReinventedColorWheelOptions, 'appendTo'>) => void
    };
export default _default;