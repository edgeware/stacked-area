var LinearTransform = require('./LinearTransform');
var Emitter = require('./Emitter');

function GraphData(series, pixelRange, options){
	Emitter.call(this);
	this.options = options;
	this.series = series;
	this.xmin = options.xmin || this.getMinX(series);
	this.xmax = options.xmax || this.getMaxX(series);
	this.ymin = 0;
	this.ymax = options.ymax || this.getMaxY(series);
	this.pixelRange = pixelRange;
	this.x = LinearTransform.fromTwoPoints({ x: this.xmin, y: 0}, { x: this.xmax, y: pixelRange.x });
	var minZoomFactor = options.minZoomFactor || 1/10;
	var maxZoomFactor = options.minZoomFactor || series[0].points.length;
	this.y = new LinearTransform( -pixelRange.y/this.ymax, pixelRange.y);

	this.minZoom = minZoomFactor * this.x.k();
	this.maxZoom = maxZoomFactor * this.x.k();
}

GraphData.prototype = Object.create(Emitter.prototype);
GraphData.prototype.constructor = GraphData;

GraphData.prototype.getXDomain = function(){
	var domain = [this.x.invert(0), this.x.invert(this.pixelRange.x)];
	if(domain[1]<domain[0]){
		throw 'invalid domain';
	}
	return domain;
};

GraphData.prototype.setXDomain = function(xmin, xmax){
	this.xmin = xmin;
	this.xmax = xmax;

	this.x.fromTwoPoints({ x: xmin, y:0 }, { x:xmax, y: this.pixelRange.x });
};

GraphData.prototype.getXRange = function(){
	return [0, this.pixelRange.x];
};

GraphData.prototype.getYDomain = function(){
	return [this.ymin, this.ymax];
};

GraphData.prototype.setYDomain = function(ymin, ymax){
	this.ymax = ymax;
	this.ymin = ymin;
	var ypxl = this.pixelRange.y;
	this.y = new LinearTransform( -ypxl/this.ymax, ypxl);
};

GraphData.prototype.pan = function(offset){
	this.x.l( this.x.l() + offset);
};

GraphData.prototype.getPanOffset=function(){
	return this.x.l();
};

GraphData.prototype.zoom = function(zoomFactor, xpxl){
	var xval = this.x.invert(xpxl);
    this.zoomX(zoomFactor, xval);
};

GraphData.prototype.zoomX  = function(zoomFactor, xval){
	var slope = Math.min( Math.max(zoomFactor * this.x.k(), this.minZoom), this.maxZoom);
    this.x.setSlopeAtPoint(slope, xval);
};

GraphData.prototype.getPixelSeries = function(){
	var pixelSeriesArr = [], pixelSeries = [];
	for(var c=0;c<this.series[0].points.length;c++){
		pixelSeries[c] = {y: this.pixelRange.y };
	}
	for(var i = 0; i<this.series.length; i++){
		var series = this.series[i];
		pixelSeries = this.toPixels(series.points, pixelSeries);
		pixelSeriesArr.push({
			color: series.name === this.highlightedSeries ? series.highlightColor: series.color,
			points: pixelSeries });
	}
	this.pixelSeriesArr = pixelSeriesArr;
	return pixelSeriesArr;
};

GraphData.prototype.toPixels = function(points, offsets){
	var pixelPoints = [], prevX=0;
	for(var i = 0; i<points.length; i++){
		var point = points[i];
		var offset = offsets[i];
		var pixelPoint = this.toPixelPoint(point, offset ? +offset.y : 0);
		pixelPoints.push(pixelPoint);
		prevX = pixelPoint.x;
	}
	return pixelPoints;
};

GraphData.prototype.toPixelPoint = function(point, yOffset){
	return {
		x: this.x.map(point.x),
		y: this.y.map(point.y) - (yOffset? (this.pixelRange.y - yOffset) :0)
	};
};

GraphData.prototype.highlightSeries = function(name){
	var newHighlight = this.highlightedSeries !== name;
	this.highlightedSeries = name;
	return newHighlight;
};

GraphData.prototype.getValue = function(x){
	var seriesIndex = null;
	if(this.highlightedSeries){
		for(var i=0;i<this.series.length;i++){
			var series = this.series[i];
			if(series.name === this.highlightedSeries){
				seriesIndex = i;
			}
		}
	}

	var xIndex = this.findClosestXPointIndex(x, this.series[0].points);

	if(seriesIndex!==null)
		return this.getValueOfSeriesAtPoint(seriesIndex, xIndex);
	else
		return this.getCombinedValueAtPoint(xIndex);
	return ;
};

GraphData.prototype.getMaxX = function(series /*plural*/){
	var points = series[0].points;
	return points[points.length-1].x;
};

GraphData.prototype.getMinX = function(series /*plural*/){
	return series[0].points[0].x;
};

GraphData.prototype.getMaxY = function(series /*plural*/){
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

GraphData.prototype.getValueAtPoint = function(xIndex, y){
	var seriesIndex = this.getSeriesIndexFromPoint(xIndex, y);
	if(seriesIndex!==null)
		return { value: this.getValueOfSeriesAtPoint(seriesIndex, xIndex), series: this.series[seriesIndex].name };
	else
		return { value: this.getCombinedValueAtPoint(xIndex), series: null };
};

GraphData.prototype.findClosestXPointIndex = function(x, points){
	if(!points)
		points = this.pixelSeriesArr[0].points;
	var low = 0, high = points.length-1, next, last;
	while( low !== high ){
		next = Math.floor((high+low)/2);
		if( next === last ) {
			if( x-points[next].x<points[next+1].x-x){
				return next;
			}else{
				return next+1;
			}
		}
		point = points[next];
		if( point.x < x ){
			low = next;
		} else if( point.x > x ){
			high = next;
		} else if( point.x === x ){
			return next;
		}
		if( high === low ){
			return next;
		}
		last = next;
	}
	throw('Did not find point closest by x');
};

GraphData.prototype.isPointInside = function(xIndex, y, points){
	var point = points[xIndex];
	var x = point.x;
	var other, line, yprime;
	if(point.x === x){
		return point.y<=y;
	}
	if(point.x<x){
		if(pointIndex === points.length-1) return point.y<=y;
		other = points[pointIndex+1];
	}
	if(point.x>x){
		if(pointIndex === 0) return point.y<=y;
		other = points[pointIndex-1];
	}
	line = LinearTransform.fromTwoPoints(point, other);
	return line.map(x) <= y;
};

GraphData.prototype.getSeriesIndexFromPoint = function(xIndex, y){
	for(var i = 0; i<this.pixelSeriesArr.length; i++){
		if(this.isPointInside(xIndex, y, this.pixelSeriesArr[i].points)){
			return i;
		}
	}
	return null;
};

GraphData.prototype.getValueOfSeriesAtPoint = function(seriesIndex, xIndex){
	return this.series[seriesIndex].points[xIndex].y;
};

GraphData.prototype.getCombinedValueAtPoint = function(xIndex){
	if(!this.pixelSeriesArr){
		this.pixelSeriesArr = this.getPixelSeries(); }
	var points =this.pixelSeriesArr[this.pixelSeriesArr.length-1].points;
	var point = points[xIndex];
	return this.y.invert(point.y);
};

module.exports = GraphData;