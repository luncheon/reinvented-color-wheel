declare module 'pure-color/convert/hsl2hsv' {
  const hsl2hsv: (hsl: ArrayLike<number>) => [number, number, number]
  export = hsl2hsv
}

declare module 'pure-color/convert/hsv2hsl' {
  const hsv2hsl: (hsv: ArrayLike<number>) => [number, number, number]
  export = hsv2hsl
}

declare module 'pure-color/convert/rgb2hex' {
  const rgb2hex: (rgb: ArrayLike<number>) => string
  export = rgb2hex
}

declare module 'pure-color/parse/hex' {
  const hex2rgb: (hex: string) => [number, number, number]
  export = hex2rgb
}
