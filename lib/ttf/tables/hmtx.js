'use strict';

var _ = require('lodash');

function fill(buf, font) {
  _.forEach(font.glyphs, function (glyph) {
    buf.writeUInt16(glyph.width); //advanceWidth
    buf.writeInt16(glyph.lsb || 0); //lsb
  });
}

module.exports.fillHhea = fill;