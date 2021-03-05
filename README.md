# Reinvented Color Wheel

[![npm](https://img.shields.io/npm/dm/reinvented-color-wheel.svg?style=popout-square&label=npm&colorB=orange)](https://www.npmjs.com/package/reinvented-color-wheel)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/reinvented-color-wheel/badge)](https://www.jsdelivr.com/package/npm/reinvented-color-wheel)
[<img alt="WTFPL" src="https://luncheon.github.io/wtfpl-badge.png" height="20">](http://www.wtfpl.net)

![image](https://luncheon.github.io/reinvented-color-wheel/image.png)

A vanilla-js touch-friendly HSV color picker inspired by [Farbtastic Color Picker](https://acko.net/blog/farbtastic-jquery-color-picker-plug-in/).

[Demo](https://luncheon.github.io/reinvented-color-wheel/)


## Characteristics

* HSV (hue, saturation, value) cylindrical color model (unlike Farbtastic that takes HSL)
  * c.f. [HSL and HSV - Wikipedia](https://en.wikipedia.org/wiki/HSL_and_HSV)
* Touch-friendly
* No need jQuery
* Lightweight (JS + CSS ~ 3.1 KB minified + gzipped)


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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.3.1/css/reinvented-color-wheel.min.css">
<script src="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.3.1"></script>
<script>/* `window.ReinventedColorWheel` object is available */</script>
```

or for [modern browsers](https://caniuse.com/#feat=es6-module):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.3.1/css/reinvented-color-wheel.min.css">
<script type="module">
  import ReinventedColorWheel from "https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.3.1/es/reinvented-color-wheel.bundle.min.js";
</script>
```

### Download directly

<a target="_blank" download="reinvented-color-wheel.min.css" href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.3.1/css/reinvented-color-wheel.min.css">reinvented-color-wheel.min.css</a>  
<a target="_blank" download="reinvented-color-wheel.min.js"  href="https://cdn.jsdelivr.net/npm/reinvented-color-wheel@0.3.1/iife/reinvented-color-wheel.min.js">reinvented-color-wheel.min.js</a>


## Usage

```javascript
// create a new color picker
var colorWheel = new ReinventedColorWheel({
  // appendTo is the only required property. specify the parent element of the color wheel.
  appendTo: document.getElementById("my-color-picker-container"),

  // followings are optional properties and their default values.

  // initial color (can be specified in hsv / hsl / rgb / hex)
  hsv: [0, 100, 100],
  // hsl: [0, 100, 50],
  // rgb: [255, 0, 0],
  // hex: "#ff0000",

  // appearance
  wheelDiameter: 200,
  wheelThickness: 20,
  handleDiameter: 16,
  wheelReflectsSaturation: true,

  // handler
  onChange: function (color) {
    // the only argument is the ReinventedColorWheel instance itself.
    // console.log("hsv:", color.hsv[0], color.hsv[1], color.hsv[2]);
  },
});

// set color in HSV / HSL / RGB / HEX
colorWheel.hsv = [240, 100, 100];
colorWheel.hsl = [120, 100, 50];
colorWheel.rgb = [255, 128, 64];
colorWheel.hex = '#888888';

// get color in HSV / HSL / RGB / HEX
console.log("hsv:", colorWheel.hsv[0], colorWheel.hsv[1], colorWheel.hsv[2]);
console.log("hsl:", colorWheel.hsl[0], colorWheel.hsl[1], colorWheel.hsl[2]);
console.log("rgb:", colorWheel.rgb[0], colorWheel.rgb[1], colorWheel.rgb[2]);
console.log("hex:", colorWheel.hex);

// please call redraw() after changing some appearance properties.
colorWheel.wheelDiameter = 400;
colorWheel.wheelThickness = 40;
colorWheel.redraw();
```


## React Component

This package contains the React component wrapping the color wheel.  
The options above except for `appendTo` can be specified, and each option is optional.

```tsx
import React from 'react'
import ReinventedColorWheel from 'reinvented-color-wheel/react'
import 'reinvented-color-wheel/css/reinvented-color-wheel.min.css'

const App = () => {
  const [hex, setHex] = React.useState('#000000')
  return (
    <>
      <ReinventedColorWheel
        // hsv={[0, 100, 100]}
        // hsl={[0, 100, 50]}
        // rgb={[255, 0, 0]}
        // hex="#ff0000"
        hex={hex}
        wheelDiameter={200}
        wheelThickness={20}
        handleDiameter={16}
        wheelReflectsSaturation
        onChange={({ hex }) => setHex(hex)}
      />
      <input value={hex} onChange={e => setHex(e.target.value)} />
    </>
  )
}
```


## License

[WTFPL](http://www.wtfpl.net)

## Sister Package

[lch-color-wheel](https://github.com/luncheon/lch-color-wheel): **L\*C\*h** color wheel
