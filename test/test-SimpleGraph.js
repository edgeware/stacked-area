var test = require('tap').test;

var elem = require('../fakeElement').create('div');	
var document = require('../Document')(elem);
var SimpleGraph = require('../SimpleGraph');

test('is constructed from elem, data and options', function(t){
	var scale = new SimpleGraph();

	
	t.end();
});



