var CanvasGraph = require('./stacked-graph');
var metricAdapter = require('./metric-adapter');
var metrics = require('./test/metrics');


var search = document.location.search || '';

var examples = {
	'simple': simpleExample,
	'undef': undefinedExample,
	'extreme': extremeExample,
	'fraction': fractionExample
}

Object.keys(examples)
	.some(function (example) {
		return search.indexOf(example)!==-1 && examples[example]()|1
	}) || realData()

function extremeExample(){
	var series = [{
	name: 'series1',
	color: 'green',
	highlightColor: 'red',
	points: [
			{x:0, y:0},
			{x:1, y:0},
			{x:2, y:50},
			{x:3, y:50},
			{x:4, y:100},
			{x:5, y:100}
		]
	}];

	var elem = document.getElementById('graph1');
	var graph1 = new CanvasGraph(elem, series, { width: 200, height: 100, inverted: false });
}

function fractionExample(){
	var series = [{
	name: 'series1',
	color: 'green',
	highlightColor: 'red',
	points: [
			{x:0, y:0},
			{x:1, y:0},
			{x:2, y:50},
			{x:3, y:50},
			{x:4, y:99},
			{x:5, y:99},
			{x:6, y:99.4},
			{x:7, y:99.4},
			{x:8, y:99.5},
			{x:9, y:99.5},
			{x:10, y:99.8},
			{x:11, y:99.8},
			{x:12, y:100},
			{x:13, y:100}
		]
	}];

	var elem = document.getElementById('graph1');
	var graph1 = new CanvasGraph(elem, series, { width: 200, height: 100, inverted: false });
}

function undefinedExample(){
	var series = [{
	name: 'series1',
	color: 'green',
	highlightColor: 'red',
	points: [
			{x:0, y:1},
			{x:1, y:2},
			{x:2, y:void(0)},
			{x:3, y:void(0)},
			{x:4, y:void(0)},
			{x:5, y:void(0)}

		]
	}];

	var elem = document.getElementById('graph1');
	var graph1 = new CanvasGraph(elem, series, { width: 600, height: 350, inverted: false });
}


function simpleExample(){
	var series = [{
	name: 'series1',
	color: 'green',
	highlightColor: 'red',
	points: [
			{x:0, y:1}, // -> {x:0, y:75}
			{x:1, y:2}  // -> {x:100, y:50}
		]
	}, {
		name: 'series2',
		color: 'yellow',
		highlightColor: 'red',
		points: [
			{x:0, y:2},	// -> {x:0, y:3} -> {x:0, y:25}
			{x:1, y:2}  // -> {x:1, y:4} -> {x:100, y:0}
		]
	}];

	var elem = document.getElementById('graph1');
	var graph1 = new CanvasGraph(elem, series, { width: 600, height: 350, inverted: false });
	graph1.draw();
	
	var elem2 = document.getElementById('graph2');
	var graph2 = new CanvasGraph(elem2, series, { width: 600, height: 350, inverted: true });
	graph2.draw();
	
}


function realData(){
	var elem = document.getElementById('graph1');
	var netin = metricAdapter(metrics, 'net_in');
	var graph1 = new CanvasGraph(elem, netin, { width: 600, height: 350, inverted: true, dispatchByCoordinates: false });
	graph1.draw();
	var netout = metricAdapter(metrics, 'net_in');
	var netoutEl = document.getElementById('graph2');
	var graph2 = new CanvasGraph(netoutEl, netout, { width: 600, height: 350, dispatchByCoordinates: false });

	/*
	graph1.on('pan', function(amount){
		graph2.panTo(amount);
		graph3.panTo(amount);
		graph4.panTo(amount);
	});
	*/

	graph1.on('zoom', function(){
		var domain = graph1.data.getXDomain();
		graph2.zoomTo(domain);
		graph3.zoomTo(domain);
		graph4.zoomTo(domain);
		graph5.zoomTo(domain);
		graph6.zoomTo(domain);
	});

	graph1.on('markerMove', function(m){
		
	});

	graph2.draw();

	window.graph2 = graph2;

	var cpu = metricAdapter(metrics, 'net_in');
	var cpuEl = document.getElementById('graph3');
	var graph3 = new CanvasGraph(cpuEl, cpu, { width: 600, height: 350 });

	graph3.draw();

	var mem = metricAdapter(metrics, 'net_in');
	var memEl = document.getElementById('graph4');
	var graph4 = new CanvasGraph(memEl, mem, { width: 600, height: 350 });

	graph4.draw();

	var g = metricAdapter(metrics, 'net_in');
	var gEl = document.getElementById('graph5');
	var graph5 = new CanvasGraph(gEl, g, { width: 600, height: 350 });

	graph5.draw();

	var g1 = metricAdapter(metrics, 'net_in');
	var g1El = document.getElementById('graph6');
	var graph6 = new CanvasGraph(g1El, g1, { width: 600, height: 350 });

	graph6.draw();
}
