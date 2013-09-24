'use strict';


// Converts svg points to contours.
// All points must be converted to relative ones, smooth curves must be converted to generic ones before this conversion.
function toContours(segments) {
  var resContours = [];
  var resContour = [];

  segments.iterate(function(x, y, isRelative, segment, index) {

    //start new contour
    if (index === 0 || segment[0] === 'M') {
      resContour = [];
      resContours.push(resContour);
    }

    if (segment[0] === 'Z') {
      if (resContour.length > 0 && resContour[resContour.length - 1].x === x && resContour[resContour.length - 1].y === y) {
        // closing command is not moved from contour start, we should skip it
        return;
      }
    }

    if (segment[0] === 'Q') {
      //add control point, it is not on curve
      resContour.push({ x: segment[1], y: segment[2], onCurve: false });
    }
    // add on-curve point
    resContour.push({ x: x, y: y, onCurve: true });
  });
  return resContours;
}

module.exports = toContours;