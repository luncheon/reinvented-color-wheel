# Reinvented Color Wheel

A vanilla-js HSV color picker inspired by [Farbtastic Color Picker](https://acko.net/blog/farbtastic-jquery-color-picker-plug-in/).

[Demo](https://luncheon.github.io/reinvented-color-wheel/)


## Characteristics

* HSV (hue, saturation, value) cylindrical color model (unlike Farbtastic that takes HSL)
  * c.f. [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV)
* Touch-friendly
* No need jQuery
* Lightweight (JS + CSS ~ 6KB minified)

<!-- 
## Installation

### via npm (with a module bundler)

```bash
$ npm install reinvented-color-wheel
```

```javascript
import "reinvented-color-wheel.min.css";
import ReinventedColorWheelOptions from "reinvented-color-wheel";
```

### via CDN

```html
<link rel="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.0.1/reinvented-color-wheel.min.css">
<script src="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.0.1"></script>
<script>/* `window.ReinventedColorWheelOptions` object is available */</script>
```

### Download directly

<a target="_blank" download="reinvented-color-wheel.min.css" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.0.1/reinvented-color-wheel.min.css">reinvented-color-wheel.min.css</a>  
<a target="_blank" download="reinvented-color-wheel.min.js"  href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.0.1/reinvented-color-wheel.min.js">reinvented-color-wheel.min.js</a>
-->

## Download

<a target="_blank" download="reinvented-color-wheel.min.css" href="https://luncheon.github.io/reinvented-color-wheel/reinvented-color-wheel.min.css">reinvented-color-wheel.min.css</a>  
<a target="_blank" download="reinvented-color-wheel.iife.min.js" href="https://luncheon.github.io/reinvented-color-wheel/reinvented-color-wheel.iife.min.js">reinvented-color-wheel.iife.min.js</a>


## Usage

```javascript
// create a new color picker
var colorWheel = new ReinventedColorWheel({
  // appendTo is the only required property.
  appendTo: document.getElementById('my-color-picker-container'),

  // following properties are optional.
  hsv: [0, 100, 100], // initial hsv value
  hsl: [0, 100, 50],  // initial hsl value; if both hsl and hsv are specified, hsv is applied and hsl is ignored.
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  onChange: function (color) {
    console.log('hsl:', color.hsl[0], color.hsl[1], color.hsl[2]);
    console.log('hsv:', color.hsv[0], color.hsv[1], color.hsv[2]);
  },
});

// set color in HSL color space
colorWheel.setHSL(120, 100, 50);

// set color in HSV color space
colorWheel.setHSV(240, 100, 100);

// get color in HSL color space
console.log('hsl:', colorWheel.hsl[0], colorWheel.hsl[1], colorWheel.hsl[2]);

// get color in HSV color space
console.log('hsv:', colorWheel.hsv[0], colorWheel.hsv[1], colorWheel.hsv[2]);
```


## License

WTFPL
