var LinearTransform = require('./LinearTransform');
var CanvasRenderer = require('./CanvasRenderer');
var Emitter = require('./Emitter');
var GraphData = require('./GraphData');
/*
 * series = [{ name: 'disk_usage', points: [{x: 1343123112, y:13000 }]}]
 * */
var StackedGraph = function(elem, series, options) {
	Emitter.call(this);
	this.elem = elem;
	this.width = options.width || elem.clientWidth;
	this.height = options.height || elem.clientHeight;
	
	this.data = new GraphData(series, { x: this.width, y: this.height }, options);
	this.canvas = this.createCanvas(elem, this.width, this.height);
	this.offsetLeft = this.canvas.offsetLeft;
	this.offsetTop = this.canvas.offsetTop;
	this.canvasRenderer = new CanvasRenderer(
		this.canvas,
		series,
		{ width: this.width, height: this.height}
	);

	this.panOffset = 0;

	if(typeof elem.onmousewheel !=='object'){
		this.configureForGecko();
	}

	this.initZoom();
	this.initPan();
	this.initHighlightTracking();
};

StackedGraph.prototype = Object.create(Emitter.prototype);

StackedGraph.prototype.createCanvas = function(parent, width, height){
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	parent.appendChild(canvas);
	return canvas;
};

StackedGraph.prototype.configureForGecko = function(){
	this.mousewheelevent = 'DOMMouseScroll';
	this.zoomFactorFromMouseDelta = function(delta){ return delta/90 + 1; };
};

StackedGraph.prototype.mousewheelevent = 'mousewheel';

StackedGraph.prototype.initZoom = function(){
	this.elem.addEventListener(this.mousewheelevent, function(e){
		var zoomFactor = this.zoomFactorFromMouseDelta(e.wheelDelta);
		this.data.zoom(zoomFactor, e.x-this.offsetLeft);
        this.draw();
        e.preventDefault();
	}.bind(this));
};

StackedGraph.prototype.initPan = function() {
	var _this = this,
		elem = this.elem,
		data = this.data,
		panStart;
	var panMove = function(move) {
		var panOffset = move.x - panStart;
		data.pan(panOffset - panned);
		panned += (panOffset - panned);
		return _this.draw();
	};
	var panUp = function(move) {
		elem.removeEventListener('mousemove', panMove);
		return elem.removeEventListener('mouseup', panUp);
	};
	var panDown = function(down) {
		panStart = down.x;
		panned = 0;
		elem.addEventListener('mousemove', panMove);
		return elem.addEventListener('mouseup', panUp);
	};

	return this.elem.addEventListener('mousedown', panDown);
};

StackedGraph.prototype.initHighlightTracking = function(){
	this.canvas.addEventListener('mousemove', this.highlightMouseMove.bind(this));
	var _this = this;
	this.on('value', function(value){
		console.log('Hoovering over series '+ value.series + ' which has value:' + value.value);
	});
};
StackedGraph.prototype.highlightMouseMove = function(e){
	var x = e.x - this.offsetLeft;
	var y = e.y - this.offsetTop;

	var pointValue = this.data.getValueAtPoint(x, y);

	this.trigger('value', pointValue);
};
StackedGraph.prototype.stopHighlightTracking = function(){

};

StackedGraph.prototype.zoomFactorFromMouseDelta = function(delta){ return delta / 180 + 1; };

StackedGraph.prototype.draw = function(){
	this.canvasRenderer.draw( this.data.getPixelSeries() );
};

module.exports = StackedGraph;