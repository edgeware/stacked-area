var GraphData = require('../GraphData');
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
	var closest = data.findClosestXPointIndex(1, points);
	t.equal(closest, 1);
	var closest2 = data.findClosestXPointIndex(0, points);
	t.equal(closest2, 0);
	
	var points2=[{x:0}, {x:2}, {x:4}];
	var closest3 = data.findClosestXPointIndex(1, points2);
	t.ok(closest3 === 0 || closest3 === 1);
	var closest4 = data.findClosestXPointIndex(3, points2);
	t.ok(closest4 === 1 || closest4 === 2);
	var closest5 = data.findClosestXPointIndex(3.5, points2);
	t.equal(closest5, 2);
	t.end();
});

test('isPointInside', function(t){
	var points = [{x:10, y:20}, {x:20, y:30}];
	t.equal(data.isPointInside(10, 30, points), true);
	t.equal(data.isPointInside(10, 20, points), true);
	t.equal(data.isPointInside(20, 30, points), true);
	t.equal(data.isPointInside(20, 40, points), true);
	t.equal(data.isPointInside(20, 10, points), false);
	t.equal(data.isPointInside(10, 5, points), false);
	t.end();
});

test('getSeriesIndexFromPoint', function(t){
	t.equal(data.getSeriesIndexFromPoint(0, 100), 0);
	t.equal(data.getSeriesIndexFromPoint(0, 50), 1);
	t.end();
});

test('getValueOfSeriesAtPoint', function(t){
	t.equal(data.getValueOfSeriesAtPoint(0, 0), 1);
	t.equal(data.getValueOfSeriesAtPoint(0, 40), 1);
	t.equal(data.getValueOfSeriesAtPoint(0, 100), 2);
	t.end();
});

test('getCombinedValueAtPoint', function(t){
	t.equal(data.getCombinedValueAtPoint(0), 3);
	t.end();
});
