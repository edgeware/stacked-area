/**
 * Dependencies
 */
var CanvasRenderer = require('./CanvasRenderer');
var Emitter = require('./Emitter');
var GraphData = require('./GraphData');

var normalizeEvent = require('./normalizeEvent');

/**
 Export StackedGraph constructor
 */
module.exports = StackedGraph;

/**
 * Instantiate a StackedGraph
 * Options:
 *   - `inverted`    Invert the y-value
 * @param {DOMElement} elem
 * @param {Array} series
 * @param {Object} options
 * @api public
 */
function StackedGraph(elem, series, options) {
    Emitter.call(this);
    this.options = options;
    this.elem = elem;
    this.width = options.width || elem.clientWidth;
    this.height = options.height || elem.clientHeight;

    this.canvas = this.createCanvas(elem, this.width, this.height);
    this.offsetLeft = this.canvas.offsetLeft;
    this.offsetTop = this.canvas.offsetTop;
    this.canvasRenderer = new CanvasRenderer(
        this.canvas, series, {
            width: this.width,
            height: this.height,
            ymax: options.inverted ? 0 : this.height,
            ymin: options.inverted ? this.height : 0,
            inverted: options.inverted,
            stroke: options.stroke || 'black',
            highlightRegionColor: options.highlightRegionColor || 'rgba(255, 0, 0, .3)'
        }
    );

    this.panOffset = 0;

    if (typeof elem.onmousewheel !== 'object') {
        this.configureForGecko();
    }

    if (series && Array.isArray(series) && series.length > 0) {
        this.data = new GraphData(series, {
            x: this.width,
            y: this.height
        }, options);
        this.draw();
    } else {
        console.error('initialize StackedGraph without data');
    }

    this.initZoom();
    this.initPan();
    this.initHighlightTracking();

}

/**
 * Inherit from Emitter
 */
StackedGraph.prototype = Object.create(Emitter.prototype);
StackedGraph.prototype.constructor = StackedGraph;

/**
 * Set the data series and redraw the graph
 * @param {Array} data
 * @api public
 */
StackedGraph.prototype.setData = function(data) {
    this.data = new GraphData(data, {
        x: this.width,
        y: this.height
    }, this.options);
    this.draw();
};
/**
 * Get the value of the currently highlighted region at position {x}
 * @param {Number} x
 * @api public
 */
StackedGraph.prototype.getValue = function(x) {
    return this.data.getValue(x);
};
/**
 * Get the value of the currently highlighted region at position {x}
 * @param {Number} x
 * @api private
 */
StackedGraph.prototype.createCanvas = function(parent, width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    parent.appendChild(canvas);
    return canvas;
};

/**
 * Configure the graph to use Gecko events for scroll zoom
 * @api private
 */
StackedGraph.prototype.configureForGecko = function() {

    this.mousewheelevent = 'DOMMouseScroll';
    this.zoomFactorFromMouseEvent = function(e) {
        return -e.detail / 15 + 1;
    };
};

/**
 * The default name of the mouse wheel event (used by webkit and ie)
 */
StackedGraph.prototype.mousewheelevent = 'mousewheel';

/**
 * Hook up zooming with mouse wheel
 * @api private
 */
StackedGraph.prototype.initZoom = function() {
    this.elem.addEventListener(this.mousewheelevent, function(e) {
        normalizeEvent(e, this.elem);
        var zoomFactor = this.zoomFactorFromMouseEvent(e);
        this.data.zoom(zoomFactor, e.offsetX);
        this.triggerZoom();
        this.draw();
        e.preventDefault();
    }.bind(this));
};

/**
 * Enable panning by click and drag
 * @api private
 */
StackedGraph.prototype.initPan = function() {
    var _this = this,
        elem = this.elem,
        panStart;
    var panMove = function(move) {
            normalizeEvent(move, _this.elem);
            var panOffset = move.offsetX - panStart;
            _this.data.pan(panOffset - panned);
            _this.triggerPan(_this.data.x.l());
            panned += (panOffset - panned);
            return _this.draw();
        };
    var panUp = function(move) {
            elem.removeEventListener('mousemove', panMove);
            elem.removeEventListener('mouseout', panUp);
            return elem.removeEventListener('mouseup', panUp);
        };
    var panDown = function(down) {
            panStart = down.offsetX;
            panned = 0;
            elem.addEventListener('mousemove', panMove);
            elem.addEventListener('mouseout', panUp);
            return elem.addEventListener('mouseup', panUp);
        };

    return this.elem.addEventListener('mousedown', panDown);
};

/**
 * Emit pan event
 * @api private
 */
StackedGraph.prototype.triggerPan = function(amount) {
    this.trigger('pan', amount);
};

/**
 * Pan to x value
 * @api public
 */
StackedGraph.prototype.panTo = function(offset) {
    this.data.x.l(offset);
    this.draw();
};

/**
 * Zoom to x range
 * @api public
 */
StackedGraph.prototype.zoomTo = function(domain) {
    this.data.setXDomain(domain[0], domain[1]);
    this.draw();
};

/**
 * Emit zoom event
 * @api private
 */
StackedGraph.prototype.triggerZoom = function() {
    this.trigger('zoom', this.data.getXDomain());
};

/**
 * Enable tracking of which series the user is hoovering over
 * @api private
 */
StackedGraph.prototype.initHighlightTracking = function() {
    this.canvas.addEventListener('mousemove', this.highlightMouseMove.bind(this));
    var _this = this;
    this.canvas.addEventListener('mouseout', function() {
        _this.highlightSeries(null);
    });
    this.on('mouseOverSeries', function(eventData) {
        _this.highlightSeries(eventData.series);
    });
    this.on('noValueInRange', function(){
        _this.highlightSeries(null);
    });
};

/**
 * Highlight a series, or remove highlight if series param is null
 * @api private
 */
StackedGraph.prototype.highlightSeries = function(series){
    if( series !== this.highlightedSeries) {
        this.data.highlightSeries(series);
        this.highlightedSeries = series;
        this.draw();
    }
};

/**
 * Get which series is currently highlighted
 * @api public
 */
StackedGraph.prototype.getHighlightedSeries = function() {
    return this.highlightedSeries;
};

/**
 * Callback for mouse move events to track which series to highlight
 * @api private
 */
StackedGraph.prototype.highlightMouseMove = function(e) {
    normalizeEvent(e, this.elem);
    var x = e.offsetX;
    var y = e.offsetY;

    var xIndex = this.data.findClosestXPointIndex(x);
    var pixel = this.data.pixelSeriesArr[0].points[xIndex];
    if ( pixel.x < 0 || pixel.x > this.width ) {
        return this.trigger('noValueInRange');
    }

    var series = this.data.getSeriesIndexFromPoint(x, y, xIndex);

    var movementData = {
        x: this.data.series[0].points[xIndex].x,
        xpxl: pixel.x,
        i: xIndex
    };
    
    var seriesName = series !== null ? this.data.series[series].name : null;
    this.trigger('mouseOverSeries', {
        series: seriesName
    });
    this.trigger('markerMove', movementData);
    
};

/**
 * Highlight a contiguous subset of the domain of the graph
 * @api public
 * @param {Number} start
 * @param {Number} stop
 */
StackedGraph.prototype.highlightRegion = function(start, stop) {
    this.data.highlightRegion(start, stop);
    this.draw();
};

/**
 * Get the zoomfactor from a mouse wheel event
 * @api private
 * @param {Object} e
 */
StackedGraph.prototype.zoomFactorFromMouseEvent = function(e) {
    return e.wheelDelta / 180 + 1;
};

/**
 * Draw or redraw the graph
 * @api public
 */
StackedGraph.prototype.draw = function() {
    this.canvasRenderer.draw(this.data.getPixelSeries(), this.data.getHighlightRegion());
};