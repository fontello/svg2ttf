'use strict';

var _ = require('lodash');

function Point(x, y) {
  if (!(this instanceof Point)) return new Point(x, y);

  this.x = x;
  this.y = y;

  this.mul = function (value) {
    return new Point(this.x * value, this.y * value);
  }

  this.add = function (point) {
    return new Point(this.x + point.x, this.y + point.y);
  }

  this.sub = function (point) {
    return new Point(this.x - point.x, this.y - point.y);
  }
}

// This function draws a approximation of a cubic bezier curve
// It is very fast but does not look quite the real one
function convertToQuadPointsBSpline(p0, p1, p2, p3) {

  // calculates middle point of the two control points segment
  var midP = p1.add(p2).mul(1 /2);

  // return curve lines (in two parts)
  return [
    [p1, midP],
    [p2, p3]
  ];
}

// Converts cubic curves to quad curves using MidPoint approach. See http://www.timotheegroleau.com/Flash/articles/cubic_bezier_in_flash.htm for details.
// Smooth (shorthand) curves must be converted to generic ones before this conversion.
//Code is taken here: http://www.timotheegroleau.com/Flash/articles/cubic_bezier/bezier_lib.as
function convertToQuadPointsMidPoint(p0, p1, p2, p3) {

  // Calculates the useful base points.
  var pa = p1.sub(p0).mul(3 / 4).add(p0);
  var pb = p2.sub(p3).mul(3 / 4).add(p3);

  // Get 1/16 of the [P3, P0] segment.
  var d = p3.sub(p0).mul(1 / 16);

  // Calculates control point 1.
  // p0.onSegment(p1, 3 / 8);
  var pc1 = p0.sub(p1).mul(3 / 8).add(p1);

  // Calculates control point 2.
  var pc2 = pa.sub(pb).mul(3 / 8).add(pb).sub(d);

  // Calculates control point 3.
  var pc3 = pb.sub(pa).mul(3 / 8).add(pa).add(d);

  // Calculates control point 4.
  var pc4 = p3.sub(p2).mul(3 / 8).add(p2);

  // Calculates the 3 anchor points, they are middle points of calculated control points.
  var pa1 = pc1.add(pc2).mul(1 /2);
  var pa2 = pa.add(pb).mul(1 /2);
  var pa3 = pc3.add(pc4).mul(1 /2);

  //return four quadratic curves
  return [
    [pc1, pa1],
    [pc2, pa2],
    [pc3, pa3],
    [pc4, p3]
  ];
}

module.exports.Point = Point;
module.exports.convertToQuadPointsBSpline = convertToQuadPointsBSpline;
module.exports.convertToQuadPointsMidPoint = convertToQuadPointsMidPoint;