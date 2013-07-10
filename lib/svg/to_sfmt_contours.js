'use strict';

var _ = require('lodash');

// Converts svg points to contours.
// All points must be converted to relative ones, smooth curves must be converted to generic ones before this conversion.
function toContours(contours) {
  var resContours = [];
  var resContour;
  _.forEach(contours, function (contour) {

    //start new contour
    resContour = [];
    resContours.push(resContour);

    _.forEach(contour, function (command) {

      if (command.isCurve && command.x1 !== undefined && command.y1 !== undefined) { //add spline point, it is not on curve
        resContour.push({x: command.x1, y: command.y1, onCurve: false });
      } else { //add regular point
        resContour.push({ x: command.x, y: command.y, onCurve: true });
      }
    });
  });

  return resContours;
}

module.exports = toContours;