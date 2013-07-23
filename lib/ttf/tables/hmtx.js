'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/hmtx.htm

var _ = require('lodash');
var jDataView = require('jDataView');

function createHtmxTable(font) {

  var buf = new jDataView(font.glyphs.length * 4 + 2);

  _.forEach(font.glyphs, function (glyph) {
    buf.writeUint16(glyph.width); //advanceWidth
    buf.writeInt16(glyph.lsb); //lsb
  });
  return buf;
}

module.exports = createHtmxTable;
