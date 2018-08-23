export interface HSL {
    readonly h: number;
    readonly s: number;
    readonly l: number;
}
export interface ReinventedColorWheelOptions extends Partial<HSL> {
    readonly parentElement: HTMLElement;
    readonly wheelDiameter?: number;
    readonly wheelThickness?: number;
    readonly handleDiameter?: number;
    readonly onChange?: (hsl: HSL) => any;
}
export default class ReinventedColorWheel {
    private options;
    static defaultOptions: {
        h: number;
        s: number;
        l: number;
        wheelDiameter: number;
        wheelThickness: number;
        handleDiameter: number;
        onChange: () => void;
    };
    h: number;
    s: number;
    l: number;
    wheelDiameter: number;
    wheelThickness: number;
    handleDiameter: number;
    onChange: (hsl: HSL) => any;
    containerElement: HTMLDivElement;
    hueWheelElement: HTMLCanvasElement;
    hueHandleElement: HTMLDivElement;
    hueInnerCircleElement: HTMLDivElement;
    svSpaceElement: HTMLCanvasElement;
    svHandleElement: HTMLDivElement;
    constructor(options: ReinventedColorWheelOptions);
    setHSL(hsl: Partial<HSL>): void;
    private _redrawHueWheel;
    private _redrawSvSpace;
    private _redrawHueHandle;
    private _redrawSvHandle;
    private _onMoveHueHandle;
    private _onMoveSvHandle;
}
