'use strict';

var _ = require('lodash');
var jDataView = require('jDataView');

function createHtmxTable(font) {

  var buf = new jDataView(font.glyphs.length * 4);

  _.forEach(font.glyphs, function (glyph) {
    buf.writeUint16(glyph.width); //advanceWidth
    buf.writeInt16(glyph.lsb || 0); //lsb
  });

  return buf;
}

module.exports = createHtmxTable;
