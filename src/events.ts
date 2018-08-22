export let onDragStart: (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any
export let onDragMove:  (element: HTMLElement, callback: (event: { clientX: number, clientY: number }) => any) => any

let dragging: HTMLElement | undefined
if ('PointerEvent' in window) {
  onDragStart = (element, callback) => element.addEventListener('pointerdown',  event => (dragging = element, callback(event)))
  onDragMove  = (element, callback) =>         addEventListener('pointermove',  event => dragging === element && callback(event))
  addEventListener('pointerup', () => dragging = undefined)
} else if ('ontouchend' in window) {
  onDragStart = (element, callback) => element.addEventListener('touchstart',   event => (event.preventDefault(), callback(event.targetTouches[0])))
  onDragMove  = (element, callback) => element.addEventListener('touchmove',    event => (event.preventDefault(), callback(event.targetTouches[0])))
} else {
  onDragStart = (element, callback) => element.addEventListener('mousedown',    event => (dragging = element, callback(event)))
  onDragMove  = (element, callback) =>         addEventListener('mousemove',    event => dragging === element && callback(event))
  addEventListener('mouseup', () => dragging = undefined)
}
