'use strict';

var _ = require('lodash');

var SVG_PATH_PATTERN = /[MmZzLlHhVvCcSsQqTtAa][^MmZzLlHhVvCcSsQqTtAa]*/gm;
var SVG_COORDS_PATTERN = /-?[^\s,-]+/gm;

var CURVE_TYPES = {
  CUBIC_BEZIER: 1,
  SMOOTH_CUBIC_BEZIER: 2,
  QUAD_BEZIER: 3,
  SMOOTH_QUAD_BEZIER: 4,
  ARC: 5
};

var SVG_COMMAND_TYPES = {
  // Start a new sub-path at the given (x,y) coordinate.
  M: { startNewContour: true, isAbsolute: true },
  m: { startNewContour: true },
  // Close the current subpath by drawing a straight line from the current point to current subpath's initial point.
  Z: { coordLength: 0, closePath: true },
  z: { coordLength: 0, closePath: true },
  // Draw a line from the current point to the given (x,y) coordinate which becomes the new current point.
  L: { absolute: true },
  l: { },
  // Draws a horizontal line from the current point (cpx, cpy) to (x, cpy).
  H: { coordLength: 1, yIndex: -1, isAbsolute: true },
  h: { coordLength: 1, yIndex: -1 },
  // Draws a vertical line from the current point (cpx, cpy) to (cpx, y).
  V: { coordLength: 1, xIndex: -1, yIndex: 0, isAbsolute: true },
  v: { coordLength: 1, xIndex: -1, yIndex: 0},
  // Draws a cubic Bézier curve from the current point to (x,y) using (x1,y1) as the control point at the beginning of the curve and (x2,y2) as the control point at the end of the curve.
  C: { coordLength: 6, xIndex: 4, yIndex: 5, isAbsolute: true, curve: CURVE_TYPES.CUBIC_BEZIER },
  c: { coordLength: 6, xIndex: 4, yIndex: 5, curve: CURVE_TYPES.CUBIC_BEZIER },
  // Draws a cubic Bézier curve from the current point to (x,y).
  S: { coordLength: 4, xIndex: 2, yIndex: 3, isAbsolute: true, curve: CURVE_TYPES.SMOOTH_CUBIC_BEZIER },
  s: { coordLength: 4, xIndex: 2, yIndex: 3, curve: CURVE_TYPES.SMOOTH_CUBIC_BEZIER },
  // Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1) as the control point.
  Q: { coordLength: 4, xIndex: 2, yIndex: 3, isAbsolute: true, curve: CURVE_TYPES.QUAD_BEZIER },
  q: { coordLength: 4, xIndex: 2, yIndex: 3, curve: CURVE_TYPES.QUAD_BEZIER },
  // Draws a quadratic Bézier curve from the current point to (x,y).
  T: { isAbsolute: true, curve: CURVE_TYPES.SMOOTH_QUAD_BEZIER },
  t: { curve: CURVE_TYPES.SMOOTH_QUAD_BEZIER },
  // Draws an elliptical arc from the current point to (x, y).
  A: { coordLength: 7, xIndex: 5, yIndex: 7, isAbsolute: true, curve: CURVE_TYPES.ARC },
  a: { coordLength: 7, xIndex: 5, yIndex: 7, curve: CURVE_TYPES.ARC }
};

function getPoints(contour, convertToQuadSplines) {
  var points = [];
  var sumX = 0, sumY = 0;

  function addPoint(x, y, startNewContour, onCurve, convertToRelative) {
    var relX, relY;
    if (convertToRelative) {
      relX = +x - sumX;
      relY = +y - sumY;
    } else {
      relX = +x;
      relY = +y;
    }

    points.push({
      x: relX,
      y: relY,
      onCurve: onCurve
    });
    sumX += relX;
    sumY += relY;
  }

  function addPoints(command) {
    var type = command.type;
    var point = command.point;
    var convertToRelative = type.isAbsolute;
    var startNewContour = type.startNewContour;
    if (command.type.curve) {
      // Add quadratic Bézier curve
      if (type.curve === CURVE_TYPES.QUAD_BEZIER || type.curve === CURVE_TYPES.SMOOTH_QUAD_BEZIER) {
        if (type.curve === CURVE_TYPES.QUAD_BEZIER) {
          addPoint(point.other[0], point.other[1], startNewContour, false, convertToRelative);
        } else { // get control point from the previous point
          var prevPoint = contour[contour.length - 1];
          if (prevPoint !== undefined) {
            addPoint(prevPoint.x, prevPoint.y, startNewContour, false, false);
          }
        }
      }
      else if (type.curve === CURVE_TYPES.CUBIC_BEZIER || type.curve === CURVE_TYPES.SMOOTH_CUBIC_BEZIER) {
        if (convertToQuadSplines) {
          console.log("Found cubic spline, need to convert to quadratic one.");//TODO: convert cubic to quadracic splines
        }
      }
    }
    addPoint(point.x, point.y, startNewContour, true, convertToRelative);
  }

  _.forEach(contour.commands, function (command) {
    addPoints(command);
  });

  return points;
}

function splitByPattern(str, pattern, toNumbers) {
  var result = [];
  var match = pattern.exec(str);
  while (match) {
    result.push(toNumbers ? +match[0] : match[0]);
    match = pattern.exec(str);
  }
  return result;
}

// Parses coordinates depenging of command type
function parseCoords(coords, svgCommandType) {
  var result = [];
  var point = {};
  var coordLength = svgCommandType.coordLength !== undefined ? svgCommandType.coordLength : 2; // default coords length is 2
  var xIndex = svgCommandType.xIndex !== undefined ? svgCommandType.xIndex : 0; // default x index is 0
  var yIndex = svgCommandType.yIndex !== undefined ? svgCommandType.yIndex : 1; // default y index is 1
  var i = 0;
  _.forEach(coords, function (coord) {
    if (i === 0) {
      point = { x: 0, y: 0, other: [] };
    }
    if (i === xIndex) {
      point.x = coord;
    } else if (i === yIndex) {
      point.y = coord;
    } else {
      point.other.push(coord);
    }
    i++;
    if (i === coordLength) {
      result.push(point);
      i = 0;
    }
  });
  return result;
}

// Splits command to command name and array of coordinates
function parsePathCommand(svgCommandRaw) {
  if (svgCommandRaw.length === 0) {
    return null;
  } else {
    return {
      type: svgCommandRaw[0],
      coords: splitByPattern(svgCommandRaw.substr(1), SVG_COORDS_PATTERN, true)
    };
  }
}

function pathParse(glyph) {

  function initContour() {
    return { commands : [], getQuadSplinePoints: function() {
      return getPoints(this, true);
    } };
  }

  var contours = [];
  var contour = initContour();

  function addPathCommand(pathCommandRaw) {
    var pathCommand = parsePathCommand(pathCommandRaw);
    var svgCommandType = SVG_COMMAND_TYPES[pathCommand.type];
    if (!svgCommandType) { // unknown command type
      return;
    }
    var coords = parseCoords(pathCommand.coords, svgCommandType);
    if (svgCommandType.startNewContour) {
      contour = initContour();
      contours.push(contour);
    }

    // Command can contain several points, we must add add each point
    _.forEach(coords, function (point) {
      contour.commands.push({
        type: svgCommandType,
        point: point
      });
    });
  }

  if (glyph.d) {
    var pathCommandsRaw = splitByPattern(glyph.d, SVG_PATH_PATTERN);
    _.forEach(pathCommandsRaw, function (pathCommandRaw) {
      addPathCommand(pathCommandRaw);
    });
  }

  return contours;
}

module.exports = pathParse;
