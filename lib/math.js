'use strict';

var _ = require('lodash');

function Point(x, y) {
  if (!(this instanceof Point)) return new Point(x, y);

  this.x = x;
  this.y = y;

  this.mul = function (value) {
    return new Point(this.x * value, this.y * value);
  }

  this.addPoint = function (point) {
    return new Point(this.x + point.x, this.y + point.y);
  }

  this.substPoint = function (point) {
    return new Point(this.x - point.x, this.y - point.y);
  }

  // return a point on a segment [P0, P1] which distance from P0
  // is ratio of the length [P0, P1]
  this.onSegment = function (point, ratio) {
    return new Point(this.x + ((point.x - this.x) * ratio), this.y + (point.y - this.y) * ratio);
  }

  // return the middle of a segment define by two points
  this.middle = function (point) {
    return new Point((this.x + point.x) / 2, (this.y + point.y) / 2);
  }

  // return the distance from another point
  this.distance = function (point) {
    return new Point(point.x - this.x, point.y - this.y);
  }
}

// Converts cubic curves to quad curves using Fixed MidPoint approach. See http://www.timotheegroleau.com/Flash/articles/cubic_bezier_in_flash.htm for details.
// Smooth (shorthand) curves must be converted to generic ones before this conversion.
//Code is taken here: http://www.timotheegroleau.com/Flash/articles/cubic_bezier/bezier_lib.as
function convertToQuadPoints(p0, p1, p2, p3) {

  // calculates the useful base points
  var pa = p0.onSegment(p1, 3 / 4);
  var pb = p3.onSegment(p2, 3 / 4);

  // get 1/16 of the [P3, P0] segment
  var d = p0.distance(p3).mul(1 / 16);

  // calculates control point 1
  var pc1 = p0.onSegment(p1, 3 / 8);

  // calculates control point 2
  var pc2 = pa.onSegment(pb, 3 / 8).substPoint(d);

  // calculates control point 3
  var pc3 = pb.onSegment(pa, 3 / 8).addPoint(d);

  // calculates control point 4
  var pc4 = p3.onSegment(p2, 3 / 8);

  // calculates the 3 anchor points
  var pa1 = pc1.middle(pc2);
  var pa2 = pa.middle(pb);
  var pa3 = pc3.middle(pc4);

  //return four quadratic curves
  return [
    [pc1, pa1],
    [pc2, pa2],
    [pc3, pa3],
    [pc4, p3]
  ];
}

module.exports.Point = Point;
module.exports.convertToQuadPoints = convertToQuadPoints;