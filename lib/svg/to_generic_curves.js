'use strict';

var _ = require('lodash');

// Converts smooth curves to generic ones. See http://www.w3.org/TR/SVG/paths.html#PathDataCurveCommands for details.
// All points must be converted to relative before this conversion.
function toGenericCurves(points) {
  var clonedPoints = _.cloneDeep(points);
  var prevPoint;
  _.forEach(clonedPoints, function (point) {
    if (point.isSmoothCurve) {
      if (prevPoint !== undefined) {
        //reflection from the last point
        point.x1 = (prevPoint.x || 0) - (prevPoint.x1 || 0);
        point.y1 = (prevPoint.y || 0) - (prevPoint.y1 || 0);
      }
      point.isSmoothCurve = false;
    }
    prevPoint = point;
  });
  //console.log("toGenericCurves", clonedPoints);
  return clonedPoints;
}

module.exports = toGenericCurves;
