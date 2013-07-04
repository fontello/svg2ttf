'use strict';

var _ = require('lodash');
var jDataView = require('jDataView');
var utils = require('../utils');

function getBufSize(font) {
  var result = font.glyphs.length * 4; // by glyph count
  result += 4; // add tail
  return result;
}

function createLocaTable(font) {

  var bufSize = getBufSize(font);
  var buf = new jDataView(bufSize);

  var location = 0;
  // Array of offsets in GLYF table for each glyph
  _.forEach(font.glyphs, function (glyph) {
    buf.writeUint32(location);
    location += utils.getGlyphDataLength(glyph);
  });
  buf.writeUint32(location); //last glyph location is stored to get last glyph length

  return buf;
}

module.exports = createLocaTable;
