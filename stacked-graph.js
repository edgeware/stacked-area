/**
 * Dependencies
 */
var CanvasRenderer = require('./canvas-renderer');
var Emitter = require('./emitter');
var GraphData = require('./graph-data');
var StateMachine = require('./state-machine');
var MouseEventDispatcher = require('./mouse-event-dispatcher');

var mouseOffset = require('./mouse-offset');


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
        this.canvasRenderer = new CanvasRenderer(this.canvas, series, {
            width: this.width,
            height: this.height,
            ymax: options.inverted ? 0 : this.height,
            ymin: options.inverted ? this.height : 0,
            inverted: options.inverted,
            stroke: options.stroke || 'black',
            highlightRegionColor: options.highlightRegionColor || 'rgba(255, 0, 0, .3)'
        });

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
        
        
        var shouldDispatchEvent = (options.dispatchByCoordinates ?
                this.shouldDispatchEventByCoordinates
            :   this.shouldDispatchEventByTarget).bind(this);
        var eventSource = options.eventSource || {
            on: function(event, callback) {
                document.addEventListener(event, function(e){
                    if( shouldDispatchEvent(event, e)) {
                        callback(e);
                    }
                });
            }
        };

        this.mouseMachine = new MouseEventDispatcher(
            eventSource,
            this.panning(),
            this.highlightTracking(),
            this.zooming()
        );

        if (!options.noInteraction)
            this.mouseMachine = new MouseEventDispatcher(eventSource, this.panning(), this.highlightTracking(), this.zooming());
}

/**
 * Inherit from Emitter
 */
StackedGraph.prototype = Object.create(Emitter.prototype);
StackedGraph.prototype.constructor = StackedGraph;

StackedGraph.prototype.shouldDispatchEventByTarget = function(name, e){
    return e.target === this.canvas || name === 'mouseup' || name === 'mousemove';
};

StackedGraph.prototype.shouldDispatchEventByCoordinates = function(name, e){
    if (name === 'mouseup' || name === 'mousemove' || e.target === this.canvas) return true;
    var offset = mouseOffset(e, this.canvas);
    var insideElement = offset.x > 0 && offset.x < this.width && offset.y > 0 && offset.y < this.height;
    return insideElement;
};

/**
 * Set the data series and redraw the graph
 * @param {Array} data
 * @api public
 */
StackedGraph.prototype.setData = function(data, domain) {
    if(domain){
        this.options.xmin = domain[0];
        this.options.xmax = domain[1];
    }
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
StackedGraph.prototype.zooming = function () {
        var states = {
            started: {}
        };
        states.started[this.mousewheelevent] = function (e) {
            var offset = mouseOffset(e, this.graph.elem);
            var zoomFactor = this.graph.zoomFactorFromMouseEvent(e);
            if(typeof zoomFactor!='number' || zoomFactor!==zoomFactor){
                zoomFactor = 1;
            }
            this.graph.data.zoom(zoomFactor, offset.x);
            this.graph.triggerZoom();
            this.graph.draw();
            e.preventDefault();
        };
        return new StateMachine({
            graph: this,
            state: 'started',
            states: states
        }, 'zooming');
    };

/**
 * Enable panning by click and drag
 * @api private
 */
StackedGraph.prototype.panning = function(){
    return new StateMachine({
        /* State data */
        panned: 0,
        panStart: void(0),
        graph: this,
        /* <--------- */
        state: 'stopped',
        id: Math.random(),
        states: {
            stopped: {
                init: function(){
                    if(this.onselectstart){
                        document.onselectstart = this.onselectstart;
                    }
                },
                mousedown: function(down){
                    var offset = mouseOffset(down, this.graph.elem);
                    panStart = offset.x;
                    panned = 0;
                    this.transition('panning');
                }
            },
            panning: {
                init: function(){
                    this.onselectstart = document.onselectstart;
                    document.onselectstart = function(e){ e.cancel = true; e.preventDefault(); e.stopPropagation();};
                },
                mousemove: function(move){
                    var offset = mouseOffset(move, this.graph.elem);
                    var panOffset = offset.x - panStart;
                    this.graph.data.pan(panOffset - panned);
                    this.graph.triggerPan(this.graph.data.x.l());
                    panned += panOffset - panned;
                    return this.graph.draw();
                },
                mouseup: function(){
                    this.transition('stopped');
                }
            }
        }
    }, 'panning');
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
StackedGraph.prototype.highlightTracking = function(){
    var _this = this;
    this.on('mouseOverSeries', function(eventData){
        _this.highlightSeries(eventData.series);
    });
    this.on('noValueInRange', function () {
        _this.highlightSeries(null);
    });
    return new StateMachine({
        state: 'started',
        graph: this,
        states: {
            'started': {
                mousemove: function(e){
                    var point = mouseOffset(e, this.graph.elem);
                    var x = point.x;
                    var y = point.y;
                    if ( !this.isWithinGraph(point) ) {
                        //Mouse is outside the graph
                        return _this.highlightSeries(null);
                    }
                    var xIndex = this.graph.data.findClosestXPointIndex(x);
                    if(!xIndex){
                        //There  is not point to highlight.
                        return;
                    }
                    var pixel = this.graph.data.pixelSeriesArr[0].points[xIndex];
                    if ( !this.isWithinGraph(pixel) ) {
                        //The closest point is outside the graph
                        return this.graph.trigger('noValueInRange');
                    }
                    var series = this.graph.data.getSeriesIndexFromPoint(x, y, xIndex);
                    var movementData = {
                            x: this.graph.data.series[0].points[xIndex].x,
                            xpxl: pixel.x,
                            i: xIndex
                        };
                    var seriesName = series !== null ? this.graph.data.series[series].name : null;
                    this.graph.trigger('mouseOverSeries', {
                        series: seriesName
                    });
                    this.graph.trigger('markerMove', movementData);
                }
            }
        },
        isWithinGraph: function(point) {
            var x = point.x;
            var y = point.y;
            return x>=0 && x <= this.graph.width && y>=0 && y<= this.graph.height;
        }
    }, 'highlight');
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
    var offset = mouseOffset(e, this.elem);
    var x = offset.x;
    var y = offset.y;

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

/**
 * Clear the graph
 * @api public
 */
StackedGraph.prototype.clear = function() {
    this.canvasRenderer.clear();
};