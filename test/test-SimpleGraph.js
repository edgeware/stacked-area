var test = require('tap').test;
var sandbox = require('sandboxed-module');
/*
var path = require('path');
var mock = function(moduleId, obj){
	var abs = path.resolve(moduleId);
	require.cache[ abs ] = {
		id: abs,
		exports: obj,
		filename: abs,
		loaded: true,
		children: [],
		paths: [abs]
	};
};

mock('../Canvas', function(){
	return {test:'canvas renderer test'};
});
*/
var jsdom = require('jsdom');
var metricAdapter = require('../metricAdapter');
var metrics = require('../testData/metrics');
var netin = metricAdapter(metrics, 'net_in');


var CanvasRenderer = function(){

};
CanvasRenderer.prototype.draw = function(){
	console.log('fake draw');
};

jsdom.env('<div id="mygraph"></div>', function(errors, window){
	var StackedGraph = sandbox.require('../SimpleGraph', {
		requires: {'./CanvasRenderer': CanvasRenderer},
		globals: {document: window.document},
		locals: {}
	});

	var elem = window.document.getElementById('mygraph');
	test('is constructed from elem, data and options', function(t){
		var graph = new StackedGraph(elem, netin, { width: 600, height: 350 });
		t.end();
	});

	test('is constructed from elem, data and options', function(t){
		var graph = new StackedGraph(elem, netin, { width: 600, height: 350 });

		t.end();
	});


});