'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/cmap.htm

var _ = require('lodash');
var jDataView = require('jDataView');

function getIDByUnicode(glyphs, unicode) {
  var glyph = _.where(glyphs, { unicode : unicode });
  return (glyph && glyph.length) ? glyph[0].id : 0;
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
    delta = prevEndCode - segment.start.unicode + prevDelta + 1;
    segment.delta = delta > 0x7FFF ? delta - 0x10000 : (delta < -0x7FFF ? delta + 0x10000 : delta);
    result.push(segment);
  }
  return result;
}

function writeSubTableHeader (buf, platformID, encodingID, offset) {
  buf.writeUint16(platformID); // platform
  buf.writeUint16(encodingID); // encoding
  buf.writeUint32(offset); // offset
}

function createSubTable0(glyphs) {
  var buf = new jDataView(262); //fixed bug size

  buf.writeUint16(0); // format
  buf.writeUint16(262); // length
  buf.writeUint16(0); // language

  // Array of unicodes 0..255
  var unicodes = _.pluck(glyphs, 'unicode');
  var i;
  for (i = 0; i < 256; i++) {
    buf.writeUint8(unicodes.indexOf(i) >= 0 ? getIDByUnicode(glyphs, i) : 0); // existing char in table 0..255
  }

  return buf;
}

function createSubTable4(glyphs, segments2bytes) {

  var glyphs2bytes = _.filter(glyphs, function (glyph) {
    return glyph.unicode <= 0xFFFF;
  });

  var bufSize = 24; // subtable 4 header and required array elements
  bufSize += segments2bytes.length * 8; // subtable 4 segments
  bufSize += glyphs2bytes.length * 2; // subtable 4 glyphs
  var buf = new jDataView(bufSize); //fixed bug size

  buf.writeUint16(4); // format
  buf.writeUint16(bufSize); // length
  buf.writeUint16(0); // language
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
  var i;
  for (i = 0; i < segments2bytes.length; i++) {
    buf.writeUint16(0);
  }
  buf.writeUint16(0); // rangeOffsetArray should be finished with 0

  //Array of glyph IDs
  _.forEach(glyphs2bytes, function (glyph) {
    buf.writeUint16(glyph.id);
  });

  return buf;
}

function createSubTable12(segments4bytes) {
  var bufSize = 16; // subtable 12 header
  bufSize += segments4bytes ? (segments4bytes.length * 12) : 0; // subtable 12 segments
  var buf = new jDataView(bufSize); //fixed bug size

  buf.writeUint16(12); // format
  buf.writeUint16(0); // reserved
  buf.writeUint32(bufSize); // length
  buf.writeUint32(0); // language
  buf.writeUint32(segments4bytes.length); // nGroups
  var startGlyphCode = 0;
  _.forEach(segments4bytes, function (segment) {
    buf.writeUint32(segment.start.unicode); // startCharCode
    buf.writeUint32(segment.end.unicode); // endCharCode
    buf.writeUint32(startGlyphCode); // startGlyphCode
    startGlyphCode += segment.end.unicode - segment.start.unicode + 1;
  });

  return buf;
}

function createCMapTable(font) {

  //we will always have subtable 4
  var segments2bytes = getSegments(font, 0xFFFF); //get segments for unicodes < 0xFFFF if found unicodes >= 0xFF

  // We need subtable 12 only if found unicodes with > 2 bytes.
  var hasGLyphsOver2Bytes = _.find(font.glyphs, function(glyph) {
    return glyph.unicode > 0xFFFF;
  });

  var segments4bytes = hasGLyphsOver2Bytes ? getSegments(font) : null; //get segments for all unicodes

  // Create subtables first.
  var subTable0 = createSubTable0(font.glyphs); // subtable 0
  var subTable4 = createSubTable4(font.glyphs, segments2bytes); // subtable 4
  var subTable12 = segments4bytes ? createSubTable12(segments4bytes) : null; // subtable 12

  // Calculate bufsize
  var subTableOffset = 4 + (subTable12 ? 32 : 24);
  var bufSize = subTableOffset + subTable0.byteLength + subTable4.byteLength + (subTable12 ? subTable12.byteLength : 0);

  var buf = new jDataView(bufSize);

  // Write table header.
  buf.writeUint16(0); // version
  buf.writeUint16(segments4bytes ? 4 : 3); // count

  // Create subtable headers. Subtables must be sorted by platformID, encodingID
  writeSubTableHeader(buf, 0, 3, subTableOffset + subTable0.byteLength); // subtable 4, unicode
  writeSubTableHeader(buf, 1, 0, subTableOffset); // subtable 0, mac standard
  writeSubTableHeader(buf, 3, 1, subTableOffset + subTable0.byteLength); // subtable 4, windows standard
  if (subTable12) {
    writeSubTableHeader(buf, 3, 10, subTableOffset + subTable0.byteLength + subTable4.byteLength); // subtable 12
  }

  // Write tables
  buf.writeBytes(subTable0.buffer);
  buf.writeBytes(subTable4.buffer);
  if (subTable12) {
    buf.writeBytes(subTable12.buffer);
  }

  return buf;
}

module.exports = createCMapTable;
