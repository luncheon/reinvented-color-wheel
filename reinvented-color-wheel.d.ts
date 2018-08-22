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
    static defaultOptions: {
        h: number;
        s: number;
        l: number;
        wheelDiameter: number;
        wheelThickness: number;
        handleDiameter: number;
        onChange: typeof noop;
    };
    h: number;
    s: number;
    l: number;
    wheelDiameter: number;
    wheelThickness: number;
    handleDiameter: number;
    onChange: (hsl: HSL) => any;
    containerElement: HTMLElement;
    hueWheelElement: HTMLCanvasElement;
    hueHandleElement: HTMLElement;
    constructor(options: ReinventedColorWheelOptions);
    setHSL(hsl: Partial<HSL>): void;
    private _redrawHueWheel;
    private _redrawHueHandle;
    private _onMoveHueHandle;
}
declare function noop(): void;
export {};
