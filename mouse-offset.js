var elementOffset = require('./elementOffset');
var getOffset = function(event, elem) {
    var offset = elementOffset(elem);
    return {
        x: event.pageX - offset.x,
        y: event.pageY - offset.y
    };
};

module.exports = getOffset;