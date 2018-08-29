export interface ReinventedColorWheelOptions {
    readonly appendTo: HTMLElement;
    readonly hsv?: number[];
    readonly hsl?: number[];
    readonly wheelDiameter?: number;
    readonly wheelThickness?: number;
    readonly handleDiameter?: number;
    readonly wheelReflectsSaturation?: boolean;
    readonly onChange?: (color: {
        hsl: number[];
        hsv: number[];
    }) => any;
}
export default class ReinventedColorWheel {
    private options;
    static default: typeof ReinventedColorWheel;
    static defaultOptions: {
        hsv: number[];
        hsl: number[];
        wheelDiameter: number;
        wheelThickness: number;
        handleDiameter: number;
        wheelReflectsSaturation: boolean;
        onChange: (color: {
            hsl: number[];
            hsv: number[];
        }) => any;
    };
    static hsv2hsl: (hsv: ArrayLike<number>) => number[];
    static hsl2hsv: (hsl: ArrayLike<number>) => number[];
    hsv: number[];
    hsl: number[];
    wheelDiameter: number;
    wheelThickness: number;
    handleDiameter: number;
    onChange: (color: {
        hsl: number[];
        hsv: number[];
    }) => any;
    wheelReflectsSaturation: boolean;
    rootElement: HTMLDivElement;
    hueWheelElement: HTMLCanvasElement;
    hueHandleElement: HTMLDivElement;
    svSpaceElement: HTMLCanvasElement;
    svHandleElement: HTMLDivElement;
    private _redrawHueWheelRequested;
    private _redrawSvSpaceRequested;
    constructor(options: ReinventedColorWheelOptions);
    setHSV(h?: number, s?: number, v?: number): void;
    setHSL(h?: number, s?: number, l?: number): void;
    redraw(): void;
    private _redrawHueWheel;
    private _redrawSvSpace;
    private _redrawHueHandle;
    private _redrawSvHandle;
    private _onMoveHueHandle;
    private _onMoveSvHandle;
    private _option;
}
