var GraphData = require('../../graph-data');

var test = require('tap').test;

var series = [{
	name: 'series1',
	color: 'red',
	points: [
		{x:0, y:1}, // -> {x:0, y:75}
		{x:1, y:2}  // -> {x:100, y:50}
	]
}, {
	name: 'series2',
	color: 'black',
	points: [
		{x:0, y:2},	// -> {x:0, y:3} -> {x:0, y:25}
		{x:1, y:2}  // -> {x:1, y:4} -> {x:100, y:0}
	]
}];
/*
stacked: [x:0, y:3] [x:1, y:4]
*/

var data = new GraphData(series, {x: 100, y: 100}, {});
var inverted = new GraphData(series, {x: 100, y: 100}, {inverted: true});

test('calculates extreme x values', function(t){
	t.equal(data.xmin, 0);
	t.equal(data.xmax, 1);
	t.end();
});

test('ymin is alwas zero', function(t){
	t.equal(data.ymin, 0);
	t.end();
});

test('calculates extreme combined y max', function(t){
	t.equal(data.ymax, 4, 'max y value');
	t.end();
});

test('calculates pixel mappings', function(t){
	var pixelSeries = data.getPixelSeries();
	t.ok(Array.isArray(pixelSeries));
	var point11 = pixelSeries[0].points[0];
	var point21 = pixelSeries[1].points[0];
	t.deepEqual(point11, { x: 0, y: 75 });
	t.deepEqual(point21, { x: 0, y: 25 }); //100 - (1+2)/4 * 100
	t.end();
});

test('calculates inverted pixel mappings', function(t){
	var pixelSeries = inverted.getPixelSeries();
	t.ok(Array.isArray(pixelSeries));
	t.deepEqual(pixelSeries[0].points[0], { x: 0, y: 25 });
	t.deepEqual(pixelSeries[1].points[0], { x: 0, y: 75 }); //(1+2)/4 * 100
	t.end();
});

test('zoom', function(t){
	data.zoom(2, 0);
	t.equal(data.x.map(data.xmax), 200);
	data.zoom(0.5, 0);
	t.equal(data.x.map(data.xmax), 100);
	t.end();
});

test('pan', function(t){
	data.pan(50);
	t.equal(data.x.map(0), 50, 'pan forward');
	data.pan(-50);
	t.equal(data.x.map(0), 0, 'pan backward');
	t.end();
});

test('findClosestXPointIndex', function(t){
	var points = data.series[0].points;
	t.equal(data.findClosestXPointIndex(0, points), 0, 'index of x value 0');

	t.equal(data.findClosestXPointIndex(1, points), 1, 'index of x value 1');
	t.equal(data.findClosestXPointIndex(1, data.getPixelSeries()[0].points), 0, 'index of x value 1 in pixels');
	
	var points2=[{x:0}, {x:2}, {x:4}];
	t.ok([0, 1].indexOf(data.findClosestXPointIndex(1, points2))!=-1, 'value in between points');
	t.equal(data.findClosestXPointIndex(3.5, points2), 2, 'fractional value');
	t.end();
});

test('isPointInside', function(t){
	var points = [{x:10, y:20}, {x:20, y:30}];
	t.equal(data.isPointInside(data.x.map(0), 30, points, 0), true);
	t.equal(data.isPointInside(data.x.map(0), 20, points, 0), true);
	t.equal(data.isPointInside(data.x.map(1), 30, points, 1), true);
	t.equal(data.isPointInside(data.x.map(1), 40, points, 1), true);
	t.equal(data.isPointInside(data.x.map(1), 10, points, 1), false);
	t.equal(data.isPointInside(data.x.map(0), 5, points, 0), false);
	t.end();
});

test('getSeriesIndexFromPoint', function(t){
	t.equal(data.getSeriesIndexFromPoint(data.x.map(0), 100, data.findClosestXPointIndex(0)), 0);
	t.equal(data.getSeriesIndexFromPoint(data.x.map(0), 50, data.findClosestXPointIndex(0)), 1);
	t.end();
});

test('getValueOfSeriesAtPoint', function(t){
	t.equal(data.getValueOfSeriesAtPoint(0, 0), 1, 'getValueOfSeriesAtPoint 0, 0');
	t.equal(data.getValueOfSeriesAtPoint(0, 0), 1);
	t.equal(data.getValueOfSeriesAtPoint(0, data.findClosestXPointIndex(100)), 2);
	t.end();
});

test('getCombinedValueAtPoint', function(t){
	t.equal(data.getCombinedValueAtPoint(0), 3);
	t.end();
});
