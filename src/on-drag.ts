import { window } from './window'

export const onDrag: (
  element: HTMLElement,
  onDragStart: (event: { clientX: number, clientY: number }) => boolean | void,
  onDragMove: (event: { clientX: number, clientY: number }) => void,
) => void =

// for IE, Edge, Firefox, Chrome
'PointerEvent' in window ?
(element, onDragStart, onDragMove) => {
  element.addEventListener('pointerdown', function (event) {
    if (event.button === 0 && onDragStart(event) !== false) {
      this.setPointerCapture(event.pointerId)
    }
  })

  element.addEventListener('pointermove', function (event) {
    if (this.hasPointerCapture(event.pointerId)) {
      onDragMove(event)
    }
  })
}

// for Mobile Safari
: 'ontouchend' in window ?
(element, onDragStart, onDragMove) => {
  let dragging = false

  element.addEventListener('touchstart', event => {
    if (event.touches.length === 1 && onDragStart(event.touches[0]) !== false) {
      dragging = true
      event.preventDefault()
    }
  })

  element.addEventListener('touchmove', event => {
    if (dragging && event.touches.length === 1) {
      event.preventDefault()
      onDragMove(event.touches[0])
    }
  })
}

// for Safari
:
(element, onDragStart, onDragMove) => {
  const onMouseMove = function (event: MouseEvent) {
    onDragMove(event)
  }

  const onMouseUp = function () {
    removeEventListener('mouseup', onMouseUp)
    removeEventListener('mousemove', onMouseMove)
  }

  element.addEventListener('mousedown', function (event) {
    if (event.button === 0 && onDragStart(event) !== false) {
      addEventListener('mousemove', onMouseMove)
      addEventListener('mouseup', onMouseUp)
    }
  })
}
