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

  this.compare = function(point, tolerance) {
    return Math.abs(this.x - point.x) <= tolerance && Math.abs(this.y - point.y) <= tolerance;
  }
}

// Converts cubic curves to quad curves using MidPoint approach. See http://www.timotheegroleau.com/Flash/articles/cubic_bezier_in_flash.htm for details.
// Smooth (shorthand) curves must be converted to generic ones before this conversion.
//Code is taken here: http://www.timotheegroleau.com/Flash/articles/cubic_bezier/bezier_lib.as
function convertToQuadPoints(p0, p1, p2, p3) {

  // Calculates anchor points.
  var pa = p1.sub(p0).mul(3 / 4).add(p0);
  var pb = p2.sub(p3).mul(3 / 4).add(p3);

  // Calculates base point in the middle of calculated control points.
  var pa1 = pa.add(pb).mul(1 / 2);

  return [
    [p0, pa, pa1],
    [pa1, pb, p3]
  ];
}

module.exports.Point = Point;
module.exports.convertToQuadPoints = convertToQuadPoints;