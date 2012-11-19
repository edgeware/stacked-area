var elementOffset = function(elem) {
  var x, y;
  x = 0;
  y = 0;
  while (true) {
    x += elem.offsetLeft;
    y += elem.offsetTop;
    if (!(elem = elem.offsetParent)) {
      break;
    }
  }
  return {
    x: x,
    y: y
  };
};

var getOffset = function(event, elem) {
    var offset = elementOffset(elem);
    return {
        x: event.pageX - offset.x,
        y: event.pageY - offset.y
    };
};

module.exports = getOffset;