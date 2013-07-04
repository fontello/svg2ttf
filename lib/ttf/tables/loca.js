'use strict';

var _ = require('lodash');

//calculates length of glyph data in GLYF table
function getGlyphDataLength(glyph) {
  var result = 12; //glyph fixed properties
  result += glyph.contours.length * 2; //add contours
  _.forEach(glyph.contours, function (contour) {
    result += contour.points.length * 5; //add points for each contour
  });
  return result;
}

function createLocaTable(buf, font) {
  var location = 0;
  // Array of offsets in GLYF table for each glyph
  _.forEach(font.glyphs, function (glyph) {
    buf.writeUInt32(location);
    location += getGlyphDataLength(glyph);
  });
  buf.writeUInt32(location); //last glyph location is stored to get last glyph length
}

module.exports = createLocaTable;