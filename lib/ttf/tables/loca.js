'use strict';

// See documentation here: http://www.microsoft.com/typography/otspec/loca.htm

var _ = require('lodash');
var jDataView = require('jDataView');
var utils = require('../utils');

function tableSize(font) {
  var result = font.glyphs.length * 4; // by glyph count
  result += 4; // add tail
  return result;
}

function createLocaTable(font) {

  var buf = new jDataView(tableSize(font));

  var location = 0;
  // Array of offsets in GLYF table for each glyph
  _.forEach(font.glyphs, function (glyph) {
    buf.writeUint32(location);
    location += glyph.ttf_size;
  });
  buf.writeUint32(location); //last glyph location is stored to get last glyph length

  return buf;
}

module.exports = createLocaTable;
