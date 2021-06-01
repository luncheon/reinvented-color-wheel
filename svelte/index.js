import "../css/reinvented-color-wheel.min.css";
import ReinventedColorWheel from '../es/reinvented-color-wheel';


const colorWheel = (node, {
    hex, hsv, hsl, rgb, 
    wheelDiameter = 200,
    wheelThickness = 20,
    handleDiameter = 16,
    wheelReflectsSaturation = true, 
    onChange}={}) => {
    let customChange = onChange;
    const hasInitial = Boolean(hex || hsv || hsl || rgb);

    const colorWheel = new ReinventedColorWheel({
        // appendTo is the only required property. specify the parent element of the color wheel.
        appendTo: node,

        // followings are optional properties and their default values.

        // initial color (can be specified in hsv / hsl / rgb / hex)
        hsv,//: [0, 100, 100],
        hsl,//: [0, 100, 50],
        rgb,//: [255, 0, 0],
        hex: hasInitial ? hex : "#aa0000",

        // appearance
        wheelDiameter,
        wheelThickness,
        handleDiameter,
        wheelReflectsSaturation,

        // handler
        onChange: (color) => {
            // the only argument is the ReinventedColorWheel instance itself.
            // console.log("hsv:", color.hsv[0], color.hsv[1], color.hsv[2]);
            node.dispatchEvent(new CustomEvent('change', {detail:color}));
            customChange?.(color)
        },
    });

    return {
        update:(props={})=>{
            const {hsv,hsl,rgb,hex,wheelDiameter,wheelThickness,handleDiameter,wheelReflectsSaturation,onChange} = props;
            if (hsv){
                colorWheel.hsv = hsv;
            }
            if (hsl){
                colorWheel.hsl = hsl;
            }
            if (rgb){
                colorWheel.rgb = rgb;
            }
            if (hex){
                colorWheel.hex = hex;
            }
            wheelDiameter && (colorWheel.wheelDiameter = wheelDiameter);
            wheelThickness && (colorWheel.wheelThickness = wheelThickness);
            handleDiameter && (colorWheel.handleDiameter = handleDiameter);
            customChange = onChange;
            wheelReflectsSaturation != null && (colorWheel.wheelReflectsSaturation = wheelReflectsSaturation);
        }
    }
}

export default colorWheel;