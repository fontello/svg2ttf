// Converts SVG contours,
// replaces all cubic bezier commands with quadratic bezier commands
//
'use strict';

var _     = require('lodash');
var math  = require('../math');

module.exports = function cubicToQuad(segments, accuracy) {
  var prevX = 0, prevY = 0;
  var Point = math.Point;
  var res, isQubicCurve;

  segments.iterate(function(x, y, isRelative, segment) {
    isQubicCurve = segment[0] === 'C';
    if (isQubicCurve) {
      var quadCurves = math.bezierCubicToQuad(
        new Point(prevX, prevY),
        new Point(segment[1], segment[2]),
        new Point(segment[3], segment[4]),
        new Point(x, y),
        accuracy
      );

      res = [];
      _.forEach(quadCurves, function(curve) {
        res.push(['Q', curve[1].x, curve[1].y, curve[2].x, curve[2].y]);
      });
    }
    prevX = x;
    prevY = y;
    if (isQubicCurve) {
      return res;
    }
  });
  return segments;
};
