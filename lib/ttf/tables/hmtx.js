'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/hmtx.htm

var _ = require('lodash');
var ByteBuffer = require('../../byte_buffer.js');

function createHtmxTable(font) {

  var bufsize = font.glyphs.length * 4;
  var buf = new ByteBuffer(Uint8Array ? new Uint8Array(bufsize) : new Array(bufsize));

  _.forEach(font.glyphs, function (glyph) {
    buf.writeUint16(glyph.width); //advanceWidth
    buf.writeInt16(glyph.lsb); //lsb
  });
  return buf;
}

module.exports = createHtmxTable;
