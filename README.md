# Reinvented Color Wheel

![image](https://luncheon.github.io/reinvented-color-wheel/image.png)

A vanilla-js touch-friendly HSV color picker inspired by [Farbtastic Color Picker](https://acko.net/blog/farbtastic-jquery-color-picker-plug-in/).

[Demo](https://luncheon.github.io/reinvented-color-wheel/)


## Characteristics

* HSV (hue, saturation, value) cylindrical color model (unlike Farbtastic that takes HSL)
  * c.f. [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV)
* Touch-friendly
* No need jQuery
* Lightweight (JS + CSS ~ 2.2KB minified + gzipped)


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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.4/css/reinvented-color-wheel.min.css">
<script src="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.4"></script>
<script>/* `window.ReinventedColorWheel` object is available */</script>
```

or for [modern browsers](https://caniuse.com/#feat=es6-module):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.4/css/reinvented-color-wheel.min.css">
<script type="module">
  import ReinventedColorWheel from "https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.4/es/reinvented-color-wheel.bundle.min.js";
</script>
```

### Download directly

<a target="_blank" download="reinvented-color-wheel.min.css" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.4/css/reinvented-color-wheel.min.css">reinvented-color-wheel.min.css</a>  
<a target="_blank" download="reinvented-color-wheel.min.js"  href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.1.4/iife/reinvented-color-wheel.min.js">reinvented-color-wheel.min.js</a>


## Usage

```javascript
// create a new color picker
var colorWheel = new ReinventedColorWheel({
  // appendTo is the only required property. specify the parent element of the color wheel.
  appendTo: document.getElementById("my-color-picker-container"),

  // followings are optional properties and their default values.
  hsv: [0, 100, 100], // initial hsv value
  hsl: [0, 100, 50],  // initial hsl value; if both hsl and hsv are specified, hsv is applied and hsl is ignored.
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  wheelReflectsSaturation: true,
  onChange: function (color) {
    // the received argument `color` is the ReinventedColorWheel instance itself.
    // console.log("hsl:", color.hsl[0], color.hsl[1], color.hsl[2]);
    // console.log("hsv:", color.hsv[0], color.hsv[1], color.hsv[2]);
  },
});

// set color in HSL color space
colorWheel.setHSL(120, 100, 50);

// set color in HSV color space
colorWheel.setHSV(240, 100, 100);

// get color in HSL color space
console.log("hsl:", colorWheel.hsl[0], colorWheel.hsl[1], colorWheel.hsl[2]);

// get color in HSV color space
console.log("hsv:", colorWheel.hsv[0], colorWheel.hsv[1], colorWheel.hsv[2]);
```

When you need another color format such as RGB or HEX, please check the color conversion module such as [pure-color](https://www.npmjs.com/package/pure-color).

```javascript
import hsl2rgb from "pure-color/convert/hsl2rgb";
import rgb2hex from "pure-color/convert/rgb2hex";

console.log("hex:", rgb2hex(hsl2rgb(colorWheel.hsl)));
```


## License

WTFPL
