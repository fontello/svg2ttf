'use strict';

var _ = require('lodash');

// Converts svg points to contours.
// All points must be converted to relative ones, smooth curves must be converted to generic ones before this conversion.
function toContours(points) {
  var contours = [];
  var contour;
  var absX = 0;
  var absY = 0;
  var x, y, startX, startY;
  var skipPoint = false;
  _.forEach(points, function (point) {
    if (point.startNewContour || points.length === 0) { // first point of contour
      contour = {};
      contour.points = [];
      contours.push(contour);
    }
    if (point.closePath) { //close current contour by adding line to start point
      x = startX - absX;
      y = startY - absY;
      if (!x && !y) { //point is not moved, we should skip this point
        skipPoint = true;
      }
    }
    else { //move to next point
      x = point.x || 0;
      y = point.y || 0;
    }

    if (point.isCurve && point.x1 !== undefined && point.y1 !== undefined) { //add spline point, it is not on curve
      contour.points.push({x: point.x1, y: point.y1, onCurve: false });
    }
    if (skipPoint) {
      skipPoint = false;
    } else { //add regular point
      contour.points.push({ x: x, y: y, onCurve: true });
    }
    absX += x;
    absY += y;
    if (point.startNewContour) {
      startX = absX;
      startY = absY;
    }
  });

  return contours;
}

module.exports = toContours;