export const window = (typeof globalThis !== 'undefined' ? globalThis : self) as typeof globalThis & { MSCSSMatrix: DOMMatrix }
