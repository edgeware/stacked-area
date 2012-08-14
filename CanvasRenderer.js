var CanvasRenderer = function(canvas, series, options){
	this.canvas = canvas;
	this.width = options.width;
	this.height = options.height;
	this.ctx = canvas.getContext('2d');
};

CanvasRenderer.prototype.clear = function(){
	this.canvas.width = this.canvas.width;
};

CanvasRenderer.prototype.draw = function(seriesArr){
	//# timer start drawing_series
	//var drawingStart = performance.webkitNow();
	this.clear();

	for(var i=seriesArr.length;i;i--){
		var series = seriesArr[i-1];
		this.drawSeries(series.points, series.color);
	}
	//# timer end drawing_series
	//var time = performance.webkitNow() - drawingStart;
	//console.log('drawing time', time);
};
CanvasRenderer.prototype.drawSeries = function(points, color){
	var point;
	if(!points.length) return;

	this.ctx.fillStyle = color;
	this.ctx.beginPath();

	this.ctx.moveTo(points[0].x, points[0].y);

	for(var i = 1; i<points.length; i++){
		point = points[i];
		
		if(i+1<points.length && points[i+1].x<0){
			continue;
		}
		if(i-1>=0 && points[i-1].x>this.width){
			continue;
		}
		this.ctx.lineTo(point.x, point.y);
	}
	this.ctx.stroke();
	this.ctx.lineTo(point.x, this.height);
	this.ctx.lineTo(points[0].x, this.height);
	this.ctx.lineTo(points[0].x, points[0].y);

	this.ctx.fill();
};

module.exports = CanvasRenderer;