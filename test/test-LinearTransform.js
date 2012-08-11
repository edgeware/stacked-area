var test = require('tap').test;

var LinearTransform = require('../LinearTransform');

test('can be constructed with slope and offset', function(t){
	var scale = new LinearTransform(3, 10);
	t.equal(scale.k(), 3, 'equal k');
	t.equal(scale.l(), 10, 'equal l');
	t.end();
});

test('can be constructed from two points', function(t){
	var scale = LinearTransform.fromTwoPoints({ x:0, y:1 }, { x:1, y:2 });
	t.equal(scale.k(), 1, 'equal k');
	t.equal(scale.l(), 1, 'equal l');
	t.end();
});

test('can be constructed with slope and offset', function(t){
	var scale = new LinearTransform(3, 10);
	t.equal(scale.k(), 3, 'equal k');
	t.equal(scale.l(), 10, 'equal l');
	t.end();
});

test('can linearly transform scalar', function(t){
	var scale = new LinearTransform(2, 0);
	t.equal(scale.map(0), 0);
	t.equal(scale.map(1), 2);
	
	var scale2 = new LinearTransform(2, 2);
	t.equal(scale2.map(0), 2);
	t.equal(scale2.map(1), 4);

	t.end();
});

test('can invert transform', function(t){
	var scale = new LinearTransform(2, 2);
	t.equal(scale.invert(4), 1);
	t.end();
});