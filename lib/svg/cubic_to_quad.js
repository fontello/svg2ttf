// Converts SVG contours,
// replaces all cubic bezier commands with quadratic bezier commands
//
'use strict';

var _     = require('lodash');
var math  = require('../math');

module.exports = function cubicToQuad(contours, accuracy) {
  return _.map(contours, function (contour) {
    //start new contour
    var resContour = [];
    var prevCommand = contour[contour.length - 1];
    var Point = math.Point;

    _.forEach(contour, function (command) {

      if (command.isQubicCurve) {
        var quadCurves = math.bezierCubicToQuad(
          new Point(prevCommand.x, prevCommand.y),
          new Point(command.x1, command.y1),
          new Point(command.x2, command.y2),
          new Point(command.x, command.y),
          accuracy
        );

        _.forEach(quadCurves, function(curve) {
          resContour.push({ x1: curve[1].x, y1: curve[1].y, x: curve[2].x, y: curve[2].y, isCurve: true, isQuadCurve: true });
        });
      }
      else {
        resContour.push(command);
      }

      prevCommand = command;
    });

    return resContour;
  });
};
