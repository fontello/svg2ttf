'use strict';

var _ = require('lodash');

//find max points in glyph contours
function getMaxPoints(font) {
  var result = 0;
  _.forEach(font.glyphs, function (glyph) {
    _.forEach(glyph.contours, function (contour) {
      if (contour.points.length > result) {
        result = contour.points.length;
      }
    });
  });
  return result;
}

function getMaxContours(font) {
  var result = 0;
  _.forEach(font.glyphs, function (glyph) {
    if (glyph.contours.length > result) {
      result = glyph.contours.length;
    }
  });
  return result;
}

function createMaxpTable(buf, font) {
  buf.writeInt32(0x10000); // version
  buf.writeUInt16(font.glyphs.length); // numGlyphs
  buf.writeUInt16(getMaxPoints(font)); // maxPoints
  buf.writeUInt16(getMaxContours(font)); // maxContours
  buf.writeUInt16(0); // maxCompositePoints
  buf.writeUInt16(0); // maxCompositeContours
  buf.writeUInt16(2); // maxZones
  buf.writeUInt16(0); // maxTwilightPoints
  buf.writeUInt16(0); // maxStorage
  buf.writeUInt16(0); // maxFunctionDefs
  buf.writeUInt16(0); // maxInstructionDefs
  buf.writeUInt16(0); // maxStackElements
  buf.writeUInt16(0); // maxSizeOfInstructions
  buf.writeUInt16(0); // maxComponentElements
  buf.writeUInt16(0); // maxComponentDepth
}

module.exports = createMaxpTable;