'use strict';

var _ = require('lodash');
var math = require('../math');

function floatToInt(value) {
  return parseInt(Math.round(value), 10);
}

//returns true if point is on the middle between points
function isOnLine(point1, point2, point) {
  var p1 = new math.Point(point1.x, point1.y);
  var p2 = new math.Point(point2.x, point2.y);
  var p = new math.Point(point.x, point.y);
  var midPoint = p2.sub(p1).mul(1 / 2).add(p1);
  return p.compare(midPoint, 0.5);
}

// Remove points that can be interpolated.
function interpolatePoints(contours) {
  var prevPoint, prevPrevPoint;
  var resContours = [];
  var resContour;
  _.forEach(contours, function (contour) {
    resContour = [];
    resContours.push(resContour);
    prevPoint = prevPrevPoint = null;
    _.forEach(contour.points, function (point) {
      // Maybe on-curve point is placed on the same line with neighbour off-curve points? Then it can be interpolated.
      if (prevPrevPoint && !prevPrevPoint.onCurve && !point.onCurve && isOnLine(prevPrevPoint, point, prevPoint)) {
        resContour.splice(resContour.length - 1, 1);
        prevPoint = prevPrevPoint;
      }
      resContour.push(point);
      prevPrevPoint = prevPoint;
      prevPoint = point;
    });
  });
  return resContours;
}

function roundPoints(contours) {
  var resContours = [];
  var resContour;
  _.forEach(contours, function (contour) {
    resContour = [];
    resContours.push(resContour);
    _.forEach(contour, function (point) {
      resContour.push({
        x: floatToInt(point.x),
        y: floatToInt(point.y),
        onCurve: point.onCurve
      });
    });
  });
  return resContours;
}

function convertToRelativePoints(contours) {
  var prevPoint = { x: 0, y: 0};
  var resContours = [];
  var resContour;
  _.forEach(contours, function (contour) {
    resContour = [];
    resContours.push(resContour);
    _.forEach(contour, function (point) {
      resContour.push({
        x: point.x - prevPoint.x,
        y: point.y - prevPoint.y,
        onCurve: point.onCurve
      });
      prevPoint = point;
    });
  });
  return resContours;
}

//calculates length of glyph data in GLYF table
function glyphDataLength(glyph) {
  var result = 12; //glyph fixed properties
  result += glyph.contours.length * 2; //add contours
  _.forEach(convertToRelativePoints(roundPoints(interpolatePoints(glyph.contours))), function (contour) {
    _.forEach(contour, function (point) {
      //add 1 or 2 bytes for each coordinate depending of its size
      result += ((-0xFF <= point.x && point.x <= 0xFF)) ? 1 : 2;
      result += ((-0xFF <= point.y && point.y <= 0xFF)) ? 1 : 2;
      result += 1; //flag length
    });
  });
  return result;
}

module.exports.glyphDataLength = glyphDataLength;
module.exports.interpolatePoints = interpolatePoints;
module.exports.roundPoints = roundPoints;
module.exports.convertToRelativePoints = convertToRelativePoints;

