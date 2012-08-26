var Graph = require('../../StackedGraph');

var series = [
	{
		name: 'series1',
		points: [
			{
				x: 0,
				y: 1
			}, {
				x: 1,
				y: 2
			}, {
				x: 2,
				y: void(0)
			}, {
				x: 3,
				y: void(0)
			}
		]
	}
];

var elem = document.getElementById('target');
var graph = new Graph(elem, series, {});
graph.zoomTo([0, 2]);