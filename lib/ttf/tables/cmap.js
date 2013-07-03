'use strict';

var _ = require('lodash');

function getUnicodes(font) {
  var result = [];
  _.forEach(font.glyphs, function(glyph) {
    result.push(glyph.unicode);
  });
}

// Delta is saved in signed int in cmap format 4 subtable, but can be in -0xFFFF..0 interval.
// -0x10000..-0x7FFF values are stored with offset.
function encodeDelta(delta) {
  return delta > 0x7FFF ? delta - 0x10000 : (delta < - 0x7FFF ? delta + 0x10000 : delta);
}

// Calculate character segments with non-interruptable chains of unicodes
function getSegments(font, bound) {
  var prevGlyph = null;
  var result = [];
  var segment = {};

  // Add missed glyph as first segment
  result.push({
    start: font.missedGlyph,
    end: font.missedGlyph
  });

  var delta;
  var prevEndCode = 0;
  var prevDelta = - 1;

  _.forEach(font.glyphs, function (glyph) {
    if (bound === undefined || glyph.start.unicode <= bound) {
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
    segment.delta = delta > 0x7FFF ? delta - 0x10000 : (delta < - 0x7FFF ? delta + 0x10000 : delta);
    result.push(segment);
  }
  return result;
}

function fill(buf, font) {
  buf.writeUInt16(0); // version
  buf.writeUInt16(3); // count

  // Add subtable headers
  var subTableOffsetPositions = [];
  var i;
  for (i = 0; i < 3; i++) {
    buf.writeUInt16(3); // platform, windows standard
    buf.writeUInt16(1); // encoding, unicode
    subTableOffsetPositions.push(buf.tell()); //save table offset position
    buf.writeUInt16(0); // offset, just a zero value, it will be filled later
  }

  var subTableOffsets = [];

  // Add subtable format 0
  subTableOffsets.push(buf.tell());
  buf.writeUInt16(0); // format
  var subTable0LengthPosition = buf.tell();
  buf.writeUInt16(262); // length
  buf.writeUInt16(0); // version

  // Array of unicodes 0..255
  var unicodes = getUnicodes(font);
  for (i = 0; i < 256; i++) {
    buf.writeUInt8(unicodes.indexOf(i) ? i : 0); // existing char in table 0..255
  }

  // Add subtable format 4
  subTableOffsets.push(buf.tell());
  var segments = getSegments(font, 0xFFFF); //get segments for unicodes < 0xFFFF
  buf.writeUInt16(4); // format
  var subTable4LengthPosition = buf.tell();
  buf.writeUInt16(4); // length, will be filled later
  buf.writeUInt16(2); // version
  buf.writeUInt16(segments.length * 2); // segCountX2
  var searchRange = 2 * Math.floor(Math.log(segments.length));
  buf.writeUInt16(searchRange); // searchRange
  buf.writeUInt16(Math.round(Math.log(searchRange / 2))); // entrySelector
  buf.writeUInt16(2 * segments.length - searchRange); // rangeShift

  // Array of end counts
  _.forEach(segments, function (segment) {
    buf.writeUInt16(segment.end.unicode);
  });
  buf.writeUInt16(0xFFFF); // endCountArray should be finished with 0xFFFF number

  buf.writeUInt16(0); // reservedPad

  // Array of start counts
  _.forEach(segments, function (segment) {
    buf.writeUInt16(segment.start.unicode); //startCountArray
  });
  buf.writeUInt16(0xFFFF); // startCountArray should be finished with 0xFFFF number

  // Array of deltas
  _.forEach(segments, function (segment) {
    buf.writeUInt16(segment.delta); //startCountArray
  });
  buf.writeUInt16(1); // idDeltaArray should be finished with 1 number

  // Array of range offsets, it doesn't matter when deltas present, should be initialized with zeros
  //It should also have additional 0 value
  for (i = 0; i <= segments.length; i++) {
    buf.writeUInt16(0);
  }

  //Array of glyph IDs
  _.forEach(font.glyphs, function (glyph) {
    if (glyph.unicode <= 0xFFFF) {
      buf.writeUInt16(glyph.id);
    }
  });

  // Add subtable format 12
  subTableOffsets.push(buf.tell());
  segments = getSegments(font); //get all segments
  buf.writeUInt16(12); // format
  buf.writeUInt16(0); // reserved
  var subTable12LengthPosition = buf.tell();
  buf.writeUInt32(4); // length, will be filled later
  buf.writeUInt32(2); // language
  buf.writeUInt32(segments.length); // nGroups
  var startGlyphCode = 0;
  _.forEach(segments, function (segment) {
    buf.writeUInt32(segment.start.unicode); // startCharCode
    buf.writeUInt32(segment.end.unicode); // endCharCode
    buf.writeUInt32(startGlyphCode); // startGlyphCode
    startGlyphCode += segment.end.unicode - segment.start.unicode + 1;
  });

  var savedPosition = buf.tell(); //save position to restore it later

  // Write lengths of sublables
  buf.seek(subTable0LengthPosition);
  buf.writeUInt16(subTableOffsets[1] - subTableOffsets[0]);
  buf.seek(subTable4LengthPosition);
  buf.writeUInt16(subTableOffsets[2] - subTableOffsets[1]);
  buf.seek(subTable12LengthPosition);
  buf.writeUInt32(savedPosition - subTableOffsets[2]);

  // Write table offsets
  for (i = 0; i < 3; i++) {
    buf.seek(subTableOffsetPositions[i]);
    buf.writeUInt16(subTableOffsets[i]);
  }

  buf.seek(savedPosition); //restore previously saved position
}

module.exports.fillCMap = fill;
