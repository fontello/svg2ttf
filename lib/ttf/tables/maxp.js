'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/maxp.htm

var _ = require('lodash');
var jDataView = require('jDataView');

// Find max points in glyph TTF contours.
function getMaxPoints(font) {
  var maxPoints = 0;
  return _.reduce(font.glyphs,  function (maxPoints, glyph) {

    var sumPoints = _.reduce(glyph.ttfContours, function (sumPoints, contour) {
      return (sumPoints || 0) + contour.length;
    }, sumPoints);

    return Math.max(sumPoints || 0, maxPoints);
  }, maxPoints);
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

  var buf = new jDataView(32);

  buf.writeInt32(0x10000); // version
  buf.writeUint16(font.glyphs.length); // numGlyphs
  buf.writeUint16(getMaxPoints(font)); // maxPoints
  buf.writeUint16(getMaxContours(font)); // maxContours
  buf.writeUint16(0); // maxCompositePoints
  buf.writeUint16(0); // maxCompositeContours
  buf.writeUint16(2); // maxZones
  buf.writeUint16(0); // maxTwilightPoints
  // It is unclear how to calculate maxStorage, maxFunctionDefs and maxInstructionDefs.
  // These are magic constants now, with values exceeding values from FontForge
  buf.writeUint16(10); // maxStorage
  buf.writeUint16(10); // maxFunctionDefs
  buf.writeUint16(0); // maxInstructionDefs
  buf.writeUint16(255); // maxStackElements
  buf.writeUint16(0); // maxSizeOfInstructions
  buf.writeUint16(0); // maxComponentElements
  buf.writeUint16(0); // maxComponentDepth

  return buf;
}

module.exports = createMaxpTable;
