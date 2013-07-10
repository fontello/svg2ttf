'use strict';

var _ = require('lodash');

// return a point on a segment [P0, P1] which distance from P0
// is ratio of the length [P0, P1]
function getPointOnSegment(p0, p1, ratio) {
  return {x: (p0.x + ((p1.x - p0.x) * ratio)), y: (p0.y + ((p1.y - p0.y) * ratio))};
}

// return the middle of a segment define by two points
function getMiddle(p0, p1) {
  return {x: ((p0.x + p1.x) / 2), y: ((p0.y + p1.y) / 2)};
}

//Code is taken here: http://www.timotheegroleau.com/Flash/articles/cubic_bezier/bezier_lib.as
function convertToQuadPoints(command, prevCommand) {
  var p0 = { x: prevCommand ? prevCommand.x : 0, y: prevCommand ? prevCommand.y : 0 };
  var p1 = { x: command.x1, y: command.y1 };
  var p2 = { x: command.x2, y: command.y2 };
  var p3 = { x: command.x, y: command.y };
  // calculates the useful base points
  var pa = getPointOnSegment(p0, p1, 3 / 4);
  var pb = getPointOnSegment(p3, p2, 3 / 4);

  // get 1/16 of the [P3, P0] segment
  var dx = (p3.x - p0.x) / 16;
  var dy = (p3.y - p0.y) / 16;

  // calculates control point 1
  var pc1 = getPointOnSegment(p0, p1, 3 / 8);

  // calculates control point 2
  var pc2 = getPointOnSegment(pa, pb, 3 / 8);
  pc2.x -= dx;
  pc2.y -= dy;

  // calculates control point 3
  var pc3 = getPointOnSegment(pb, pa, 3 / 8);
  pc3.x += dx;
  pc3.y += dy;

  // calculates control point 4
  var pc4 = getPointOnSegment(p3, p2, 3 / 8);

  // calculates the 3 anchor points
  var pa1 = getMiddle(pc1, pc2);
  var pa2 = getMiddle(pa, pb);
  var pa3 = getMiddle(pc3, pc4);

  var resCommands = [];
  // add four quadratic subsegments
  resCommands.push({ x1: pc1.x, y1: pc1.y, x: pa1.x, y: pa1.y, isCurve: true, isQuadCurve: true });
  resCommands.push({ x1: pc2.x, y1: pc2.y, x: pa2.x, y: pa2.y, isCurve: true, isQuadCurve: true });
  resCommands.push({ x1: pc3.x, y1: pc3.y, x: pa3.x, y: pa3.y, isCurve: true, isQuadCurve: true });
  resCommands.push({ x1: pc4.x, y1: pc4.y, x: p3.x, y: p3.y, isCurve: true, isQuadCurve: true });
  return resCommands;
}

// Converts cubic curves to quad curves using Fixed MidPoint approach. See http://www.timotheegroleau.com/Flash/articles/cubic_bezier_in_flash.htm for details.
// Smooth (shorthand) curves must be converted to generic ones before this conversion.
function toQuadCurves(contours) {
  var resContours = [];
  var resContour;
  var prevCommand;
  _.forEach(contours, function (contour) {

    //start new contour
    resContour = [];
    resContours.push(resContour);

    _.forEach(contour, function (command) {

      if (command.isQubicCurve) {
        //add quadratic curves interpolated from qubic curve
        resContour.push.apply(resContour, convertToQuadPoints(command, prevCommand));
      }
      else {
        resContour.push(_.cloneDeep(command));
      }

      prevCommand = command;
    });
  });
  return resContours;
}

module.exports = toQuadCurves;
