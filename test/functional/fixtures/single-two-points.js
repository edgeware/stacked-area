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
			}
		]
	}
];

var elem = document.getElementById('target');
var graph = new Graph(elem, series, {});
