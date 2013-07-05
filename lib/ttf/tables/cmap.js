'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/cmap.htm

var _ = require('lodash');
var jDataView = require('jDataView');

function tableSize(glyphs2bytes, segments2bytes, segments4bytes) {
  var result = 290; // table header + subtable declarations + subtable 0 format
  result += 24; // subtable 4 header and required array elements
  result += segments2bytes.length * 8; // subtable 4 segments
  result += glyphs2bytes.length * 2; // subtable 4 glyphs
  result += 16; // subtable 12 header
  result += segments4bytes.length * 12; // subtable 12 segments
  return result;
}

// Delta is saved in signed int in cmap format 4 subtable, but can be in -0xFFFF..0 interval.
// -0x10000..-0x7FFF values are stored with offset.
function encodeDelta(delta) {
  return delta > 0x7FFF ? delta - 0x10000 : (delta < -0x7FFF ? delta + 0x10000 : delta);
}

// Calculate character segments with non-interruptable chains of unicodes
function getSegments(font, bound) {
  var prevGlyph = null;
  var result = [];
  var segment = {};

  var delta;
  var prevEndCode = 0;
  var prevDelta = -1;

  _.forEach(font.glyphs, function (glyph) {
    if (bound === undefined || glyph.unicode <= bound) {
      // Initialize first segment or add new segment if code "hole" is found
      if (prevGlyph === null || glyph.unicode !== prevGlyph.unicode + 1) {
        if (prevGlyph !== null) {
          segment.end = prevGlyph;
          delta = prevEndCode - segment.start.unicode + prevDelta + 1;
          segment.delta = encodeDelta(delta);
          prevEndCode = segment.end.unicode;
          prevDelta = delta;
          result.push(segment);
          segment = {};
        }
        segment.start = glyph;
      }
      prevGlyph = glyph;
    }
  });

  // Need to finish the last segment
  if (prevGlyph !== null) {
    segment.end = prevGlyph;
    segment.delta = delta > 0x7FFF ? delta - 0x10000 : (delta < -0x7FFF ? delta + 0x10000 : delta);
    result.push(segment);
  }
  return result;
}

function createCMapTable(font) {

  var glyphs2bytes = _.filter(font.glyphs, function (glyph) {
    return glyph.unicode <= 0xFFFF;
  });
  var segments2bytes = getSegments(font, 0xFFFF); //get segments for unicodes < 0xFFFF
  var segments4bytes = getSegments(font); //get segments for all unicodes

  var buf = new jDataView(tableSize(glyphs2bytes, segments2bytes, segments4bytes));

  buf.writeUint16(0); // version
  buf.writeUint16(3); // count

  // Add subtable headers
  var subTableOffsetPositions = [];
  var i;
  for (i = 0; i < 3; i++) {
    buf.writeUint16(3); // platform, windows standard
    buf.writeUint16(1); // encoding, unicode
    subTableOffsetPositions.push(buf.tell()); //save table offset position
    buf.writeUint32(0); // offset, just a zero value, it will be filled later
  }

  var subTableOffsets = [];

  // Add subtable format 0
  subTableOffsets.push(buf.tell());
  buf.writeUint16(0); // format
  var subTable0LengthPosition = buf.tell();
  buf.writeUint16(262); // length
  buf.writeUint16(0); // version

  // Array of unicodes 0..255
  var unicodes = _.pluck(font.glyphs, 'unicode');
  for (i = 0; i < 256; i++) {
    buf.writeUint8(unicodes.indexOf(i) >= 0 ? i : 0); // existing char in table 0..255
  }

  // Add subtable format 4
  subTableOffsets.push(buf.tell());
  buf.writeUint16(4); // format
  var subTable4LengthPosition = buf.tell();
  buf.writeUint16(4); // length, will be filled later
  buf.writeUint16(2); // version
  var segCount = segments2bytes.length + 1;
  buf.writeUint16(segCount * 2); // segCountX2
  var searchRange = 2 * Math.floor(Math.log(segCount));
  buf.writeUint16(searchRange); // searchRange
  buf.writeUint16(Math.round(Math.log(searchRange / 2))); // entrySelector
  buf.writeUint16(2 * segCount - searchRange); // rangeShift

  // Array of end counts
  _.forEach(segments2bytes, function (segment) {
    buf.writeUint16(segment.end.unicode);
  });
  buf.writeUint16(0xFFFF); // endCountArray should be finished with 0xFFFF

  buf.writeUint16(0); // reservedPad

  // Array of start counts
  _.forEach(segments2bytes, function (segment) {
    buf.writeUint16(segment.start.unicode); //startCountArray
  });
  buf.writeUint16(0xFFFF); // startCountArray should be finished with 0xFFFF

  // Array of deltas
  _.forEach(segments2bytes, function (segment) {
    buf.writeInt16(segment.delta); //startCountArray
  });
  buf.writeUint16(1); // idDeltaArray should be finished with 1

  // Array of range offsets, it doesn't matter when deltas present, should be initialized with zeros
  //It should also have additional 0 value
  for (i = 0; i < segments2bytes.length; i++) {
    buf.writeUint16(0);
  }
  buf.writeUint16(0); // rangeOffsetArray should be finished with 0

  //Array of glyph IDs
  _.forEach(font.glyphs, function (glyph) {
    if (glyph.unicode <= 0xFFFF) {
      buf.writeUint16(glyph.id);
    }
  });

  // Add subtable format 12
  subTableOffsets.push(buf.tell());
  buf.writeUint16(12); // format
  buf.writeUint16(0); // reserved
  var subTable12LengthPosition = buf.tell();
  buf.writeUint32(4); // length, will be filled later
  buf.writeUint32(2); // language
  buf.writeUint32(segments4bytes.length); // nGroups
  var startGlyphCode = 0;
  _.forEach(segments4bytes, function (segment) {
    buf.writeUint32(segment.start.unicode); // startCharCode
    buf.writeUint32(segment.end.unicode); // endCharCode
    buf.writeUint32(startGlyphCode); // startGlyphCode
    startGlyphCode += segment.end.unicode - segment.start.unicode + 1;
  });

  // Write lengths of sublables
  var lastPosition = buf.tell();
  buf.setUint16(subTable0LengthPosition, subTableOffsets[1] - subTableOffsets[0]);
  buf.setUint16(subTable4LengthPosition, subTableOffsets[2] - subTableOffsets[1]);
  buf.setUint32(subTable12LengthPosition, lastPosition - subTableOffsets[2]);

  // Write table offsets
  for (i = 0; i < 3; i++) {
    buf.setUint32(subTableOffsetPositions[i], subTableOffsets[i]);
  }

  return buf;
}

module.exports = createCMapTable;
