// Converts smooth curves (with missed control point) to generic curves
//
'use strict';


module.exports = function smoothToGenericCurves(svgContours) {
  var prevX = 0
    , prevY = 0;
  var  controlX, controlY, x1, y1;

  var prevSegment = [];
  svgContours.iterate(function(x, y, isRelative, segment) {
    var name = segment[0];

    if (name === 'T') { // qubic curve
      segment[0] = 'Q';
      controlX = prevSegment[0] === 'Q' ? prevSegment[1] : prevX;
      x1 = 2 * (prevX || 0) - (controlX || 0);
      controlY = prevSegment[0] === 'Q' ? prevSegment[2] : prevY;
      y1 = 2 * (prevY || 0) - (controlY || 0);
      segment.splice(1, 0, x1, y1);
    } else if (name === 'S') { // quadratic curve

      segment[0] = 'C';
      controlX = prevSegment[0] === 'C' ? prevSegment[3] : prevX;
      x1 = 2 * (prevX || 0) - (controlX || 0);
      controlY = prevSegment[0] === 'C' ? prevSegment[4] : prevY;
      y1 = 2 * (prevY || 0) - (controlY || 0);
      segment.splice(1, 0, x1, y1);
    }

    prevSegment = segment;
    prevX = x;
    prevY = y;
  });

  return svgContours;
};
