'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/hmtx.htm

var _ = require('lodash');
var jDataView = require('jDataView');

function createHtmxTable(font) {

  var buf = new jDataView((font.glyphs.length - 1) * 4 + 2); //missed glyph is excluded

  _.forEach(font.glyphs, function (glyph) {
    if (!glyph.isMissed) {
      buf.writeUint16(glyph.width); //advanceWidth
      buf.writeInt16(glyph.lsb); //lsb
    }
  });
  buf.writeInt16(0); //left lsb
  return buf;
}

module.exports = createHtmxTable;
