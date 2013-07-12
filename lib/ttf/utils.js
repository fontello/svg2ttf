'use strict';

var _ = require('lodash');

function floatToInt(value) {
  return parseInt(Math.round(value), 10);
}

//returns true if point is on line
function isOnLine(p1, p2, point) {
  var tolerance = 0.5;
  var dy = p1.y - p2.y;
  var dx = p1.x - p2.x;
  if(dy == 0) { //horizontal line
    if(point.y == p1.y) {
      if(p1.x > p2.x) {
        if(point.x <= p1.x && point.x >= p2.x)
          return true;
      }
      else {
        if(point.x >= p1.x && point.x <= p2.x)
          return true;
      }
    }
  }
  else if(dx == 0) { //vertical line
    if(point.x == p1.x) {
      if(p1.y > p2.y) {
        if(point.y <= p1.y && point.y >= p2.y)
          return true;
      }
      else {
        if(point.y >= p1.y && point.y <= p2.y)
          return true;
      }
    }
  }
  else { //slope line
    var p = dy/dx;
    var py = p * p.x;
    if(py <= p.y + tolerance && py >= p.y - tolerance) {
      if(p1.x > p2.x) {
        if(p.x <= p1.x && p.x >= p2.x)
          return true;
      }
      else {
        if(p.x >= p1.x && p.x <= p2.x)
          return true;
      }
    }
  }
  return false;
}

function convertToRelativePoints(contours) {
  var prevPoint, prevPrevPoint, prevPrevCorrectedPoint, prevCorrectedPoint;
  var resContours = [];
  var resContour;
  _.forEach(contours, function (contour) {
    resContour = [];
    resContours.push(resContour);
    _.forEach(contour.points, function (point) {
      var correctedPoint = { x: floatToInt(point.x), y: floatToInt(point.y) };
      // Maybe on-curve point is placed on the same line with neighbour off-curve points? Then it can be interpolated.
      if (prevPrevPoint && !prevPrevPoint.onCurve && !point.onCurve && isOnLine(prevPrevPoint, point, prevPoint)) {
        // Interpolated point is found, we can remove it.
        resContour.splice(resContour.length - 1, 1);
        prevCorrectedPoint = prevPrevCorrectedPoint;
      }
      resContour.push({
        x: correctedPoint.x - (prevCorrectedPoint ? prevCorrectedPoint.x : 0),
        y: correctedPoint.y - (prevCorrectedPoint ? prevCorrectedPoint.y : 0),
        onCurve: point.onCurve
      });
      prevPrevCorrectedPoint = prevCorrectedPoint;
      prevCorrectedPoint = correctedPoint;
      prevPrevPoint = prevPoint;
      prevPoint = point;
    });
  });
  return resContours;
}

//calculates length of glyph data in GLYF table
function glyphDataLength(glyph) {
  var result = 12; //glyph fixed properties
  result += glyph.contours.length * 2; //add contours
  _.forEach(convertToRelativePoints(glyph.contours), function (contour) {
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
module.exports.convertToRelativePoints = convertToRelativePoints;
