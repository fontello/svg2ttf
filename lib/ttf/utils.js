'use strict';

var _ = require('lodash');

function floatToInt(value) {
  return parseInt(Math.round(value), 10);
}

function convertToRelativePoints(contours) {
  var prevPoint = { x: 0, y: 0};
  var resContours = [];
  var resContour;
  _.forEach(contours, function (contour) {
    resContour = [];
    resContours.push(resContour);
    _.forEach(contour.points, function (point) {
      var correctedPoint = { x: floatToInt(point.x), y: floatToInt(point.y) };
      resContour.push({
        x: correctedPoint.x - prevPoint.x,
        y: correctedPoint.y - prevPoint.y,
        onCurve: point.onCurve
      });
      prevPoint = correctedPoint;
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
