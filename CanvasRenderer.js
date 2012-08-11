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
	this.clear();

	for(var i=0;i<seriesArr.length;i++){
		var series = seriesArr[i];
		this.drawSeries(series.points, series.color);
	}
};

CanvasRenderer.prototype.drawSeries = function(points, color){
	var point;
	if(!points.length) return;

	this.ctx.fillStyle = color;
	this.ctx.beginPath();
	this.ctx.moveTo(points[0].x, this.height);

	for(var i = 0; i<points.length; i++){
		point = points[i];
		if(i+1<points.length && points[i+1].x<0){
			continue;
		}
		if(i-1>=0 && points[i-1].x>this.width){
			continue;
		}
		this.ctx.lineTo(point.x, point.y);
	}

	this.ctx.lineTo(point.x, this.height);

	this.ctx.closePath();
	this.ctx.fill();
};

module.exports = CanvasRenderer;