'use strict';

var _ = require('lodash');

// Converts smooth curves to generic ones. See http://www.w3.org/TR/SVG/paths.html#PathDataCurveCommands for details.
// All points must be converted to quadratic and relative ones before this conversion.
function toGenericCurves(points) {
  var clonedPoints = _.cloneDeep(points);
  var prevPoint;
  _.forEach(clonedPoints, function (point) {
    if (point.isCurve && point.isSmoothCurve) {
      if (prevPoint !== undefined) {
        point.x1 = prevPoint.x1;
        point.y1 = -prevPoint.y1; //reflection from the last point
      }
      point.isSmoothCurve = false;
    }
    prevPoint = point;
  });
  //console.log("toGenericCurves", clonedPoints);
  return clonedPoints;
}

module.exports = toGenericCurves;
