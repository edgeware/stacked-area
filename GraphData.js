var LinearTransform = require('./LinearTransform');

function GraphData(series, pixelRange, options){
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

GraphData.prototype.pan = function(offset){
	this.x.l( this.x.l() + offset);
};

GraphData.prototype.getPanOffset=function(){
	return this.x.l();
};

GraphData.prototype.zoom = function(zoomFactor, xpxl){
	var xval = this.x.invert(xpxl);
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
		pixelSeriesArr.push({ color: series.color, points: pixelSeries });
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
		y: this.y.map(point.y) -(yOffset? (this.pixelRange.y-yOffset) :0)
	};
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

GraphData.prototype.getValueAtPoint = function(x, y){
	var seriesIndex = this.getSeriesIndexFromPoint(x, y);
	var value;
	if(seriesIndex!==null)
		return { value: this.getValueOfSeriesAtPoint(seriesIndex, x), series: this.series[seriesIndex].name };
	else
		return { value: this.getCombinedValueAtPoint(x), series: null };
};

GraphData.prototype.findClosestXPointIndex = function(x, points){
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

GraphData.prototype.isPointInside = function(x, y, points){
	var pointIndex = this.findClosestXPointIndex(x, points);
	var point = points[pointIndex];
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

GraphData.prototype.getSeriesIndexFromPoint = function(x, y){
	for(var i = 0; i<this.pixelSeriesArr.length; i++){
		if(this.isPointInside(x, y, this.pixelSeriesArr[i].points)){
			return i;
		}
	}
	return null;
};

GraphData.prototype.getValueOfSeriesAtPoint = function(i, x){
	var points = this.pixelSeriesArr[i].points;
	var index = this.findClosestXPointIndex(x, points);
	var point = this.series[i].points[index];
	return point.y;
};

GraphData.prototype.getCombinedValueAtPoint = function(x){
	var points =this.pixelSeriesArr[this.pixelSeriesArr.length-1].points;
	var index = this.findClosestXPointIndex(x, points);
	var point = points[index];
	return this.y.invert(point.y);
};

module.exports = GraphData;