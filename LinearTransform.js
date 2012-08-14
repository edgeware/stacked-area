function LinearTransform(k, l) {
  this._k = k;
  this._l = l;
}

LinearTransform.fromTwoPoints = function(p0, p1){
  var p = LinearTransform.parametersFromTwoPoints(p0, p1);
  return new LinearTransform(p.k, p.l);
};

LinearTransform.parametersFromTwoPoints = function(p0, p1){
  var k = (p1.y-p0.y)/(p1.x -p0.x);
  var l = p1.y - k * p1.x;
  return { k: k, l: l };
};

LinearTransform.prototype.fromTwoPoints = function(p0, p1){
  var p = LinearTransform.parametersFromTwoPoints(p0, p1);
  this.k(p.k);
  this.l(p.l);
};

LinearTransform.prototype._k = 1;

LinearTransform.prototype._l = 0;

LinearTransform.prototype.k = function(factor) {
  if (typeof factor === 'undefined') {
    return this._k;
  }
  return this._k = factor;
};

LinearTransform.prototype.l = function(offset) {
  if (typeof offset === 'undefined') {
    return this._l;
  }
  return this._l = offset;
};

LinearTransform.prototype.map = function(x) {
  return this._k * x + this._l;
};

LinearTransform.prototype.invert = function(y) {
  return (y - this._l) / this._k;
};

LinearTransform.prototype.setSlopeAtPoint = function(slope, x) {
  var k0, k1, l0, l1;
  k0 = this._k;
  k1 = slope;
  l0 = this._l;
  l1 = k0 * x + l0 - k1 * x;
  this._k = k1;
  return this._l = l1;
};

module.exports = LinearTransform;

module.exports = LinearTransform;