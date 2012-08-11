var CanvasGraph = require('./SimpleGraph');
var metricAdapter = require('./metricAdapter');
var metrics = require('./test/metrics');

var series = metricAdapter(metrics, 'net_in');

var elem = document.querySelectorAll('body')[0];
elem.style.height = '100%';

var graph = new CanvasGraph(elem, series, {width: 600, height: 350});

graph.draw();