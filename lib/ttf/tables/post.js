'use strict';

var _ = require('lodash');
var jDataView = require('jDataView');

function getBufSize(font, names) {
  var result = 4 * 2 + 7 * 4; // table header
  result += font.glyphs.length * 2; // name declarations
  _.forEach(names, function(name) {
    result += name.length;
  });
  return result;
}

function getStringAsByteArray(name) {
  var bytes = [];
  bytes.push(name.length);
  for (var i = 0; i < name.length; i ++) {
    var char = name.charCodeAt(i);
    bytes.push(char);
  }
  return bytes;
}

function createPostTable(font) {

  var names = _.map(font.glyphs, function (glyph) {
    return getStringAsByteArray(glyph.name);
  });

  var bufSize = getBufSize(font, names);
  var buf = new jDataView(bufSize);

  buf.writeInt32(0x20000); // formatType,  version 2.0
  buf.writeInt32(0); // italicAngle
  buf.writeInt16(0); // underlinePosition
  buf.writeInt16(0); // underlineThickness
  buf.writeUint32(0); // isFixedPitch
  buf.writeUint32(0); // minMemType42
  buf.writeUint32(0); // maxMemType42
  buf.writeUint32(0); // minMemType1
  buf.writeUint32(0); // maxMemType1
  buf.writeUint16(font.glyphs.length); // numberOfGlyphs

  // Array of glyph name indexes
  buf.writeUint16(0);//First element should be .notDef glyph
  var index = 258; //first index of custom glyph name
  var i;
  for (i = 0; i < font.glyphs.length; i++) {
    buf.writeUint16(index++);
  }

  // Array of glyph name indexes
  _.forEach(font.glyphs, function (glyph) {
    buf.writeBytes(getStringAsByteArray(glyph.name));
  });

  return buf;
}

module.exports = createPostTable;
