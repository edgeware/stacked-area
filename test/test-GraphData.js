var GraphData = require('../GraphData');
var test = require('tap').test;

var series = [{
	name: 'series1',
	color: 'red',
	points: [
		{x:0, y:1},
		{x:1, y:2}
	]
}, {
	name: 'series2',
	color: 'black',
	points: [
		{x:0, y:2},
		{x:1, y:2}
	]
}];
/*
combined: [x:0, y:3] [x:1, y:4]
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

test('can zoom x axis', function(t){
	data.zoom(2, 0);
	t.equal(data.x.map(data.xmax), 200);
	data.zoom(0.5, 0);
	t.equal(data.x.map(data.xmax), 100);
	t.end();
});

test('can pan', function(t){
	data.pan(50);
	t.equal(data.x.map(0), 50);
	data.pan(-50);
	t.equal(data.x.map(0), 0);
	t.end();
});