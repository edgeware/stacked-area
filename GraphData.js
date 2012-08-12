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
	console.log('series index', seriesIndex);
	var value = this.getValueOfSeriesAtPoint(seriesIndex, x);
};


GraphData.prototype.getSeriesIndexFromPoint = function(x, y){
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

GraphData.prototype.getValueOfSeriesAtPoint = function(i, x){
	var xval = this.x.invert(x);
	var series = this.series[i || 0];
	var points = series.points;
	var low = 0;
	var high = points.length-1;
	var val;
	var c = 0;
	while(typeof val === 'undefined'){
		c++;
		var next = Math.floor((high + low)/2);
		var point = points[next];
		if(!point)console.log('no point at index',next);
		
		//console.log(point, this.x.map(point.x));

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

module.exports = GraphData;