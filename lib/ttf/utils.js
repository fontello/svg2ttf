'use strict';

var _ = require('lodash');

//calculates length of glyph data in GLYF table
function glyphDataLength(glyph) {
  var result = 12; //glyph fixed properties
  result += glyph.contours.length * 2; //add contours
  _.forEach(glyph.contours, function (contour) {
    result += contour.points.length * 5; //add points for each contour
  });
  return result;
}

module.exports.glyphDataLength = glyphDataLength;
