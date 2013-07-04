'use strict';

var _ = require('lodash');
var jDataView = require('jDataView');

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

function createMaxpTable(font) {

  var buf = new jDataView(14 * 2 + 4);

  buf.writeInt32(0x10000); // version
  buf.writeUint16(font.glyphs.length); // numGlyphs
  buf.writeUint16(getMaxPoints(font)); // maxPoints
  buf.writeUint16(getMaxContours(font)); // maxContours
  buf.writeUint16(0); // maxCompositePoints
  buf.writeUint16(0); // maxCompositeContours
  buf.writeUint16(2); // maxZones
  buf.writeUint16(0); // maxTwilightPoints
  buf.writeUint16(0); // maxStorage
  buf.writeUint16(0); // maxFunctionDefs
  buf.writeUint16(0); // maxInstructionDefs
  buf.writeUint16(0); // maxStackElements
  buf.writeUint16(0); // maxSizeOfInstructions
  buf.writeUint16(0); // maxComponentElements
  buf.writeUint16(0); // maxComponentDepth

  return buf;
}

module.exports = createMaxpTable;
