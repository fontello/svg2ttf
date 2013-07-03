'use strict';

var TTF_FLAGS = {
  OFF_CURVE: 0,
  ON_CURVE: 1
}

function getTTFContour(font, glyph, svgContour) {
  var ttfContour = [];
  var sumX = 0, sumY = 0;

  function addPoint(ttfContour, x, y, startNewContour, flags, convertToRelative) {
    var relX, relY;
    if (convertToRelative) {
      relX = +x - sumX;
      relY = +y - sumY;
    } else {
      relX = +x;
      relY = +y;
    }

    ttfContour.push({
      x: relX,
      y: relY,
      flags: flags});
    sumX += relX;
    sumY += relY;
  }

  function addTTFPoints(font, glyph, ttfContour, svgCommand) {
    var type = svgCommand.type;
    var point = svgCommand.point;
    var convertToRelative = type.isAbsolute;
    if (svgCommand.type.curve) {
      //add quadratic Bézier curve
      if (type.curve == CURVE_TYPES.QUAD_BEZIER || type.curve == CURVE_TYPES.SMOOTH_QUAD_BEZIER) {
        var x, y;
        if (type.curve == CURVE_TYPES.QUAD_BEZIER) {
          addPoint(ttfContour, point.other[0], point.other[1], startNewContour, TTF_FLAGS.OFF_CURVE, convertToRelative);
        } else { //get control point from the previous point
          var prevPoint = path[path.length - 1];
          if (prevPoint != undefined) {
            addPoint(ttfContour, prevPoint.x, prevPoint.y, startNewContour, TTF_FLAGS.OFF_CURVE, false);
          }
        }
      }
    }
    addPoint(ttfContour, point.x, point.y, startNewContour, TTF_FLAGS.ON_CURVE, convertToRelative);
  }

  _.forEach(svgContour, function (command) {
    addTTFPoints(font, glyph, ttfContour, command, command);
  });

  return ttfContour;
}

function parseContours(font, glyph) {
  var result = [];
  _.forEach(glyph.svgContours, function (svgContour) {
    result.push(getTTFContour(font, glyph, contour));
  });
}

function parseTTFContours(font) {
  _.forEach(font.glyphs, function (glyph) {
    glyph.ttfContours = parseContours(font, glyph);
  });
}
