'use strict';

function Point(x, y) {
  if (!(this instanceof Point)) {
    return new Point(x, y);
  }

  this.x = x;
  this.y = y;

  this.add = function (point) {
    return new Point(this.x + point.x, this.y + point.y);
  };

  this.sub = function (point) {
    return new Point(this.x - point.x, this.y - point.y);
  };

  this.mul = function (value) {
    return new Point(this.x * value, this.y * value);
  };

  this.div = function (value) {
    return new Point(this.x / value, this.y / value);
  };

  this.dist = function () {
    return Math.sqrt(this.x*this.x + this.y*this.y);
  };

  this.sqr = function () {
    return this.x*this.x + this.y*this.y;
  };
}


// converts cubic bezier to quad
function toQuad(p1, c1, c2, p2) {
  // Quad control point is (3*c2 - p2 + 3*c1 - p1)/4
  return [p1, c2.mul(3).sub(p2).add(c1.mul(3)).sub(p1).div(4), p2];
}

/*
 * Aproximates cubic curve to 2 quad curves. Returns array of quad curves
 *
 * 1. Split cubic bezier-> 2 cubic beziers, by midpoint
 * 2. Replace each cubic bezier with quad bezier
 *
 * This is a simplified approach. It can be improved by adaptive splitting,
 * but in real life that's not needed.
 *
 * (!) We could use more slices, but FONT SIZE DOES MATTER !!!
 */
function bezierCubicToQuad(p1, c1, c2, p2) {

  // check first, if we can aproximate with quad directly
  // |p2 - 3*c2 + 3*c1 - p1|/2 should be small (zero in ideal)
  // http://www.caffeineowl.com/graphics/2d/vectorial/cubic2quad01.html
  var cpDistance = p2.sub(c2.mul(3)).add(c1.mul(3)).sub(p1).dist()/2;

  if (cpDistance <= 3) {
    return [ toQuad(p1, c1, c2, p2) ];
  }

  // Split to 2 qubic beziers
  // https://www.atalasoft.com/blogs/stevehawley/may-2013/how-to-split-a-cubic-bezier-curve
  // http://www.timotheegroleau.com/Flash/articles/cubic_bezier/bezier_lib.as

  // midpoints of qubic bezier
  // (p2 + 3*c2 + 3*c1 + p1)/8
  var mp = p2.add(c2.mul(3)).add(c1.mul(3)).add(p1).div(8);

  var q1 = toQuad(p1, p1.add(c1).div(2), p1.add(c2).add(c1.mul(2)).div(4), mp);
  var q2 = toQuad(mp, p2.add(c1).add(c2.mul(2)).div(4), p2.add(c2).div(2), p2);

  // now replace each half with quad curve
  return [ q1, q2 ];

}

/*
 * Check if 3 points are in line, and second in the midle.
 * Used to replace quad curves with lines or join lines
 *
 */
function isInLine(p1, m, p2, accuracy) {
  var a = p1.sub(m).sqr();
  var b = p2.sub(m).sqr();
  var c = p1.sub(p2).sqr();

  // control point not between anchors
  if ((a > (b+c)) || (b > (a+c))) {
    return false;
  }

  // count siatance between m and [p1,p2]
  a = Math.sqrt(a);
  b = Math.sqrt(b);
  c = Math.sqrt(c);
  
  var p = (a + b + c) / 2;
  var s = Math.sqrt((p - a) * (p - b) * (p - c) * p);
  var distance = s * 2 / c;

  return distance < accuracy ? true : false;
}

module.exports.Point = Point;
module.exports.bezierCubicToQuad = bezierCubicToQuad;
module.exports.isInLine = isInLine;
