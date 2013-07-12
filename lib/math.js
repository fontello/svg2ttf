'use strict';

function Point(x, y) {
  if (!(this instanceof Point)) {
    return new Point(x, y);
  }

  this.x = x;
  this.y = y;

  this.mul = function (value) {
    return new Point(this.x * value, this.y * value);
  };

  this.add = function (point) {
    return new Point(this.x + point.x, this.y + point.y);
  };

  this.sub = function (point) {
    return new Point(this.x - point.x, this.y - point.y);
  };

  this.compare = function (point, tolerance) {
    return Math.abs(this.x - point.x) <= tolerance && Math.abs(this.y - point.y) <= tolerance;
  }
}

// Converts cubic curves to quad curves using MidPoint approach. See http://www.timotheegroleau.com/Flash/articles/cubic_bezier_in_flash.htm for details.
// Smooth (shorthand) curves must be converted to generic ones before this conversion.
//Code is taken here: http://www.timotheegroleau.com/Flash/articles/cubic_bezier/bezier_lib.as
function convertToQuadPoints(p0, p1, p2, p3) {

  // Calculates midpoints of each segment
  var p4 = p0.add(p1).mul(1 / 2);
  var p5 = p1.add(p2).mul(1 / 2);
  var p6 = p2.add(p3).mul(1 / 2);

  //midpoint between calculated midpoints
  var p7 = p4.add(p5).mul(1 / 2);
  var p8 = p5.add(p6).mul(1 / 2);

  //curve midpoint
  var mp = p7.add(p8).mul(1 / 2);

  //control points for quadratic curves
  var c1 = p4.add(p7).mul(1 / 2);
  var c2 = p6.add(p8).mul(1 / 2);

  return [
    [p0, c1, mp],
    [mp, c2, p3]
  ];
}

module.exports.Point = Point;
module.exports.convertToQuadPoints = convertToQuadPoints;