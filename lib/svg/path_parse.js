'use strict';

var _ = require('lodash');

// See documentation here: http://www.w3.org/TR/SVG/paths.html

var SVG_PATH_PATTERN = /[MmZzLlHhVvCcSsQqTtAa][^MmZzLlHhVvCcSsQqTtAa]*/gm;
var SVG_COORDS_PATTERN = /-?[^\s,-]+/gm;

var SVG_COMMAND_TYPES = {
  // Start a new sub-path at the given (x,y) coordinate.
  M: { startNewContour: true },
  m: { startNewContour: true, isRelative: true },
  // Close the current subpath by drawing a straight line from the current point to current subpath's initial point.
  Z: { closePath: true },
  z: { closePath: true },
  // Draw a line from the current point to the given (x,y) coordinate which becomes the new current point.
  L: { isLine: true },
  l: { isLine: true, isRelative: true },
  // Draws a horizontal line from the current point (cpx, cpy) to (x, cpy).
  H: { isLine: true, isHorizLine: true },
  h: { isLine: true, isHorizLine: true, isRelative: true },
  // Draws a vertical line from the current point (cpx, cpy) to (cpx, y).
  V: { isLine: true, isVertLine: true },
  v: { isLine: true, isVertLine: true, isRelative: true },
  // Draws a cubic Bézier curve from the current point to (x,y) using (x1,y1) as the control point at the beginning of the curve and (x2,y2) as the control point at the end of the curve.
  C: { isCurve: true, isQubicCurve: true },
  c: { isCurve: true, isQubicCurve: true, isRelative: true },
  // Draws a cubic Bézier curve from the current point to (x,y).
  S: { isCurve: true, isQubicCurve: true, isSmoothCurve: true },
  s: { isCurve: true, isQubicCurve: true, isSmoothCurve: true, isRelative: true },
  // Draws a quadratic Bézier curve from the current point to (x,y) using (x1,y1) as the control point.
  Q: { isCurve: true, isQuadCurve: true },
  q: { isCurve: true, isQuadCurve: true, isRelative: true },
  // Draws a quadratic Bézier curve from the current point to (x,y).
  T: { isCurve: true, isQuadCurve: true, isSmoothCurve: true },
  t: { isCurve: true, isQuadCurve: true, isSmoothCurve: true, isRelative: true },
  // Draws an elliptical arc from the current point to (x, y).
  A: { isArc: true },
  a: { isArc: true, isRelative: true }
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
function getCommands(coords, command) {
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
      if (addPoint) { // we got all coordinates, now we should add point to array
        points.push(point);
        point = _.clone(command);
        addPoint = false;
      }
      i++;
    });
  }
  else { // no points, just add command
    points.push(command);
  }
  return points;
}

function convertToAbsolutePoints(command, prevCommand) {
  if (command.isRelative) {
    if (command.x !== undefined) {
      command.x = command.x + prevCommand.x;
    }
    if (command.y !== undefined) {
      command.y = command.y + prevCommand.y;
    }
    if (command.x1 !== undefined) {
      command.x1 = command.x1 + prevCommand.x;
    }
    if (command.y1 !== undefined) {
      command.y1 = command.y1 + prevCommand.y;
    }
    if (command.x2 !== undefined) {
      command.x2 = command.x2 + prevCommand.x;
    }
    if (command.y2 !== undefined) {
      command.y2 = command.y2 + prevCommand.y;
    }
    if (command.rx !== undefined) {
      command.rx = command.rx + prevCommand.x;
    }
    if (command.ry !== undefined) {
      command.ry = command.ry + prevCommand.y;
    }
    command.isRelative = false;
  }
  return command;
}

function pathParse(glyph) {
  var contours = [];
  var contour;
  var prevCommand;

  if (glyph.d) {
    var commandGroups = splitByPattern(glyph.d, SVG_PATH_PATTERN);

    _.forEach(commandGroups, function (commandGroup) {

      // parse command group to command type and a set of coordinates
      var commandType = SVG_COMMAND_TYPES[commandGroup[0]]; // first char is command ID
      if (commandType) { // known command type, need to get its points

        // add points to contour
        var coords = splitByPattern(commandGroup.substr(1), SVG_COORDS_PATTERN, true);

        // split command group to individual commands
        var commands = getCommands(coords, commandType);
        _.forEach(commands, function (command) {

          // convert to absolute points if required
          if (command.isRelative) {
            convertToAbsolutePoints(command, prevCommand);
          }

          // Horizontal and vertical lines don't contain accordingly Y and X coordinates.
          // We need to restore these coordinates from previous command.
          if (command.isVertLine) {
            command.x = (prevCommand && prevCommand.x) ? prevCommand.x : 0;
          } else if (command.isHorizLine) {
            command.y = (prevCommand && prevCommand.y) ? prevCommand.y : 0;
          }

          // start new contour if required
          if (command.startNewContour || contour.length === 0) {
            contour = [];
            contours.push(contour);
          }

          // close current contour if required
          if (command.closePath && contour.length > 0) {
            if (prevCommand.x !== (contour[0].x || 0) || prevCommand.y !== (contour[0].y || 0)) { // point is moved from contour start, we should draw line from current point to contour start
              var closePathCommand = { isLine: true, x: contour[0].x, y: contour[0].y };
              contour.push(closePathCommand);
              prevCommand = closePathCommand;
            }
          } else { // add command to current contour
            if (command.isSmoothCurve) { //convert smooth curve to generic one
              if (prevCommand !== undefined) {
                // reflection from the control point of the previous command
                if (command.isQuadCurve && prevCommand.isQuadCurve) {
                  // use (x1,y1) as control point to reflect from
                  command.x1 = 2 * (prevCommand.x || 0) - (prevCommand.x1 || 0);
                  command.y1 = 2 * (prevCommand.y || 0) - (prevCommand.y1 || 0);
                } else if (command.isQubicCurve && prevCommand.isQubicCurve) {
                  // use (x2,y2) as control point to reflect from
                  command.x1 = 2 * (prevCommand.x || 0) - (prevCommand.x2 || 0);
                  command.y1 = 2 * (prevCommand.y || 0) - (prevCommand.y2 || 0);
                } else if (command.isQuadCurve || command.isQubicCurve) {
                  // previous command is of different type, in this case control point should be equal to current point
                  command.x1 = prevCommand.x || 0;
                  command.y1 = prevCommand.y || 0;
                }
              }
              command.isSmoothCurve = false;
            }
            contour.push(command);
            prevCommand = command;
          }
        });
      }
    });
  }
  return contours;
}

module.exports = pathParse;
