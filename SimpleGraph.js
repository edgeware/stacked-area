var LinearTransform = require('./LinearTransform');
var CanvasRenderer = require('./CanvasRenderer');

/*
 * series = [{ name: 'disk_usage', points: [{x: 1343123112, y:13000 }]}]
 * */
var StackedGraph = function(elem, series, options) {
	this.elem = elem;
	this.width = options.width || elem.clientWidth;
	this.height = options.height || elem.clientHeight;
	this.xmin = options.xmin || this.getMinX(series);
	this.xmax = options.xmax || this.getMaxX(series);
	this.ymin = 0;
	this.ymax = options.ymax || this.getMaxY(series);
	this.x = LinearTransform.fromTwoPoints({ x: this.xmin, y: 0}, { x: this.xmax, y: this.width });
	this.y = new LinearTransform( -this.height/this.ymax, +this.height);
	this.series = series;
	this.activeSeries = null;
	this.canvas = this.createCanvas(elem, this.width, this.height);
	this.offsetLeft = this.canvas.offsetLeft;
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
};

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

StackedGraph.prototype.getMaxX = function(series /*plural*/){
	var points = series[0].points;
	return points[points.length-1].x;
};

StackedGraph.prototype.getMinX = function(series /*plural*/){
	return series[0].points[0].x;
};

StackedGraph.prototype.getMaxY = function(series /*plural*/){
	var max = -Infinity;
	for(var i=0; i<series[0].points.length; i++){
		var sumY = 0;
		for(var j=0; j<series.length; j++){
			var s = series[j];
			sumY += s.points[i].y;
		}
		if(sumY>max){
			max = sumY;
		}
	}
	return max;
};

StackedGraph.prototype.mousewheelevent = 'mousewheel';

StackedGraph.prototype.initZoom = function(){
	this.elem.addEventListener(this.mousewheelevent, function(e){
		var zoomFactor = this.zoomFactorFromMouseDelta(e.wheelDelta);
        var xval = this.x.invert(e.x-this.offsetLeft);
        this.x.multiplySlopeAtPoint(zoomFactor, xval);
        this.draw();
        e.preventDefault();
	}.bind(this));
};

StackedGraph.prototype.initPan = function() {
	var _this = this,
		elem = this.elem,
		x = this.x,
		panStart,
		offsetStart;
	var panMove = function(move) {
		var panOffset = move.x - panStart;
		x.l(offsetStart + panOffset);
		return _this.draw();
	};
	var panUp = function(move) {
		panStart = 0;
		offsetStart = 0;
		elem.removeEventListener('mousemove', panMove);
		return elem.removeEventListener('mouseup', panUp);
	};
	var panDown = function(down) {
		panStart = down.x;
		offsetStart = x.l();
		elem.addEventListener('mousemove', panMove);
		return elem.addEventListener('mouseup', panUp);
	};

	return this.elem.addEventListener('mousedown', panDown);
};

StackedGraph.prototype.zoomFactorFromMouseDelta = function(delta){ return delta / 180 + 1; };
/*
if(i+1<points.length && points[i+1].x<0){
			continue;
		}
		if(i-1>=0 && points[i-1].x>this.width){
			continue;
		}
*/

StackedGraph.prototype.toPixels = function(points, offsets){
	var pixelPoints = [], prevX=0;
	for(var i = 0; i<points.length; i++){
		//if(prevX>this.width) continue;
		
		var point = points[i];
		var offset = offsets[i];
		var x = this.x.map(point.x);
		
		//if(x<0 && i>0 && this.x.map(points[i-1].x<0)) continue;
		pixelPoints.push({
			x: this.x.map(point.x),
			y: this.y.map(point.y + (offset? offset.y:0))
		});
		prevX = x;
	}
	return pixelPoints;
};

StackedGraph.prototype.draw = function(){
	var pixelSeriesArr = [], pixelSeries = [];
	for(var i = 0; i<this.series.length; i++){
		var series = this.series[i];
		pixelSeries = this.toPixels(series.points, pixelSeries);
		pixelSeriesArr.push({ color: series.color, points: pixelSeries });
	}

	this.canvasRenderer.draw( pixelSeriesArr );
};

module.exports = StackedGraph;