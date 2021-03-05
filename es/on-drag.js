import { window } from './window';
export var onDrag = 
// for IE, Edge, Firefox, Chrome
'PointerEvent' in window ?
    function (element, onDragStart, onDragMove) {
        element.addEventListener('pointerdown', function (event) {
            if (event.button === 0 && onDragStart(event) !== false) {
                this.setPointerCapture(event.pointerId);
            }
        });
        element.addEventListener('pointermove', function (event) {
            if (this.hasPointerCapture(event.pointerId)) {
                onDragMove(event);
            }
        });
    }
    // for Mobile Safari
    : 'ontouchend' in window ?
        function (element, onDragStart, onDragMove) {
            var dragging = false;
            element.addEventListener('touchstart', function (event) {
                if (event.touches.length === 1 && onDragStart(event.touches[0]) !== false) {
                    dragging = true;
                    event.preventDefault();
                }
            });
            element.addEventListener('touchmove', function (event) {
                if (dragging && event.touches.length === 1) {
                    event.preventDefault();
                    onDragMove(event.touches[0]);
                }
            });
        }
        // for Safari
        :
            function (element, onDragStart, onDragMove) {
                var onMouseMove = function (event) {
                    onDragMove(event);
                };
                var onMouseUp = function () {
                    removeEventListener('mouseup', onMouseUp);
                    removeEventListener('mousemove', onMouseMove);
                };
                element.addEventListener('mousedown', function (event) {
                    if (event.button === 0 && onDragStart(event) !== false) {
                        addEventListener('mousemove', onMouseMove);
                        addEventListener('mouseup', onMouseUp);
                    }
                });
            };
