/**
 * Represent a line (y = kx + l)
 */
function LinearEquation(k, l) {
  this._k = k;
  this._l = l;
}

LinearEquation.fromTwoPoints = function(p0, p1) {
  var p = LinearEquation.parametersFromTwoPoints(p0, p1);
  return new LinearEquation(p.k, p.l);
};

LinearEquation.parametersFromTwoPoints = function(p0, p1) {
  var k = (p1.y - p0.y) / (p1.x - p0.x);
  var l = p1.y - k * p1.x;
  return {
    k: k,
    l: l
  };
};

/**
 * Set the line parameters from two points
 * @param {Object} p0
 * @param {Object} p1
 * @return undefined
 */
LinearEquation.prototype.fromTwoPoints = function(p0, p1) {
  var p = LinearEquation.parametersFromTwoPoints(p0, p1);
  this.k(p.k);
  this.l(p.l);
};

LinearEquation.prototype._k = 1;

LinearEquation.prototype._l = 0;

/**
 * Set or get slope (k) for line
 * @param {Number} slope
 */
LinearEquation.prototype.k = function(factor) {
  if (typeof factor === 'undefined') {
    return this._k;
  }
  return this._k = factor;
};

/**
 * Set or get offset (l) for line
 * @param {Number} offset
 */
LinearEquation.prototype.l = function(offset) {
  if (typeof offset === 'undefined') {
    return this._l;
  }
  return this._l = offset;
};

LinearEquation.prototype.map = function(x) {
  return this._k * x + this._l;
};

LinearEquation.prototype.invert = function(y) {
  return (y - this._l) / this._k;
};

/**
 * Set the slope of the line (y = kx + l) at point x
 *
 * @param {Number} point around which to rotate line
 */
LinearEquation.prototype.setSlopeAtPoint = function(slope, x) {
  var k0, k1, l0, l1;
  k0 = this._k;
  k1 = slope;
  l0 = this._l;
  l1 = k0 * x + l0 - k1 * x;
  this._k = k1;
  return this._l = l1;
};

module.exports = LinearEquation;

module.exports = LinearEquation;