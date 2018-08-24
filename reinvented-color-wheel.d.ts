export interface ReinventedColorWheelOptions {
    readonly appendTo: HTMLElement;
    readonly hsv?: number[];
    readonly hsl?: number[];
    readonly wheelDiameter?: number;
    readonly wheelThickness?: number;
    readonly handleDiameter?: number;
    readonly onChange?: (color: {
        hsl: number[];
        hsv: number[];
    }) => any;
}
export default class ReinventedColorWheel {
    private options;
    static defaultOptions: {
        hsv: number[];
        hsl: number[];
        wheelDiameter: number;
        wheelThickness: number;
        handleDiameter: number;
        onChange: () => void;
    };
    static hsv2hsl(hsv: number[]): number[];
    static hsl2hsv(hsl: number[]): number[];
    hsv: number[];
    hsl: number[];
    wheelDiameter: number;
    wheelThickness: number;
    handleDiameter: number;
    onChange: (color: {
        hsl: number[];
        hsv: number[];
    }) => any;
    containerElement: HTMLDivElement;
    hueWheelElement: HTMLCanvasElement;
    hueHandleElement: HTMLDivElement;
    hueInnerCircleElement: HTMLDivElement;
    svSpaceElement: HTMLCanvasElement;
    svHandleElement: HTMLDivElement;
    private _redrawHueWheelRequested;
    private _redrawSvSpaceRequested;
    constructor(options: ReinventedColorWheelOptions);
    setHSV(h?: number, s?: number, v?: number): void;
    setHSL(h?: number, s?: number, l?: number): void;
    private _redrawHueWheel;
    private _redrawSvSpace;
    private _redrawHueHandle;
    private _redrawSvHandle;
    private _onMoveHueHandle;
    private _onMoveSvHandle;
}
