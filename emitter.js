function Emitter() {
  this.handlers = {};
}

Emitter.prototype.on = function(event, handler) {
  if (!(event in this.handlers)) {
    this.handlers[event] = [];
  }
  return this.handlers[event].push(handler);
};

Emitter.prototype.trigger = function(event, data) {
  var handler, _i, _len, _ref, _results;
  var dataParams = Array.prototype.slice.call(arguments,1);
  _ref = this.handlers[event] || [];
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    handler = _ref[_i];
    _results.push(handler.apply(null,dataParams));
  }
  return _results;
};

Emitter.prototype.emit = function() {
  return this.trigger.apply(this, [].slice.call(arguments));
};

module.exports = Emitter;