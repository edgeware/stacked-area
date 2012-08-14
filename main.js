var CanvasGraph = require('./SimpleGraph');
var metricAdapter = require('./metricAdapter');
var metrics = require('./test/metrics');



var netin = metricAdapter(metrics, 'net_in');
var elem = document.getElementById('graph1');
var graph1 = new CanvasGraph(elem, netin, { width: 600, height: 350 });

graph1.draw();

var netout = metricAdapter(metrics, 'net_in');
var netoutEl = document.getElementById('graph2');
var graph2 = new CanvasGraph(netoutEl, netout, { width: 600, height: 350 });

graph1.on('pan', function(amount){
	graph2.panTo(amount);
	graph3.panTo(amount);
	graph4.panTo(amount);
});

graph1.on('zoom', function(amount, around){
	console.log('graph1 zoom', amount, around);
	graph2.zoom(amount, around);
	graph3.zoom(amount, around);
	graph4.zoom(amount, around);
	graph5.zoom(amount, around);
	graph6.zoom(amount, around);
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