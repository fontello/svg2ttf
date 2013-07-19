'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/loca.htm

var _ = require('lodash');
var jDataView = require('jDataView');

function tableSize(font, isShortFormat) {
  var result = (font.glyphs.length + 1) * (isShortFormat ? 2 : 4); // by glyph count + tail
  result += (4 - result % 4) % 4; // length of a table must be a multiple of four bytes
  return result;
}

function createLocaTable(font) {

  var isShortFormat = font.ttf_glyph_size < 0x20000;

  var bufSize = tableSize(font, isShortFormat);
  var buf = new jDataView(bufSize);

  var location = 0;
  // Array of offsets in GLYF table for each glyph
  _.forEach(font.glyphs, function (glyph) {
    if (isShortFormat) {
      buf.writeUint16(location);
    } else {
      buf.writeUint32(location);
    }
    location += glyph.ttf_size / 2;
  });

  // The last glyph location is stored to get last glyph length
  if (isShortFormat) {
    buf.writeUint16(location);
  } else {
    buf.writeUint32(location);
  }

  // Fill left space with zeros
  while (buf.tell() < bufSize) {
    buf.writeUint8(0);
  }

  return buf;
}

module.exports = createLocaTable;
