'use strict';

var _ = require('lodash');

// See documentation here: http://www.w3.org/TR/SVG/paths.html

var SVG_PATH_PATTERN = /[MmZzLlHhVvCcSsQqTtAa][^MmZzLlHhVvCcSsQqTtAa]*/gm;
var SVG_COORDS_PATTERN = /-?[^\s,-]+/gm;

var SVG_COMMAND_TYPES = {
  // Start a new sub-path at the given (x,y) coordinate.
  M: { startNewContour: true, isAbsolute: true },
  m: { startNewContour: true },
  // Close the current subpath by drawing a straight line from the current point to current subpath's initial point.
  Z: { closePath: true },
  z: { closePath: true },
  // Draw a line from the current point to the given (x,y) coordinate which becomes the new current point.
  L: { isLine: true, absolute: true },
  l: { isLine: true },
  // Draws a horizontal line from the current point (cpx, cpy) to (x, cpy).
  H: { isLine: true, isHorizLine: true, isAbsolute: true },
  h: { isLine: true, isHorizLine: true },
  // Draws a vertical line from the current point (cpx, cpy) to (cpx, y).
  V: { isLine: true, isVertLine: true, isAbsolute: true },
  v: { isLine: true, isVertLine: true },
  // Draws a cubic Bézier curve from the current point to (x,y) using (x1,y1) as the control point at the beginning of the curve and (x2,y2) as the control point at the end of the curve.
  C: { isCurve: true, isQubicCurve: true, isAbsolute: true },
  c: { isCurve: true, isQubicCurve: true },
  // Draws a cubic Bézier curve from the current point to (x,y).
  S: { isCurve: true, isQubicCurve: true, isSmoothCurve: true, isAbsolute: true },
  s: { isCurve: true, isQubicCurve: true, isSmoothCurve: true },
  // Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1) as the control point.
  Q: { isCurve: true, isQuadCurve: true, isAbsolute: true },
  q: { isCurve: true, isQuadCurve: true },
  // Draws a quadratic Bézier curve from the current point to (x,y).
  T: { isCurve: true, isQuadCurve: true, isAbsolute: true },
  t: { isCurve: true, isQuadCurve: true },
  // Draws an elliptical arc from the current point to (x, y).
  A: { isArc: true, isAbsolute: true },
  a: { isArc: true }
};

function splitByPattern(str, pattern, toNumbers) {
  var result = [];
  var match = pattern.exec(str);
  while (match) {
    result.push(toNumbers ? +match[0] : match[0]);
    match = pattern.exec(str);
  }
  return result;
}

// get command points depending of command type
function getCommandPoints(coords, command) {
  var points = [];
  var point = _.clone(command);
  var addPoint = false;
  if (!command.closePath) {
    var i = 0;
    _.forEach(coords, function (coord) {
      if (command.isLine || command.startNewContour) {
        if (command.isHorizLine) { // (x)+
          point.x = coord;
          addPoint = true;
        } else if (command.isVertLine) { // (y)+
          point.y = coord;
          addPoint = true;
        }
        else if (i % 2 === 0) { // (x y)+
          point.x = coord;
        } else {
          point.y = coord;
          addPoint = true;
        }
      } else if (command.isCurve) {
        if (command.isQubicCurve) {
          if (command.isSmoothCurve) { // (x2 y2 x y)+
            if (i % 4 === 0) {
              point.x2 = coord;
            } else if (i % 4 === 1) {
              point.y2 = coord;
            } else if (i % 4 === 2) {
              point.x = coord;
            } else if (i % 4 === 3) {
              point.y = coord;
              addPoint = true;
            }
          } else { // (x1 y1 x2 y2 x y)+
            if (i % 6 === 0) {
              point.x1 = coord;
            } else if (i % 6 === 1) {
              point.y1 = coord;
            } else if (i % 6 === 2) {
              point.x2 = coord;
            } else if (i % 6 === 3) {
              point.y2 = coord;
            } else if (i % 6 === 4) {
              point.x = coord;
            } else if (i % 6 === 5) {
              point.y = coord;
              addPoint = true;
            }
          }
        } else if (command.isQuadCurve) {
          if (command.isSmoothCurve) { // (x y)+
            if (i % 2 === 0) {
              point.x = coord;
            } else if (i % 2 === 1) {
              point.y = coord;
              addPoint = true;
            }
          } else { // (x1 y1 x y)+
            if (i % 4 === 0) {
              point.x1 = coord;
            } else if (i % 4 === 1) {
              point.y1 = coord;
            } else if (i % 4 === 2) {
              point.x = coord;
            } else if (i % 4 === 3) {
              point.y = coord;
              addPoint = true;
            }
          }
        } else if (command.isArc) { // (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+
          if (i % 7 === 0) {
            point.rx = coord;
          } else if (i % 7 === 1) {
            point.ry = coord;
          } else if (i % 7 === 2) {
            point.xAxisRotation = coord;
          } else if (i % 7 === 3) {
            point.largeArcFlag = coord;
          } else if (i % 7 === 4) {
            point.sweepFlag = coord;
          } else if (i % 7 === 5) {
            point.x = coord;
          } else if (i % 7 === 6) {
            point.y = coord;
            addPoint = true;
          }
        }
      }
      if (addPoint) { //we got all coordinates, now we should add point to array
        points.push(point);
        point = _.clone(command);
        addPoint = false;
      }
      i++;
    });
  }
  else { //no points, just add command
    points.push(command);
  }
  return points;
}

function pathParse(glyph) {
  var points = [];

  if (glyph.d) {
    var commands = splitByPattern(glyph.d, SVG_PATH_PATTERN);

    _.forEach(commands, function (command) {
      //parse command to coordinates
      var commandType = SVG_COMMAND_TYPES[command[0]]; //first char is command ID
      if (commandType) { // known command type, need to get its points
        //add points to contour
        var coords = splitByPattern(command.substr(1), SVG_COORDS_PATTERN, true);
        points.push.apply(points, getCommandPoints(coords, commandType));
      }
    });
  }
  //console.log("pathParse ", points);
  return points;
}

module.exports = pathParse;
