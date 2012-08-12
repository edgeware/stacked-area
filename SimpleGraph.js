var LinearTransform = require('./LinearTransform');
var CanvasRenderer = require('./CanvasRenderer');
var Emitter = require('./Emitter');
/*
 * series = [{ name: 'disk_usage', points: [{x: 1343123112, y:13000 }]}]
 * */
var StackedGraph = function(elem, series, options) {
	Emitter.call(this);
	this.elem = elem;
	this.width = options.width || elem.clientWidth;
	this.height = options.height || elem.clientHeight;
	this.xmin = options.xmin || this.getMinX(series);
	this.xmax = options.xmax || this.getMaxX(series);
	this.ymin = 0;
	this.ymax = options.ymax || this.getMaxY(series);
	this.x = LinearTransform.fromTwoPoints({ x: this.xmin, y: 0}, { x: this.xmax, y: this.width });
	var minZoomFactor = options.minZoomFactor || 1/10;
	var maxZoomFactor = options.minZoomFactor || series[0].points.length;
	this.minZoom = minZoomFactor * this.x.k();
	this.maxZoom = maxZoomFactor * this.x.k();
	this.y = new LinearTransform( -this.height/this.ymax, this.height);
	this.series = series;
	this.activeSeries = null;
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
        var slope = Math.min( Math.max(zoomFactor * this.x.k(), this.minZoom), this.maxZoom);
        this.x.setSlopeAtPoint(slope, xval);
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

StackedGraph.prototype.initHighlightTracking = function(){
	this.canvas.addEventListener('mousemove', this.highlightMouseMove.bind(this));
	var _this = this;
	this.on('value', function(value){
		console.log('Current hoovering over series '+ _this.activeSeriesIndex.toString() + ' which has value:' + value);
	});
};
StackedGraph.prototype.highlightMouseMove = function(e){
	var x = e.x - this.offsetLeft;
	var y = e.y - this.offsetTop;

	var seriesIndex = this.getSeriesIndexFromPoint(x, y);
	console.log('series index', seriesIndex);
	this.activeSeriesIndex = seriesIndex;
	var value = this.getValueOfSeriesAtPoint(seriesIndex, x);

	this.trigger('value', value);
};
StackedGraph.prototype.stopHighlightTracking = function(){

};

StackedGraph.prototype.getValueOfSeriesAtPoint = function(i, x){
	var xval = this.x.invert(x);
	var series = this.series[i || 0];
	var points = series.points;
	var low = 0;
	var high = points.length-1;
	var val;
	var c = 0;
	console.log('v', x, xval);
	while(typeof val === 'undefined'){
		c++;
		var next = Math.floor((high + low)/2);
		var point = points[next];
		if(!point)console.log('no point at index',next);
		
		console.log(point, this.x.map(point.x));

		if(point.x<xval){
			low = next;
		}
		if(point.x>xval){
			high = next;
		}
		if((high - low)<=2){
			return point.y;
		}else{
			if(low!=next && high!=next){
				console.log('error');
			}
		}
		if(c>15) {
			return console.log('infinite loop');
		}
	}
};

StackedGraph.prototype.getSeriesIndexFromPoint = function(x, y){
	for(var i = this.pixelSeriesArr.length-1; i>=0; i--){
		var series = this.pixelSeriesArr[i];
		for(var j = 0; j<series.points.length; j++){
			var point = series.points[j];
			if(point.x>x){
				if(j>1) point = series.points[j-1];
				if(point.y<y){
					return i;
				}
				break;
			}
		}
	}
	console.log('point not in series');
	return null;
};

StackedGraph.prototype.zoomFactorFromMouseDelta = function(delta){ return delta / 180 + 1; };

StackedGraph.prototype.toPixels = function(points, offsets){
	var pixelPoints = [], prevX=0;
	for(var i = 0; i<points.length; i++){
		var point = points[i];
		var offset = offsets[i];
		var x = this.x.map(point.x);
		
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
	this.pixelSeriesArr = pixelSeriesArr;
	this.canvasRenderer.draw( pixelSeriesArr );
};

module.exports = StackedGraph;