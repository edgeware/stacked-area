var test = require('tap').test;

var metrics = require('../testData/metrics');
var metricAdapter = require('../../metricAdapter');
/*
test('can construct series from timestamps and values', function(t){
	var timestamp1 = new Date();
	var timestamp2 = new Date();
	timestamp2.setHours(timestamp2.getHours() + 1);
	
	var timestamps = [timestamp1, timestamp2];
	var values = [2, 3];
	var name = 'test-series';

	var series = metricAdapter.constructSeries(name, timestamps, values);

	t.ok(series.name === name);
	t.ok(Array.isArray(series.points));

	var expectedPoints = [{
		x: timestamp1,
		y: values[0]
	},{
		x: timestamp2,
		y: values[1]
	}];

	t.deepEqual( series.points, expectedPoints );

	t.end();
});
*/

test("can extract submetric series from basemetric", function(t){
	var basemetric = 'net_in';
	var series = metricAdapter(metrics, basemetric);
	t.ok(Array.isArray(series));
	for(var i=0;i<series.length;i++){
		var s = series[i];
		t.ok(s.name.indexOf(basemetric)===0);
		t.ok(Array.isArray(s.points));
	}
	t.end();
});
