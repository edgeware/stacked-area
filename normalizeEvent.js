var getOffset = function(event, elem) {
        var totalOffsetX = 0;
        var totalOffsetY = 0;
        var canvasX = 0;
        var canvasY = 0;
        var currentElement = elem;
        do {
            totalOffsetX += currentElement.offsetLeft;
            totalOffsetY += currentElement.offsetTop;
        } while (currentElement = currentElement.offsetParent)

        canvasX = event.pageX - totalOffsetX;
        canvasY = event.pageY - totalOffsetY;
        return {
            x: canvasX,
            y: canvasY
        };
    };

function normalizeEvent(e, elem) {
    if (e instanceof MouseEvent || e instanceof WheelEvent || e instanceof MouseScrollEvent) {
        if (!e.offsetX) {
            var offset = getOffset(e, elem);
            e.offsetX = offset.x;
            e.offsetY = offset.y;
        }
    }
    return e;
}

module.exports = normalizeEvent;