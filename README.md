# Reinvented Color Wheel

![image](https://luncheon.github.io/reinvented-color-wheel/image.png)

A vanilla-js touch-friendly HSV color picker inspired by [Farbtastic Color Picker](https://acko.net/blog/farbtastic-jquery-color-picker-plug-in/).

[Demo](https://luncheon.github.io/reinvented-color-wheel/)


## Characteristics

* HSV (hue, saturation, value) cylindrical color model (unlike Farbtastic that takes HSL)
  * c.f. [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV)
* Touch-friendly
* No need jQuery
* Lightweight (JS + CSS ~ 2.8KB minified + gzipped)


## Installation

### via [npm](https://www.npmjs.com/package/reinvented-color-wheel) (with a module bundler)

```bash
$ npm install reinvented-color-wheel
```

```javascript
import "reinvented-color-wheel/css/reinvented-color-wheel.min.css";
import ReinventedColorWheel from "reinvented-color-wheel";
```

### via CDN ([jsDelivr](https://www.jsdelivr.com/package/npm/reinvented-color-wheel))

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.6/css/reinvented-color-wheel.min.css">
<script src="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.6"></script>
<script>/* `window.ReinventedColorWheel` object is available */</script>
```

or for [modern browsers](https://caniuse.com/#feat=es6-module):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.6/css/reinvented-color-wheel.min.css">
<script type="module">
  import ReinventedColorWheel from "https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.6/es/reinvented-color-wheel.bundle.min.js";
</script>
```

### Download directly

<a target="_blank" download="reinvented-color-wheel.min.css" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.6/css/reinvented-color-wheel.min.css">reinvented-color-wheel.min.css</a>  
<a target="_blank" download="reinvented-color-wheel.min.js"  href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.6/iife/reinvented-color-wheel.min.js">reinvented-color-wheel.min.js</a>


## Usage

```javascript
// create a new color picker
var colorWheel = new ReinventedColorWheel({
  // appendTo is the only required property. specify the parent element of the color wheel.
  appendTo: document.getElementById("my-color-picker-container"),

  // followings are optional properties and their default values.
  hsv: [0, 100, 100], // initial HSV value
  hsl: [0, 100, 50],  // initial HSL value
  rgb: [255, 0, 0],   // initial RGB value
  hex: "#ff0000",     // initial HEX value
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  wheelReflectsSaturation: true,
  onChange: function (color) {
    // the argument is the ReinventedColorWheel instance itself.
    // console.log("hsl:", color.hsl[0], color.hsl[1], color.hsl[2]);
    // console.log("hsv:", color.hsv[0], color.hsv[1], color.hsv[2]);
  },
});

// set color in HSV / HSL / RGB / HEX
colorWheel.setRGB(255, 255, 255);
colorWheel.setHSL(120, 100, 50);
colorWheel.setHSV(240, 100, 100);
colorWheel.setHEX('#888888');

// get color in HSV / HSL / RGB / HEX
console.log("hsv:", colorWheel.hsv[0], colorWheel.hsv[1], colorWheel.hsv[2]);
console.log("hsl:", colorWheel.hsl[0], colorWheel.hsl[1], colorWheel.hsl[2]);
console.log("rgb:", colorWheel.rgb[0], colorWheel.rgb[1], colorWheel.rgb[2]);
console.log("hex:", colorWheel.hex);
```


## License

WTFPL
